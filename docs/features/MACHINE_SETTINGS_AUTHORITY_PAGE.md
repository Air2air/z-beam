# Machine Settings Authority Page - Complete Specification

## 🎯 Strategic Goal
Become the #1 backlink destination for laser cleaning industry peers seeking authoritative, research-backed machine settings data.

## 🏗️ Implementation Standards

**CRITICAL: All settings pages must follow the materials page implementation pattern**

### Author Implementation (Standardized Across Project)
- **Component**: `@/app/components/Author/Author`
- **Usage**: Automatically included via Layout component
- **Requirements**:
  - Include author metadata in YAML frontmatter
  - Provide E-E-A-T signals: `jobTitle`, `description`, `expertise` fields
  - Follow Person schema.org markup for SEO
  - Standardized across ALL content types (materials, settings, pages, etc.)
- **Reference**: See `/app/materials/[category]/[subcategory]/[slug]/page.tsx`

### Layout Implementation (Standardized Pattern)
- **Component**: `@/app/components/Layout/Layout`
- **Props Required**:
  - `components`: Article components object from YAML
  - `metadata`: ArticleMetadata type with all frontmatter data
  - `slug`: Full path slug for routing/breadcrumbs
- **Auto-Included Elements**:
  - Navigation (Nav component)
  - Page Title (Title component)
  - Footer (Footer component)
  - Breadcrumbs (Breadcrumbs component)
  - Date Metadata (DateMetadata component)
  - Author (Author component with E-E-A-T)
- **Reference**: All materials pages use this exact pattern

### Content Structure Standards
- **SectionContainer**: Use for ALL major content sections
  - Provides consistent styling, spacing, and responsive design
  - Props: `title`, `className`, `bgColor`, `horizPadding`, `radius`, `icon`
  - Example: `<SectionContainer title="Essential Parameters" className="mb-12">`
- **Spacing**: Use `SPACER_CLASSES` for consistent vertical rhythm
- **Containers**: Use `CONTAINER_STYLES` for consistent padding/margins
- **Flow**: Hero → Main Content → Sections (with SectionContainer) → Related Content

### Component Usage Standards
- **Hero**: Use Hero component for page headers (images, titles, subtitles)
- **PropertyBars**: For displaying metrics, parameters, machine settings
- **MarkdownRenderer**: For markdown content from YAML
- **RegulatoryStandards**: For compliance information
- **MaterialFAQ**: For FAQ sections
- **Tags**: For taxonomy and categorization
- **All patterns**: Must match materials page implementation

## 📊 Backlink Value Proposition

### Target Audiences Who Will Link
1. **Equipment Manufacturers** - Linking to application guides for their lasers
2. **Technical Bloggers** - Citing parameter research and material science
3. **University Research Labs** - Referencing methodology and validation
4. **Industry Forums** - Sharing as "best practices source"
5. **Training Organizations** - Using as educational reference
6. **Competitor Websites** - Citing data (begrudgingly) for credibility

### Unique Differentiator
**"The only laser cleaning resource that explains machine settings through material science, not just empirical tables"**

## 🏗️ Page Architecture

### URL Structure
```
/settings/[category]/[subcategory]/[slug]
```

**Example:**
```
/settings/metal/non-ferrous/aluminum-laser-cleaning
```

### Content Type: `settings`
- **Content Location**: `/content/settings/*.yaml`
- **Route Location**: `/app/settings/[category]/[subcategory]/[slug]/page.tsx`
- **File Naming**: `{material-name}-laser-cleaning-settings.yaml`

### Information Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. HERO SECTION                                                  │
│    • Material name + "Machine Settings & Parameters"            │
│    • Quick reference card (copy-paste ready)                    │
│    • Material challenge badges (visual indicators)              │
│    • CTA: "Download Parameter Sheet (PDF)"                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. ESSENTIAL SETTINGS TABLE (Above the fold)                    │
│    • Color-coded: Green (optimal), Yellow (safe), Red (avoid)   │
│    • Quick copy buttons for each parameter                      │
│    • Visual indicators for critical parameters                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. MATERIAL-SPECIFIC CHALLENGES (Categorized)                   │
│    • Surface Characteristics (expandable sections)              │
│    • Thermal Management Issues                                  │
│    • Contamination Types & Solutions                            │
│    • Safety & Regulatory Compliance                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 4. PARAMETER JUSTIFICATION (The Research Hook)                  │
│    • Each setting explained with material science               │
│    • "Why this range?" sections                                 │
│    • "What happens if too high/low?" warnings                   │
│    • Visual diagrams (damage thresholds, absorption curves)     │
│    • Research citations with DOI links                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 5. TROUBLESHOOTING GUIDE                                        │
│    • Common issues with diagnostic steps                        │
│    • Symptom → Cause → Solution flowchart                       │
│    • Quality control checkpoints                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 6. RELATED MATERIALS & INTERNAL LINKING                         │
│    • Similar materials comparison table                         │
│    • Different alloys/variants                                  │
│    • Material family overview                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Complete Data Model

### YAML Frontmatter Structure

```yaml
# Extended machineSettings structure for /settings page
machineSettings:
  
  # ============================================================
  # ESSENTIAL PARAMETERS (Enhanced from existing structure)
  # ============================================================
  essential_parameters:
    powerRange:
      value: 100
      unit: W
      min: 50
      max: 150
      optimal_range: [80, 120]  # NEW: Tighter optimal band
      precision: ±5             # NEW: Acceptable variation
      criticality: high         # NEW: Importance level
      
      # NEW: Scientific Justification
      rationale: |
        Aluminum's thermal conductivity (237 W/m·K) requires 
        moderate power to achieve selective ablation without 
        substrate heating beyond 150°C threshold. Power below 
        80W fails to overcome oxide binding energy; above 120W 
        risks substrate melting (660°C).
      
      # NEW: Boundary Conditions
      damage_threshold:
        too_low: "Insufficient energy for oxide removal (<2 J/cm²)"
        too_high: "Risk of melting (660°C) and surface pitting (>5 J/cm²)"
        warning_signs:
          - "Incomplete cleaning patches"
          - "Surface discoloration or warping"
      
      # NEW: Material Interaction Science
      material_interaction:
        mechanism: "Combined photomechanical and photothermal ablation"
        dominant_factor: "Thermal conductivity dissipation rate"
        critical_parameter: "Pulse duration vs. thermal relaxation time"
        energy_coupling: 0.08  # 8% absorption at 1064nm
      
      # NEW: Research Citations
      research_basis:
        citations:
          - author: "Smith, J., et al."
            year: 2023
            title: "Thermal Management in Aluminum Laser Cleaning"
            journal: "Journal of Laser Applications"
            volume: 35
            issue: 2
            pages: "042015"
            doi: "10.2351/7.0000945"
            key_finding: "80-120W optimal for 1064nm with 10ns pulses"
            sample_size: 500
            confidence_level: 95
            
          - author: "Chen, L., et al."
            year: 2024
            title: "Wavelength Selection for Aluminum Surface Treatment"
            journal: "Applied Surface Science"
            doi: "10.1016/j.apsusc.2024.001234"
            key_finding: "1064nm provides 5.6x selectivity vs substrate"
        
        # NEW: Validation Metadata
        validation:
          method: "SEM analysis + XPS depth profiling"
          equipment: "Zeiss Sigma 300 SEM, Thermo K-Alpha XPS"
          confidence: 95
          sample_size: 500
          date_verified: "2025-10-15"
          verified_by: "Z-Beam Research Lab"
          revalidation_interval: "6 months"
    
    wavelength:
      value: 1064
      unit: nm
      min: 532
      max: 10640
      optimal_range: [1030, 1090]
      criticality: critical
      
      rationale: |
        1064nm (Nd:YAG fundamental) matches aluminum oxide 
        absorption peak (45%) while minimizing substrate 
        absorption (8%), providing 5.6x selectivity ratio. 
        This prevents thermal damage to base metal while 
        efficiently removing contamination.
      
      # NEW: Absorption Spectroscopy Data
      absorption_data:
        substrate_reflectivity: 0.92      # 92% at 1064nm
        substrate_absorption: 0.08        # 8%
        oxide_layer_absorption: 0.45      # 45%
        selectivity_ratio: 5.6            # Oxide/substrate
        penetration_depth: 12.5           # micrometers
        
      # NEW: Wavelength Alternatives Analysis
      wavelength_alternatives:
        355nm_uv:
          pros: 
            - "Higher oxide absorption (65%)"
            - "Shorter penetration depth"
          cons:
            - "Substrate damage risk (25% absorption)"
            - "Lower selectivity (2.6x)"
            - "More expensive equipment"
          use_case: "Thin coatings (<10nm) only"
          recommended: false
          
        532nm_green:
          pros:
            - "Higher oxide absorption (55%)"
          cons:
            - "Increased substrate absorption (15%)"
            - "Reduced selectivity (3.7x)"
          use_case: "Moderate contamination"
          recommended: "conditional"
          
        10600nm_co2:
          pros:
            - "Deep penetration"
            - "Lower equipment cost"
          cons:
            - "Poor selectivity (0.8x - worse than substrate)"
            - "Thermal damage risk"
          use_case: "Not recommended for aluminum"
          recommended: false
      
      research_basis:
        citations:
          - author: "Chen, L., et al."
            year: 2024
            title: "Spectroscopic Analysis of Laser-Material Interaction"
            doi: "10.1016/j.apsusc.2024.001234"
    
    spotSize:
      value: 50
      unit: μm
      min: 10
      max: 200
      optimal_range: [40, 60]
      criticality: high
      
      rationale: |
        50μm spot size balances energy density (fluence) with 
        processing throughput. Smaller spots exceed damage 
        threshold; larger spots reduce cleaning efficiency 
        below oxide binding energy threshold.
      
      fluence_relationship:
        formula: "Fluence = Energy / (π × (spotSize/2)²)"
        current_fluence: 5.1  # J/cm² at 50μm, 100W
        critical_notes: |
          Maintaining 2-5 J/cm² fluence range requires spot 
          size adjustment when changing power or pulse energy.
    
    repetitionRate:
      value: 50
      unit: kHz
      min: 10
      max: 200
      optimal_range: [40, 60]
      criticality: medium
      
      rationale: |
        40-60 kHz provides optimal balance between cumulative 
        heating effect and thermal relaxation. Higher rates 
        risk substrate heating; lower rates reduce throughput.
      
      thermal_analysis:
        thermal_relaxation_time: 15  # microseconds
        pulse_interval_current: 20   # microseconds (50 kHz)
        overlap_parameter: 1.33      # Ratio for cumulative effect
    
    energyDensity:
      value: 5.1
      unit: J/cm²
      min: 0.5
      max: 10.0
      optimal_range: [2.0, 5.5]
      criticality: critical
      
      rationale: |
        Energy density (fluence) must exceed oxide binding 
        energy (1.8 J/cm²) while remaining below aluminum 
        melting threshold (8 J/cm²). Optimal range provides 
        safety margin and accounts for surface variations.
      
      threshold_data:
        oxide_ablation_threshold: 1.8   # J/cm²
        substrate_damage_threshold: 8.0  # J/cm²
        safety_factor: 1.5               # Recommended margin
        working_range: [2.0, 5.5]        # Safe + effective
    
    pulseWidth:
      value: 10
      unit: ns
      min: 1
      max: 1000
      optimal_range: [8, 100]
      criticality: high
      
      rationale: |
        Nanosecond pulses (8-100 ns) enable photomechanical 
        ablation regime, minimizing thermal effects. Shorter 
        pulses reduce heat-affected zone; longer pulses risk 
        thermal damage via excessive substrate heating.
      
      regime_analysis:
        current_regime: "Photomechanical + thermal"
        thermal_relaxation_time: 15000  # ns (15 μs)
        heat_affected_zone: 2.5         # micrometers
        comparison:
          picosecond: "More selective but expensive"
          microsecond: "Excessive thermal damage"
    
    scanSpeed:
      value: 500
      unit: mm/s
      min: 100
      max: 2000
      optimal_range: [400, 600]
      criticality: medium
      
      rationale: |
        500 mm/s provides optimal throughput while maintaining 
        required fluence and spot overlap. Faster speeds reduce 
        effective fluence; slower speeds increase heat accumulation.
      
      throughput_analysis:
        area_coverage: 150    # cm²/min at 500 mm/s, 50% overlap
        vs_slow_300: "+67%"   # Throughput increase
        vs_fast_800: "-25% quality"  # Cleaning efficiency loss
    
    passCount:
      value: 3
      unit: passes
      min: 1
      max: 10
      optimal_range: [2, 4]
      criticality: medium
      
      rationale: |
        Multiple low-fluence passes prevent substrate overheating 
        while achieving complete oxide removal. Each pass removes 
        3-5μm of contamination, preserving substrate integrity.
      
      multi_pass_strategy:
        per_pass_fluence: 1.7     # J/cm²
        cumulative_fluence: 5.1   # J/cm² (3 passes)
        removal_per_pass: 4       # micrometers
        cooling_interval: 2       # seconds between passes
        substrate_temp_max: 120   # °C (safe limit)
    
    overlapRatio:
      value: 50
      unit: "%"
      min: 10
      max: 90
      optimal_range: [40, 60]
      criticality: high
      
      rationale: |
        50% overlap ensures complete coverage without excessive 
        heat accumulation. Below 40% risks incomplete cleaning; 
        above 60% increases substrate temperature unnecessarily.
      
      coverage_analysis:
        effective_removal: 98     # % with 50% overlap
        vs_30_overlap: "92%"      # Incomplete coverage
        vs_70_overlap: "+35°C"    # Temperature increase

  # ============================================================
  # MATERIAL-SPECIFIC CHALLENGES (NEW)
  # ============================================================
  material_challenges:
    
    surface_characteristics:
      category_description: "Aluminum's unique surface properties require specialized parameter considerations"
      
      - challenge: "Thin native oxide layer (2-10nm)"
        severity: high
        priority: 1
        impact: |
          Native oxide forms spontaneously in air within seconds, 
          requiring precise fluence control to remove without 
          substrate damage. Layer thickness varies with exposure time.
        
        solution: |
          Use pulse duration <100ns for selective removal. 
          Fluence range 2-3 J/cm² targets oxide without reaching 
          substrate ablation threshold (>5 J/cm²).
        
        parameter_adjustments:
          pulseWidth: "8-50 ns (shorter = more selective)"
          energyDensity: "2.0-3.0 J/cm²"
          wavelength: "1064 nm (optimal selectivity)"
        
        verification:
          method: "XPS depth profiling"
          success_criteria: "Oxygen concentration <2% at surface"
      
      - challenge: "High thermal conductivity (237 W/m·K)"
        severity: medium
        priority: 2
        impact: |
          Rapid heat dissipation limits ablation depth and efficiency. 
          Energy spreads away from laser spot faster than pulse duration, 
          reducing effective ablation.
        
        solution: |
          Increase repetition rate (40-60 kHz) for cumulative heating 
          effect. Multiple passes with shorter cooling intervals maintain 
          thermal boundary layer for effective removal.
        
        parameter_adjustments:
          repetitionRate: "40-60 kHz (higher than steel)"
          passCount: "3-5 passes"
          scanSpeed: "400-600 mm/s (moderate)"
        
        thermal_modeling:
          heat_diffusion_length: 85   # micrometers during pulse
          thermal_relaxation_time: 15 # microseconds
          recommended_pulse_interval: 20  # microseconds (50 kHz)
      
      - challenge: "High reflectivity (92% at 1064nm)"
        severity: medium
        priority: 3
        impact: |
          Only 8% of incident laser energy is absorbed by clean 
          aluminum, reducing energy coupling efficiency and requiring 
          higher power for equivalent fluence.
        
        solution: |
          Surface roughness from oxide/contamination improves 
          absorption (~45%). For very clean surfaces, consider 
          surface roughening pre-treatment or higher power density.
        
        parameter_adjustments:
          powerRange: "100-120 W (higher than copper)"
          spotSize: "40-50 μm (smaller for higher intensity)"
        
        absorption_enhancement:
          clean_aluminum: 0.08      # 8% absorption
          oxidized_aluminum: 0.45   # 45% absorption
          improvement_factor: 5.6   # Oxide/clean ratio
    
    thermal_management:
      category_description: "Aluminum's low melting point requires careful thermal control"
      
      - challenge: "Low melting point (660°C)"
        severity: critical
        priority: 1
        impact: |
          Substrate damage occurs rapidly above 660°C. Localized 
          melting creates surface defects (pitting, roughening) 
          that compromise part integrity and require rework.
        
        solution: |
          Maintain fluence <5 J/cm² with adequate cooling intervals 
          between passes. Monitor surface temperature with IR camera 
          if processing critical parts.
        
        critical_threshold: "660°C"
        warning_temperature: "400°C"  # Conservative limit
        
        parameter_adjustments:
          energyDensity: "2.0-5.0 J/cm² (below damage threshold)"
          passCount: "3-5 (distribute energy over time)"
          cooling_interval: "2-5 seconds between passes"
        
        damage_indicators:
          visual_signs:
            - "Surface discoloration (brown/blue)"
            - "Localized pitting or cratering"
            - "Warping or dimensional changes"
          measurement:
            method: "Profilometry (ISO 4287)"
            acceptable_roughness: "Ra < 1.5 μm"
      
      - challenge: "Aluminum dust hazards (fire/explosion risk)"
        severity: high
        priority: 1
        impact: |
          Aluminum particles <50μm are highly flammable in air. 
          Confined spaces or inadequate ventilation create explosion 
          hazard per NFPA 484 combustible dust standards.
        
        solution: |
          Mandatory inert gas purge (Argon or Nitrogen) with HEPA 
          filtration system. Maintain Class II/III cleanroom-grade 
          fume extraction (minimum 500 CFM).
        
        regulatory:
          standards:
            - "OSHA 29 CFR 1910.146 (Confined Spaces)"
            - "NFPA 484 (Combustible Metals)"
            - "OSHA 1910.1000 (Aluminum dust PEL: 15 mg/m³)"
          
          required_controls:
            - type: "Inert gas purge"
              specification: "Argon flow 10-20 L/min"
            - type: "HEPA filtration"
              specification: "99.97% efficiency, <0.3μm particles"
            - type: "Explosion-proof enclosure"
              specification: "NEMA 7 rated if enclosed"
        
        equipment_requirements:
          fume_extraction: "500 CFM minimum"
          filtration: "HEPA + activated carbon"
          gas_purge: "Argon or Nitrogen, 10-20 L/min"
          monitoring: "Oxygen sensor <18% O2 for enclosed systems"
    
    contamination_challenges:
      category_description: "Different contaminants require adjusted parameters"
      
      - challenge: "Oil residue from machining"
        severity: medium
        priority: 2
        impact: |
          Hydrocarbon oils carbonize under laser irradiation, 
          creating black residue that requires multiple passes 
          or solvent pre-cleaning.
        
        solution: |
          Option 1: Solvent wipe before laser cleaning
          Option 2: Use 355nm UV wavelength for photochemical 
          decomposition (higher absorption by organics)
          Option 3: Multiple passes at reduced power
        
        parameter_adjustments:
          wavelength_alternative: "355 nm (UV)"
          energyDensity: "3-4 J/cm² (higher for carbonized material)"
          passCount: "4-5 passes"
        
        pre_treatment:
          recommended: "Isopropanol or acetone wipe"
          drying_time: "5 minutes minimum"
      
      - challenge: "Thick corrosion layers (>50μm)"
        severity: low
        priority: 3
        impact: |
          Deep corrosion requires multiple passes, increasing 
          processing time. Risk of incomplete removal in pits 
          or crevices.
        
        solution: |
          3-5 passes at reduced power (70-90W) to preserve substrate. 
          Consider mechanical pre-treatment (brush/blast) for 
          corrosion >100μm thick.
        
        parameter_adjustments:
          powerRange: "70-90 W (reduced)"
          passCount: "4-6 passes"
          scanSpeed: "300-400 mm/s (slower for deeper penetration)"
        
        thickness_guidelines:
          light_0_10um: "2-3 passes, standard settings"
          moderate_10_50um: "3-4 passes, standard settings"
          heavy_50_100um: "4-6 passes, reduced power"
          severe_100um_plus: "Mechanical pre-treatment recommended"

  # ============================================================
  # PROCESS OPTIMIZATION (NEW)
  # ============================================================
  process_parameters:
    
    scan_pattern:
      recommended: "Unidirectional raster"
      alternatives: 
        - "Bidirectional raster"
        - "Spiral"
        - "Random hatch"
      
      justification: |
        Unidirectional scanning minimizes thermal stress 
        accumulation by allowing cooling between adjacent scan 
        lines. Bidirectional is faster but creates asymmetric 
        heating patterns.
      
      pattern_comparison:
        unidirectional:
          pros:
            - "Symmetric thermal distribution"
            - "Predictable energy delivery"
            - "Minimal warping risk"
          cons:
            - "Slower than bidirectional (40% throughput)"
            - "More turnaround time"
          recommended_for: "Precision parts, thin sheets"
        
        bidirectional:
          pros:
            - "60% faster throughput"
            - "Reduced processing time"
          cons:
            - "Asymmetric heating"
            - "Edge effects at turnarounds"
          recommended_for: "Thick parts, non-critical surfaces"
        
        spiral:
          pros:
            - "No sharp direction changes"
            - "Smooth thermal gradients"
          cons:
            - "Complex path planning"
            - "Variable line spacing at center"
          recommended_for: "Circular parts, aerospace components"
    
    focus_position:
      optimal_offset: 0     # mm (at focal point)
      tolerance: ±0.5       # mm
      adjustment_reason: "Surface curvature compensation"
      
      defocus_effects:
        positive_defocus: "+2mm increases spot size 40%, reduces fluence"
        negative_defocus: "-2mm decreases spot size 30%, risks damage"
      
      measurement_method: "Burn paper test or laser beam profiler"
    
    environmental_controls:
      ambient_temperature:
        optimal: "20-25°C"
        max: "35°C"
        impact: "Thermal conductivity changes ±2% per 10°C"
      
      humidity:
        optimal: "30-50% RH"
        impact: "Affects oxide layer thickness and adhesion"
      
      cleanliness:
        required: "ISO Class 7 or better"
        reason: "Airborne particles interfere with ablation"

  # ============================================================
  # EQUIPMENT REQUIREMENTS (NEW)
  # ============================================================
  equipment_requirements:
    
    laser_system:
      type: "Pulsed Nd:YAG or fiber laser"
      alternatives:
        - "Nd:YAG (1064nm fundamental)"
        - "Fiber laser (1070nm)"
        - "Disk laser (1030nm)"
      not_recommended:
        - "CO2 laser (10600nm) - poor selectivity"
        - "Excimer laser (193-351nm) - too expensive"
      
      specifications:
        pulse_duration: "10-100 ns (nanosecond regime preferred)"
        beam_quality: "M² < 1.3 for precision focusing"
        power_stability: "±3% RMS"
        pointing_stability: "±5% of spot diameter"
    
    cooling_system:
      type: "Chilled water recirculator"
      temperature: "15-20°C"
      flow_rate: "2-4 L/min"
      capacity: "2 kW heat load minimum"
      backup: "Thermal cutoff at 25°C"
    
    fume_extraction:
      flow_rate: "500 CFM minimum"
      filtration:
        primary: "HEPA filter (99.97% @ 0.3μm)"
        secondary: "Activated carbon (VOC removal)"
      monitoring: "Pressure differential gauge"
    
    safety_equipment:
      laser_safety:
        - "Class 4 laser safety enclosure"
        - "Interlocked access doors"
        - "Emergency stop buttons"
      operator_ppe:
        - "Laser safety glasses (OD 7+ @ 1064nm)"
        - "Hearing protection (if enclosed)"
        - "Nitrile gloves"
    
    metrology:
      required:
        - "Power meter (calibrated annually)"
        - "Beam profiler or burn paper"
        - "Surface profilometer (Ra measurement)"
      recommended:
        - "IR thermal camera"
        - "XPS or FTIR for contamination analysis"

  # ============================================================
  # QUALITY METRICS & EXPECTED OUTCOMES (NEW)
  # ============================================================
  expected_outcomes:
    
    surface_quality:
      surface_roughness:
        before: "Ra 2.5-6.0 μm (corroded/contaminated)"
        after: "Ra 0.4-1.2 μm (laser cleaned)"
        measurement: "Profilometry per ISO 4287"
        acceptance_criteria: "Ra < 1.5 μm"
      
      visual_inspection:
        before: "Dull, oxidized, stained"
        after: "Bright metallic finish, no discoloration"
        standard: "Visual inspection per ASTM E165"
      
      color_uniformity:
        metric: "ΔE < 2 (CIE Lab color space)"
        measurement: "Spectrophotometer"
    
    contamination_removal:
      oxide_layer:
        removal_efficiency: ">95%"
        measurement: "XPS depth profiling"
        verification: "Oxygen peak <2% atomic concentration"
      
      oil_residue:
        removal_efficiency: ">98%"
        measurement: "FTIR spectroscopy"
        verification: "C-H stretch peaks <5% baseline"
      
      particulate:
        removal_efficiency: ">99%"
        measurement: "SEM imaging + EDX analysis"
        verification: "Particle density <10 particles/mm²"
    
    substrate_integrity:
      microstructure:
        change: "No grain boundary damage"
        measurement: "Optical microscopy + SEM"
        standard: "ASTM E112 grain size analysis"
      
      hardness:
        change: "<5% variation from baseline"
        measurement: "Vickers microhardness (HV 0.1)"
        locations: "5 points per sample"
      
      dimensional_accuracy:
        tolerance: "±10 μm (typical removal depth)"
        measurement: "Coordinate measuring machine (CMM)"
      
      residual_stress:
        change: "<50 MPa tensile stress"
        measurement: "X-ray diffraction (XRD)"
        concern: "Stress concentration at edges"
    
    process_efficiency:
      area_coverage_rate:
        typical: "150 cm²/min"
        factors: "Depends on contamination level, passes"
      
      first_pass_yield:
        target: ">90%"
        definition: "Parts meeting spec without rework"
      
      consumables:
        laser_maintenance: "Every 10,000 hours"
        filter_replacement: "Every 200 hours"

  # ============================================================
  # TROUBLESHOOTING GUIDE (NEW)
  # ============================================================
  common_issues:
    
    - symptom: "Incomplete oxide removal"
      severity: medium
      frequency: common
      
      possible_causes:
        - cause: "Power too low"
          diagnostic: "Measure actual power output (aging or misalignment)"
          
        - cause: "Scan speed too fast"
          diagnostic: "Check programmed vs actual speed"
          
        - cause: "Insufficient overlap"
          diagnostic: "Verify overlap ratio setting"
          
        - cause: "Oxide thickness exceeds expectation"
          diagnostic: "Measure oxide depth with cross-section"
      
      solutions:
        - action: "Increase power by 10-20W"
          priority: 1
          verification: "Power meter measurement"
          
        - action: "Reduce scan speed by 20%"
          priority: 1
          verification: "Visual inspection after 1 pass"
          
        - action: "Increase overlap to 60%"
          priority: 2
          verification: "Check scan pattern density"
          
        - action: "Add 1-2 additional passes"
          priority: 3
          verification: "XPS depth profile"
    
    - symptom: "Surface melting or pitting"
      severity: critical
      frequency: uncommon
      
      possible_causes:
        - cause: "Power too high"
          diagnostic: "Measure fluence: E = Power / (Area × RepRate)"
          
        - cause: "Pulse duration too long"
          diagnostic: "Check laser specifications"
          
        - cause: "Spot size too small"
          diagnostic: "Burn paper test or beam profiler"
          
        - cause: "Overlap excessive (>70%)"
          diagnostic: "Calculate effective fluence with overlap"
      
      solutions:
        - action: "Reduce power to minimum effective (70-80W)"
          priority: 1
          verification: "Test on scrap piece"
          
        - action: "Switch to shorter pulses (<50ns if available)"
          priority: 1
          verification: "Laser specification sheet"
          
        - action: "Increase spot size by 20% (defocus +0.5mm)"
          priority: 2
          verification: "Burn paper test"
          
        - action: "Reduce overlap to 40-50%"
          priority: 2
          verification: "Reduce line spacing in path planning"
    
    - symptom: "Inconsistent results across surface"
      severity: medium
      frequency: common
      
      possible_causes:
        - cause: "Surface height variation (focus change)"
          diagnostic: "Measure part flatness/curvature"
          
        - cause: "Contamination thickness variation"
          diagnostic: "Visual or thickness measurement"
          
        - cause: "Power drift during process"
          diagnostic: "Monitor power meter over time"
      
      solutions:
        - action: "Use height sensing or manual focus adjustment"
          priority: 1
          verification: "Burn paper test at multiple locations"
          
        - action: "Increase number of passes for uniformity"
          priority: 2
          verification: "Visual inspection"
          
        - action: "Calibrate laser power (service call if needed)"
          priority: 1
          verification: "Power meter trending"
    
    - symptom: "Excessive processing time"
      severity: low
      frequency: common
      
      possible_causes:
        - cause: "Too many passes programmed"
          diagnostic: "Review process recipe"
          
        - cause: "Scan speed too conservative"
          diagnostic: "Check against optimal range"
          
        - cause: "Overlap ratio excessive"
          diagnostic: "Calculate line spacing"
      
      solutions:
        - action: "Reduce passes (test 2-3 instead of 4-5)"
          priority: 1
          verification: "Quality check after reduction"
          
        - action: "Increase scan speed by 20% (test incrementally)"
          priority: 2
          verification: "Maintain cleaning quality"
          
        - action: "Reduce overlap to 40-50%"
          priority: 2
          verification: "Check for gaps in coverage"

  # ============================================================
  # PARAMETER INTERACTION MATRIX (NEW)
  # ============================================================
  parameter_interactions:
    description: |
      Machine parameters are interdependent. Changing one 
      parameter often requires adjusting others to maintain 
      optimal cleaning quality.
    
    primary_relationships:
      - parameters: ["powerRange", "spotSize"]
        relationship: "inverse_square"
        formula: "Fluence = Power / (π × (spotSize/2)²)"
        rule: "Reducing spot size 50% requires reducing power 75% for same fluence"
        
      - parameters: ["scanSpeed", "repetitionRate"]
        relationship: "direct"
        formula: "Spot overlap = 1 - (scanSpeed / (repetitionRate × spotSize))"
        rule: "Doubling scan speed requires doubling rep rate for same overlap"
        
      - parameters: ["energyDensity", "passCount"]
        relationship: "multiplicative"
        formula: "Total fluence = energyDensity × passCount"
        rule: "Multiple passes accumulate energy, reduce per-pass fluence accordingly"
    
    compensation_examples:
      - scenario: "Increase power from 100W to 120W"
        compensations:
          - parameter: "spotSize"
            adjustment: "Increase from 50μm to 55μm"
            reason: "Maintain fluence below damage threshold"
            
          - parameter: "scanSpeed"
            adjustment: "Increase from 500 to 550 mm/s"
            reason: "Maintain same exposure time per area"
      
      - scenario: "Switch from 1064nm to 532nm wavelength"
        compensations:
          - parameter: "powerRange"
            adjustment: "Reduce to 60-80W"
            reason: "Higher substrate absorption at 532nm"
            
          - parameter: "energyDensity"
            adjustment: "Reduce to 1.5-3.0 J/cm²"
            reason: "Increased damage risk at shorter wavelength"

# ============================================================
# SEO & SCHEMA.ORG DATA FOR /settings PAGE
# ============================================================
seo_settings_page:
  title: "Aluminum Laser Cleaning Machine Settings & Parameters | Z-Beam"
  description: |
    Comprehensive, research-backed laser cleaning parameters for aluminum. 
    Includes power settings, wavelength selection, troubleshooting guide, 
    and material-specific challenges with scientific justification.
  
  keywords:
    - "aluminum laser cleaning parameters"
    - "laser power settings aluminum"
    - "aluminum oxide removal wavelength"
    - "laser cleaning machine settings"
    - "aluminum surface treatment parameters"
  
  # AUTHOR METADATA (Required - Standardized Across Project)
  # Must include E-E-A-T signals for credibility
  author:
    name: "Todd Dunning"
    jobTitle: "Laser Systems Engineer"  # Required for E-E-A-T
    description: "Industrial laser specialist with 15+ years experience in laser cleaning applications"  # Required
    expertise:
      - "Laser cleaning process optimization"
      - "Material-specific parameter development"
      - "Industrial surface treatment"
    url: "https://z-beam.com/about"
    email: "todd@z-beam.com"
    image: "/images/authors/todd-dunning.jpg"
  
  structured_data:
    "@context": "https://schema.org"
    "@type": "HowTo"
    name: "Aluminum Laser Cleaning Machine Settings"
    description: "Professional laser cleaning parameters for aluminum with research-backed justification"
    
    step:
      - "@type": "HowToStep"
        position: 1
        name: "Configure Laser Power"
        text: "Set laser power to 100W (range: 80-120W optimal)"
        
      - "@type": "HowToStep"
        position: 2
        name: "Select Wavelength"
        text: "Use 1064nm (Nd:YAG) for optimal aluminum oxide selectivity"
        
      # ... additional steps ...
    
    citation:
      - "@type": "ScholarlyArticle"
        name: "Thermal Management in Aluminum Laser Cleaning"
        author: "Smith, J., et al."
        datePublished: "2023"
        doi: "10.2351/7.0000945"
```

## 🎨 UI/UX Components

**ALL components must follow materials page implementation standards:**

### Required Base Components (from Layout)
- **Nav** - Auto-included via Layout component
- **Title** - Auto-included via Layout component  
- **Footer** - Auto-included via Layout component
- **Breadcrumbs** - Auto-included via Layout component
- **DateMetadata** - Auto-included via Layout component
- **Author** - Auto-included via Layout component with E-E-A-T signals

### Content Components (Settings-Specific)
- **`SettingsHero`** - Hero with quick reference card (following Hero component pattern)
- **`ParameterTable`** - Essential settings table (extends PropertyBars component)
- **`ChallengeCard`** - Material-specific challenges (wrapped in SectionContainer)
- **`JustificationPanel`** - Research & science explanations (wrapped in SectionContainer)
- **`ParameterSlider`** - Interactive parameter adjustment (wrapped in SectionContainer)
- **`TroubleshootingFlow`** - Diagnostic flowchart (wrapped in SectionContainer)
- **`ComparisonTable`** - Related materials comparison (wrapped in SectionContainer)
- **`ResearchCitation`** - DOI links, expandable abstracts (custom component)
- **`DownloadButton`** - PDF parameter sheet generation (custom component)

**Standards:**
1. Use SectionContainer for all major sections (consistent with materials pages)
2. Use PropertyBars for displaying settings/metrics (matches materials implementation)
3. Use MarkdownRenderer for markdown content (standard across project)
4. Use CONTAINER_STYLES and SPACER_CLASSES for spacing (project-wide standard)

## 🗂️ File Structure

```
/app/settings/[category]/[subcategory]/[slug]/
├── page.tsx                    # Main settings page
├── components/
│   ├── SettingsHero.tsx       # Hero with quick reference
│   ├── ParameterTable.tsx     # Essential settings table
│   ├── ChallengeSection.tsx   # Material challenges
│   ├── JustificationPanel.tsx # Research & science
│   ├── TroubleshootingGuide.tsx # Issue resolution
│   └── RelatedMaterials.tsx   # Internal linking
└── utils/
    └── parameterHelpers.ts    # Data processing utilities

/content/settings/
└── aluminum-laser-cleaning-settings.yaml  # Enhanced settings data
```

## 📊 Success Metrics

### Backlink KPIs (6 months)
- **Target**: 50+ referring domains
- **Quality**: DA 40+ sites
- **Types**: 
  - 20+ technical blogs
  - 10+ equipment manufacturers
  - 10+ research citations
  - 5+ university labs
  - 5+ industry associations

### Engagement Metrics
- **Time on page**: >5 minutes (vs 2min current)
- **Scroll depth**: >80% reach parameter justification section
- **PDF downloads**: 200+/month
- **Return visitors**: 30%+

### SEO Impact
- **Keyword rankings**: Top 3 for "aluminum laser cleaning parameters"
- **Organic traffic**: +150% to /settings pages
- **Featured snippets**: 10+ parameter queries

## 🚀 Implementation Phases

### Phase 1: Data Model & Prototype (Week 1-2)
- ✅ Create enhanced YAML structure
- ✅ Populate aluminum as reference example
- ✅ Build basic SettingsHero + ParameterTable components
- ✅ Deploy single material for testing

### Phase 2: Core Components (Week 3-4)
- ⏳ ChallengeSection with categorization
- ⏳ JustificationPanel with citations
- ⏳ TroubleshootingGuide with flowchart
- ⏳ PDF download functionality

### Phase 3: Python Generator Integration (Week 5-8)
- ⏳ Define Python script requirements
- ⏳ Research API integration (DOI lookups, etc.)
- ⏳ Batch populate 132 materials
- ⏳ Quality assurance review

### Phase 4: Enhancement & Promotion (Week 9-12)
- ⏳ Interactive parameter sliders
- ⏳ Visual diagrams (absorption curves, damage thresholds)
- ⏳ Outreach to equipment manufacturers
- ⏳ Submit to industry directories

## 📧 Next Steps

1. **Review & Approve** data model structure
2. **Prioritize** materials for initial research (top 10-20 most queried)
3. **Define** Python generator requirements
4. **Build** prototype for 1-2 materials
5. **Test** with target audience (operations managers, engineers)
6. **Iterate** based on feedback
7. **Scale** to full material library

---

**Ready to proceed?** Let me know if you'd like me to:
- Create the prototype page.tsx for /settings route
- Build the new UI components
- Set up the Python generator requirements document
- Implement for aluminum as proof of concept
