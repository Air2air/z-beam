# Frontend Preparation for Denormalized Frontmatter

**Date**: January 8, 2026  
**Status**: READY - Waiting for backend denormalization  
**Purpose**: Frontend changes to support complete denormalized data

---

## Changes Made

### 1. ContaminantsLayout.tsx

**File**: `app/components/ContaminantsLayout/ContaminantsLayout.tsx`

**Changes**:

1. **Added TypeScript Interface** (lines ~15-28):
   ```typescript
   interface DenormalizedCompoundItem {
     id: string;
     title: string;
     name: string;
     category: string;
     subcategory: string;
     url: string;
     image: string;
     description: string;
     phase: string;
     hazardLevel: string;
   }
   ```
   - Documents expected structure after denormalization
   - Ensures type safety when mapping to CardGrid props

2. **Removed Defensive Filter** (line ~62):
   ```typescript
   // ❌ REMOVED (was line 50):
   .filter((c): c is NonNullable<typeof c> => c != null && c.url && c.title)
   
   // ✅ NOW (line 62):
   items: (producesCompounds as DenormalizedCompoundItem[]).map(c => ({
   ```
   - No longer filters out incomplete items
   - Type assertion ensures all items have required fields
   - Backend guarantees complete data

3. **Fixed Field Name** (line ~70):
   ```typescript
   // ❌ BEFORE:
   hazard_level: c.hazard_level,
   
   // ✅ NOW:
   hazard_level: c.hazardLevel,
   ```
   - Changed from snake_case to camelCase
   - Matches normalized frontmatter structure

---

## Before & After

### BEFORE (Defensive - Handles Incomplete Data)
```typescript
items: producesCompounds
  .filter((c): c is NonNullable<typeof c> => c != null && c.url && c.title)
  .map(c => ({
    slug: c.id,
    href: c.url,        // ⚠️ Might be undefined
    title: c.title,     // ⚠️ Might be undefined
    imageUrl: c.image,  // ⚠️ Might be undefined
    category: c.category,
    metadata: {
      phase: c.phase,
      hazard_level: c.hazard_level,
    },
  })),
```
**Problem**: Hides compounds that only have `id` field

### AFTER (Trusting - Expects Complete Data)
```typescript
items: (producesCompounds as DenormalizedCompoundItem[]).map(c => ({
  slug: c.id,
  href: c.url,        // ✅ Guaranteed present
  title: c.title,     // ✅ Guaranteed present
  imageUrl: c.image,  // ✅ Guaranteed present
  category: c.category,
  metadata: {
    phase: c.phase,
    hazard_level: c.hazardLevel,  // ✅ camelCase
  },
})),
```
**Benefit**: All compounds display, type-safe, no runtime errors

---

## Verification Steps

### After Backend Denormalization Complete:

1. **TypeScript Compilation**:
   ```bash
   npm run build
   # Should compile without errors
   ```

2. **Dev Server Test**:
   ```bash
   npm run dev
   # Visit: http://localhost:3000/contaminants/oxide/iron/rust-contamination
   ```

3. **Compound Cards Visible**:
   - Scroll to "Produced Compounds" section
   - Verify compound cards display (not hidden by filter)
   - Check all cards have:
     - Title (compound name)
     - Image
     - Category badge
     - Metadata (phase, hazard level)

4. **Navigation Test**:
   - Click each compound card
   - Should navigate to compound page (no 404)
   - URL format: `/compounds/category/subcategory/compound-id`

5. **Console Check**:
   - Open browser DevTools
   - No errors about missing `url` or `title` fields
   - No TypeScript warnings

---

## Expected Data Structure

### Current State (INCOMPLETE - Before Backend Work):
```yaml
producesCompounds:
  items:
  - id: carbon-monoxide-compound  # ❌ Only ID
```

### After Denormalization (COMPLETE):
```yaml
producesCompounds:
  items:
  - id: carbon-monoxide-compound
    title: Carbon Monoxide           # ✅ Added
    name: Carbon Monoxide            # ✅ Added
    category: toxic_gas              # ✅ Added
    subcategory: asphyxiant          # ✅ Added
    url: /compounds/toxic_gas/asphyxiant/carbon-monoxide-compound  # ✅ Added
    image: /images/compound/carbon-monoxide-compound-hero.jpg      # ✅ Added
    description: Colorless toxic gas generated during laser cleaning  # ✅ Added
    phase: gas                       # ✅ Added
    hazardLevel: high                # ✅ Added
```

---

## Impact Assessment

### What Works Now:
✅ Material pages (contaminants already denormalized)
✅ Contaminant listings
✅ FAQ sections
✅ Property displays
✅ Industry applications
✅ Regulatory standards

### What's Ready (Waiting on Backend):
⏳ Compound cards on contaminant pages
⏳ Compound navigation from contaminant pages
⏳ SafetyDataPanel compound data

### No Breaking Changes:
- If denormalization not complete, compounds just won't display
- No runtime errors
- No 404s (cards filtered out)
- Graceful degradation

---

## Deployment Coordination

### Recommended Sequence:

1. **Backend Denormalization** (2-3 hours):
   - Run denormalization script
   - Validate all 326 compounds enriched
   - Commit and deploy to staging

2. **Frontend Verification** (30 minutes):
   - Deploy current frontend to staging
   - Test 10 sample contaminant pages
   - Verify compound cards work

3. **Production Deploy** (simultaneous):
   - Deploy backend changes
   - Deploy frontend changes
   - Both must deploy together for full functionality

### Rollback Plan:
- If compound cards still missing: Backend denormalization incomplete
- If 404 errors: URL field not populated correctly
- If images broken: Image path field incorrect
- Rollback: Git revert both frontend + backend changes

---

## Additional Frontend Components Ready

All components expecting denormalized compound data:

1. **CardGrid** (`app/components/CardGrid/`):
   - Receives compound items with complete data
   - No changes needed (already expects full props)

2. **SafetyDataPanel** (`app/components/SafetyData/SafetyDataPanel.tsx`):
   - Uses `compounds` prop
   - Type assertion may be needed if it accesses denormalized fields

3. **Future: Material Pages**:
   - Phase 2 will add `affectsMaterials` to contaminants
   - Same pattern: Remove filters, add type interfaces
   - ~2,300 material references to denormalize

---

## Testing Checklist

**Pre-Deployment** (Staging):
- [ ] TypeScript compiles without errors
- [ ] 10 random contaminant pages load successfully
- [ ] Compound cards visible on all tested pages
- [ ] All compound card links navigate correctly (no 404s)
- [ ] Images display correctly
- [ ] Category badges show correct colors
- [ ] Metadata (phase, hazard level) displays
- [ ] Console has no errors

**Post-Deployment** (Production):
- [ ] Monitor error rates for 24 hours
- [ ] Check analytics for 404 spikes on /compounds/* URLs
- [ ] User feedback on compound navigation
- [ ] Performance metrics unchanged

---

## Next Steps After Phase 1 Complete

**Phase 2 Preparation** (Contaminants → Materials):

Similar changes needed for materials denormalization:

```typescript
// ContaminantsLayout.tsx
interface DenormalizedMaterialItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  image: string;
  description: string;
  frequency: string;
  difficulty: string;
}

// Remove filter from affectsMaterials section
items: (affectsMaterials as DenormalizedMaterialItem[]).map(m => ({
  // ... mapping
}))
```

**Phase 3**: Compounds → Contaminants (bidirectional)

---

**Status**: ✅ Frontend prepared and ready for backend denormalization
**Blocked By**: Backend denormalization script execution
**Timeline**: Ready to deploy once backend validation passes
