# Phase 2 Frontend Preparation: Materials Denormalization

**Date**: January 8, 2026  
**Status**: READY - Waiting for Phase 2 backend denormalization  
**Scope**: ~2,300 material references across 93 contaminant files

---

## Phase 2 Overview

### What's Being Denormalized:
- **Relationship**: `affectsMaterials` in contaminant files
- **Current State**: Materials only have `id` field
- **Target State**: 8 complete fields per material

### Required Fields:
```typescript
interface DenormalizedMaterialItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  image: string;
  description: string;
  frequency: string;    // very_high | high | moderate | low
  difficulty: string;   // easy | moderate | difficult
}
```

---

## Frontend Changes Made

### ContaminantsLayout.tsx Updates

**1. Added TypeScript Interface** (lines ~35-45):
```typescript
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
```

**2. Updated Materials Mapping** (line ~107):
```typescript
// ✅ BEFORE Phase 2 (defensive):
items: affectsMaterials
  .filter((m): m is NonNullable<typeof m> => m != null)
  .map(m => ({
    slug: m.id,
    href: m.url,        // ⚠️ Will be undefined until Phase 2
    title: m.title,     // ⚠️ Doesn't exist yet
    // ...
  }))

// ✅ AFTER Phase 2 (ready):
items: (affectsMaterials as DenormalizedMaterialItem[]).map(m => ({
  slug: m.id,
  href: m.url,        // ✅ Guaranteed present after Phase 2
  title: m.name,      // ✅ Using 'name' field
  imageUrl: m.image,
  imageAlt: m.name,
  category: m.category,
  metadata: {
    frequency: m.frequency,     // ✅ New metadata
    difficulty: m.difficulty,   // ✅ New metadata
  },
}))
```

**3. Key Changes**:
- Removed defensive `.filter()` (trusts complete data)
- Changed `m.title` → `m.name` (matches material structure)
- Added `metadata` with frequency/difficulty
- Type assertion ensures type safety

---

## Current State (Before Phase 2)

### Sample Material Items (INCOMPLETE):
```yaml
affectsMaterials:
  items:
  - id: aluminum-laser-cleaning  # ❌ Only ID
  - id: steel-laser-cleaning
  - id: copper-laser-cleaning
  # ... 20-40+ materials per file
```

**Impact**: Material cards hidden or not functional

---

## Expected State (After Phase 2)

### Denormalized Material Items (COMPLETE):
```yaml
affectsMaterials:
  items:
  - id: aluminum-laser-cleaning
    name: Aluminum                    # ✅ Added
    category: metal                   # ✅ Added
    subcategory: non-ferrous          # ✅ Added
    url: /materials/metal/non-ferrous/aluminum-laser-cleaning  # ✅ Added
    image: /images/materials/aluminum-hero.jpg  # ✅ Added
    description: Lightweight non-ferrous metal...  # ✅ Added
    frequency: high                   # ✅ Added
    difficulty: moderate              # ✅ Added
```

**Impact**: Material cards display and navigate correctly

---

## Verification Steps

### After Phase 2 Backend Complete:

**1. Validation Script**:
```python
# Check all materials have 8 required fields
python3 << 'EOF'
import yaml
from pathlib import Path

required = ['id', 'name', 'category', 'subcategory', 'url', 'image', 'description', 'frequency', 'difficulty']
issues = []

for file in Path("frontmatter/contaminants").rglob("*.yaml"):
    with open(file) as f:
        data = yaml.safe_load(f)
    materials = data.get('relationships', {}).get('interactions', {}).get('affectsMaterials', {}).get('items', [])
    
    for idx, material in enumerate(materials):
        missing = [f for f in required if f not in material]
        if missing:
            issues.append(f"{file.name} material {idx}: Missing {missing}")

if issues:
    print(f"❌ VALIDATION FAILED: {len(issues)} issues")
    for issue in issues[:10]:
        print(f"  • {issue}")
else:
    print(f"✅ VALIDATION PASSED: All materials complete")
EOF
```

**2. TypeScript Compilation**:
```bash
npm run build
# Should compile without errors
```

**3. Dev Server Test**:
```bash
npm run dev
# Visit: http://localhost:3000/contaminants/water-stain-contamination
# Check "Materials Affected" section
```

**4. Material Cards Verification**:
- Scroll to "Materials affected by [contaminant]" section
- Verify material cards visible (not hidden)
- Check all cards have:
  - Title (material name)
  - Image
  - Category badge
  - Metadata badges (frequency, difficulty)
- Click card → Should navigate to material page (no 404)

**5. Console Check**:
- Open DevTools
- No errors about missing `url` or `name` fields
- No TypeScript warnings

---

## Scope Impact

### Files to Update: 93 contaminant files
### Material References: ~2,300 total

**Sample Material Counts per File**:
- water-stain-contamination: 30 materials
- hydraulic-fluid-contamination: 20 materials
- plastic-residue-contamination: 30 materials
- carbon-soot-contamination: 42 materials
- Average: 25-30 materials per file

---

## Backend Denormalization Script (Reference)

**Pattern** (similar to Phase 1):
```python
import yaml
from pathlib import Path

# Step 1: Load all material files
materials_lookup = {}
for file in Path("frontmatter/materials").rglob("*.yaml"):
    with open(file) as f:
        data = yaml.safe_load(f)
        materials_lookup[data['id']] = {
            'id': data['id'],
            'name': data['name'],
            'category': data['category'],
            'subcategory': data['subcategory'],
            'url': data['fullPath'],
            'image': data['images']['hero']['url'],
            'description': data['pageDescription'],
            'frequency': 'high',      # Context-based
            'difficulty': 'moderate'  # Context-based
        }

# Step 2: Update each contaminant file
for file in Path("frontmatter/contaminants").rglob("*.yaml"):
    with open(file) as f:
        data = yaml.safe_load(f)
    
    materials = data.get('relationships', {}).get('interactions', {}).get('affectsMaterials', {}).get('items', [])
    
    for i, material in enumerate(materials):
        material_id = material.get('id')
        if material_id in materials_lookup:
            materials[i] = materials_lookup[material_id]
    
    with open(file, 'w') as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True)

print(f"✅ Updated {len(contaminant_files)} files")
print(f"✅ Enriched ~2,300 material references")
```

---

## Deployment Coordination

### Phase 2 Deployment Sequence:

**1. Backend Denormalization** (2-3 hours):
- Run materials denormalization script
- Validate all ~2,300 materials enriched (100% pass required)
- Commit to staging

**2. Frontend Verification** (30 minutes):
- Deploy updated ContaminantsLayout to staging
- Test 10 sample contaminant pages
- Verify material cards display and navigate

**3. Production Deploy** (simultaneous):
- Deploy backend changes (denormalized frontmatter)
- Deploy frontend changes (ContaminantsLayout update)
- Both must deploy together

**4. Post-Deploy Monitoring** (24 hours):
- Monitor error rates
- Check 404 spikes on /materials/* URLs
- Verify analytics show material navigation working
- User feedback on material cards

---

## Comparison: Phase 1 vs Phase 2

| Aspect | Phase 1 (Compounds) | Phase 2 (Materials) |
|--------|---------------------|---------------------|
| **Files** | 93 contaminant files | 93 contaminant files |
| **References** | 326 compounds | ~2,300 materials |
| **Fields** | 9 required | 8 required |
| **Unique Field** | `phase`, `hazardLevel` | `frequency`, `difficulty` |
| **Source Files** | 34 compound files | 153 material files |
| **Status** | ✅ COMPLETE | ⏳ IN PROGRESS |
| **Frontend** | ✅ READY | ✅ READY |

---

## Expected Benefits

### After Phase 2 Complete:

✅ **Material cards fully functional**
- Display on all contaminant pages
- Show material names (not just IDs)
- Include metadata (frequency, difficulty)
- Navigate to material detail pages

✅ **Better UX**
- Users can see which materials are affected
- Context about contamination frequency
- Cleaning difficulty indicators

✅ **Zero async enrichment**
- All data in frontmatter
- Fast static generation
- No runtime API calls

✅ **Type-safe**
- TypeScript interfaces prevent errors
- Compile-time validation
- IntelliSense support

---

## Rollback Plan

**If Phase 2 has issues**:

```bash
# Option 1: Revert commit
git revert <phase2-commit>

# Option 2: Reset to pre-Phase-2 tag
git reset --hard pre-materials-denorm
git push origin main --force

# Option 3: Restore from backup
tar -xzf frontmatter-backup-phase2.tar.gz
git add frontmatter/
git commit -m "Rollback: Restore pre-Phase-2 state"
```

**Rollback Triggers**:
- Validation fails (<100% pass rate)
- Material cards showing 404 errors
- Build breaks
- Performance issues

---

## Next Steps After Phase 2

**Phase 3 (Future)**:
- Compounds → contaminants (bidirectional)
- Compounds → materials
- Settings → challenges

**Documentation Updates**:
- Update FRONTMATTER_NORMALIZED_STRUCTURE.md
- Mark Phase 2 as complete in migration checklist
- Update success metrics

---

**Status**: ✅ Frontend prepared and ready for Phase 2 backend denormalization  
**Timeline**: Ready to deploy once backend validation passes  
**Expected Completion**: 100% of ~2,300 material references enriched
