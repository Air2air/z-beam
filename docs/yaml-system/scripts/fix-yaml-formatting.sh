#!/bin/bash
# fix-yaml-formatting.sh
# Script to fix common YAML formatting issues in content files

echo "🔍 Scanning for YAML formatting issues..."

# Find all .md files and check for common YAML issues
find content -name "*.md" -type f | while read -r file; do
    if grep -q "^---" "$file"; then
        echo "📄 Checking: $file"
        
        # Check for bad sequence indentation (single space instead of two)
        if grep -q "^ -" "$file"; then
            echo "  ⚠️  Found single-space indentation in $file"
            # Fix by replacing single space with double space
            sed -i '' 's/^ -/  -/g' "$file"
            echo "  ✅ Fixed sequence indentation"
        fi
        
        # Check for malformed nested quotes
        if grep -q 'useCase:.*"'"'"'.*"'"'"'' "$file"; then
            echo "  ⚠️  Found nested quotes in $file"
            # This would need manual review, so just flag it
            echo "  ❌ Manual review needed for nested quotes"
        fi
    fi
done

echo "🎉 YAML formatting check complete!"
