# generator/modules/file_handler.py

"""
Handles file I/O and caching operations.
"""

import os
import json
from generator.modules.logger import get_logger  # <-- ADDED THIS IMPORT

logger = get_logger("file_handler")  # <-- ADDED THIS LINE


def load_file(file_path: str) -> str | None:  # Added type hints for clarity
    """Load content from a file.

    Args:
        file_path (str): Path to the file.

    Returns:
        str: File contents or empty string if file is not found or invalid.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        logger.debug(f"Successfully loaded file: {file_path}")  # <-- Added logger
        return content
    except FileNotFoundError:
        logger.warning(f"File not found: {file_path}")  # <-- Changed to logger.warning
        return None  # Return None on error for consistency with new functions
    except UnicodeDecodeError as e:
        logger.warning(
            f"Failed to decode {file_path}: {e}"
        )  # <-- Changed to logger.warning
        return None  # Return None on error
    except Exception as e:  # Catch other potential errors
        logger.error(f"Error loading file {file_path}: {e}")
        return None


def save_file(
    file_path: str, content: str
) -> bool:  # <-- RENAMED 'write_file' to 'save_file' and added type hints
    """Write content to a file.
    Creates necessary directories if they don't exist.

    Args:
        file_path (str): Path to the file.
        content (str): Content to write.

    Returns:
        bool: True if the file was saved successfully, False otherwise.
    """
    try:
        ensure_directory_exists(os.path.dirname(file_path))  # Ensure directory exists
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        logger.info(
            f"Successfully saved file: {file_path}"
        )  # <-- Changed to logger.info
        return True
    except IOError as e:
        logger.error(
            f"Failed to save to {file_path}: {e}"
        )  # <-- Changed to logger.error
        return False  # Return False on error
    except Exception as e:
        logger.error(f"An unexpected error occurred while saving {file_path}: {e}")
        return False


def ensure_directory_exists(directory: str):  # Added type hints
    """Ensure a directory exists.

    Args:
        directory (str): Directory path.
    """
    try:
        os.makedirs(directory, exist_ok=True)
        logger.debug(f"Ensured directory exists: {directory}")
    except Exception as e:
        logger.error(f"Failed to ensure directory {directory} exists: {e}")


def read_cache(cache_file: str):  # Added type hints
    """Read cached data from a file.

    Args:
        cache_file (str): Path to the cache file.

    Returns:
        dict or None: Cached data or None if file is invalid or not found.
    """
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            logger.debug(f"Successfully read cache from: {cache_file}")
            return data
        except json.JSONDecodeError as e:
            logger.warning(
                f"Invalid cache file {cache_file}: {e}"
            )  # <-- Changed to logger.warning
    return None


def write_cache(cache_file: str, data: dict):  # Added type hints
    """Write data to a cache file.

    Args:
        cache_file (str): Path to the cache file.
        data (dict): Data to cache.
    """
    ensure_directory_exists(os.path.dirname(cache_file))
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        logger.debug(f"Successfully wrote cache to: {cache_file}")
    except IOError as e:
        logger.warning(
            f"Failed to write cache {cache_file}: {e}"
        )  # <-- Changed to logger.warning


def parse_json_response(
    response: str, default: dict, context: str
) -> dict:  # Added type hints
    """Parse JSON from API response, handling errors.

    Args:
        response (str): Raw API response.
        default (dict): Default value if parsing fails.
        context (str): Context for error messages.

    Returns:
        dict: Parsed JSON or default value.
    """
    if not response.strip():
        logger.warning(
            f"Empty response for {context}, using default"
        )  # <-- Changed to logger.warning
        return default
    try:
        # Extract JSON from markdown code block if present
        if "```json" in response:
            start = response.find("```json") + 7
            end = response.rfind("```")
            if start > 6 and end > start:
                response = response[start:end].strip()
        parsed_json = json.loads(response)
        logger.debug(f"Successfully parsed JSON for {context}.")
        return parsed_json
    except json.JSONDecodeError as e:
        logger.warning(
            f"Failed to parse JSON for {context}: {e}, using default"
        )  # <-- Changed to logger.warning
        return default
