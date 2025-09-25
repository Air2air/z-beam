#!/bin/bash

# Deploy-Triggered Monitoring System
# Only monitors when there's an active deployment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/tmp/vercel-deploy-monitor"
PID_FILE="$LOG_DIR/deploy-monitor.pid"
LOG_FILE="$LOG_DIR/deploy-monitor.log"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Cleanup function
cleanup_and_exit() {
    log "🧹 Cleaning up deployment monitor"
    rm -f "$PID_FILE"
    exit ${1:-0}
}

# Signal handlers
trap 'cleanup_and_exit 0' SIGTERM SIGINT

# Check if vercel is available
check_vercel() {
    if ! command -v vercel >/dev/null 2>&1; then
        log "❌ ERROR: Vercel CLI not found in PATH"
        return 1
    fi
    return 0
}

# Get the latest deployment
get_latest_deployment() {
    if ! check_vercel; then
        return 1
    fi
    
    # Get the most recent deployment
    local latest_deployment
    latest_deployment=$(vercel ls --format json 2>/dev/null | head -n1 | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$latest_deployment" ]; then
        log "❌ No deployments found"
        return 1
    fi
    
    echo "$latest_deployment"
    return 0
}

# Monitor a specific deployment
monitor_deployment() {
    local deployment_url="$1"
    local start_time=$(date +%s)
    local max_monitor_time=1800  # 30 minutes max monitoring
    
    log "🚀 Starting deployment monitoring for: $deployment_url"
    log "⏱️  Max monitoring time: ${max_monitor_time}s (30 minutes)"
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        # Check time limit
        if [ $elapsed -gt $max_monitor_time ]; then
            log "⏰ Monitoring time limit reached (${max_monitor_time}s) - stopping"
            break
        fi
        
        # Check deployment status
        local status
        status=$(vercel inspect "$deployment_url" --format json 2>/dev/null | grep -o '"state":"[^"]*"' | cut -d'"' -f4)
        
        case "$status" in
            "READY")
                log "✅ Deployment READY: $deployment_url (${elapsed}s)"
                break
                ;;
            "ERROR")
                log "❌ Deployment ERROR: $deployment_url (${elapsed}s)"
                log "📋 Getting error logs..."
                vercel logs "$deployment_url" --format short 2>/dev/null | tail -20 | while read -r line; do
                    log "   $line"
                done
                break
                ;;
            "BUILDING")
                log "🔨 Deployment BUILDING: $deployment_url (${elapsed}s)"
                ;;
            "QUEUED")
                log "⏳ Deployment QUEUED: $deployment_url (${elapsed}s)"
                ;;
            *)
                log "❓ Unknown status '$status' for: $deployment_url (${elapsed}s)"
                ;;
        esac
        
        sleep 10  # Check every 10 seconds
    done
    
    log "🏁 Deployment monitoring complete for: $deployment_url"
}

# Auto-detect and monitor latest deployment
monitor_latest() {
    log "🔍 Auto-detecting latest deployment..."
    
    local latest_deployment
    latest_deployment=$(get_latest_deployment)
    
    if [ $? -eq 0 ] && [ -n "$latest_deployment" ]; then
        monitor_deployment "$latest_deployment"
    else
        log "❌ Could not detect latest deployment"
        return 1
    fi
}

# Start monitoring in background
start_monitor() {
    if [ -f "$PID_FILE" ]; then
        local existing_pid=$(cat "$PID_FILE")
        if ps -p "$existing_pid" > /dev/null 2>&1; then
            log "⚠️  Monitor already running (PID: $existing_pid)"
            return 1
        else
            log "🧹 Cleaning up stale PID file"
            rm -f "$PID_FILE"
        fi
    fi
    
    # Start monitoring in background
    (
        echo $$ > "$PID_FILE"
        monitor_latest
        rm -f "$PID_FILE"
    ) &
    
    local monitor_pid=$!
    log "✅ Deployment monitor started (PID: $monitor_pid)"
    log "📁 Logs: $LOG_FILE"
}

# Stop monitoring
stop_monitor() {
    if [ -f "$PID_FILE" ]; then
        local monitor_pid=$(cat "$PID_FILE")
        if ps -p "$monitor_pid" > /dev/null 2>&1; then
            log "🛑 Stopping deployment monitor (PID: $monitor_pid)"
            kill "$monitor_pid" 2>/dev/null
            sleep 2
            if ps -p "$monitor_pid" > /dev/null 2>&1; then
                log "🔥 Force killing monitor (PID: $monitor_pid)"
                kill -9 "$monitor_pid" 2>/dev/null
            fi
        fi
        rm -f "$PID_FILE"
        log "✅ Monitor stopped"
    else
        log "ℹ️  No monitor running"
    fi
}

# Check monitor status
status_monitor() {
    if [ -f "$PID_FILE" ]; then
        local monitor_pid=$(cat "$PID_FILE")
        if ps -p "$monitor_pid" > /dev/null 2>&1; then
            echo "✅ Monitor running (PID: $monitor_pid)"
            if [ -f "$LOG_FILE" ]; then
                echo "📋 Recent activity:"
                tail -5 "$LOG_FILE" | sed 's/^/   /'
            fi
        else
            echo "❌ Monitor not running (stale PID file)"
            rm -f "$PID_FILE"
        fi
    else
        echo "ℹ️  No monitor running"
    fi
}

# Monitor a specific deployment URL
monitor_url() {
    local url="$1"
    if [ -z "$url" ]; then
        echo "❌ ERROR: No deployment URL provided"
        echo "Usage: $0 monitor <deployment-url>"
        return 1
    fi
    
    # Start monitoring in background
    (
        echo $$ > "$PID_FILE"
        monitor_deployment "$url"
        rm -f "$PID_FILE"
    ) &
    
    local monitor_pid=$!
    log "✅ Monitoring specific deployment (PID: $monitor_pid): $url"
    log "📁 Logs: $LOG_FILE"
}

# Show help
show_help() {
    echo "Deploy-Triggered Monitoring System"
    echo "=================================="
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start          - Auto-detect and monitor latest deployment"
    echo "  stop           - Stop monitoring"
    echo "  status         - Check monitor status"
    echo "  monitor <url>  - Monitor specific deployment URL"
    echo "  latest         - Show latest deployment info"
    echo "  help           - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 start                                    # Monitor latest deployment"
    echo "  $0 monitor https://my-app-xyz.vercel.app   # Monitor specific deployment"
    echo "  $0 status                                   # Check if monitoring"
    echo "  $0 stop                                     # Stop monitoring"
    echo ""
    echo "This system only monitors when explicitly triggered for a deployment."
    echo "It automatically stops when deployment is complete or after 30 minutes."
}

# Main command handler
case "${1:-help}" in
    "start")
        start_monitor
        ;;
    "stop")
        stop_monitor
        ;;
    "status")
        status_monitor
        ;;
    "monitor")
        monitor_url "$2"
        ;;
    "latest")
        log "🔍 Latest deployment info:"
        if check_vercel; then
            vercel ls | head -5
        fi
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac
