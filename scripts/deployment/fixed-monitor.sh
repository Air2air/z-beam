#!/bin/bash

# FIXED: Non-blocking Deployment Monitor
# Architecture: Event-driven, timeout-protected, resource-efficient

MONITOR_DIR="/tmp/vercel-monitor-v2"
PID_FILE="$MONITOR_DIR/monitor.pid"
LOG_FILE="$MONITOR_DIR/monitor.log"
STATE_FILE="$MONITOR_DIR/state.json"

# Create directories
mkdir -p "$MONITOR_DIR"

# Logging function with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Safe Vercel command with timeout
safe_vercel_ls() {
    timeout 10s vercel ls 2>/dev/null || echo "TIMEOUT"
}

# Get deployment info safely
get_deployment_info() {
    local data=$(safe_vercel_ls)
    if [ "$data" = "TIMEOUT" ]; then
        echo "ERROR: Vercel timeout"
        return 1
    fi
    echo "$data"
    return 0
}

# Non-blocking deployment checker
check_deployments() {
    local deployment_data
    deployment_data=$(get_deployment_info)
    
    if [ $? -ne 0 ]; then
        log "⚠️  Vercel API timeout - skipping check"
        return 1
    fi
    
    # Parse latest deployment efficiently
    local latest_line=$(echo "$deployment_data" | head -4 | tail -1)
    local current_url=$(echo "$latest_line" | awk '{print $2}' | head -1)
    local current_status=$(echo "$latest_line" | awk '{print $4}' | head -1)
    local current_age=$(echo "$latest_line" | awk '{print $1}' | head -1)
    
    # State management
    local last_url=""
    if [ -f "$STATE_FILE" ]; then
        last_url=$(cat "$STATE_FILE" 2>/dev/null | head -1)
    fi
    
    # New deployment detection
    if [ "$current_url" != "$last_url" ] && [ ! -z "$last_url" ] && [ ! -z "$current_url" ]; then
        log "🆕 NEW DEPLOYMENT: $current_url"
        log "📊 Status: $current_status | Age: $current_age"
        
        # Start non-blocking status tracker
        track_deployment_async "$current_url" &
    fi
    
    # Update state
    echo "$current_url" > "$STATE_FILE"
    
    # Show current status
    local ready_count=$(echo "$deployment_data" | grep -c "Ready" 2>/dev/null || echo "0")
    local error_count=$(echo "$deployment_data" | grep -c "Error" 2>/dev/null || echo "0")
    local building_count=$(echo "$deployment_data" | grep -c "Building" 2>/dev/null || echo "0")
    
    log "📈 Status: ✅$ready_count 🔨$building_count ❌$error_count | Latest: $(basename "$current_url" 2>/dev/null)"
    
    return 0
}

# Async deployment tracker (runs in background)
track_deployment_async() {
    local url="$1"
    local deployment_id=$(basename "$url" | cut -d'-' -f2-3)
    local max_checks=20
    local check_interval=15
    
    log "🔍 Tracking $deployment_id async (max ${max_checks} checks)"
    
    for i in $(seq 1 $max_checks); do
        sleep $check_interval
        
        local status_data=$(safe_vercel_ls)
        if [ "$status_data" = "TIMEOUT" ]; then
            log "⚠️  Timeout tracking $deployment_id - check $i"
            continue
        fi
        
        local current_status=$(echo "$status_data" | grep "$deployment_id" | awk '{print $4}' | head -1)
        
        case "$current_status" in
            "Ready")
                log "✅ $deployment_id COMPLETED (check $i)"
                return 0
                ;;
            "Error")
                log "❌ $deployment_id FAILED (check $i)"
                return 1
                ;;
            "Building")
                log "🔨 $deployment_id building... (check $i)"
                ;;
            *)
                log "⏳ $deployment_id status: $current_status (check $i)"
                ;;
        esac
    done
    
    log "⏰ $deployment_id tracking timeout after ${max_checks} checks"
    return 2
}

# Main monitoring loop (lightweight)
start_monitor() {
    if [ -f "$PID_FILE" ]; then
        local old_pid=$(cat "$PID_FILE")
        if ps -p $old_pid > /dev/null 2>&1; then
            log "✅ Monitor already running (PID: $old_pid)"
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    
    log "🚀 Starting lightweight deployment monitor"
    
    # Background monitoring process
    (
        local check_count=0
        local consecutive_errors=0
        
        while true; do
            check_count=$((check_count + 1))
            
            if check_deployments; then
                consecutive_errors=0
            else
                consecutive_errors=$((consecutive_errors + 1))
                if [ $consecutive_errors -ge 5 ]; then
                    log "❌ Too many consecutive errors ($consecutive_errors) - backing off"
                    sleep 60  # Back off on repeated failures
                    consecutive_errors=0
                fi
            fi
            
            # Log status periodically
            if [ $((check_count % 10)) -eq 0 ]; then
                log "🔄 Health check #$check_count (errors: $consecutive_errors)"
            fi
            
            sleep 30
        done
    ) &
    
    local monitor_pid=$!
    echo $monitor_pid > "$PID_FILE"
    log "✅ Monitor started (PID: $monitor_pid)"
    log "📁 Logs: $LOG_FILE"
}

# Stop monitor
stop_monitor() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            log "🛑 Stopping monitor (PID: $pid)"
            kill $pid 2>/dev/null
            # Clean up any child processes
            pkill -P $pid 2>/dev/null
            rm -f "$PID_FILE"
            log "✅ Monitor stopped"
        else
            log "❌ Monitor not running"
            rm -f "$PID_FILE"
        fi
    else
        log "❌ No monitor process found"
    fi
}

# Status check
show_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            log "✅ Monitor running (PID: $pid)"
            echo ""
            echo "📊 Recent activity:"
            tail -5 "$LOG_FILE" 2>/dev/null || echo "No logs yet"
        else
            log "❌ Monitor not running (stale PID)"
            rm -f "$PID_FILE"
        fi
    else
        log "❌ Monitor not running"
    fi
}

# Show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "📊 Deployment Monitor Logs (last 20 lines):"
        echo "============================================"
        tail -20 "$LOG_FILE"
    else
        echo "❌ No log file found"
    fi
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up old monitor files"
    rm -rf /tmp/vercel-monitor-v* 2>/dev/null
    rm -rf /tmp/vercel_simple_monitor_* 2>/dev/null
    rm -rf /tmp/vercel-auto-monitor 2>/dev/null
    log "✅ Cleanup complete"
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
        show_logs
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "🚀 Fixed Deployment Monitor v2"
        echo "Usage: $0 [start|stop|restart|status|logs|cleanup]"
        echo ""
        echo "Features:"
        echo "  ✅ Non-blocking architecture"
        echo "  ✅ Timeout protection"
        echo "  ✅ Resource efficient"
        echo "  ✅ Error recovery"
        echo "  ✅ Async deployment tracking"
        ;;
esac
