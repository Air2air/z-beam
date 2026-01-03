#!/usr/bin/env python3
"""
Safety Data Normalization Migration Script

Migrates safety data from various nested locations to the standardized
relationships.safety.* structure with presentation wrappers and items arrays.

Usage:
  python3 migrate_safety_data.py --type contaminants
  python3 migrate_safety_data.py --type compounds
  python3 migrate_safety_data.py --type all --backup

Author: Z-Beam Dev Team
Date: January 2, 2026
"""

import argparse
import os
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml


# ============================================================================
# Configuration
# ============================================================================

FRONTMATTER_DIR = Path(__file__).parent.parent / "frontmatter"
CONTAMINANTS_DIR = FRONTMATTER_DIR / "contaminants"
COMPOUNDS_DIR = FRONTMATTER_DIR / "compounds"
BACKUP_DIR = FRONTMATTER_DIR / "backup_before_safety_normalization"

# Risk fields use 'card' presentation
RISK_FIELDS = ["fire_explosion_risk", "toxic_gas_risk", "visibility_hazard"]

# All other fields use 'descriptive' presentation
DESCRIPTIVE_FIELDS = [
    "ppe_requirements",
    "ventilation_requirements",
    "particulate_generation",
    "fumes_generated",
    "exposure_limits",
    "workplace_exposure",
    "storage_requirements",
    "reactivity",
    "environmental_impact",
    "regulatory_classification",
    "emergency_response",
    "detection_monitoring",
]


# ============================================================================
# YAML Helpers
# ============================================================================


def load_yaml(file_path: Path) -> Dict[str, Any]:
    """Load YAML file"""
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def save_yaml(file_path: Path, data: Dict[str, Any]) -> None:
    """Save YAML file with formatting"""
    with open(file_path, "w", encoding="utf-8") as f:
        yaml.dump(
            data,
            f,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
            indent=2,
        )


# ============================================================================
# Backup
# ============================================================================


def create_backup(content_type: str) -> None:
    """Create backup of frontmatter files before migration"""
    source_dir = CONTAMINANTS_DIR if content_type == "contaminants" else COMPOUNDS_DIR
    backup_subdir = BACKUP_DIR / content_type

    if backup_subdir.exists():
        print(f"⚠️  Backup already exists at {backup_subdir}")
        response = input("Overwrite? (y/N): ")
        if response.lower() != "y":
            print("Backup skipped")
            return
        shutil.rmtree(backup_subdir)

    backup_subdir.mkdir(parents=True, exist_ok=True)

    for file_path in source_dir.glob("*.yaml"):
        shutil.copy2(file_path, backup_subdir / file_path.name)

    print(
        f"✅ Backed up {len(list(backup_subdir.glob('*.yaml')))} files to {backup_subdir}"
    )


# ============================================================================
# Contaminants Migration
# ============================================================================


def migrate_contaminant(file_path: Path, dry_run: bool = False) -> bool:
    """
    Migrate contaminant safety data to normalized structure

    Extracts from: relationships.operational.laser_properties.items[0].safety_data
    Moves to: relationships.safety.*
    Adds presentation wrappers and items arrays
    """
    try:
        data = load_yaml(file_path)

        # Extract from nested location
        try:
            laser_props = data["relationships"]["operational"]["laser_properties"][
                "items"
            ][0]
            safety_data = laser_props.pop("safety_data", {})
        except (KeyError, IndexError, TypeError):
            # Try alternative location
            try:
                laser_props = data["relationships"]["laser_properties"]["items"][0]
                safety_data = laser_props.pop("safety_data", {})
            except (KeyError, IndexError, TypeError):
                print(f"⚠️  No safety_data found in {file_path.name}")
                return False

        if not safety_data:
            print(f"⚠️  Empty safety_data in {file_path.name}")
            return False

        # Create normalized structure
        normalized_safety = {}

        # Process risk fields (card presentation)
        for field in RISK_FIELDS:
            if field in safety_data:
                value = safety_data[field]
                normalized_safety[field] = {
                    "presentation": "card",
                    "items": [value] if not isinstance(value, list) else value,
                }

        # Process descriptive fields
        for field in DESCRIPTIVE_FIELDS:
            if field in safety_data:
                value = safety_data[field]
                # fumes_generated is already an array
                if field == "fumes_generated" and isinstance(value, list):
                    normalized_safety[field] = {
                        "presentation": "descriptive",
                        "items": value,
                    }
                else:
                    normalized_safety[field] = {
                        "presentation": "descriptive",
                        "items": [value] if not isinstance(value, list) else value,
                    }

        # Place at correct location
        if "safety" not in data["relationships"]:
            data["relationships"]["safety"] = {}

        data["relationships"]["safety"].update(normalized_safety)

        # Save
        if not dry_run:
            save_yaml(file_path, data)
            print(f"✅ Migrated {file_path.name}")
        else:
            print(f"🔍 [DRY RUN] Would migrate {file_path.name}")
            print(f"   Fields: {list(normalized_safety.keys())}")

        return True

    except Exception as e:
        print(f"❌ Error migrating {file_path.name}: {e}")
        return False


# ============================================================================
# Compounds Migration
# ============================================================================


def migrate_compound(file_path: Path, dry_run: bool = False) -> bool:
    """
    Migrate compound safety data to normalized structure

    Converts string fields to structured objects
    Adds presentation wrappers and items arrays
    """
    try:
        data = load_yaml(file_path)

        # Get existing safety data
        if "safety" not in data.get("relationships", {}):
            print(f"⚠️  No safety section in {file_path.name}")
            return False

        safety = data["relationships"]["safety"]
        normalized_safety = {}
        changed = False

        # Process each field
        for field, value in safety.items():
            # Already normalized (has presentation and items)
            if isinstance(value, dict) and "presentation" in value and "items" in value:
                normalized_safety[field] = value
                continue

            # Needs normalization
            changed = True
            presentation = "card" if field in RISK_FIELDS else "descriptive"

            # Convert string to structured object
            if isinstance(value, str):
                # Parse string into basic structure
                normalized_safety[field] = {
                    "presentation": presentation,
                    "items": [
                        {
                            "description": value,
                            # Note: Additional fields would need LLM extraction
                            # For now, just preserve the string as description
                        }
                    ],
                }
            # Handle array values
            elif isinstance(value, list):
                normalized_safety[field] = {
                    "presentation": presentation,
                    "items": value,
                }
            # Handle dict values
            elif isinstance(value, dict):
                normalized_safety[field] = {
                    "presentation": presentation,
                    "items": [value],
                }
            # Handle null
            elif value is None:
                # Skip null values
                continue
            else:
                # Unknown type, preserve as-is
                normalized_safety[field] = value

        if not changed:
            print(f"ℹ️  {file_path.name} already normalized")
            return True

        # Update safety section
        data["relationships"]["safety"] = normalized_safety

        # Save
        if not dry_run:
            save_yaml(file_path, data)
            print(f"✅ Migrated {file_path.name}")
        else:
            print(f"🔍 [DRY RUN] Would migrate {file_path.name}")
            print(f"   Fields: {list(normalized_safety.keys())}")

        return True

    except Exception as e:
        print(f"❌ Error migrating {file_path.name}: {e}")
        return False


# ============================================================================
# Validation
# ============================================================================


def validate_normalized_structure(file_path: Path) -> List[str]:
    """Validate that file has correct normalized structure"""
    errors = []

    try:
        data = load_yaml(file_path)

        # Check safety location
        if "relationships" not in data:
            errors.append("Missing 'relationships' section")
            return errors

        if "safety" not in data["relationships"]:
            errors.append("Missing 'relationships.safety' section")
            return errors

        safety = data["relationships"]["safety"]

        # Validate each field
        for field, value in safety.items():
            # Must be a dict
            if not isinstance(value, dict):
                errors.append(f"{field}: Not a dict")
                continue

            # Must have presentation
            if "presentation" not in value:
                errors.append(f"{field}: Missing 'presentation'")
            elif value["presentation"] not in ["card", "descriptive"]:
                errors.append(
                    f"{field}: Invalid presentation '{value['presentation']}'"
                )

            # Must have items array
            if "items" not in value:
                errors.append(f"{field}: Missing 'items' array")
            elif not isinstance(value["items"], list):
                errors.append(f"{field}: 'items' is not an array")
            elif len(value["items"]) == 0:
                errors.append(f"{field}: 'items' array is empty")

    except Exception as e:
        errors.append(f"Error loading file: {e}")

    return errors


# ============================================================================
# Main Migration
# ============================================================================


def migrate_directory(
    content_type: str, backup: bool = True, dry_run: bool = False, validate: bool = True
) -> None:
    """Migrate all files in a directory"""

    if content_type == "contaminants":
        source_dir = CONTAMINANTS_DIR
        migrate_func = migrate_contaminant
    else:
        source_dir = COMPOUNDS_DIR
        migrate_func = migrate_compound

    # Create backup
    if backup and not dry_run:
        create_backup(content_type)

    # Get all YAML files
    files = list(source_dir.glob("*.yaml"))
    print(f"\n{'=' * 80}")
    print(f"Migrating {len(files)} {content_type} files...")
    print(f"{'=' * 80}\n")

    # Migrate each file
    success_count = 0
    error_count = 0

    for file_path in files:
        if migrate_func(file_path, dry_run):
            success_count += 1
        else:
            error_count += 1

    # Summary
    print(f"\n{'=' * 80}")
    print(f"Migration Summary for {content_type}")
    print(f"{'=' * 80}")
    print(f"✅ Success: {success_count}")
    print(f"❌ Errors: {error_count}")
    print(f"{'=' * 80}\n")

    # Validation
    if validate and not dry_run:
        print(f"\n{'=' * 80}")
        print(f"Validating {content_type}...")
        print(f"{'=' * 80}\n")

        validation_errors = []
        for file_path in files:
            errors = validate_normalized_structure(file_path)
            if errors:
                validation_errors.append((file_path.name, errors))

        if validation_errors:
            print(f"⚠️  Found {len(validation_errors)} files with validation errors:\n")
            for filename, errors in validation_errors:
                print(f"{filename}:")
                for error in errors:
                    print(f"  - {error}")
                print()
        else:
            print(f"✅ All files validated successfully!")


# ============================================================================
# CLI
# ============================================================================


def main():
    parser = argparse.ArgumentParser(
        description="Migrate safety data to normalized structure"
    )
    parser.add_argument(
        "--type",
        choices=["contaminants", "compounds", "all"],
        required=True,
        help="Content type to migrate",
    )
    parser.add_argument(
        "--backup",
        action="store_true",
        help="Create backup before migration (default: true)",
    )
    parser.add_argument("--no-backup", action="store_true", help="Skip backup creation")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be changed without modifying files",
    )
    parser.add_argument(
        "--no-validate", action="store_true", help="Skip validation after migration"
    )

    args = parser.parse_args()

    # Default backup to true unless explicitly disabled
    backup = not args.no_backup
    validate = not args.no_validate

    # Confirm if not dry run
    if not args.dry_run:
        print("\n⚠️  WARNING: This will modify frontmatter files!")
        print(f"   Type: {args.type}")
        print(f"   Backup: {'Yes' if backup else 'No'}")
        print()
        response = input("Continue? (y/N): ")
        if response.lower() != "y":
            print("Migration cancelled")
            sys.exit(0)

    # Run migration
    if args.type == "all":
        migrate_directory("contaminants", backup, args.dry_run, validate)
        migrate_directory("compounds", backup, args.dry_run, validate)
    else:
        migrate_directory(args.type, backup, args.dry_run, validate)


if __name__ == "__main__":
    main()
