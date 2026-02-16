# Test Coverage & Testing TODO

**Created**: January 16, 2026  
**Priority**: Medium (Quality improvement)  
**Impact**: Increased test coverage from ~93% to 95%+

---

## ✅ Completed

### Test Fixes (January 16, 2026)
- ✅ Fixed all 9 failing tests in `staticPageLoader.test.ts` and `jsonld-enforcement.test.ts`
- ✅ Updated tests to match new YAML-based architecture
- ✅ Changed from `loadStaticPageContent` → `loadStaticPageFrontmatter`
- ✅ Updated test expectations for factory pattern (`createStaticPage`)
- ✅ Fixed export pattern validation (accepts both `export { }` and destructuring)
- ✅ Migrated netalux page to factory pattern
- ✅ All 2936 tests passing (0 failures)
- ✅ TypeScript compilation clean (0 errors)

---

## 📋 Remaining Work

### 1. Test Coverage for createStaticPage.tsx
**Priority**: HIGH  
**Current Coverage**: 0%  
**Target Coverage**: 85%+

**Required Tests**:
- [ ] Test factory function for all page types ('dynamic', 'contentCards', 'comparison')
- [ ] Test generateMetadata function output
- [ ] Test page component rendering
- [ ] Test error handling for missing YAML files
- [ ] Test error handling for invalid page types
- [ ] Test YAML frontmatter loading
- [ ] Test content section rendering
- [ ] Test clickable card rendering
- [ ] Test schema generation for each page type
- [ ] Test breadcrumb generation

**File Location**: `tests/utils/pages/createStaticPage.test.tsx` (new file)

**Estimated Effort**: 4-6 hours

---

### 2. Integration Tests for YAML Static Pages
**Priority**: MEDIUM  
**Current Coverage**: Partial (unit tests only)  
**Target**: Full integration tests

**Required Tests**:
- [ ] End-to-end test: Load YAML → Generate page → Verify output
- [ ] Test all static pages (about, rental, comparison, netalux)
- [ ] Test metadata generation for each page
- [ ] Test JSON-LD schema generation
- [ ] Test hero image handling
- [ ] Test section metadata (title, description, icon)
- [ ] Test content card rendering
- [ ] Test clickable card rendering

**File Location**: `tests/integration/staticPages.test.tsx` (new file)

**Estimated Effort**: 3-4 hours

---

### 3. Breadcrumb Migration Tests
**Priority**: MEDIUM  
**Current Status**: Manual testing only  
**Target**: Automated regression tests

**Required Tests**:
- [ ] Test breadcrumb prop removed from Layout component
- [ ] Test breadcrumb generation in page components
- [ ] Test breadcrumb display on all page types
- [ ] Test breadcrumb JSON-LD schema integration

**File Location**: `tests/components/breadcrumbs.test.tsx` (enhance existing)

**Estimated Effort**: 1-2 hours

---

### 4. ContentSection Props Migration Tests
**Priority**: LOW  
**Current Status**: Working in production  
**Target**: Prevent regression

**Required Tests**:
- [ ] Test new `title` prop rendering
- [ ] Test new `items` prop rendering
- [ ] Test backward compatibility (if needed)
- [ ] Test section metadata display
- [ ] Test icon rendering

**File Location**: `tests/components/ContentSection.test.tsx` (enhance existing)

**Estimated Effort**: 1-2 hours

---

### 5. YAML Frontmatter Validation Tests
**Priority**: MEDIUM  
**Current Status**: Schema validation only  
**Target**: Comprehensive validation

**Required Tests**:
- [ ] Test required fields (pageTitle, pageDescription)
- [ ] Test optional fields (sections, hero, clickableCards)
- [ ] Test invalid YAML handling
- [ ] Test missing YAML file handling
- [ ] Test schema validation errors

**File Location**: `tests/utils/staticPageLoader.test.ts` (enhance existing)

**Estimated Effort**: 2-3 hours

---

### 6. Static Page Factory Pattern Tests
**Priority**: HIGH  
**Current Status**: Architecture tests only  
**Target**: Comprehensive factory tests

**Required Tests**:
- [ ] Test factory with all valid page types
- [ ] Test factory with invalid page types
- [ ] Test factory error messages
- [ ] Test factory return values (generateMetadata, Page component)
- [ ] Test factory with missing config
- [ ] Test factory with malformed config

**File Location**: `tests/utils/pages/createStaticPage.test.tsx` (same as #1)

**Estimated Effort**: 2-3 hours (overlap with #1)

---

## 📊 Coverage Goals

**Current State**:
- Overall Test Coverage: ~93%
- createStaticPage.tsx: 0%
- app/utils/pages: 17.54%

**Target State**:
- Overall Test Coverage: 95%+
- createStaticPage.tsx: 85%+
- app/utils/pages: 80%+

---

## 🚀 Priority Order

1. **createStaticPage.tsx tests** (HIGH) - Critical infrastructure
2. **YAML frontmatter validation** (MEDIUM) - Prevent data errors
3. **Integration tests** (MEDIUM) - Ensure end-to-end works
4. **Breadcrumb tests** (MEDIUM) - Prevent regression
5. **ContentSection tests** (LOW) - Already working well
6. **Factory pattern tests** (overlap with #1)

---

## 📝 Notes

- All tests currently passing (2936/2936)
- TypeScript compilation clean
- Architecture migration complete
- Factory pattern working in production
- YAML loading stable
- No blocking issues

---

## ⏱️ Total Estimated Effort

**Total Time**: 13-20 hours  
**Can be completed incrementally** without blocking production deployment

---

## 🎯 Success Criteria

✅ **Test coverage >= 95%**  
✅ **0 failing tests**  
✅ **0 TypeScript errors**  
✅ **All critical paths tested**  
✅ **Regression tests in place**  
✅ **Documentation updated**

---

## 🔗 Related Files

- `/tests/utils/staticPageLoader.test.ts` - Static page loading tests
- `/tests/architecture/jsonld-enforcement.test.ts` - Architecture enforcement
- `/app/utils/pages/createStaticPage.tsx` - Factory to be tested (0% coverage)
- `/app/utils/staticPageLoader.ts` - YAML loader (12% coverage)

---

## 📚 References

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
