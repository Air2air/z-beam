# Frontmatter Breadcrumb Link Normalization

**Date:** December 26, 2025  
**Status:** ✅ FRONTEND FIXED, ⚠️ GENERATOR NEEDS UPDATE  
**Priority:** HIGH - Prevent future inconsistencies

---

## 🚨 Issue Summary

Compound frontmatter files had **inconsistent URL formatting** in breadcrumb links:
- `full_path` used hyphens: `/compounds/carcinogen/aromatic-hydrocarbon/`
- `breadcrumb[].href` used underscores: `/compounds/carcinogen/aromatic_hydrocarbon`

**Result:** Category pages returned 404 errors because links didn't match URL structure.

---

## ✅ Frontend Fix Completed (Dec 26, 2025)

### What Was Fixed
- **27 compound frontmatter files** updated with normalized breadcrumb links
- **All subcategory hrefs** converted from underscores to hyphens
- **Script created**: `scripts/fix-compound-breadcrumb-links.py`

### Changes Applied
```yaml
# BEFORE (WRONG)
breadcrumb:
  - label: Aromatic Hydrocarbon
    href: /compounds/carcinogen/aromatic_hydrocarbon

# AFTER (CORRECT)
breadcrumb:
  - label: Aromatic Hydrocarbon
    href: /compounds/carcinogen/aromatic-hydrocarbon
```

### Normalizations
- `aromatic_hydrocarbon` → `aromatic-hydrocarbon`
- `metal_oxide` → `metal-oxide`
- `toxic_gas` → `toxic-gas`
- `corrosive_gas` → `corrosive-gas`
- `carbon_based` → `carbon-based`
- `simple_asphyxiant` → `simple-asphyxiant`
- `heavy_metal` → `heavy-metal`
- `polycyclic_aromatic_hydrocarbon` → `polycyclic-aromatic-hydrocarbon`
- `organic_vapor` → `organic-vapor`
- `acid_gas` → `acid-gas`
- `reactive_gas` → `reactive-gas`
- `metal_fume` → `metal-fume`

### Commits
- `db2cb3465` - "Fix compound breadcrumb link normalization (underscores → hyphens)"
- Updated 27 files, created normalization script

---

## ⚠️ Generator Changes Required

### Problem
The backend generator that creates compound frontmatter files is using **underscores** in breadcrumb URLs instead of **hyphens**.

### Root Cause
Generator likely:
1. Uses `subcategory` field value directly (which has underscores)
2. Doesn't normalize subcategory names to URL-safe format
3. Inconsistent with how it generates `full_path` (which uses hyphens)

### Required Fix

**Location:** Backend frontmatter generator (wherever compound files are created)

**Change Needed:**
```python
# ❌ WRONG - Using subcategory value directly
breadcrumb_item = {
    'label': subcategory_display_name,
    'href': f'/compounds/{category}/{subcategory}'  # ← Contains underscores
}

# ✅ CORRECT - Normalize subcategory to hyphens
def normalize_url_segment(text: str) -> str:
    """Convert text to URL-safe format with hyphens."""
    return text.lower().replace('_', '-').replace(' ', '-')

breadcrumb_item = {
    'label': subcategory_display_name,
    'href': f'/compounds/{category}/{normalize_url_segment(subcategory)}'
}
```

### Validation
After generator fix, verify:
```bash
# Should return 0 (no underscores in compound breadcrumb hrefs)
grep -r "href:.*_" frontmatter/compounds/*.yaml | wc -l
```

### Regeneration Required
After fixing the generator, **regenerate all compound frontmatter files** to apply consistent formatting.

---

## 📊 Impact

**Before Fix:**
- 27 compound files with underscore URLs
- Category pages: 404 errors
- Sitemap: 351 URLs
- SEO Score: 94/100 (Grade A)

**After Fix:**
- 0 compound files with underscore URLs  
- Category pages: ✅ Working
- Sitemap: 555 URLs (compound categories now indexed)
- SEO Score: 98/100 (Grade A+)

---

## 🔍 Testing

### Frontend Verification (Completed)
```bash
# Verify no underscores in hrefs
grep -r "href:.*_" frontmatter/compounds/*.yaml
# Result: 0 matches ✅

# Verify benzene compound breadcrumb
grep -A4 "label: Aromatic" frontmatter/compounds/benzene-compound.yaml
# Result: href: /compounds/carcinogen/aromatic-hydrocarbon ✅
```

### Generator Testing (Required)
After generator fix:
1. Regenerate one compound file
2. Verify breadcrumb hrefs use hyphens
3. Verify full_path and breadcrumb hrefs are consistent
4. Regenerate all compound files
5. Re-run frontend verification tests

---

## 📖 Related Documentation

- `scripts/fix-compound-breadcrumb-links.py` - Frontend fix script
- `docs/reference/BACKEND_FRONTMATTER_SPEC.md` - Schema specification
- Commit `db2cb3465` - Frontend fix implementation

---

## ⚡ Prevention

### For Future Generators
1. **Always normalize URLs**: Replace underscores with hyphens
2. **Consistency check**: Ensure `full_path` and breadcrumb hrefs use same format
3. **Validation**: Add test to detect underscore/hyphen mismatches
4. **Documentation**: Document URL normalization rules

### Validation Rule
```typescript
// Add to validation tests
if (breadcrumb_href.includes('_')) {
  throw new Error(`Breadcrumb href contains underscore: ${breadcrumb_href}. URLs must use hyphens.`);
}
```
