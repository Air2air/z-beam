# Z-Beam Type System Architecture

## 📋 Overview

The Z-Beam application uses a **centralized type system** that provides a single source of truth for all TypeScript interfaces and types. This comprehensive architecture eliminates duplicate definitions, ensures consistency across components, and significantly improves maintainability.

## 🎯 Architecture Goals

- **Single Source of Truth**: All types defined in `/types/centralized.ts`
- **Zero Duplication**: Eliminate scattered interface definitions
- **Type Safety**: Full TypeScript compliance across all components
- **Maintainability**: Easy to update and extend types
- **Consistency**: Standardized interfaces across the application
- **Legacy Compatibility**: Smooth migration path for existing components

## 📁 File Structure

```
/types/
├── centralized.ts          ← Single source of truth for all types
├── index.ts               ← Main exports for convenient access
├── families/              ← Organized import paths
│   ├── ComponentTypes.ts  ← UI component related types
│   ├── PageTypes.ts       ← Page and routing related types
│   ├── ApiTypes.ts        ← API response and request types
│   └── BaseProps.ts       ← Base component properties
└── legacy/                ← Deprecated scattered types (archived)

/app/components/Caption/
├── Caption.tsx            ← Imports from centralized types
├── MetricsGrid/
│   ├── MetricsGrid.tsx   ← Imports from centralized types
│   └── index.ts          ← Re-exports centralized types
└── useCaptionParsing.ts  ← Uses centralized types

/app/modules/Caption/
├── Caption.tsx           ← Imports from centralized types
└── index.ts             ← Re-exports centralized types
```

## 🔧 Core Type Categories

### **Core Content Types**

#### `ArticleMetadata`
Base metadata interface for all content types.

```typescript
interface ArticleMetadata {
  id?: string;
  title: string;
  description?: string;
  slug: string;
  category?: string;
  tags?: string[];
  author?: Author;
  keywords?: string[];
  publishedDate?: string;
  lastModified?: string;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
}
```

#### `Author`
Unified author interface supporting both YAML and CMS data.

```typescript
interface Author {
  id?: string | number;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  role?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}
```

#### `SearchResultItem`
Comprehensive search result interface.

```typescript
interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  slug: string;
  category?: string;
  tags?: string[];
  type: 'page' | 'material' | 'application' | 'region' | 'thesaurus';
  url: string;
  score?: number;
  excerpt?: string;
  author?: Author;
  publishedDate?: string;
  featured?: boolean;
}
```

### **Caption System Types**

#### `CaptionDataStructure`
Complete interface for caption content data.

```typescript
interface CaptionDataStructure {
  before_text?: string;
  after_text?: string;
  material?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  
  // Quality metrics integration
  quality_metrics?: QualityMetrics;
  
  // Technical specifications
  technicalSpecifications?: {
    wavelength?: string;
    power?: string;
    pulse_duration?: string;
    scanning_speed?: string;
    material?: string;
    beam_delivery?: string;
    focus_diameter?: string;
    processing_atmosphere?: string;
  };
  
  // Enhanced metadata
  metadata?: {
    generated?: string;
    format?: string;
    version?: string;
    analysis_method?: string;
    magnification?: string;
    field_of_view?: string;
    image_resolution?: string;
  };
  
  // SEO and accessibility
  accessibility?: {
    alt_text_detailed?: string;
    caption_language?: string;
    technical_level?: string;
    visual_description?: string;
  };
  
  seo_data?: {
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    schema_type?: string;
    last_modified?: string;
  };
}
```

#### `QualityMetrics`
Interface for quality metrics data.

```typescript
interface QualityMetrics {
  contamination_removal?: string;
  surface_roughness_before?: string;
  surface_roughness_after?: string;
  thermal_damage?: string;
  processing_efficiency?: string;
  substrate_integrity?: string;
  [key: string]: string | undefined; // Support custom metrics
}
```

### **UI Component Types**

#### `BadgeData`
Unified badge interface supporting both UI and chemical badges.

```typescript
interface BadgeData {
  text?: string;           // UI badge text
  variant?: BadgeVariant;  // UI styling
  color?: BadgeColor;      // UI color
  symbol?: string;         // Chemical symbol
  formula?: string;        // Chemical formula
  atomicNumber?: number;   // Chemical atomic number
}

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
```

#### `ComponentData`
Dynamic component configuration interface.

```typescript
interface ComponentData {
  type: string;
  props?: Record<string, any>;
  children?: ComponentData[];
  className?: string;
  id?: string;
}
```

### **Specialized Metadata Types**

#### `MaterialMetadata`
Material-specific metadata extending base ArticleMetadata.

```typescript
interface MaterialMetadata extends ArticleMetadata {
  articleType: "material";
  nameShort: string;
  atomicNumber?: number;
  chemicalSymbol?: string;
  materialType: string;
  chemicalFormula?: string;
  density?: string;
  meltingPoint?: string;
  thermalConductivity?: string;
  applications?: string[];
  processingMethods?: string[];
  safetyConsiderations?: string[];
}
```

#### `ApplicationMetadata`
Application-specific metadata.

```typescript
interface ApplicationMetadata extends ArticleMetadata {
  articleType: "application";
  industry: string;
  processingType: string;
  materials?: string[];
  techniques?: string[];
  benefits?: string[];
  limitations?: string[];
  caseStudies?: string[];
}
```

### **API Types**

#### `ApiResponse`
Base API response interface.

```typescript
interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}
```

#### `SearchApiResponse`
Search API specific response.

```typescript
interface SearchApiResponse extends ApiResponse {
  data?: {
    items: SearchResultItem[];
    total: number;
    page: number;
    limit: number;
    filters?: FilterParams;
  };
}
```

### **Page Types**

#### `PageProps`
Standard page properties with async params (Next.js 14+ pattern).

```typescript
interface PageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

## 📦 Import Patterns

### **Recommended Import Patterns**

```typescript
// ✅ Preferred: Import from main types
import { 
  ArticleMetadata, 
  Author, 
  BadgeData,
  CaptionDataStructure,
  QualityMetrics 
} from '@/types';

// ✅ Alternative: Import from centralized directly
import { 
  SearchResultItem,
  MaterialMetadata,
  ApplicationMetadata 
} from '@/types/centralized';

// ✅ Organized: Import from type families
import { PageProps, TagPageProps } from '@/types/families/PageTypes';
import { BadgeData } from '@/types/families/ComponentTypes';
import { SearchApiResponse, MaterialsApiResponse } from '@/types/families/ApiTypes';
```

### **Caption System Import**
```typescript
import { 
  CaptionDataStructure,
  CaptionProps,
  FrontmatterType,
  QualityMetrics,
  MetricsGridProps,
  ParsedCaptionData 
} from '@/types/centralized';
```

### **Content Types Import**
```typescript
import {
  ArticleMetadata,
  MaterialMetadata,
  ApplicationMetadata,
  RegionMetadata,
  ThesaurusMetadata
} from '@/types/centralized';
```

## 🧪 Testing Types

All centralized types are covered by comprehensive tests:

- **Type Validation Tests**: `/tests/types/centralized.test.ts`
- **Component Integration Tests**: `/tests/components/Caption.layout.test.tsx`
- **MetricsGrid Tests**: `/tests/components/MetricsGrid.test.tsx`
- **Search Tests**: `/tests/api/search.test.ts`

### **Test Example**
```typescript
import { 
  CaptionDataStructure, 
  QualityMetrics,
  SearchResultItem,
  MaterialMetadata 
} from '@/types/centralized';

describe('Centralized Types', () => {
  test('should support complete caption data', () => {
    const caption: CaptionDataStructure = {
      before_text: 'Before analysis',
      after_text: 'After analysis',
      quality_metrics: {
        contamination_removal: '95%',
        surface_roughness_before: '2.5 μm',
        surface_roughness_after: '0.3 μm'
      }
    };
    
    expect(caption.quality_metrics?.contamination_removal).toBe('95%');
  });
  
  test('should support material metadata', () => {
    const material: MaterialMetadata = {
      articleType: "material",
      title: 'Titanium Alloy',
      nameShort: 'Ti-6Al-4V',
      slug: 'titanium-alloy',
      materialType: 'Metal',
      chemicalSymbol: 'Ti',
      density: '4.43 g/cm³'
    };
    
    expect(material.articleType).toBe('material');
    expect(material.nameShort).toBe('Ti-6Al-4V');
  });
});
```

## 🔄 Migration Status

### **✅ Completed**
- Caption component types fully centralized
- MetricsGrid component types fully centralized
- Original Caption component updated to use centralized types
- Modular Caption component updated to use centralized types
- Search result types unified and centralized
- Author system types consolidated
- Badge system types unified
- Page props updated to Next.js 14+ patterns
- All import statements updated
- Comprehensive test coverage added
- Documentation updated

### **🔧 Maintenance Guidelines**
- All new components should use centralized types
- Type changes require updates only in `/types/centralized.ts`
- Extensions should follow established patterns
- Legacy types gradually migrated through re-exports

## 🚀 Benefits Achieved

1. **Zero Duplication**: Eliminated 15+ duplicate interface definitions
2. **Type Safety**: Full TypeScript compilation without errors
3. **Maintainability**: Single location for all type updates
4. **Consistency**: Standardized interfaces across all components
5. **Extensibility**: Easy to add new properties to centralized interfaces
6. **Testing**: Comprehensive type validation test coverage
7. **Developer Experience**: Clear, organized type imports
8. **Future-Proof**: Extensible architecture for new requirements

## 📊 Key Improvements Made

### **Before vs After**

**SearchResultItem**: Was defined in 6 different locations → Single comprehensive interface
**BadgeData**: UI badges vs chemical badges conflicts → Unified interface supporting both
**Author**: Author vs AuthorMetadata mismatches → Single unified Author
**Page Props**: Mixed Promise/non-Promise patterns → Consistent async params throughout
**Caption Types**: Scattered across multiple files → Centralized with zero duplication

## 🔗 Type Dependency Graph

```mermaid
graph TD
    A[/types/centralized.ts] --> B[/types/index.ts]
    A --> C[/types/families/]
    
    B --> D[Caption Components]
    B --> E[MetricsGrid Components]
    B --> F[Search Components]
    B --> G[Page Components]
    
    C --> H[ComponentTypes.ts]
    C --> I[PageTypes.ts]
    C --> J[ApiTypes.ts]
    C --> K[BaseProps.ts]
    
    D --> L[CaptionHeader.tsx]
    D --> M[CaptionImage.tsx]
    D --> N[CaptionContent.tsx]
    D --> O[TechnicalDetails.tsx]
    
    E --> P[MetricsGrid.tsx]
    E --> Q[MetricsCard.tsx]
    
    F --> R[SearchResults.tsx]
    F --> S[SearchFilters.tsx]
```

## 🏗️ Usage Guidelines

### **For New Components**

1. Import types from `@/types` or `@/types/centralized`
2. Use comprehensive interfaces (SearchResultItem, BadgeData, etc.)
3. Extend specialized metadata types when needed
4. Follow established naming conventions
5. Add tests for new type usage

### **For Existing Components**

1. Most imports continue working through re-exports
2. Consider updating to centralized types directly
3. Remove local type definitions that duplicate centralized types
4. Update to modern Promise-based PageProps for page components
5. Test thoroughly after migration

### **Type Extension Patterns**

```typescript
// ✅ Extend specialized metadata
interface CustomMaterialMetadata extends MaterialMetadata {
  customProperty: string;
  additionalSpecs: {
    hardness?: string;
    corrosionResistance?: string;
  };
}

// ✅ Extend API responses
interface CustomApiResponse extends ApiResponse {
  customData?: {
    processingTime: number;
    cacheHit: boolean;
  };
}

// ✅ Create component-specific props
interface CustomComponentProps {
  data: CaptionDataStructure;
  config?: {
    showAdvanced: boolean;
    theme: 'light' | 'dark';
  };
}
```

## 📚 Related Documentation

- **Author System**: [`guides/author-system.md`](../guides/author-system.md)
- **Caption Components**: [`guides/caption-components.md`](../guides/caption-components.md)
- **API Documentation**: [`reference/api-types.md`](../reference/api-types.md)
- **Testing Guide**: [`development/testing-guide.md`](../development/testing-guide.md)

This centralized type architecture ensures consistent, maintainable, and extensible type definitions across the entire Z-Beam application while providing excellent developer experience and comprehensive type safety.