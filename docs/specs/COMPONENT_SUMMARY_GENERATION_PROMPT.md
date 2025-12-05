# Component Summary Generation Prompt

## Task Overview
Generate material-specific summary descriptions for each interactive component on the Settings page. These summaries explain what each component does and what problems it helps users solve, customized to the specific material being cleaned.

## Output Location & YAML Structure

Add `component_summaries` to the settings YAML file for each material, positioned after the `laserMaterialInteraction` block and before `material_challenges`. This placement groups all material-specific metadata together before the challenges/troubleshooting data.

### Placement in Settings YAML Structure:

```yaml
# {material}-settings.yaml

name: Aluminum                          # Material identity
slug: aluminum
category: metal
subcategory: non-ferrous
content_type: unified_settings
schema_version: 4.0.0
active: true

# ... author block ...

title: Aluminum Laser Cleaning Settings
settings_description: |                 # Existing overall description
  [General material cleaning description...]

# ... breadcrumb, images blocks ...

machineSettings:                        # Machine parameters
  powerRange: { ... }
  wavelength: { ... }
  # ... other settings ...

thermalProperties:                      # Thermal data
  thermalDiffusivity: { ... }
  thermalConductivity: { ... }
  thermalDestructionPoint: { ... }

laserMaterialInteraction:              # Laser interaction data
  laserDamageThreshold: { ... }
  ablationThreshold: { ... }
  thermalShockResistance: { ... }
  reflectivity: { ... }

# ══════════════════════════════════════════════════════════════════════════════
# NEW: Component Summaries - Insert HERE (after laserMaterialInteraction)
# ══════════════════════════════════════════════════════════════════════════════
component_summaries:
  machine_settings:
    title: Machine Settings
    description: |
      [2-3 sentences specific to this material explaining what the component 
      shows and what user problem it solves.]
  
  material_safety_heatmap:
    title: Material Safety Heatmap
    description: |
      [2-3 sentences specific to this material...]
  
  energy_coupling_heatmap:
    title: Energy Coupling Heatmap
    description: |
      [2-3 sentences specific to this material...]
  
  thermal_stress_heatmap:
    title: Thermal Stress Heatmap
    description: |
      [2-3 sentences specific to this material...]
  
  process_effectiveness_heatmap:
    title: Process Effectiveness Heatmap
    description: |
      [2-3 sentences specific to this material...]
  
  heat_buildup_simulator:
    title: Heat Buildup Simulator
    description: |
      [2-3 sentences specific to this material...]
  
  diagnostic_center:
    title: Diagnostic Center
    description: |
      [2-3 sentences specific to this material...]
  
  research_citations:
    title: Research Citations
    description: |
      [2-3 sentences specific to this material...]
  
  faq_settings:
    title: Settings FAQ
    description: |
      [2-3 sentences specific to this material...]
  
  dataset_download:
    title: Dataset Download
    description: |
      [2-3 sentences specific to this material...]
  
  parameter_relationships:
    title: Parameter Relationships
    description: |
      [2-3 sentences specific to this material...]

# ══════════════════════════════════════════════════════════════════════════════

material_challenges:                    # Challenges data (existing)
  thermal_management: [...]
  surface_characteristics: [...]
  contamination_challenges: [...]

common_issues: [...]                    # Troubleshooting (if present)

preservedData:                          # Generation metadata
  generationMetadata: { ... }
```

### Field Structure

Each component summary has two fields:
- **`title`**: Display name for the component (used in UI headers)
- **`description`**: Material-specific explanation (2-3 sentences, YAML multiline string)

---

## Component Definitions

Use these base descriptions to generate material-specific summaries. Each summary should incorporate the material's unique properties, challenges, and use cases.

### 1. Machine Settings (`machine_settings`)

**Base Description:**
Displays a table of recommended laser parameters (power, pulse width, repetition rate, scan speed, etc.) with their optimal values, units, and ranges.

**User Problems Solved:**
- "What settings should I use for this material?"
- Eliminates guesswork when configuring the laser machine
- Provides validated starting points instead of trial-and-error

**Generation Instructions:**
Reference the material's specific parameters (from `machineSettings` in the YAML). Mention any parameters that are particularly critical for this material (e.g., low power for delicate materials, specific wavelength for certain absorption characteristics).

---

### 2. Material Safety Heatmap (`material_safety_heatmap`)

**Base Description:**
Interactive 2D heatmap showing safe vs. dangerous operating zones based on power and pulse width combinations. Color-coded from green (safe) to red (damage risk).

**User Problems Solved:**
- "What settings will damage this material?"
- Prevents costly mistakes by visualizing thermal damage thresholds
- Shows the "safe operating envelope" at a glance

**Generation Instructions:**
Reference the material's `laserDamageThreshold`, `thermalDestruction` temperature, and thermal properties. For delicate materials (textiles, wood), emphasize the narrow safe zone. For robust materials (metals, ceramics), mention the wider operating margins.

---

### 3. Energy Coupling Heatmap (`energy_coupling_heatmap`)

**Base Description:**
Visualizes how efficiently laser energy transfers to the material surface across different power/pulse combinations. Considers reflectivity and absorption properties.

**User Problems Solved:**
- "Why isn't the laser cleaning effectively?"
- Identifies settings where energy is being reflected/wasted
- Helps optimize efficiency and reduce operating costs

**Generation Instructions:**
Reference the material's `absorptivity`, `reflectivity`, and `absorptionCoefficient`. For highly reflective materials (polished metals), emphasize the energy coupling challenge. For absorptive materials (carbon, dark surfaces), mention the high energy transfer efficiency.

---

### 4. Thermal Stress Heatmap (`thermal_stress_heatmap`)

**Base Description:**
Shows risk of thermal stress, warping, or distortion across parameter combinations based on thermal expansion and heat dissipation properties.

**User Problems Solved:**
- "Why is my material warping after cleaning?"
- Prevents structural damage on sensitive/thin materials
- Critical for precision parts where dimensional accuracy matters

**Generation Instructions:**
Reference `thermalExpansionCoefficient`, `thermalShockResistance`, and `thermalDiffusivity`. For materials with high thermal expansion (plastics, some metals), emphasize warping risk. For brittle materials (glass, ceramics, stone), emphasize thermal shock cracking risk.

---

### 5. Process Effectiveness Heatmap (`process_effectiveness_heatmap`)

**Base Description:**
Maps cleaning effectiveness across power/pulse ranges, showing where contamination removal is optimal vs. insufficient.

**User Problems Solved:**
- "Why do I still see residue after cleaning?"
- Balances between under-cleaning and over-cleaning
- Optimizes for throughput while maintaining quality

**Generation Instructions:**
Reference `ablationThreshold` and typical contaminants for this material category. For materials with tough contamination (rust on steel, carbon deposits), emphasize the need for adequate energy. For delicate materials, emphasize finding the narrow effective zone.

---

### 6. Heat Buildup Simulator (`heat_buildup_simulator`)

**Base Description:**
Animated simulation showing temperature accumulation during multi-pass cleaning. Visualizes how heat builds up over consecutive passes.

**User Problems Solved:**
- "How many passes can I do before overheating?"
- Determines optimal cooling intervals between passes
- Prevents cumulative thermal damage on sensitive materials

**Generation Instructions:**
Reference `thermalDiffusivity`, `thermalConductivity`, and recommended `passCount`. Materials with low thermal diffusivity (plastics, wood, some stone) heat up quickly and need fewer passes. Materials with high thermal diffusivity (metals like copper, aluminum) dissipate heat well and can handle more passes.

---

### 7. Diagnostic Center (`diagnostic_center`)

**Base Description:**
Tabbed interface with two sections: **Material Challenges** (known difficulties with thermal management, surface characteristics) and **Troubleshooting** (symptom → cause → solution guides).

**User Problems Solved:**
- "My results look wrong—what's causing this?"
- Provides immediate troubleshooting guidance
- Lists preventive measures to avoid common issues

**Generation Instructions:**
Reference the material's `material_challenges` and `common_issues` from the YAML. Mention 1-2 specific challenges unique to this material category (e.g., charring for wood, oxide reformation for metals, melting for plastics).

---

### 8. Research Citations (`research_citations`)

**Base Description:**
Lists academic and industry research papers supporting the parameter recommendations, with links to sources.

**User Problems Solved:**
- "Where did these recommendations come from?"
- Builds trust through scientific backing
- Enables deeper research for advanced users

**Generation Instructions:**
If `research_library` exists in the YAML, mention that peer-reviewed research supports the recommendations. Reference the material's industrial importance and research relevance.

---

### 9. FAQ Settings (`faq_settings`)

**Base Description:**
Frequently asked questions specific to configuring and troubleshooting this material's laser cleaning settings.

**User Problems Solved:**
- Quick answers to common questions
- Reduces support requests
- Self-service troubleshooting

**Generation Instructions:**
Reference common questions operators ask about this material type. Mention any material-specific quirks or common misconceptions.

---

### 10. Dataset Download (`dataset_download`)

**Base Description:**
Provides downloadable JSON datasets containing all machine settings, material properties, and configuration data.

**User Problems Solved:**
- "Can I import these settings into my system?"
- Enables automation and system integration
- Useful for documentation and compliance records

**Generation Instructions:**
Mention the data available for this specific material. For industrial materials (metals, composites), emphasize integration with automated systems. For heritage/conservation materials (stone, textiles), emphasize documentation for compliance.

---

### 11. Parameter Relationships (`parameter_relationships`)

**Base Description:**
Network visualization showing how parameters interact and affect each other (e.g., increasing power requires adjusting scan speed).

**User Problems Solved:**
- "If I change one setting, what else needs adjustment?"
- Shows parameter dependencies and trade-offs
- Helps understand the "why" behind recommendations

**Generation Instructions:**
Reference the most critical parameter relationships for this material. For thermally sensitive materials, emphasize power↔speed↔passes relationships. For materials with absorption challenges, emphasize wavelength↔power relationships.

---

## Generation Template

For each component, generate a summary following this pattern:

```
[Component] provides [what it shows/does] for [material name] laser cleaning.
[Material-specific insight based on its properties].
This helps operators [specific problem it solves for this material].
```

**Example for Aluminum - Heat Buildup Simulator:**
```yaml
heat_buildup_simulator: |
  Simulates temperature accumulation during multi-pass aluminum cleaning, showing how heat builds through consecutive passes. Aluminum's excellent thermal conductivity (205 W/m·K) means heat dissipates quickly, allowing for higher pass counts without damage. This helps operators plan efficient multi-pass strategies while staying well below the 660°C melting point.
```

**Example for Oak Wood - Material Safety Heatmap:**
```yaml
material_safety_heatmap: |
  Shows safe operating zones for oak laser cleaning, with power and pulse width combinations color-coded from safe (green) to damage risk (red). Oak's charring threshold of 250°C creates a narrow safe zone that requires careful parameter selection. This prevents charring and discoloration by clearly visualizing the boundary between effective cleaning and thermal damage.
```

---

## Input Data Required

To generate accurate summaries, the generator needs access to:

1. **From materials YAML** (`{material}-laser-cleaning.yaml`):
   - `material_characteristics` (thermal, optical, mechanical properties)
   - `laser_material_interaction` (thresholds, absorption, reflectivity)
   - Material category/subcategory for context

2. **From settings YAML** (`{material}-settings.yaml`):
   - `machineSettings` (recommended parameters)
   - `material_challenges` (known difficulties)
   - `common_issues` (troubleshooting data)

3. **From category knowledge**:
   - Typical use cases for this material type
   - Industry-specific concerns (heritage, industrial, medical, etc.)
   - Common contaminants and cleaning scenarios

---

## Quality Guidelines

**DO:**
- Use specific numeric values from the YAML data
- Reference material properties by name
- Mention industry-relevant applications
- Keep summaries to 2-3 sentences
- Use active voice and operator-focused language

**DON'T:**
- Use generic descriptions that could apply to any material
- Include technical jargon without context
- Make claims not supported by the YAML data
- Exceed 3 sentences per summary
- Copy the base description verbatim

---

## Validation

Each generated summary should:
- [ ] Reference at least one specific property value
- [ ] Mention a problem unique to this material type
- [ ] Be useful to an operator configuring the machine
- [ ] Be factually accurate based on YAML data
- [ ] Read naturally in context of the settings page

---

## Example Complete Output

```yaml
# In aluminum-settings.yaml (insert after laserMaterialInteraction block)

component_summaries:
  machine_settings:
    title: Machine Settings
    description: |
      Displays recommended laser parameters for aluminum cleaning, including the optimal 80-120W power range and 100-200ns pulse width. The high thermal conductivity of aluminum (237 W/m·K) allows for aggressive settings that would damage other materials. Use these validated starting points to avoid the trial-and-error typically required when cleaning reflective metals.
  
  material_safety_heatmap:
    title: Material Safety Heatmap
    description: |
      Interactive heatmap showing aluminum's safe operating zones across power and pulse width combinations. The 660°C melting point and excellent heat dissipation create a wide safe zone compared to other materials. This visualization prevents surface damage by clearly marking the boundary where heat accumulation exceeds aluminum's thermal limits.
  
  energy_coupling_heatmap:
    title: Energy Coupling Heatmap
    description: |
      Maps how efficiently laser energy transfers to aluminum surfaces, accounting for its high reflectivity (0.92 at 1064nm). Polished aluminum reflects most incident light, requiring higher power settings than the heatmap's green zones might suggest for oxidized surfaces. Use this to understand why cleaning parameters differ dramatically between polished and oxidized aluminum.
  
  thermal_stress_heatmap:
    title: Thermal Stress Heatmap
    description: |
      Shows thermal stress and warping risk for aluminum across parameter combinations. Aluminum's high thermal expansion coefficient (23 μm/m·K) makes thin sheets susceptible to distortion. This helps prevent warping on precision parts by identifying parameter zones that keep thermal gradients within acceptable limits.
  
  process_effectiveness_heatmap:
    title: Process Effectiveness Heatmap
    description: |
      Maps cleaning effectiveness for aluminum oxide removal across power and pulse settings. The ablation threshold of 2.5 J/cm² for aluminum oxide is relatively low, meaning effective cleaning occurs at moderate power levels. This balances thoroughness against the risk of substrate damage.
  
  heat_buildup_simulator:
    title: Heat Buildup Simulator
    description: |
      Simulates temperature accumulation during multi-pass aluminum cleaning. Aluminum's excellent thermal diffusivity (97 mm²/s) allows heat to spread rapidly, enabling higher pass counts without localized overheating. Plan multi-pass strategies knowing aluminum handles repeated passes better than most materials.
  
  diagnostic_center:
    title: Diagnostic Center
    description: |
      Provides aluminum-specific troubleshooting for challenges like rapid oxide reformation and reflectivity variations. Aluminum re-oxidizes within minutes of cleaning in ambient air, a unique challenge addressed in the prevention guidance. Use the symptom-based troubleshooting when results don't match expectations.
  
  research_citations:
    title: Research Citations
    description: |
      References peer-reviewed research on aluminum laser cleaning, including studies on oxide layer removal and aerospace applications. The parameter recommendations are backed by published data from industrial and academic sources. Access the full citations for compliance documentation or deeper technical understanding.
  
  faq_settings:
    title: Settings FAQ
    description: |
      Answers common questions about aluminum laser cleaning, including oxide management and surface finish expectations. Addresses the frequent question of why freshly cleaned aluminum dulls quickly (rapid re-oxidation). Quick reference for operators new to aluminum cleaning.
  
  dataset_download:
    title: Dataset Download
    description: |
      Download aluminum-specific machine settings and material properties as JSON datasets. Integrate these validated parameters directly into automated cleaning systems or CNC controllers. Useful for documenting cleaning procedures for aerospace or automotive quality compliance.
  
  parameter_relationships:
    title: Parameter Relationships
    description: |
      Visualizes how aluminum cleaning parameters interact—increasing power typically requires higher scan speeds to prevent heat buildup. The network shows why aluminum's high thermal conductivity creates different trade-offs than steel or titanium. Understand parameter dependencies before making adjustments.
```
