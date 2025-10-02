#!/bin/bash

###############################################################################
# AUTOMATIC DEPLOYMENT MONITORING SETUP
###############################################################################
# 
# This script installs a git hook that automatically monitors Vercel
# deployments after every push to main branch.
#
# Usage: ./scripts/deployment/setup-auto-monitor.sh
#
###############################################################################

set -e

# Check if running in quiet mode (from npm postinstall)
QUIET_MODE=false
if [ "$1" = "--quiet" ] || [ -n "$npm_config_loglevel" ]; then
  QUIET_MODE=true
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

if [ "$QUIET_MODE" = false ]; then
  echo ""
  echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  Automatic Deployment Monitor Setup       ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
  echo ""
fi

# Get workspace root
WORKSPACE_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$WORKSPACE_ROOT" ]; then
  [ "$QUIET_MODE" = false ] && echo -e "${RED}❌ Error: Not in a git repository${NC}"
  exit 1
fi

[ "$QUIET_MODE" = false ] && echo -e "${BLUE}📁 Workspace: ${WORKSPACE_ROOT}${NC}"
[ "$QUIET_MODE" = false ] && echo ""

# Check if monitor script exists
MONITOR_SCRIPT="$WORKSPACE_ROOT/scripts/deployment/monitor-deployment.js"

if [ ! -f "$MONITOR_SCRIPT" ]; then
  if [ "$QUIET_MODE" = false ]; then
    echo -e "${RED}❌ Error: Monitor script not found at:${NC}"
    echo "   $MONITOR_SCRIPT"
    echo ""
    echo -e "${YELLOW}💡 Make sure you're in the correct repository${NC}"
  fi
  exit 1
fi

[ "$QUIET_MODE" = false ] && echo -e "${GREEN}✅ Monitor script found${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  if [ "$QUIET_MODE" = false ]; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found (optional)${NC}"
    echo -e "${BLUE}� Install later with: npm install -g vercel@latest${NC}"
  fi
else
  [ "$QUIET_MODE" = false ] && echo -e "${GREEN}✅ Vercel CLI found: $(vercel --version)${NC}"
fi

# Create hooks directory if it doesn't exist
HOOKS_DIR="$WORKSPACE_ROOT/.git/hooks"
mkdir -p "$HOOKS_DIR"

# Create the post-push hook
POST_PUSH_HOOK="$HOOKS_DIR/post-push"

if [ "$QUIET_MODE" = false ]; then
  echo ""
  echo -e "${BLUE}📝 Creating post-push git hook...${NC}"
fi

cat > "$POST_PUSH_HOOK" << 'HOOK_CONTENT'
#!/bin/bash

# Git Hook: Automatic Deployment Monitoring
# Runs automatically after every git push
# Monitors Vercel deployments to main branch

# Get the current branch
current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Only monitor pushes to main branch
if [ "$current_branch" = "main" ]; then
    echo ""
    echo "🚀 Push to main detected - Starting automatic deployment monitor..."
    echo ""
    
    # Get the workspace root (go up from .git/hooks)
    workspace_root=$(cd "$(dirname "$0")/../.." && pwd)
    
    # Check if monitor script exists
    monitor_script="$workspace_root/scripts/deployment/monitor-deployment.js"
    
    if [ -f "$monitor_script" ]; then
      # Run the monitor script
      node "$monitor_script"
      monitor_exit=$?
      
      if [ $monitor_exit -eq 0 ]; then
        echo ""
        echo "✅ Deployment completed successfully!"
      else
        echo ""
        echo "⚠️  Deployment monitoring completed with issues."
        echo "💡 Check Vercel dashboard: https://vercel.com/dashboard"
      fi
    else
      echo "⚠️  Monitor script not found at: $monitor_script"
      echo "💡 Install with: git checkout main -- scripts/deployment/monitor-deployment.js"
    fi
    
    echo ""
fi

exit 0
HOOK_CONTENT

# Make it executable
chmod +x "$POST_PUSH_HOOK"

[ "$QUIET_MODE" = false ] && echo -e "${GREEN}✅ Git hook created and made executable${NC}"

# Test the hook
if [ "$QUIET_MODE" = false ]; then
  echo ""
  echo -e "${BLUE}🧪 Testing hook installation...${NC}"
fi

if [ -x "$POST_PUSH_HOOK" ]; then
  [ "$QUIET_MODE" = false ] && echo -e "${GREEN}✅ Hook is executable${NC}"
else
  [ "$QUIET_MODE" = false ] && echo -e "${RED}❌ Hook is not executable${NC}"
  exit 1
fi

# Show what was installed (only in interactive mode)
if [ "$QUIET_MODE" = false ]; then
  echo ""
  echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  Installation Complete!                    ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}✅ Automatic monitoring is now active!${NC}"
  echo ""
  echo -e "${BLUE}📋 What happens now:${NC}"
  echo "   1. You push to main: ${YELLOW}git push origin main${NC}"
  echo "   2. Hook activates automatically"
  echo "   3. Monitor starts tracking deployment"
  echo "   4. You get status updates every 5 seconds"
  echo "   5. Script exits when deployment completes"
  echo ""
  echo -e "${BLUE}💡 To disable:${NC}"
  echo "   rm $POST_PUSH_HOOK"
  echo ""
  echo -e "${BLUE}💡 To reinstall:${NC}"
  echo "   ./scripts/deployment/setup-auto-monitor.sh"
  echo ""
  echo -e "${GREEN}🎉 Try it now with: ${YELLOW}git push origin main${NC}"
  echo ""
else
  # Quiet mode: just print a simple success message
  echo "✅ Deployment monitoring hook installed"
fi
