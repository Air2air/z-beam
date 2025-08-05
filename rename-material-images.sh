#!/bin/bash

# Navigate to the Material directory
cd "/Users/todddunning/Desktop/Z-Beam/z-beam-test-push/public/images/Material"

# Loop through all files with *_hero.jpg pattern
for file in *_hero.jpg; do
  # Extract the base name (remove _hero.jpg)
  base_name=${file%_hero.jpg}
  
  # Create the new filename with -laser-cleaning-hero.jpg
  new_name="${base_name}-laser-cleaning-hero.jpg"
  
  # Rename the file
  mv "$file" "$new_name"
  
  # Output what was done
  echo "Renamed: $file -> $new_name"
done

echo "Batch renaming complete!"
