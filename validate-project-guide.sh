#!/bin/bash

# Documentation Self-Audit Script
# Validates PROJECT_GUIDE.md follows its own anti-bloat and consistency rules

# Check for quiet mode
QUIET_MODE=false
if [ "$1" = "--quiet" ]; then
    QUIET_MODE=true
fi

if [ "$QUIET_MODE" = false ]; then
    echo "🔍 DOCUMENTATION SELF-AUDIT"
    echo "=========================="
fi

PROJECT_GUIDE="PROJECT_GUIDE.md"

if [ ! -f "$PROJECT_GUIDE" ]; then
    if [ "$QUIET_MODE" = false ]; then
        echo "❌ PROJECT_GUIDE.md not found!"
    fi
    exit 1
fi

# 1. Line Count Check (Target: <400 lines)
LINE_COUNT=$(wc -l < "$PROJECT_GUIDE")
if [ "$QUIET_MODE" = false ]; then
    echo "📏 Line count: $LINE_COUNT"
fi
if [ "$LINE_COUNT" -gt 400 ]; then
    if [ "$QUIET_MODE" = false ]; then
        echo "❌ BLOAT DETECTED: Document exceeds 400 lines (current: $LINE_COUNT)"
        echo "   ACTION REQUIRED: Consolidate and reduce content"
    fi
    exit 1
else
    if [ "$QUIET_MODE" = false ]; then
        echo "✅ Line count within target (<400)"
    fi
fi

# 2. Duplication Detection
if [ "$QUIET_MODE" = false ]; then
    echo
    echo "🔍 DUPLICATION ANALYSIS:"
fi

# Count RULE occurrences (should be <10)
RULE_COUNT=$(grep -c "RULE:" "$PROJECT_GUIDE")
if [ "$QUIET_MODE" = false ]; then
    echo "   RULE statements: $RULE_COUNT"
fi
if [ "$RULE_COUNT" -gt 10 ]; then
    if [ "$QUIET_MODE" = false ]; then
        echo "   ⚠️  Too many RULE statements - consider consolidation"
    fi
fi

# Count MUST occurrences (should be <20)  
MUST_COUNT=$(grep -c "MUST" "$PROJECT_GUIDE")
if [ "$QUIET_MODE" = false ]; then
    echo "   MUST statements: $MUST_COUNT"
fi
if [ "$MUST_COUNT" -gt 20 ]; then
    if [ "$QUIET_MODE" = false ]; then
        echo "   ⚠️  Too many MUST statements - consider consolidation"
    fi
fi

# Count code blocks (should be <15)
CODE_BLOCK_COUNT=$(grep -c "\`\`\`" "$PROJECT_GUIDE")
if [ "$QUIET_MODE" = false ]; then
    echo "   Code blocks: $CODE_BLOCK_COUNT"
fi
if [ "$CODE_BLOCK_COUNT" -gt 15 ]; then
    if [ "$QUIET_MODE" = false ]; then
        echo "   ⚠️  Too many code examples - consider consolidation"
    fi
fi

# 3. Section Structure Validation
if [ "$QUIET_MODE" = false ]; then
    echo
    echo "📋 SECTION STRUCTURE:"
    echo "   Required sections:"
    grep -n "^## [0-9]" "$PROJECT_GUIDE" | while read -r line; do
        echo "   ✅ $line"
    done
fi

# 4. Cross-Reference Validation
if [ "$QUIET_MODE" = false ]; then
    echo
    echo "🔗 CROSS-REFERENCE CHECK:"
fi
# Find internal references and validate they exist
INTERNAL_REFS=$(grep -o '\[.*\](#[^)]*)' "$PROJECT_GUIDE" | grep -o '#[^)]*' | sort -u)
for ref in $INTERNAL_REFS; do
    # Convert anchor to header format
    HEADER=$(echo "$ref" | sed 's/#//; s/-/ /g' | tr '[:upper:]' '[:lower:]')
    if grep -qi "^##.*$HEADER" "$PROJECT_GUIDE"; then
        echo "   ✅ Reference $ref found"
    else
        echo "   ❌ Broken reference: $ref"
    fi
done

# 5. Anti-Pattern Detection
echo
echo "🚫 ANTI-PATTERN DETECTION:"

# Check for contradictory statements
if grep -q "see.*\.md" "$PROJECT_GUIDE"; then
    echo "   ❌ References to other .md files found - violates single source principle"
    grep -n "see.*\.md" "$PROJECT_GUIDE"
else
    echo "   ✅ No external documentation references"
fi

# Check for hardcoded component lists
if grep -q "Current.*Components:" "$PROJECT_GUIDE"; then
    echo "   ⚠️  Static component lists found - should be dynamic"
    echo "   RECOMMENDATION: Replace with 'find app/components' commands"
fi

# 6. Redundant Content Detection
echo
echo "🔄 REDUNDANCY CHECK:"

# Find potentially duplicate explanations
COMMON_PHRASES=("zero tolerance" "component duplication" "single source" "enforcement")
for phrase in "${COMMON_PHRASES[@]}"; do
    COUNT=$(grep -ci "$phrase" "$PROJECT_GUIDE")
    if [ "$COUNT" -gt 3 ]; then
        echo "   ⚠️  '$phrase' mentioned $COUNT times - check for redundancy"
    fi
done

# 7. Overall Health Score
echo
echo "📊 OVERALL HEALTH SCORE:"
ISSUES=0

[ "$LINE_COUNT" -gt 350 ] && ((ISSUES++))
[ "$RULE_COUNT" -gt 10 ] && ((ISSUES++))
[ "$MUST_COUNT" -gt 20 ] && ((ISSUES++))
[ "$CODE_BLOCK_COUNT" -gt 15 ] && ((ISSUES++))

if [ "$ISSUES" -eq 0 ]; then
    echo "✅ EXCELLENT: No bloat or structural issues detected"
elif [ "$ISSUES" -le 2 ]; then
    echo "⚠️  GOOD: Minor issues detected - consider optimization"
else
    echo "❌ NEEDS WORK: Multiple issues detected - immediate consolidation required"
fi

echo
echo "🎯 NEXT ACTIONS:"
echo "1. Run this script after any PROJECT_GUIDE.md changes"
echo "2. Address any ❌ issues immediately"
echo "3. Consider optimizing ⚠️  warnings when convenient"
echo "4. Keep line count below 350 at all costs"

echo
echo "=========================="
echo "Self-audit complete!"
