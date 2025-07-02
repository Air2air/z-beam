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
        article_config (Dict[str, Any]): General article configuration (authors, voice, etc.).
        author_metadata (Dict[str, Any]): Full metadata for all authors.
        ai_scores (Dict[str, float]): Dictionary of AI detection scores for each section.
        article_category (str): The category of the article.

    Returns:
        str: The YAML frontmatter string.
    """
    title = f"Laser Cleaning {material}"

    authors_list = article_config.get("authors", [])
    author_full_names = [
        author_metadata.get(author_alias, {}).get("name", author_alias)
        for author_alias in authors_list
    ]

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

    # Assemble metadata dictionary
    metadata_dict = {
        "title": title,
        "authors": author_full_names,
        "date": date_generated,
        "description": description_snippet,
        "tags": tags,
        "material": material,
        "articleCategory": article_category,
        "voice": article_config.get("voice"),
        "authority": article_config.get("authority"),
        "contentLengthConfig": article_config.get("content_length"),
        "variety": article_config.get("variety"),
        "modelUsed": article_config.get("model"),
        "aiScores": ai_scores,
        "materialDetails": material_config.get("material_details", {}),
        "materialType": material_config.get("materialType", "N/A"),
        "metalClass": material_config.get("metalClass", "N/A"),
        "primaryApplication": material_config.get("primaryApplication", "N/A"),
        "atomicNumber": material_config.get("atomicNumber", "N/A"),
        "chemicalSymbol": material_config.get("chemicalSymbol", "N/A"),
        "industries": material_config.get("industries", []),
        # Add any other relevant fields from article_config or material_config here
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
