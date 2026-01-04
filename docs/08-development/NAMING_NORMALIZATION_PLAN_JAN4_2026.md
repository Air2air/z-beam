# Naming Normalization Plan
**Date**: January 4, 2026  
**Status**: 🔴 ACTIVE - Requires Implementation  
**Priority**: HIGH - Affects code maintainability and consistency

---

## 📋 Executive Summary

The Z-Beam codebase has **3 major naming inconsistencies** that create confusion and violate TypeScript/React conventions:

1. **snake_case/camelCase Mix**: YAML frontmatter uses `meta_description`, TypeScript expects `metaDescription`
2. **Redundant Deprecated Fields**: Author types have 3 pairs of duplicate fields
3. **Non-Standard Props Naming**: Mix of `ComponentNameProps` and custom variations

**Impact**: Developer confusion, type safety issues, maintenance overhead  
**Solution**: Establish clear conventions with automated migration path

---

## 🔴 Critical Issue 1: snake_case vs camelCase

### Current State (BROKEN)

**YAML Frontmatter** (snake_case):
```yaml
meta_description: "Aluminum laser cleaning parameters"
page_description: "Complete guide to aluminum..."
```

**TypeScript Interface** (snake_case):
```typescript
interface ArticleMetadata {
  meta_description?: string;  // ❌ Wrong: Should be camelCase
  page_description?: string;  // ❌ Wrong: Should be camelCase
}
```

**React Component** (snake_case prop):
```tsx
<Component 
  page_description={data.page_description}  // ❌ Wrong: React expects camelCase
/>
```

### Problem

1. **Violates React/TypeScript Conventions**: Props should be camelCase
2. **Type Safety Issues**: ESLint warns about snake_case in JSX
3. **Confusion**: Developers unsure which case to use where

### Target State (CORRECT)

**YAML Frontmatter** (snake_case - unchanged):
```yaml
meta_description: "Aluminum laser cleaning parameters"
page_description: "Complete guide to aluminum..."
```

**TypeScript Interface** (camelCase):
```typescript
interface ArticleMetadata {
  metaDescription?: string;  // ✅ Correct: camelCase
  pageDescription?: string;  // ✅ Correct: camelCase
}
```

**Loader Function** (auto-converts):
```typescript
function loadFrontmatter(yamlData: any): ArticleMetadata {
  return {
    metaDescription: yamlData.meta_description,  // ✅ Convert at boundary
    pageDescription: yamlData.page_description,
    // ... other fields
  };
}
```

**React Component** (camelCase prop):
```tsx
<Component 
  pageDescription={data.pageDescription}  // ✅ Correct: camelCase
/>
```

### Migration Strategy

**Phase 1: Type Definitions** (1 hour)
- Update `types/centralized.ts`: Change all snake_case fields to camelCase
- Update `ArticleMetadata`, `Author`, all interfaces

**Phase 2: Loader Functions** (2 hours)
- Update `app/utils/contentAPI.ts`: Add camelCase conversion
- Update all `getXXXArticle()` functions to map snake_case → camelCase

**Phase 3: Component Props** (3 hours)
- Update all components to use camelCase props
- Search: `page_description=`, `meta_description=` in JSX
- Replace with: `pageDescription=`, `metaDescription=`

**Phase 4: Helper Functions** (1 hour)
- Update `app/utils/contentPages/helpers.ts`
- Update `app/utils/relationshipHelpers.ts`

**Phase 5: Verification** (1 hour)
- Run TypeScript compiler: `npm run build`
- Search for remaining snake_case: `grep -r "meta_description\|page_description" app/`
- Verify only YAML files and loader functions remain

**Total Estimated Time**: 8 hours

---

## 🟡 Issue 2: Redundant Deprecated Author Fields

### Current State (types/centralized.ts)

```typescript
export interface Author {
  // NEW FIELDS (plural, array)
  expertiseAreas?: string | string[];
  educationList?: string[];
  credentialsList?: string[];
  
  // DEPRECATED FIELDS (still present - causing confusion)
  /** @deprecated Use expertiseAreas instead */
  expertise?: string | string[];
  /** @deprecated Use educationList instead */
  education?: string[];
  /** @deprecated Use credentialsList instead */
  credentials?: string[];
}
```

### Problem

1. **Dual Field Access**: Code checks both old and new fields
2. **Maintenance Burden**: Must update both during changes
3. **Type Bloat**: 6 fields where 3 would suffice

### Target State

```typescript
export interface Author {
  // ONLY NEW FIELDS (plural, array)
  expertiseAreas?: string | string[];
  educationList?: string[];
  credentialsList?: string[];
  
  // REMOVED: expertise, education, credentials
}
```

### Migration Strategy

**Step 1: Search for Usage** (30 min)
```bash
grep -r "\.expertise[^A]" app/
grep -r "\.education[^L]" app/
grep -r "\.credentials[^L]" app/
```

**Step 2: Update All References** (2 hours)
- Replace `author.expertise` → `author.expertiseAreas`
- Replace `author.education` → `author.educationList`
- Replace `author.credentials` → `author.credentialsList`

**Step 3: Update YAML Frontmatter** (1 hour)
- Search all `frontmatter/**/*.yaml` files
- Update field names to plural forms

**Step 4: Remove Deprecated Fields** (15 min)
- Delete deprecated fields from `types/centralized.ts`

**Step 5: Verification** (30 min)
- TypeScript compile check
- Grep for old field names (should only find comments)

**Total Estimated Time**: 4 hours

---

## 🟢 Issue 3: Props Interface Naming

### Current State (INCONSISTENT)

```typescript
// ✅ GOOD: Standard pattern
interface IndustryApplicationsPanelProps { }
interface CollapsibleProps { }
interface FAQPanelProps { }

// ⚠️ NON-STANDARD: Custom suffix
export interface InfoCardPropsLocal { }  // Why "Local"?

// ⚠️ MISSING: Some components have inline props
function MyComponent({ title, content }: { title: string; content: string }) { }
```

### Target State (CONSISTENT)

**Rule**: All component Props interfaces must follow `ComponentNameProps` pattern

```typescript
// ✅ CORRECT
interface IndustryApplicationsPanelProps { }
interface InfoCardProps { }  // Removed "Local" suffix

// ✅ CORRECT: Create named interface for inline props
interface MyComponentProps {
  title: string;
  content: string;
}
function MyComponent({ title, content }: MyComponentProps) { }
```

### Migration Strategy

**Step 1: Find Non-Standard Props** (30 min)
```bash
grep -r "PropsLocal\|interface.*Props.*Local" app/components/
grep -r "}: {" app/components/  # Find inline prop types
```

**Step 2: Rename Non-Standard Interfaces** (1 hour)
- `InfoCardPropsLocal` → `InfoCardProps`
- Update all usages

**Step 3: Extract Inline Props** (2 hours)
- Create named `ComponentNameProps` interfaces
- Replace inline `{ ... }` types

**Step 4: Verification** (30 min)
- Search for violations: `grep -r "PropsLocal" app/`
- Verify all components have named Props interfaces

**Total Estimated Time**: 4 hours

---

## 📐 Naming Convention Standards

### YAML Frontmatter (Data Layer)

**Rule**: Use `snake_case` for all fields

```yaml
✅ CORRECT:
meta_description: "..."
page_description: "..."
expertise_areas: ["Lasers", "Materials"]
education_list: ["PhD Physics"]

❌ WRONG:
metaDescription: "..."
pageDescription: "..."
expertiseAreas: ["..."]
```

**Rationale**: YAML convention, easy to read, consistent with other configs

---

### TypeScript Types (Type Layer)

**Rule**: Use `camelCase` for all fields

```typescript
✅ CORRECT:
interface ArticleMetadata {
  metaDescription?: string;
  pageDescription?: string;
  expertiseAreas?: string[];
  educationList?: string[];
}

❌ WRONG:
interface ArticleMetadata {
  meta_description?: string;  // Don't use snake_case
  page_description?: string;
}
```

**Rationale**: TypeScript/JavaScript convention, matches React props

---

### React Props (Component Layer)

**Rule 1**: All prop interfaces named `ComponentNameProps`

```typescript
✅ CORRECT:
interface MaterialCardProps { }
interface SafetyDataPanelProps { }

❌ WRONG:
interface MaterialCardPropsLocal { }  // No suffixes
interface Props { }  // Too generic
```

**Rule 2**: Use `camelCase` for all prop names

```tsx
✅ CORRECT:
<Component 
  metaDescription={data.metaDescription}
  pageDescription={data.pageDescription}
/>

❌ WRONG:
<Component 
  meta_description={data.meta_description}  // Don't use snake_case
/>
```

**Rationale**: React convention, JSX attributes are camelCase

---

### Boolean Props (Component Layer)

**Rule**: Use `is/has/can` prefix for boolean props

```typescript
✅ CORRECT:
interface CardProps {
  isLoading: boolean;
  hasError: boolean;
  canEdit: boolean;
}

❌ WRONG:
interface CardProps {
  loading: boolean;      // Ambiguous
  error: boolean;        // Ambiguous
  editable: boolean;     // Use "canEdit"
}
```

**Rationale**: Makes intent clear, standard React pattern

---

## 🔄 YAML → TypeScript Mapping

### Automatic Conversion Pattern

**Loader Function Template**:
```typescript
function loadFrontmatter(yamlData: any): ArticleMetadata {
  return {
    // ✅ CORRECT: Convert at data boundary
    metaDescription: yamlData.meta_description,
    pageDescription: yamlData.page_description,
    expertiseAreas: yamlData.expertise_areas,
    educationList: yamlData.education_list,
    credentialsList: yamlData.credentials_list,
    
    // Keep other fields
    title: yamlData.title,
    slug: yamlData.slug,
    // ...
  };
}
```

**Rule**: YAML → TypeScript conversion happens ONLY in loader functions

**Files to Update**:
- `app/utils/contentAPI.ts` (all `getXXXArticle` functions)
- `app/utils/frontmatterLoader.ts` (if exists)

---

## 📝 Migration Checklist

### Phase 1: Type Definitions ✅
- [ ] Update `types/centralized.ts`: snake_case → camelCase
- [ ] Remove deprecated author fields (`expertise`, `education`, `credentials`)
- [ ] Standardize all Props interfaces to `ComponentNameProps`
- [ ] Add boolean prefixes (`is/has/can`)
- [ ] Run TypeScript compile check: `npm run build`

### Phase 2: Loader Functions ✅
- [ ] Update `app/utils/contentAPI.ts`: Add snake_case → camelCase conversion
- [ ] Update `getMaterialArticle()`
- [ ] Update `getContaminantArticle()`
- [ ] Update `getCompoundArticle()`
- [ ] Update `getSettingsArticle()`
- [ ] Test with live data

### Phase 3: Component Props ✅
- [ ] Search for snake_case props: `grep -r "meta_description=" app/`
- [ ] Replace with camelCase: `metaDescription=`
- [ ] Search for snake_case props: `grep -r "page_description=" app/`
- [ ] Replace with camelCase: `pageDescription=`
- [ ] Update component interfaces to match

### Phase 4: Helper Functions ✅
- [ ] Update `app/utils/contentPages/helpers.ts`
- [ ] Update `app/utils/relationshipHelpers.ts`
- [ ] Update any other utility functions

### Phase 5: YAML Frontmatter ✅
- [ ] Update author fields: `expertise` → `expertise_areas`
- [ ] Update author fields: `education` → `education_list`
- [ ] Update author fields: `credentials` → `credentials_list`
- [ ] Keep other fields as snake_case (correct)

### Phase 6: Verification ✅
- [ ] Run full TypeScript build: `npm run build`
- [ ] Search for violations: `grep -r "meta_description" app/` (should only find loaders)
- [ ] Search for violations: `grep -r "page_description" app/` (should only find loaders)
- [ ] Search for violations: `grep -r "\.expertise[^A]" app/` (should be empty)
- [ ] Test on dev server: All pages load correctly
- [ ] Run SEO validation: Meta descriptions render correctly

---

## 🎯 Expected Outcomes

### After Migration

**Type Safety**: ✅
- No snake_case in TypeScript interfaces
- Clear camelCase convention throughout codebase

**Code Clarity**: ✅
- Standard `ComponentNameProps` naming
- Boolean props clearly prefixed
- No deprecated fields

**React Compliance**: ✅
- All JSX props use camelCase
- Follows React/TypeScript best practices

**Maintainability**: ✅
- Clear YAML → TypeScript conversion boundary
- Single source of truth for each field
- Easy to understand for new developers

---

## 📚 Reference Documentation

**Related Files**:
- `types/centralized.ts` - All type definitions
- `app/utils/contentAPI.ts` - YAML loaders
- `docs/08-development/NAMING_CONVENTIONS.md` - Naming standards (to be created)

**Related Policies**:
- Type System Requirements (Dec 21, 2025) - Already enforces centralized types
- Props Interface Standards - Extension of existing policy

**Migration Timeline**: 16-20 hours total development time

**Risk Assessment**: LOW
- Changes are mechanical (search & replace)
- TypeScript compiler will catch all errors
- No runtime behavior changes
- Can be done incrementally per domain

---

## ✅ Next Actions

1. **Get Approval**: Confirm this plan with team/user
2. **Start Phase 1**: Update type definitions
3. **Test Incrementally**: After each phase, run build + manual test
4. **Document**: Create `NAMING_CONVENTIONS.md` with final standards
5. **Enforce**: Add ESLint rules to prevent future violations

**Priority Order**:
1. 🔴 **Critical**: snake_case → camelCase (breaks React conventions)
2. 🟡 **Important**: Remove deprecated fields (reduces confusion)
3. 🟢 **Nice-to-Have**: Standardize Props naming (improves consistency)

---

**Author**: GitHub Copilot  
**Last Updated**: January 4, 2026  
**Status**: Awaiting approval to begin implementation
