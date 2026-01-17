# Test Regression Analysis - January 15, 2026

## Summary

Investigation of 4 main regression categories affecting 20 failing test suites:
1. ✅ **pageTitle/pageDescription**: No actual regressions - terminology confusion
2. ❌ **BreadcrumbList Schema**: Missing `breadcrumb` array in test mock data
3. ❌ **FAQ Schema Detection**: `hasFAQData()` doesn't check nested `metadata.faq`
4. ⚠️ **Related Materials**: Not a separate issue - part of general test failures

## Test Failure Summary

```
Test Suites: 20 failed, 11 skipped, 123 passed
Tests:       ~60 failed, 222 skipped, 2600+ passed
```

**20 Failing Test Suites:**
- tests/seo/e2e-pipeline.test.ts
- tests/seo/schema-factory.test.ts
- tests/seo/contaminant-seo-integration.test.ts
- tests/utils/contentAPI.test.js
- tests/integration/contentAPI-filesystem.test.js
- tests/unit/MaterialJsonLD.test.tsx
- tests/utils/searchUtils.test.js
- tests/naming/semantic-naming.test.ts
- tests/utils/frontmatterValidation.test.ts
- tests/integration/ItemPage-dataset.test.tsx
- tests/integration/search-workflow.test.js
- tests/seo/contaminant-seo.test.ts
- tests/app/static-pages.test.tsx
- tests/utils/breadcrumbs.test.ts
- tests/integration/seo-comprehensive.test.js
- tests/components/Layout-faq-structure.test.tsx
- tests/utils/schema-helpers.test.ts
- tests/architecture/jsonld-enforcement.test.ts
- tests/utils/articleEnrichment.test.js
- tests/utils/relationshipHelpers.test.ts

---

## Issue 1: pageTitle/pageDescription - ✅ NO REGRESSION

### Status: ✅ False Alarm - Terminology Confusion

**Investigation Result**: NO actual regressions with pageTitle or pageDescription fields.

### What Was Found

Documents referenced "pageTitle" and "pageDescription" issues, but these were:
1. **Documentation about optimal structure** (not failures)
2. **Historical recommendations** from FRONTMATTER_OPTIMAL_STRUCTURE.md
3. **Naming convention compliance** (already fixed in Jan 4, 2026)

### Evidence

From `docs/05-changelog/NAMING_CONVENTION_CLEANUP_JAN_2026.md`:
```
Complete cleanup of naming convention compliance
✅ 100% test passage (2669 passed, 222 skipped, 2891 total)
Status: COMPLETE (January 4, 2026)
```

### Grep Search Results

All "pageTitle" and "pageDescription" matches were:
- Documentation examples showing correct vs incorrect usage
- Historical frontmatter structure issues (already resolved)
- Test files checking FOR these fields (not failures about them)

### Conclusion

**pageTitle and pageDescription are working correctly.**
- Frontmatter properly uses `pageTitle` and `pageDescription` (camelCase)
- Metadata generation working
- No test failures related to these fields

---

## Issue 2: BreadcrumbList Schema - ❌ FAILING (1 test)

### Status: ❌ Regression - Test mock data incomplete

**Failing Test**: `tests/seo/e2e-pipeline.test.ts`
- Test: "should include BreadcrumbList schema for navigation"
- **Expected**: BreadcrumbList schema in generated schemas
- **Received**: No BreadcrumbList schema generated

### Root Cause

**File**: `tests/seo/e2e-pipeline.test.ts` (lines 18-78)

```typescript
const mockFrontmatterData = {
  title: 'Aluminum Laser Cleaning',
  name: 'Aluminum',
  description: '...',
  category: 'metal',
  subcategory: 'non-ferrous',
  slug: 'aluminum-laser-cleaning',
  // ❌ MISSING: breadcrumb array
  // ...other fields
};
```

**Missing Field**:
```typescript
breadcrumb: [
  { label: 'Home', href: '/' },
  { label: 'Materials', href: '/materials' },
  { label: 'Metal', href: '/materials/metal' },
  { label: 'Non-Ferrous', href: '/materials/metal/non-ferrous' },
  { label: 'Aluminum Laser Cleaning', href: '/materials/metal/non-ferrous/aluminum-laser-cleaning' }
]
```

### How BreadcrumbList Schema Works

**File**: `app/utils/schemas/SchemaFactory.ts` (lines 415-447)

```typescript
function generateBreadcrumbSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = data.frontmatter || data.pageConfig || data;
  
  // Uses generateBreadcrumbs() utility
  const breadcrumbItems = generateBreadcrumbs(frontmatter, pathname);
  
  // ❌ Returns null if no breadcrumbs
  if (!breadcrumbItems || breadcrumbItems.length === 0) {
    return null;
  }
  
  // Convert to Schema.org format
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    'itemListElement': itemListElement
  };
}
```

**File**: `app/utils/breadcrumbs.ts` (lines 28-49)

```typescript
export function generateBreadcrumbs(
  metadata: Partial<ArticleMetadata> | null,
  _pathname: string
): BreadcrumbItem[] | null {
  const breadcrumbArray = metadata?.breadcrumb;
  
  if (breadcrumbArray && Array.isArray(breadcrumbArray)) {
    const validBreadcrumbs = breadcrumbArray.filter(
      (item: any) => item && typeof item.label === 'string' && typeof item.href === 'string'
    );
    
    if (validBreadcrumbs.length > 0) {
      return validBreadcrumbs;
    }
  }
  
  // ❌ Returns null - no breadcrumbs generated
  return null;
}
```

### Fix Required

**File**: `tests/seo/e2e-pipeline.test.ts`

Add `breadcrumb` array to mockFrontmatterData:

```typescript
const mockFrontmatterData = {
  title: 'Aluminum Laser Cleaning',
  name: 'Aluminum',
  description: '...',
  category: 'metal',
  subcategory: 'non-ferrous',
  slug: 'aluminum-laser-cleaning',
  // ✅ ADD THIS:
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Materials', href: '/materials' },
    { label: 'Metal', href: '/materials/metal' },
    { label: 'Non-Ferrous', href: '/materials/metal/non-ferrous' },
    { label: 'Aluminum Laser Cleaning', href: '/materials/metal/non-ferrous/aluminum-laser-cleaning' }
  ],
  // ...rest of fields
};
```

### Grade: C

- **Issue**: Test mock data incomplete (missing breadcrumb array)
- **Impact**: 1 test failing
- **Severity**: Low (test data issue, not production bug)
- **Fix Complexity**: Trivial (add 5 lines to mock data)

---

## Issue 3: FAQ Schema Detection - ❌ FAILING (5 tests)

### Status: ❌ Regression - hasFAQData() incomplete

**Failing Tests**: `tests/seo/schema-factory.test.ts` (5 failures)

```typescript
describe('hasFAQData', () => {
  it('returns true with faq array', () => {
    expect(hasFAQData({ faq: [] })).toBe(true); // ✅ PASSES
  });

  it('returns true with faq in metadata', () => {
    expect(hasFAQData({ metadata: { faq: [] } })).toBe(true); // ❌ FAILS
  });

  it('returns true with outcomeMetrics', () => {
    expect(hasFAQData({ metadata: { outcomeMetrics: {} } })).toBe(true); // ❌ FAILS
  });

  it('returns true with applications', () => {
    expect(hasFAQData({ metadata: { applications: [] } })).toBe(true); // ❌ FAILS
  });

  it('returns true with environmentalImpact', () => {
    expect(hasFAQData({ metadata: { environmentalImpact: {} } })).toBe(true); // ❌ FAILS
  });
});
```

### Root Cause

**File**: `app/utils/schemas/helpers.ts` (lines 83-91)

```typescript
export function hasFAQData(data: any): boolean {
  const meta = getMetadata(data);
  if (data.faq || meta.faq) return true;
  
  // Check for FAQ-generating frontmatter
  return !!(meta.outcomeMetrics || meta.applications || meta.environmentalImpact);
}
```

**Problem**: Tests pass `{ metadata: { faq: [] } }` but `hasFAQData()` doesn't check this structure.

### How getMetadata() Works

**File**: `app/utils/schemas/helpers.ts` (lines 16-44)

```typescript
export function getMetadata(data: any): Record<string, unknown> {
  // PRIORITY 1: Settings objects (machineSettings at top level)
  if (data.machineSettings && !data.frontmatter) {
    return data;
  }
  
  // PRIORITY 2: Explicit frontmatter wrapper
  if (data.frontmatter && typeof data.frontmatter === 'object') {
    return data.frontmatter;
  }
  
  // PRIORITY 3: Legacy pageConfig
  if (data.pageConfig && typeof data.pageConfig === 'object') {
    return data.pageConfig;
  }
  
  // ❌ FALLBACK: Return data itself
  return data;
}
```

**The Issue**:
- Tests pass: `{ metadata: { faq: [] } }`
- `getMetadata()` checks for `.frontmatter` or `.pageConfig` but **NOT `.metadata`**
- Falls through to return the whole object: `{ metadata: { faq: [] } }`
- `meta.faq` is undefined (because `meta = { metadata: {...} }`)

### Fix Options

#### Option A: Update hasFAQData() (Recommended)

**File**: `app/utils/schemas/helpers.ts`

```typescript
export function hasFAQData(data: any): boolean {
  const meta = getMetadata(data);
  
  // ✅ ADD: Check nested metadata wrapper
  if (data.faq || meta.faq || data.metadata?.faq) return true;
  
  // Check for FAQ-generating frontmatter
  return !!(
    meta.outcomeMetrics || 
    meta.applications || 
    meta.environmentalImpact ||
    data.metadata?.outcomeMetrics ||
    data.metadata?.applications ||
    data.metadata?.environmentalImpact
  );
}
```

#### Option B: Update getMetadata() (Alternative)

```typescript
export function getMetadata(data: any): Record<string, unknown> {
  // ... existing checks ...
  
  // ✅ ADD: Check for .metadata wrapper (before fallback)
  if (data.metadata && typeof data.metadata === 'object') {
    return data.metadata;
  }
  
  // Fallback
  return data;
}
```

#### Option C: Fix Tests (Wrong Approach)

Change tests to match production structure:
```typescript
// ❌ Don't do this - tests are testing real-world data structures
expect(hasFAQData({ frontmatter: { faq: [] } })).toBe(true);
```

### Recommendation

**Use Option A** - Update `hasFAQData()` to handle nested `.metadata` wrapper.

**Reasoning**:
1. Tests are checking valid data structures that may come from various sources
2. `.metadata` wrapper is used in some parts of the system (documented as DEPRECATED but still present)
3. Helper functions should be defensive and handle multiple structures
4. Matches pattern of checking both `data.faq` AND `meta.faq`

### Grade: B-

- **Issue**: Helper function doesn't check all data structures
- **Impact**: 5 tests failing + potential production edge cases
- **Severity**: Medium (may miss FAQ schemas in certain data structures)
- **Fix Complexity**: Low (add 2-3 conditional checks)

---

## Issue 4: Related Materials - ⚠️ NOT A SPECIFIC ISSUE

### Status: ⚠️ Not Found - Likely covered by other failures

**Investigation Result**: No specific "Related Materials" regression found.

### What Was Searched

- Grep for "Related Materials" + "regression" → No matches
- Grep for "Related Materials" + "failing" → No matches
- Test file search for Related Materials → No dedicated test failures

### Likely Explanation

"Related Materials" issues are probably covered by:
1. **BreadcrumbList schema failures** (navigation context)
2. **General integration test failures** (relationship rendering)
3. **Schema generation failures** (ItemList schemas for relationships)

### Related Test Failures

Some of the 20 failing test suites may involve related materials:
- `tests/integration/ItemPage-dataset.test.tsx` (may test relationships)
- `tests/utils/relationshipHelpers.test.ts` (relationship utilities)
- `tests/utils/articleEnrichment.test.js` (enrichment with related data)

### Recommendation

**Investigate relationship-related test failures** after fixing BreadcrumbList and FAQ issues.

If specific Related Materials issues exist, they're likely:
- Missing relationship data in test mocks
- Schema generation for ItemList relationships
- Enrichment failures for `contaminatedBy`, `cleanedFrom`, etc.

---

## Overall Summary

### Issues Identified

| Issue | Status | Tests Failing | Severity | Fix Complexity |
|-------|--------|---------------|----------|----------------|
| **pageTitle/pageDescription** | ✅ No Regression | 0 | None | N/A |
| **BreadcrumbList Schema** | ❌ Regression | 1 | Low | Trivial |
| **FAQ Schema Detection** | ❌ Regression | 5 | Medium | Low |
| **Related Materials** | ⚠️ Not Found | Unknown | Unknown | Unknown |

### Priority Fixes

#### Priority 1: FAQ Schema Detection (5 tests)
**File**: `app/utils/schemas/helpers.ts`
**Change**: Add checks for nested `.metadata` wrapper in `hasFAQData()`
**Impact**: Fixes 5 test failures immediately

#### Priority 2: BreadcrumbList Schema (1 test)
**File**: `tests/seo/e2e-pipeline.test.ts`
**Change**: Add `breadcrumb` array to mockFrontmatterData
**Impact**: Fixes 1 test failure

#### Priority 3: Investigate Other Failures (14 tests)
The remaining 14 failing test suites need individual investigation:
- Likely similar issues (missing mock data, deprecated wrappers)
- May uncover the "Related Materials" issues
- Could be cascading failures from FAQ/Breadcrumb issues

### Test Metrics

**Current State**:
```
Test Suites: 20 failed, 11 skipped, 123 passed, 154 total
Tests:       ~60 failed, 222 skipped, ~2600 passed, ~2882 total
Pass Rate:   ~90% tests passing (but 13% test suites failing)
```

**After Priority 1 & 2 Fixes**:
```
Expected: 6 tests fixed (5 FAQ + 1 Breadcrumb)
Test Suites: 19 failed (1 less if fixes isolated)
Tests:       ~54 failed, 222 skipped, ~2606 passed
```

### Grade: C

- ✅ pageTitle/pageDescription: False alarm (A)
- ❌ BreadcrumbList: Simple test data fix (C)
- ❌ FAQ Detection: Missing edge case handling (B-)
- ⚠️ Related Materials: Not found yet

**Overall**: 2 of 4 investigated issues have clear fixes, 1 is not an issue, 1 needs more investigation.

---

## Recommendations

### Immediate Actions

1. **Fix hasFAQData() helper** (Priority 1)
   - Add nested `.metadata` wrapper checks
   - Fixes 5 tests immediately
   - 15 minutes of work

2. **Fix BreadcrumbList test mock** (Priority 2)
   - Add breadcrumb array to test data
   - Fixes 1 test immediately
   - 5 minutes of work

3. **Run full test suite** after fixes
   - Verify cascading fixes (other tests may pass)
   - Identify remaining failures

### Investigation Needed

4. **Investigate remaining 14 failing test suites**
   - Group by failure type (mock data, schema, helper issues)
   - Look for patterns (similar to FAQ/Breadcrumb issues)
   - Identify "Related Materials" failures

5. **Check for deprecated `.metadata` wrapper usage**
   - Documented as DEPRECATED (Dec 28, 2025)
   - Still used in some places
   - May need migration or removal

### Long-Term

6. **Test data consistency audit**
   - Ensure all test mocks include required fields
   - Create test data fixtures for reuse
   - Document required frontmatter structure

7. **Helper function defensive coding**
   - All `getMetadata()` consumers should handle multiple structures
   - Add explicit checks for deprecated wrappers
   - Eventually remove deprecated wrapper support

---

**Analysis Completed**: January 15, 2026  
**Test Suite Version**: Tests run on latest code  
**Next Steps**: Implement Priority 1 & 2 fixes, rerun tests, investigate remaining failures
