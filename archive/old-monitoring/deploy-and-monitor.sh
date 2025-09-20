#!/bin/bash

# Deployment Trigger & Monitor
# This script will trigger a new deployment and then monitor it

echo "🚀 Deployment Trigger & Monitor Script"
echo ""

# Function to trigger deployment
trigger_deployment() {
    echo "📤 Triggering new deployment..."
    
    # Make a small change to trigger deployment
    echo "<!-- Deploy triggered at $(date) -->" >> README.md
    
    # Commit and push
    git add README.md
    git commit -m "Trigger deployment - $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    
    echo "✅ Deployment triggered via git push"
}

# Function to monitor the deployment
monitor_deployment() {
    echo "👀 Starting deployment monitoring..."
    echo "Waiting for new deployment to appear..."
    
    # Get initial latest deployment
    INITIAL_LATEST=$(vercel ls | head -4 | tail -1 | awk '{print $2}')
    echo "Previous latest: $INITIAL_LATEST"
    
    # Wait for new deployment
    ATTEMPTS=0
    MAX_ATTEMPTS=30
    
    while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
        sleep 10
        CURRENT_LATEST=$(vercel ls | head -4 | tail -1 | awk '{print $2}')
        
        if [ "$CURRENT_LATEST" != "$INITIAL_LATEST" ]; then
            echo ""
            echo "🆕 NEW DEPLOYMENT DETECTED!"
            echo "URL: $CURRENT_LATEST"
            echo ""
            
            # Monitor this specific deployment
            echo "📊 Monitoring deployment progress..."
            
            for i in {1..20}; do
                echo "--- Check $i ---"
                STATUS=$(vercel ls | grep "$CURRENT_LATEST" | awk '{print $4}')
                echo "Status: $STATUS"
                
                if [ "$STATUS" = "Ready" ]; then
                    echo "✅ Deployment completed successfully!"
                    echo "🌐 Live at: $CURRENT_LATEST"
                    break
                elif [ "$STATUS" = "Error" ]; then
                    echo "❌ Deployment failed!"
                    echo "📊 Getting error logs..."
                    vercel logs "$CURRENT_LATEST"
                    break
                else
                    echo "⏳ Still building... (Status: $STATUS)"
                fi
                
                sleep 15
            done
            
            return 0
        fi
        
        ATTEMPTS=$((ATTEMPTS + 1))
        echo "Waiting for deployment... ($ATTEMPTS/$MAX_ATTEMPTS)"
    done
    
    echo "⏰ Timeout waiting for new deployment"
    return 1
}

# Main execution
case "${1:-both}" in
    "trigger")
        trigger_deployment
        ;;
    "monitor")
        monitor_deployment
        ;;
    "both")
        trigger_deployment
        echo ""
        monitor_deployment
        ;;
    *)
        echo "Usage: $0 [trigger|monitor|both]"
        echo ""
        echo "Commands:"
        echo "  trigger - Trigger a new deployment"
        echo "  monitor - Monitor for new deployments"
        echo "  both    - Trigger and then monitor (default)"
        ;;
esac
