#!/bin/bash

# Documentation Consolidation Script
# Automatically organizes Z-Beam documentation into clean structure

# Change to the docs directory
cd /Users/todddunning/Desktop/Z-Beam/z-beam/docs

echo "🚀 Starting Documentation Consolidation..."
echo ""

# MetricsCard docs consolidation
echo "📦 Consolidating MetricsCard documentation..."
mv METRICSCARD_*.md components/MetricsCard/docs/ 2>/dev/null
mv GENERIC_METRICSCARD_*.md components/MetricsCard/docs/ 2>/dev/null
echo "   ✓ MetricsCard docs: $(ls components/MetricsCard/docs/*.md 2>/dev/null | wc -l) files"

# Caption docs
echo "📦 Consolidating Caption documentation..."
mv CAPTION_*.md components/Caption/ 2>/dev/null
echo "   ✓ Caption docs: $(ls components/Caption/*.md 2>/dev/null | wc -l) files"

# Accessibility docs
echo "📦 Consolidating Accessibility documentation..."
mv ACCESSIBILITY_*.md guides/accessibility/ 2>/dev/null
mv WCAG_*.md guides/accessibility/ 2>/dev/null
mv ARIA_*.md guides/accessibility/ 2>/dev/null
mv COMPONENT_ACCESSIBILITY_AUDIT.md guides/accessibility/ 2>/dev/null
mv CONTENTCARD_ACCESSIBILITY.md guides/accessibility/ 2>/dev/null
echo "   ✓ Accessibility docs: $(ls guides/accessibility/*.md 2>/dev/null | wc -l) files"

# Categorized Properties docs
echo "📦 Consolidating Categorized Properties documentation..."
mv CATEGORIZED_PROPERTIES_*.md features/categorized-properties/ 2>/dev/null
mv PROPERTY_CATEGORY_*.md features/categorized-properties/ 2>/dev/null
echo "   ✓ Categorized Properties docs: $(ls features/categorized-properties/*.md 2>/dev/null | wc -l) files"

# Thermal Properties docs
echo "📦 Consolidating Thermal Properties documentation..."
mv THERMAL_PROPERTY_*.md features/thermal-properties/ 2>/dev/null
mv FRONTMATTER_THERMAL_*.md features/thermal-properties/ 2>/dev/null
echo "   ✓ Thermal Properties docs: $(ls features/thermal-properties/*.md 2>/dev/null | wc -l) files"

# Font System docs
echo "📦 Consolidating Font System documentation..."
mv FONT_*.md systems/fonts/ 2>/dev/null
echo "   ✓ Font System docs: $(ls systems/fonts/*.md 2>/dev/null | wc -l) files"

# Semantic docs
echo "📦 Consolidating Semantic documentation..."
mv SEMANTIC_*.md systems/semantic/ 2>/dev/null
echo "   ✓ Semantic docs: $(ls systems/semantic/*.md 2>/dev/null | wc -l) files"

# Static Page docs
echo "📦 Consolidating Static Page documentation..."
mv STATIC_*.md architecture/static-pages/ 2>/dev/null
echo "   ✓ Static Page docs: $(ls architecture/static-pages/*.md 2>/dev/null | wc -l) files"

# Test docs
echo "📦 Consolidating Test documentation..."
mv TEST_*.md testing/ 2>/dev/null
mv TESTS_*.md testing/ 2>/dev/null
mv *_TEST_*.md testing/ 2>/dev/null
mv DOCUMENTATION_TEST_*.md testing/ 2>/dev/null
mv FULL_TEST_RESULTS.md testing/ 2>/dev/null
echo "   ✓ Test docs: $(ls testing/*.md 2>/dev/null | wc -l) files"

# Component docs
echo "📦 Moving remaining component documentation..."
mv COMPONENT_*.md components/ 2>/dev/null
mv CONTENTCARD_*.md components/ 2>/dev/null
echo "   ✓ Component docs: $(ls components/*.md 2>/dev/null | wc -l) files"

# Architecture docs
echo "📦 Moving architecture documentation..."
mv FRONTMATTER_*.md architecture/ 2>/dev/null
mv TYPE_*.md architecture/ 2>/dev/null
echo "   ✓ Architecture docs: $(ls architecture/*.md 2>/dev/null | wc -l) files"

# Cleanup and optimization docs
echo "📦 Archiving cleanup and optimization docs..."
mv CLEANUP_*.md archived/evaluations/ 2>/dev/null
mv CODE_CLEANUP_*.md archived/evaluations/ 2>/dev/null
mv OPTIMIZATION_*.md archived/evaluations/ 2>/dev/null
mv COMPONENT_OPTIMIZATION_*.md archived/evaluations/ 2>/dev/null
echo "   ✓ Additional evaluations archived"

# Grid and layout docs
echo "📦 Moving grid and layout documentation..."
mv GRID_*.md architecture/ 2>/dev/null
mv LAYOUT_*.md architecture/ 2>/dev/null
mv PAGE_LAYOUT_*.md architecture/ 2>/dev/null
echo "   ✓ Layout docs moved"

# Deployment docs  
echo "📦 Organizing deployment documentation..."
mv DEPLOYMENT_TROUBLESHOOTING.md deployment/ 2>/dev/null
echo "   ✓ Deployment docs organized"

# Enhancement and implementation docs
echo "📦 Archiving enhancement docs..."
mv *_ENHANCEMENT_*.md archived/evaluations/ 2>/dev/null
mv *_IMPLEMENTATION*.md archived/evaluations/ 2>/dev/null
echo "   ✓ Enhancement docs archived"

# Content and E-E-A-T docs
echo "📦 Moving content documentation..."
mv CONTENT_*.md systems/ 2>/dev/null
mv EEAT_*.md systems/ 2>/dev/null
echo "   ✓ Content docs moved"

# Tag system
echo "📦 Organizing tag system..."
mv TAGS_*.md tag-system/ 2>/dev/null
echo "   ✓ Tag docs organized"

# CSS and Tailwind
echo "📦 Moving CSS documentation..."
mv CSS_*.md architecture/ 2>/dev/null
mv TAILWIND_*.md architecture/ 2>/dev/null
echo "   ✓ CSS docs moved"

# CTA Component
echo "📦 Moving CTA documentation..."
mv CTA_*.md components/ 2>/dev/null
echo "   ✓ CTA docs moved"

# Partners page
echo "📦 Moving Partners documentation..."
mv PARTNERS_*.md features/ 2>/dev/null
echo "   ✓ Partners docs moved"

# Image organization
echo "📦 Moving image documentation..."
mv IMAGE_*.md systems/ 2>/dev/null
echo "   ✓ Image docs moved"

# YAML and category docs
echo "📦 Moving YAML and category documentation..."
mv YAML_*.md architecture/ 2>/dev/null
mv CATEGORY_*.md architecture/ 2>/dev/null
echo "   ✓ YAML/Category docs moved"

# Header/Title docs
echo "📦 Archiving rename documentation..."
mv HEADER_TO_TITLE_*.md archived/evaluations/ 2>/dev/null
mv SUBTITLE_*.md archived/evaluations/ 2>/dev/null
echo "   ✓ Rename docs archived"

echo ""
echo "✅ Documentation consolidation complete!"
echo ""
echo "📊 Summary:"
echo "   Root level files: $(ls *.md 2>/dev/null | wc -l)"
echo "   Archived files: $(find archived/ -name "*.md" | wc -l)"
echo "   Component docs: $(find components/ -name "*.md" | wc -l)"
echo "   Feature docs: $(find features/ -name "*.md" | wc -l)"
echo "   System docs: $(find systems/ -name "*.md" | wc -l)"
echo "   Architecture docs: $(find architecture/ -name "*.md" | wc -l)"
echo "   Testing docs: $(find testing/ -name "*.md" | wc -l)"
echo "   Guide docs: $(find guides/ -name "*.md" | wc -l)"
echo ""
echo "✨ Documentation is now organized!"
