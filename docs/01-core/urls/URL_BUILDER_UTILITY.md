# URL Builder Utility - Single Source of Truth

**Created:** 2025-11-01  
**Status:** Implemented  
**Related Issues:** Google Rich Results showing flat URLs in microdata

## Problem Statement

URL structures were hardcoded throughout the application:
- CardGridSSR: `/${slug}`
- Sitemap: `` `${baseUrl}/materials/${category}/${subcategory}/${slug}` ``
- JSON-LD: Passed full path to SchemaFactory
- Breadcrumbs: `/materials/${category}/${subcategory}`

This created:
1. **Inconsistency risk** - Different components could build URLs differently
2. **Maintenance burden** - Changing URL structure requires updates in multiple files
3. **Discovery of flat URLs** - Google Rich Results detected old `/slug` URLs in card microdata

## Solution: Centralized URL Builder

Created `app/utils/urlBuilder.ts` with functions for all URL patterns:

### Core Functions

```typescript
// Build URL from metadata (auto-detects content type)
buildUrlFromMetadata({ category, subcategory, slug }, absolute?)
// => '/materials/metal/ferrous/steel-laser-cleaning'
// => 'https://www.z-beam.com/materials/metal/ferrous/steel-laser-cleaning' (if absolute)

// Build category/subcategory URLs
buildCategoryUrl(category, absolute?)
buildSubcategoryUrl(category, subcategory, absolute?)

// Parse existing URLs
parseUrl('/materials/metal/ferrous/steel-laser-cleaning')
// => { category: 'metal', subcategory: 'ferrous', slug: 'steel-laser-cleaning' }

// Validate URLs match expected structure
validateUrl(url, metadata)
```

### URL Patterns

```typescript
getUrlPatterns()
// => {
//   material: '/materials/[category]/[subcategory]/[slug]',
//   service: '/[slug]',
//   article: '/[slug]',
//   page: '/[slug]'
// }
```

## Implementation

### Updated Components

#### 1. CardGridSSR
**Before:**
```typescript
const itemHref = `/${slug}`;
```

**After:**
```typescript
import { buildUrlFromMetadata } from "../../utils/urlBuilder";

const itemHref = buildUrlFromMetadata({
  category,
  subcategory,
  slug
});
```

#### 2. Sitemap
**Before:**
```typescript
url: `${baseUrl}/materials/${category}`,
url: `${baseUrl}/materials/${category}/${subcategory}`,
url: `${baseUrl}/materials/${category}/${subcategory}/${slug}`,
```

**After:**
```typescript
import { buildCategoryUrl, buildSubcategoryUrl, buildUrlFromMetadata } from './utils/urlBuilder';

url: buildCategoryUrl(category, true),
url: buildSubcategoryUrl(category, subcategory, true),
url: buildUrlFromMetadata({ category, subcategory, slug }, true),
```

#### 3. JSON-LD (SchemaFactory)
Already receives full path from pages:
```typescript
// Material detail page
<MaterialJsonLD article={article} slug={`materials/${category}/${subcategory}/${slug}`} />

// SchemaFactory uses this slug to build pageUrl
this.context = {
  slug,
  baseUrl: baseUrl || SITE_CONFIG.url,
  pageUrl: `${baseUrl || SITE_CONFIG.url}/${slug}`,
  currentDate: new Date().toISOString().split('T')[0]
};
```

**Future improvement:** Pass metadata instead of slug, use urlBuilder:
```typescript
import { buildUrlFromMetadata } from './urlBuilder';

// In MaterialJsonLD
const pageUrl = buildUrlFromMetadata(article.metadata, true);
const factory = new SchemaFactory(article, pageUrl);
```

## Benefits

### 1. Single Source of Truth
- All URL patterns defined in one place
- Changes to URL structure only require updating urlBuilder.ts
- No risk of inconsistent URLs across components

### 2. Type Safety
```typescript
interface UrlBuildOptions {
  category?: string;
  subcategory?: string;
  slug: string;
  absolute?: boolean;
}
```

### 3. Automatic Content Type Detection
```typescript
function getContentType(metadata?: Record<string, unknown>): ContentType {
  if (metadata.category && metadata.subcategory) return 'material';
  if (metadata.articleType === 'service') return 'service';
  return 'page';
}
```

### 4. Validation Support
```typescript
// Used by scripts/validate-jsonld-urls.js
validateUrl(actualUrl, expectedMetadata)
```

### 5. Documentation
```typescript
getUrlPatterns() // Returns all URL patterns for docs/testing
```

## Testing

### Manual Verification
```bash
# Build and check URLs in HTML
npm run build
grep -o 'href="/[^"]*bamboo-laser-cleaning' .next/server/app/materials/wood/hardwood/ash-laser-cleaning.html
# => href="/materials/wood/hardwood/bamboo-laser-cleaning

# Check sitemap
curl https://www.z-beam.com/sitemap.xml | grep bamboo
# => <loc>https://www.z-beam.com/materials/wood/hardwood/bamboo-laser-cleaning</loc>
```

### Automated Validation
```bash
npm run validate:urls  # Runs automatically in npm run build
```

## Migration Guide

### For New Components

Always use urlBuilder instead of hardcoding:

```typescript
import { buildUrlFromMetadata, buildCategoryUrl } from '@/app/utils/urlBuilder';

// ✅ Good - Uses urlBuilder
const url = buildUrlFromMetadata(material, absolute);

// ❌ Bad - Hardcoded
const url = `/materials/${material.category}/${material.subcategory}/${material.slug}`;
```

### For Existing Components

1. Import urlBuilder functions
2. Replace hardcoded template strings
3. Pass metadata objects when possible
4. Test with `npm run build` to verify

### URL Pattern Changes

If URL structure needs to change:

1. Update patterns in `urlBuilder.ts`
2. Update redirects in `next.config.js`
3. All components automatically use new structure
4. Run validation: `npm run validate:urls`

## Related Files

- **Utility:** `app/utils/urlBuilder.ts`
- **Components using it:**
  - `app/components/CardGrid/CardGridSSR.tsx`
  - `app/sitemap.ts`
  - Future: `app/components/JsonLD/JsonLD.tsx`
  - Future: `app/utils/breadcrumbs.ts`
- **Validation:** `scripts/validate-jsonld-urls.js`
- **Redirects:** `next.config.js`

## Testing

Comprehensive test suite: `tests/utils/urlBuilder.test.ts`

### Test Coverage (56 total tests)

**Core Functionality (36 tests):**
- ✅ buildUrl: hierarchical URLs, flat URLs, absolute URLs (5 tests)
- ✅ buildUrlFromMetadata: materials, services, absolute URLs (3 tests)
- ✅ buildCategoryUrl: relative and absolute category URLs (3 tests)
- ✅ buildSubcategoryUrl: relative and absolute subcategory URLs (3 tests)
- ✅ parseUrl: hierarchical, flat, absolute URLs (4 tests)
- ✅ validateUrl: correct/incorrect URLs, materials/pages (4 tests)
- ✅ getContentType: materials, services, articles, pages (5 tests)
- ✅ getUrlPatterns: all URL patterns (1 test)
- ✅ Edge Cases: special characters, empty slugs, incomplete hierarchy (3 tests)
- ✅ Real-World Examples: wood, metal, ceramic, products, equipment (5 tests)

**Settings Pages (5 tests) - Added Nov 25, 2025:**
- ✅ Preserves -settings suffix in slug for settings pages
- ✅ Builds absolute URLs with -settings suffix preserved
- ✅ Validates settings URL with suffix present
- ✅ Invalidates settings URL if suffix missing
- ✅ Handles multiple settings pages across categories

**E2E URL Generation Accuracy (7 tests) - Added Nov 25, 2025:**
- ✅ Handles slugs with numbers and hyphens (aluminum-6061-t6)
- ✅ Handles settings slugs with numbers (aluminum-6061-settings)
- ✅ Handles very long slug names (50+ characters)
- ✅ Builds consistent URLs for same metadata
- ✅ Distinguishes materials vs settings with same base name
- ✅ Parses settings URLs correctly preserving suffix
- ✅ Validates URL structure matches sitemap generation

**Sitemap Integration (4 tests) - Added Nov 25, 2025:**
- ✅ Builds URLs matching sitemap category page pattern
- ✅ Builds URLs matching sitemap subcategory page pattern
- ✅ Builds URLs matching sitemap material page pattern
- ✅ Builds URLs matching sitemap settings page pattern

### Key Test Scenarios

**Settings Pages URL Generation:**
```typescript
// ✅ Preserves -settings suffix
buildUrlFromMetadata({
  rootPath: 'settings',
  category: 'metal',
  subcategory: 'ferrous',
  slug: 'stainless-steel-settings'
})
// => '/settings/metal/ferrous/stainless-steel-settings'

// ✅ Distinguishes from materials page
buildUrlFromMetadata({
  rootPath: 'materials',
  category: 'metal',
  subcategory: 'ferrous',
  slug: 'stainless-steel-laser-cleaning'
})
// => '/materials/metal/ferrous/stainless-steel-laser-cleaning'
```

**Sitemap Consistency:**
```typescript
// ✅ Material page
buildUrlFromMetadata({
  rootPath: 'materials',
  category: 'metal',
  subcategory: 'ferrous',
  slug: 'steel-laser-cleaning'
}, true)
// => 'https://z-beam.com/materials/metal/ferrous/steel-laser-cleaning'

// ✅ Settings page  
buildUrlFromMetadata({
  rootPath: 'settings',
  category: 'metal',
  subcategory: 'ferrous',
  slug: 'steel-settings'
}, true)
// => 'https://z-beam.com/settings/metal/ferrous/steel-settings'
```

### Run Tests

```bash
# Full test suite (56 tests)
npm test -- tests/utils/urlBuilder.test.ts

# Watch mode for development
npm test -- tests/utils/urlBuilder.test.ts --watch
```

### Test Results

All 56 tests passing as of Nov 25, 2025:
- ✅ 36 core functionality tests
- ✅ 5 settings pages tests
- ✅ 7 e2e accuracy tests
- ✅ 4 sitemap integration tests
- ✅ Environment-aware testing (dev vs production URLs)
- ✅ Edge case handling (special chars, long names, numbers)

## TODO

1. ✅ Create urlBuilder utility
2. ✅ Update CardGridSSR to use urlBuilder
3. ✅ Update sitemap to use urlBuilder
4. ✅ Add unit tests for urlBuilder functions
5. ⏳ Update validation scripts to use urlBuilder
6. ⏳ Update breadcrumbs to use urlBuilder (currently uses hardcoded patterns)
7. ⏳ Update MaterialJsonLD passthrough (currently receives full path)

## Resolution

**Root Cause:** CardGridSSR was generating flat URLs (`/slug`) in href attributes, which appeared in HTML and were detected by Google Rich Results Test as "legacy URLs".

**Solution:** Implemented centralized URL builder utility and updated CardGridSSR to use hierarchical URLs (`/materials/category/subcategory/slug`).

**Result:** 
- ✅ All card links now use hierarchical URLs
- ✅ Sitemap uses urlBuilder for consistency
- ✅ Single source of truth for URL patterns
- ✅ Easy to maintain and extend

**Verification:**
```bash
# Built HTML now shows correct URLs
grep 'href="/materials/wood/hardwood/bamboo-laser-cleaning' .next/server/app/materials/wood/hardwood/ash-laser-cleaning.html
# ✅ Found
```

**Next Steps:**
1. Deploy to production
2. Test in Google Rich Results Test
3. Update remaining components to use urlBuilder
4. Add unit tests for urlBuilder functions
