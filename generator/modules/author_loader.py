# generator/modules/author_loader.py

import os
import yaml  # This is now the only required parser import
from typing import Dict, Any

from generator.modules.logger import get_logger
from generator.modules.file_handler import read_file_content

logger = get_logger("author_loader")


def load_author_metadata(author_dir: str) -> Dict[str, Dict[str, Any]]:
    """
    Loads author metadata from YAML files in the specified directory.
    Each file should represent an author (e.g., 'todd_dunning.yaml').
    The author's slug (lowercase, underscore-separated filename without extension)
    will be used as the key.
    """
    author_metadata = {}
    logger.info(f"Loading author metadata from: {author_dir}")

    if not os.path.exists(author_dir):
        logger.error(f"Author directory not found: {author_dir}")
        raise ValueError(f"Author directory not found: {author_dir}")

    for filename in os.listdir(author_dir):
        # Only check for .yaml or .yml extensions
        if filename.endswith((".yaml", ".yml")):
            file_path = os.path.join(author_dir, filename)
            content = read_file_content(
                file_path
            )  # Use the new function to read file content

            if content:
                try:
                    metadata = yaml.safe_load(content)  # Directly load as YAML

                    if metadata and isinstance(metadata, dict):
                        # Use filename without extension as the key for the author (e.g., "todd_dunning")
                        author_slug = (
                            os.path.splitext(filename)[0]
                            .lower()
                            .replace(" ", "_")
                            .replace("-", "_")
                        )
                        author_metadata[author_slug] = metadata
                        logger.debug(f"Loaded metadata for author: {author_slug}")
                    else:
                        logger.warning(
                            f"File {filename} contained no valid YAML metadata or was not a dictionary. Content: '{content[:50]}...'"
                        )
                except yaml.YAMLError as e:
                    logger.warning(f"Error parsing YAML metadata from {filename}: {e}")
                except Exception as e:
                    logger.error(
                        f"An unexpected error occurred processing {filename}: {e}"
                    )
            else:
                logger.warning(f"Could not read content from author file: {filename}")

    if not author_metadata:
        logger.warning(
            f"No author metadata loaded from {author_dir}. Ensure files exist and are valid YAML."
        )

    return author_metadata
