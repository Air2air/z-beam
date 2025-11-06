#!/bin/bash
# Detect and report runaway or hanging processes
# This script identifies processes consuming excessive resources or running too long

set -e

# Configuration
CPU_THRESHOLD=80         # CPU usage threshold (%)
MEMORY_THRESHOLD=1000000 # Memory threshold in KB (roughly 1GB)
MAX_RUNTIME_HOURS=2      # Maximum runtime before flagging as potentially stuck

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Scanning for runaway/hanging processes..."
echo ""

# Track if we found any issues
ISSUES_FOUND=0

# Function to check CPU usage
check_cpu_intensive() {
    echo "━━━ High CPU Usage Processes ━━━"
    # Find processes using more than CPU_THRESHOLD% CPU
    HIGH_CPU=$(ps aux | awk -v threshold="$CPU_THRESHOLD" '$3 > threshold {print}' | grep -E "(node|npm|jest|next|tsx)" | grep -v grep || true)
    
    if [ -n "$HIGH_CPU" ]; then
        echo -e "${RED}⚠️  Found high CPU processes:${NC}"
        echo "$HIGH_CPU" | while IFS= read -r line; do
            PID=$(echo "$line" | awk '{print $2}')
            CPU=$(echo "$line" | awk '{print $3}')
            CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
            echo -e "  ${YELLOW}PID $PID${NC} - CPU: ${RED}${CPU}%${NC} - $CMD"
        done
        ISSUES_FOUND=1
    else
        echo -e "${GREEN}✓${NC} No high CPU processes found"
    fi
    echo ""
}

# Function to check memory usage
check_memory_intensive() {
    echo "━━━ High Memory Usage Processes ━━━"
    # Find processes using more than MEMORY_THRESHOLD KB of memory
    HIGH_MEM=$(ps aux | awk -v threshold="$MEMORY_THRESHOLD" '$6 > threshold {print}' | grep -E "(node|npm|jest|next|tsx)" | grep -v grep || true)
    
    if [ -n "$HIGH_MEM" ]; then
        echo -e "${RED}⚠️  Found high memory processes:${NC}"
        echo "$HIGH_MEM" | while IFS= read -r line; do
            PID=$(echo "$line" | awk '{print $2}')
            MEM_KB=$(echo "$line" | awk '{print $6}')
            MEM_MB=$((MEM_KB / 1024))
            CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
            echo -e "  ${YELLOW}PID $PID${NC} - Memory: ${RED}${MEM_MB}MB${NC} - $CMD"
        done
        ISSUES_FOUND=1
    else
        echo -e "${GREEN}✓${NC} No high memory processes found"
    fi
    echo ""
}

# Function to check long-running processes
check_long_running() {
    echo "━━━ Long-Running Processes ━━━"
    # Find processes running longer than MAX_RUNTIME_HOURS
    MAX_SECONDS=$((MAX_RUNTIME_HOURS * 3600))
    
    # Use ps with etime (elapsed time) and filter by our patterns
    LONG_RUNNING=$(ps -eo pid,etime,command | grep -E "(node|npm|jest|next|tsx)" | grep -v grep || true)
    
    if [ -n "$LONG_RUNNING" ]; then
        echo "$LONG_RUNNING" | while IFS= read -r line; do
            PID=$(echo "$line" | awk '{print $1}')
            ETIME=$(echo "$line" | awk '{print $2}')
            CMD=$(echo "$line" | awk '{for(i=3;i<=NF;i++) printf $i" "; print ""}')
            
            # Convert etime to seconds (handles formats like "00:05", "1-00:05:00", "05:30:00")
            SECONDS=0
            if [[ $ETIME =~ ^([0-9]+)-([0-9]+):([0-9]+):([0-9]+)$ ]]; then
                # Days format
                SECONDS=$(( ${BASH_REMATCH[1]} * 86400 + ${BASH_REMATCH[2]} * 3600 + ${BASH_REMATCH[3]} * 60 + ${BASH_REMATCH[4]} ))
            elif [[ $ETIME =~ ^([0-9]+):([0-9]+):([0-9]+)$ ]]; then
                # Hours format
                SECONDS=$(( ${BASH_REMATCH[1]} * 3600 + ${BASH_REMATCH[2]} * 60 + ${BASH_REMATCH[3]} ))
            elif [[ $ETIME =~ ^([0-9]+):([0-9]+)$ ]]; then
                # Minutes format
                SECONDS=$(( ${BASH_REMATCH[1]} * 60 + ${BASH_REMATCH[2]} ))
            fi
            
            if [ $SECONDS -gt $MAX_SECONDS ]; then
                HOURS=$((SECONDS / 3600))
                echo -e "  ${YELLOW}PID $PID${NC} - Running: ${RED}${ETIME} (${HOURS}h)${NC} - $CMD"
                ISSUES_FOUND=1
            fi
        done
        
        if [ $ISSUES_FOUND -eq 0 ]; then
            echo -e "${GREEN}✓${NC} No long-running processes found (threshold: ${MAX_RUNTIME_HOURS}h)"
        fi
    else
        echo -e "${GREEN}✓${NC} No long-running processes found"
    fi
    echo ""
}

# Function to check for zombie/orphaned processes
check_zombie_processes() {
    echo "━━━ Zombie/Orphaned Processes ━━━"
    ZOMBIES=$(ps aux | grep -E "(node|npm|jest|next|tsx)" | grep -E "Z|<defunct>" | grep -v grep || true)
    
    if [ -n "$ZOMBIES" ]; then
        echo -e "${RED}⚠️  Found zombie processes:${NC}"
        echo "$ZOMBIES" | while IFS= read -r line; do
            PID=$(echo "$line" | awk '{print $2}')
            CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
            echo -e "  ${YELLOW}PID $PID${NC} - $CMD"
        done
        ISSUES_FOUND=1
    else
        echo -e "${GREEN}✓${NC} No zombie processes found"
    fi
    echo ""
}

# Function to check for multiple instances of the same process
check_duplicate_processes() {
    echo "━━━ Duplicate Process Instances ━━━"
    
    # Check for multiple jest processes
    JEST_COUNT=$(ps aux | grep -E "jest" | grep -v grep | wc -l | xargs)
    if [ "$JEST_COUNT" -gt 1 ]; then
        echo -e "${YELLOW}⚠️  Multiple jest processes detected: $JEST_COUNT${NC}"
        ps aux | grep -E "jest" | grep -v grep | awk '{print "  PID " $2 " - " substr($0, index($0,$11))}'
        ISSUES_FOUND=1
    fi
    
    # Check for multiple dev server processes
    DEV_COUNT=$(ps aux | grep -E "next dev" | grep -v grep | wc -l | xargs)
    if [ "$DEV_COUNT" -gt 1 ]; then
        echo -e "${YELLOW}⚠️  Multiple dev servers detected: $DEV_COUNT${NC}"
        ps aux | grep -E "next dev" | grep -v grep | awk '{print "  PID " $2 " - " substr($0, index($0,$11))}'
        ISSUES_FOUND=1
    fi
    
    # Check for multiple build processes
    BUILD_COUNT=$(ps aux | grep -E "next build" | grep -v grep | wc -l | xargs)
    if [ "$BUILD_COUNT" -gt 1 ]; then
        echo -e "${YELLOW}⚠️  Multiple build processes detected: $BUILD_COUNT${NC}"
        ps aux | grep -E "next build" | grep -v grep | awk '{print "  PID " $2 " - " substr($0, index($0,$11))}'
        ISSUES_FOUND=1
    fi
    
    if [ "$JEST_COUNT" -le 1 ] && [ "$DEV_COUNT" -le 1 ] && [ "$BUILD_COUNT" -le 1 ]; then
        echo -e "${GREEN}✓${NC} No duplicate processes found"
    fi
    echo ""
}

# Run all checks
check_cpu_intensive
check_memory_intensive
check_long_running
check_zombie_processes
check_duplicate_processes

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No issues detected - all processes look healthy${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Issues detected - review output above${NC}"
    echo ""
    echo "To stop all development processes:"
    echo "  ./scripts/dev/stop-all-processes.sh"
    echo ""
    echo "To stop specific process by PID:"
    echo "  kill -9 <PID>"
    exit 1
fi
