#!/bin/bash

# Simple Vercel Deployment Monitor - Works for all deployments
# Usage: ./simple-monitor.sh

MONITOR_LOG="/tmp/vercel_simple_monitor_$(date +%s).log"

echo "🚀 Starting Vercel Deployment Monitor"
echo "📁 Log file: $MONITOR_LOG"
echo "Press Ctrl+C to stop"
echo ""

# Initialize tracking
LAST_DEPLOYMENT=""
CHECK_COUNT=0

while true; do
    CHECK_COUNT=$((CHECK_COUNT + 1))
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Clear screen every 10 checks
    if [ $((CHECK_COUNT % 10)) -eq 1 ]; then
        clear
        echo "=== Vercel Monitor - Check #$CHECK_COUNT - $TIMESTAMP ==="
        echo ""
    fi
    
    # Get deployment list
    DEPLOYMENT_DATA=$(vercel ls 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Extract latest deployment
        LATEST_LINE=$(echo "$DEPLOYMENT_DATA" | head -4 | tail -1)
        CURRENT_LATEST=$(echo "$LATEST_LINE" | awk '{print $2}')
        
        # Check for new deployment
        if [ "$CURRENT_LATEST" != "$LAST_DEPLOYMENT" ] && [ ! -z "$LAST_DEPLOYMENT" ]; then
            echo "🆕 NEW DEPLOYMENT DETECTED!"
            echo "URL: $CURRENT_LATEST"
            echo "$TIMESTAMP - NEW: $CURRENT_LATEST" >> "$MONITOR_LOG"
            echo ""
            
            # Show build status
            echo "📊 Getting build logs..."
            vercel logs "$CURRENT_LATEST" 2>/dev/null | tail -10
            echo ""
        fi
        
        LAST_DEPLOYMENT="$CURRENT_LATEST"
        
        # Show current deployments table
        echo "📋 Current Deployments:"
        echo "$DEPLOYMENT_DATA" | head -15
        
        # Count statuses
        READY_COUNT=$(echo "$DEPLOYMENT_DATA" | grep -c "Ready")
        ERROR_COUNT=$(echo "$DEPLOYMENT_DATA" | grep -c "Error")
        BUILDING_COUNT=$(echo "$DEPLOYMENT_DATA" | grep -c "Building")
        
        echo ""
        echo "📊 Status Summary: ✅ Ready: $READY_COUNT | ❌ Error: $ERROR_COUNT | 🔨 Building: $BUILDING_COUNT"
        
        # Log status
        echo "$TIMESTAMP - Ready:$READY_COUNT Error:$ERROR_COUNT Building:$BUILDING_COUNT" >> "$MONITOR_LOG"
        
    else
        echo "❌ Error connecting to Vercel"
        echo "$TIMESTAMP - Connection Error" >> "$MONITOR_LOG"
    fi
    
    echo ""
    echo "🔄 Next check in 20 seconds (Check #$CHECK_COUNT)"
    echo "📁 Log: $MONITOR_LOG"
    sleep 20
done
