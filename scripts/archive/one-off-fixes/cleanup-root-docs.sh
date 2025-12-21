#!/bin/bash
# cleanup-root-docs.sh
# Organizes root markdown files into proper documentation structure

set -e

echo "📁 Root Documentation Cleanup"
echo "=============================="
echo ""

# Create target directories
echo "📂 Creating directories..."
mkdir -p docs/completed/jsonld
mkdir -p docs/architecture/frontmatter
mkdir -p docs/deployment

echo "✅ Directories created"
echo ""

# Move deployment docs
echo "📦 Moving deployment documentation..."
[ -f "DEPLOYMENT.md" ] && mv DEPLOYMENT.md docs/deployment/ && echo "  ✓ DEPLOYMENT.md"
[ -f "MONITORING_SETUP.md" ] && mv MONITORING_SETUP.md docs/deployment/ && echo "  ✓ MONITORING_SETUP.md"
[ -f "AUTO_DEPLOY_DISABLE_INSTRUCTIONS.md" ] && mv AUTO_DEPLOY_DISABLE_INSTRUCTIONS.md docs/deployment/AUTO_DEPLOY_DISABLE.md && echo "  ✓ AUTO_DEPLOY_DISABLE.md"

echo ""

# Move completion reports
echo "📦 Moving completion reports..."
[ -f "COMPLETE_JSONLD_COMPLIANCE_REPORT.md" ] && mv COMPLETE_JSONLD_COMPLIANCE_REPORT.md docs/completed/jsonld/COMPLIANCE_REPORT.md && echo "  ✓ COMPLIANCE_REPORT.md"
[ -f "JSON-LD_CLEANUP_COMPLETE.md" ] && mv JSON-LD_CLEANUP_COMPLETE.md docs/completed/jsonld/CLEANUP_COMPLETE.md && echo "  ✓ CLEANUP_COMPLETE.md"
[ -f "JSONLD_ENHANCEMENT_COMPLETE.md" ] && mv JSONLD_ENHANCEMENT_COMPLETE.md docs/completed/jsonld/ENHANCEMENT_COMPLETE.md && echo "  ✓ ENHANCEMENT_COMPLETE.md"
[ -f "SEARCH_404_FIX.md" ] && mv SEARCH_404_FIX.md docs/completed/SEARCH_404_FIX.md && echo "  ✓ SEARCH_404_FIX.md"

echo ""

# Move architecture/analysis docs
echo "📦 Moving architecture documentation..."
[ -f "FRONTMATTER_ACTUAL_STRUCTURE_ANALYSIS.md" ] && mv FRONTMATTER_ACTUAL_STRUCTURE_ANALYSIS.md docs/architecture/frontmatter/STRUCTURE_ANALYSIS.md && echo "  ✓ STRUCTURE_ANALYSIS.md"
[ -f "FRONTMATTER_COMPONENT_COMPATIBILITY.md" ] && mv FRONTMATTER_COMPONENT_COMPATIBILITY.md docs/architecture/frontmatter/COMPONENT_COMPATIBILITY.md && echo "  ✓ COMPONENT_COMPATIBILITY.md"
[ -f "FRONTMATTER_DATA_QUALITY_REPORT.md" ] && mv FRONTMATTER_DATA_QUALITY_REPORT.md docs/architecture/frontmatter/DATA_QUALITY_REPORT.md && echo "  ✓ DATA_QUALITY_REPORT.md"
[ -f "FRONTMATTER_NORMALIZATION_REPORT.md" ] && mv FRONTMATTER_NORMALIZATION_REPORT.md docs/architecture/frontmatter/NORMALIZATION_REPORT.md && echo "  ✓ NORMALIZATION_REPORT.md"
[ -f "FRONTMATTER_VALUE_INVESTIGATION.md" ] && mv FRONTMATTER_VALUE_INVESTIGATION.md docs/architecture/frontmatter/VALUE_INVESTIGATION.md && echo "  ✓ VALUE_INVESTIGATION.md"
[ -f "JSON-LD_CLEANUP_STRATEGY.md" ] && mv JSON-LD_CLEANUP_STRATEGY.md docs/architecture/JSON_LD_CLEANUP_STRATEGY.md && echo "  ✓ JSON_LD_CLEANUP_STRATEGY.md"
[ -f "JSON-LD_SCHEMA_COMPLIANCE_REPORT.md" ] && mv JSON-LD_SCHEMA_COMPLIANCE_REPORT.md docs/architecture/JSON_LD_SCHEMA_COMPLIANCE.md && echo "  ✓ JSON_LD_SCHEMA_COMPLIANCE.md"

echo ""

# Count remaining root files
root_md_count=$(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ')

echo "✅ Documentation reorganization complete!"
echo ""
echo "📊 Results:"
echo "  Root markdown files: $root_md_count"
echo "  Target: 3 (README.md, GROK_INSTRUCTIONS.md, DEPLOYMENT_CHANGELOG.md)"
echo ""

if [ "$root_md_count" -eq 3 ]; then
  echo "🎉 Perfect! Root directory is clean."
elif [ "$root_md_count" -lt 10 ]; then
  echo "✅ Good progress! Close to target."
else
  echo "⚠️  More cleanup needed. Review remaining files:"
  ls -1 *.md
fi

echo ""
echo "📊 Next steps:"
echo "  1. Review changes: git status"
echo "  2. Update links in README.md"
echo "  3. Commit: git add -A && git commit -m 'Organize root documentation'"
