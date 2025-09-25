#!/bin/bash

# HANG-PROTECTED Deployment Monitor v3
# Multiple layers of hang protection and recovery mechanisms

MONITOR_DIR="/tmp/vercel-monitor-protected"
PID_FILE="$MONITOR_DIR/monitor.pid"
LOG_FILE="$MONITOR_DIR/monitor.log"
STATE_FILE="$MONITOR_DIR/state.json"
WATCHDOG_FILE="$MONITOR_DIR/watchdog.timestamp"
HEALTH_FILE="$MONITOR_DIR/health.status"

# Configuration
MAX_VERCEL_TIMEOUT=8         # Vercel command timeout
MAX_PROCESS_LIFETIME=3600    # 1 hour max lifetime
WATCHDOG_INTERVAL=60         # Watchdog check every 60 seconds
MAX_CONSECUTIVE_ERRORS=5     # Max errors before backing off
BACKOFF_DURATION=120         # Back off for 2 minutes
HEALTH_CHECK_INTERVAL=30     # Health check every 30 seconds

# Create directories
mkdir -p "$MONITOR_DIR"

# Logging with rotation to prevent log bloat
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local message="[$timestamp] $1"
    
    # Rotate log if it gets too large (>1MB)
    if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || echo 0) -gt 1048576 ]; then
        mv "$LOG_FILE" "${LOG_FILE}.old" 2>/dev/null
    fi
    
    echo "$message" | tee -a "$LOG_FILE"
}

# Update watchdog timestamp (prevents hang detection)
update_watchdog() {
    echo "$(date +%s)" > "$WATCHDOG_FILE"
}

# Update health status
update_health() {
    local status="$1"
    echo "$status|$(date +%s)" > "$HEALTH_FILE"
}

# Safe command execution with timeout and error handling
safe_exec() {
    local cmd="$1"
    local timeout_duration="$2"
    local description="$3"
    
    update_watchdog
    
    # Set explicit PATH to include Vercel CLI
    export PATH="/usr/local/bin:$PATH"
    
    # Run command with timeout and capture both stdout and stderr
    local output
    local exit_code
    
    output=$(timeout "$timeout_duration" bash -c "$cmd" 2>&1)
    exit_code=$?
    
    case $exit_code in
        0)
            echo "$output"
            return 0
            ;;
        124)
            log "⏰ TIMEOUT: $description (${timeout_duration}s)"
            update_health "TIMEOUT"
            return 1
            ;;
        *)
            log "❌ ERROR: $description (exit code: $exit_code)"
            update_health "ERROR"
            return 1
            ;;
    esac
}

# Enhanced Vercel command with retry logic
safe_vercel_ls() {
    local max_retries=3
    local retry_delay=2
    
    for attempt in $(seq 1 $max_retries); do
        update_watchdog
        
        local result
        result=$(safe_exec "./vercel-wrapper.sh ls" "$MAX_VERCEL_TIMEOUT" "vercel ls (attempt $attempt)")
        
        if [ $? -eq 0 ] && [ ! -z "$result" ]; then
            update_health "OK"
            echo "$result"
            return 0
        fi
        
        if [ $attempt -lt $max_retries ]; then
            log "🔄 Retrying vercel ls in ${retry_delay}s (attempt $attempt/$max_retries)"
            sleep $retry_delay
            retry_delay=$((retry_delay * 2))  # Exponential backoff
        fi
    done
    
    update_health "FAILED"
    return 1
}

# Self-monitoring watchdog (runs in separate process)
start_watchdog() {
    (
        while true; do
            sleep $WATCHDOG_INTERVAL
            
            # Check if main process is alive
            if [ -f "$PID_FILE" ]; then
                local main_pid=$(cat "$PID_FILE")
                
                if ! ps -p $main_pid > /dev/null 2>&1; then
                    log "🐕 WATCHDOG: Main process $main_pid died - cleaning up"
                    cleanup_monitor
                    exit 0
                fi
                
                # Check for hanging (no watchdog update)
                if [ -f "$WATCHDOG_FILE" ]; then
                    local last_update=$(cat "$WATCHDOG_FILE")
                    local current_time=$(date +%s)
                    local time_diff=$((current_time - last_update))
                    
                    if [ $time_diff -gt $((WATCHDOG_INTERVAL * 2)) ]; then
                        log "🐕 WATCHDOG: Process appears hung (${time_diff}s since last update)"
                        log "🐕 WATCHDOG: Force killing hung process $main_pid"
                        kill -9 $main_pid 2>/dev/null
                        cleanup_monitor
                        exit 1
                    fi
                fi
                
                # Check process lifetime
                local process_start=$(ps -o lstart= -p $main_pid 2>/dev/null | xargs -I {} date -j -f "%a %b %d %H:%M:%S %Y" "{}" +%s 2>/dev/null || echo 0)
                local current_time=$(date +%s)
                
                if [ $process_start -gt 0 ] && [ $((current_time - process_start)) -gt $MAX_PROCESS_LIFETIME ]; then
                    log "🐕 WATCHDOG: Process exceeded max lifetime (${MAX_PROCESS_LIFETIME}s) - restarting"
                    kill $main_pid 2>/dev/null
                    sleep 2
                    restart_monitor_from_watchdog
                fi
            else
                log "🐕 WATCHDOG: No PID file found - watchdog exiting"
                exit 0
            fi
        done
    ) &
    
    local watchdog_pid=$!
    echo $watchdog_pid > "$MONITOR_DIR/watchdog.pid"
    log "🐕 Watchdog started (PID: $watchdog_pid)"
}

# Stop watchdog
stop_watchdog() {
    if [ -f "$MONITOR_DIR/watchdog.pid" ]; then
        local watchdog_pid=$(cat "$MONITOR_DIR/watchdog.pid")
        kill $watchdog_pid 2>/dev/null
        rm -f "$MONITOR_DIR/watchdog.pid"
        log "🐕 Watchdog stopped"
    fi
}

# Restart monitor from watchdog (emergency restart)
restart_monitor_from_watchdog() {
    log "🔄 EMERGENCY RESTART initiated by watchdog"
    cleanup_monitor
    sleep 5
    start_monitor
}

# Cleanup function
cleanup_monitor() {
    log "🧹 Cleaning up monitor processes"
    
    # Clean up PID files and processes
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        kill $pid 2>/dev/null
        # Force kill any children
        pkill -P $pid 2>/dev/null
        rm -f "$PID_FILE"
    fi
    
    stop_watchdog
    
    # Clean up state files
    rm -f "$WATCHDOG_FILE" "$HEALTH_FILE"
    
    log "✅ Cleanup complete"
}

# Enhanced deployment checking with circuit breaker pattern
check_deployments() {
    local consecutive_errors_file="$MONITOR_DIR/error_count"
    local last_error_file="$MONITOR_DIR/last_error"
    
    # Read error counter
    local consecutive_errors=0
    if [ -f "$consecutive_errors_file" ]; then
        consecutive_errors=$(cat "$consecutive_errors_file")
    fi
    
    # Circuit breaker: skip checks if too many recent errors
    if [ $consecutive_errors -ge $MAX_CONSECUTIVE_ERRORS ]; then
        local last_error_time=0
        if [ -f "$last_error_file" ]; then
            last_error_time=$(cat "$last_error_file")
        fi
        
        local current_time=$(date +%s)
        local time_since_error=$((current_time - last_error_time))
        
        if [ $time_since_error -lt $BACKOFF_DURATION ]; then
            local remaining=$((BACKOFF_DURATION - time_since_error))
            log "🔄 Circuit breaker: backing off for ${remaining}s more"
            update_watchdog
            return 0
        else
            log "🔄 Circuit breaker: resetting after backoff period"
            echo "0" > "$consecutive_errors_file"
            consecutive_errors=0
        fi
    fi
    
    update_watchdog
    
    # Get deployment data with timeout protection
    local deployment_data
    deployment_data=$(safe_vercel_ls)
    
    if [ $? -ne 0 ]; then
        consecutive_errors=$((consecutive_errors + 1))
        echo "$consecutive_errors" > "$consecutive_errors_file"
        echo "$(date +%s)" > "$last_error_file"
        log "⚠️  Deployment check failed (consecutive errors: $consecutive_errors)"
        return 1
    fi
    
    # Reset error counter on success
    echo "0" > "$consecutive_errors_file"
    
    # Process deployment data safely
    local latest_line=$(echo "$deployment_data" | head -4 | tail -1)
    local current_url=$(echo "$latest_line" | awk '{print $2}' | head -1)
    local current_status=$(echo "$latest_line" | awk '{print $4}' | head -1)
    
    # State management
    local last_url=""
    if [ -f "$STATE_FILE" ]; then
        last_url=$(cat "$STATE_FILE" 2>/dev/null | head -1)
    fi
    
    # New deployment detection
    if [ "$current_url" != "$last_url" ] && [ ! -z "$last_url" ] && [ ! -z "$current_url" ]; then
        log "🆕 NEW DEPLOYMENT: $(basename "$current_url")"
        log "📊 Status: $current_status"
        
        # Start non-blocking async tracker with timeout protection
        track_deployment_async "$current_url" &
    fi
    
    # Update state
    echo "$current_url" > "$STATE_FILE"
    
    # Status summary
    local ready_count=$(echo "$deployment_data" | grep -c "Ready" 2>/dev/null || echo "0")
    local error_count=$(echo "$deployment_data" | grep -c "Error" 2>/dev/null || echo "0")
    local building_count=$(echo "$deployment_data" | grep -c "Building" 2>/dev/null || echo "0")
    
    log "📈 ✅$ready_count 🔨$building_count ❌$error_count | Latest: $(basename "$current_url" 2>/dev/null | cut -c1-12)..."
    
    update_watchdog
    return 0
}

# Async deployment tracker with timeouts and limits
track_deployment_async() {
    local url="$1"
    local deployment_id=$(basename "$url" | cut -d'-' -f2-3)
    local max_checks=15  # Reduced to prevent long-running processes
    local check_interval=20
    local start_time=$(date +%s)
    local max_track_time=600  # 10 minutes max tracking time
    
    log "🔍 Tracking $deployment_id (max ${max_checks} checks, ${max_track_time}s timeout)"
    
    for i in $(seq 1 $max_checks); do
        # Check if we've exceeded max tracking time
        local current_time=$(date +%s)
        if [ $((current_time - start_time)) -gt $max_track_time ]; then
            log "⏰ $deployment_id tracking timeout (${max_track_time}s)"
            return 2
        fi
        
        sleep $check_interval
        
        # Get status with timeout protection
        local status_data
        status_data=$(safe_vercel_ls)
        if [ $? -ne 0 ]; then
            log "⚠️  Cannot get status for $deployment_id (check $i) - continuing"
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
    
    log "⏰ $deployment_id tracking completed after ${max_checks} checks"
    return 2
}

# Main monitoring loop with enhanced protection
start_monitor() {
    if [ -f "$PID_FILE" ]; then
        local old_pid=$(cat "$PID_FILE")
        if ps -p $old_pid > /dev/null 2>&1; then
            log "✅ Monitor already running (PID: $old_pid)"
            return 0
        else
            log "🧹 Cleaning up stale PID file"
            cleanup_monitor
        fi
    fi
    
    log "🚀 Starting hang-protected deployment monitor v3"
    log "🛡️  Protections: timeouts, watchdog, circuit breaker, lifetime limits"
    
    # Start watchdog first
    start_watchdog
    
    # Main monitoring process
    (
        local check_count=0
        local start_time=$(date +%s)
        
        # Initialize health
        update_health "STARTING"
        update_watchdog
        
        while true; do
            check_count=$((check_count + 1))
            local current_time=$(date +%s)
            
            # Self-terminate if running too long
            if [ $((current_time - start_time)) -gt $MAX_PROCESS_LIFETIME ]; then
                log "🔄 Self-terminating after max lifetime (${MAX_PROCESS_LIFETIME}s)"
                break
            fi
            
            # Health check
            if [ $((check_count % 10)) -eq 0 ]; then
                log "💓 Health check #$check_count (runtime: $((current_time - start_time))s)"
                update_health "HEALTHY"
            fi
            
            update_watchdog
            
            # Main deployment check
            if check_deployments; then
                update_health "OK"
            else
                update_health "CHECK_FAILED"
            fi
            
            update_watchdog
            sleep $HEALTH_CHECK_INTERVAL
        done
        
        log "🛑 Main loop exiting after $check_count checks"
    ) &
    
    local monitor_pid=$!
    echo $monitor_pid > "$PID_FILE"
    log "✅ Monitor started (PID: $monitor_pid)"
    log "📁 Logs: $LOG_FILE"
    log "🐕 Watchdog: Active"
}

# Stop monitor safely
stop_monitor() {
    log "🛑 Stopping hang-protected monitor"
    cleanup_monitor
}

# Enhanced status with health metrics
show_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            log "✅ Monitor running (PID: $pid)"
            
            # Show health status
            if [ -f "$HEALTH_FILE" ]; then
                local health_info=$(cat "$HEALTH_FILE")
                local health_status=$(echo "$health_info" | cut -d'|' -f1)
                local health_time=$(echo "$health_info" | cut -d'|' -f2)
                local time_diff=$(($(date +%s) - health_time))
                log "💓 Health: $health_status (${time_diff}s ago)"
            fi
            
            # Show watchdog status
            if [ -f "$MONITOR_DIR/watchdog.pid" ]; then
                local watchdog_pid=$(cat "$MONITOR_DIR/watchdog.pid")
                if ps -p $watchdog_pid > /dev/null 2>&1; then
                    log "🐕 Watchdog: Active (PID: $watchdog_pid)"
                else
                    log "🐕 Watchdog: Dead"
                fi
            else
                log "🐕 Watchdog: Not found"
            fi
            
            echo ""
            echo "📊 Recent activity:"
            tail -5 "$LOG_FILE" 2>/dev/null || echo "No logs yet"
        else
            log "❌ Monitor not running (stale PID)"
            cleanup_monitor
        fi
    else
        log "❌ Monitor not running"
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
        sleep 3
        start_monitor
        ;;
    "status")
        show_status
        ;;
    "logs")
        if [ -f "$LOG_FILE" ]; then
            echo "📊 Hang-Protected Monitor Logs:"
            echo "==============================="
            tail -30 "$LOG_FILE"
        else
            echo "❌ No log file found"
        fi
        ;;
    "cleanup")
        log "🧹 Force cleanup of all monitor processes"
        cleanup_monitor
        rm -rf "$MONITOR_DIR" 2>/dev/null
        ;;
    *)
        echo "🛡️  Hang-Protected Deployment Monitor v3"
        echo "Usage: $0 [start|stop|restart|status|logs|cleanup]"
        echo ""
        echo "Hang Protection Features:"
        echo "  🕐 Command timeouts (${MAX_VERCEL_TIMEOUT}s)"
        echo "  🐕 Watchdog process monitoring"
        echo "  ⚡ Circuit breaker for repeated failures"
        echo "  🔄 Automatic process lifetime limits"
        echo "  💓 Health monitoring and self-recovery"
        echo "  📊 Error counting and exponential backoff"
        echo "  🧹 Automatic cleanup on exit"
        ;;
esac
