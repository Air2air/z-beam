# generator/modules/content_generator.py

"""
Generates content for sections and material configurations using API calls.
"""

import os
import re
import requests
from generator.modules.api_client import call_ai_api
from generator.modules.prompt_formatter import format_prompt
from generator.modules.file_handler import (
    load_file,
    read_cache,
    write_cache,
    parse_json_response,
)
from generator.modules.ai_detector import AIDetector
from generator.modules.logger import get_logger
from generator.constants import SECTIONS_DIR, AUTHOR_DIR, AI_DETECTION_THRESHOLD

logger = get_logger("content_generator")

# --- Helper Functions for Content Generation ---


def _load_author_sample(author_name, author_metadata):
    """
    Loads the rewritten sample content for a given author.
    It expects 'full_content' (the part after the YAML frontmatter) to be in author_metadata.

    Args:
        author_name (str): The name of the author.
        author_metadata (dict): Dictionary containing author metadata including 'full_content'.

    Returns:
        str or None: The rewritten sample content, or None if not found/parsed.
    """
    author_info = author_metadata.get(author_name, {})
    full_content = author_info.get("full_content")

    if not full_content:
        logger.warning(
            f"No 'full_content' found for author '{author_name}'. Cannot load sample."
        )
        return None

    # The format is assumed to be '--- Rewritten Sample: [sample text]' within full_content
    # after the initial YAML frontmatter was stripped in author_loader.py
    if "Rewritten Sample:" in full_content:
        try:
            _, rewritten_sample = full_content.split("Rewritten Sample:", 1)
            return rewritten_sample.strip()
        except ValueError:
            logger.warning(
                f"Could not parse 'Rewritten Sample:' for author '{author_name}'. Format incorrect."
            )
            return None
    else:
        logger.warning(
            f"No 'Rewritten Sample:' marker found in content for author '{author_name}'."
        )
        return None


def _process_ai_content_with_retries(
    prompt,
    section_type,
    default_content,
    max_tokens,
    api_keys,
    provider,
    material,
    industries,
    article_category,  # Added for more specific AI detection context
    section_name,  # Added section_name for more specific logging
):
    """
    Handles API call, initial AI detection, and regeneration if AI likelihood is too high.

    Args:
        prompt (str): The AI prompt.
        section_type (str): The type of section (e.g., 'paragraph', 'table').
        default_content (str): Fallback content if API fails or returns empty.
        max_tokens (int): Max tokens for AI response.
        api_keys (dict): API keys.
        provider (str): AI provider.
        material (str): Material name for regeneration prompt.
        industries (list): Industries for regeneration prompt.
        article_category (str): Category (e.g., 'Material', 'Application') for AI detection.
        section_name (str): The name of the section being processed.

    Returns:
        tuple: (final_content, ai_score_dict)

    Raises:
        ValueError: If chart or comparison_chart falls back to minimal default content.
    """
    final_content = ""
    ai_score = None
    original_prompt = prompt  # Keep original prompt for initial call

    # Determine content type for AI detection
    detector_content_type = f"{article_category.lower()} article section"
    detector_audience_level = (
        "technical professionals and engineers"  # More precise audience
    )

    for attempt in range(2):  # Try initial and one regeneration
        current_prompt = (
            original_prompt if attempt == 0 else prompt
        )  # Use original or modified prompt

        logger.info(f"Generating section '{section_name}' (Attempt {attempt + 1})...")
        try:
            content = call_ai_api(
                current_prompt,
                max_tokens=max_tokens,
                retries=3,
                grok_api_key=api_keys["grok"],
                gemini_api_key=api_keys["gemini"],
                provider=provider,
            )

            if not content.strip():
                logger.warning(
                    f"Empty content from API for '{section_name}' on attempt {attempt + 1}. Using fallback."
                )
                final_content = default_content
                ai_score = {
                    "percentage": 0,
                    "summary": "Empty API response, using fallback",
                }
                break  # Exit loop if fallback used

            # For structured content types, AI detection is not applicable
            if section_type in ["table", "chart", "comparison_chart"]:
                final_content = content
                ai_score = None
                break  # No AI detection needed, content is ready

            # Process textual content for AI detection
            detector = AIDetector(
                content_type=detector_content_type,
                audience_level=detector_audience_level,
            )
            current_ai_score = detector.evaluate(
                content, api_keys=api_keys, provider=provider
            )
            logger.info(
                f"AI Detection for '{section_name}' (Attempt {attempt + 1}): {current_ai_score['percentage']}% - {current_ai_score['summary']}"
            )

            if (
                current_ai_score["percentage"] > AI_DETECTION_THRESHOLD
                and "failed" not in current_ai_score["summary"].lower()
                and current_ai_score["summary"] != "Invalid response format"
                and attempt == 0  # Only attempt regeneration on the first try
            ):
                logger.info(f"Regenerating '{section_name}' due to high AI likelihood.")
                # Append regeneration instructions to the prompt
                prompt += (
                    f"\n\nREGENERATE: The previous response was flagged for AI-like traits: "
                    f"'{current_ai_score['summary']}'. Please rewrite, incorporating more specific, "
                    f"actionable, and detailed information about {material} and its applications in "
                    f"{', '.join(industries)} industries. Focus on real-world examples, "
                    f"nuances, challenges, and expert terminology to reduce perceived AI authorship."
                )
                # The loop will iterate again with the modified prompt
            else:
                final_content = content
                ai_score = current_ai_score
                break  # Content is acceptable or no more attempts are needed

        except requests.exceptions.RequestException as e:
            logger.error(
                f"API call failed for '{section_name}' on attempt {attempt + 1}: {e}. Using fallback content."
            )
            final_content = default_content
            ai_score = {"percentage": 0, "summary": f"API call failed: {e}"}
            break
        except Exception as e:
            logger.error(
                f"An unexpected error occurred during content generation for '{section_name}' on attempt {attempt + 1}: {e}. Using fallback content."
            )
            final_content = default_content
            ai_score = {"percentage": 0, "summary": f"Unexpected error: {e}"}
            break

    # Final check for minimal default chart/comparison_chart content
    # This specifically targets cases where AI failed to produce structured data
    if (
        section_type in ["chart", "comparison_chart"]
        and final_content == default_content
    ):
        # Assuming "Chart goes here" is a placeholder for truly empty/failed chart content
        if default_content == "Chart goes here":
            raise ValueError(
                f"Section '{section_name}' (type: {section_type}) could not generate specific content "
                f"and defaulted to a minimal placeholder ('Chart goes here'). This requires manual review "
                f"or better default data/AI response handling."
            )

    return final_content, ai_score


# --- Main Functions ---


def research_material_config(
    material, variety, cache_dir, api_keys, force_regenerate=False, provider="GEMINI"
):
    """Generate or cache material properties.

    Args:
        material (str): Material name (e.g., Nickel).
        variety (str): Style variety for content generation.
        cache_dir (str): Directory for caching.
        api_keys (dict): API keys for Grok and Gemini.
        force_regenerate (bool): If True, ignore cache and regenerate content.
        provider (str): API provider (e.g., GROK, GEMINI).

    Returns:
        dict: Material configuration.
    """
    cache_file = os.path.join(cache_dir, f"{material.lower().replace(' ', '_')}.json")
    if not force_regenerate:
        cached = read_cache(cache_file)
        if cached:
            logger.info(f"Using cached material_config for {material}")
            return cached

    default_config = {
        "industries": ["General Industry"],
        "material_type": "Unknown",
        "metal_class": "Unknown",
        "primary_application": "Unknown",
        "atomicNumber": "None",
        "chemicalSymbol": "None",
        "crystalStructure": "Unknown",  # Ensure this is always present
    }
    prompt_template = load_file(
        os.path.join(SECTIONS_DIR, "material_research_prompt.txt")
    )
    if not prompt_template:
        logger.error(
            f"Material research prompt file 'material_research_prompt.txt' not found or empty."
        )
        return default_config  # Return default if prompt isn't available

    prompt = prompt_template.format(material=material)
    # Added crystal_structure to the prompt request
    prompt += f"\n\n{variety}\n\nProvide response as plain text with fields: industries (comma-separated), material_type, metal_class, primary_application, atomic_number, chemical_symbol, crystal_structure."

    response = call_ai_api(
        prompt,
        max_tokens=4000,
        retries=3,
        grok_api_key=api_keys["grok"],
        gemini_api_key=api_keys["gemini"],
        provider=provider,
    )
    logger.info(
        f"Raw API response (material_config): {response[:500]}..."
    )  # Log snippet

    # Parse plain text response
    config = default_config.copy()
    lines = response.strip().split("\n")
    for line in lines:
        if ":" in line:
            key, value = map(str.strip, line.split(":", 1))
            # Normalize keys and values
            lower_key = key.lower().replace(" ", "_")  # Standardize key for lookup

            if lower_key == "industries":
                config["industries"] = [v.strip() for v in value.split(",")]
            elif lower_key == "material_type":
                config["material_type"] = value
            elif lower_key == "metal_class":
                config["metal_class"] = value
            elif lower_key == "primary_application":
                config["primary_application"] = value
            elif lower_key == "atomic_number":
                # Ensure it's a number if possible, else keep as string "None"
                try:
                    config["atomicNumber"] = int(value)
                except ValueError:
                    config["atomicNumber"] = value  # Keep as string if not int
            elif lower_key == "chemical_symbol":
                config["chemicalSymbol"] = value
            elif lower_key == "crystal_structure":
                config["crystalStructure"] = value
            # Add more specific parsing here if other fields are expected
            else:
                logger.debug(
                    f"Unrecognized material config field from AI: {key}: {value}"
                )

    write_cache(cache_file, config)
    logger.info(f"Generated and cached material_config for {material}.")
    return config


def generate_section(
    material,
    material_config,
    section_name,
    section_def,
    article_config,
    author_metadata,
    cache_dir,
    api_keys,
    force_regenerate=False,
    provider="GEMINI",
):
    """Generate a section, evaluate AI likelihood (except for table/chart/comparison_chart), cache results.

    Args:
        material (str): Material name.
        material_config (dict): Material properties.
        section_name (str): Section identifier.
        section_def (dict): Section configuration.
        article_config (dict): Article configuration.
        author_metadata (dict): Author metadata.
        cache_dir (str): Cache directory.
        api_keys (dict): API keys for Grok and Gemini.
        force_regenerate (bool): If True, ignore cache and regenerate content.
        provider (str): API provider (e.g., GROK, GEMINI).

    Returns:
        tuple: (content, ai_score) where ai_score is None for table/chart/comparison_chart sections.

    Raises:
        ValueError: If chart or comparison_chart falls back to minimal default content.
    """
    cache_file = os.path.join(
        cache_dir, f"{material.lower().replace(' ', '_')}_{section_name}.json"
    )
    if not force_regenerate:
        cached = read_cache(cache_file)
        if cached and "content" in cached:
            logger.info(f"Using cached section '{section_name}' for {material}.")
            # Check AI score. If 0 and not intended (e.g., failed detection), regenerate
            ai_score = cached.get("ai_score")
            # Only force regeneration if it's a text section and AI score was zero/failed unexpectedly
            if (
                ai_score is not None
                and ai_score.get("percentage") == 0
                and section_def.get("type")
                not in ["table", "chart", "comparison_chart"]
                and "Empty" not in ai_score.get("summary", "")
            ):  # Don't regenerate if it was truly empty cache
                logger.info(
                    f"Zero/unexpected AI score in cache for '{section_name}', forcing regeneration."
                )
            else:
                return cached["content"], ai_score

    if not section_def:
        logger.warning(f"No configuration for '{section_name}', skipping.")
        return None, None

    prompt_file = section_def.get("prompt_file")
    section_type = section_def.get("type")
    if not prompt_file or not section_type:
        logger.warning(
            f"Invalid configuration for '{section_name}': missing prompt_file or type. Skipping."
        )
        return None, None

    prompt_template = load_file(os.path.join(SECTIONS_DIR, prompt_file))
    if not prompt_template:
        logger.warning(
            f"Prompt file '{prompt_file}' for '{section_name}' not found or empty. Cannot generate content."
        )
        return None, None

    format_vars = {
        "material": material,
        "material_slug": material.lower().replace(" ", "-"),
        "industries": ", ".join(
            material_config.get("industries", ["General Industry"])
        ),
        "article_category": article_config.get("articleCategory", "Material").lower(),
        "article_type": article_config.get("articleType", "Material"),
    }
    prompt = format_prompt(prompt_template, format_vars, prompt_file, section_name)

    # Construct author-specific style transformation prompt
    author_prompt_parts = []
    for author in article_config.get("authors", []):
        sample = _load_author_sample(author, author_metadata)
        if sample:
            author_prompt_parts.append(
                f"\n\nTransform style to match {author}'s sample:\n{sample.strip()}"
            )
        else:
            logger.warning(
                f"Failed to load a valid writing sample for author '{author}'. Style transformation for this author will be skipped."
            )
    author_prompt = "".join(author_prompt_parts)

    word_count_range = article_config["content_length"].get(section_name, "100-150")
    # Max tokens for AI generation should be based on words * ~1.5 (token per word average)
    max_words = (
        int(word_count_range.split("-")[-1])
        if "-" in word_count_range
        else int(word_count_range)
    )
    max_tokens_for_section = max_words * 2  # A more conservative multiplier for tokens

    prompt += (
        f"\n\nWrite in {article_config['voice']} voice with {article_config['authority']} authority. "
        f"Target {word_count_range} words. {article_config['variety']}{author_prompt}"
        f"\nReturn content as {section_type} (e.g., plain text, bullet points, markdown table, JSON for charts)."
    )

    default_content = {
        "paragraph": f"Laser cleaning of {material.lower()} removes contaminants like dust and adhesives, enhancing surface quality in industries such as {', '.join(material_config.get('industries', ['General Industry']))}.",
        "list": "- Dust and particulate matter\n- Adhesive residues\n- Surface oils",
        "table": "| Property | Value |\n|----------|-------|\n| Density | Unknown |\n| Hardness | Unknown |",
        "chart": "Chart goes here",  # Special placeholder for chart
        "comparison_chart": "Chart goes here",  # Special placeholder for comparison chart
    }.get(section_type, f"")

    content, ai_score = _process_ai_content_with_retries(
        prompt=prompt,
        section_type=section_type,
        default_content=default_content,
        max_tokens=max_tokens_for_section,
        api_keys=api_keys,
        provider=provider,
        material=material,
        industries=material_config.get("industries", ["General Industry"]),
        article_category=article_config.get("articleCategory", "Material"),
        section_name=section_name,
    )

    # Cache the result
    write_cache(cache_file, {"content": content, "ai_score": ai_score})
    return content, ai_score


def generate_content(  # <-- RENAMED 'generate_sections' to 'generate_content'
    material,
    material_config,
    article_config,
    sections_config,
    author_metadata,
    cache_dir,
    api_keys,
    force_regenerate=False,
    provider="GEMINI",
):
    """Generate all sections and their AI scores.

    Args:
        material (str): Material name.
        material_config (dict): Material properties.
        article_config (dict): Article configuration.
        sections_config (dict): Sections configuration.
        author_metadata (dict): Author metadata.
        cache_dir (str): Cache directory.
        api_keys (dict): API keys for Grok and Gemini.
        force_regenerate (bool): If True, ignore cache and regenerate content.
        provider (str): API provider (e.g., GROK, GEMINI).

    Returns:
        tuple: (list of section contents, dict of AI scores excluding table/chart/comparison_chart)
    """
    sections, ai_scores = [], {}
    for section_name in article_config.get("section_order", []):  # Use .get for safety
        section_def = sections_config["sections"].get(section_name)
        if not section_def:
            logger.warning(
                f"Section definition for '{section_name}' not found in sections_config. Skipping."
            )
            continue

        try:
            content, ai_score = generate_section(
                material,
                material_config,
                section_name,
                section_def,
                article_config,
                author_metadata,
                cache_dir,
                api_keys,
                force_regenerate,
                provider,
            )
            if content is not None:
                sections.append(content)
            if ai_score is not None:
                ai_scores[section_name] = ai_score
        except ValueError as e:
            logger.error(
                f"Failed to generate section '{section_name}' due to: {e}. Skipping section."
            )
            sections.append(f"")  # Add error placeholder to output

    return sections, ai_scores
