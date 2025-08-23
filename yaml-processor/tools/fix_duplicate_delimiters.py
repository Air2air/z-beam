#!/usr/bin/env python3
"""
Fix Duplicate YAML Delimiters Script

This script fixes markdown files with duplicate frontmatter delimiters.
It also handles cases where the processor incorrectly reports "no frontmatter found"
despite the file having frontmatter with duplicate delimiters.
"""

import os
import re
import sys
from pathlib import Path


def fix_duplicate_delimiters(file_path):
    """Fix duplicate frontmatter delimiters in a markdown file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Skip empty or nearly empty files
        if len(content.strip()) < 10:
            return False, "Skipping empty or incomplete file"

        # Skip files with empty frontmatter (just --- and ---)
        if re.match(r"^---\s*\n\s*---\s*$", content.strip()):
            return False, "Skipping file with empty frontmatter"

        # Enhanced pattern to detect different forms of duplicate delimiters
        # This covers cases like:
        # 1. ---\n---\n (two delimiters at start)
        # 2. ---\n\n---\n (two delimiters with blank line)
        # 3. ---\n \n---\n (two delimiters with whitespace line)
        # 4. ---\r\n---\r\n (Windows line endings)
        # 5. ---\r\n\r\n---\r\n (Windows line endings with blank line)
        has_duplicate = False
        
        # Normalize line endings for consistent processing
        content = content.replace("\r\n", "\n")
        
        # Pattern 1: Direct duplicate delimiters at start
        if re.match(r"^---\s*\n---\s*\n", content):
            content = re.sub(r"^---\s*\n---\s*\n", "---\n", content)
            has_duplicate = True
        
        # Pattern 2: Duplicate delimiters with blank lines between
        elif re.match(r"^---\s*\n\s*\n---\s*\n", content):
            content = re.sub(r"^---\s*\n\s*\n---\s*\n", "---\n", content)
            has_duplicate = True
        
        # Pattern 3: Multiple consecutive delimiter lines (more than 2 in a row)
        elif re.match(r"^(---\s*\n){2,}", content):
            content = re.sub(r"^(---\s*\n)+", "---\n", content)
            has_duplicate = True
            
        # Pattern 4: Handle cases with odd spacing or comments between delimiters
        elif re.match(r"^---\s*\n(?:\s*(?:#[^\n]*)?\n)*---\s*\n", content):
            content = re.sub(r"^---\s*\n(?:\s*(?:#[^\n]*)?\n)*---\s*\n", "---\n", content)
            has_duplicate = True
            
        # Check for malformed YAML with "no frontmatter found" errors
        # This happens when the file has a valid opening delimiter but might be missing
        # a closing delimiter or has other structural issues
        if not has_duplicate and content.startswith("---\n") and (":" in content[:500] or re.search(r"^\s*-\s+", content[:500], re.MULTILINE)):
            # Check if the file has valid YAML content after first delimiter
            if not re.search(r"^---\s*\n.*?\n---", content, re.DOTALL):
                # We have an opening delimiter and YAML-like content but no proper closing
                # Search for the last line of potential YAML content
                lines = content.split("\n")
                yaml_end_idx = 0
                
                # Find a reasonable endpoint for the YAML content
                yaml_like_count = 0
                for i, line in enumerate(lines[1:], 1):
                    if line.strip() == "---":
                        yaml_end_idx = i
                        break
                    
                    # Count lines that look like YAML
                    if re.search(r'^\s*[\w\-]+:', line) or line.strip().startswith('-'):
                        yaml_like_count += 1
                    
                    # If we find a line that doesn't look like YAML and we've seen some YAML-like lines
                    if (line.strip() and not re.search(r'^\s*[\w\-]+:', line) and 
                        not line.strip().startswith('-') and not line.strip().startswith('#') and
                        yaml_like_count > 0):
                        # This might be where content starts
                        yaml_end_idx = i
                        break
                
                # If we found a potential end, insert the missing closing delimiter
                if yaml_end_idx > 0:
                    content_lines = lines[:yaml_end_idx] + ["---"] + lines[yaml_end_idx:]
                    content = "\n".join(content_lines)
                    has_duplicate = True  # Not actually duplicate, but structure fixed

        # Special handling for the "no frontmatter found" false negative case
        # This is the most common case where files with duplicate delimiters get incorrectly
        # reported as having no frontmatter
        if not has_duplicate and content.startswith("---\n"):
            # Look for YAML-like content in the first part of the file
            yaml_indicator = False
            first_lines = content.split("\n", 20)[:20]  # Get first 20 lines max
            
            for line in first_lines[1:]:  # Skip first line (---)
                if line.strip() == "---":
                    # Found a potential closing delimiter
                    yaml_indicator = True
                    break
                if ":" in line or (line.strip() and line.strip().startswith("-")):
                    # This looks like YAML content
                    yaml_indicator = True
            
            if yaml_indicator:
                # This file likely has frontmatter but might have structural issues
                # Check for the presence of a second delimiter
                if not re.search(r"\n---\s*\n", content):
                    # No second delimiter found, try to detect where YAML ends
                    lines = content.split("\n")
                    yaml_section_end = 0
                    non_yaml_line_found = False
                    
                    for i, line in enumerate(lines[1:], 1):  # Skip first line (---)
                        # If we find a line that looks like the start of markdown content
                        if line.strip() and not ":" in line and not line.strip().startswith("-") and not line.strip().startswith("#"):
                            if not non_yaml_line_found:
                                yaml_section_end = i
                                non_yaml_line_found = True
                    
                    if yaml_section_end > 0:
                        # Insert the missing closing delimiter
                        content_lines = lines[:yaml_section_end] + ["---"] + lines[yaml_section_end:]
                        content = "\n".join(content_lines)
                        has_duplicate = True  # Structure fixed
                    else:
                        # If we couldn't find a clear end to YAML, place the delimiter after any apparent YAML content
                        yaml_like_lines = []
                        for i, line in enumerate(lines[1:], 1):
                            if ":" in line or line.strip().startswith("-"):
                                yaml_like_lines.append(i)
                        
                        if yaml_like_lines:
                            yaml_section_end = max(yaml_like_lines) + 1
                            content_lines = lines[:yaml_section_end] + ["---"] + lines[yaml_section_end:]
                            content = "\n".join(content_lines)
                            has_duplicate = True  # Structure fixed

        if has_duplicate:
            # Write the fixed content back to the file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

            return True, "Fixed duplicate or malformed frontmatter delimiters"
                            
        return False, "No duplicate delimiters found"

    except Exception as e:
        return False, f"Error: {str(e)}"


def validate_yaml_structure(file_path):
    """Validate that the file has proper YAML frontmatter structure."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Skip empty or nearly empty files
        if len(content.strip()) < 10:
            return True, "Skipping empty or incomplete file"

        # Skip files with empty frontmatter (just --- and ---)
        if re.match(r"^---\s*\n\s*---\s*$", content.strip()):
            return True, "Skipping file with empty frontmatter"

        # Check for basic YAML frontmatter structure
        if not re.match(r"^---\s*\n.*?\n---", content, re.DOTALL):
            # Special case: If the file starts with a delimiter and has YAML-like content
            # but the processor reported "no frontmatter", this is a potential false negative
            if content.startswith("---\n") and ":" in content[:500]:
                return False, "Potential false negative: File has opening delimiter and YAML content"
            return False, "Invalid frontmatter structure"

        # Count occurrences of '---' in the file
        delimiter_count = len(re.findall(r"^---\s*$", content, re.MULTILINE))
        if delimiter_count != 2:
            return False, f"Found {delimiter_count} delimiters instead of 2"

        # Ensure the file has valid key-value pairs between delimiters
        frontmatter = content.split("---", 2)[1]
        if ":" not in frontmatter:
            return False, "No valid key-value pairs found in frontmatter"

        return True, "Valid YAML structure"

    except Exception as e:
        return False, f"Error during validation: {str(e)}"


def check_for_false_negative(file_path):
    """
    Check if a file might have frontmatter but was incorrectly reported as not having any.
    This handles the specific case where the YAML processor reports "No frontmatter found"
    but the file actually has frontmatter with structural issues.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Skip very small files
        if len(content.strip()) < 20:
            return False, "File too small"
            
        # Check if the file starts with a delimiter
        if content.startswith("---\n") or content.startswith("---\r\n"):
            # Look for YAML-like content in the first 500 characters
            first_500 = content[:500]
            
            # Check for key-value patterns that suggest YAML frontmatter
            if re.search(r"^\s*[\w\-]+:\s", first_500, re.MULTILINE):
                return True, "File has opening delimiter and YAML-like content"
                
            # Check for list items that suggest YAML frontmatter
            if re.search(r"^\s*-\s", first_500, re.MULTILINE):
                return True, "File has opening delimiter and YAML list items"
                
        return False, "No indication of frontmatter structure"
            
    except Exception as e:
        return False, f"Error checking for false negative: {str(e)}"


def main():
    """Main function to process all markdown files in a directory."""
    if len(sys.argv) < 2:
        print("Usage: python fix_duplicate_delimiters.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory")
        sys.exit(1)

    # Find all markdown files in the directory
    files = list(Path(directory).rglob("*.md"))

    fixed_count = 0
    skipped_count = 0
    validation_failures = 0
    false_negatives = 0

    print(f"Processing {len(files)} files...")

    for file_path in files:
        # First, attempt to fix any duplicate delimiters
        fixed, message = fix_duplicate_delimiters(file_path)

        if "Skipping empty" in message:
            skipped_count += 1
            print(f"⚠ {file_path}: {message}")
            continue

        if fixed:
            fixed_count += 1
            print(f"✓ {file_path}: {message}")

        # Then validate the structure (for non-empty files)
        valid, val_message = validate_yaml_structure(file_path)
        if not valid:
            validation_failures += 1
            print(f"✗ {file_path}: {val_message}")
            
            # Check if this might be a false negative (file has frontmatter but was reported as not having any)
            is_false_negative, fn_message = check_for_false_negative(file_path)
            if is_false_negative:
                false_negatives += 1
                print(f"⚠ False negative detection: {file_path}: {fn_message}")
                
                # Attempt to fix the false negative
                fn_fixed, fn_fix_message = fix_duplicate_delimiters(file_path)
                if fn_fixed:
                    print(f"✓ Fixed false negative: {file_path}: {fn_fix_message}")

    print(
        f"\nSummary: {fixed_count} files fixed, {skipped_count} files skipped, {validation_failures} validation failures"
    )
    if false_negatives > 0:
        print(f"Detected {false_negatives} potential false negatives (files with frontmatter reported as not having any)")


if __name__ == "__main__":
    main()
