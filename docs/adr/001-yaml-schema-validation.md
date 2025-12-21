# ADR 001: YAML Schema Validation

## Status
Accepted

## Date
2025-12-20

## Context
The Z-Beam codebase has 500+ YAML frontmatter files that define materials, contaminants, and settings. These files are the single source of truth for content but had no automated validation, leading to:
- Schema mismatches between YAML (snake_case) and TypeScript (camelCase)
- 154 files with `machineSettings` vs `machine_settings` inconsistencies
- Missing required fields discovered only at runtime
- No enforcement of data structure consistency

## Decision
Implement comprehensive YAML schema validation system using JSON Schema:
1. Created `schemas/frontmatter-v5.0.0.json` - JSON Schema definition
2. Created `scripts/validate-yaml-schemas.js` - Automated validation script
3. Created `tests/integration/yaml-typescript-integration.test.ts` - 17 integration tests
4. Added validation to pre-commit hooks via `.husky/pre-commit`

## Consequences

### Positive
- **Early Detection**: Schema violations caught at build time, not runtime
- **Type Safety**: Ensures YAML files match TypeScript type expectations
- **Documentation**: JSON Schema serves as living documentation of data structure
- **Quality Gates**: Prevents invalid data from entering the system
- **Developer Experience**: Clear error messages with file paths and violation details

### Negative
- **Build Time**: Adds ~2-3 seconds to pre-commit hooks
- **Maintenance**: JSON Schema must be updated when data structure changes
- **Learning Curve**: Developers need to understand JSON Schema syntax

### Neutral
- Validation runs automatically, no manual intervention required
- Failed commits require fixing violations before proceeding

## Alternatives Considered

1. **TypeScript-only validation**
   - Pros: Single language, type inference
   - Cons: Runs after YAML parsing, doesn't validate file structure

2. **Custom validation scripts**
   - Pros: Full control, flexible rules
   - Cons: No standard format, harder to maintain

3. **YAML linters**
   - Pros: Syntax validation
   - Cons: No semantic validation, no type checking

## Implementation Notes
- Schema validation runs in pre-commit hooks
- Integration tests verify end-to-end YAML → TypeScript data flow
- All 154 settings files now use `machine_settings` (snake_case)
- Validation covers: required fields, date formats, ID patterns, enum values

## Related Decisions
- ADR 002: Configuration Consolidation
- ADR 003: Fail-Fast Architecture

## References
- `docs/ARCHITECTURAL_IMPROVEMENTS_SUMMARY.md`
- `schemas/frontmatter-v5.0.0.json`
- `scripts/validate-yaml-schemas.js`
- `tests/integration/yaml-typescript-integration.test.ts`
