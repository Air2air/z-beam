#!/bin/bash
# Stop all development-related processes
# Use with caution - this will terminate all node/npm/jest/next processes

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🛑 Stopping all development processes..."
echo ""

KILLED_ANY=0

# Function to kill processes matching a pattern
kill_pattern() {
    PATTERN=$1
    NAME=$2
    
    PIDS=$(ps aux | grep -E "$PATTERN" | grep -v grep | awk '{print $2}' || true)
    
    if [ -n "$PIDS" ]; then
        echo -e "${YELLOW}Stopping $NAME processes:${NC}"
        echo "$PIDS" | while IFS= read -r pid; do
            CMD=$(ps -p "$pid" -o command= || echo "unknown")
            echo "  Killing PID $pid - $CMD"
            kill -9 "$pid" 2>/dev/null || echo "  (already gone)"
        done
        KILLED_ANY=1
        echo ""
    fi
}

# Stop various development processes
kill_pattern "next dev" "Next.js dev server"
kill_pattern "next build" "Next.js build"
kill_pattern "jest" "Jest test runner"
kill_pattern "tsx.*scripts" "TypeScript execution"
kill_pattern "npm.*run.*dev" "npm dev"
kill_pattern "npm.*run.*build" "npm build"
kill_pattern "npm.*run.*test" "npm test"

# Clean up PID file if exists
if [ -f ".dev-server.pid" ]; then
    echo -e "${YELLOW}Removing stale PID file${NC}"
    rm -f .dev-server.pid
fi

# Clean up any port locks (Next.js default port)
PORT_3000=$(lsof -ti:3000 || true)
if [ -n "$PORT_3000" ]; then
    echo -e "${YELLOW}Freeing port 3000:${NC}"
    echo "$PORT_3000" | while IFS= read -r pid; do
        echo "  Killing process on port 3000: PID $pid"
        kill -9 "$pid" 2>/dev/null || echo "  (already gone)"
    done
    KILLED_ANY=1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $KILLED_ANY -eq 0 ]; then
    echo -e "${GREEN}✓ No processes found to stop${NC}"
else
    echo -e "${GREEN}✅ All development processes stopped${NC}"
    echo ""
    echo "You can now safely start a new dev server:"
    echo "  npm run dev:persistent"
    echo "  or"
    echo "  npm run dev"
fi
