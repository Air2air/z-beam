#!/bin/bash

# Webpack Cache Cleaner
# Fixes common webpack cache corruption issues in Next.js

echo "🧹 WEBPACK CACHE CLEANER"
echo "========================"

# Check if .next exists
if [ ! -d ".next" ]; then
    echo "ℹ️  No .next cache directory found"
    echo "✅ Nothing to clean"
    exit 0
fi

echo "🔍 Analyzing webpack cache..."

CACHE_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
echo "   📂 Cache size: $CACHE_SIZE"

# Check for common corruption indicators
CORRUPTED=false
WEBPACK_CACHE_DIR=".next/cache/webpack"

if [ -d "$WEBPACK_CACHE_DIR" ]; then
    echo "   🔍 Checking webpack cache integrity..."
    
    # Check for empty pack files
    if find "$WEBPACK_CACHE_DIR" -name "*.pack.gz" -size 0 2>/dev/null | grep -q .; then
        echo "   ❌ Found empty webpack pack files"
        CORRUPTED=true
    fi
    
    # Check for corrupted pack files
    for pack_file in "$WEBPACK_CACHE_DIR"/*.pack.gz; do
        if [ -f "$pack_file" ]; then
            if ! file "$pack_file" 2>/dev/null | grep -q "gzip"; then
                echo "   ❌ Corrupted pack file: $(basename "$pack_file")"
                CORRUPTED=true
                break
            fi
        fi
    done
    
    if [ "$CORRUPTED" = false ]; then
        echo "   ✅ Webpack cache appears healthy"
    fi
else
    echo "   ℹ️  No webpack cache directory found"
fi

# Look for specific error indicators in recent logs
if [ -f "logs/app.log" ]; then
    if grep -q "hasStartTime" logs/app.log 2>/dev/null; then
        echo "   ❌ hasStartTime error detected in logs"
        CORRUPTED=true
    fi
    if grep -q "Restoring pack.*failed" logs/app.log 2>/dev/null; then
        echo "   ❌ Pack restoration failure detected in logs"
        CORRUPTED=true
    fi
fi

# Clear cache if corrupted or if user requests it
if [ "$CORRUPTED" = true ] || [ "$1" = "--force" ]; then
    echo
    echo "🗑️  CLEARING WEBPACK CACHE:"
    echo "   📂 Removing .next directory..."
    
    if rm -rf .next 2>/dev/null; then
        echo "   ✅ Cache cleared successfully"
        echo "   📊 Freed: $CACHE_SIZE"
        echo
        echo "🚀 NEXT STEPS:"
        echo "   1. Run: npm run dev"
        echo "   2. First build will be slower (creating fresh cache)"
        echo "   3. Subsequent builds will be fast again"
        echo
        echo "💡 The fresh cache should resolve:"
        echo "   - 'Cannot read properties of undefined (reading hasStartTime)'"
        echo "   - 'Restoring pack from webpack cache failed'"
        echo "   - Various webpack cache corruption errors"
    else
        echo "   ❌ Failed to clear cache"
        echo "   🔧 Try manually: rm -rf .next"
        exit 1
    fi
else
    echo
    echo "✅ CACHE IS HEALTHY"
    echo "   No corruption detected"
    echo "   Current size: $CACHE_SIZE"
    echo
    echo "💡 To force clear anyway:"
    echo "   ./clear-webpack-cache.sh --force"
fi

echo "========================"
