# generator/modules/api_client.py

"""
Handles API calls to Grok and Gemini providers.
"""

import requests
import time
import random
from generator.constants import (
    PROVIDER,
    MODEL,
    GEMINI_DEFAULT_MODEL,
    GROK_API_URL,
    GEMINI_API_URL,
)


def call_ai_api(
    prompt,
    max_tokens=1000,
    temperature=0.7,
    retries=3,
    grok_api_key=None,
    gemini_api_key=None,
):
    """Make API call to either Grok or Gemini based on PROVIDER.

    Args:
        prompt (str): The input prompt for the API.
        max_tokens (int): Maximum tokens for the response.
        temperature (float): Sampling temperature for randomness.
        retries (int): Number of retry attempts for failed requests.
        grok_api_key (str): API key for Grok.
        gemini_api_key (str): API key for Gemini.

    Returns:
        str: API response content or empty string on failure.
    """
    for attempt in range(1, retries + 1):
        try:
            if PROVIDER == "GROK":
                headers = {
                    "Authorization": f"Bearer {grok_api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "stream": False,
                }
                print(
                    f"Attempting Grok API call with model: {payload['model']} (attempt {attempt})"
                )
                response = requests.post(GROK_API_URL, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                print(f"Token usage (attempt {attempt}): {data.get('usage', {})}")
                return data["choices"][0]["message"]["content"]

            elif PROVIDER == "GEMINI":
                model = GEMINI_DEFAULT_MODEL
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "maxOutputTokens": min(max_tokens, 8192),
                        "temperature": temperature,
                    },
                }
                url = GEMINI_API_URL.format(model=model)
                print(
                    f"Attempting Gemini API call with model: {model} (attempt {attempt})"
                )
                response = requests.post(
                    f"{url}?key={gemini_api_key}", json=payload, headers=headers
                )
                response.raise_for_status()
                data = response.json()
                if "candidates" in data and data["candidates"]:
                    content = data["candidates"][0]["content"]["parts"][0]["text"]
                    print(f"Gemini response received (attempt {attempt})")
                    return content
                else:
                    print(f"Warning: No content in Gemini response: {data}")
                    return ""

        except requests.exceptions.RequestException as e:
            print(
                f"{PROVIDER} API call failed, attempt {attempt}: {e}, "
                f"status: {response.status_code if 'response' in locals() else 'N/A'}, "
                f"response: {response.text if 'response' in locals() else 'N/A'}"
            )
            if attempt < retries and (
                not "response" in locals() or response.status_code in [429, 500]
            ):
                delay = (1 * 2 ** (attempt - 1)) + random.uniform(0, 0.1)
                print(
                    f"Retrying {PROVIDER} API call after {delay:.2f}s (attempt {attempt + 1})"
                )
                time.sleep(delay)
                continue
            return ""
