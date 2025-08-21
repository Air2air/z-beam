#!/usr/bin/env python3
"""
Run YAML validator tests with coverage reporting.
"""

import os
import sys
import coverage
import unittest
from pathlib import Path

# Initialize coverage.py
cov = coverage.Coverage(
    source=["yaml_validator_new", "check_file_completeness"],
    omit=["*/__pycache__/*", "*/tests/*"],
)
cov.start()

# Import test modules
from tests.test_yaml_validator import TestFileCompleteness, TestYamlValidator

# Run tests
test_suite = unittest.TestSuite()
test_suite.addTest(unittest.makeSuite(TestFileCompleteness))
test_suite.addTest(unittest.makeSuite(TestYamlValidator))

runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(test_suite)

# Stop coverage and generate report
cov.stop()
cov.save()

# Print coverage report
print("\nCoverage Report:")
cov.report()

# Generate HTML report
html_dir = Path(__file__).parent / "htmlcov"
html_dir.mkdir(exist_ok=True)
cov.html_report(directory=str(html_dir))
print(f"\nHTML coverage report generated in {html_dir}")

# Exit with appropriate code
sys.exit(not result.wasSuccessful())
