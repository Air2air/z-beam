#!/usr/bin/env python3
"""
Script to process a specific file and report changes made by the YAML processor.
"""

import os
import sys
import pathlib
from pathlib import Path

# Add the yaml-processor directory to the Python path
sys.path.append(os.path.join(os.getcwd(), "yaml-processor"))

try:
    from yaml_processor import ZBeamYAMLProcessor

    # File to process
    file_path = Path("content/components/frontmatter/test-yaml-formatting.md")

    # Read the original content
    original_content = file_path.read_text(encoding="utf-8")

    print(f"📄 Processing file: {file_path.name}")

    # Create processor with verbose output
    processor = ZBeamYAMLProcessor(verbose=True)

    # Process the file
    processor._process_file(file_path)

    # Read the modified content
    modified_content = file_path.read_text(encoding="utf-8")

    # Check if the file was changed
    if original_content != modified_content:
        print("\n✅ File was modified")

        # Split the content into lines
        original_lines = original_content.split("\n")
        modified_lines = modified_content.split("\n")

        # Find differences
        for i, (orig, mod) in enumerate(zip(original_lines, modified_lines)):
            if orig != mod:
                print(f"\nLine {i + 1} changed:")
                print(f"  BEFORE: {orig}")
                print(f"  AFTER:  {mod}")

        # Handle different line counts
        if len(original_lines) != len(modified_lines):
            if len(original_lines) < len(modified_lines):
                print("\nAdded lines:")
                for i in range(len(original_lines), len(modified_lines)):
                    print(f"  Line {i + 1}: {modified_lines[i]}")
            else:
                print("\nRemoved lines:")
                for i in range(len(modified_lines), len(original_lines)):
                    print(f"  Line {i + 1}: {original_lines[i]}")
    else:
        print("\n❌ No changes were made to the file")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback

    traceback.print_exc()
