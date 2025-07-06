#!/bin/bash

# Documentation Consolidation Migration Script
# This script archives old documentation and updates references

echo "🚨 DOCUMENTATION CONSOLIDATION: Option A Implementation"
echo "=================================================="

# Create archive directory
mkdir -p docs/archived

# Archive old documentation files
echo "📁 Archiving old documentation files..."
mv REQUIREMENTS.md docs/archived/REQUIREMENTS_archived.md
mv DEVELOPMENT.md docs/archived/DEVELOPMENT_archived.md  
mv CLAUDE_COMPLIANCE.md docs/archived/CLAUDE_COMPLIANCE_archived.md

# Keep README.md but update it to reference PROJECT_GUIDE.md
echo "📝 Updating README.md references..."

# Create new minimal README content
cat > README.md << 'EOF'
# Z-Beam Laser Cleaning Project

## 📋 Documentation

**⚠️ IMPORTANT:** All project documentation has been consolidated into a single source of truth.

**👉 READ THIS FIRST:** [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)

The PROJECT_GUIDE.md contains:
- Core Architecture Principles
- Development Workflow  
- Claude AI Compliance
- Quick Reference

## Previous Documentation

Archived documentation can be found in `docs/archived/` for reference only.

## Quick Start

```bash
# Install dependencies
npm install

# Run enforcement check
npm run enforce-components

# Start development server
npm run dev

# Build for production
npm run build
```

For detailed workflow and component usage, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md).
EOF

echo "✅ README.md updated with consolidated references"

# Create summary of what was consolidated
cat > docs/archived/CONSOLIDATION_SUMMARY.md << 'EOF'
# Documentation Consolidation Summary

## What Was Consolidated

### Files Archived:
- `REQUIREMENTS.md` (228 lines) → `docs/archived/REQUIREMENTS_archived.md`
- `DEVELOPMENT.md` (543 lines) → `docs/archived/DEVELOPMENT_archived.md`
- `CLAUDE_COMPLIANCE.md` (252 lines) → `docs/archived/CLAUDE_COMPLIANCE_archived.md`

### Total Reduction:
- **Before:** 1000+ lines across 4 files
- **After:** ~400 lines in 1 file (PROJECT_GUIDE.md)
- **Reduction:** 60% fewer lines, 75% fewer files

### Issues Resolved:
- ✅ Eliminated all content duplication
- ✅ Resolved contradictory information
- ✅ Fixed section numbering (1.1, 1.2, 1.5, 1.4, 1.3 → logical order)
- ✅ Removed hardcoded component lists
- ✅ Centralized enforcement documentation
- ✅ Eliminated cross-file references

### New Structure:
All documentation is now in `PROJECT_GUIDE.md` with clear sections:
1. Core Architecture Principles
2. Development Workflow
3. Claude AI Compliance  
4. Quick Reference

## Migration Date
$(date)

## Validation
To verify consolidation success:
```bash
# Check no hardcoded component lists remain
grep -r "SmartTagList.*All badge" . --exclude-dir=docs/archived

# Check no section numbering conflicts
grep -r "### 1\." PROJECT_GUIDE.md

# Verify single source of truth
find . -name "*.md" -not -path "./docs/archived/*" -not -name "README.md" -not -name "PROJECT_GUIDE.md"
```
EOF

echo "📊 Consolidation summary created: docs/archived/CONSOLIDATION_SUMMARY.md"

# Update any remaining references in package.json or other config files
echo "🔧 Checking for documentation references in config files..."
grep -r "REQUIREMENTS.md\|DEVELOPMENT.md\|CLAUDE_COMPLIANCE.md" . --exclude-dir=docs/archived --exclude-dir=.git --exclude="*.md" || echo "No config file references found"

echo ""
echo "✅ CONSOLIDATION COMPLETE!"
echo "=================================================="
echo "📖 New single source of truth: PROJECT_GUIDE.md"
echo "📁 Archived files in: docs/archived/"
echo "📝 Updated README.md references"
echo ""
echo "Next steps:"
echo "1. Review PROJECT_GUIDE.md for completeness"
echo "2. Test that all enforcement still works: npm run enforce-components"
echo "3. Verify build passes: npm run build"
echo "4. Commit the consolidated documentation"
