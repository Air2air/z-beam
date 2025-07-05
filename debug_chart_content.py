#!/usr/bin/env python3
"""
Debug script to identify where the JSON parsing error is occurring.
"""

import sys
from pathlib import Path
import traceback

# Add the generator module to Python path
sys.path.insert(0, str(Path(__file__).parent / "generator"))

from generator.infrastructure.storage.enhanced_json_prompt_repository import (
    EnhancedJsonPromptRepository,
)


def test_chart_prompt_content():
    """Test what the chart prompt content actually looks like."""
    # Initialize the repository
    prompts_dir = Path(__file__).parent / "generator" / "prompts"
    repo = EnhancedJsonPromptRepository(prompts_dir)

    try:
        # Get the chart prompt
        chart_prompt = repo.get_prompt("chart", "sections")
        if not chart_prompt:
            print("❌ Chart prompt not found")
            return False

        print(f"Chart prompt retrieved successfully!")
        print(f"Content length: {len(chart_prompt.content)} characters")

        # Fill the prompt with steel
        filled_content = chart_prompt.content.replace("{material}", "steel")

        print("\n=== FULL CHART PROMPT CONTENT ===")
        print(filled_content)
        print("=== END CHART PROMPT CONTENT ===\n")

        # Check for problematic content that might cause JSON parsing issues
        print("Analysis:")
        print(f"- Contains 'type': {'type' in filled_content}")
        print("- Contains '{': " + str("{" in filled_content))
        print("- Contains '}': " + str("}" in filled_content))
        print(f"- Contains '<script>': {'<script>' in filled_content}")
        print(f"- Contains 'const': {'const' in filled_content}")

        # Look for the problematic pattern
        if "\\n  type" in filled_content:
            print("- Found '\\n  type' pattern that might be causing the issue!")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("Debugging chart prompt content...\n")
    test_chart_prompt_content()
