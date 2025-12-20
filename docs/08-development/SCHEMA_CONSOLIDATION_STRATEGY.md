# Schema Consolidation Strategy - December 19, 2025

## ⚠️ CRITICAL FINDING: Not Simple Duplicates

After reading the actual implementations, I discovered these are **NOT simple duplicates** but **different implementations with different purposes**.

---

## Analysis by Function

### 1. generateOrganizationSchema()

**Canonical (generators/common.ts):**
- Simple implementation
- Takes options: context, name, description
- Basic organization info only
- ~20 lines

**business-config.ts:**
- **MUCH MORE DETAILED** (~100 lines)
- Includes: logo dimensions, social media, address, contact points, services catalog, area served, opening hours, NAICS code, founding date
- Uses BUSINESS_CONFIG constant
- This is the **PRODUCTION VERSION** with full SEO data

**Recommendation:** 
- ❌ DO NOT consolidate - these serve different purposes
- ✅ KEEP business-config.ts as the detailed production version
- ✅ generators/common.ts is for simple/generic cases
- **Alternative:** Enhance generators/common.ts to match business-config.ts detail level

---

### 2. generateWebPageSchema()

**Canonical (generators/common.ts):**
```typescript
- Takes: context, title, description, publishDate, modifiedDate
- Returns: WebPage with dates, isPartOf WebSite
```

**registry.ts:**
```typescript
- Takes: slug, title, description, pageType
- Returns: WebPage with primaryImageOfPage, about Organization
- Different structure (uses slug instead of full URL)
```

**collectionPageSchema.ts:**
```typescript
- Takes: url, name, description, datePublished, dateModified, breadcrumbId, authorId
- Returns: WebPage with optional breadcrumb/author references
- More flexible with optional fields
```

**Recommendation:**
- ⚠️ CAREFUL - different parameter structures
- ✅ Consolidate registry.ts → use generators/common.ts (after updating callers)
- ⚠️ collectionPageSchema.ts has unique breadcrumb/author linking - may need to keep

---

### 3. generateBreadcrumbSchema()

**Canonical (generators/common.ts):**
```typescript
- Takes: context, items array
- Returns: BreadcrumbList with items
```

**registry.ts:**
```typescript
- Takes: slug string
- Parses slug into breadcrumbs automatically
- Returns: BreadcrumbList
```

**Recommendation:**
- ⚠️ DIFFERENT FUNCTIONALITY
- registry.ts has **automatic parsing** - more convenient
- generators/common.ts requires pre-parsed items
- ✅ Keep both - different use cases OR enhance canonical to support both

---

### 4. generateFAQSchema()

**Canonical (generators/common.ts):**
```typescript
- Takes: context, name, items
- Returns: FAQPage with name
- Null check for empty items
```

**registry.ts:**
```typescript
- Takes: faqs array only
- Returns: FAQPage without name
- Simpler signature
```

**Recommendation:**
- ✅ CONSOLIDATE - registry.ts can easily use generators/common.ts
- Need to update callers to provide context + name

---

### 5. generateDatasetSchema()

**datasetSchema.ts:**
- Has **VALIDATION LOGIC** - only generates if data is complete
- Extensive parameters (20+ options)
- Returns null if validation fails
- Production-critical for SEO quality

**generators/dataset.ts:**
- Need to read this file to compare

**Recommendation:**
- ⏸️ Need to read generators/dataset.ts first before deciding

---

## Revised Consolidation Plan

### Phase 2A: Safe Consolidations (Low Risk)

**Target:** generateFAQSchema() in registry.ts
- **Action:** Update registry.ts to import from generators/common.ts
- **Risk:** LOW - simple structure change
- **Lines Saved:** ~15 lines
- **Testing:** Check FAQ pages render correctly

### Phase 2B: Medium Risk Consolidations

**Target:** generateWebPageSchema() in registry.ts
- **Action:** Update callers to use generators/common.ts signature
- **Risk:** MEDIUM - need to update multiple call sites
- **Lines Saved:** ~25 lines
- **Testing:** Check all pages with WebPage schema

### Phase 2C: Complex Consolidations (Requires Refactoring)

**Target:** generateBreadcrumbSchema() in registry.ts
- **Option 1:** Enhance generators/common.ts to support slug parsing
- **Option 2:** Keep both versions (parsing vs explicit items)
- **Risk:** MEDIUM-HIGH
- **Lines Saved:** ~20 lines

### Phase 2D: DO NOT CONSOLIDATE

**Keep Separate:**
1. **business-config.ts → generateOrganizationSchema()**
   - This is the PRODUCTION version with full SEO data
   - Much more detailed than canonical
   - Used for main site schema

2. **collectionPageSchema.ts → generateWebPageSchema()**
   - Has unique breadcrumb/author linking
   - May need to keep for flexibility

3. **datasetSchema.ts → generateDatasetSchema()**
   - Has validation logic
   - Production-critical quality gate
   - Should not be simplified

---

## Updated Impact Estimate

**Original Estimate:** 500-600 lines saved

**Revised Estimate:** 60-100 lines saved (after analysis)

**Why Lower:**
- Many "duplicates" are actually different implementations
- business-config.ts Organization schema is the GOOD version (keep it)
- datasetSchema.ts has critical validation logic
- Some consolidations require refactoring callers (not just removing code)

---

## Recommended Next Steps

### Option 1: Proceed with Safe Consolidations Only
- Consolidate generateFAQSchema() in registry.ts
- Test thoroughly
- Document decision to keep others separate
- **Estimated savings:** 15-20 lines
- **Risk:** LOW

### Option 2: Medium Consolidations
- Include generateWebPageSchema() from registry.ts
- Requires updating multiple call sites
- **Estimated savings:** 40-60 lines
- **Risk:** MEDIUM

### Option 3: Skip Schema Consolidation
- Move to Phase 3 (ContentPage factory)
- Potential savings there: 200-300 lines
- Lower risk, higher impact
- **Recommended:** Focus efforts where most value

---

## Conclusion

After careful analysis, **schema "duplicates" are mostly intentional variations** with different purposes:
- business-config.ts has the DETAILED production Organization schema (should be canonical)
- registry.ts has convenience functions (auto-parsing breadcrumbs)
- datasetSchema.ts has critical validation logic

**Recommendation:** Skip schema consolidation and focus on ContentPage factory (Phase 3) which has:
- Higher impact (200-300 lines vs 60-100 lines)
- Lower risk (no SEO implications)
- Clearer duplication patterns

---

**Status:** Analysis complete, awaiting decision on next steps

**Last Updated:** December 19, 2025
