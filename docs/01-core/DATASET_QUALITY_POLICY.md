# Dataset Quality Policy

**Version**: 1.0  
**Effective Date**: November 29, 2025  
**Status**: ACTIVE  
**Enforcement**: Automated validation in build pipeline

---

## 🎯 Purpose

This policy ensures datasets are only displayed on the website, in JSON-LD schema, and in SEO enhancements when data quality meets minimum completeness standards. Incomplete datasets damage user trust, search engine credibility, and E-E-A-T signals.

---

## 📊 Dataset Quality Thresholds

### Tier 1: CRITICAL - Must Be Complete (100%)
These parameters are **REQUIRED** for dataset visibility:

1. **powerRange** (min/max values required)
2. **wavelength** (min/max values required)
3. **spotSize** (min/max values required)
4. **repetitionRate** (min/max values required)
5. **pulseWidth** (min/max values required)
6. **scanSpeed** (min/max values required)
7. **passCount** (min/max values required)
8. **overlapRatio** (min/max values required)

**Enforcement**: If ANY Tier 1 parameter is missing or lacks min/max values, the dataset MUST NOT be:
- Included in JSON-LD schema on material pages
- Listed in `/datasets` page
- Referenced in SEO enhancements
- Available for download (JSON/CSV/TXT files should not be generated)

### Tier 2: IMPORTANT - Should Be Complete (80% threshold)
Material properties that significantly enhance dataset value:

1. **Thermal properties**: meltingPoint, thermalConductivity, heatCapacity
2. **Optical properties**: absorptivity, reflectivity, emissivity
3. **Mechanical properties**: density, hardness, tensileStrength
4. **Chemical properties**: composition, oxidationResistance

**Warning**: If Tier 2 completeness < 80%, log warning during build but allow dataset visibility.

### Tier 3: OPTIONAL - Nice to Have
- Safety considerations
- Application notes
- Regulatory standards
- Vendor specifications

---

## 🔍 Validation Rules

### Rule 1: Parameter Completeness Check
```typescript
// Each required parameter must have ALL of:
{
  value: number,      // Actual measurement
  unit: string,       // Unit of measurement
  min: number,        // Minimum acceptable value
  max: number,        // Maximum acceptable value
  notes?: string      // Optional context
}
```

**Example VALID parameter**:
```yaml
powerRange:
  value: 50
  unit: W
  min: 20
  max: 100
  notes: "Industrial cleaning applications"
```

**Example INVALID parameter** (missing min/max):
```yaml
powerRange:
  value: 50
  unit: W
  # ❌ MISSING min and max - BLOCKS dataset visibility
```

### Rule 2: Zero Tolerance for Critical Parameters
If ANY of the 8 Tier 1 parameters are missing:
- ❌ Dataset JSON-LD schema NOT generated
- ❌ Dataset NOT listed in `/datasets` page
- ❌ Dataset files (JSON/CSV/TXT) NOT created
- ⚠️ Warning logged: "Dataset excluded: Missing required parameters: [list]"

### Rule 3: Graceful Degradation for Optional Data
- Missing Tier 2 properties: Log warning, continue with reduced dataset
- Missing Tier 3 properties: Silent skip, no warnings

---

## 🛠️ Implementation Points

### 0. **Data Architecture** (FUNCTIONAL REQUIREMENT - Nov 29, 2025)

**Frontmatter Structure**:
- **machineSettings** (Tier 1 - 8 required parameters): `/frontmatter/settings/[material]-settings.yaml`
- **materialProperties** (Tier 2 - material_characteristics with density, hardness, tensileStrength, youngsModulus, thermalConductivity, meltingPoint, thermalExpansion, absorptivity, reflectivity, emissivity): `/frontmatter/materials/[material]-laser-cleaning.yaml`
- **File Naming Convention**: Settings files append `-settings` to material slug

**Example: Aluminum**
- machineSettings: `/frontmatter/settings/aluminum-settings.yaml`
- materialProperties: `/frontmatter/materials/aluminum-laser-cleaning.yaml`

**Required Structure for machineSettings**:
```yaml
machineSettings:
  powerRange:
    unit: W
    value: 100  # Typical value
    min: 20     # ✅ REQUIRED for validation
    max: 200    # ✅ REQUIRED for validation
  wavelength:
    unit: nm
    value: 1064
    min: 532
    max: 1064
  # ... (8 total Tier 1 parameters)
```

**Current State** (Nov 29, 2025):
- ✅ machineSettings exist in settings frontmatter (159 materials)
- ❌ Most missing min/max values (validation fails)
- 📋 Data Entry Required: Add min/max to ~2,500 data points

### 1. Dataset Generation Script (`scripts/generate-datasets.ts`)

**Add validation before generation**:
```typescript
function validateDatasetCompleteness(materialSlug: string, machineSettings: any): {
  valid: boolean;
  missing: string[];
  tier2Completeness: number;
} {
  const REQUIRED_PARAMS = [
    'powerRange', 'wavelength', 'spotSize', 'repetitionRate',
    'pulseWidth', 'scanSpeed', 'passCount', 'overlapRatio'
  ];
  
  const missing: string[] = [];
  
  // Check each required parameter has min/max
  for (const param of REQUIRED_PARAMS) {
    const paramData = machineSettings?.[param];
    if (!paramData || 
        typeof paramData.min !== 'number' || 
        typeof paramData.max !== 'number') {
      missing.push(param);
    }
  }
  
  // Calculate Tier 2 completeness
  const tier2Completeness = calculateTier2Completeness(materialProperties);
  
  return {
    valid: missing.length === 0,
    missing,
    tier2Completeness
  };
}

// Only generate dataset if validation passes
const validation = validateDatasetCompleteness(slug, machineSettings);
if (!validation.valid) {
  console.warn(`⚠️  Skipping dataset for ${slug}: Missing ${validation.missing.join(', ')}`);
  return; // Skip this dataset
}

if (validation.tier2Completeness < 80) {
  console.warn(`⚠️  Dataset for ${slug} has low material property completeness: ${validation.tier2Completeness}%`);
}
```

### 2. JSON-LD Schema Generation (`app/utils/jsonld-helper.ts`)

**Conditional Dataset schema inclusion**:
```typescript
function generateDatasetSchema(data: any): any | null {
  // Validate dataset completeness before generating schema
  const validation = validateDatasetForSchema(data);
  
  if (!validation.valid) {
    console.warn(`Dataset schema excluded for ${data.materialName}: ${validation.reason}`);
    return null; // Don't include Dataset schema
  }
  
  return createDatasetSchema(data);
}

// In main schema generation, conditionally add Dataset:
const schemas = [
  createArticleSchema(data),
  createBreadcrumbSchema(data),
  // Only add Dataset if validation passes
  ...(hasCompleteDataset(data) ? [createDatasetSchema(data)] : [])
];
```

### 3. Datasets Page (`app/datasets/page.tsx`)

**Filter incomplete datasets from listing**:
```typescript
// Load all materials but filter by dataset completeness
const materialsWithCompleteDatasets = allMaterials.filter(material => {
  const validation = validateMaterialDataset(material);
  return validation.valid; // Only show materials with complete datasets
});

// Display count: "X of Y materials have complete datasets"
const totalMaterials = allMaterials.length;
const completeDatasets = materialsWithCompleteDatasets.length;
```

### 4. SEO Enhancements

**Exclude incomplete datasets from**:
- Sitemap entries (don't list dataset URLs)
- robots.txt (block crawling of incomplete dataset files)
- Internal linking (don't link to non-existent dataset downloads)

---

## 📈 Quality Metrics Dashboard

### Build-Time Report
```
┌─────────────────────────────────────────────────┐
│        DATASET QUALITY REPORT                   │
├─────────────────────────────────────────────────┤
│ Total Materials: 159                            │
│ Complete Datasets: 127 (79.9%)                  │
│ Incomplete Datasets: 32 (20.1%)                 │
│                                                 │
│ Missing Parameters:                             │
│   • powerRange: 0 materials                     │
│   • wavelength: 5 materials                     │
│   • spotSize: 12 materials                      │
│   • passCount: 32 materials ⚠️                  │
│                                                 │
│ Tier 2 Average Completeness: 85.3% ✅           │
└─────────────────────────────────────────────────┘
```

### Automated Warnings
```bash
# During build:
⚠️  Dataset excluded: aluminum-6061 (missing: passCount, overlapRatio)
⚠️  Dataset excluded: brass-c36000 (missing: passCount)
⚠️  Low Tier 2 completeness: copper-c11000 (73%)

✅  Generated 127 complete datasets
❌  Excluded 32 incomplete datasets
```

---

## 🔧 Testing Requirements

### Test 1: Validation Logic
```javascript
// tests/dataset-quality-policy.test.js
describe('Dataset Quality Policy', () => {
  test('should reject datasets missing Tier 1 parameters', () => {
    const incomplete = {
      powerRange: { value: 50, unit: 'W' }, // Missing min/max
      wavelength: { value: 1064, unit: 'nm', min: 1000, max: 1100 }
    };
    
    expect(validateDatasetCompleteness(incomplete).valid).toBe(false);
  });
  
  test('should accept datasets with all Tier 1 parameters complete', () => {
    const complete = {
      powerRange: { value: 50, unit: 'W', min: 20, max: 100 },
      wavelength: { value: 1064, unit: 'nm', min: 1000, max: 1100 },
      // ... all 8 parameters with min/max
    };
    
    expect(validateDatasetCompleteness(complete).valid).toBe(true);
  });
});
```

### Test 2: Schema Generation
```javascript
test('should NOT generate Dataset schema for incomplete data', () => {
  const jsonld = generateJsonLD(materialWithIncompleteDataset);
  const schemas = JSON.parse(jsonld);
  const hasDatasetSchema = schemas['@graph'].some(s => s['@type'] === 'Dataset');
  
  expect(hasDatasetSchema).toBe(false);
});
```

### Test 3: Datasets Page Filtering
```javascript
test('should only list materials with complete datasets', () => {
  const listedMaterials = getDatasetPageMaterials();
  
  listedMaterials.forEach(material => {
    const validation = validateMaterialDataset(material);
    expect(validation.valid).toBe(true);
  });
});
```

---

## 📋 Migration Plan

### Phase 1: Implement Validation (Week 1)
- [ ] Add `validateDatasetCompleteness()` function
- [ ] Update `scripts/generate-datasets.ts` to skip incomplete datasets
- [ ] Add build-time reporting

### Phase 2: Update Schema Generation (Week 1)
- [ ] Add conditional Dataset schema in `jsonld-helper.ts`
- [ ] Update material page generation to check completeness
- [ ] Add settings page validation

### Phase 3: Update Datasets Page (Week 2)
- [ ] Filter materials list by dataset completeness
- [ ] Add quality metrics display
- [ ] Add "incomplete datasets" section with improvement status

### Phase 4: Fix Data (Weeks 2-3)
- [ ] Add missing min/max values (2,528 total)
- [ ] Add missing passCount to 159 files
- [ ] Verify all Tier 1 parameters present

### Phase 5: Full Enforcement (Week 4)
- [ ] Enable strict validation in production
- [ ] Add pre-commit hook to validate new datasets
- [ ] Monitor quality metrics dashboard

---

## 🚨 Current Status (November 29, 2025)

**Known Issues**:
- ❌ 2,528 missing min/max values across all parameters
- ❌ 159 files missing `passCount` parameter completely
- ❌ Many generated TXT files missing 7/8 core machine parameters

**Immediate Action Required**:
1. Run validation audit: `npm test -- dataset-generation.test.js`
2. Generate missing data report: `npm run datasets:audit`
3. Fix 159 files missing passCount (highest priority)
4. Add min/max values to remaining 2,528 parameters

**Target Date for Full Compliance**: December 20, 2025

---

## 📚 Related Documentation

- **Test Suite**: `tests/dataset-generation.test.js` (18 test cases, 605 lines)
- **Generation Script**: `scripts/generate-datasets.ts` (670 lines)
- **Schema Helper**: `app/utils/jsonld-helper.ts` (Dataset schema functions)
- **Architecture**: `docs/02-features/DATASETS_PAGE_IMPLEMENTATION.md`
- **Consolidation**: Root `DATASET_CONSOLIDATION_NOV24_2025.md`

---

## ✅ Success Criteria

Dataset quality policy is successful when:
1. ✅ Zero datasets with missing Tier 1 parameters are visible on website
2. ✅ All JSON-LD Dataset schemas include complete machine settings
3. ✅ Build-time validation reports accurate quality metrics
4. ✅ `/datasets` page only lists materials with complete data
5. ✅ Test suite enforces policy automatically (no manual checks)
6. ✅ User trust maintained through consistent data quality

---

## 🔐 Enforcement

**Automated**:
- Pre-commit hook validates new/modified dataset files
- Build fails if incomplete datasets are accidentally included
- Test suite verifies policy compliance (18 tests)

**Manual Review**:
- Weekly quality report sent to team
- Quarterly audit of dataset completeness trends
- User feedback monitoring for data quality issues

**Grade**: A+ policy when 95%+ datasets complete, F if <80% complete.
