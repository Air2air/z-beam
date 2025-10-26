# Deprecated Scripts

This directory contains scripts that have been replaced by TypeScript utilities in `/app/utils/normalizers/`.

## Migration Status

The following scripts are **deprecated** and should not be used for new development:

### Data Normalization Scripts (Migrated to TypeScript)

These scripts have been replaced by automatic normalization in `contentAPI.ts`:

1. **Category Normalization**
   - `../normalize-categories.js` → `/app/utils/normalizers/categoryNormalizer.ts`
   - `../fix-category-names.js` → `/app/utils/normalizers/categoryNormalizer.ts`
   - **Status**: Deprecated, kept for batch updates only

2. **Unicode Normalization**
   - `../fix-frontmatter-unicode.js` → `/app/utils/normalizers/unicodeNormalizer.ts`
   - **Status**: Deprecated, kept for batch updates only

3. **Regulatory Standards Normalization**
   - `../fix-unknown-regulatory-standards.js` → `/app/utils/regulatoryStandardsNormalizer.ts`
   - **Status**: Deprecated, kept for batch updates only

## Why Deprecated?

These scripts performed **one-time transformations** on data files. They have been replaced by **runtime normalizers** that:

- ✅ Run automatically when data is loaded
- ✅ Are type-safe (TypeScript)
- ✅ Require zero manual intervention
- ✅ Apply consistently across all environments
- ✅ Are tested and maintained as part of the codebase

## When to Use These Scripts

**Only use these scripts for batch updates** when:

1. You need to permanently fix existing YAML files
2. You're doing a one-time data migration
3. You want to clean up legacy data

**Do NOT use these scripts** when:

- ❌ Adding new materials (normalization is automatic)
- ❌ Updating existing materials (normalization is automatic)
- ❌ Running as part of build process (not needed)

## Modern Approach

All data normalization now happens in `/app/utils/contentAPI.ts`:

```typescript
const loadFrontmatterDataInline = cache(async (slug: string) => {
  let data = yaml.load(fileContent) as any;
  
  // Automatic normalizations applied:
  data = normalizeAllTextFields(data);      // Unicode
  data = normalizeCategoryFields(data);     // Categories
  data.regulatoryStandards = normalizeRegulatoryStandards(...);
  
  return data;
});
```

## Future Plans

These scripts will be moved to this directory once:

1. ✅ TypeScript utilities are stable
2. ✅ All existing files have been batch-updated
3. ✅ Team confirms no further need

**Timeline**: Q1 2026

## Need Help?

See `/docs/architecture/SCRIPT_TO_UTILITY_MIGRATION.md` for complete migration guide.
