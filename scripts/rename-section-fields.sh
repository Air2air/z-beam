#!/bin/bash
# Script to rename _section metadata fields from snake_case to camelCase
# Changes:
# - section_title → sectionTitle
# - description → sectionDescription (within _section blocks only)

set -e

echo "🔄 Renaming _section metadata fields..."

# Find all YAML files in frontmatter directories
find frontmatter -name "*.yaml" -type f | while read file; do
    # Use perl for in-place editing with more complex pattern matching
    # Only change 'description:' to 'sectionDescription:' when it appears after '_section:'
    perl -i -pe '
        # Track if we are inside a _section block
        if (/^\s+_section:/) {
            $in_section = 1;
        }
        # Reset when we hit a new top-level key (not indented or indented less)
        if (/^\s{0,6}\w+:/ && !/^\s+_section:/) {
            $in_section = 0;
        }
        
        # Replace section_title with sectionTitle
        s/(\s+)section_title:/${1}sectionTitle:/g;
        
        # Replace description with sectionDescription only inside _section blocks
        if ($in_section) {
            s/(\s+)description:/${1}sectionDescription:/g;
        }
    ' "$file"
done

echo "✅ Completed renaming _section fields in all frontmatter files"
echo "📊 Changed fields:"
echo "   - section_title → sectionTitle"
echo "   - description → sectionDescription (within _section blocks)"
