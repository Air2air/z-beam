import os
import yaml
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

# Get the path to the directory containing this script
script_dir = os.path.dirname(__file__)
# Construct the path to the project root (assuming .env.local is in root)
project_root = os.path.join(script_dir, "../")  # generator/ is in root
# Load environment variables from .env.local
load_dotenv(dotenv_path=os.path.join(project_root, ".env.local"))

# --- Debug API key ---
GROK_API_KEY = os.getenv("XAI_API_KEY")
print(
    f"XAI_API_KEY loaded: {'*' * (len(GROK_API_KEY) - 4) + GROK_API_KEY[-4:] if GROK_API_KEY else 'None'}"
)
if not GROK_API_KEY:
    raise ValueError("XAI_API_KEY environment variable not set or empty")
# --- End debugging block ---

# Configuration: Only MATERIAL needs manual input per run
MATERIAL = "Titanium"  # Change this for each run (e.g., "Cobalt Chromium", "Aluminum")

# Output directory
OUTPUT_DIR = os.path.join(project_root, "app/(materials)/posts")

# Directories
PROMPT_DIR = os.path.join(script_dir, "prompts")
CONFIG_DIR = os.path.join(script_dir, "configs")
AUTHOR_DIR = os.path.join(script_dir, "authors")

# xAI API Configuration
GROK_API_URL = "https://api.x.ai/v1/chat/completions"
GROK_API_KEY = os.getenv("XAI_API_KEY")
if not GROK_API_KEY:
    raise ValueError("XAI_API_KEY environment variable not set")


# Helper Functions
def load_file(file_path):
    """Load a file from the given path."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        raise FileNotFoundError(f"File {file_path} not found")
    except Exception as e:
        raise Exception(f"Failed to read file {file_path}: {e}")


def load_prompt(file_name):
    """Load a prompt from the prompts directory."""
    return load_file(os.path.join(PROMPT_DIR, file_name))


def load_config(file_name):
    """Load and parse a config JSON from the configs directory."""
    config_str = load_file(os.path.join(CONFIG_DIR, file_name))
    try:
        return json.loads(config_str)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse config JSON {file_name}: {e}")


def load_author_metadata():
    """Load and parse author metadata JSON from the authors directory."""
    metadata_str = load_file(os.path.join(AUTHOR_DIR, "author_metadata.txt"))
    try:
        metadata = json.loads(metadata_str)
        if "authors" not in metadata:
            raise ValueError("Author metadata must contain an 'authors' key")
        for author, data in metadata["authors"].items():
            if "bio" not in data:
                raise ValueError(f"Missing bio for author {author}")
        return metadata["authors"]
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse author metadata JSON: {e}")


def load_author_sample(author):
    """Load native and rewritten samples for an author."""
    file_name = author.lower().replace(" ", "_").replace(",", "") + "_sample.txt"
    file_path = os.path.join(AUTHOR_DIR, file_name)
    content = load_file(file_path)
    try:
        # Split on '---' delimiter
        native, rewritten = content.split("---")
        return native.strip(), rewritten.strip()
    except ValueError:
        raise ValueError(
            f"Author sample file {file_path} must contain 'Native Grok Output' and 'Rewritten Sample' separated by '---'"
        )


def call_grok(prompt, max_tokens=1000, temperature=0.7):
    """Call the xAI API with the given prompt."""
    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "grok-3-latest",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False,
    }
    try:
        response = requests.post(GROK_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.RequestException as e:
        print(f"API call failed: {e}")
        print(
            f"Status code: {response.status_code if 'response' in locals() else 'N/A'}"
        )
        print(f"Response text: {response.text if 'response' in locals() else 'N/A'}")
        raise


def research_material_config(material, variety):
    """Generate material configuration using the research prompt."""
    prompt = load_prompt("material_research_prompt.txt").format(material=material)
    prompt += f"\n\n{variety}"
    response = call_grok(prompt, max_tokens=500)
    try:
        json_str = response.split("```json\n")[1].split("\n```")[0]
        return json.loads(json_str)
    except (IndexError, json.JSONDecodeError) as e:
        raise Exception(f"Failed to parse material config JSON: {e}")


# Metadata Generator
def generate_metadata(material, material_config, article_config, author_metadata):
    """Generate YAML metadata for the MDX file, including author bios."""
    material_slug = material.lower().replace(" ", "_")
    # Collect bios for selected authors
    author_bios = []
    for author in article_config["authors"]:
        if author in author_metadata:
            author_bios.append(author_metadata[author]["bio"])
        else:
            print(f"Warning: No metadata found for author {author}, skipping bio")
    metadata = {
        "title": f"Laser Cleaning {material}: Optimizing Performance and Safety",
        "nameShort": material,
        "description": f"Explore how laser cleaning removes contaminants from {material.lower()}, enhancing performance and safety in {', '.join(material_config['industries'])} industries. Covers contaminants, substrates, outcomes, challenges, and costs.",
        "publishedAt": datetime.now().strftime("%Y-%m-%d"),
        "authors": article_config["authors"],
        "author_bios": author_bios,
        "tags": [material, "Laser Cleaning"]
        + material_config["industries"]
        + ["Surface Preparation"],
        "keywords": f"{material.lower()} cleaning, laser ablation, surface preparation, {', '.join([f'{i.lower()} materials' for i in material_config['industries']])}, contamination removal",
        "image": f"/images/Material/material_{material_slug}.jpg",
        "atomicNumber": None,
        "chemicalSymbol": None,
        "materialType": material_config["material_type"],
        "metalClass": material_config["metal_class"],
        "crystalStructure": "Complex/Mixed",
        "primaryApplication": material_config["primary_application"],
    }
    return f"---\n{yaml.dump(metadata, sort_keys=False)}\n---"


# Section Generators
def generate_section(
    material, material_config, section, article_config, sections_config, author_metadata
):
    """Generate a section based on its configuration."""
    section_def = sections_config["sections"].get(section)
    if not section_def:
        raise ValueError(f"Section {section} not found in sections_config")

    prompt_file = section_def["prompt_file"]
    prompt = load_prompt(prompt_file)

    # Format prompt with material and other variables
    format_vars = {
        "material": material,
        "material_slug": material.lower().replace(" ", "-"),
        "industries": ", ".join(material_config["industries"])
        if "industries" in material_config
        else "",
    }
    try:
        prompt = prompt.format(**format_vars)
    except KeyError as e:
        print(
            f"Warning: Prompt {prompt_file} has undefined variable {e}, proceeding with partial formatting"
        )

    # Append author samples for selected authors
    author_prompt = ""
    for author in article_config["authors"]:
        try:
            native, rewritten = load_author_sample(author)
            author_prompt += f"\n\nTransform the style of this native Grok output:\n{native}\n\nto match this rewritten sample by {author}:\n{rewritten}"
        except FileNotFoundError:
            print(
                f"Warning: No sample file found for author {author}, skipping samples"
            )
        except ValueError as e:
            print(f"Warning: {e}, skipping samples for {author}")

    # Append configuration instructions
    prompt += f"\n\nWrite in a {article_config['voice']} voice with {article_config['authority']} authority. Target {article_config['content_length'][section]} words. {article_config['variety']}{author_prompt}"

    # Set max_tokens based on content_length
    try:
        word_range = article_config["content_length"][section]
        max_words = (
            int(word_range.split("-")[-1]) if "-" in word_range else int(word_range)
        )
        max_tokens = max_words * 2  # Approximate: 1 word ~ 2 tokens
    except (ValueError, KeyError):
        max_tokens = 600  # Default

    return call_grok(prompt, max_tokens=max_tokens)


# Section Dispatcher
def generate_sections(
    material, material_config, article_config, sections_config, author_metadata
):
    """Generate sections in the order specified by article_config."""
    sections = []
    for section in article_config["section_order"]:
        sections.append(
            generate_section(
                material,
                material_config,
                section,
                article_config,
                sections_config,
                author_metadata,
            )
        )
    return sections


# Section Assembler
def assemble_page(metadata, sections):
    """Assemble metadata and sections into a single MDX file."""
    return f"{metadata}\n\n" + "\n\n".join(sections)


# Main Execution
def main():
    # Ensure directories exist
    for directory in [PROMPT_DIR, CONFIG_DIR, AUTHOR_DIR]:
        if not os.path.exists(directory):
            raise FileNotFoundError(f"Directory {directory} not found")

    # Load configurations
    article_config = load_config("article_config_prompt.txt")
    sections_config = load_config("sections_config.txt")
    author_metadata = load_author_metadata()

    # Validate article_config
    required_fields = [
        "authors",
        "voice",
        "authority",
        "content_length",
        "section_order",
        "variety",
    ]
    for field in required_fields:
        if field not in article_config:
            raise ValueError(f"Missing required article_config field: {field}")

    # Validate authors against author_metadata
    for author in article_config["authors"]:
        if author not in author_metadata:
            raise ValueError(f"Author {author} not found in author_metadata")

    # Validate section_order against sections_config
    available_sections = set(sections_config["sections"].keys())
    if not all(
        section in available_sections for section in article_config["section_order"]
    ):
        raise ValueError(
            f"Invalid section in section_order: {article_config['section_order']}"
        )

    # Validate content_length sections
    for section in article_config["section_order"]:
        if section not in article_config["content_length"]:
            raise ValueError(f"Missing content_length for section: {section}")

    # Validate author sample files
    for author in article_config["authors"]:
        file_name = author.lower().replace(" ", "_").replace(",", "") + "_sample.txt"
        if not os.path.exists(os.path.join(AUTHOR_DIR, file_name)):
            raise FileNotFoundError(
                f"Sample file for author {author} not found: {file_name}"
            )

    # Research material configuration
    material_config = research_material_config(MATERIAL, article_config["variety"])

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Generate components
    metadata = generate_metadata(
        MATERIAL, material_config, article_config, author_metadata
    )
    sections = generate_sections(
        MATERIAL, material_config, article_config, sections_config, author_metadata
    )

    # Assemble and save page
    page_content = assemble_page(metadata, sections)
    output_path = os.path.join(OUTPUT_DIR, f"{MATERIAL.lower().replace(' ', '_')}.mdx")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(page_content)
    print(f"MDX file generated at: {output_path}")


if __name__ == "__main__":
    main()
