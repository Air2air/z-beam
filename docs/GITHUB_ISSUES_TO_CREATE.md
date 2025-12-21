# GitHub Issues to Create

**Purpose**: Track issues referenced in code but not yet created in GitHub

**Created**: December 20, 2025  
**Status**: Pending issue creation

---

## Issue 1: Implement Relationship Mapper Utilities

**Title**: Create relationship mapper utilities for domain linkage components

**Labels**: enhancement, refactoring, architecture

**Description**:
The `DomainLinkageSection` component currently has inline placeholder functions that should be extracted to proper utility modules.

**Files Affected**:
- `app/components/DomainLinkages/DomainLinkageSection.tsx` (line 7)

**Current State**:
```typescript
// NOTE: Commented imports pending implementation of relationship mapper utilities
// See: https://github.com/z-beam/z-beam/issues/TBD-relationship-mapper
// import { linkagesToGridItems } from '@/app/utils/relationshipMapper';
// import type { RelationshipSectionProps } from '@/types/domain-linkages';
```

**Required Implementation**:
1. Create `app/utils/relationshipMapper.ts` with `linkagesToGridItems()` function
2. Create `types/domain-linkages.ts` with `RelationshipSectionProps` interface
3. Update `DomainLinkageSection.tsx` to use imported utilities
4. Remove inline placeholder functions
5. Add tests for relationship mapper

**Priority**: Medium  
**Estimated Effort**: 2-3 hours

---

## Issue 2: Align MaterialJsonLD Component Props Interface

**Title**: Update MaterialJsonLD prop interface to match test expectations

**Labels**: bug, testing, refactoring

**Description**:
The `MaterialJsonLD` component expects `{ article, slug }` props but tests provide `{ data }`, causing 294 tests to be skipped.

**Files Affected**:
- `tests/unit/AuthorSchemaEnhancements.test.tsx` (all 294 tests skipped)
- `app/components/JsonLD/JsonLD.tsx` (MaterialJsonLD component)

**Current State**:
```typescript
// NOTE: Test suite skipped pending MaterialJsonLD prop interface updates
// Issue: Component expects { article, slug } but test provides { data }
// See: https://github.com/z-beam/z-beam/issues/TBD-materialjsonld-props
// Decision: Keep test for future implementation validation
describe.skip('Author Schema Enhancements', () => {
```

**Options**:
A. Update MaterialJsonLD to accept `{ data }` prop (breaking change)  
B. Update tests to provide `{ article, slug }` (recommended)  
C. Add adapter to support both prop formats

**Required Implementation**:
1. Review MaterialJsonLD actual implementation
2. Update test data structure to match component expectations
3. Re-enable 294 tests
4. Verify all tests pass

**Priority**: High  
**Estimated Effort**: 3-4 hours

---

## Issue 3: Integrate Machine Settings with Dataset Schema

**Title**: Populate Dataset variableMeasured from machine settings

**Labels**: enhancement, schema, seo

**Description**:
Dataset schema should include `variableMeasured` field populated from machine settings data, but integration is not yet implemented.

**Files Affected**:
- `tests/integration/ItemPage-dataset.test.tsx` (line 132 - 1 test skipped)
- `app/utils/schemas/generators/dataset.ts` (needs implementation)

**Current State**:
```typescript
it.skip('Dataset schema should include variableMeasured from machineSettings', async () => {
  // NOTE: Test pending machine settings schema integration
  // See: https://github.com/z-beam/z-beam/issues/TBD-machine-settings-schema
  // Blocks: Dataset variableMeasured field population
```

**Required Implementation**:
1. Map machine settings properties to variableMeasured array
2. Add schema validation for variableMeasured structure
3. Update dataset generator to include machine settings data
4. Re-enable test and verify passing

**Priority**: Low  
**Estimated Effort**: 2-3 hours

---

## Issue 4: Type Families Architecture Decision

**Title**: Decide on type organization strategy: families vs flat

**Labels**: architecture, decision, types

**Description**:
Tests exist for `types/families/` structure but it was never implemented. Current system uses flat file structure in `types/` directory. Need architectural decision on future direction.

**Files Affected**:
- `tests/integration/type-families.test.ts` (all tests skipped)

**Current State**:
```typescript
/**
 * ARCHITECTURE DECISION: Tests skipped - types/families/ structure not implemented
 * Current System: Flat file structure in types/ directory
 * Decision: Keep tests as specification for potential future refactor
 * See: docs/adr/TBD-type-organization-strategy.md
 */
```

**Options**:
A. Implement families structure (requires major refactor of 30+ files)  
B. Remove tests and formalize flat structure (recommended)  
C. Keep as-is (documents intended architecture but adds maintenance burden)

**Required Action**:
1. Create ADR documenting decision
2. Either implement families OR remove tests
3. Update documentation to reflect chosen approach

**Priority**: Low  
**Estimated Effort**: 1-2 hours for ADR only, 8-12 hours if implementing families

---

## Summary

| Issue | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Relationship Mapper | Medium | 2-3h | Cleaner architecture |
| MaterialJsonLD Props | High | 3-4h | Re-enables 294 tests |
| Machine Settings Schema | Low | 2-3h | Better SEO metadata |
| Type Organization | Low | 1-2h | Resolves architectural ambiguity |

**Total Estimated Effort**: 8-12 hours  
**Recommended Order**: #2 (high impact), #1 (medium priority), #3, #4

---

**Next Steps**:
1. Create these issues in GitHub
2. Update code references with actual issue numbers
3. Assign to appropriate team members
4. Link issues to project board
