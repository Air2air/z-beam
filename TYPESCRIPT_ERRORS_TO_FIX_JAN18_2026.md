# TypeScript Errors to Fix - Priority List
**Status**: Discovered by new verification script  
**Date**: January 18, 2026  
**Total Errors**: 27
**Blocker**: Yes - Prevents deployment until fixed

## 📊 Error Summary by Category

| Category | Count | Files | Severity |
|----------|-------|-------|----------|
| BaseSection props mismatch | 7 | Multiple | Critical |
| bgColor type mismatch | 10+ | ResearchPage.tsx, SafetyWarning, safety/page.tsx | Critical |
| Type definition exports | 2 | types/frontmatter-relationships.ts, types/index.ts | Critical |
| Missing modules | 2 | SafetyWarning.tsx, SectionContainer_Deprecated | High |
| **TOTAL** | **27** | **~8 files** | **CRITICAL** |

---

## 🔴 CRITICAL - Group 1: BaseSection Props (7 errors)

### Issue: Properties not defined on BaseSectionProps
**Type Definition**: `types/centralized.ts` (BaseSectionProps interface)
**Root Cause**: Props used in components don't match type definition

### Affected Files & Locations:

#### 1. `app/components/BaseSection/BaseSection.tsx` (Line 61)
```typescript
// ERROR: Property 'radius' does not exist on type 'BaseSectionProps'
```
**Fix Options**:
- [ ] Add `radius?: boolean` to BaseSectionProps in types/centralized.ts
- [ ] Remove `radius` prop usage in component
**Used By**: BaseSection examples, Micro, RegulatoryStandards

#### 2. `app/components/BaseSection/examples.tsx` (Line 152)
```typescript
// ERROR: Type mismatch - 'radius: boolean' not in BaseSectionProps
```
**Status**: Example component - update when type is fixed

#### 3. `app/components/Layout/Layout.tsx` (Line 152)
```typescript
// ERROR: Property 'actionText' does not exist on type 'BaseSectionProps'
```
**Fix Options**:
- [ ] Add `actionText?: string` to BaseSectionProps
- [ ] Add `actionUrl?: string` to BaseSectionProps
- [ ] Or refactor to use different prop structure

#### 4-7. Similar errors in:
- `app/components/Micro/Micro.tsx` (radius prop)
- `app/components/RegulatoryStandards/RegulatoryStandards.tsx` (radius prop)
- Additional component files

### Recommended Fix:
1. Review `types/centralized.ts` - find BaseSectionProps definition
2. Determine which properties to add:
   - `radius?: boolean`
   - `actionText?: string`
   - `actionUrl?: string`
3. Add missing properties to interface
4. Verify usage in all affected components

---

## 🔴 CRITICAL - Group 2: bgColor Type Mismatch (10+ errors)

### Issue: Invalid bgColor values used in components
**Type Definition**: `types/centralized.ts` (bgColor type)
**Current Valid Values**: `"default" | "dark" | "card" | "minimal" | "gradient" | undefined`
**Invalid Values Used**:
- `"gray-50"` (5+ instances)
- `"gray-100"` (5+ instances)  
- `"transparent"` (5+ instances)
- `"body"` (2+ instances)

### Affected Files:

#### 1. `app/components/Research/ResearchPage.tsx` (Multiple lines)
- Line 98: `bgColor: "gray-50"` ❌
- Line 153: `bgColor: "gray-50"` ❌
- Line 272: `bgColor: "gray-100"` ❌
- Line 354: `bgColor: "gray-50"` ❌
- Line 466: `bgColor: "gray-100"` ❌
- Line 518: `bgColor: "gray-50"` ❌
- Line 576: `bgColor: "transparent"` ❌
- Line 603: `bgColor: "gray-100"` ❌
- Line 647: `bgColor: "gray-50"` ❌
**Count**: 9 instances in this file alone

#### 2. `app/components/Dataset/MaterialBrowser.tsx` (Line 108)
```typescript
// ERROR: bgColor="transparent" - not valid type
```
**Count**: 1 instance

#### 3. `app/components/HeatBuildup/HeatBuildup.tsx` (Line 223)
```typescript
// ERROR: bgColor="transparent" - not valid type
```
**Count**: 1 instance

#### 4. `app/safety/page.tsx` (Multiple lines)
- Line 96: `bgColor="transparent"` ❌
- Line 126: `bgColor="body"` ❌
- Line 182: `bgColor="transparent"` ❌
- Line 247: `bgColor="body"` ❌
- Line 289: `bgColor="transparent"` ❌
- Line 336: `bgColor="body"` ❌
**Count**: 6 instances

#### 5. `app/components/SafetyWarning.tsx` (Likely has these issues)
**Count**: TBD

### Fix Options:

**Option A**: Expand type definition to include new colors
```typescript
// In types/centralized.ts
bgColor?: "default" | "dark" | "card" | "minimal" | "gradient" | 
         "gray-50" | "gray-100" | "transparent" | "body" | undefined
```
**Pros**: Supports all current usage
**Cons**: May need to update component styling

**Option B**: Replace invalid values with valid ones
- `"gray-50"` → `"default"` or `"card"`
- `"gray-100"` → `"dark"` or `"card"`
- `"transparent"` → Use CSS class instead?
- `"body"` → `"minimal"` or `"default"`

**Recommended**: Option A (add to type) if colors are intentional, Option B if they're outdated

---

## 🟡 HIGH - Group 3: Type Definition Exports (2 errors)

### Issue: MachineSettings type export mismatch
**Files**: 
- `types/frontmatter-relationships.ts` (Line 386)
- `types/index.ts` (Line 81)

**Error Message**:
```
ERROR TS2552: Cannot find name 'MachineSettings'. Did you mean 'MachineSetting'?
ERROR TS2724: '"./frontmatter-relationships" has no exported member named 'MachineSettings'
```

### Analysis:
- `MachineSetting` (singular) is defined and exported
- But code imports `MachineSettings` (plural)
- Possible typo or namespace mismatch

### Fix:
1. Check `types/frontmatter-relationships.ts` line 386
2. Determine correct name:
   - [ ] Rename export from `MachineSetting` → `MachineSettings`
   - [ ] Or update imports from `MachineSettings` → `MachineSetting`
3. Update `types/index.ts` export accordingly
4. Search codebase for `MachineSettings` imports and fix all

---

## 🟡 HIGH - Group 4: Missing Module (2 errors)

### Issue: Cannot find module references

#### 1. Missing `DOMSanitizer` module
**File**: `app/components/SafetyWarning.tsx` (Line 8)
```typescript
// ERROR TS2307: Cannot find module '@/app/utils/DOMSanitizer'
```

**Fix Options**:
- [ ] Create `app/utils/DOMSanitizer.ts`
- [ ] Or update import path to correct location
- [ ] Or use different sanitization library

#### 2. Missing Button/BaseSection imports
**File**: `app/components/legacy/SectionContainer_Deprecated/SectionContainer.tsx`
```typescript
// Lines 2-3: Cannot find '../Button' or '../BaseSection'
```

**Note**: This is a deprecated component - consider if it's still needed
**Options**:
- [ ] Update import paths if using new structure
- [ ] Or remove deprecated component entirely

---

## 🟢 MEDIUM - Group 5: Deprecated/Legacy Issues

### Deprecated SectionContainer References
**Files**: `app/components/legacy/SectionContainer_Deprecated/`
**Status**: These are marked as deprecated
**Action**: 
- [ ] Verify if still in use
- [ ] If not used: Remove deprecated folder
- [ ] If used: Fix import paths and migrate to BaseSection

---

## 📋 Fix Priority & Sequence

### Recommended Order:

1. **FIRST**: BaseSection Props (7 errors)
   - These block other components
   - Clear from type definition what's needed
   - Estimated time: 30 minutes
   - Files to edit: types/centralized.ts, ~7 component files

2. **SECOND**: bgColor Type Mismatch (10+ errors)
   - High impact across codebase
   - Either expand type or replace values
   - Estimated time: 45 minutes
   - Files to edit: types/centralized.ts, ResearchPage.tsx, safety/page.tsx, etc.

3. **THIRD**: Type Definition Exports (2 errors)
   - Quick fix once root cause identified
   - Estimated time: 15 minutes
   - Files to edit: types/frontmatter-relationships.ts, types/index.ts

4. **FOURTH**: Missing Modules (2 errors)
   - Depends on what DOMSanitizer should do
   - May require new file creation
   - Estimated time: 20-45 minutes

5. **FIFTH**: Deprecated Components (if applicable)
   - Lowest priority
   - May be able to skip if not used
   - Estimated time: 15-30 minutes (or 0 if removed)

**Total Estimated Time**: 2-3 hours for all fixes

---

## ✅ Verification After Fixes

After fixing each group, run:
```bash
# Option 1: Run type check
npm run type-check

# Option 2: Run full verification
./scripts/deployment/verify-pre-deployment.sh

# Option 3: Run build
npm run build
```

All should show **0 errors**.

---

## 📊 Progress Tracking

- [ ] Group 1: BaseSection Props (7 errors) - 0% complete
- [ ] Group 2: bgColor Mismatch (10+ errors) - 0% complete
- [ ] Group 3: Type Exports (2 errors) - 0% complete
- [ ] Group 4: Missing Modules (2 errors) - 0% complete
- [ ] Group 5: Deprecated Components - 0% complete
- [ ] **TOTAL**: 27 errors - 0% resolved

**Target Completion**: Before next deployment

---

## 🚀 Next Action

1. Review this list for any errors
2. Choose first group to fix
3. Update type definitions
4. Fix component usage
5. Run verification script
6. Repeat for next group

**All hands on deck!** These TypeScript errors are blocking deployment and must be resolved.
