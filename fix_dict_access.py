#!/usr/bin/env python3
"""
Script to update dictionary accesses in content_generator.py to use .get() method
for safer access to dictionary keys that might be missing.
"""

import re
import os


def fix_dict_access(file_path):
    """Replace dictionary["key"] with dictionary.get("key") for safer access."""

    with open(file_path, "r") as file:
        content = file.read()

    # Pattern to find dict["key"] accesses
    pattern = r'(\w+_settings)\["(\w+)"\]'

    # Replace with dict.get("key")
    fixed_content = re.sub(pattern, r'\1.get("\2")', content)

    # Write the updated content back to the file
    with open(file_path, "w") as file:
        file.write(fixed_content)

    print(f"Updated dictionary accesses in {file_path}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_file = os.path.join(
        script_dir, "generator", "modules", "content_generator.py"
    )

    if os.path.exists(target_file):
        fix_dict_access(target_file)
        print("Successfully fixed dictionary accesses")
    else:
        print(f"Error: File not found at {target_file}")
