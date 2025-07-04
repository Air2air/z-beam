#!/usr/bin/env python3

import re

# Test the specific pattern that was causing issues
test_cases = [
    "<td&gt;5-8 m²/hour</td>",
    "<td&lt;0.05 mm</td>",
    "<th&amp;some text</th>",
    "<normal>content</normal>",  # Should not be changed
]

pattern = r"<([a-zA-Z][a-zA-Z0-9]*)((?:&[a-zA-Z0-9]+;|&#[0-9]+;|&#x[0-9a-fA-F]+;))"
replacement = r"<\1>\2"

print("Testing HTML entity pattern fix:")
print("=" * 50)

for test in test_cases:
    result = re.sub(pattern, replacement, test)
    changed = " ✓ FIXED" if test != result else ""
    print(f"Original: {test}")
    print(f"Fixed:    {result}{changed}")
    print("-" * 30)
