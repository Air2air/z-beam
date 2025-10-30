#!/usr/bin/env python3
"""
YAML Frontmatter Processor Script

This script processes all markdown files in the specified directory,
fixing YAML frontmatter issues using the enhanced ZBeamYAMLProcessor.

Usage:
    python process_frontmatter.py [directory_path]

Example:
    python process_frontmatter.py frontmatter/materials
"""

import sys
import os
import pathlib
import argparse
import time

# Add the processor directory to the path
sys.path.append(os.path.join(os.getcwd(), "yaml-processor"))

try:
    # Import the processor
    from yaml_processor import ZBeamYAMLProcessor

    def process_directory(directory_path, verbose=True, reset=False):
        """Process all markdown files in the specified directory."""
        start_time = time.time()

        # Create the processor with verbose output
        processor = ZBeamYAMLProcessor(verbose=verbose)

        if reset:
            processor._reset_processor_state()
            processor._reset_history()
            print("✅ Reset processor state and history")

        # Define the directory path
        directory = pathlib.Path(directory_path)

        if not directory.exists() or not directory.is_dir():
            print(f"❌ Directory not found: {directory}")
            return

        print(f"🔍 Processing all files in {directory}")

        # Process all markdown files in the directory
        count = 0
        issues_fixed = 0
        files_with_issues = 0

        for file_path in directory.glob("*.md"):
            count += 1
            print(f"📄 Processing {file_path.name}...")
            issues = processor._process_file(file_path)

            if issues:
                issues_fixed += issues
                files_with_issues += 1

        # Print summary
        elapsed_time = time.time() - start_time
        print("\n" + "=" * 50)
        print("📊 Processing Summary")
        print("=" * 50)
        print(f"⏱️  Total time: {elapsed_time:.2f} seconds")
        print(f"📁 Files processed: {count}")
        print(f"🔧 Files with issues: {files_with_issues}")
        print(f"🛠️  Total issues fixed: {issues_fixed}")
        print("=" * 50)

        return {
            "files_processed": count,
            "files_with_issues": files_with_issues,
            "issues_fixed": issues_fixed,
            "elapsed_time": elapsed_time,
        }

    if __name__ == "__main__":
        parser = argparse.ArgumentParser(
            description="Process markdown files to fix YAML frontmatter issues"
        )
        parser.add_argument(
            "directory",
            nargs="?",
            default="frontmatter/materials",
            help="Directory containing markdown files to process",
        )
        parser.add_argument(
            "--verbose", "-v", action="store_true", help="Enable verbose output"
        )
        parser.add_argument(
            "--reset",
            "-r",
            action="store_true",
            help="Reset processor state and history",
        )

        args = parser.parse_args()

        process_directory(args.directory, args.verbose, args.reset)

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback

    traceback.print_exc()
