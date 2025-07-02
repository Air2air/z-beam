# run.py

"""
Entry point for the Z-Beam Page Generator.
"""

import argparse
from generator.modules.page_generator import main
# We don't need to import GEMINI_MODEL_FLASH or GROK_MODEL_LATEST here
# because MODEL_FOR_ARTICLE is now a direct string literal.

# --- Article-specific configuration (these can be made dynamic via CLI args too, if needed) ---
MATERIAL = "Bronze"
FILE_NAME = "laser_cleaning_bronze.mdx"
PROVIDER = "GEMINI"  # GROK, GEMINI
ARTICLE_CATEGORY = "Material"  # Defined and will be passed to main()

# These parameters are now explicitly required by page_generator.main
# and will be used to build the article_config for this specific generation.
# IMPORTANT: AUTHORS_FOR_ARTICLE MUST be a list of strings. Each string must EXACTLY match the 'name'
# field in the YAML frontmatter of your author .mdx files (e.g., 'Todd Dunning').
AUTHORS_FOR_ARTICLE = [
    "Todd Dunning",
    "Dr. Evelyn Reed",
    "Mark Johnson",
]  # <--- CHANGED THIS LINE!
VOICE_FOR_ARTICLE = "expert"
AUTHORITY_FOR_ARTICLE = "high"
CONTENT_LENGTH_FOR_ARTICLE = {  # Specific content lengths for this article
    "paragraph": "200-250",
    "list": "80-120",
    "table": "70-100",
    "chart": "70-100",
    "comparison_chart": "70-100",
}
VARIETY_FOR_ARTICLE = "Focus on advanced techniques and industrial case studies, using precise engineering terminology."
# Optional: specific model override for this run
MODEL_FOR_ARTICLE = "gemini-1.5-flash"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate MDX files for laser cleaning articles."
    )
    parser.add_argument(
        "--force", action="store_true", help="Force regeneration by ignoring cache."
    )

    args = parser.parse_args()

    # Call the main function from page_generator, passing all required arguments
    main(
        material=MATERIAL,
        article_category=ARTICLE_CATEGORY,
        file_name=FILE_NAME,
        provider=PROVIDER,
        authors=AUTHORS_FOR_ARTICLE,
        voice=VOICE_FOR_ARTICLE,
        authority=AUTHORITY_FOR_ARTICLE,
        content_length=CONTENT_LENGTH_FOR_ARTICLE,
        variety=VARIETY_FOR_ARTICLE,
        force_regenerate=args.force,
        model=MODEL_FOR_ARTICLE,
    )
