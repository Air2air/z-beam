# Category Page SEO & JSON-LD Audit
**Date:** November 5, 2025  
**Analysis:** Sitemap accuracy and category page rich data completeness

---

## Executive Summary

### Issues Found:
1. ❌ **Category pages have NO discoverable JSON-LD schemas** - JSON-LD is embedded in RSC payload, not rendered as `<script type="application/ld+json">` tags
2. ✅ **Sitemap is accurate** - All category and subcategory pages are properly indexed
3. ❌ **Category pages lack rich data entities** compared to material pages

---

## Sitemap Analysis

### Status: ✅ ACCURATE

The sitemap correctly includes:
- **Category pages** (priority 0.7): `/materials/{category}`
- **Subcategory pages** (priority 0.75): `/materials/{category}/{subcategory}`  
- **Material pages** (priority 0.8): `/materials/{category}/{subcategory}/{slug}`

**Example entries:**
```xml
<url>
  <loc>https://www.z-beam.com/materials/ceramic</loc>
  <lastmod>2025-11-05T02:55:21.516Z</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://www.z-beam.com/materials/ceramic/oxide</loc>
  <lastmod>2025-11-05T02:55:21.516Z</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.75</priority>
</url>
```

**Recommendation:** ✅ No changes needed

---

## Category Page JSON-LD Discovery

### Test: Ceramic Category Page
**URL:** https://www.z-beam.com/materials/ceramic

### Results:
- **`<script type="application/ld+json">` tags found:** 0
- **References to `schema.org`:** 21 (all in RSC payload, not in HTML `<head>`)

### Problem Analysis:

The category page source code (`app/materials/[category]/page.tsx`) includes this schema:

```typescript
const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': pageTitle,
  'description': categoryMetadata.description,
  'url': `${SITE_CONFIG.url}/materials/${category}`,
  'breadcrumb': { ... },
  'mainEntity': { ... }
};

return (
  <>
    <JsonLD data={collectionSchema} />
    ...
  </>
);
```

**However**, the `<JsonLD>` component renders JSON-LD into the React Server Components payload, NOT as a properly discoverable `<script>` tag in the HTML.

### Impact:
- ❌ **Google cannot discover the schema** - Search crawlers parse HTML, not RSC payloads
- ❌ **Rich Results Test fails** - No structured data found
- ❌ **Google Dataset Search misses category datasets** - No Dataset schema on category pages

---

## Material Pages vs Category Pages Comparison

### Material Pages (e.g., CFRP page)
**URL:** https://www.z-beam.com/materials/composite/fiber-reinforced/carbon-fiber-reinforced-polymer-laser-cleaning

✅ **Rich Data Entities Present:**
1. **Article** schema (with embedded FAQ in `mainEntity`)
2. **Dataset** schema (with 3 download formats: JSON, CSV, TXT)
3. **HowTo** schema (machine settings as steps)
4. **Product** schema (material specifications)
5. **BreadcrumbList** schema (navigation)
6. **VideoObject** schema (if video present)
7. **Person** schema (author credentials)

All schemas are properly rendered in HTML `<head>` as `<script type="application/ld+json">` tags.

---

### Category Pages (e.g., Ceramic page)
**URL:** https://www.z-beam.com/materials/ceramic

❌ **Rich Data Entities Present:**
- **CollectionPage** schema (NOT discoverable - in RSC payload only)
- No Dataset schema
- No Product schema
- No VideoObject schema
- No FAQ schema
- Breadcrumb is in CollectionPage but not as separate BreadcrumbList

**Missing Schemas:**
1. ❌ **No Dataset schema** for category-level data aggregation
2. ❌ **No CollectionPage rendered in HTML** (exists in code but not discoverable)
3. ❌ **No ItemList schema** for materials listing
4. ❌ **No BreadcrumbList** (separate from CollectionPage)
5. ❌ **No WebPage** schema for page metadata

---

## Root Cause: JsonLD Component Implementation

The `JsonLD` component (`app/components/JsonLD/JsonLD.tsx`) renders correctly:

```typescript
export function JsonLD({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data).replace(/\\\//g, '/');
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
```

**However**, Next.js App Router with React Server Components may not be placing this in the HTML `<head>` properly for category pages.

### Hypothesis:
The `<JsonLD>` component is rendered in the page body, but Next.js RSC is serializing it into the component tree payload instead of rendering it as a standalone `<script>` tag in the HTML source.

---

## Recommendations

### 1. Fix Category Page JSON-LD Rendering ⚠️ HIGH PRIORITY

**Option A: Use Next.js Metadata API** (Recommended)
Move JSON-LD generation to `generateMetadata()` and return it in the `other` property:

```typescript
export async function generateMetadata({ params }: { params: { category: string } }) {
  const collectionSchema = { ... };
  
  return {
    ...metadata,
    other: {
      'script:ld+json': JSON.stringify(collectionSchema)
    }
  };
}
```

**Option B: Use Head Component**
Import `head.tsx` and render JSON-LD there:

```typescript
// app/materials/[category]/head.tsx
export default function Head({ params }: { params: { category: string } }) {
  const collectionSchema = { ... };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </>
  );
}
```

**Option C: Use RootLayout Injection**
Pass schema data to layout and render in `<head>` section.

---

### 2. Add Missing Rich Data Schemas 📊 MEDIUM PRIORITY

#### A. Dataset Schema for Category Pages
Each category page should have a Dataset schema aggregating all materials:

```json
{
  "@type": "Dataset",
  "name": "Ceramic Laser Cleaning Materials Dataset",
  "description": "Comprehensive dataset of ceramic materials with laser cleaning parameters",
  "creator": {
    "@type": "Organization",
    "name": "Z-Beam"
  },
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://www.z-beam.com/data/datasets/ceramic.json"
    }
  ],
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "keywords": ["ceramic", "laser cleaning", "materials"],
  "variableMeasured": ["wavelength", "power", "fluence", "..."]
}
```

#### B. Separate BreadcrumbList Schema
Extract breadcrumb from CollectionPage into standalone schema:

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.z-beam.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Ceramic",
      "item": "https://www.z-beam.com/materials/ceramic"
    }
  ]
}
```

#### C. ItemList Schema for Materials
List all materials in the category:

```json
{
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning",
      "name": "Alumina Laser Cleaning"
    }
  ]
}
```

---

### 3. Validation Checklist

After implementing fixes:

- [ ] Test with Google Rich Results Test: https://search.google.com/test/rich-results
- [ ] Verify JSON-LD appears in HTML source (view-source:https://www.z-beam.com/materials/ceramic)
- [ ] Check Schema.org Validator: https://validator.schema.org/
- [ ] Submit updated sitemap to Google Search Console
- [ ] Monitor Search Console for "Enhancements" section updates
- [ ] Test Google Dataset Search discoverability: https://datasetsearch.research.google.com/

---

## Expected Impact After Fixes

### Before:
- ❌ Category pages: 0 discoverable schemas
- ❌ No rich results eligibility
- ❌ No dataset search visibility

### After:
- ✅ Category pages: 4+ discoverable schemas (CollectionPage, Dataset, BreadcrumbList, ItemList)
- ✅ Rich results eligibility for "Collection" type
- ✅ Dataset search visibility for category-level aggregations
- ✅ Enhanced breadcrumb navigation in SERPs
- ✅ Improved category page authority and E-E-A-T signals

---

## Technical Notes

### Current Architecture:
- **Framework:** Next.js 14.2.18 (App Router)
- **Rendering:** React Server Components
- **Schema Generation:** `JsonLD` component + `SchemaFactory` utility
- **Material Pages:** ✅ Working correctly (schemas render in HTML)
- **Category Pages:** ❌ Schemas trapped in RSC payload

### Why Material Pages Work:
Material pages use `MaterialJsonLD` component which may be rendered differently or in a different position in the component tree, allowing Next.js to properly serialize it into HTML.

### Why Category Pages Don't Work:
Category pages render `<JsonLD>` directly in the page component body, which Next.js RSC may be serializing into the component payload instead of the HTML `<head>`.

---

## Priority Action Items

1. **IMMEDIATE:** Fix category page JSON-LD rendering (choose Option A, B, or C above)
2. **THIS WEEK:** Add Dataset schema to category pages  
3. **THIS WEEK:** Add separate BreadcrumbList and ItemList schemas
4. **NEXT WEEK:** Test and validate all changes
5. **NEXT WEEK:** Deploy to production and monitor Search Console

---

## Files to Modify

1. **`app/materials/[category]/page.tsx`** - Fix JSON-LD rendering
2. **`app/materials/[category]/[subcategory]/page.tsx`** - Apply same fixes to subcategory pages
3. **`app/utils/jsonld-helper.ts`** - Add `createCategoryDatasetSchema()` helper
4. **`app/components/Dataset/CategoryDatasetCardWrapper.tsx`** - Already exists, may need schema integration

---

## Conclusion

**Sitemap:** ✅ Accurate and complete

**Category Page JSON-LD:** ❌ NOT discoverable by search engines
- Schemas exist in code but are trapped in RSC payload
- Need architectural fix to render in HTML `<head>`

**Rich Data Completeness:** ❌ Category pages significantly less comprehensive than material pages
- Missing: Dataset, separate BreadcrumbList, ItemList schemas
- Missing: Proper CollectionPage rendering

**Recommendation:** Implement JSON-LD rendering fix IMMEDIATELY, then add missing schemas for full parity with material pages.
