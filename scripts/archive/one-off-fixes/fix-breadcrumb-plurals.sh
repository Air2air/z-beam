#!/bin/bash

# Fix plural breadcrumb hrefs to singular
# Standardizing all category/subcategory URLs to singular form

echo "🔧 Fixing plural breadcrumb hrefs to singular..."

# Define replacements as arrays
plurals=(
  "semiconductors"
  "ceramics"
  "composites"
  "glasss"
  "masonrys"
  "metals"
  "plastics"
  "rare-earths"
  "stones"
  "woods"
)

singulars=(
  "semiconductor"
  "ceramic"
  "composite"
  "glass"
  "masonry"
  "metal"
  "plastic"
  "rare-earth"
  "stone"
  "wood"
)

total=0
fixed=0

# Process all YAML files in frontmatter
for file in frontmatter/materials/*.yaml frontmatter/settings/*.yaml; do
  if [ -f "$file" ]; then
    ((total++))
    changed=false
    
    for i in "${!plurals[@]}"; do
      plural="${plurals[$i]}"
      singular="${singulars[$i]}"
      
      if grep -q "href: /materials/$plural" "$file"; then
        sed -i '' "s|href: /materials/$plural|href: /materials/$singular|g" "$file"
        changed=true
      fi
    done
    
    if [ "$changed" = true ]; then
      ((fixed++))
      echo "  ✓ Fixed: $(basename "$file")"
    fi
  fi
done

echo ""
echo "📊 Summary:"
echo "   Total files processed: $total"
echo "   Files fixed: $fixed"
echo ""
echo "✅ Breadcrumb href plurals fixed!"
