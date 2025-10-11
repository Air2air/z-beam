#!/bin/bash

# Temporary Solution: Deploy to Production via CLI
# Use this until dashboard settings are found

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}║    🚀 Force Production Deploy (Bypass Git) 🚀  ║${NC}"
echo -e "${CYAN}║                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}This will:${NC}"
echo "  • Deploy current code directly to production"
echo "  • Bypass git integration (temporary workaround)"
echo "  • Create a PRODUCTION deployment (not preview)"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo -e "${BLUE}Deploying to production...${NC}"
echo ""

if vercel --prod --yes; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                ║${NC}"
    echo -e "${GREEN}║            ✅ SUCCESS! ✅                      ║${NC}"
    echo -e "${GREEN}║                                                ║${NC}"
    echo -e "${GREEN}║  Production deployment created! 🎉            ║${NC}"
    echo -e "${GREEN}║                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}Checking deployment...${NC}"
    sleep 3
    vercel ls --prod | head -5
    
    echo ""
    echo -e "${BLUE}✅ This proves your code works!${NC}"
    echo ""
    echo -e "The issue is just with git integration settings."
    echo "Once we find the right dashboard setting, git pushes"
    echo "will automatically create production deployments."
    echo ""
else
    echo ""
    echo "❌ Deployment failed - check error above"
    exit 1
fi
