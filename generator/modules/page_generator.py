# generator/modules/page_generator.py

import os
import json
from typing import Dict, Any, List

from generator.modules.logger import get_logger
from generator.modules.prompt_loader import load_prompt_templates
from generator.modules import content_generator
from generator.modules.author_loader import load_author_metadata
from generator.modules.file_handler import save_file, read_cache, write_cache
from generator.constants import (
    OUTPUT_DIR,
    BASE_ARTICLE_CONFIG,
    BASE_SECTIONS_CONFIG,
    AUTHOR_DIR,
    SECTIONS_DIR,
)

logger = get_logger("page_generator")


def main(
    material: str,
    article_category: str,
    file_name: str,
    provider: str,
    authors: List[str],
    voice: str,
    authority: str,
    content_length: Dict[str, str],
    variety: str,
    force_regenerate: bool,
    model: str,
    api_keys: Dict[str, str],
):
    logger.info(
        f"Generating article for material: '{material}', category: '{article_category}', provider: '{provider}', model: '{model}'"
    )

    try:
        prompt_templates_dict = load_prompt_templates(SECTIONS_DIR)
        if not prompt_templates_dict:
            logger.critical(f"No prompt templates loaded from {SECTIONS_DIR}. Exiting.")
            return
    except Exception as e:
        logger.critical(
            f"Error loading prompt templates from {SECTIONS_DIR}: {e}. Exiting."
        )
        return

    # Load author metadata
    all_authors_metadata = load_author_metadata(AUTHOR_DIR)
    article_authors_data = [
        all_authors_metadata.get(author.lower().replace(" ", "_"))
        for author in authors
        if all_authors_metadata.get(author.lower().replace(" ", "_"))
    ]
    if not article_authors_data:
        logger.warning(
            f"No metadata found for authors: {authors}. Article will proceed without specific author data."
        )

    # Construct the article config, merging base with overrides
    article_config = BASE_ARTICLE_CONFIG.copy()
    article_config.update(
        {
            "material": material,
            "article_category": article_category,
            "provider": provider,
            "voice": voice,
            "authority": authority,
            "content_length": content_length,
            "variety": variety,
            "model": model,
            "authors": authors,
            "authors_data": article_authors_data,
        }
    )

    # Material research config (e.g., common contaminants, laser interaction)
    try:
        material_config = content_generator.research_material_config(
            material,
            provider,
            model,
            api_keys,
            prompt_templates_dict,
        )
        if material_config:
            article_config["material_details"] = material_config
            logger.info(f"Successfully researched material config for '{material}'.")
        else:
            logger.warning(
                f"Failed to research material config for '{material}'. Proceeding without material details."
            )
    except Exception as e:
        logger.critical(
            f"Failed to research material config for '{material}': {e}. Exiting."
        )
        return

    output_file_path = os.path.join(OUTPUT_DIR, file_name)
    cache_file_path = output_file_path.replace(".mdx", ".cache.json")

    # Load cache if available
    cache_data = read_cache(cache_file_path) if not force_regenerate else {}
    if force_regenerate:
        logger.info("Force regeneration is active. Ignoring cache.")
    elif cache_data:
        logger.info(f"Loaded existing cache from {cache_file_path}")
    else:
        logger.info("No cache found or using fresh generation.")

    # Initialize current article data structure
    current_article_data = {
        "metadata": {
            "title": article_config.get("title", f"Laser Cleaning {material}"),
            "description": article_config.get(
                "description", f"An article about laser cleaning {material}."
            ),
            "keywords": article_config.get("keywords", []),
            "authors": [author_data.get("name") for author_data in article_authors_data]
            if article_authors_data
            else authors,
            "voice": voice,
            "authority": authority,
            "material": material,
            "lastModified": None,
        },
        "sections": {},
    }
    if material_config:
        current_article_data["material_details"] = material_config

    # Generate content for each section
    generated_mdx_content = ""
    sections_config = BASE_SECTIONS_CONFIG.get("sections", {})
    sorted_sections = sorted(
        sections_config.items(), key=lambda item: item[1].get("order", 999)
    )

    for section_name, section_config in sorted_sections:
        if section_config.get("generate"):
            prompt_file = section_config.get("prompt_file")
            if prompt_file not in prompt_templates_dict:
                logger.warning(
                    f"Prompt file '{prompt_file}' not found for section '{section_name}'. Skipping section."
                )
                continue

            prompt_template = prompt_templates_dict[prompt_file]

            section_variables = {
                **article_config,
                **current_article_data.get("material_details", {}),
                "content_type": section_name,
                "audience_level": authority,
            }

            logger.info(f"Generating content for section: {section_name}")
            try:
                generated_content = content_generator.generate_content(
                    section_name,
                    prompt_template,
                    section_variables,
                    current_article_data,
                    cache_data,
                    provider,
                    model,
                    force_regenerate,
                    api_keys,
                    prompt_templates_dict,
                    prompt_file,  # <--- NEW: Pass the prompt_file name to content_generator
                )
                if generated_content:
                    current_article_data["sections"][section_name] = generated_content
                    generated_mdx_content += f"\n\n## {section_name.replace('_', ' ').title()}\n{generated_content}"
                    logger.info(
                        f"Successfully generated content for section: {section_name}"
                    )
                else:
                    logger.warning(f"No content generated for section: {section_name}.")
            except Exception as e:
                logger.error(
                    f"Error generating content for section '{section_name}': {e}"
                )
                continue

    if not current_article_data["sections"]:
        logger.error("No sections were successfully generated. Aborting article save.")
        return

    final_mdx_output = ""
    final_mdx_output += "---\n"
    for key, value in current_article_data["metadata"].items():
        if isinstance(value, list):
            final_mdx_output += f"{key}: {json.dumps(value)}\n"
        elif isinstance(value, dict):
            final_mdx_output += f"{key}: {json.dumps(value)}\n"
        else:
            final_mdx_output += f"{key}: {value}\n"
    final_mdx_output += "---\n\n"

    for section_name, content in current_article_data["sections"].items():
        title = section_name.replace("_", " ").title()
        final_mdx_output += f"## {title}\n{content}\n\n"

    try:
        save_file(output_file_path, final_mdx_output)
        logger.info(f"Article saved to: {output_file_path}")
        write_cache(cache_file_path, current_article_data)
        logger.info(f"Cache saved to: {cache_file_path}")
    except Exception as e:
        logger.error(f"Error saving article or cache: {e}")
