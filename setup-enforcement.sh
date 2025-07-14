#!/bin/bash

# Setup script for component reusability enforcement
# Run this once to enable all automated checks

echo "🛡️  Setting up Component Reusability Enforcement System"
echo "======================================================"
echo ""

# Setup git hooks
echo "📋 Setting up pre-commit hooks..."
git config core.hooksPath .githooks
echo "✅ Git hooks configured to use .githooks directory"
echo ""

# Make scripts executable
echo "📋 Making scripts executable..."
chmod +x enforce-component-rules.js
chmod +x audit-components.sh  
chmod +x quick-audit.sh
chmod +x .githooks/pre-commit
echo "✅ All scripts are now executable"
echo ""

# Test the enforcement system
echo "📋 Testing enforcement system..."
echo ""
echo "Running component rule enforcement test..."
if node enforce-component-rules.js; then
    echo "✅ Enforcement system test PASSED"
    echo ""
    echo "🎯 Component reusability enforcement is now active!"
    echo ""
    echo "📋 What's been enabled:"
    echo "- ✅ Pre-commit hooks will block commits with violations"
    echo "- ✅ npm run build will fail if violations exist"  
    echo "- ✅ CI/CD pipeline will enforce rules on PRs"
    echo "- ✅ VS Code tasks available for manual checking"
    echo ""
    echo "📋 Available commands:"
    echo "- npm run enforce-components  (manual enforcement check)"
    echo "- npm run audit:quick        (quick component audit)"
    echo "- npm run audit:full         (comprehensive audit)"
    echo "- npm run build              (build with enforcement)"
    echo "- npm run build:skip-check   (emergency build without checks)"
else
    echo "⚠️  Enforcement system test found violations"
    echo ""
    echo "This is expected if component violations exist in the codebase."
    echo "The enforcement system is working correctly and will:"
    echo "- Block commits with violations"
    echo "- Fail builds with violations"
    echo "- Prevent deployment of non-compliant code"
    echo ""
    echo "🔧 To fix violations, run:"
    echo "   ./quick-audit.sh"
    echo ""
    echo "Then follow the guidance in PROJECT_GUIDE.md section 2"
fi

echo ""
echo "📖 For complete documentation, see PROJECT_GUIDE.md"
echo "🛡️  Component reusability enforcement setup complete!"
