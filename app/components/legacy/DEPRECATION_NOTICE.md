# Component Deprecation Archive

This directory contains legacy components that have been deprecated and archived as of January 31, 2026.

---

## SectionContainer_Deprecated

**Status**: ⚠️ ARCHIVED - Replaced by BaseSection  
**Archive Date**: January 31, 2026  
**Reason**: Component consolidated into unified BaseSection architecture  
**Last Used**: Phase 2 Component Migration - All instances migrated to BaseSection

### Migration Path

If you encounter any references to SectionContainer:

1. Replace component import:
   ```typescript
   // OLD
   import SectionContainer from '@/components/SectionContainer';
   
   // NEW
   import { BaseSection } from '@/components/BaseSection';
   ```

2. Update JSX props mapping:
   ```typescript
   // OLD
   <SectionContainer
     title="Title"
     bgColor="gray-50"
     radius={true}
     horizPadding={true}
   >
     Content
   </SectionContainer>
   
   // NEW
   <BaseSection
     title="Title"
     variant="gray-50"
     rounded={true}
     horizPadding={true}
   >
     Content
   </BaseSection>
   ```

3. Property mapping reference:
   | Old (SectionContainer) | New (BaseSection) |
   |---|---|
   | `bgColor="..."` | `variant="..."` |
   | `radius={true/false}` | `rounded={true/false}` |
   | `horizPadding` | `horizPadding` (unchanged) |
   | `title` | `title` (unchanged) |
   | `icon` | `icon` (unchanged) |
   | `action` | `action` (unchanged) |

### Type Definitions

Deprecated type interfaces:
- `SectionContainerProps` - Archived in `types/centralized.ts`
- `SectionContainerBaseProps` - Archived in `types/centralized.ts`
- `SectionContainerInternalProps` - Archived in `types/centralized.ts`

**New Standard**: Use `BaseSectionProps` from `types/centralized.ts`

### Why This Change?

The migration to BaseSection unified multiple legacy patterns:
- ✅ Single, consolidated component interface
- ✅ Strict prop validation with TypeScript
- ✅ Consistent styling across all sections
- ✅ Better accessibility and semantic HTML
- ✅ Reduced bundle size (fewer components)
- ✅ Improved performance and maintainability

### Accessing Archived Code

If you need to reference the old SectionContainer implementation for historical reasons:

```bash
# View archived component
cat /Users/todddunning/Desktop/Z-Beam/z-beam/app/components/legacy/SectionContainer_Deprecated/SectionContainer.tsx

# View archived exports
cat /Users/todddunning/Desktop/Z-Beam/z-beam/app/components/legacy/SectionContainer_Deprecated/index.ts
```

---

## Summary

All active uses of SectionContainer have been migrated to BaseSection as of Phase 2 (January 31, 2026). This archive ensures the code history is preserved while keeping the active component directory clean and maintainable.

**For questions or issues with the migration, refer to**:
- Phase 2 completion documentation: `PHASE_2_COMPLETION_JAN31_2026.md`
- BaseSection documentation: `app/components/BaseSection/README.md`
- Type definitions: `types/centralized.ts` (search for BaseSectionProps)
