#!/bin/bash
# scripts/naming/check-naming-compliance.sh
# Measures naming convention compliance across the codebase

set -e

echo "📊 Naming Compliance Report"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
total_violations=0

# Check 1: .frontmatter references (should use .metadata)
echo "1. Metadata Terminology"
echo "   -----------------------"
frontmatter_count=$(grep -r "\.frontmatter\." app/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$frontmatter_count" -eq 0 ]; then
  echo -e "   ${GREEN}✅ .frontmatter references: 0 (goal: 0)${NC}"
else
  echo -e "   ${RED}❌ .frontmatter references: $frontmatter_count (goal: 0)${NC}"
  echo "      Should use .metadata instead"
  total_violations=$((total_violations + frontmatter_count))
fi
echo ""

# Check 2: Components without Props interfaces
echo "2. Props Interfaces"
echo "   -----------------------"
# Count components with inline props (no named interface)
missing_props=$(grep -r "export function.*{$" app/components/ --include="*.tsx" 2>/dev/null | grep -v "Props" | wc -l | tr -d ' ')
total_components=$(find app/components -name "*.tsx" -type f | wc -l | tr -d ' ')
props_percentage=$((100 - (missing_props * 100 / total_components)))

if [ "$missing_props" -eq 0 ]; then
  echo -e "   ${GREEN}✅ Components with Props: $props_percentage% (goal: 100%)${NC}"
else
  echo -e "   ${YELLOW}⚠️  Components without Props: $missing_props/$total_components (${props_percentage}% compliance)${NC}"
  echo "      Run: grep -r 'export function.*{$' app/components/ | grep -v Props"
  total_violations=$((total_violations + missing_props))
fi
echo ""

# Check 3: Ambiguous boolean props
echo "3. Boolean Prop Names"
echo "   -----------------------"
ambiguous_bools=$(grep -r "loading:\|disabled:\|visible:\|hidden:\|enabled:" app/components/ --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$ambiguous_bools" -eq 0 ]; then
  echo -e "   ${GREEN}✅ Ambiguous boolean props: 0 (goal: 0)${NC}"
else
  echo -e "   ${RED}❌ Ambiguous boolean props: $ambiguous_bools (goal: 0)${NC}"
  echo "      Should use is/has/can prefixes"
  total_violations=$((total_violations + ambiguous_bools))
fi
echo ""

# Check 4: Duplicate type definitions
echo "4. Type Consolidation"
echo "   -----------------------"
echo "   Checking for duplicate types..."
# Check for IconProps, BadgeProps duplicates
icon_props_count=$(grep -r "interface IconProps" app/ types/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
badge_props_count=$(grep -r "interface BadgeProps" app/ types/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')

duplicate_types=0
if [ "$icon_props_count" -gt 1 ]; then
  echo -e "   ${RED}❌ Duplicate IconProps definitions: $icon_props_count (should be 1 in types/centralized.ts)${NC}"
  duplicate_types=$((duplicate_types + icon_props_count - 1))
fi
if [ "$badge_props_count" -gt 1 ]; then
  echo -e "   ${RED}❌ Duplicate BadgeProps definitions: $badge_props_count (should be 1 in types/centralized.ts)${NC}"
  duplicate_types=$((duplicate_types + badge_props_count - 1))
fi

if [ "$duplicate_types" -eq 0 ]; then
  echo -e "   ${GREEN}✅ No duplicate type definitions found${NC}"
else
  total_violations=$((total_violations + duplicate_types))
fi
echo ""

# Check 5: File naming conventions
echo "5. File Naming"
echo "   -----------------------"
# Check for non-PascalCase component files
non_pascal=$(find app/components -name "*.tsx" -type f | while read file; do
  basename=$(basename "$file" .tsx)
  if [[ ! $basename =~ ^[A-Z][a-zA-Z0-9]*$ ]] && [[ $basename != "index" ]]; then
    echo "$file"
  fi
done | wc -l | tr -d ' ')

if [ "$non_pascal" -eq 0 ]; then
  echo -e "   ${GREEN}✅ All component files use PascalCase${NC}"
else
  echo -e "   ${YELLOW}⚠️  Non-PascalCase component files: $non_pascal${NC}"
  total_violations=$((total_violations + non_pascal))
fi
echo ""

# Summary
echo "=============================="
echo "📋 Summary"
echo "=============================="
echo ""
echo "Total Issues: $total_violations"
echo ""

if [ "$total_violations" -eq 0 ]; then
  echo -e "${GREEN}🎉 Excellent! All naming conventions met!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Naming improvements needed${NC}"
  echo ""
  echo "Priority Actions:"
  
  if [ "$frontmatter_count" -gt 0 ]; then
    echo "  1. Fix .frontmatter → .metadata references"
    echo "     Command: grep -r '\\.frontmatter\\.' app/"
  fi
  
  if [ "$ambiguous_bools" -gt 0 ]; then
    echo "  2. Standardize boolean props (loading → isLoading)"
    echo "     Command: ./scripts/naming/refactor-boolean-props.sh"
  fi
  
  if [ "$missing_props" -gt 10 ]; then
    echo "  3. Add Props interfaces to components"
    echo "     See: docs/reference/NAMING_IMPROVEMENTS_PLAN.md"
  fi
  
  echo ""
  echo "Documentation: docs/08-development/NAMING_CONVENTIONS.md"
  exit 1
fi
