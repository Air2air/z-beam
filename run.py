#!/usr/bin/env python3
"""
Main entry point for the article generation system.
Handles configuration loading and orchestrates the generation process.
"""

import sys
from generator.modules.runner import ApplicationRunner
from generator.config.loader import prepare_run_config


# ---- PROVIDER/MODEL SETTINGS ----
MODELS = {
    "GEMINI": {
        "model": "gemini-1.5-pro-latest",
        "url_template": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent",
        "default_temperature": 1.0,
        "default_max_tokens": 2048,
    },
    "XAI": {
        "model": "xai.grok-3-mini-beta",
        "url_template": "https://api.x.ai/v1/chat/completions",
        "default_temperature": 1.0,
        "default_max_tokens": 2048,
    },
    "DEEPSEEK": {
        "model": "deepseek-chat",
        "url_template": "https://api.deepseek.com/v1/chat/completions",
        "default_temperature": 1.0,
        "default_max_tokens": 2048,
    },
}
# ---- END PROVIDER/MODEL SETTINGS ----

# ---- CONFIGURATION (edit here) ----
CONFIG = dict(
    material="Silver",
    category="Material",
    file_name="laser_cleaning_silver.mdx",
    generator_provider="DEEPSEEK",  # Changed from XAI to GEMINI
    detection_provider="GEMINI",  # Detection provider is now configurable
    author="todd_dunning.mdx",
    temperature=1,
    force_regenerate=True,
    ai_detection_threshold=50,
    human_detection_threshold=50,
    iterations_per_section=5,
    generator_model_settings=MODELS[
        "DEEPSEEK"
    ],  # Reference the provider's settings here (now GEMINI)
    detection_model_settings=MODELS[
        "GEMINI"
    ],  # Reference detection provider's settings here
)
# ---- END CONFIGURATION ----


def main() -> None:
    """Main entry point."""
    run_config = prepare_run_config(CONFIG, MODELS)
    runner = ApplicationRunner()
    success = runner.run(run_config)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
