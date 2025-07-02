"""
Generates YAML metadata and assembles MDX page content.
"""

import yaml
from datetime import datetime
from generator.constants import ARTICLE_CATEGORY
from generator.modules.logger import get_logger


def generate_metadata(
    material, material_config, article_config, author_metadata, ai_scores
):
    """Generate YAML metadata.

    Args:
        material (str): Material name.
        material_config (dict): Material properties.
        article_config (dict): Article configuration.
        author_metadata (dict): Author metadata.
        ai_scores (dict): AI detection scores for non-table/chart sections.

    Returns:
        str: Formatted YAML metadata.
    """
    logger = get_logger("metadata_generator")
    material_slug = material.lower().replace(" ", "_")
    author_bios = [
        author_metadata[author]["bio"]
        for author in article_config["authors"]
        if author in author_metadata
        or logger.warning(f"No metadata found for {author}, skipping bio")
    ]
    industries = material_config.get("industries", ["General Industry"])
    is_material = ARTICLE_CATEGORY == "Material"
    title = f"Laser Cleaning {material}: {'Optimizing Performance and Safety' if is_material else 'Techniques and Benefits'}"
    description = (
        f"Explore how laser cleaning removes contaminants from {material.lower()}, enhancing performance and safety in {', '.join(industries)} industries."
        if is_material
        else f"Discover how laser cleaning enhances {material.lower()} applications in {', '.join(industries)} industries, focusing on techniques, benefits, and use cases."
    )
    image = f"/images/{'Material' if is_material else 'Application'}/{'material' if is_material else ''}_{material_slug}{'' if is_material else '_application'}.jpg"

    metadata = {
        "title": title,
        "nameShort": material,
        "description": description,
        "publishedAt": datetime.now().strftime("%Y-%m-%d"),
        "authors": article_config["authors"],
        "author_bios": author_bios,
        "tags": [material, "Laser Cleaning"] + industries + ["Surface Preparation"],
        "keywords": f"{material.lower()} cleaning, laser ablation, surface preparation, {', '.join(f'{i.lower()} {ARTICLE_CATEGORY.lower()}s' for i in industries)}, contamination removal",
        "image": image,
        "atomicNumber": None,
        "chemicalSymbol": None,
        "materialType": material_config.get("material_type", "Unknown"),
        "metalClass": material_config.get("metal_class", "Unknown"),
        "crystalStructure": "Complex/Mixed",
        "primaryApplication": material_config.get("primary_application", "Unknown"),
        "section_ai_scores": {
            name: {"percentage": score["percentage"], "summary": score["summary"]}
            for name, score in ai_scores.items()
            if score is not None
        },
    }
    return f"---\n{yaml.dump(metadata, sort_keys=False)}\n---"


def assemble_page(metadata, sections):
    """Combine metadata and sections into MDX content.

    Args:
        metadata (str): YAML metadata.
        sections (list): List of section contents.

    Returns:
        str: Complete MDX content.
    """
    return f"{metadata}\n\n" + "\n\n".join(sections)
