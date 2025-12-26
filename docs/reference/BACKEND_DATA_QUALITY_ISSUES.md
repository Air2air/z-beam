# Backend Data Quality Issues - December 26, 2025

## Overview
This document tracks remaining test failures related to data quality and code logic issues, separate from UI/frontend changes. These require backend data improvements or component logic fixes.

## 1. Dataset Generation Tests (4 failures)
**File**: `tests/datasets/generation.test.js`  
**Type**: Data Quality / Completeness Issues

### Issues
1. **TXT Files Missing Required Parameters**
   - Test expects all 8 parameters present in every TXT file
   - Some materials have incomplete machine settings or material properties
   - **Impact**: Dataset validation fails for materials with sparse data

2. **CSV Row Ordering**
   - Test expects machine settings rows before material properties
   - Backend generator may produce different ordering
   - **Impact**: Structure validation fails

3. **JSON Structure Issues**
   - Test expects machine settings in `variableMeasured` array
   - Backend may organize data differently
   - **Impact**: Schema.org validation fails

### Recommended Action for Backend Team
- **Ensure all 8 parameters are populated** (use calculated ranges or defaults where direct measurements unavailable)
- **Standardize row ordering**: Machine settings → Material properties
- **Follow Schema.org structure**: All parameters in `variableMeasured` array

---

## 2. YAML Integration Tests (3 failures)
**File**: `tests/integration/yaml-typescript-integration.test.ts`  
**Type**: Incomplete Source Data

### Issues
1. **Incomplete Author Objects**
   ```yaml
   # ❌ WRONG - Missing name property
   author:
     id: 4
   
   # ✅ CORRECT - Complete author
   author:
     id: 4
     name: "Alessandro Moretti"
     title: "Ph.D."
     country: "Italy"
   ```
   - **Affected Files**: Multiple settings/materials files
   - **Impact**: Author schema generation fails

2. **Invalid/Missing Breadcrumb Structure**
   ```yaml
   # ❌ WRONG - Not an array or missing
   breadcrumb: null
   
   # ✅ CORRECT - Array structure
   breadcrumb:
     - label: "Home"
       url: "/"
     - label: "Materials"
       url: "/materials"
   ```
   - **Impact**: Breadcrumb schema fails `Array.isArray()` check

3. **Missing Required Properties**
   - Some materials missing `id` field
   - Some contaminants missing `id` field
   - **Impact**: Core validation fails

### Recommended Action for Backend Team
Reference: `docs/reference/BACKEND_METADATA_SPEC.md`

- **Author field**: Always include complete object with `id`, `name`, `title`, `country`
- **Breadcrumb field**: Always generate as array, never null
- **ID field**: Ensure all materials and contaminants have unique `id` property

---

## 3. ItemPage-dataset Test (1 failure)
**File**: `tests/integration/ItemPage-dataset.test.tsx`  
**Type**: Test Setup / Object Mutation Issue

### Issue
Test "should generate Dataset schema with ONLY materialProperties when settings unavailable" is failing because:

1. **Mock object is being mutated**:
   ```typescript
   // ItemPage.tsx line 96 mutates the article object directly
   (article.metadata as any).machineSettings = machineSettings;
   ```

2. **Shared object across tests**:
   ```typescript
   // materialArticle is defined once, shared across all tests
   const materialArticle = { /* ... */ };
   
   // First test adds machineSettings to materialArticle
   // Second test reuses same object with machineSettings still present
   ```

3. **Result**: When test mocks settings as unavailable, powerRange still appears because it was added by previous test

### Recommended Fix
**Option A**: Create fresh copy in beforeEach
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // Create fresh copy to avoid mutation
  const freshMaterial = JSON.parse(JSON.stringify(materialArticle));
  mockConfig.getArticle = jest.fn().mockResolvedValue(freshMaterial);
});
```

**Option B**: Don't mutate article object in ItemPage
```typescript
// Instead of mutating:
(article.metadata as any).machineSettings = machineSettings;

// Create new object:
article = {
  ...article,
  metadata: {
    ...article.metadata,
    machineSettings
  }
};
```

### Priority
**Low** - Test infrastructure issue, not production code bug. Can be fixed when refactoring test suite.

---

## 4. Category Page Test (1 failure)
**File**: `tests/app/category-page.test.tsx`  
**Type**: Jest Infrastructure Issue

### Issue
```
Jest worker encountered 4 child process exceptions, exceeding retry limit
```

### Analysis
- Not a code or data issue
- Jest worker process crashing
- Could be:
  - Memory limit exceeded
  - Circular dependency
  - Async operation not completing
  - Worker pool exhaustion

### Recommended Fix
1. **Isolate the test**: Run alone to see if it passes
2. **Increase worker resources**: Adjust Jest config
   ```json
   {
     "maxWorkers": "50%",
     "workerIdleMemoryLimit": "512MB"
   }
   ```
3. **Check for memory leaks**: Profile test execution
4. **Consider test.sequential**: Force sequential execution if parallel causes issues

### Priority
**Medium** - Infrastructure issue that blocks one test suite. Not critical to production.

---

## Summary

| Issue Type | Count | Priority | Requires Backend Change |
|------------|-------|----------|------------------------|
| Dataset Quality | 4 | High | ✅ Yes - Data completeness |
| YAML Data Quality | 3 | High | ✅ Yes - Author/breadcrumb |
| Test Setup | 1 | Low | ❌ No - Test refactor |
| Jest Infrastructure | 1 | Medium | ❌ No - Config adjustment |

## Next Steps

### For Backend Team
1. **Review** `docs/reference/BACKEND_METADATA_SPEC.md` for field specifications
2. **Populate** missing author properties (name, title, country) in all files
3. **Generate** breadcrumb arrays (never null) for all content
4. **Ensure** all materials/contaminants have unique `id` field
5. **Complete** dataset parameters (all 8 required fields)
6. **Standardize** dataset structure (machine settings → material properties ordering)

### For Frontend Team
1. **Fix** ItemPage test object mutation (fresh copies in beforeEach)
2. **Investigate** category-page Jest worker crash
3. **Document** any additional validation requirements discovered

## Test Status After UI Fixes
- **Total Tests**: 2,630 (excluding skipped)
- **Passing**: 2,619 (99.6%)
- **Failing**: 11 (0.4%)
- **Status**: ✅ All UI-related failures resolved, remaining are data/infrastructure

---

*Last Updated*: December 26, 2025  
*Related Docs*: 
- `docs/reference/BACKEND_METADATA_SPEC.md` - Complete field specifications
- `docs/SYSTEM_INTERACTIONS.md` - Understanding cascading effects
- `.github/copilot-instructions.md` - Development policies
