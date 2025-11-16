# Google Rich Results Testing Guide

## ⚠️ CRITICAL: Test the Correct URLs!

### ❌ WRONG - Don't Test Old Flat URLs
```
https://www.z-beam.com/ash-laser-cleaning
https://www.z-beam.com/granite-laser-cleaning
https://www.z-beam.com/aluminum-laser-cleaning
```

These are **301 redirect URLs** that exist for backward compatibility. While they work and redirect correctly, Google Rich Results Test may show them as "legacy" because it's testing the redirect source, not the final destination.

### ✅ CORRECT - Test New Hierarchical URLs
```
https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning
https://www.z-beam.com/materials/stone/igneous/granite-laser-cleaning
https://www.z-beam.com/materials/metal/non-ferrous/aluminum-laser-cleaning
```

These are the **canonical URLs** that should be tested and indexed by Google.

## How to Find the Correct URL

### Method 1: Use the Sitemap
1. Visit: https://www.z-beam.com/sitemap.xml
2. Search for your material name
3. Copy the full `<loc>` URL
4. Use that URL in Rich Results Test

### Method 2: Navigate on Site
1. Go to: https://www.z-beam.com
2. Browse to the material page
3. Copy the URL from browser address bar
4. Use that URL in Rich Results Test

### Method 3: Check Frontmatter
If you know the category and subcategory:

```yaml
# frontmatter/materials/ash-laser-cleaning.yaml
category: "Wood"
subcategory: "Hardwood"
slug: "ash-laser-cleaning"
```

Build URL: `https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning`

## Running Google Rich Results Test

### Step 1: Get the URL
Choose a material page URL from sitemap or navigation.

### Step 2: Test the URL
1. Go to: https://search.google.com/test/rich-results
2. Paste the **NEW hierarchical URL** (not the old flat URL)
3. Click "Test URL"
4. Wait for results

### Step 3: Interpret Results

#### ✅ Success Indicators
- "Page is eligible for rich results"
- Article schema detected
- No errors or warnings

#### ⚠️ Common Warnings (Usually OK)
- "Missing recommended field" - e.g., image width/height
- "Value provided is not a valid URL" - Check for typos
- "The aggregateRating field is recommended" - Not applicable for technical articles

#### ❌ Critical Errors
- "Missing required field: author" - Should not happen (we have author)
- "Missing required field: datePublished" - Should not happen (we have dates)
- "Invalid value for @type" - Schema structure issue

## URL Structure Reference

### Pattern
```
/materials/[CATEGORY]/[SUBCATEGORY]/[SLUG]
```

### Categories
- `metal` - Metals (ferrous, non-ferrous, alloy, rare-earth)
- `stone` - Stone (igneous, sedimentary, metamorphic)
- `ceramic` - Ceramics (oxide, non-oxide)
- `wood` - Wood (hardwood, softwood)
- `composite` - Composites (fiber-reinforced, particle-board, structural)
- `glass` - Glass (borosilicate, soda-lime, specialty)
- `plastic` - Plastics (thermoplastic, thermoset)
- `masonry` - Masonry (brick, concrete, mortar)
- `semiconductor` - Semiconductors (silicon, compound)
- `rare-earth` - Rare Earth Elements

### Example URLs by Category

**Metal:**
- `/materials/metal/non-ferrous/aluminum-laser-cleaning`
- `/materials/metal/ferrous/steel-laser-cleaning`
- `/materials/metal/alloy/brass-laser-cleaning`

**Stone:**
- `/materials/stone/igneous/granite-laser-cleaning`
- `/materials/stone/sedimentary/limestone-laser-cleaning`
- `/materials/stone/metamorphic/marble-laser-cleaning`

**Ceramic:**
- `/materials/ceramic/oxide/alumina-laser-cleaning`
- `/materials/ceramic/non-oxide/silicon-carbide-laser-cleaning`

**Wood:**
- `/materials/wood/hardwood/ash-laser-cleaning`
- `/materials/wood/hardwood/oak-laser-cleaning`
- `/materials/wood/softwood/pine-laser-cleaning`

**Composite:**
- `/materials/composite/fiber-reinforced/carbon-fiber-laser-cleaning`
- `/materials/composite/fiber-reinforced/fiberglass-laser-cleaning`

## Validation Before Testing

### Automatic Validation (Runs on Build)
```bash
npm run build
# Automatically runs: npm run validate:urls
```

This checks all built pages for:
- ❌ Old flat URLs in JSON-LD
- ✅ Correct hierarchical URLs
- ✅ URL consistency across schemas

### Manual Validation
```bash
# Validate JSON-LD URLs
npm run validate:urls

# Validate redirects
npm run validate:redirects
```

### Check Specific Page
```bash
# Local build
curl -s http://localhost:3000/materials/wood/hardwood/ash-laser-cleaning \
  | grep -o '"url":"[^"]*"' \
  | sort | uniq

# Production
curl -s https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning \
  | grep -o '"url":"[^"]*"' \
  | sort | uniq
```

All URLs should use the hierarchical structure.

## Common Mistakes

### ❌ Mistake 1: Testing Redirect URL
**Problem:** Entered `/ash-laser-cleaning` in Rich Results Test  
**Result:** Shows "legacy URL" or redirect warning  
**Solution:** Use `/materials/wood/hardwood/ash-laser-cleaning`

### ❌ Mistake 2: Missing Category/Subcategory
**Problem:** Manually constructed URL without checking frontmatter  
**Result:** 404 error or wrong material  
**Solution:** Always verify category/subcategory from frontmatter or sitemap

### ❌ Mistake 3: Testing After Cache
**Problem:** Tested immediately after deployment  
**Result:** May see cached old version  
**Solution:** Wait 5 minutes or add `?nocache=1` to URL

### ❌ Mistake 4: HTTP vs HTTPS
**Problem:** Used `https://` instead of `https://`  
**Result:** Redirect or SSL error  
**Solution:** Always use `https://www.z-beam.com`

## Troubleshooting

### Issue: "Article schema not detected"

**Check 1: Correct URL?**
```bash
# Should return: "url":"https://www.z-beam.com/materials/..."
curl -s "YOUR_URL" | grep -o '"url":"[^"]*materials[^"]*"'
```

**Check 2: Page loads?**
```bash
# Should return: 200 OK
curl -I "YOUR_URL" | grep HTTP
```

**Check 3: JSON-LD present?**
```bash
# Should return JSON-LD script tags
curl -s "YOUR_URL" | grep 'application/ld+json'
```

### Issue: "URL mismatch"

This means the `@id` or `url` in JSON-LD doesn't match the page URL.

**Verify:**
```bash
# Extract all @id values
curl -s "YOUR_URL" | grep -o '"@id":"[^"]*"'

# Should show URLs like:
# "@id":"https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning#article"
# "@id":"https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning#product"
```

If you see flat URLs like `"@id":"https://www.z-beam.com/ash-laser-cleaning"`, the build is outdated. Run:

```bash
npm run build
vercel --prod
```

### Issue: "Missing required field"

Check which field is missing and verify frontmatter:

```yaml
# Required fields in frontmatter:
name: "Ash Laser Cleaning"              # For headline
description: "..."                      # For description
author:                                 # For author
  name: "Your Name"
  title: "Your Title"
datePublished: "2025-10-25"            # For datePublished
category: "Wood"                        # For URL
subcategory: "Hardwood"                # For URL
```

## Best Practices

### 1. Always Test Canonical URLs
Use the full hierarchical URL, not redirects.

### 2. Test After Each Deployment
After deploying changes, test 2-3 sample pages to ensure JSON-LD is correct.

### 3. Check Multiple Materials
Test materials from different categories to ensure consistency:
- 1 metal material
- 1 stone material  
- 1 wood material
- 1 composite material

### 4. Monitor Search Console
- Check "Coverage" report weekly
- Look for "Indexed, not submitted in sitemap"
- Fix any "Discovered - currently not indexed"

### 5. Resubmit Sitemap After Major Changes
If you add 10+ new materials or change URL structure:
1. Go to Google Search Console
2. Sitemaps → Add sitemap
3. Enter: `https://www.z-beam.com/sitemap.xml`
4. Submit

## Quick Reference

### Test This (✅ Correct)
```
https://www.z-beam.com/materials/[category]/[subcategory]/[slug]
```

### Don't Test This (❌ Wrong)
```
https://www.z-beam.com/[slug]
```

### Validation Commands
```bash
# Before deployment
npm run build              # Includes automatic URL validation

# Manual checks
npm run validate:urls      # Check JSON-LD URLs
npm run validate:redirects # Check redirect config
```

### When URLs Are Wrong

1. Check page component passes full slug:
   ```tsx
   <MaterialJsonLD slug={`materials/${category}/${subcategory}/${slug}`} />
   ```

2. Rebuild and redeploy:
   ```bash
   npm run build
   vercel --prod
   ```

3. Clear cache and retest:
   ```
   https://www.z-beam.com/materials/wood/hardwood/ash-laser-cleaning?nocache=1
   ```

---

**Last Updated:** November 1, 2025  
**Next Review:** After next major deployment
