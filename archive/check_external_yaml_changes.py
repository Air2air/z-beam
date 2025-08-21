#!/usr/bin/env python3
"""
Script to check and report changes made by the YAML processor on external files.
"""

import os
import sys
import pathlib
import tempfile
import difflib

# Add the yaml-processor directory to the path so we can import the processor
sys.path.append("yaml-processor")
from yaml_processor import ZBeamYAMLProcessor

# Path to the external examples directory
EXTERNAL_DIR = "/Users/todddunning/Desktop/Z-Beam/z-beam-generator/validators/examples"


def get_file_content(file_path):
    """Read the content of a file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"❌ Error reading file {file_path}: {e}")
        return None


def process_and_check_file(file_path, processor):
    """Process a file and check for changes."""
    print(f"📄 Processing file: {os.path.basename(file_path)}")

    # Get the original content
    original_content = get_file_content(file_path)
    if original_content is None:
        return

    # Create a temporary copy to process
    with tempfile.NamedTemporaryFile(
        mode="w", delete=False, encoding="utf-8"
    ) as temp_file:
        temp_file.write(original_content)
        temp_path = temp_file.name

    # Process the temporary file
    processor._process_file(pathlib.Path(temp_path))

    # Get the processed content
    processed_content = get_file_content(temp_path)

    # Clean up temporary file
    try:
        os.unlink(temp_path)
    except Exception:
        pass

    # Check for changes
    if original_content == processed_content:
        print("✅ No changes needed")
        return

    print("✅ File would be modified")

    # Get the differences
    original_lines = original_content.splitlines()
    processed_lines = processed_content.splitlines()

    diff = difflib.unified_diff(original_lines, processed_lines, lineterm="", n=0)

    line_changes = []
    for line in diff:
        if line.startswith("+++") or line.startswith("---"):
            continue
        if line.startswith("-"):
            line_num = int(line.split(",")[0][1:]) if "," in line else int(line[1:])
            line_changes.append((line_num, "removed", original_lines[line_num - 1]))
        elif line.startswith("+"):
            line_num = int(line.split(",")[0][1:]) if "," in line else int(line[1:])
            line_changes.append((line_num, "added", processed_lines[line_num - 1]))

    # Print the changes in a readable format
    current_line = 0
    for line_num, change_type, content in sorted(line_changes, key=lambda x: x[0]):
        if line_num != current_line:
            print(f"\nLine {line_num} changed:")
            current_line = line_num

        if change_type == "removed":
            print(f"  BEFORE: {content}")
        else:
            print(f"  AFTER:  {content}")


def main():
    """Main function to check changes made by the YAML processor."""
    # Create processor instance
    processor = ZBeamYAMLProcessor(verbose=True)

    # Check if the external directory exists
    if not os.path.isdir(EXTERNAL_DIR):
        print(f"❌ External directory not found: {EXTERNAL_DIR}")
        return 1

    # Process all markdown files in the directory
    processed_files = 0
    for root, _, files in os.walk(EXTERNAL_DIR):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                process_and_check_file(file_path, processor)
                processed_files += 1

    print(f"\n✅ Checked {processed_files} files in {EXTERNAL_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
