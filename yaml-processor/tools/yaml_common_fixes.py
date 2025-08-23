#!/usr/bin/env python3
"""
YAML Common Issues Fixer

This script automatically fixes the most common YAML issues in frontmatter files:
1. Fixes duplicate frontmatter delimiters (---\n---\n -> ---\n)
2. Fixes indentation in list items (- item should be indented consistently)
3. Removes duplicate mapping keys (renames second occurrence to avoid data loss)
4. Fixes empty or incomplete properties (adds empty placeholder for missing values)
5. Skips empty files instead of trying to process them

Usage:
  python yaml_common_fixes.py <directory>
"""

import os
import re
import sys
import yaml
from pathlib import Path


def fix_duplicate_delimiters(content):
    """Fix duplicate frontmatter delimiters."""
    if re.match(r"^---\s*\n---\s*\n", content):
        return re.sub(r"^---\s*\n---\s*\n", "---\n", content), True
    return content, False


def fix_list_structure(content):
    """Fix list structure issues."""
    # Convert standalone list items at root level to proper indentation
    # Pattern matches list items at beginning of line (not properly indented under a key)
    pattern = r"^(\s*)- (benefit|result|component|material):"

    lines = content.split("\n")
    fixed = False

    # Fix indentation in nested list items
    # Look for lines like: "  - industry: X" followed by "  useCase: Y" (missing indentation)
    for i in range(len(lines) - 1):
        if re.match(r"(\s+)- \w+:", lines[i]) and re.match(
            r"(\s+)(?!-)\w+:", lines[i + 1]
        ):
            # Check if the indentation is the same (problem!)
            indent1 = re.match(r"(\s+)", lines[i]).group(1)
            indent2 = re.match(r"(\s+)", lines[i + 1]).group(1)

            if len(indent1) == len(indent2):
                # Add two more spaces to the second line
                lines[i + 1] = indent1 + "  " + lines[i + 1].lstrip()
                fixed = True

    # Fix consecutive list items where some are missing the dash
    # Pattern: "  - item1" followed by "  item2" (missing dash)
    for i in range(len(lines) - 1):
        if (
            i > 0
            and re.match(r"(\s+)- \w+:", lines[i - 1])
            and re.match(r"(\s+)(?!-)(\w+):", lines[i])
        ):
            # Only if they're at same indentation level and previous line was a list item
            indent1 = re.match(r"(\s+)", lines[i - 1]).group(1)
            indent2 = re.match(r"(\s+)", lines[i]).group(1)

            if len(indent1) == len(indent2):
                # Add dash to the line
                key_part = re.match(r"\s+(?!-)(\w+):", lines[i]).group(1)
                rest_of_line = lines[i][lines[i].find(key_part) + len(key_part) :]
                lines[i] = indent1 + "- " + key_part + rest_of_line
                fixed = True

    for i in range(len(lines)):
        match = re.match(pattern, lines[i])
        if match and match.group(1) == "":  # Only match root level items
            # Find the appropriate section to place this under
            section_key = match.group(2) + "s"  # Convert to plural for section name

            # Create a new section if it doesn't exist
            if f"{section_key}:" not in content:
                # Find a good place to insert the new section
                for j in range(i, 0, -1):
                    if re.match(r"^\w+:", lines[j]):
                        lines.insert(j + 1, f"{section_key}:")
                        lines[i + 1] = (
                            f"  {lines[i]}"  # Move the item under the new section
                        )
                        lines.pop(i)  # Remove the original item
                        fixed = True
                        break
            else:
                # Find the existing section and move this item there
                section_line = -1
                for j in range(len(lines)):
                    if lines[j].strip() == f"{section_key}:":
                        section_line = j
                        break

                if section_line >= 0:
                    # Insert at the appropriate indentation level
                    item_text = f"  {lines[i]}"  # Indent properly
                    lines.insert(section_line + 1, item_text)
                    lines.pop(i if i < section_line else i + 1)  # Remove the original
                    fixed = True

    return "\n".join(lines), fixed


def fix_duplicate_keys(content):
    """Fix duplicate mapping keys by renaming second occurrence."""
    try:
        # Try to identify the section with duplicate keys
        sections = re.split(r"^---\s*$", content, flags=re.MULTILINE)
        if len(sections) < 3:
            return content, False

        yaml_section = sections[1]

        # Look for common duplicated keys pattern
        duplicate_keys = ["description", "detail", "benefit"]

        fixed = False
        for key in duplicate_keys:
            # Look for pattern: key: value followed by same key later
            pattern = rf"(\n\s+{key}:.*?)(\n\s+{key}:)"
            match = re.search(pattern, yaml_section, re.DOTALL)

            if match:
                # Rename the second occurrence to avoid data loss
                replacement = f"{match.group(1)}\n    {key}_additional:"
                yaml_section = re.sub(pattern, replacement, yaml_section, count=1)
                fixed = True

        if fixed:
            # Reconstruct the document
            result = f"---\n{yaml_section}\n---"
            if len(sections) > 3:
                result += "\n".join(sections[3:])
            return result, True

        return content, False

    except Exception:
        # If any error occurs, return original content
        return content, False


def fix_empty_properties(content):
    """Fix empty or incomplete properties."""
    # Pattern for properties with missing values
    pattern = r"(\n\s+\w+):(\s*\n)"

    # Replace with empty object notation
    result = re.sub(pattern, r"\1: {}\2", content)

    # Fix lines ending with a colon followed by another property
    pattern2 = r"(\n\s+\w+):(\s*\n\s+\w+:)"
    result = re.sub(pattern2, r"\1: {}\2", result)

    # Fix property names without colons
    pattern3 = r"(\n\s*)(\w+)(\s*\n)"
    result = re.sub(
        pattern3,
        lambda m: m.group(1) + m.group(2) + ": {}" + m.group(3)
        if m.group(2).strip() not in ["---"]
        else m.group(0),
        result,
    )

    return result, result != content


def fix_nested_objects(content):
    """Fix nested object structures, particularly in the images section."""
    # Pattern for hero or closeup followed by indented properties
    pattern = r"(\n\s+)(hero|closeup):\s*{}\s*\n(\s+)(\w+):"

    # Check each occurrence
    matches = list(re.finditer(pattern, content))
    if not matches:
        return content, False

    # Fix each match
    fixed = False
    for match in reversed(matches):  # Process from end to avoid offset issues
        indent1 = match.group(1)  # Outer indentation
        key = match.group(2)  # hero or closeup
        indent2 = match.group(3)  # Inner indentation
        prop = match.group(4)  # Property (alt or url)

        # Ensure proper nesting - the inner property should be indented more than the outer
        if len(indent2) <= len(indent1) + 2:
            # Calculate correct indentation
            correct_indent = indent1 + "  "  # Add 2 spaces from parent

            # Replace the problematic section
            old_section = f"{indent1}{key}: {{}}\n{indent2}{prop}:"
            new_section = f"{indent1}{key}:\n{correct_indent}{prop}:"

            # Make the replacement
            content = content.replace(old_section, new_section)
            fixed = True

    return content, fixed


def fix_yaml_issues(file_path):
    """Apply all fixes to a YAML file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Skip empty or nearly empty files
        if len(content.strip()) < 10:
            return "Skipped empty file", False

        # Skip files with empty frontmatter (just --- and ---)
        if re.match(r"^---\s*\n\s*---\s*$", content.strip()):
            return "Skipped file with empty frontmatter", False

        fixes_applied = []

        # Apply fixes in sequence
        content, fixed = fix_duplicate_delimiters(content)
        if fixed:
            fixes_applied.append("duplicate delimiters")

        content, fixed = fix_list_structure(content)
        if fixed:
            fixes_applied.append("list structure")

        content, fixed = fix_duplicate_keys(content)
        if fixed:
            fixes_applied.append("duplicate keys")

        content, fixed = fix_empty_properties(content)
        if fixed:
            fixes_applied.append("empty properties")

        content, fixed = fix_nested_objects(content)
        if fixed:
            fixes_applied.append("nested objects")

        content, fixed = fix_quoted_list_literals(content)
        if fixed:
            fixes_applied.append("quoted list literals")

        # Fix property with value on next line (like "laserType: {}" followed by "Nd: YAG")
        pattern = r"(\n\s+\w+:\s*\{\})\s*\n\s+([^-\s]\S+:)"
        new_content = re.sub(pattern, r"\1\n  \2", content)
        if new_content != content:
            content = new_content
            fixes_applied.append("property value alignment")

        # Only write back if changes were made
        if fixes_applied:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            return f"Fixed: {', '.join(fixes_applied)}", True

        return "No issues found", False

    except Exception as e:
        return f"Error: {str(e)}", False


def fix_quoted_list_literals(content):
    """Fix quoted string literals that should be proper lists."""
    lines = content.split("\n")
    fixed = False

    # Look for patterns like:
    # keywords: "- Item1"
    # - Item2
    for i in range(len(lines)):
        # Match lines with quoted strings that start with a dash
        match = re.match(r'(\s*)(\w+):\s*"-(.*?)(?:"|$)', lines[i])
        if match:
            indent = match.group(1)
            key = match.group(2)
            item_text = match.group(3).strip()

            # Replace with proper list format
            lines[i] = f"{indent}{key}:\n{indent}  - {item_text}"
            fixed = True

            # Check if the next line is a list item at the same level
            j = i + 1
            while j < len(lines) and lines[j].strip().startswith("-"):
                # Add proper indentation to the list item
                list_match = re.match(r"(\s*)-(.*)", lines[j])
                if list_match:
                    lines[j] = f"{indent}  -{list_match.group(2)}"
                j += 1

    return "\n".join(lines), fixed


def validate_yaml(content):
    """Validate YAML content."""
    try:
        # Skip files with empty frontmatter
        if re.match(r"^---\s*\n\s*---\s*$", content.strip()):
            return True, "Skipped file with empty frontmatter"

        # Extract YAML section between --- markers
        match = re.search(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
        if not match:
            return False, "No valid frontmatter found"

        yaml_content = match.group(1)
        yaml.safe_load(yaml_content)
        return True, "Valid YAML"

    except yaml.YAMLError as e:
        return False, f"YAML validation error: {str(e)}"
    except Exception as e:
        return False, f"Validation error: {str(e)}"
    try:
        # Skip files with empty frontmatter
        if re.match(r"^---\s*\n\s*---\s*$", content.strip()):
            return True, "Skipped file with empty frontmatter"

        # Extract YAML section between --- markers
        match = re.search(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
        if not match:
            return False, "No valid frontmatter found"

        yaml_content = match.group(1)
        yaml.safe_load(yaml_content)
        return True, "Valid YAML"

    except yaml.YAMLError as e:
        return False, f"YAML validation error: {str(e)}"
    except Exception as e:
        return False, f"Validation error: {str(e)}"


def main():
    """Main function to process all markdown files in a directory."""
    if len(sys.argv) < 2:
        print("Usage: python yaml_common_fixes.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory")
        sys.exit(1)

    # Find all markdown files in the directory
    files = list(Path(directory).rglob("*.md"))

    fixed_count = 0
    skipped_count = 0
    error_count = 0
    validation_failures = 0

    print(f"Processing {len(files)} files...")

    for file_path in files:
        result, fixed = fix_yaml_issues(file_path)

        if "Skipped" in result:
            skipped_count += 1
            print(f"⚠ {file_path}: {result}")
        elif "Error" in result:
            error_count += 1
            print(f"✗ {file_path}: {result}")
        elif fixed:
            fixed_count += 1
            print(f"✓ {file_path}: {result}")

            # Validate the fixed file
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                valid, message = validate_yaml(content)
                if not valid:
                    validation_failures += 1
                    print(f"  → Validation failed: {message}")
            except Exception as e:
                validation_failures += 1
                print(f"  → Validation error: {str(e)}")
        else:
            print(f"- {file_path}: {result}")

    print(
        f"\nSummary: {fixed_count} files fixed, {skipped_count} files skipped, "
        f"{error_count} errors, {validation_failures} validation failures"
    )


if __name__ == "__main__":
    main()
