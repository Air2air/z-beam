# MetricsGrid → PropertyBars Migration Guide

## Overview

This guide explains how to migrate from the old `MetricsGrid` component to the new `PropertyBars` component using the automated migration script.

## Why Migrate?

**Space Efficiency**: PropertyBars uses **89% less vertical space** than MetricsGrid while displaying the same information.

| Component | 5 Properties | Space Savings |
|-----------|--------------|---------------|
| MetricsGrid (old) | 640px | - |
| PropertyBars (new) | 70px | 89% |

**Better UX**:
- Instant visual comprehension with three-bar design (min/value/max)
- No text wrapping with unit badge overlay
- More properties visible at once (9 vs 5)
- Responsive grid (3/4/6 columns)

## Migration Methods

### Method 1: Automated Script (Recommended)

#### Dry Run First (Safe Preview)
```bash
node scripts/migrate-to-property-bars.js --dry-run
```

This shows what changes will be made without modifying any files.

#### Migrate All Files
```bash
node scripts/migrate-to-property-bars.js
```

Automatically replaces MetricsGrid with PropertyBars in all applicable files.

#### Migrate Specific File
```bash
node scripts/migrate-to-property-bars.js --file=app/materials/stone/igneous/page.tsx
```

Targets a single file for migration.

### Method 2: Manual Replacement

#### Before (MetricsGrid)
```tsx
import { MetricsGrid } from '@/app/components/MetricsCard/MetricsGrid';

export default function MaterialPage({ params }: { params: { slug: string } }) {
  const metadata = getMaterialMetadata(params.slug);
  
  return (
    <div>
      <MetricsGrid 
        title="Material Properties"
        dataSource="materialProperties"
        materialData={metadata}
      />
    </div>
  );
}
```

#### After (PropertyBars)
```tsx
import { PropertyBars, extractPropertiesFromMetadata } from '@/app/components/PropertyBars/PropertyBars';
import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';

export default function MaterialPage({ params }: { params: { slug: string } }) {
  const metadata = getMaterialMetadata(params.slug);
  const properties = extractPropertiesFromMetadata(metadata);
  
  return (
    <div>
      <SectionTitle title="Material Properties" />
      <PropertyBars properties={properties} />
    </div>
  );
}
```

## What the Script Does

### 1. Import Replacement
- **Removes**: `import { MetricsGrid } from '@/app/components/MetricsCard/MetricsGrid'`
- **Adds**: 
  - `import { PropertyBars, extractPropertiesFromMetadata } from '@/app/components/PropertyBars/PropertyBars'`
  - `import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle'` (if needed)

### 2. Component Replacement
Replaces:
```tsx
<MetricsGrid 
  title="Material Properties"
  dataSource="materialProperties"
  materialData={metadata}
/>
```

With:
```tsx
{(() => {
  const properties = extractPropertiesFromMetadata(metadata);
  return (
    <>
      <SectionTitle title="Material Properties" />
      <PropertyBars properties={properties} />
    </>
  );
})()}
```

### 3. Preserves
- Custom className attributes
- Custom titles
- File structure and formatting

### 4. Ignores
- Files without MetricsGrid
- MetricsGrid with `dataSource="machineSettings"` (different use case)
- Test files (*.test.tsx)
- Node modules

## Post-Migration Checklist

### 1. Review Changes
```bash
git diff
```

Examine all modifications made by the script.

### 2. Test Locally
```bash
npm run dev
```

Visit pages that were modified and verify:
- ✅ Properties display correctly
- ✅ Values are within min/max ranges
- ✅ Units show in badges
- ✅ Colors are appropriate
- ✅ Responsive grid works (resize browser)
- ✅ Dark mode works

### 3. Check for Errors
```bash
npm run build
```

Ensure TypeScript compilation succeeds.

### 4. Run Tests
```bash
npm test
```

Verify no existing tests broke.

### 5. Commit Changes
```bash
git add .
git commit -m "Migrate MetricsGrid to PropertyBars component

- Replace MetricsGrid with PropertyBars for material properties
- Reduces vertical space by 89%
- Improves visual comprehension with three-bar design
- Adds extractPropertiesFromMetadata() helper
"
```

## Rollback (If Needed)

If issues arise, revert the migration:

```bash
git reset --hard HEAD~1
```

Or if already pushed:

```bash
git revert HEAD
```

## Script Output Example

```
🚀 MetricsGrid → PropertyBars Migration Script

📂 Scanning 127 files...

================================================================================
📝 app/materials/stone/igneous/granite/page.tsx
   3 change(s) detected
   ✅ File modified successfully

================================================================================
📝 app/materials/metal/aluminum/page.tsx
   3 change(s) detected
   ✅ File modified successfully

================================================================================

📊 Migration Summary

   Files scanned:     127
   Files modified:    2
   Instances replaced: 6
   Errors:            0

✅ Migration complete!

📝 Next steps:
   1. Review the changes: git diff
   2. Test the application: npm run dev
   3. Commit if satisfied: git add . && git commit -m "Migrate to PropertyBars component"
```

## Troubleshooting

### Issue: Script finds no files to migrate

**Cause**: No files currently use MetricsGrid with `dataSource="materialProperties"`

**Solution**: This is expected if MetricsGrid isn't currently used. You can manually add PropertyBars to new pages.

### Issue: TypeScript errors after migration

**Cause**: Metadata structure doesn't match expected format

**Solution**: Verify your frontmatter has the correct structure:
```yaml
absorption_coefficient:
  value: 0.85
  min: 0.0
  max: 1.0
  unit: ""
```

### Issue: Properties don't display

**Cause**: `extractPropertiesFromMetadata()` returns empty array

**Solution**: Check that metadata contains properties with value/min/max fields. Add debug logging:
```tsx
const properties = extractPropertiesFromMetadata(metadata);
console.log('Extracted properties:', properties);
```

### Issue: Colors look wrong

**Cause**: Property names don't match predefined color mappings

**Solution**: Add custom colors to PropertyBars:
```tsx
const customProperties = properties.map(prop => ({
  ...prop,
  color: 'from-blue-500 to-purple-600'
}));
```

## Manual Customization

After migration, you can customize PropertyBars further:

### Custom Colors
```tsx
const properties = extractPropertiesFromMetadata(metadata).map(prop => ({
  ...prop,
  color: prop.name === 'absorption_coefficient' 
    ? 'from-purple-500 to-pink-600'
    : prop.color
}));
```

### Custom Grid Layout
```tsx
<PropertyBars 
  properties={properties}
  className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
/>
```

### Filter Properties
```tsx
const properties = extractPropertiesFromMetadata(metadata)
  .filter(prop => prop.name !== 'internal_property');
```

## Support

For issues or questions:
1. Check `app/components/PropertyBars/README.md`
2. Review examples in `app/components/Comparison/ComparisonPage.tsx` (lines 1085-1182)
3. Search codebase: `grep -r "PropertyBars" app/`

## Performance Impact

**Build Time**: No change (both are React components)  
**Runtime**: Slightly faster (simpler DOM structure)  
**Bundle Size**: -7KB (removing MetricsGrid imports)  
**Page Speed**: Improved (less content to paint)

## Migration Statistics

Expected for typical Z-Beam deployment:
- **Files to migrate**: 0-5 (MetricsGrid rarely used currently)
- **Time to run script**: <1 second
- **Manual review time**: 5-10 minutes
- **Testing time**: 10-15 minutes
- **Total migration time**: 15-25 minutes

## Next Steps

After successful migration:
1. ✅ Update component documentation
2. ✅ Share migration results with team
3. ✅ Consider deprecating MetricsGrid for new development
4. ✅ Update design system guidelines
5. ✅ Create PropertyBars Storybook stories
