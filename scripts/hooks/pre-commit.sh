#!/bin/bash

# Pre-commit hook to validate sitemap
# Install: ln -sf ../../scripts/hooks/pre-commit.sh .git/hooks/pre-commit

echo "🔍 Validating sitemap..."

# Check if sitemap route handler exists
if [ ! -f "app/sitemap.xml/route.ts" ]; then
    echo "❌ ERROR: app/sitemap.xml/route.ts not found"
    exit 1
fi

# Check for dynamic frontmatter reading
if ! grep -q "fs.readdirSync" app/sitemap.xml/route.ts; then
    echo "❌ ERROR: Sitemap is not dynamically reading frontmatter files"
    echo "   Sitemap must use fs.readdirSync to include all article pages"
    exit 1
fi

# Check for article routes
if ! grep -q "getSitemapEntries" app/sitemap.xml/route.ts; then
    echo "❌ ERROR: Sitemap missing articleRoutes generation"
    exit 1
fi

# Count frontmatter files
FRONTMATTER_COUNT=$(find frontmatter/materials -name "*.yaml" | wc -l | tr -d ' ')
echo "✓ Found $FRONTMATTER_COUNT article files in frontmatter directory"

# Run sitemap tests if they exist
if [ -f "tests/sitemap/sitemap.test.ts" ]; then
    echo "🧪 Running sitemap tests..."
    npm test -- tests/sitemap/sitemap.test.ts --silent
    if [ $? -ne 0 ]; then
        echo "❌ Sitemap tests failed"
        exit 1
    fi
    echo "✓ Sitemap tests passed"
fi

echo "✅ Sitemap validation complete - $FRONTMATTER_COUNT articles will be included"
exit 0
