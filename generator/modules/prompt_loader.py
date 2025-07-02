# generator/modules/prompt_loader.py

import os
from typing import Dict
from generator.modules.logger import get_logger

logger = get_logger("prompt_loader")


def load_prompt_templates(prompt_dir: str) -> Dict[str, str]:
    """
    Loads all prompt templates from the specified directory.
    Assumes each file in the directory is a prompt template.
    """
    prompt_templates = {}
    logger.info(f"Loading prompt templates from: {prompt_dir}")

    # Ensure the prompt directory exists before trying to list its contents
    os.makedirs(prompt_dir, exist_ok=True)  # Ensures directory exists

    if not os.path.exists(
        prompt_dir
    ):  # This check is less critical now, but fine to keep
        logger.error(
            f"Prompt directory not found after attempt to create: {prompt_dir}"
        )
        raise FileNotFoundError(f"Prompt directory not found: {prompt_dir}")

    try:
        for filename in os.listdir(prompt_dir):
            if filename.endswith(".txt"):
                file_path = os.path.join(prompt_dir, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        prompt_templates[filename] = f.read()
                    logger.debug(f"Loaded prompt: {filename}")
                except IOError as e:
                    logger.warning(f"Could not read prompt file {filename}: {e}")
                except Exception as e:
                    logger.error(
                        f"An unexpected error occurred reading prompt {filename}: {e}"
                    )
        logger.info(f"Successfully loaded {len(prompt_templates)} prompt templates.")
    except Exception as e:
        logger.critical(
            f"Failed to list or read files in prompt directory {prompt_dir}: {e}"
        )
        raise

    return prompt_templates
