# Dataset Consolidation Specification

**Status**: Approved  
**Date**: 2025-12-20  
**Decision**: Consolidate settings into material datasets, separate contaminant datasets

---

## Overview

Current dataset architecture splits material data across two files:
- `materials/[name]-laser-cleaning.json` - Material properties
- `settings/[name]-settings.json` - Machine settings

**New Architecture**: Single unified dataset per content type.

---

## Dataset Architecture

### 1. Material Datasets (Unified)
**Path**: `public/datasets/materials/[name]-laser-cleaning.json`

**Combines**:
- Material properties (thermal, optical, mechanical)
- Machine settings (laser parameters, ranges)
- Safety data
- Citations and sources

**Content Types Included**:
- Materials (metal, plastic, ceramic, etc.)
- Settings (merged into materials)

### 2. Contaminant Datasets
**Path**: `public/datasets/contaminants/[name]-contamination.json`

**Includes**:
- Contaminant properties
- Compound data (chemical formulas, hazards)
- Removal techniques
- Safety considerations
- Citations and sources

**Content Types Included**:
- Contaminants
- Compounds (chemical contaminants)

---

## Schema Requirements

### Required Fields (All Datasets)

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": "https://www.z-beam.com/[type]/[path]#dataset",
  "name": "Required",
  "description": "Required",
  "variableMeasured": [], // MANDATORY - min 20 variables
  "citation": [],         // MANDATORY - min 3 citations
  "distribution": [],     // MANDATORY - JSON/CSV/TXT
  "measurementTechnique": "Required",
  "license": {},          // MANDATORY
  "creator": {},          // MANDATORY
  "publisher": {}         // MANDATORY
}
```

### Material Dataset Structure

```json
{
  "@type": "Dataset",
  "material": {
    "name": "Aluminum",
    "classification": {
      "category": "metal",
      "subcategory": "non-ferrous"
    },
    "machineSettings": {
      // Merged from settings files
      "powerRange": { "value": 100, "min": 1, "max": 1000, "unit": "W" },
      "wavelength": { "value": 1064, "min": 355, "max": 1064, "unit": "nm" },
      "spotSize": { "value": 50, "min": 1, "max": 500, "unit": "μm" },
      "repetitionRate": { "value": 50, "min": 1, "max": 1000, "unit": "kHz" },
      "pulseWidth": { "value": 100, "min": 1, "max": 1000, "unit": "ns" },
      "scanSpeed": { "value": 1000, "min": 1, "max": 10000, "unit": "mm/s" }
    },
    "materialProperties": {
      "material_characteristics": { /* thermal, optical, mechanical */ },
      "laser_material_interaction": { /* absorption, reflection, etc */ }
    },
    "safetyData": { /* safety considerations */ }
  },
  "variableMeasured": [
    // ALL properties from machineSettings + materialProperties
    { "@type": "PropertyValue", "name": "powerRange", "value": "1-1000 W" },
    { "@type": "PropertyValue", "name": "density", "value": "2.7 g/cm³" }
    // ... minimum 20 variables
  ],
  "citation": [
    // Minimum 3 citations
  ]
}
```

### Contaminant Dataset Structure

```json
{
  "@type": "Dataset",
  "contaminant": {
    "name": "Rust",
    "classification": {
      "category": "inorganic",
      "type": "oxide"
    },
    "compounds": [
      // Chemical compounds if applicable
      {
        "formula": "Fe₂O₃",
        "name": "Iron(III) oxide",
        "hazards": ["oxidizer"]
      }
    ],
    "properties": {
      "thickness": { "value": 50, "min": 1, "max": 1000, "unit": "μm" },
      "adhesion": { "value": "moderate" },
      "composition": { "primary": "Fe₂O₃", "secondary": ["FeO", "Fe(OH)₃"] }
    },
    "removalTechniques": {
      "recommended": ["laser", "mechanical"],
      "laserSettings": { /* optimal parameters */ }
    },
    "safetyData": { /* hazards and precautions */ }
  },
  "variableMeasured": [
    // ALL properties from contaminant data
  ],
  "citation": [
    // Minimum 3 citations
  ]
}
```

---

## Validation Rules

### Mandatory Checks

**All Datasets**:
1. ✅ Must have `variableMeasured` array with ≥20 items
2. ✅ Must have `citation` array with ≥3 citations
3. ✅ Must have `distribution` array (JSON, CSV, TXT)
4. ✅ Must have `measurementTechnique` string
5. ✅ Must have `license` object
6. ✅ Must have `creator` and `publisher` objects

**Material Datasets**:
1. ✅ Must have `material.machineSettings` object
2. ✅ Must have `material.materialProperties` object
3. ✅ Machine settings must include: powerRange, wavelength, spotSize, repetitionRate, pulseWidth, scanSpeed

**Contaminant Datasets**:
1. ✅ Must have `contaminant.properties` object
2. ✅ Must have `contaminant.removalTechniques` object
3. ✅ If compound, must have `contaminant.compounds` array

---

## Migration Strategy

### Phase 1: Merge Settings into Materials (Priority 1)

**For each material**:
```bash
# Input: 
# - frontmatter/materials/[cat]/[subcat]/[name].yaml
# - frontmatter/settings/[cat]/[subcat]/[name]-settings.yaml

# Output:
# - public/datasets/materials/[name]-laser-cleaning.json (unified)
```

**Steps**:
1. Load material YAML and settings YAML
2. Merge machine_settings into material.machineSettings
3. Extract all properties to variableMeasured array (≥20 items)
4. Generate citations from both sources (≥3 citations)
5. Add distribution links (JSON, CSV, TXT)
6. Validate against schema requirements
7. Write unified JSON dataset
8. Delete old settings JSON files

### Phase 2: Consolidate Contaminant + Compound Datasets (Priority 2)

**For each contaminant/compound**:
```bash
# Input:
# - frontmatter/contaminants/[name]-contamination.yaml
# - frontmatter/compounds/[name]-compound.yaml (if applicable)

# Output:
# - public/datasets/contaminants/[name]-contamination.json
```

**Steps**:
1. Load contaminant YAML
2. If related compound exists, merge compound data
3. Extract all properties to variableMeasured array (≥20 items)
4. Generate citations (≥3 citations)
5. Add distribution links
6. Validate against schema requirements
7. Write unified JSON dataset

---

## File Structure

### Before
```
public/datasets/
├── materials/
│   ├── aluminum-laser-cleaning.json (material props only)
│   └── ...
├── settings/
│   ├── aluminum-settings.json (machine settings)
│   └── ...
├── contaminants/
│   ├── rust-contamination.json
│   └── ...
└── compounds/
    ├── iron-oxide-compound.json
    └── ...
```

### After
```
public/datasets/
├── materials/
│   ├── aluminum-laser-cleaning.json (unified: props + settings)
│   └── ... (132 files)
└── contaminants/
    ├── rust-contamination.json (unified: contaminant + compounds)
    └── ... (~100 files)
```

**Total**: ~230 unified datasets (down from 421 fragmented files)

---

## Implementation Plan

### 1. Create Merger Scripts
- `scripts/datasets/merge-material-settings.js`
- `scripts/datasets/merge-contaminant-compounds.js`

### 2. Update Schema Validation
- `schemas/dataset-material.json` - Material dataset schema
- `schemas/dataset-contaminant.json` - Contaminant dataset schema
- Update validation to enforce mandatory fields

### 3. Create Tests
- `tests/datasets/dataset-architecture.test.ts` - Enforce structure
- `tests/datasets/dataset-validation.test.ts` - Validate all files
- Fail if any dataset missing required fields

### 4. Update Documentation
- Create ADR 005: Dataset Consolidation Architecture
- Update RUNBOOK.md with new dataset structure
- Update docs/data/ with new architecture

### 5. Execute Migration
- Run merger scripts on all 421 files
- Validate output (230 unified datasets)
- Delete old settings/ and compounds/ directories
- Update .gitignore if needed

---

## Success Metrics

**Before**:
- 421 datasets
- 848 issues (2 issues per file average)
- Settings files incomplete (missing variableMeasured, citations, distribution)
- Compounds separate from contaminants

**After**:
- 230 unified datasets
- 0 validation issues
- 100% schema compliance
- All datasets have ≥20 variables, ≥3 citations, distribution links
- Single dataset per content item

**Quality Target**: A+ (100/100)
- All required fields present
- Consistent structure
- Comprehensive citations
- Full variableMeasured coverage

---

## Breaking Changes

1. **URL Structure**: Settings datasets removed
   - Old: `/datasets/settings/aluminum-settings.json`
   - New: Data merged into `/datasets/materials/aluminum-laser-cleaning.json`

2. **API Impact**: Applications fetching settings datasets must update
   - Fetch material dataset instead
   - Access via `material.machineSettings`

3. **Schema Changes**: Mandatory fields enforced
   - All datasets MUST have variableMeasured (≥20)
   - All datasets MUST have citations (≥3)
   - All datasets MUST have distribution array

---

## Rollout

### Stage 1: Development (Day 1)
- Create merger scripts
- Update schemas
- Create validation tests
- Test on 5 sample files

### Stage 2: Full Migration (Day 1-2)
- Run merger on all 421 files
- Validate all 230 outputs
- Fix any issues
- Commit unified datasets

### Stage 3: Cleanup (Day 2)
- Delete old settings/ directory (JSON only, keep YAML)
- Delete old compounds/ directory (JSON only, keep YAML)
- Update documentation
- Run full test suite

### Stage 4: Verification (Day 2)
- Run dataset validation tests
- Verify 0 issues
- Confirm 100% schema compliance
- Deploy to production

---

**Total Effort**: 8-12 hours  
**Risk**: Low (automated, reversible via git)  
**Impact**: High (eliminates 848 issues, improves data quality)

---

**Next Steps**: Create merger scripts and schema validation tests
