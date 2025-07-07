#!/bin/bash

# Unified Webpack & Runtime Manager
# Handles all webpack-related issues: detection, repair, port management

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration
PORT=3000
QUIET_MODE=false
FORCE_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --check)
            ACTION="check"
            shift
            ;;
        --repair)
            ACTION="repair"
            shift
            ;;
        --force)
            FORCE_MODE=true
            shift
            ;;
        --quiet)
            QUIET_MODE=true
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        *)
            ACTION="$1"
            shift
            ;;
    esac
done

# Default action
ACTION=${ACTION:-"check"}

# Logging functions
log() {
    if [ "$QUIET_MODE" = false ]; then
        echo "$1"
    fi
}

log_error() {
    echo "❌ $1" >&2
}

log_warning() {
    if [ "$QUIET_MODE" = false ]; then
        echo "⚠️  $1"
    fi
}

log_success() {
    if [ "$QUIET_MODE" = false ]; then
        echo "✅ $1"
    fi
}

log_info() {
    if [ "$QUIET_MODE" = false ]; then
        echo "ℹ️  $1"
    fi
}

# Check for common webpack error patterns
check_webpack_errors() {
    local errors_found=0
    
    # Check for missing vendor chunks
    if [ -d ".next" ] && find .next -name "*.js" -exec grep -l "Cannot find module.*vendor-chunks" {} \; 2>/dev/null | head -1 | grep -q .; then
        log_error "Missing vendor chunks detected"
        ((errors_found++))
    fi
    
    # Check for corrupted webpack runtime
    if [ -f ".next/server/webpack-runtime.js" ]; then
        if ! node -c ".next/server/webpack-runtime.js" 2>/dev/null; then
            log_error "Corrupted webpack runtime"
            ((errors_found++))
        fi
    fi
    
    # Check for build integrity
    if [ -d ".next" ] && [ ! -f ".next/BUILD_ID" ]; then
        log_error "Incomplete build (missing BUILD_ID)"
        ((errors_found++))
    fi
    
    # Check for cache corruption indicators
    if [ -d ".next/cache" ]; then
        # Check for empty pack files
        if find .next/cache -name "*.pack*" -size 0 2>/dev/null | head -1 | grep -q .; then
            log_error "Corrupted webpack cache (empty pack files)"
            ((errors_found++))
        fi
    fi
    
    return $errors_found
}

# Check port status
check_port() {
    if command -v lsof > /dev/null 2>&1; then
        local pids=$(lsof -ti:$PORT 2>/dev/null || true)
        if [ -n "$pids" ]; then
            return 1  # Port occupied
        fi
    fi
    return 0  # Port free
}

# Kill processes on port
kill_port() {
    if command -v lsof > /dev/null 2>&1; then
        local pids=$(lsof -ti:$PORT 2>/dev/null || true)
        if [ -n "$pids" ]; then
            log "🔨 Freeing port $PORT..."
            echo "$pids" | xargs kill -9 2>/dev/null || true
            sleep 1
            
            # Verify port is free
            if check_port; then
                log_success "Port $PORT freed"
                return 0
            else
                log_error "Failed to free port $PORT"
                return 1
            fi
        else
            log_info "Port $PORT already free"
            return 0
        fi
    else
        log_warning "Cannot manage port (lsof not available)"
        return 1
    fi
}

# Repair webpack issues
repair_webpack() {
    log "🔧 REPAIRING WEBPACK CACHE..."
    
    local repairs_made=0
    
    # Clear .next directory
    if [ -d ".next" ]; then
        local cache_size=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
        rm -rf .next
        log_success "Cleared .next directory ($cache_size)"
        ((repairs_made++))
    fi
    
    # Clear node_modules cache
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
        log_success "Cleared node_modules cache"
        ((repairs_made++))
    fi
    
    # Clear npm cache (silent)
    npm cache clean --force 2>/dev/null || true
    
    if [ $repairs_made -gt 0 ]; then
        log_success "Webpack repair complete ($repairs_made fixes applied)"
        if [ "$QUIET_MODE" = false ]; then
            log ""
            log "🚀 NEXT STEPS:"
            log "   1. Run: npm run dev"
            log "   2. Fresh build will resolve issues"
        fi
        return 0
    else
        log_info "No repairs needed"
        return 1
    fi
}

# Main execution
case $ACTION in
    "check")
        if [ "$QUIET_MODE" = false ]; then
            log "🔍 WEBPACK HEALTH CHECK"
            log "======================="
        fi
        
        # Check webpack errors
        if check_webpack_errors; then
            log_success "Webpack health: OK"
            
            # Check port if not quiet
            if [ "$QUIET_MODE" = false ]; then
                if check_port; then
                    log_success "Port $PORT: Available"
                else
                    log_warning "Port $PORT: Occupied (use --repair to free)"
                fi
            fi
            exit 0
        else
            log_error "Webpack issues detected (use --repair to fix)"
            exit 1
        fi
        ;;
        
    "repair")
        if [ "$QUIET_MODE" = false ]; then
            log "🛠️  WEBPACK REPAIR"
            log "=================="
        fi
        
        repairs_needed=false
        
        # Always repair if force mode
        if [ "$FORCE_MODE" = true ]; then
            repairs_needed=true
        else
            # Check if repairs are needed
            if ! check_webpack_errors; then
                repairs_needed=true
            fi
        fi
        
        if [ "$repairs_needed" = true ]; then
            repair_webpack
        fi
        
        # Handle port
        if ! check_port; then
            kill_port
        fi
        
        exit 0
        ;;
        
    "kill-port")
        kill_port
        exit $?
        ;;
        
    *)
        echo "Usage: $0 [--check|--repair|kill-port] [--force] [--quiet] [--port PORT]"
        echo ""
        echo "Examples:"
        echo "  $0 --check              # Check webpack health"
        echo "  $0 --repair             # Repair webpack issues"
        echo "  $0 --repair --force     # Force repair regardless of status"
        echo "  $0 kill-port            # Free port 3000"
        echo "  $0 --check --quiet      # Silent health check"
        exit 1
        ;;
esac
