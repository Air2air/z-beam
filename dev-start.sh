#!/bin/bash

# Streamlined Development Starter
# Fast, reliable development server startup with minimal noise

set -e

# Configuration
PORT=3000
SKIP_CHECKS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-checks)
            SKIP_CHECKS=true
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

echo "🚀 Z-BEAM DEV SERVER"
echo "==================="

# Quick essential checks (unless skipped)
if [ "$SKIP_CHECKS" = false ]; then
    echo "📋 Running essential checks..."
    
    # 1. Check dependencies
    if [ ! -d "node_modules" ]; then
        echo "❌ Dependencies missing"
        echo "🔧 Run: npm install"
        exit 1
    fi
    
    # 2. Check critical files
    if [ ! -f "app/layout.tsx" ] || [ ! -f "tailwind.config.js" ]; then
        echo "❌ Critical files missing"
        echo "🔧 Ensure app/layout.tsx and tailwind.config.js exist"
        exit 1
    fi
    
    # 3. Quick webpack check
    if ! ./webpack-manager.sh --check --quiet; then
        echo "⚠️  Webpack issues detected, attempting repair..."
        ./webpack-manager.sh --repair --quiet
    fi
    
    # 4. Ensure port is free
    if ! ./webpack-manager.sh --check --quiet --port $PORT; then
        echo "🔧 Freeing port $PORT..."
        ./webpack-manager.sh kill-port --port $PORT
    fi
    
    echo "✅ Ready for development"
else
    echo "⏭️  Skipping checks (--skip-checks enabled)"
fi

echo ""
echo "🌐 Starting Next.js on port $PORT..."
echo "   📍 http://localhost:$PORT"
echo ""

# Start Next.js development server
exec next dev -p $PORT
