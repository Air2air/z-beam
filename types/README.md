# Z-Beam Type Definitions

This directory contains TypeScript type definitions for the Z-Beam laser cleaning content generation system.

## Files

### `safetyData.ts` 🔥 **NEW (Jan 2, 2026)**

Complete type definitions for normalized safety data structure.

**Purpose**: Provide type safety for safety information across all content types (contaminants, compounds, materials).

**Key Types**:
- `NormalizedSafetyData` - Complete safety data structure
- `SafetySection<T>` - Wrapper for all safety fields
- `RiskAssessment` - Risk card data (fire, toxic gas, visibility)
- `PPERequirements` - Personal protective equipment
- `VentilationRequirements` - Ventilation specifications
- `ExposureLimits` - OSHA/NIOSH/ACGIH limits
- Plus many more...

**Usage**:
```typescript
import type { NormalizedSafetyData, PPERequirements } from '@/types/safetyData';

// Component props
interface SafetyPanelProps {
  safetyData: NormalizedSafetyData;
}

// Extract specific field
const ppeData = extractSafetyItem<PPERequirements>(safetyData.ppe_requirements);
```

**Documentation**: See [docs/SAFETY_DATA_NORMALIZATION_E2E.md](../docs/SAFETY_DATA_NORMALIZATION_E2E.md)

### `centralized.ts`

Centralized type definitions for UI components. All shared component types should be defined here to avoid duplication.

**Key Types**:
- `IconProps` - Standard icon component props
- `BadgeProps` - Badge component props
- `CardProps` - Card component props
- `ButtonProps` - Button component props
- `Author` - Author metadata
- `ArticleMetadata` - Article frontmatter
- Plus many more...

**Usage**:
```typescript
import type { IconProps, Author } from '@/types';
```

### `index.ts`

Main export file for all types. Import types from here:

```typescript
import type { 
  IconProps, 
  Author, 
  NormalizedSafetyData 
} from '@/types';
```

## Type System Standards

### 1. **Centralization**
- ❌ **NEVER** create duplicate type definitions in component files
- ✅ **ALWAYS** import from `@/types` or `@/types/centralized`
- ✅ **ALWAYS** check `types/centralized.ts` before creating new types

### 2. **Naming Conventions**
- Use `PascalCase` for type and interface names
- Use descriptive names: `PPERequirements` not `PPE`
- Suffix props interfaces: `ComponentNameProps`
- Use `is/has/can` prefixes for booleans: `isLoading`, `hasError`

### 3. **Documentation**
- Add JSDoc comments for complex types
- Include examples in comments
- Link to related documentation

### 4. **Normalization**
- All safety data uses normalized structure: `{presentation: string, items: T[]}`
- Support both normalized and legacy formats where needed
- Use helper functions for extraction: `extractSafetyItem<T>()`

## Safety Data Migration

The safety data types support a normalization initiative to standardize safety information across all content types.

**Timeline**: 4 weeks (Contaminants → Compounds → Components → Testing)

**Status**: Planning complete, ready for implementation

**Resources**:
- Migration script: `scripts/migrate_safety_data.py`
- Documentation: `docs/SAFETY_DATA_NORMALIZATION_E2E.md`
- Component updates: `app/components/SafetyDataPanel/SafetyDataPanel.tsx`

## Testing

Type definitions are tested through:
1. TypeScript compilation (type checking)
2. Component integration tests
3. Validation tests (`tests/types/centralized.test.ts`)

## Contributing

When adding new types:

1. **Check for existing types** in `centralized.ts`
2. **Add to appropriate file**:
   - UI components → `centralized.ts`
   - Safety data → `safetyData.ts`
   - New category → create new file, export in `index.ts`
3. **Document with JSDoc**
4. **Export in `index.ts`**
5. **Update this README**

## Related Documentation

- [Type Consolidation Dec 21, 2025](../docs/08-development/TYPE_CONSOLIDATION_DEC21_2025.md)
- [Safety Data Normalization](../docs/SAFETY_DATA_NORMALIZATION_E2E.md)
- [Naming Conventions](../docs/08-development/NAMING_CONVENTIONS.md)
