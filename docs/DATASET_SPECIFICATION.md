# Z-Beam Dataset Specification

**Version**: 2.0  
**Date**: December 26, 2025  
**Status**: Superseded by v3.0 (High-level overview only)  
**Purpose**: High-level specification for Z-Beam's unified dataset architecture

> ⚠️ **Version Notice**: This document describes the v2.0 comprehensive format.  
> **Current Production Format**: v3.0 (Streamlined)  
> **For Complete Specification**: See [`UPDATED_DATASET_SPECIFICATION_DEC27_2025.md`](./UPDATED_DATASET_SPECIFICATION_DEC27_2025.md)  
> **Migration Guide**: See v2.0 → v3.0 breaking changes in comprehensive spec

---

## 🎯 Executive Summary

Z-Beam provides structured, machine-readable datasets for laser cleaning applications through **two consolidated dataset categories**:

1. **Materials Dataset** - Combines material properties + machine settings for laser cleaning applications
2. **Contaminants Dataset** - Combines contaminant properties + chemical compounds for materials scientists

All datasets are:
- ✅ Schema.org compliant for SEO
- ✅ Available in 3 formats: JSON, CSV, TXT
- ✅ Quality-validated (3-tier system)
- ✅ Automatically generated from frontmatter
- ✅ Integrated into JSON-LD structured data

**⚡ What Changed in v3.0**:
- ❌ Removed: `variableMeasured`, `citation`, `distribution`, `keywords`, `license` details
- ✅ Added: Nested object structure (`material.machineSettings`, `material.materialProperties`)
- ✅ Simplified: Minimal metadata (name, description, version, creator, publisher only)

---

## 📊 Two Dataset Categories

### Category 1: Materials Dataset

**Purpose**: Comprehensive laser cleaning data for industrial applications  
**Combines**: Material properties + Machine settings  
**Target Audience**: Laser operators, manufacturers, industrial engineers

**File Structure**:
```
public/datasets/materials/
├── aluminum-material-dataset.json
├── aluminum-material-dataset.csv
├── aluminum-material-dataset.txt
├── steel-material-dataset.json
└── ... (153 materials × 3 formats = 459 files)
```

**Naming Convention**: `{material-name}-material-dataset.{json|csv|txt}`

**Data Contents (v3.0 Streamlined Format)**:
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Aluminum",
  "description": "Laser cleaning parameters for aluminum...",
  "version": "2.0",
  
  "material": {
    "machineSettings": {
      "laserPower": { "value": 100, "unit": "W", "min": 50, "max": 500 },
      "wavelength": { "value": 1064, "unit": "nm", "min": 355, "max": 10640 }
      // ... 8 machine parameters
    },
    
    "materialProperties": {
      "materialCharacteristics": {
        "density": { "value": 2.7, "unit": "g/cm³", "min": 0.53, "max": 22.6 }
        // ... nested property groups
      },
      "laserMaterialInteraction": {
        "thermalConductivity": { "value": 237, "unit": "W/(m·K)" }
        // ... nested property groups
      }
    }
  },
  
  "creator": {
    "@type": "Organization",
    "name": "Z-Beam Laser Cleaning Research Lab"
  },
  "publisher": {
    "@type": "Organization", 
    "name": "Z-Beam Laser Cleaning Research Lab"
  }
}
```

**Note**: v2.0 format included `variableMeasured`, `citation`, `distribution` arrays - see comprehensive spec for details.

**Key Benefits**:
- **Single unified file** per material (no separate settings file)
- **Complete cleaning parameters** for immediate application
- **Material science data** for understanding laser-material interaction
- **Ready for machine learning** and process optimization

---

### Category 2: Contaminants Dataset

**Purpose**: Comprehensive contamination removal data for materials scientists  
**Combines**: Contaminant properties + Chemical compounds  
**Target Audience**: Materials scientists, safety engineers, researchers

**File Structure**:
```
public/datasets/contaminants/
├── rust-oxidation-contaminant-dataset.json
├── rust-oxidation-contaminant-dataset.csv
├── rust-oxidation-contaminant-dataset.txt
├── benzene-compound-contaminant-dataset.json
├── benzene-compound-contaminant-dataset.csv
├── benzene-compound-contaminant-dataset.txt
└── ... (132 datasets × 3 formats = 396 files)
```

**Naming Convention**: `{contaminant-id}-contaminant-dataset.{json|csv|txt}`

**Note**: Both contaminants and compounds are in the **same directory** (`public/datasets/contaminants/`) as they represent a unified contamination/chemical safety dataset category for materials scientists.

**Data Contents**:
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Rust / Iron Oxide Formation Dataset",
  "description": "Contamination removal parameters and chemical composition...",
  
  "contaminant": {
    "properties": {
      "composition": ["Fe2O3", "Fe3O4"],
      "absorptionRate": { "value": 0.92, "unit": "dimensionless" },
      "removalDifficulty": "medium",
      "hazardLevel": "low"
    },
    
    "compounds": [
      {
        "name": "Iron(III) Oxide",
        "formula": "Fe2O3",
        "casNumber": "1309-37-1",
        "phase": "solid",
        "hazardLevel": "low",
        "healthEffects": "Respiratory irritant in dust form"
      }
    ],
    
    "removalTechniques": {
      "laserPower": { "min": 50, "max": 200, "unit": "W" },
      "wavelength": { "min": 1064, "max": 1064, "unit": "nm" },
      "passCount": { "min": 2, "max": 3 },
      "removalRate": { "value": 95, "unit": "%" }
    }
  },
  
  "variableMeasured": [
    { "@type": "PropertyValue", "name": "Chemical Composition" },
    { "@type": "PropertyValue", "name": "Removal Efficiency" }
    // Minimum 20 variables
  ],
  
  "citation": [
    { "@type": "CreativeWork", "name": "Corrosion Science Journal" }
    // Minimum 3 citations
  ]
}
```

**Key Benefits**:
- **Chemical safety data** integrated with removal parameters
- **Compound identification** for proper handling procedures
- **Hazard assessment** for workplace safety
- **Research-ready format** for scientific analysis

---

## ✅ Quality Validation (3-Tier System)

### Tier 1: CRITICAL - 100% Required
**Machine Settings** (8 parameters must have min/max values):
- `laserPower`, `wavelength`, `spotSize`, `repetitionRate`
- `pulseWidth`, `scanSpeed`, `passCount`, `overlapRatio`

**Enforcement**: Dataset NOT generated if Tier 1 incomplete

### Tier 2: IMPORTANT - 80% Target
**Material Properties** (10 key characteristics):
- Thermal: `meltingPoint`, `thermalConductivity`, `heatCapacity`
- Optical: `absorptivity`, `reflectivity`, `emissivity`
- Mechanical: `density`, `hardness`, `tensileStrength`, `youngsModulus`

**Enforcement**: Warning logged, dataset still generated

### Tier 3: OPTIONAL - Enhanced Content
- Safety considerations
- Regulatory standards
- Application notes
- Vendor specifications

**Enforcement**: No requirements

---

## 📋 Schema.org Compliance

All datasets include:
- ✅ **≥20 variableMeasured** entries (enforced by JSON schema)
- ✅ **≥3 citations** with proper CreativeWork attribution
- ✅ **3 distribution formats** (JSON, CSV, TXT) with contentUrl
- ✅ **license, creator, publisher** metadata
- ✅ **measurementTechnique** description (≥10 characters)

**Validation**: JSON schemas enforce all requirements
- `schemas/dataset-material.json`
- `schemas/dataset-contaminant.json`

---

## 📁 File Formats

### JSON Format
**Purpose**: API consumption, machine learning, web applications  
**Features**: Complete structured data with nested objects

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Aluminum Material Dataset",
  "identifier": "aluminum-material-dataset",
  "material": {
    "materialProperties": { "density": { "value": 2700, "unit": "kg/m³" } },
    "machineSettings": { "laserPower": { "min": 20, "max": 100 } }
  }
}
```

### CSV Format
**Purpose**: Spreadsheet analysis, data import, Excel compatibility  
**Features**: Flattened structure with property-value-unit columns

```csv
# Material: Aluminum
# Category: Non-Ferrous Metals
property,value,unit,min,max
density,2700,kg/m³,,
laserPower,,W,20,100
```

### TXT Format
**Purpose**: Human reading, documentation, quick reference  
**Features**: Formatted text with 80-character line width

```txt
================================================================================
MATERIAL: Aluminum Material Dataset
================================================================================
Category: Non-Ferrous Metals

MATERIAL PROPERTIES
  Density: 2700 kg/m³
  
MACHINE SETTINGS
  Laser Power: 20-100 W
```

---

## 🔄 Generation Workflow

### Automated Generation

**Materials Dataset**:
```bash
# Generate material datasets (153 materials × 3 formats = 459 files)
npm run datasets:generate
```

**Contaminants + Compounds Dataset**:
```bash
# Generate unified contaminant/compound datasets (132 datasets × 3 formats = 396 files)
npx ts-node scripts/generate-contaminant-datasets.ts
```

**Quality & Validation**:
```bash
# Quality validation report
npm run datasets:quality

# Check synchronization with frontmatter
npm run datasets:check
```

### Source Data
- **Materials**: `data/materials/Materials.yaml` (153 materials)
- **Settings**: `data/settings/Settings.yaml` (153 settings)
- **Contaminants**: `data/contaminants/Contaminants.yaml` (98 contaminants)
- **Compounds**: `data/compounds/Compounds.yaml` (34 compounds)

**Note**: Datasets are generated from source YAML data files in the `data/` directory, NOT from frontmatter. Frontmatter files are exported output for the website, while source YAML files are the single source of truth.

### Generation Status (Dec 26, 2025)
- ⏳ **Materials**: Ready to generate 459 files (153 × 3 formats)
  - Script: `npm run datasets:generate`
  - Source: `data/materials/Materials.yaml` + `data/settings/Settings.yaml`
  - Each material includes both properties AND machine settings (unified)
- ⏳ **Contaminants + Compounds**: Ready to generate 396 files (132 × 3 formats)
  - Source: `data/contaminants/Contaminants.yaml` + `data/compounds/Compounds.yaml`
  - Script updated: `scripts/generate-contaminant-datasets.ts` ✅
  - Contaminants: 98 datasets
  - Compounds: 34 datasets
  - Output directory: `public/datasets/contaminants/` (unified)
- **Total Expected**: 855 files (459 materials + 396 contaminants/compounds)

**Backend Actions Required**:
1. `npm run datasets:generate` - Generate materials
2. `npx ts-node scripts/generate-contaminant-datasets.ts` - Generate contaminants + compounds

---

## 🎯 Current Metrics

**Materials Dataset**:
- Total materials: 153
- Files to generate: 459 (153 × 3 formats)
- Each dataset includes: Material properties + Machine settings (unified)
- Schema validation: 100% compliance enforced

**Contaminants Dataset**:
- Total contaminants: 98
- Total compounds: 34
- Total datasets: 132 (contaminants + compounds unified)
- Files to generate: 396 (132 × 3 formats)
- Output directory: `public/datasets/contaminants/` (unified)
- Schema validation: 100% compliance enforced

**Grand Total**: 855 files to be generated (459 + 396)

---

## 🔌 Integration Points

### SEO System
- Datasets embedded as JSON-LD structured data on all material/contaminant pages
- Enhances search engine understanding
- Enables rich snippets in search results
- Validates through `scripts/validation/seo/validate-seo-infrastructure.js`

### Source Data Sync
- Datasets generated from source YAML files in `data/` directory
- Source data is the single source of truth for all datasets
- Frontmatter is exported output (for website), NOT source for datasets
- Status check: `npm run datasets:check`

### API Endpoints

**Note**: All contaminant and compound datasets are served from the same `/datasets/contaminants/` directory, creating a unified contamination/chemical safety dataset category.
- `https://www.z-beam.com/datasets/materials/{name}-material-dataset.json`
- `https://www.z-beam.com/datasets/contaminants/{name}-contaminant-dataset.json`

---

## 🚀 Architecture Benefits

### For Materials Dataset
**Before**: 2 separate files (material + settings)
- `/datasets/materials/aluminum-laser-cleaning.json` (properties only)
- `/datasets/settings/aluminum-settings.json` (parameters only)
- **Problem**: 2 API requests, data fragmentation, incomplete schemas

**After**: 1 unified file
- `/datasets/materials/aluminum-material-dataset.json` (everything)
- **Benefits**: 1 API request, complete data, 100% schema compliance

### For Contaminants Dataset
**Before**: 2 separate file types (contaminants + compounds)
- `/datasets/contaminants/rust-oxidation-contamination.json`
- `/datasets/compounds/iron-oxide-compound.json` (separate system)
- **Problem**: Related chemical data disconnected from contamination data

**After**: Unified structure
- `/datasets/contaminants/rust-oxidation-contaminant-dataset.json` (includes compounds)
- `/datasets/contaminants/benzene-contaminant-dataset.json` (compound-specific dataset)
- **Benefits**: Chemical safety integrated, complete research data

---

## 📖 Related Documentation

### Core Documentation
- `docs/01-core/DATASET_ARCHITECTURE.md` - Technical architecture
- `docs/01-core/DATASET_QUALITY_POLICY.md` - Quality standards
- `docs/01-core/DATASET_SEO_POLICY.md` - SEO integration
- `docs/adr/005-dataset-consolidation.md` - Architecture decision

### Schemas
- `schemas/dataset-material.json` - JSON schema for materials
- `schemas/dataset-contaminant.json` - JSON schema for contaminants
- `schemas/frontmatter-v5.0.0.json` - Frontmatter source schema
 (materials)
- `scripts/generate-contaminant-datasets.ts` - **Unified contaminant + compound generator** ✅ Updated Dec 26, 2025
- `scripts/datasets/merge-datasets.js` - Dataset consolidation utilities
- `scripts/generate-contaminant-datasets.ts` - Contaminant generator
- `scripts/datasets/merge-datasets.js` - Dataset consolidation

### Tests
- `tests/datasets/dataset-architecture.test.ts` - Architecture compliance
- `tests/datasets/quality-policy.test.ts` - Quality validation

---Implementation Status & Future Enhancements

### Phase 1: Compound Integration ✅ COMPLETE (Dec 26, 2025)
**Status**: Script updated, ready for backend generation  
**Completed**: 
1. ✅ Updated `scripts/generate-contaminant-datasets.ts` to process compounds
2. ✅ Script generates 396 files (132 datasets × 3 formats)
3. ✅ Unified output directory: `public/datasets/contaminants/`
4. ✅ Compounds treated as specialized contaminants for materials scientists

**Backend Command**: `npx ts-node scripts/generate-contaminant-datasets.ts`data into contaminant datasets where applicable

**Timeline**: 1-2 days

### Phase 2: Enhanced Relationships (Priority: MEDIUM)
- Link materials to compatible contaminants
- Cross-reference compounds in contamination datasets
- Material compatibility matrices

**Timeline**: 1 week

### Phase 3: Dataset API Endpoints (Priority: LOW)
- RESTful API for programmatic access
- Real-time dataset queries
- Batch download capabilities

**Timeline**: 2-3 weeks

---

## ✅ Success Criteria

**A dataset is considered complete when**:
1. ✅ All Tier 1 parameters have min/max values (8/8)
2. ✅ ≥80% Tier 2 properties present (8/10 minimum)
3. ✅ ≥20 variableMeasured entries
4. ✅ ≥3 valid citations with CreativeWork schema
5. ✅ 3 distribution formats available (JSON, CSV, TXT)
6. ✅ JSON schema validation passes
7. ✅ Embedded in page JSON-LD structured data
8. ✅ Listed on `/datasets` public catalog page

**System is healthy when**:
- All tests passing (`npm run test:datasets`)
- Zero schema validation errors
- Frontmatter sync status: UP TO DATE
- SEO validation score: A+ (95+/100)

---1  
**Status**: Production Ready  
**Generation Scripts**:
- Materials: `npm run datasets:generate` ✅ Operational
- Contaminants + Compounds: `npx ts-node scripts/generate-contaminant-datasets.ts` ✅ Ready for backend execution
**Last Updated**: December 26, 2025  
**Version**: 2.0  
**Status**: Production Ready (Materials complete, Compounds pending)
