#!/bin/bash
# Automatic cleanup of runaway processes
# This script automatically kills processes that exceed thresholds

set -e

# Configuration
AUTO_KILL=${AUTO_KILL:-false}  # Set to true to auto-kill, false for dry-run
CPU_KILL_THRESHOLD=95          # Auto-kill if CPU > 95%
MEMORY_KILL_THRESHOLD=2000000  # Auto-kill if memory > 2GB (in KB)
MAX_RUNTIME_KILL_HOURS=4       # Auto-kill if running > 4 hours

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🤖 Auto-cleanup process monitor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$AUTO_KILL" = "false" ]; then
    echo -e "${YELLOW}DRY RUN MODE${NC} - No processes will be killed"
    echo "Set AUTO_KILL=true to enable automatic cleanup"
    echo ""
else
    echo -e "${RED}⚠️  AUTO-KILL ENABLED${NC} - Runaway processes will be terminated"
    echo ""
fi

KILLED_COUNT=0

# Kill processes with excessive CPU
echo "Checking CPU usage..."
ps aux | grep -E "(node|npm|jest|next|tsx)" | grep -v grep | while IFS= read -r line; do
    PID=$(echo "$line" | awk '{print $2}')
    CPU=$(echo "$line" | awk '{print $3}' | cut -d. -f1)
    CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
    
    if [ "$CPU" -gt "$CPU_KILL_THRESHOLD" ]; then
        echo -e "${RED}⚠️  High CPU: PID $PID - ${CPU}% - $CMD${NC}"
        if [ "$AUTO_KILL" = "true" ]; then
            echo "   → Killing process..."
            kill -9 "$PID" 2>/dev/null || echo "   (already terminated)"
            KILLED_COUNT=$((KILLED_COUNT + 1))
        else
            echo "   → Would kill in AUTO_KILL mode"
        fi
    fi
done

# Kill processes with excessive memory
echo ""
echo "Checking memory usage..."
ps aux | grep -E "(node|npm|jest|next|tsx)" | grep -v grep | while IFS= read -r line; do
    PID=$(echo "$line" | awk '{print $2}')
    MEM_KB=$(echo "$line" | awk '{print $6}')
    MEM_MB=$((MEM_KB / 1024))
    CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
    
    if [ "$MEM_KB" -gt "$MEMORY_KILL_THRESHOLD" ]; then
        echo -e "${RED}⚠️  High Memory: PID $PID - ${MEM_MB}MB - $CMD${NC}"
        if [ "$AUTO_KILL" = "true" ]; then
            echo "   → Killing process..."
            kill -9 "$PID" 2>/dev/null || echo "   (already terminated)"
            KILLED_COUNT=$((KILLED_COUNT + 1))
        else
            echo "   → Would kill in AUTO_KILL mode"
        fi
    fi
done

# Kill long-running processes
echo ""
echo "Checking long-running processes..."
MAX_SECONDS=$((MAX_RUNTIME_KILL_HOURS * 3600))

ps -eo pid,etime,command | grep -E "(node|npm|jest|next|tsx)" | grep -v grep | while IFS= read -r line; do
    PID=$(echo "$line" | awk '{print $1}')
    ETIME=$(echo "$line" | awk '{print $2}')
    CMD=$(echo "$line" | awk '{for(i=3;i<=NF;i++) printf $i" "; print ""}')
    
    # Convert etime to seconds
    SECONDS=0
    if [[ $ETIME =~ ^([0-9]+)-([0-9]+):([0-9]+):([0-9]+)$ ]]; then
        SECONDS=$(( ${BASH_REMATCH[1]} * 86400 + ${BASH_REMATCH[2]} * 3600 + ${BASH_REMATCH[3]} * 60 + ${BASH_REMATCH[4]} ))
    elif [[ $ETIME =~ ^([0-9]+):([0-9]+):([0-9]+)$ ]]; then
        SECONDS=$(( ${BASH_REMATCH[1]} * 3600 + ${BASH_REMATCH[2]} * 60 + ${BASH_REMATCH[3]} ))
    elif [[ $ETIME =~ ^([0-9]+):([0-9]+)$ ]]; then
        SECONDS=$(( ${BASH_REMATCH[1]} * 60 + ${BASH_REMATCH[2]} ))
    fi
    
    if [ $SECONDS -gt $MAX_SECONDS ]; then
        HOURS=$((SECONDS / 3600))
        echo -e "${RED}⚠️  Long-running: PID $PID - ${HOURS}h - $CMD${NC}"
        if [ "$AUTO_KILL" = "true" ]; then
            echo "   → Killing process..."
            kill -9 "$PID" 2>/dev/null || echo "   (already terminated)"
            KILLED_COUNT=$((KILLED_COUNT + 1))
        else
            echo "   → Would kill in AUTO_KILL mode"
        fi
    fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$AUTO_KILL" = "true" ]; then
    if [ $KILLED_COUNT -eq 0 ]; then
        echo -e "${GREEN}✓ No processes needed cleanup${NC}"
    else
        echo -e "${YELLOW}Killed $KILLED_COUNT runaway process(es)${NC}"
    fi
else
    echo -e "${GREEN}✓ Scan complete (dry-run mode)${NC}"
    echo "Run with AUTO_KILL=true to enable automatic cleanup"
fi
