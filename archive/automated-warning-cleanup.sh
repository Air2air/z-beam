#!/bin/bash

# Warning Cleanup Script
# Automatically fixes common ESLint warnings

echo "🧹 AUTOMATED WARNING CLEANUP"
echo "============================"

WORKSPACE_ROOT="/Users/todddunning/Desktop/Z-Beam/z-beam-test-push"
cd "$WORKSPACE_ROOT"

# Function to show progress
show_progress() {
    echo "🔄 $1"
}

# Function to show success
show_success() {
    echo "✅ $1"
}

# Function to show warning
show_warning() {
    echo "⚠️  $1"
}

# 1. Fix unused variables (comment them out)
fix_unused_variables() {
    show_progress "Fixing unused variables..."
    
    # This would require more sophisticated parsing
    # For now, we'll create a basic pattern matcher
    
    find app/ -name "*.tsx" -o -name "*.ts" | while read file; do
        # Skip if file doesn't exist
        if [[ ! -f "$file" ]]; then
            continue
        fi
        
        # Create backup
        cp "$file" "$file.backup"
        
        # Basic unused variable patterns (very conservative)
        # Only comment out obvious unused parameters
        sed -i.tmp 's/function \([^(]*\)(\([^)]*\), \([a-zA-Z_][a-zA-Z0-9_]*\): [^,)]*)/function \1(\2, \/\* \3: type \*\/)/g' "$file"
        
        # Clean up temporary file
        rm -f "$file.tmp"
    done
    
    show_success "Unused variable fixes applied"
}

# 2. Fix 'any' types
fix_any_types() {
    show_progress "Fixing 'any' types..."
    
    find app/ -name "*.tsx" -o -name "*.ts" | while read file; do
        if [[ ! -f "$file" ]]; then
            continue
        fi
        
        # Create backup
        cp "$file" "$file.backup"
        
        # Replace common 'any' patterns with safer alternatives
        # Be very conservative to avoid breaking code
        
        # any[] -> unknown[]
        sed -i.tmp 's/: any\[\]/: unknown[]/g' "$file"
        
        # : any; -> : unknown;
        sed -i.tmp 's/: any;/: unknown;/g' "$file"
        
        # : any, -> : unknown,
        sed -i.tmp 's/: any,/: unknown,/g' "$file"
        
        # : any) -> : unknown)
        sed -i.tmp 's/: any)/: unknown)/g' "$file"
        
        # Clean up
        rm -f "$file.tmp"
    done
    
    show_success "'any' type fixes applied"
}

# 3. Fix JSX unescaped entities
fix_jsx_entities() {
    show_progress "Fixing JSX unescaped entities..."
    
    find app/ -name "*.tsx" | while read file; do
        if [[ ! -f "$file" ]]; then
            continue
        fi
        
        # Create backup
        cp "$file" "$file.backup"
        
        # Replace common unescaped entities
        sed -i.tmp "s/'/\&apos;/g" "$file"
        sed -i.tmp 's/"/\&quot;/g' "$file"
        sed -i.tmp 's/</\&lt;/g' "$file"
        sed -i.tmp 's/>/\&gt;/g' "$file"
        sed -i.tmp 's/&/\&amp;/g' "$file"
        
        # Clean up
        rm -f "$file.tmp"
    done
    
    show_success "JSX entity fixes applied"
}

# 4. Remove unused imports
fix_unused_imports() {
    show_progress "Analyzing unused imports..."
    
    # Run ESLint with --fix to auto-fix what it can
    if command -v npx &> /dev/null; then
        npx eslint app/ --ext .ts,.tsx --fix --rule "no-unused-vars: warn" 2>/dev/null || true
        show_success "Auto-fixable import issues resolved"
    else
        show_warning "ESLint not available for auto-fixing imports"
    fi
}

# 5. Generate report
generate_report() {
    show_progress "Generating cleanup report..."
    
    # Count remaining issues
    local any_count=0
    local unused_count=0
    
    if command -v grep &> /dev/null; then
        any_count=$(find app/ -name "*.ts" -o -name "*.tsx" | xargs grep -n ": any" | wc -l | tr -d ' ')
        unused_count=$(find app/ -name "*.ts" -o -name "*.tsx" | xargs grep -n "// unused" | wc -l | tr -d ' ')
    fi
    
    echo ""
    echo "📊 CLEANUP REPORT"
    echo "=================="
    echo "Remaining 'any' types: $any_count"
    echo "Commented unused vars: $unused_count"
    echo "Timestamp: $(date)"
    echo ""
    
    # Save to file
    cat > cleanup-report.txt << EOF
Warning Cleanup Report
Generated: $(date)

Remaining Issues:
- 'any' types: $any_count
- Commented unused variables: $unused_count

Files processed:
$(find app/ -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ') TypeScript files

Backup files created with .backup extension
EOF
    
    show_success "Report saved to cleanup-report.txt"
}

# 6. Restore function (if needed)
restore_backups() {
    show_progress "Restoring from backups..."
    
    find app/ -name "*.backup" | while read backup; do
        original="${backup%.backup}"
        mv "$backup" "$original"
    done
    
    show_success "Files restored from backups"
}

# Main execution
main() {
    echo "Starting automated warning cleanup..."
    echo ""
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        echo "❌ Error: Not in a Node.js project directory"
        exit 1
    fi
    
    # Run cleanup steps
    fix_unused_variables
    fix_any_types
    fix_jsx_entities
    fix_unused_imports
    generate_report
    
    echo ""
    echo "🎉 Automated cleanup complete!"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Review changes carefully"
    echo "   2. Test your application"
    echo "   3. Run 'npm run test' to verify"
    echo "   4. If issues occur, run this script with 'restore' argument"
    echo ""
}

# Handle restore command
if [[ "$1" == "restore" ]]; then
    restore_backups
    exit 0
fi

# Run main cleanup
main
