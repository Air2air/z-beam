# Legacy Type Files - Migration Status

## Overview
This directory contains legacy TypeScript interface definitions that are being gradually migrated to the centralized type system in `/types/core/`.

## Migration Status

### ✅ Fully Migrated (Safe to Remove)
- ~~`materials.ts`~~ - **REMOVED** - All MaterialType and MaterialBadgeData now in `/types/core/badge.ts`

### 🔄 Partially Migrated 
- `content.ts` - ArticleMetadata duplicated in `/types/core/article.ts`, other interfaces need evaluation
- `index.ts` - UI component types migrated to `/types/components/ui.ts`, some legacy exports remain

### 📝 Active Legacy Files
- `Article.ts` - Still used by utils (articleEnrichment, tags, search) - needs structural alignment with centralized types

## Migration Plan

### Phase 4A: UI Type Consolidation ✅
- [x] Move ComponentVariant, ComponentSize to centralized types
- [x] Update helpers.ts to use centralized imports
- [x] Remove materials.ts (completed)

### Phase 4B: Content Type Consolidation (Next)
- [ ] Analyze content.ts interfaces for consolidation opportunities
- [ ] Create migration path for specialized metadata types
- [ ] Update remaining utilities to use centralized Article interface

### Phase 4C: Final Cleanup
- [ ] Remove or deprecate unused interfaces
- [ ] Add re-export compatibility layer if needed
- [ ] Update documentation

## Usage Guidelines

**For New Code**: Always import from `/types/core/` or `/types/components/`

**For Existing Code**: 
- Badge/Material types: Use `/types/core/badge.ts`
- Article types: Use `/types/core/article.ts` 
- UI component types: Use `/types/core/` (re-exports from components)

## Notes
- Test files may contain snapshots referencing old type locations - these are safe to ignore
- Some utilities still use local Article interface due to structural differences - requires careful migration
