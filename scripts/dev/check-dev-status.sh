#!/bin/bash
# Check Dev Server Status

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/.dev-server.pid"
LOG_FILE="$PROJECT_ROOT/.dev-server.log"

if [ ! -f "$PID_FILE" ]; then
    echo "❌ Dev server is not running (no PID file found)"
    exit 1
fi

PID=$(cat "$PID_FILE")

if ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ Dev server is running"
    echo "   PID: $PID"
    echo "   URL: http://localhost:3000"
    echo "   Logs: $LOG_FILE"
    echo ""
    echo "📊 Recent logs:"
    tail -20 "$LOG_FILE" 2>/dev/null || echo "   (no logs available)"
    exit 0
else
    echo "❌ Dev server is not running (PID $PID not found)"
    echo "   Cleaning up stale PID file..."
    rm -f "$PID_FILE"
    exit 1
fi
