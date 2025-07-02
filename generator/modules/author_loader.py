# generator/modules/author_loader.py

"""
Loads and validates author metadata from files.
"""

import os
import json
from generator.modules.file_handler import load_file


def load_author_metadata(author_dir):
    """Load author metadata and samples.

    Args:
        author_dir (str): Directory containing author files.

    Returns:
        dict: Author metadata dictionary.

    Raises:
        ValueError: If no valid author metadata is found.
    """
    authors = {}
    for file_name in os.listdir(author_dir):
        if not file_name.endswith(".txt"):
            continue
        file_path = os.path.join(author_dir, file_name)
        content = load_file(file_path)
        if not content:
            continue
        try:
            metadata_str, _ = content.split("---", 1)
            metadata = json.loads(metadata_str.strip())
            if "name" not in metadata or "bio" not in metadata:
                raise ValueError(f"Missing name or bio in {file_name}")
            authors[metadata["name"]] = {"bio": metadata["bio"], "file_name": file_name}
        except (ValueError, json.JSONDecodeError) as e:
            print(f"Warning: Failed to load metadata from {file_name}: {e}")
    if not authors:
        raise ValueError("No valid author metadata found")
    return authors
