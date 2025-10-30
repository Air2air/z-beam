#!/bin/bash
# scripts/verify-freshness-integration.sh
# Verifies that freshness timestamp integration is working correctly

set -e

echo "🔍 VERIFYING FRESHNESS TIMESTAMP INTEGRATION"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SUCCESS_COUNT=0
WARNING_COUNT=0
ERROR_COUNT=0

# ============================================
# 1. CHECK FRONTMATTER FILES
# ============================================
echo "📄 Checking frontmatter files..."

FRONTMATTER_DIR="frontmatter/materials"
TOTAL_FILES=$(find "$FRONTMATTER_DIR" -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
FILES_WITH_PUBLISHED=$(grep -r "^datePublished:" "$FRONTMATTER_DIR" 2>/dev/null | wc -l | tr -d ' ')
FILES_WITH_MODIFIED=$(grep -r "^dateModified:" "$FRONTMATTER_DIR" 2>/dev/null | wc -l | tr -d ' ')

echo "   Total frontmatter files: $TOTAL_FILES"
echo "   Files with datePublished: $FILES_WITH_PUBLISHED"
echo "   Files with dateModified: $FILES_WITH_MODIFIED"

if [ "$FILES_WITH_PUBLISHED" -eq "$TOTAL_FILES" ]; then
  echo -e "   ${GREEN}✅ All files have datePublished${NC}"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
  MISSING=$((TOTAL_FILES - FILES_WITH_PUBLISHED))
  echo -e "   ${YELLOW}⚠️  $MISSING files missing datePublished${NC}"
  WARNING_COUNT=$((WARNING_COUNT + 1))
fi

if [ "$FILES_WITH_MODIFIED" -eq "$TOTAL_FILES" ]; then
  echo -e "   ${GREEN}✅ All files have dateModified${NC}"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
  MISSING=$((TOTAL_FILES - FILES_WITH_MODIFIED))
  echo -e "   ${YELLOW}⚠️  $MISSING files missing dateModified${NC}"
  WARNING_COUNT=$((WARNING_COUNT + 1))
fi

echo ""

# ============================================
# 2. CHECK TRACKING FILE
# ============================================
echo "📝 Checking update tracking..."

TRACKING_FILE="content/.freshness-updates.json"

if [ -f "$TRACKING_FILE" ]; then
  echo -e "   ${GREEN}✅ Tracking file exists${NC}"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  
  # Check if tracking file is valid JSON
  if jq empty "$TRACKING_FILE" 2>/dev/null; then
    echo -e "   ${GREEN}✅ Tracking file is valid JSON${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    
    # Show stats
    TOTAL_UPDATES=$(jq -r '.totalUpdates // 0' "$TRACKING_FILE")
    LAST_RUN=$(jq -r '.lastRun // "Never"' "$TRACKING_FILE")
    echo "   Total updates performed: $TOTAL_UPDATES"
    echo "   Last run: $LAST_RUN"
  else
    echo -e "   ${RED}❌ Tracking file is invalid JSON${NC}"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  fi
else
  echo -e "   ${YELLOW}⚠️  Tracking file not found (run update script first)${NC}"
  WARNING_COUNT=$((WARNING_COUNT + 1))
fi

echo ""

# ============================================
# 3. CHECK DATE FORMATS
# ============================================
echo "📅 Validating date formats..."

# Check for ISO 8601 format
INVALID_DATES=$(grep -rE "^date(Published|Modified):" "$FRONTMATTER_DIR" | \
  grep -vE "'[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3,6}Z'" | \
  wc -l | tr -d ' ')

if [ "$INVALID_DATES" -eq 0 ]; then
  echo -e "   ${GREEN}✅ All dates use ISO 8601 format${NC}"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
  echo -e "   ${YELLOW}⚠️  $INVALID_DATES dates may have invalid format${NC}"
  WARNING_COUNT=$((WARNING_COUNT + 1))
fi

echo ""

# ============================================
# 4. CHECK FRESHNESS DISTRIBUTION
# ============================================
echo "🎯 Checking freshness distribution..."

CURRENT_DATE=$(date -u +"%Y-%m-%d")
THIRTY_DAYS_AGO=$(date -u -v-30d +"%Y-%m-%d" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%d")
NINETY_DAYS_AGO=$(date -u -v-90d +"%Y-%m-%d" 2>/dev/null || date -u -d "90 days ago" +"%Y-%m-%d")

# Note: This is a simplified check. The actual script has more sophisticated date comparison
FRESH_COUNT=$(grep -rE "^dateModified: '$(date -u +"%Y-%m")" "$FRONTMATTER_DIR" 2>/dev/null | wc -l | tr -d ' ')

if [ "$FRESH_COUNT" -gt 0 ]; then
  FRESH_PERCENT=$((FRESH_COUNT * 100 / TOTAL_FILES))
  echo "   Fresh content (this month): $FRESH_COUNT files ($FRESH_PERCENT%)"
  
  if [ "$FRESH_PERCENT" -ge 20 ]; then
    echo -e "   ${GREEN}✅ Good freshness distribution (≥20%)${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo -e "   ${YELLOW}⚠️  Low freshness distribution (<20%)${NC}"
    WARNING_COUNT=$((WARNING_COUNT + 1))
  fi
else
  echo -e "   ${YELLOW}⚠️  No fresh content found${NC}"
  WARNING_COUNT=$((WARNING_COUNT + 1))
fi

echo ""

# ============================================
# 5. BUILD TEST
# ============================================
echo "🔨 Testing build..."

if npm run build > /tmp/freshness-build.log 2>&1; then
  echo -e "   ${GREEN}✅ Build succeeded${NC}"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
  echo -e "   ${RED}❌ Build failed (check /tmp/freshness-build.log)${NC}"
  ERROR_COUNT=$((ERROR_COUNT + 1))
  cat /tmp/freshness-build.log
fi

echo ""

# ============================================
# 6. CHECK GENERATED HTML
# ============================================
echo "🌐 Checking generated HTML..."

if [ -d ".next" ]; then
  # Check for OpenGraph dates in server HTML
  if grep -r "article:modified_time" .next/server/ > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ OpenGraph dates found in HTML${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo -e "   ${YELLOW}⚠️  OpenGraph dates not found in HTML${NC}"
    WARNING_COUNT=$((WARNING_COUNT + 1))
  fi
  
  # Check for JSON-LD dates
  if grep -r '"dateModified"' .next/server/ > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ JSON-LD dates found in HTML${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo -e "   ${YELLOW}⚠️  JSON-LD dates not found in HTML${NC}"
    WARNING_COUNT=$((WARNING_COUNT + 1))
  fi
else
  echo -e "   ${YELLOW}⚠️  Build output not found (run 'npm run build' first)${NC}"
  WARNING_COUNT=$((WARNING_COUNT + 1))
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo "============================================="
echo "📊 VERIFICATION SUMMARY"
echo "============================================="
echo -e "${GREEN}✅ Passed: $SUCCESS_COUNT${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNING_COUNT${NC}"
echo -e "${RED}❌ Errors: $ERROR_COUNT${NC}"
echo ""

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ Verification failed with errors${NC}"
  echo ""
  echo "Recommended actions:"
  echo "1. Review error messages above"
  echo "2. Fix issues and re-run verification"
  echo "3. Check build logs: /tmp/freshness-build.log"
  exit 1
elif [ "$WARNING_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Verification completed with warnings${NC}"
  echo ""
  echo "Recommended actions:"
  echo "1. Review warnings above"
  echo "2. Run update script if dates are missing:"
  echo "   npm run update-freshness:execute"
  exit 0
else
  echo -e "${GREEN}✅ Verification passed! All checks successful.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Deploy to production: ./smart-deploy.sh deploy"
  echo "2. Monitor Google Search Console"
  echo "3. Schedule weekly updates: npm run update-freshness:weekly"
  exit 0
fi
