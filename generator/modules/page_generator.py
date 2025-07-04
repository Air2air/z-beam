# generator/modules/page_generator.py
"""
Refactored page generator with better separation of concerns and error handling.
"""

import json
import os
import re
from typing import Dict, Any, Optional
from dataclasses import dataclass
import yaml

from generator.config.settings import AppConfig, GenerationConfig
from generator.modules.logger import get_logger
from generator.modules.prompt_loader import PromptLoader
from generator.modules.prompt_manager import PromptManager

from generator.modules.file_handler import (
    save_file,
    read_cache,
    write_cache,
)
from generator.exceptions import GenerationError, FileOperationError
from generator.modules import content_generator
from generator.modules.metadata_generator import generate_metadata


@dataclass
class ArticleData:
    """Structured representation of article data."""

    metadata: Dict[str, Any]
    sections: Dict[str, str]
    material_details: Optional[Dict[str, Any]] = None

    def to_mdx(self) -> str:
        """Convert article data to MDX format."""
        # If metadata is already a YAML string, just use it
        if isinstance(self.metadata, str) and self.metadata.startswith("---"):
            mdx_content = self.metadata + "\n\n"
        else:
            mdx_content = "---\n"
            for key, value in self.metadata.items():
                if isinstance(value, (list, dict)):
                    mdx_content += f"{key}: {json.dumps(value)}\n"
                else:
                    mdx_content += f"{key}: {value}\n"
            mdx_content += "---\n\n"

        # Write sections in the order specified in config
        section_order = [
            "introduction",
            "comparison",
            "chart",
            "contaminants",
            "substrates",
            "table",
        ]
        for section_name in section_order:
            if section_name in self.sections:
                title = section_name.replace("_", " ").title()
                mdx_content += f"## {title}\n{self.sections[section_name]}\n\n"
        # Write any remaining sections not in the order list
        for section_name, content in self.sections.items():
            if section_name not in section_order:
                title = section_name.replace("_", " ").title()
                mdx_content += f"## {title}\n{content}\n\n"

        return mdx_content


class ArticleGenerator:
    """Main article generation orchestrator."""

    def __init__(self, app_config: AppConfig):
        self.config = app_config
        self.logger = get_logger("page_generator")

        # Initialize components
        self.prompt_loader = PromptLoader(
            os.path.join(os.path.dirname(__file__), "../prompts/sections")
        )
        self.prompt_manager = PromptManager(
            os.path.join(os.path.dirname(__file__), "../prompts")
        )

    def generate_article(self, gen_config: GenerationConfig) -> None:
        """
        Generate a complete article based on the given configuration.

        Args:
            gen_config: Configuration for the generation process

        Raises:
            GenerationError: If the generation process fails
        """
        self.logger.info(
            f"Starting article generation for material: '{gen_config.material}', "
            f"provider: '{gen_config.provider}', model: '{gen_config.model}'"
        )

        try:
            # Load required data
            prompt_templates = self._load_prompt_templates()
            sections_config = self._load_sections_config()

            # Research material configuration
            material_config = self._research_material_config(
                gen_config, prompt_templates
            )

            # Initialize article data
            article_data = self._initialize_article_data(gen_config, material_config)

            # Load cache if not forcing regeneration
            cache_data = self._load_cache_data(gen_config)

            # Generate content for each section
            self._generate_sections(
                article_data,
                sections_config,
                gen_config,
                prompt_templates,
                cache_data,
                gen_config.ai_detection_threshold,  # Strict: always use the value from run.py, no fallback
                gen_config.human_detection_threshold,  # Pass human threshold
            )

            # Save the final article
            self._save_article(article_data, gen_config, cache_data)

            self.logger.info("Article generation completed successfully")
            print(
                f"[PROGRESS] Article generation completed successfully for: {gen_config.file_name}"
            )

        except Exception as e:
            self.logger.error(f"Article generation failed: {e}", exc_info=True)
            raise GenerationError(f"Failed to generate article: {e}") from e

    def _load_prompt_templates(self) -> Dict[str, str]:
        """Load prompt templates."""
        try:
            templates = self.prompt_loader.load_all_templates()
            if not templates:
                raise GenerationError("No prompt templates loaded")
            return templates
        except Exception as e:
            raise GenerationError(f"Failed to load prompt templates: {e}") from e

    def _load_sections_config(self) -> Dict[str, Dict[str, Any]]:
        """Load sections configuration."""
        return self.config.load_sections_config()

    def _research_material_config(
        self, gen_config: GenerationConfig, prompt_templates: Dict[str, str]
    ) -> Optional[Dict[str, Any]]:
        """Research material configuration using AI."""
        try:
            material_config = content_generator.research_material_config(
                gen_config.material,
                gen_config.provider,
                gen_config.model,
                gen_config.api_keys,
                prompt_templates,
            )

            if material_config:
                self.logger.info(
                    f"Successfully researched material config for '{gen_config.material}'"
                )
                return material_config
            else:
                self.logger.warning(
                    f"Failed to research material config for '{gen_config.material}'"
                )
                return None

        except Exception as e:
            self.logger.error(f"Material research failed: {e}")
            raise GenerationError(f"Failed to research material config: {e}") from e

    def _initialize_article_data(
        self,
        gen_config: GenerationConfig,
        material_config: Optional[Dict[str, Any]],
    ) -> ArticleData:
        """Initialize the article data structure with author metadata."""
        # Only log metadata once per run
        if not hasattr(self, "_metadata_logged"):
            self._metadata_logged = True
            self.logger.info(
                f"[METADATA] Article metadata: material={gen_config.material}, file={gen_config.file_name}, provider={gen_config.provider}, author={gen_config.author}, temperature={gen_config.temperature}"
            )
        # Normalize author key (strip .mdx, lowercase, underscores)
        author_key = (
            os.path.splitext(gen_config.author)[0]
            .lower()
            .replace(" ", "_")
            .replace("-", "_")
        )
        author_metadata = self._load_author_metadata(author_key)
        # Compose article_config dict for metadata
        article_config = {
            "author": gen_config.author,
            "temperature": gen_config.temperature,
            "model": getattr(gen_config, "model", None),
        }
        ai_scores = {}  # You may want to pass actual scores if available
        article_category = getattr(gen_config, "category", None) or "material"
        metadata_yaml = generate_metadata(
            gen_config.material,
            material_config or {},
            article_config,
            author_metadata,
            ai_scores,
            article_category,
        )
        return ArticleData(
            metadata=metadata_yaml, sections={}, material_details=material_config
        )

    def _load_cache_data(self, gen_config: GenerationConfig) -> Dict[str, Any]:
        """Load cache data if available and not forcing regeneration."""
        if gen_config.force_regenerate:
            self.logger.info("Force regeneration is active. Ignoring cache.")
            return {}

        try:
            cache_file = gen_config.file_name.replace(".mdx", ".cache.json")
            cache_data = read_cache(cache_file)

            if cache_data:
                self.logger.info(f"Loaded existing cache from {cache_file}")
                return cache_data
            else:
                self.logger.info("No cache found, using fresh generation")
                return {}

        except Exception as e:
            self.logger.warning(f"Failed to load cache: {e}")
            return {}

    def _generate_sections(
        self,
        article_data: ArticleData,
        sections_config: Dict[str, Dict[str, Any]],
        gen_config: GenerationConfig,
        prompt_templates: Dict[str, str],
        cache_data: Dict[str, Any],
        ai_detection_threshold: int,  # Pass threshold through pipeline
        human_detection_threshold: int,  # Pass human threshold through pipeline
    ) -> None:
        """Generate content for all sections."""
        sorted_sections = sorted(
            sections_config.items(), key=lambda item: item[1].get("order", 999)
        )

        self.logger.info(
            f"[DEBUG] Sections config to generate: {[name for name, _ in sorted_sections]}"
        )
        for section_name, section_config in sorted_sections:
            self.logger.info(
                f"[DEBUG] Attempting to generate section: {section_name} | config: {json.dumps(section_config, indent=2)}"
            )
            if section_name == "ai_detection_prompt":
                continue  # Skip ai_detection_prompt as a section
            if not section_config.get("generate", True):
                continue
            self._generate_single_section(
                section_name,
                section_config,
                article_data,
                gen_config,
                prompt_templates,
                cache_data,
                ai_detection_threshold,  # Pass threshold
                human_detection_threshold,  # Pass human threshold
            )

        if not article_data.sections:
            raise GenerationError("No sections were successfully generated")

    def _generate_single_section(
        self,
        section_name: str,
        section_config: Dict[str, Any],
        article_data: ArticleData,
        gen_config: GenerationConfig,
        prompt_templates: Dict[str, str],
        cache_data: Dict[str, Any],
        ai_detection_threshold: int,  # Accept threshold
        human_detection_threshold: int,  # Accept human threshold
    ) -> None:
        """Generate content for a single section."""
        prompt_file = section_config.get("prompt_file")
        if not prompt_file or prompt_file not in prompt_templates:
            self.logger.warning(
                f"Prompt file '{prompt_file}' not found for section '{section_name}'. Skipping."
            )
            return

        prompt_template = self.prompt_manager.load_prompt(prompt_file, "sections")

        # Prepare section variables
        section_variables = {
            **gen_config.__dict__,
            **(article_data.material_details or {}),
            "content_type": section_name,
            "temperature": gen_config.temperature,
            "iterations_per_section": getattr(gen_config, "iterations_per_section", 3),
        }
        ai_detect = section_config.get("ai_detect", True)

        self.logger.info(f"Generating content for section: {section_name}")

        # Use cached section content if available and not forcing regeneration
        if not gen_config.force_regenerate and section_name in cache_data.get(
            "sections", {}
        ):
            cached_content = cache_data["sections"][section_name]
            article_data.sections[section_name] = cached_content
            self.logger.info(f"Loaded cached content for section: {section_name}")
            return

        try:
            content, ai_likelihood, threshold_met = content_generator.generate_content(
                section_name=section_name,
                prompt_template=prompt_template,
                section_variables=section_variables,
                article_data=article_data.__dict__,
                cache_data=cache_data,
                provider=gen_config.provider,
                model=gen_config.model,
                force_regenerate=gen_config.force_regenerate,
                api_keys=gen_config.api_keys,
                prompt_templates_dict=prompt_templates,
                prompt_file_name=prompt_file,
                ai_detection_threshold=ai_detection_threshold,  # Pass threshold
                human_detection_threshold=human_detection_threshold,  # Pass human threshold
                ai_detect=ai_detect,
            )

            if threshold_met:
                article_data.sections[section_name] = content
                self.logger.info(
                    f"Successfully generated content for section: {section_name} (AI Likelihood: {ai_likelihood}%, threshold: {ai_detection_threshold}%)"
                )
            else:
                self.logger.error(
                    f"Failed to generate content for section: {section_name} below threshold. Final AI Likelihood: {ai_likelihood}%, threshold: {ai_detection_threshold}%"
                )

        except Exception as e:
            self.logger.error(
                f"Error generating content for section '{section_name}': {e}"
            )

    def _save_article(
        self,
        article_data: ArticleData,
        gen_config: GenerationConfig,
        cache_data: Dict[str, Any],
    ) -> None:
        """Save the generated article and cache."""
        try:
            print(f"[PROGRESS] Saving article to file: {gen_config.file_name}")
            # Save the article
            output_dir = os.path.join("app", "(materials)", "posts")
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, gen_config.file_name)
            mdx_content = article_data.to_mdx()
            save_file(output_path, mdx_content)
            self.logger.info(f"Article saved to: {output_path}")

            # Save the cache
            cache_file = gen_config.file_name.replace(".mdx", ".cache.json")
            cache_path = os.path.join(output_dir, cache_file)
            cache_data.update(
                {
                    "metadata": article_data.metadata,
                    "material_details": article_data.material_details,
                }
            )
            write_cache(cache_path, cache_data)
            self.logger.info(f"Cache saved to: {cache_path}")
            print(
                f"[PROGRESS] Finished saving article and cache for: {gen_config.file_name}"
            )

        except Exception as e:
            raise FileOperationError(f"Failed to save article or cache: {e}") from e

    def _load_author_metadata(self, author_filename: str) -> Dict[str, Any]:
        """Load metadata for a single author from .mdx file (YAML frontmatter)."""
        author_dir = self.config.directories.author_dir
        file_path = os.path.join(author_dir, author_filename)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            match = re.match(r"---\s*\n(.*?)\n---", content, re.DOTALL)
            if not match:
                return {}
            metadata = yaml.safe_load(match.group(1))
            return metadata if isinstance(metadata, dict) else {}
        except Exception:
            return {}


# Legacy function for backward compatibility
def main(*args, **kwargs):
    """Legacy main function for backward compatibility."""
    from generator.config.settings import AppConfig

    # Convert old-style arguments to new configuration
    gen_config = GenerationConfig(
        material=kwargs.get("material"),
        article_category=kwargs.get("article_category"),
        file_name=kwargs.get("file_name"),
        provider=kwargs.get("provider"),
        model=kwargs.get("model"),
        authors=kwargs.get(
            "authors", []
        ),  # Kept for legacy, but not used in new pipeline
        force_regenerate=kwargs["force_regenerate"],
        api_keys=kwargs.get("api_keys", {}),
        temperature=kwargs["temperature"],
    )

    app_config = AppConfig()
    generator = ArticleGenerator(app_config)
    generator.generate_article(gen_config)
