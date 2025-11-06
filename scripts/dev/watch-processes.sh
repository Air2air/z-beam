#!/bin/bash
# Continuous monitoring of development processes
# Runs detection every N seconds and alerts on issues

set -e

INTERVAL=${INTERVAL:-30}  # Check every 30 seconds by default
ALERT_LOG=".process-alerts.log"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "👀 Starting process monitor (checking every ${INTERVAL}s)"
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Trap Ctrl+C to exit gracefully
trap 'echo -e "\n${YELLOW}Stopping monitor...${NC}"; exit 0' INT

CHECK_COUNT=0

while true; do
    CHECK_COUNT=$((CHECK_COUNT + 1))
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    
    echo -e "${GREEN}[Check #$CHECK_COUNT - $TIMESTAMP]${NC}"
    
    # Run detection script silently and capture exit code
    if ./scripts/dev/detect-runaway-processes.sh > /tmp/process-check.log 2>&1; then
        echo "  ✓ All processes healthy"
    else
        echo -e "  ${YELLOW}⚠️  Issues detected!${NC}"
        cat /tmp/process-check.log
        
        # Log the alert
        echo "[$TIMESTAMP] Issues detected - see details above" >> "$ALERT_LOG"
        
        # Ask user what to do
        echo ""
        echo "Options:"
        echo "  1) Continue monitoring"
        echo "  2) Stop all processes (run stop-all-processes.sh)"
        echo "  3) Exit monitor"
        read -t 10 -p "Choose (1-3, auto-continue in 10s): " choice || choice="1"
        
        case $choice in
            2)
                ./scripts/dev/stop-all-processes.sh
                echo "Processes stopped. Monitor will continue..."
                ;;
            3)
                echo "Exiting monitor..."
                exit 0
                ;;
            *)
                echo "Continuing monitor..."
                ;;
        esac
    fi
    
    echo ""
    sleep "$INTERVAL"
done
