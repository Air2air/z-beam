#!/bin/bash
# Quick Component Audit Script
# Checks for common component issues and unused files

echo "🔍 Z-Beam Quick Component Audit"
echo "================================"

# Check for unused components
echo ""
echo "📦 Checking for unused components..."

# List all component directories
component_dirs=$(find app/components -type d -mindepth 1 -maxdepth 1 | sed 's|app/components/||')

unused_count=0
for dir in $component_dirs; do
    # Skip if it contains example files
    if [[ "$dir" == *"example"* ]]; then
        continue
    fi
    
    # Check if component is imported anywhere
    imports=$(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".next" | grep -v example | xargs grep -l "import.*$dir\|from.*$dir" 2>/dev/null | grep -v "app/components/$dir/" | wc -l)
    
    if [ "$imports" -eq 0 ]; then
        echo "⚠️  Potentially unused: $dir"
        unused_count=$((unused_count + 1))
    else
        echo "✅ Used ($imports imports): $dir"
    fi
done

echo ""
echo "📊 Audit Summary:"
echo "- Unused components found: $unused_count"

# Check TypeScript errors
echo ""
echo "🔧 TypeScript Error Check..."
error_count=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | wc -l)
echo "- TypeScript errors: $error_count"

echo ""
echo "✨ Quick audit complete!"