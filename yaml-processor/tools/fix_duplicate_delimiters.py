#!/usr/bin/env python3
"""
Fix Duplicate YAML Delimiters Script

This script fixes markdown files with duplicate frontmatter delimiters.
"""

import os
import re
import sys
from pathlib import Path


def fix_duplicate_delimiters(file_path):
    """Fix duplicate frontmatter delimiters in a markdown file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Skip empty or nearly empty files
        if len(content.strip()) < 10:
            return False, "Skipping empty or incomplete file"

        # Skip files with empty frontmatter (just --- and ---)
        if re.match(r"^---\s*\n\s*---\s*$", content.strip()):
            return False, "Skipping file with empty frontmatter"

        # Check for duplicate frontmatter delimiters pattern
        if re.match(r"^---\s*\n---\s*\n", content):
            # Replace the duplicate delimiters with a single delimiter
            fixed_content = re.sub(r"^---\s*\n---\s*\n", "---\n", content)

            # Write the fixed content back to the file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(fixed_content)

            return True, "Fixed duplicate frontmatter delimiters"

        return False, "No duplicate delimiters found"

    except Exception as e:
        return False, f"Error: {str(e)}"


def validate_yaml_structure(file_path):
    """Validate that the file has proper YAML frontmatter structure."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Skip empty or nearly empty files
        if len(content.strip()) < 10:
            return True, "Skipping empty or incomplete file"

        # Skip files with empty frontmatter (just --- and ---)
        if re.match(r"^---\s*\n\s*---\s*$", content.strip()):
            return True, "Skipping file with empty frontmatter"

        # Check for basic YAML frontmatter structure
        if not re.match(r"^---\s*\n.*?\n---", content, re.DOTALL):
            return False, "Invalid frontmatter structure"

        # Count occurrences of '---' in the file
        delimiter_count = len(re.findall(r"^---\s*$", content, re.MULTILINE))
        if delimiter_count != 2:
            return False, f"Found {delimiter_count} delimiters instead of 2"

        return True, "Valid YAML structure"

    except Exception as e:
        return False, f"Error during validation: {str(e)}"


def main():
    """Main function to process all markdown files in a directory."""
    if len(sys.argv) < 2:
        print("Usage: python fix_duplicate_delimiters.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory")
        sys.exit(1)

    # Find all markdown files in the directory
    files = list(Path(directory).rglob("*.md"))

    fixed_count = 0
    skipped_count = 0
    validation_failures = 0

    print(f"Processing {len(files)} files...")

    for file_path in files:
        # First, attempt to fix any duplicate delimiters
        fixed, message = fix_duplicate_delimiters(file_path)

        if "Skipping empty" in message:
            skipped_count += 1
            print(f"⚠ {file_path}: {message}")
            continue

        if fixed:
            fixed_count += 1
            print(f"✓ {file_path}: {message}")

        # Then validate the structure (for non-empty files)
        valid, val_message = validate_yaml_structure(file_path)
        if not valid:
            validation_failures += 1
            print(f"✗ {file_path}: {val_message}")

    print(
        f"\nSummary: {fixed_count} files fixed, {skipped_count} files skipped, {validation_failures} validation failures"
    )


if __name__ == "__main__":
    main()
