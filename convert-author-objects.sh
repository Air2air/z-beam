#!/bin/bash
# Script to replace author_object sections with just author_id in frontmatter YAML files

echo "Starting author_object to author_id conversion..."

# Find all YAML files in frontmatter directory
find content/components/frontmatter -name "*.yaml" | while read file; do
    echo "Processing: $file"
    
    # Check if file has author_object
    if grep -q "author_object:" "$file"; then
        # Extract the ID from author_object
        author_id=$(grep -A 10 "author_object:" "$file" | grep "id:" | head -1 | sed 's/.*id: *//' | sed 's/ *$//')
        
        if [ ! -z "$author_id" ]; then
            echo "  Found author_id: $author_id"
            
            # Create a temporary file
            temp_file=$(mktemp)
            
            # Remove the entire author_object section and replace with author_id
            awk '
                /^author_object:/ {
                    in_author_object = 1
                    print "author_id: '"$author_id"'"
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
            echo "  ✓ Converted to author_id: $author_id"
        else
            echo "  ⚠ Could not extract author_id"
        fi
    fi
done

echo "Author conversion complete!"