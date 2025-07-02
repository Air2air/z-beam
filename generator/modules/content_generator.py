"""
Generates content for sections and material configurations using API calls.
"""

import os
import json
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
from generator.constants import (
    SECTIONS_DIR,
    ARTICLE_CATEGORY,
    AUTHOR_DIR,
    AI_DETECTION_THRESHOLD,
)


def research_material_config(
    material, variety, cache_dir, api_keys, force_regenerate=False
):
    """Generate or cache material properties.

    Args:
        material (str): Material name (e.g., Nickel).
        variety (str): Style variety for content generation.
        cache_dir (str): Directory for caching.
        api_keys (dict): API keys for Grok and Gemini.
        force_regenerate (bool): If True, ignore cache and regenerate content.

    Returns:
        dict: Material configuration.
    """
    logger = get_logger("content_generator")
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
    }
    prompt = load_file(
        os.path.join(SECTIONS_DIR, "material_research_prompt.txt")
    ).format(material=material)
    prompt += f"\n\n{variety}\n\nProvide JSON response in ```json\n...\n```, with industries (list of strings), material_type, metal_class, primary_application."
    response = call_ai_api(
        prompt,
        max_tokens=4000,
        retries=3,
        grok_api_key=api_keys["grok"],
        gemini_api_key=api_keys["gemini"],
    )
    logger.info(f"Raw API response (material_config): {response}")
    parsed_config = parse_json_response(response, default_config, "material config")
    if "industries" in parsed_config and isinstance(parsed_config["industries"], list):
        parsed_config["industries"] = [
            item["name"] if isinstance(item, dict) and "name" in item else item
            for item in parsed_config["industries"]
            if isinstance(item, (str, dict))
        ] or default_config["industries"]
    else:
        parsed_config["industries"] = default_config["industries"]
    default_config.update(parsed_config)
    write_cache(cache_file, default_config)
    return default_config


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
):
    """Generate a section, evaluate AI likelihood (except for table/chart), cache results.

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

    Returns:
        tuple: (content, ai_score) where ai_score is None for table/chart sections.
    """
    logger = get_logger("content_generator")
    cache_file = os.path.join(
        cache_dir, f"{material.lower().replace(' ', '_')}_{section_name}.json"
    )
    if not force_regenerate:
        cached = read_cache(cache_file)
        if cached and "content" in cached:
            logger.info(f"Using cached section {section_name} for {material}")
            return cached["content"], cached.get("ai_score")

    prompt_file = section_def["prompt_file"]
    section_type = section_def["type"]
    prompt = load_file(os.path.join(SECTIONS_DIR, prompt_file))
    if not prompt:
        logger.warning(f"No content generated for {section_name} due to missing prompt")
        return (
            f"<!-- {section_name} (No content generated due to missing prompt) -->",
            None,
        )

    format_vars = {
        "material": material,
        "material_slug": material.lower().replace(" ", "-"),
        "industries": ", ".join(
            material_config.get("industries", ["General Industry"])
        ),
        "article_category": ARTICLE_CATEGORY.lower(),
    }
    prompt = format_prompt(prompt, format_vars, prompt_file, section_name)

    author_prompt = "".join(
        f"\n\nTransform style to match {author}'s sample:\n{rewritten.strip()}"
        for author in article_config["authors"]
        if (
            (
                content := load_file(
                    os.path.join(
                        AUTHOR_DIR, author_metadata.get(author, {}).get("file_name")
                    )
                )
            )
            and (split_content := content.split("---", 1))
            and len(split_content) > 1
            and (samples := split_content[1].split("Rewritten Sample:"))
            and len(samples) > 1
            and (rewritten := samples[1])
        )
        or logger.warning(f"Failed to load sample for {author}")
    )

    word_count = article_config["content_length"].get(section_name, "100-150")
    max_words = int(word_count.split("-")[-1]) if "-" in word_count else int(word_count)
    prompt += f"\n\nWrite in {article_config['voice']} voice with {article_config['authority']} authority. Target {word_count} words. {article_config['variety']}{author_prompt}\nReturn content as {section_type} (e.g., plain text, bullet points, markdown table, JSON)."

    default_content = {
        "paragraph": f"Laser cleaning of {material.lower()} removes contaminants like dust and adhesives, enhancing surface quality in industries such as {', '.join(material_config.get('industries', ['General Industry']))}.",
        "list": "- Dust and particulate matter\n- Adhesive residues\n- Surface oils",
        "table": material_config.get(
            "material_properties_table",
            "| Property | Value |\n|----------|-------|\n| Density | Unknown |\n| Hardness | Unknown |",
        ),
        "chart": '```json\n{"labels": ["Contaminant Removal"], "values": [0]}\n```',
    }
    try:
        content = call_ai_api(
            prompt,
            max_tokens=max_words * 5,
            retries=3,
            grok_api_key=api_keys["grok"],
            gemini_api_key=api_keys["gemini"],
        )
        if not content.strip():
            logger.warning(f"Empty content for {section_name}, using fallback")
            content = default_content.get(
                section_type,
                f"<!-- {section_name} (Empty API response, placeholder content) -->",
            )
            ai_score = None
        elif section_type in ["table", "chart"]:
            ai_score = None
        else:
            detector = AIDetector(
                content_type=f"{ARTICLE_CATEGORY.lower()} blog post",
                audience_level="general readership",
            )
            ai_score = detector.evaluate(content, api_keys=api_keys)
            logger.info(
                f"Initial AI Detection for {section_name}: {ai_score['percentage']}% - {ai_score['summary']}"
            )
            if (
                ai_score["percentage"] > AI_DETECTION_THRESHOLD
                and "failed" not in ai_score["summary"].lower()
                and ai_score["summary"] != "Invalid response format"
            ):
                logger.info(f"Regenerating {section_name} due to high AI likelihood")
                prompt += f"\n\nRegeneration: Reduce AI-like traits ({ai_score['summary']}). Use specific, technical details about {material} in {', '.join(material_config.get('industries', ['General Industry']))} industries. Add subtle imperfections, examples, and terminology."
                content = call_ai_api(
                    prompt,
                    max_tokens=max_words * 5,
                    retries=3,
                    grok_api_key=api_keys["grok"],
                    gemini_api_key=api_keys["gemini"],
                ) or default_content.get(
                    section_type,
                    f"<!-- {section_name} (Empty regeneration response, using fallback) -->",
                )
                ai_score = (
                    detector.evaluate(content, api_keys=api_keys)
                    if content.strip()
                    else {"percentage": 0, "summary": "Empty regeneration response"}
                )
                logger.info(
                    f"Post-regeneration AI Detection for {section_name}: {ai_score['percentage']}% - {ai_score['summary']}"
                )

        write_cache(cache_file, {"content": content, "ai_score": ai_score})
        return content, ai_score
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to generate section {section_name}: {e}")
        return default_content.get(
            section_type, f"<!-- {section_name} (Failed to generate: {e}) -->"
        ), None


def generate_sections(
    material,
    material_config,
    article_config,
    sections_config,
    author_metadata,
    cache_dir,
    api_keys,
    force_regenerate=False,
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

    Returns:
        tuple: (list of section contents, dict of AI scores excluding table/chart)
    """
    logger = get_logger("content_generator")
    sections, ai_scores = [], {}
    for section_name in article_config["section_order"]:
        section_def = sections_config["sections"].get(section_name)
        if not section_def:
            logger.warning(f"Section {section_name} not found in sections_config")
            sections.append(f"<!-- {section_name} (Not found in sections_config) -->")
            continue
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
        )
        sections.append(content)
        if ai_score is not None:
            ai_scores[section_name] = ai_score
    return sections, ai_scores
