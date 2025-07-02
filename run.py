# run.py

import os
import sys
import json
import logging
from dotenv import load_dotenv

# Reordered imports for RuffE402 compliance
# Import main from page_generator as it is needed at module level
from generator.modules.page_generator import main
from generator.constants import (
    DEFAULT_GEMINI_MODEL,
    DEFAULT_XAI_MODEL,
    DEFAULT_DEEPSEEK_MODEL,
)

# Import get_logger and LOG_FILE from your logger module
from generator.modules.logger import get_logger, LOG_FILE  # <--- ADDED


# Add the project root to the sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = script_dir
sys.path.insert(0, project_root)

# Load environment variables from .env file
load_dotenv()

# Get a logger for the run script itself
logger = get_logger("run_script")  # <--- ADDED


if __name__ == "__main__":
    # --- Hardcoded Values Instead of Command-Line Arguments ---
    material = "Silver"
    category = "Material"
    filename = "laser_cleaning_silver.mdx"
    provider = (
        "DEEPSEEK"  # Set your desired provider here (e.g., "GEMINI", "XAI", "DEEPSEEK")
    )

    # Set model based on provider, using defaults from constants.py
    if provider.upper() == "GEMINI":
        model = DEFAULT_GEMINI_MODEL
    elif provider.upper() == "XAI":
        model = DEFAULT_XAI_MODEL
    elif provider.upper() == "DEEPSEEK":
        model = DEFAULT_DEEPSEEK_MODEL
    else:
        # Use logger.error instead of print
        logger.error(  # <--- CHANGED from print
            f"Unsupported provider '{provider}'. Please choose from GEMINI, XAI, DEEPSEEK."
        )
        sys.exit(1)

    authors = ["Todd Dunning"]
    voice = "informative"
    authority = "medium"

    content_length_dict = {
        "paragraph": "150-200",
        "list": "70-100",
        "table": "60-90",
        "chart": "60-90",
    }

    variety = "standard overview"
    force_regenerate = True
    # --- End Hardcoded Values ---

    # Get API keys from environment variables
    api_keys = {
        "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY"),
        "XAI_API_KEY": os.getenv("XAI_API_KEY"),
        "DEEPSEEK_API_KEY": os.getenv("DEEPSEEK_API_KEY"),
    }

    # Optional: Basic check to warn if API key is missing for the selected provider
    if api_keys.get(f"{provider.upper()}_API_KEY") is None:
        # Use logger.warning instead of print
        logger.warning(  # <--- CHANGED from print
            f"No API key found for provider '{provider}'. "
            f"Please ensure {provider.upper()}_API_KEY is set in your .env file located at the project root ({project_root})."
        )
        # You might want to uncomment the line below to stop execution if API key is missing
        # sys.exit(1)

    try:  # <--- ADDED try block
        main(
            material=material,
            article_category=category,
            file_name=filename,
            provider=provider,
            authors=authors,
            voice=voice,
            authority=authority,
            content_length=content_length_dict,
            variety=variety,
            force_regenerate=force_regenerate,
            model=model,
            api_keys=api_keys,
        )
        logger.info(f"Article generation completed successfully.")  # <--- ADDED

        # --- Log File Deletion Logic --- <--- ADDED
        # Ensure handlers are flushed and closed before deletion
        for handler in logger.handlers:
            if isinstance(handler, logging.FileHandler):
                handler.flush()
                handler.close()
        # Remove file handlers from the logger so it doesn't try to write to a deleted file
        logger.handlers = [
            h for h in logger.handlers if not isinstance(h, logging.FileHandler)
        ]

        if os.path.exists(LOG_FILE):
            os.remove(LOG_FILE)
            logger.info(f"Log file '{LOG_FILE}' deleted.")
        else:
            logger.warning(f"Log file '{LOG_FILE}' not found, skipping deletion.")
        # --- End Log File Deletion Logic ---

    except Exception as e:  # <--- ADDED except block
        # If an error occurs, the log file will *not* be deleted,
        # allowing you to inspect it for debugging.
        logger.error(f"An error occurred during article generation: {e}", exc_info=True)
        sys.exit(1)  # Exit with an error code if main fails
