#!/bin/bash
##############################################################################
# Pre-Deployment Build Verification Script
# 
# This script performs comprehensive build verification before deployment:
# 1. Runs full production build
# 2. Checks exit code for failures
# 3. Verifies TypeScript has no errors
# 4. Checks for orphaned JSX tags
# 5. Validates component migrations (no SectionContainer references)
#
# Usage: ./scripts/verify-build.sh
##############################################################################

set -e  # Exit on any error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔍 PRE-DEPLOYMENT BUILD VERIFICATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Build check
echo -e "${YELLOW}[1/5] Running production build...${NC}"
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ Build passed${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo ""
    echo -e "${RED}Build output (last 50 lines):${NC}"
    tail -50 /tmp/build.log
    exit 1
fi

# Step 2: TypeScript error check
echo -e "${YELLOW}[2/5] Checking for TypeScript errors...${NC}"
TS_ERRORS=$(grep -i "error TS" /tmp/build.log | wc -l)
if [ $TS_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
    echo -e "${RED}❌ Found $TS_ERRORS TypeScript errors${NC}"
    grep -i "error TS" /tmp/build.log
    exit 1
fi

# Step 3: Check for orphaned closing tags (common migration errors)
echo -e "${YELLOW}[3/5] Checking for orphaned JSX closing tags...${NC}"
ORPHANED=$(grep -r "</SectionContainer>" app/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "legacy/SectionContainer_Deprecated" | wc -l)
if [ $ORPHANED -eq 0 ]; then
    echo -e "${GREEN}✅ No orphaned SectionContainer tags${NC}"
else
    echo -e "${RED}❌ Found $ORPHANED orphaned SectionContainer closing tags${NC}"
    grep -r "</SectionContainer>" app/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "legacy/SectionContainer_Deprecated"
    exit 1
fi

# Step 4: Check component migration completeness
echo -e "${YELLOW}[4/5] Validating component migrations...${NC}"
ACTIVE_IMPORTS=$(grep -r "import.*SectionContainer" app/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "legacy/SectionContainer_Deprecated" | wc -l)
if [ $ACTIVE_IMPORTS -eq 0 ]; then
    echo -e "${GREEN}✅ No active SectionContainer imports${NC}"
else
    echo -e "${RED}❌ Found $ACTIVE_IMPORTS active SectionContainer imports${NC}"
    grep -r "import.*SectionContainer" app/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "legacy/SectionContainer_Deprecated"
    exit 1
fi

# Step 5: Verify BaseSection is being used
echo -e "${YELLOW}[5/5] Verifying BaseSection usage...${NC}"
BASESECTION_IMPORTS=$(grep -r "import.*BaseSection" app/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "legacy" | wc -l)
if [ $BASESECTION_IMPORTS -gt 0 ]; then
    echo -e "${GREEN}✅ BaseSection imports found ($BASESECTION_IMPORTS files)${NC}"
else
    echo -e "${YELLOW}⚠️  No BaseSection imports found in active components${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ ALL VERIFICATION CHECKS PASSED${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  ✅ Production build: PASSED"
echo "  ✅ TypeScript errors: 0"
echo "  ✅ Orphaned tags: 0"
echo "  ✅ Active SectionContainer imports: 0"
echo "  ✅ Migration complete"
echo ""
echo -e "${GREEN}🚀 READY FOR DEPLOYMENT${NC}"
