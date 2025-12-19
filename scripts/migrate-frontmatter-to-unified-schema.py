#!/usr/bin/env python3
"""
Migrate frontmatter files to unified relationships schema.

This script:
1. Moves all technical/safety/regulatory data under 'relationships' parent key
2. Removes 'slug' fields from relationship entries
3. Fixes URLs to use full IDs instead of shortened paths
4. Standardizes field names (name→authority, description→title)
5. Removes category/subcategory from relationship entries
6. Applies unified schema structure

Usage:
    python3 scripts/migrate-frontmatter-to-unified-schema.py --dry-run
    python3 scripts/migrate-frontmatter-to-unified-schema.py --type materials
    python3 scripts/migrate-frontmatter-to-unified-schema.py --all
"""

import yaml
import os
import sys
import argparse
from pathlib import Path
from typing import Any, Dict, List, Optional
import re

# Configuration
FRONTMATTER_DIR = Path("frontmatter")
BACKUP_DIR = Path("frontmatter_backup")

# Fields that stay at top-level (page identity & content)
TOP_LEVEL_FIELDS = {
    "id",
    "name",
    "display_name",
    "title",
    "slug",
    "category",
    "subcategory",
    "content_type",
    "schema_version",
    "datePublished",
    "dateModified",
    "description",
    "micro",
    "faq",
    "author",
    "images",
    "breadcrumb",
    "breadcrumb_text",
}

# Fields that should move under relationships
RELATIONSHIP_PARENT_KEYS = {
    "related_materials",
    "related_contaminants",
    "related_compounds",
    "related_settings",
    "produced_by_contaminants",
    "produced_by_materials",
    "produces_compounds",
    "regulatory_standards",
    "regulatory_classification",
    "compatible_materials",
    "prohibited_materials",
    "recommended_settings",
    "laser_properties",
    "machine_settings",
    "materialProperties",
    "material_properties",
    "optical_properties",
    "ppe_requirements",
    "emergency_response",
    "storage_requirements",
    "workplace_exposure",
    "exposure_limits",
    "detection_monitoring",
    "physical_properties",
    "chemical_properties",
    "reactivity",
    "environmental_impact",
    "synonyms_identifiers",
    "health_effects_keywords",
    "sources_in_laser_cleaning",
    "applications",
    "characteristics",
    "challenges",
    "composition",
    "visual_characteristics",
}

# Field renames for standardization
FIELD_RENAMES = {
    "name": "authority",  # In regulatory_standards context
    "longName": None,  # Remove this field
}


class FrontmatterMigrator:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.stats = {
            "files_processed": 0,
            "files_modified": 0,
            "files_skipped": 0,
            "errors": [],
        }

    def migrate_all(self, content_type: Optional[str] = None):
        """Migrate all frontmatter files or specific content type."""
        if content_type:
            paths = list((FRONTMATTER_DIR / content_type).glob("*.yaml"))
        else:
            paths = list(FRONTMATTER_DIR.glob("**/*.yaml"))

        print(f"Found {len(paths)} files to migrate")

        for path in paths:
            try:
                self.migrate_file(path)
            except Exception as e:
                self.stats["errors"].append(f"{path}: {str(e)}")
                print(f"❌ Error: {path}: {str(e)}")

        self.print_summary()

    def migrate_file(self, path: Path):
        """Migrate a single frontmatter file."""
        self.stats["files_processed"] += 1

        # Read file
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        # Parse YAML
        try:
            data = yaml.safe_load(content)
        except yaml.YAMLError as e:
            raise Exception(f"YAML parse error: {e}")

        if not data:
            self.stats["files_skipped"] += 1
            return

        # Perform migrations
        modified = False

        # Step 1: Create relationships parent key if needed
        if "relationships" not in data:
            data["relationships"] = {}
            modified = True

        # Step 2: Move scattered keys under relationships
        keys_to_move = []
        for key in list(data.keys()):
            if key not in TOP_LEVEL_FIELDS and key != "relationships":
                keys_to_move.append(key)

        for key in keys_to_move:
            data["relationships"][key] = data.pop(key)
            modified = True

        # Step 3: Process relationship arrays (remove slug, fix URLs, standardize)
        if "relationships" in data:
            for key in [
                "related_materials",
                "related_contaminants",
                "related_compounds",
                "related_settings",
                "produced_by_contaminants",
                "produced_by_materials",
                "produces_compounds",
                "ppe_requirements",
                "recommended_settings",
            ]:
                if key in data["relationships"] and isinstance(
                    data["relationships"][key], list
                ):
                    for entry in data["relationships"][key]:
                        if isinstance(entry, dict):
                            # Remove slug
                            if "slug" in entry:
                                del entry["slug"]
                                modified = True

                            # Remove category/subcategory from relationships
                            if "category" in entry:
                                del entry["category"]
                                modified = True
                            if "subcategory" in entry:
                                del entry["subcategory"]
                                modified = True

                            # Fix URLs to use full IDs
                            if "url" in entry and "id" in entry:
                                # Extract content type from URL
                                url = entry["url"]
                                if url.startswith("/"):
                                    parts = url.split("/")
                                    if len(parts) >= 3:
                                        content_type = parts[
                                            1
                                        ]  # materials, contaminants, etc
                                        # Use full ID in URL
                                        entry["url"] = f"/{content_type}/{entry['id']}"
                                        modified = True

            # Step 4: Fix regulatory_standards field names
            if "regulatory_standards" in data["relationships"]:
                standards = data["relationships"]["regulatory_standards"]
                if isinstance(standards, list):
                    for standard in standards:
                        if isinstance(standard, dict):
                            # Rename 'name' to 'authority'
                            if "name" in standard:
                                standard["authority"] = standard.pop("name")
                                modified = True

                            # Rename 'description' to 'title' if no title exists
                            if "description" in standard and "title" not in standard:
                                standard["title"] = standard.pop("description")
                                modified = True

                            # Remove longName field
                            if "longName" in standard:
                                del standard["longName"]
                                modified = True

        # Step 5: Remove top-level slug if it exists and equals id
        if "slug" in data and "id" in data and data["slug"] == data["id"]:
            del data["slug"]
            modified = True

        if not modified:
            self.stats["files_skipped"] += 1
            print(f"⏭️  Skipped (no changes): {path.name}")
            return

        self.stats["files_modified"] += 1

        if self.dry_run:
            print(f"🔍 Would modify: {path.name}")
            return

        # Backup original
        backup_path = BACKUP_DIR / path.relative_to(FRONTMATTER_DIR)
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(content)

        # Write migrated file
        with open(path, "w", encoding="utf-8") as f:
            yaml.dump(
                data,
                f,
                default_flow_style=False,
                allow_unicode=True,
                sort_keys=False,
                width=float("inf"),
            )

        print(f"✅ Migrated: {path.name}")

    def print_summary(self):
        """Print migration summary."""
        print("\n" + "=" * 70)
        print("MIGRATION SUMMARY")
        print("=" * 70)
        print(f"Files processed: {self.stats['files_processed']}")
        print(f"Files modified: {self.stats['files_modified']}")
        print(f"Files skipped: {self.stats['files_skipped']}")

        if self.stats["errors"]:
            print(f"\n❌ Errors ({len(self.stats['errors'])}):")
            for error in self.stats["errors"][:10]:  # Show first 10
                print(f"   {error}")
            if len(self.stats["errors"]) > 10:
                print(f"   ... and {len(self.stats['errors']) - 10} more")

        if self.dry_run:
            print("\n🔍 DRY RUN - No files were modified")
        else:
            print(f"\n💾 Backups saved to: {BACKUP_DIR}")
        print("=" * 70)


def main():
    parser = argparse.ArgumentParser(
        description="Migrate frontmatter to unified relationships schema"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be changed without modifying files",
    )
    parser.add_argument(
        "--type",
        choices=["materials", "contaminants", "compounds", "settings"],
        help="Migrate only specific content type",
    )
    parser.add_argument(
        "--all", action="store_true", help="Migrate all frontmatter files"
    )

    args = parser.parse_args()

    if not args.all and not args.type:
        parser.print_help()
        print("\nError: Must specify --all or --type")
        sys.exit(1)

    # Confirm if not dry run
    if not args.dry_run:
        print("⚠️  WARNING: This will modify frontmatter files!")
        print("   Backups will be saved to frontmatter_backup/")
        response = input("\nContinue? (yes/no): ")
        if response.lower() != "yes":
            print("Cancelled.")
            sys.exit(0)

    migrator = FrontmatterMigrator(dry_run=args.dry_run)
    migrator.migrate_all(content_type=args.type)


if __name__ == "__main__":
    main()
