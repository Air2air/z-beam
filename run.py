#!/usr/bin/env python3
"""
Main entry point for the article generation system.
Handles configuration loading and orchestrates the generation process.
"""

import sys
import argparse
from generator.modules.runner import ApplicationRunner
from generator.config.configurator import build_run_config
from generator.core.domain.models import TemperatureConfig


# ---- CONFIGURATION (edit here) ----

# Provider/model configuration centralized here
PROVIDER_MODELS = {
    "GEMINI": {
        "model": "gemini-2.5-flash",  # Latest stable model
        "url_template": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    },
    "XAI": {
        "model": "grok-3-mini-beta",
        "url_template": "https://api.x.ai/v1/chat/completions",
    },
    "DEEPSEEK": {
        "model": "deepseek-chat",  # Points to DeepSeek-V3
        "url_template": "https://api.deepseek.com/v1/chat/completions",
    },
}

# Define centralized temperature configuration
TEMP_CONFIG = TemperatureConfig(
    content_temp=0.6,  # Main content generation temperature (reduced for human-like consistency)
    detection_temp=0.3,  # Detection calls temperature (lower for consistency)
    improvement_temp=0.7,  # Slightly higher temperature for improvement passes
    summary_temp=0.4,  # Lower temperature for predictable summaries
    metadata_temp=0.2,  # Very low temperature for structured metadata
)

USER_CONFIG = dict(
    material="Bronze",  # Simple material for testing
    category="Material",  # Article category
    file_name="bronze_laser_cleaning.mdx",  # Output filename
    generator_provider="DEEPSEEK",  # XAI GEMINI DEEPSEEK
    detection_provider="DEEPSEEK",  # XAI GEMINI DEEPSEEK
    author="todd_dunning.mdx",  # Author profile
    temperature=0.6,  # LEGACY: Maintained for backward compatibility
    force_regenerate=True,  # Always regenerate content
    ai_detection_threshold=25,  # STRICT: Much more stringent AI detection (25% max)
    natural_voice_threshold=25,  # STRICT: Natural voice authenticity target (15-25% range)
    iterations_per_section=5,  # INCREASED: More iterations to improve detection scores
    max_article_words=800,  # SAFE MODE: Smaller for faster testing
    api_timeout=40,  # API request timeout in seconds
    detection_temperature=0.3,  # LEGACY: Maintained for backward compatibility
    temperature_config=TEMP_CONFIG,  # NEW: Centralized temperature configuration
    # Content length limits are now handled by word budget manager
)
# ---- END CONFIGURATION ----


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Z-Beam Article Generation System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 run.py                     # Normal article generation
  python3 run.py --test-detector     # Test detector improvements and optimization
        """,
    )

    # Test modes
    test_group = parser.add_mutually_exclusive_group()
    test_group.add_argument(
        "--test-detector",
        action="store_true",
        help="Test detector improvements and prompt optimization (validate human-like output)",
    )

    return parser.parse_args()


def main() -> None:
    """Main entry point."""
    args = parse_arguments()

    # Handle test detector mode
    if args.test_detector:
        # Import test runner (only when needed)
        try:
            from test_runner import run_detector_validation_test

            print("🧪 Running Detector Improvement Test...")
            print("🎯 This will test the prompt optimization improvements")
            print(
                "   to ensure content reads as human-written without try-hard traits.\n"
            )

            # Run detector-focused test with optimized settings
            success = run_detector_validation_test()

            print(
                f"\n{'✅ Test completed successfully!' if success else '❌ Test failed or did not meet thresholds.'}"
            )
            sys.exit(0 if success else 1)

        except ImportError as e:
            print(f"❌ Test runner not available: {e}")
            print("Make sure test_runner.py is in the same directory as run.py")
            sys.exit(1)

    # Normal article generation mode
    run_config = build_run_config(USER_CONFIG)
    runner = ApplicationRunner()
    success = runner.run(run_config)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
