# Z-Beam Project Requirements

> **Note:** For development workflow, tooling, and enforcement procedures, see [DEV_WORKFLOW.md](./DEV_WORKFLOW.md)

## 1. Core Architecture Principles

### 1.1 Optimization Over Creation 🔧

**RULE: Always analyze and optimize existing code before creating new files or components.**

#### Why Optimization First?
- Prevents codebase bloat and technical debt
- Maintains consistency with existing patterns
- Reduces maintenance burden and complexity
- Leverages existing tested and proven code
- Avoids duplicate functionality and redundant abstractions

#### The Optimization-First Process:
1. **Search existing codebase** for similar functionality
2. **Analyze extension possibilities** of existing components
3. **Document why existing solutions are insufficient** (if they are)
4. **Only then create new components** with clear justification
5. **Plan consolidation** of new component with existing patterns

#### Real-World Example from Our Codebase:
**Problem:** `AuthorArticles.tsx` had a local `AuthorCard` component duplicating the shared `AuthorCard`

**Optimization Solution:**
- ✅ Analyzed both components for overlap and unique features
- ✅ Enhanced shared AuthorCard with missing props (`variant`, `showArticleCount`, `showSpecialties`)
- ✅ Eliminated duplicate local component
- ✅ Consolidated functionality into one reusable component

**Result:** Reduced code duplication, improved maintainability, eliminated enforcement violations.

### 1.2 No Fallbacks Policy ⛔

**RULE: The application must NEVER use fallback logic. All configurations must be explicit.**

#### Why No Fallbacks?
- Fallbacks hide missing configurations and create inconsistent behavior
- They make debugging difficult and mask real issues
- They lead to unpredictable UI states and user experience
- They violate the principle of explicit over implicit

#### Implementation:
```typescript
// ✅ CORRECT - Explicit Error Throwing
export function getTagInfo(tag: string): TagConfig {
  const config = TAG_CONFIG[tag];
  if (!config) {
    throw new Error(`Tag "${tag}" is not configured in TAG_CONFIG. All tags must be explicitly configured.`);
  }
  return config;
}

// ❌ INCORRECT - Fallback Pattern
const displayName = config.displayName || tag; // DON'T DO THIS
const bgColor = config.color?.bg || 'bg-gray-500'; // DON'T DO THIS
```

### 1.3 Component Reusability & Zero Duplication 🔄

**RULE: ZERO TOLERANCE for component duplication. Every UI pattern MUST be implemented exactly once.**

#### Core Principles:
- **Single Source of Truth:** Each UI pattern exists in exactly one place
- **Extend, Don't Duplicate:** Enhance existing components rather than creating new ones
- **Fail Fast:** Build system must prevent duplication from being committed

#### Current Shared Components:
- `SmartTagList` - All badge/tag implementations
- `Button` - All button implementations
- `AuthorCard` - All author card layouts (default, compact variants)
- `Container` - Simple card containers with consistent styling

## 2. Enforcement Standards 🛡️

### 2.1 Zero Tolerance Thresholds
- **Badge violations:** 0 allowed (use SmartTagList)
- **Button violations:** 1 allowed (use Button component)  
- **Card violations:** 1 allowed (use Container/AuthorCard)

### 2.2 Build Integration
- Build process must fail on component duplication violations
- Pre-commit validation prevents problematic code from entering repository
- Emergency bypass available with mandatory justification and logging

## 3. Component Standards

### 3.1 Tag System
- **All tags must be configured** in `tagConfig.ts`
- **No fallback styling** - explicit configuration required
- **Categories:** materials, applications, techniques, industries
- **SmartTagList component** handles all tag rendering

### 3.2 Type Safety
- **Strict TypeScript configuration** enforced
- **Explicit interfaces** for all component props
- **No `any` types** allowed in component interfaces

### 3.3 Error Handling
- **Explicit error throwing** for missing configurations
- **Graceful degradation** only for non-critical features
- **User-friendly error messages** in development

## 4. Component Standards

### 4.1 Tag System
- **All tags must be configured** in `tagConfig.ts`
- **No fallback styling** - explicit configuration required
- **Categories:** materials, applications, techniques, industries
- **SmartTagList component** handles all tag rendering

### 4.2 Type Safety
- **Strict TypeScript configuration** enforced
- **Explicit interfaces** for all component props
- **No `any` types** allowed in component interfaces

### 4.3 Error Handling
- **Explicit error throwing** for missing configurations
- **Graceful degradation** only for non-critical features
- **User-friendly error messages** in development

## 5. Documentation Standards

### 5.1 Component Documentation:
- **Purpose and usage** clearly stated
- **Prop interfaces** fully documented
- **Examples** of correct usage
- **Variant explanations** for multi-purpose components

### 5.2 Architectural Decision Records:
- **Why** decisions were made
- **What alternatives** were considered
- **How** implementations solve specific problems
- **When** optimizations were applied over new creation

## 6. Component Usage Reference

### 6.1 Current Shared Components:
- `SmartTagList` - All badge/tag implementations
- `Button` - All button implementations  
- `AuthorCard` - All author card layouts (default, compact variants)
- `Container` - Simple card containers with consistent styling

### 6.2 Usage Examples:
```typescript
// Tags/Badges
<SmartTagList tags={tags} variant="compact" linkable={false} />

// Buttons
<Button variant="primary" onClick={handler}>Click me</Button>

// Author Cards
<AuthorCard author={author} variant="compact" showArticleCount={true} />

// Simple Containers
<Container padding="md" shadow="lg" sticky={true}>Content</Container>
```

## 7. Recent Architectural Achievements
- ✅ Eliminated AuthorCard duplication through optimization
- ✅ Reduced card violations from 3 to 2 through Container component
- ✅ Consolidated badge patterns into SmartTagList
- ✅ Implemented optimization-first architectural principle
- ✅ Enhanced AuthorCard with variants instead of creating new components
