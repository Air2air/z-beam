#!/bin/bash
# Simplified Deployment Script
# Orchestrates pre-flight checks, deployment, and post-deployment validation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║                                                       ║${NC}"
echo -e "${BOLD}${CYAN}║          Z-BEAM PRODUCTION DEPLOYMENT                 ║${NC}"
echo -e "${BOLD}${CYAN}║                                                       ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Pre-flight checks
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  PRE-FLIGHT VALIDATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}Running quality checks in parallel...${NC}"
npm run check || {
    echo -e "${RED}❌ Pre-flight checks failed!${NC}"
    echo -e "${YELLOW}Fix the errors above before deploying${NC}"
    exit 1
}

echo -e "${CYAN}Running content validation...${NC}"
npm run validate:content || {
    echo -e "${RED}❌ Content validation failed!${NC}"
    echo -e "${YELLOW}Fix the errors above before deploying${NC}"
    exit 1
}

echo -e "${CYAN}Generating datasets...${NC}"
if npm run | grep -q "generate:datasets"; then
    npm run generate:datasets || {
        echo -e "${RED}❌ Dataset generation failed!${NC}"
        echo -e "${YELLOW}Fix the errors above before deploying${NC}"
        exit 1
    }
else
    echo -e "${YELLOW}⚠️  Skipping generate:datasets (handled by backend project)${NC}"
fi

echo -e "${CYAN}Running component tests...${NC}"
npm run test:components || {
    echo -e "${RED}❌ Component tests failed!${NC}"
    echo -e "${YELLOW}Fix the errors above before deploying${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ All pre-flight checks passed!${NC}"
echo ""

# Deploy
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  PRODUCTION DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check if vercel CLI is available
if ! command -v vercel >/dev/null 2>&1; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo -e "${YELLOW}Install it: npm i -g vercel${NC}"
    exit 1
fi

echo -e "${CYAN}🚀 Deploying to Vercel...${NC}"
vercel --prod --archive=tgz || {
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Get deployment URL (fallback to canonical production URL if parsing fails)
DEPLOYMENT_URL=$(vercel ls --prod 2>/dev/null | head -2 | tail -1 | awk '{print $2}')
if [ -z "$DEPLOYMENT_URL" ]; then
    DEPLOYMENT_URL="https://www.z-beam.com"
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  POST-DEPLOYMENT VALIDATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}Running post-deployment checks on: $DEPLOYMENT_URL${NC}"
echo ""

# Post-deployment validations (non-blocking warnings)
echo -e "${CYAN}Validating production site (strict)...${NC}"
PRODUCTION_URL="$DEPLOYMENT_URL" npm run validate:production:strict-seo || {
    echo -e "${RED}❌ Post-deployment validation failed!${NC}"
    echo -e "${YELLOW}Fix production validation issues before considering deployment complete${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Deployment pipeline complete!${NC}"
echo ""
echo -e "${BOLD}Your site is live at:${NC}"
echo -e "  • ${CYAN}https://z-beam.com${NC}"
echo -e "  • ${CYAN}https://www.z-beam.com${NC}"
echo ""
