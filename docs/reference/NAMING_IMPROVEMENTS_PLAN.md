# Naming Improvements Implementation Plan
**Priority-Ordered Action Items**

---

## 🚨 CORRECTION NOTICE (December 28, 2025)

**Section 1.1 below contains INCORRECT guidance that was REVERSED on December 28, 2025.**

**CORRECT Standard** (Dec 28, 2025):
- ✅ Use `article.frontmatter` (canonical term)
- ❌ Don't use `article.metadata` wrapper (DEPRECATED)

**See**: `docs/reference/TERMINOLOGY_CORRECTION_DEC28_2025.md` for complete correction details.

**This document remains** for historical context and for the other naming conventions (boolean props, PascalCase, etc.) which are still valid.

---

## Phase 1: Critical Fixes (Week 1-2)

### ⚠️ 1.1 Standardize `frontmatter` Terminology (CORRECTED Dec 28, 2025)
**Impact**: HIGH | **Effort**: MEDIUM | **Risk**: LOW

#### Current Problem
```typescript
// Inconsistent usage across codebase:
article.metadata.title    // DEPRECATED - don't use
article.frontmatter.name  // CORRECT - use this
```

#### Solution (CORRECTED)
```typescript
// ✅ Standard everywhere:
article.frontmatter.title
article.frontmatter.name
article.frontmatter.author
article.frontmatter.description
```

#### Implementation Steps (CORRECTED)
1. **Use helper function**:
   ```typescript
   // app/utils/schemas/helpers.ts handles both formats
   const meta = getMetadata(article); // Returns frontmatter if available
   ```

2. **Update Type Definitions**:
   ```typescript
   // types/centralized.ts
   export interface Article {
     frontmatter: ArticleMetadata;  // ✅ Consistent name (CORRECTED)
     components: Components;
   }
   
   // Add deprecation notice for metadata wrapper
   /** @deprecated Use frontmatter instead */
   metadata?: ArticleMetadata;
   ```
   ```

3. **Update Key Components** (Priority Order):
   - [ ] `ContentPages/ItemPage.tsx`
   - [ ] `MaterialsLayout/MaterialsLayout.tsx`
   - [ ] `ContaminantsLayout/ContaminantsLayout.tsx`
   - [ ] `CompoundsLayout/CompoundsLayout.tsx`
   - [ ] `SettingsLayout/SettingsLayout.tsx`

4. **Update Utilities**:
   - [ ] `app/utils/relationshipHelpers.ts`
   - [ ] `app/utils/layoutHelpers.ts`
   - [ ] `app/utils/entityLookup.ts`

5. **Verification**:
   ```bash
   # Should return no results:
   grep -r "\.frontmatter\." app/
   ```

**Estimated Time**: 4-6 hours

---

### 1.2 Add Missing Props Interfaces
**Impact**: MEDIUM | **Effort**: LOW | **Risk**: LOW

#### Current Problem
Some components define props inline without named interface:
```typescript
// ❌ Current
export function PageTitle({
  title,
  description
}: {
  title: string;
  description?: string;
}) { ... }
```

#### Solution
```typescript
// ✅ Standard
export interface PageTitleProps {
  title: string;
  description?: string;
}

export function PageTitle({
  title,
  description
}: PageTitleProps) { ... }
```

#### Components Needing Props Interfaces
1. **Priority 1** (High-usage):
   - [ ] `Title/PageTitle.tsx` → `PageTitleProps`
   - [ ] `DataGrid/DataGrid.tsx` → `DataGridProps<T>`
   - [ ] `Base/MarkdownRenderer.tsx` → `MarkdownRendererProps`

2. **Priority 2** (Medium-usage):
   - [ ] `Hero/Hero.tsx` → `HeroProps`
   - [ ] `GridSection/GridSection.tsx` → `GridSectionProps`
   - [ ] `RegulatoryStandards/RegulatoryStandards.tsx` → `RegulatoryStandardsProps`

#### Implementation Template
```typescript
// 1. Define interface above component
export interface ComponentNameProps {
  // ... props
}

// 2. Add to component function signature
export function ComponentName(props: ComponentNameProps) {
  // OR destructured:
  export function ComponentName({
    prop1,
    prop2
  }: ComponentNameProps) {
    // ...
  }
}

// 3. Export for testing
export type { ComponentNameProps };
```

**Estimated Time**: 2-3 hours

---

### 1.3 Standardize Boolean Prop Names
**Impact**: MEDIUM | **Effort**: LOW | **Risk**: LOW

#### Audit Current Booleans
```bash
# Find all boolean props
grep -r ": boolean" app/components/ --include="*.tsx" | grep -E "(loading|disabled|visible|hidden|enabled)"
```

#### Refactoring Rules
```typescript
// ❌ BEFORE → ✅ AFTER
loading → isLoading
disabled → isDisabled
visible → isVisible
hidden → isHidden
enabled → isEnabled
active → isActive
selected → isSelected
```

#### High-Priority Components
1. [ ] Search for `loading:` → Replace with `isLoading:`
2. [ ] Search for `disabled:` → Replace with `isDisabled:`
3. [ ] Update all usages in consuming components

#### Script for Automated Refactoring
```bash
#!/bin/bash
# scripts/refactor-boolean-props.sh

# Backup files
git stash

# Replace patterns
find app/components -name "*.tsx" -exec sed -i '' 's/loading:/isLoading:/g' {} +
find app/components -name "*.tsx" -exec sed -i '' 's/disabled:/isDisabled:/g' {} +
find app/components -name "*.tsx" -exec sed -i '' 's/visible:/isVisible:/g' {} +

# Run tests
npm test

echo "Review changes with: git diff"
```

**Estimated Time**: 2-3 hours

---

## Phase 2: Structural Improvements (Week 3-4)

### 2.1 Eliminate Redundant Folder Nesting
**Impact**: MEDIUM | **Effort**: LOW | **Risk**: LOW

#### Current Redundant Structures
```
❌ MaterialsLayout/
   └── MaterialsLayout.tsx

❌ ContaminantsLayout/
   └── ContaminantsLayout.tsx

❌ SafetyDataPanel/
   └── SafetyDataPanel.tsx
```

#### Solutions

**Option A: Add Index File** (Recommended)
```
✅ MaterialsLayout/
   ├── index.tsx          (exports MaterialsLayout)
   └── MaterialsLayout.tsx
```

**Option B: Flatten** (If truly single-file)
```
✅ MaterialsLayout.tsx
```

#### Implementation Steps
1. **Identify all redundant folders**:
   ```bash
   # Find folders with single file matching folder name
   find app/components -type d | while read dir; do
     basename=$(basename "$dir")
     if [ -f "$dir/$basename.tsx" ] && [ $(ls -1 "$dir" | wc -l) -eq 1 ]; then
       echo "$dir (redundant)"
     fi
   done
   ```

2. **For each redundant folder, add index.tsx**:
   ```typescript
   // MaterialsLayout/index.tsx
   export { MaterialsLayout, type MaterialsLayoutProps } from './MaterialsLayout';
   export default MaterialsLayout;
   ```

3. **Update imports across codebase**:
   ```typescript
   // ❌ Before
   import MaterialsLayout from './MaterialsLayout/MaterialsLayout';
   
   // ✅ After
   import MaterialsLayout from './MaterialsLayout';
   ```

**Estimated Time**: 3-4 hours

---

### 2.2 Rename Ambiguous Components
**Impact**: LOW | **Effort**: MEDIUM | **Risk**: MEDIUM

#### Components to Consider

| Current Name | Issue | Suggested Alternative |
|--------------|-------|---------------------|
| `ItemPage` | "Item" too generic | `EntityDetailPage` or `MaterialDetailPage` |
| `ListingPage` | Generic | `EntityListingPage` |
| `Title/Title.tsx` | Redundant | Merge with `PageTitle` or rename to `BaseTitle` |

#### Implementation Approach

**Before Making Changes**:
1. **Assess impact**:
   ```bash
   # Find all usages of component
   grep -r "import.*ItemPage" app/ tests/
   grep -r "<ItemPage" app/
   ```

2. **Create migration plan**:
   - List all files using the component
   - Estimate update effort
   - Check for potential breaking changes

3. **Get team consensus** on new names

**Renaming Steps** (Example: ItemPage → EntityDetailPage):
```bash
# 1. Rename file
git mv app/components/ContentPages/ItemPage.tsx app/components/ContentPages/EntityDetailPage.tsx

# 2. Update component name in file
sed -i '' 's/ItemPage/EntityDetailPage/g' app/components/ContentPages/EntityDetailPage.tsx

# 3. Update imports
find app tests -name "*.ts*" -exec sed -i '' 's/ItemPage/EntityDetailPage/g' {} +

# 4. Update route references
find app -name "page.tsx" -exec sed -i '' 's/ItemPage/EntityDetailPage/g' {} +

# 5. Run tests
npm test

# 6. Manual review
git diff
```

**Decision**: Defer to Phase 3 (low priority) - Current names work, risk outweighs benefit

---

## Phase 3: Documentation & Enforcement (Week 5-6)

### 3.1 Update AI Instructions
**Impact**: HIGH | **Effort**: LOW | **Risk**: NONE

#### Add to `.github/copilot-instructions.md`
```markdown
## Naming Conventions (MANDATORY)

### Data Structures
- ✅ ALWAYS use `article.metadata` (never `article.frontmatter` or `data`)
- ✅ ALWAYS import types from `@/types` (never create local interfaces)

### Props
- ✅ ALWAYS create named Props interface: `<Component>Props`
- ✅ ALWAYS export Props interface for testing

### Booleans
- ✅ ALWAYS use `is*`, `has*`, `can*` prefixes
- ❌ NEVER use ambiguous names: `loading`, `disabled`, `visible`

### Components
- ✅ ALWAYS PascalCase: `MyComponent.tsx`
- ✅ ALWAYS match file name to export name
- ✅ ALWAYS add Props interface

### Functions
- ✅ ALWAYS camelCase with verb prefix: `getUserData()`
- ✅ ALWAYS clear action verbs: `get`, `set`, `create`, `update`, `validate`

See `docs/08-development/NAMING_CONVENTIONS.md` for complete guide.
```

**Estimated Time**: 30 minutes

---

### 3.2 Add ESLint Rules
**Impact**: HIGH | **Effort**: LOW | **Risk**: LOW

#### Update `.eslintrc.json`
```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "custom": {
          "regex": "^I[A-Z]",
          "match": false
        }
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "variable",
        "modifiers": ["const", "global"],
        "format": ["UPPER_CASE", "camelCase"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      },
      {
        "selector": "parameter",
        "format": ["camelCase"],
        "leadingUnderscore": "allow"
      }
    ]
  }
}
```

**Estimated Time**: 1 hour

---

### 3.3 Add Pre-commit Hooks
**Impact**: HIGH | **Effort**: LOW | **Risk**: LOW

#### Create `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for naming violations
echo "🔍 Checking naming conventions..."

# Check for .frontmatter references (should be .metadata)
if grep -r "\.frontmatter\." app/ 2>/dev/null; then
  echo "❌ ERROR: Found .frontmatter references. Use .metadata instead."
  exit 1
fi

# Check for duplicate type definitions
npm test -- tests/types/centralized.test.ts --silent

# Check for Props interfaces
missing_props=$(grep -r "export function.*{$" app/components/ --include="*.tsx" | grep -v "Props")
if [ -n "$missing_props" ]; then
  echo "⚠️  WARNING: Some components may be missing Props interfaces"
  echo "$missing_props"
fi

echo "✅ Naming conventions check passed"
```

**Estimated Time**: 1 hour

---

## Phase 4: Testing & Verification (Ongoing)

### 4.1 Create Naming Tests
**Impact**: HIGH | **Effort**: MEDIUM | **Risk**: NONE

#### Create `tests/naming/conventions.test.ts`
```typescript
import fs from 'fs';
import path from 'path';

describe('Naming Conventions', () => {
  describe('Component Files', () => {
    test('all component files should use PascalCase', () => {
      const components = getComponentFiles();
      components.forEach(file => {
        const basename = path.basename(file, '.tsx');
        expect(basename).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
      });
    });
    
    test('all components should have Props interface', () => {
      const components = getComponentFiles();
      components.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const componentName = path.basename(file, '.tsx');
        const propsRegex = new RegExp(`interface ${componentName}Props`);
        
        // If component accepts props, should have interface
        if (content.includes('export function') && content.includes('):')) {
          expect(content).toMatch(propsRegex);
        }
      });
    });
  });
  
  describe('Data References', () => {
    test('should not use .frontmatter (use .metadata)', () => {
      const files = getAllTypeScriptFiles();
      files.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).not.toContain('.frontmatter.');
      });
    });
  });
  
  describe('Boolean Props', () => {
    test('boolean props should use is/has/can prefixes', () => {
      const components = getComponentFiles();
      const badPatterns = ['loading:', 'disabled:', 'visible:', 'hidden:'];
      
      components.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        badPatterns.forEach(pattern => {
          if (content.includes(`${pattern} boolean`)) {
            fail(`Found ambiguous boolean prop in ${file}: ${pattern}`);
          }
        });
      });
    });
  });
});

function getComponentFiles(): string[] {
  // Implementation
}

function getAllTypeScriptFiles(): string[] {
  // Implementation
}
```

**Estimated Time**: 3-4 hours

---

### 4.2 Add to CI/CD Pipeline
**Impact**: HIGH | **Effort**: LOW | **Risk**: NONE

#### Create `.github/workflows/naming-check.yml`
```yaml
name: Naming Convention Check
on: [pull_request]

jobs:
  check-naming:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check for .frontmatter references
        run: |
          if grep -r "\.frontmatter\." app/; then
            echo "❌ Found .frontmatter references - use .metadata instead"
            exit 1
          fi
      
      - name: Check for duplicate types
        run: npm test -- tests/types/centralized.test.ts
      
      - name: Run naming convention tests
        run: npm test -- tests/naming/
      
      - name: ESLint naming rules
        run: npm run lint
```

**Estimated Time**: 1 hour

---

## Timeline Summary

| Phase | Tasks | Duration | Start | End |
|-------|-------|----------|-------|-----|
| **Phase 1** | Critical Fixes | 2 weeks | Week 1 | Week 2 |
| 1.1 | Standardize metadata | 4-6 hours | Day 1 | Day 2 |
| 1.2 | Add Props interfaces | 2-3 hours | Day 3 | Day 3 |
| 1.3 | Boolean prop names | 2-3 hours | Day 4 | Day 4 |
| **Phase 2** | Structural Improvements | 2 weeks | Week 3 | Week 4 |
| 2.1 | Eliminate redundancy | 3-4 hours | Day 11 | Day 12 |
| 2.2 | Rename components | Deferred | - | - |
| **Phase 3** | Documentation & Enforcement | 2 weeks | Week 5 | Week 6 |
| 3.1 | Update AI instructions | 30 min | Day 21 | Day 21 |
| 3.2 | Add ESLint rules | 1 hour | Day 22 | Day 22 |
| 3.3 | Add pre-commit hooks | 1 hour | Day 23 | Day 23 |
| **Phase 4** | Testing & Verification | Ongoing | Week 7+ | - |
| 4.1 | Create naming tests | 3-4 hours | Day 31 | Day 32 |
| 4.2 | Add to CI/CD | 1 hour | Day 33 | Day 33 |

**Total Estimated Effort**: 20-28 hours over 6 weeks

---

## Success Metrics

### Before (Baseline)
- [ ] Count `.frontmatter` references: `grep -r "\.frontmatter\." app/ | wc -l`
- [ ] Count components without Props interfaces: `grep -c "export function.*{$" app/components/**/*.tsx`
- [ ] Count ambiguous boolean props: `grep -c "loading:\|disabled:\|visible:" app/components/**/*.tsx`

### After (Goals)
- ✅ Zero `.frontmatter` references
- ✅ 100% of components have Props interfaces
- ✅ Zero ambiguous boolean props
- ✅ Automated enforcement via ESLint + pre-commit
- ✅ Documentation updated and complete

### Measurement Script
```bash
#!/bin/bash
# scripts/measure-naming-compliance.sh

echo "📊 Naming Compliance Report"
echo "=============================="

frontmatter_count=$(grep -r "\.frontmatter\." app/ 2>/dev/null | wc -l)
echo "❌ .frontmatter references: $frontmatter_count (goal: 0)"

missing_props=$(grep -r "export function.*{$" app/components/ --include="*.tsx" 2>/dev/null | grep -v "Props" | wc -l)
echo "❌ Components without Props: $missing_props (goal: 0)"

ambiguous_bools=$(grep -r "loading:\|disabled:\|visible:" app/components/ --include="*.tsx" 2>/dev/null | wc -l)
echo "❌ Ambiguous booleans: $ambiguous_bools (goal: 0)"

echo ""
if [ $frontmatter_count -eq 0 ] && [ $missing_props -eq 0 ] && [ $ambiguous_bools -eq 0 ]; then
  echo "✅ All naming conventions met!"
else
  echo "⚠️  Naming improvements needed"
fi
```

---

## Risk Mitigation

### Backup Strategy
```bash
# Before Phase 1
git checkout -b naming-improvements-phase1
git commit -m "Backup before naming refactor"

# After each phase
git commit -m "Phase X complete"
git push origin naming-improvements-phaseX
```

### Testing Strategy
1. **Run full test suite** after each phase
2. **Visual regression testing** for UI components
3. **Manual QA** of high-traffic pages
4. **Gradual rollout** via feature flags if needed

### Rollback Plan
```bash
# If issues arise
git revert <commit-hash>

# Or full rollback
git reset --hard <backup-commit>
```

---

## Next Steps

1. **Review this plan** with team
2. **Get approval** for Phase 1
3. **Schedule Phase 1** work (Week 1-2)
4. **Execute** with daily commits
5. **Measure** improvement after each phase
6. **Iterate** based on feedback

---

*Document Owner*: Development Team  
*Last Updated*: December 26, 2025  
*Status*: 📋 Approved for Implementation

