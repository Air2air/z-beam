# generator/modules/api_client.py

import os
import requests
import json
import time  # ADD THIS IMPORT

from typing import Dict, Any, Optional
from generator.modules.logger import get_logger

logger = get_logger("api_client")


def call_ai_api(
    prompt: str,
    provider: str,
    model: str,
    api_keys: Dict[str, str],
    temperature: float = 0.7,
    max_tokens: int = 1000,
    retries: int = 3,  # Add retries parameter
    backoff_factor: float = 0.5,  # Add backoff_factor parameter
) -> Optional[str]:
    """
    Calls the specified AI API (Gemini or OpenAI/xAI) to generate content.
    Includes retry logic for transient errors like 429 (Too Many Requests).
    """
    api_key_env_var = f"{provider.upper()}_API_KEY"
    api_key = api_keys.get(api_key_env_var)

    if not api_key:
        logger.error(
            f"API key for {provider} not found in environment variables. Looked for: {api_key_env_var}"
        )
        return None

    url = ""
    headers = {"Content-Type": "application/json"}
    params: Optional[Dict[str, str]] = None
    data: Dict[str, Any] = {}

    if provider.upper() == "GEMINI":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        params = {"key": api_key}
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }
    elif provider.upper() == "OPENAI":
        url = "https://api.openai.com/v1/chat/completions"
        headers["Authorization"] = f"Bearer {api_key}"
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
    elif provider.upper() == "XAI":  # This handles xAI (Grok)
        url = f"https://api.xai.com/v1/models/{model}/chat/completions"
        headers["Authorization"] = f"Bearer {api_key}"
        data = {
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
    else:
        logger.error(f"Unsupported AI provider: {provider}")
        return None

    json_data = json.dumps(data)

    logger.debug(f"Using API: {provider} ({model}) - URL: {url}")
    logger.debug(
        f"Sending request to {url} with payload (first 200 chars): {json_data[:200]}..."
    )
    logger.debug(f"Request Headers: {headers}")
    if params:  # Only log params if they exist (Gemini uses them)
        logger.debug(f"Request Params: {params}")

    for attempt in range(retries):
        try:
            response = requests.post(
                url, headers=headers, params=params, data=json_data
            )
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
            logger.debug(
                f"Received raw AI response (first 200 chars): {response.text[:200]}..."
            )

            response_json = response.json()

            if provider.upper() == "GEMINI":
                # Check for 'candidates' and 'parts' structure for Gemini
                if (
                    response_json.get("candidates")
                    and response_json["candidates"][0].get("content")
                    and response_json["candidates"][0]["content"].get("parts")
                ):
                    return response_json["candidates"][0]["content"]["parts"][0]["text"]
                else:
                    logger.warning(
                        f"Gemini API response did not contain expected content structure: {response_json}"
                    )
                    return None
            elif provider.upper() in [
                "OPENAI",
                "XAI",
            ]:  # Handles both OpenAI and xAI (Grok)
                if (
                    response_json.get("choices")
                    and response_json["choices"][0].get("message")
                    and response_json["choices"][0]["message"].get("content")
                ):
                    return response_json["choices"][0]["message"]["content"]
                else:
                    logger.warning(
                        f"{provider} API response did not contain expected content structure: {response_json}"
                    )
                    return None
            else:
                return None  # Should not reach here due to earlier check

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                wait_time = backoff_factor * (2**attempt)
                logger.warning(
                    f"Rate limit hit (429). Retrying in {wait_time:.2f} seconds... (Attempt {attempt + 1}/{retries})"
                )
                time.sleep(wait_time)
            else:
                logger.error(
                    f"API request failed for {provider} {model}: {e} - Response: {e.response.text}"
                )
                raise  # Re-raise other HTTP errors
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Network error during API request to {provider}: {e}")
            raise  # Re-raise connection errors
        except requests.exceptions.Timeout as e:
            logger.error(f"API request to {provider} timed out: {e}")
            raise  # Re-raise timeout errors
        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse JSON response from {provider}: {e}. Response text: {response.text}"
            )
            return None  # Indicate a parsing error
        except Exception as e:
            logger.error(
                f"An unexpected error occurred during API call to {provider}: {e}"
            )
            raise  # Re-raise any other unexpected errors

    logger.error(
        f"Failed to get a successful response from {provider} {model} after {retries} attempts due to rate limiting or other persistent issues."
    )
    return None  # Return None if all retries fail
