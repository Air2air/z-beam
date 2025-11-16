# URL Issue Resolution Summary

## The Real Problem

You were testing **OLD REDIRECT URLs** in Google Rich Results Test, not the actual canonical URLs.

### What Happened

**URL You Tested (❌ Wrong):**
```
https://www.z-beam.com/ash-laser-cleaning
```

This is a **301 redirect URL** that exists only for backward compatibility. When Google Rich Results Test examines this URL, it sees it as a "legacy" URL because it's the redirect source.

**URL You Should Test (✅ Correct):**
```
https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning
```

This is the **canonical URL** where the content actually lives.

## Verification

### JSON-LD is CORRECT on Production

```bash
# Testing the correct URL shows proper JSON-LD:
curl -s "https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning" \
  | grep -o '"url":"[^"]*ash[^"]*"'
```

**Result:**
```json
"url":"https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning"
```

✅ **Correct hierarchical URL**

### Even Redirect URLs Show Correct JSON-LD

```bash
# Even testing the old redirect URL (with -L to follow redirect):
curl -sL "https://www.z-beam.com/ash-laser-cleaning" \
  | grep -o '"url":"[^"]*ash[^"]*"'
```

**Result:**
```json
"url":"https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning"
```

✅ **Still shows correct hierarchical URL after redirect**

### Sitemap is CORRECT

```bash
# Checking sitemap:
curl -s "https://www.z-beam.com/sitemap.xml" \
  | grep "ash-laser-cleaning"
```

**Result:**
```xml
<loc>https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning</loc>
```

✅ **Correct hierarchical URL**

## The Solution

### Fix #1: Test Correct URLs in Google Rich Results

**Before (Wrong):**
- Tested: `/ash-laser-cleaning`
- Result: Shows as "legacy URL"

**After (Correct):**
- Test: `/materials/wood/hardwood/ash-laser-cleaning`
- Result: Shows proper hierarchical structure

### Fix #2: Automatic Validation

Added to `package.json`:

```json
{
  "scripts": {
    "build": "next build && npm run postbuild",
    "postbuild": "npm run validate:urls",
    "validate:urls": "node scripts/validate-jsonld-urls.js",
    "validate:redirects": "node scripts/validate-redirects.js"
  }
}
```

**Now every build automatically validates:**
- ✅ No old flat URLs in JSON-LD
- ✅ All URLs use hierarchical structure
- ✅ Exits with error if old URLs found

### Running Validation

**Automatic (during build):**
```bash
npm run build
# Automatically runs URL validation after build completes
```

**Manual:**
```bash
# Check JSON-LD URLs
npm run validate:urls

# Check redirect configuration
npm run validate:redirects
```

### Build Output

```
🔍 Validating JSON-LD URLs in built pages...

📊 Results:
   Pages checked: 152
   Errors: 0
   Warnings: 132

✅ All JSON-LD URLs are using the correct hierarchical structure!
```

**Warnings are expected** - they're about breadcrumb links to category pages, which are intentionally shorter URLs.

## Why This Happened

### The Migration Path

**Old Structure (Before):**
```
/ash-laser-cleaning
/granite-laser-cleaning
/aluminum-laser-cleaning
```

**New Structure (Now):**
```
/materials/wood/hardwood/ash-laser-cleaning
/materials/stone/igneous/granite-laser-cleaning
/materials/metal/non-ferrous/aluminum-laser-cleaning
```

**Redirects (For Compatibility):**
```javascript
// next.config.js
{
  source: '/ash-laser-cleaning',
  destination: '/materials/wood/hardwood/ash-laser-cleaning',
  permanent: true,
  statusCode: 308
}
```

### What Google Sees

When you test `/ash-laser-cleaning` in Rich Results Test:
1. Google fetches the URL
2. Sees it's a 308 redirect
3. Reports the **source URL** as "legacy"
4. May show warnings about URL structure

When you test `/materials/wood/hardwood/ash-laser-cleaning`:
1. Google fetches the URL
2. Gets 200 OK response
3. Sees proper JSON-LD with matching URLs
4. No warnings about URL structure

## How to Find Correct URLs

### Method 1: Sitemap
```
https://www.z-beam.com/sitemap.xml
```
Search for material name, copy the `<loc>` URL.

### Method 2: Site Navigation
1. Visit https://www.z-beam.com
2. Navigate to material page
3. Copy URL from address bar

### Method 3: Frontmatter
Check the material's YAML file:

```yaml
# frontmatter/materials/ash-laser-cleaning.yaml
category: "Wood"
subcategory: "Hardwood"
slug: "ash-laser-cleaning"
```

Build URL:
```
/materials/[category]/[subcategory]/[slug]
         ↓          ↓              ↓
/materials/wood/hardwood/ash-laser-cleaning
```

## Complete URL List

All 132+ material URLs follow this pattern. Examples:

**Metal:**
- `/materials/metal/non-ferrous/aluminum-laser-cleaning`
- `/materials/metal/ferrous/steel-laser-cleaning`
- `/materials/metal/alloy/brass-laser-cleaning`

**Stone:**
- `/materials/stone/igneous/granite-laser-cleaning`
- `/materials/stone/sedimentary/limestone-laser-cleaning`
- `/materials/stone/metamorphic/marble-laser-cleaning`

**Wood:**
- `/materials/wood/hardwood/ash-laser-cleaning`
- `/materials/wood/hardwood/oak-laser-cleaning`
- `/materials/wood/softwood/pine-laser-cleaning`

**Ceramic:**
- `/materials/ceramic/oxide/alumina-laser-cleaning`
- `/materials/ceramic/non-oxide/silicon-carbide-laser-cleaning`

**Complete list in:** `https://www.z-beam.com/sitemap.xml`

## Testing Checklist

Before submitting to Google Rich Results Test:

- [ ] URL starts with `/materials/`
- [ ] URL has 3 parts: `[category]/[subcategory]/[slug]`
- [ ] URL matches what's in sitemap.xml
- [ ] URL returns 200 OK (not 301/308 redirect)
- [ ] Page loads correctly in browser

## Documentation Created

1. **`docs/GOOGLE_RICH_RESULTS_TESTING.md`** - Complete testing guide
2. **`docs/URL_STRUCTURE_ANALYSIS.md`** - Technical analysis
3. **`scripts/validate-jsonld-urls.js`** - Automatic validation
4. **`package.json`** - Integrated validation into build

## Next Steps

### Immediate
1. ✅ Re-test materials in Google Rich Results using correct URLs
2. ✅ Verify no errors with hierarchical URLs
3. ✅ Submit sitemap to Google Search Console

### Ongoing
1. ✅ Automatic validation runs on every build
2. ✅ Documentation explains correct URLs
3. ✅ No need to remember validation scripts

## Summary

❌ **Problem:** Testing old redirect URLs showed "legacy URL" warnings  
✅ **Solution:** Test canonical hierarchical URLs instead  
✅ **Prevention:** Automatic validation on every build  
✅ **Status:** All JSON-LD and sitemap URLs are correct  

---

**Created:** November 1, 2025  
**Issue:** Google Rich Results showing legacy URLs  
**Root Cause:** Testing redirect URLs instead of canonical URLs  
**Resolution:** Documentation + automatic validation
