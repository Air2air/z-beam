#!/bin/bash
# scripts/validate-jsonld-urls.sh
# Validate JSON-LD URLs match canonical format

set -e

URL="${1:-https://z-beam.com/metal/non-ferrous/aluminum-laser-cleaning}"

echo "========================================="
echo "JSON-LD URL Validation"
echo "========================================="
echo "Checking: $URL"
echo ""

# Fetch page
PAGE=$(curl -s "$URL")

# Extract all URLs from JSON-LD
echo "Extracting URLs from JSON-LD schemas..."
URLS=$(echo "$PAGE" | grep -o '"url":"[^"]*"' | sed 's/"url":"//g' | sed 's/"//g' | grep "^https://" | sort -u)

if [ -z "$URLS" ]; then
  echo "❌ ERROR: No URLs found in JSON-LD"
  exit 1
fi

echo "Found URLs:"
echo "$URLS"
echo ""

# Check for non-canonical URLs (z-beam.com without www, excluding emails)
NON_WWW=$(echo "$URLS" | grep "://z-beam\.com" | grep -v "www.z-beam.com" | grep -v "@" || true)

if [ ! -z "$NON_WWW" ]; then
  echo "⚠️  WARNING: Non-canonical URLs found (missing www):"
  echo "$NON_WWW"
  echo ""
  echo "Expected format: https://www.z-beam.com"
  exit 1
fi

# Check for http:// URLs (should all be https://)
HTTP_URLS=$(echo "$URLS" | grep "^http://" || true)

if [ ! -z "$HTTP_URLS" ]; then
  echo "⚠️  WARNING: Non-secure HTTP URLs found:"
  echo "$HTTP_URLS"
  echo ""
  echo "All URLs should use HTTPS"
  exit 1
fi

# Success
echo "✅ All JSON-LD URLs are canonical:"
echo "   - Using HTTPS"
echo "   - Using www.z-beam.com format"
echo ""
echo "Total URLs validated: $(echo "$URLS" | wc -l | tr -d ' ')"
exit 0
