#!/bin/bash

# Semantic Class Audit Script
# Identifies components that may be missing semantic root classes
# November 27, 2025

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"
COMPONENTS_DIR="$ROOT_DIR/app/components"

echo "============================================"
echo "🔍 SEMANTIC CLASS AUDIT"
echo "============================================"
echo ""
echo "Purpose: Identify components needing semantic root classes"
echo "Policy: docs/SEMANTIC_CLASS_POLICY.md"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
total_components=0
compliant_components=0
partial_components=0
non_compliant_components=0

# Arrays to store results
declare -a compliant_list
declare -a partial_list
declare -a non_compliant_list

echo "📁 Scanning: $COMPONENTS_DIR"
echo ""

# Known semantic classes from responsive.css
known_classes=(
  "nav-logo"
  "footer-logo"
  "breadcrumb-item"
  "breadcrumb-padding"
  "date-panel"
  "caption"
  "caption-before"
  "caption-after"
  "seo-caption"
  "card-container"
  "card-height-default"
  "card-height-featured"
  "card-padding"
  "article-grid"
  "cta"
  "cta-text"
  "cta-icon"
  "cta-height"
  "heatmap"
  "heatmap-main"
  "heatmap-sidebar"
  "parameter-relationships"
  "regulatory-standards"
  "icon-sm"
  "icon-md"
)

# Function to check if component has semantic class
check_component() {
  local file="$1"
  local component_name=$(basename "$(dirname "$file")")
  local file_name=$(basename "$file" .tsx)
  
  # Skip index files and test files
  if [[ "$file_name" == "index" ]] || [[ "$file_name" == *".test" ]]; then
    return
  fi
  
  total_components=$((total_components + 1))
  
  # Search for className declarations
  local class_matches=$(grep -o 'className[={}]*[\"'\''`][^\"'\''`]*[\"'\''`]' "$file" | head -5 || true)
  
  # Check if any known semantic class is present
  local has_semantic=false
  local found_classes=()
  
  for class in "${known_classes[@]}"; do
    if echo "$class_matches" | grep -q "$class"; then
      has_semantic=true
      found_classes+=("$class")
    fi
  done
  
  # Categorize component
  if [ "$has_semantic" = true ]; then
    if [ ${#found_classes[@]} -ge 2 ]; then
      compliant_components=$((compliant_components + 1))
      compliant_list+=("$component_name/$file_name (${found_classes[*]})")
    else
      partial_components=$((partial_components + 1))
      partial_list+=("$component_name/$file_name (${found_classes[*]})")
    fi
  else
    non_compliant_components=$((non_compliant_components + 1))
    non_compliant_list+=("$component_name/$file_name")
  fi
}

# Scan all component files
while IFS= read -r -d '' file; do
  check_component "$file"
done < <(find "$COMPONENTS_DIR" -name "*.tsx" -type f -print0)

# Report Results
echo "============================================"
echo "📊 AUDIT RESULTS"
echo "============================================"
echo ""
echo "Total Components Scanned: $total_components"
echo ""
echo -e "${GREEN}✅ Fully Compliant:${NC} $compliant_components (${#compliant_list[@]} components)"
echo -e "${YELLOW}⚠️  Partially Compliant:${NC} $partial_components (${#partial_list[@]} components)"
echo -e "${RED}❌ Non-Compliant:${NC} $non_compliant_components (${#non_compliant_list[@]} components)"
echo ""

# Calculate percentage
if [ $total_components -gt 0 ]; then
  compliance_rate=$((100 * compliant_components / total_components))
  echo "Compliance Rate: ${compliance_rate}%"
else
  echo "Compliance Rate: N/A"
fi

echo ""
echo "============================================"

# Show detailed results
if [ ${#compliant_list[@]} -gt 0 ]; then
  echo ""
  echo -e "${GREEN}✅ FULLY COMPLIANT COMPONENTS:${NC}"
  echo "These components have multiple semantic classes"
  echo ""
  for item in "${compliant_list[@]}"; do
    echo "  ✓ $item"
  done
fi

if [ ${#partial_list[@]} -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}⚠️  PARTIALLY COMPLIANT COMPONENTS:${NC}"
  echo "These components have some semantic classes but may need root class"
  echo ""
  for item in "${partial_list[@]}"; do
    echo "  ~ $item"
  done
fi

if [ ${#non_compliant_list[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ NON-COMPLIANT COMPONENTS:${NC}"
  echo "These components need semantic root classes added"
  echo ""
  for item in "${non_compliant_list[@]}"; do
    echo "  ✗ $item"
  done
fi

echo ""
echo "============================================"
echo "📝 NEXT STEPS"
echo "============================================"
echo ""
echo "1. Review non-compliant components"
echo "2. Add semantic root class (format: component-name)"
echo "3. Update responsive.css with component section"
echo "4. Update docs/SEMANTIC_CLASS_POLICY.md"
echo "5. Run audit again to verify"
echo ""
echo "See: docs/SEMANTIC_CLASS_POLICY.md for guidelines"
echo ""

# Exit with status based on compliance
if [ $non_compliant_components -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warning: ${non_compliant_components} components need attention${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All components are compliant!${NC}"
  exit 0
fi
