# generator/modules/file_handler.py

"""
Handles file I/O and caching operations.
"""

import os
import json


def load_file(file_path):
    """Load content from a file.

    Args:
        file_path (str): Path to the file.

    Returns:
        str: File contents or empty string if file is not found or invalid.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Warning: File {file_path} not found")
        return ""
    except UnicodeDecodeError as e:
        print(f"Warning: Failed to decode {file_path}: {e}")
        return ""


def write_file(file_path, content):
    """Write content to a file.

    Args:
        file_path (str): Path to the file.
        content (str): Content to write.

    Raises:
        IOError: If writing fails.
    """
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
    except IOError as e:
        print(f"Error: Failed to write to {file_path}: {e}")
        raise


def ensure_directory_exists(directory):
    """Ensure a directory exists.

    Args:
        directory (str): Directory path.
    """
    os.makedirs(directory, exist_ok=True)


def read_cache(cache_file):
    """Read cached data from a file.

    Args:
        cache_file (str): Path to the cache file.

    Returns:
        dict or None: Cached data or None if file is invalid or not found.
    """
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"Warning: Invalid cache file {cache_file}: {e}")
    return None


def write_cache(cache_file, data):
    """Write data to a cache file.

    Args:
        cache_file (str): Path to the cache file.
        data (dict): Data to cache.
    """
    ensure_directory_exists(os.path.dirname(cache_file))
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except IOError as e:
        print(f"Warning: Failed to write cache {cache_file}: {e}")


def parse_json_response(response, default, context):
    """Parse JSON from API response, handling errors.

    Args:
        response (str): Raw API response.
        default (dict): Default value if parsing fails.
        context (str): Context for error messages.

    Returns:
        dict: Parsed JSON or default value.
    """
    if not response.strip():
        print(f"Warning: Empty response for {context}, using default")
        return default
    try:
        # Extract JSON from markdown code block if present
        if "```json" in response:
            start = response.find("```json") + 7
            end = response.rfind("```")
            if start > 6 and end > start:
                response = response[start:end].strip()
        return json.loads(response)
    except json.JSONDecodeError as e:
        print(f"Warning: Failed to parse JSON for {context}: {e}, using default")
        return default
