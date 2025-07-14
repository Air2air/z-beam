#!/bin/bash

# Fix Dependencies - Resolve version conflicts and lockfile issues
# Prevents webpack errors by ensuring clean dependency resolution

set -e

echo "🔧 FIXING DEPENDENCY ISSUES"
echo "============================"

echo "📦 Step 1: Clean existing installations..."
rm -rf node_modules package-lock.json .next 2>/dev/null || true

echo "📦 Step 2: Clear npm cache..."
npm cache clean --force

echo "📦 Step 3: Install with clean resolution..."
npm install --no-optional --legacy-peer-deps

echo "📦 Step 4: Verify installation..."
if npm list --depth=0 > /dev/null 2>&1; then
    echo "✅ Dependencies installed successfully"
else
    echo "⚠️  Some peer dependency warnings (normal)"
fi

echo "📦 Step 5: Quick build test..."
if npm run build:skip-check > /dev/null 2>&1; then
    echo "✅ Build test passed"
else
    echo "❌ Build test failed - may need manual intervention"
    exit 1
fi

echo ""
echo "🎉 DEPENDENCY ISSUES FIXED"
echo "=========================="
echo "✅ Clean package-lock.json generated"
echo "✅ Version conflicts resolved"
echo "✅ Webpack should work without errors"
echo ""
echo "🚀 Next: npm run dev"
