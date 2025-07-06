#!/bin/bash

# Integrated Development Start Script
# This runs when you use: npm run dev

echo "🚀 STARTING Z-BEAM DEVELOPMENT SERVER"
echo "===================================="

# 1. Run comprehensive readiness check
echo "📋 Step 1: Running development readiness check..."
echo ""

if ! ./dev-ready-check.sh; then
    echo ""
    echo "❌ DEVELOPMENT START ABORTED"
    echo "   Fix the issues above before starting the dev server"
    echo ""
    echo "🔧 Quick fixes:"
    echo "   • npm install (for missing dependencies)"
    echo "   • Check Tailwind/CSS configuration"
    echo "   • Fix TypeScript errors: npx tsc --noEmit"
    echo "   • Run: npm run enforce-components"
    echo ""
    echo "Then try: npm run dev again"
    exit 1
fi

echo ""
echo "✅ All checks passed! Starting Next.js development server..."
echo ""

# 2. Start Next.js on port 3000
echo "🌐 Starting Next.js development server on port 3000..."
echo "   🎯 Server will be available at: http://localhost:3000"
echo ""

# Force Next.js to use port 3000
exec next dev -p 3000
