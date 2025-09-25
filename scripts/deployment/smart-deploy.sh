#!/bin/bash

# Smart Deploy Monitor
# Monitors Vercel build logs during deployments

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] SUCCESS:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"
}

# Check if vercel is available
check_vercel() {
    if ! command -v vercel >/dev/null 2>&1; then
        error "Vercel CLI not found. Please install it first:"
        echo "  npm i -g vercel"
        return 1
    fi
    return 0
}

# Monitor deployment by URL
monitor_deployment_url() {
    local url="$1"
    
    if [ -z "$url" ]; then
        error "No deployment URL provided"
        return 1
    fi
    
    log "👀 Starting deployment monitoring for: $url"
    ./deploy-triggered-monitor.sh monitor "$url"
}

# Monitor latest deployment
monitor_latest() {
    log "� Auto-detecting and monitoring latest deployment..."
    ./deploy-triggered-monitor.sh start
}

# Start monitoring for active deployments
start_monitoring() {
    log "🚀 Starting deployment monitor..."
    
    # Check prerequisites
    if ! check_vercel; then
        return 1
    fi
    
    # Stop any existing monitoring first
    log "🧹 Stopping any existing monitoring..."
    ./deploy-triggered-monitor.sh stop >/dev/null 2>&1
    
    # Start fresh monitoring with auto-stop when deployment completes
    ./deploy-triggered-monitor.sh start
    
    success "Deployment monitoring started!"
}

# Start monitoring with auto-stop for deployment duration only
start_deployment_monitoring() {
    log "🚀 Starting deployment monitor for active deployment..."
    
    # Check prerequisites
    if ! check_vercel; then
        return 1
    fi
    
    # Stop any existing monitoring first
    ./deploy-triggered-monitor.sh stop >/dev/null 2>&1
    
    # Start monitoring that will auto-stop when no active deployments
    nohup bash -c "
        ./deploy-triggered-monitor.sh start
        
        # Monitor until no active deployments
        while true; do
            sleep 30
            if ! ./deploy-triggered-monitor.sh status | grep -q 'Monitoring'; then
                break
            fi
            
            # Check if there are any active deployments
            if ! vercel ls 2>/dev/null | grep -q 'Building\|Queued'; then
                sleep 60  # Wait a bit more to ensure deployment is complete
                ./deploy-triggered-monitor.sh stop
                break
            fi
        done
    " >/dev/null 2>&1 &
    
    success "Deployment monitoring started in background!"
}

# Show deployment logs
show_logs() {
    log "📋 Showing deployment logs..."
    if check_vercel; then
        vercel logs --follow
    fi
}

# Show deployment status
show_status() {
    log "� Checking deployment status..."
    ./deploy-triggered-monitor.sh status
}

# Stop monitoring
stop_monitoring() {
    log "� Stopping deployment monitoring..."
    ./deploy-triggered-monitor.sh stop
}

# Show recent deployments
show_deployments() {
    log "📋 Recent deployments:"
    if check_vercel; then
        vercel ls | head -10
    fi
}

# Show help
show_help() {
    echo "Smart Deploy Monitor"
    echo "==================="
    echo ""
    echo "Monitors Vercel build logs during deployments"
    echo ""
    echo "Usage: $0 <command> [url]"
    echo ""
    echo "Commands:"
    echo "  start             - Start monitoring for active deployments"
    echo "  start-deploy      - Start monitoring for deployment duration only (auto-stop)"
    echo "  monitor [url]     - Monitor specific deployment (latest if no URL)"
    echo "  status            - Check monitoring status"
    echo "  stop              - Stop monitoring"
    echo "  logs              - Show live deployment logs"
    echo "  list              - Show recent deployments"
    echo "  help              - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 start                         # Start monitoring for active deployments"
    echo "  $0 monitor                       # Monitor latest deployment"
    echo "  $0 monitor https://my.app        # Monitor specific deployment"
    echo "  $0 status                        # Check if monitoring active"
    echo "  $0 logs                          # Show live deployment logs"
    echo "  $0 stop                          # Stop monitoring"
    echo ""
    echo "Note: This tool only monitors deployments. Use 'vercel' command directly to deploy."
}

# Main command handler
case "${1:-help}" in
    "start")
        start_monitoring
        ;;
    "start-deploy")
        start_deployment_monitoring
        ;;
    "monitor")
        if [ -n "$2" ]; then
            monitor_deployment_url "$2"
        else
            monitor_latest
        fi
        ;;
    "status")
        show_status
        ;;
    "stop")
        stop_monitoring
        ;;
    "logs")
        show_logs
        ;;
    "list")
        show_deployments
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
