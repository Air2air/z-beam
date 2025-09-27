# MetricsCard Implementation Guide

## Overview
MetricsCard has been successfully implemented as a discrete component in the Z-Beam article system, completely separate from the existing Settings component. This provides a modern, visually appealing way to display both machine settings and material properties data.

## Features Implemented

### ✅ Layout Integration
- Added `metricsmachinesettings` and `metricsproperties` as new component types to the Layout system
- Positioned in rendering order: badgesymbol → content → caption → **metricsmachinesettings** → **metricsproperties** → settings → table → tags
- Fully discrete from Settings component

### ✅ Data Transformation
- Created `metricsCardHelpers.ts` with utilities to extract machine settings from frontmatter
- Supports both PropertyWithUnits format and legacy YAML structures
- Automatically parses numeric values, units, and ranges from existing data

### ✅ Component Configuration
- Machine settings: Configuration files in `/content/components/metricsmachinesettings/` (YAML format)
- Material properties: Configuration files in `/content/components/metricsproperties/` (MD format)
- Customizable layouts, priorities, and display options
- Multiple component variants (default, primary, compact, minimal)

## Usage in Articles

### 1. Article Configuration
Add component types to your article's component configuration:

```yaml
components:
  metricsmachinesettings:
    title: "Laser Parameters"
    description: "Optimized settings for material processing"
    layout: "grid-3"
    maxCards: 6
    priorityFilter: [1, 2]
    showTitle: true
  metricsproperties:
    title: "Material Properties"
    description: "Physical and thermal characteristics"
    layout: "grid-4"
    mode: "advanced"
    showTitle: true
```

### 2. Machine Settings Data
MetricsCard automatically extracts data from your existing frontmatter `machineSettings`:

```yaml
machineSettings:
  settings:
  - header: '## Machine Configuration'
    rows:
    - parameter: Power Range
      value: 70.0
      range: 20.0 - 500.0
      category: Laser Power
    - parameter: Wavelength  
      value: 1064.0
      range: 355.0 - 2940.0
      category: Optical
```

### 3. Material Properties Data
MetricsProperties extracts data from MD files containing YAML-structured properties:

```yaml
properties:
  density:
    value: 7.8
    unit: g/cm³
    min: 0.5
    max: 25.0
    description: Material density
    priority: 1
  thermalConductivity:
    value: 15.0
    unit: W/m·K
    min: 0.1
    max: 500
    description: Thermal conductivity
    priority: 2
  tensileStrength:
    value: 200.0
    unit: MPa
    min: 10
    max: 5000
    description: Ultimate tensile strength
    priority: 2
```

### 4. Component Rendering
Both components will:
- **MetricsCard**: Extract machine settings from frontmatter YAML
- **MetricsProperties**: Extract material properties from MD files  
- Parse units and ranges automatically
- Create modern card-based visualization
- Display alongside existing Settings table

## Data Processing

### Automatic Transformations
- **Parameter Names**: `Power Range` → `power`
- **Numeric Values**: Already numeric in YAML, used directly
- **Units**: Extracted from value strings or inferred from parameter names
- **Ranges**: Parsed from range strings into min/max values

### Supported Parameters

#### Machine Settings (metricsmachinesettings)
- Power (W) - Priority 1, Blue theme
- Wavelength (nm) - Priority 1, Indigo theme  
- Pulse Duration (ns) - Priority 1, Purple theme
- Frequency/Repetition Rate (Hz) - Priority 2, Green theme
- Fluence (J/cm²) - Priority 2, Yellow theme
- Spot Size (mm) - Priority 2, Red theme

#### Material Properties (metricsproperties)
- Density (g/cm³) - Priority 1, Blue theme
- Thermal Conductivity (W/m·K) - Priority 2, Green theme
- Tensile Strength (MPa) - Priority 2, Yellow theme
- Young's Modulus (GPa) - Priority 3, Purple theme
- Thermal Expansion (μm/m·K) - Priority 3, Red theme

## Component Hierarchy

```
Article Layout
├── BadgeSymbol
├── Content  
├── Caption
├── **MetricsCard** ← New discrete component
├── Settings ← Existing table component (unchanged)
├── Table
└── Tags
```

## Benefits

1. **Discrete Architecture**: MetricsCard and Settings are completely independent
2. **Data Reuse**: Uses existing frontmatter machineSettings data  
3. **Modern UI**: Card-based visualization with color themes and responsive design
4. **Backward Compatible**: No changes to existing Settings component or data structures
5. **Flexible Display**: Multiple layouts and filtering options

## Example Implementation

For porcelain-laser-cleaning article:
- Settings component: Shows detailed tabular data with categories and descriptions
- MetricsCard component: Shows key parameters in modern card format with visual indicators

Both components work together to provide comprehensive machine settings information in different presentation formats.

## Technical Implementation

### Files Created/Modified:
- ✅ `app/components/Layout/Layout.tsx` - Added MetricsCard support
- ✅ `app/utils/metricsCardHelpers.ts` - Data transformation utilities  
- ✅ `app/components/MetricsCard/MetricsCard.tsx` - Updated to use frontmatter data
- ✅ `content/components/metricsmachinesettings/` - Configuration directory

### Build Status: ✅ PASSING
All TypeScript compilation successful, no errors detected.