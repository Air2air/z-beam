# generator/constants.py

"""
Configuration for Z-Beam Page Generator.
Defines API, AI detection, and static directory settings.
"""

import os

# Determine the project root dynamically.
# If constants.py is at `project_root/generator/constants.py`,
# then going up one level from os.path.dirname(__file__) gets to project_root.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# --- AI Provider Configuration (Constants) ---
# These are models and URLs, which are truly constant for the API providers.
GROK_MODEL_LATEST = "grok-3-latest"
GROK_MODEL_MINI = "grok-3-mini"
GEMINI_MODEL_PRO = "gemini-1.5-pro"
GEMINI_MODEL_FLASH = "gemini-1.5-flash"

GROK_API_URL = "https://api.x.ai/v1/chat/completions"
GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)

# --- AI Detection Configuration (Constants) ---
AI_DETECTION_FALLBACK_PROMPTS = [
    "Evaluate text for AI traits. Return percentage (0-100) and summary (1-2 sentences): {content}",
    "Analyze text for AI-generated style. Return percentage (0-100) and summary (string): {content}",
]
AI_DETECTION_THRESHOLD = 60  # Keep this threshold as a constant

# --- Directory Configuration (Constants) ---
# These are constant paths relative to the project root.
AUTHOR_DIR = os.path.join(project_root, "generator", "authors")
SECTIONS_DIR = os.path.join(project_root, "generator", "sections")
OUTPUT_DIR = os.path.join(
    project_root, "app", "(materials)", "posts"
)  # Full path for clarity

# --- SECTION AND ARTICLE BASE CONFIGURATION ---
# These define the structure and default behaviors of sections and articles
# but values like 'authors', 'voice', 'content_length', 'variety' for specific
# articles will now come from the main() function's article_config parameter.
# The 'articleType' here is a default that will be *overridden* by main().
# It's okay to keep the structure, as it's the base template.
# Only the fields that are truly dynamic per generation run should be passed.
# I've made `ARTICLE_CONFIG` and `SECTIONS_CONFIG` into base templates.

BASE_ARTICLE_CONFIG = {
    # These values serve as defaults/templates.
    "authors": [],  # Will be populated by main()
    "voice": "professional",  # Default, can be overridden by main()
    "authority": "expert",  # Default, can be overridden by main()
    "content_length": {  # Default word count ranges
        "paragraph": "100-150",
        "list": "50-100",
        "table": "50-100",
        "chart": "50-100",
        "comparison_chart": "50-100",
    },
    "variety": "Technical details and industry applications with subtle imperfections, specific examples, and technical terminology to ensure human-like style.",
    "articleType": "Material",  # This is a base default, expected to be overridden
    "articleCategory": "Material",  # This is a base default, expected to be overridden
    # *** IMPORTANT: ADDED section_order HERE ***
    "section_order": [
        "paragraph",
        "list",
        "table",
        "chart",
        "comparison_chart",
        # Add other section names here as they are defined in BASE_SECTIONS_CONFIG
        # and as you want them to appear in the generated article.
    ],
}

# The sections definition, including prompt files and types, is a constant structure.
BASE_SECTIONS_CONFIG = {
    "sections": {
        "paragraph": {"prompt_file": "introduction.txt", "type": "paragraph"},
        "list": {"prompt_file": "contaminants.txt", "type": "list"},
        "table": {"prompt_file": "table.txt", "type": "table"},
        "chart": {"prompt_file": "chart.txt", "type": "chart"},
        "comparison_chart": {
            "prompt_file": "comparison.txt",
            "type": "comparison_chart",
        },
    }
}
