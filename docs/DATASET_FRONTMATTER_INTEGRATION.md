# Dataset-Frontmatter Integration Strategy

**Date**: December 22, 2025  
**Purpose**: Ensure dataset generation fully leverages all frontmatter data for both materials and contaminants

---

## Overview

The dataset architecture must extract and utilize **ALL available frontmatter data** to create comprehensive, high-quality datasets. Currently, datasets are missing key fields that exist in frontmatter, failing test requirements.

---

## Two Dataset Categories

### 1. Materials/Settings Datasets
**Source**: `frontmatter/materials/*.yaml`  
**Schema**: `schemas/dataset-material.json`  
**Generator**: `scripts/generate-datasets.ts`  
**Output**: `public/datasets/materials/`

### 2. Contaminants/Compounds Datasets
**Source**: `frontmatter/contaminants/*.yaml`  
**Schema**: `schemas/dataset-contaminant.json`  
**Generator**: `scripts/generate-contaminant-datasets.ts`  
**Output**: `public/datasets/contaminants/`

---

## Current Gap Analysis

### Materials Datasets - Missing Frontmatter Fields

#### ✅ Currently Extracted
- `name`, `category`, `subcategory` → Basic info
- `properties.material_characteristics.*` → Material properties
- `properties.laser_material_interaction.*` → Laser parameters
- `machineSettings.*` → Machine parameters (from separate settings files)
- `applications[]` → Industry applications
- `safetyConsiderations[]` → Safety data

#### ❌ NOT Currently Extracted (Available in Frontmatter)
- **Author/E-E-A-T Data**:
  - `author.name`, `author.credentials[]`, `author.expertise[]`
  - `author.affiliation.name`, `author.jobTitle`
  - Could enhance `creator` field in datasets
  
- **Images**:
  - `images.hero.url`, `images.hero.alt`
  - `images.micro.url`, `images.micro.alt`
  - Could add visual documentation URLs
  
- **Relationships**:
  - `relationships.contaminated_by[]` → List of contaminants
  - `relationships.regulatory[]` → Regulatory standards (partially used)
  - Could create richer linkage in datasets
  
- **Content**:
  - `description` → Used in dataset description, but could be enhanced
  - `micro` → Short description (not currently used)
  - `faq[]` → Q&A pairs (not currently used)
  
- **Metadata**:
  - `datePublished`, `dateModified` → More accurate dating
  - `full_path` → Canonical URL path
  - `breadcrumb[]` → Navigation context

### Contaminants Datasets - Missing Frontmatter Fields

#### ✅ Currently Extracted
- `name`, `category` → Basic info
- `composition[]` → Chemical composition
- `safety_data.*` → Safety metrics, PPE requirements
- `laser_properties.laser_parameters.*` → Laser removal parameters
- `removal_by_material.*` → Material-specific settings

#### ❌ NOT Currently Extracted (Available in Frontmatter)
- **Visual Characteristics**:
  - `relationships.visual_characteristics.appearance_on_categories.*`
  - Complete appearance data for 12+ material categories
  - Each includes: appearance, coverage, pattern descriptions
  
- **Relationships**:
  - `relationships.produces_compounds[]` → Hazardous compounds produced
  - `relationships.found_on_materials[]` → Materials contaminated (with frequency)
  - `relationships.regulatory_standards[]` → Safety standards
  
- **Images**:
  - `images.hero.url`, `images.hero.alt`
  - `images.micro.url`, `images.micro.alt`
  
- **Author/E-E-A-T Data**:
  - Same author fields as materials
  
- **Content**:
  - `description` → Detailed contamination description
  - `faq[]` → Q&A pairs specific to this contaminant
  
- **Metadata**:
  - `datePublished`, `dateModified`
  - `full_path`, `breadcrumb[]`

---

## Required Schema Fields (Test Failures)

### Materials Dataset Schema Requirements
Per `schemas/dataset-material.json`:

```json
{
  "required": [
    "@context", "@type", "@id",
    "name", "description",
    "variableMeasured",  // ❌ Often incomplete (<20 items)
    "citation",           // ❌ Often incomplete (<3 items)
    "distribution",       // ❌ Missing array
    "measurementTechnique",
    "license", "creator", "author", "publisher",
    "material"            // ❌ Missing materialProperties
  ]
}
```

**Current Test Failures**:
- ❌ `variableMeasured` must have ≥20 items (161 files fail)
- ❌ `citation` must be array with ≥3 items (161 files fail)
- ❌ `distribution` array missing (161 files fail)
- ❌ `material.materialProperties` validation failing
- ❌ `machineSettings` missing in material object

### Contaminants Dataset Schema Requirements
Per `schemas/dataset-contaminant.json`:

```json
{
  "required": [
    "@context", "@type", "@id",
    "name", "description",
    "variableMeasured",  // ❌ May be incomplete
    "citation",           // ❌ May be incomplete
    "distribution",       // ❌ May be missing
    "measurementTechnique",
    "license", "creator", "author", "publisher",
    "contaminant"         // ❌ Validation may fail
  ]
}
```

---

## Proposed Enhancements

### 1. Expand `variableMeasured` Array

**Current**: Only extracts from `properties.*` and `machineSettings.*`  
**Enhancement**: Also extract from:

```typescript
// Materials
variableMeasured.push(
  // Author expertise as measurement techniques
  ...material.author.expertise.map(exp => ({
    '@type': 'PropertyValue',
    propertyID: 'expertise',
    name: exp,
    description: `Expert knowledge area: ${exp}`
  })),
  
  // Regulatory standards as quality measures
  ...material.relationships.regulatory.map(reg => ({
    '@type': 'PropertyValue',
    propertyID: 'regulatory_compliance',
    name: reg.name,
    description: reg.description,
    url: reg.url
  })),
  
  // Contamination relationships as categorical data
  ...material.relationships.contaminated_by.map(cont => ({
    '@type': 'PropertyValue',
    propertyID: 'contamination_susceptibility',
    name: cont.id,
    url: cont.url
  }))
);

// Contaminants
variableMeasured.push(
  // Visual characteristics per material category (12+ entries)
  ...Object.entries(contaminant.relationships.visual_characteristics.appearance_on_categories).map(([cat, data]) => [
    {
      '@type': 'PropertyValue',
      propertyID: `appearance_${cat}`,
      name: `Appearance on ${cat}`,
      value: data.appearance
    },
    {
      '@type': 'PropertyValue',
      propertyID: `coverage_${cat}`,
      name: `Coverage pattern on ${cat}`,
      value: data.coverage
    },
    {
      '@type': 'PropertyValue',
      propertyID: `pattern_${cat}`,
      name: `Pattern on ${cat}`,
      value: data.pattern
    }
  ]).flat(),
  
  // Compound relationships
  ...contaminant.relationships.produces_compounds.map(comp => ({
    '@type': 'PropertyValue',
    propertyID: 'hazardous_compound',
    name: comp.id,
    value: comp.phase,
    description: `Hazard level: ${comp.hazard_level}`,
    url: comp.url
  })),
  
  // Material frequency data
  ...contaminant.relationships.found_on_materials.map(mat => ({
    '@type': 'PropertyValue',
    propertyID: 'contamination_frequency',
    name: mat.id,
    value: mat.frequency,
    url: mat.url
  }))
);
```

### 2. Enhance `citation` Array

**Current**: Often has 0-1 items  
**Enhancement**: Include multiple sources:

```typescript
citation: [
  // Primary author citation
  {
    '@type': 'CreativeWork',
    author: {
      '@type': 'Person',
      name: material.author.name,
      jobTitle: material.author.jobTitle,
      affiliation: {
        '@type': 'Organization',
        name: material.author.affiliation.name
      },
      credentials: material.author.credentials.join('; ')
    },
    datePublished: material.datePublished
  },
  
  // Regulatory standards as citations
  ...material.relationships.regulatory.map(reg => ({
    '@type': 'CreativeWork',
    name: reg.name,
    description: reg.description,
    url: reg.url,
    publisher: {
      '@type': 'Organization',
      name: reg.longName
    }
  })),
  
  // Dataset itself as citable work
  {
    '@type': 'Dataset',
    name: `${material.name} Laser Cleaning Dataset`,
    url: `${materialUrl}#dataset`,
    version: config.version,
    dateModified: material.dateModified
  }
];
```

### 3. Add Missing Fields

```typescript
// Add distribution array (currently missing)
distribution: [
  {
    '@type': 'DataDownload',
    encodingFormat: 'application/json',
    contentUrl: `${baseUrl}/datasets/materials/${slug}.json`,
    description: 'JSON-LD structured data format'
  },
  {
    '@type': 'DataDownload',
    encodingFormat: 'text/csv',
    contentUrl: `${baseUrl}/datasets/materials/${slug}.csv`,
    description: 'CSV format for analysis tools'
  },
  {
    '@type': 'DataDownload',
    encodingFormat: 'text/plain',
    contentUrl: `${baseUrl}/datasets/materials/${slug}.txt`,
    description: 'Human-readable text format'
  }
],

// Add material.materialProperties object
material: {
  '@type': 'Material',
  name: material.name,
  materialProperties: {
    // Extract ALL properties with metadata
    ...Object.entries(material.properties).reduce((acc, [category, props]) => {
      Object.entries(props).forEach(([key, value]) => {
        if (typeof value === 'object' && value.value !== undefined) {
          acc[key] = {
            value: value.value,
            unit: value.unit,
            confidence: value.confidence,
            min: value.min,
            max: value.max,
            source: value.source,
            description: value.description
          };
        }
      });
      return acc;
    }, {})
  },
  machineSettings: material.machineSettings || {}
}
```

### 4. Add Visual Documentation

```typescript
// Add image references to dataset
image: [
  {
    '@type': 'ImageObject',
    contentUrl: `${baseUrl}${material.images.hero.url}`,
    description: material.images.hero.alt,
    representativeOfPage: true
  },
  {
    '@type': 'ImageObject',
    contentUrl: `${baseUrl}${material.images.micro.url}`,
    description: material.images.micro.alt,
    thumbnail: true
  }
]
```

### 5. Enhance Creator/Author Data

```typescript
creator: {
  '@type': 'Person',
  name: material.author.name,
  jobTitle: material.author.jobTitle,
  affiliation: {
    '@type': 'Organization',
    name: material.author.affiliation.name
  },
  hasCredential: material.author.credentials.map(cred => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Professional Certification',
    name: cred
  })),
  expertise: material.author.expertise,
  email: material.author.email,
  url: `${baseUrl}${material.author.url}`,
  sameAs: material.author.sameAs,
  image: {
    '@type': 'ImageObject',
    contentUrl: `${baseUrl}${material.author.image}`,
    description: material.author.imageAlt
  }
}
```

---

## Implementation Priority

### Phase 1: Fix Test Failures (CRITICAL)
1. ✅ Ensure `variableMeasured` has ≥20 items
2. ✅ Ensure `citation` is array with ≥3 items
3. ✅ Add `distribution` array with all 3 formats
4. ✅ Add `material.materialProperties` object
5. ✅ Add `machineSettings` to material object

### Phase 2: Enhance Data Completeness (HIGH)
6. Extract visual characteristics (contaminants)
7. Extract relationship data (both)
8. Add author E-E-A-T data (both)
9. Add image references (both)
10. Improve metadata accuracy (both)

### Phase 3: Advanced Features (MEDIUM)
11. FAQ integration
12. Breadcrumb navigation data
13. Cross-linking between datasets
14. Version history tracking
15. Quality metrics reporting

---

## Generator Script Updates Needed

### `scripts/generate-datasets.ts` (Materials)

**Lines to modify**:
- Line 167: `variableMeasured: extractVariables(material)` → Expand extraction
- Line 109-166: `distribution` array → Add if missing
- Line 726+: Add `material.materialProperties` structure
- Add new `extractEnhancedVariables()` function
- Add new `extractCitations()` function
- Add new `extractImages()` function

### `scripts/generate-contaminant-datasets.ts` (Contaminants)

**Similar modifications**:
- Expand `variableMeasured` extraction
- Add visual characteristics parsing
- Add relationship data extraction
- Ensure all required fields present
- Add E-E-A-T author data

---

## Testing Requirements

### Unit Tests
- ✅ Verify ≥20 items in `variableMeasured`
- ✅ Verify ≥3 items in `citation` array
- ✅ Verify `distribution` array present
- ✅ Verify `material.materialProperties` structure
- ✅ Verify all required schema fields present

### Integration Tests
- ✅ Validate against JSON schemas
- ✅ Verify URL paths are correct
- ✅ Verify image paths exist
- ✅ Verify author data complete
- ✅ Verify relationships resolve

### E2E Tests
- ✅ Generate all datasets successfully
- ✅ No schema validation errors
- ✅ All frontmatter data utilized
- ✅ Dataset files created (JSON, CSV, TXT)
- ✅ File sizes reasonable (not truncated)

---

## Success Metrics

### Quantitative
- ✅ 0 test failures in dataset architecture tests
- ✅ 100% of frontmatter fields mapped to datasets
- ✅ ≥20 variableMeasured items per dataset (currently failing)
- ✅ ≥3 citation items per dataset (currently failing)
- ✅ All 161 material datasets pass schema validation
- ✅ All contaminant datasets pass schema validation

### Qualitative
- ✅ Datasets contain complete, accurate data
- ✅ All relationships properly linked
- ✅ E-E-A-T signals present (author, expertise, credentials)
- ✅ Visual documentation included
- ✅ Regulatory standards referenced
- ✅ Cross-references work correctly

---

## Migration Path

### Step 1: Analyze Current State
```bash
npm test -- tests/datasets
```
**Expected**: 13 failing tests

### Step 2: Update Generator Scripts
- Modify `extractVariables()` to be more comprehensive
- Add new extraction functions for citations, images, relationships
- Ensure all schema required fields populated

### Step 3: Regenerate Datasets
```bash
npm run generate:datasets
```

### Step 4: Validate
```bash
npm test -- tests/datasets
```
**Expected**: 0 failing tests

### Step 5: Deploy
```bash
npm run build
# Verify public/datasets/ contains updated files
```

---

## Maintenance Guidelines

### When Adding Frontmatter Fields
1. ✅ Update this document with new field location
2. ✅ Update generator scripts to extract new field
3. ✅ Update schema if new field is critical
4. ✅ Add tests for new field extraction
5. ✅ Regenerate all datasets
6. ✅ Validate no regressions

### When Modifying Schemas
1. ✅ Update schema JSON files first
2. ✅ Update generator scripts to match
3. ✅ Update tests to verify new requirements
4. ✅ Regenerate all datasets
5. ✅ Validate schema compliance

### When Fixing Test Failures
1. ✅ Identify which frontmatter data is missing
2. ✅ Trace data flow from frontmatter → generator → dataset
3. ✅ Add extraction logic if missing
4. ✅ Test with single dataset first
5. ✅ Regenerate all datasets
6. ✅ Verify all tests pass

---

## Related Documentation

- `schemas/dataset-material.json` - Materials schema definition
- `schemas/dataset-contaminant.json` - Contaminants schema definition
- `docs/DATA_COMPONENT_MAPPING.md` - Component data sources
- `tests/datasets/generation.test.js` - Dataset validation tests
- `docs/DATASET_ARCHITECTURE.md` - Overall dataset architecture (if exists)

---

## Status

**Current State**: Datasets failing 13/13 architecture tests  
**Reason**: Missing frontmatter data extraction (variableMeasured, citations, distribution, materialProperties)  
**Next Action**: Implement Phase 1 fixes in generator scripts  
**Expected Outcome**: 0/13 test failures, full frontmatter utilization

**Last Updated**: December 22, 2025
