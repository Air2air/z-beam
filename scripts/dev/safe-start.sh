#!/bin/bash
# Safe dev server start - ensures clean state before starting
# This is the recommended way to start development

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Safe Development Server Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Health check
echo "Step 1: Running health check..."
if ./scripts/dev/health-check.sh > /tmp/safe-start.log 2>&1; then
    echo -e "${GREEN}✓${NC} Environment is healthy"
else
    echo -e "${YELLOW}⚠${NC}  Issues detected, cleaning up..."
    
    # Show what was detected
    cat /tmp/safe-start.log
    echo ""
    
    # Ask user if they want to clean up
    read -p "Clean up and continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Startup cancelled."
        exit 1
    fi
    
    # Clean up
    echo ""
    echo "Step 2: Cleaning up processes..."
    ./scripts/dev/stop-all-processes.sh
    echo ""
fi

# Step 3: Start server
echo "Step 3: Starting persistent dev server..."
./scripts/dev/start-dev-persistent.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Dev server started safely!${NC}"
echo ""
echo "Monitor status with:"
echo "  npm run dev:status"
echo ""
echo "Start continuous monitoring with:"
echo "  npm run dev:watch"
echo ""
echo "View logs with:"
echo "  tail -f .dev-server.log"
