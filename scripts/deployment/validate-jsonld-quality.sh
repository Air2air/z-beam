#!/bin/bash

#
# JSON-LD Quality Validation for Deployment
# 
# Runs comprehensive JSON-LD audit and validates quality thresholds
# before allowing deployment to proceed.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AUDIT_SCRIPT="$PROJECT_ROOT/scripts/audit-jsonld-comprehensive.js"

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Quality thresholds
MIN_SCHEMA_ORG_COMPLIANCE=80
MIN_EEAT_SCORE=50
MIN_TECHNICAL_SEO=60
MIN_OVERALL_GRADE=60

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  JSON-LD QUALITY VALIDATION${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${RED}✗ Dev server not running on localhost:3000${NC}"
    echo -e "${YELLOW}  Start dev server with: npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dev server is running${NC}"
echo ""

# Run the audit
echo -e "${BLUE}Running comprehensive JSON-LD audit...${NC}"
echo ""

# Capture audit output
AUDIT_OUTPUT=$(node "$AUDIT_SCRIPT" 2>&1)
AUDIT_EXIT_CODE=$?

if [ $AUDIT_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}✗ Audit script failed to run${NC}"
    echo "$AUDIT_OUTPUT"
    exit 1
fi

# Display the full audit output
echo "$AUDIT_OUTPUT"
echo ""

# Extract metrics from audit output
SCHEMA_ORG_COMPLIANCE=$(echo "$AUDIT_OUTPUT" | grep "Average Schema.org Compliance:" | grep -oE "[0-9]+%" | tr -d '%')
EEAT_SCORE=$(echo "$AUDIT_OUTPUT" | grep "Average E-E-A-T Score:" | grep -oE "[0-9]+%" | tr -d '%')
TECHNICAL_SEO=$(echo "$AUDIT_OUTPUT" | grep "Average Technical SEO:" | grep -oE "[0-9]+%" | tr -d '%')
OVERALL_GRADE=$(echo "$AUDIT_OUTPUT" | grep "OVERALL GRADE:" | grep -oE "[0-9]+%" | tr -d '%')

# Validate thresholds
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  QUALITY THRESHOLD VALIDATION${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

VALIDATION_PASSED=true

# Check Schema.org Compliance
if [ -n "$SCHEMA_ORG_COMPLIANCE" ]; then
    if [ "$SCHEMA_ORG_COMPLIANCE" -ge "$MIN_SCHEMA_ORG_COMPLIANCE" ]; then
        echo -e "${GREEN}✓ Schema.org Compliance: ${SCHEMA_ORG_COMPLIANCE}% (≥ ${MIN_SCHEMA_ORG_COMPLIANCE}%)${NC}"
    else
        echo -e "${RED}✗ Schema.org Compliance: ${SCHEMA_ORG_COMPLIANCE}% (< ${MIN_SCHEMA_ORG_COMPLIANCE}%)${NC}"
        VALIDATION_PASSED=false
    fi
else
    echo -e "${YELLOW}⚠ Schema.org Compliance: Unable to extract score${NC}"
fi

# Check E-E-A-T Score
if [ -n "$EEAT_SCORE" ]; then
    if [ "$EEAT_SCORE" -ge "$MIN_EEAT_SCORE" ]; then
        echo -e "${GREEN}✓ E-E-A-T Score: ${EEAT_SCORE}% (≥ ${MIN_EEAT_SCORE}%)${NC}"
    else
        echo -e "${RED}✗ E-E-A-T Score: ${EEAT_SCORE}% (< ${MIN_EEAT_SCORE}%)${NC}"
        VALIDATION_PASSED=false
    fi
else
    echo -e "${YELLOW}⚠ E-E-A-T Score: Unable to extract score${NC}"
fi

# Check Technical SEO
if [ -n "$TECHNICAL_SEO" ]; then
    if [ "$TECHNICAL_SEO" -ge "$MIN_TECHNICAL_SEO" ]; then
        echo -e "${GREEN}✓ Technical SEO: ${TECHNICAL_SEO}% (≥ ${MIN_TECHNICAL_SEO}%)${NC}"
    else
        echo -e "${RED}✗ Technical SEO: ${TECHNICAL_SEO}% (< ${MIN_TECHNICAL_SEO}%)${NC}"
        VALIDATION_PASSED=false
    fi
else
    echo -e "${YELLOW}⚠ Technical SEO: Unable to extract score${NC}"
fi

# Check Overall Grade
if [ -n "$OVERALL_GRADE" ]; then
    if [ "$OVERALL_GRADE" -ge "$MIN_OVERALL_GRADE" ]; then
        echo -e "${GREEN}✓ Overall Grade: ${OVERALL_GRADE}% (≥ ${MIN_OVERALL_GRADE}%)${NC}"
    else
        echo -e "${RED}✗ Overall Grade: ${OVERALL_GRADE}% (< ${MIN_OVERALL_GRADE}%)${NC}"
        VALIDATION_PASSED=false
    fi
else
    echo -e "${YELLOW}⚠ Overall Grade: Unable to extract score${NC}"
fi

echo ""

# Final result
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ JSON-LD QUALITY VALIDATION PASSED${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}All quality thresholds met. Safe to deploy.${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ JSON-LD QUALITY VALIDATION FAILED${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Quality thresholds not met. Review recommendations above.${NC}"
    echo -e "${YELLOW}To deploy anyway, fix the issues or adjust thresholds in:${NC}"
    echo -e "${YELLOW}  $0${NC}"
    exit 1
fi
