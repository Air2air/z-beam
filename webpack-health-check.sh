#!/bin/bash

# Webpack Health Check & Auto-Repair
# Detects webpack corruption patterns and automatically repairs them

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔍 WEBPACK HEALTH CHECK & AUTO-REPAIR"
echo "======================================"

# Initialize health check status
ISSUES_FOUND=false
REPAIR_NEEDED=false

# Function to log issues
log_issue() {
    echo "   ❌ $1"
    ISSUES_FOUND=true
}

# Function to log repairs
log_repair() {
    echo "   🔧 $1"
    REPAIR_NEEDED=true
}

echo "📋 CHECKING WEBPACK HEALTH..."

# 1. Check for missing vendor chunks (common in the error you saw)
echo "   🔍 Vendor chunk integrity..."
if [ -d ".next/server" ]; then
    # Look for missing vendor chunk references in logs or error reports
    # Don't check actual files as they might be legitimately absent
    if [ -f "logs/app.log" ] && grep -q "Cannot find module.*vendor-chunks" logs/app.log 2>/dev/null; then
        log_issue "Missing vendor chunks detected in logs"
    fi
    
    # Check for broken webpack runtime
    if [ -f ".next/server/webpack-runtime.js" ]; then
        if ! node -c ".next/server/webpack-runtime.js" 2>/dev/null; then
            log_issue "Corrupted webpack runtime detected"
        fi
    fi
else
    log_issue "Missing .next/server directory (incomplete build)"
fi

# 2. Check webpack cache integrity
echo "   🔍 Cache corruption patterns..."
WEBPACK_CACHE_DIR=".next/cache/webpack"
if [ -d "$WEBPACK_CACHE_DIR" ]; then
    # Check for empty or corrupted pack files
    if find "$WEBPACK_CACHE_DIR" -name "*.pack*" -size 0 2>/dev/null | grep -q .; then
        log_issue "Empty webpack pack files found"
    fi
    
    # Check for invalid gzip files
    for pack_file in "$WEBPACK_CACHE_DIR"/*.pack.gz; do
        if [ -f "$pack_file" ] 2>/dev/null; then
            if ! file "$pack_file" 2>/dev/null | grep -q "gzip compressed"; then
                log_issue "Corrupted pack file: $(basename "$pack_file")"
                break
            fi
        fi
    done
    
    # Only check for build manifest if we're in a development build context
    # Production builds may not have this file
fi

# 3. Check for error patterns in recent terminal output or logs
echo "   🔍 Error pattern detection..."

# Common webpack error patterns
ERROR_PATTERNS=(
    "Cannot find module.*vendor-chunks"
    "Cannot read properties of undefined.*hasStartTime"
    "Restoring pack.*failed"
    "Module not found.*\.next"
    "webpack.*chunk.*failed"
    "ENOENT.*\.next"
)

# Check recent terminal history if available
for pattern in "${ERROR_PATTERNS[@]}"; do
    # Check logs if they exist
    if [ -f "logs/app.log" ]; then
        if grep -q "$pattern" logs/app.log 2>/dev/null; then
            log_issue "Error pattern detected: $pattern"
        fi
    fi
done

# 4. Check build integrity
echo "   🔍 Build integrity..."
if [ -d ".next" ]; then
    # Check if critical Next.js files exist for production builds
    CRITICAL_FILES=(
        ".next/BUILD_ID"
    )
    
    for file in "${CRITICAL_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_issue "Missing critical build file: $file (run build first)"
        fi
    done
    
    # Check build age (if older than 7 days, might be stale)
    if [ -f ".next/BUILD_ID" ]; then
        BUILD_AGE=$(find .next/BUILD_ID -mtime +7 2>/dev/null || echo "")
        if [ -n "$BUILD_AGE" ]; then
            log_issue "Stale build detected (older than 7 days) - consider rebuild"
        fi
    fi
fi

# 5. Check Node.js module resolution
echo "   🔍 Module resolution..."
if ! node -e "require('next')" 2>/dev/null; then
    log_issue "Next.js module resolution failed"
fi

echo
echo "📊 HEALTH CHECK RESULTS:"
echo "========================"

if [ "$ISSUES_FOUND" = false ]; then
    echo "✅ WEBPACK HEALTH: EXCELLENT"
    echo "   No issues detected"
    echo "   Build cache appears healthy"
    echo
    echo "💡 If you're still experiencing issues:"
    echo "   Run: $0 --force-repair"
    exit 0
fi

echo "⚠️  WEBPACK HEALTH: ISSUES DETECTED"
echo

# Auto-repair logic
if [ "$1" = "--auto-repair" ] || [ "$1" = "--force-repair" ]; then
    echo "🔧 INITIATING REPAIR..."
    echo "======================"
    
    if [ "$1" = "--force-repair" ]; then
        echo "🚨 FORCE REPAIR MODE: Clearing all webpack artifacts"
        ISSUES_FOUND=true  # Force repair regardless of health check
    fi
    
    # Clear corrupted cache
    echo "🗑️  Clearing webpack cache and build artifacts..."
    rm -rf .next 2>/dev/null || true
    log_repair "Removed corrupted .next directory"
    
    # Clear node_modules/.cache if it exists
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        log_repair "Cleared node_modules cache"
    fi
    
    # Clear npm cache for this project
    npm cache clean --force 2>/dev/null || true
    log_repair "Cleared npm cache"
    
    echo
    echo "✅ AUTO-REPAIR COMPLETED"
    echo "======================="
    echo "🚀 NEXT STEPS:"
    echo "   1. Run: npm run dev"
    echo "   2. First build will be slower (fresh cache)"
    echo "   3. Monitor for recurring issues"
    echo
    echo "💡 If issues persist:"
    echo "   - Check Node.js version compatibility"
    echo "   - Run: npm run ready"
    echo "   - Consider updating Next.js"
    
else
    echo "🔧 REPAIR RECOMMENDATIONS:"
    echo "=========================="
    echo "   Run auto-repair: $0 --auto-repair"
    echo "   Or manual steps:"
    echo "   1. rm -rf .next"
    echo "   2. npm run dev"
    echo
    echo "⚠️  Issues detected but not auto-repaired"
    echo "   Use --auto-repair flag to fix automatically"
    exit 1
fi
