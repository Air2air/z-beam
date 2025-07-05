#!/usr/bin/env python3
"""
Test script to generate just the chart section to verify template handling.
"""

import sys
from pathlib import Path

# Add the generator module to Python path
sys.path.insert(0, str(Path(__file__).parent / "generator"))

from generator.infrastructure.storage.enhanced_json_prompt_repository import (
    EnhancedJsonPromptRepository,
)


def test_chart_generation():
    """Test generating just the chart section."""

    # Initialize the repository
    prompts_dir = Path(__file__).parent / "generator" / "prompts"
    repo = EnhancedJsonPromptRepository(prompts_dir)

    try:
        # Get the chart prompt
        chart_prompt = repo.get_prompt("chart", "sections")
        if not chart_prompt:
            print("❌ Chart prompt not found")
            return False

        print("Chart prompt loaded successfully!")
        print(f"Prompt length: {len(chart_prompt.content)} characters")
        print("\nPreparing chart content for steel...")

        # Generate content for steel
        material = "steel"
        filled_prompt = chart_prompt.content.replace("{material}", material)

        print("\nFinal prompt preview (first 500 chars):")
        print("-" * 50)
        print(filled_prompt[:500] + "...")
        print("-" * 50)

        # Check that template is included
        if "<script>" in filled_prompt and "efficiencyChart" in filled_prompt:
            print("✅ Chart template JavaScript is properly included!")
        else:
            print("❌ Chart template JavaScript not found in prompt")
            return False

        # Show template section
        template_start = filled_prompt.find("Template:")
        if template_start >= 0:
            print("\nTemplate section (first 200 chars):")
            print("-" * 50)
            print(filled_prompt[template_start : template_start + 200] + "...")
            print("-" * 50)

        print("\n✅ Chart section prompt preparation successful!")
        print("✅ Template file integration working properly!")
        return True

    except Exception as e:
        print(f"❌ Error testing chart generation: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("Testing chart section generation with template files...\n")
    success = test_chart_generation()

    if success:
        print("\n✅ Chart section template test completed successfully!")
    else:
        print("\n❌ Chart section template test failed!")
