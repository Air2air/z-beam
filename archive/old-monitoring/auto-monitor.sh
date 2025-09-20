#!/bin/bash

# Auto Deployment Monitor - Runs continuously and monitors ALL deployments
# This will start automatically and run in the background

MONITOR_DIR="/tmp/vercel-auto-monitor"
PID_FILE="$MONITOR_DIR/monitor.pid"
LOG_FILE="$MONITOR_DIR/auto-monitor.log"

# Create monitor directory
mkdir -p "$MONITOR_DIR"

# Function to start monitoring
start_monitor() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "✅ Monitor already running (PID: $PID)"
            echo "📁 Log: $LOG_FILE"
            return 0
        else
            echo "🧹 Cleaning up stale PID file"
            rm -f "$PID_FILE"
        fi
    fi
    
    echo "🚀 Starting automatic deployment monitor..."
    nohup bash -c "
        exec > '$LOG_FILE' 2>&1
        echo '🚀 Auto Monitor Started - \$(date)'
        echo '============================================'
        
        LAST_DEPLOYMENT=''
        CHECK_COUNT=0
        
        while true; do
            CHECK_COUNT=\$((CHECK_COUNT + 1))
            TIMESTAMP=\$(date '+%Y-%m-%d %H:%M:%S')
            
            # Get current deployments
            DEPLOYMENT_DATA=\$(vercel ls 2>/dev/null)
            
            if [ \$? -eq 0 ]; then
                # Get latest deployment
                LATEST_LINE=\$(echo \"\$DEPLOYMENT_DATA\" | head -4 | tail -1)
                CURRENT_LATEST=\$(echo \"\$LATEST_LINE\" | awk '{print \$2}')
                
                # Check for new deployment
                if [ \"\$CURRENT_LATEST\" != \"\$LAST_DEPLOYMENT\" ] && [ ! -z \"\$LAST_DEPLOYMENT\" ]; then
                    echo \"\"
                    echo \"🆕 [\$TIMESTAMP] NEW DEPLOYMENT DETECTED!\"
                    echo \"URL: \$CURRENT_LATEST\"
                    echo \"Previous: \$LAST_DEPLOYMENT\"
                    echo \"\"
                    
                    # Get deployment status
                    STATUS=\$(echo \"\$LATEST_LINE\" | awk '{print \$4}')
                    echo \"Initial Status: \$STATUS\"
                    
                    # Monitor this deployment until completion
                    echo \"📊 Monitoring deployment progress...\"
                    
                    for i in {1..40}; do
                        sleep 15
                        CURRENT_STATUS=\$(vercel ls | head -4 | tail -1 | awk '{print \$4}')
                        echo \"[\$(date '+%H:%M:%S')] Check \$i - Status: \$CURRENT_STATUS\"
                        
                        if [ \"\$CURRENT_STATUS\" = \"Ready\" ]; then
                            echo \"✅ [\$(date '+%H:%M:%S')] DEPLOYMENT COMPLETED SUCCESSFULLY!\"
                            echo \"🌐 Live at: \$CURRENT_LATEST\"
                            echo \"\"
                            break
                        elif [ \"\$CURRENT_STATUS\" = \"Error\" ]; then
                            echo \"❌ [\$(date '+%H:%M:%S')] DEPLOYMENT FAILED!\"
                            echo \"\"
                            break
                        fi
                    done
                fi
                
                LAST_DEPLOYMENT=\"\$CURRENT_LATEST\"
            else
                echo \"[\$TIMESTAMP] ❌ Vercel connection error\"
            fi
            
            # Log status every 10 checks
            if [ \$((CHECK_COUNT % 10)) -eq 0 ]; then
                echo \"[\$TIMESTAMP] 🔄 Check #\$CHECK_COUNT - Monitoring active\"
            fi
            
            sleep 30
        done
    " &
    
    MONITOR_PID=$!
    echo $MONITOR_PID > "$PID_FILE"
    
    echo "✅ Auto monitor started successfully!"
    echo "📋 Process ID: $MONITOR_PID"
    echo "📁 Log file: $LOG_FILE"
    echo "🛑 To stop: $0 stop"
}

# Function to stop monitoring
stop_monitor() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "🛑 Stopping monitor (PID: $PID)..."
            kill $PID
            rm -f "$PID_FILE"
            echo "✅ Monitor stopped"
        else
            echo "❌ Monitor not running"
            rm -f "$PID_FILE"
        fi
    else
        echo "❌ No monitor process found"
    fi
}

# Function to show status
show_status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "✅ Monitor is running (PID: $PID)"
            echo "📁 Log file: $LOG_FILE"
            echo ""
            echo "📊 Recent activity:"
            if [ -f "$LOG_FILE" ]; then
                tail -10 "$LOG_FILE"
            fi
        else
            echo "❌ Monitor not running (stale PID file)"
            rm -f "$PID_FILE"
        fi
    else
        echo "❌ Monitor not running"
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "📊 Deployment Monitor Logs:"
        echo "=========================="
        if [ "$1" = "follow" ]; then
            tail -f "$LOG_FILE"
        else
            tail -50 "$LOG_FILE"
        fi
    else
        echo "❌ No log file found"
    fi
}

# Main execution
case "${1:-start}" in
    "start")
        start_monitor
        ;;
    "stop")
        stop_monitor
        ;;
    "restart")
        stop_monitor
        sleep 2
        start_monitor
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    *)
        echo "🚀 Automatic Deployment Monitor"
        echo "Usage: $0 [start|stop|restart|status|logs]"
        echo ""
        echo "Commands:"
        echo "  start    - Start automatic monitoring (default)"
        echo "  stop     - Stop monitoring"
        echo "  restart  - Restart monitoring"
        echo "  status   - Show monitor status"
        echo "  logs     - Show recent logs"
        echo "  logs follow - Follow logs in real-time"
        echo ""
        echo "Examples:"
        echo "  $0              # Start monitoring"
        echo "  $0 start        # Start monitoring"
        echo "  $0 status       # Check if running"
        echo "  $0 logs follow  # Watch logs live"
        ;;
esac
