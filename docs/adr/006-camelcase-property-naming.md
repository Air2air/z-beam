# ADR-006: CamelCase Property Naming Standard

## Status
Accepted

## Date
2026-01-07

## Context

The project had inconsistent property naming conventions across YAML frontmatter files, creating confusion and maintenance burden:

1. **Mixed Conventions**: Some properties used snake_case (`material_properties`, `laser_properties`) while newer properties used camelCase
2. **Dual Fallback Chains**: Helper functions required 6+ fallback paths checking both naming conventions
3. **Test-Data Mismatch**: Tests expected `machine_settings` (snake_case) but files contained `machineSettings` (camelCase)
4. **Competing Scripts**: Two normalization scripts with overlapping scope:
   - `normalize-property-names.js` - Converted specific properties, excluded machine_settings
   - `standardize-frontmatter-naming.js` - Converted ALL fields to camelCase
5. **Build Failure**: Property naming conflict blocked production deployment

### Evidence
- 153 settings files used `machineSettings` (camelCase)
- Test expected `machine_settings` (snake_case)
- All relationship helpers checked both conventions: `contaminatedBy || contaminated_by`
- Build failed with 1 test failure: "153 files found with machineSettings (should be machine_settings)"

## Decision

**Adopt camelCase as the canonical naming standard for ALL YAML frontmatter properties.**

All property names in YAML frontmatter files will use JavaScript/TypeScript camelCase convention:
- ✅ `materialProperties` (not material_properties)
- ✅ `laserProperties` (not laser_properties)
- ✅ `machineSettings` (not machine_settings)
- ✅ `contaminatedBy` (not contaminated_by)
- ✅ `regulatoryStandards` (not regulatory_standards)

### Rationale
1. **JavaScript/TypeScript Standard**: camelCase is the industry standard for JS/TS codebases
2. **Consistency**: 90%+ of properties already used camelCase
3. **Simpler Code**: Eliminates need for dual-naming fallback chains (6+ checks → 1)
4. **Type Safety**: Aligns with TypeScript interface naming conventions
5. **Developer Experience**: Matches expectations when working in JS/TS ecosystem

## Consequences

### Positive
- **Consistent Naming**: Single convention across all 442 frontmatter files
- **Cleaner Code**: Relationship helpers simplified from 6+ fallbacks to 1 direct access
- **Better DX**: Developers don't need to remember which convention to use
- **Type Safety**: Interfaces match property names exactly (no manual mapping)
- **Build Success**: All 2,698 tests passing, deployment unblocked

### Negative
- **Migration Required**: Existing snake_case properties need conversion
- **Breaking Change**: External consumers depending on snake_case will need updates
- **Documentation Updates**: All docs referencing old naming need revision

### Neutral
- **Script Maintenance**: Both normalization scripts still needed but with clear separation:
  - `normalize-property-names.js` - Structural properties (materialProperties, machineSettings)
  - `standardize-frontmatter-naming.js` - Metadata fields (pageDescription)

## Alternatives Considered

### 1. Keep snake_case Standard
- **Pros**: No migration needed for machine_settings, matches Python conventions
- **Cons**: Contradicts 90% of existing code, unusual for JS/TS projects
- **Rejected**: Goes against JavaScript/TypeScript ecosystem standards

### 2. Support Both Conventions
- **Pros**: No breaking changes, backward compatibility
- **Cons**: Perpetuates maintenance burden, defensive programming everywhere
- **Rejected**: Creates long-term technical debt

### 3. Mixed Convention (structural = camelCase, metadata = snake_case)
- **Pros**: Distinguishes different property types
- **Cons**: Arbitrary distinction, developers must remember which is which
- **Rejected**: Adds cognitive load without clear benefit

## Implementation Notes

### Files Modified
1. **Test Update**: `tests/integration/yaml-typescript-integration.test.ts`
   - Changed test expectation from `machine_settings` to `machineSettings`
   - Updated validation logic to enforce camelCase

2. **Script Update**: `scripts/normalize-property-names.js`
   - Added mapping: `'machine_settings': 'machineSettings'`
   - Updated documentation to reflect complete camelCase conversion

### Migration Steps
1. ✅ Update normalization script with machine_settings mapping
2. ✅ Run normalization across all frontmatter files (already complete)
3. ✅ Update tests to expect camelCase properties
4. ✅ Verify all 2,698 tests pass
5. 📋 Document decision in ADR (this document)
6. 📋 Update helper functions to remove dual-naming fallbacks (future work)
7. 📋 Add pre-commit hook to prevent snake_case properties (future work)

### Rollout Strategy
- **Phase 1**: Fix blocking test (COMPLETE)
- **Phase 2**: Document decision (COMPLETE)
- **Phase 3**: Simplify helper functions (PLANNED)
- **Phase 4**: Add enforcement hooks (PLANNED)

## Related Decisions
- **ADR-003**: Fail-Fast Architecture - Property naming enforced at build time
- **ADR-005**: Dataset Consolidation - Consistent naming improves data quality

## References
- Investigation Report: `docs/ARCHITECTURAL_INVESTIGATION_JAN7_2026.md`
- Test Suite: `tests/integration/yaml-typescript-integration.test.ts`
- Normalization Script: `scripts/normalize-property-names.js`
- Helper Functions: `app/utils/relationshipHelpers.ts`
- TypeScript Interfaces: `types/frontmatter-relationships.ts`

## Future Work

### Remove Dual-Naming Fallbacks
Current relationship helpers check both conventions:
```typescript
// BEFORE (defensive programming)
relationships?.interactions?.contaminatedBy ||
relationships?.interactions?.contaminated_by ||
relationships?.technical?.contaminatedBy ||
relationships?.technical?.contaminated_by ||
relationships?.contaminatedBy ||
relationships?.contaminated_by
```

After ADR enforcement:
```typescript
// AFTER (clean, direct access)
relationships?.interactions?.contaminatedBy
```

**Impact**: Reduce code complexity by ~60% in relationship helpers

### Add Pre-Commit Enforcement
Prevent snake_case properties from being added:
```bash
# .git/hooks/pre-commit
if grep -r "^[[:space:]]*[a-z_]+_[a-z_]+:" frontmatter/; then
  echo "ERROR: snake_case property names detected"
  exit 1
fi
```

### TypeScript Interface Updates
Ensure all interfaces reflect camelCase naming:
```typescript
// types/settings.ts
interface SettingsYAML {
  machineSettings: MachineSettings;  // Not machine_settings
  materialProperties: MaterialProperties;  // Not material_properties
}
```

---

**Decision Made By**: Development Team  
**Approved By**: Architecture Review  
**Implementation Date**: January 7, 2026  
**Status**: ACCEPTED - Actively Enforced
