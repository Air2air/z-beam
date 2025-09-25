#!/bin/bash

# Cleanup Script for Dead Files
# TEST FILE ORGANIZATION POLICY:
# - Essential test files: Keep in root for npm scripts
# - Reference/archived tests: Move to /tests directory  
# - Unused/obsolete tests: Delete permanently
# - Consolidated tests: Delete individual files, keep main suite

# Change to project root directory
cd "$(dirname "$0")/.."

echo "🧹 EXECUTING DEAD FILE CLEANUP"
echo "=============================="
echo ""

# Read the cleanup analysis results
if [ ! -f "cleanup/cleanup-analysis.json" ]; then
    echo "❌ No cleanup analysis found. Run 'npm run cleanup:analyze' first."
    exit 1
fi

# Show what will be cleaned up
echo "📋 Files to be removed:"
echo "======================="

# Debug files (clearly temporary)
echo "🐛 Debug files:"
if [ -f "debug-server-content.js" ]; then
    echo "   • debug-server-content.js (temporary debug script)"
fi
if [ -f "debug-yaml-detailed.js" ]; then
    echo "   • debug-yaml-detailed.js (temporary debug script)"
fi

# Consolidated test files
echo ""
echo "🧪 Test files (action specified):"
test_files_delete=("test-author-api.js" "test-author-implementation.js" "test-author-parsing.js" "test-comprehensive-evaluation.js" "test-pattern.js")
for file in "${test_files_delete[@]}"; do
    if [ -f "$file" ]; then
        echo "   • $file → DELETE (consolidated)"
    fi
done

test_files_move=("test-author-comprehensive.js")
for file in "${test_files_move[@]}"; do
    if [ -f "$file" ]; then
        echo "   • $file → MOVE to /tests/archived (reference)"
    fi
done

# Analysis files
echo ""
echo "📊 Temporary analysis files:"
analysis_files=("author-simplicity-analysis.json" "author-system-summary.json" "test-results-author.json" "yaml-error-analysis.json")
for file in "${analysis_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   • $file"
    fi
done

# Utility scripts
echo ""
echo "� Utility scripts (no longer needed):"
utility_files=("author-system-final-summary.js" "cleanup-blank-lines.js" "evaluate-author-simplicity.js" "final-yaml-cleanup.js" "remove-usecase-fields.js")
for file in "${utility_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   • $file"
    fi
done

# Empty test files
echo ""
echo "📝 Empty test files:"
if [ -f "test-properties.js" ] && [ ! -s "test-properties.js" ]; then
    echo "   • test-properties.js (empty file)"
fi

echo ""
echo "⚠️  WARNING: This will permanently delete files!"
echo ""
echo "📋 CLEANUP POLICY FOR TEST FILES:"
echo "================================="
echo "🏗️  Test files should follow this organization:"
echo "   • Essential test files: Keep in root for npm scripts"
echo "   • Archived/reference tests: Move to /tests directory"
echo "   • Unused/obsolete tests: Delete permanently"
echo "   • Consolidated tests: Delete individual files, keep consolidated version"
echo ""
echo "📋 Files that will be PRESERVED (essential):"
echo "   • comprehensive-suite.js (main test & cleanup integration)"
echo "   • test-dead-file-cleanup.js (cleanup analyzer)"
echo "   • test-layout-structure.js (layout testing)"
echo "   • test-sanitizer.js (YAML sanitization testing)"
echo "   • test-yaml-errors.js (YAML validation testing)"
echo "   • cleanup-dead-files.sh (this cleanup script)"
echo "   • cleanup-analysis.json (cleanup results)"
echo "   • test-suite-results.json (test results)"
echo "   • archive-cleanup.sh (archive maintenance)"
echo "   • All app/, content/, docs/, scripts/, tests/ directories"
echo "   • Configuration files (package.json, tsconfig.json, etc.)"
echo ""
echo "📁 ACTIONS FOR TEST FILES:"
echo "   • Consolidatable tests → DELETE (functionality moved to main suite)"
echo "   • Reference tests → MOVE to /tests directory"
echo "   • Unused tests → DELETE permanently"
echo ""

# Ask for confirmation
read -p "🤔 Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled."
    exit 0
fi

echo ""
echo "🗑️  Executing cleanup..."

# First, move reference test files to /tests directory
echo ""
echo "📁 Moving reference test files to /tests directory..."

# Ensure /tests directory exists
mkdir -p tests/archived

# Move reference test files that might have historical value
reference_test_files=(
    "test-author-comprehensive.js"
)

for file in "${reference_test_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "tests/archived/"
        echo "✅ Moved $file to tests/archived/ (reference)"
        ((removed_count++))
    fi
done

echo ""
echo "🗑️  Removing obsolete files..."

# Remove debug files
removed_count=0

if [ -f "debug-server-content.js" ]; then
    rm "debug-server-content.js"
    echo "✅ Removed debug-server-content.js"
    ((removed_count++))
fi

if [ -f "debug-yaml-detailed.js" ]; then
    rm "debug-yaml-detailed.js"
    echo "✅ Removed debug-yaml-detailed.js"
    ((removed_count++))
fi

# Remove empty test files
if [ -f "test-properties.js" ] && [ ! -s "test-properties.js" ]; then
    rm "test-properties.js"
    echo "✅ Removed empty test-properties.js"
    ((removed_count++))
fi

# Remove old test files that are now consolidated
old_test_files=(
    "test-author-api.js"
    "test-author-implementation.js" 
    "test-author-parsing.js"
    "test-comprehensive-evaluation.js"
    "test-pattern.js"
)

for file in "${old_test_files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "✅ Removed $file (consolidated into main test suite)"
        ((removed_count++))
    fi
done

# Remove analysis and temporary result files
temp_analysis_files=(
    "author-simplicity-analysis.json"
    "author-system-summary.json"
    "test-results-author.json"
    "yaml-error-analysis.json"
)

for file in "${temp_analysis_files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "✅ Removed $file (temporary analysis file)"
        ((removed_count++))
    fi
done

# Remove utility scripts that are no longer needed
utility_scripts=(
    "author-system-final-summary.js"
    "cleanup-blank-lines.js"
    "evaluate-author-simplicity.js"
    "final-yaml-cleanup.js"
    "remove-usecase-fields.js"
)

for file in "${utility_scripts[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "✅ Removed $file (utility script no longer needed)"
        ((removed_count++))
    fi
done

echo ""
echo "🎉 Cleanup complete!"
echo "📊 Removed $removed_count files"
echo "💾 Freed up space by removing redundant and temporary files"

# Update the comprehensive test to reflect changes
echo ""
echo "📝 Updating test suite to reflect cleanup..."

# Run the test suite again to verify everything still works
echo "🧪 Verifying test suite still works after cleanup..."
if node comprehensive-suite.js > /dev/null 2>&1; then
    echo "✅ Test suite verification passed"
else
    echo "⚠️  Test suite verification had issues (check test-suite-results.json)"
fi

echo ""
echo "✅ Dead file cleanup completed successfully!"
echo "📄 Check test-suite-results.json for detailed results"
