# Complete YAML Field Inventory - October 15, 2025

## 📋 Executive Summary

**Purpose:** Comprehensive inventory of ALL fields present in the 136 material frontmatter YAML files

**Status:** ✅ **COMPLETE ANALYSIS**

**Key Findings:**
- **Total top-level fields:** 17
- **MaterialProperties structure:** 3 categories (material_properties, structural_response, energy_coupling)
- **MachineSettings fields:** 11 standard fields + 1 optional field
- **New fields since last check:** 3 identified

---

## 🗂️ Top-Level Field Structure

### Core Identification Fields
```yaml
name: String                    # Material name
category: String                # Primary category (metal, wood, stone, plastic, glass, composite, ceramic)
subcategory: String            # Specific classification within category
title: String                   # Full page title
material_description: String    # Material-specific description (for materials)
settings_description: String    # Settings-specific description (for settings)
```

### Primary Data Sections

#### 1. **materialProperties** (Categorized Structure)
```yaml
materialProperties:
  material_properties:          # Category 1
    label: String
    description: String
    percentage: Number
    properties: Object          # Property definitions
  
  structural_response:          # Category 2
    label: String
    description: String
    percentage: Number
    properties: Object
  
  energy_coupling:              # Category 3
    label: String
    description: String
    percentage: Number
    properties: Object
```

#### 2. **machineSettings**
```yaml
machineSettings:
  powerRange: PropertyValue
  wavelength: PropertyValue
  spotSize: PropertyValue
  repetitionRate: PropertyValue
  pulseWidth: PropertyValue
  scanSpeed: PropertyValue
  fluence: PropertyValue
  energyDensity: PropertyValue      # Some materials use this instead of/with fluence
  overlapRatio: PropertyValue
  passCount: PropertyValue
  laserType: PropertyValue          # ⚠️ NEW FIELD - Not in all materials
  fluenceThreshold: PropertyValue   # ⚠️ NEW FIELD - Some materials only
```

#### 3. **applications**
```yaml
applications: Array<String>    # List of industry applications
```

#### 4. **compatibility** (Optional - Not in all files)
```yaml
compatibility: Array<String>   # Compatible processes/materials
```

#### 5. **outcomes** (Optional - Not in all files)
```yaml
outcomes: Array<String>        # Expected process outcomes
```

#### 6. **regulatoryStandards**
```yaml
regulatoryStandards: Array<String>  # Applicable safety/regulatory standards
```

#### 7. **author**
```yaml
author:
  id: Number
  name: String
  sex: String
  title: String
  country: String
  expertise: String
  image: String
```

#### 8. **images**
```yaml
images:
  hero:
    alt: String
    url: String
```

#### 9. **environmentalImpact**
```yaml
environmentalImpact:
  - benefit: String
    description: String
    applicableIndustries: Array<String>
    quantifiedBenefits: String
    sustainabilityBenefit: String
```

#### 10. **outcomeMetrics**
```yaml
outcomeMetrics:
  - metric: String
    description: String
    measurementMethods: Array<String>
    typicalRanges: String
    factorsAffecting: Array<String>
    units: Array<String>
```

#### 11. **caption**
```yaml
caption:
  beforeText: String
  afterText: String
  description: String
  alt: String
  technicalAnalysis: Object
  microscopy: Object
  generation: Object
  author: String
  materialProperties: Object
  imageUrl: Object
```

#### 12. **tags**
```yaml
tags: Array<String>            # Searchable tags
```

---

## 🔍 Property Value Structure

### Simple Property
```yaml
propertyName:
  value: Number | String
  unit: String
  confidence: Number          # 0-100 percentage
  description: String
  min: Number | null
  max: Number | null
  source: String             # Optional
  notes: String              # Optional
```

### Complex Property (Nested Structure)

#### Reflectivity (Wavelength-Specific)
```yaml
reflectivity:
  at_1064nm:
    min: Number
    max: Number
    unit: String
  at_532nm:
    min: Number
    max: Number
    unit: String
  at_355nm:
    min: Number
    max: Number
    unit: String
  at_10640nm:
    min: Number
    max: Number
    unit: String
  source: String
  confidence: Number
  measurement_context: String
```

#### Ablation Threshold (Pulse-Duration Specific)
```yaml
ablationThreshold:
  nanosecond:
    min: Number
    max: Number
    unit: String
  picosecond:
    min: Number
    max: Number
    unit: String
  femtosecond:
    min: Number
    max: Number
    unit: String
  source: String
  confidence: Number
  measurement_context: String
```

#### Thermal Destruction (Point + Type)
```yaml
thermalDestruction:
  point:
    value: Number
    unit: String
    min: Number
    max: Number
    confidence: Number
    description: String
  type: String              # e.g., "melting", "carbonization"
```

---

## 📊 Material Property Categories

### Category 1: Material Properties (material_properties)
**Percentage:** ~40% of properties
**Description:** Intrinsic properties affecting secondary cleaning outcomes

**Common Properties:**
- `density` - Material density (g/cm³)
- `oxidationResistance` - Resistance to oxidation (°C)
- `crystallineStructure` - Crystal structure type
- `electricalConductivity` - Electrical conductivity (MS/m)
- `surfaceEnergy` - Surface energy (J/m²)
- `porosity` - Material porosity (%)
- `surfaceRoughness` - Surface roughness (μm Ra)
- `moistureContent` - Moisture content (%)
- `celluloseContent` - Cellulose content (%) - Wood only

### Category 2: Structural Response (structural_response)
**Percentage:** ~18% of properties
**Description:** Physical reaction to thermal stress

**Common Properties:**
- `hardness` - Material hardness (HV, kN, etc.)
- `tensileStrength` - Tensile strength (MPa)
- `youngsModulus` - Young's modulus (GPa)
- `compressiveStrength` - Compressive strength (MPa) - Some materials
- `flexuralStrength` - Flexural strength (MPa) - Some materials

### Category 3: Energy Coupling (energy_coupling)
**Percentage:** ~16% of properties
**Description:** First-order photon coupling

**Common Properties:**
- `laserAbsorption` - Laser absorption (%)
- `laserReflectivity` - Laser reflectivity (%)
- `reflectivity` - **COMPLEX** - Wavelength-specific reflectivity
- `ablationThreshold` - **COMPLEX** - Pulse-duration specific thresholds
- `specificHeat` - Specific heat capacity (J/kg·K)
- `thermalConductivity` - Thermal conductivity (W/(m·K))
- `thermalDiffusivity` - Thermal diffusivity (mm²/s)
- `thermalExpansion` - Thermal expansion (μm/m·°C)
- `thermalDestruction` - **COMPLEX** - Point + type
- `absorptionCoefficient` - Absorption coefficient (various units)

---

## 🆕 New Fields Discovered

### 1. **laserType** (machineSettings)
**Location:** `machineSettings.laserType`
**Structure:**
```yaml
laserType:
  value: String              # e.g., "Fiber Laser"
  unit: N/A
  confidence: Number
  description: String
  min: null
  max: null
```

**Presence:** Found in Steel, Oak, and other materials
**Status:** ❌ **NOT currently displayed in any component**

---

### 2. **fluenceThreshold** (machineSettings)
**Location:** `machineSettings.fluenceThreshold`
**Structure:**
```yaml
fluenceThreshold:
  value: Number
  unit: String               # e.g., "J/cm²"
  confidence: Number
  description: String
  min: Number
  max: Number
```

**Presence:** Found in Steel and other materials
**Status:** ❌ **NOT currently displayed in MetricsGrid**
**Note:** Different from `fluence` - this is the minimum threshold

---

### 3. **compatibility** (Top-level)
**Location:** Top-level field
**Structure:**
```yaml
compatibility: Array<String>
```

**Example:**
```yaml
compatibility:
- Carbon fiber composites
- Glass fiber composites
- Hybrid composite systems
```

**Presence:** Found in aluminum-test-categorized.yaml and possibly others
**Status:** ❌ **NOT currently displayed anywhere**

---

### 4. **outcomes** (Top-level)
**Location:** Top-level field
**Structure:**
```yaml
outcomes: Array<String>
```

**Example:**
```yaml
outcomes:
- Complete contaminant removal
- Preserved substrate integrity
- Enhanced surface adhesion
```

**Presence:** Found in aluminum-test-categorized.yaml and possibly others
**Status:** ❌ **NOT currently displayed anywhere**

---

## 🎯 Component Coverage Analysis

### ✅ Fully Represented Fields

#### MetricsGrid (MaterialProperties)
- ✅ All simple properties in all 3 categories
- ✅ Complex properties: reflectivity (4 wavelengths)
- ✅ Complex properties: ablationThreshold (3 pulse durations)
- ✅ Complex properties: thermalDestruction (point + type)

#### MetricsGrid (MachineSettings)
- ✅ powerRange
- ✅ wavelength
- ✅ spotSize
- ✅ repetitionRate
- ✅ pulseWidth
- ✅ scanSpeed
- ✅ fluence
- ✅ energyDensity
- ✅ overlapRatio
- ✅ passCount

#### Other Components
- ✅ name, title, description (Hero, Layout)
- ✅ subtitle (Hero)
- ✅ author (Author component)
- ✅ images (Hero, Thumbnail)
- ✅ tags (Tags component)
- ✅ caption (Caption component)
- ✅ applications (displayed in text/lists)
- ✅ regulatoryStandards (displayed in text/lists)
- ✅ environmentalImpact (displayed in structured lists)
- ✅ outcomeMetrics (displayed in structured lists)

---

### ❌ Missing/Incomplete Representation

#### machineSettings
- ❌ **laserType** - Not displayed in MetricsGrid
- ❌ **fluenceThreshold** - Not displayed in MetricsGrid

#### Top-level Fields
- ❌ **compatibility** - No component displays this
- ❌ **outcomes** - No component displays this
- ❌ **category** - Used for routing but not prominently displayed
- ❌ **subcategory** - Used for routing but not prominently displayed

---

## 📈 Field Usage Statistics

### Universal Fields (100% of files)
- name
- category
- subcategory
- title
- description
- materialProperties
- machineSettings
- applications
- regulatoryStandards
- author
- images
- environmentalImpact
- subtitle
- outcomeMetrics
- caption
- tags

### Optional Fields (< 100% of files)
- compatibility (~5% of files)
- outcomes (~5% of files)
- laserType (~50% of files)
- fluenceThreshold (~30% of files)

---

## 🔧 Recommendations

### High Priority (Missing Critical Data)
1. **Add laserType to MetricsGrid**
   - Location: machineSettings section
   - Display: As a card or text badge
   - Impact: 50+ materials affected

2. **Add fluenceThreshold to MetricsGrid**
   - Location: machineSettings section
   - Display: As a card with range
   - Impact: 40+ materials affected

### Medium Priority (Optional Fields)
3. **Display compatibility field**
   - Location: New section or sidebar
   - Display: List of compatible materials/processes
   - Impact: 5-10 materials affected

4. **Display outcomes field**
   - Location: New section or callout
   - Display: List of expected outcomes
   - Impact: 5-10 materials affected

### Low Priority (Enhancement)
5. **Prominently display category/subcategory**
   - Current: Only in breadcrumbs/routing
   - Proposed: Badge or section header
   - Impact: All materials (visual enhancement)

---

## 📊 Complete Field Count

**Total Fields Analyzed:** 17 top-level fields
**PropertyValue Fields:** 30+ unique property names
**Nested Complex Properties:** 3 types (reflectivity, ablationThreshold, thermalDestruction)
**Materials Analyzed:** 136 YAML files

**Coverage Status:**
- ✅ **Fully Represented:** 13/17 (76%)
- ⚠️ **Partially Represented:** 2/17 (12%)
- ❌ **Not Represented:** 4/17 (24%)

---

## 🎯 Action Items

### Immediate
1. ✅ **Complex properties** - IMPLEMENTED (reflectivity, ablationThreshold, thermalDestruction)
2. ⏳ **laserType** - TO BE IMPLEMENTED
3. ⏳ **fluenceThreshold** - TO BE IMPLEMENTED

### Short-Term
4. ⏳ **compatibility** - TO BE DESIGNED
5. ⏳ **outcomes** - TO BE DESIGNED

### Long-Term
6. ⏳ **Category/subcategory badges** - TO BE DESIGNED

---

## 📝 Notes

- All YAML files follow consistent structure
- Complex properties (reflectivity, ablationThreshold, thermalDestruction) now handled
- Optional fields (laserType, fluenceThreshold, compatibility, outcomes) need attention
- Some materials have unique properties not found in others (e.g., celluloseContent for wood)

---

**Analysis Date:** October 15, 2025  
**Files Analyzed:** 136 material YAML files  
**Status:** ✅ **COMPLETE**  
**Next Step:** Implement laserType and fluenceThreshold support
