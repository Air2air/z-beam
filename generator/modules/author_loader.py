# generator/modules/author_loader.py

"""
Loads and validates author metadata from files.
"""

import os
import yaml
from generator.modules.file_handler import load_file
from generator.modules.logger import get_logger

logger = get_logger("author_loader")


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
    if not os.path.exists(author_dir):
        logger.warning(
            f"Author directory '{author_dir}' not found. No authors will be loaded."
        )
        return authors

    for file_name in os.listdir(author_dir):
        # --- FIX HERE: Changed to look for .mdx and .md files ---
        if not file_name.endswith(".mdx") and not file_name.endswith(".md"):
            logger.debug(f"Skipping non-MD/MDX file: {file_name}")
            continue
        # --- END FIX ---

        file_path = os.path.join(author_dir, file_name)
        content = load_file(file_path)
        if not content:
            logger.warning(f"Skipping empty or unreadable file: {file_name}")
            continue

        try:
            metadata_str = ""
            main_content = content

            # Improved YAML frontmatter parsing logic
            parts = content.split("---", 2)
            if len(parts) >= 3:  # Expecting at least "---", metadata, "---", content
                metadata_str = parts[1].strip()
                main_content = parts[2].strip()
            elif (
                len(parts) == 2 and parts[0].strip() == ""
            ):  # Case where content starts with ---, then metadata, then no closing --- (malformed but common)
                logger.warning(
                    f"File '{file_name}' starts with '---' but missing closing '---' for YAML frontmatter. Attempting to parse what's there as metadata."
                )
                metadata_str = parts[1].strip()
                main_content = ""  # No main content after malformed frontmatter
            else:  # No proper YAML frontmatter detected (no leading '---' or less than 2 '---' splits)
                logger.warning(
                    f"File '{file_name}' does not appear to have valid YAML frontmatter (missing leading/trailing '---'). Skipping metadata parsing for this file."
                )
                metadata_str = ""  # No metadata to parse
                main_content = content  # Entire file is treated as content

            metadata = yaml.safe_load(metadata_str) if metadata_str else {}
            if not isinstance(metadata, dict):
                logger.warning(
                    f"Parsed metadata for {file_name} is not a dictionary: {metadata}. Skipping."
                )
                continue

            if "name" not in metadata or "bio" not in metadata:
                logger.warning(
                    f"Missing 'name' or 'bio' in metadata for {file_name}. Skipping."
                )
                continue

            # Store the main_content (which should contain the "Rewritten Sample")
            authors[metadata["name"]] = {
                "bio": metadata["bio"],
                "file_name": file_name,
                "full_content": main_content,
            }
            # Add any other metadata fields (like 'title', 'linkedin') if present
            for key, value in metadata.items():
                if key not in [
                    "name",
                    "bio",
                    "full_content",
                    "file_name",
                ]:  # Don't overwrite existing
                    authors[metadata["name"]][key] = value

            logger.debug(f"Successfully loaded metadata for author: {metadata['name']}")

        except yaml.YAMLError as e:
            logger.warning(
                f"Failed to parse YAML metadata from {file_name}: {e}. Skipping."
            )
        except Exception as e:
            logger.error(
                f"An unexpected error occurred while processing {file_name}: {e}. Skipping."
            )

    if not authors:
        raise ValueError(
            f"No valid author metadata found in '{author_dir}'. Please check files and their YAML frontmatter."
        )

    logger.info(f"Loaded metadata for {len(authors)} authors.")
    return authors
