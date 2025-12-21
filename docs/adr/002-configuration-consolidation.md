# ADR 002: Configuration Consolidation

## Status
Accepted

## Date
2025-10-15 (Implemented), 2025-12-20 (Documented)

## Context
Configuration values were scattered across multiple locations:
- `app/utils/constants.ts` - Site configuration
- `app/utils/business-config.ts` - Business information
- `app/config/site.ts` - Main config (added later)
- Hardcoded values in 20+ component files
- Duplicate configuration in multiple places

This led to:
- Inconsistent values across the application
- Difficult to update site-wide settings
- No single source of truth
- Maintenance burden

## Decision
Consolidate all configuration into `app/config/site.ts`:
1. Created `app/config/site.ts` as the single source of truth
2. Marked `app/utils/constants.ts` as deprecated (re-exports only)
3. Marked `app/utils/business-config.ts` as deprecated (re-exports only)
4. Updated 20+ files to import from `@/config`
5. Added ESLint rules to prevent deprecated imports

## Consequences

### Positive
- **Single Source of Truth**: All configuration in one file
- **Easy Updates**: Change once, reflects everywhere
- **Type Safety**: TypeScript ensures correct usage
- **Documentation**: Clear structure with comments
- **Discoverability**: New developers know where to look

### Negative
- **Migration Effort**: 20+ files updated
- **Breaking Changes**: Old import paths deprecated
- **Learning**: Developers must learn new import pattern

### Neutral
- Backward compatibility maintained via re-exports
- Gradual migration possible

## Alternatives Considered

1. **Environment Variables Only**
   - Pros: Industry standard, Vercel integration
   - Cons: Not type-safe, hard to document structure

2. **Multiple Config Files by Domain**
   - Pros: Separation of concerns
   - Cons: Harder to find related settings, more imports

3. **JSON Configuration Files**
   - Pros: No code execution
   - Cons: No type safety, no computed values

## Implementation Notes
- `SITE_CONFIG` - Public site configuration (client-safe)
- `BUSINESS_CONFIG` - Business information and services
- `ANIMATION_CONFIG` - Animation preferences
- Deprecated files remain for backward compatibility
- ESLint enforces new import patterns

## Related Decisions
- ADR 001: YAML Schema Validation
- ADR 003: Fail-Fast Architecture

## References
- `docs/03-guides/SITE_CONFIG_GUIDE.md`
- `app/config/site.ts`
- `.eslintrc.json` (no-restricted-imports rules)
