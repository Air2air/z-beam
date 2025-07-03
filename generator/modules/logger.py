# generator/modules/logger.py

import logging
import os

# Determine the project root dynamically.
_current_dir = os.path.dirname(os.path.abspath(__file__))
_generator_dir = os.path.dirname(_current_dir)
_project_root = os.path.dirname(_generator_dir)

LOG_DIR = os.path.join(_project_root, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

LOG_FILE = os.path.join(LOG_DIR, "app.log")


def get_logger(name, context=None):
    logger = logging.getLogger(f"generator.{name}")
    logger.setLevel(logging.DEBUG)

    # Remove all handlers associated with the logger object (prevents duplicate logs)
    if logger.hasHandlers():
        logger.handlers.clear()

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    file_handler = logging.FileHandler(LOG_FILE)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Add a context-aware log method
    def log_with_context(level, msg, *args, **kwargs):
        prefix = f"[{context}] " if context else ""
        logger.log(level, prefix + msg, *args, **kwargs)

    logger.log_with_context = log_with_context

    return logger
