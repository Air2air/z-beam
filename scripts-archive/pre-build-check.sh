#!/bin/bash

# Comprehensive Pre-Build Health Check Script
# Ensures :3000 dev server will work properly before starting

echo "� COMPREHENSIVE PRE-BUILD HEALTH CHECK"
echo "========================================"

ISSUES=0

# 1. CSS & Styling Health Check
echo "🎨 CSS HEALTH CHECK:"

# Check Tailwind CSS setup
if [ ! -f "tailwind.config.js" ]; then
    echo "   ❌ tailwind.config.js missing"
    ((ISSUES++))
else
    echo "   ✅ tailwind.config.js exists"
fi

# Check PostCSS setup
if [ ! -f "postcss.config.js" ]; then
    echo "   ❌ postcss.config.js missing" 
    ((ISSUES++))
else
    echo "   ✅ postcss.config.js exists"
    # Check if Tailwind is configured
    if grep -q "tailwindcss" postcss.config.js; then
        echo "   ✅ Tailwind configured in PostCSS"
    else
        echo "   ❌ Tailwind NOT configured in PostCSS"
        ((ISSUES++))
    fi
fi

# Check global CSS file
if [ ! -f "app/css/global.css" ]; then
    echo "   ❌ app/css/global.css missing"
    ((ISSUES++))
else
    echo "   ✅ global.css exists"
    # Check if it imports Tailwind
    if grep -q "tailwindcss" app/css/global.css; then
        echo "   ✅ Tailwind imports found in global.css"
    else
        echo "   ❌ Missing Tailwind imports in global.css"
        ((ISSUES++))
    fi
fi

# Check layout.tsx imports global.css
if [ -f "app/layout.tsx" ]; then
    if grep -q "global.css" app/layout.tsx; then
        echo "   ✅ global.css imported in layout.tsx"
    else
        echo "   ❌ global.css NOT imported in layout.tsx"
        ((ISSUES++))
    fi
fi

# 2. Port 3000 Management - Always Use 3000
echo
echo "🌐 PORT 3000 MANAGEMENT:"

if command -v lsof > /dev/null 2>&1; then
    if lsof -ti:3000 > /dev/null 2>&1; then
        PID=$(lsof -ti:3000)
        PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
        echo "   ⚠️  Port 3000 occupied by PID $PID ($PROCESS)"
        echo "   🔧 Killing process to free port 3000..."
        
        # Kill the process using port 3000
        if kill $PID 2>/dev/null; then
            sleep 1  # Give it a moment to die
            if ! lsof -ti:3000 > /dev/null 2>&1; then
                echo "   ✅ Port 3000 freed successfully"
            else
                echo "   🔨 Process stubborn, using force kill..."
                kill -9 $PID 2>/dev/null
                sleep 1
                if ! lsof -ti:3000 > /dev/null 2>&1; then
                    echo "   ✅ Port 3000 freed with force"
                else
                    echo "   ❌ Could not free port 3000"
                    ((ISSUES++))
                fi
            fi
        else
            echo "   ❌ Failed to kill process $PID"
            ((ISSUES++))
        fi
    else
        echo "   ✅ Port 3000 is available"
    fi
else
    echo "   ℹ️  Cannot manage port (lsof not available)"
fi

# 3. Component Health Check
echo
echo "🧩 COMPONENT SYSTEM:"

# Run component enforcement
if npm run enforce-components --silent > /dev/null 2>&1; then
    echo "   ✅ Component enforcement passes"
else
    echo "   ❌ Component enforcement failures detected"
    echo "   🔧 Run: npm run enforce-components for details"
    ((ISSUES++))
fi

# Check required shared components exist
REQUIRED_COMPONENTS=(
    "app/components/SmartTagList.tsx"
    "app/components/AuthorCard.tsx" 
    "app/components/Button.tsx"
    "app/components/Container.tsx"
)

for component in "${REQUIRED_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "   ✅ $(basename "$component") exists"
    else
        echo "   ❌ Missing required component: $component"
        ((ISSUES++))
    fi
done

# 4. Dependencies Check
echo
echo "� DEPENDENCIES:"

# Check node_modules exists
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
else
    echo "   ❌ node_modules missing - run npm install"
    ((ISSUES++))
fi

# Check critical dependencies
CRITICAL_DEPS=("next" "react" "tailwindcss" "@tailwindcss/postcss")
for dep in "${CRITICAL_DEPS[@]}"; do
    if npm list "$dep" --depth=0 --silent > /dev/null 2>&1; then
        echo "   ✅ $dep installed"
    else
        echo "   ❌ Missing critical dependency: $dep"
        ((ISSUES++))
    fi
done

# 5. TypeScript Check
echo
echo "� TYPESCRIPT:"

if npx tsc --noEmit --skipLibCheck --pretty false > /dev/null 2>&1; then
    echo "   ✅ TypeScript compilation clean"
else
    echo "   ❌ TypeScript errors detected"
    echo "   🔧 Run: npx tsc --noEmit for details"
    ((ISSUES++))
fi

# 6. Configuration Files Check
echo
echo "⚙️  CONFIGURATION:"

CONFIG_FILES=("next.config.js" "tsconfig.json" "package.json" "PROJECT_GUIDE.md")
for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$config" ]; then
        echo "   ✅ $config exists"
    else
        echo "   ❌ Missing configuration file: $config"
        ((ISSUES++))
    fi
done

# Validate PROJECT_GUIDE.md health
if [ -f "PROJECT_GUIDE.md" ]; then
    if ./validate-project-guide.sh --quiet > /dev/null 2>&1; then
        echo "   ✅ PROJECT_GUIDE.md validation passes"
    else
        echo "   ❌ PROJECT_GUIDE.md validation issues detected"
        echo "   🔧 Run: npm run validate:guide for details"
        ((ISSUES++))
    fi
fi

# 7. Build Cache Status & Corruption Check
echo
echo "🗂️  BUILD CACHE:"

if [ -d ".next" ]; then
    CACHE_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
    echo "   ✅ .next cache exists ($CACHE_SIZE)"
    
    # Check for webpack cache corruption indicators
    WEBPACK_CACHE_DIR=".next/cache/webpack"
    if [ -d "$WEBPACK_CACHE_DIR" ]; then
        # Look for corrupted pack files or invalid cache structure
        if find "$WEBPACK_CACHE_DIR" -name "*.pack.gz" -size 0 2>/dev/null | grep -q .; then
            echo "   ❌ Corrupted webpack cache detected (empty pack files)"
            echo "   🔧 Clearing corrupted cache..."
            rm -rf .next
            echo "   ✅ Cache cleared - fresh build will be created"
        elif [ -f "$WEBPACK_CACHE_DIR/client-development.pack.gz" ] && ! file "$WEBPACK_CACHE_DIR/client-development.pack.gz" 2>/dev/null | grep -q "gzip"; then
            echo "   ❌ Corrupted webpack pack file detected"
            echo "   🔧 Clearing corrupted cache..."
            rm -rf .next
            echo "   ✅ Cache cleared - fresh build will be created"
        else
            echo "   ✅ Webpack cache appears healthy"
        fi
    fi
    
    # Check if cache is very old (older than 7 days)
    if [ -d ".next" ] && find .next -mtime +7 -type f 2>/dev/null | head -1 | grep -q .; then
        echo "   ⚠️  Build cache is quite old - consider: rm -rf .next"
    fi
else
    echo "   ℹ️  No .next cache (first build will be slower)"
fi

# 8. Environment Info
echo
echo "🌍 ENVIRONMENT:"

# Check Node version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
echo "   ℹ️  Node.js: $NODE_VERSION"

# Check NPM version  
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
echo "   ℹ️  NPM: $NPM_VERSION"

# Check if using right Node version for Next.js
NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -ge 18 ] 2>/dev/null; then
    echo "   ✅ Node.js version compatible with Next.js"
else
    echo "   ⚠️  Node.js version may be too old for Next.js 14+"
fi

# 9. Final Assessment
echo
echo "📊 READINESS ASSESSMENT:"
echo "========================"

if [ $ISSUES -eq 0 ]; then
    echo "🎉 PERFECT: Everything is ready for :3000!"
    echo ""
    echo "✅ CSS will load properly"
    echo "✅ Components are healthy" 
    echo "✅ TypeScript is clean"
    echo "✅ Dependencies are installed"
    echo ""
    echo "🚀 Run: npm run dev"
    echo "   Then open: http://localhost:3000"
    echo ""
    exit 0
else
    echo "❌ NOT READY: Please fix critical issues first"
    echo ""
    echo "� Critical issues: $ISSUES"
    echo ""
    echo "🔧 QUICK FIXES:"
    echo "   1. Fix ❌ critical issues above"
    echo "   2. Run: npm install (if dependencies missing)"
    echo "   3. Check CSS configuration (Tailwind/PostCSS)"
    echo "   4. Fix TypeScript errors: npx tsc --noEmit"
    echo "   5. Resolve component issues: npm run enforce-components"
    echo "   6. Clear corrupted cache: rm -rf .next (if build issues)"
    echo ""
    echo "💡 COMMON WEBPACK CACHE ISSUES:"
    echo "   - 'Cannot read properties of undefined (reading hasStartTime)'"
    echo "   - 'Restoring pack from webpack cache failed'"
    echo "   → Solution: rm -rf .next && npm run dev"
    echo ""
    echo "Then run this script again to verify!"
    echo ""
    exit 1
fi
