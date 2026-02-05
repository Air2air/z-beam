# Naming Conventions Guide

## Overview

This document outlines the comprehensive naming conventions for the Z-Beam project to ensure consistency, readability, and maintainability across the codebase.

## 1. Metadata vs Frontmatter Terminology

**RULE**: Use `.frontmatter` in production code, not `.metadata` wrapper (Updated Dec 28, 2025)

```typescript
// ✅ CORRECT
const title = article.frontmatter.title;

// ❌ INCORRECT (DEPRECATED)
const title = article.metadata.title;
```

**Rationale**: `.frontmatter` is the direct access pattern. `.metadata` wrapper is deprecated as of Dec 28, 2025.

## 2. Props Interface Naming

**RULE**: Props interfaces should follow `ComponentNameProps` pattern

```typescript
// ✅ CORRECT
interface MaterialCardProps {
  material: Material;
  isLoading?: boolean;
}

// ❌ INCORRECT
interface Props {
  material: Material;
  isLoading?: boolean;
}
```

## 3. Boolean Prop Naming

**RULE**: Boolean props should use `is/has/can/should` prefixes

```typescript
// ✅ CORRECT
interface ComponentProps {
  isLoading: boolean;
  hasError: boolean;
  canEdit: boolean;
  shouldHide: boolean;
}

// ❌ INCORRECT
interface ComponentProps {
  loading: boolean;
  error: boolean;
  editable: boolean;
  hidden: boolean;
}
```

## 4. Type Centralization

**RULE**: Import types from centralized definitions, never duplicate

```typescript
// ✅ CORRECT
import type { IconProps, BadgeProps, CardProps } from '@/types';

// ❌ INCORRECT
interface IconProps { size?: number; className?: string; }
```

**Centralized Types Location**: `types/centralized.ts`

## 5. Array Field Naming

**RULE**: Array fields should use plural naming

```typescript
// ✅ CORRECT
interface MaterialData {
  properties: Property[];
  categories: Category[];
  authors: Author[];
}

// ❌ INCORRECT
interface MaterialData {
  property: Property[];
  category: Category[];
  author: Author[];
}
```

## 6. File and Directory Naming

### Components
- Use PascalCase: `MaterialCard.tsx`, `SearchInput.tsx`
- Match component name: `MaterialCard` → `MaterialCard.tsx`

### Utilities and Helpers
- Use camelCase: `searchUtils.ts`, `formatters.ts`

### Constants
- Use UPPER_SNAKE_CASE: `API_ENDPOINTS.ts`, `SITE_CONFIG.ts`

### Types
- Use camelCase for files: `material.ts`, `search.ts`
- Use PascalCase for type names: `Material`, `SearchResult`

## 7. Function and Variable Naming

### Functions
- Use camelCase: `formatDate`, `calculateDistance`
- Use descriptive verbs: `getUserById`, `validateEmail`

### Variables
- Use camelCase: `materialData`, `searchResults`
- Use descriptive nouns: `currentUser`, `validationErrors`

### Constants
- Use UPPER_SNAKE_CASE: `MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT`

## 8. CSS Class Naming

**RULE**: Follow Tailwind conventions with semantic names

```css
/* ✅ CORRECT */
.material-card {}
.search-input {}
.nav-button {}

/* ❌ INCORRECT */
.MaterialCard {}
.searchInput {}
.navButton {}
```

## 9. API and Data Field Naming

### JSON/API Responses
- Use camelCase: `materialType`, `dateCreated`, `isActive`

### Database Fields
- Use snake_case: `material_type`, `date_created`, `is_active`

### Frontmatter Fields
- Use camelCase: `pageDescription`, `datePublished`, `materialType`

## 10. Git Convention

### Branch Names
- Use kebab-case: `feature/material-search`, `fix/schema-validation`

### Commit Messages
- Use sentence case: `Add material search functionality`
- Start with imperative verb: `Add`, `Fix`, `Update`, `Remove`

## Enforcement

### Automated Testing
- Tests in `tests/naming/semantic-naming.test.ts` validate these conventions
- Run tests with: `npm test -- semantic-naming.test.ts`

### Pre-build Validation
- Naming validation runs automatically during `npm run build`
- Configured in `package.json` scripts

### Tools
- ESLint rules enforce TypeScript naming conventions
- Custom validation scripts check for violations

## Migration Guide

### From .metadata to .frontmatter (Updated Dec 28, 2025)
1. Search for deprecated `.metadata` usage: `grep -r "\.metadata" app/`
2. Replace with `.frontmatter` access pattern
3. Test thoroughly to ensure data access still works

### Type Consolidation
1. Check `types/centralized.ts` for existing types
2. Import from centralized location
3. Remove local duplicate definitions

## Related Documentation

- [`TYPE_CONSOLIDATION_DEC21_2025.md`](./TYPE_CONSOLIDATION_DEC21_2025.md) - Type centralization details
- [`COMPONENT_ARCHITECTURE.md`](./COMPONENT_ARCHITECTURE.md) - Component naming standards
- [`API_CONVENTIONS.md`](./API_CONVENTIONS.md) - API field naming standards