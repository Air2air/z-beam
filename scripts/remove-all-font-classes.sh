#!/bin/bash

# Batch Font Class Removal Script
# This script removes ALL inline font weight classes from components

echo "🧹 Starting batch font class removal..."

# Define the workspace root
WORKSPACE="/Users/todddunning/Desktop/Z-Beam/z-beam-test-push/app/components"

# Function to remove font classes while preserving other classes
remove_font_classes() {
    local file=$1
    echo "Processing: $file"
    
    # Remove font-bold
    sed -i '' 's/font-bold //g' "$file"
    sed -i '' 's/ font-bold//g' "$file"
    
    # Remove font-semibold
    sed -i '' 's/font-semibold //g' "$file"
    sed -i '' 's/ font-semibold//g' "$file"
    
    # Remove font-medium
    sed -i '' 's/font-medium //g' "$file"
    sed -i '' 's/ font-medium//g' "$file"
    
    # Remove font-light
    sed -i '' 's/font-light //g' "$file"
    sed -i '' 's/ font-light//g' "$file"
    
    # Remove font-extralight
    sed -i '' 's/font-extralight //g' "$file"
    sed -i '' 's/ font-extralight//g' "$file"
    
    # Remove font-thin
    sed -i '' 's/font-thin //g' "$file"
    sed -i '' 's/ font-thin//g' "$file"
    
    # Remove font-normal
    sed -i '' 's/font-normal //g' "$file"
    sed -i '' 's/ font-normal//g' "$file"
    
    # Remove font-extrabold
    sed -i '' 's/font-extrabold //g' "$file"
    sed -i '' 's/ font-extrabold//g' "$file"
    
    # Remove font-black
    sed -i '' 's/font-black //g' "$file"
    sed -i '' 's/ font-black//g' "$file"
}

# Find all .tsx and .jsx files and process them
find "$WORKSPACE" -type f \( -name "*.tsx" -o -name "*.jsx" \) | while read -r file; do
    if grep -q "font-\(bold\|semibold\|medium\|light\|extralight\|thin\|normal\|extrabold\|black\)" "$file"; then
        remove_font_classes "$file"
    fi
done

echo "✅ Font class removal complete!"
echo "Run this to verify:"
echo "grep -r 'font-\(bold\|semibold\|medium\)' $WORKSPACE --include='*.tsx' --include='*.jsx' | wc -l"
