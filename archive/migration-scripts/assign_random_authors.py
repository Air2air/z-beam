#!/usr/bin/env python3
"""
Script to randomly assign authorIds to MDX files that don't have one
"""

import re
import random
from pathlib import Path

# Available author IDs (1, 2, 3)
AUTHOR_IDS = [1, 2, 3]


def assign_random_author_id(file_path):
    """Assign a random authorId to an MDX file if it doesn't have one"""
    print(f"Processing: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if frontmatter exists
    frontmatter_match = re.match(
        r"^---\r?\n(.*?)\r?\n---\r?\n(.*)$", content, re.DOTALL
    )
    if not frontmatter_match:
        print(f"No frontmatter found in {file_path}")
        return False

    frontmatter = frontmatter_match.group(1)
    body = frontmatter_match.group(2)

    # Check if authorId already exists
    if re.search(r"^authorId:\s*\d+", frontmatter, re.MULTILINE):
        print("  Already has authorId, skipping")
        return False

    # Choose a random author ID
    random_author_id = random.choice(AUTHOR_IDS)
    print(f"  Assigning authorId: {random_author_id}")

    # Find a good place to insert authorId (after publishedAt if it exists)
    if re.search(r"^publishedAt:", frontmatter, re.MULTILINE):
        # Insert after publishedAt line
        new_frontmatter = re.sub(
            r"^(publishedAt:.*)$",
            f"\\1\nauthorId: {random_author_id}",
            frontmatter,
            flags=re.MULTILINE,
        )
    else:
        # Insert after title line
        new_frontmatter = re.sub(
            r"^(title:.*)$",
            f"\\1\nauthorId: {random_author_id}",
            frontmatter,
            flags=re.MULTILINE,
        )

    # Reconstruct file content
    new_content = f"---\n{new_frontmatter}\n---\n{body}"

    # Write back to file
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Updated {file_path}")
    return True


def main():
    """Main function to process all MDX files"""
    materials_dir = Path("app/(materials)/posts")

    if not materials_dir.exists():
        print(f"Directory {materials_dir} does not exist")
        return

    mdx_files = list(materials_dir.glob("*.mdx"))
    print(f"Found {len(mdx_files)} MDX files")

    # Set random seed for reproducible results
    random.seed(42)

    updated_count = 0
    for mdx_file in mdx_files:
        if assign_random_author_id(mdx_file):
            updated_count += 1

    print(f"\nCompleted: Updated {updated_count} of {len(mdx_files)} files")


if __name__ == "__main__":
    main()
