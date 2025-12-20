#!/usr/bin/env python3
"""
Frontmatter Field Normalization Script

Flattens domain_linkages structure and reorders all fields logically.
Works across all article types (contaminants, materials, compounds, settings).

Usage:
    python3 normalize_frontmatter_structure.py --dry-run  # Preview changes
    python3 normalize_frontmatter_structure.py            # Apply changes
    python3 normalize_frontmatter_structure.py --path frontmatter/contaminants/  # Specific directory
"""

import yaml
import argparse
from pathlib import Path
from typing import Dict, Any, List
from collections import OrderedDict


class FrontmatterNormalizer:
    """Normalizes frontmatter structure and field ordering"""

    # Logical field ordering for all article types
    FIELD_ORDER = [
        # IDENTITY
        "id",
        "title",
        "slug",
        "category",
        "subcategory",
        "schema_version",
        "content_type",
        # DATES & METADATA
        "datePublished",
        "dateModified",
        # AUTHOR
        "author",
        # CONTENT (human-readable)
        # Note: All content types (materials, settings, etc.) use universal 'description' field
        "contamination_description",  # contaminants only
        "compound_description",  # compounds only
        "micro",
        # TECHNICAL DATA
        "laser_properties",
        "physical_properties",
        "chemical_properties",
        "mechanical_properties",
        # DOMAIN LINKAGES (flattened to top-level)
        "produces_compounds",  # contaminants → compounds
        "removes_contaminants",  # materials → contaminants
        "found_in_materials",  # compounds → materials
        "effective_against",  # settings → contaminants
        "related_materials",  # cross-references
        "related_contaminants",  # cross-references
        "related_compounds",  # cross-references
        "related_settings",  # cross-references
        # SEO & NAVIGATION
        "breadcrumb",
        "valid_materials",
        "valid_contaminants",
        "compatible_materials",
        "eeat",
        # INTERNAL
        "_metadata",
    ]

    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.changes = []

    def normalize_file(self, file_path: Path) -> Dict[str, Any]:
        """Normalize a single frontmatter file"""
        print(f"\n{'[DRY RUN] ' if self.dry_run else ''}Processing: {file_path}")

        # Load YAML
        with open(file_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        # Track changes
        changes = []

        # 1. Flatten domain_linkages
        if "domain_linkages" in data:
            changes.append("Flattening domain_linkages structure")
            linkages = data.pop("domain_linkages")

            # Move each linkage type to top level
            for key, value in linkages.items():
                if value:  # Only add if not empty
                    data[key] = value
                    changes.append(f"  - Moved {key} to top level ({len(value)} items)")

        # 2. Remove duplicate 'name' field (use 'title' instead)
        if "name" in data and "title" in data:
            if data["name"] == data["title"]:
                data.pop("name")
                changes.append("Removed duplicate 'name' field")
        elif "name" in data and "title" not in data:
            # Rename 'name' to 'title'
            data["title"] = data.pop("name")
            changes.append("Renamed 'name' to 'title'")

        # 3. Reorder fields logically
        ordered_data = OrderedDict()

        # Add fields in defined order
        for field in self.FIELD_ORDER:
            if field in data:
                ordered_data[field] = data[field]

        # Add any remaining fields not in FIELD_ORDER (preserves custom fields)
        for field in data:
            if field not in ordered_data:
                ordered_data[field] = data[field]
                changes.append(f"Preserved custom field: {field}")

        changes.append(f"Reordered {len(ordered_data)} fields logically")

        # 4. Write back to file (unless dry-run)
        if not self.dry_run:
            with open(file_path, "w", encoding="utf-8") as f:
                yaml.dump(
                    dict(ordered_data),
                    f,
                    default_flow_style=False,
                    allow_unicode=True,
                    sort_keys=False,  # Preserve our custom order
                    width=1000,  # Prevent line wrapping
                )
            print(f"✅ Updated: {file_path}")
        else:
            print(f"📋 Would update: {file_path}")

        # Print changes
        for change in changes:
            print(f"  {change}")

        self.changes.extend(changes)
        return dict(ordered_data)

    def normalize_directory(self, directory: Path) -> None:
        """Normalize all YAML files in a directory recursively"""
        yaml_files = list(directory.rglob("*.yaml"))

        print(f"\n{'=' * 80}")
        print(f"Found {len(yaml_files)} YAML files in {directory}")
        print(
            f"Mode: {'DRY RUN (no changes)' if self.dry_run else 'LIVE (will modify files)'}"
        )
        print(f"{'=' * 80}")

        for file_path in yaml_files:
            try:
                self.normalize_file(file_path)
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}")

        print(f"\n{'=' * 80}")
        print(f"Summary: {len(yaml_files)} files processed")
        print(f"Total changes: {len(self.changes)}")
        print(f"{'=' * 80}")


def main():
    parser = argparse.ArgumentParser(
        description="Normalize frontmatter structure and field ordering"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Preview changes without modifying files"
    )
    parser.add_argument(
        "--path",
        type=str,
        default="frontmatter",
        help="Path to frontmatter directory (default: frontmatter)",
    )

    args = parser.parse_args()

    frontmatter_dir = Path(args.path)

    if not frontmatter_dir.exists():
        print(f"❌ Error: Directory not found: {frontmatter_dir}")
        return 1

    normalizer = FrontmatterNormalizer(dry_run=args.dry_run)
    normalizer.normalize_directory(frontmatter_dir)

    if args.dry_run:
        print("\n💡 Run without --dry-run to apply changes")

    return 0


if __name__ == "__main__":
    exit(main())
