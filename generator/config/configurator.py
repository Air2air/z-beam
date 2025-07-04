"""
Configuration builder for the article generation system.
Handles dynamic config logic and ensures all required fields are set.
"""

from generator.config.providers import get_model_settings
from generator.modules.runner import RunConfiguration


def build_run_config(user_config: dict) -> RunConfiguration:
    config = dict(user_config)
    # Keep 'category' field for RunConfiguration (don't map to 'article_category')
    config["generator_model_settings"] = get_model_settings(
        config["generator_provider"]
    )
    config["detection_model_settings"] = get_model_settings(
        config["detection_provider"]
    )
    # Set 'model' from generator_model_settings if not present
    if "model" not in config and config["generator_model_settings"]:
        config["model"] = config["generator_model_settings"].get("model")
    return RunConfiguration(**config)
