#!/bin/bash
# archive-cleanup.sh - Script to safely archive and organize older files

echo "==============================="
echo "Z-Beam Archive Cleanup Utility"
echo "==============================="
echo ""

# Setup directories
ARCHIVE_DIR="./archive"
YAML_ARCHIVE_DIR="$ARCHIVE_DIR/yaml-tools"
JS_ARCHIVE_DIR="$ARCHIVE_DIR/js-tools"
COMPONENT_ARCHIVE_DIR="$ARCHIVE_DIR/components"

# Create directories if they don't exist
mkdir -p "$YAML_ARCHIVE_DIR"
mkdir -p "$JS_ARCHIVE_DIR"
mkdir -p "$COMPONENT_ARCHIVE_DIR"

echo "Setting up archive directories..."

# Function to safely move files with confirmation
move_with_confirmation() {
    local source=$1
    local destination=$2
    
    if [ -f "$source" ]; then
        echo -n "Move $source to $destination? (y/n): "
        read -r response
        if [ "$response" = "y" ]; then
            mv "$source" "$destination"
            echo "✅ Moved $source to $destination"
        else
            echo "⏭️  Skipped $source"
        fi
    fi
}

# Archive YAML tools
echo ""
echo "==== YAML Tools Archiving ===="
move_with_confirmation "./archive/yaml_validator.py" "$YAML_ARCHIVE_DIR/"
move_with_confirmation "./archive/check_external_yaml_changes.py" "$YAML_ARCHIVE_DIR/"
move_with_confirmation "./archive/check_yaml_changes.py" "$YAML_ARCHIVE_DIR/"
move_with_confirmation "./archive/run_yaml_processor.py" "$YAML_ARCHIVE_DIR/"
move_with_confirmation "./archive/update_yaml_processor.py" "$YAML_ARCHIVE_DIR/"

# Archive JS tools
echo ""
echo "==== JavaScript Tools Archiving ===="
for file in ./archive/*.js; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        move_with_confirmation "$file" "$JS_ARCHIVE_DIR/$filename"
    fi
done

# Archive component backups
echo ""
echo "==== Component Backups Archiving ===="
for file in ./**/*.bak; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        directory=$(dirname "$file")
        component_name=$(basename "$directory")
        
        # Create specific component directory in archive
        mkdir -p "$COMPONENT_ARCHIVE_DIR/$component_name"
        
        move_with_confirmation "$file" "$COMPONENT_ARCHIVE_DIR/$component_name/$filename"
    fi
done

echo ""
echo "Archive cleanup complete!"
echo "All archived files are now organized in the following directories:"
echo "- YAML tools: $YAML_ARCHIVE_DIR"
echo "- JS tools: $JS_ARCHIVE_DIR"
echo "- Component backups: $COMPONENT_ARCHIVE_DIR"
