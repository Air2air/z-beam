#!/usr/bin/env python3
"""
API Connection Test Script
Tests DeepSeek API connectivity and diagnoses hanging issues.
"""

import os
import sys
import time
import requests
import json
from typing import Dict, Any
import threading
import signal

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import project modules
from generator.config.configurator import build_run_config
from generator.infrastructure.api.client import APIClient


class APITester:
    """Test API connectivity and performance."""

    def __init__(self):
        self.test_results = {}
        self.timeout_occurred = False

    def timeout_handler(self, signum, frame):
        """Handle timeout signal."""
        self.timeout_occurred = True
        print("\n⏰ TIMEOUT: API call took too long!")
        raise TimeoutError("API call timed out")

    def test_environment_variables(self) -> Dict[str, Any]:
        """Test if API keys are properly set."""
        print("🔧 Testing Environment Variables...")

        results = {
            "DEEPSEEK_API_KEY": os.getenv("DEEPSEEK_API_KEY") is not None,
            "XAI_API_KEY": os.getenv("XAI_API_KEY") is not None,
            "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY") is not None,
        }

        for key, exists in results.items():
            status = "✅ SET" if exists else "❌ MISSING"
            key_preview = "***" + os.getenv(key, "")[-4:] if exists else "Not found"
            print(f"   {key}: {status} ({key_preview})")

        return results

    def test_raw_api_call(self, timeout: int = 15) -> Dict[str, Any]:
        """Test raw HTTP API call to DeepSeek."""
        print(f"\n📡 Testing Raw DeepSeek API Call (timeout: {timeout}s)...")

        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            return {"error": "DEEPSEEK_API_KEY not found"}

        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        }

        payload = {
            "messages": [
                {"role": "user", "content": "Say 'Hello' in exactly one word."}
            ],
            "model": "deepseek-chat",
            "temperature": 0.1,
            "max_tokens": 10,
        }

        try:
            start_time = time.time()
            print(f"   🚀 Making request to {url}...")

            response = requests.post(
                url, headers=headers, json=payload, timeout=timeout
            )

            duration = time.time() - start_time
            print(f"   ⏱️  Response time: {duration:.2f}s")

            if response.status_code == 200:
                data = response.json()
                content = (
                    data.get("choices", [{}])[0].get("message", {}).get("content", "")
                )
                print(f"   ✅ SUCCESS: '{content.strip()}'")
                return {
                    "success": True,
                    "duration": duration,
                    "content": content.strip(),
                    "status_code": response.status_code,
                }
            else:
                print(f"   ❌ ERROR: Status {response.status_code}")
                print(f"   📄 Response: {response.text}")
                return {
                    "success": False,
                    "duration": duration,
                    "status_code": response.status_code,
                    "error": response.text,
                }

        except requests.exceptions.Timeout:
            print(f"   ⏰ TIMEOUT: API call exceeded {timeout}s")
            return {"error": "timeout", "timeout": timeout}
        except requests.exceptions.ConnectionError:
            print(f"   🌐 CONNECTION ERROR: Cannot connect to API")
            return {"error": "connection_error"}
        except Exception as e:
            print(f"   💥 UNEXPECTED ERROR: {str(e)}")
            return {"error": str(e)}

    def test_project_api_client(self) -> Dict[str, Any]:
        """Test using the project's API client."""
        print(f"\n🔧 Testing Project API Client...")

        try:
            # Build config like the main application does
            USER_CONFIG = dict(
                generator_provider="DEEPSEEK",
                detection_provider="DEEPSEEK",
                temperature=0.1,
                ai_detection_threshold=50,
                human_detection_threshold=50,
                iterations_per_section=1,
                max_article_words=100,
            )

            run_config = build_run_config(USER_CONFIG)

            # Create API client
            api_client = APIClient(
                provider=run_config.generator_provider,
                api_key=os.getenv("DEEPSEEK_API_KEY"),
                provider_config={"model": "deepseek-chat"},
            )

            start_time = time.time()
            print(f"   🚀 Making call via project API client...")

            result = api_client.call_api(
                prompt="Say 'Hello' in exactly one word.",
                model="deepseek-chat",
                temperature=0.1,
                max_tokens=10,
            )

            duration = time.time() - start_time
            print(f"   ⏱️  Response time: {duration:.2f}s")
            print(f"   ✅ SUCCESS: '{result.strip()}'")

            return {"success": True, "duration": duration, "content": result.strip()}

        except Exception as e:
            print(f"   💥 ERROR: {str(e)}")
            return {"error": str(e)}

    def test_detection_scenario(self) -> Dict[str, Any]:
        """Test a detection-like API call that might hang."""
        print(f"\n🔍 Testing Detection-Style API Call...")

        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            return {"error": "DEEPSEEK_API_KEY not found"}

        # Simulate a detection prompt (longer content)
        detection_prompt = """
        Analyze the following text and determine if it was written by AI or a human.
        Provide a score from 0-100 where 0 is definitely human and 100 is definitely AI.
        
        Text to analyze:
        "Laser cleaning represents a revolutionary approach to surface preparation and contaminant removal. 
        This advanced technology utilizes focused laser beams to selectively remove rust, paint, and other 
        unwanted materials without damaging the underlying substrate. The process offers numerous advantages 
        over traditional methods including environmental friendliness, precision control, and minimal waste generation."
        
        Score (0-100): """

        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        }

        payload = {
            "messages": [{"role": "user", "content": detection_prompt}],
            "model": "deepseek-chat",
            "temperature": 0.3,
            "max_tokens": 200,
        }

        try:
            start_time = time.time()
            print(f"   🚀 Making detection-style request (longer prompt)...")

            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=25,  # Slightly longer timeout for detection
            )

            duration = time.time() - start_time
            print(f"   ⏱️  Response time: {duration:.2f}s")

            if response.status_code == 200:
                data = response.json()
                content = (
                    data.get("choices", [{}])[0].get("message", {}).get("content", "")
                )
                print(f"   ✅ SUCCESS: Response received ({len(content)} chars)")
                print(f"   📄 Preview: {content[:100]}...")
                return {
                    "success": True,
                    "duration": duration,
                    "content_length": len(content),
                    "status_code": response.status_code,
                }
            else:
                print(f"   ❌ ERROR: Status {response.status_code}")
                return {
                    "success": False,
                    "duration": duration,
                    "status_code": response.status_code,
                    "error": response.text[:200],
                }

        except requests.exceptions.Timeout:
            print(f"   ⏰ TIMEOUT: Detection call hung!")
            return {"error": "detection_timeout"}
        except Exception as e:
            print(f"   💥 ERROR: {str(e)}")
            return {"error": str(e)}

    def run_comprehensive_test(self):
        """Run all API tests and provide diagnosis."""
        print("🚀 DeepSeek API Comprehensive Test\n")
        print("=" * 50)

        # Test 1: Environment Variables
        env_results = self.test_environment_variables()

        # Test 2: Raw API Call
        if env_results.get("DEEPSEEK_API_KEY"):
            raw_results = self.test_raw_api_call(timeout=15)
            time.sleep(1)  # Brief pause between tests

            # Test 3: Project API Client
            if raw_results.get("success"):
                client_results = self.test_project_api_client()
                time.sleep(1)

                # Test 4: Detection Scenario
                detection_results = self.test_detection_scenario()
            else:
                print("\n⚠️  Skipping further tests due to raw API failure")
                client_results = {"skipped": "raw_api_failed"}
                detection_results = {"skipped": "raw_api_failed"}
        else:
            print("\n⚠️  Skipping API tests - DEEPSEEK_API_KEY not found")
            raw_results = {"skipped": "no_api_key"}
            client_results = {"skipped": "no_api_key"}
            detection_results = {"skipped": "no_api_key"}

        # Summary and Diagnosis
        print("\n" + "=" * 50)
        print("🔬 DIAGNOSIS & RECOMMENDATIONS")
        print("=" * 50)

        if not env_results.get("DEEPSEEK_API_KEY"):
            print("❌ ISSUE: DeepSeek API key not found")
            print("   💡 FIX: Set DEEPSEEK_API_KEY environment variable")

        elif raw_results.get("error") == "timeout":
            print("❌ ISSUE: API calls are timing out")
            print("   💡 LIKELY CAUSES:")
            print("      - Network connectivity issues")
            print("      - DeepSeek API rate limiting")
            print("      - DeepSeek service issues")
            print("   💡 SOLUTIONS:")
            print("      - Check internet connection")
            print("      - Try again in a few minutes")
            print("      - Use XAI provider instead: detection_provider='XAI'")

        elif raw_results.get("error") == "connection_error":
            print("❌ ISSUE: Cannot connect to DeepSeek API")
            print("   💡 FIX: Check internet connection and firewall settings")

        elif raw_results.get("success") and not detection_results.get("success"):
            print("❌ ISSUE: Simple calls work but detection calls hang")
            print("   💡 LIKELY CAUSE: Detection prompts are too complex/long")
            print("   💡 SOLUTIONS:")
            print("      - Reduce iterations_per_section in run.py")
            print("      - Increase ai_detection_threshold to skip detection")
            print("      - Use simpler detection prompts")

        elif raw_results.get("success") and detection_results.get("success"):
            print("✅ SUCCESS: All API tests passed!")
            print("   💡 The hanging issue might be:")
            print("      - Intermittent network issues")
            print("      - Specific prompt content triggering delays")
            print("      - Rate limiting during high iteration counts")

        else:
            print("❓ UNCLEAR: Mixed results - check individual test outputs above")

        print(f"\n📊 Test Summary:")
        print(
            f"   Environment: {'✅' if env_results.get('DEEPSEEK_API_KEY') else '❌'}"
        )
        print(f"   Raw API: {'✅' if raw_results.get('success') else '❌'}")
        print(f"   Project Client: {'✅' if client_results.get('success') else '❌'}")
        print(
            f"   Detection Style: {'✅' if detection_results.get('success') else '❌'}"
        )


def main():
    """Run the API test."""
    tester = APITester()
    tester.run_comprehensive_test()


if __name__ == "__main__":
    main()
