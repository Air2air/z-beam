# FAQ Generation Specification for YAML Processor

## Overview
Generate material-specific, data-driven FAQs during YAML processing using actual cross-material comparisons, statistical analysis, and extracted micro data. All FAQs should be factual, precise, and avoid marketing rhetoric.

## Output Structure

Add to each material's frontmatter YAML:

```yaml
faqs:
  - question: string
    answer: string
    dataSource: string  # For transparency/debugging
    confidence: number  # 0-100, based on data availability
```

## Required FAQ Types (Generate 6-8 per material)

### 1. Contaminant-Specific FAQ
**Data Sources:**
- `micro.beforeText` - Parse for contaminant mentions
- Pattern matching: oxide, rust, paint, oil, carbon, scale, coating, corrosion, pitting

**Question Template:**
`"What types of contaminants can laser cleaning remove from {materialName}?"`

**Answer Requirements:**
- Extract specific contaminants mentioned in beforeText
- Extract numerical measurements (e.g., "4-6 microns", "2.1 microns")
- Link to removal efficiency from `outcomeMetrics` if available
- Include wavelength-specific absorption if mentioned
- NO generic marketing language

**Example (Aluminum):**
```yaml
question: "What types of contaminants can laser cleaning remove from Aluminum?"
answer: "Analysis of aluminum samples shows typical contamination includes: oxide layers (Al₂O₃) measuring 4-6 microns thick, carbonaceous grime embedded in surface irregularities, and light pitting with uneven depth distribution. At 1064nm wavelength, removal efficiency for aluminum oxide is 97-99%, with carbonaceous deposits removed at 95% efficiency. Total processing achieves surface cleanliness meeting ISO 8501-1 Sa 2.5 standard."
dataSource: "micro.beforeText + outcomeMetrics[0] + machineSettings.wavelength"
confidence: 92
```

### 2. Cross-Material Comparison FAQ
**Data Sources:**
- Query ALL materials in same category from database
- Calculate percentile rankings for key properties
- Find nearest neighbors (closest properties)

**Question Template:**
`"How does {materialName} compare to other {category} materials for laser cleaning?"`

**Answer Requirements:**
- Use ACTUAL values from other materials (not hardcoded estimates)
- Provide specific numerical comparisons (e.g., "1.8× higher", "45% lower")
- Compare to min/max/median in category
- Link properties to required machine settings differences
- Include at least 2-3 specific material comparisons by name

**Calculation Logic:**
```python
# Example for Aluminum thermal conductivity comparison
aluminum_tc = 237  # W/(m·K)
category_materials = get_all_materials(category="Metal")
tc_values = {m.name: m.thermalConductivity for m in category_materials}

comparisons = {
    "Steel": aluminum_tc / tc_values["Steel"],  # 237/50 = 4.74×
    "Titanium": aluminum_tc / tc_values["Titanium"],  # 237/113 = 2.1×
    "Copper": aluminum_tc / tc_values["Copper"]  # 237/400 = 0.59×
}

category_median = median(tc_values.values())
percentile = calculate_percentile(aluminum_tc, tc_values.values())
```

**Example (Aluminum):**
```yaml
question: "How does Aluminum compare to other metals for laser cleaning?"
answer: "Aluminum's thermal conductivity (237 W/(m·K)) ranks in the 89th percentile among metals. Specific comparisons: 4.7× higher than Steel (50 W/(m·K)), 2.1× higher than Titanium (113 W/(m·K)), and 59% of Copper (400 W/(m·K)). This high thermal conductivity requires 35% higher fluence (4.2 J/cm² vs Steel's 3.1 J/cm²) and 25% faster scanning (600 mm/s vs 480 mm/s) to compensate for rapid heat dissipation. Aluminum's reflectivity (88%) is also higher than Steel (60%) and Titanium (50%), requiring careful beam management."
dataSource: "database_comparison: thermalConductivity, laserReflectivity, machineSettings.energyDensity across Metal category (n=47)"
confidence: 98
```

### 3. Material Property-Driven Challenge FAQ
**Data Sources:**
- `materialProperties.material_characteristics.*`
- `materialProperties.laser_material_interaction.*`
- Category statistics for threshold detection

**Question Template:**
`"What makes {materialName} challenging for laser cleaning?"` OR
`"What unique considerations apply to laser cleaning {materialName}?"`

**Threshold Logic:**
```python
# Identify primary challenge based on extreme values
if hardness > percentile_90(category_hardness):
    challenge = "ultra-hard"
elif thermalConductivity > percentile_85(category_tc):
    challenge = "high_thermal_conductivity"
elif reflectivity > 75:
    challenge = "high_reflectivity"
elif thermalDestruction < percentile_25(category_td):
    challenge = "low_thermal_threshold"
elif category == "Ceramic" and fractureToughness < 5:
    challenge = "brittle_thermal_shock"
```

**Answer Requirements:**
- State specific property value causing challenge
- Compare to category range (min/max/median)
- Explain physical mechanism (heat dissipation, absorption, thermal shock, etc.)
- Link to specific machine parameter adjustments
- NO vague statements like "requires optimization"

**Example (Tungsten Carbide):**
```yaml
question: "What makes Tungsten Carbide challenging for laser cleaning?"
answer: "Tungsten Carbide's hardness (1600 HV) exceeds 98% of materials in the Ceramic category (range: 6-2500 HV, median: 450 HV). This extreme hardness makes mechanical cleaning methods ineffective and abrasive cleaning likely to cause surface damage. Additionally, poor oxidation resistance above 600°C (compared to ceramic median of 1200°C) means thermal management is critical. Our process uses 10ns pulse width (vs typical 20-50ns for softer ceramics) to minimize heat buildup while achieving ablation threshold of 1.8 J/cm². The high thermal diffusivity (22.5 mm²/s, 95th percentile) requires rapid pulse delivery at 50 kHz to prevent heat spreading."
dataSource: "hardness percentile + oxidationResistance comparison + thermalDiffusivity ranking + machineSettings optimization"
confidence: 95
```

### 4. Wavelength/Absorption Optimization FAQ
**Data Sources:**
- `machineSettings.wavelength`
- `laser_material_interaction.laserAbsorption`
- `laser_material_interaction.laserReflectivity`

**Question Template:**
`"Why is {wavelength} nm wavelength used for {materialName} laser cleaning?"`

**Answer Requirements:**
- State exact absorption coefficient at that wavelength
- Calculate absorption vs reflection ratio
- Compare to absorption at other common wavelengths if data available
- Explain contaminant vs substrate absorption selectivity
- Link to required power level adjustments

**Example (Aluminum):**
```yaml
question: "Why is 1064 nm wavelength used for Aluminum laser cleaning?"
answer: "At 1064nm (Nd:YAG), Aluminum has 12% absorption (88% reflectivity). While this seems low, aluminum oxide (Al₂O₃) absorbs 34-42% at this wavelength—creating a 2.8-3.5× selectivity ratio that allows preferential contamination removal. Alternative wavelengths show: 532nm (green) has 8% Al absorption but only 1.8× selectivity; 355nm (UV) has 18% absorption but causes surface roughening. The 1064nm wavelength balances selective cleaning with safety: reflected beam hazards are managed through beam delivery design, while the absorption difference prevents substrate damage at contaminant-removing fluence levels (3.8-4.2 J/cm²)."
dataSource: "laserAbsorption(1064nm) + contaminant_absorption_data + wavelength_comparison_table"
confidence: 87
```

### 5. Thermal Safety FAQ
**Data Sources:**
- `material_characteristics.thermalDestruction`
- `material_characteristics.meltingPoint`
- `material_characteristics.oxidationResistance`
- `machineSettings.pulseWidth`
- `machineSettings.energyDensity`

**Question Template:**
`"Can laser cleaning damage {materialName} through overheating?"` OR
`"What prevents thermal damage when laser cleaning {materialName}?"`

**Answer Requirements:**
- State exact thermal limit (destruction temp, melting point, or oxidation threshold)
- Calculate peak surface temperature during laser pulse (if possible)
- Show margin of safety: (thermal_limit - peak_temp) / thermal_limit * 100%
- Explain pulse duration's role in heat confinement
- Include cooling time between pulses if calculable

**Thermal Calculation:**
```python
# Simplified thermal model
pulse_energy = energyDensity  # J/cm²
absorption_fraction = laserAbsorption / 100
deposited_energy = pulse_energy * absorption_fraction

# Estimate peak temperature rise (simplified)
# ΔT = Q / (ρ * c * d)
# where d is penetration depth
penetration_depth = 1e-6  # meters (typical for ns pulses)
volume = penetration_depth * 1e-4  # m³/cm²
mass = volume * density * 1000  # kg
temp_rise = deposited_energy / (mass * specificHeat)

peak_temp = room_temp + temp_rise
safety_margin = (thermalDestruction - peak_temp) / thermalDestruction * 100
```

**Example (Aluminum):**
```yaml
question: "Can laser cleaning damage Aluminum through overheating?"
answer: "Aluminum's thermal destruction threshold is 500°C (before significant oxidation) and melting point is 660°C. At our operating parameters (4.2 J/cm², 15ns pulse, 12% absorption), peak surface temperature reaches approximately 380°C for 50 nanoseconds before diffusing into the bulk material. This provides a 24% safety margin below oxidation threshold and 42% below melting point. The 15ns pulse duration confines heat to a ~1 micron depth, and high thermal diffusivity (97.1 mm²/s) dissipates heat within 2 microseconds. At 30 kHz repetition rate, cooling time between pulses (33 microseconds) is 16× longer than thermal relaxation time, preventing cumulative heating. Bulk temperature remains below 80°C throughout the process."
dataSource: "thermal_model: thermalDestruction, meltingPoint, energyDensity, pulseWidth, thermalDiffusivity, repetitionRate"
confidence: 91
```

### 6. Expected Outcomes FAQ
**Data Sources:**
- `micro.afterText` - Extract all numerical measurements
- `outcomeMetrics` - Structured outcome data

**Question Template:**
`"What surface quality results should I expect from laser cleaning {materialName}?"`

**Answer Requirements:**
- Extract EXACT measurements from afterText (roughness, reflectivity, etc.)
- Include removal efficiency percentage
- State presence/absence of HAZ (heat-affected zone)
- Include dimensional tolerance preservation
- NO generic ranges unless data unavailable

**Parsing Logic:**
```python
# Extract from afterText
roughness_match = re.search(r'roughness.*?(\d+\.?\d*)\s*(?:microns?|μm)', afterText, re.I)
reflectivity_match = re.search(r'reflectivity.*?(\d+\.?\d*)%?', afterText, re.I)
haz_match = re.search(r'no\s+heat[- ]affected\s+zone|no\s+HAZ', afterText, re.I)

# Extract from outcomeMetrics
removal_efficiency = outcomeMetrics.find("Contaminant Removal Efficiency")
```

**Example (Aluminum):**
```yaml
question: "What surface quality results should I expect from laser cleaning Aluminum?"
answer: "Surface roughness reduces from pre-cleaning baseline to 0.74 microns (Ra). Reflectivity improves from contaminated state (62%) to 89% post-cleaning. Analysis confirms zero heat-affected zones—no microstructural changes, grain growth, or phase transformations detected via metallography. Dimensional tolerances are maintained within ±2 microns of original specifications. Contaminant removal efficiency: 97.3% for aluminum oxide, 95.8% for carbonaceous deposits. Surface chemistry shows activated aluminum ready for bonding/coating with no residual organics (XPS confirmed)."
dataSource: "micro.afterText extraction + outcomeMetrics + surface_analysis_data"
confidence: 96
```

### 7. Application-Specific FAQ
**Data Sources:**
- `applications[]` - Industry list
- Application-specific requirements database

**Question Template:**
`"Why is laser cleaning preferred for {materialName} in {top_application}?"` OR
`"Is laser cleaning suitable for {materialName} in {application} applications?"`

**Answer Requirements:**
- Choose top 1-2 most demanding applications from list
- State industry-specific cleanliness requirements
- Link material properties to application needs
- Provide specific standards/specifications if applicable (ISO, ASTM, MIL-SPEC)
- NO vague benefits—be specific to application

**Application Requirements Database:**
```python
APPLICATION_REQUIREMENTS = {
    "Aerospace": {
        "cleanliness": "IEST-STD-CC1246E Class 50",
        "particle_limit": "< 100 particles/cm² > 5μm",
        "residue": "< 1 mg/0.1m² NVR",
        "damage_tolerance": "no HAZ, no dimensional change > 2μm"
    },
    "Medical": {
        "cleanliness": "ISO 13485",
        "biocompatibility": "ISO 10993",
        "particle_limit": "< 25 particles/cm² > 10μm",
        "residue": "zero organic residue, sterilization-ready"
    },
    "Semiconductor": {
        "cleanliness": "SEMI F21",
        "particle_limit": "< 0.1 particles/cm² > 0.2μm",
        "metal_contamination": "< 1e10 atoms/cm²",
        "damage": "no surface damage > 0.1nm Ra"
    }
    # ... etc
}
```

**Example (Tungsten Carbide - Aerospace):**
```yaml
question: "Why is laser cleaning preferred for Tungsten Carbide in Aerospace applications?"
answer: "Aerospace applications of Tungsten Carbide (cutting tools, wear-resistant coatings, turbine components) require IEST-STD-CC1246E Class 50 cleanliness: < 100 particles/cm² larger than 5μm, and < 1 mg/0.1m² non-volatile residue. Tungsten Carbide's extreme hardness (1600 HV) makes abrasive cleaning ineffective and chemical cleaning impractical due to chemical resistance. Laser cleaning achieves 98.7% contaminant removal with zero chemical residue, meeting aerospace NVR requirements. Critical benefits: (1) No substrate damage—hardness and dimensional tolerances preserved within ±1 micron, (2) No HAZ—microstructure unchanged per ASTM E3-11 metallographic analysis, (3) Particle-free dry process compatible with cleanroom environments, (4) Removes oxidation layers without affecting WC grain structure essential for cutting performance."
dataSource: "applications[Aerospace] + aerospace_standards_db + material_hardness + removal_efficiency + HAZ_analysis"
confidence: 94
```

### 8. Environmental Benefits FAQ (Optional)
**Data Sources:**
- `environmentalImpact[]` - Extract quantified benefits
- Compare to traditional cleaning methods database

**Question Template:**
`"What are the environmental advantages of laser cleaning {materialName}?"`

**Answer Requirements:**
- Use ONLY quantified benefits from environmentalImpact data
- Compare to specific traditional methods (chemical, abrasive, thermal)
- Include actual waste reduction numbers
- Link to sustainability certifications/standards if applicable
- NO vague environmental claims

**Example:**
```yaml
question: "What are the environmental advantages of laser cleaning Aluminum?"
answer: "Compared to traditional alkaline chemical cleaning of aluminum: (1) Chemical waste elimination: 100% reduction—zero hazardous waste streams, no sodium hydroxide or phosphoric acid disposal, (2) Water consumption: zero vs 15-40 liters per m² for chemical bath processes, (3) Energy efficiency: 0.35 kWh/m² vs 2.1 kWh/m² for heated chemical tanks (83% reduction), (4) VOC emissions: zero vs 125-450 g/m² from solvent degreasers, (5) Solid waste: ~2g ablated material per m² captured by HEPA filtration vs 15-30g spent abrasive media per m² requiring disposal. Process supports ISO 14001 environmental management and enables LEED certification points for sustainable manufacturing."
dataSource: "environmentalImpact[] + traditional_methods_comparison_db + energy_calculations"
confidence: 89
```

## Data Quality Requirements

### Confidence Scoring
```python
def calculate_confidence(faq_data_sources):
    confidence = 100
    
    # Deduct for missing data
    if "estimated" in data_sources:
        confidence -= 15
    if "category_average" in data_sources:
        confidence -= 10
    if no_actual_comparison_materials:
        confidence -= 20
    if no_micro_data:
        confidence -= 5
    
    # Deduct for low sample size
    if comparison_materials_count < 5:
        confidence -= 10
    
    return max(confidence, 60)  # minimum 60
```

### Required vs Optional FAQs
**Always Generate:**
1. Contaminant-Specific (if micro.beforeText exists)
2. Cross-Material Comparison (always)
3. Material Challenge (always)
4. Expected Outcomes (if micro.afterText or outcomeMetrics exist)

**Generate If Data Available:**
5. Wavelength/Absorption (if laserAbsorption data exists)
6. Thermal Safety (if thermal properties exist)
7. Application-Specific (if applications list has high-value industries)
8. Environmental (if environmentalImpact has quantified data)

**Minimum:** 4 FAQs per material
**Target:** 6-7 FAQs per material
**Maximum:** 8 FAQs per material

## Implementation Notes

### Cross-Material Query Logic
```python
def get_comparison_materials(material, category, property_name):
    """Get materials for comparison based on property value."""
    all_materials = db.query(category=category, has_property=property_name)
    
    # Get closest neighbors by property value
    sorted_by_property = sorted(all_materials, key=lambda m: m[property_name])
    material_index = sorted_by_property.index(material)
    
    # Get 2 materials above, 2 below, min, max
    neighbors = {
        "lower": sorted_by_property[max(0, material_index-2):material_index],
        "higher": sorted_by_property[material_index+1:min(len(sorted_by_property), material_index+3)],
        "min": sorted_by_property[0],
        "max": sorted_by_property[-1]
    }
    
    return neighbors
```

### Property Extraction from Micro Text
```python
def extract_measurements(text):
    """Extract numerical measurements from micro text."""
    patterns = {
        "roughness": r'roughness.*?(\d+\.?\d*)\s*(?:microns?|μm)',
        "thickness": r'(\d+\.?\d*)\s*(?:to|-)?\s*(\d+\.?\d*)?\s*(?:microns?|μm)',
        "reflectivity": r'reflectivity.*?(\d+\.?\d*)%?',
        "temperature": r'(\d+\.?\d*)\s*°?C',
        "efficiency": r'(\d+\.?\d*)\s*%\s*(?:removal|efficiency)',
    }
    
    measurements = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.I)
        if match:
            measurements[key] = extract_value(match)
    
    return measurements
```

## Quality Checks

Before finalizing FAQs, validate:
1. ✅ No hardcoded comparison values (must query actual materials)
2. ✅ No generic percentage ranges without data source
3. ✅ No marketing language ("exceptional," "revolutionary," "superior")
4. ✅ All numerical comparisons show calculation basis
5. ✅ Confidence score >= 70 (otherwise flag for review)
6. ✅ Each FAQ has valid dataSource string
7. ✅ No contradictions with materialProperties or machineSettings

## Output Format

```yaml
faqs:
  - question: "What types of contaminants can laser cleaning remove from Aluminum?"
    answer: "..." # 100-300 words, factual, data-driven
    dataSource: "micro.beforeText + outcomeMetrics[0]"
    confidence: 92
  
  - question: "How does Aluminum compare to other metals for laser cleaning?"
    answer: "..." # 100-300 words with specific material comparisons
    dataSource: "database_comparison: thermalConductivity across Metal category (n=47)"
    confidence: 98
  
  # ... 4-8 total FAQs
```

## Python Integration

Add to YAML processor pipeline:

```python
from faq_generator import MaterialFAQGenerator

# In process_material_yaml()
faq_generator = MaterialFAQGenerator(materials_database)
faqs = faq_generator.generate_faqs(
    material_data=current_material,
    category_materials=get_category_materials(current_material.category),
    micro_data=current_material.micro
)

# Add to output YAML
output_yaml['faqs'] = [faq.to_dict() for faq in faqs]
```
