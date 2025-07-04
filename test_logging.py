#!/usr/bin/env python3
"""Test script to validate logging configuration and demonstrate usage."""

import os
import sys

# Add the project root to the path first
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from generator.modules.logger import get_logger, get_logging_config_summary
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running from the project root directory")
    sys.exit(1)


def test_logging_configuration():
    """Test the centralized logging configuration."""

    print("=== Z-Beam Logging Configuration Test ===\n")

    # Print current configuration
    print(get_logging_config_summary())

    # Test different logger types
    api_logger = get_logger("api_client", "TEST")
    content_logger = get_logger("content_generator", "TEST")
    mdx_logger = get_logger("mdx_validator", "TEST")

    print("Testing different log levels...")

    # Test API logging
    api_logger.log_api_request("gemini", "gemini-2.5-flash", 1500, temperature=0.7)
    api_logger.log_api_response("gemini", success=True)
    api_logger.log_api_response("gemini", success=False, error="Rate limit exceeded")

    # Test content generation logging
    content_logger.info("Starting content generation for material: bronze")
    content_logger.debug("Generated content length: 2500 characters")
    content_logger.warning("Generated content may need review")

    # Test MDX validation logging
    mdx_logger.info("Validating MDX file: test.mdx")
    mdx_logger.debug("Found 3 potential issues in MDX content")
    mdx_logger.error("Invalid YAML frontmatter detected")

    # Test sensitive data filtering
    api_logger.info("API request with Authorization: Bearer sk-1234567890abcdef")
    api_logger.debug("Using key=abc123xyz789 for authentication")

    # Test performance logging
    print("\nTesting performance logging...")
    with content_logger.time_operation("Content generation simulation"):
        import time

        time.sleep(0.1)  # Simulate work
        content_logger.info("Generating content...")
        time.sleep(0.05)  # More work

    # Test standalone performance timer
    with api_logger.time_operation("API call simulation"):
        time.sleep(0.2)  # Simulate API call
        api_logger.info("API call completed")

    print("\n=== Test Complete ===")
    print("Check logs/app.log for file output")
    print("Run with ENABLE_PERFORMANCE_LOGGING=false to disable timing")
    print("Run with VERBOSE_API_LOGGING=true for detailed API logs")


if __name__ == "__main__":
    test_logging_configuration()
