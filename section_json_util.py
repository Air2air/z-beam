#!/usr/bin/env python3
"""
Utility script to help migrate from individual section text files to sections.json format.
This script demonstrates how to load and use the new sections.json file.
"""

import json
import os
from pathlib import Path


def load_sections_json(file_path):
    """Load sections from the JSON file."""
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        return data.get("sections", [])
    except Exception as e:
        print(f"Error loading sections.json: {e}")
        return []


def get_section_config(sections, section_name):
    """Get configuration for a specific section."""
    for section in sections:
        if section["name"] == section_name:
            return section
    return None


def get_prompt_content(section):
    """Get the prompt content from a section config."""
    return section.get("prompt", "")


def main():
    # Get the path to the project root
    project_root = Path(__file__).parent
    sections_file = project_root / "sections" / "sections.json"

    # Load sections
    print(f"Loading sections from {sections_file}")
    sections = load_sections_json(sections_file)

    # List available sections
    print(f"\nFound {len(sections)} sections:")
    for section in sorted(sections, key=lambda x: x.get("order", 999)):
        ai_detect = "✅" if section.get("ai_detect", False) else "❌"
        print(
            f"- {section['name']} (order: {section.get('order', 'N/A')}, ai_detect: {ai_detect})"
        )

    # Example: Get a specific section
    section_name = "introduction"
    section = get_section_config(sections, section_name)
    if section:
        print(f"\nDetails for section '{section_name}':")
        print(f"Title: {section.get('title', 'N/A')}")
        print(
            f"AI Detection: {'Enabled' if section.get('ai_detect', False) else 'Disabled'}"
        )
        print(f"Type: {section.get('section_type', 'N/A')}")
        print(f"Order: {section.get('order', 'N/A')}")
        print("\nPrompt Preview:")
        print("-" * 40)
        prompt = get_prompt_content(section)
        print(prompt[:200] + "..." if len(prompt) > 200 else prompt)
        print("-" * 40)


if __name__ == "__main__":
    main()
