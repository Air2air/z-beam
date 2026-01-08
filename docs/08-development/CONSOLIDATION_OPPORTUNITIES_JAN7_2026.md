# Consolidation Opportunities - January 7, 2026

**Status**: Analysis Complete  
**Priority**: High-impact opportunities identified  
**Next Phase**: Implementation planning

---

## 📊 Executive Summary

Found **7 major consolidation opportunities** that will eliminate **~300 lines of duplicate code** and improve maintainability.

### Quick Stats
- **Duplicate slug normalization**: 20+ instances → 1 utility
- **Duplicate BASE_URL constants**: 15+ instances → 1 config
- **Duplicate PropertyValue types**: 2 instances → 1 type
- **String manipulation patterns**: 30+ repeated → shared utilities

---

## 🎯 Priority 1: High-Impact (Immediate)

### 1. ✅ **COMPLETE** - Dataset Loading Consolidation
**Status**: ✅ Implemented (completed today)

**What Was Done**:
- Created `slugHelpers.ts` with 6 shared functions
- Created `variableMeasuredBuilder.ts` with 9 shared functions
- Updated 8 files to use shared utilities
- Fixed duplicate suffix bug in SchemaFactory

**Files Updated**: 8  
**Code Eliminated**: ~150 lines of duplicates  
**Grade**: ✅ A+ (all tests passing)

---

### 2. 🔴 **HIGH PRIORITY** - Slug/String Normalization Utilities

**Problem**: Same string manipulation patterns repeated 30+ times across codebase

**Duplicate Patterns Found**:

#### Pattern A: Category/Subcategory Slugification (20+ instances)
```typescript
// DUPLICATE PATTERN (appears 20+ times)
const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
const subcategorySlug = subcategory.toLowerCase().replace(/\s+/g, '-');

// FILES WITH THIS PATTERN:
// - scripts/fix-category-capitalization.js (2 instances)
// - scripts/validation/seo/validate-redirects.js (2 instances)
// - scripts/validation/content/validate-naming-e2e.js (2 instances)
// - scripts/migrate-breadcrumbs.ts (4 instances)
// - tests/systems/regional-content.test.js (2 instances)
// - tests/systems/material-system.test.js (2 instances)
// - tests/systems/application-specific.test.js (1 instance)
// - tests/e2e/property-extraction.test.js (1 instance)
// - tests/e2e/property-naming.test.js (1 instance)
// - tests/components/IndustryApplicationsPanel.test.tsx (1 instance)
// - tests/components/author-architecture.test.js (1 instance)
// - tests/app/slug-page.test.tsx (1 instance)
```

#### Pattern B: Property Name Normalization (5+ instances)
```typescript
// DUPLICATE PATTERN
function normalizePropertyName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// FILES WITH THIS PATTERN:
// - tests/e2e/property-naming.test.js
// - tests/e2e/property-extraction.test.js
// - (3+ more in scripts/)
```

#### Pattern C: Capitalize First Letter (10+ instances)
```typescript
// DUPLICATE PATTERN
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// FILES WITH THIS PATTERN:
// - scripts/update-breadcrumbs.js
// - scripts/migrate-breadcrumbs.ts
// - (8+ more in components/tests)
```

**Proposed Solution**:

**Enhance `app/utils/formatting.ts`** with these functions:

```typescript
// app/utils/formatting.ts (additions)

/**
 * Convert category/subcategory name to slug format
 * @example toCategorySlug('Metal Alloys') → 'metal-alloys'
 */
export function toCategorySlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Normalize property name for comparison
 * @example normalizePropertyName("Young's Modulus") → 'youngsmodulus'
 */
export function normalizePropertyName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Convert title to Title Case with special handling
 * @example toTitleCase('aluminum oxide') → 'Aluminum Oxide'
 */
export function toTitleCase(str: string): string {
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
```

**Impact**:
- **Files to update**: 30+
- **Code reduction**: ~90 lines eliminated
- **Maintenance**: Single source of truth for string operations

**Implementation Estimate**: 2-3 hours

---

### 3. 🔴 **HIGH PRIORITY** - BASE_URL Constant Consolidation

**Problem**: `BASE_URL` / `SITE_URL` defined separately in 15+ files

**Duplicate Constants Found**:

```typescript
// DIFFERENT VALUES, SAME PURPOSE:

// Option A: Production URL
const BASE_URL = 'https://www.z-beam.com';  // Used in 8 files
const SITE_URL = 'https://www.z-beam.com';  // Used in 5 files

// Option B: With fallback
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.z-beam.com';  // 2 files
const TARGET_URL = process.env.BASE_URL || 'https://www.z-beam.com';  // 2 files

// FILES WITH DUPLICATES:
// Scripts:
// - seo/scripts/generate-sitemap-index.js
// - seo/scripts/generate-image-sitemap.js
// - seo/scripts/generate-google-merchant-feed.js
// - scripts/validation/validate-schemas-live.js
// - scripts/validation/post-deployment/validate-feeds.js
// - scripts/validation/seo/validate-seo-infrastructure.js
// - scripts/search-console-export.js
// - scripts/archive/one-off-fixes/auto-generate-schemas.js
// - scripts/validation/post-deployment/validate-production-simple.js
// - scripts/validation/seo/validate-core-web-vitals.js
// - scripts/validation/post-deployment/validate-production-enhanced.js

// Tests:
// - tests/* (20+ test files with hardcoded URLs)
```

**Proposed Solution**:

**Create shared config**: `app/config/urls.ts`

```typescript
// app/config/urls.ts (NEW FILE)

/**
 * Centralized URL configuration
 * Single source of truth for all site URLs
 */

export const SITE_CONFIG = {
  // Production URLs
  production: {
    base: 'https://www.z-beam.com',
    www: 'https://www.z-beam.com',
    api: 'https://www.z-beam.com/api',
  },
  
  // Development URLs
  development: {
    base: 'http://localhost:3000',
    www: 'http://localhost:3000',
    api: 'http://localhost:3000/api',
  },
  
  // Get current base URL (with env fallback)
  getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_BASE_URL || this.production.base;
  },
  
  // Get current API URL
  getApiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || this.production.api;
  },
  
  // Check if production
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
} as const;

// Convenience exports
export const BASE_URL = SITE_CONFIG.getBaseUrl();
export const API_URL = SITE_CONFIG.getApiUrl();
export const IS_PRODUCTION = SITE_CONFIG.isProduction();
```

**Migration**:

```typescript
// BEFORE
const BASE_URL = 'https://www.z-beam.com';
const sitemapUrl = `${BASE_URL}/sitemap.xml`;

// AFTER
import { BASE_URL } from '@/app/config/urls';
const sitemapUrl = `${BASE_URL}/sitemap.xml`;
```

**Impact**:
- **Files to update**: 30+
- **Code reduction**: ~45 lines eliminated
- **Benefits**: 
  - Single config for all URL changes
  - Environment-aware (dev/prod)
  - Type-safe exports

**Implementation Estimate**: 2-3 hours

---

## 🟡 Priority 2: Medium-Impact (Next Sprint)

### 4. 🟡 **Duplicate PropertyValue Type Definitions**

**Problem**: Two different `PropertyValue` interfaces with different purposes

**Current State**:

```typescript
// File 1: types/centralized.ts (Frontmatter PropertyValue)
export interface PropertyValue {
  value: number | string;
  unit: string;
  confidence: number;
  description: string;
  min?: number;
  max?: number;
  source?: string;
}

// File 2: app/utils/schemas/generators/types.ts (Schema.org PropertyValue)
export interface PropertyValue {
  value: unknown;
  unit?: string;
  confidence?: number;
  metadata?: {
    last_verified?: string;
    source?: string;
  };
}

// File 3: app/utils/variableMeasuredBuilder.ts (Schema.org - custom)
export interface SchemaPropertyValue {
  '@type': 'PropertyValue';
  propertyID?: string;
  name: string;
  value?: string | number;
  unitText?: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  dateModified?: string;
  citation?: {
    '@type': 'CreativeWork';
    name: string;
  };
}
```

**Proposed Solution**:

**Consolidate into `types/centralized.ts`** with clear naming:

```typescript
// types/centralized.ts (updated)

/**
 * PropertyValue for frontmatter data (YAML files)
 * Used for: Material properties, machine settings
 */
export interface FrontmatterPropertyValue {
  value: number | string;
  unit: string;
  confidence: number;
  description: string;
  min?: number;
  max?: number;
  source?: string;
}

/**
 * PropertyValue for Schema.org JSON-LD (Dataset variableMeasured)
 * Used for: Dataset generation, JSON-LD schemas
 */
export interface SchemaPropertyValue {
  '@type': 'PropertyValue';
  propertyID?: string;
  name: string;
  value?: string | number;
  unitText?: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  dateModified?: string;
  citation?: {
    '@type': 'CreativeWork';
    name: string;
  };
}

// Legacy alias (deprecated - use FrontmatterPropertyValue)
/** @deprecated Use FrontmatterPropertyValue instead */
export type PropertyValue = FrontmatterPropertyValue;
```

**Impact**:
- **Files to update**: 10+
- **Code reduction**: ~40 lines eliminated
- **Benefits**: Clear naming, no confusion between frontmatter vs schema types

**Implementation Estimate**: 1-2 hours

---

### 5. 🟡 **capitalizeWords Function Usage**

**Current State**: `capitalizeWords` is already centralized in `app/utils/formatting.ts` ✅

**Found**: 16 imports across components - **GOOD ARCHITECTURE**

**No Action Needed** - This is already consolidated correctly.

---

## 🟢 Priority 3: Low-Impact (Future)

### 6. 🟢 **Test URL Hardcoding**

**Problem**: Test files have hardcoded `z-beam.com` URLs instead of using constants

**Files Affected**: 30+ test files

**Example**:
```typescript
// CURRENT (hardcoded)
expect(schema.url).toBe('https://z-beam.com');
expect(ref['@id']).toBe('https://z-beam.com#author-author-123');

// BETTER (using constant)
import { BASE_URL } from '@/app/config/urls';
expect(schema.url).toBe(BASE_URL);
expect(ref['@id']).toBe(`${BASE_URL}#author-author-123`);
```

**Impact**: Low (tests work fine with hardcoded values)  
**Implementation Estimate**: 3-4 hours (many files to update)  
**Recommendation**: Do this IF implementing #3 (BASE_URL consolidation)

---

### 7. 🟢 **Script Normalization Functions**

**Problem**: Scripts have their own normalization functions instead of using utilities

**Examples**:
- `scripts/normalize-property-names.js` - has `normalizeYamlFile()`
- `scripts/normalize-settings-description.js` - has `normalizeSettingsFile()`
- `scripts/normalize-frontmatter-camelcase.js` - has `convertYamlFile()`

**Recommendation**: 
- Keep script-specific functions (they're one-off maintenance scripts)
- OR migrate to shared utilities if scripts run frequently

**Impact**: Very Low  
**Implementation Estimate**: 2-3 hours  
**Priority**: Low (scripts are rarely run)

---

## 📊 Summary Table

| # | Opportunity | Priority | Files | Lines Saved | Effort | Status |
|---|-------------|----------|-------|-------------|--------|--------|
| 1 | Dataset Loading | ✅ COMPLETE | 8 | 150 | 4h | ✅ Done |
| 2 | String Utils | 🔴 HIGH | 30+ | 90 | 3h | 🔜 Next |
| 3 | BASE_URL | 🔴 HIGH | 30+ | 45 | 3h | 🔜 Next |
| 4 | PropertyValue Types | 🟡 MEDIUM | 10+ | 40 | 2h | Later |
| 5 | capitalizeWords | ✅ GOOD | 16 | 0 | 0 | ✅ Done |
| 6 | Test URLs | 🟢 LOW | 30+ | 30 | 4h | Optional |
| 7 | Script Functions | 🟢 LOW | 5+ | 20 | 3h | Optional |
| **TOTAL** | | | **120+** | **375** | **19h** | |

---

## 🎯 Recommended Implementation Order

### Phase 1 (Completed) ✅
- [x] Dataset loading consolidation
- [x] Slug helpers
- [x] Variable measured builder

### Phase 2 (Next - ~6 hours)
1. **String normalization utilities** (Priority #2)
   - Add functions to `formatting.ts`
   - Update 30+ files
   - Test all usages
   
2. **BASE_URL consolidation** (Priority #3)
   - Create `app/config/urls.ts`
   - Update 30+ files (scripts + tests)
   - Update env documentation

### Phase 3 (Future - ~2 hours)
3. **PropertyValue type consolidation** (Priority #4)
   - Rename types in `centralized.ts`
   - Update imports in 10+ files
   - Deprecate old names

### Phase 4 (Optional - ~7 hours)
4. **Test URL standardization** (Priority #6)
5. **Script function review** (Priority #7)

---

## 🔒 Quality Gates

Before implementing each consolidation:

### Pre-Implementation
- [ ] Create backup branch
- [ ] Document current behavior
- [ ] Write migration plan
- [ ] Identify all affected files

### Implementation
- [ ] Create shared utility/config
- [ ] Update files incrementally
- [ ] Run type check after each change
- [ ] Commit frequently

### Verification
- [ ] All tests passing
- [ ] Type check passing (0 errors)
- [ ] Build successful
- [ ] Manual testing of key workflows

---

## 📝 Notes

### What's Already Good ✅

1. **`capitalizeWords` function** - Already centralized in `formatting.ts` with 16 proper imports
2. **Dataset loading** - Just consolidated today with shared utilities
3. **Type system** - `types/centralized.ts` is the primary location (good architecture)

### Watch Out For ⚠️

1. **String manipulation** - Many duplicate patterns but slightly different edge cases
2. **URL constants** - Some scripts use env vars, others don't - need consistent approach
3. **Test files** - Many hardcoded URLs work fine, but hurt refactoring

### Future Opportunities 🔮

1. **Component patterns** - Many similar components could share base classes
2. **Validation logic** - Similar validation patterns across validators
3. **Data transformation** - Similar mapping/transformation logic in multiple places

---

## 🎓 Lessons Learned

### From Dataset Consolidation (completed today)

**What Worked**:
- Creating shared utilities before refactoring
- Updating files incrementally with type checking
- Testing after each file update
- Clear function signatures with examples

**What to Replicate**:
- Same pattern: Create utility → Update incrementally → Test → Document
- Same verification: Type check + Test suite + Build
- Same documentation: Before/after examples, impact analysis

**What to Avoid**:
- Don't update all files at once (hard to debug)
- Don't assume similar patterns are identical (verify each case)
- Don't skip type definitions (saved time later)

---

## 🚀 Next Steps

### Immediate (This Week)
1. ✅ Review this analysis with team
2. 🔜 Implement Priority #2 (String utils)
3. 🔜 Implement Priority #3 (BASE_URL config)

### Next Sprint
4. PropertyValue type consolidation
5. Consider test URL standardization

### Future
6. Monitor for new duplication patterns
7. Document consolidation patterns for team

---

## 📞 Questions?

See also:
- `docs/08-development/backend/CONSOLIDATION_COMPLETE.md` - Dataset consolidation summary
- `docs/08-development/AI_ASSISTANT_GUIDE.md` - AI development guidelines
- `docs/QUICK_REFERENCE.md` - Quick lookup for common tasks
