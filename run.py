#!/usr/bin/env python3
"""
Main entry point for the article generation system.
Handles configuration loading and orchestrates the generation process.
"""

import sys
from generator.modules.runner import ApplicationRunner
from generator.config.configurator import build_run_config


# ---- CONFIGURATION (edit here) ----
USER_CONFIG = dict(
    material="Silver",
    category="Material",
    file_name="laser_cleaning_silver.mdx",
    generator_provider="DEEPSEEK",  # XAI GEMINI DEEPSEEK
    detection_provider="DEEPSEEK",  # XAI GEMINI DEEPSEEK
    author="todd_dunning.mdx",
    temperature=1,
    force_regenerate=True,
    ai_detection_threshold=50,
    human_detection_threshold=50,
    iterations_per_section=5,
)
# ---- END CONFIGURATION ----


def main() -> None:
    """Main entry point."""
    run_config = build_run_config(USER_CONFIG)
    runner = ApplicationRunner()
    success = runner.run(run_config)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
