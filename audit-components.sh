#!/bin/bash

# Global Component Duplication Audit Script
# This script implements the audit commands defined in REQUIREMENTS.md and .eslintrc-fallback-detection.js

echo "🔍 GLOBAL COMPONENT DUPLICATION AUDIT"
echo "====================================="
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo "📋 $1"
    echo "----------------------------------------"
}

# Function to count and display results
count_and_display() {
    local cmd="$1"
    local description="$2"
    local results=$(eval "$cmd")
    local count=$(echo "$results" | grep -c "app/" 2>/dev/null || echo "0")
    
    echo "Found $count instances of $description:"
    if [ $count -gt 0 ]; then
        echo "$results"
    else
        echo "✅ No duplications found for this pattern"
    fi
    echo ""
}

print_section "1. HARDCODED STYLE PATTERNS"

echo "🎯 Background and text color patterns:"
count_and_display "grep -r 'className.*bg-.*text-' app/ | head -30" "hardcoded bg/text patterns"

echo "🎯 Padding and rounded patterns:"
count_and_display "grep -r 'px-.*py-.*rounded' app/ | head -30" "hardcoded padding/rounded patterns"

echo "🎯 Hover and transition patterns:"
count_and_display "grep -r 'hover:.*transition' app/ | head -30" "hardcoded hover/transition patterns"

echo "🎯 Border and shadow patterns:"
count_and_display "grep -r 'border.*shadow' app/ | head -30" "hardcoded border/shadow patterns"

echo "🎯 Flex layout patterns:"
count_and_display "grep -r 'flex.*items-center' app/ | head -30" "hardcoded flex patterns"

print_section "2. SPECIFIC UI PATTERN DUPLICATIONS"

echo "🎯 Badge-like patterns:"
count_and_display "grep -r 'inline-block.*px-.*py-' app/" "badge-like patterns"

echo "🎯 Card-like patterns:"
count_and_display "grep -r 'bg-white.*rounded.*shadow' app/" "card-like patterns"

echo "🎯 Button-like patterns:"
count_and_display "grep -r 'px-4.*py-2.*bg-blue' app/" "button-like patterns"

echo "🎯 Input-like patterns:"
count_and_display "grep -r 'w-full.*border.*rounded' app/" "input-like patterns"

echo "🎯 Typography patterns:"
count_and_display "grep -r 'text-.*font-.*leading' app/" "typography patterns"

print_section "3. LOGIC DUPLICATION PATTERNS"

echo "🎯 List rendering patterns:"
count_and_display "grep -r 'map.*\(.*\) =>' app/ | head -20" "list rendering patterns"

echo "🎯 State management patterns:"
count_and_display "grep -r 'useState.*\[.*,' app/ | head -20" "useState patterns"

echo "🎯 Effect patterns:"
count_and_display "grep -r 'useEffect.*\[\]' app/ | head -20" "useEffect patterns"

print_section "4. EVENT HANDLER DUPLICATION"

echo "🎯 Click handlers:"
count_and_display "grep -r 'onClick.*\(.*\) =>' app/ | head -20" "onClick handlers"

echo "🎯 Submit handlers:"
count_and_display "grep -r 'onSubmit.*\(.*\) =>' app/ | head -20" "onSubmit handlers"

echo "🎯 Change handlers:"
count_and_display "grep -r 'onChange.*\(.*\) =>' app/ | head -20" "onChange handlers"

print_section "5. CRITICAL TAG/BADGE DUPLICATIONS"

echo "🚨 CRITICAL: Multiple badge implementations found:"
echo ""
echo "SmartTagList implementation:"
grep -n "inline-flex.*px-.*py-.*rounded-full" app/components/SmartTagList.tsx 2>/dev/null || echo "Not found"
echo ""
echo "TagList implementation:"
grep -n "inline-flex.*px-.*py-.*rounded-full" app/components/TagList.tsx 2>/dev/null || echo "Not found"
echo ""
echo "AuthorSearch hardcoded implementation:"
grep -n "px-.*py-.*bg-blue.*rounded-full" app/components/AuthorSearch.tsx 2>/dev/null || echo "Not found"
echo ""
echo "AuthorSearchResults hardcoded implementation:"
grep -n "bg-blue.*px-.*py-.*rounded-full" app/components/AuthorSearchResults.tsx 2>/dev/null || echo "Not found"
echo ""

print_section "6. SUMMARY AND RECOMMENDATIONS"

# Count total issues
total_bg_text=$(grep -r "className.*bg-.*text-" app/ | wc -l | tr -d ' ')
total_rounded=$(grep -r "px-.*py-.*rounded" app/ | wc -l | tr -d ' ')
total_badges=$(grep -r "px-.*py-.*rounded-full" app/ | wc -l | tr -d ' ')

echo "📊 AUDIT SUMMARY:"
echo "- Background/text patterns: $total_bg_text instances"
echo "- Padding/rounded patterns: $total_rounded instances" 
echo "- Badge/pill patterns: $total_badges instances"
echo ""

if [ $total_badges -gt 1 ]; then
    echo "🚨 CRITICAL: $total_badges badge implementations found - MUST consolidate to 1"
fi

if [ $total_bg_text -gt 5 ]; then
    echo "⚠️  WARNING: $total_bg_text hardcoded style patterns - consider componentizing"
fi

echo ""
echo "📋 IMMEDIATE ACTIONS REQUIRED:"
echo "1. Consolidate all badge/tag implementations to use SmartTagList"
echo "2. Extract hardcoded button patterns to Button component"
echo "3. Extract hardcoded card patterns to Card component"
echo "4. Create reusable Input component for form patterns"
echo "5. Standardize typography with Text/Heading components"
echo ""
echo "✅ Run this audit before every development task!"
echo "✅ Update REQUIREMENTS.md when new patterns are identified!"
