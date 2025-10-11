#!/bin/bash

# Quick Verification & Test Script
# Use this after configuring Vercel Dashboard

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}║  ✅ Vercel Production Deployment Tester ✅    ║${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}This script will:${NC}"
echo "  1. Create a test commit"
echo "  2. Push to main branch"
echo "  3. Monitor the deployment"
echo "  4. Verify it's a Production deployment"
echo ""

read -p "Ready to proceed? (y/N): " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Test cancelled."
    exit 0
fi

# Step 1: Create test commit
echo -e "${BLUE}[1/4]${NC} Creating test commit..."
if git commit --allow-empty -m "Test: Verify production deployment ($(date +%H:%M:%S))"; then
    echo -e "${GREEN}✅ Test commit created${NC}"
else
    echo -e "${RED}❌ Failed to create commit${NC}"
    exit 1
fi
echo ""

# Step 2: Push to main
echo -e "${BLUE}[2/4]${NC} Pushing to main branch..."
if git push origin main; then
    echo -e "${GREEN}✅ Pushed to main successfully${NC}"
else
    echo -e "${RED}❌ Failed to push${NC}"
    exit 1
fi
echo ""

# Step 3: Wait for deployment to start
echo -e "${BLUE}[3/4]${NC} Waiting for deployment to register..."
echo -e "${CYAN}⏳ Waiting 15 seconds for Vercel to create deployment...${NC}"
sleep 15
echo ""

# Step 4: Check deployment
echo -e "${BLUE}[4/4]${NC} Checking deployment status..."
echo ""

if ! command -v vercel >/dev/null 2>&1; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm i -g vercel@latest"
    exit 1
fi

# Get latest deployment
LATEST=$(vercel ls 2>/dev/null | sed -n '6p')

if [ -z "$LATEST" ]; then
    echo -e "${RED}❌ No deployment found${NC}"
    echo "Try running: vercel ls"
    exit 1
fi

echo -e "${CYAN}Latest deployment:${NC}"
echo "$LATEST"
echo ""

# Check if it's production
if echo "$LATEST" | grep -q "Production"; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                ║${NC}"
    echo -e "${GREEN}║            ✅ SUCCESS! ✅                      ║${NC}"
    echo -e "${GREEN}║                                                ║${NC}"
    echo -e "${GREEN}║  Deployment created as PRODUCTION! 🎉         ║${NC}"
    echo -e "${GREEN}║                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Your configuration is working correctly!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  • Your future pushes to main will be production deployments"
    echo "  • Clean up old previews with:"
    echo "    ${CYAN}./scripts/deployment/cleanup-previews.sh all --yes${NC}"
    echo ""
    
elif echo "$LATEST" | grep -q "Preview"; then
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                ║${NC}"
    echo -e "${RED}║            ❌ ISSUE DETECTED ❌                ║${NC}"
    echo -e "${RED}║                                                ║${NC}"
    echo -e "${RED}║  Deployment created as PREVIEW                 ║${NC}"
    echo -e "${RED}║                                                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Dashboard settings may not be configured correctly.${NC}"
    echo ""
    echo -e "${BLUE}Troubleshooting steps:${NC}"
    echo ""
    echo "1. Verify dashboard settings:"
    echo "   ${CYAN}https://vercel.com/air2airs-projects/z-beam/settings/git${NC}"
    echo ""
    echo "2. Ensure:"
    echo "   • Production Branch is set to: ${GREEN}main${NC}"
    echo "   • Preview Deployments are: ${GREEN}Disabled${NC}"
    echo ""
    echo "3. Try disconnecting and reconnecting GitHub:"
    echo "   • Go to Git settings"
    echo "   • Click 'Disconnect'"
    echo "   • Click 'Connect Git Repository'"
    echo "   • Select your repository again"
    echo ""
    echo "4. Force a production deployment:"
    echo "   ${CYAN}vercel --prod${NC}"
    echo ""
    echo "5. See full troubleshooting guide:"
    echo "   ${CYAN}cat VERIFICATION_WALKTHROUGH.md${NC}"
    echo ""
    exit 1
    
elif echo "$LATEST" | grep -q "Canceled"; then
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                ║${NC}"
    echo -e "${RED}║         ⚠️  DEPLOYMENT CANCELED ⚠️           ║${NC}"
    echo -e "${RED}║                                                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Deployment was canceled (likely marked as Preview)${NC}"
    echo ""
    echo -e "${BLUE}This means:${NC}"
    echo "  • Dashboard settings are not properly configured"
    echo "  • Vercel is still creating Preview deployments"
    echo ""
    echo -e "${BLUE}Solution:${NC}"
    echo "  1. Go to Vercel Dashboard Git settings"
    echo "  2. Set Production Branch to 'main'"
    echo "  3. Disable Preview Deployments"
    echo "  4. Save and try again"
    echo ""
    echo -e "${CYAN}Full instructions:${NC}"
    echo "  cat VERIFICATION_WALKTHROUGH.md"
    echo ""
    exit 1
    
else
    echo ""
    echo -e "${YELLOW}⚠️  Deployment status unclear${NC}"
    echo ""
    echo "Run this to see all recent deployments:"
    echo "  ${CYAN}vercel ls | head -10${NC}"
    echo ""
fi
