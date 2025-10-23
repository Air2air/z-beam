#!/bin/bash

echo "=== IMAGE AUDIT REPORT ==="
echo "Generated: $(date)"
echo ""

# Count total image files
echo "=== IMAGE FILES IN /public/images ==="
echo "Material images: $(ls -1 public/images/material/*.jpg 2>/dev/null | wc -l | tr -d ' ')"
echo "Application images: $(ls -1 public/images/application/*.jpg 2>/dev/null | wc -l | tr -d ' ')"
echo "Author images: $(ls -1 public/images/author/*.jpg 2>/dev/null | wc -l | tr -d ' ')"
echo "Site images: $(ls -1 public/images/*.jpg 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Check for image types in material folder
echo "=== MATERIAL IMAGE BREAKDOWN ==="
echo "Hero images (-hero.jpg): $(ls -1 public/images/material/*-hero.jpg 2>/dev/null | wc -l | tr -d ' ')"
echo "Micro images (-micro.jpg): $(ls -1 public/images/material/*-micro.jpg 2>/dev/null | wc -l | tr -d ' ')"
echo "Social images (-social.jpg): $(ls -1 public/images/material/*-social.jpg 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Check frontmatter image references
echo "=== FRONTMATTER IMAGE REFERENCES ==="
YAML_FILES=$(ls -1 content/frontmatter/*.yaml 2>/dev/null | wc -l | tr -d ' ')
echo "Total YAML files: $YAML_FILES"
echo ""

# Find materials with missing micro images
echo "=== MISSING MICRO IMAGES ==="
for yaml in content/components/frontmatter/*.yaml; do
    material_name=$(basename "$yaml" .yaml)
    micro_path="public/images/material/${material_name}-micro.jpg"
    
    # Check if micro image is referenced in YAML
    if grep -q "micro:" "$yaml" 2>/dev/null; then
        if [ ! -f "$micro_path" ]; then
            echo "MISSING: $micro_path"
        fi
    fi
done
echo ""

# Find materials with missing hero images
echo "=== MISSING HERO IMAGES ==="
for yaml in content/frontmatter/*.yaml; do
    material_name=$(basename "$yaml" .yaml)
    hero_path="public/images/material/${material_name}-hero.jpg"
    
    # Check if hero image is referenced in YAML
    if grep -q "hero:" "$yaml" 2>/dev/null; then
        if [ ! -f "$hero_path" ]; then
            echo "MISSING: $hero_path"
        fi
    fi
done
echo ""

# Find orphaned images (images without corresponding YAML)
echo "=== ORPHANED IMAGES (no corresponding YAML) ==="
for img in public/images/material/*-hero.jpg public/images/material/*-micro.jpg; do
    if [ -f "$img" ]; then
        basename_img=$(basename "$img")
        # Extract material name by removing -hero.jpg or -micro.jpg
        material_name=$(echo "$basename_img" | sed 's/-hero\.jpg$//' | sed 's/-micro\.jpg$//')
        yaml_file="content/frontmatter/${material_name}.yaml"
        
        if [ ! -f "$yaml_file" ]; then
            echo "ORPHANED: $img (no $yaml_file)"
        fi
    fi
done
echo ""

echo "=== AUDIT COMPLETE ==="
