#!/bin/bash

# Smart Deploy with Triggered Monitoring
# Deploys and automatically monitors the deployment

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

# Deploy and monitor
deploy_with_monitoring() {
    local deploy_type="${1:-auto}"
    
    log "🚀 Starting smart deployment with monitoring..."
    
    # Check prerequisites
    if ! check_vercel; then
        return 1
    fi
    
    # Stop any existing monitoring first
    log "🧹 Stopping any existing monitoring..."
    ./deploy-triggered-monitor.sh stop >/dev/null 2>&1
    
    # Deploy based on type
    local deployment_url=""
    case "$deploy_type" in
        "production"|"prod")
            log "📦 Deploying to production..."
            deployment_url=$(vercel --prod --confirm 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
            ;;
        "preview"|"staging")
            log "🔍 Deploying preview..."
            deployment_url=$(vercel 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
            ;;
        "auto")
            log "🤖 Auto-deploying (production)..."
            deployment_url=$(vercel --prod --confirm 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
            ;;
        *)
            error "Unknown deployment type: $deploy_type"
            echo "Valid types: production, preview, auto"
            return 1
            ;;
    esac
    
    # Check if deployment succeeded
    if [ -z "$deployment_url" ]; then
        error "Deployment failed - no URL returned"
        return 1
    fi
    
    success "Deployment initiated: $deployment_url"
    
    # Start monitoring the specific deployment
    log "👀 Starting deployment monitoring..."
    ./deploy-triggered-monitor.sh monitor "$deployment_url"
    
    # Show status
    sleep 2
    ./deploy-triggered-monitor.sh status
    
    success "Deployment with monitoring started!"
    log "📋 Monitor status: ./deploy-triggered-monitor.sh status"
    log "🛑 Stop monitoring: ./deploy-triggered-monitor.sh stop"
}

# Just deploy without monitoring
deploy_only() {
    local deploy_type="${1:-auto}"
    
    log "🚀 Deploying without monitoring..."
    
    if ! check_vercel; then
        return 1
    fi
    
    case "$deploy_type" in
        "production"|"prod")
            log "📦 Deploying to production..."
            vercel --prod --confirm
            ;;
        "preview"|"staging")
            log "🔍 Deploying preview..."
            vercel
            ;;
        "auto")
            log "🤖 Auto-deploying (production)..."
            vercel --prod --confirm
            ;;
        *)
            error "Unknown deployment type: $deploy_type"
            return 1
            ;;
    esac
}

# Monitor existing deployment
monitor_existing() {
    local url="$1"
    
    if [ -z "$url" ]; then
        log "🔍 Auto-detecting latest deployment..."
        ./deploy-triggered-monitor.sh start
    else
        log "👀 Monitoring specific deployment: $url"
        ./deploy-triggered-monitor.sh monitor "$url"
    fi
}

# Show deployment info
show_deployments() {
    log "📋 Recent deployments:"
    if check_vercel; then
        vercel ls | head -10
    fi
}

# Show help
show_help() {
    echo "Smart Deploy with Triggered Monitoring"
    echo "======================================"
    echo ""
    echo "Usage: $0 <command> [type|url]"
    echo ""
    echo "Commands:"
    echo "  deploy [type]     - Deploy and auto-monitor (default: production)"
    echo "  deploy-only [type] - Deploy without monitoring"
    echo "  monitor [url]     - Monitor deployment (latest if no URL)"
    echo "  status            - Check monitoring status"
    echo "  stop              - Stop monitoring"
    echo "  list              - Show recent deployments"
    echo "  help              - Show this help"
    echo ""
    echo "Deploy Types:"
    echo "  auto              - Auto-deploy (production) [default]"
    echo "  preview/staging   - Preview deployment"
    echo "  production/prod   - Production deployment"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                    # Deploy production and monitor"
    echo "  $0 deploy production         # Deploy to production and monitor"
    echo "  $0 deploy-only               # Deploy production without monitoring"
    echo "  $0 monitor                   # Monitor latest deployment"
    echo "  $0 monitor https://my.app    # Monitor specific deployment"
    echo "  $0 status                    # Check if monitoring active"
    echo "  $0 stop                      # Stop monitoring"
    echo ""
    echo "Key principle: Monitoring only runs when explicitly triggered for a deployment."
}

# Main command handler
case "${1:-help}" in
    "deploy")
        deploy_with_monitoring "${2:-auto}"
        ;;
    "deploy-only")
        deploy_only "${2:-auto}"
        ;;
    "monitor")
        monitor_existing "$2"
        ;;
    "status")
        ./deploy-triggered-monitor.sh status
        ;;
    "stop")
        ./deploy-triggered-monitor.sh stop
        ;;
    "list")
        show_deployments
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
