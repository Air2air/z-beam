# Contaminant Dataset Format Specification

**Version:** 1.0  
**Date:** December 16, 2025  
**Status:** ✅ Implemented and Active

## Overview

Contaminant datasets provide comprehensive data about laser cleaning contaminants including safety hazards, removal techniques, and detection methods. All datasets follow **Schema.org Dataset** standards and are available in three formats for different use cases.

## Format Summary

| Format | Purpose | Size Range | Primary Users |
|--------|---------|------------|---------------|
| **CSV** | Machine-readable, tabular data | 1-2 KB | Data analysis, spreadsheet import |
| **JSON** | Structured data with metadata | 8-10 KB | API integration, Schema.org compliance |
| **TXT** | Human-readable summary | 2-3 KB | Quick reference, documentation |

**Total Files:** 297 (99 contaminants × 3 formats)  
**Naming Pattern:** `{contaminant-slug}-contamination.{format}`  
**Example:** `rust-oxidation-contamination.{csv,json,txt}`

---

## CSV Format Specification

### Purpose
Tabular data for spreadsheet analysis, data science workflows, and quick comparisons.

### Structure
```csv
Property,Value
Name,"Rust / Iron Oxide Formation"
Category,"oxidation"
Subcategory,"ferrous"
Description,"[Multi-paragraph description...]"
SAFETY INFORMATION,
Fire/Explosion Risk,"low"
Toxic Gas Risk,"low"
Visibility Hazard,"moderate"
Respiratory Protection,"half_mask"
Eye Protection,"goggles"
Skin Protection,"gloves"
LASER PARAMETERS,
Wavelength Range (nm),"532-1064"
Pulse Duration (ns),"10-100"
Fluence Range (J/cm²),"1-5"
Recommended Power (W),"50-150"
```

### Required Fields
- **Name** - Official contaminant name
- **Category** - Primary classification (oxidation, coating, organic, etc.)
- **Subcategory** - Secondary classification
- **Description** - Multi-paragraph explanation
- **Safety Information** - Fire, toxic gas, visibility hazards
- **PPE Requirements** - Respiratory, eye, skin protection
- **Laser Parameters** - Wavelength, pulse duration, fluence, power

### File Size
- Target: **1-2 KB**
- Actual Range: **900 bytes - 2 KB**

### Encoding
- **UTF-8** with BOM for Excel compatibility
- **Line Endings:** CRLF (`\r\n`) for Windows/Excel
- **Quotes:** All text fields enclosed in double quotes

---

## JSON Format Specification

### Purpose
Structured data with full metadata, Schema.org compliance, and API integration.

### Structure
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Rust / Iron Oxide Formation Contamination Data",
  "description": "[Multi-paragraph description...]",
  "url": "https://www.z-beam.com/contaminants/oxidation/ferrous/rust-oxidation-contamination",
  "identifier": "contaminant-rust-oxidation-contamination",
  "keywords": ["rust", "iron oxide", "ferrous oxidation", "corrosion"],
  "variableMeasured": [
    "Fire/Explosion Risk Level",
    "Toxic Gas Risk Level",
    "Visibility Hazard Level",
    "PPE Requirements"
  ],
  "measurementTechnique": [
    "Laser-induced breakdown spectroscopy (LIBS)",
    "Safety hazard assessment",
    "Fume generation analysis"
  ],
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://www.z-beam.com/datasets/contaminants/rust-oxidation-contamination.json",
      "name": "Rust / Iron Oxide Formation - JSON Format"
    },
    {
      "@type": "DataDownload",
      "encodingFormat": "text/csv",
      "contentUrl": "https://www.z-beam.com/datasets/contaminants/rust-oxidation-contamination.csv",
      "name": "Rust / Iron Oxide Formation - CSV Format"
    },
    {
      "@type": "DataDownload",
      "encodingFormat": "text/plain",
      "contentUrl": "https://www.z-beam.com/datasets/contaminants/rust-oxidation-contamination.txt",
      "name": "Rust / Iron Oxide Formation - Text Format"
    }
  ],
  "creator": {
    "@type": "Organization",
    "name": "Z-Beam Technical Team",
    "url": "https://www.z-beam.com/about"
  },
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "datePublished": "2025-12-16",
  "dateModified": "2025-12-16",
  
  "contamination": {
    "name": "Rust / Iron Oxide Formation",
    "slug": "rust-oxidation-contamination",
    "category": "oxidation",
    "subcategory": "ferrous",
    "description": "[Full description...]"
  },
  
  "safetyData": {
    "fire_explosion_risk": "low",
    "toxic_gas_risk": "low",
    "visibility_hazard": "moderate",
    "fumes_generated": [
      {
        "compound": "Iron Oxide Fume",
        "concentration_mg_m3": 5,
        "exposure_limit_mg_m3": 5,
        "hazard_class": "irritant"
      }
    ],
    "particulate_generation": {
      "respirable_fraction": 0.8,
      "size_range_um": [0.1, 10]
    },
    "ppe_requirements": {
      "eye_protection": "goggles",
      "respiratory": "half_mask",
      "skin_protection": "gloves"
    },
    "substrate_compatibility_warnings": [
      "Avoid laser cleaning on painted surfaces containing lead",
      "Check for galvanized coatings that may produce zinc oxide fume"
    ],
    "ventilation_requirements": {
      "exhaust_velocity_m_s": 0.5,
      "filtration_type": "HEPA",
      "minimum_air_changes_per_hour": 10
    }
  },
  
  "laserProperties": {
    "laser_parameters": {
      "wavelength_range_nm": [532, 1064],
      "pulse_duration_ns": [10, 100],
      "fluence_range_j_cm2": [1, 5],
      "recommended_power_w": [50, 150],
      "pulse_frequency_khz": [10, 50]
    },
    "removal_efficiency": {
      "single_pass_removal": 0.85,
      "typical_passes_required": 2,
      "surface_roughness_post_cleaning_um": 1.5
    }
  },
  
  "detectionMethods": {
    "visual_indicators": [
      "Reddish-brown discoloration",
      "Flaky or powdery texture",
      "Surface pitting"
    ],
    "instrumental_methods": [
      "X-ray fluorescence (XRF)",
      "Laser-induced breakdown spectroscopy (LIBS)"
    ]
  }
}
```

### Required Top-Level Fields
- **@context** - Schema.org context
- **@type** - "Dataset"
- **name** - Dataset title
- **description** - Comprehensive description
- **url** - Contaminant page URL
- **identifier** - Unique ID
- **distribution** - All 3 download formats
- **creator** - Organization info
- **license** - CC BY 4.0 URL
- **datePublished** - Publication date
- **dateModified** - Last update date

### Required Nested Objects
- **contamination** - Core contaminant data
- **safetyData** - Safety hazards and PPE
- **laserProperties** - Laser parameters and efficiency
- **detectionMethods** - How to identify contaminant

### File Size
- Target: **8-12 KB**
- Actual Range: **8-10 KB**

### Encoding
- **UTF-8** without BOM
- **Indentation:** 2 spaces
- **Line Endings:** LF (`\n`)

---

## TXT Format Specification

### Purpose
Human-readable summary for quick reference, documentation, and technical reports.

### Structure
```
==============================================================================
                Rust / Iron Oxide Formation - Contamination Dataset
==============================================================================

Category: oxidation
Subcategory: ferrous
URL: https://www.z-beam.com/contaminants/oxidation/ferrous/rust-oxidation-contamination

DESCRIPTION
------------------------------------------------------------------------------
[Multi-paragraph description formatted for readability...]

SAFETY INFORMATION
------------------------------------------------------------------------------
Fire/Explosion Risk: low
Toxic Gas Risk: low
Visibility Hazard: moderate

PPE REQUIREMENTS:
  • Respiratory: half_mask
  • Eye Protection: goggles
  • Skin Protection: gloves

VENTILATION:
  • Filtration Type: HEPA
  • Air Changes/Hour: 10
  • Exhaust Velocity: 0.5 m/s

FUMES GENERATED:
  • Iron Oxide Fume: 5 mg/m³ (limit: 5 mg/m³) - irritant
  • Ozone: 0.1 mg/m³ (limit: 0.1 mg/m³) - irritant

LASER PARAMETERS
------------------------------------------------------------------------------
Wavelength Range: 532-1064 nm
Pulse Duration: 10-100 ns
Fluence Range: 1-5 J/cm²
Recommended Power: 50-150 W
Pulse Frequency: 10-50 kHz

REMOVAL EFFICIENCY:
  • Single-Pass Removal: 85%
  • Typical Passes Required: 2
  • Post-Cleaning Roughness: 1.5 µm

DETECTION METHODS
------------------------------------------------------------------------------
VISUAL INDICATORS:
  • Reddish-brown discoloration
  • Flaky or powdery texture
  • Surface pitting

INSTRUMENTAL METHODS:
  • X-ray fluorescence (XRF)
  • Laser-induced breakdown spectroscopy (LIBS)

SUBSTRATE COMPATIBILITY WARNINGS
------------------------------------------------------------------------------
  • Avoid laser cleaning on painted surfaces containing lead or chromates
  • Ensure substrate is free of oils that may produce toxic fumes
  • Check for galvanized coatings that may produce zinc oxide fume

==============================================================================
Generated: 2025-12-16
License: Creative Commons Attribution 4.0 International
Source: Z-Beam Technical Team
==============================================================================
```

### Required Sections
1. **Header** - Title with decoration
2. **Metadata** - Category, subcategory, URL
3. **Description** - Multi-paragraph explanation
4. **Safety Information** - Hazards and PPE
5. **Laser Parameters** - Wavelength, power, efficiency
6. **Detection Methods** - Visual and instrumental
7. **Footer** - Date, license, source

### Formatting Rules
- **Header/Footer:** 78 characters wide (`=` symbols)
- **Section Dividers:** 78 characters wide (`-` symbols)
- **Bullet Points:** Use `•` (U+2022) for lists
- **Indentation:** 2 spaces for nested items
- **Line Width:** 78 characters maximum for readability
- **Blank Lines:** One blank line between sections

### File Size
- Target: **2-3 KB**
- Actual Range: **1.8-2.5 KB**

### Encoding
- **UTF-8** without BOM
- **Line Endings:** LF (`\n`)

---

## Naming Conventions

### File Naming Pattern
```
{contaminant-slug}-contamination.{format}
```

### Examples
```
rust-oxidation-contamination.csv
rust-oxidation-contamination.json
rust-oxidation-contamination.txt

adhesive-residue-contamination.csv
adhesive-residue-contamination.json
adhesive-residue-contamination.txt

aluminum-oxidation-contamination.csv
aluminum-oxidation-contamination.json
aluminum-oxidation-contamination.txt
```

### Slug Generation Rules
1. **Lowercase only** - All characters lowercase
2. **Hyphens** - Replace spaces with hyphens
3. **Remove special chars** - Strip `/`, `()`, etc.
4. **Suffix** - Always end with `-contamination`

### Category Structure
```
contaminants/
├── oxidation/
│   ├── ferrous/
│   │   └── rust-oxidation-contamination.{csv,json,txt}
│   ├── non-ferrous/
│   │   └── aluminum-oxidation-contamination.{csv,json,txt}
│   └── general/
├── coating/
│   ├── paint/
│   └── protective/
├── organic/
│   ├── biological/
│   │   └── algae-growth-contamination.{csv,json,txt}
│   └── residue/
│       └── adhesive-residue-contamination.{csv,json,txt}
└── particulate/
```

---

## Data Quality Standards

### Safety Data Requirements
- **Hazard Levels:** Must use controlled vocabulary: `low`, `moderate`, `high`, `extreme`
- **PPE:** Must specify all three types: respiratory, eye, skin
- **Fumes:** Each compound requires concentration, limit, and hazard class
- **Ventilation:** Must include filtration type, air changes, exhaust velocity

### Laser Parameter Requirements
- **Wavelength:** Range in nm (e.g., `[532, 1064]`)
- **Pulse Duration:** Range in ns
- **Fluence:** Range in J/cm²
- **Power:** Recommended range in W
- **Efficiency:** Must include single-pass removal percentage

### Description Quality
- **Length:** 400-600 words
- **Structure:** 5 paragraphs minimum
- **Content:** Must cover formation, behavior, removal challenges, laser effectiveness
- **Style:** Technical but accessible, human-written voice

### Validation Rules
1. **JSON:** Must validate against Schema.org Dataset schema
2. **CSV:** Must parse without errors, all rows have 2 columns
3. **TXT:** Must be 78 characters wide, proper section structure
4. **Cross-Format:** All 3 formats must contain identical core data

---

## Comparison with Material Datasets

| Aspect | Material Datasets | Contaminant Datasets |
|--------|-------------------|----------------------|
| **Formats** | CSV, JSON, TXT | CSV, JSON, TXT |
| **Suffix** | `-laser-cleaning` | `-contamination` |
| **Size (JSON)** | 18-25 KB | 8-12 KB |
| **Size (CSV)** | 3-5 KB | 1-2 KB |
| **Size (TXT)** | 5-7 KB | 2-3 KB |
| **Schema.org** | ✅ Dataset | ✅ Dataset |
| **Primary Focus** | Material properties | Safety & removal |
| **Key Data** | Thermal, optical, mechanical | Hazards, PPE, detection |
| **Word Count** | 800-1200 words | 400-600 words |

### Key Differences
1. **Contaminants are smaller** - Focus on safety, not material science
2. **Different properties** - Safety hazards vs thermal conductivity
3. **Detection methods** - Visual + instrumental identification
4. **PPE requirements** - Critical for operator safety
5. **Substrate warnings** - Compatibility with different materials

---

## Usage Examples

### Loading JSON Data
```javascript
// Fetch contaminant dataset
const response = await fetch('/datasets/contaminants/rust-oxidation-contamination.json');
const dataset = await response.json();

// Access safety data
const fireRisk = dataset.safetyData.fire_explosion_risk; // "low"
const ppe = dataset.safetyData.ppe_requirements;
console.log(`Respiratory: ${ppe.respiratory}`); // "half_mask"

// Access laser parameters
const wavelength = dataset.laserProperties.laser_parameters.wavelength_range_nm;
console.log(`Wavelength: ${wavelength[0]}-${wavelength[1]} nm`); // "532-1064 nm"
```

### Parsing CSV Data
```python
import csv

with open('rust-oxidation-contamination.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['Property'] == 'Fire/Explosion Risk':
            print(f"Fire Risk: {row['Value']}")  # "low"
```

### Reading TXT Format
```bash
# Extract safety information
grep -A 10 "SAFETY INFORMATION" rust-oxidation-contamination.txt

# Extract laser parameters
grep -A 8 "LASER PARAMETERS" rust-oxidation-contamination.txt
```

---

## File Locations

### Public Directory Structure
```
public/datasets/contaminants/
├── adhesive-residue-contamination.csv (1.9K)
├── adhesive-residue-contamination.json (10K)
├── adhesive-residue-contamination.txt (2.3K)
├── algae-growth-contamination.csv (1.8K)
├── algae-growth-contamination.json (9.9K)
├── algae-growth-contamination.txt (2.3K)
├── rust-oxidation-contamination.csv (966B)
├── rust-oxidation-contamination.json (8.3K)
└── rust-oxidation-contamination.txt (1.8K)
```

### URL Structure
```
https://www.z-beam.com/datasets/contaminants/{slug}.{format}

Examples:
https://www.z-beam.com/datasets/contaminants/rust-oxidation-contamination.json
https://www.z-beam.com/datasets/contaminants/rust-oxidation-contamination.csv
https://www.z-beam.com/datasets/contaminants/rust-oxidation-contamination.txt
```

---

## License & Attribution

All contaminant datasets are licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)** with additional disclaimers and liability limitations.

**Terms:**
- ✅ Free to share and adapt
- ✅ Commercial use permitted
- ✅ Must provide attribution to Z-Beam Technical Team
- ✅ Must link to license: https://creativecommons.org/licenses/by/4.0/

**Attribution Example:**
```
Data source: Z-Beam Contaminant Dataset
Author: Z-Beam Technical Team
URL: https://www.z-beam.com/datasets/contaminants/
License: CC BY 4.0 with Disclaimer
```

---

## Legal Disclaimer and Liability Limitation

### DISCLAIMER

**This data is provided for informational and educational purposes only, without any warranties, express or implied.** Z-Beam makes no representations regarding the accuracy, completeness, or suitability of this information for any particular purpose. Use of this data is at your own risk. Z-Beam assumes no liability for any damages, injuries, or losses arising from the application or interpretation of this data.

### NO WARRANTY

**THIS DATA IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND**, either express or implied, including but not limited to the implied warranties of merchantability and fitness for a particular purpose.

### LIMITATION OF LIABILITY

**IN NO EVENT SHALL Z-BEAM BE LIABLE** for any direct, indirect, incidental, special, exemplary, or consequential damages arising from the use of this data.

### PROFESSIONAL CONSULTATION REQUIRED

This data should **NOT be used as the sole basis for operational decisions**. Always:
- ✅ Consult with qualified laser safety professionals
- ✅ Follow all applicable regulations (ANSI Z136, IEC 60825, OSHA)
- ✅ Conduct proper risk assessments
- ✅ Verify parameters through qualified testing
- ✅ Use appropriate personal protective equipment (PPE)

**Complete Terms:** See [docs/DATASET_USAGE_TERMS.md](docs/DATASET_USAGE_TERMS.md)

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **CSV Format** | ✅ Complete | 297 files generated |
| **JSON Format** | ✅ Complete | Schema.org compliant |
| **TXT Format** | ✅ Complete | Human-readable summaries |
| **Naming Convention** | ✅ Complete | `-contamination` suffix |
| **Safety Data** | ✅ Complete | PPE, hazards, ventilation |
| **Laser Parameters** | ✅ Complete | Wavelength, power, efficiency |
| **Detection Methods** | ✅ Complete | Visual + instrumental |
| **Schema.org Validation** | ✅ Complete | Dataset schema passes |

---

## Related Documentation

- **Material Datasets:** `MATERIAL_DATASET_FORMAT_SPECIFICATION.md` (similar structure)
- **Settings Datasets:** `SETTINGS_DATASET_FORMAT_SPECIFICATION.md` (JSON + TXT only)
- **Frontmatter Generation:** `FRONTMATTER_GENERATOR_RULES.md` (source data for datasets)
- **Schema Factory:** `app/utils/schemas/SchemaFactory.ts` (generates JSON-LD schemas)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **1.0** | 2025-12-16 | Initial specification based on existing implementation |

---

**Document Status:** ✅ Complete  
**Last Updated:** December 16, 2025  
**Maintained By:** Z-Beam Technical Team
