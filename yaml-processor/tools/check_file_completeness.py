#!/usr/bin/env python3
"""
Simple script to check if a single file meets completeness criteria.
"""

import sys
import yaml
from pathlib import Path


def check_file_completeness(file_path, required_fields=None):
    """
    Check if a file is complete and ready for processing.

    Args:
        file_path: Path to the file to check
        required_fields: List of required fields

    Returns:
        Tuple of (is_complete, reason_if_incomplete)
    """
    required_fields = required_fields or ["name", "description"]
    file_path = Path(file_path)

    try:
        # Check if file exists
        if not file_path.exists():
            return False, "File does not exist"

        # Read the file content
        content = file_path.read_text(encoding="utf-8")  # Check if file is empty
        if not content.strip():
            return False, "Empty file"

        # Check for frontmatter delimiters
        parts = content.split("---", 2)
        if len(parts) < 3:
            return False, "Missing frontmatter delimiters"

        frontmatter = parts[1]
        body = parts[2]

        # Try to parse YAML to check for basic validity
        try:
            yaml_content = yaml.safe_load(frontmatter)
            if not isinstance(yaml_content, dict):
                return False, "Frontmatter not a valid YAML dictionary"

            # Check for minimum content after frontmatter
            if not body.strip():
                # For certain file types, content is optional
                if yaml_content.get("article_type") == "material" or "component" in str(
                    file_path
                ):
                    # These files can have empty content after frontmatter
                    pass
                else:
                    return False, "No content after frontmatter"
        except Exception:
            return False, "Invalid YAML in frontmatter"

        # Check for required fields
        if yaml_content:
            for field in required_fields:
                if field not in yaml_content or not yaml_content[field]:
                    return False, f"Missing required field '{field}'"

        return True, "File is complete"
    except Exception as e:
        return False, f"Error checking completeness: {e}"


def main():
    if len(sys.argv) < 2:
        print("Usage: python check_file_completeness.py <file_path> [required_fields]")
        sys.exit(1)

    file_path = sys.argv[1]
    required_fields = (
        sys.argv[2].split(",") if len(sys.argv) > 2 else ["name", "description"]
    )

    is_complete, reason = check_file_completeness(file_path, required_fields)

    if is_complete:
        print(f"✅ {file_path} is complete!")
    else:
        print(f"❌ {file_path} is incomplete: {reason}")
        sys.exit(1)


if __name__ == "__main__":
    main()
