#!/usr/bin/env python3
"""
Fix contaminant breadcrumb URLs

Issues to fix:
1. Double "contamination" suffix in URLs
2. Missing subcategory level in URL structure

Correct pattern: /contamination/{category}/{subcategory}/{slug}
"""

import os
import yaml
from pathlib import Path

contaminants_dir = Path("frontmatter/contaminants")
files = list(contaminants_dir.glob("*.yaml"))

print(f"Found {len(files)} contaminant files to process\n")

fixed_count = 0
error_count = 0

for file_path in files:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        if not data or "metadata" not in data:
            print(f"⚠️  Skipping {file_path.name}: No metadata found")
            continue

        metadata = data["metadata"]
        category = metadata.get("category")
        subcategory = metadata.get("subcategory")
        slug = metadata.get("slug")

        if not all([category, subcategory, slug]):
            print(
                f"⚠️  Skipping {file_path.name}: Missing category, subcategory, or slug"
            )
            continue

        # Build correct URL
        correct_url = f"/contamination/{category}/{subcategory}/{slug}"

        # Check if breadcrumb exists and needs fixing
        if "breadcrumb" in metadata and isinstance(metadata["breadcrumb"], list):
            last_breadcrumb = metadata["breadcrumb"][-1]

            if last_breadcrumb and last_breadcrumb.get("href") != correct_url:
                old_url = last_breadcrumb["href"]
                last_breadcrumb["href"] = correct_url

                # Write back to file
                with open(file_path, "w", encoding="utf-8") as f:
                    yaml.dump(
                        data,
                        f,
                        default_flow_style=False,
                        allow_unicode=True,
                        sort_keys=False,
                    )

                print(f"✅ Fixed {file_path.name}")
                print(f"   Old: {old_url}")
                print(f"   New: {correct_url}\n")

                fixed_count += 1

    except Exception as error:
        print(f"❌ Error processing {file_path.name}: {error}")
        error_count += 1

print(f"\n{'=' * 60}")
print(f"✅ Fixed: {fixed_count} files")
print(f"❌ Errors: {error_count} files")
print(f"📊 Total: {len(files)} files")
print(f"{'=' * 60}\n")
