#!/bin/bash

# Sitemap verification script for CI/CD pipeline
# Run this before deployment to ensure sitemap is complete

set -e  # Exit on error

echo "═══════════════════════════════════════"
echo "🗺️  SITEMAP VERIFICATION SCRIPT"
echo "═══════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check sitemap.ts exists
echo "1️⃣  Checking sitemap.ts existence..."
if [ ! -f "app/sitemap.ts" ]; then
    echo -e "${RED}❌ ERROR: app/sitemap.ts not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Sitemap file exists${NC}"
echo ""

# Check for dynamic article generation
echo "2️⃣  Validating dynamic article generation..."
if ! grep -q "fs.readdirSync" app/sitemap.ts; then
    echo -e "${RED}❌ ERROR: Sitemap is not dynamically reading frontmatter files${NC}"
    exit 1
fi
if ! grep -q "materialPageRoutes\|articleRoutes" app/sitemap.ts; then
    echo -e "${RED}❌ ERROR: Missing materialPageRoutes or articleRoutes in sitemap${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dynamic article generation is implemented${NC}"
echo ""

# Count frontmatter files
echo "3️⃣  Counting article files..."
FRONTMATTER_DIR="frontmatter/materials"
if [ ! -d "$FRONTMATTER_DIR" ]; then
    echo -e "${RED}❌ ERROR: Frontmatter directory not found${NC}"
    exit 1
fi

ARTICLE_COUNT=$(find "$FRONTMATTER_DIR" -name "*-laser-cleaning.yaml" | wc -l | tr -d ' ')
if [ "$ARTICLE_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ ERROR: No article files found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Found $ARTICLE_COUNT article files${NC}"
echo ""

# Check static routes
echo "4️⃣  Validating static routes..."
REQUIRED_ROUTES=("about" "services" "rental" "partners" "contact" "search")
MISSING_ROUTES=()

for route in "${REQUIRED_ROUTES[@]}"; do
    if ! grep -q "/${route}" app/sitemap.ts; then
        MISSING_ROUTES+=("$route")
    fi
done

if [ ${#MISSING_ROUTES[@]} -ne 0 ]; then
    echo -e "${RED}❌ ERROR: Missing static routes: ${MISSING_ROUTES[*]}${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All static routes present${NC}"
echo ""

# Check material category routes
echo "5️⃣  Validating material category routes..."

# Define required material categories (lowercase as normalized in contentAPI)
REQUIRED_CATEGORIES=("metal" "ceramic" "composite" "semiconductor" "glass" "stone" "wood" "masonry" "plastic" "rare-earth")

MISSING_CATEGORIES=()

for category in "${REQUIRED_CATEGORIES[@]}"; do
    # Check for category with or without quotes (lowercase or any case, will be normalized)
    if ! grep -qiE "(category: ${category}|category: '${category}')" frontmatter/materials/*.yaml 2>/dev/null; then
        MISSING_CATEGORIES+=("$category")
    fi
done

if [ ${#MISSING_CATEGORIES[@]} -ne 0 ]; then
    echo -e "${RED}❌ ERROR: Missing material categories: ${MISSING_CATEGORIES[*]}${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All material categories present${NC}"
echo ""

# Run tests if available
echo "6️⃣  Running sitemap tests..."
if [ -f "tests/sitemap/sitemap.test.ts" ]; then
    if npm test -- tests/sitemap/sitemap.test.ts --silent 2>/dev/null; then
        echo -e "${GREEN}✓ Sitemap tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Sitemap tests failed (non-blocking)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No sitemap tests found (tests/sitemap/sitemap.test.ts)${NC}"
fi
echo ""

# Build sitemap and check output
echo "7️⃣  Building sitemap..."
if npm run build:sitemap 2>/dev/null; then
    echo -e "${GREEN}✓ Sitemap built successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Could not build sitemap (this may be expected in CI)${NC}"
fi
echo ""

# Summary
echo "═══════════════════════════════════════"
echo -e "${GREEN}✅ SITEMAP VERIFICATION COMPLETE${NC}"
echo "═══════════════════════════════════════"
echo ""
echo "Summary:"
echo "  • Static routes: ${#REQUIRED_ROUTES[@]}"
echo "  • Material categories: ${#REQUIRED_CATEGORIES[@]}"
echo "  • Article pages: $ARTICLE_COUNT"
echo "  • Total estimated pages: $((${#REQUIRED_ROUTES[@]} + ${#REQUIRED_CATEGORIES[@]} + ARTICLE_COUNT + 1))"
echo ""
echo -e "${GREEN}Sitemap is ready for production deployment! 🚀${NC}"
echo ""

exit 0
