# Deprecated JSON-LD Validators

**Deprecated:** November 29, 2025  
**Reason:** Functionality absorbed by `validate-seo-infrastructure.js`

---

## 📋 Archived Scripts

### validate-jsonld-syntax.js
**Purpose:** Basic JSON-LD syntax validation  
**Status:** ❌ DEPRECATED  
**Replacement:** `npm run validate:seo-infrastructure`

**Why deprecated:**
- Limited scope (syntax only, no semantic validation)
- No opportunity detection
- Duplicates functionality in SEO Infrastructure validator
- Less comprehensive error reporting

### validate-jsonld-rendering.js
**Purpose:** Tests rendered schemas per page  
**Status:** ❌ DEPRECATED  
**Replacement:** `npm run validate:seo-infrastructure`

**Why deprecated:**
- Overlaps with SEO Infrastructure validator
- No proactive opportunity detection
- Less comprehensive schema validation
- Superseded by schema richness validator

---

## 🔄 Migration Guide

### Old Workflow (Deprecated)
```bash
# ❌ Don't use these anymore
npm run validate:jsonld:syntax
npm run validate:jsonld:rendering
```

### New Workflow (Recommended)
```bash
# ✅ Use the master SEO Infrastructure validator
npm run validate:seo-infrastructure

# Or use the alias
npm run validate:seo

# For specialized schema content intelligence
npm run validate:seo:richness
```

---

## ✨ What You Get With the New System

### validate-seo-infrastructure.js (Master Validator)
✅ **6 comprehensive categories:**
1. Metadata validation (title, description, OG tags)
2. JSON-LD syntax validation (what jsonld-syntax did)
3. JSON-LD rendering validation (what jsonld-rendering did)
4. Schema completeness checks
5. Image optimization validation
6. **Proactive opportunity detection** (NEW)

✅ **Better error reporting:**
- Clear categorization
- Actionable fix suggestions
- Severity levels (critical/warning/opportunity)

✅ **Proactive opportunities:**
- Detects missing Product schemas
- Suggests VideoObject for video content
- Identifies breadcrumb opportunities
- Recommends FAQ schema additions

✅ **Comprehensive coverage:**
- Tests all page types (homepage, materials, settings, services)
- Validates schema richness
- Checks URL consistency
- Verifies image metadata

---

## 🔧 npm Script Configuration

### Current (After Consolidation)
```json
{
  "validate:seo": "npm run validate:seo-infrastructure",
  "validate:seo-infrastructure": "node scripts/validation/seo/validate-seo-infrastructure.js",
  "validate:jsonld:syntax": "echo '⚠️  DEPRECATED: Use validate:seo-infrastructure' && exit 1",
  "validate:jsonld:rendering": "echo '⚠️  DEPRECATED: Use validate:seo-infrastructure' && exit 1"
}
```

### What Happens If You Run Deprecated Scripts
```bash
$ npm run validate:jsonld:syntax
⚠️  DEPRECATED: Use validate:seo-infrastructure instead
# Exits with error code 1 (prevents accidental usage)
```

---

## 📊 Comparison: Old vs New

| Feature | Old (jsonld-syntax + jsonld-rendering) | New (seo-infrastructure) |
|---------|---------------------------------------|-------------------------|
| Syntax validation | ✅ Yes | ✅ Yes |
| Rendering validation | ✅ Yes | ✅ Yes |
| Metadata validation | ❌ No | ✅ Yes |
| Opportunity detection | ❌ No | ✅ Yes |
| Image optimization | ❌ No | ✅ Yes |
| Schema completeness | ❌ No | ✅ Yes |
| Actionable errors | ⚠️ Basic | ✅ Detailed |
| Proactive suggestions | ❌ No | ✅ Yes |
| Coverage | ⚠️ Partial | ✅ Comprehensive |

---

## 🚫 Why Not Just Delete These Files?

We're keeping them in an archive for:
1. **Historical reference** - Understanding previous validation approach
2. **Rollback capability** - Emergency fallback if needed
3. **Learning resource** - Shows evolution of validation system
4. **Migration support** - Helps understand what functionality moved where

---

## 📚 Related Documentation

- **Master Plan:** `/VALIDATION_CONSOLIDATION_PLAN.md`
- **Phase 1 Complete:** `/VALIDATION_CONSOLIDATION_PHASE1_COMPLETE.md`
- **Quick Reference:** `/VALIDATION_QUICK_REF.md`
- **SEO Infrastructure:** `docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md`

---

## ⚠️ Backward Compatibility

If your CI/CD pipeline or scripts reference the old validators:

### Update CI/CD
```yaml
# ❌ Old
- npm run validate:jsonld:syntax
- npm run validate:jsonld:rendering

# ✅ New
- npm run validate:seo-infrastructure
```

### Update Scripts
```bash
# ❌ Old
if ! npm run validate:jsonld:syntax; then
  echo "Syntax validation failed"
fi

# ✅ New
if ! npm run validate:seo-infrastructure; then
  echo "SEO validation failed"
fi
```

---

## 📅 Timeline

- **November 15, 2025:** SEO Infrastructure validator created
- **November 29, 2025:** Scripts deprecated and archived
- **December 2025:** Monitor for any issues
- **January 2026:** Consider removing archived files if no rollback needed

---

## 🆘 Need Help?

If you encounter issues with the new system:

1. **Check the documentation:** `VALIDATION_QUICK_REF.md`
2. **View comprehensive plan:** `VALIDATION_CONSOLIDATION_PLAN.md`
3. **Run with verbose output:** `VERBOSE=1 npm run validate:seo-infrastructure`
4. **Compare outputs:** Run old validator from archive, compare with new
5. **Report issues:** Document differences between old and new behavior

---

**Status:** ✅ Migration Complete  
**Files Archived:** 2 validators (jsonld-syntax, jsonld-rendering)  
**Replacement:** validate-seo-infrastructure.js (master validator)  
**Benefits:** Reduced redundancy, comprehensive coverage, proactive opportunities
