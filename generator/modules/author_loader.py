# generator/modules/author_loader.py

import os
import yaml
from typing import Dict, Any
import re

from generator.modules.logger import get_logger
from generator.modules.file_handler import read_file_content
from generator.config.settings import AppConfig

logger = get_logger("author_loader")
config = AppConfig()


def load_author_metadata(author_dir: str = None) -> Dict[str, Dict[str, Any]]:
    """
    Loads author metadata from .mdx files (YAML frontmatter) in the specified directory.
    The author's slug (lowercase, underscore-separated filename without extension)
    will be used as the key.
    """
    author_metadata = {}
    author_dir = author_dir or str(config.directories.author_dir)
    logger.info(f"Loading author metadata from: {author_dir}")

    if not os.path.exists(author_dir):
        logger.error(f"Author directory not found: {author_dir}")
        raise ValueError(f"Author directory not found: {author_dir}")

    for filename in os.listdir(author_dir):
        if filename.endswith(".mdx"):
            file_path = os.path.join(author_dir, filename)
            content = read_file_content(file_path)
            if content:
                # Extract YAML frontmatter
                match = re.match(r"---\s*\n(.*?)\n---", content, re.DOTALL)
                if match:
                    try:
                        metadata = yaml.safe_load(match.group(1))
                        if metadata and isinstance(metadata, dict):
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
                        logger.warning(
                            f"Error parsing YAML metadata from {filename}: {e}"
                        )
                    except Exception as e:
                        logger.error(
                            f"An unexpected error occurred processing {filename}: {e}"
                        )
                else:
                    logger.warning(f"No YAML frontmatter found in {filename}.")
            else:
                logger.warning(f"Could not read content from author file: {filename}")

    if not author_metadata:
        logger.warning(
            f"No author metadata loaded from {author_dir}. Ensure files exist and are valid .mdx with YAML frontmatter."
        )

    return author_metadata
