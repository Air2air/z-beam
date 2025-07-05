#!/usr/bin/env python3
"""
Test script to verify the Enhanced JSON Prompt Repository handles template files correctly.
"""

import sys
from pathlib import Path

# Add the generator module to Python path
sys.path.insert(0, str(Path(__file__).parent / "generator"))

from generator.infrastructure.storage.enhanced_json_prompt_repository import (
    EnhancedJsonPromptRepository,
)


def test_chart_section_with_template():
    """Test that the chart section loads correctly with its template file."""
    # Initialize the repository
    prompts_dir = Path(__file__).parent / "generator" / "prompts"
    repo = EnhancedJsonPromptRepository(prompts_dir)

    # Get the chart section
    chart_prompt = repo.get_prompt("chart", "sections")

    if chart_prompt:
        print(f"Chart section loaded successfully!")
        print(f"Name: {chart_prompt.name}")
        print(f"Category: {chart_prompt.category}")
        print(f"Content length: {len(chart_prompt.content)} characters")

        # Check if template content is included
        if "Template:" in chart_prompt.content:
            print("✅ Template file content is properly included")
            print("\nTemplate section found in prompt:")
            template_start = chart_prompt.content.find("Template:")
            print(chart_prompt.content[template_start : template_start + 200] + "...")
        else:
            print("❌ Template content not found in prompt")

        return True
    else:
        print("❌ Chart section not found or failed to load")
        return False


def test_all_sections():
    """Test loading all sections."""
    prompts_dir = Path(__file__).parent / "generator" / "prompts"
    repo = EnhancedJsonPromptRepository(prompts_dir)

    sections = repo.list_prompts("sections")
    print(f"\nAll sections available: {len(sections)}")

    for section_name in sections:
        prompt = repo.get_prompt(section_name, "sections")
        if prompt:
            print(f"✅ {section_name}: {len(prompt.content)} chars")
        else:
            print(f"❌ {section_name}: Failed to load")


if __name__ == "__main__":
    print("Testing Enhanced JSON Prompt Repository with template files...\n")

    # Test chart section specifically
    success = test_chart_section_with_template()

    # Test all sections
    test_all_sections()

    if success:
        print("\n✅ Template file handling test completed successfully!")
    else:
        print("\n❌ Template file handling test failed!")
