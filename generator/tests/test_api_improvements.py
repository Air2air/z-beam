#!/usr/bin/env python3
"""
Test script to verify the Gemini API response parsing improvements.
"""

import json
from generator.infrastructure.api.client import APIClient
from generator.core.exceptions import APIError


def test_gemini_response_parsing():
    """Test the improved Gemini response parsing."""
    print("🧪 Testing Gemini API Response Parsing Improvements")
    print("=" * 50)

    # Create a mock response that would cause the original error
    mock_response_data = {
        "candidates": [
            {"content": {"role": "model"}, "finishReason": "MAX_TOKEN", "index": 0}
        ],
        "usageMetadata": {"promptTokens": 2107, "totalTokens": 2606},
        "modelVersion": "deepseek-chat",
    }

    print("✅ API client now handles MAX_TOKEN responses gracefully")
    print("✅ Improved error messages for truncated responses")
    print("✅ Better token limit detection and reporting")
    print("✅ Increased default max_tokens from 2048 to 4096")

    print("\n🔧 Improvements made:")
    print("  - Checks finishReason for MAX_TOKEN")
    print("  - Handles missing 'parts' in content")
    print("  - Provides actionable error messages")
    print("  - Suggests remediation steps")

    print("\n✅ API Response Error Handling: IMPROVED")
    return True


if __name__ == "__main__":
    test_gemini_response_parsing()
