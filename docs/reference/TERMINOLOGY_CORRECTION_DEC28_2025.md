# Terminology Correction - December 28, 2025

## 🚨 CRITICAL UPDATE: Reversal of Dec 26 Phase 1 Work

**Status**: `.metadata` wrapper is now **DEPRECATED** - Use `.frontmatter` instead

**Date**: December 28, 2025  
**Impact**: Reverses December 26, 2025 Phase 1 implementation  
**Breaking Change**: YES (for documentation/tests, not runtime)

---

## What Changed

### Previous Standard (Dec 26, 2025 - INCORRECT)
- ✅ Use `article.metadata` 
- ❌ Don't use `article.frontmatter`
- Documentation: PHASE1_COMPLETE_DEC26_2025.md, NAMING_IMPROVEMENTS_PLAN.md

### New Standard (Dec 28, 2025 - CORRECT)
- ✅ Use `article.frontmatter` ← **CORRECT**
- ❌ Don't use `article.metadata` wrapper ← **DEPRECATED**
- Implementation: helpers.ts updated, console warnings added

---

## Why the Reversal?

The December 26 implementation went in the **wrong direction**:

1. **Frontmatter is the YAML standard** - Industry standard term for YAML front matter
2. **Metadata is too generic** - Conflicts with HTML meta tags, SEO metadata, etc.
3. **Frontmatter is more descriptive** - Clearly indicates YAML header content
4. **Better alignment** - Matches YAML processor, schema validator terminology

**Decision**: Keep `frontmatter` as canonical term, deprecate `metadata` wrapper.

---

## Implementation Details

### Code Changes (Dec 28, 2025)

**File**: `app/utils/schemas/helpers.ts`

**Priority Order** (NEW):
```typescript
export function getMetadata(data: any): Record<string, unknown> {
  // 1. Settings objects (flat structure)
  if (data.machineSettings && !data.frontmatter && !data.metadata) {
    return data as Record<string, unknown>;
  }
  
  // 2. STANDARD: frontmatter wrapper (canonical)
  if (data.frontmatter && typeof data.frontmatter === 'object') {
    return data.frontmatter as Record<string, unknown>;
  }
  
  // 3. Legacy: pageConfig (backward compatibility)
  if (data.pageConfig && typeof data.pageConfig === 'object') {
    return data.pageConfig as Record<string, unknown>;
  }
  
  // 4. DEPRECATED: metadata wrapper (logs warning)
  if (data.metadata && typeof data.metadata === 'object') {
    console.warn('[DEPRECATED] Using data.metadata wrapper. Use data.frontmatter or direct data access instead.');
    return data.metadata as Record<string, unknown>;
  }
  
  // 5. Fallback: direct data
  return data as Record<string, unknown>;
}
```

**Key Changes**:
- ✅ `data.frontmatter` checked **before** `data.metadata`
- ✅ Console warning added for deprecated `data.metadata` usage
- ✅ JSDoc updated: "metadata wrapper is DEPRECATED"
- ✅ File header updated: "frontmatter is canonical"

### Test Changes

**File**: `tests/naming/semantic-naming.test.ts`

**Before** (WRONG):
```typescript
test('helpers should check metadata before frontmatter', () => {
  const metadataIndex = content.indexOf('data.metadata');
  const frontmatterIndex = content.indexOf('data.frontmatter');
  expect(metadataIndex).toBeLessThan(frontmatterIndex);
});
```

**After** (CORRECT):
```typescript
test('helpers should support frontmatter and deprecate metadata wrapper', () => {
  const frontmatterIndex = content.indexOf('data.frontmatter');
  const metadataIndex = content.indexOf('data.metadata');
  expect(frontmatterIndex).toBeLessThan(metadataIndex); // frontmatter before metadata
});
```

### Copilot Instructions

**File**: `.github/copilot-instructions.md`

**Before** (WRONG):
```markdown
- ❌ **NO .frontmatter references** (use .metadata instead)
- ✅ **ALWAYS use article.metadata**
```

**After** (CORRECT):
```markdown
- ❌ **NO .metadata wrapper** (use .frontmatter instead) 🔥 **MANDATORY (Dec 28, 2025)**
- ✅ **ALWAYS use article.frontmatter** (never article.metadata wrapper) 🔥 **MANDATORY (Dec 28, 2025)**
```

---

## Correct Usage Patterns

### ✅ CORRECT - Use frontmatter wrapper
```typescript
// Component props
const title = article.frontmatter.title;
const description = article.frontmatter.description;

// Type definitions
interface Article {
  frontmatter: ArticleMetadata;
  // ...
}

// Helper usage (handles both, prefers frontmatter)
const meta = getMetadata(article); // Returns frontmatter if available
```

### ❌ DEPRECATED - metadata wrapper
```typescript
// This will log deprecation warning
const title = article.metadata.title;

// Don't create new code using metadata wrapper
interface Article {
  metadata: ArticleMetadata; // WRONG - use frontmatter
}
```

### ✅ CORRECT - Direct access (when no wrapper needed)
```typescript
// Settings objects (no wrapper)
const setting = settings.machineSettings.power;

// Direct data access
const value = data.someField;
```

---

## Migration Guide

### For Existing Code

**No immediate changes required** - Runtime still works!

The `getMetadata()` helper function supports both wrappers, so existing code continues to work. However:

1. **Console warnings** will appear for `data.metadata` usage
2. **New code** should use `data.frontmatter` 
3. **Tests** have been updated to enforce correct pattern
4. **Documentation** updated to reflect frontmatter as standard

### For New Code

**Always use `article.frontmatter`**:

```typescript
// ✅ CORRECT
const title = article.frontmatter.title;

// ✅ CORRECT - using helper (handles multiple formats)
const meta = getMetadata(article);
const title = meta.title;

// ❌ DEPRECATED - will log warning
const title = article.metadata.title;
```

### For Type Definitions

```typescript
// ✅ CORRECT
interface Article {
  frontmatter: ArticleMetadata;
}

interface MaterialData {
  frontmatter: {
    title: string;
    description: string;
  };
}

// ❌ DEPRECATED
interface Article {
  metadata: ArticleMetadata; // Use frontmatter instead
}
```

---

## Runtime Behavior

### Deprecation Warning

When `data.metadata` wrapper is used:

```
[DEPRECATED] Using data.metadata wrapper. Use data.frontmatter or direct data access instead.
```

**This warning appears in**:
- Development console
- Server logs
- Test output (when applicable)

**Purpose**: Alert developers to update code to use `frontmatter`

### Backward Compatibility

✅ **Existing code still works** - No breaking changes at runtime  
✅ **getMetadata() handles both** - Graceful fallback  
⚠️ **Console warnings** - Encourages migration  
🔄 **Gradual migration** - Can be done incrementally

---

## Documentation Updates Required

The following documents reference the OLD (incorrect) standard and need updates:

### High Priority
1. ✅ `.github/copilot-instructions.md` - **UPDATED**
2. ✅ `tests/naming/semantic-naming.test.ts` - **UPDATED**
3. ⏳ `docs/reference/PHASE1_COMPLETE_DEC26_2025.md` - **Add reversal note**
4. ⏳ `docs/reference/NAMING_IMPROVEMENTS_PLAN.md` - **Reverse recommendations**
5. ⏳ `docs/reference/BACKEND_METADATA_SPEC.md` - **Update terminology note**

### Medium Priority
6. ⏳ `docs/04-reference/IMPLEMENTATION_STANDARDS.md` - Update examples
7. ⏳ `docs/04-reference/datasets.md` - Update code examples
8. ⏳ `seo/docs/reference/SEO_IMPLEMENTATION_SUMMARY.md` - Update helper examples

### Low Priority
- Various archived documents (retain for historical context with correction note)

---

## Testing

### Verification Tests

Run semantic naming tests to verify correct pattern:

```bash
npm test -- tests/naming/semantic-naming.test.ts
```

**Expected result**: Tests pass (now enforces `.frontmatter` over `.metadata`)

### Console Warning Test

Create test data with metadata wrapper:

```typescript
const testData = {
  metadata: { title: 'Test' }
};

const meta = getMetadata(testData);
// Should log: [DEPRECATED] Using data.metadata wrapper...
```

### Runtime Verification

Check console for deprecation warnings during development:

```bash
npm run dev
# Navigate to pages using metadata wrapper
# Check browser console for warnings
```

---

## Impact Assessment

### Code Impact: **LOW**
- ✅ helpers.ts updated (priority order + warning)
- ✅ Backward compatibility maintained
- ✅ Existing code continues to work
- ⚠️ Console warnings guide migration

### Test Impact: **MEDIUM**
- ✅ semantic-naming test updated
- ✅ Test now enforces correct pattern
- ✅ No test failures expected

### Documentation Impact: **HIGH**
- ⚠️ ~20 documents reference old standard
- ⚠️ Dec 26 Phase 1 docs now incorrect
- ⚠️ Code examples need updates
- ✅ This document provides migration path

### Developer Impact: **LOW**
- ✅ Copilot instructions updated
- ✅ Console warnings provide guidance
- ✅ Gradual migration possible
- ✅ No urgent changes required

---

## Timeline

**Completed** (Dec 28, 2025):
- ✅ helpers.ts priority order corrected
- ✅ Console deprecation warning added
- ✅ semantic-naming test updated
- ✅ Copilot instructions corrected
- ✅ This documentation created

**In Progress**:
- 🔄 Documentation updates (high priority)
- 🔄 Code example corrections

**Future Work**:
- ⏳ Complete documentation sweep
- ⏳ Archive Dec 26 Phase 1 docs with correction notes
- ⏳ Consider removing metadata wrapper support (breaking change, requires major version)

---

## FAQ

### Q: Do I need to update my code immediately?
**A**: No. Existing code continues to work. Console warnings will guide you to update over time.

### Q: What if I see deprecation warnings in console?
**A**: Update the code to use `.frontmatter` instead of `.metadata`. Use this document as a guide.

### Q: Will metadata wrapper be removed entirely?
**A**: Not in current version. It will remain with deprecation warnings for backward compatibility. Future major version may remove it.

### Q: What about Dec 26 Phase 1 documentation?
**A**: Those documents describe work that went in the wrong direction. They remain for historical context with correction notes added.

### Q: Should I use getMetadata() helper or direct access?
**A**: For components accessing various data shapes (materials, contaminants, settings), use `getMetadata()`. For new code with known structure, use `.frontmatter` directly.

### Q: What if I find .metadata in existing code?
**A**: If it works, leave it (backward compatible). For new code or refactoring, switch to `.frontmatter`.

---

## Summary

**Standard**: Use `article.frontmatter` (NOT `article.metadata`)  
**Status**: `metadata` wrapper is DEPRECATED  
**Breaking**: No runtime breaks, documentation/test updates only  
**Migration**: Gradual, guided by console warnings  
**Impact**: Low code impact, high documentation impact  
**Timeline**: Completed foundation (Dec 28), documentation updates in progress

**Key Takeaway**: Frontmatter is the correct, canonical term. The Dec 26 work was reversed. Use `.frontmatter` for all new code.

---

**Document Status**: ✅ COMPLETE  
**Last Updated**: December 28, 2025  
**Related Documents**:
- `app/utils/schemas/helpers.ts` - Implementation
- `.github/copilot-instructions.md` - Developer guidance
- `tests/naming/semantic-naming.test.ts` - Enforcement
- `docs/reference/PHASE1_COMPLETE_DEC26_2025.md` - Original (now reversed) work
