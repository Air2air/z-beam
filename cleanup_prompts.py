#!/usr/bin/env python3
"""
Cleanup script to remove old text-based prompt files that have been migrated to JSON format.
"""

import os
import shutil
import argparse


def backup_directory(dir_path, backup_name=None):
    """Create a backup of a directory before removing files."""
    if backup_name is None:
        backup_name = f"{os.path.basename(dir_path)}_backup"

    backup_path = os.path.join(os.path.dirname(dir_path), backup_name)
    if os.path.exists(dir_path):
        print(f"Creating backup of {dir_path} to {backup_path}")
        shutil.copytree(dir_path, backup_path, dirs_exist_ok=True)
    return backup_path


def remove_txt_files(dir_path, dry_run=True):
    """Remove all .txt files from a directory."""
    if not os.path.exists(dir_path):
        print(f"Directory {dir_path} does not exist")
        return []

    removed_files = []
    for root, _, files in os.walk(dir_path):
        for file in files:
            if file.endswith(".txt"):
                file_path = os.path.join(root, file)
                if dry_run:
                    print(f"Would remove: {file_path}")
                else:
                    print(f"Removing: {file_path}")
                    os.remove(file_path)
                removed_files.append(file_path)

    return removed_files


def main():
    parser = argparse.ArgumentParser(description="Cleanup old prompt text files")
    parser.add_argument(
        "--no-backup", action="store_true", help="Skip creating backups"
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Actually delete files (default is dry run)",
    )
    args = parser.parse_args()

    # Get project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Directories to clean
    detection_dir = os.path.join(script_dir, "generator", "prompts", "detection")
    sections_dir = os.path.join(script_dir, "generator", "prompts", "sections")

    # Create backups if not skipped
    if not args.no_backup:
        backup_directory(detection_dir)
        backup_directory(sections_dir)

    # Remove txt files
    dry_run = not args.execute
    mode = "DRY RUN" if dry_run else "EXECUTE"
    print(f"\n===== {mode}: REMOVING OLD PROMPT FILES =====")

    detection_files = remove_txt_files(detection_dir, dry_run)
    sections_files = remove_txt_files(sections_dir, dry_run)

    print(f"\nSummary ({mode}):")
    print(f"Detection prompt files: {len(detection_files)} files")
    print(f"Sections prompt files: {len(sections_files)} files")

    if dry_run:
        print("\nThis was a dry run. No files were actually removed.")
        print("Run with --execute to actually remove the files.")
    else:
        print("\nFiles were successfully removed.")


if __name__ == "__main__":
    main()
