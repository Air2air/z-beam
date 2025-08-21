#!/usr/bin/env python3
"""
Badge Symbol Fixer Script

This script updates chemical formula properties in frontmatter files
to ensure that element symbols are correctly displayed in badge symbols.
"""

import os
import re
import yaml
import sys
from pathlib import Path

# Define element symbols and their full names
ELEMENTS = {
    "Aluminum": "Al",
    "Beryllium": "Be",
    "Carbon": "C",
    "Gold": "Au",
    "Silver": "Ag",
    "Copper": "Cu",
    "Iron": "Fe",
    "Lead": "Pb",
    "Nickel": "Ni",
    "Tin": "Sn",
    "Titanium": "Ti",
    "Zinc": "Zn",
    "Zirconium": "Zr",
    # Add more as needed
}


def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown content."""
    frontmatter_match = re.match(r"^---\s+(.*?)\s+---", content, re.DOTALL)
    if not frontmatter_match:
        return None

    return frontmatter_match.group(1)


def update_frontmatter(frontmatter_text):
    """Update formula in chemical properties to use element symbol instead of full name."""
    # Use regular expression to find and replace
    pattern = r"(chemicalProperties:\s+.*?symbol:\s+)(\w+)(\s+.*?formula:\s+)(\w+)(\s+.*?materialType:\s+element)"

    def replace_formula(match):
        symbol = match.group(2)
        formula_text = match.group(4)

        # If formula is the full element name, replace it with the symbol
        if formula_text in ELEMENTS and ELEMENTS[formula_text] == symbol:
            return f"{match.group(1)}{symbol}{match.group(3)}{symbol}{match.group(5)}"

        return match.group(0)

    updated_text = re.sub(pattern, replace_formula, frontmatter_text, flags=re.DOTALL)
    return updated_text


def process_file(file_path):
    """Process a single markdown file to update chemical formulas."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract frontmatter
        frontmatter_text = extract_frontmatter(content)
        if not frontmatter_text:
            return False, "No frontmatter found"

        # Check if this file contains chemical properties
        if "chemicalProperties" not in frontmatter_text:
            return False, "No chemical properties found"

        # Update the frontmatter
        updated_frontmatter = update_frontmatter(frontmatter_text)

        # If no changes were made, skip
        if updated_frontmatter == frontmatter_text:
            return False, "No changes needed"

        # Replace the frontmatter in the original content
        updated_content = content.replace(frontmatter_text, updated_frontmatter)

        # Write the updated content back to the file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(updated_content)

        return True, "Updated successfully"

    except Exception as e:
        return False, f"Error: {str(e)}"


def main():
    """Main function to process all frontmatter files."""
    if len(sys.argv) < 2:
        print("Usage: python fix_badge_symbols.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory")
        sys.exit(1)

    # Find all markdown files in the directory
    files = list(Path(directory).rglob("*.md"))

    success_count = 0
    skipped_count = 0
    error_count = 0

    print(f"Processing {len(files)} files...")

    for file_path in files:
        success, message = process_file(file_path)
        if success:
            print(f"✓ {file_path}: {message}")
            success_count += 1
        elif (
            message == "No changes needed" or message == "No chemical properties found"
        ):
            # Skip silently to reduce output noise
            skipped_count += 1
        else:
            print(f"✗ {file_path}: {message}")
            error_count += 1

    print(
        f"\nSummary: {success_count} files updated, {skipped_count} files skipped, {error_count} errors"
    )


if __name__ == "__main__":
    main()
