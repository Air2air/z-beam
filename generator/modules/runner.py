from generator.config.settings import AppConfig, GenerationConfig
from generator.modules.page_generator import ArticleGenerator
from generator.exceptions import ConfigurationError, GenerationError
from dataclasses import dataclass
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from generator.modules.logger import get_logger


@dataclass
class RunConfiguration:
    """Configuration for a single run of the article generator."""

    material: str
    category: str
    file_name: str  # Renamed from filename
    generator_provider: str
    model: str  # <-- Add this line
    author: str  # Just a string filename
    temperature: float
    force_regenerate: bool
    ai_detection_threshold: int
    human_detection_threshold: int  # Add human threshold
    generator_model_settings: dict  # <-- Add this line
    iterations_per_section: int = 3  # Add this field with default
    detection_provider: str = None
    detection_model_settings: dict = None

    def __post_init__(self):
        missing = []
        for field_name in [
            "material",
            "category",
            "file_name",
            "generator_provider",
            "model",
            "author",
            "temperature",
            "force_regenerate",
            "ai_detection_threshold",
            "human_detection_threshold",
            "generator_model_settings",  # <-- Add this line
        ]:
            if getattr(self, field_name, None) is None:
                missing.append(field_name)
        if missing:
            raise ConfigurationError(
                f"Missing required configuration fields: {', '.join(missing)}"
            )

    def validate(self) -> None:
        """Validate the run configuration."""
        if not self.material:
            raise ConfigurationError("Material cannot be empty")
        if not self.file_name:
            raise ConfigurationError("file_name cannot be empty")
        if self.generator_provider.upper() not in ["GEMINI", "XAI", "DEEPSEEK"]:
            raise ConfigurationError(
                f"Unsupported generator_provider: {self.generator_provider}"
            )


class ApplicationRunner:
    """Handles the application lifecycle and orchestrates article generation."""

    def __init__(self):
        self.logger = get_logger("app_runner")
        self.app_config = AppConfig()

    def setup_environment(self) -> None:
        """Setup the application environment."""
        project_root = Path(__file__).parent.parent.parent
        sys.path.insert(0, str(project_root))
        load_dotenv()

    def create_generation_config(
        self, run_config: RunConfiguration
    ) -> GenerationConfig:
        api_keys = {
            "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY"),
            "XAI_API_KEY": os.getenv("XAI_API_KEY"),
            "DEEPSEEK_API_KEY": os.getenv("DEEPSEEK_API_KEY"),
        }
        required_key = f"{run_config.generator_provider.upper()}_API_KEY"
        if not api_keys.get(required_key):
            self.logger.warning(
                f"No API key found for generator_provider '{run_config.generator_provider}'. "
                f"Please ensure {required_key} is set in your .env file."
            )
        return GenerationConfig(
            material=run_config.material,
            article_category=run_config.category,
            file_name=run_config.file_name,
            generator_provider=run_config.generator_provider,
            model=run_config.model,  # Use model from run_config, not from AppConfig
            author=run_config.author,
            temperature=run_config.temperature,
            force_regenerate=run_config.force_regenerate,
            api_keys=api_keys,
            ai_detection_threshold=run_config.ai_detection_threshold,
            human_detection_threshold=run_config.human_detection_threshold,
            generator_model_settings=run_config.generator_model_settings,  # <-- Pass through
            iterations_per_section=run_config.iterations_per_section,
            detection_provider=getattr(run_config, "detection_provider", None),
            detection_model_settings=getattr(
                run_config, "detection_model_settings", None
            ),
        )

    def run(self, run_config: RunConfiguration) -> bool:
        try:
            run_config.validate()
            self.setup_environment()
            gen_config = self.create_generation_config(run_config)
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
