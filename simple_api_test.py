#!/usr/bin/env python3
"""
Simple DeepSeek API test to diagnose hanging issues.
"""

import os
import requests
import time

# Load .env file if it exists
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    # If python-dotenv is not installed, try manual loading
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if "=" in line and not line.strip().startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ[key] = value


def test_deepseek_api():
    """Test basic DeepSeek API connectivity."""

    print("🧪 Simple DeepSeek API Test")
    print("=" * 30)

    # Check API key
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        print("❌ DEEPSEEK_API_KEY environment variable not found")
        print("💡 Set it with: export DEEPSEEK_API_KEY='your_key_here'")
        return False

    print(f"✅ API key found: ***{api_key[-4:]}")

    # Test simple API call
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    payload = {
        "messages": [{"role": "user", "content": "Say 'Hello' in one word."}],
        "model": "deepseek-chat",
        "temperature": 0.1,
        "max_tokens": 5,
    }

    print("\n📡 Making API call...")
    print(f"URL: {url}")
    print(f"Model: deepseek-chat")
    print(f"Timeout: 20 seconds")

    try:
        start_time = time.time()
        response = requests.post(url, headers=headers, json=payload, timeout=20)
        duration = time.time() - start_time

        print(f"⏱️  Response time: {duration:.2f} seconds")
        print(f"📊 Status code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"✅ SUCCESS: '{content.strip()}'")
            return True
        else:
            print(f"❌ ERROR: {response.text}")
            return False

    except requests.exceptions.Timeout:
        print("⏰ TIMEOUT: API call hung after 20 seconds")
        print("💡 This is likely why your detection is hanging!")
        return False
    except Exception as e:
        print(f"💥 ERROR: {str(e)}")
        return False


if __name__ == "__main__":
    success = test_deepseek_api()

    if success:
        print("\n🎉 API test passed! The hanging issue might be:")
        print("   - Long/complex detection prompts")
        print("   - Multiple rapid API calls")
        print("   - Rate limiting during iterations")
    else:
        print("\n⚠️  API test failed. Try these solutions:")
        print("   1. Check your internet connection")
        print("   2. Verify your API key is correct")
        print("   3. Use XAI instead: detection_provider='XAI'")
        print("   4. Skip detection: ai_detection_threshold=100")
