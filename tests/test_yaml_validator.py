#!/usr/bin/env python3
"""
Test script for YAML validator completeness checking.

This script runs tests against our YAML validator to ensure that file completeness
checking works correctly for different types of files.
"""

import sys
import unittest
from pathlib import Path

# Add parent directory to path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

from check_file_completeness import check_file_completeness
from yaml_validator import YamlValidator


class TestFileCompleteness(unittest.TestCase):
    """Test file completeness checking."""

    def setUp(self):
        """Set up test cases."""
        self.test_dir = Path(__file__).parent / "yaml_validator"

        # Define test files and expected results
        self.test_cases = [
            {
                "file": "complete_file.md",
                "required_fields": ["name", "description"],
                "expected_complete": True,
                "reason": "File is complete",
            },
            {
                "file": "empty_content_file.md",
                "required_fields": ["name", "description"],
                "expected_complete": False,  # Should be false because our validator requires content
                "reason": "No content after frontmatter",
            },
            {
                "file": "material_component_file.md",
                "required_fields": [
                    "name",
                    "description",
                    "applications",
                    "technicalSpecifications",
                ],
                "expected_complete": True,
                "reason": "Material component file is complete",
            },
            {
                "file": "missing_required_fields.md",
                "required_fields": ["name", "description"],
                "expected_complete": False,
                "reason": "Missing required field 'description'",
            },
            {
                "file": "invalid_yaml_file.md",
                "required_fields": ["name", "description"],
                "expected_complete": False,
                "reason": "Invalid YAML in frontmatter",
            },
            {
                "file": "no_frontmatter_file.md",
                "required_fields": ["name", "description"],
                "expected_complete": False,
                "reason": "Missing frontmatter delimiters",
            },
            {
                "file": "empty_file.md",
                "required_fields": ["name", "description"],
                "expected_complete": False,
                "reason": "Empty file",
            },
            {
                "file": "non_existent_file.md",  # This file doesn't exist
                "required_fields": ["name", "description"],
                "expected_complete": False,
                "reason": "File does not exist",
            },
        ]

    def test_check_file_completeness(self):
        """Test the check_file_completeness function."""
        for test_case in self.test_cases:
            file_path = self.test_dir / test_case["file"]
            required_fields = test_case["required_fields"]
            expected_complete = test_case["expected_complete"]

            # Handle the non-existent file case specially
            if test_case["file"] == "non_existent_file.md":
                file_path = self.test_dir / "this_file_does_not_exist.md"

            is_complete, reason = check_file_completeness(file_path, required_fields)

            self.assertEqual(
                is_complete,
                expected_complete,
                f"Failed on {test_case['file']}: expected {expected_complete}, got {is_complete}, reason: {reason}",
            )

            # If we expect incomplete, check that the reason starts with the expected reason
            if not expected_complete and test_case["reason"] != "File is complete":
                self.assertTrue(
                    reason.startswith(test_case["reason"])
                    or test_case["reason"] in reason,
                    f"Failed on {test_case['file']}: expected reason to contain '{test_case['reason']}', got '{reason}'",
                )

    def test_yaml_validator_is_file_complete(self):
        """Test the YamlValidator._is_file_complete method."""
        validator = YamlValidator(verbose=True)

        for test_case in self.test_cases:
            file_path = self.test_dir / test_case["file"]
            validator.required_fields = test_case["required_fields"]
            expected_complete = test_case["expected_complete"]

            # Handle the non-existent file case specially
            if test_case["file"] == "non_existent_file.md":
                file_path = self.test_dir / "this_file_does_not_exist.md"

            is_complete, reason = validator._is_file_complete(file_path)

            self.assertEqual(
                is_complete,
                expected_complete,
                f"Failed on {test_case['file']}: expected {expected_complete}, got {is_complete}, reason: {reason}",
            )

            # If we expect incomplete, check that the reason starts with the expected reason
            if not expected_complete and test_case["reason"] != "File is complete":
                self.assertTrue(
                    reason.startswith(test_case["reason"])
                    or test_case["reason"] in reason,
                    f"Failed on {test_case['file']}: expected reason to contain '{test_case['reason']}', got '{reason}'",
                )


class TestYamlValidator(unittest.TestCase):
    """Test YAML validator functionality."""

    def setUp(self):
        """Set up test cases."""
        self.test_dir = Path(__file__).parent / "yaml_validator"
        self.validator = YamlValidator(verbose=True)

    def test_validate_files(self):
        """Test that validate_files correctly identifies files with issues."""
        # Run validation on test directory
        self.validator.validate_files([self.test_dir])

        # Check that statistics are correct
        self.assertEqual(
            self.validator.stats["files_processed"], 5
        )  # Only validates markdown files with frontmatter

        # Should have at least some files with issues and some incomplete
        self.assertGreater(self.validator.stats["files_with_issues"], 0)
        self.assertGreater(self.validator.stats["files_incomplete"], 0)


if __name__ == "__main__":
    unittest.main()
