#!/usr/bin/env python3
"""
Test JSONLD Files for Empty Frontmatter

This script tests if our YAML processing scripts correctly handle JSONLD files,
particularly those with empty frontmatter.
"""

import os
import re
import sys
from pathlib import Path


def check_file(file_path):
    """Check if a file has empty frontmatter and how it would be processed."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        is_small = len(content.strip()) < 10
        is_empty_frontmatter = bool(re.match(r"^---\s*\n\s*---\s*$", content.strip()))

        result = {
            "path": str(file_path),
            "size": len(content),
            "trimmed_size": len(content.strip()),
            "is_small": is_small,
            "is_empty_frontmatter": is_empty_frontmatter,
            "would_skip": is_small or is_empty_frontmatter,
            "content": content.strip()
            if len(content.strip()) < 100
            else content.strip()[:100] + "...",
        }

        return result

    except Exception as e:
        return {"path": str(file_path), "error": str(e)}


def main():
    """Main function to check all JSONLD files."""
    if len(sys.argv) < 2:
        print("Usage: python test_jsonld_files.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory")
        sys.exit(1)

    # Find all markdown files in the directory
    files = list(Path(directory).rglob("*.md"))

    print(f"Processing {len(files)} files...")

    for file_path in files:
        result = check_file(file_path)

        if "error" in result:
            print(f"✗ {result['path']}: Error - {result['error']}")
        else:
            status = "⚠ Would skip" if result["would_skip"] else "✓ Would process"
            print(f"{status} {result['path']}:")
            print(
                f"  Size: {result['size']} bytes, Trimmed: {result['trimmed_size']} bytes"
            )
            print(
                f"  Small file: {result['is_small']}, Empty frontmatter: {result['is_empty_frontmatter']}"
            )
            print(f"  Content: {result['content']}")
            print()


if __name__ == "__main__":
    main()
