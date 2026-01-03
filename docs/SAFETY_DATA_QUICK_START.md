# Safety Data Normalization - Quick Start Guide

**For**: Developers ready to implement the normalization  
**Status**: ✅ COMPLETE - Migration executed January 2, 2026  
**Files**: 132/132 migrated (98 contaminants, 34 compounds)

---

## 🎯 What We're Doing

**Before** (Current - Inconsistent):
```yaml
# Contaminants - nested 3 levels deep ❌
relationships:
  operational:
    laser_properties:
      items:
        - safety_data:
            fire_explosion_risk: {...}

# Compounds - string fields ❌
relationships:
  safety:
    ppe_requirements: "Long string of text..."
```

**After** (Target - Consistent):
```yaml
# ALL content types - same location ✅
relationships:
  safety:
    fire_explosion_risk:
      presentation: card
      items:
        - severity: moderate
          description: "Clear description"
          mitigation: "Specific measures"
    
    ppe_requirements:
      presentation: descriptive
      items:
        - respiratory: "NIOSH N95"
          eye_protection: "Safety goggles"
          skin_protection: "Nitrile gloves"
```

---

## 📚 Documentation (Read First)

**Primary**: [SAFETY_DATA_NORMALIZATION_E2E.md](./SAFETY_DATA_NORMALIZATION_E2E.md)  
**Types**: [types/safetyData.ts](../types/safetyData.ts)  
**Summary**: [SAFETY_DATA_NORMALIZATION_SUMMARY.md](./SAFETY_DATA_NORMALIZATION_SUMMARY.md)  
**Table Structures**: [SAFETY_TABLE_NORMALIZATION.md](./SAFETY_TABLE_NORMALIZATION.md) 🔥 **NEW**

---

## 🚀 Implementation Steps

### Step 1: Test Migration Script (Dry Run)

```bash
# See what would change WITHOUT modifying files
python3 scripts/migrate_safety_data.py --type contaminants --dry-run
```

**Expected output**:
```
🔍 [DRY RUN] Would migrate cadmium-plating-contamination.yaml
   Fields: ['fire_explosion_risk', 'toxic_gas_risk', 'ppe_requirements', ...]

✅ Success: 80
❌ Errors: 0
```

### Step 2: Backup Everything

```bash
# Create backup (happens automatically with --backup flag)
python3 scripts/migrate_safety_data.py --type contaminants --backup
```

**Backup location**: `frontmatter/backup_before_safety_normalization/contaminants/`

### Step 3: Migrate Contaminants

```bash
# Run actual migration
python3 scripts/migrate_safety_data.py --type contaminants --backup

# Confirm when prompted
# Continue? (y/N): y
```

### Step 4: Validate Results

Script validates automatically, but also spot-check manually:

```bash
# Open a few files
code frontmatter/contaminants/cadmium-plating-contamination.yaml
```

**Check for**:
- ✅ `relationships.safety.*` location
- ✅ `presentation: card` or `descriptive`
- ✅ `items: [...]` arrays

### Step 5: Test on Localhost

```bash
# Start dev server
npm run dev

# Visit affected pages
open http://localhost:3000/contaminants/metallic-coating/plating/cadmium-plating-contamination
```

**Verify**:
- ✅ SafetyDataPanel appears
- ✅ All risk cards render
- ✅ All info cards render
- ✅ No console errors

### Step 6: Repeat for Compounds

```bash
python3 scripts/migrate_safety_data.py --type compounds --backup
```

### Step 7: Deploy

```bash
# Deploy to staging
npm run build
# Deploy to production (after testing)
```

---

## 🔍 What Changed in Code

### SafetyDataPanel Component

**Added**:
```typescript
import type { NormalizedSafetyData } from '@/types/safetyData';

function extractSafetyItem<T>(field: any): T | undefined {
  // Handles both normalized and legacy formats
  if (field.items && Array.isArray(field.items)) {
    return field.items[0];
  }
  return field;
}
```

**Usage**:
```typescript
// Now works with both formats
const fireRisk = extractSafetyItem(safetyData.fire_explosion_risk);
const ppeData = extractSafetyItem(safetyData.ppe_requirements);
```

### Layouts (ContaminantsLayout, CompoundsLayout)

**Updated**:
```typescript
// Check normalized location FIRST
let safetyData = relationships.safety;

// Fallback to legacy locations (during migration)
if (!safetyData) {
  const laserPropertiesSection = getRelationshipSection(
    relationships, 
    'operational.laser_properties'
  );
  safetyData = laserPropertiesSection?.items?.[0]?.safety_data;
}
```

---

## ⚠️ Troubleshooting

### Migration Script Errors

**Error**: "No safety_data found"
```bash
# Check if file has safety data at any location
grep -A 20 "safety" frontmatter/contaminants/[file].yaml
```

**Fix**: File may not have safety data (legitimate), or it's at unexpected location (add to script)

### Component Not Rendering

**Problem**: SafetyDataPanel still not appearing
```bash
# Check browser console for errors
# Check that migration actually ran (look for presentation: card in YAML)
```

**Fix**: Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

### TypeScript Errors

**Error**: "Type 'X' is not assignable to type 'NormalizedSafetyData'"
```typescript
// Import the type
import type { NormalizedSafetyData } from '@/types/safetyData';

// Use | any for backward compatibility during migration
safetyData: NormalizedSafetyData | any
```

---

## 📊 Progress Tracking

### Week 1 Checklist
- [ ] Dry run contaminants migration
- [ ] Backup contaminants
- [ ] Migrate contaminants
- [ ] Validate automated tests
- [ ] Spot-check 10 files manually
- [ ] Test 10 contaminant pages on localhost
- [ ] Document any issues

### Week 2 Checklist
- [ ] Dry run compounds migration
- [ ] Backup compounds
- [ ] Migrate compounds
- [ ] Validate automated tests
- [ ] Spot-check 10 files manually
- [ ] Test 10 compound pages on localhost
- [ ] Document any issues

### Week 3 Checklist
- [ ] Run full test suite
- [ ] Visual regression tests
- [ ] Performance tests
- [ ] Fix any issues found

### Week 4 Checklist
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor for issues

---

## 🆘 Help

**Script issues**: Check inline comments in `scripts/migrate_safety_data.py`

**Type issues**: Check examples in `types/safetyData.ts`

**Component issues**: Check inline comments in `app/components/SafetyDataPanel/SafetyDataPanel.tsx`

**Data structure questions**: See full YAML examples in `docs/SAFETY_DATA_NORMALIZATION_E2E.md`

**Rollback needed**: Restore from `frontmatter/backup_before_safety_normalization/`

---

## ✅ Success Criteria

**You're done when**:
- ✅ All contaminants migrated (80 files)
- ✅ All compounds migrated (45 files)
- ✅ All tests passing
- ✅ SafetyDataPanel renders on all pages
- ✅ Zero TypeScript errors
- ✅ Zero console errors
- ✅ Deployed to production

**Timeline**: 4 weeks from start to finish

**Next action**: Run dry-run test → `python3 scripts/migrate_safety_data.py --type contaminants --dry-run`
