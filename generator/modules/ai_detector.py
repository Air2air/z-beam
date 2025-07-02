import requests
import json
from typing import Dict, Any

from generator.modules.logger import get_logger

logger = get_logger("ai_detector")


def check_ai_detection_score(text: str, api_url: str, api_key: str) -> Dict[str, float]:
    """
    Sends text to an external AI detection API and returns the score.

    Args:
        text (str): The text content to analyze.
        api_url (str): The URL of the AI detection API endpoint.
        api_key (str): The API key for authentication.

    Returns:
        Dict[str, float]: A dictionary containing the AI detection score,
                          e.g., {"score": 0.95}. Returns {"score": -1.0} on error.

    Raises:
        requests.exceptions.RequestException: For network-related errors.
        ValueError: If API URL or key is missing.
        Exception: For unexpected API response structures or other errors.
    """
    if not api_url or not api_key:
        logger.error("AI Detector API URL or Key is missing.")
        return {"score": -1.0}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",  # Assuming Bearer token for AI detector
    }
    payload = {
        "text": text
        # Add other parameters if the specific AI detection API requires them
    }

    try:
        logger.debug(
            f"Calling AI Detector API: {api_url} with text length {len(text)}..."
        )
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)

        response_data = response.json()
        logger.debug(f"AI Detector API raw response: {response_data}")

        # Assuming the API returns a JSON like {"score": 0.85, ...}
        if "score" in response_data and isinstance(
            response_data["score"], (int, float)
        ):
            score = float(response_data["score"])
            logger.info(f"AI detection score received: {score:.2f}")
            return {"score": score}
        else:
            logger.warning(
                f"AI Detector API response did not contain a 'score' or it was malformed: {response_data}"
            )
            return {"score": -1.0}  # Indicate malformed response

    except requests.exceptions.Timeout:
        logger.error(f"AI Detector API request timed out after 30 seconds.")
        return {"score": -1.0}
    except requests.exceptions.RequestException as e:
        logger.error(
            f"AI Detector API request failed: {e} - Response: {getattr(e.response, 'text', 'N/A')}"
        )
        return {"score": -1.0}
    except json.JSONDecodeError as e:
        logger.error(
            f"Failed to parse JSON response from AI Detector API: {e} - Raw: {response.text}"
        )
        return {"score": -1.0}
    except Exception as e:
        logger.error(f"An unexpected error occurred during AI detection: {e}")
        return {"score": -1.0}
