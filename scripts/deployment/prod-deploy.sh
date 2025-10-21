#!/bin/bash

# Production Deployment Script
# Easy-to-use script for deploying to production with validation and monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ ERROR:${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ SUCCESS:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  WARNING:${NC} $1"
}

info() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')] ℹ️  INFO:${NC} $1"
}

# Header
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}║        🚀 Production Deployment Tool 🚀        ║${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if vercel is installed
    if ! command -v vercel >/dev/null 2>&1; then
        error "Vercel CLI not found. Please install it first:"
        echo "  npm i -g vercel@latest"
        exit 1
    fi
    
    local vercel_version=$(vercel --version 2>&1 | head -1)
    info "Vercel CLI: $vercel_version"
    
    # Check if in git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
        exit 1
    fi
    
    # Check current branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    info "Current branch: $current_branch"
    
    success "Prerequisites check passed"
    echo ""
}

# Check git status
check_git_status() {
    log "Checking git status..."
    
    # Check if on main branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "main" ]; then
        warning "You are on branch '$current_branch', not 'main'"
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        warning "You have uncommitted changes"
        git status --short
        echo ""
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
    fi
    
    # Check if up to date with remote
    git fetch origin main --quiet 2>/dev/null || true
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main 2>/dev/null || echo "")
    
    if [ -n "$remote_commit" ] && [ "$local_commit" != "$remote_commit" ]; then
        warning "Your local branch is not in sync with origin/main"
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
    fi
    
    success "Git status check passed"
    echo ""
}

# Run pre-deployment checks
run_predeploy_checks() {
    log "Running pre-deployment checks..."
    
    cd "$PROJECT_ROOT"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        warning "node_modules not found, installing dependencies..."
        npm ci --legacy-peer-deps --include=dev || npm install
    fi
    
    # Run sitemap verification (critical)
    if [ "${SKIP_CHECKS}" != "true" ]; then
        info "Verifying sitemap integrity..."
        if [ -f "$SCRIPT_DIR/../sitemap/verify-sitemap.sh" ]; then
            chmod +x "$SCRIPT_DIR/../sitemap/verify-sitemap.sh"
            if "$SCRIPT_DIR/../sitemap/verify-sitemap.sh"; then
                success "Sitemap verification passed"
            else
                error "Sitemap verification failed!"
                echo ""
                echo "The sitemap must be valid before deploying to production."
                echo "Please fix the issues and try again."
                echo ""
                exit 1
            fi
        else
            warning "Sitemap verification script not found, skipping..."
        fi
        echo ""
    fi
    
    # Run type check (optional, can be skipped)
    if [ "${SKIP_CHECKS}" != "true" ]; then
        info "Running TypeScript type check..."
        if npm run type-check > /dev/null 2>&1; then
            success "Type check passed"
        else
            warning "Type check failed, but continuing..."
        fi
    fi
    
    success "Pre-deployment checks completed"
    echo ""
}

# Deploy to production
deploy_to_production() {
    log "Deploying to production..."
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Deploy with production flag - force production environment
    info "Deploying to PRODUCTION environment..."
    echo "Command: vercel --prod --confirm"
    echo ""
    
    if vercel --prod --confirm; then
        echo ""
        success "PRODUCTION deployment initiated successfully!"
        
        # Verify it's actually going to production
        sleep 5
        local latest_deploy=$(vercel ls --prod | head -2 | tail -1)
        if echo "$latest_deploy" | grep -q "Production"; then
            success "Confirmed: Deployment is going to PRODUCTION environment"
        else
            warning "Warning: Could not confirm production environment"
        fi
        return 0
    else
        echo ""
        error "PRODUCTION deployment failed!"
        return 1
    fi
}

# Monitor deployment
monitor_deployment() {
    log "Starting deployment monitoring..."
    echo ""
    
    # Wait a moment for deployment to register
    sleep 3
    
    # Try to use monitoring script if available
    if [ -f "$SCRIPT_DIR/monitor-deployment.js" ]; then
        node "$SCRIPT_DIR/monitor-deployment.js"
    else
        info "Monitoring script not found, showing deployment status..."
        vercel ls --prod | head -5
    fi
}

# Show deployment info
show_deployment_info() {
    echo ""
    log "Fetching deployment information..."
    echo ""
    
    # Get latest production deployment
    local prod_url=$(vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1)
    
    if [ -n "$prod_url" ]; then
        echo -e "${GREEN}════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}                                                ${NC}"
        echo -e "${GREEN}  🎉 Deployment Complete!                      ${NC}"
        echo -e "${GREEN}                                                ${NC}"
        echo -e "${GREEN}  Production URL: ${CYAN}$prod_url${NC}"
        echo -e "${GREEN}                                                ${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════${NC}"
        echo ""
    fi
}

# Main execution
main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-checks)
                SKIP_CHECKS=true
                shift
                ;;
            --no-monitor)
                NO_MONITOR=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --skip-checks   Skip pre-deployment validation checks"
                echo "  --no-monitor    Skip deployment monitoring"
                echo "  --help, -h      Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                    # Full deployment with checks and monitoring"
                echo "  $0 --skip-checks      # Deploy without validation checks"
                echo "  $0 --no-monitor       # Deploy without monitoring"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Run deployment process
    check_prerequisites
    check_git_status
    run_predeploy_checks
    
    # Deploy
    if deploy_to_production; then
        # Monitor if not disabled
        if [ "${NO_MONITOR}" != "true" ]; then
            monitor_deployment
        fi
        
        show_deployment_info
        exit 0
    else
        error "Deployment process failed"
        exit 1
    fi
}

# Run main function
main "$@"
