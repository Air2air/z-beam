# Frontmatter Current Structure# Frontmatter Current Structure Report



**Last Updated:** November 4, 2025  **Date**: October 16, 2025  

**Version:** 2.2.0  **Status**: ✅ Verified and Up-to-Date

**Materials Count:** 132

---

This document describes the current frontmatter YAML structure used across all material files in `/frontmatter/materials/`. The structure was enhanced in November 2025 to support nested FAQ and micro formats, along with enriched property metadata.

## 📊 Structure Summary

---

### Material Properties (2 categories, 13 properties)

## Overview

#### 1. Laser-Material Interaction (7 properties)

Each material has a comprehensive YAML frontmatter file containing:- **laserAbsorption** - Percentage of laser energy absorbed

- **Basic metadata** (name, category, title, description)- **laserReflectivity** - Percentage of laser energy reflected (recalculated from absorption)

- **Author information** with credentials- **specificHeat** - Heat capacity

- **Image assets** (hero, micro images)- **thermalConductivity** - Heat transfer rate

- **Nested micro structure** (before/after treatment descriptions)- **thermalDiffusivity** - Thermal response rate

- **Regulatory standards** with organization details- **thermalExpansion** - Expansion coefficient

- **Enhanced material properties** (30+ properties with confidence intervals)- **thermalDegradationPoint** - Temperature threshold for material breakdown

- **Laser parameters** for cleaning operations

- **Machine settings** for equipment configuration#### 2. Material Characteristics (6 properties)

- **Nested FAQ structure** (9 questions per material)- **density** - Mass per unit volume

- **Metadata** for voice and content type- **waterSolubility** OR **oxidationResistance** OR **electricalResistivity** - Material-specific property

- **hardness** - Resistance to deformation

---- **tensileStrength** - Maximum tensile stress

- **youngsModulus** - Elastic modulus

## Core Structure- **compressiveStrength** - Maximum compressive stress



### Basic Metadata### Machine Settings (9 parameters)

1. **powerRange** - Laser power (W)

```yaml2. **wavelength** - Laser wavelength (nm)

name: Titanium3. **spotSize** - Beam diameter (μm)

category: Metal4. **repetitionRate** - Pulse frequency (kHz)

subcategory: specialty5. **pulseWidth** - Pulse duration (ns)

title: Titanium Laser Cleaning6. **scanSpeed** - Scanning velocity (mm/s)

description: Laser cleaning parameters and specifications for Titanium
7. **fluence** - Energy density (J/cm²)

8. **overlapRatio** - Beam overlap percentage (%)

```9. **passCount** - Number of cleaning passes



**Fields:**---

- `name` - Material common name (title case)

- `category` - Primary category (Metal, Ceramic, Polymer, Composite, Rare-Earth)## ✅ Recent Updates (October 16, 2025)

- `subcategory` - Secondary classification (specialty, structural, etc.)

- `title` - Full page title### Physical Constraint Fixes Applied

- `subtitle` - Descriptive subtitle**Issue**: Many materials had `absorption + reflectivity > 100%` (physically impossible)

- `description` - SEO meta description

**Fix**: Automatic recalculation applied to all materials

---```yaml

laserReflectivity: 100 - laserAbsorption

### Author Information```



```yaml**Examples**:

author:- **Alabaster**: 

  id: 1  - Before: absorption 85% + reflectivity 38.7% = 123.7% ❌

  name: Yi-Chun Lin  - After: absorption 85% + reflectivity 15% = 100% ✅

  country: Taiwan  

  title: Ph.D.- **Platinum**:

  sex: f  - Before: absorption 36.5% + reflectivity 73.2% = 109.7% ❌

  expertise: Laser Materials Processing  - After: absorption 36.5% + reflectivity 63.5% = 100% ✅

  image: /images/author/yi-chun-lin.jpg

```### Metadata Added

All corrected values include verification metadata:

**Fields:**```yaml

- `id` - Author unique identifiermetadata:

- `name` - Full name  last_verified: '2025-10-16T13:38:58.402919'

- `country` - Country of origin  verification_source: automatic_fix

- `title` - Academic/professional title  fix_reason: 'Recalculated: 100 - 85.0 = 15.0'

- `sex` - Gender (m/f)  previous_value: 38.7

- `expertise` - Area of specialization```

- `image` - Author headshot path

---

---

## 🔍 Verification Results

### Image Assets

### ✅ Alabaster (Sample Material)

```yaml**Category**: Stone → Mineral

images:

  hero:**Laser-Material Interaction** (7/7 properties):

    alt: Titanium surface during precision laser cleaning process- ✅ laserAbsorption: 85.0%

    url: /images/material/titanium-laser-cleaning-hero.jpg- ✅ laserReflectivity: 15.0% (recalculated)

  micro:- ✅ specificHeat: 830.0 J/(kg·K)

    alt: Titanium surface at 500x magnification comparing states- ✅ thermalConductivity: 0.35 W/(m·K)

    url: /images/material/titanium-laser-cleaning-micro.jpg- ✅ thermalDiffusivity: 0.18 mm²/s (recalculated)

```- ✅ thermalExpansion: 25.0 × 10⁻⁶/K

- ✅ thermalDegradationPoint: 1073.15 K

**Structure:**

- `hero` - Full-width hero image for page header**Material Characteristics** (6/6 properties):

- `micro` - Microscopic before/after comparison image- ✅ density: 2.32 g/cm³

- Each image has `alt` text for accessibility and `url` path- ✅ waterSolubility: 2.41 g/L

- ✅ hardness: 2.0 Mohs

---- ✅ tensileStrength: 3.5 MPa

- ✅ youngsModulus: 31.0 GPa

### Micro Structure (Nested)- ✅ compressiveStrength: 45 MPa



**NEW in v2.2.0** - Micros now use nested `before` and `after` fields:**Machine Settings** (9/9 parameters):

- ✅ powerRange: 90 W

```yaml- ✅ wavelength: 1064 nm

micro:- ✅ spotSize: 80 μm

  before: This titanium surface shows significant contamination with scattered - ✅ repetitionRate: 50 kHz

    particulate deposits. The contaminants appear as irregular clusters...- ✅ pulseWidth: 12 ns

  after: The cleaned titanium surface reveals its original metallic luster. - ✅ scanSpeed: 500 mm/s

    All contaminants are removed...- ✅ fluence: 3.5 J/cm²

  author: Yi-Chun Lin- ✅ overlapRatio: 40%

  character_count:- ✅ passCount: 3 passes

    after: 145

    before: 433### ✅ Platinum (Sample Material)

  generated: '2025-10-27T11:06:57.204014Z'**Category**: Metal → Precious

  generation_method: ai_research

  word_count:**Laser-Material Interaction** (7/7 properties):

    after: 20- ✅ laserAbsorption: 36.5%

    before: 52- ✅ laserReflectivity: 63.5% (recalculated)

```- ✅ specificHeat: 133.0 J/(kg·K)

- ✅ thermalConductivity: 71.6 W/(m·K)

**Fields:**- ✅ thermalDiffusivity: 25.9 mm²/s

- `before` - Surface condition before laser treatment (detailed description)- ✅ thermalExpansion: 8.8 × 10⁻⁶/K

- `after` - Surface condition after laser treatment (results description)- ✅ (thermalDegradationPoint present but not shown in excerpt)

- `author` - Micro author name

- `character_count` - Text length metrics (before/after)**Material Characteristics** (6/6 properties):

- `generated` - ISO 8601 timestamp of generation- ✅ density: 21.45 g/cm³

- `generation_method` - Source of micro content- ✅ oxidationResistance: 1000.0 °C (metal-specific)

- `word_count` - Word count metrics (before/after)- ✅ electricalResistivity: 1.06e-07 Ω·m (metal-specific)

- ✅ hardness: 41.0 HV

**Usage:** The Micro component extracts `micro.before` and `micro.after` for display.- ✅ tensileStrength: 125 MPa

- ✅ (youngsModulus and compressiveStrength present but not shown)

---

---

### Regulatory Standards

## 📋 Property Specifications

```yaml

regulatoryStandards:### Each Property Includes:

- FDA 21 CFR 1040.10 - Laser Product Performance Standards```yaml

- ANSI Z136.1 - Safe Use of LaserspropertyName:

- IEC 60825 - Safety of Laser Products  value: <numeric>

- OSHA 29 CFR 1926.95 - Personal Protective Equipment  unit: <string>

- description: ANSI Z136.1 - Safe Use of Lasers  confidence: <0-100>

  image: /images/logo/logo-org-ansi.png  description: <string>

  longName: American National Standards Institute  min: <numeric>

  name: ANSI  max: <numeric>

  url: https://webstore.ansi.org/standards/lia/ansiz1362022  source: <optional - reference>

- description: IEC 60825 - Safety of Laser Products  notes: <optional - context>

  image: /images/logo/logo-org-iec.png  metadata: <optional - verification data>

  longName: International Electrotechnical Commission```

  name: IEC

  url: https://webstore.iec.ch/en/publication/3587### Confidence Levels:

```- **95-100**: High confidence (direct measurement/authoritative source)

- **90-94**: Good confidence (reliable literature)

**Structure:** Mixed array of strings and objects for regulatory information.- **85-89**: Moderate confidence (calculated or interpolated)

- **80-84**: Lower confidence (estimated or material-dependent)

---

---

## Enhanced Material Properties

## 🎯 Search Compatibility

**NEW in v2.2.0** - Properties now include confidence intervals, min/max ranges, and source attribution:

### Dynamic Category Detection ✅

### Property FormatThe search system now dynamically detects categories by structure:

```typescript

Each property uses this enhanced structure:const hasCategoryStructure = 

  data.hasOwnProperty('label') && 

```yaml  data.hasOwnProperty('properties') && 

propertyName:  typeof data.properties === 'object';

  value: 110.0```

  unit: GPa

  confidence: 100**Benefits**:

  source: ai_research- ✅ Works with current 2 categories

  min: 5.0- ✅ Will automatically work with future category additions

  max: 600.0- ✅ No hardcoded category list to maintain

```- ✅ Supports any property structure



**Fields:**### Numeric Property Matching ✅

- `value` - Measured or calculated property valueImproved decimal handling:

- `unit` - Physical unit (SI preferred)```typescript

- `confidence` - Confidence level (0-100%)const searchNum = parseFloat(searchVal.match(/[\d.]+/)?.[0] || searchVal);

- `source` - Data source identifierconst propNum = parseFloat(actualVal.match(/[\d.]+/)?.[0] || actualVal);

- `min` - Minimum value in material class rangeconst tolerance = Math.max(Math.abs(searchNum * 0.1), 0.1);

- `max` - Maximum value in material class range```



### Material Characteristics Category**Benefits**:

- ✅ Preserves decimals correctly (was broken: "38.7" → "387")

30+ properties organized under `materialProperties.material_characteristics`:- ✅ 10% tolerance for approximate matching

- ✅ Handles units properly ("85.0 %" → 85.0)

```yaml

materialProperties:---

  material_characteristics:

    label: Material Characteristics## 🔧 Data Quality Notes

    description: Intrinsic physical, mechanical, chemical properties

    ### Sources Added

    # Thermal PropertiesMany properties now include authoritative sources:

    thermalDestruction:- Handbook of Optical Constants of Solids (Palik, 1998)

      value: 1941.0- MatWeb Materials Database

      unit: K- Engineering ToolBox

      confidence: 100- ASM Metals Handbook

      source: ai_research- Geological Survey Optical Properties Database

      min: 273.0

      max: 3695.0### Material-Specific Properties

    The 3rd property in `material_characteristics` varies by material type:

    specificHeat:- **Stones**: waterSolubility

      value: 522.0- **Metals**: oxidationResistance, electricalResistivity

      unit: J/kg·K- **Polymers**: meltingPoint, glassTransitionTemp

      confidence: 100- **Ceramics**: brittleness, porosity

      source: ai_research

      min: 100.0This is **intentional** and reflects the different characteristics that matter for each material category.

      max: 2000.0

    ---

    thermalConductivity:

      value: 21.9## ✅ Status: All Systems Operational

      unit: W/m·K

      confidence: 100### Frontmatter Structure

      source: ai_research- ✅ 13 material properties (7 + 6) fully populated

      min: 7.0- ✅ 9 machine settings fully populated

      max: 430.0- ✅ Physical constraints validated (absorption + reflectivity = 100%)

    - ✅ Sources and confidence levels added

    thermalExpansion:

      value: 8.6e-06### Search Functionality

      unit: K^{-1}- ✅ Dynamic category detection working

      confidence: 100- ✅ Numeric matching fixed and tested

      source: ai_research- ✅ Property extraction working for all structures

      min: 0.5- ✅ MetricsCard search URLs generating correctly

      max: 33.0

    ### Known Non-Issues

    thermalDiffusivity:- ❓ `laserReflectivity = 97` search returns no results

      value: 9.29e-06  - **Expected**: No material in the database has this value

      unit: m²/s  - **Not a bug**: Search is working correctly

      confidence: 99

      source: ai_research---

      min: 0.06

      max: 174.0## 📚 Related Documentation

    - [Frontmatter Value Investigation](../FRONTMATTER_VALUE_INVESTIGATION.md) - Investigation prompt for data team

    # Mechanical Properties- [Search Code Analysis](SEARCH_CODE_ANALYSIS.md) - Search functionality assessment

    youngsModulus:- [Codebase Cleanup](CODEBASE_CLEANUP_OPPORTUNITIES.md) - Recent cleanup work

      value: 110.0

      unit: GPa
      confidence: 100
      source: ai_research
      min: 5.0
      max: 600.0
    
    hardness:
      value: 160.0
      unit: HV
      confidence: 95
      source: ai_research
      min: 0.2
      max: 3500.0
    
    tensileStrength:
      value: 345.0
      unit: MPa
      confidence: 95
      source: ai_research
      min: 3.0
      max: 3000.0
    
    compressiveStrength:
      value: 414.0
      unit: MPa
      confidence: 95
      source: ai_research
      min: 50.0
      max: 2000.0
    
    flexuralStrength:
      value: 345.0
      unit: MPa
      confidence: 95
      source: ai_research
      min: 2.5
      max: 1050.0
    
    fractureToughness:
      value: 55.0
      unit: MPa√m
      confidence: 95
      source: ai_research
      min: 20.0
      max: 200.0
    
    # Optical Properties
    laserReflectivity:
      value: 0.66
      unit: dimensionless
      confidence: 95
      source: ai_research
      min: 5.0
      max: 99.9
    
    laserAbsorption:
      value: 0.42
      unit: dimensionless
      confidence: 95
      source: ai_research
      min: 0.02
      max: 100.0
    
    absorptivity:
      value: 0.36
      unit: dimensionless
      confidence: 95
      source: ai_research
      min: 0.01
      max: 0.95
    
    ablationThreshold:
      value: 1.5
      unit: J/cm²
      confidence: 95
      source: ai_research
      min: 0.8
      max: 8.0
    
    # Chemical Properties
    oxidationResistance:
      value: 698.0
      unit: K
      confidence: 95
      source: ai_research
      min: 200.0
      max: 1200.0
    
    corrosionResistance:
      value: 0.001
      unit: mm/year
      confidence: 95
      source: ai_research
      min: 0.01
      max: 10.0
    
    # Physical Properties
    density:
      value: 4510.0
      unit: kg/m³
      confidence: 100
      source: ai_research
      min: 0.53
      max: 22.6
    
    porosity:
      value: 0.0
      unit: fraction
      confidence: 100
      source: ai_research
      min: 0.0
      max: 15.0
    
    electricalResistivity:
      value: 4.2e-07
      unit: Ω·m
      confidence: 100
      source: ai_research
      min: 1.0e-08
      max: 1.5e-06
```

**Total Properties:** 30+ per material, each with full metadata including confidence intervals and source attribution.

---

## Laser Parameters

```yaml
laserParameters:
  wavelength:
    description: Optimal wavelength for Titanium cleaning
    unit: nm
    value: 1064
    min: 532
    max: 10600
  
  power:
    description: Recommended laser power for safe Titanium cleaning
    unit: W
    value: 100
    min: 50
    max: 500
  
  fluence:
    description: Safe energy density for Titanium surface treatment
    unit: J/cm²
    value: 2.5
    min: 0.5
    max: 10
  
  pulseWidth:
    description: Optimal pulse duration for Titanium contaminant removal
    unit: ns
    value: 100
    min: 20
    max: 500
  
  frequency:
    description: Pulse repetition rate for efficient Titanium cleaning
    unit: kHz
    value: 50
    min: 10
    max: 200
```

**Structure:** Each laser parameter includes value, unit, description, and min/max ranges.

---

## Machine Settings

```yaml
machineSettings:
  scanSpeed:
    description: Optimal scan speed for Titanium cleaning
    unit: mm/s
    value: 500
    min: 100
    max: 2000
  
  spotSize:
    description: Beam diameter for precise Titanium treatment
    unit: μm
    value: 50
    min: 10
    max: 200
  
  numberOfPasses:
    description: Recommended cleaning passes for Titanium
    unit: passes
    value: 3
    min: 1
    max: 10
  
  overlapRatio:
    description: Optimal beam overlap for complete surface coverage
    unit: '%'
    value: 50
    min: 10
    max: 90
```

**Structure:** Machine configuration parameters with optimal values and valid ranges.

---

## FAQ Structure (Nested)

**NEW in v2.2.0** - FAQs now use nested `questions` array:

```yaml
faq:
  questions:
  - question: Why is Titanium chosen for its main applications?
    answer: Titanium is selected for aerospace and chemical applications due to 
      its exceptional strength-to-weight ratio and outstanding corrosion resistance...
    word_count: 30
  
  - question: Can laser cleaning damage Titanium?
    answer: Yes, laser cleaning can damage titanium if the fluence exceeds 
      approximately 2.5 J/cm²...
    word_count: 40
  
  # ... 7 more questions (9 total per material)
```

**Structure:**
- `faq.questions` - Array of question/answer pairs
- Each question includes:
  - `question` - Question text (string)
  - `answer` - Detailed answer (string)
  - `word_count` - Answer word count (integer)

**Count:** 9 questions per material standard across all 132 materials.

**Usage:** The Layout component extracts `faq.questions` array for display with MaterialFAQ component.

---

## Metadata Section

```yaml
_metadata:
  voice:
    author_name: Yi-Chun Lin
    author_country: Taiwan
    voice_applied: true
    content_type: material
```

**Fields:**
- `author_name` - Author name for voice attribution
- `author_country` - Country for localization
- `voice_applied` - Boolean indicating voice processing
- `content_type` - Content classification

---

## File Naming Convention

All material files follow strict naming:

```
{material-name}-laser-cleaning.yaml
```

**Examples:**
- `titanium-laser-cleaning.yaml`
- `stainless-steel-laser-cleaning.yaml`
- `aluminum-alloy-laser-cleaning.yaml`

**Rules:**
- Lowercase only
- Hyphens for multi-word names
- Must end with `-laser-cleaning.yaml`
- No underscores or spaces

---

## Schema.org Integration

Material properties are exported to datasets with Schema.org `variableMeasured` fields:

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "name": "thermalConductivity",
      "value": 21.9,
      "unitText": "W/m·K",
      "minValue": 7.0,
      "maxValue": 430.0
    }
  ]
}
```

**Generation:** Dataset files are created by `scripts/generate-datasets.ts` in JSON, CSV, and TXT formats.

---

## Migration Notes

### From v2.1.0 to v2.2.0 (November 2025)

**FAQ Structure Change:**
```yaml
# Old (flat array)
faq:
  - question: "..."
    answer: "..."

# New (nested)
faq:
  questions:
    - question: "..."
      answer: "..."
```

**Micro Structure Change:**
```yaml
# Old (flat fields)
before_text: "..."
after_text: "..."

# New (nested)
micro:
  before: "..."
  after: "..."
```

**Property Enhancement:**
```yaml
# Old (simple value)
thermalConductivity: 21.9

# New (enhanced metadata)
thermalConductivity:
  value: 21.9
  unit: W/m·K
  confidence: 100
  source: ai_research
  min: 7.0
  max: 430.0
```

**Component Updates:**
- `Layout.tsx` - Updated FAQ extraction logic
- `Micro.tsx` - Integrated parsed micro data
- `generate-datasets.ts` - Enhanced property export

---

## Validation

All materials are validated against this structure:

- **Naming validation** - `validate-naming-e2e.js`
- **Metadata validation** - `validate-metadata.js`
- **Property validation** - Type checking in dataset generation
- **FAQ validation** - `tests/components/Layout-faq-structure.test.tsx`
- **Micro validation** - `tests/components/MicroContentValidation.test.ts`

**Build Status:** All 132 materials pass validation with 0 errors.

---

## Dataset Generation

The `scripts/generate-datasets.ts` script processes frontmatter and generates:

- **JSON files** - Machine-readable with Schema.org metadata (132 files)
- **CSV files** - Spreadsheet-compatible property tables (132 files)
- **TXT files** - Human-readable summaries (132 files)
- **Index file** - Master catalog `index.json` (1 file)

**Total:** 396 generated dataset files + 1 index = 397 files

**Location:** `/public/datasets/materials/`

---

## Related Documentation

- `docs/CHANGELOG.md` - Version history and changes
- `docs/architecture/LAYOUT_STANDARDIZATION.md` - Layout width decisions
- `docs/NAMING_NORMALIZATION_EVALUATION.md` - Naming conventions
- `tests/components/Layout-faq-structure.test.tsx` - FAQ structure tests
- `tests/components/MicroContentValidation.test.ts` - Micro validation tests

---

**Maintained by:** Z-Beam Development Team  
**Contact:** See `docs/README.md` for documentation index
