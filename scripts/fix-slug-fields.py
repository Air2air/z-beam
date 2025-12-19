#!/usr/bin/env python3
"""
Fix mismatched slug fields in frontmatter files.
Removes slug field from ALL frontmatter files since URLs should use IDs.
"""

import yaml
import os
from pathlib import Path

FRONTMATTER_DIR = Path("frontmatter")


def fix_slug_fields():
    """Remove all slug fields from frontmatter files."""
    files_fixed = 0
    files_processed = 0

    for yaml_file in FRONTMATTER_DIR.glob("**/*.yaml"):
        files_processed += 1

        # Read file
        with open(yaml_file, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        if not data:
            continue

        # Remove slug field if it exists
        if "slug" in data:
            del data["slug"]
            files_fixed += 1

            # Write back
            with open(yaml_file, "w", encoding="utf-8") as f:
                yaml.dump(
                    data,
                    f,
                    default_flow_style=False,
                    allow_unicode=True,
                    sort_keys=False,
                    width=float("inf"),
                )

            print(f"✅ Fixed: {yaml_file.name}")

    print(f"\n{'=' * 70}")
    print(f"Files processed: {files_processed}")
    print(f"Files fixed: {files_fixed}")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    fix_slug_fields()
