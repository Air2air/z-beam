# Z-Beam Project Requirements

> **🚨 CRITICAL:** For development workflow, tooling, and enforcement procedures, see [DEVELOPMENT.md](./DEVELOPMENT.md)
> 
> **⚠️ CLAUDE DIRECTIVE:** You MUST read and follow BOTH this document AND DEVELOPMENT.md at EVERY stage. NO EXCEPTIONS.

## 1. Core Architecture Principles

### 1.1 Optimization Over Creation 🔧

**RULE: Always analyze and optimize existing code before creating new files or components.**

**CORE MANDATE: The simplest, smallest, most maintainable codebase wins.**

#### Why Smallest Codebase Possible?
- **Fewer files = easier maintenance** and faster comprehension
- **Fewer components = less complexity** and fewer bugs
- **Fewer lines = faster builds** and easier debugging  
- **Less abstraction = more direct** and predictable behavior
- **Reduced surface area = fewer failure points** and security vulnerabilities

#### The Radical Simplification Process:
1. **ELIMINATE first** - Can existing functionality be removed or consolidated?
2. **MERGE second** - Can multiple components be combined into one?
3. **OPTIMIZE third** - Can existing code be made simpler and shorter?
4. **EXTEND fourth** - Can existing components handle new requirements with minor changes?
5. **CREATE last** - Only when all above options are exhausted AND result in net reduction of complexity

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

### 1.4 Anti-Bloat & Simplification Mandate 🎯

**RULE: Claude AI must AGGRESSIVELY simplify existing code and ELIMINATE codebase bloat at ALL COSTS.**

#### Critical Simplification Directives:
- **NEVER create new files** without proving existing ones cannot be enhanced
- **ALWAYS merge duplicate patterns** instead of maintaining variations
- **CONSTANTLY reduce** total file count, line count, and cognitive complexity
- **ELIMINATE unused code** immediately upon discovery - be ruthless
- **SIMPLIFY over sophisticate** - choose the most direct solution always

#### The Radical Simplification Process:
1. **MANDATORY ELIMINATION AUDIT:** Before ANY code changes, spend 10+ minutes looking for code to DELETE
2. **PROVE NECESSITY:** Document WHY existing code cannot be simplified further
3. **MERGE FIRST:** Consolidate similar components before adding any new functionality
4. **SIMPLIFY RUTHLESSLY:** Remove any code, imports, or abstractions not absolutely essential
5. **MEASURE REDUCTION:** Track decreases in file count, component count, and line count

#### Simplification Success Patterns:
**✅ SIMPLIFICATION WINS (Always Do This):**
```typescript
// Merged AuthorCardCompact functionality into AuthorCard with variant prop
// Eliminated TagList component by using SmartTagList variants
// Consolidated 3 utility files into 1 with clearer organization
// Removed 200+ lines of duplicate code through component unification
```

**❌ COMPLEXITY GROWTH (Never Do This):**
```typescript
// Created AuthorCardLarge.tsx when AuthorCard.tsx could handle it
// Added utils/newDateHelpers.ts when utils/utils.ts has space
// Duplicated validation logic across components instead of centralizing
```

#### Simplification Metrics to Track:
- **Total file count:** Must decrease over time through aggressive consolidation
- **Total line count:** Should grow slower than feature count, ideally decrease
- **Component count:** Must decrease through merging and elimination
- **Import complexity:** Reduce number of dependencies and internal imports
- **Dead code:** Must be eliminated on sight

#### Claude Implementation Requirements:
All Claude AI interactions must follow the procedures detailed in [CLAUDE_COMPLIANCE.md](./CLAUDE_COMPLIANCE.md) and [DEVELOPMENT.md](./DEVELOPMENT.md).

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

### 2.1 Zero Tolerance Policy
All component duplication violations MUST be eliminated. See [DEVELOPMENT.md](./DEVELOPMENT.md) for specific thresholds and enforcement procedures.

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
See [CLAUDE_COMPLIANCE.md](./CLAUDE_COMPLIANCE.md) for the current list of shared components and their usage examples.

### 6.2 Usage Guidelines:
All UI patterns must use existing shared components. Extending existing components with new props is preferred over creating new components.

## 7. Recent Architectural Achievements
- ✅ Eliminated AuthorCard duplication through optimization
- ✅ Reduced card violations from 3 to 2 through Container component
- ✅ Consolidated badge patterns into SmartTagList
- ✅ Implemented optimization-first architectural principle
- ✅ Enhanced AuthorCard with variants instead of creating new components
