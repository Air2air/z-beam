# Frontmatter Migration Guide - Unified Relationships Schema

**Date**: December 18, 2025  
**Status**: Ready for Execution

---

## Quick Start

### 1. Run Migration Script

```bash
# Dry run first (see what changes without modifying)
python3 scripts/migrate-frontmatter-to-unified-schema.py --dry-run --all

# Migrate specific content type
python3 scripts/migrate-frontmatter-to-unified-schema.py --type materials
python3 scripts/migrate-frontmatter-to-unified-schema.py --type contaminants
python3 scripts/migrate-frontmatter-to-unified-schema.py --type compounds
python3 scripts/migrate-frontmatter-to-unified-schema.py --type settings

# Migrate all files (requires confirmation)
python3 scripts/migrate-frontmatter-to-unified-schema.py --all
```

### 2. Verify Migration

```bash
# Check a few files manually
cat frontmatter/materials/aluminum-laser-cleaning.yaml | head -50
cat frontmatter/compounds/acetaldehyde.yaml | head -100

# Verify relationships structure exists
grep -r "^relationships:" frontmatter/ | wc -l  # Should be 654
```

### 3. Test Site

```bash
# Clear Next.js cache
rm -rf .next

# Start dev server
npm run dev

# Visit pages:
# http://localhost:3000/materials/metal/non-ferrous/aluminum-laser-cleaning
# http://localhost:3000/contaminants/organic-residue/adhesive/adhesive-residue-tape-marks
# http://localhost:3000/compounds/irritant/aldehyde/acetaldehyde
```

---

## What the Migration Does

### Structural Changes

**Before (Old Structure)**:
```yaml
id: aluminum-laser-cleaning
name: Aluminum
description: |
  Lightweight metal...

# ❌ Scattered at top-level
materialProperties:
  physical:
    density: 2.7
regulatory_standards:
- name: FDA
  description: FDA 21 CFR 1040.10
related_materials:
- id: steel-laser-cleaning
  slug: steel  # ❌ Will be removed
  category: metal  # ❌ Will be removed
  url: /materials/steel  # ❌ Will be fixed to full ID
```

**After (New Structure)**:
```yaml
id: aluminum-laser-cleaning
name: Aluminum
description: |
  Lightweight metal...

# ✅ Everything under relationships
relationships:
  material_properties:
    physical:
      density: 2.7
  
  regulatory_standards:
  - id: fda-laser-product-performance
    title: FDA 21 CFR 1040.10 - Laser Product Performance Standards
    authority: FDA  # ✅ Renamed from 'name'
    url: https://...
  
  related_materials:
  - id: steel-laser-cleaning
    title: Steel
    url: /materials/steel-laser-cleaning  # ✅ Full ID
    frequency: common
```

### Field Changes

| Change Type | Old | New | Why |
|-------------|-----|-----|-----|
| **Remove** | `slug` field in relationships | (deleted) | Not needed, use `id` |
| **Remove** | `category` in relationships | (deleted) | Context-specific, not universal |
| **Remove** | `subcategory` in relationships | (deleted) | Context-specific, not universal |
| **Remove** | `longName` in standards | (deleted) | Redundant field |
| **Rename** | `name` → `authority` | In regulatory_standards | Clearer semantics |
| **Rename** | `description` → `title` | In regulatory_standards | Consistent naming |
| **Fix** | URLs shortened | Use full IDs | `/materials/aluminum` → `/materials/aluminum-laser-cleaning` |
| **Move** | Top-level technical data | Under `relationships` | Clear organization |

---

## Backup & Rollback

### Automatic Backups

Migration script creates backups automatically:

```bash
frontmatter_backup/
├── materials/
│   ├── aluminum-laser-cleaning.yaml  # Original before migration
│   └── ...
├── contaminants/
├── compounds/
└── settings/
```

### Manual Rollback

If something goes wrong:

```bash
# Restore from backup
rm -rf frontmatter/
cp -r frontmatter_backup/ frontmatter/

# Or restore specific type
rm -rf frontmatter/compounds/
cp -r frontmatter_backup/compounds/ frontmatter/compounds/
```

---

## Component Updates

### Updated Components

All components now read from `relationships`:

1. **MaterialsLayout.tsx** ✅
   - `relationships.material_properties` (or `materialProperties`)
   - `relationships.regulatory_standards`

2. **ContaminantsLayout.tsx** ✅
   - `relationships.laser_properties.safety_data`
   - `relationships.produces_compounds`
   - `relationships.related_materials`

3. **SettingsLayout.tsx** ✅
   - `relationships.machine_settings`
   - `relationships.material_properties`

4. **ItemPage.tsx** ✅
   - Reads `relationships.machine_settings` for Dataset schema

### TypeScript Types

New unified types added to `types/frontmatter-relationships.ts`:

```typescript
import { 
  FrontmatterData,           // Complete frontmatter structure
  FrontmatterRelationships,  // Relationships container
  RelationshipEntry,         // Unified entry for all arrays
  MaterialProperties,
  LaserProperties,
  PPERequirements,
  // ... etc
} from '@/types';
```

---

## Validation

### Automated Checks

The migration script validates:

- ✅ All top-level fields are page identity/content only
- ✅ All technical data moved to `relationships`
- ✅ `slug` fields removed from relationship entries
- ✅ URLs use full IDs
- ✅ Field names standardized

### Manual Verification

After migration, check:

```bash
# Verify no slugs in relationships
grep -r "slug:" frontmatter/materials/*.yaml | grep -v "^slug:" | wc -l
# Should be 0

# Verify relationships exists
grep -c "^relationships:" frontmatter/materials/*.yaml
# Should equal file count

# Verify URLs are full
grep -r "url: /materials/" frontmatter/ | grep -v "laser-cleaning" | wc -l
# Should be 0 (all URLs should have full IDs like aluminum-laser-cleaning)
```

---

## Troubleshooting

### Issue: Migration fails with YAML error

**Cause**: Malformed YAML in source file  
**Fix**: Check the error message for line number, fix YAML syntax

### Issue: Component shows "undefined" data

**Cause**: Component not updated or wrong field name  
**Fix**: 
1. Check component reads from `relationships`
2. Verify field name matches new structure
3. Clear Next.js cache: `rm -rf .next`

### Issue: URLs broken after migration

**Cause**: URL still uses shortened path  
**Fix**: Re-run migration, it fixes URLs automatically

### Issue: TypeScript errors after migration

**Cause**: Old types imported  
**Fix**: 
```typescript
// ❌ Old import
import { MaterialMetadata } from '@/types';

// ✅ New import
import { FrontmatterData, FrontmatterRelationships } from '@/types';
```

---

## Success Criteria

Migration is complete when:

- ✅ All 654 files have `relationships` key
- ✅ No technical data at top-level (except page fields)
- ✅ No `slug` fields in relationship entries
- ✅ All URLs use full IDs
- ✅ Site renders correctly (all pages work)
- ✅ TypeScript compiles without errors
- ✅ No console warnings about missing data

---

## Next Steps After Migration

1. **Test thoroughly** - Visit all content types
2. **Remove legacy types** - Clean up old TypeScript interfaces
3. **Update documentation** - Mark old patterns as deprecated
4. **Generate new content** - Use new structure for new frontmatter
5. **Monitor** - Watch for any issues in production

---

## Contact

If you encounter issues:
- Check FRONTMATTER_FORMATTING_SPECIFICATION.md for structure reference
- Check FRONTMATTER_EVALUATION_DEC18_2025.md for detailed analysis
- Review migration script logs for specific errors
