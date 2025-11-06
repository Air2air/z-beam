#!/bin/bash
# Pre-development health check
# Run this before starting work to ensure clean state

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🏥 Development Environment Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ISSUES=0

# 1. Check for runaway processes
echo "1. Scanning for runaway processes..."
if ./scripts/dev/detect-runaway-processes.sh > /tmp/health-check.log 2>&1; then
    echo -e "   ${GREEN}✓${NC} No runaway processes"
else
    echo -e "   ${YELLOW}⚠${NC}  Issues detected"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 2. Check for stale PID files
echo "2. Checking for stale PID files..."
if [ -f ".dev-server.pid" ]; then
    PID=$(cat .dev-server.pid)
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} Dev server PID $PID is valid"
    else
        echo -e "   ${YELLOW}⚠${NC}  Stale PID file (process $PID not running)"
        rm .dev-server.pid
        echo "   → Cleaned up stale PID file"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "   ${GREEN}✓${NC} No PID file (server not running)"
fi
echo ""

# 3. Check port 3000 availability
echo "3. Checking port 3000 availability..."
PORT_CHECK=$(lsof -ti:3000 || true)
if [ -z "$PORT_CHECK" ]; then
    echo -e "   ${GREEN}✓${NC} Port 3000 is available"
else
    echo -e "   ${YELLOW}⚠${NC}  Port 3000 is in use by PID: $PORT_CHECK"
    ps -p "$PORT_CHECK" -o command= || echo "   (process details unavailable)"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 4. Check disk space
echo "4. Checking disk space..."
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "   ${GREEN}✓${NC} Disk usage: ${DISK_USAGE}%"
else
    echo -e "   ${YELLOW}⚠${NC}  High disk usage: ${DISK_USAGE}%"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 5. Check Node.js version
echo "5. Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "   ${GREEN}✓${NC} Node.js $NODE_VERSION"
else
    echo -e "   ${RED}✗${NC} Node.js not found"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 6. Check npm version
echo "6. Checking npm version..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "   ${GREEN}✓${NC} npm $NPM_VERSION"
else
    echo -e "   ${RED}✗${NC} npm not found"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 7. Check for node_modules
echo "7. Checking dependencies..."
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l | xargs)
    echo -e "   ${GREEN}✓${NC} node_modules exists ($MODULE_COUNT packages)"
else
    echo -e "   ${YELLOW}⚠${NC}  node_modules missing - run npm install"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 8. Check for .next directory
echo "8. Checking build artifacts..."
if [ -d ".next" ]; then
    NEXT_SIZE=$(du -sh .next | cut -f1)
    echo -e "   ${GREEN}✓${NC} .next directory exists ($NEXT_SIZE)"
else
    echo -e "   ${GREEN}✓${NC} No .next directory (clean state)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Environment is healthy - ready to develop!${NC}"
    echo ""
    echo "Start development with:"
    echo "  npm run dev:persistent  (background server)"
    echo "  npm run dev             (foreground server)"
    exit 0
else
    echo -e "${YELLOW}⚠️  Found $ISSUES issue(s) - review above${NC}"
    echo ""
    echo "Recommended actions:"
    if grep -q "runaway processes" /tmp/health-check.log 2>/dev/null; then
        echo "  → Stop all processes: npm run dev:stop-all"
    fi
    if [ -n "$PORT_CHECK" ]; then
        echo "  → Free port 3000: kill -9 $PORT_CHECK"
    fi
    if [ ! -d "node_modules" ]; then
        echo "  → Install dependencies: npm install"
    fi
    echo ""
    echo "Then re-run: npm run dev:health"
    exit 1
fi
