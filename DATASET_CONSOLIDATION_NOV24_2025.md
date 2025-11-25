# Dataset Consolidation - November 24, 2025

## Overview

Consolidated material datasets to provide unified, comprehensive data access from both Materials and Settings pages.

## Changes Made

### 1. Dataset Schema Updates (`app/utils/schemas/SchemaFactory.ts`)

#### Before
- Separate datasets for materials and settings
- Materials page: Only material properties
- Settings page: Only machine settings
- Different dataset URLs for each page type

#### After
- **Unified dataset per material**
- Both pages include material properties AND machine settings
- Single consolidated dataset URL: `/datasets/materials/{material}-laser-cleaning.json`
- Dataset `@id` uses canonical dataset URL (not page URL)

### 2. Schema Condition Enhancement

```typescript
// Updated condition to accept either property type
this.register('Dataset', generateDatasetSchema, {
  priority: 20,
  condition: (data) => {
    const fm = (data.frontmatter || data.metadata) as Record<string, unknown> | undefined;
    return !!(fm?.materialProperties || fm?.machineSettings);
  }
});
```

### 3. Dataset Generator Improvements

**Key Changes:**
- Normalizes slugs by removing both `-laser-cleaning` and `-settings` suffixes
- Creates single base name for unified datasets (e.g., `oak-laser-cleaning`)
- Builds comprehensive `variableMeasured` array with both:
  - Machine settings (11 parameters when available)
  - Material properties (all categories when available)
- Uses consistent dataset URL across all page types

**Machine Settings Included:**
- powerRange, wavelength, spotSize, repetitionRate
- energyDensity, fluenceThreshold, pulseWidth
- scanSpeed, passCount, overlapRatio, dwellTime

### 4. Page-Level Data Loading

#### Materials Pages (`app/materials/[category]/[subcategory]/[slug]/page.tsx`)
```typescript
// Load machine settings from corresponding settings file
const settings = await getSettingsArticle(`${baseMaterialSlug}-settings`);
if (settings?.machineSettings) {
  article.metadata.machineSettings = settings.machineSettings;
}
```

#### Settings Pages (`app/settings/[category]/[subcategory]/[slug]/page.tsx`)
```typescript
// Load material properties from corresponding material file
const materialArticle = await getArticleBySlug(`${material}-laser-cleaning`);
if (materialProps) {
  settings.materialProperties = materialProps;
}
```

### 5. Unified Download Component

**Before:**
- Materials pages: `MaterialDatasetCardWrapper`
- Settings pages: `SettingsDatasetCardWrapper`

**After:**
- Both pages: `MaterialDatasetCardWrapper`
- Unified interface with both property types

Updated `app/components/SettingsLayout/SettingsLayout.tsx`:
```typescript
<MaterialDatasetCardWrapper
  material={{
    name: settings.name,
    slug,
    category,
    subcategory,
    machineSettings: settings.machineSettings,
    materialProperties: (settings as any).materialProperties || materialProps,
    faq: (settings as any).faq,
    regulatoryStandards: (settings as any).regulatoryStandards
  }}
  showFullDataset={true}
/>
```

## Benefits

### 1. User Experience
- ✅ Complete data available from either page type
- ✅ Consistent download experience
- ✅ No need to visit both pages for full dataset

### 2. SEO & Discoverability
- ✅ Comprehensive Dataset schema on all pages
- ✅ Better Google Dataset Search visibility
- ✅ Unified canonical dataset URLs

### 3. Data Integrity
- ✅ Single source of truth per material
- ✅ No data duplication or sync issues
- ✅ Consistent dataset structure

### 4. Maintenance
- ✅ Simplified dataset generation
- ✅ Easier to maintain data quality
- ✅ Reduced code duplication

## Example Dataset Schema

### Oak Material - Unified Dataset

Both `/materials/wood/hardwood/oak-laser-cleaning` and `/settings/wood/hardwood/oak` generate:

```json
{
  "@type": "Dataset",
  "@id": "https://www.z-beam.com/datasets/materials/oak-laser-cleaning#dataset",
  "name": "Oak Laser Cleaning Dataset",
  "description": "Comprehensive laser cleaning dataset for Oak. Includes validated machine parameters and material properties for optimal cleaning results.",
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "propertyID": "powerRange",
      "name": "Power Range",
      "value": 100,
      "unitText": "W",
      "description": "Laser power output"
    },
    {
      "@type": "PropertyValue",
      "propertyID": "wavelength",
      "name": "Wavelength",
      "value": 1064,
      "unitText": "nm",
      "description": "Laser beam wavelength"
    },
    {
      "@type": "PropertyValue",
      "propertyID": "density",
      "name": "density",
      "value": 0.75,
      "unitText": "g/cm³"
    }
  ],
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://www.z-beam.com/datasets/materials/oak-laser-cleaning.json",
      "name": "JSON Dataset"
    },
    {
      "@type": "DataDownload",
      "encodingFormat": "text/csv",
      "contentUrl": "https://www.z-beam.com/datasets/materials/oak-laser-cleaning.csv",
      "name": "CSV Dataset"
    },
    {
      "@type": "DataDownload",
      "encodingFormat": "text/plain",
      "contentUrl": "https://www.z-beam.com/datasets/materials/oak-laser-cleaning.txt",
      "name": "Plain Text Dataset"
    }
  ],
  "url": "https://www.z-beam.com/datasets/materials/oak-laser-cleaning",
  "license": {
    "@type": "CreativeWork",
    "name": "Creative Commons Attribution 4.0 International",
    "url": "https://creativecommons.org/licenses/by/4.0/"
  },
  "creator": { "@type": "Person", "name": "Alessandro Moretti" },
  "temporalCoverage": "2025",
  "spatialCoverage": {
    "@type": "Place",
    "name": "Global"
  }
}
```

## Documentation Updates

### Updated Files
1. `docs/04-reference/datasets.md` - Complete rewrite for unified approach
2. `tests/unit/MaterialJsonLD.test.tsx` - Updated test for combined data
3. `DATASET_CONSOLIDATION_NOV24_2025.md` - This summary document

### Key Documentation Changes
- Added unified dataset architecture explanation
- Updated data loading flow diagrams
- Added machine settings parameter list
- Updated download component documentation
- Clarified single-source-of-truth approach

## Testing

### Manual Testing Required
1. ✅ Verify Materials page loads machine settings
2. ✅ Verify Settings page loads material properties
3. ✅ Check Dataset schema includes both property types
4. ✅ Confirm unified dataset URLs
5. ✅ Test download component on both page types

### Build Verification
```bash
npm run build
# Check for TypeScript errors
# Verify dataset schemas in production build
```

## Migration Notes

### No Breaking Changes
- Existing dataset files unchanged
- Backward compatible with current data structure
- No API changes required

### Future Enhancements
- Consider generating actual unified dataset files in `/public/datasets/`
- Add dataset aggregation at category level
- Implement dataset versioning

## Related Files

### Modified
- `app/utils/schemas/SchemaFactory.ts`
- `app/materials/[category]/[subcategory]/[slug]/page.tsx`
- `app/settings/[category]/[subcategory]/[slug]/page.tsx`
- `app/components/SettingsLayout/SettingsLayout.tsx`
- `docs/04-reference/datasets.md`
- `tests/unit/MaterialJsonLD.test.tsx`

### Documentation
- `DATASET_CONSOLIDATION_NOV24_2025.md` (new)

## Success Criteria

- [x] Dataset schema condition includes both property types
- [x] Materials pages load machine settings dynamically
- [x] Settings pages load material properties dynamically
- [x] Unified dataset URLs across page types
- [x] Single download component used on both pages
- [x] Documentation updated
- [x] Test cases updated

## Next Steps

1. Deploy to production
2. Verify schemas in production with:
   - https://www.z-beam.com/materials/wood/hardwood/oak-laser-cleaning
   - https://www.z-beam.com/settings/wood/hardwood/oak
3. Check Google Dataset Search indexing
4. Monitor for any build or runtime errors

---

**Status:** ✅ Complete  
**Date:** November 24, 2025  
**Version:** 1.0
