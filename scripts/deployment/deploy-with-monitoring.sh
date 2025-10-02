#!/bin/bash

# Deploy with Smart Monitoring
# Runs deployment and monitors log    "prod"|"production")
        deploy_with_monitoring "production"
        ;; during the deployment process

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

# Deploy with monitoring
deploy_with_monitoring() {
    local deploy_type="${1:-prod}"
    
    log "🚀 Starting deployment with background monitoring..."
    
    # Stop any existing monitoring
    ./smart-deploy.sh stop >/dev/null 2>&1
    
    # Start monitoring in background
    log "👀 Starting deployment monitor in background..."
    ./smart-deploy.sh start-deploy &
    local monitor_pid=$!
    
    # Run the actual deployment
    case "$deploy_type" in
        "prod"|"production")
            log "� Deploying to production..."
            vercel --prod --yes
            ;;
        *)
            error "Unknown deployment type: $deploy_type"
            kill $monitor_pid >/dev/null 2>&1
            return 1
            ;;
    esac
    
    local deploy_exit_code=$?
    
    # Stop monitoring after deployment
    log "🛑 Stopping deployment monitor..."
    ./smart-deploy.sh stop >/dev/null 2>&1
    
    # Wait a moment for monitoring to clean up
    sleep 2
    
    if [ $deploy_exit_code -eq 0 ]; then
        success "Deployment completed successfully!"
    else
        error "Deployment failed with exit code $deploy_exit_code"
    fi
    
    return $deploy_exit_code
}

# Main execution
case "${1:-prod}" in
    "production"|"prod")
        deploy_with_monitoring "prod"
        ;;
    "help"|"--help"|"-h")
        echo "Deploy with Smart Monitoring"
        echo "============================"
        echo ""
        echo "Usage: $0 [type]"
        echo ""
        echo "Types:"
        echo "  prod, production  - Deploy to production (default)"
        echo ""
        echo "Examples:"
        echo "  $0                # Deploy to production"
        echo "  $0 prod           # Deploy to production"
        ;;
    *)
        deploy_with_monitoring "prod"
        ;;
esac
