#!/usr/bin/env python3
"""
Example Integration for Your Python Content Generator
=====================================================

This shows how to integrate the YAML post-processor into your existing
content generation workflow.
"""

# Example: Add this to your content generator


def your_content_generator():
    """Your existing content generation logic."""
    print("🚀 Generating Z-Beam content...")

    # Your generation logic here...
    # generate_frontmatter_files()
    # generate_metatags()
    # generate_jsonld()
    # etc.

    print("✅ Content generation complete!")


def main():
    """Main function that includes YAML post-processing."""

    # 1. Generate your content first
    your_content_generator()

    # 2. Import and run YAML post-processor
    try:
        from yaml_postprocessor_integration import fix_yaml_in_directory

        print("\n🔧 Running YAML post-processor...")
        stats = fix_yaml_in_directory("./content", verbose=True)

        if stats["files_fixed"] > 0:
            print(f"\n✅ Fixed YAML issues in {stats['files_fixed']} files")
            print("Content is now optimized for Next.js!")
        else:
            print("\n✅ No YAML issues found - content is ready!")

    except ImportError:
        print("\n⚠️  YAML post-processor not found. Skipping...")
        print("   Install with: pip install PyYAML")

    except Exception as e:
        print(f"\n❌ Error in YAML post-processing: {e}")
        print("   Content generated but may have YAML issues.")


if __name__ == "__main__":
    main()

# Alternative: Inline integration
"""
If you prefer inline integration, add this to the end of your generator:

# At the end of your generator script:
import subprocess
import sys

def run_yaml_postprocessor():
    try:
        result = subprocess.run([
            sys.executable, 'yaml_postprocessor_integration.py', './content'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ YAML post-processing completed")
        else:
            print(f"⚠️  YAML post-processor warnings:\n{result.stdout}")
    except Exception as e:
        print(f"❌ Could not run YAML post-processor: {e}")

# Run it after content generation
generate_all_content()
run_yaml_postprocessor()
"""
