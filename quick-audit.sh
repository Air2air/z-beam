#!/bin/bash

# Quick Component Duplication Check
# Run this before starting any development task

echo "🚨 QUICK COMPONENT DUPLICATION CHECK"
echo "===================================="

# Function to check and warn
check_pattern() {
    local pattern="$1"
    local description="$2"
    local threshold="$3"
    local count=$(grep -r "$pattern" app/ 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count" -gt "$threshold" ]; then
        echo "⚠️  $description: $count instances (threshold: $threshold)"
        grep -r "$pattern" app/ | head -5
        echo ""
    fi
}

echo ""
echo "📋 CRITICAL PATTERNS TO WATCH:"

# Critical badge/tag duplications (should be 1)
check_pattern "px-.*py-.*rounded-full.*bg-" "Badge/Tag patterns" 1

# Button duplications (should be minimal)
check_pattern "px-.*py-.*bg-blue.*hover:" "Button patterns" 2

# Card duplications (should be minimal)  
check_pattern "bg-white.*rounded.*shadow" "Card patterns" 2

# Input duplications (should be minimal)
check_pattern "w-full.*border.*rounded" "Input patterns" 1

echo ""
echo "📊 QUICK STATS:"
echo "- Total bg/text patterns: $(grep -r 'bg-.*text-' app/ 2>/dev/null | wc -l | tr -d ' ')"
echo "- Total badge patterns: $(grep -r 'rounded-full.*px-' app/ 2>/dev/null | wc -l | tr -d ' ')"
echo "- Total button patterns: $(grep -r 'px-.*bg-blue' app/ 2>/dev/null | wc -l | tr -d ' ')"

echo ""
if [ $(grep -r "px-.*py-.*rounded-full" app/ 2>/dev/null | wc -l | tr -d ' ') -gt 3 ]; then
    echo "🚨 ACTION REQUIRED: Multiple badge implementations detected!"
    echo "   → All badges should use SmartTagList component"
else
    echo "✅ Badge patterns look manageable"
fi

echo ""
echo "🔍 To see full audit: ./audit-components.sh"
echo "📋 Before coding: Review REQUIREMENTS.md section 2"
