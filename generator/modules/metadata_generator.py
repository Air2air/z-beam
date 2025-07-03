# generator/modules/metadata_generator.py

"""
Module for generating article metadata (YAML frontmatter).
"""

import datetime
import json
import re
from typing import List, Dict, Any

from generator.modules.logger import get_logger

logger = get_logger("metadata_generator")


def generate_metadata(
    material: str,
    material_config: Dict[str, Any],
    article_config: Dict[str, Any],
    author_metadata: Dict[str, Any],
    ai_scores: Dict[str, float],
    article_category: str,
) -> str:
    """
    Generates the YAML frontmatter string for the article.

    Args:
        material (str): The primary material of the article.
        material_config (Dict[str, Any]): Researched data about the material.
        article_config (Dict[str, Any]): General article configuration (author, temperature, etc.).
        author_metadata (Dict[str, Any]): Full metadata for the author.
        ai_scores (Dict[str, float]): Dictionary of AI detection scores for each section.
        article_category (str): The category of the article.

    Returns:
        str: The YAML frontmatter string.
    """
    title = f"Laser Cleaning {material}"

    # Use single author from config
    author_file = article_config.get("author")
    author_info = author_metadata.get(author_file, {})
    author_full_name = author_info.get("name", author_file)

    date_generated = datetime.datetime.now().strftime("%Y-%m-%d")

    # Construct a description snippet from the material_description, or a fallback
    description_snippet = material_config.get("material_details", {}).get(
        "material_description", ""
    )
    if description_snippet:
        # Clean up markdown/html tags and truncate for description
        description_snippet = re.sub(
            r"<[^>]*>", "", description_snippet
        )  # Remove HTML tags
        description_snippet = re.sub(
            r"#+\s*", "", description_snippet
        )  # Remove markdown headings
        description_snippet = description_snippet.strip().split("\n")[
            0
        ]  # Take only the first effective line
        description_snippet = (
            description_snippet[:160] + "..."
            if len(description_snippet) > 160
            else description_snippet.strip()
        )
    else:
        description_snippet = f"A comprehensive guide to laser cleaning {material}."

    # Combine categories and material for tags, ensure uniqueness and sort
    tags = [article_category.lower().replace(" ", "-")]
    if material:
        tags.append(material.lower().replace(" ", "-"))
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
    tags = sorted(list(set(tags)))  # Unique and sorted

    # Assemble metadata dictionary with robust error handling
    def safe_get(d, key, default=None, warn_if_missing=False, context=""):
        value = d.get(key, default)
        if value == default and warn_if_missing:
            logger.warning(
                f"Missing key '{key}' in {context or 'dict'}, using default: {default}"
            )
        return value

    metadata_dict = {
        "title": title,
        "nameShort": material,
        "description": description_snippet,
        "publishedAt": date_generated,
        "authorName": safe_get(author_info, "name", author_file, True, "author_info"),
        "authorTitle": safe_get(author_info, "title", "", True, "author_info"),
        "authorBio": safe_get(author_info, "bio", "", True, "author_info"),
        "tags": tags,
        "keywords": safe_get(material_config, "keywords", [], True, "material_config"),
        "image": safe_get(material_config, "image", "", True, "material_config"),
        "atomicNumber": safe_get(
            material_config, "atomicNumber", None, True, "material_config"
        ),
        "chemicalSymbol": safe_get(
            material_config, "chemicalSymbol", None, True, "material_config"
        ),
        "materialType": safe_get(
            material_config, "materialType", "N/A", True, "material_config"
        ),
        "metalClass": safe_get(
            material_config, "metalClass", "N/A", True, "material_config"
        ),
        "crystalStructure": safe_get(
            material_config, "crystalStructure", "", True, "material_config"
        ),
        "primaryApplication": safe_get(
            material_config, "primaryApplication", "N/A", True, "material_config"
        ),
        # Existing fields for compatibility
        "temperature": safe_get(
            article_config, "temperature", None, True, "article_config"
        ),
        "modelUsed": safe_get(article_config, "model", None, True, "article_config"),
        "aiScores": ai_scores,
        "materialDetails": safe_get(
            material_config, "material_details", {}, True, "material_config"
        ),
        "industries": safe_get(
            material_config, "industries", [], True, "material_config"
        ),
    }

    # Format into YAML string
    yaml_lines = ["---"]
    for key, value in metadata_dict.items():
        if isinstance(value, list):
            yaml_lines.append(f"{key}:")
            for item in value:
                if isinstance(item, dict):
                    yaml_lines.append(f"  - {json.dumps(item)}")
                else:
                    yaml_lines.append(f"  - {json.dumps(item)}")
        elif isinstance(value, dict):
            yaml_lines.append(f"{key}:")
            for sub_key, sub_value in value.items():
                if isinstance(sub_value, list):
                    yaml_lines.append(f"  {sub_key}:")
                    for item in sub_value:
                        yaml_lines.append(f"    - {json.dumps(item)}")
                elif isinstance(sub_value, dict):
                    yaml_lines.append(f"  {sub_key}: {json.dumps(sub_value)}")
                else:
                    yaml_lines.append(f"  {sub_key}: {json.dumps(sub_value)}")
        else:
            yaml_lines.append(f"{key}: {json.dumps(value)}")
    yaml_lines.append("---")
    yaml_frontmatter = "\n".join(yaml_lines)

    logger.debug(f"Generated YAML Frontmatter:\n{yaml_frontmatter}")
    return yaml_frontmatter


def assemble_page(yaml_frontmatter: str, mdx_content_sections: List[str]) -> str:
    """
    Assembles the complete MDX page with frontmatter and content.

    Args:
        yaml_frontmatter (str): The generated YAML frontmatter string.
        mdx_content_sections (List[str]): A list of MDX content strings for each section.

    Returns:
        str: The complete MDX page content.
    """
    return f"{yaml_frontmatter}\n\n" + "\n\n".join(mdx_content_sections)
