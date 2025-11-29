#!/bin/bash
# Safe Kill Script - Prevents killing the persistent dev server
# Use this instead of raw pkill commands

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/.dev-server.pid"

# Function to check if a PID is the protected dev server
is_protected() {
    local pid=$1
    if [ -f "$PID_FILE" ]; then
        PROTECTED_PID=$(cat "$PID_FILE")
        if [ "$pid" = "$PROTECTED_PID" ]; then
            return 0
        fi
    fi
    return 1
}

# Get all Next.js dev processes
NEXT_PIDS=$(pgrep -f "next dev" || true)

if [ -z "$NEXT_PIDS" ]; then
    echo "ℹ️  No Next.js dev processes found"
    exit 0
fi

KILLED_COUNT=0
PROTECTED_COUNT=0

# Check each process
for PID in $NEXT_PIDS; do
    if is_protected "$PID"; then
        echo "🛡️  Protected dev server (PID: $PID) - skipping"
        PROTECTED_COUNT=$((PROTECTED_COUNT + 1))
    else
        echo "🗑️  Killing unprotected process (PID: $PID)"
        kill "$PID" 2>/dev/null || true
        KILLED_COUNT=$((KILLED_COUNT + 1))
    fi
done

echo ""
echo "Summary:"
echo "  ✅ Protected: $PROTECTED_COUNT"
echo "  ❌ Killed: $KILLED_COUNT"
