#!/usr/bin/env python3
"""
Main entry point for the article generation system.
Handles configuration loading and orchestrates the generation process.
"""

import sys
import argparse
from generator.modules.runner import ApplicationRunner
from generator.config.configurator import build_run_config


# ---- CONFIGURATION (edit here) ----
# Higher iterations_per_section (5-10) allows testing more prompt variations
# and gives the system more chances to reach your target thresholds.
# Each iteration uses a different detection prompt variation for robustness.
USER_CONFIG = dict(
    material="Silver",
    category="Material",
    file_name="laser_cleaning_silver.mdx",
    generator_provider="DEEPSEEK",  # XAI GEMINI DEEPSEEK
    detection_provider="DEEPSEEK",  # XAI GEMINI DEEPSEEK
    author="todd_dunning.mdx",
    temperature=1,
    force_regenerate=True,
    ai_detection_threshold=50,  # Target AI-likelihood score (lower = more human-like)
    human_detection_threshold=50,  # Target over-human score (lower = less try-hard)
    iterations_per_section=5,  # Max iterations to improve content (more = better but slower)
    # Content length limits are now handled in prompt templates
)
# ---- END CONFIGURATION ----


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Z-Beam Article Generation System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run.py                     # Normal article generation
  python run.py --test              # Quick content generation test
  python run.py --test-comprehensive # Comprehensive test with strict thresholds
  python run.py --test-custom --material=copper --word-limit=400
        """,
    )

    # Test modes
    test_group = parser.add_mutually_exclusive_group()
    test_group.add_argument(
        "--test",
        action="store_true",
        help="Run quick content generation test (default settings)",
    )
    test_group.add_argument(
        "--test-comprehensive",
        action="store_true",
        help="Run comprehensive test with strict thresholds",
    )
    test_group.add_argument(
        "--test-custom",
        action="store_true",
        help="Run custom test with specified parameters",
    )

    # Test customization options (only used with --test-custom)
    parser.add_argument(
        "--material",
        default="aluminum",
        help="Material for test generation (default: aluminum)",
    )
    parser.add_argument(
        "--section",
        default="introduction",
        help="Section to test (default: introduction)",
    )
    parser.add_argument(
        "--word-limit",
        type=int,
        default=300,
        help="Word limit for test content (default: 300)",
    )
    parser.add_argument(
        "--ai-threshold",
        type=int,
        default=25,
        help="AI detection threshold (default: 25)",
    )
    parser.add_argument(
        "--human-threshold",
        type=int,
        default=25,
        help="Human detection threshold (default: 25)",
    )
    parser.add_argument(
        "--max-iterations",
        type=int,
        default=5,
        help="Maximum iterations for improvement (default: 5, allows testing more prompt variations)",
    )

    return parser.parse_args()


def main() -> None:
    """Main entry point."""
    args = parse_arguments()

    # Handle test modes
    if args.test or args.test_comprehensive or args.test_custom:
        # Import test runner (only when needed)
        try:
            from test_runner import (
                run_content_test,
                run_quick_test,
                run_comprehensive_test,
            )

            if args.test:
                print("🧪 Running Quick Content Generation Test...")
                success = run_quick_test()

            elif args.test_comprehensive:
                print("🧪 Running Comprehensive Content Generation Test...")
                success = run_comprehensive_test()

            elif args.test_custom:
                print("🧪 Running Custom Content Generation Test...")
                result = run_content_test(
                    material=args.material,
                    section=args.section,
                    word_limit=args.word_limit,
                    ai_threshold=args.ai_threshold,
                    human_threshold=args.human_threshold,
                    max_iterations=args.max_iterations,
                )
                success = result.get("success", False) and result.get(
                    "overall_passed", False
                )

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
