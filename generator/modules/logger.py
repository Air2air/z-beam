# generator/modules/logger.py

"""
Configures and provides a consistent logging interface.
"""

import logging
import logging.handlers
import os
from datetime import datetime

# Determine project root dynamically, assuming this file is in generator/modules/
script_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

LOG_DIR = os.path.join(project_root, "logs")
# Ensure log directory exists
os.makedirs(LOG_DIR, exist_ok=True)

# Generate a unique log file name based on timestamp
log_file_name = datetime.now().strftime("app_%Y%m%d_%H%M%S.log")
LOG_FILE_PATH = os.path.join(LOG_DIR, log_file_name)


def get_logger(name):
    """
    Returns a configured logger instance.

    Args:
        name (str): The name of the logger (typically __name__ of the module).

    Returns:
        logging.Logger: A configured logger instance.
    """
    logger = logging.getLogger(name)

    # Prevent adding multiple handlers if the logger already has them
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)  # Set overall logging level to DEBUG

        # Console Handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(
            logging.DEBUG
        )  # <--- TEMPORARILY CHANGED FOR DEBUGGING
        console_formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
        )
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)

        # File Handler (with rotation)
        # Rotates log file when it reaches 5 MB, keeps 5 backup files
        file_handler = logging.handlers.RotatingFileHandler(
            LOG_FILE_PATH,
            maxBytes=5 * 1024 * 1024,  # 5 MB
            backupCount=5,
            encoding="utf-8",
        )
        file_handler.setLevel(logging.DEBUG)  # File captures DEBUG and above
        file_formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(name)s - %(funcName)s - Line:%(lineno)d - %(message)s"
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    return logger


# Configure the root logger to ensure all loggers inherit basic setup
# This is usually done once at application startup.
# if not logging.root.handlers:
#     root_logger = logging.getLogger()
#     root_logger.setLevel(logging.DEBUG)
#     # Add a default console handler to the root if none exist,
#     # to catch anything not handled by specific loggers
#     if not any(isinstance(h, logging.StreamHandler) for h in root_logger.handlers):
#         console_handler = logging.StreamHandler()
#         console_handler.setLevel(logging.INFO)
#         formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
#         console_handler.setFormatter(formatter)
#         root_logger.addHandler(console_handler)

# The `get_logger` function already handles adding handlers if they don't exist
# for a specific logger name, which is generally preferred over directly
# configuring the root logger from a module like this.
# Leaving the above commented out as the current `get_logger` pattern is good.
