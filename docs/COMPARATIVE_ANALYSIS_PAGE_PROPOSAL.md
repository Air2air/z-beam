# Comparative Analysis Page - Frontend Proposal

## Overview

A dedicated comparison page that displays **multiple properties** for a **target material** compared against **similar materials**, enabling users to understand how materials differ across key characteristics and laser cleaning parameters.

---

## URL Structure

```
/materials/[category]/[subcategory]/[slug]/compare
```

**Example:**
```
/materials/stone/igneous/granite-laser-cleaning/compare
```

This would compare Granite against Marble, Limestone, Sandstone, Basalt, and Slate across all key properties.

---

## Expected Frontmatter Structure

The generator would create something like:

```yaml
# frontmatter/research/granite-comparison.yaml

layout: material-comparison
pageType: cross-material-analysis
target_material:
  name: Granite
  slug: granite-laser-cleaning
  category: stone
  subcategory: igneous

comparison_materials:
  - name: Marble
    slug: marble-laser-cleaning
    category: stone
    subcategory: metamorphic
  - name: Limestone
    slug: limestone-laser-cleaning
    category: stone
    subcategory: sedimentary
  - name: Sandstone
    slug: sandstone-laser-cleaning
    category: stone
    subcategory: sedimentary
  - name: Basalt
    slug: basalt-laser-cleaning
    category: stone
    subcategory: igneous
  - name: Slate
    slug: slate-laser-cleaning
    category: stone
    subcategory: metamorphic

# Multi-property comparison data
properties_comparison:
  
  # Physical Properties
  density:
    property_name: "Density"
    unit: "kg/m³"
    unit_alt: "g/cm³"
    description: "Mass per unit volume - affects thermal mass and laser energy requirements"
    materials:
      - name: Sandstone
        value: 2200
        value_alt: 2.2
        percentile: 35
        laser_implication: "Lower thermal mass, requires less power"
      - name: Limestone
        value: 2300
        value_alt: 2.3
        percentile: 42
        laser_implication: "Moderate thermal mass, standard settings"
      - name: Marble
        value: 2650
        value_alt: 2.65
        percentile: 68
        laser_implication: "Similar to granite, comparable parameters"
      - name: Granite
        value: 2700
        value_alt: 2.7
        percentile: 72
        highlight: true
        laser_implication: "Baseline for stone laser cleaning"
      - name: Slate
        value: 2800
        value_alt: 2.8
        percentile: 78
        laser_implication: "Higher thermal mass, layered structure consideration"
      - name: Basalt
        value: 2900
        value_alt: 2.9
        percentile: 85
        laser_implication: "Dense mafic rock, highest power requirements"
    range:
      min: 2200
      max: 2900
      category_range: [1500, 3200]  # Full stone category range
  
  thermal_conductivity:
    property_name: "Thermal Conductivity"
    unit: "W/m·K"
    description: "Rate of heat transfer through material - critical for preventing thermal damage"
    materials:
      - name: Sandstone
        value: 2.4
        percentile: 65
        laser_implication: "Good heat dissipation, lower thermal stress risk"
      - name: Limestone
        value: 2.5
        percentile: 68
        laser_implication: "Moderate heat dissipation"
      - name: Marble
        value: 2.8
        percentile: 78
        laser_implication: "Better heat management than granite"
      - name: Granite
        value: 2.79
        percentile: 77
        highlight: true
        laser_implication: "Slower heat dissipation, requires careful control"
      - name: Slate
        value: 2.2
        percentile: 58
        laser_implication: "Lower conductivity, anisotropic behavior"
      - name: Basalt
        value: 1.7
        percentile: 42
        laser_implication: "Poorest heat dissipation, high thermal stress risk"
    range:
      min: 1.7
      max: 2.8
      category_range: [1.0, 4.0]
  
  hardness_mohs:
    property_name: "Mohs Hardness"
    unit: "Mohs"
    description: "Scratch resistance - indicates material durability and laser parameter requirements"
    materials:
      - name: Limestone
        value: 3.0
        percentile: 30
        laser_implication: "Softer, easier to clean but damage-prone"
      - name: Marble
        value: 3.5
        percentile: 35
        laser_implication: "Moderate hardness, requires gentle approach"
      - name: Sandstone
        value: 6.5
        percentile: 65
        laser_implication: "Harder, more aggressive parameters possible"
      - name: Granite
        value: 6.5
        percentile: 65
        highlight: true
        laser_implication: "Hard silicate, tolerates higher power"
      - name: Slate
        value: 5.5
        percentile: 55
        laser_implication: "Moderate hardness, cleavage planes require care"
      - name: Basalt
        value: 6.0
        percentile: 60
        laser_implication: "Hard mafic mineral, durable"
    range:
      min: 3.0
      max: 6.5
      category_range: [1.0, 10.0]
  
  laser_absorption_1064nm:
    property_name: "Laser Absorption (1064nm)"
    unit: "%"
    description: "Percentage of laser energy absorbed at primary wavelength"
    materials:
      - name: Sandstone
        value: 38
        percentile: 52
        laser_implication: "Moderate absorption, standard power"
      - name: Limestone
        value: 35
        percentile: 48
        laser_implication: "Lower absorption, may need higher power"
      - name: Marble
        value: 40
        percentile: 55
        laser_implication: "Similar to granite, comparable efficiency"
      - name: Granite
        value: 42
        percentile: 58
        highlight: true
        laser_implication: "Good absorption for efficient cleaning"
      - name: Slate
        value: 52
        percentile: 72
        laser_implication: "Higher absorption, reduce power to prevent damage"
      - name: Basalt
        value: 68
        percentile: 95
        laser_implication: "Highest absorption, significant power reduction needed"
    range:
      min: 35
      max: 68
      category_range: [10, 95]

# Laser Parameter Comparison
laser_parameters_comparison:
  
  optimal_power:
    parameter_name: "Optimal Power"
    unit: "W"
    description: "Recommended laser power for effective cleaning without damage"
    materials:
      - name: Sandstone
        value: 80
        range: [60, 100]
        reasoning: "Lower density + moderate absorption = reduced power"
      - name: Limestone
        value: 85
        range: [70, 110]
        reasoning: "Soft material requires gentler approach"
      - name: Marble
        value: 95
        range: [80, 120]
        reasoning: "Similar to granite but slightly softer"
      - name: Granite
        value: 100
        range: [80, 150]
        highlight: true
        reasoning: "Baseline power for hard stone cleaning"
      - name: Slate
        value: 90
        range: [75, 115]
        reasoning: "Layered structure requires careful power control"
      - name: Basalt
        value: 110
        range: [90, 140]
        reasoning: "Dense + high absorption = higher power acceptable"
    range:
      min: 80
      max: 110
  
  optimal_fluence:
    parameter_name: "Optimal Fluence"
    unit: "J/cm²"
    description: "Energy density per pulse for effective contamination removal"
    materials:
      - name: Sandstone
        value: 1.8
        range: [1.2, 2.5]
      - name: Limestone
        value: 1.5
        range: [1.0, 2.2]
      - name: Marble
        value: 2.2
        range: [1.5, 3.0]
      - name: Granite
        value: 2.5
        range: [1.5, 3.5]
        highlight: true
      - name: Slate
        value: 2.0
        range: [1.3, 2.8]
      - name: Basalt
        value: 2.8
        range: [2.0, 3.8]
    range:
      min: 1.5
      max: 2.8
  
  scan_speed:
    parameter_name: "Scan Speed"
    unit: "mm/s"
    description: "Optimal scanning velocity for uniform cleaning"
    materials:
      - name: Sandstone
        value: 600
        range: [400, 900]
      - name: Limestone
        value: 550
        range: [350, 850]
      - name: Marble
        value: 520
        range: [350, 800]
      - name: Granite
        value: 500
        range: [300, 800]
        highlight: true
      - name: Slate
        value: 480
        range: [300, 750]
      - name: Basalt
        value: 450
        range: [250, 700]
    range:
      min: 450
      max: 600

# Application Comparison
application_comparison:
  biological_growth_removal:
    description: "Cleaning of moss, lichen, algae from stone surfaces"
    effectiveness:
      - {name: "Sandstone", score: 85, notes: "Porous, excellent cleaning"}
      - {name: "Limestone", score: 90, notes: "Very effective, common application"}
      - {name: "Marble", score: 88, notes: "Effective but requires care"}
      - {name: "Granite", score: 92, notes: "Excellent results, durable", highlight: true}
      - {name: "Slate", score: 80, notes: "Good but layers may complicate"}
      - {name: "Basalt", score: 85, notes: "Effective on dense surface"}
  
  carbon_soot_removal:
    description: "Removal of carbon deposits from fire or pollution"
    effectiveness:
      - {name: "Sandstone", score: 75, notes: "May penetrate pores deeply"}
      - {name: "Limestone", score: 70, notes: "Challenging on porous surface"}
      - {name: "Marble", score: 82, notes: "Good results with careful parameters"}
      - {name: "Granite", score: 95, notes: "Excellent removal, minimal substrate damage", highlight: true}
      - {name: "Slate", score: 85, notes: "Effective with layer consideration"}
      - {name: "Basalt", score: 90, notes: "Very effective on dense surface"}
  
  paint_graffiti_removal:
    description: "Removal of paint and graffiti from stone surfaces"
    effectiveness:
      - {name: "Sandstone", score: 70, notes: "Risk of pore damage"}
      - {name: "Limestone", score: 65, notes: "Challenging, careful approach needed"}
      - {name: "Marble", score: 78, notes: "Moderate success, risk of etching"}
      - {name: "Granite", score: 98, notes: "Best material for paint removal", highlight: true}
      - {name: "Slate", score: 88, notes: "Very good if parallel to grain"}
      - {name: "Basalt", score: 92, notes: "Excellent results"}

# Cost & Efficiency Comparison
operational_comparison:
  materials:
    - name: Sandstone
      cleaning_time_factor: 0.85  # Relative to granite (1.0)
      energy_cost_factor: 0.80
      risk_level: "Low"
      notes: "Faster cleaning, lower cost, minimal risk"
    
    - name: Limestone
      cleaning_time_factor: 0.90
      energy_cost_factor: 0.85
      risk_level: "Medium"
      notes: "Quick cleaning but higher damage risk"
    
    - name: Marble
      cleaning_time_factor: 0.95
      energy_cost_factor: 0.95
      risk_level: "Medium-High"
      notes: "Similar to granite but requires more care"
    
    - name: Granite
      cleaning_time_factor: 1.0
      energy_cost_factor: 1.0
      risk_level: "Low"
      highlight: true
      notes: "Baseline reference material"
    
    - name: Slate
      cleaning_time_factor: 1.1
      energy_cost_factor: 0.90
      risk_level: "Medium"
      notes: "Slower due to structural considerations"
    
    - name: Basalt
      cleaning_time_factor: 1.15
      energy_cost_factor: 1.10
      risk_level: "Low-Medium"
      notes: "Slower, higher power, but durable"

# Summary Statistics
summary:
  target_material: Granite
  materials_compared: 6
  properties_analyzed: 4
  parameters_optimized: 3
  applications_evaluated: 3
  
  key_findings:
    - "Granite shows optimal balance of hardness, density, and laser absorption"
    - "Higher thermal mass than sedimentary stones requires careful energy management"
    - "Best material for aggressive cleaning (paint, graffiti) due to durability"
    - "Similar parameters to Marble but more forgiving due to higher hardness"
    - "Basalt requires highest caution due to extreme absorption at 1064nm"
  
  recommendations:
    - "Use Granite parameters as baseline for other hard stones"
    - "Reduce power 15-20% when moving from Granite to Marble or Limestone"
    - "Increase power 10-15% when moving from Granite to Basalt (counter-intuitive due to absorption)"
    - "Always test on inconspicuous area when switching materials"

# Visualization Specifications
visualizations:
  
  radar_chart:
    title: "Material Performance Profile"
    axes:
      - {property: "Density", max: 3200}
      - {property: "Hardness", max: 10}
      - {property: "Thermal Conductivity", max: 4.0}
      - {property: "Absorption", max: 95}
      - {property: "Cleaning Effectiveness", max: 100}
    materials: [Sandstone, Limestone, Marble, Granite, Slate, Basalt]
  
  bar_chart_groups:
    - title: "Physical Properties Comparison"
      properties: [density, thermal_conductivity, hardness_mohs, laser_absorption_1064nm]
      layout: "grouped"
    
    - title: "Laser Parameters Comparison"
      properties: [optimal_power, optimal_fluence, scan_speed]
      layout: "grouped"
  
  heatmap:
    title: "Application Effectiveness Matrix"
    rows: [Sandstone, Limestone, Marble, Granite, Slate, Basalt]
    columns: [Biological Growth, Carbon Soot, Paint/Graffiti]
    color_scale: "green-yellow-red"
    
  scatter_plot:
    title: "Density vs Absorption Trade-off"
    x_axis: "Density (kg/m³)"
    y_axis: "Laser Absorption (%)"
    bubble_size: "Optimal Power (W)"
    quadrants:
      - {label: "Low Mass, Low Absorption", position: "bottom-left"}
      - {label: "Low Mass, High Absorption", position: "top-left"}
      - {label: "High Mass, Low Absorption", position: "bottom-right"}
      - {label: "High Mass, High Absorption", position: "top-right"}
```

---

## Frontend Implementation Proposal

### 1. **Page Layout Structure**

```
┌─────────────────────────────────────────────────────┐
│  Breadcrumb Navigation                              │
├─────────────────────────────────────────────────────┤
│  Header: "Granite vs Similar Materials"            │
│  Subtitle: "Comprehensive Property & Parameter...  │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐   │
│  │  Quick Stats Bar                           │   │
│  │  6 Materials | 4 Properties | 3 Parameters│   │
│  └────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  SECTION 1: Material Overview Cards                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Sand. │ │Lime. │ │Marble│ │GRANIT│ │Slate │    │
│  │2200  │ │2300  │ │2650  │ │ 2700 │ │2800  │    │
│  │kg/m³ │ │kg/m³ │ │kg/m³ │ │kg/m³ │ │kg/m³ │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────────────────────────┤
│  SECTION 2: Property Comparison Charts             │
│                                                     │
│  ┌────────────────────────────────────┐           │
│  │ Density Comparison Bar Chart       │           │
│  │ ████████████░░░░░░░░░░░ Sandstone  │           │
│  │ █████████████░░░░░░░░░░ Limestone  │           │
│  │ █████████████████████░░ Marble     │           │
│  │ ████████████████████████ GRANITE   │ ←         │
│  │ ██████████████████████░░ Slate     │           │
│  │ █████████████████████░░░ Basalt    │           │
│  └────────────────────────────────────┘           │
│                                                     │
│  [Similar charts for other properties]            │
├─────────────────────────────────────────────────────┤
│  SECTION 3: Radar Chart                            │
│  ┌────────────────────────────────────┐           │
│  │        Performance Profile          │           │
│  │                                     │           │
│  │           Density                   │           │
│  │             ╱│╲                     │           │
│  │   Hardness─────Thermal Cond.       │           │
│  │           ╲   ╱                     │           │
│  │        Absorption                   │           │
│  │                                     │           │
│  │  [Overlapping polygons for each]   │           │
│  └────────────────────────────────────┘           │
├─────────────────────────────────────────────────────┤
│  SECTION 4: Laser Parameter Comparison Table       │
│  ┌────────────────────────────────────────────┐   │
│  │ Material  │ Power  │ Fluence│ Speed       │   │
│  ├───────────┼────────┼────────┼─────────────┤   │
│  │ Sandstone │  80 W  │ 1.8 J  │ 600 mm/s    │   │
│  │ Limestone │  85 W  │ 1.5 J  │ 550 mm/s    │   │
│  │ Marble    │  95 W  │ 2.2 J  │ 520 mm/s    │   │
│  │ GRANITE   │ 100 W  │ 2.5 J  │ 500 mm/s ← │   │
│  │ Slate     │  90 W  │ 2.0 J  │ 480 mm/s    │   │
│  │ Basalt    │ 110 W  │ 2.8 J  │ 450 mm/s    │   │
│  └────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  SECTION 5: Application Effectiveness Heatmap      │
│  ┌────────────────────────────────────────────┐   │
│  │           Bio  │ Soot │ Paint/Graffiti    │   │
│  ├───────────┼──────┼──────┼──────────────────┤   │
│  │ Sandstone │  85  │  75  │       70         │   │
│  │ Limestone │  90  │  70  │       65         │   │
│  │ Marble    │  88  │  82  │       78         │   │
│  │ GRANITE   │  92  │  95  │       98     ← │   │
│  │ Slate     │  80  │  85  │       88         │   │
│  │ Basalt    │  85  │  90  │       92         │   │
│  └────────────────────────────────────────────┘   │
│  [Color-coded cells: green=high, yellow=med, red=low]│
├─────────────────────────────────────────────────────┤
│  SECTION 6: Scatter Plot - Density vs Absorption   │
│  ┌────────────────────────────────────────────┐   │
│  │ Absorption (%)                              │   │
│  │ 70│        ● Basalt                        │   │
│  │   │                                         │   │
│  │ 50│     ● Slate                            │   │
│  │   │   ● Granite                            │   │
│  │ 40│ ● Marble                               │   │
│  │   │                                         │   │
│  │ 30│● Sandstone  ● Limestone                │   │
│  │   └────────────────────────────────────    │   │
│  │    2200    2500    2800   Density (kg/m³) │   │
│  └────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  SECTION 7: Detailed Property Breakdowns           │
│  [Expandable cards for each property]              │
├─────────────────────────────────────────────────────┤
│  SECTION 8: Operational Comparison                 │
│  Cost & Time Factors                               │
├─────────────────────────────────────────────────────┤
│  SECTION 9: Key Findings & Recommendations         │
├─────────────────────────────────────────────────────┤
│  SECTION 10: Related Comparisons                   │
│  - Compare with Metals                             │
│  - Compare with Polymers                           │
│  - Individual Material Deep-Dives                  │
└─────────────────────────────────────────────────────┘
```

### 2. **Interactive Features**

#### Property Toggle System
```tsx
// Allow users to select which properties to compare
<PropertySelector>
  ☑ Density
  ☑ Thermal Conductivity
  ☑ Hardness
  ☑ Laser Absorption
  ☐ Compressive Strength
  ☐ Porosity
  ☐ Specific Heat
</PropertySelector>
```

#### Material Filter
```tsx
// Let users add/remove materials from comparison
<MaterialFilter>
  ☑ Sandstone
  ☑ Limestone
  ☑ Marble
  ☑ Granite (locked - target material)
  ☑ Slate
  ☑ Basalt
  ☐ Travertine
  ☐ Quartzite
</MaterialFilter>
```

#### Chart Type Switcher
```tsx
// Toggle between visualization types
<ChartTypeToggle>
  ○ Bar Chart
  ● Radar Chart
  ○ Scatter Plot
  ○ Table View
</ChartTypeToggle>
```

#### Hover Tooltips
```tsx
// Rich tooltips on hover
<Tooltip>
  Granite: 2700 kg/m³
  ─────────────────────
  Percentile: 72nd
  Category Rank: 4/6
  
  Laser Implication:
  "Baseline for stone laser cleaning.
   Moderate thermal mass requires
   careful energy management."
</Tooltip>
```

#### Comparison Mode Toggle
```tsx
// Switch between absolute and relative values
<ViewModeToggle>
  ○ Absolute Values
  ● Relative to Granite (%)
  ○ Percentile Ranking
</ViewModeToggle>
```

### 3. **Visual Design Elements**

#### Color Coding Strategy
- **Target Material (Granite):** Blue accent `#3B82F6`
- **Better than Granite:** Green scale `#10B981` → `#34D399`
- **Worse than Granite:** Red scale `#EF4444` → `#F87171`
- **Similar to Granite:** Gray scale `#6B7280` → `#9CA3AF`

#### Property Cards
```tsx
<PropertyCard>
  <Icon>📏</Icon>
  <PropertyName>Density</PropertyName>
  <TargetValue>2700 kg/m³</TargetValue>
  <Badge>72nd Percentile</Badge>
  <MiniChart>[visual sparkline]</MiniChart>
  <ExpandButton>View Details ↓</ExpandButton>
</PropertyCard>
```

#### Comparison Bars
```tsx
// Visual comparison with annotations
████████████████████████ Granite 2700 kg/m³ ← Baseline
█████████████████████░░░ Marble  2650 kg/m³ -1.9%
█████████████████████░░░ Slate   2800 kg/m³ +3.7%
                          ↑
                     Better for thermal mass
```

### 4. **Key Features Implementation**

#### Radar Chart Component
```tsx
<RadarChart
  data={materials}
  properties={[
    'density',
    'hardness',
    'thermal_conductivity',
    'absorption',
    'effectiveness'
  ]}
  highlightMaterial="Granite"
  showLegend={true}
  interactive={true}
/>
```

#### Multi-Property Bar Chart
```tsx
<GroupedBarChart
  materials={comparisonMaterials}
  properties={selectedProperties}
  targetMaterial="Granite"
  showPercentages={true}
  enableDrillDown={true}
/>
```

#### Application Effectiveness Heatmap
```tsx
<HeatmapGrid
  rows={materials}
  columns={applications}
  colorScale="greenToRed"
  cellSize={60}
  showValues={true}
  targetRow="Granite"
/>
```

#### Scatter Plot with Quadrants
```tsx
<ScatterPlot
  xAxis="density"
  yAxis="absorption"
  bubbleSize="optimal_power"
  materials={comparisonMaterials}
  quadrantLabels={true}
  highlightMaterial="Granite"
/>
```

### 5. **Responsive Behavior**

#### Desktop (≥1024px)
- 3-column grid for property cards
- Side-by-side charts
- Full radar chart display
- Expanded tooltips

#### Tablet (768px-1023px)
- 2-column grid for property cards
- Stacked charts
- Compact radar chart
- Touch-friendly tooltips

#### Mobile (≤767px)
- Single column layout
- Swipeable chart carousel
- Simplified radar chart (fewer axes)
- Bottom sheet tooltips

### 6. **Data Tables**

#### Comparison Table with Sorting
```tsx
<ComparisonTable
  materials={comparisonMaterials}
  columns={[
    { key: 'name', label: 'Material', sortable: true },
    { key: 'density', label: 'Density', sortable: true, unit: 'kg/m³' },
    { key: 'hardness', label: 'Hardness', sortable: true, unit: 'Mohs' },
    { key: 'power', label: 'Power', sortable: true, unit: 'W' },
    { key: 'effectiveness', label: 'Overall', sortable: true }
  ]}
  highlightRow="Granite"
  showDifferences={true}
  exportable={true}
/>
```

#### Parameter Matrix
```tsx
<ParameterMatrix
  materials={comparisonMaterials}
  parameters={['power', 'fluence', 'scan_speed', 'wavelength']}
  showRanges={true}
  showRecommendations={true}
  targetMaterial="Granite"
/>
```

### 7. **Interactive Filters & Controls**

```tsx
<ComparisonControls>
  {/* Category Filter */}
  <CategoryFilter>
    <option>All Stone Types</option>
    <option>Igneous Only</option>
    <option>Sedimentary Only</option>
    <option>Metamorphic Only</option>
  </CategoryFilter>
  
  {/* Property Weight Slider */}
  <PropertyWeight>
    <label>Density Importance: {densityWeight}%</label>
    <Slider min={0} max={100} value={densityWeight} />
  </PropertyWeight>
  
  {/* View Preset Selector */}
  <ViewPreset>
    <Button>Physical Properties</Button>
    <Button>Laser Parameters</Button>
    <Button>Applications</Button>
    <Button>Cost Analysis</Button>
  </ViewPreset>
  
  {/* Export Options */}
  <ExportMenu>
    <Button>📊 Export to CSV</Button>
    <Button>📈 Export Charts (PNG)</Button>
    <Button>📄 Generate PDF Report</Button>
  </ExportMenu>
</ComparisonControls>
```

### 8. **Summary Section**

```tsx
<ComparisonSummary>
  <StatBox>
    <Icon>🎯</Icon>
    <Label>Target Material</Label>
    <Value>Granite</Value>
  </StatBox>
  
  <StatBox>
    <Icon>🔬</Icon>
    <Label>Materials Compared</Label>
    <Value>6</Value>
  </StatBox>
  
  <StatBox>
    <Icon>📏</Icon>
    <Label>Properties Analyzed</Label>
    <Value>4</Value>
  </StatBox>
  
  <StatBox>
    <Icon>⚡</Icon>
    <Label>Parameters Optimized</Label>
    <Value>3</Value>
  </StatBox>
</ComparisonSummary>

<KeyFindings>
  <Finding type="insight">
    ✓ Granite shows optimal balance of hardness, density, and laser absorption
  </Finding>
  <Finding type="recommendation">
    → Use Granite parameters as baseline for other hard stones
  </Finding>
  <Finding type="warning">
    ⚠ Basalt requires special caution due to extreme absorption at 1064nm
  </Finding>
</KeyFindings>
```

### 9. **Related Navigation**

```tsx
<RelatedComparisons>
  <ComparisonCard>
    <Title>Metal vs Stone Comparison</Title>
    <Description>Compare Granite with Aluminum, Steel, Bronze</Description>
    <Button>View Comparison →</Button>
  </ComparisonCard>
  
  <ComparisonCard>
    <Title>Individual Material Deep-Dive</Title>
    <Description>Detailed research on each material's properties</Description>
    <MaterialLinks>
      <Link href="/materials/.../granite-laser-cleaning">Granite</Link>
      <Link href="/materials/.../marble-laser-cleaning">Marble</Link>
      {/* ... */}
    </MaterialLinks>
  </ComparisonCard>
</RelatedComparisons>
```

---

## Technical Implementation Notes

### Component Architecture
```
app/materials/[category]/[subcategory]/[slug]/compare/
└── page.tsx                          # Route handler

app/components/Comparison/
├── ComparisonPage.tsx                # Main container
├── PropertyComparisonChart.tsx       # Bar charts for properties
├── RadarChart.tsx                    # Performance profile
├── ParameterMatrix.tsx               # Laser parameter table
├── HeatmapGrid.tsx                   # Application effectiveness
├── ScatterPlot.tsx                   # Density vs absorption
├── MaterialOverviewCards.tsx         # Material summary cards
├── ComparisonControls.tsx            # Filters & toggles
└── ComparisonSummary.tsx             # Key findings
```

### Data Flow
```
1. Load frontmatter/research/{material}-comparison.yaml
2. Parse all material data with properties/parameters
3. Calculate percentiles and relative differences
4. Generate chart data structures
5. Render interactive visualizations
6. Enable filtering/toggling/exporting
```

### Chart Libraries
- **Recharts** - For bar charts, radar charts, scatter plots
- **D3.js** - For custom heatmap and advanced visualizations
- **Chart.js** - Alternative lightweight option

### Performance Considerations
- Lazy load chart libraries
- Virtualize large tables
- Cache computed comparisons
- Progressive image loading
- Code-split visualization components

---

## Benefits of This Approach

### For Users
- **Quick Overview:** Understand material differences at a glance
- **Deep Analysis:** Drill into specific properties/parameters
- **Actionable Insights:** Clear recommendations for parameter adjustments
- **Visual Learning:** Multiple chart types for different learning styles
- **Practical Application:** Direct mapping to laser cleaning scenarios

### For Business
- **Differentiation:** No competitor offers this depth of comparison
- **Authority Building:** Demonstrates comprehensive material expertise
- **User Engagement:** Interactive tools keep visitors exploring
- **Lead Generation:** Complex tools encourage contact for consultation
- **SEO Value:** Rich comparison content ranks for many long-tail queries

### For Development
- **Reusable Components:** Same charts work for any material category
- **Extensible Data Model:** Easy to add new properties/materials
- **Performance Optimized:** Static generation with client interactivity
- **Type Safe:** Full TypeScript support
- **Maintainable:** Centralized comparison logic

---

## Next Steps

1. **Frontend Generator creates YAML** → `granite-comparison.yaml`
2. **You build ComparisonPage component** → Using this proposal
3. **Test with granite example** → Verify all visualizations work
4. **Extend to other materials** → Marble, aluminum, copper comparisons
5. **Add advanced features** → Custom material selection, PDF export

This comparative analysis page would be a powerful tool for professionals selecting materials and optimizing laser cleaning parameters!
