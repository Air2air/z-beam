import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MATERIAL = "Tungsten Carbide"
FILE_NAME = "laser_cleaning_Tungsten.mdx"
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
