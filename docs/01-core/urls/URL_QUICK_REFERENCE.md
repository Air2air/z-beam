# URL Slug Writing - Quick Reference

**Updated:** Nov 25, 2025  
**Test Coverage:** 56 tests, all passing  
**Status:** Production-ready

## At a Glance

✅ **56 comprehensive tests** covering all URL patterns  
✅ **Settings pages** preserve -settings suffix  
✅ **Materials pages** use hierarchical structure  
✅ **Sitemap integration** verified and consistent  
✅ **Edge cases** handled (special chars, long names, numbers)

## Quick Test Commands

```bash
# Run full test suite (56 tests)
npm test -- tests/utils/urlBuilder.test.ts

# Settings pages only
npm test -- tests/utils/urlBuilder.test.ts -t "Settings Pages"

# E2E accuracy only
npm test -- tests/utils/urlBuilder.test.ts -t "E2E URL Generation"

# Sitemap integration only
npm test -- tests/utils/urlBuilder.test.ts -t "Sitemap Integration"
```

## URL Patterns

| Content Type | Pattern | Example |
|--------------|---------|---------|
| Material Page | `/materials/[cat]/[subcat]/[slug]` | `/materials/metal/ferrous/steel-laser-cleaning` |
| Settings Page | `/settings/[cat]/[subcat]/[slug]` | `/settings/metal/ferrous/steel-settings` |
| Category | `/[root]/[category]` | `/materials/metal` |
| Subcategory | `/[root]/[cat]/[subcat]` | `/materials/metal/ferrous` |
| Flat Page | `/[slug]` | `/services`, `/contact` |

## Usage

```typescript
import { buildUrlFromMetadata } from '@/app/utils/urlBuilder';

// Material page
buildUrlFromMetadata({
  rootPath: 'materials',
  category: 'metal',
  subcategory: 'ferrous',
  slug: 'steel-laser-cleaning'
})
// => '/materials/metal/ferrous/steel-laser-cleaning'

// Settings page (preserves -settings)
buildUrlFromMetadata({
  rootPath: 'settings',
  category: 'metal',
  subcategory: 'ferrous',
  slug: 'steel-settings'
})
// => '/settings/metal/ferrous/steel-settings'

// Absolute URL
buildUrlFromMetadata(metadata, true)
// => 'https://z-beam.com/materials/...'
```

## Critical Tests

### Settings Suffix Preservation
✅ Preserves -settings in relative URLs  
✅ Preserves -settings in absolute URLs  
✅ Validates suffix presence  
✅ Invalidates if suffix missing

### Materials vs Settings Distinction
✅ Different root paths  
✅ Different slugs  
✅ No URL collision  
✅ Both validate correctly

### Special Characters
✅ Numbers: `aluminum-6061-t6`  
✅ Multiple hyphens: `carbon-fiber-reinforced-polymer`  
✅ Long names: 50+ character slugs

### Sitemap Consistency
✅ Category pages match  
✅ Subcategory pages match  
✅ Material pages match  
✅ Settings pages match

## Files

| File | Purpose |
|------|---------|
| `app/utils/urlBuilder.ts` | Core URL building functions |
| `tests/utils/urlBuilder.test.ts` | 56 comprehensive tests |
| `app/sitemap.ts` | Uses urlBuilder for all URLs |
| `app/components/CardGrid/CardGridSSR.tsx` | Uses urlBuilder for card links |

## Documentation

- **E2E Validation:** `docs/01-core/urls/URL_E2E_VALIDATION.md` (comprehensive)
- **URL Builder Utility:** `docs/01-core/urls/URL_BUILDER_UTILITY.md` (detailed)
- **Implementation:** `docs/02-features/URL_BUILDER_IMPLEMENTATION.md` (technical)

## Best Practices

1. ✅ **Always use urlBuilder** - Never hardcode URL patterns
2. ✅ **Preserve slug integrity** - Don't strip or manipulate
3. ✅ **Test before commit** - Run test suite
4. ✅ **Verify sitemap** - Check output after changes
5. ✅ **Document edge cases** - Add tests for new patterns

## Common Mistakes

❌ **Stripping -settings suffix**
```typescript
// WRONG
slug.replace('-settings', '')

// RIGHT
slug // Keep as-is
```

❌ **Hardcoding URL patterns**
```typescript
// WRONG
const url = `/materials/${category}/${subcategory}/${slug}`;

// RIGHT
const url = buildUrlFromMetadata({ rootPath: 'materials', category, subcategory, slug });
```

❌ **Not testing URL changes**
```bash
# Always run before commit
npm test -- tests/utils/urlBuilder.test.ts
```

## Recent Updates

**Nov 25, 2025:**
- Added 20 new e2e tests for settings and sitemap
- Verified settings suffix preservation
- Documented edge cases and robustness
- Total: 56 tests, all passing
