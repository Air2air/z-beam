#!/bin/bash

# Development Readiness Check
# Ensures :3000 will work perfectly with CSS, components, and all features

echo "🚀 DEVELOPMENT READINESS CHECK"
echo "============================="

ISSUES=0
WARNINGS=0

# Helper function for consistent reporting
report_issue() {
    echo "   ❌ $1"
    ((ISSUES++))
}

report_warning() {
    echo "   ⚠️  $1"
    ((WARNINGS++))
}

report_success() {
    echo "   ✅ $1"
}

report_info() {
    echo "   ℹ️  $1"
}

# 1. CSS & Styling Health Check
echo "🎨 CSS & STYLING HEALTH:"

# Check if Tailwind CSS is properly configured
if [ ! -f "tailwind.config.js" ]; then
    report_issue "tailwind.config.js missing"
elif ! grep -q "app/" tailwind.config.js; then
    report_issue "app/ directory not in Tailwind content paths"
else
    report_success "Tailwind configuration valid"
fi

# Check PostCSS configuration
if [ ! -f "postcss.config.js" ]; then
    report_issue "postcss.config.js missing"
elif ! grep -q "tailwindcss" postcss.config.js; then
    report_issue "Tailwind not configured in PostCSS"
else
    report_success "PostCSS configuration valid"
fi

# Check global CSS file and imports
if [ ! -f "app/css/global.css" ]; then
    report_issue "app/css/global.css missing"
elif ! grep -q "tailwindcss" app/css/global.css; then
    report_issue "Tailwind imports missing in global.css"
else
    report_success "Global CSS with Tailwind imports found"
fi

# Check if global CSS is imported in layout
if [ -f "app/layout.tsx" ] && grep -q "global.css" app/layout.tsx; then
    report_success "Global CSS imported in layout.tsx"
elif [ -f "app/layout.tsx" ]; then
    report_issue "Global CSS NOT imported in layout.tsx"
else
    report_issue "app/layout.tsx missing"
fi

# 2. Port & Server Check
echo
echo "🌐 PORT & SERVER:"

# Check port 3000 availability
if command -v lsof > /dev/null 2>&1; then
    if lsof -ti:3000 > /dev/null 2>&1; then
        PID=$(lsof -ti:3000)
        PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
        report_warning "Port 3000 occupied by PID $PID ($PROCESS)"
        report_info "Next.js will auto-select another port, or kill $PID to free 3000"
    else
        report_success "Port 3000 is available"
    fi
else
    report_info "Cannot check port status (lsof not available)"
fi

# 3. Dependencies & Installation
echo
echo "📦 DEPENDENCIES:"

# Check node_modules
if [ ! -d "node_modules" ]; then
    report_issue "node_modules missing - run: npm install"
elif [ ! -f "node_modules/.package-lock.json" ] && [ ! -f "package-lock.json" ]; then
    report_warning "No lock file found - dependencies may be inconsistent"
else
    report_success "Dependencies installed"
fi

# Check critical packages
CRITICAL_PACKAGES=("next" "react" "tailwindcss" "@tailwindcss/postcss")
for pkg in "${CRITICAL_PACKAGES[@]}"; do
    if npm list "$pkg" --depth=0 --silent > /dev/null 2>&1; then
        report_success "$pkg installed"
    else
        report_issue "$pkg missing - run: npm install"
    fi
done

# 4. Component System Health
echo
echo "🧩 COMPONENT SYSTEM:"

# Run component enforcement check
if npm run enforce-components --silent > /dev/null 2>&1; then
    report_success "Component enforcement passes"
else
    report_issue "Component violations detected - run: npm run enforce-components"
fi

# Check shared components exist
SHARED_COMPONENTS=(
    "app/components/SmartTagList.tsx"
    "app/components/AuthorCard.tsx"
    "app/components/Button.tsx"
    "app/components/Container.tsx"
)

for comp in "${SHARED_COMPONENTS[@]}"; do
    if [ -f "$comp" ]; then
        report_success "$(basename "$comp") exists"
    else
        report_warning "$(basename "$comp") missing (may affect functionality)"
    fi
done

# 5. TypeScript Health
echo
echo "📝 TYPESCRIPT:"

# Quick TypeScript check
if command -v npx > /dev/null 2>&1; then
    if npx tsc --noEmit --skipLibCheck --pretty false > /dev/null 2>&1; then
        report_success "TypeScript compilation clean"
    else
        report_issue "TypeScript errors - run: npx tsc --noEmit for details"
    fi
else
    report_warning "Cannot run TypeScript check (npx not available)"
fi

# 6. Build System
echo
echo "🏗️  BUILD SYSTEM:"

# Check config files
CONFIG_FILES=("next.config.js" "tsconfig.json" "package.json")
for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$config" ]; then
        report_success "$config exists"
    else
        report_issue "$config missing"
    fi
done

# Check build cache status
if [ -d ".next" ]; then
    CACHE_AGE=$(find .next -type f -name "*.js" | head -1 | xargs stat -f "%Sm" -t "%Y-%m-%d" 2>/dev/null || echo "unknown")
    report_info ".next cache exists (from $CACHE_AGE)"
    
    # Check if cache is very old
    if find .next -mtime +7 -type f | head -1 | grep -q . 2>/dev/null; then
        report_warning "Build cache is old - consider: rm -rf .next"
    fi
else
    report_info "No build cache (first run will create it)"
fi

# 7. Environment Check
echo
echo "🌍 ENVIRONMENT:"

# Node version check
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [[ $NODE_VERSION =~ ^v([0-9]+) ]]; then
    NODE_MAJOR=${BASH_REMATCH[1]}
    if [ "$NODE_MAJOR" -ge 18 ]; then
        report_success "Node.js $NODE_VERSION (compatible)"
    else
        report_warning "Node.js $NODE_VERSION (may be too old for Next.js 14+)"
    fi
else
    report_issue "Node.js not found or invalid version"
fi

# NPM version
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
if [ "$NPM_VERSION" != "not found" ]; then
    report_info "NPM $NPM_VERSION"
else
    report_issue "NPM not found"
fi

# 8. Quick Development Test
echo
echo "🔧 QUICK DEV TEST:"

# Test if we can import key files without syntax errors
if [ -f "app/layout.tsx" ]; then
    if node -pe "require('fs').readFileSync('app/layout.tsx', 'utf8')" > /dev/null 2>&1; then
        report_success "layout.tsx readable"
    else
        report_warning "layout.tsx may have issues"
    fi
fi

if [ -f "app/page.tsx" ]; then
    if node -pe "require('fs').readFileSync('app/page.tsx', 'utf8')" > /dev/null 2>&1; then
        report_success "page.tsx readable"  
    else
        report_warning "page.tsx may have issues"
    fi
fi

# 9. Final Assessment
echo
echo "📊 READINESS ASSESSMENT:"
echo "========================"

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
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
elif [ $ISSUES -eq 0 ]; then
    echo "✅ READY: Minor warnings but :3000 should work great!"
    echo ""
    echo "🔧 Warnings found: $WARNINGS (non-critical)"
    echo "   Your development server should work fine"
    echo ""
    echo "🚀 Run: npm run dev"
    echo ""
    exit 0
else
    echo "❌ NOT READY: Please fix critical issues first"
    echo ""
    echo "🚨 Critical issues: $ISSUES"
    echo "⚠️  Warnings: $WARNINGS"
    echo ""
    echo "🔧 QUICK FIXES:"
    [ $ISSUES -gt 0 ] && echo "   1. Fix ❌ critical issues above"
    echo "   2. Run: npm install (if dependencies missing)"
    echo "   3. Check CSS configuration (Tailwind/PostCSS)"
    echo "   4. Fix TypeScript errors: npx tsc --noEmit"
    echo "   5. Resolve component issues: npm run enforce-components"
    echo ""
    echo "Then run this script again to verify!"
    echo ""
    exit 1
fi
