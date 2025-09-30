#!/bin/bash
# Script to replace author_object sections with simple author field in YAML files

echo "Starting author_object to simple author conversion..."

# Find all YAML files
find content/components -name "*.yaml" | while read file; do
    echo "Processing: $file"
    
    # Check if file has author_object
    if grep -q "author_object:" "$file"; then
        # Extract the name from author_object
        author_name=$(grep -A 10 "author_object:" "$file" | grep "name:" | head -1 | sed 's/.*name: *//' | sed 's/^ *//' | sed 's/ *$//')
        
        if [ ! -z "$author_name" ]; then
            echo "  Found author name: $author_name"
            
            # Create a temporary file
            temp_file=$(mktemp)
            
            # Remove the entire author_object section and replace with simple author
            awk -v author_name="$author_name" '
                /^author_object:/ {
                    in_author_object = 1
                    print "author: " author_name
                    next
                }
                in_author_object && /^[^ ]/ {
                    in_author_object = 0
                }
                in_author_object && /^  / {
                    next
                }
                !in_author_object {
                    print
                }
            ' "$file" > "$temp_file"
            
            # Replace original file
            mv "$temp_file" "$file"
            echo "  ✓ Converted to author: $author_name"
        else
            echo "  ⚠ Could not extract author name"
        fi
    fi
done

echo "Author conversion complete!"