# JSON-LD URL Currency & Validation Guide

## Problem
JSON-LD schemas can contain outdated URLs if `SITE_CONFIG.url` is not kept current or if schemas are cached/generated incorrectly.

## Current Implementation

### 1. URL Source Configuration
**File:** `app/config/site.ts`

```typescript
export const SITE_CONFIG = {
  url: process.env.NODE_ENV === 'production' 
    ? 'https://www.z-beam.com'  // ✅ Canonical production URL
    : 'http://localhost:3000',
  // ...
}
```

### 2. Schema Generation (JSON-LD)
**File:** `app/utils/schemas/SchemaFactory.ts`

```typescript
constructor(data: any, slug: string, baseUrl?: string) {
  this.context = {
    slug,
    baseUrl: baseUrl || SITE_CONFIG.url,  // Uses config as default
    pageUrl: `${baseUrl || SITE_CONFIG.url}/${slug}`,
    currentDate: new Date().toISOString().split('T')[0]
  };
}
```

**Key Points:**
- All JSON-LD schemas use `context.baseUrl` or `context.pageUrl`
- Defaults to `SITE_CONFIG.url` if not explicitly provided
- Dynamic generation at runtime (not cached)

### 3. Microdata URL Handling

#### Card Component
**File:** `app/components/Card/Card.tsx`

```typescript
import { SITE_CONFIG } from "../../utils/constants";

// Create absolute URL for Schema.org
const absoluteUrl = href.startsWith('http') ? href : `${SITE_CONFIG.url}${href}`;

// In component:
<meta itemProp="url" content={absoluteUrl} />
<meta itemProp="image" content={
  frontmatter.images.hero.url.startsWith('http') 
    ? frontmatter.images.hero.url 
    : `${SITE_CONFIG.url}${frontmatter.images.hero.url}`
} />
```

#### Breadcrumbs Component
**File:** `app/components/Navigation/breadcrumbs.tsx`

```typescript
import { SITE_CONFIG } from "../../utils/constants";

// In component:
<meta itemProp="item" content={
  crumb.href.startsWith('http') ? crumb.href : `${SITE_CONFIG.url}${crumb.href}`
} />
<meta itemProp="position" content={String(index + 1)} />
```

**Components Fixed (2025-10-28):**
- ✅ Card component - `itemProp="url"` and `itemProp="image"` now use absolute URLs
- ✅ Breadcrumbs component - `itemProp="item"` now uses absolute URLs with position metadata

## Validation Checklist

### Before Each Deployment

1. **Verify SITE_CONFIG.url**
   ```bash
   grep -n "url: process.env.NODE_ENV" app/config/site.ts
   ```
   Should show: `'https://www.z-beam.com'` (with www)

2. **Check for Hardcoded URLs**
   ```bash
   # Search for hardcoded non-www URLs in schema files
   grep -r "https://z-beam.com" app/utils/schemas/ app/components/JsonLD/
   
   # Search for hardcoded z-beam.com in all TypeScript files
   grep -r "z-beam\.com" --include="*.ts" --include="*.tsx" app/ | grep -v "www.z-beam.com" | grep -v "email"
   ```

3. **Test Production Schema URLs**
   ```bash
   # Check Organization URL
   curl -s "https://z-beam.com/metal/non-ferrous/aluminum-laser-cleaning" | \
     grep -o '"@type":"Organization"[^}]*"url":"[^"]*"' | \
     grep -o '"url":"[^"]*"'
   
   # Check TechnicalArticle URL
   curl -s "https://z-beam.com/metal/non-ferrous/aluminum-laser-cleaning" | \
     grep -o '"@type":"TechnicalArticle"[^}]*"url":"[^"]*"' | \
     grep -o '"url":"[^"]*"'
   ```

4. **Validate All Schema URLs**
   ```bash
   # Extract all URLs from JSON-LD
   curl -s "https://z-beam.com/metal/non-ferrous/aluminum-laser-cleaning" | \
     grep -o '"url":"[^"]*"' | \
     sort -u
   ```
   All should use `https://www.z-beam.com` (with www)

## Automated Validation Script

Create: `scripts/validate-jsonld-urls.sh`

```bash
#!/bin/bash
# Validate JSON-LD URLs in production

URL="$1"
if [ -z "$URL" ]; then
  URL="https://z-beam.com/metal/non-ferrous/aluminum-laser-cleaning"
fi

echo "Checking JSON-LD URLs for: $URL"
echo "================================"

# Extract all URLs from page
URLS=$(curl -s "$URL" | grep -o '"url":"[^"]*"' | grep -o 'https://[^"]*' | sort -u)

# Check for non-canonical URLs
echo "All URLs found in JSON-LD:"
echo "$URLS"
echo ""

# Flag non-www URLs (except email domains)
NON_WWW=$(echo "$URLS" | grep "z-beam.com" | grep -v "www.z-beam.com" | grep -v "@")

if [ ! -z "$NON_WWW" ]; then
  echo "⚠️  WARNING: Non-canonical URLs found (missing www):"
  echo "$NON_WWW"
  exit 1
else
  echo "✅ All URLs use canonical www.z-beam.com format"
  exit 0
fi
```

## Common Issues & Solutions

### Issue 1: Cached Build with Old URLs
**Symptom:** Production shows old URLs despite config being correct  
**Solution:** Force clean rebuild
```bash
rm -rf .next && npm run build
vercel --prod --force
```

### Issue 2: Environment Variable Override
**Symptom:** URLs differ between local and production  
**Solution:** Check for `NEXT_PUBLIC_SITE_URL` env variable in Vercel
```bash
# In Vercel dashboard > Settings > Environment Variables
# Ensure NEXT_PUBLIC_SITE_URL is NOT set (we use SITE_CONFIG instead)
```

### Issue 3: Hardcoded URLs in Components
**Symptom:** Some schemas have correct URLs, others don't  
**Solution:** Search and replace hardcoded URLs
```bash
# Find hardcoded URLs
rg "https://z-beam\.com" app/ --type ts --type tsx

# Should only find in email addresses and test files
```

### Issue 4: Legacy JSON-LD Helpers
**Symptom:** Compatibility-only helper paths or stale imports can bypass the shared live JSON-LD path  
**Solution:** Keep the live component path on `SchemaFactory` plus the shared serializer, and leave `jsonld-helper.ts` as compatibility-only
```bash
# Check that the live component does not import the deprecated helper
rg "jsonld-helper" app/components/JsonLD

# Check the compatibility helper delegates back to the current authority
rg "new SchemaFactory\(articleData, slug\)\.generate\(\)" app/utils/jsonld-helper.ts
```

## Testing Commands

### 1. Quick URL Check
```bash
# Check a specific page
curl -s "https://z-beam.com/metal/non-ferrous/aluminum-laser-cleaning" | \
  grep -c "www.z-beam.com"
```

### 2. Full Schema Extraction
```bash
# Extract all JSON-LD scripts
curl -s "https://z-beam.com/metal/non-ferrous/aluminum-laser-cleaning" | \
  grep -o '<script type="application/ld+json">.*</script>' | \
  sed 's/<script[^>]*>//g' | sed 's/<\/script>//g' | \
  python3 -m json.tool > /tmp/schema.json

# Review extracted schema
cat /tmp/schema.json
```

### 3. Google Rich Results Test
```bash
# Test via Google's API (requires API key)
curl "https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run?url=https://z-beam.com/metal/non-ferrous/aluminum-laser-cleaning"
```

## Pre-Deployment Checklist

- [ ] `SITE_CONFIG.url` is `'https://www.z-beam.com'`
- [ ] No hardcoded `https://z-beam.com` (without www) in schema files
- [ ] Clean build performed (`rm -rf .next && npm run build`)
- [ ] Test page shows www URLs in JSON-LD: `curl -s "https://z-beam.com/..." | grep '"url"'`
- [ ] All schema generators use `context.baseUrl` or `context.pageUrl`
- [ ] No environment variables override SITE_CONFIG.url

## Monitoring

### Post-Deployment Validation
After each deployment, check 3-5 sample pages:

```bash
for page in \
  "" \
  "metal/non-ferrous/aluminum-laser-cleaning" \
  "ceramic/oxide/aluminum-oxide-laser-cleaning" \
  "about" \
  "services"
do
  echo "Checking: https://z-beam.com/$page"
  curl -s "https://z-beam.com/$page" | grep -o '"url":"[^"]*z-beam[^"]*"' | head -3
  echo "---"
done
```

### Expected Output
All URLs should show: `"url":"https://www.z-beam.com/..."`

## Related Files

- **Schema Generation:** `app/utils/schemas/SchemaFactory.ts`
- **Configuration:** `app/config/site.ts`
- **Compatibility Helper:** `app/utils/jsonld-helper.ts` (deprecated compatibility wrapper; live generation should not import it)
- **Components:** `app/components/JsonLD/JsonLD.tsx`

## Updates Log

- **2025-10-28:** Initial documentation created
- **Current Status:** All URLs using canonical www.z-beam.com format
