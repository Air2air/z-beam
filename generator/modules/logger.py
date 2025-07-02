# generator/modules/logger.py

import logging
import os

# Determine the project root dynamically.
# Assumes logger.py is in 'project_root/generator/modules'
_current_dir = os.path.dirname(os.path.abspath(__file__))
_generator_dir = os.path.dirname(_current_dir)
_project_root = os.path.dirname(_generator_dir)

LOG_DIR = os.path.join(_project_root, "logs")
# Ensure the log directory exists
os.makedirs(LOG_DIR, exist_ok=True)

# This is the log file path we want to clear
LOG_FILE = os.path.join(LOG_DIR, "app.log")


def get_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)  # Set a low level to capture all debug info to file

    # Prevent duplicate handlers if get_logger is called multiple times
    if not logger.handlers:
        # Console handler (for real-time output in terminal)
        console_handler = logging.StreamHandler()
        console_handler.setLevel(
            logging.INFO
        )  # Only show INFO, WARNING, ERROR, CRITICAL on console
        formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # File handler (for detailed logs saved to file)
        file_handler = logging.FileHandler(LOG_FILE)
        file_handler.setLevel(
            logging.DEBUG
        )  # Save all DEBUG and higher messages to file
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger
