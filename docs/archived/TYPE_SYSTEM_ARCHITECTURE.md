# Z-Beam Type System Architecture

## Overview

The Z-Beam application now uses a **centralized type system** that provides a single source of truth for all TypeScript interfaces and types. This eliminates duplicate definitions, ensures consistency, and improves maintainability.

## Architecture

### Single Source of Truth: `types/centralized.ts`

All core types are defined in `types/centralized.ts`, which serves as the authoritative source for:

- **Core Content Types**: ArticleMetadata, AuthorInfo, SearchResultItem
- **UI Component Types**: BadgeData, ComponentData, UIBadgeProps
- **Material Types**: MaterialProperties, CompositionData
- **Specialized Metadata**: MaterialMetadata, ApplicationMetadata, RegionMetadata, ThesaurusMetadata
- **API Types**: SearchApiResponse, MaterialsApiResponse, DebugApiResponse
- **Page Types**: PageProps, TagPageProps (with async params)

### Type Families (`types/families/`)

Type families provide organized import paths while re-exporting from centralized:

- `ComponentTypes.ts` - UI component related types
- `PageTypes.ts` - Page and routing related types  
- `ApiTypes.ts` - API response and request types
- `BaseProps.ts` - Base component properties

### Main Export (`types/index.ts`)

The main index provides convenient access to all types through organized re-exports.

## Key Improvements

### 1. Eliminated Duplicates

**Before**: SearchResultItem was defined in 6 different locations with conflicting fields
**After**: Single comprehensive SearchResultItem in centralized.ts

**Before**: BadgeData conflicts between UI badges and chemical badges
**After**: Unified BadgeData interface supporting both use cases

### 2. Unified Author Types

**Before**: AuthorInfo vs AuthorMetadata with different field structures
**After**: Single AuthorInfo interface supporting both string/number IDs and all field variations

### 3. Modern Page Props

**Before**: Mixed Promise and non-Promise params patterns
**After**: Consistent Promise-based async params throughout (Next.js 14+ pattern)

### 4. Centralized Specialized Metadata

**Before**: MaterialMetadata, ApplicationMetadata, etc. scattered in content types
**After**: All specialized metadata in centralized.ts extending base ArticleMetadata

## Usage Guidelines

### Recommended Import Patterns

```typescript
// ✅ Preferred: Import from main types
import { ArticleMetadata, AuthorInfo, BadgeData } from '@/types';

// ✅ Alternative: Import from centralized directly
import { ArticleMetadata, AuthorInfo, BadgeData } from '@/types/centralized';

// ✅ Organized: Import from type families
import { PageProps, TagPageProps } from '@/types/families/PageTypes';
import { BadgeData } from '@/types/families/ComponentTypes';
```

### Content Types

```typescript
// Base metadata for all content
interface ArticleMetadata {
  id?: string;
  title: string;
  description?: string;
  slug: string;
  category?: string;
  tags?: string[];
  authorInfo?: AuthorInfo;
  // ... additional fields
}

// Specialized metadata extending base
interface MaterialMetadata extends ArticleMetadata {
  articleType: "material";
  nameShort: string;
  atomicNumber?: number;
  chemicalSymbol?: string;
  materialType: string;
  // ... material-specific fields
}
```

### UI Component Types

```typescript
// Unified badge interface supporting both UI and chemical badges
interface BadgeData {
  text?: string;           // UI badge text
  variant?: BadgeVariant;  // UI styling
  color?: BadgeColor;      // UI color
  symbol?: string;         // Chemical symbol
  formula?: string;        // Chemical formula
  atomicNumber?: number;   // Chemical atomic number
}

// Component props with base properties
interface UIBadgeProps {
  text: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: ComponentSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}
```

### API Types

```typescript
// Base API response
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}

// Specific API responses extending base
interface SearchApiResponse extends ApiResponse {
  data?: {
    items: SearchResultItem[];
    total: number;
    page: number;
    limit: number;
  };
}
```

## Migration Guide

### For New Components

1. Import types from `@/types` or `@/types/centralized`
2. Use the comprehensive interfaces (SearchResultItem, BadgeData, etc.)
3. Extend specialized metadata types when needed

### For Existing Components

Most imports should continue working through re-exports, but consider updating to:
- Use centralized types directly
- Remove any local type definitions that duplicate centralized types
- Update to modern Promise-based PageProps if using page components

## Type Categories

### Core Content Types
- `ArticleMetadata` - Base metadata for all content
- `AuthorInfo` - Author information (supports both YAML and CMS data)
- `SearchResultItem` - Comprehensive search result interface
- `ContentItem` - Generic content item structure

### UI Component Types
- `BadgeData` - Unified badge interface (UI + chemical)
- `ComponentData` - Dynamic component configuration
- `UIBadgeProps` - Badge component properties
- `BreadcrumbsProps` - Breadcrumb navigation properties

### Specialized Metadata
- `MaterialMetadata` - Material-specific metadata
- `ApplicationMetadata` - Application-specific metadata  
- `RegionMetadata` - Region-specific metadata
- `ThesaurusMetadata` - Thesaurus term metadata

### API Types
- `SearchApiResponse` - Search API response
- `MaterialsApiResponse` - Materials API response
- `DebugApiResponse` - Debug API response
- `PaginationParams` - Pagination parameters
- `FilterParams` - Filtering parameters

### Page Types
- `PageProps` - Standard page properties with async params
- `TagPageProps` - Tag page specific properties

## Testing

The type system is tested through:

1. **Compilation Tests**: TypeScript compilation ensures type consistency
2. **Integration Tests**: Component tests verify type compatibility
3. **Build Validation**: Production builds validate all type exports

## Benefits

1. **Single Source of Truth**: All types defined in one place
2. **Consistency**: No more conflicting interface definitions
3. **Maintainability**: Easy to update types across entire application
4. **Type Safety**: Comprehensive type coverage with proper inheritance
5. **Developer Experience**: Clear, organized type imports
6. **Future-Proof**: Extensible architecture for new type requirements

## Legacy Compatibility

The system maintains backward compatibility through:
- Re-exports in type families
- Legacy type aliases in centralized.ts
- Gradual migration path for existing components
