# ADR 004: Skipped Test Strategy

**Status**: Accepted  
**Date**: 2025-12-20  
**Deciders**: @todddunning  
**Tags**: testing, technical-debt, documentation

## Context

The test suite contains 193 skipped tests (6.8% of total suite) across multiple domains:
- **CookieConsent**: 37 tests (timing/async issues)
- **static-pages**: 10 tests (unimplemented routes)
- **AuthorSchemaEnhancements**: All tests (prop interface mismatch)
- **type-families**: All tests (architecture not implemented)
- **ItemPage-dataset**: 1 test (machine settings schema pending)

### Problem Statement

Skipped tests present several challenges:
1. **Lost coverage**: Features without test validation
2. **Technical debt**: Unclear which tests are obsolete vs blocked
3. **Maintenance burden**: Tests drift further from implementation over time
4. **Documentation gap**: No clear plan for resolution

### Options Considered

#### Option A: Delete All Skipped Tests
**Pros:**
- Clean test suite (100% running tests)
- No maintenance burden
- Clear metrics

**Cons:**
- Lose specification for intended behavior
- Must rewrite tests if features implemented
- No record of known issues

#### Option B: Fix All Skipped Tests Immediately
**Pros:**
- Full test coverage
- No technical debt

**Cons:**
- High time investment (40-60 hours estimated)
- May require implementing unplanned features
- Blocks other priorities

#### Option C: Document and Categorize (CHOSEN)
**Pros:**
- Preserves specification value
- Clear action plan for each category
- Manageable scope
- Enables incremental progress

**Cons:**
- Tests remain skipped (visual debt)
- Requires ongoing categorization
- Need discipline to maintain documentation

## Decision

**We will adopt Option C: Document and categorize skipped tests**

### Implementation

**1. Categorization System**

Every skipped test must be categorized:
```typescript
// CATEGORY: [BLOCKED|OBSOLETE|TIMING|PLANNED]
// REASON: [One sentence explanation]
// ISSUE: https://github.com/z-beam/z-beam/issues/[number]
// ACTION: [Fix|Remove|Implement feature first|Investigate]
it.skip('test description', () => {
  // test code
});
```

**2. Category Definitions**

- **BLOCKED**: Test valid but blocked by missing dependency
  - Action: Document blocking issue, fix when unblocked
  - Example: Machine settings schema integration

- **OBSOLETE**: Test for removed/changed feature
  - Action: Remove test completely
  - Example: Static pages route (never implemented)

- **TIMING**: Test has race conditions or async issues
  - Action: Fix test implementation (not feature)
  - Example: CookieConsent async timing

- **PLANNED**: Test for future feature (specification)
  - Action: Keep as specification, implement when prioritized
  - Example: Type families architecture

**3. Quarterly Review Process**

Every quarter, review all skipped tests:
1. Update category if status changed
2. Remove OBSOLETE tests
3. Attempt to unblock BLOCKED tests
4. Fix TIMING issues if time permits
5. Reassess PLANNED test priority

**4. New Test Guidelines**

New tests should NOT be skipped unless:
- Feature explicitly planned for future (use PLANNED category)
- Test documents known bug (use BLOCKED category with issue number)
- Test has temporary timing issue (use TIMING with fix plan)

## Consequences

### Positive
- **Specification preservation**: Tests document intended behavior
- **Technical debt visibility**: Clear categorization shows what needs fixing
- **Incremental progress**: Can address categories systematically
- **Reduced maintenance**: Documentation prevents tests from being forgotten

### Negative
- **Visible debt**: Test metrics show 193 skipped (looks bad)
- **Maintenance burden**: Must keep documentation current
- **Discipline required**: Easy to skip categorization step

### Mitigation
- Add pre-commit hook reminding to categorize new skipped tests
- Create GitHub issue template for blocking dependencies
- Document quarterly review in runbook
- Report test metrics excluding known categories

## Tracking

### Current Status (2025-12-20)
- **Total Skipped**: 193 tests (6.8%)
- **Categorized**: 4 files (AuthorSchemaEnhancements, type-families, ItemPage-dataset, DomainLinkageSection)
- **Remaining**: 189 tests (CookieConsent, static-pages, others)

### Success Metrics
- All skipped tests categorized by 2025-12-31
- OBSOLETE tests removed by 2026-01-15
- TIMING issues fixed by 2026-02-01
- BLOCKED tests unblocked as dependencies resolve

### Related ADRs
- ADR 003: Fail-Fast Architecture (explains why tests catch errors early)
- ADR 001: YAML Schema Validation (example of fixing blocked tests)

## References
- Jest documentation: https://jestjs.io/docs/api#testskipname-fn
- Test suite status: `npm test -- --listTests`
- Skipped test search: `grep -r "describe.skip\|it.skip" tests/`

---

**Last Updated**: 2025-12-20  
**Next Review**: 2026-03-20 (quarterly)
