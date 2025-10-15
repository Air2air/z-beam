#!/bin/bash
# Root Directory Cleanup Script
# Organizes deployment documentation and scripts into proper directories
# Date: October 15, 2025

set -e  # Exit on error

echo "🧹 Starting Root Directory Cleanup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create directory structure
echo -e "${BLUE}📁 Step 1: Creating directory structure${NC}"
mkdir -p docs/deployment/troubleshooting
mkdir -p docs/archived/deployment
mkdir -p scripts/audit
mkdir -p scripts/dev
mkdir -p scripts/verification
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 2: Move active deployment documentation
echo -e "${BLUE}📄 Step 2: Moving active deployment documentation${NC}"
mv DEPLOYMENT.md docs/deployment/README.md && echo "  ✓ DEPLOYMENT.md → docs/deployment/README.md"
mv QUICK_TEST_GUIDE.md docs/deployment/ && echo "  ✓ QUICK_TEST_GUIDE.md → docs/deployment/"
mv MONITORING_SETUP.md docs/deployment/ && echo "  ✓ MONITORING_SETUP.md → docs/deployment/"
mv VERCEL_ENV_SETUP.md docs/deployment/ && echo "  ✓ VERCEL_ENV_SETUP.md → docs/deployment/"
mv EMAIL_SETUP_GUIDE.md docs/deployment/ && echo "  ✓ EMAIL_SETUP_GUIDE.md → docs/deployment/"
echo -e "${GREEN}✓ Active deployment docs moved${NC}"
echo ""

# Step 3: Move troubleshooting guides
echo -e "${BLUE}🔧 Step 3: Moving troubleshooting guides${NC}"
mv DASHBOARD_CONFIG_REQUIRED.md docs/deployment/troubleshooting/ && echo "  ✓ DASHBOARD_CONFIG_REQUIRED.md"
mv FINDING_PRODUCTION_SETTINGS.md docs/deployment/troubleshooting/ && echo "  ✓ FINDING_PRODUCTION_SETTINGS.md"
mv FIXING_CONFIG_MISMATCH.md docs/deployment/troubleshooting/ && echo "  ✓ FIXING_CONFIG_MISMATCH.md"
mv VERIFICATION_WALKTHROUGH.md docs/deployment/troubleshooting/ && echo "  ✓ VERIFICATION_WALKTHROUGH.md"
echo -e "${GREEN}✓ Troubleshooting guides moved${NC}"
echo ""

# Step 4: Archive historical deployment documentation
echo -e "${BLUE}📦 Step 4: Archiving historical deployment docs${NC}"
mv DEPLOYMENT_FIXES_SUMMARY.md docs/archived/deployment/ && echo "  ✓ DEPLOYMENT_FIXES_SUMMARY.md"
mv DEPLOYMENT_UPGRADE_COMPLETE.md docs/archived/deployment/ && echo "  ✓ DEPLOYMENT_UPGRADE_COMPLETE.md"
mv FORCE_PRODUCTION_ONLY.md docs/archived/deployment/ && echo "  ✓ FORCE_PRODUCTION_ONLY.md"
mv GIT_PRODUCTION_SETUP.md docs/archived/deployment/ && echo "  ✓ GIT_PRODUCTION_SETUP.md"
mv PRODUCTION_DEPLOYMENT_SETUP.md docs/archived/deployment/ && echo "  ✓ PRODUCTION_DEPLOYMENT_SETUP.md"
mv PRODUCTION_ONLY_DEPLOYMENT_CONFIG.md docs/archived/deployment/ && echo "  ✓ PRODUCTION_ONLY_DEPLOYMENT_CONFIG.md"
mv SYSTEM_ASSESSMENT.md docs/archived/deployment/ && echo "  ✓ SYSTEM_ASSESSMENT.md"
mv TEST_STATUS.md docs/archived/deployment/ && echo "  ✓ TEST_STATUS.md"
echo -e "${GREEN}✓ Historical docs archived${NC}"
echo ""

# Step 5: Move scripts to organized directories
echo -e "${BLUE}🔨 Step 5: Organizing scripts${NC}"
mv audit-images.sh scripts/audit/ && echo "  ✓ audit-images.sh → scripts/audit/"
mv quick-audit.sh scripts/audit/ && echo "  ✓ quick-audit.sh → scripts/audit/"
mv stop-dev-server.sh scripts/dev/ && echo "  ✓ stop-dev-server.sh → scripts/dev/"
mv verify-paths.sh scripts/verification/ && echo "  ✓ verify-paths.sh → scripts/verification/"
echo -e "${GREEN}✓ Scripts organized${NC}"
echo ""

# Summary
echo ""
echo -e "${GREEN}✅ Root Directory Cleanup Complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Summary:${NC}"
echo "   Root markdown files:        20 → 3 files (87.5% reduction)"
echo "   Files in docs/deployment/:       5 active guides"
echo "   Files in troubleshooting/:       4 guides"
echo "   Files archived:                  8 historical docs"
echo "   Scripts organized:               4 scripts in subdirectories"
echo ""
echo -e "${YELLOW}📁 New Structure:${NC}"
echo "   Root:"
echo "     • README.md"
echo "     • GROK_INSTRUCTIONS.md"
echo "     • DEPLOYMENT_CHANGELOG.md"
echo ""
echo "   docs/deployment/:"
echo "     • README.md (main guide)"
echo "     • QUICK_TEST_GUIDE.md"
echo "     • MONITORING_SETUP.md"
echo "     • VERCEL_ENV_SETUP.md"
echo "     • EMAIL_SETUP_GUIDE.md"
echo "     • troubleshooting/ (4 guides)"
echo ""
echo "   docs/archived/deployment/:"
echo "     • 8 historical documents"
echo ""
echo "   scripts/:"
echo "     • audit/ (2 scripts)"
echo "     • dev/ (1 script)"
echo "     • verification/ (1 script)"
echo ""
echo -e "${BLUE}⚠️  Next Steps:${NC}"
echo "   1. Update .vscode/tasks.json with new script paths"
echo "   2. Review docs/deployment/README.md"
echo "   3. Update main README.md with documentation structure"
echo "   4. Update docs/README.md with deployment section"
echo "   5. Run: git add . && git commit -m 'Organize root directory'"
echo ""
