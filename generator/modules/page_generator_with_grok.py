"""
# Z-Beam Page Generator: Architectural Overview

Generates MDX files for laser cleaning articles with YAML metadata and sections (Paragraph, List, Table, Chart) using Grok API. Evaluates AI likelihood for Paragraph and List, regenerating if >60%. Skips AI detection for Table and Chart. Modular with cached material/section data and author metadata.

## Structure
- **Root (`z-beam-test-push/`)**: `.env.local` (XAI_API_KEY), `run.py`.
- **generator/**:
  - `__init__.py`: Package definition.
  - `constants.py`: Configures MATERIAL, FILE_NAME, ARTICLE_CATEGORY, OUTPUT_DIR, ARTICLE_CONFIG, SECTIONS_CONFIG, AUTHOR_DIR, SECTIONS_DIR, MODEL.
  - `cache/`: `<material>.json`, `<material>_<section>.json`.
  - `authors/`: JSON metadata, samples (e.g., `author_1.txt`).
  - `sections/`: Prompts (`introduction_prompt.txt`, etc.).
  - `modules/`: `page_generator_with_grok.py`, `ai_detector.py`, `ai_detection_prompt.txt`.

## Execution
1. Initialize: Load API key, configs.
2. Validate: Check directories, metadata.
3. Material Config: Load/cache properties.
4. Generate Sections: Create content, evaluate AI score (Paragraph, List only), regenerate if needed.
5. Assemble: Combine metadata, sections into MDX.

## Key Functions
- `load_file`, `parse_json_response`, `format_prompt`: Handle files, JSON, prompts.
- `research_material_config`, `generate_section`, `generate_sections`: Generate content.
- `generate_metadata`, `assemble_page`, `main`: Orchestrate output.

## Error Handling
- Caches data to reduce API calls.
- Handles empty responses, invalid JSON, missing files.
- Uses MODEL from constants.py with retries and backoff.
- Validates configs, prompts, metadata.

## Recent Fixes
- Fixed `NameError: requests` in `call_grok`.
- Skipped AI detection for Table, Chart.
- Fixed empty API responses with retries, fallbacks, increased max_tokens.
- Enhanced material config parsing for plain JSON.
- Suppressed `substrates_prompt.txt` false positives.
- Fixed `ai_sell` typo.

## Usage
```bash
python3 run.py
# or
python3 -m generator.modules.page_generator_with_grok
```

## Dependencies
- `pyyaml`, `requests`, `python-dotenv`
- Grok API key in `.env.local`
"""

import os
import yaml
import json
import re
import time
import random
import requests  # Moved to top for clarity
from datetime import datetime
from dotenv import load_dotenv
from generator.modules.ai_detector import AIDetector, load_file, parse_json_response
from generator.constants import (
    AUTHOR_DIR,
    MATERIAL,
    FILE_NAME,
    ARTICLE_CATEGORY,
    OUTPUT_DIR,
    ARTICLE_CONFIG,
    SECTIONS_CONFIG,
    SECTIONS_DIR,
    MODEL,
)

# Configuration
script_dir = os.path.dirname(__file__)
project_root = os.path.join(script_dir, "../../")
load_dotenv(os.path.join(project_root, ".env.local"))
GROK_API_KEY = (
    os.getenv("XAI_API_KEY")
    or (lambda: (_ for _ in ()).throw(ValueError("XAI_API_KEY not set"))())()
)
CACHE_DIR = os.path.join(project_root, "generator", "cache")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"


def format_prompt(prompt, format_vars, prompt_file, section_name):
    """Format prompt, handle missing variables with strict placeholder validation."""
    # Match placeholders outside JSON example blocks
    placeholders = re.findall(r"\{(\w+)\}(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", prompt)
    missing_vars = [var for var in placeholders if var not in format_vars]
    try:
        if missing_vars:
            print(
                f"Warning: Prompt {prompt_file} has undefined variables {missing_vars}. Using manual replacement."
            )
            formatted = prompt
            for key, value in format_vars.items():
                formatted = formatted.replace(f"{{{key}}}", str(value))
        else:
            print(f"Raw prompt for {section_name}: {prompt[:500]}...")
            formatted = prompt.format(**format_vars)
            print(f"Formatted prompt for {section_name}: {formatted[:500]}...")
        return formatted
    except KeyError as e:
        print(
            f"Warning: Prompt {prompt_file} has undefined variable {e}. Using manual replacement."
        )
        formatted = prompt
        for key, value in format_vars.items():
            formatted = formatted.replace(f"{{{key}}}", str(value))
        print(f"Manually formatted prompt for {section_name}: {formatted[:500]}...")
        return formatted


def load_author_metadata():
    """Load author metadata and samples."""
    authors = {}
    for file_name in os.listdir(AUTHOR_DIR):
        if not file_name.endswith(".txt"):
            continue
        file_path = os.path.join(AUTHOR_DIR, file_name)
        content = load_file(file_path)
        if not content:
            continue
        try:
            metadata_str, _ = content.split("---", 1)
            metadata = json.loads(metadata_str.strip())
            if "name" not in metadata or "bio" not in metadata:
                raise ValueError(f"Missing name or bio in {file_name}")
            authors[metadata["name"]] = {"bio": metadata["bio"], "file_name": file_name}
        except (ValueError, json.JSONDecodeError) as e:
            print(f"Warning: Failed to load metadata from {file_name}: {e}")
    if not authors:
        raise ValueError("No valid author metadata found")
    return authors


def call_grok(prompt, max_tokens=1000, temperature=0.7, retries=3):
    """Make Grok API call with retries and error handling."""
    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": False,
    }
    for attempt in range(1, retries + 1):
        try:
            print(
                f"Attempting API call with model: {payload['model']} (attempt {attempt})"
            )
            response = requests.post(GROK_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            print(f"Token usage (attempt {attempt}): {data.get('usage', {})}")
            return data["choices"][0]["message"]["content"]
        except requests.exceptions.RequestException as e:
            print(
                f"API call failed, attempt {attempt}: {e}, status: {response.status_code if 'response' in locals() else 'N/A'}, response: {response.text if 'response' in locals() else 'N/A'}"
            )
            if attempt < retries and (
                not "response" in locals() or response.status_code == 429
            ):
                delay = (1 * 2 ** (attempt - 1)) + random.uniform(0, 0.1)
                print(f"Retrying API call after {delay:.2f}s (attempt {attempt + 1})")
                time.sleep(delay)
                continue
            return ""  # Return empty string to trigger fallback


def research_material_config(material, variety):
    """Generate or cache material properties."""
    cache_file = os.path.join(CACHE_DIR, f"{material.lower().replace(' ', '_')}.json")
    os.makedirs(CACHE_DIR, exist_ok=True)
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cached = json.load(f)
            print(f"Using cached material_config for {material}")
            return cached
        except json.JSONDecodeError as e:
            print(f"Warning: Invalid cache file {cache_file}: {e}")

    default_config = {
        "industries": ["General Industry"],
        "material_type": "Unknown",
        "metal_class": "Unknown",
        "primary_application": "Unknown",
    }
    prompt = load_file(
        os.path.join(SECTIONS_DIR, "material_research_prompt.txt")
    ).format(material=material)
    prompt += f"\n\n{variety}\n\nProvide JSON response in ```json\n...\n```, with industries (list of strings), material_type, metal_class, primary_application."
    response = call_grok(prompt, max_tokens=4000, retries=3)
    print(f"Raw API response (material_config): {response}")
    parsed_config = parse_json_response(response, default_config, "material config")
    if "industries" in parsed_config and isinstance(parsed_config["industries"], list):
        parsed_config["industries"] = [
            item["name"] if isinstance(item, dict) and "name" in item else item
            for item in parsed_config["industries"]
            if isinstance(item, (str, dict))
        ] or default_config["industries"]
    else:
        parsed_config["industries"] = default_config["industries"]
    default_config.update(parsed_config)
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(default_config, f, indent=2)
    return default_config


def generate_section(
    material,
    material_config,
    section_name,
    section_def,
    article_config,
    author_metadata,
):
    """Generate a section, evaluate AI likelihood (except for table/chart), cache results."""
    cache_file = os.path.join(
        CACHE_DIR, f"{material.lower().replace(' ', '_')}_{section_name}.json"
    )
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cached = json.load(f)
            print(f"Using cached section {section_name} for {material}")
            return cached["content"], cached["ai_score"]
        except json.JSONDecodeError as e:
            print(f"Warning: Invalid cache file {cache_file}: {e}")

    prompt_file = section_def["prompt_file"]
    section_type = section_def["type"]
    prompt = load_file(os.path.join(SECTIONS_DIR, prompt_file))
    if not prompt:
        return (
            f"<!-- {section_name} (No content generated due to missing prompt) -->",
            {"percentage": 0, "summary": "No content generated"},
        )

    format_vars = {
        "material": material,
        "material_slug": material.lower().replace(" ", "-"),
        "industries": ", ".join(
            material_config.get("industries", ["General Industry"])
        ),
        "article_category": ARTICLE_CATEGORY.lower(),
    }
    prompt = format_prompt(prompt, format_vars, prompt_file, section_name)

    author_prompt = "".join(
        f"\n\nTransform style to match {author}'s sample:\n{rewritten.strip()}"
        for author in article_config["authors"]
        if (
            (
                content := load_file(
                    os.path.join(
                        AUTHOR_DIR, author_metadata.get(author, {}).get("file_name")
                    )
                )
            )
            and (split_content := content.split("---", 1))
            and len(split_content) > 1
            and (samples := split_content[1].split("Rewritten Sample:"))
            and len(samples) > 1
            and (rewritten := samples[1])
        )
        or print(f"Warning: Failed to load sample for {author}")
    )

    word_count = article_config["content_length"].get(section_name, "100-150")
    max_words = int(word_count.split("-")[-1]) if "-" in word_count else int(word_count)
    prompt += f"\n\nWrite in {article_config['voice']} voice with {article_config['authority']} authority. Target {word_count} words. {article_config['variety']}{author_prompt}\nReturn content as {section_type} (e.g., plain text, bullet points, markdown table, JSON)."

    default_content = {
        "paragraph": f"Laser cleaning of {material.lower()} removes contaminants like dust and adhesives, enhancing surface quality in industries such as {', '.join(material_config.get('industries', ['General Industry']))}.",
        "list": "- Dust and particulate matter\n- Adhesive residues\n- Surface oils",
        "table": material_config.get(
            "material_properties_table",
            "| Property | Value |\n|----------|-------|\n| Density | Unknown |\n| Hardness | Unknown |",
        ),
        "chart": '```json\n{"labels": ["Contaminant Removal"], "values": [0]}\n```',
    }
    try:
        content = call_grok(prompt, max_tokens=max_words * 5, retries=3)
        if not content.strip():
            print(f"Warning: Empty content for {section_name}, using fallback")
            content = default_content.get(
                section_type,
                f"<!-- {section_name} (Empty API response, placeholder content) -->",
            )
            ai_score = {"percentage": 0, "summary": "Empty API response"}
        elif section_type in ["table", "chart"]:
            ai_score = {
                "percentage": 0,
                "summary": "AI detection skipped for structured content",
            }
        else:
            detector = AIDetector(
                content_type=f"{ARTICLE_CATEGORY.lower()} blog post",
                audience_level="general readership",
            )
            ai_score = detector.evaluate(content)
            print(
                f"Initial AI Detection for {section_name}: {ai_score['percentage']}% - {ai_score['summary']}"
            )
            if (
                ai_score["percentage"] > 60
                and "failed" not in ai_score["summary"].lower()
                and ai_score["summary"] != "Invalid response format"
            ):
                print(f"Regenerating {section_name} due to high AI likelihood")
                prompt += f"\n\nRegeneration: Reduce AI-like traits ({ai_score['summary']}). Use specific, technical details about {material} in {', '.join(material_config.get('industries', ['General Industry']))} industries. Add subtle imperfections, examples, and terminology."
                content = call_grok(
                    prompt, max_tokens=max_words * 5, retries=3
                ) or default_content.get(
                    section_type,
                    f"<!-- {section_name} (Empty regeneration response, using fallback) -->",
                )
                ai_score = (
                    detector.evaluate(content)
                    if content.strip()
                    else {"percentage": 0, "summary": "Empty regeneration response"}
                )
                print(
                    f"Post-regeneration AI Detection for {section_name}: {ai_score['percentage']}% - {ai_score['summary']}"
                )

        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump({"content": content, "ai_score": ai_score}, f, indent=2)
        return content, ai_score
    except requests.exceptions.RequestException as e:
        print(f"Failed to generate section {section_name}: {e}")
        return default_content.get(
            section_type, f"<!-- {section_name} (Failed to generate: {e}) -->"
        ), {"percentage": 0, "summary": f"Generation failed: {e}"}


def generate_sections(
    material, material_config, article_config, sections_config, author_metadata
):
    """Generate all sections and their AI scores."""
    sections, ai_scores = [], {}
    for section_name in article_config["section_order"]:
        section_def = sections_config["sections"].get(section_name)
        if not section_def:
            print(f"Warning: Section {section_name} not found in sections_config")
            sections.append(f"<!-- {section_name} (Not found in sections_config) -->")
            ai_scores[section_name] = {"percentage": 0, "summary": "Section not found"}
            continue
        content, ai_score = generate_section(
            material,
            material_config,
            section_name,
            section_def,
            article_config,
            author_metadata,
        )
        sections.append(content)
        ai_scores[section_name] = ai_score
    return sections, ai_scores


def generate_metadata(
    material, material_config, article_config, author_metadata, ai_scores
):
    """Generate YAML metadata."""
    material_slug = material.lower().replace(" ", "_")
    author_bios = [
        author_metadata[author]["bio"]
        for author in article_config["authors"]
        if author in author_metadata
        or print(f"Warning: No metadata found for {author}, skipping bio")
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
            name: score["percentage"] for name, score in ai_scores.items()
        },
    }
    return f"---\n{yaml.dump(metadata, sort_keys=False)}\n---"


def assemble_page(metadata, sections):
    """Combine metadata and sections into MDX content."""
    return f"{metadata}\n\n" + "\n\n".join(sections)


def main():
    """Orchestrate MDX file generation."""
    for directory in [SECTIONS_DIR, AUTHOR_DIR, CACHE_DIR]:
        if not os.path.exists(directory):
            raise FileNotFoundError(f"Directory {directory} not found")

    article_config = ARTICLE_CONFIG
    sections_config = SECTIONS_CONFIG
    for field in [
        "authors",
        "voice",
        "authority",
        "content_length",
        "section_order",
        "variety",
    ]:
        if not article_config.get(field):
            raise ValueError(f"Missing required article_config field: {field}")

    author_metadata = load_author_metadata()
    for author in article_config["authors"]:
        if author not in author_metadata:
            raise ValueError(f"Author {author} not found in author_metadata")

    material_config = research_material_config(MATERIAL, article_config["variety"])
    required_keys = [
        "industries",
        "material_type",
        "metal_class",
        "primary_application",
    ]
    if not all(key in material_config for key in required_keys):
        print(f"Warning: material_config missing required keys: {material_config}")
        material_config = {
            "industries": ["General Industry"],
            "material_type": "Unknown",
            "metal_class": "Unknown",
            "primary_application": "Unknown",
        }
    print(f"Material config: {material_config}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    sections, ai_scores = generate_sections(
        MATERIAL, material_config, article_config, sections_config, author_metadata
    )
    metadata = generate_metadata(
        MATERIAL, material_config, article_config, author_metadata, ai_scores
    )
    page_content = assemble_page(metadata, sections)
    output_path = os.path.join(OUTPUT_DIR, FILE_NAME)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(page_content)
    print(f"MDX file generated at: {output_path}")


if __name__ == "__main__":
    main()
