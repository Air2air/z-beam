# Type Families Documentation

## Overview

The Z-Beam type system is now organized into logical families for better maintainability and developer experience.

## Type Families Structure

```
types/families/
├── BaseProps.ts      # Foundational prop interfaces
├── PageTypes.ts      # Page-related interfaces and metadata
├── ComponentTypes.ts # Component-specific interfaces
├── ApiTypes.ts       # API-related interfaces
└── index.ts          # Consolidated exports
```

## Usage Examples

### Import Entire Family
```typescript
// Import all types from families
import { PageProps, ArticleMetadata, AuthorInfo } from '@/types/families';

// Import from specific family files
import { BaseInteractiveProps, FadeInProps } from '@/types/families/BaseProps';
import { ComponentVariant, BadgeData } from '@/types/families/ComponentTypes';
import { ApiResponse, SearchApiResponse } from '@/types/families/ApiTypes';
```

### Legacy Imports (Still Supported)
```typescript
// These still work for backward compatibility
import { PageProps, ArticleMetadata } from '@/types';
import { BaseInteractiveProps } from '@/types/centralized';
```

## Type Family Contents

### BaseProps.ts
- `BaseInteractiveProps` - Foundation for clickable elements
- `BaseContentProps` - Foundation for content display
- `BaseImageProps` - Foundation for image components
- `BaseLinkProps` - Foundation for link components
- `FadeInProps` - Animation props
- `BreadcrumbItem` - Navigation breadcrumb item

### PageTypes.ts
- `PageProps` - Standard Next.js page props
- `TagPageProps` - Tag-specific page props
- `PropertyPageProps` - Property-specific page props
- `ArticleMetadata` - Complete article metadata structure
- `AuthorInfo` - Author information
- `LayoutProps` - Layout component props

### ComponentTypes.ts
- `ComponentVariant` - UI theming variants
- `ComponentSize` - Consistent sizing types
- `BadgeData` - Badge component structure
- `MaterialProperties` - Scientific material properties
- `CompositionData` - Chemical composition data
- `ContentItem` - Generic content structure
- `SearchResultItem` - Search result structure

### ApiTypes.ts
- `ApiResponse<T>` - Generic API response wrapper
- `SearchApiResponse` - Search-specific API response
- `MaterialsApiResponse` - Materials API response
- `DebugApiResponse` - Debug API response
- `PaginationParams` - Pagination parameters
- `FilterParams` - Filtering parameters

## Migration Recommendations

### For New Code
Use type families for better organization:
```typescript
// ✅ Recommended
import { PageProps, ArticleMetadata } from '@/types/families/PageTypes';
import { BaseInteractiveProps } from '@/types/families/BaseProps';
```

### For Existing Code
Legacy imports continue to work but consider migrating gradually:
```typescript
// ❌ Legacy (still works)
import { PageProps } from '@/types';

// ✅ Migrated
import { PageProps } from '@/types/families/PageTypes';
```

## Benefits

1. **Logical Organization** - Related types grouped together
2. **Better Discovery** - Easy to find relevant types
3. **Reduced Import Complexity** - Import only what you need
4. **Maintainability** - Clear separation of concerns
5. **Backward Compatibility** - Existing imports still work
