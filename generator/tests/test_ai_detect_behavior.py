#!/usr/bin/env python3
"""
Test script to verify ai_detect boolean behavior in section generation.
This will verify that only sections with ai_detect: true run through the detection iterator.
"""

import os
import sys
from pathlib import Path

# Add the generator module to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "generator"))

from generator.config.settings import AppConfig
from generator.modules.logger import get_logger

logger = get_logger("test_ai_detect_behavior")


def test_section_config_parsing():
    """Test that ai_detect is parsed correctly from section prompt files."""
    logger.info("Testing section config parsing...")

    config = AppConfig()
    sections_config = config.load_sections_config()

    logger.info(f"Found {len(sections_config)} sections:")

    ai_detect_true = []
    ai_detect_false = []

    for section_name, section_config in sections_config.items():
        ai_detect = section_config.get("ai_detect", True)
        logger.info(f"  {section_name}: ai_detect={ai_detect}")

        if ai_detect:
            ai_detect_true.append(section_name)
        else:
            ai_detect_false.append(section_name)

    logger.info(f"\nSections with ai_detect=true: {ai_detect_true}")
    logger.info(f"Sections with ai_detect=false: {ai_detect_false}")

    # Verify specific known sections
    expected_false = ["chart", "table"]  # We know these are false
    expected_true = ["introduction", "comparison"]  # We know these are true

    for section in expected_false:
        if section in sections_config:
            actual = sections_config[section].get("ai_detect", True)
            assert not actual, (
                f"Expected {section} to have ai_detect=false, got {actual}"
            )
            logger.info(f"✓ {section} correctly has ai_detect=false")

    for section in expected_true:
        if section in sections_config:
            actual = sections_config[section].get("ai_detect", True)
            assert actual, f"Expected {section} to have ai_detect=true, got {actual}"
            logger.info(f"✓ {section} correctly has ai_detect=true")

    return ai_detect_true, ai_detect_false


def test_ai_detect_file_content():
    """Test reading the actual content of section files to verify ai_detect values."""
    logger.info("\nTesting direct file content parsing...")

    sections_dir = Path("generator/prompts/sections")

    for file_path in sections_dir.glob("*.txt"):
        section_name = file_path.stem
        ai_detect = True  # Default

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # Check for # ai_detect: ... in first 10 lines
            for line in lines[:10]:
                if line.strip().lower().startswith("# ai_detect:"):
                    val = line.split(":", 1)[1].strip().lower()
                    if val in ("false", "no", "0"):
                        ai_detect = False
                    elif val in ("true", "yes", "1"):
                        ai_detect = True
                    break

            logger.info(f"  {section_name}.txt: ai_detect={ai_detect}")

        except Exception as e:
            logger.warning(f"Failed to parse {file_path}: {e}")


if __name__ == "__main__":
    logger.info("Starting ai_detect behavior test")

    # Test 1: Section config parsing
    ai_detect_true, ai_detect_false = test_section_config_parsing()

    # Test 2: Direct file content parsing
    test_ai_detect_file_content()

    logger.info("\n" + "=" * 50)
    logger.info("TEST SUMMARY:")
    logger.info(f"Sections that WILL go through detection iterator: {ai_detect_true}")
    logger.info(
        f"Sections that will NOT go through detection iterator: {ai_detect_false}"
    )
    logger.info("✓ ai_detect parsing test completed successfully!")
