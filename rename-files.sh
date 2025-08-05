#!/bin/bash

# Script to rename files in the public/images/Material directory
# Replaces underscores with dashes in filenames

# Navigate to the directory
cd "$(dirname "$0")"

# Find all files with underscores in their names in the Material directory
find public/images/Material -type f -name "*_*" | while read file; do
    # Get the directory and filename
    dir=$(dirname "$file")
    filename=$(basename "$file")
    
    # Replace underscores with dashes in the filename
    new_filename=${filename//_/-}
    
    # Create the new path
    new_file="$dir/$new_filename"
    
    # Rename the file
    echo "Renaming: $file -> $new_file"
    mv "$file" "$new_file"
done

echo "File renaming complete!"
