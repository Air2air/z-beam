#!/usr/bin/env python3
"""
Script to randomize existing authorIds in MDX files
"""

import re
import random
from pathlib import Path

# Available author IDs (1, 2, 3)
AUTHOR_IDS = [1, 2, 3]


def randomize_author_id(file_path):
    """Randomize the authorId in an MDX file"""
    print(f"Processing: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if frontmatter exists
    frontmatter_match = re.match(
        r"^---\r?\n(.*?)\r?\n---\r?\n(.*)$", content, re.DOTALL
    )
    if not frontmatter_match:
        print("  No frontmatter found")
        return False

    frontmatter = frontmatter_match.group(1)
    body = frontmatter_match.group(2)

    # Check if authorId exists
    author_id_match = re.search(r"^authorId:\s*(\d+)", frontmatter, re.MULTILINE)
    if not author_id_match:
        print("  No authorId found")
        return False

    current_author_id = int(author_id_match.group(1))

    # Choose a random author ID
    new_author_id = random.choice(AUTHOR_IDS)
    print(f"  Changing authorId from {current_author_id} to {new_author_id}")

    # Replace the authorId
    new_frontmatter = re.sub(
        r"^authorId:\s*\d+",
        f"authorId: {new_author_id}",
        frontmatter,
        flags=re.MULTILINE,
    )

    # Reconstruct file content
    new_content = f"---\n{new_frontmatter}\n---\n{body}"

    # Write back to file
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"  Updated {file_path}")
    return True


def main():
    """Main function to process all MDX files"""
    materials_dir = Path("app/(materials)/posts")

    if not materials_dir.exists():
        print(f"Directory {materials_dir} does not exist")
        return

    mdx_files = list(materials_dir.glob("*.mdx"))
    print(f"Found {len(mdx_files)} MDX files")

    # Set random seed for reproducible but varied results
    random.seed(42)

    updated_count = 0
    for mdx_file in mdx_files:
        if randomize_author_id(mdx_file):
            updated_count += 1

    print(f"\nCompleted: Updated {updated_count} of {len(mdx_files)} files")


if __name__ == "__main__":
    main()
