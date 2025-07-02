# generator/modules/api_client.py

"""
Handles API interactions with AI models (Grok, Gemini).
"""

import requests
import json
import time
from generator.modules.logger import get_logger
from generator.constants import (
    GROK_API_URL,
    GEMINI_API_URL,
    # REMOVED: Specific model names (GEMINI_DEFAULT_MODEL, GROK_MODEL_LATEST, etc.)
    # These should no longer be imported here.
)

logger = get_logger("api_client")


def _make_api_request(url, headers, payload, timeout=60):
    """
    Makes an HTTP POST request to the specified URL with retries.
    """
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=timeout)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout as e:
        logger.error(f"API request timed out: {url} - {e}")
        raise requests.exceptions.RequestException(f"API request timed out: {e}") from e
    except requests.exceptions.ConnectionError as e:
        logger.error(f"API connection error: {url} - {e}")
        raise requests.exceptions.RequestException(f"API connection error: {e}") from e
    except requests.exceptions.HTTPError as e:
        logger.error(
            f"API HTTP error: {url} - {e.response.status_code} - {e.response.text}"
        )
        raise ValueError(
            f"API returned non-200 status: {e.response.status_code} - {e.response.text}"
        ) from e
    except json.JSONDecodeError as e:
        logger.error(
            f"Failed to decode JSON response from API: {url} - {e}. Response: {response.text}"
        )
        raise json.JSONDecodeError(
            f"Invalid JSON response: {e}", response.text, 0
        ) from e
    except Exception as e:
        logger.error(f"An unexpected error occurred during API request to {url}: {e}")
        raise requests.exceptions.RequestException(f"Unexpected error: {e}") from e


def call_ai_api(
    prompt,
    max_tokens,
    retries=3,
    grok_api_key=None,
    gemini_api_key=None,
    provider="GEMINI",
    model=None,  # This is the specific model string (e.g., "gemini-1.5-flash")
    temperature=0.7,
):
    """
    Calls the specified AI API (Grok or Gemini) with retry logic.
    """
    api_url = ""
    headers = {}
    payload = {}
    response_path = []

    if provider == "GROK":
        if not grok_api_key:
            raise ValueError("Grok API key is required but not provided.")
        if not model:
            logger.warning(
                "No model specified for GROK in call_ai_api, falling back to 'grok-3-latest'."
            )
            model = (
                "grok-3-latest"  # Fallback literal string, consistent with constants.py
            )
        api_url = GROK_API_URL
        headers = {
            "Authorization": f"Bearer {grok_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,  # Use the passed model string
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        response_path = ["choices", 0, "message", "content"]
    elif provider == "GEMINI":
        if not gemini_api_key:
            raise ValueError("Gemini API key is required but not provided.")
        if not model:
            logger.warning(
                "No model specified for GEMINI in call_ai_api, falling back to 'gemini-1.5-flash'."
            )
            model = "gemini-1.5-flash"  # Fallback literal string, consistent with constants.py
        api_url = GEMINI_API_URL.format(model=model)  # Use the passed model string
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": gemini_api_key,
        }
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
        }
        response_path = ["candidates", 0, "content", "parts", 0, "text"]
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")

    for attempt in range(retries):
        try:
            logger.debug(
                f"Attempt {attempt + 1}/{retries} for {provider} API call to {api_url}."
            )
            api_response = _make_api_request(api_url, headers, payload)

            content = api_response
            for key in response_path:
                if isinstance(content, dict) and key in content:
                    content = content[key]
                elif (
                    isinstance(content, list)
                    and isinstance(key, int)
                    and len(content) > key
                ):
                    content = content[key]
                else:
                    logger.warning(
                        f"Could not follow response path for {provider}. Path missing key/index: {key}. Response: {api_response}"
                    )
                    content = None
                    break

            if content:
                logger.info(f"Successfully received response from {provider} API.")
                return str(content)
            else:
                logger.warning(
                    f"Empty or unextractable content from {provider} API response. Retrying..."
                )

        except requests.exceptions.RequestException as e:
            logger.warning(f"API Request failed (attempt {attempt + 1}/{retries}): {e}")
        except ValueError as e:
            logger.warning(
                f"API responded with error (attempt {attempt + 1}/{retries}): {e}"
            )
        except json.JSONDecodeError as e:
            logger.warning(
                f"API response JSON decode error (attempt {attempt + 1}/{retries}): {e}"
            )
        except Exception as e:
            logger.warning(
                f"An unexpected error occurred during API call (attempt {attempt + 1}/{retries}): {e}"
            )

        if attempt < retries - 1:
            wait_time = 2**attempt
            logger.info(f"Retrying in {wait_time} seconds...")
            time.sleep(wait_time)
        else:
            logger.error(f"All {retries} API attempts failed for provider {provider}.")
            raise requests.exceptions.RequestException(
                f"Failed to get response from {provider} API after {retries} attempts."
            )
    raise requests.exceptions.RequestException(
        f"Failed to get response from {provider} API."
    )
