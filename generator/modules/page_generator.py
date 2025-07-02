"""
Orchestrates MDX file generation for laser cleaning articles.
"""

import os
from dotenv import load_dotenv
from generator.constants import (
    AUTHOR_DIR,
    MATERIAL,
    FILE_NAME,
    ARTICLE_CATEGORY,
    OUTPUT_DIR,
    ARTICLE_CONFIG,
    SECTIONS_CONFIG,
    SECTIONS_DIR,
    PROVIDER,
)
from generator.modules.author_loader import load_author_metadata
from generator.modules.content_generator import (
    research_material_config,
    generate_sections,
)
from generator.modules.metadata_generator import generate_metadata, assemble_page
from generator.modules.file_handler import write_file, ensure_directory_exists
from generator.modules.logger import get_logger


def main(force_regenerate=False):
    """Orchestrate MDX file generation.

    Args:
        force_regenerate (bool): If True, ignore cache and regenerate content.
    """
    logger = get_logger("page_generator")
    # Load environment variables
    script_dir = os.path.dirname(__file__)
    project_root = os.path.join(script_dir, "../../")
    load_dotenv(os.path.join(project_root, ".env.local"))
    GROK_API_KEY = os.getenv("XAI_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if PROVIDER == "GROK" and not GROK_API_KEY:
        raise ValueError("XAI_API_KEY not set")
    if PROVIDER == "GEMINI" and not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not set")
    api_keys = {"grok": GROK_API_KEY, "gemini": GEMINI_API_KEY}
    CACHE_DIR = os.path.join(project_root, "generator", "cache")

    # Validate directories
    for directory in [SECTIONS_DIR, AUTHOR_DIR, CACHE_DIR]:
        ensure_directory_exists(directory)

    # Validate article configuration
    article_config = ARTICLE_CONFIG
    sections_config = SECTIONS_CONFIG
    required_fields = [
        "authors",
        "voice",
        "authority",
        "content_length",
        "section_order",
        "variety",
    ]
    for field in required_fields:
        if not article_config.get(field):
            raise ValueError(f"Missing required article_config field: {field}")

    # Load author metadata
    author_metadata = load_author_metadata(AUTHOR_DIR)
    for author in article_config["authors"]:
        if author not in author_metadata:
            raise ValueError(f"Author {author} not found in author_metadata")

    # Generate material configuration
    material_config = research_material_config(
        MATERIAL, article_config["variety"], CACHE_DIR, api_keys, force_regenerate
    )
    required_keys = [
        "industries",
        "material_type",
        "metal_class",
        "primary_application",
    ]
    if not all(key in material_config for key in required_keys):
        logger.warning(f"material_config missing required keys: {material_config}")
        material_config = {
            "industries": ["General Industry"],
            "material_type": "Unknown",
            "metal_class": "Unknown",
            "primary_application": "Unknown",
        }
    logger.info(f"Material config: {material_config}")

    # Generate sections
    sections, ai_scores = generate_sections(
        MATERIAL,
        material_config,
        article_config,
        sections_config,
        author_metadata,
        CACHE_DIR,
        api_keys,
        force_regenerate,
    )

    # Generate metadata and assemble page
    metadata = generate_metadata(
        MATERIAL, material_config, article_config, author_metadata, ai_scores
    )
    page_content = assemble_page(metadata, sections)

    # Write output
    ensure_directory_exists(OUTPUT_DIR)
    output_path = os.path.join(OUTPUT_DIR, FILE_NAME)
    write_file(output_path, page_content)
    logger.info(f"MDX file generated at: {output_path}")


if __name__ == "__main__":
    main()
