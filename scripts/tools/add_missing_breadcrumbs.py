#!/usr/bin/env python3
"""
Add missing breadcrumb arrays to material frontmatter files.

Pattern (matches all 127 existing files):
  breadcrumb:
  - label: Home
    href: /
  - label: {Category}       # Title-case of frontmatter 'category' field
    href: /materials/{category}
  - label: {name}           # Frontmatter 'name' field (not pageTitle/displayName)
    href: null              # null = current page

Inserted immediately before 'pageTitle:' in each file.
"""

import re
import sys
from pathlib import Path

FRONTMATTER_DIR = Path(__file__).parent.parent.parent / "frontmatter" / "materials"


def build_breadcrumb_block(name: str, category: str) -> str:
    category_label = category.capitalize()
    category_href = f"/materials/{category}"
    return (
        f"breadcrumb:\n"
        f"- label: Home\n"
        f"  href: /\n"
        f"- label: Materials\n"
        f"  href: /materials\n"
        f"- label: {category_label}\n"
        f"  href: {category_href}\n"
        f"- label: {name}\n"
        f"  href: null\n"
    )


def patch_file(filepath: Path) -> bool:
    """Add breadcrumb block to a file that is missing it. Returns True if patched."""
    text = filepath.read_text(encoding="utf-8")

    if re.search(r"^breadcrumb:", text, re.MULTILINE):
        return False  # Already has it

    # Extract name and category from file
    name_match = re.search(r"^name:\s*(.+)$", text, re.MULTILINE)
    category_match = re.search(r"^category:\s*(.+)$", text, re.MULTILINE)

    if not name_match or not category_match:
        print(f"  SKIP (missing name/category): {filepath.name}")
        return False

    name = name_match.group(1).strip()
    category = category_match.group(1).strip()

    breadcrumb_block = build_breadcrumb_block(name, category)

    # Insert before 'pageTitle:' line
    patched = re.sub(
        r"^(pageTitle:)",
        breadcrumb_block + r"\1",
        text,
        count=1,
        flags=re.MULTILINE,
    )

    if patched == text:
        print(f"  SKIP (no pageTitle: line found): {filepath.name}")
        return False

    filepath.write_text(patched, encoding="utf-8")
    return True


def main():
    yaml_files = sorted(FRONTMATTER_DIR.glob("*.yaml"))
    patched = 0
    skipped = 0

    for f in yaml_files:
        if patch_file(f):
            print(f"  ✅ Added breadcrumb to {f.name}")
            patched += 1
        else:
            skipped += 1

    print(f"\nDone: {patched} patched, {skipped} already had breadcrumb (or skipped).")


if __name__ == "__main__":
    main()
