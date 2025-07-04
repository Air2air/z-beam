#!/usr/bin/env python3
"""
Main entry point for the article generation system.
Handles configuration loading and orchestrates the generation process.
"""

import sys
from generator.modules.runner import RunConfiguration, ApplicationRunner


# ---- CONFIGURATION (edit here) ----
CONFIG = dict(
    material="Silver",
    category="Material",
    file_name="laser_cleaning_silver.mdx",
    provider="GEMINI",  # Options: GEMINI, XAI, DEEPSEEK
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
    run_config = RunConfiguration(
        **{k: v for k, v in CONFIG.items() if k in RunConfiguration.__annotations__}
    )
    runner = ApplicationRunner()
    success = runner.run(run_config)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
