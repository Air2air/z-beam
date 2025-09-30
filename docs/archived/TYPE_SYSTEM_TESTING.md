# Type System Testing Guide

## Overview

This document outlines testing strategies and practices for the new centralized type system in Z-Beam.

## Testing Categories

### 1. Compilation Tests

The primary validation for the type system is TypeScript compilation itself:

```bash
# Validate all types compile correctly
npm run build

# Type-only compilation check
npx tsc --noEmit
```

### 2. Component Integration Tests

Test that components work correctly with the new centralized types:

```typescript
// Example: Testing SearchResultItem with new unified interface
import { SearchResultItem } from '@/types';

describe('SearchResultItem Integration', () => {
  it('should handle all SearchResultItem fields', () => {
    const item: SearchResultItem = {
      id: '1',
      slug: 'test-item',
      title: 'Test Item',
      name: 'Alternative Name',
      description: 'Test description',
      type: 'material',
      category: 'metals',
      tags: ['laser', 'cleaning'],
      href: '/test-item',
      image: '/images/test.jpg',
      metadata: {
        title: 'Test Item',
        slug: 'test-item',
        // ... ArticleMetadata fields
      },
      badge: {
        text: 'Al',
        symbol: 'Al',
        atomicNumber: 13
      }
    };
    
    expect(item.id).toBe('1');
    expect(item.badge?.symbol).toBe('Al');
  });
});
```

### 3. Badge System Tests

Test the unified BadgeData interface handles both UI and chemical use cases:

```typescript
import { BadgeData } from '@/types';

describe('Unified BadgeData', () => {
  it('should support UI badges', () => {
    const uiBadge: BadgeData = {
      text: 'Featured',
      variant: 'primary',
      color: 'blue'
    };
    
    expect(uiBadge.text).toBe('Featured');
    expect(uiBadge.variant).toBe('primary');
  });
  
  it('should support chemical badges', () => {
    const chemicalBadge: BadgeData = {
      symbol: 'Al',
      formula: 'Al₂O₃',
      atomicNumber: 13
    };
    
    expect(chemicalBadge.symbol).toBe('Al');
    expect(chemicalBadge.atomicNumber).toBe(13);
  });
  
  it('should support hybrid badges', () => {
    const hybridBadge: BadgeData = {
      text: 'Aluminum',
      symbol: 'Al',
      variant: 'secondary',
      atomicNumber: 13
    };
    
    expect(hybridBadge.text).toBe('Aluminum');
    expect(hybridBadge.symbol).toBe('Al');
    expect(hybridBadge.variant).toBe('secondary');
  });
});
```

### 4. Author Type Tests

Validate the unified AuthorInfo interface:

```typescript
import { AuthorInfo } from '@/types';

describe('Unified AuthorInfo', () => {
  it('should support string IDs (YAML-based)', () => {
    const yamlAuthor: AuthorInfo = {
      id: 'dr-smith',
      name: 'Dr. Smith',
      title: 'Materials Scientist',
      expertise: 'Laser cleaning',
      country: 'USA'
    };
    
    expect(typeof yamlAuthor.id).toBe('string');
  });
  
  it('should support numeric IDs (CMS-based)', () => {
    const cmsAuthor: AuthorInfo = {
      id: 123,
      slug: 'dr-smith',
      name: 'Dr. Smith',
      specialties: ['laser', 'materials'],
      expertise: ['Advanced Materials', 'Laser Technology']
    };
    
    expect(typeof cmsAuthor.id).toBe('number');
    expect(Array.isArray(cmsAuthor.expertise)).toBe(true);
  });
});
```

### 5. API Response Tests

Test consolidated API response types:

```typescript
import { SearchApiResponse, MaterialsApiResponse } from '@/types';

describe('API Response Types', () => {
  it('should validate SearchApiResponse structure', () => {
    const response: SearchApiResponse = {
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 10
      }
    };
    
    expect(response.success).toBe(true);
    expect(response.data?.items).toEqual([]);
  });
  
  it('should validate MaterialsApiResponse structure', () => {
    const response: MaterialsApiResponse = {
      success: true,
      data: {
        materials: [
          {
            id: '1',
            name: 'Aluminum',
            materialType: 'metal',
            properties: { density: 2.7 }
          }
        ],
        total: 1
      }
    };
    
    expect(response.data?.materials[0].name).toBe('Aluminum');
  });
});
```

### 6. Specialized Metadata Tests

Test the specialized metadata types:

```typescript
import { 
  MaterialMetadata, 
  ApplicationMetadata, 
  RegionMetadata, 
  ThesaurusMetadata 
} from '@/types';

describe('Specialized Metadata Types', () => {
  it('should validate MaterialMetadata', () => {
    const material: MaterialMetadata = {
      articleType: 'material',
      title: 'Aluminum',
      slug: 'aluminum',
      nameShort: 'Al',
      atomicNumber: 13,
      chemicalSymbol: 'Al',
      materialType: 'metal',
      metalClass: 'post-transition',
      crystalStructure: 'face-centered cubic',
      primaryApplication: 'aerospace',
      density: 2.7
    };
    
    expect(material.articleType).toBe('material');
    expect(material.atomicNumber).toBe(13);
  });
  
  it('should validate ApplicationMetadata', () => {
    const application: ApplicationMetadata = {
      articleType: 'application',
      title: 'Aerospace Cleaning',
      slug: 'aerospace-cleaning',
      industry: 'aerospace',
      applicationCategory: 'surface-preparation',
      targetMaterials: ['aluminum', 'titanium'],
      processingParameters: {
        laserPower: '100W',
        scanSpeed: '10mm/s'
      }
    };
    
    expect(application.articleType).toBe('application');
    expect(application.targetMaterials).toContain('aluminum');
  });
});
```

## Test Commands

### Run Type-Related Tests

```bash
# Run all tests
npm test

# Run type-specific test files
npm test types
npm test integration

# Run component tests with type validation
npm test components

# Validate TypeScript compilation
npm run type-check
```

### Continuous Integration

The type system is validated in CI through:

1. **TypeScript Compilation**: `npm run build`
2. **Type Checking**: `npx tsc --noEmit`
3. **Component Tests**: `npm test`
4. **Integration Tests**: Component integration with new types

## Testing Best Practices

### 1. Test Type Compatibility

Always test that components work with the new centralized types:

```typescript
import { Component } from '@/components/Component';
import { ComponentProps } from '@/types';

// Test component accepts centralized types
const props: ComponentProps = { /* ... */ };
render(<Component {...props} />);
```

### 2. Test Type Extensions

When extending base types, ensure inheritance works correctly:

```typescript
import { ArticleMetadata, MaterialMetadata } from '@/types';

// Test that MaterialMetadata extends ArticleMetadata
const material: MaterialMetadata = {
  // ArticleMetadata fields
  title: 'Test',
  slug: 'test',
  
  // MaterialMetadata specific fields
  articleType: 'material',
  nameShort: 'T',
  materialType: 'test'
};
```

### 3. Test Import Paths

Verify that all import paths work correctly:

```typescript
// Test different import patterns
import { SearchResultItem } from '@/types';
import { SearchResultItem as CentralizedItem } from '@/types/centralized';
import { SearchResultItem as FamilyItem } from '@/types/families/ComponentTypes';

// All should be the same type
type Test1 = SearchResultItem;
type Test2 = CentralizedItem;
type Test3 = FamilyItem;
```

## Common Issues & Solutions

### Type Import Errors

**Issue**: `Cannot find name 'SomeType'`
**Solution**: Ensure type is exported from centralized.ts and re-exported in index.ts

### Circular Dependencies

**Issue**: Circular import errors between types
**Solution**: Use type-only imports with `import type`

### Legacy Type Conflicts

**Issue**: Old and new types conflict
**Solution**: Use the centralized version and remove local duplicates

## Validation Checklist

- [ ] All types compile without errors (`npm run type-check`)
- [ ] Component tests pass with new types (`npm test`)
- [ ] Import paths work correctly from different locations
- [ ] Specialized metadata types extend base types properly
- [ ] API response types match actual API responses
- [ ] Badge system handles both UI and chemical use cases
- [ ] Author types support both string and numeric IDs
- [ ] SearchResultItem includes all necessary fields
- [ ] No duplicate type definitions remain in codebase
