#!/bin/bash

# Vercel Deployment Monitor Script - Enhanced All-Deploy Monitoring
# Usage: ./deployment-monitor.sh [watch|latest|logs|auto]

LATEST_URL=""
LAST_DEPLOYMENT_ID=""
MONITOR_FILE="/tmp/vercel_monitor_$(date +%s).log"
NOTIFICATION_ENABLED=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$MONITOR_FILE"
}

get_latest_deployment() {
    LATEST_URL=$(vercel ls | head -4 | tail -1 | awk '{print $3}')
    echo "Latest deployment: $LATEST_URL"
}

get_deployment_status() {
    local url=$1
    local status=$(vercel ls | grep "$url" | awk '{print $4}')
    echo "$status"
}

extract_deployment_id() {
    local url=$1
    echo "$url" | sed 's/https:\/\/z-beam-//' | sed 's/-air2airs-projects\.vercel\.app//'
}

monitor_all_deployments() {
    echo -e "${CYAN}🚀 Starting comprehensive Vercel deployment monitoring...${NC}"
    echo -e "${YELLOW}📁 Log file: $MONITOR_FILE${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop monitoring${NC}"
    echo ""
    
    log_message "🚀 Deployment monitoring started"
    
    local previous_deployments=""
    local check_count=0
    
    while true; do
        check_count=$((check_count + 1))
        
        # Clear screen every 10 checks for readability
        if [ $((check_count % 10)) -eq 1 ]; then
            clear
            echo -e "${PURPLE}=== Vercel All-Deployment Monitor $(date) ===${NC}"
            echo -e "${CYAN}Check #$check_count | Log: $MONITOR_FILE${NC}"
            echo ""
        fi
        
        # Get current deployments
        current_deployments=$(vercel ls 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            # Parse deployments into structured data
            echo "$current_deployments" | tail -n +3 | head -20 | while IFS= read -r line; do
                if [[ "$line" =~ https:// ]]; then
                    # Extract deployment info
                    age=$(echo "$line" | awk '{print $1}')
                    url=$(echo "$line" | awk '{print $2}')
                    status=$(echo "$line" | awk '{print $3}')
                    env=$(echo "$line" | awk '{print $4}')
                    duration=$(echo "$line" | awk '{print $5}')
                    
                    deployment_id=$(extract_deployment_id "$url")
                    
                    # Color code status
                    case "$status" in
                        "●Ready")
                            status_color="${GREEN}✅ Ready${NC}"
                            ;;
                        "●Error")
                            status_color="${RED}❌ Error${NC}"
                            ;;
                        "●Building")
                            status_color="${YELLOW}🔨 Building${NC}"
                            ;;
                        "●Pending")
                            status_color="${BLUE}⏳ Pending${NC}"
                            ;;
                        *)
                            status_color="${PURPLE}$status${NC}"
                            ;;
                    esac
                    
                    # Display deployment info
                    printf "%-4s %-12s %s %-12s %-6s %s\n" \
                        "$age" \
                        "$deployment_id" \
                        "$status_color" \
                        "$env" \
                        "$duration" \
                        "$(echo $url | cut -c1-50)..."
                fi
            done
            
            # Check for new deployments
            latest_deployment_line=$(echo "$current_deployments" | head -4 | tail -1)
            current_latest_id=$(echo "$latest_deployment_line" | awk '{print $2}' | sed 's/https:\/\/z-beam-//' | sed 's/-air2airs-projects\.vercel\.app//')
            
            if [ "$current_latest_id" != "$LAST_DEPLOYMENT_ID" ] && [ ! -z "$LAST_DEPLOYMENT_ID" ]; then
                log_message "🆕 NEW DEPLOYMENT DETECTED: $current_latest_id"
                echo -e "\n${GREEN}🆕 NEW DEPLOYMENT DETECTED!${NC}"
                echo -e "${CYAN}ID: $current_latest_id${NC}"
                
                # Get logs for new deployment
                new_url=$(echo "$latest_deployment_line" | awk '{print $2}')
                echo -e "${YELLOW}📊 Getting build logs...${NC}"
                vercel logs "$new_url" 2>/dev/null | head -20
            fi
            
            LAST_DEPLOYMENT_ID="$current_latest_id"
            
            # Show summary stats
            echo ""
            ready_count=$(echo "$current_deployments" | grep -c "● Ready")
            error_count=$(echo "$current_deployments" | grep -c "● Error")
            building_count=$(echo "$current_deployments" | grep -c "● Building")
            
            echo -e "${GREEN}Ready: $ready_count${NC} | ${RED}Errors: $error_count${NC} | ${YELLOW}Building: $building_count${NC}"
            
        else
            echo -e "${RED}❌ Error connecting to Vercel${NC}"
            log_message "❌ Error connecting to Vercel CLI"
        fi
        
        echo ""
        echo -e "${CYAN}🔄 Next check in 15 seconds... (Check #$check_count)${NC}"
        sleep 15
    done
}

watch_deployments() {
    echo "🔍 Monitoring Vercel deployments..."
    echo "Press Ctrl+C to stop monitoring"
    
    while true; do
        clear
        echo "=== Vercel Deployment Monitor $(date) ==="
        echo ""
        
        # Show recent deployments
        echo "📋 Recent Deployments:"
        vercel ls | head -8
        
        echo ""
        echo "🔄 Refreshing in 30 seconds..."
        sleep 30
    done
}

show_latest_logs() {
    get_latest_deployment
    if [ ! -z "$LATEST_URL" ]; then
        echo "📊 Getting logs for: $LATEST_URL"
        vercel logs "$LATEST_URL" --limit 50
    else
        echo "❌ Could not retrieve latest deployment URL"
    fi
}

monitor_specific_deployment() {
    local deployment_url=$1
    echo -e "${CYAN}🔍 Monitoring specific deployment: $deployment_url${NC}"
    
    while true; do
        echo -e "\n${PURPLE}=== Deployment Status Check $(date) ===${NC}"
        
        # Get deployment status
        status=$(get_deployment_status "$deployment_url")
        echo -e "Status: $status"
        
        # Get recent logs
        echo -e "\n${YELLOW}📊 Recent logs:${NC}"
        vercel logs "$deployment_url" 2>/dev/null | tail -10
        
        echo -e "\n${CYAN}🔄 Checking again in 10 seconds...${NC}"
        sleep 10
    done
}

auto_monitor() {
    echo -e "${GREEN}🤖 Starting automatic deployment monitoring...${NC}"
    echo -e "${YELLOW}This will monitor for new deployments and automatically follow their progress${NC}"
    
    monitor_all_deployments
}

case "${1:-auto}" in
    "watch")
        watch_deployments
        ;;
    "latest")
        get_latest_deployment
        ;;
    "logs")
        show_latest_logs
        ;;
    "auto"|"all")
        auto_monitor
        ;;
    "monitor")
        if [ -z "$2" ]; then
            echo "Usage: $0 monitor <deployment-url>"
            exit 1
        fi
        monitor_specific_deployment "$2"
        ;;
    *)
        echo "Usage: $0 [watch|latest|logs|auto|monitor <url>]"
        echo ""
        echo "Commands:"
        echo "  auto    - 🤖 Automatically monitor all deployments (default)"
        echo "  watch   - 👀 Simple deployment list monitoring"
        echo "  latest  - 🎯 Show latest deployment URL"
        echo "  logs    - 📊 Show logs for latest deployment"
        echo "  monitor - 🔍 Monitor specific deployment URL"
        echo ""
        echo "Examples:"
        echo "  $0                    # Start automatic monitoring"
        echo "  $0 auto              # Start automatic monitoring"
        echo "  $0 monitor <url>     # Monitor specific deployment"
        ;;
esac
