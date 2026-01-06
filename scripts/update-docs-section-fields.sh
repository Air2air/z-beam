#!/bin/bash
# Update documentation to use new camelCase _section field names

set -e

echo "📝 Updating documentation files..."

# Update all markdown files in docs directory
find docs -name "*.md" -type f -exec perl -i -pe '
  s/section_title/sectionTitle/g;
  s/section_description/sectionDescription/g;
' {} \;

echo "✅ Documentation updated with camelCase field names"
