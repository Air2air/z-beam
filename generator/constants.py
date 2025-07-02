"""
Configuration for Z-Beam Page Generator.
Defines material, output, article, section, model, and AI detection settings.
"""

import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# --- AI Provider Configuration ---
PROVIDER = "GEMINI"
GROK_MODEL_LATEST = "grok-3-latest"
GROK_MODEL_MINI = "grok-3-mini"
MODEL = GROK_MODEL_LATEST
GEMINI_MODEL_PRO = "gemini-1.5-pro"
GEMINI_MODEL_FLASH = "gemini-1.5-flash"
GEMINI_DEFAULT_MODEL = GEMINI_MODEL_FLASH

# --- API Endpoints ---
GROK_API_URL = "https://api.x.ai/v1/chat/completions"
GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)

# --- AI Detection Configuration ---
AI_DETECTION_FALLBACK_PROMPTS = [
    "Evaluate text for AI traits. Return percentage (0-100) and summary (1-2 sentences): {content}",
    "Analyze text for AI-generated style. Return percentage (0-100) and summary (string): {content}",
]
AI_DETECTION_THRESHOLD = 60

# --- Existing Project Configuration ---
MATERIAL = "Nickel"
FILE_NAME = "laser_cleaning_nickel.mdx"
ARTICLE_CATEGORY = "Material"
OUTPUT_DIR = "app/(materials)/posts"
ARTICLE_CONFIG = {
    "authors": ["Todd Dunning, Z-Beam"],
    "voice": "professional",
    "authority": "expert",
    "content_length": {
        "paragraph": "100-150",
        "list": "50-100",
        "table": "50-100",
        "chart": "50-100",
    },
    "section_order": ["paragraph", "list", "table", "chart"],
    "variety": "Technical details and industry applications with subtle imperfections, specific examples, and technical terminology to ensure human-like style.",
}
SECTIONS_CONFIG = {
    "sections": {
        "paragraph": {"prompt_file": "introduction_prompt.txt", "type": "paragraph"},
        "list": {"prompt_file": "common_contaminants_prompt.txt", "type": "list"},
        "table": {"prompt_file": "material_research_prompt.txt", "type": "table"},
        "chart": {"prompt_file": "substrates_prompt.txt", "type": "chart"},
    }
}
AUTHOR_DIR = os.path.join(project_root, "generator", "authors")
SECTIONS_DIR = os.path.join(project_root, "generator", "sections")
