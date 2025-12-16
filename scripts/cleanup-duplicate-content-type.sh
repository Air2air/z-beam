#!/bin/bash
# Remove duplicate content_type fields from micro sections in frontmatter files

echo "🧹 Cleaning up duplicate content_type fields..."

# Materials: Remove "content_type: material" lines
echo "📁 Processing materials..."
find frontmatter/materials -name "*.yaml" -type f -exec sed -i '' '/^[[:space:]]*content_type: material$/d' {} \;

# Contaminants: Remove "content_type: contaminant" lines  
echo "📁 Processing contaminants..."
find frontmatter/contaminants -name "*.yaml" -type f -exec sed -i '' '/^[[:space:]]*content_type: contaminant$/d' {} \;

echo "✅ Cleanup complete!"
echo ""
echo "Verification:"
echo "Materials with 'content_type: material':"
grep -r "content_type: material" frontmatter/materials/*.yaml 2>/dev/null | grep -v "unified_material" | wc -l
echo "Contaminants with 'content_type: contaminant':"
grep -r "content_type: contaminant" frontmatter/contaminants/*.yaml 2>/dev/null | grep -v "unified_contamination" | wc -l
