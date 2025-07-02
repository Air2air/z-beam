# generator/constants.py

"""
Configuration for Z-Beam Page Generator.
Defines API, AI detection, and static directory settings.
"""

import os
# No longer importing datetime here, as its direct use was moved to content_generator.py

# Determine the project root dynamically.
# If constants.py is at `project_root/generator/constants.py`,
# then going up one level from os.path.dirname(__file__) gets to project_root.
GENERATOR_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(GENERATOR_DIR)

# --- AI Provider Configuration (Constants) ---
DEFAULT_XAI_MODEL = "grok-3-mini"
DEFAULT_GEMINI_MODEL = "gemini-1.5-flash"

XAI_API_URL = "https://api.x.ai/v1/chat/completions"
GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)

# --- AI Detection Configuration (Constants) ---
# The prompt template file 'ai_detection_prompt.txt' must exist in SECTIONS_DIR.
AI_DETECTION_FALLBACK_PROMPTS = [
    "Evaluate text for AI traits. Return percentage (0-100) and summary (1-2 sentences): {content}",
    "Analyze text for AI-generated style. Return percentage (0-100) and summary (string): {content}",
]
AI_DETECTION_THRESHOLD = 60

# --- Directory Configuration (Constants) ---
AUTHOR_DIR = os.path.join(GENERATOR_DIR, "authors")
SECTIONS_DIR = os.path.join(
    GENERATOR_DIR, "sections"
)  # This is the directory for prompt files
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "app", "(materials)", "posts")

# --- Dynamic Loading of Section Prompts ---
# This part scans the 'sections' directory and builds the BASE_SECTIONS_CONFIG dynamically.
# The 'type' is inferred or set to a default 'text'.
DYNAMIC_SECTIONS_CONFIG_CONTENT = {}
for filename in os.listdir(SECTIONS_DIR):
    if filename.endswith(".txt"):
        section_key = filename.replace(".txt", "")
        # Infer type based on common section names. Add more rules if needed.
        inferred_type = "text"
        if section_key == "introduction":
            inferred_type = "paragraph"
        elif section_key == "contaminants":
            inferred_type = "list"
        elif section_key == "table":
            inferred_type = "table"
        elif section_key == "chart":
            inferred_type = "chart"
        elif (
            section_key == "comparison"
        ):  # Assuming 'comparison.txt' is for a comparison_chart
            inferred_type = "comparison_chart"
        # Add other type inferences here if you have specific types like 'image', 'code', etc.

        # Add to the dynamic config. Material research and AI detection prompts are
        # typically retrieved by name directly, not iterated over as article sections.
        DYNAMIC_SECTIONS_CONFIG_CONTENT[section_key] = {
            "prompt_file": filename,
            "type": inferred_type,
        }

# BASE_SECTIONS_CONFIG now directly uses the dynamically discovered sections.
# This assumes any .txt file in SECTIONS_DIR is a potential section.
BASE_SECTIONS_CONFIG = {"sections": DYNAMIC_SECTIONS_CONFIG_CONTENT}


# --- BASE_ARTICLE_CONFIG ---
# This remains manually defined as it controls the structure and ordering of the article.
# The 'section_order' list defines WHICH of the dynamically found sections will be used
# in the article, and in what sequence.
BASE_ARTICLE_CONFIG = {
    "authors": [],
    "voice": "professional",
    "authority": "expert",
    "content_length": {
        # These keys should match the 'section_order' names below
        "introduction": "150-200",
        "contaminants": "70-100",
        "table": "60-90",
        "chart": "60-90",
        "comparison": "60-90",  # Key for 'comparison.txt'
        "substrates": "100-150",
    },
    "variety": "Technical details and industry applications with subtle imperfections, specific examples, and technical terminology to ensure human-like style.",
    "articleType": "Material",
    "articleCategory": "Material",
    # This order determines the final structure of the generated article.
    # YOU MUST MANUALLY UPDATE THIS LIST if you add new sections you want in the article
    # or want to change the order. The names must match the filenames (without .txt).
    "section_order": [
        "introduction",
        "contaminants",
        "table",
        "chart",
        "comparison",  # Matches the filename 'comparison.txt'
        "substrates",
    ],
}
