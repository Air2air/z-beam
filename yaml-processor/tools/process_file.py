#!/usr/bin/env python3
"""
Simple script to process a specific file using the Z-Beam YAML Processor.
This allows for targeted processing and detailed log output.
"""

import os
import sys
import pathlib
from pathlib import Path

# Add the yaml-processor directory to the Python path
sys.path.append(os.path.join(os.getcwd(), "yaml-processor"))

try:
    from yaml_processor import ZBeamYAMLProcessor

    # File to process
    file_path = Path(
        "content/components/frontmatter/epoxy-resin-composites-laser-cleaning.md"
    )
    if len(sys.argv) > 1:
        file_path = Path(sys.argv[1])

    # Check if the file exists
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        sys.exit(1)

    print(f"📄 Processing file: {file_path}")

    # Create processor with verbose output
    processor = ZBeamYAMLProcessor(verbose=True)

    # Process the file
    processor._process_file(file_path)

    # Print summary
    print("\n✅ Processing completed")
    print(f"📊 File processed: {file_path.name}")

    # Check if the file was fixed
    if str(file_path) in processor.fixed_files:
        print("🔧 Issues were fixed in this file")

        # Show a summary of the changes
        if str(file_path) in processor.file_changes:
            changes = processor.file_changes[str(file_path)]["line_changes"]
            print(f"   Modified lines: {len(changes['modified'])}")
            print(f"   Added lines: {len(changes['added'])}")
            print(f"   Removed lines: {len(changes['removed'])}")
            print(f"   Total changes: {changes['total_changes']}")
            print(f"   Percent changed: {changes['percent_changed']:.1f}%")

            # Show details of modified lines
            if changes["modified"]:
                print("\n📝 Modified lines (first 5):")
                for i, change in enumerate(changes["modified"][:5]):
                    print(f"   Line {change['before_line']} → {change['after_line']}:")
                    print(f"     BEFORE: {change['before']}")
                    print(f"     AFTER:  {change['after']}")
                if len(changes["modified"]) > 5:
                    print(
                        f"   ... and {len(changes['modified']) - 5} more modified lines"
                    )
    else:
        print("✅ No issues found in this file")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback

    traceback.print_exc()
