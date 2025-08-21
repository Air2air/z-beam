#!/usr/bin/env python3
import sys
import pathlib
import os

# Add the processor directory to the path
sys.path.append(os.path.join(os.getcwd(), "yaml-processor"))

try:
    # Import the processor
    from yaml_processor import ZBeamYAMLProcessor

    # Create the processor with verbose output
    processor = ZBeamYAMLProcessor(verbose=True)

    # Define the file path
    file_path = pathlib.Path(
        "content/components/frontmatter/epoxy-resin-composites-laser-cleaning.md"
    )

    print(f"⏰ Started processing file: {file_path}")
    print(f"✅ File exists: {file_path.exists()}")
    print(f"📂 Full path: {file_path.absolute()}")

    # Process the specific file
    processor._process_file(file_path)

    print("✅ Processing completed successfully")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback

    traceback.print_exc()
