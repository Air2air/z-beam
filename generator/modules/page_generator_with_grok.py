import os
import yaml
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from generator.modules.ai_detector import AIDetector
from generator.constants import (
    AUTHOR_DIR,
    MATERIAL,
    FILE_NAME,
    ARTICLE_CATEGORY,
    OUTPUT_DIR,
    ARTICLE_CONFIG,
    SECTIONS_CONFIG,
    SECTIONS_DIR,
)

# Get the path to the directory containing this script
script_dir = os.path.dirname(__file__)
project_root = os.path.join(script_dir, "../../")
load_dotenv(dotenv_path=os.path.join(project_root, ".env.local"))

GROK_API_KEY = os.getenv("XAI_API_KEY")
if not GROK_API_KEY:
    raise ValueError("XAI_API_KEY environment variable not set or empty")

# Configuration
CACHE_DIR = os.path.join(project_root, "generator", "cache")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"


# Helper Functions
def load_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"Warning: File {file_path} not found")
        return ""
    except Exception as e:
        print(f"Warning: Failed to read file {file_path}: {e}")
        return ""


def load_author_metadata():
    authors = {}
    for file_name in os.listdir(AUTHOR_DIR):
        if file_name.endswith(".txt"):
            file_path = os.path.join(AUTHOR_DIR, file_name)
            try:
                content = load_file(file_path)
                if not content:
                    continue
                metadata_str, _ = content.split("---", 1)
                metadata = json.loads(metadata_str.strip())
                if "name" not in metadata or "bio" not in metadata:
                    raise ValueError(f"Missing name or bio in {file_name}")
                authors[metadata["name"]] = {
                    "bio": metadata["bio"],
                    "file_name": file_name,
                }
            except (ValueError, json.JSONDecodeError) as e:
                print(f"Warning: Failed to load metadata from {file_name}: {e}")
    if not authors:
        raise ValueError("No valid author metadata found")
    return authors


def call_grok(prompt, max_tokens=1000, temperature=0.7):
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
        content = response.json()["choices"][0]["message"]["content"]
        token_usage = response.json().get("usage", {})
        print(f"Token usage: {token_usage}")
        return content
    except requests.RequestException as e:
        print(f"API call failed: {e}")
        print(
            f"Status code: {response.status_code if 'response' in locals() else 'N/A'}"
        )
        print(f"Response text: {response.text if 'response' in locals() else 'N/A'}")
        raise


def research_material_config(material, variety):
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_file = os.path.join(CACHE_DIR, f"{material.lower().replace(' ', '_')}.json")

    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cached_config = json.load(f)
            print(f"Using cached material_config for {material}")
            return cached_config
        except json.JSONDecodeError as e:
            print(f"Warning: Invalid cache file {cache_file}: {e}")

    default_config = {
        "industries": ["General Industry"],
        "material_type": "Unknown",
        "metal_class": "Unknown",
        "primary_application": "Unknown",
    }
    try:
        prompt = load_file(
            os.path.join(SECTIONS_DIR, "material_research_prompt.txt")
        ).format(material=material)
        prompt += f'\n\n{variety}\n\nPlease provide the response in JSON format wrapped in triple backticks (```json\n...\n```), including industries (as a list of strings, e.g., ["Automotive", "Construction"]), material_type, metal_class, and primary_application.'
        response = call_grok(prompt, max_tokens=3000)
        print(f"Raw API response (material_config): {response}")
        if "```json" not in response or "\n```" not in response:
            print("Warning: API response does not contain valid JSON markers")
            return default_config
        json_str = response.split("```json\n")[1].split("\n```")[0]
        parsed_config = json.loads(json_str)
        if "industries" in parsed_config and isinstance(
            parsed_config["industries"], list
        ):
            if all(
                isinstance(item, dict) and "name" in item
                for item in parsed_config["industries"]
            ):
                parsed_config["industries"] = [
                    item["name"] for item in parsed_config["industries"]
                ]
            elif not all(isinstance(item, str) for item in parsed_config["industries"]):
                print(
                    f"Warning: Invalid industries format: {parsed_config['industries']}"
                )
                parsed_config["industries"] = default_config["industries"]
        else:
            parsed_config["industries"] = default_config["industries"]
        default_config.update(parsed_config)
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(default_config, f, indent=2)
        return default_config
    except (
        IndexError,
        json.JSONDecodeError,
        ValueError,
        requests.RequestException,
    ) as e:
        print(f"Failed to parse material config JSON: {e}")
        return default_config


def generate_section(
    material,
    material_config,
    section_name,
    section_def,
    article_config,
    author_metadata,
):
    cache_file = os.path.join(
        CACHE_DIR, f"{material.lower().replace(' ', '_')}_{section_name}.json"
    )
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cached_section = json.load(f)
            print(f"Using cached section {section_name} for {material}")
            return cached_section["content"], cached_section["ai_score"]
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
    try:
        prompt = prompt.format(**format_vars)
    except KeyError as e:
        print(f"Warning: Prompt {prompt_file} has undefined variable {e}")
        prompt = prompt  # Proceed with unformatted prompt

    author_prompt = ""
    for author in article_config["authors"]:
        try:
            content = load_file(
                os.path.join(AUTHOR_DIR, author_metadata[author]["file_name"])
            )
            _, sample_content = content.split("---", 1)
            native, rewritten = sample_content.split("Rewritten Sample:")
            author_prompt += f"\n\nTransform the style to match this sample by {author}:\n{rewritten.strip()}"
        except (FileNotFoundError, ValueError) as e:
            print(f"Warning: Failed to load sample for {author}: {e}")

    word_count = article_config["content_length"].get(section_name, "100-150")
    max_words = int(word_count.split("-")[-1]) if "-" in word_count else int(word_count)
    prompt += f"\n\nWrite in a {article_config['voice']} voice with {article_config['authority']} authority. Target {word_count} words. {article_config['variety']}{author_prompt}\nReturn content formatted as {section_type} (e.g., plain text for paragraph, bullet points for list, markdown table for table, JSON for chart)."

    try:
        content = call_grok(prompt, max_tokens=max_words * 2)
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
            and ai_score["summary"] != "Invalid response format"
        ):
            print(f"Regenerating {section_name} due to high AI likelihood")
            prompt += f"\n\nRegeneration: Reduce AI-like traits ({ai_score['summary']}). Use specific, technical details about {material} in {', '.join(material_config.get('industries', ['General Industry']))} industries. Incorporate subtle imperfections, specific examples, and technical terminology."
            content = call_grok(prompt, max_tokens=max_words * 2)
            ai_score = detector.evaluate(content)
            print(
                f"Post-regeneration AI Detection for {section_name}: {ai_score['percentage']}% - {ai_score['summary']}"
            )

        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump({"content": content, "ai_score": ai_score}, f, indent=2)
        return content, ai_score
    except requests.RequestException as e:
        print(f"Failed to generate section {section_name}: {e}")
        return f"<!-- {section_name} (Failed to generate: {e}) -->", {
            "percentage": 0,
            "summary": f"Generation failed: {e}",
        }


def generate_sections(
    material, material_config, article_config, sections_config, author_metadata
):
    sections = []
    ai_scores = {}
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
    material_slug = material.lower().replace(" ", "_")
    author_bios = []
    for author in article_config["authors"]:
        if author in author_metadata:
            author_bios.append(author_metadata[author]["bio"])
        else:
            print(f"Warning: No metadata found for {author}, skipping bio")

    industries = material_config.get("industries", ["General Industry"])
    if ARTICLE_CATEGORY == "Material":
        title = f"Laser Cleaning {material}: Optimizing Performance and Safety"
        description = f"Explore how laser cleaning removes contaminants from {material.lower()}, enhancing performance and safety in {', '.join(industries)} industries."
        image = f"/images/Material/material_{material_slug}.jpg"
    else:
        title = f"Laser Cleaning Applications for {material}: Techniques and Benefits"
        description = f"Discover how laser cleaning enhances {material.lower()} applications in {', '.join(industries)} industries, focusing on techniques, benefits, and industry use cases."
        image = f"/images/Application/{material_slug}_application.jpg"

    metadata = {
        "title": title,
        "nameShort": material,
        "description": description,
        "publishedAt": datetime.now().strftime("%Y-%m-%d"),
        "authors": article_config["authors"],
        "author_bios": author_bios,
        "tags": [material, "Laser Cleaning"] + industries + ["Surface Preparation"],
        "keywords": f"{material.lower()} cleaning, laser ablation, surface preparation, {', '.join([f'{i.lower()} {ARTICLE_CATEGORY.lower()}s' for i in industries])}, contamination removal",
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
    return f"{metadata}\n\n" + "\n\n".join(sections)


def main():
    for directory in [SECTIONS_DIR, AUTHOR_DIR, CACHE_DIR]:
        if not os.path.exists(directory):
            raise FileNotFoundError(f"Directory {directory} not found")

    article_config = ARTICLE_CONFIG
    sections_config = SECTIONS_CONFIG
    author_metadata = load_author_metadata()

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
