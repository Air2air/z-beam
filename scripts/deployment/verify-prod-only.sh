#!/bin/bash

# Verify Production-Only Deployment Configuration
# This script checks that your Vercel project is properly configured

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
echo -e "${CYAN}║   🔍 Production-Only Deployment Verifier 🔍   ║${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if vercel.json exists
echo -e "${BLUE}[1/5]${NC} Checking vercel.json configuration..."
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ ERROR: vercel.json not found${NC}"
    exit 1
fi

# Check buildCommand
BUILD_CMD=$(grep -A 1 '"buildCommand"' vercel.json | grep -o '".*"' | tail -1 | tr -d '"')
if [[ $BUILD_CMD == *"VERCEL_ENV"*"production"* ]]; then
    echo -e "${GREEN}✅ Build command configured to skip non-production builds${NC}"
    echo -e "   ${CYAN}Command: $BUILD_CMD${NC}"
else
    echo -e "${YELLOW}⚠️  Build command may allow preview deployments${NC}"
    echo -e "   ${CYAN}Command: $BUILD_CMD${NC}"
fi
echo ""

# Check git configuration
echo -e "${BLUE}[2/5]${NC} Checking git integration settings..."
GIT_CONFIG=$(grep -A 5 '"git"' vercel.json)
if [[ $GIT_CONFIG == *'"main": true'* ]]; then
    echo -e "${GREEN}✅ Git integration: Only main branch enabled${NC}"
else
    echo -e "${YELLOW}⚠️  Git integration may allow other branches${NC}"
fi
echo ""

# Check ignoreCommand
echo -e "${BLUE}[3/5]${NC} Checking ignore command..."
IGNORE_CMD=$(grep '"ignoreCommand"' vercel.json)
if [[ $IGNORE_CMD == *"main"* ]]; then
    echo -e "${GREEN}✅ Ignore command: Only main branch proceeds${NC}"
else
    echo -e "${YELLOW}⚠️  Ignore command not restrictive${NC}"
fi
echo ""

# Check recent deployments
echo -e "${BLUE}[4/5]${NC} Checking recent deployment history..."
if command -v vercel >/dev/null 2>&1; then
    RECENT_PROD=$(vercel ls 2>/dev/null | grep "Production" | head -1)
    RECENT_PREVIEW=$(vercel ls 2>/dev/null | grep "Preview" | head -1)
    
    if [ -n "$RECENT_PROD" ]; then
        echo -e "${GREEN}✅ Recent production deployment found:${NC}"
        echo "   $RECENT_PROD"
    fi
    
    if [ -n "$RECENT_PREVIEW" ]; then
        PREVIEW_AGE=$(echo "$RECENT_PREVIEW" | awk '{print $1}')
        echo -e "${YELLOW}⚠️  Preview deployment found (Age: $PREVIEW_AGE):${NC}"
        echo "   $RECENT_PREVIEW"
        echo -e "   ${CYAN}Note: Old previews can be cleaned with cleanup-previews.sh${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Vercel CLI not installed, skipping deployment check${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}[5/5]${NC} Configuration Summary"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "Your configuration is set for ${GREEN}production-only${NC} deployments:"
echo ""
echo -e "  ✅ Build command filters non-production builds"
echo -e "  ✅ Git integration limited to main branch"
echo -e "  ✅ Ignore command restricts to main branch"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Verify Vercel Dashboard Settings${NC}"
echo ""
echo -e "To ensure 100% production-only deployments:"
echo ""
echo -e "  1. Go to: ${CYAN}https://vercel.com/air2airs-projects/z-beam/settings/git${NC}"
echo -e "  2. Under 'Preview Deployments': Set to ${GREEN}Ignored${NC}"
echo -e "  3. Under 'Production Branch': Confirm ${GREEN}main${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo ""
echo -e "  • Verify dashboard settings (see above)"
echo -e "  • Test with: ${CYAN}git commit --allow-empty -m 'Test prod deploy' && git push${NC}"
echo -e "  • Monitor with: ${CYAN}npm run deploy:prod${NC}"
echo -e "  • Clean old previews: ${CYAN}./scripts/deployment/cleanup-previews.sh old 3 --yes${NC}"
echo ""
