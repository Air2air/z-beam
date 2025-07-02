"""
Provides structured logging for the Z-Beam Page Generator.
"""

import logging
import os


def get_logger(name):
    """Create and configure a logger.

    Args:
        name (str): Logger name (e.g., module name).

    Returns:
        logging.Logger: Configured logger.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        # Optionally add file handler
        log_dir = os.path.join(os.path.dirname(__file__), "../../logs")
        os.makedirs(log_dir, exist_ok=True)
        file_handler = logging.FileHandler(os.path.join(log_dir, f"{name}.log"))
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    return logger
