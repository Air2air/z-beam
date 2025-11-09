#!/bin/bash

##############################################################################
# Z-Beam Intelligent Pre-Commit Hook
# 
# Auto-repair validation system:
# 1. Detects validation failures
# 2. Attempts automatic repair
# 3. Re-validates after repair
# 4. Only blocks commit if auto-fix fails
# 
# Reports what was repaired automatically.
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Z-Beam Intelligent Pre-Commit Auto-Repair${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Track overall status
NEEDS_REPAIR=false
AUTO_FIXED=false
REPAIR_FAILED=false

# Array to track what was fixed
FIXED_ITEMS=()

##############################################################################
# Step 1: Run initial validation to detect issues
##############################################################################

echo -e "${BLUE}🔍 Step 1: Detecting validation issues...${NC}"

# Check for type errors
echo -n "  • Type checking... "
if npm run type-check > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}⚠ Issues detected${NC}"
  NEEDS_REPAIR=true
fi

# Check for lint errors
echo -n "  • Lint checking... "
if npm run lint > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}⚠ Issues detected${NC}"
  NEEDS_REPAIR=true
fi

# Check for naming conventions (fast check)
echo -n "  • Naming conventions... "
if npm run validate:naming > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}⚠ Issues detected${NC}"
  NEEDS_REPAIR=true
fi

# Check for metadata sync
echo -n "  • Metadata sync... "
if npm run validate:metadata > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${YELLOW}⚠ Issues detected${NC}"
  NEEDS_REPAIR=true
fi

##############################################################################
# Step 2: Attempt automatic repair if issues detected
##############################################################################

if [ "$NEEDS_REPAIR" = true ]; then
  echo ""
  echo -e "${CYAN}🔧 Step 2: Attempting automatic repair...${NC}"
  
  # Run auto-repair system
  if npm run validate:auto-fix > /tmp/auto-repair.log 2>&1; then
    AUTO_FIXED=true
    
    # Extract what was fixed from the log
    if grep -q "Succeeded:" /tmp/auto-repair.log; then
      SUCCEEDED=$(grep "Succeeded:" /tmp/auto-repair.log | awk '{print $2}')
      if [ "$SUCCEEDED" -gt 0 ]; then
        echo -e "${GREEN}  ✓ Auto-fixed $SUCCEEDED issue(s)${NC}"
        
        # Extract details
        if grep -q "Auto-fix ESLint" /tmp/auto-repair.log; then
          FIXED_ITEMS+=("ESLint errors")
        fi
        if grep -q "HTTPS" /tmp/auto-repair.log; then
          FIXED_ITEMS+=("HTTP → HTTPS conversions")
        fi
        if grep -q "Metadata" /tmp/auto-repair.log; then
          FIXED_ITEMS+=("Metadata synchronization")
        fi
        if grep -q "Prettier" /tmp/auto-repair.log; then
          FIXED_ITEMS+=("Code formatting")
        fi
      fi
    fi
  else
    REPAIR_FAILED=true
    echo -e "${RED}  ✗ Auto-repair failed${NC}"
    echo ""
    echo -e "${YELLOW}Repair log:${NC}"
    cat /tmp/auto-repair.log
  fi
  
  # Clean up log
  rm -f /tmp/auto-repair.log
else
  echo ""
  echo -e "${GREEN}✓ No issues detected - validation passing${NC}"
fi

##############################################################################
# Step 3: Re-validate after repair
##############################################################################

if [ "$AUTO_FIXED" = true ]; then
  echo ""
  echo -e "${CYAN}🔍 Step 3: Re-validating after auto-repair...${NC}"
  
  # Re-run validations
  echo -n "  • Type checking... "
  if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗ Still has issues${NC}"
    REPAIR_FAILED=true
  fi
  
  echo -n "  • Lint checking... "
  if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗ Still has issues${NC}"
    REPAIR_FAILED=true
  fi
  
  echo -n "  • Naming conventions... "
  if npm run validate:naming > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗ Still has issues${NC}"
    REPAIR_FAILED=true
  fi
  
  echo -n "  • Metadata sync... "
  if npm run validate:metadata > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗ Still has issues${NC}"
    REPAIR_FAILED=true
  fi
fi

##############################################################################
# Step 4: Report and decide
##############################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

if [ "$REPAIR_FAILED" = true ]; then
  echo -e "${RED}❌ Commit blocked - auto-repair could not fix all issues${NC}"
  echo ""
  echo -e "${YELLOW}Manual intervention required:${NC}"
  echo "  • Review the errors above"
  echo "  • Fix remaining issues manually"
  echo "  • Try committing again"
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""
  exit 1
elif [ "$AUTO_FIXED" = true ]; then
  echo -e "${GREEN}✅ Auto-repair successful - commit proceeding${NC}"
  echo ""
  echo -e "${CYAN}What was repaired:${NC}"
  for item in "${FIXED_ITEMS[@]}"; do
    echo "  • $item"
  done
  echo ""
  echo -e "${YELLOW}💡 Tip: Review auto-fixed changes before pushing${NC}"
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""
  exit 0
else
  echo -e "${GREEN}✅ All validations passed - commit proceeding${NC}"
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""
  exit 0
fi
