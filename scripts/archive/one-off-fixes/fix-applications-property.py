#!/usr/bin/env python3
"""Remove forbidden 'applications' property from frontmatter files."""

import re
from pathlib import Path

files = [
    "frontmatter/materials/alabaster-laser-cleaning.yaml",
    "frontmatter/materials/alumina-laser-cleaning.yaml",
    "frontmatter/materials/aluminum-laser-cleaning.yaml",
    "frontmatter/materials/ash-laser-cleaning.yaml",
    "frontmatter/materials/bamboo-laser-cleaning.yaml",
    "frontmatter/materials/basalt-laser-cleaning.yaml",
]

for filepath in files:
    path = Path(filepath)
    if not path.exists():
        print(f"⚠️  Skipping {filepath} (not found)")
        continue

    content = path.read_text()

    # Remove applications section with regex
    # Matches: applications:\n- item\n- item\n...
    pattern = r"\napplications:\n(?:- [^\n]+\n)+"
    new_content = re.sub(pattern, "\n", content)

    if content != new_content:
        path.write_text(new_content)
        print(f"✅ Fixed {filepath}")
    else:
        print(f"ℹ️  No changes needed for {filepath}")

print("\n✅ All files processed")
