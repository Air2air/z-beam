"""
Generates Markdown metadata and assembles MDX page content.
"""

from datetime import datetime
from generator.modules.logger import get_logger

# Define a logger for this module
logger = get_logger("metadata_generator")


def generate_metadata(
    material,
    material_config,
    article_config,
    author_metadata,
    ai_scores,
    article_category,
):
    """Generate Markdown metadata.

    Args:
        material (str): Material name.
        material_config (dict): Material properties.
        article_config (dict): Article configuration.
        author_metadata (dict): Author metadata.
        ai_scores (dict): AI detection scores for non-table/chart sections.
        article_category (str): Category (e.g., Material).

    Returns:
        str: Formatted Markdown metadata.
    """
    material_slug = material.lower().replace(" ", "-")

    # Safely get author bios
    author_bios_list = []
    for author_name in article_config.get("authors", []):
        if author_name in author_metadata:
            author_bios_list.append(author_metadata[author_name]["bio"])
        else:
            logger.warning(
                f"No metadata found for author '{author_name}', skipping bio."
            )
    author_bios_str = ", ".join(author_bios_list)

    industries = material_config.get("industries", ["General Industry"])
    is_material = article_category == "Material"

    # Dynamic Title and Description based on category
    title = (
        f"Laser Cleaning {material}: Optimizing Performance and Safety"
        if is_material
        else f"Laser Cleaning {material}: Techniques and Benefits"
    )
    description = (
        f"Explore how laser cleaning removes contaminants from {material.lower()}, enhancing performance and safety in {', '.join(industries)} industries."
        if is_material
        else f"Discover how laser cleaning enhances {material.lower()} applications in {', '.join(industries)} industries, focusing on techniques, benefits, and use cases."
    )

    # Dynamic Image Path
    image_category_folder = "Material" if is_material else "Application"
    image_prefix = "material" if is_material else ""
    image_suffix = "" if is_material else "_application"
    image_path = f"/images/{image_category_folder}/{image_prefix}_{material_slug}{image_suffix}.jpg"

    # --- Start of YAML Frontmatter Construction ---
    # Using a dictionary to build metadata for clarity, then converting to YAML lines
    metadata_dict = {
        "title": title,
        "nameShort": material,  # Assuming 'nameShort' for the material name in your frontend
        "description": description,
        "publishedAt": datetime.now().strftime("%Y-%m-%d"),  # Consistent YYYY-MM-DD
        "authors": article_config.get(
            "authors", []
        ),  # Directly use the list of authors
        "authorBios": author_bios_str,  # Join bios into a single string if that's your type
        "tags": [material, "Laser Cleaning"]
        + industries
        + ["Surface Preparation"],  # Combined list
        "keywords": f"{material.lower()} cleaning, laser ablation, surface preparation, {', '.join(f'{i.lower()} {article_category.lower()}s' for i in industries)}, contamination removal",
        "image": image_path,
        "atomicNumber": material_config.get("atomicNumber", "None"),
        "chemicalSymbol": material_config.get("chemicalSymbol", "None"),
        "materialType": material_config.get("material_type", "Unknown"),
        "metalClass": material_config.get("metal_class", "Unknown"),
        "crystalStructure": material_config.get(
            "crystalStructure", "Complex/Mixed"
        ),  # Added default from previous analysis
        "primaryApplication": material_config.get("primary_application", "Unknown"),
    }

    # Add AI scores, transforming keys if necessary
    for name, score in ai_scores.items():
        if score is not None and "percentage" in score:
            # Map Python snake_case section names to camelCase for JS/TS Metadata
            # and append "AIScore" suffix
            if name == "paragraph":
                metadata_dict["paragraphAIScore"] = score["percentage"]
            elif name == "list":
                metadata_dict["listAIScore"] = score["percentage"]
            # Add more specific mappings here if other sections have AI scores
            else:
                metadata_dict[name + "AIScore"] = score[
                    "percentage"
                ]  # Generic fallback

    # Convert the dictionary to YAML string
    yaml_lines = []
    for key, value in metadata_dict.items():
        if isinstance(value, list):
            # For lists (authors, tags), format each item on a new line with indentation
            yaml_lines.append(f"{key}:")
            for item in value:
                yaml_lines.append(f'  - "{item}"')  # Quote list items for safety
        elif isinstance(value, str):
            # Quote strings that might contain colons or special chars
            yaml_lines.append(
                f'{key}: "{value.replace('"', '\\"')}"'
            )  # Escape internal quotes
        else:
            # For numbers or booleans, no quotes
            yaml_lines.append(f"{key}: {value}")

    return "---\n" + "\n".join(yaml_lines) + "\n---"


def assemble_page(metadata, sections):
    """Combine metadata and sections into MDX content.

    Args:
        metadata (str): Markdown metadata.
        sections (list): List of section contents.

    Returns:
        str: Complete MDX content.
    """
    # Ensure there's always a blank line between frontmatter and content
    return f"{metadata}\n\n" + "\n\n".join(sections)
