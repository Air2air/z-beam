#!/bin/bash

# Sync Calendly URL from local .env to Vercel
# Usage: ./scripts/deployment/sync-calendly-to-vercel.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}📅 Calendly URL Sync to Vercel${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Create .env file with NEXT_PUBLIC_CALENDLY_URL"
    exit 1
fi

# Load Calendly URL from .env
CALENDLY_URL=$(grep "^NEXT_PUBLIC_CALENDLY_URL=" .env | cut -d '=' -f2-)

if [ -z "$CALENDLY_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_CALENDLY_URL not found in .env${NC}"
    exit 1
fi

echo -e "${BLUE}Local Calendly URL:${NC}"
echo "   $CALENDLY_URL"
echo ""

# Validate URL
echo -e "${BLUE}🔍 Validating URL...${NC}"
if npm run validate:calendly --silent 2>/dev/null; then
    echo -e "${GREEN}✅ URL is valid${NC}"
else
    echo -e "${RED}❌ URL validation failed${NC}"
    echo "   Fix the URL before syncing to Vercel"
    exit 1
fi
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
    echo ""
    echo "   Install with: npm i -g vercel"
    echo ""
    echo "   Or manually update in Vercel dashboard:"
    echo "   https://vercel.com/air2air/z-beam/settings/environment-variables"
    echo ""
    echo "   Variable: NEXT_PUBLIC_CALENDLY_URL"
    echo "   Value: $CALENDLY_URL"
    exit 1
fi

# Ask for confirmation
echo -e "${YELLOW}This will update the Calendly URL in Vercel for:${NC}"
echo "   • Production"
echo "   • Preview"  
echo "   • Development"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔄 Updating Vercel environment variables...${NC}"

# Update for all environments
for env in production preview development; do
    echo -e "   Updating ${env}..."
    if vercel env rm NEXT_PUBLIC_CALENDLY_URL $env --yes 2>/dev/null; then
        echo "     Removed old value"
    fi
    echo "$CALENDLY_URL" | vercel env add NEXT_PUBLIC_CALENDLY_URL $env
done

echo ""
echo -e "${GREEN}✅ Calendly URL synced to Vercel${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "   1. Redeploy your site (or wait for next push)"
echo "   2. Verify widget works at: https://www.z-beam.com/schedule"
echo ""
echo -e "${YELLOW}Note: Changes take effect on next deployment${NC}"
echo ""
