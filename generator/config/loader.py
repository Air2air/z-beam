"""
Configuration loader and merger for the article generation system.
Handles merging user config, provider/model settings, and environment variables.
"""

import os
import importlib.util
from generator.modules.runner import RunConfiguration


def prepare_run_config(CONFIG) -> RunConfiguration:
    """
    Merge user config, provider/model settings, and environment variables into a RunConfiguration.
    """
    # Dynamically import PROVIDER_MODELS from run.py
    try:
        # Get the path to run.py (assumed to be in the project root)
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        run_path = os.path.join(project_root, "run.py")

        # Use spec-based loading to avoid circular imports
        spec = importlib.util.spec_from_file_location("run_module", run_path)
        run_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(run_module)

        # Get PROVIDER_MODELS from the imported module
        provider_models = getattr(run_module, "PROVIDER_MODELS", {})
    except Exception as e:
        print(f"Warning: Could not import PROVIDER_MODELS from run.py: {e}")
        provider_models = {}

    api_keys = {
        "GEMINI_API_KEY": os.environ.get("GEMINI_API_KEY"),
        "XAI_API_KEY": os.environ.get("XAI_API_KEY"),
        "DEEPSEEK_API_KEY": os.environ.get("DEEPSEEK_API_KEY"),
    }
    generator_provider = CONFIG["generator_provider"]
    generator_model_settings = provider_models.get(generator_provider, {})
    detection_provider = CONFIG.get("detection_provider", generator_provider)
    detection_model_settings = CONFIG.get(
        "detection_model_settings", provider_models.get(detection_provider, {})
    )
    # Compose the config for the run, merging model settings
    run_config_dict = {
        **CONFIG,
        "model": generator_model_settings["model"],
        "api_keys": api_keys,
        "detection_provider": detection_provider,
        "detection_model_settings": detection_model_settings,
        # generator_model_settings is not included in RunConfiguration fields
    }
    # Only include fields that are in RunConfiguration
    filtered_config = {
        k: v
        for k, v in run_config_dict.items()
        if k in RunConfiguration.__annotations__
    }
    # Ensure generator_model_settings is always included
    filtered_config["generator_model_settings"] = generator_model_settings
    filtered_config["detection_provider"] = detection_provider
    filtered_config["detection_model_settings"] = detection_model_settings
    return RunConfiguration(**filtered_config)
