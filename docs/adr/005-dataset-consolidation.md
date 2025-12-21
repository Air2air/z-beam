# ADR 005: Dataset Consolidation Architecture

**Status**: Accepted  
**Date**: 2025-12-20  
**Deciders**: @todddunning  
**Tags**: datasets, architecture, consolidation, breaking-change

## Context

Current dataset architecture splits related data across multiple files:
- Materials: `materials/[name]-laser-cleaning.json` (properties only)
- Settings: `settings/[name]-settings.json` (machine parameters only)
- Contaminants: `contaminants/[name]-contamination.json` (contaminant data)
- Compounds: `compounds/[name]-compound.json` (chemical formulas separately)

**Problems**:
1. **Data fragmentation**: Related information split across 2 files per entity
2. **Incomplete datasets**: 848 issues found (missing variableMeasured, citations, distribution)
3. **Settings datasets broken**: 132+ settings files missing core Dataset schema fields
4. **No enforcement**: Tests don't validate mandatory consolidation
5. **API complexity**: Clients must fetch 2 files to get complete data

**Quality Impact**: Grade C (70/100) - Fragmented, incomplete, inconsistent

## Decision

**We will consolidate datasets into 2 unified structures:**

### 1. Material Datasets (Materials + Settings)
**Path**: `public/datasets/materials/[name]-laser-cleaning.json`

**Combines**:
- Material properties (thermal, optical, mechanical)
- Machine settings (laser parameters) ← **MERGED**
- Safety data
- Complete citations and variables

### 2. Contaminant Datasets (Contaminants + Compounds)
**Path**: `public/datasets/contaminants/[name]-contamination.json`

**Combines**:
- Contaminant properties
- Chemical compounds ← **MERGED**
- Removal techniques
- Complete citations and variables

## Mandatory Requirements

### All Datasets MUST Have:
1. ✅ `variableMeasured` array with **≥20 variables** (enforced by schema)
2. ✅ `citation` array with **≥3 citations** (enforced by schema)
3. ✅ `distribution` array with 3 formats: JSON, CSV, TXT (enforced by schema)
4. ✅ `measurementTechnique` string ≥10 characters (enforced by schema)
5. ✅ `license`, `creator`, `publisher` objects (enforced by schema)

### Material Datasets MUST Have:
1. ✅ `material.machineSettings` object (enforced by schema)
2. ✅ Machine settings include: powerRange, wavelength, spotSize, repetitionRate, pulseWidth, scanSpeed
3. ✅ `material.materialProperties` object

### Contaminant Datasets MUST Have:
1. ✅ `contaminant.properties` object
2. ✅ `contaminant.removalTechniques` object
3. ✅ `contaminant.compounds` array (if chemical contaminant)

## Alternatives Considered

### Option A: Keep Current Fragmented Structure
**Pros:**
- No migration needed
- No breaking changes

**Cons:**
- Perpetuates 848 known issues
- Settings datasets unusable (missing required fields)
- API complexity (2 requests per entity)
- Poor user experience

**Verdict**: ❌ Rejected - Maintains technical debt

### Option B: Consolidate with Optional Fields
**Pros:**
- Easier migration
- Gradual compliance

**Cons:**
- Doesn't solve completeness problem
- Tests can't enforce quality
- Still allows incomplete datasets

**Verdict**: ❌ Rejected - Doesn't meet quality standards

### Option C: Full Consolidation with Mandatory Fields (CHOSEN)
**Pros:**
- Single dataset per entity
- 100% schema compliance enforced
- Automated tests prevent regressions
- API simplification (1 request per entity)
- Clear quality standards

**Cons:**
- Breaking change (settings URLs deprecated)
- Requires migration script
- One-time effort

**Verdict**: ✅ Accepted - Best long-term solution

## Implementation

### Phase 1: Create Infrastructure
1. ✅ JSON schemas: `schemas/dataset-material.json`, `schemas/dataset-contaminant.json`
2. ✅ Validation tests: `tests/datasets/dataset-architecture.test.ts`
3. ✅ Merger script: `scripts/datasets/merge-datasets.js`
4. ✅ Specification: `docs/specs/DATASET_CONSOLIDATION_SPEC.md`

### Phase 2: Execute Migration
```bash
# Merge all datasets
node scripts/datasets/merge-datasets.js

# Verify consolidation
npm test -- tests/datasets/dataset-architecture.test.ts

# Expected outcome: 230 unified datasets, 0 validation errors
```

### Phase 3: Cleanup
- Delete `public/datasets/settings/` directory
- Delete `public/datasets/compounds/` directory
- Update API documentation
- Add deprecation notices

## Consequences

### Positive
- **Single source of truth**: One dataset per entity with complete data
- **100% compliance**: All datasets validated against schemas
- **API simplification**: One request gets all data
- **Test enforcement**: Architecture tests prevent fragmentation
- **Better quality**: Mandatory fields ensure completeness

### Negative
- **Breaking change**: `/datasets/settings/*` URLs no longer exist
- **Migration effort**: 8-12 hours to implement and validate
- **Backward compatibility**: Applications using settings endpoints must update

### Mitigation
- **API redirects**: Redirect old settings URLs to unified material datasets
- **Documentation**: Clear migration guide for API consumers
- **Gradual rollout**: Test on staging before production
- **Rollback plan**: Git history allows reverting if needed

## Metrics

**Before**:
- 421 datasets
- 848 validation issues
- Settings files incomplete (0% schema compliance)
- 2 API requests per material

**After Target**:
- 230 unified datasets
- 0 validation issues
- 100% schema compliance
- 1 API request per entity

**Success Criteria**:
- ✅ All tests pass: `tests/datasets/dataset-architecture.test.ts`
- ✅ Zero schema validation errors
- ✅ All datasets have ≥20 variables, ≥3 citations, distribution array
- ✅ Settings directory deleted
- ✅ Compounds directory deleted

## Monitoring

**Automated Enforcement**:
```typescript
// Tests will fail if:
- public/datasets/settings/ directory exists
- public/datasets/compounds/ directory exists
- Any dataset has <20 variables
- Any dataset has <3 citations
- Any dataset missing distribution array
- Any dataset fails JSON schema validation
```

**CI/CD Integration**:
- Tests run on every commit
- Deployment blocked if dataset architecture tests fail
- Pre-commit hooks validate new datasets

## Related ADRs
- ADR 001: YAML Schema Validation (establishes validation approach)
- ADR 003: Fail-Fast Architecture (enforces strict validation)

## References
- Specification: `docs/specs/DATASET_CONSOLIDATION_SPEC.md`
- Material Schema: `schemas/dataset-material.json`
- Contaminant Schema: `schemas/dataset-contaminant.json`
- Migration Script: `scripts/datasets/merge-datasets.js`
- Architecture Tests: `tests/datasets/dataset-architecture.test.ts`

---

**Last Updated**: 2025-12-20  
**Status**: Ready for execution  
**Execution Command**: `node scripts/datasets/merge-datasets.js`
