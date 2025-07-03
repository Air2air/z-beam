#!/usr/bin/env python3
"""
Main entry point for the article generation system.
Handles configuration loading and orchestrates the generation process.
"""

import os
import sys
from pathlib import Path
from typing import Dict, Optional
from dataclasses import dataclass, field

from dotenv import load_dotenv

from generator.config.settings import AppConfig, GenerationConfig
from generator.modules.logger import get_logger
from generator.modules.page_generator import ArticleGenerator
from generator.exceptions import ConfigurationError, GenerationError


# ---- CONFIGURATION (edit here) ----
CONFIG = dict(
    material="Silver",
    category="Material",
    file_name="laser_cleaning_silver.mdx",
    provider="DEEPSEEK",
    author="todd_dunning.mdx",
    temperature=0.7,
    force_regenerate=True,
)
# ---- END CONFIGURATION ----


@dataclass
class RunConfiguration:
    """Configuration for a single run of the article generator."""

    material: str
    category: str
    file_name: str  # Renamed from filename
    provider: str
    author: str  # Just a string filename
    temperature: float = 0.7
    force_regenerate: bool = True

    def validate(self) -> None:
        """Validate the run configuration."""
        if not self.material:
            raise ConfigurationError("Material cannot be empty")
        if not self.file_name:
            raise ConfigurationError("file_name cannot be empty")
        if self.provider.upper() not in ["GEMINI", "XAI", "DEEPSEEK"]:
            raise ConfigurationError(f"Unsupported provider: {self.provider}")


class ApplicationRunner:
    """Handles the application lifecycle and orchestrates article generation."""

    def __init__(self):
        self.logger = get_logger("app_runner")
        self.app_config = AppConfig()

    def setup_environment(self) -> None:
        """Setup the application environment."""
        # Add project root to path
        project_root = Path(__file__).parent
        sys.path.insert(0, str(project_root))

        # Load environment variables
        load_dotenv()

    def create_generation_config(
        self, run_config: RunConfiguration
    ) -> GenerationConfig:
        """Create a generation configuration from run configuration."""
        api_keys = {
            "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY"),
            "XAI_API_KEY": os.getenv("XAI_API_KEY"),
            "DEEPSEEK_API_KEY": os.getenv("DEEPSEEK_API_KEY"),
        }

        # Validate API key availability
        required_key = f"{run_config.provider.upper()}_API_KEY"
        if not api_keys.get(required_key):
            self.logger.warning(
                f"No API key found for provider '{run_config.provider}'. "
                f"Please ensure {required_key} is set in your .env file."
            )

        return GenerationConfig(
            material=run_config.material,
            article_category=run_config.category,
            file_name=run_config.file_name,
            provider=run_config.provider,
            model=self.app_config.get_model_for_provider(run_config.provider),
            author=run_config.author,
            temperature=run_config.temperature,
            force_regenerate=run_config.force_regenerate,
            api_keys=api_keys,
        )

    def run(self, run_config: RunConfiguration) -> bool:
        """
        Execute the article generation process.

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Validate configuration
            run_config.validate()

            # Setup environment
            self.setup_environment()

            # Create generation configuration
            gen_config = self.create_generation_config(run_config)

            # Initialize and run generator
            generator = ArticleGenerator(self.app_config)
            generator.generate_article(gen_config)

            self.logger.info("Article generation completed successfully")
            return True

        except (ConfigurationError, GenerationError) as e:
            self.logger.error(f"Generation failed: {e}")
            return False
        except Exception as e:
            self.logger.error(f"Unexpected error during generation: {e}", exc_info=True)
            return False


def main() -> None:
    """Main entry point."""
    run_config = RunConfiguration(**CONFIG)
    runner = ApplicationRunner()
    success = runner.run(run_config)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
