#!/bin/bash

# Clean Up Preview Deployments Script
# Removes old preview deployments to keep deployment history clean

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
echo -e "${CYAN}║     🧹 Preview Deployment Cleanup Tool 🧹     ║${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Vercel CLI is installed
check_vercel() {
    if ! command -v vercel >/dev/null 2>&1; then
        error "Vercel CLI not found. Please install it first:"
        echo "  npm i -g vercel@latest"
        exit 1
    fi
    
    local vercel_version=$(vercel --version 2>&1 | head -1)
    info "Vercel CLI: $vercel_version"
    echo ""
}

# Get all preview deployments
get_preview_deployments() {
    log "Fetching preview deployments..."
    
    # Get deployments, filter for preview only, extract URLs
    local deployments=$(vercel ls 2>/dev/null | grep "Preview" | grep -o 'https://[^ ]*' || echo "")
    
    if [ -z "$deployments" ]; then
        info "No preview deployments found"
        return 1
    fi
    
    echo "$deployments"
    return 0
}

# Count preview deployments
count_previews() {
    local count=$(vercel ls 2>/dev/null | grep -c "Preview" || echo "0")
    echo "$count"
}

# Delete a deployment
delete_deployment() {
    local url="$1"
    
    if [ -z "$url" ]; then
        return 1
    fi
    
    # Extract deployment ID from URL
    local deployment_id=$(echo "$url" | sed -E 's|https://[^-]+-([^.]+)\..*|\1|')
    
    if vercel rm "$url" --yes >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Delete all preview deployments
delete_all_previews() {
    local preview_urls=$(get_preview_deployments)
    
    if [ -z "$preview_urls" ]; then
        success "No preview deployments to clean up"
        return 0
    fi
    
    local total=$(echo "$preview_urls" | wc -l | tr -d ' ')
    local deleted=0
    local failed=0
    
    log "Found $total preview deployments"
    echo ""
    
    # Show progress
    local count=0
    while IFS= read -r url; do
        count=$((count + 1))
        echo -ne "\r${BLUE}Deleting:${NC} [$count/$total] "
        
        if delete_deployment "$url"; then
            deleted=$((deleted + 1))
            echo -ne "✅"
        else
            failed=$((failed + 1))
            echo -ne "❌"
        fi
    done <<< "$preview_urls"
    
    echo "" # New line after progress
    echo ""
    
    # Summary
    success "Deleted $deleted preview deployments"
    if [ $failed -gt 0 ]; then
        warning "Failed to delete $failed deployments"
    fi
}

# Delete old preview deployments (keep recent N)
delete_old_previews() {
    local keep=${1:-5}
    
    log "Fetching preview deployments (keeping $keep most recent)..."
    
    local preview_urls=$(vercel ls 2>/dev/null | grep "Preview" | grep -o 'https://[^ ]*' | tail -n +$((keep + 1)) || echo "")
    
    if [ -z "$preview_urls" ]; then
        success "No old preview deployments to clean up"
        return 0
    fi
    
    local total=$(echo "$preview_urls" | wc -l | tr -d ' ')
    local deleted=0
    local failed=0
    
    log "Found $total old preview deployments to delete"
    echo ""
    
    # Show progress
    local count=0
    while IFS= read -r url; do
        count=$((count + 1))
        echo -ne "\r${BLUE}Deleting:${NC} [$count/$total] "
        
        if delete_deployment "$url"; then
            deleted=$((deleted + 1))
            echo -ne "✅"
        else
            failed=$((failed + 1))
            echo -ne "❌"
        fi
    done <<< "$preview_urls"
    
    echo "" # New line after progress
    echo ""
    
    # Summary
    success "Deleted $deleted old preview deployments"
    if [ $failed -gt 0 ]; then
        warning "Failed to delete $failed deployments"
    fi
}

# Show deployment statistics
show_stats() {
    log "Deployment Statistics"
    echo ""
    
    local total=$(vercel ls 2>/dev/null | grep -c "https://" || echo "0")
    local preview=$(vercel ls 2>/dev/null | grep -c "Preview" || echo "0")
    local production=$(vercel ls 2>/dev/null | grep -c "Production" || echo "0")
    local ready=$(vercel ls 2>/dev/null | grep -c "● Ready" || echo "0")
    local building=$(vercel ls 2>/dev/null | grep -c "Building" || echo "0")
    local error=$(vercel ls 2>/dev/null | grep -c "● Error" || echo "0")
    
    echo -e "  ${CYAN}Total Deployments:${NC}      $total"
    echo -e "  ${YELLOW}Preview Deployments:${NC}    $preview"
    echo -e "  ${GREEN}Production Deployments:${NC} $production"
    echo ""
    echo -e "  ${GREEN}Ready:${NC}                  $ready"
    echo -e "  ${BLUE}Building:${NC}               $building"
    echo -e "  ${RED}Failed:${NC}                 $error"
    echo ""
}

# Show help
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  all              Delete all preview deployments"
    echo "  old [N]          Delete old preview deployments (keep N most recent, default: 5)"
    echo "  stats            Show deployment statistics"
    echo "  help             Show this help message"
    echo ""
    echo "Options:"
    echo "  --yes, -y        Skip confirmation prompt"
    echo ""
    echo "Examples:"
    echo "  $0 all                  # Delete all preview deployments (with confirmation)"
    echo "  $0 all --yes            # Delete all preview deployments (no confirmation)"
    echo "  $0 old 10               # Keep 10 most recent, delete older ones"
    echo "  $0 stats                # Show deployment statistics"
    echo ""
}

# Main function
main() {
    local command=${1:-help}
    local skip_confirm=false
    
    # Check for --yes flag
    if [[ "$*" =~ "--yes" ]] || [[ "$*" =~ "-y" ]]; then
        skip_confirm=true
    fi
    
    check_vercel
    
    case "$command" in
        "all")
            show_stats
            
            local count=$(count_previews)
            if [ "$count" -eq 0 ]; then
                success "No preview deployments to clean up"
                exit 0
            fi
            
            if [ "$skip_confirm" = false ]; then
                echo -e "${YELLOW}⚠️  This will delete ALL $count preview deployments${NC}"
                echo ""
                read -p "Are you sure? (y/N): " -n 1 -r
                echo
                echo ""
                
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    warning "Cleanup cancelled by user"
                    exit 0
                fi
            fi
            
            delete_all_previews
            echo ""
            show_stats
            ;;
            
        "old")
            local keep=${2:-5}
            
            show_stats
            
            if [ "$skip_confirm" = false ]; then
                echo -e "${YELLOW}⚠️  This will delete old preview deployments (keeping $keep most recent)${NC}"
                echo ""
                read -p "Are you sure? (y/N): " -n 1 -r
                echo
                echo ""
                
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    warning "Cleanup cancelled by user"
                    exit 0
                fi
            fi
            
            delete_old_previews "$keep"
            echo ""
            show_stats
            ;;
            
        "stats")
            show_stats
            ;;
            
        "help"|"--help"|"-h")
            show_help
            ;;
            
        *)
            error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
