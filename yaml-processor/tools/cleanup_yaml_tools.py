#!/usr/bin/env python3
"""
Script to clean up obsolete YAML processing files and move them to an archive directory.
"""

import shutil
from pathlib import Path

# Files to archive (obsolete or one-time-use scripts)
files_to_archive = [
    "update_yaml_processor.py",
    "check_yaml_changes.py",
    "check_external_yaml_changes.py",
    "run_yaml_processor.py",
    "yaml_validator.py",  # replaced by yaml_validator_new.py
]

# Create archive directory if it doesn't exist
archive_dir = Path("archive")
archive_dir.mkdir(exist_ok=True)

# Move files to archive
moved_files = []
for filename in files_to_archive:
    source_path = Path(filename)
    if source_path.exists():
        dest_path = archive_dir / filename
        shutil.move(source_path, dest_path)
        moved_files.append(filename)
        print(f"Moved {filename} to archive/")
    else:
        print(f"File {filename} not found, skipping")

if moved_files:
    print(f"\n✅ Successfully archived {len(moved_files)} obsolete files.")
else:
    print("\nNo files were archived.")

print("\nThe following active YAML-related files remain:")
print("- yaml_validator_new.py  (validates YAML and checks completeness)")
print("- check_file_completeness.py  (utility to check individual files)")
print("- tests/test_yaml_validator.py  (test suite)")
print("- yaml-processor/yaml_processor.py  (main YAML processor)")
print("- docs/YAML_COMPLETENESS_CHECKING.md  (documentation)")
