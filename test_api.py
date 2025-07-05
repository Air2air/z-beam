#!/usr/bin/env python3
"""
Simple DeepSeek API test to diagnose connection issues.
"""

import os
import requests
import json
import time


def test_deepseek_api():
    """Test DeepSeek API connection and response time."""

    # Get API key
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        print("❌ DEEPSEEK_API_KEY not found in environment variables")
        print("   Set it with: export DEEPSEEK_API_KEY=your_key_here")
        return False

    print(f"🔍 Testing DeepSeek API...")
    print(f"🔑 API Key: {api_key[:8]}...{api_key[-4:]} ({len(api_key)} chars)")

    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}

    # Simple test payload
    payload = {
        "messages": [
            {"role": "user", "content": 'Say "API working" and nothing else.'}
        ],
        "model": "deepseek-chat",
        "temperature": 0.1,
        "max_tokens": 20,
    }

    try:
        print("📡 Making API call...")
        start_time = time.time()

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=20,  # 20 second timeout
        )

        elapsed = time.time() - start_time
        print(f"⏱️  Response time: {elapsed:.2f} seconds")
        print(f"📊 HTTP Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            print(f'✅ API Response: "{content}"')
            print("✅ DeepSeek API is working normally!")
            return True

        elif response.status_code == 401:
            print("❌ 401 Unauthorized - Invalid API key")

        elif response.status_code == 429:
            print("❌ 429 Rate Limited - Too many requests")
            print("   Wait a few minutes and try again")

        elif response.status_code == 500:
            print("❌ 500 Server Error - DeepSeek service issue")

        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")

    except requests.exceptions.Timeout:
        print("⏰ Request timed out after 20 seconds")
        print("   This suggests network issues or DeepSeek server problems")

    except requests.exceptions.ConnectionError as e:
        print("🌐 Connection error - check your internet connection")
        print(f"   Error: {str(e)}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {str(e)}")

    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

    return False


if __name__ == "__main__":
    success = test_deepseek_api()
    exit(0 if success else 1)
