# generator/modules/page_generator.py

"""
Main module for the Z-Beam Page Generator.
Orchestrates the article generation process.
"""

import os
from dotenv import load_dotenv
import json
import requests
import datetime  # ADDED THIS LINE
import re  # ADDED THIS LINE

# Internal module imports
from generator.modules.logger import get_logger

# Importing all necessary file handling functions
from generator.modules.file_handler import (
    save_file,
    read_cache,
    write_cache,
    parse_json_response,
)
from generator.modules.author_loader import load_author_metadata
from generator.modules.content_generator import generate_content

# Constants
from generator.constants import (
    AUTHOR_DIR,
    OUTPUT_DIR,
    BASE_ARTICLE_CONFIG,
    BASE_SECTIONS_CONFIG,
    GROK_API_URL,
    GEMINI_API_URL,
    GROK_MODEL_LATEST,
    GEMINI_MODEL_FLASH,
)

logger = get_logger("page_generator")


# --- Helper function for API URL and Key (moved from research_manager.py) ---
def _get_api_url_and_key(
    provider: str, model: str, gemini_api_key: str | None, grok_api_key: str | None
) -> tuple[str, str]:
    """Helper to determine API URL and key based on provider."""
    if provider == "GEMINI":
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY is required for GEMINI provider.")
        return GEMINI_API_URL, gemini_api_key
    elif provider == "GROK":
        if not grok_api_key:
            raise ValueError("GROK_API_KEY is required for GROK provider.")
        return GROK_API_URL, grok_api_key
    else:
        raise ValueError(f"Unknown provider: {provider}")


# --- research_material_config function (moved from research_manager.py) ---
def research_material_config(
    material: str,
    article_category: str,
    provider: str,
    model: str,
    gemini_api_key: str = None,
    grok_api_key: str = None,
    cache_dir: str = None,
    force_regenerate: bool = False,
) -> dict:
    """
    Researches and provides configuration for a given material.
    This function would typically interact with external APIs or databases
    to fetch data relevant to the material.

    Args:
        material (str): The material to research (e.g., "Bronze").
        article_category (str): The category of the article.
        provider (str): The AI provider to use.
        model (str): The specific AI model.
        gemini_api_key (str, optional): Gemini API key.
        grok_api_key (str, optional): Grok API key.
        cache_dir (str, optional): Directory for caching research results.
        force_regenerate (bool, optional): If True, ignores cache.

    Returns:
        dict: A dictionary containing researched material configuration.
    """
    logger.info(
        f"Researching material config for: {material} (provider: {provider}, model: {model})"
    )

    cache_file = None
    if cache_dir:
        os.makedirs(cache_dir, exist_ok=True)
        # Create a unique cache file name based on material, category, provider, model
        cache_file_name = f"research_config_{material.lower().replace(' ', '_')}_{article_category.lower().replace(' ', '_')}_{provider.lower()}_{model.lower().replace('.', '_')}.json"
        cache_file = os.path.join(cache_dir, cache_file_name)

        if not force_regenerate:
            cached_data = read_cache(cache_file)
            if cached_data:
                logger.info(f"Loaded material config from cache: {cache_file}")
                return cached_data

    try:
        api_url, api_key = _get_api_url_and_key(
            provider, model, gemini_api_key, grok_api_key
        )

        # --- Placeholder for actual LLM API call ---
        # In a real scenario, you would send a prompt to the LLM here
        # to get specific details about the material and its laser cleaning.
        # For now, we return a static dictionary.

        material_details = {
            "material_description": f"Bronze is an alloy primarily composed of copper, usually with tin as the main additive, but sometimes with other elements such as phosphorus, manganese, aluminum, or silicon. It is known for its durability, corrosion resistance, and attractive appearance. In laser cleaning, bronze requires careful parameter tuning to avoid overheating and oxidation, preserving its surface integrity.",
            "common_contaminants": [
                "patina",
                "oxides",
                "corrosion",
                "varnishes",
                "dirt",
                "grease",
            ],
            "laser_interaction_notes": "Laser cleaning of bronze should use short pulse durations (nanosecond or picosecond) and appropriate wavelengths (e.g., 1064nm, 532nm) to achieve ablation without damaging the substrate. Low fluence is critical to avoid melting, discoloration, or heat-affected zones. Proper ventilation is essential due to potential fume generation. Optimal parameters depend on the specific bronze alloy and the contaminant.",
            "safety_considerations": "Fume extraction, eye protection (OD 7+ at relevant wavelengths), skin protection, and proper laser safety interlocks.",
            "post_cleaning_steps": "Gentle wipe-down, passivation (if required for specific applications), or immediate subsequent processing.",
            "applications": [
                "Art restoration",
                "Archaeological artifact cleaning",
                "Industrial mold cleaning",
                "Surface preparation for coating",
                "Removal of undesired layers from architectural elements.",
            ],
        }

        researched_config = {
            "material": material,
            "articleCategory": article_category,
            "material_details": material_details,  # Nested researched details
            # Add other research-derived fields here
        }

        if cache_file:
            write_cache(cache_file, researched_config)
            logger.info(f"Cached material config to: {cache_file}")

        return researched_config

    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed for material research ({provider}): {e}")
        raise Exception(f"API call failed for material research: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred during material research: {e}")
        raise


# --- END research_material_config function ---


def main(
    material: str,
    article_category: str,
    file_name: str,
    provider: str,
    authors: list[str],
    voice: str,
    authority: str,
    content_length: dict,
    variety: str,
    force_regenerate: bool,
    model: str,
):
    """
    Orchestrates the generation of a laser cleaning article.
    """
    logger.info(
        f"Generating article for material: '{material}', category: '{article_category}', provider: '{provider}', model: '{model}'"
    )

    script_dir = os.path.dirname(os.path.abspath(__file__))

    load_dotenv()
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    grok_api_key = os.getenv("GROK_API_KEY")

    if provider == "GEMINI" and not gemini_api_key:
        logger.critical("GEMINI_API_KEY not found in .env file. Exiting.")
        return
    if provider == "GROK" and not grok_api_key:
        logger.critical("GROK_API_KEY not found in .env file. Exiting.")
        return

    CACHE_DIR = os.path.join(os.path.dirname(script_dir), "cache")
    os.makedirs(CACHE_DIR, exist_ok=True)
    logger.debug(f"Cache directory set to: {CACHE_DIR}")

    try:
        author_metadata = load_author_metadata(AUTHOR_DIR)
    except ValueError as e:
        logger.critical(f"Failed to load author metadata: {e}. Exiting.")
        return
    except Exception as e:
        logger.critical(
            f"An unexpected error occurred during author loading: {e}. Exiting."
        )
        return

    try:
        material_config = research_material_config(
            material=material,
            article_category=article_category,
            provider=provider,
            model=model,
            gemini_api_key=gemini_api_key,
            grok_api_key=grok_api_key,
            cache_dir=CACHE_DIR,
            force_regenerate=force_regenerate,
        )
    except Exception as e:
        logger.critical(
            f"Failed to research material config for '{material}': {e}. Exiting."
        )
        return

    # Construct the final article configuration dictionary
    article_config = {
        **BASE_ARTICLE_CONFIG,
        **material_config,  # Merges researched data (e.g., material_description)
        "material": material,
        "articleCategory": article_category,
        "file_name": file_name,
        "provider": provider,
        "authors": authors,
        "voice": voice,
        "authority": authority,
        "content_length": content_length,
        "variety": variety,
        "model": model,
        "gemini_api_key": gemini_api_key,
        "grok_api_key": grok_api_key,
        "force_regenerate": force_regenerate,
        "cache_dir": CACHE_DIR,
    }

    # Merge base sections configuration (this sets article_config["sections"])
    article_config["sections"] = BASE_SECTIONS_CONFIG["sections"]

    # Prepare API keys dictionary for passing to other modules
    api_keys_dict = {"grok": grok_api_key, "gemini": gemini_api_key}

    # Generate content
    logger.info("Starting content generation...")
    try:
        generated_mdx_content, _ai_scores = generate_content(
            material=material,
            material_config=material_config,
            article_config=article_config,
            sections_config=BASE_SECTIONS_CONFIG,
            author_metadata=author_metadata,
            cache_dir=CACHE_DIR,
            api_keys=api_keys_dict,
            force_regenerate=force_regenerate,
            provider=provider,
        )
    except Exception as e:
        logger.critical(f"Failed to generate content: {e}. Exiting.")
        return

    # Define output path
    output_path = os.path.join(OUTPUT_DIR, file_name)

    # Construct YAML Frontmatter
    title = f"Laser Cleaning {material}"
    authors_list = article_config.get("authors", [])
    # Retrieve full author names from loaded author_metadata
    author_full_names = [
        author_metadata.get(author_alias, {}).get("name", author_alias)
        for author_alias in authors_list
    ]
    date_generated = datetime.datetime.now().strftime("%Y-%m-%d")

    # Take a snippet from the first generated paragraph for description
    description_snippet = ""
    if generated_mdx_content and generated_mdx_content[0]:
        temp_desc = generated_mdx_content[0]
        # Clean up markdown/html tags and truncate for description
        temp_desc = re.sub(r"<[^>]*>", "", temp_desc)  # Remove HTML tags
        temp_desc = re.sub(
            r"#+\s*", "", temp_desc
        )  # Remove markdown headings (e.g., from lists if they started with ##)
        temp_desc = temp_desc.strip().split("\n")[
            0
        ]  # Take only the first effective line
        description_snippet = (
            temp_desc[:160] + "..." if len(temp_desc) > 160 else temp_desc.strip()
        )

    # Combine categories and material for tags, ensure uniqueness and sort
    tags = [article_category.lower().replace(" ", "-")]  # Start with category tag
    if material:
        tags.append(material.lower().replace(" ", "-"))  # Add material tag
    # Add any other relevant tags from material_config if available (e.g., from 'applications')
    if (
        "material_details" in material_config
        and "applications" in material_config["material_details"]
    ):
        tags.extend(
            [
                app.lower().replace(" ", "-")
                for app in material_config["material_details"]["applications"]
            ]
        )

    tags_str = ", ".join(
        [f'"{tag}"' for tag in sorted(list(set(tags)))]
    )  # Unique and sorted tags

    yaml_frontmatter = f"""---
title: "{title}"
authors: {json.dumps(author_full_names)}
date: "{date_generated}"
description: "{description_snippet}"
tags: [{tags_str}]
---

"""

    # Save the generated content
    try:
        # Prepend YAML frontmatter to the joined content
        final_content_to_save = yaml_frontmatter + "\n\n".join(generated_mdx_content)
        save_file(output_path, final_content_to_save)
        logger.info(f"Article successfully saved to: {output_path}")
    except Exception as e:
        logger.critical(f"Failed to save article to '{output_path}': {e}. Exiting.")
        return

    logger.info("Article generation process completed.")


if __name__ == "__main__":
    logger.info("Running page_generator.py directly (usually run via run.py).")
    # Example call (for direct testing, if needed):
    # main(
    #     material="Aluminum",
    #     article_category="Material",
    #     file_name="laser_cleaning_aluminum.mdx",
    #     provider="GEMINI",
    #     authors=["Todd Dunning", "Dr. Evelyn Reed"],
    #     voice="technical",
    #     authority="high",
    #     content_length={
    #         "paragraph": "150-200",
    #         "list": "70-100",
    #         "table": "60-90",
    #         "chart": "60-90",
    #         "comparison_chart": "60-90",
    #     },
    #     variety="Detailed analysis with empirical data and industrial examples.",
    #     force_regenerate=False,
    #     model=GEMINI_MODEL_FLASH
    # )
