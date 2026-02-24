# Semantic Naming Audit & Improvement Recommendations
**Date**: December 26, 2025  
**Scope**: End-to-End Codebase Analysis  
**Status**: 🔍 Comprehensive Review

---

## Executive Summary

This document provides a systematic analysis of naming conventions across the Z-Beam codebase, identifying inconsistencies, ambiguities, and opportunities for improved semantic clarity.

### Key Findings
- ✅ **Strong Areas**: Component naming, type consolidation, utility functions
- ⚠️ **Inconsistencies**: Data structure terminology, prop naming patterns, file/folder conventions
- 🔴 **Critical Issues**: Ambiguous metadata references, mixed singular/plural patterns, redundant naming

---

## 1. COMPONENT NAMING ANALYSIS

### 1.1 Current Patterns

#### ✅ **Excellent - Clear & Consistent**
```
PageTitle.tsx → PageTitle component
SectionTitle.tsx → SectionTitle component
DataGrid.tsx → DataGrid component
Button.tsx → Button component
```
**Pattern**: `<ComponentName>.tsx` → exports `<ComponentName>`
**Strength**: 1:1 file-to-export mapping, immediately clear purpose

#### ⚠️ **Inconsistent - Mixed Conventions**
```
app/components/
├── MaterialsLayout/MaterialsLayout.tsx (redundant folder name)
├── ContaminantsLayout/ContaminantsLayout.tsx (redundant)
├── SafetyDataPanel/SafetyDataPanel.tsx (redundant)
└── Button.tsx (flat file, no folder)
```

**Issues**:
1. **Redundancy**: Folder name duplicates filename
2. **Inconsistency**: Some components in folders, others flat
3. **Cognitive Load**: Harder to navigate with repetition

#### 🔴 **Problematic - Ambiguous Names**

| Component | Issue | Better Alternative |
|-----------|-------|-------------------|
| `ItemPage` | "Item" is vague | `MaterialItemPage` or `EntityDetailPage` |
| `ListingPage` | Generic | `EntityListingPage` or `ContentIndexPage` |
| `Title/Title.tsx` | Redundant | Merge with `PageTitle` or rename to `BaseTitle` |
| `Base/MarkdownRenderer` | "Base" unclear | `shared/MarkdownRenderer` or `common/` |
| `Contamination/` | Mix of noun/verb | `Contaminants/` (consistent with domain) |

### 1.2 Recommendations

#### **Pattern A: Component-Specific Folders (Multi-File Components)**
Use when component has multiple sub-components:
```
Micro/
├── index.tsx (re-exports Micro)
├── Micro.tsx (main component)
├── MicroContent.tsx (sub-component)
├── MicroHeader.tsx (sub-component)
├── MicroImage.tsx (sub-component)
└── MicroSkeleton.tsx (sub-component)
```
**Rule**: Folder name = main component name (no redundancy)

#### **Pattern B: Flat Files (Single-File Components)**
Use when component is self-contained:
```
components/
├── Button.tsx
├── Badge.tsx
├── Thumbnail.tsx
└── SafetyWarning.tsx
```
**Rule**: Simple components with no sub-components stay flat

#### **Pattern C: Feature Folders (Related Components)**
Use when grouping related but distinct components:
```
Heatmap/
├── BaseHeatmap.tsx
├── MaterialSafetyHeatmap.tsx
├── ProcessEffectivenessHeatmap.tsx
├── HeatmapFactorCard.tsx
└── HeatmapStatusSummary.tsx
```
**Rule**: Folder name = feature category, files describe variants

---

## 2. TYPE NAMING ANALYSIS

### 2.1 Current Patterns

#### ✅ **Excellent - Centralized Types**
```typescript
// types/centralized.ts - SINGLE SOURCE OF TRUTH
export interface Author { ... }
export interface CardProps { ... }
export interface IconProps { ... }
export interface BadgeProps { ... }
```
**Strength**: 
- Zero duplication
- Consistent imports: `import type { Author } from '@/types'`
- Enforced by automated tests

#### ⚠️ **Inconsistent - Props Naming**

| Component | Props Interface | Issue |
|-----------|----------------|-------|
| `PageTitle` | Has inline props | ✅ Should be `PageTitleProps` |
| `SectionTitle` | `SectionTitleProps` | ✅ Correct |
| `DataGrid<T>` | Inline generic props | ⚠️ Consider `DataGridProps<T>` |
| `MaterialsLayout` | `MaterialsLayoutProps` | ✅ Correct |

**Pattern**: `<ComponentName>Props` interface for all components
**Issue**: Some components define props inline vs. named interface

#### 🔴 **Problematic - Data Structure Ambiguity**

**Problem 1: article.metadata vs. frontmatter**
```typescript
// Used interchangeably in codebase:
article.metadata.name
frontmatter.title
metadata.description
data.author

// All refer to the same conceptual data!
```

**Problem 2: Inconsistent Field Access**
```typescript
// Seen in various places:
metadata.name || metadata.title  // Which is canonical?
article.metadata as any  // Type safety lost
const metadata = article.metadata  // Reassignment obscures origin
```

### 2.2 Recommendations

#### **Rule 1: Consistent Data Structure Naming**

**Option A: Use `frontmatter` universally** (Recommended)
```typescript
// ✅ Clear: Data from YAML frontmatter
interface Article {
  frontmatter: ArticleMetadata;
  components: Components;
}

// Usage:
article.frontmatter.title
article.frontmatter.author
article.frontmatter.description
```

**Option B: Use `metadata` universally**
```typescript
// ✅ Clear: Metadata about content
interface Article {
  metadata: ArticleMetadata;
  components: Components;
}

// Usage:
article.metadata.title
article.metadata.author
```

**❌ Current (Avoid)**:
```typescript
// Confusing mix:
article.metadata.title
settings.frontmatter.name
data.author
```

#### **Rule 2: Explicit Props Interfaces**

```typescript
// ❌ BEFORE: Inline props
export function PageTitle({
  title,
  description,
  breadcrumb
}: {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
}) { ... }

// ✅ AFTER: Named interface
export interface PageTitleProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
}

export function PageTitle({
  title,
  description,
  breadcrumb
}: PageTitleProps) { ... }
```

**Benefits**:
- Easier to import types in tests
- Better documentation
- Consistent pattern across codebase

---

## 3. UTILITY FUNCTION NAMING

### 3.1 Current Patterns

#### ✅ **Excellent - Verb-Based Actions**
```typescript
getRelationshipSection()  // Clear: retrieves data
hasRelationshipSection()  // Clear: boolean check
validateRelationshipSection()  // Clear: validation action
prepareSettingsData()  // Clear: data transformation
convertCitationsToStandards()  // Clear: data conversion
```

#### ⚠️ **Inconsistent - Prefixes**

| Function | Pattern | Alternative |
|----------|---------|-------------|
| `inferCriticality()` | `infer*` | ✅ Good (implies logic/calculation) |
| `getOptimalRange()` | `get*` | ✅ Good (implies retrieval/calculation) |
| `generateDefaultChallenges()` | `generate*` | ⚠️ Consider `createDefault*` |
| `getRiskColor()` | `get*` | ✅ Good (retrieves based on input) |

**Observation**: Mostly consistent, minor variations acceptable

#### 🔴 **Problematic - Ambiguous Names**

| Function | Issue | Better Alternative |
|----------|-------|-------------------|
| `loadEntityFrontmatter()` | Mix of `load` + `frontmatter` | `loadEntityMetadata()` or `fetchEntityData()` |
| `resolveCardData()` | "Resolve" vague | `buildCardDataFromEntity()` |
| `entityExists()` | Could be file or database | `entityFileExists()` or `hasEntityFile()` |

### 3.2 Recommendations

#### **Verb Prefix Standards**

```typescript
// Retrieval (synchronous or simple async)
get*()     // Gets existing data
find*()    // Searches for data
read*()    // Reads from source

// Data Fetching (async operations)
load*()    // Loads from file/API
fetch*()   // Fetches from remote source

// Data Transformation
convert*()   // Converts format A to B
transform*() // Transforms data structure
prepare*()   // Prepares data for use
parse*()     // Parses string/raw data
format*()    // Formats for display

// Data Creation
create*()    // Creates new instance
build*()     // Builds complex structure
generate*()  // Generates dynamic content
make*()      // Makes simple structure

// Validation & Checks
validate*()  // Full validation with errors
check*()     // Simple boolean check
verify*()    // Verification with side effects
has*()       // Boolean existence check
is*()        // Boolean type/state check

// Mutations
set*()       // Sets value
update*()    // Updates existing data
modify*()    // Modifies in place
```

---

## 4. FILE & FOLDER NAMING

### 4.1 Current Patterns

#### ✅ **Excellent - Consistent Conventions**
```
app/
├── components/  (PascalCase folders, PascalCase files)
├── utils/       (camelCase folders, camelCase files)
├── config/      (camelCase)
└── api/         (kebab-case routes)

tests/
├── components/  (matches app/ structure)
├── integration/ (camelCase)
└── unit/        (camelCase)
```

#### ⚠️ **Inconsistent - Mixed Patterns**

**Problem 1: Redundant Nesting**
```
app/components/
├── MaterialsLayout/
│   └── MaterialsLayout.tsx  ❌ Redundant
├── ContaminantsLayout/
│   └── ContaminantsLayout.tsx  ❌ Redundant
└── SafetyDataPanel/
    └── SafetyDataPanel.tsx  ❌ Redundant
```

**Problem 2: Unclear Groupings**
```
app/components/
├── Base/              // What makes something "Base"?
├── Buttons/           // Plural folder for related components ✅
├── Button.tsx         // Singular flat file ✅
├── Contamination/     // Feature folder
└── Contaminants/      // Different feature? Or typo?
```

### 4.2 Recommendations

#### **Rule 1: Folder Naming Semantics**

```
app/components/
├── [PascalCase]/      # Single main component + sub-components
│   ├── ComponentName.tsx
│   └── ComponentNameSubpart.tsx
│
├── [PascalCase]s/     # Plural = collection of related variants
│   ├── VariantA.tsx
│   └── VariantB.tsx
│
└── ComponentName.tsx  # Flat file = standalone component
```

**Examples**:
```
✅ Micro/
   ├── Micro.tsx (main)
   ├── MicroContent.tsx
   └── MicroHeader.tsx

✅ Buttons/ (collection)
   ├── PrimaryButton.tsx
   ├── SecondaryButton.tsx
   └── ButtonIcons.tsx

✅ Badge.tsx (standalone)
```

#### **Rule 2: Eliminate Redundancy**

```
❌ BEFORE:
MaterialsLayout/
└── MaterialsLayout.tsx

✅ AFTER (Option A - Keep folder, add index):
MaterialsLayout/
├── index.tsx (exports MaterialsLayout)
└── MaterialsLayout.tsx

✅ AFTER (Option B - Flatten if single file):
MaterialsLayout.tsx
```

---

## 5. DATA STRUCTURE NAMING

### 5.1 Critical Issues

#### 🔴 **Problem 1: Metadata Terminology Chaos**

**Current State** (Inconsistent):
```typescript
// Used interchangeably:
article.metadata
frontmatter
data
metadata
settings.frontmatter
material.metadata
```

**Impact**:
- Developers confused about which term to use
- Code searches return false positives
- New developers struggle to understand data flow

#### 🔴 **Problem 2: Ambiguous Field Names**

```typescript
// Which is canonical?
metadata.name || metadata.title
metadata.description || metadata.page_description
metadata.images?.hero?.url || heroImage
```

### 5.2 Recommendations

#### **Standardize: Use `metadata` everywhere**

**Rationale**:
- More semantically accurate ("metadata about content")
- Aligns with Next.js convention (`metadata` in app router)
- Shorter than `frontmatter` (less typing)
- Industry standard term

**Migration**:
```typescript
// ✅ STANDARD:
interface Article {
  metadata: ArticleMetadata;  // Content metadata from YAML
  components: Components;     // Rendered components
}

// Usage:
article.metadata.title
article.metadata.author
article.metadata.datePublished

// ✅ CONSISTENT EVERYWHERE:
material.metadata.name
contaminant.metadata.description
settings.metadata.machineSettings
```

#### **Canonical Field Naming**

```typescript
// ❌ BEFORE: Ambiguous fallbacks
const title = metadata.name || metadata.title;
const desc = metadata.description || metadata.page_description;

// ✅ AFTER: Single canonical field
interface ArticleMetadata {
  title: string;           // Always 'title', never 'name'
  description: string;     // Always 'description'
  displayName?: string;    // Optional display variant
}
```

---

## 6. CONSTANT & CONFIG NAMING

### 6.1 Current Patterns

#### ✅ **Excellent - Clear Conventions**
```typescript
// app/utils/constants.ts
export const SITE_CONFIG = { ... };
export const CATEGORY_METADATA = { ... };
export const API_ENDPOINTS = { ... };

// Pattern: SCREAMING_SNAKE_CASE for true constants
```

#### ⚠️ **Inconsistent - Configuration Objects**

```typescript
// Some configs use camelCase:
export const badgeCache = new PerformanceCache(...);
export const materialCache = new PerformanceCache(...);

// Others use SCREAMING_SNAKE_CASE:
export const SITE_CONFIG = { ... };
export const CACHE_CONFIG = { ... };
```

### 6.2 Recommendations

#### **Rule: Distinguish Immutable vs. Mutable**

```typescript
// ✅ Immutable configuration (SCREAMING_SNAKE_CASE)
export const SITE_CONFIG = {
  name: 'Z-Beam',
  url: 'https://www.z-beam.com'
} as const;

export const API_TIMEOUT_MS = 5000 as const;

// ✅ Mutable instances (camelCase)
export const badgeCache = new PerformanceCache(...);
export const userSession = new SessionManager(...);

// ✅ Enums (PascalCase)
export enum HttpStatus {
  OK = 200,
  NotFound = 404
}
```

---

## 7. TEST FILE NAMING

### 7.1 Current Patterns

#### ✅ **Excellent - Descriptive Suffixes**
```
tests/
├── components/
│   ├── SectionTitle.test.tsx          # Unit test
│   ├── Micro.accessibility.test.tsx   # Accessibility test
│   └── Author.frontmatter.test.tsx    # Integration test
├── integration/
│   ├── contentAPI-filesystem.test.js
│   └── material-pages-build.test.js
└── unit/
    ├── metadata.test.ts
    └── seoMetadataFormatter.test.ts
```

**Pattern**: `<Component>.<Aspect>.test.<ext>`
**Strength**: Immediately clear what's being tested

#### ⚠️ **Inconsistent - File Extensions**

```
tests/
├── *.test.tsx  (React components)
├── *.test.ts   (TypeScript)
└── *.test.js   (JavaScript)
```

**Issue**: Mix of `.js` and `.ts` - should standardize to TypeScript

### 7.2 Recommendations

#### **Standard Test Naming**

```
# Component tests
<ComponentName>.test.tsx

# Aspect-specific tests
<ComponentName>.<aspect>.test.tsx
Examples:
- Micro.accessibility.test.tsx
- PageTitle.responsive.test.tsx
- DataGrid.performance.test.tsx

# Integration tests
<feature>-integration.test.ts
Examples:
- contentAPI-integration.test.ts
- schema-integration.test.ts

# E2E tests
<userFlow>.e2e.test.ts
Examples:
- material-search.e2e.test.ts
- scheduling-flow.e2e.test.ts
```

---

## 8. PROP NAMING CONVENTIONS

### 8.1 Current Patterns

#### ✅ **Excellent - Semantic Props**
```typescript
// Clear purpose:
<PageTitle 
  title="Main Title"
  description="Page description"
  breadcrumb={breadcrumbItems}
/>

<SectionTitle
  title="Section Name"
  linkedTitle="Linked Title"
  linkedUrl="/path"
  subtitle="Subtitle"
  thumbnailUrl="/img.jpg"
/>
```

#### ⚠️ **Inconsistent - Boolean Props**

```typescript
// Mixed patterns:
isLoading={true}       // ✅ Good: is* prefix
hasSettings={true}     // ✅ Good: has* prefix
loading={true}         // ⚠️ Less clear
disabled={true}        // ⚠️ Less clear (could be verb or adjective)
canEdit={true}         // ✅ Good: can* prefix
```

#### 🔴 **Problematic - Generic Names**

```typescript
// Too generic:
<Component data={...} />           // What kind of data?
<Component items={...} />          // What kind of items?
<Component config={...} />         // What configuration?

// Better:
<MaterialGrid materials={...} />   // Specific
<CardList cards={...} />           // Specific
<Heatmap heatmapConfig={...} />    // Specific
```

### 8.2 Recommendations

#### **Boolean Prop Prefixes**

```typescript
// ✅ State checks
is*      // isLoading, isVisible, isActive
has*     // hasError, hasData, hasPermission
can*     // canEdit, canDelete, canSubmit
should*  // shouldRender, shouldValidate

// ✅ Configuration flags
enable*  // enableCaching, enableDebug
allow*   // allowOverride, allowAnonymous
show*    // showHeader, showFooter
hide*    // hideControls, hideBreadcrumbs

// ❌ Avoid ambiguous names
loading   // Verb or adjective?
disabled  // Not clear if it's current state or intention
visible   // Use isVisible instead
```

#### **Collection Props**

```typescript
// ✅ Plural for arrays
materials: Material[]
categories: Category[]
items: Item[]

// ✅ Singular for single item
material: Material
selectedCategory: Category
activeItem: Item

// ✅ Specific collection names over generic
// Instead of: data, items, list
// Use: materials, categories, users
```

---

## 9. EVENT HANDLER NAMING

### 9.1 Current Patterns

#### ✅ **Excellent - on* Prefix**
```typescript
// Standard React convention:
onClick={() => ...}
onChange={(e) => ...}
onSubmit={(e) => ...}
onClose={() => ...}
```

#### ⚠️ **Inconsistent - Handler Functions**

```typescript
// Mixed patterns:
const handleClick = () => ...      // ✅ Good
const onClick = () => ...          // ⚠️ Confusing (same as prop)
const clickHandler = () => ...     // ⚠️ Non-standard ordering
const onButtonClick = () => ...    // ✅ Good (specific)
```

### 9.2 Recommendations

#### **Handler Naming Standard**

```typescript
// ✅ PATTERN: handle<Action> or handle<Element><Action>
const handleClick = () => { ... };
const handleSubmit = () => { ... };
const handleInputChange = (e) => { ... };
const handleModalClose = () => { ... };

// Usage:
<button onClick={handleClick}>
<form onSubmit={handleSubmit}>
<input onChange={handleInputChange}>
<Modal onClose={handleModalClose}>

// ✅ For specific elements:
const handleSaveButtonClick = () => { ... };
const handleCancelButtonClick = () => { ... };

<button onClick={handleSaveButtonClick}>Save</button>
<button onClick={handleCancelButtonClick}>Cancel</button>
```

---

## 10. URL & ROUTE NAMING

### 10.1 Current Patterns

#### ✅ **Excellent - Semantic URLs**
```
/materials/metal/ferrous/steel-laser-cleaning
/contaminants/organic/oil/oil-contamination
/settings/metal/ferrous/steel-settings
```

**Pattern**: `/<type>/<category>/<subcategory>/<slug>`
**Strength**: Clear hierarchy, SEO-friendly

#### ⚠️ **Inconsistent - Slug Suffixes**

```
materials: *-laser-cleaning
contaminants: *-contamination
settings: *-settings

// Question: Why inconsistent suffixes?
// Could unify to: *-cleaning, *-removal, *-config
```

### 10.2 Recommendations

#### **Option A: Keep Current (Semantic Differentiation)**
```
// ✅ Each type has semantic suffix
/materials/steel-laser-cleaning    (process-focused)
/contaminants/oil-contamination    (problem-focused)
/settings/steel-settings           (config-focused)
```

**Pro**: Semantic clarity about page content
**Con**: Mixed patterns

#### **Option B: Unify Suffixes**
```
// ✅ Standardize to content type
/materials/steel
/contaminants/oil
/settings/steel-config

// Or use action verbs:
/materials/steel-cleaning
/contaminants/oil-removal
/settings/steel-parameters
```

**Pro**: Consistent pattern
**Con**: Breaks existing SEO/URLs (requires redirects)

**Recommendation**: Keep current (Option A) - SEO established, semantic clarity valuable

---

## 11. IMPLEMENTATION PRIORITIES

### Phase 1: Critical (High Impact, Low Risk)
**Timeline**: 1-2 weeks

1. **Standardize `metadata` terminology** (replace `frontmatter` references)
   - Update type definitions
   - Update all component references
   - Add clear JSDoc comments
   - **Impact**: Eliminates #1 source of confusion

2. **Add explicit Props interfaces** where missing
   - `PageTitle` → `PageTitleProps`
   - `DataGrid` → `DataGridProps<T>`
   - **Impact**: Better type safety, clearer documentation

3. **Document naming conventions** in AI instructions
  - Add to [AI Assistant Guide](../../../z-beam-generator/docs/08-development/AI_ASSISTANT_GUIDE.md#workflow-orchestration)
   - Create `docs/08-development/NAMING_CONVENTIONS.md`
   - **Impact**: Prevents future inconsistencies

### Phase 2: Important (Medium Impact, Medium Risk)
**Timeline**: 2-4 weeks

4. **Eliminate redundant folder nesting**
   - `MaterialsLayout/MaterialsLayout.tsx` → Add `index.tsx` or flatten
   - Same for other redundant folders
   - **Impact**: Cleaner project structure

5. **Standardize boolean prop prefixes**
   - Audit all `loading`, `disabled`, etc.
   - Refactor to `isLoading`, `isDisabled`
   - **Impact**: Clearer prop intentions

6. **Rename ambiguous components**
   - `ItemPage` → `EntityDetailPage` or `MaterialDetailPage`
   - `ListingPage` → `EntityListingPage`
   - **Impact**: Clearer component purposes

### Phase 3: Nice-to-Have (Low Impact, Low Risk)
**Timeline**: Ongoing

7. **Standardize test file extensions** (`.js` → `.ts`)
8. **Add JSDoc comments** to all exported functions
9. **Create naming convention linter rules**

---

## 12. ENFORCEMENT MECHANISMS

### 12.1 Automated Checks

```typescript
// ESLint rules to add:
{
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "interface",
      "format": ["PascalCase"],
      "custom": {
        "regex": "^I[A-Z]",
        "match": false // Disallow I-prefix (we use PascalCase)
      }
    },
    {
      "selector": "typeAlias",
      "format": ["PascalCase"]
    },
    {
      "selector": "variable",
      "modifiers": ["const", "global"],
      "format": ["UPPER_CASE", "camelCase"]  // Allow both
    }
  ]
}
```

### 12.2 Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh

# Check for naming violations
npm run lint:naming

# Ensure no duplicate type definitions
npm test -- tests/types/centralized.test.ts

# Check for frontmatter vs metadata inconsistencies
grep -r "\.frontmatter\." app/ && echo "⚠️  Found .frontmatter references - use .metadata" && exit 1
```

### 12.3 Documentation

Create `docs/08-development/NAMING_CONVENTIONS.md`:
```markdown
# Naming Conventions

## Components
- PascalCase: `MyComponent.tsx`
- Export same name: `export function MyComponent() { ... }`
- Props interface: `MyComponentProps`

## Functions
- camelCase: `getUserData()`
- Verb-first: `get`, `set`, `create`, `update`, `validate`

## Files
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Tests: `Component.test.tsx`

[Full details in SEMANTIC_NAMING_AUDIT.md]
```

---

## 13. MIGRATION STRATEGY

### Step 1: Create Reference Implementation
```typescript
// ✅ Example: Perfect naming
// app/components/MaterialDetail/MaterialDetail.tsx

export interface MaterialDetailProps {
  metadata: ArticleMetadata;  // Not 'frontmatter' or 'data'
  isLoading: boolean;         // Not 'loading'
  hasSettings: boolean;       // Not 'settings'
  onClose: () => void;        // Event prop
}

export function MaterialDetail({
  metadata,
  isLoading,
  hasSettings,
  onClose
}: MaterialDetailProps) {
  // Implementation
}
```

### Step 2: Gradual Refactoring
```bash
# Week 1: High-traffic components
- PageTitle
- SectionTitle
- MaterialsLayout
- ContaminantsLayout

# Week 2: Utility functions
- relationshipHelpers.ts
- layoutHelpers.ts
- entityLookup.ts

# Week 3: Type definitions
- Ensure all Props interfaces named
- Standardize metadata references

# Week 4: Tests & Documentation
- Update test names
- Add JSDoc comments
- Create naming guide
```

### Step 3: Add to CI/CD
```yaml
# .github/workflows/naming-check.yml
name: Naming Convention Check
on: [pull_request]
jobs:
  check-naming:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for naming violations
        run: |
          # Check for .frontmatter references (should be .metadata)
          ! grep -r "\.frontmatter\." app/
          
          # Check for Props interfaces
          ! grep -r "^export function.*: {$" app/components/
```

---

## 14. DECISION RECORD

### ADR-001: Use `metadata` not `frontmatter`

**Status**: Proposed  
**Date**: 2025-12-26  
**Decision**: Standardize on `metadata` for all YAML frontmatter data

**Context**:
- Codebase inconsistently uses `frontmatter`, `metadata`, `data`
- Causes confusion for developers
- Makes code searches difficult

**Decision**:
- Use `article.metadata` universally
- Deprecate `frontmatter` terminology in new code
- Update types to reflect this

**Consequences**:
- ✅ Consistent terminology
- ✅ Clearer data flow
- ❌ Requires migration of existing code (gradual)

### ADR-002: Explicit Props Interfaces

**Status**: Proposed  
**Date**: 2025-12-26  
**Decision**: All components must have named Props interface

**Context**:
- Some components use inline props
- Others use named interfaces
- Inconsistency makes testing harder

**Decision**:
- Pattern: `<ComponentName>Props`
- Export props interface for testing
- Use explicit type for component function

**Consequences**:
- ✅ Better type safety
- ✅ Easier to test
- ✅ Better IDE autocomplete
- ❌ Slightly more verbose

---

## 15. METRICS & SUCCESS CRITERIA

### Before (Baseline)
- ❌ 3 terms for same data: `metadata`, `frontmatter`, `data`
- ❌ ~40% of components missing Props interfaces
- ❌ Mixed boolean prop naming (15+ patterns)
- ❌ Redundant folder/file naming (12 instances)

### After (Goals)
- ✅ 1 term for content data: `metadata`
- ✅ 100% of components have Props interfaces
- ✅ Consistent boolean prefixes: `is*`, `has*`, `can*`
- ✅ Zero redundant folder/file names

### Measurement
```bash
# Run quarterly:
npm run audit:naming

# Checks:
# - Props interface coverage
# - Naming pattern compliance
# - Duplicate terminology usage
# - File/folder redundancy
```

---

## 16. SUMMARY

### Critical Actions
1. ✅ **Standardize to `metadata`** - Replace all `frontmatter` references
2. ✅ **Add Props interfaces** - Explicit types for all components  
3. ✅ **Document conventions** - Create authoritative naming guide
4. ✅ **Add automated checks** - ESLint rules + pre-commit hooks

### Long-term Vision
- **Semantic clarity**: Names reveal intent at a glance
- **Consistency**: One way to do each thing
- **Discoverability**: Easy to find what you need
- **Maintainability**: Changes don't break expectations

---

*Next Steps*: Review with team → Prioritize Phase 1 → Implement gradually → Measure improvement

