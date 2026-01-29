#!/bin/bash

# Start persistent dev server that survives terminal closing

set -e

PID_FILE="/tmp/z-beam-dev.pid"
LOG_FILE="/tmp/z-beam-dev.log"

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "⚠️  Dev server already running (PID: $PID)"
        echo "View logs: tail -f $LOG_FILE"
        exit 0
    else
        echo "🧹 Cleaning up stale PID file..."
        rm "$PID_FILE"
    fi
fi

# Kill any process on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "🛑 Killing existing process on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Start dev server in background
echo "🚀 Starting dev server in background..."
cd "$(dirname "$0")/../.."

# Use nohup to prevent SIGHUP when terminal closes
nohup npm run dev > "$LOG_FILE" 2>&1 &
PID=$!

# Save PID
echo "$PID" > "$PID_FILE"

# Wait a moment to check if it started successfully
sleep 2

if ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ Dev server started successfully!"
    echo "   PID: $PID"
    echo "   Logs: $LOG_FILE"
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs:    tail -f $LOG_FILE"
    echo "   Check status: npm run dev:status"
    echo "   Stop server:  npm run dev:stop"
else
    echo "❌ Failed to start dev server"
    cat "$LOG_FILE"
    rm "$PID_FILE"
    exit 1
fi
