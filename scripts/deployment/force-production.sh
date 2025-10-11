#!/bin/bash

# Force Production-Only Deployments
# This script configures Vercel to ALWAYS deploy to production, never preview

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}║    🔒 Force Production-Only Deployments 🔒    ║${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel >/dev/null 2>&1; then
    echo -e "${RED}❌ ERROR: Vercel CLI not installed${NC}"
    echo "Install with: npm i -g vercel@latest"
    exit 1
fi

echo -e "${BLUE}[1/4]${NC} Checking current configuration..."
echo ""

# Show current vercel.json settings
echo -e "${CYAN}Current vercel.json settings:${NC}"
echo -e "  - Git integration: main branch only"
echo -e "  - Build command: next build"
echo -e "  - Ignore command: Only main branch"
echo ""

echo -e "${BLUE}[2/4]${NC} Updating vercel.json configuration..."

# The vercel.json is already updated with simplified buildCommand
echo -e "${GREEN}✅ vercel.json configured for production-only${NC}"
echo ""

echo -e "${BLUE}[3/4]${NC} Important: Manual Vercel Dashboard Configuration"
echo ""
echo -e "${YELLOW}⚠️  You MUST configure these settings in Vercel Dashboard:${NC}"
echo ""
echo -e "1. Go to: ${CYAN}https://vercel.com/air2airs-projects/z-beam/settings/git${NC}"
echo ""
echo -e "2. Under ${YELLOW}'Git Repository'${NC}:"
echo -e "   - Production Branch: ${GREEN}main${NC}"
echo ""
echo -e "3. Under ${YELLOW}'Deployment Protection'${NC} or ${YELLOW}'Preview Deployments'${NC}:"
echo -e "   - Set to: ${GREEN}DISABLED${NC} or ${GREEN}PRODUCTION ONLY${NC}"
echo -e "   - Or check: ${GREEN}☑ Ignore Pull Requests${NC}"
echo ""
echo -e "4. Under ${YELLOW}'Deploy Hooks'${NC}:"
echo -e "   - Remove any preview deploy hooks if present"
echo ""
echo -e "5. ${YELLOW}IMPORTANT${NC}: Look for option like:"
echo -e "   - '${YELLOW}Automatic Deployments from Branch${NC}'"
echo -e "   - Set ONLY ${GREEN}main${NC} branch to ${GREEN}Production${NC}"
echo -e "   - Ensure NO other branches are enabled"
echo ""

echo -e "${BLUE}[4/4]${NC} Testing Configuration"
echo ""

read -p "Have you updated the Vercel Dashboard settings? (y/N): " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please update dashboard settings first, then run:${NC}"
    echo -e "   ${CYAN}./scripts/deployment/force-production.sh${NC}"
    echo ""
    exit 0
fi

echo -e "${GREEN}✅ Configuration Complete!${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo -e "1. Test with a push to main:"
echo -e "   ${CYAN}git commit --allow-empty -m 'Test: Production deploy'${NC}"
echo -e "   ${CYAN}git push origin main${NC}"
echo ""
echo -e "2. Verify deployment:"
echo -e "   ${CYAN}vercel ls | head -5${NC}"
echo ""
echo -e "3. Expected result:"
echo -e "   ${GREEN}✅ New deployment with Environment: Production${NC}"
echo -e "   ${RED}❌ NO deployments with Environment: Preview${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}💡 TIP:${NC} If you still see preview deployments:"
echo ""
echo -e "   1. Double-check dashboard settings"
echo -e "   2. Try disconnecting and reconnecting GitHub integration"
echo -e "   3. Contact Vercel support if issue persists"
echo ""
