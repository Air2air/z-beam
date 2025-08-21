#!/usr/bin/env python3
"""
Z-Beam YAML Validator
=====================

This script validates YAML frontmatter in markdown files without modifying them.
It also checks for file completeness based on required fields and structure.

Features:
- Validates YAML structure without modifying files
- Identifies files with issues that would be fixed by the processor
- Checks for file completeness based on required fields
- Timeout protection for processing large files
- Detailed reporting of issues found

Usage:
  python yaml_validator.py [paths...] [options]

Options:
  --timeout SECONDS  Set timeout for processing each file (default: 10)
  --verbose          Show detailed processing information
  --required-fields  Comma-separated list of required fields (default: name,description)
"""

import re
import sys
import yaml
import time
import signal
import argparse
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple, Set, Optional, Any


class YamlValidator:
    """
    Validates YAML frontmatter in markdown files without modifying them.
    Also checks for file completeness.
    """

    def __init__(
        self,
        verbose: bool = False,
        timeout: int = 10,
        required_fields: List[str] = None,
    ) -> None:
        """
        Initialize the validator.

        Args:
            verbose: Whether to print verbose output
            timeout: Maximum time in seconds to process a single file
            required_fields: List of required frontmatter fields to check for completeness
        """
        self.verbose = verbose
        self.timeout = timeout
        self.required_fields = required_fields or ["name", "description"]

        # Statistics and tracking
        self.stats = {
            "files_processed": 0,
            "files_with_issues": 0,
            "files_incomplete": 0,
            "files_skipped": 0,
        }
        self.files_with_issues = []
        self.incomplete_files = []
        self.skipped_files = []

        # Error patterns to detect (same as in the processor)
        self.error_patterns = self._build_error_patterns()

    def _build_error_patterns(self) -> Dict[str, List[Dict]]:
        """
        Build a dictionary of error patterns to detect.
        Each pattern includes a regex to match and a replacement.
        """
        patterns = {
            "encoding_issues": [
                {
                    "name": "non_printable_chars",
                    "pattern": re.compile(r"[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]"),
                    "description": "Contains non-printable ASCII characters",
                },
                {
                    "name": "zero_width_space",
                    "pattern": re.compile(r"\u200B"),
                    "description": "Contains zero-width spaces",
                },
                {
                    "name": "utf8_bom",
                    "pattern": re.compile(r"\ufeff"),
                    "description": "Contains UTF-8 BOM",
                },
            ],
            "indentation_issues": [
                {
                    "name": "inconsistent_indentation",
                    "pattern": re.compile(r"^( +)(\w+):", re.MULTILINE),
                    "description": "Has inconsistent indentation",
                },
                {
                    "name": "tab_indentation",
                    "pattern": re.compile(r"^\t+(\w+):", re.MULTILINE),
                    "description": "Uses tabs for indentation",
                },
            ],
            "quote_issues": [
                {
                    "name": "unquoted_colon_in_value",
                    "pattern": re.compile(r": (.+:.+)$", re.MULTILINE),
                    "description": "Contains unquoted values with colons",
                },
                {
                    "name": "missing_quotes_for_special_chars",
                    "pattern": re.compile(r": ([^\"]+[&@#%*].+)$", re.MULTILINE),
                    "description": "Contains unquoted special characters",
                },
            ],
            "array_issues": [
                {
                    "name": "malformed_array_item",
                    "pattern": re.compile(r"^( +)-([^ ])(.*)$", re.MULTILINE),
                    "description": "Has malformed array items (missing space after dash)",
                },
                {
                    "name": "misaligned_array",
                    "pattern": re.compile(r"^(\w+):\s*-\s+", re.MULTILINE),
                    "description": "Contains misaligned array items",
                },
            ],
            "structure_issues": [
                {
                    "name": "missing_space_after_colon",
                    "pattern": re.compile(r"^(\s*\w+):([^\s\n])", re.MULTILINE),
                    "description": "Missing space after colon",
                },
                {
                    "name": "multiple_empty_lines",
                    "pattern": re.compile(r"\n{3,}"),
                    "description": "Contains multiple empty lines",
                },
            ],
        }
        return patterns

    def _is_markdown_file(self, file_path: Path) -> bool:
        """Check if a file is a markdown file based on extension."""
        return file_path.suffix.lower() in [".md", ".markdown"]

    def _has_frontmatter(self, file_path: Path) -> bool:
        """Check if a file has frontmatter."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read(100)
                return content.strip().startswith("---")
        except Exception as e:
            if self.verbose:
                print(f"  ⚠️  Cannot read {file_path.name}: {e}")
            return False

    def _is_file_complete(self, file_path: Path) -> Tuple[bool, Optional[str]]:
        """
        Check if a file is complete and ready for processing.
        A complete file has:
        1. Valid frontmatter delimiters
        2. All required fields
        3. Minimum content length

        Returns:
            Tuple of (is_complete, reason_if_incomplete)
        """
        try:
            # Check if file exists
            if not file_path.exists():
                return False, f"File does not exist: {file_path}"

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

                # Check for minimum content after frontmatter - allow empty content for certain file types
                if not body.strip():
                    # For certain file types like frontmatter components, content is optional
                    if yaml_content.get(
                        "article_type"
                    ) == "material" or "component" in str(file_path):
                        # These files can have empty content after frontmatter
                        pass
                    else:
                        return False, "No content after frontmatter"
            except yaml.YAMLError:
                return False, "Invalid YAML in frontmatter"

            # Check for required fields
            if yaml_content:
                for field in self.required_fields:
                    if field not in yaml_content or not yaml_content[field]:
                        return False, f"Missing required field '{field}'"

            return True, None
        except Exception as e:
            return False, f"Error checking completeness: {e}"

    def _timeout_handler(self, signum, frame):
        """Handle timeout when processing a file takes too long."""
        raise TimeoutError(f"Processing took more than {self.timeout} seconds")

    def _has_yaml_issues(self, content: str) -> Tuple[bool, List[str]]:
        """
        Check if the YAML content has issues that would be fixed by the processor.

        Args:
            content: The YAML content to check

        Returns:
            Tuple of (has_issues, list_of_issues)
        """
        has_issues = False
        issues = []

        # Check each pattern category
        for category, patterns in self.error_patterns.items():
            for pattern_def in patterns:
                pattern = pattern_def["pattern"]
                description = pattern_def["description"]
                pattern_name = pattern_def["name"]

                # Check if the pattern matches
                if pattern.search(content):
                    has_issues = True
                    issue = f"{category}/{pattern_name}: {description}"
                    issues.append(issue)

        return has_issues, issues

    def _validate_file(self, file_path: Path) -> None:
        """Validate a single markdown file with timeout protection."""
        # Set up timeout handler
        original_handler = signal.signal(signal.SIGALRM, self._timeout_handler)
        signal.alarm(self.timeout)

        start_time = time.time()

        try:
            # First check if the file is complete
            is_complete, incomplete_reason = self._is_file_complete(file_path)
            if not is_complete:
                print(f"  ⚠️ Incomplete file: {file_path.name} - {incomplete_reason}")
                self.incomplete_files.append((str(file_path), incomplete_reason))
                self.stats["files_incomplete"] += 1
                return

            # Read the file content
            content = file_path.read_text(encoding="utf-8")

            # Process existing frontmatter
            parts = content.split("---", 2)
            if len(parts) < 3:
                print(f"  ⚠️ No frontmatter found in {file_path.name}")
                return

            frontmatter = parts[1]

            # Check for YAML issues
            has_issues, issues = self._has_yaml_issues(frontmatter)

            if has_issues:
                self.files_with_issues.append((str(file_path), issues))
                self.stats["files_with_issues"] += 1

                if self.verbose:
                    print(f"  ⚠️ Issues found in {file_path.name}:")
                    for issue in issues:
                        print(f"    - {issue}")
                else:
                    print(f"  ⚠️ Issues found in {file_path.name}")
            else:
                if self.verbose:
                    print(f"  ✓ No issues found in {file_path.name}")

        except TimeoutError as e:
            print(f"  ⚠️ Timeout validating {file_path.name}: {e}")
            self.skipped_files.append((str(file_path), "Timeout"))
            self.stats["files_skipped"] += 1
        except Exception as e:
            print(f"  ⚠️ Error validating {file_path.name}: {e}")
            self.skipped_files.append((str(file_path), str(e)))
            self.stats["files_skipped"] += 1
        finally:
            # Reset alarm and restore original handler
            signal.alarm(0)
            signal.signal(signal.SIGALRM, original_handler)

            # Update processing count
            self.stats["files_processed"] += 1

            # Calculate processing time
            processing_time = time.time() - start_time
            if self.verbose and processing_time > 1.0:
                print(f"  ⏱️ Processing time: {processing_time:.2f}s")

    def validate_files(self, paths: List[Path]) -> None:
        """
        Validate markdown files in the given paths.

        Args:
            paths: List of file or directory paths to validate
        """
        # Track total files
        total_files = 0
        files_to_validate = []

        # Collect all files to validate
        for path in paths:
            if path.is_dir():
                md_files = [
                    f
                    for f in path.glob("**/*.md")
                    if self._is_markdown_file(f) and self._has_frontmatter(f)
                ]
                total_files += len(md_files)
                files_to_validate.extend(md_files)
            elif (
                path.is_file()
                and self._is_markdown_file(path)
                and self._has_frontmatter(path)
            ):
                total_files += 1
                files_to_validate.append(path)

        if total_files == 0:
            print("No markdown files with frontmatter found.")
            return

        print(f"Validating {total_files} markdown files...")

        # Validate each file
        for idx, file_path in enumerate(files_to_validate):
            print(f"[{idx + 1}/{total_files}] Validating {file_path.name}")
            self._validate_file(file_path)

        # Print summary
        self._print_summary()

    def _print_summary(self) -> None:
        """Print a summary of the validation results."""
        print("\n📊 Validation Summary:")
        print(f"  Total files processed: {self.stats['files_processed']}")
        print(
            f"  Files with issues that would be fixed: {self.stats['files_with_issues']}"
        )
        print(f"  Files that are incomplete: {self.stats['files_incomplete']}")
        print(f"  Files skipped due to errors: {self.stats['files_skipped']}")

        if self.stats["files_with_issues"] > 0:
            print("\n⚠️ Files with issues that would be fixed:")
            for file_path, issues in self.files_with_issues:
                print(f"  - {file_path}")
                if self.verbose:
                    for issue in issues:
                        print(f"    * {issue}")

        if self.stats["files_incomplete"] > 0:
            print("\n⚠️ Incomplete files that would be skipped:")
            for file_path, reason in self.incomplete_files:
                print(f"  - {file_path}: {reason}")

        if self.stats["files_skipped"] > 0:
            print("\n⚠️ Files skipped due to errors:")
            for file_path, reason in self.skipped_files:
                print(f"  - {file_path}: {reason}")


def main() -> None:
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description="Validate YAML frontmatter in markdown files without modifying them."
    )
    parser.add_argument(
        "paths", nargs="+", help="Paths to validate (files or directories)"
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Enable verbose output"
    )
    parser.add_argument(
        "-t",
        "--timeout",
        type=int,
        default=10,
        help="Timeout in seconds for processing a single file",
    )
    parser.add_argument(
        "-r",
        "--required-fields",
        type=str,
        default="name,description",
        help="Comma-separated list of required fields for completeness check",
    )

    args = parser.parse_args()

    # Convert paths to Path objects
    paths = [Path(p) for p in args.paths]

    # Convert required fields string to list
    required_fields = (
        args.required_fields.split(",")
        if args.required_fields
        else ["name", "description"]
    )

    # Create validator
    validator = YamlValidator(
        verbose=args.verbose, timeout=args.timeout, required_fields=required_fields
    )

    # Validate files
    validator.validate_files(paths)


if __name__ == "__main__":
    main()
