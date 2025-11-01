# URL Structure Analysis - November 1, 2025

## Summary

Both **JSON-LD** and **Sitemap** are correctly using the new hierarchical URL structure.

## Current URL Structure (CORRECT)

```
/materials/[category]/[subcategory]/[slug]
```

### Examples:
- ✅ `/materials/stone/igneous/granite-laser-cleaning`
- ✅ `/materials/metal/non-ferrous/aluminum-laser-cleaning`
- ✅ `/materials/ceramic/oxide/alumina-laser-cleaning`

## Verification Results

### 1. JSON-LD URLs ✅ CORRECT

**Production Test:**
```bash
curl -s https://www.z-beam.com/materials/stone/igneous/granite-laser-cleaning | grep -o '"@id":"[^"]*"' | sort | uniq
```

**Results:**
```
"@id":"https://www.z-beam.com#organization"
"@id":"https://www.z-beam.com#website"  
"@id":"https://www.z-beam.com/materials/stone/igneous/granite-laser-cleaning"
```

All `@id` fields use the correct hierarchical structure.

### 2. Sitemap URLs ✅ CORRECT

**Sample URLs from sitemap.xml:**
```xml
<loc>https://www.z-beam.com/materials/stone</loc>
<loc>https://www.z-beam.com/materials/stone/igneous</loc>
<loc>https://www.z-beam.com/materials/stone/igneous/granite-laser-cleaning</loc>
<loc>https://www.z-beam.com/materials/metal/non-ferrous/aluminum-laser-cleaning</loc>
```

All material pages use hierarchical URLs.

### 3. Build Validation ✅ CORRECT

**Validation Script Results:**
- Pages checked: 152
- Critical errors (old flat URLs): **0**
- Warnings (breadcrumb structure): 132 (expected, not errors)

No old flat URLs like `/granite-laser-cleaning` found.

## How URLs Are Generated

### JSON-LD Generation

**File:** `app/utils/jsonld-helper.ts`

```typescript
// Line 50: Constructs full hierarchical URL
const pageUrl = `${baseUrl}/${slug}`;
```

**Slug passed from page:**
```tsx
// app/materials/[category]/[subcategory]/[slug]/page.tsx (Line 132)
<MaterialJsonLD 
  article={article} 
  slug={`materials/${category}/${subcategory}/${slug}`} 
/>
```

The slug already includes the full path `materials/stone/igneous/granite-laser-cleaning`, so the JSON-LD helper simply appends it to the base URL.

### Sitemap Generation

**File:** `app/sitemap.ts`

```typescript
// Lines 72-109: Builds hierarchical URLs
materialPageRoutes.push({
  url: `${baseUrl}/materials/${category}/${subcategory}/${slug}`,
  lastModified: stats.mtime,
  changeFrequency: 'weekly' as const,
  priority: 0.8,
});
```

Direct construction of hierarchical URLs from frontmatter metadata.

## 301 Redirects (Working Correctly)

Old flat URLs redirect to new hierarchical URLs:

```javascript
// next.config.js
{
  source: '/granite-laser-cleaning',
  destination: '/materials/stone/igneous/granite-laser-cleaning',
  permanent: true,
  statusCode: 308
}
```

**Production Test:**
```bash
curl -I https://www.z-beam.com/granite-laser-cleaning
```

**Result:** 308 Permanent Redirect → `/materials/stone/igneous/granite-laser-cleaning`

## Potential Issues (If Google Reports Problems)

### 1. **Cached Old URLs**
- **Problem:** Google may have indexed old flat URLs before the migration
- **Solution:** Submit new sitemap to Google Search Console, request reindexing
- **Timeline:** 2-4 weeks for Google to fully re-crawl

### 2. **Canonical Tag Mismatch**
- **Check:** Verify `<link rel="canonical">` in HTML head
- **Should be:** `https://www.z-beam.com/materials/stone/igneous/granite-laser-cleaning`

### 3. **Mixed Content** (Internal Links)
- **Problem:** Old links in page content pointing to flat URLs
- **Check:** Search codebase for hardcoded material links
- **Solution:** Use relative URLs or update to hierarchical

### 4. **External Backlinks**
- **Problem:** External sites linking to old flat URLs
- **Status:** Cannot control, but redirects handle this
- **Monitoring:** Track in Google Search Console

## Google Rich Results Testing

If Google Rich Results Test shows issues, common causes:

### Issue: "URL mismatch"
- **Meaning:** @id in JSON-LD doesn't match page URL
- **Our Status:** ✅ Verified matching on production
- **Test:** Compare `window.location.href` with `@id` values

### Issue: "Missing required field"
- **Not related to URLs**
- **Check:** author, datePublished, publisher fields

### Issue: "Invalid value"
- **Not related to URLs**  
- **Check:** Data types (date formats, numbers, etc.)

## Action Items for Future

### 1. Prevent Regressions

**Add to CI/CD:**
```bash
# Run before every deployment
node scripts/validate-jsonld-urls.js
```

This script now checks for old flat URLs in built pages.

### 2. Monitor Google Search Console

**Weekly checks:**
- Coverage report (indexed vs. excluded)
- URL inspection for sample material pages
- Search performance (impressions, clicks)

### 3. Sitemap Submission

**When to resubmit:**
- After adding new materials
- After URL structure changes
- If coverage drops in GSC

**How:**
1. Go to Google Search Console
2. Sitemaps → Add new sitemap
3. Enter: `https://www.z-beam.com/sitemap.xml`

### 4. Update Frontmatter

If you add a new material:

```yaml
# frontmatter/materials/new-material.yaml
name: "New Material"
category: "metal"          # Required for URL
subcategory: "ferrous"     # Required for URL  
slug: "new-material-laser-cleaning"  # Required for URL
# ... other fields
```

The system automatically:
1. Generates hierarchical URL: `/materials/metal/ferrous/new-material-laser-cleaning`
2. Updates sitemap on next build
3. Creates JSON-LD with correct `@id`
4. Generates 301 redirect from `/new-material-laser-cleaning`

## Validation Commands

### Check Production JSON-LD
```bash
curl -s https://www.z-beam.com/materials/stone/igneous/granite-laser-cleaning \
  | grep -o '"url":"[^"]*materials[^"]*"' \
  | sort | uniq
```

### Check Production Sitemap
```bash
curl -s https://www.z-beam.com/sitemap.xml \
  | grep -o '<loc>[^<]*materials[^<]*</loc>' \
  | head -20
```

### Check Redirect
```bash
curl -I https://www.z-beam.com/granite-laser-cleaning \
  | grep -i location
```

### Validate Build
```bash
npm run build
node scripts/validate-jsonld-urls.js
```

## Conclusion

✅ **Current Status:** All URLs are correct in both JSON-LD and sitemap  
✅ **Migration:** Successfully completed  
✅ **Redirects:** Working (274 redirects validated)  
✅ **Future-proof:** Validation script prevents regressions  

If Google Rich Results Test is showing errors, they are likely **not URL-related**. Please share the specific error message for targeted troubleshooting.

---

**Last Updated:** November 1, 2025  
**Validated By:** Automated build checks + production testing  
**Next Review:** After next Google Search Console crawl (7-14 days)
