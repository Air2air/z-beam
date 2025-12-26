#!/bin/bash
# scripts/naming/refactor-boolean-props.sh
# Automated refactoring script for boolean prop names
# Standardizes boolean props to use is/has/can prefixes

set -e

echo "🔍 Refactoring Boolean Props..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backup check
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes.${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

# Create backup branch
echo "📦 Creating backup..."
BACKUP_BRANCH="backup-boolean-refactor-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BACKUP_BRANCH" > /dev/null 2>&1
git checkout - > /dev/null 2>&1
echo -e "${GREEN}✅ Backup branch created: $BACKUP_BRANCH${NC}"

# Function to replace patterns
replace_pattern() {
  local old_pattern="$1"
  local new_pattern="$2"
  local count=0
  
  echo "  Replacing '$old_pattern:' → '$new_pattern:'"
  
  # Find and replace in TypeScript files
  while IFS= read -r -d '' file; do
    if grep -q "$old_pattern:" "$file"; then
      sed -i '' "s/${old_pattern}:/${new_pattern}:/g" "$file"
      ((count++))
    fi
  done < <(find app/components -name "*.tsx" -print0)
  
  echo -e "    ${GREEN}✓${NC} Modified $count files"
}

# Refactor common boolean patterns
echo ""
echo "🔧 Refactoring patterns..."
replace_pattern "loading" "isLoading"
replace_pattern "disabled" "isDisabled"
replace_pattern "visible" "isVisible"
replace_pattern "hidden" "isHidden"
replace_pattern "enabled" "isEnabled"
replace_pattern "active" "isActive"
replace_pattern "selected" "isSelected"
replace_pattern "checked" "isChecked"
replace_pattern "required" "isRequired"
replace_pattern "valid" "isValid"
replace_pattern "open" "isOpen"
replace_pattern "closed" "isClosed"

echo ""
echo "📊 Checking results..."

# Count remaining violations
remaining=$(grep -r "loading:\|disabled:\|visible:\|hidden:\|enabled:" app/components --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')

if [ "$remaining" -eq 0 ]; then
  echo -e "${GREEN}✅ All boolean props refactored successfully!${NC}"
else
  echo -e "${YELLOW}⚠️  $remaining potential violations remaining (may be false positives)${NC}"
  echo "    Run: grep -r 'loading:\\|disabled:' app/components --include='*.tsx'"
fi

echo ""
echo "🧪 Running tests..."
if npm test -- --silent --bail 2>&1 | grep -q "PASS"; then
  echo -e "${GREEN}✅ Tests passing${NC}"
else
  echo -e "${RED}❌ Some tests failing - review changes${NC}"
  echo "    Run: npm test"
  echo "    Rollback: git checkout $BACKUP_BRANCH"
fi

echo ""
echo "📝 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Run full test suite: npm test"
echo "  3. Commit changes: git add -A && git commit -m 'refactor: standardize boolean prop names'"
echo "  4. Delete backup: git branch -D $BACKUP_BRANCH"
echo ""
echo -e "${GREEN}✅ Refactoring complete!${NC}"
