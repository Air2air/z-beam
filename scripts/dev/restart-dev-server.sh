#!/bin/bash
# Restart Dev Server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Restarting dev server..."
"$SCRIPT_DIR/stop-dev-server.sh"
sleep 2
"$SCRIPT_DIR/start-dev-persistent.sh"
