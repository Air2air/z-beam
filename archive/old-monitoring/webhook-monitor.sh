#!/bin/bash

# Vercel Deploy Hook Monitor - Automatically starts monitoring when triggered
# This can be used with Vercel deploy hooks or GitHub Actions

echo "🚀 Vercel Deploy Hook Monitor"
echo "============================="

WEBHOOK_LOG="/tmp/vercel-webhook-$(date +%s).log"

# Function to handle webhook trigger
handle_webhook() {
    local deployment_url="$1"
    local deployment_id="$2"
    
    echo "📡 Webhook triggered at $(date)" | tee -a "$WEBHOOK_LOG"
    echo "🔗 Deployment URL: $deployment_url" | tee -a "$WEBHOOK_LOG"
    echo "🆔 Deployment ID: $deployment_id" | tee -a "$WEBHOOK_LOG"
    
    # Start monitoring this specific deployment
    echo "👀 Starting targeted monitoring..." | tee -a "$WEBHOOK_LOG"
    
    if [ ! -z "$deployment_url" ]; then
        # Monitor specific deployment
        for i in {1..60}; do
            STATUS=$(vercel ls | grep "$deployment_id" | awk '{print $4}' | head -1)
            TIMESTAMP=$(date '+%H:%M:%S')
            
            echo "[$TIMESTAMP] Check $i - Status: $STATUS" | tee -a "$WEBHOOK_LOG"
            
            case "$STATUS" in
                "Ready")
                    echo "✅ [$TIMESTAMP] DEPLOYMENT COMPLETED!" | tee -a "$WEBHOOK_LOG"
                    echo "🌐 Live at: $deployment_url" | tee -a "$WEBHOOK_LOG"
                    break
                    ;;
                "Error")
                    echo "❌ [$TIMESTAMP] DEPLOYMENT FAILED!" | tee -a "$WEBHOOK_LOG"
                    echo "📊 Getting error logs..." | tee -a "$WEBHOOK_LOG"
                    vercel logs "$deployment_url" 2>/dev/null | tail -20 | tee -a "$WEBHOOK_LOG"
                    break
                    ;;
                "Building")
                    echo "🔨 [$TIMESTAMP] Still building..." | tee -a "$WEBHOOK_LOG"
                    ;;
                *)
                    echo "⏳ [$TIMESTAMP] Status: $STATUS" | tee -a "$WEBHOOK_LOG"
                    ;;
            esac
            
            sleep 10
        done
    fi
    
    echo "📊 Webhook monitoring complete" | tee -a "$WEBHOOK_LOG"
    echo "📁 Full log: $WEBHOOK_LOG" | tee -a "$WEBHOOK_LOG"
}

# Function to setup GitHub Action integration
setup_github_action() {
    cat > .github/workflows/deployment-monitor.yml << 'EOF'
name: Deployment Monitor

on:
  push:
    branches: [ main ]
  deployment_status:

jobs:
  monitor:
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'pending' || github.event.deployment_status.state == 'in_progress'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install Vercel CLI
      run: npm i -g vercel
      
    - name: Monitor Deployment
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      run: |
        echo "🚀 Monitoring deployment: ${{ github.event.deployment_status.target_url }}"
        chmod +x ./webhook-monitor.sh
        ./webhook-monitor.sh webhook "${{ github.event.deployment_status.target_url }}" "${{ github.event.deployment_status.id }}"
EOF

    echo "✅ Created GitHub Action workflow: .github/workflows/deployment-monitor.yml"
    echo "📝 Add VERCEL_TOKEN to GitHub secrets for full functionality"
}

# Function to setup Vercel integration
setup_vercel_integration() {
    echo "🔧 Setting up Vercel integration..."
    
    # Create vercel.json with deploy hooks if it doesn't exist
    if [ ! -f "vercel.json" ]; then
        cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "functions": {
    "app/api/webhook/deploy-monitor.js": {
      "maxDuration": 300
    }
  }
}
EOF
    fi
    
    # Create webhook endpoint
    mkdir -p app/api/webhook
    cat > app/api/webhook/deploy-monitor.js << 'EOF'
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { deployment, eventType } = req.body;
  
  console.log(`📡 Deployment webhook: ${eventType}`);
  console.log(`🔗 URL: ${deployment?.url}`);
  console.log(`📊 Status: ${deployment?.state}`);
  
  // Log deployment event
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Deployment ${eventType}: ${deployment?.url || 'unknown'}`);
  
  return res.status(200).json({ 
    message: 'Webhook received',
    timestamp,
    deployment: deployment?.url,
    status: deployment?.state
  });
}
EOF

    echo "✅ Created Vercel webhook endpoint: /api/webhook/deploy-monitor"
    echo "🔗 Add this to Vercel dashboard: https://your-domain.vercel.app/api/webhook/deploy-monitor"
}

# Main execution
case "${1:-help}" in
    "webhook")
        handle_webhook "$2" "$3"
        ;;
    "setup-github")
        setup_github_action
        ;;
    "setup-vercel")
        setup_vercel_integration
        ;;
    "auto")
        echo "🚀 Starting automatic monitoring system..."
        ./auto-monitor.sh start
        ;;
    *)
        echo "🚀 Vercel Deploy Hook Monitor"
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  webhook <url> <id>  - Handle deployment webhook"
        echo "  setup-github        - Create GitHub Action workflow"
        echo "  setup-vercel        - Setup Vercel webhook integration"
        echo "  auto               - Start automatic monitoring"
        echo ""
        echo "Examples:"
        echo "  $0 auto                                    # Start auto monitoring"
        echo "  $0 webhook <deployment-url> <deploy-id>   # Handle webhook"
        echo "  $0 setup-github                           # Setup GitHub Actions"
        echo "  $0 setup-vercel                           # Setup Vercel webhooks"
        ;;
esac
