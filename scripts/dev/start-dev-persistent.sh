#!/bin/bash
# Persistent Dev Server Starter
# Runs in background and survives terminal closures

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/.dev-server.pid"
LOG_FILE="$PROJECT_ROOT/.dev-server.log"

cd "$PROJECT_ROOT"

# Function to check if dev server is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Stop existing server if running
if is_running; then
    echo "⚠️  Dev server already running (PID: $(cat "$PID_FILE"))"
    echo "   Use 'npm run dev:stop' to stop it first, or 'npm run dev:restart' to restart"
    exit 0
fi

# Clean up old PID file
rm -f "$PID_FILE"

echo "🚀 Starting persistent dev server..."
echo "   Log file: $LOG_FILE"
echo "   PID file: $PID_FILE"

# Start dev server in background with nohup
nohup npm run dev > "$LOG_FILE" 2>&1 &
DEV_PID=$!

# Save PID
echo "$DEV_PID" > "$PID_FILE"

# Wait a moment to check if it started successfully
sleep 3

if is_running; then
    echo "✅ Dev server started successfully (PID: $DEV_PID)"
    echo "   Access at: http://localhost:3000"
    echo "   View logs: tail -f $LOG_FILE"
    echo "   Stop with: npm run dev:stop"
else
    echo "❌ Dev server failed to start. Check logs at: $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi
