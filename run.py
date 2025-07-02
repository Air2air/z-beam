"""
Entry point for the Z-Beam Page Generator.
"""

import argparse
from generator.modules.page_generator import main

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate MDX files for laser cleaning articles."
    )
    parser.add_argument(
        "--force", action="store_true", help="Force regeneration by ignoring cache."
    )
    args = parser.parse_args()
    main(force_regenerate=args.force)
