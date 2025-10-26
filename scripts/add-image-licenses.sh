#!/bin/bash

# Add Image License Metadata to All Material YAML Files
# This script adds default license metadata to hero and micro images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTMATTER_DIR="$SCRIPT_DIR/../content/frontmatter"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default license configuration
LICENSE_URL="https://creativecommons.org/licenses/by-nc-nd/4.0/"
ACQUIRE_LICENSE_PAGE="https://z-beam.com/image-licensing"
CREDIT_TEXT="Z-Beam"
COPYRIGHT_YEAR="2025"
CREATOR_TYPE="Organization"
CREATOR_NAME="Z-Beam"
CREATOR_URL="https://z-beam.com"

echo -e "${BLUE}=== Image License Metadata Bulk Update ===${NC}"
echo ""
echo "This script will add license metadata to all material YAML files"
echo ""
echo "Default configuration:"
echo "  License: $LICENSE_URL"
echo "  Acquire page: $ACQUIRE_LICENSE_PAGE"
echo "  Credit: $CREDIT_TEXT"
echo "  Copyright: © $COPYRIGHT_YEAR $CREDIT_TEXT"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Check if yq is installed
if ! command -v yq &> /dev/null; then
    echo -e "${YELLOW}Warning: 'yq' not found. Installing yq...${NC}"
    echo "Install yq with: brew install yq"
    echo ""
    echo "Alternative: Manually edit files using the template in docs/guides/IMAGE_LICENSE_METADATA.md"
    exit 1
fi

count=0
updated=0
skipped=0

# Find all YAML files in frontmatter directory
find "$FRONTMATTER_DIR" -name "*.yaml" -type f | while read -r file; do
    count=$((count + 1))
    
    # Check if file has images section
    if ! grep -q "^images:" "$file"; then
        echo -e "${YELLOW}Skipping (no images):${NC} $(basename "$file")"
        skipped=$((skipped + 1))
        continue
    fi
    
    # Check if already has license metadata
    if grep -q "license:" "$file"; then
        echo -e "${YELLOW}Skipping (has license):${NC} $(basename "$file")"
        skipped=$((skipped + 1))
        continue
    fi
    
    echo -e "${GREEN}Processing:${NC} $(basename "$file")"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Use yq to add license metadata to hero image
    yq eval -i "
      .images.hero.width = 1920 |
      .images.hero.height = 1080 |
      .images.hero.license = \"$LICENSE_URL\" |
      .images.hero.acquireLicensePage = \"$ACQUIRE_LICENSE_PAGE\" |
      .images.hero.creditText = \"Photo by \" + .author.name + \" for $CREDIT_TEXT\" |
      .images.hero.copyrightNotice = \"© $COPYRIGHT_YEAR $CREDIT_TEXT. All rights reserved.\"
    " "$file"
    
    # Add license metadata to micro image if it exists
    # Use caption.description as the creditText for micro images
    if grep -q "micro:" "$file"; then
        yq eval -i "
          .images.micro.width = 1200 |
          .images.micro.height = 800 |
          .images.micro.license = \"$LICENSE_URL\" |
          .images.micro.creditText = .caption.description |
          .images.micro.copyrightNotice = \"© $COPYRIGHT_YEAR $CREDIT_TEXT\"
        " "$file"
    fi
    
    updated=$((updated + 1))
done

echo ""
echo -e "${GREEN}=== Complete ===${NC}"
echo "Files processed: $count"
echo "Files updated: $updated"
echo "Files skipped: $skipped"
echo ""
echo "Backups created with .bak extension"
echo ""
echo "Next steps:"
echo "1. Review changes in a few files"
echo "2. Test with: npm run build"
echo "3. Validate with Google Rich Results Test"
echo "4. If satisfied, remove .bak files: find content/frontmatter -name '*.bak' -delete"
