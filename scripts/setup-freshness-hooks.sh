#!/bin/bash
# scripts/setup-freshness-hooks.sh
# Setup git hooks for automatic freshness timestamp updates

echo "🔧 Setting up freshness timestamp git hooks..."

# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/post-commit

# Make scripts executable
chmod +x scripts/update-freshness-timestamps.js
chmod +x scripts/verify-freshness-integration.sh

echo "✅ Git hooks configured!"
echo ""
echo "Automatic freshness updates will now run:"
echo "  - Before each commit (5-10 files per commit)"
echo "  - Minimum 7 days between updates"
echo "  - Silently integrated into git workflow"
echo ""
echo "Manual control still available:"
echo "  npm run update-freshness          # Preview"
echo "  npm run update-freshness:execute  # Execute"
echo "  npm run update-freshness:weekly   # Weekly batch (25 files)"
echo ""
echo "To disable automatic updates:"
echo "  chmod -x .git/hooks/pre-commit"
