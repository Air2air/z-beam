# TypeScript Centralization Implementation Plan

## Current State Summary
- **181 total interface/type definitions** across **64 files**
- **Average 2.8 types per file** with high scatter
- **22 remaining "any" types** after recent improvements
- **Major duplications**: Article (4x), Badge (8x), PageProps (5x)

## Implementation Phases

### Phase 1: Create Central Types Architecture (Week 1)

#### Step 1: Create Types Directory Structure
```bash
mkdir -p app/types/{core,domain,utils}
```

#### Step 2: Core Interfaces
Create `app/types/core/index.ts`:
```typescript
// Export all core types
export * from './article';
export * from './ui';
export * from './navigation';
```

#### Step 3: Domain-Specific Types  
Create `app/types/domain/index.ts`:
```typescript
// Export domain types
export * from './badges';
export * from './materials';  
export * from './search';
```

#### Step 4: Main Export Barrel
Update `app/types/index.ts`:
```typescript
// Single source of truth for all types
export * from './core';
export * from './domain';
export * from './utils';

// Legacy compatibility (temporary)
export type { ArticleMetadata as Metadata } from './core/article';
```

### Phase 2: Migrate High-Impact Duplications (Week 2)

#### Priority 1: Badge System Consolidation
**Files to Update:**
- `app/utils/searchUtils.ts` (remove BadgeData)
- `app/utils/badgeUtils.ts` (update import)
- `app/components/Card/Card.tsx` (update import)
- `app/components/BadgeSymbol/BadgeSymbol.tsx` (standardize)

**Unified Badge Interface:**
```typescript
// app/types/domain/badges.ts
export interface BadgeData {
  symbol: string;
  formula?: string;
  atomicNumber?: number;
  materialType: MaterialType;
  color?: string;
  variant?: 'card' | 'large' | 'small';
}
```

#### Priority 2: Article System Consolidation
**Files to Update:**
- `app/utils/contentUtils.ts`
- `app/components/List/List.tsx`
- `app/components/SearchResults/SearchResults.tsx`

**Unified Article Interface:**
```typescript
// app/types/core/article.ts
export interface BaseArticle {
  slug: string;
  title: string;
  description?: string;
  tags: string[];
  metadata: ArticleMetadata;
}

export interface EnrichedArticle extends BaseArticle {
  href: string;
  normalizedTags: string[];
}
```

#### Priority 3: Page Props Standardization
**Files to Update:**
- `app/[slug]/page.tsx`
- `app/pages/[slug]/page.tsx`  
- `app/tag/[tag]/page.tsx`

**Unified Page Interface:**
```typescript
// app/types/core/navigation.ts
export interface StandardPageProps {
  params: Promise<Record<string, string | string[]>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

export interface TagPageProps {
  params: Promise<{ tag: string }>;
}
```

### Phase 3: Component Prop Standardization (Week 3)

#### Card Component Consolidation
**Target Files:**
- `app/components/Card/Card.tsx`
- `app/components/Card/types.ts`
- `app/components/Card/ServerCard.tsx`

#### Search Component Consolidation
**Target Files:**
- `app/components/SearchResults/SearchResults.tsx`
- `app/components/SearchResults/SearchResultsGrid.tsx`
- `app/search/search-client.tsx`

### Phase 4: Cleanup & Optimization (Week 4)

#### Remove Duplicate Definitions
- Clean up local interfaces in components
- Remove utility-specific type definitions
- Consolidate similar interfaces

#### Optimize Imports
- Update all files to use central imports
- Remove direct file imports
- Use barrel exports

#### Add Type Utilities
```typescript
// app/types/utils/helpers.ts
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type StrictExtract<T, U> = T extends U ? T : never;
```

## Migration Strategy

### Backward Compatibility Approach
1. **Create new centralized types**
2. **Add legacy exports temporarily**
3. **Update imports file by file**
4. **Remove legacy exports after full migration**

### Example Migration Pattern
```typescript
// Before (in component file)
interface LocalCardProps {
  title: string;
  href: string;
}

// After (centralized)
import { CardProps } from '@/types';
// Use standardized CardProps
```

### Import Path Standardization
```typescript
// Old scattered imports
import { ArticleMetadata } from '../utils/contentUtils';
import { BadgeData } from '../utils/searchUtils';
import { PageProps } from './types';

// New centralized imports  
import { ArticleMetadata, BadgeData, PageProps } from '@/types';
```

## Risk Mitigation

### Gradual Migration
- **One component at a time** to minimize breaking changes
- **Keep legacy exports** during transition period
- **Comprehensive testing** after each migration

### Type Validation
```typescript
// Add runtime type checks during migration
const validateArticle = (article: unknown): article is BaseArticle => {
  return typeof article === 'object' && 
         article !== null &&
         'slug' in article &&
         'title' in article;
};
```

### Rollback Strategy
- **Git branches** for each migration phase
- **Atomic commits** for easy reversion
- **Type-only changes** separate from logic changes

## Success Metrics & Validation

### Immediate Validation (After Each Phase)
```bash
# TypeScript compilation check
npm run type-check

# Import validation
npm run build

# Test suite validation  
npm run test
```

### Quantitative Targets
- **Reduce duplicate interfaces by 90%** (181 → ~20)
- **Consolidate to 5-10 main files** (from 64 files)
- **Single import point** for all types
- **Zero breaking changes** during migration

### Quality Improvements
- **Better IntelliSense** with standardized types
- **Consistent naming** across all interfaces
- **Easier maintenance** with central definitions
- **Improved developer experience**

## Tools & Automation

### TypeScript Compiler Integration
```typescript
// tsconfig.json path mapping
{
  "compilerOptions": {
    "paths": {
      "@/types": ["./app/types"],
      "@/types/*": ["./app/types/*"]
    }
  }
}
```

### ESLint Rules
```json
{
  "rules": {
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-duplicate-imports": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error"
  }
}
```

### Automated Migration Scripts
```bash
# Find and replace imports
find app -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from "..\/utils\/searchUtils"/from "@\/types"/g'

# Validate imports
grep -r "from.*utils.*Badge" app/ || echo "All badge imports centralized"
```

## Implementation Timeline

| Week | Focus | Deliverables |
|------|-------|-------------|
| 1 | Architecture Setup | Types directory, core interfaces |
| 2 | High-Impact Migration | Badge, Article, PageProps consolidation |
| 3 | Component Migration | Card, Search, Navigation components |
| 4 | Cleanup & Optimization | Remove duplicates, optimize imports |

## Conclusion

This centralization effort will transform the current scattered type system into a **well-organized, maintainable architecture**. The phased approach ensures **minimal disruption** while providing **immediate benefits** in developer experience and code quality.

**Next Steps:**
1. Approve implementation plan
2. Create types directory structure  
3. Begin Phase 1 migration
4. Monitor progress with success metrics

---
*Implementation Plan: Z-Beam TypeScript Centralization*
*Target Completion: 4 weeks*
*Risk Level: Low (gradual migration approach)*
