# Optimal Frontmatter Structure & Field Ordering

**Purpose**: Reference guide for normalized frontmatter formatting  
**Date**: January 14, 2026  
**Status**: ✅ CANONICAL STRUCTURE

**Current Aluminum Status**: 887 lines (target: 750 lines) - **137 lines to target**  
**Recent Update**: ✅ sectionDescriptions added | ❌ 3 issues remain  
**Issues**: pageTitle embedded in pageDescription, FAQ string format, missing icons

---

## ⭐ FULLY OPTIMAL STRUCTURE - REFERENCE IMPLEMENTATION

This section shows the **ideal, corrected structure** with all 3 remaining issues fixed. Use this as the canonical reference for what "optimal" looks like.

### ✅ Optimal Core Metadata (pageTitle/pageDescription)
```yaml
# CORRECT: Title in pageTitle, description in pageDescription (no markdown heading)
id: aluminum-laser-cleaning
name: Aluminum
displayName: Aluminum Laser Cleaning
category: metal
subcategory: non-ferrous
contentType: material
schemaVersion: 5.0.0
datePublished: '2026-01-06T00:00:00.000Z'
dateModified: '2026-01-15T04:00:00.000Z'
fullPath: /materials/metal/non-ferrous/aluminum-laser-cleaning

# ✅ OPTIMAL: Clear, descriptive title
pageTitle: Laser Cleaning Aluminum

# ✅ OPTIMAL: Clean description without markdown heading
pageDescription: Aluminum stands out as a lightweight non-ferrous metal that we often encounter in everyday items and industrial setups, and while it's valued for its corrosion resistance and malleability, laser cleaning enhances its usability by stripping away surface contaminants without altering the base structure.

metaDescription: Laser cleaning process starts on aluminum surface. Contamination covers it before treatment...
```

**❌ WRONG (current aluminum):**
```yaml
pageTitle: Aluminum  # ← Too short, not descriptive
pageDescription: '### Laser Cleaning Aluminum\n\n  Aluminum stands out...'  # ← Markdown heading embedded
```

### ✅ Optimal FAQ Structure (Array Format)
```yaml
# ✅ OPTIMAL: Array of question/answer objects
faq:
  - question: What safety considerations should we keep in mind when laser cleaning aluminum surfaces, especially regarding its reflective qualities?
    answer: Professionals often deal with aluminum's shiny and reflective surface, which can bounce laser beams around unpredictably and increase risks if not handled properly, so we use full eye protection rated for the specific laser wavelength. Additionally, proper enclosure systems prevent stray reflections from reaching unprotected areas, and we always maintain proper ventilation to handle any particles dispersed during the cleaning process.
    category: safety
    
  - question: How does thermal conductivity affect laser cleaning parameters for aluminum?
    answer: Aluminum's high thermal conductivity of 237 W/m·K means heat dissipates rapidly across the surface, requiring higher laser power or slower scan speeds compared to materials like stainless steel. This rapid heat transfer actually benefits the cleaning process by preventing localized melting or warping, but it also means you need consistent energy delivery to maintain effective ablation temperatures across the entire cleaning area.
    category: technical
    
  - question: What contaminants are most effectively removed from aluminum surfaces using laser cleaning?
    answer: Laser cleaning excels at removing oxidation layers, industrial oils, grease, adhesive residues, and light corrosion from aluminum surfaces. The process works particularly well for aerospace and automotive applications where chemical-free cleaning is essential to preserve material properties. However, heavy corrosion or thick paint layers may require multiple passes or alternative methods.
    category: application
```

**❌ WRONG (current aluminum):**
```yaml
faq: 'Q: Question 1: What safety considerations... A: Professionals often deal...'  # ← Single string, can't parse multiple Q&A
```

### ✅ Optimal Section Metadata (Icons)
```yaml
components:
  subtitle: Aluminum's low density of 2.7 g/cm³ and high electrical conductivity...
  
  # ✅ OPTIMAL: _section metadata with icon
  micro:
    before: 'At 500-1000x magnification, untreated aluminum surfaces...'
    after: 'Following laser treatment at identical magnification...'
    _section:
      icon: microscope
      order: 30
      variant: default

  description: 'When laser cleaning aluminum, the high reflectivity...'
  
properties:
  # ✅ OPTIMAL: _section.icon for consistency (even if _metadata.icon exists)
  materialCharacteristics:
    title: Aluminum's Distinctive Traits
    sectionDescription: Physical properties that define aluminum's behavior during laser cleaning processes
    _section:
      icon: wrench
      order: 50
      variant: default
    density:
      value: 2.7
      unit: g/cm³
      # ... rest of properties
      
  # ✅ OPTIMAL: _section.icon for visual consistency
  laserMaterialInteraction:
    title: Aluminum Laser Interaction Dynamics
    sectionDescription: How laser energy interacts with aluminum surfaces during cleaning operations
    _section:
      icon: zap
      order: 60
      variant: default
    absorptionCoefficient:
      value: 8
      unit: '%'
      # ... rest of properties
```

**❌ WRONG (current aluminum):**
```yaml
micro:
  before: '...'
  after: '...'
  # ← Missing _section.icon

materialCharacteristics:
  title: ...
  _metadata:
    icon: wrench  # ← Has _metadata.icon but no _section.icon for consistency
```

### 🎯 Summary: Optimal vs Current

| Aspect | Current Aluminum | Optimal Structure |
|--------|-----------------|-------------------|
| **pageTitle** | ❌ "Aluminum" (too short) | ✅ "Laser Cleaning Aluminum" (descriptive) |
| **pageDescription** | ❌ Markdown heading embedded | ✅ Clean prose only |
| **FAQ** | ❌ Single string | ✅ Array of objects |
| **components.micro icon** | ❌ Missing | ✅ microscope icon |
| **Properties icons** | ⚠️ _metadata only | ✅ _section.icon for consistency |
| **sectionDescription** | ✅ Present | ✅ Present |
| **Content** | ✅ Complete | ✅ Complete |
| **Structure** | ✅ Clean nesting | ✅ Clean nesting |

**Readiness**: 95% - Fix 3 format issues → 100% optimal reference implementation

---

## 🎯 Design Principles

1. **Logical Grouping**: Related fields together (metadata → content → relationships)
2. **Core First**: Essential identification fields at the top
3. **No Duplicates**: Single source of truth for each data point
4. **Consistent Nesting**: Properties grouped under parent objects
5. **Metadata Last**: Technical metadata (`_metadata`, `_section`) at end of each group

---

## 📋 Optimal Field Order

```yaml
# ============================================================================
# SECTION 1: CORE IDENTIFICATION (Lines 1-15)
# Purpose: Essential metadata for routing, SEO, and content management
# ============================================================================
id: aluminum-laser-cleaning
name: Aluminum
displayName: Aluminum Laser Cleaning
category: metal
subcategory: non-ferrous
contentType: material
schemaVersion: 5.0.0
datePublished: '2026-01-06T00:00:00.000Z'
dateModified: '2026-01-14T22:23:40.795605+00:00'
fullPath: /materials/metal/non-ferrous/aluminum-laser-cleaning
pageTitle: Aluminum Laser Cleaning Process & Applications
metaDescription: Professional laser cleaning for aluminum surfaces removes oxidation, grease, and contaminants without chemicals or abrasives. Learn optimal parameters and applications.

# ============================================================================
# SECTION 2: AUTHORSHIP & AUTHORITY (Lines 16-35)
# Purpose: Author credentials, expertise signals, E-E-A-T factors
# ============================================================================
author:
  name: Dr. Alexandra Chen
  credentials: Ph.D. Materials Science
  title: Senior Laser Applications Engineer
  bio: 15+ years specializing in laser-material interactions for aerospace and automotive industries
  expertise:
    - Laser cleaning systems
    - Surface engineering
    - Non-ferrous metal processing
  linkedin: https://linkedin.com/in/alexandra-chen
  image: /images/authors/alexandra-chen.jpg
  
eeat:
  experience:
    years: 15
    projects: 200+
    industries:
      - Aerospace
      - Automotive
      - Electronics manufacturing
  expertise:
    certifications:
      - Laser Safety Officer (LSO)
      - AWS Certified Welding Inspector
    publications: 12 peer-reviewed papers on laser processing
  authoritativeness:
    awards:
      - 2024 Laser Institute of America Innovation Award
    speaking: Regular presenter at LIA conferences
  trustworthiness:
    affiliations:
      - Laser Institute of America
      - Society of Manufacturing Engineers
    editorial: Peer reviewer for Journal of Laser Applications

# ============================================================================
# SECTION 3: VISUAL ASSETS (Lines 36-50)
# Purpose: Images for hero, micro, and card displays
# ============================================================================
images:
  hero:
    url: /images/material/aluminum-laser-cleaning-hero.jpg
    alt: Aluminum surface undergoing laser cleaning showing precise contamination removal
    width: 1200
    height: 630
  micro:
    url: /images/material/aluminum-laser-cleaning-micro.jpg
    alt: Microscopic view (500-1000x) of aluminum surface after laser cleaning
    width: 800
    height: 600
    
card:
  image: /images/material/aluminum-laser-cleaning-card.jpg
  title: Aluminum Laser Cleaning
  description: High-reflectivity metal requiring optimized parameters for effective contamination removal
  cta: Learn More

# ============================================================================
# SECTION 4: CONTENT COMPONENTS (Lines 51-150)
# Purpose: All text content for page sections
# ============================================================================
components:
  # Page subtitle (appears below hero title)
  subtitle: Aluminum's low density of 2.7 g/cm³ and high electrical conductivity of 37.7 million siemens per meter define its industrial utility
  
  # Main description (primary content section)
  description: |
    When laser cleaning aluminum, the high reflectivity around 95 percent stands out as the property that demands the most attention from the start. I've seen setups fail early because operators overlook how this bounces most of the laser energy away, leaving contaminants like oils or oxides stubbornly in place unless you adjust your parameters thoughtfully.
    
    This works best when you begin with a fiber laser at 1064 nanometers, since that wavelength penetrates the reflective surface just enough to initiate ablation without scattering too much power. Tends to require a power level near 100 watts to overcome the low absorptivity of about 6 percent, but you push that only after testing on a scrap piece to confirm the energy density stays around 5.1 joules per square centimeter—anything higher risks heating the underlying metal unevenly.
    
    Aluminum's low density at 2.7 grams per cubic centimeter makes it lighter and more responsive to thermal shifts during the process, which reveals clean surfaces faster than denser metals like steel. I've found that this lightness helps in applications such as aerospace parts or automotive components, where you need to restore intricate shapes without adding mechanical stress. However, it also means the material conducts heat quickly through its structure, so you must control the pulse width to about 10 nanoseconds to localize the energy and avoid spreading warmth that could warp thin sheets.
    
    As you scan at speeds up to 500 millimeters per second with a spot size of 50 micrometers, the non-porous nature of aluminum—zero percent porosity—ensures that cleaning exposes a uniform base without trapping residues in hidden voids. This improves adhesion for subsequent coatings in marine or packaging uses, but watch the repetition rate; setting it to 50 kilohertz with 50 percent overlap in three passes removes surface roughness down to 0.8 micrometers effectively.
  
  # Micro content (before/after microscopic views)
  micro:
    before: |
      At 500-1000x magnification, untreated aluminum surfaces show a dull, tarnished appearance with visible oxidation layers forming irregular patterns across the crystalline structure. Contaminants like oils, greases, and particulates adhere to the naturally occurring aluminum oxide layer, creating a hazy coating that obscures the metallic luster. Surface roughness measures 3-5 micrometers with embedded contaminants filling grain boundaries and surface irregularities.
    after: |
      Post-cleaning microscopic analysis reveals a bright, uniform metallic surface with the natural crystalline facets of aluminum clearly visible. The laser process removes the contaminated oxide layer and surface contaminants while preserving the underlying metal structure. Surface roughness reduces to 0.8-1.2 micrometers with clean grain boundaries and restored reflectivity. The aluminum's characteristic silvery-white appearance returns, indicating successful contamination removal without substrate damage.
  
  # Settings description (machine parameter guidance)
  settingsDescription: |
    I've seen aluminum respond well to laser cleaning when you begin with controlled power levels to counter its high reflectivity, which tends to bounce away much of the beam's energy. This approach prevents uneven heating that could warp thin sections early in the process. Once set up this way, the laser effectively removes oxides and contaminants without compromising the metal's natural corrosion resistance.
    
    Aluminum's low density makes it lighter and more prone to heat buildup compared to denser metals, so you'll want to increase scan speeds gradually to expose clean surfaces evenly across multiple passes. I've found that maintaining good overlap in those passes restores the material's smooth finish reliably. Monitor for any discoloration during the first run—adjust by slowing the repetition rate slightly if needed to reduce thermal stress.

# ============================================================================
# SECTION 5: MATERIAL PROPERTIES (Lines 151-350)
# Purpose: Physical and laser-interaction properties with scientific data
# ============================================================================
properties:
  materialCharacteristics:
    title: Aluminum's Distinctive Traits
    description: |
      When working with aluminum, a non-ferrous metal known for its lightweight build and strong conductivity, these qualities set it apart from denser metals, and they combine with its natural oxide layer to create a surface that resists corrosion while staying quite reflective. These features influence laser cleaning by allowing quick heat spread, which means the process often clears away contaminants efficiently without deep penetration, yet the reflectivity can scatter energy and require focused beam control to avoid uneven results.
    
    # Physical properties with value, unit, range, source, and notes
    density:
      value: 2.7
      unit: g/cm³
      min: 2.63
      max: 2.8
      source: ASM Handbook Vol. 2, MatWeb Database
      notes: Pure aluminum 2.70 g/cm³, varies by alloy series (1xxx highest, 7xxx lowest)
    
    thermalConductivity:
      value: 237
      unit: W/m·K
      min: 120
      max: 237
      source: ASM Handbook, CRC Handbook of Chemistry and Physics
      notes: Pure Al highest (237), 2xxx series lowest (120-190), affects heat dissipation during cleaning
    
    meltingPoint:
      value: 660
      unit: °C
      min: 477
      max: 660
      source: ASM Handbook, Aluminum Association
      notes: Pure Al 660°C, alloys range 477-660°C depending on alloying elements
    
    thermalExpansion:
      value: 23.1
      unit: µm/m·K
      min: 21.0
      max: 25.0
      source: CRC Handbook, ASM Handbook
      notes: Relatively consistent across aluminum alloys, important for thermal stress calculations
    
    tensileStrength:
      value: 90
      unit: MPa
      min: 45
      max: 570
      source: ASM Handbook Vol. 2, MatWeb Database
      notes: Massive range - pure Al (45 MPa) to 7075-T6 (570 MPa), heat treatment critical
    
    hardness:
      value: 15
      unit: HB
      min: 15
      max: 150
      source: ASM Handbook
      notes: Pure Al softest (15 HB), heat-treated 7075 hardest (150 HB)
    
    electricalConductivity:
      value: 37.7
      unit: MS/m
      min: 14.0
      max: 37.7
      source: CRC Handbook, ASM Handbook
      notes: Pure Al highest (37.7), 2xxx series lowest (14.0), affects laser absorption
    
    reflectivity:
      value: 92
      unit: '%'
      min: 85
      max: 95
      source: Journal of Laser Applications, Optical Properties of Metals
      notes: Surface finish dependent, freshly polished highest, oxidized surface lower
    
    porosity:
      value: 0
      unit: '%'
      min: 0
      max: 15
      source: ASM Handbook Vol. 15
      notes: Wrought (0-2%), Cast (2-8%), Powder metallurgy (5-15%)
    
    _metadata:
      icon: wrench
      order: 70
      variant: default
      generatedAt: '2026-01-14T08:26:41.000Z'
  
  laserMaterialInteraction:
    title: Aluminum Laser Interaction Dynamics
    description: |
      Laser energy interacts with aluminum by primarily reflecting off its surface due to the material's inherent shininess and non-ferrous nature, although some absorption occurs when the beam's wavelength matches certain oxide layers that form naturally on exposed parts. High reflectivity (92%) requires optimized fluence and careful parameter tuning for effective contamination removal without substrate damage.
    
    absorptionCoefficient:
      value: 8
      unit: '%'
      min: 5
      max: 15
      source: Applied Surface Science, Laser Materials Processing (Steen & Mazumder)
      notes: Wavelength dependent - 1064nm range 5-8%, oxide layer increases absorption to 10-15%
    
    ablationThreshold:
      value: 0.6
      unit: J/cm²
      min: 0.3
      max: 2.5
      source: Journal of Laser Applications, Phipps et al.
      notes: Pulse duration dependent, nanosecond pulses 0.3-1.0 J/cm², longer pulses require higher fluence
    
    thermalDiffusivity:
      value: 97
      unit: mm²/s
      min: 49
      max: 97
      source: CRC Handbook, ASM Handbook
      notes: Pure Al highest (97), decreases with alloying elements, affects heat-affected zone size
    
    heatAffectedZone:
      value: 50
      unit: µm
      min: 10
      max: 200
      source: Laser Materials Processing literature, Chryssolouris
      notes: Pulse duration critical - femtosecond (10µm), nanosecond (50-200µm)
    
    pulseRepetitionRate:
      value: 50
      unit: kHz
      min: 1
      max: 1000
      source: Industrial laser cleaning standards, LIA guidelines
      notes: Optimal cleaning range 10-100 kHz, higher rates for thin films, lower for thick coatings
    
    fluence:
      value: 2.0
      unit: J/cm²
      min: 0.5
      max: 10.0
      source: Applied Surface Science, Industrial applications data
      notes: Cleaning range 0.5-3.0 J/cm², higher values for heavy contamination, risk substrate damage >5.0
    
    _metadata:
      icon: zap
      order: 71
      variant: default
      generatedAt: '2026-01-14T08:27:32.000Z'

# ============================================================================
# SECTION 6: FAQ (Lines 351-450)
# Purpose: Common questions and expert answers
# ============================================================================
faq:
  - question: What safety considerations should we keep in mind when laser cleaning aluminum surfaces, especially regarding its reflective qualities?
    answer: |
      Professionals often deal with aluminum's shiny and reflective surface, which can bounce laser beams around unpredictably and increase risks if not handled properly, so we use full eye protection rated for the specific laser wavelength (typically OD 7+ for 1064nm fiber lasers). The high reflectivity means stray reflections can travel farther than with darker materials, requiring proper enclosure design with beam stops and non-reflective interior coatings.
      
      I've found that proper PPE extends beyond just eyewear—you need appropriate clothing to protect from reflected beams, and skin exposure should be minimized. The cleaning process can also generate aluminum oxide particles and vaporized contaminants, so adequate ventilation and respiratory protection (N95 minimum, respirator recommended) are essential. Always ensure proper beam alignment and use lower power levels initially to verify reflections are contained before ramping up to cleaning parameters.
    category: safety
    
  - question: How does aluminum's high thermal conductivity affect laser cleaning parameters compared to steel or other metals?
    answer: |
      Aluminum's thermal conductivity (237 W/m·K) is about 5 times higher than steel, which means heat spreads rapidly through the material during laser cleaning. This requires faster scan speeds and higher repetition rates to prevent heat buildup that could cause warping or subsurface damage. I typically use scan speeds of 400-600 mm/s for aluminum versus 200-400 mm/s for steel.
      
      The rapid heat dissipation also means you need sufficient energy density to overcome the material's ability to conduct heat away from the cleaning zone. Pulse widths of 8-15 nanoseconds work well to localize energy without excessive thermal diffusion. For thin aluminum sheets (< 2mm), even greater care is needed as heat can quickly spread throughout the entire piece, potentially causing distortion.
    category: technical
    
  - question: What's the typical surface roughness change after laser cleaning aluminum, and how does this affect subsequent coating adhesion?
    answer: |
      Untreated aluminum surfaces typically show roughness (Ra) values of 3-5 micrometers with contamination layers. After optimized laser cleaning, surface roughness reduces to 0.8-1.5 micrometers, creating an ideal profile for coating adhesion. This controlled roughness provides mechanical anchoring for paints, anodizing, or other surface treatments while maintaining the underlying metal integrity.
      
      The laser cleaning process removes the contaminated oxide layer while creating a fresh, chemically active aluminum oxide surface that forms immediately upon exposure to air. This newly formed oxide layer (typically 2-4 nanometers thick) provides excellent adhesion characteristics. I've seen coating adhesion tests show 40-60% improvement in pull-off strength compared to solvent-cleaned surfaces, with the laser-cleaned surface outperforming even mechanical abrasion methods in consistency and uniformity.
    category: applications

# ============================================================================
# SECTION 7: RELATIONSHIPS (Lines 451-700)
# Purpose: Related content, contamination types, applications
# ============================================================================
relationships:
  interactions:
    contaminatedBy:
      title: Common Aluminum Contaminants
      description: Contamination types frequently encountered on aluminum surfaces requiring laser cleaning
      presentation: card
      _section:
        icon: droplet
        order: 50
        variant: default
      items:
        - id: adhesive-residue-contamination
          name: Adhesive Residue / Tape Marks
          category: organic-residue
          subcategory: adhesive
          url: /contaminants/organic-residue/adhesive/adhesive-residue-contamination
          image: /images/contaminant/adhesive-residue-contamination-hero.jpg
          description: Adhesive residue from shipping labels, protective films, and masking tape commonly contaminates aluminum during manufacturing and assembly. These organic compounds can interfere with subsequent coating processes and quality inspections.
          frequency: high
          severity: moderate
          
        - id: aluminum-oxidation-contamination
          name: Aluminum Oxidation
          category: oxidation
          subcategory: non-ferrous
          url: /contaminants/oxidation/non-ferrous/aluminum-oxidation-contamination
          image: /images/contaminant/aluminum-oxidation-contamination-hero.jpg
          description: Natural aluminum oxide forms rapidly on exposed surfaces, creating a thin (2-10µm) layer that appears as white or gray discoloration. While protective against further corrosion, excessive oxidation layers must be removed before welding, bonding, or coating operations.
          frequency: very-high
          severity: low
          
        - id: grease-oil-contamination
          name: Cutting Oils & Machining Fluids
          category: organic-residue
          subcategory: petroleum
          url: /contaminants/organic-residue/petroleum/grease-oil-contamination
          image: /images/contaminant/grease-oil-contamination-hero.jpg
          description: Machining operations leave residual cutting fluids, lubricants, and oils on aluminum surfaces. These organic contaminants prevent proper adhesion of coatings and can cause welding defects if not removed prior to joining operations.
          frequency: very-high
          severity: high
  
  operational:
    industryApplications:
      title: Aluminum Laser Cleaning Applications
      description: Industries and use cases leveraging laser cleaning for aluminum components
      presentation: card
      _section:
        icon: briefcase
        order: 80
        variant: default
      items:
        - id: aerospace-manufacturing
          name: Aerospace Manufacturing
          category: manufacturing
          subcategory: aerospace
          url: /applications/manufacturing/aerospace/aerospace-manufacturing
          image: /images/application/aerospace-manufacturing-hero.jpg
          description: Aircraft structural components, engine parts, and landing gear require contamination-free aluminum surfaces for critical bonding and coating operations. Laser cleaning provides chemical-free preparation meeting aerospace quality standards.
          relevance: critical
          
        - id: automotive-assembly
          name: Automotive Assembly & Repair
          category: manufacturing
          subcategory: automotive
          url: /applications/manufacturing/automotive/automotive-assembly
          image: /images/application/automotive-assembly-hero.jpg
          description: Aluminum body panels, engine blocks, and chassis components require pre-weld and pre-paint cleaning. Laser technology offers fast, automated cleaning for high-volume production lines.
          relevance: high
          
        - id: electronics-manufacturing
          name: Electronics Manufacturing
          category: manufacturing
          subcategory: electronics
          url: /applications/manufacturing/electronics/electronics-manufacturing
          image: /images/application/electronics-manufacturing-hero.jpg
          description: Aluminum heat sinks, enclosures, and connector components demand precision cleaning without residue or damage. Laser cleaning provides controlled surface preparation for sensitive electronic assemblies.
          relevance: high
  
  safety:
    regulatoryStandards:
      title: Aluminum Laser Cleaning Standards
      description: Safety regulations and industry standards governing laser cleaning operations on aluminum
      presentation: card
      _section:
        icon: shield-check
        order: 90
        variant: default
      items:
        - id: ansi-z136.1
          name: ANSI Z136.1 - Safe Use of Lasers
          organization: Laser Institute of America
          description: Comprehensive safety standard covering laser hazard evaluation, control measures, and safety procedures for industrial laser operations including cleaning applications.
          relevance: required
          url: https://www.lia.org/resources/laser-safety-information/laser-safety-standards
          
        - id: osha-laser-safety
          name: OSHA Laser Safety Guidelines
          organization: Occupational Safety and Health Administration
          description: Federal workplace safety requirements for laser equipment operation, including exposure limits, PPE requirements, and operator training mandates.
          relevance: required
          url: https://www.osha.gov/laser-hazards
          
        - id: iec-60825-1
          name: IEC 60825-1 - Safety of Laser Products
          organization: International Electrotechnical Commission
          description: International standard for laser product safety classification, labeling, and user information. Covers Class 4 lasers typically used for industrial cleaning operations.
          relevance: required
          url: https://www.iec.ch

# ============================================================================
# SECTION 8: CONTAMINATION MATRIX (Lines 701-750)
# Purpose: Legacy compatibility - material-contaminant relationships
# ============================================================================
contamination:
  material: aluminum-laser-cleaning
  applicable:
    - adhesive-residue-contamination
    - aluminum-oxidation-contamination
    - grease-oil-contamination
    - paint-coating-contamination
    - particulate-contamination
    - weld-spatter-contamination
  challenging:
    - anodized-coating-contamination
    - heavy-corrosion-contamination
  not_recommended:
    - asbestos-contamination
    - lead-paint-contamination
  conditional: {}

# ============================================================================
# END OF OPTIMAL STRUCTURE
# Total lines: ~750 (vs 905 in current aluminum file)
# Reduction: ~17% more efficient while maintaining all critical data
# ============================================================================
```

---

## 🎯 Key Improvements Over Current Structure

### ✅ **Logical Organization**
- **Core metadata first** (lines 1-15): Essential identification fields
- **Author/E-E-A-T grouped** (lines 16-35): All authority signals together
- **Visual assets together** (lines 36-50): All images in one section
- **Content components** (lines 51-150): All text content grouped
- **Properties nested properly** (lines 151-350): Under `properties:` parent

### ✅ **Complete Examples**
- **Full FAQ answers**: No truncation, complete sentences with context
- **Proper micro before/after**: Descriptive text, not titles or swapped content
- **Complete descriptions**: No mid-sentence cutoffs

### ✅ **Consistent Formatting**
- **Multi-line text**: Uses `|` for readable long-form content
- **Property structure**: Always includes value, unit, min, max, source, notes
- **Metadata placement**: `_metadata` and `_section` objects consistently at end of groups

### ✅ **Zero Duplication**
- **Single source of truth**: Each data point appears exactly once
- **No legacy fields**: Removed `properties.materialCharacteristics.description:` flat fields
- **No root-level duplicates**: Properties nested under `properties:` parent

### ✅ **Scientific Rigor**
- **Source attribution**: Every property value cites authoritative sources
- **Contextual notes**: Explains variations, dependencies, and practical implications
- **Range data**: Min/max values provide context for typical variations

---

## 📏 Structure Summary

| Section | Lines | Purpose | Key Fields |
|---------|-------|---------|------------|
| Core ID | 1-15 | Routing, SEO | id, name, category, dates, paths |
| Author/E-E-A-T | 16-35 | Authority signals | author, credentials, expertise, eeat |
| Visual Assets | 36-50 | Images | hero, micro, card images |
| Content | 51-150 | Text components | subtitle, description, micro, settings |
| Properties | 151-350 | Scientific data | materialCharacteristics, laserMaterialInteraction |
| FAQ | 351-450 | Q&A | question, answer, category |
| Relationships | 451-700 | Related content | contaminatedBy, industryApplications, regulatoryStandards |
| Legacy | 701-750 | Compatibility | contamination matrix |

**Total Optimal Lines**: ~750 (vs 906 in current aluminum frontmatter)  
**Efficiency Gain**: 17% reduction while maintaining complete data  

### 🔍 Current Aluminum Frontmatter Analysis (Jan 14, 2026 - Latest)

**Structure Status**: ✅ Content Complete | ⚠️ 3 Remaining Issues
- ✅ Properties properly nested under `properties:` parent (line 131)
- ✅ Core metadata at top (lines 1-25)
- ✅ Full property data (9 material + 6 laser properties with sources)
- ✅ Logical section ordering
- ✅ **Legacy duplicates REMOVED** (47 lines deleted)
- ✅ **Content restored** - micro, description, FAQ all complete
- ✅ **sectionDescription fields PRESENT** (lines 135, 205)
- ✅ **pageDescription field PRESENT** (line 881)

**Remaining Issues**: ⚠️ 3 Structural Problems
1. ❌ **pageTitle structure incorrect** (lines 11, 881)
   - Currently: `pageTitle: Aluminum` + `pageDescription: '### Laser Cleaning Aluminum\n\n[text]'`
   - Should be: `pageTitle: Laser Cleaning Aluminum` + `pageDescription: '[text]'`
   - **Impact**: Markdown heading embedded in description field instead of being pageTitle value
   
2. ❌ **FAQ format incorrect** (line 261)
   - Currently: Single string "Q: Question 1:..."
   - Should be: Array of objects with question/answer/category fields
   - **Impact**: Cannot display multiple Q&A pairs properly, harder to parse
   
3. ❌ **Missing _section.icon metadata**
   - `components.micro` has no _section.icon (should be 'microscope' or 'camera')
   - `properties.materialCharacteristics` has _metadata.icon but needs _section.icon for consistency
   - `properties.laserMaterialInteraction` has _metadata.icon but needs _section.icon for consistency
   - **Impact**: Sections may display without icons in UI

**Action Required**: 
1. Move "Laser Cleaning Aluminum" from pageDescription to pageTitle
2. Remove markdown heading from pageDescription
3. Convert FAQ from string to array format
4. Add _section.icon to micro and properties sections

---

## 🚀 Migration Checklist

### ✅ Current Aluminum Status (Jan 14, 2026 - Latest)
- [ ] **Core ID** - ✅ pageDescription present | ⚠️ pageTitle needs update (remove heading from pageDescription)
- [x] **Author** - Complete bio, credentials, expertise areas
- [x] **E-E-A-T** - Experience, certifications documented
- [x] **Images** - Hero and micro images with proper alt text
- [ ] **Properties** - ✅ Data complete, sectionDescription present | ⚠️ _section.icon needs consistency check
- [ ] **Components** - Subtitle ✅, description ✅, micro ✅ (content) but ⚠️ (needs _section.icon), settings ✅
- [ ] **FAQ** - ✅ Content complete | ❌ Wrong format (string not array)
- [x] **Relationships** - ✅ Contaminants/apps present
- [x] **Remove Duplicates** - ✅ COMPLETE - Legacy fields successfully removed
- [x] **Validate YAML** - Syntax valid, structure correct

### 📋 Standard Migration Checklist
- [ ] **Core ID** - Verify all identification fields present and correct
- [ ] **Author** - Complete bio, credentials, expertise areas
- [ ] **E-E-A-T** - Document experience, certifications, awards
- [ ] **Images** - All hero, micro, card images with proper alt text
- [ ] **Components** - Complete subtitle, description, micro (before/after), settings
- [ ] **Properties** - Full data for all physical and laser-interaction properties
- [ ] **FAQ** - At least 3 questions with complete, helpful answers
- [ ] **Relationships** - Minimum 3 items each for contaminants, applications, standards
- [ ] **Remove Duplicates** - Delete all legacy flat fields and root-level duplicates
- [ ] **Validate YAML** - Run through YAML validator for syntax errors

---

## ✨ Benefits of This Structure

1. **Backend AI Efficiency**: Clear sections make generation easier
2. **Frontend Reliability**: Consistent structure reduces component bugs
3. **SEO Performance**: Proper metadata placement improves crawlability
4. **Maintainability**: Logical grouping simplifies updates
5. **Scientific Credibility**: Source attribution builds trust
6. **User Experience**: Complete content with no truncation

This structure serves as the **canonical reference** for all material frontmatter files.

---

## 🔧 Common Issues & Fixes

### Issue 1: Legacy Duplicate Fields
**Problem**: Flat fields like `properties.materialCharacteristics.description:` at root level  
**Solution**: Delete entirely - data should only exist in nested structure  
**Example**: Aluminum lines 874-907 contain 33 lines of pure duplication

### Issue 2: Truncated Content
**Problem**: FAQ answers or descriptions end mid-sentence  
**Solution**: Restore complete content from backup or regenerate  
**Example**: FAQ ending with "so we use full eye." instead of "full eye protection"

### Issue 3: Micro Format Issues
**Problem**: Micro before/after contains titles instead of descriptions, or swapped content  
**Solution**: Use descriptive paragraphs (100-150 words each) describing surface state  
**Example**: ❌ `before: '### Title: Aluminum Shine Revival'` → ✅ `before: | At 500-1000x magnification, untreated aluminum surfaces show...`

### Issue 4: Properties at Root Level
**Problem**: `materialCharacteristics:` and `laserMaterialInteraction:` at root instead of nested  
**Solution**: Move under `properties:` parent object, OR update MaterialsLayout to support both  
**Status**: ✅ FIXED in aluminum (properly nested) + MaterialsLayout supports both patterns

### Issue 5: Incomplete Property Data
**Problem**: Properties missing value, unit, min, max, source, or notes fields  
**Solution**: Research from authoritative sources (ASM Handbook, CRC, Journal of Laser Applications)  
**Status**: ✅ COMPLETE in aluminum - all properties have full data with sources

### Issue 6: Over-Deletion of Content
**Problem**: Cleanup removed critical content along with duplicates (components.micro deleted entirely)  
**Solution**: Restore missing content from backups or regenerate with proper structure  
**Example**: Aluminum lost `components.micro` before/after text during duplicate removal  
**Prevention**: When deleting duplicates, verify data exists in canonical location BEFORE removing legacy copy  
**Status**: ✅ RESOLVED - Content restored

### Issue 7: FAQ Format - String Instead of Array
**Problem**: FAQ stored as single string `faq: 'Q: Question 1:...'` instead of structured array  
**Solution**: Convert to array format with question/answer/category objects  
**Correct Format**:
```yaml
faq:
  - question: What safety considerations...
    answer: Professionals often deal with...
    category: safety
  - question: How does thermal conductivity...
    answer: Aluminum's thermal conductivity...
    category: technical
```
**Impact**: Cannot display multiple Q&A pairs properly, harder for frontend to parse

### Issue 8: Missing sectionDescription Fields
**Problem**: Properties sections have `title` but no `sectionDescription` for context  
**Solution**: Add sectionDescription field to each property group  
**Example**:
```yaml
properties:
  materialCharacteristics:
    title: Aluminum's Distinctive Traits
    sectionDescription: Physical properties that define aluminum's behavior during laser cleaning
    density: {...}
```
**Impact**: Sections lack introductory text explaining what properties mean

### Issue 9: Missing Icon Metadata
**Problem**: Sections missing `_section.icon` for UI display  
**Solution**: Add _section metadata with appropriate Lucide icon names  
**Example**:
```yaml
components:
  micro:
    before: ...
    after: ...
    _section:
      icon: microscope
      order: 30
      variant: default
```
**Impact**: Sections render without icons in SectionTitle components

### Issue 10: pageTitle Structure - Title Embedded in pageDescription
**Problem**: Page title embedded as markdown heading inside pageDescription field instead of being pageTitle value  
**Current (incorrect)**:
```yaml
pageTitle: Aluminum
pageDescription: '### Laser Cleaning Aluminum

  Aluminum stands out as a lightweight non-ferrous metal...'
```
**Correct structure**:
```yaml
pageTitle: Laser Cleaning Aluminum
pageDescription: 'Aluminum stands out as a lightweight non-ferrous metal that we often encounter in everyday items and industrial setups, and while it's valued for its corrosion resistance and malleability, laser cleaning enhances its usability by stripping away surface contaminants without altering the base structure.'
```
**Impact**: Semantic HTML structure incorrect, markdown heading should not be in description field  
**Status**: ⚠️ ALUMINUM - pageDescription present but has embedded title

---

## 📈 Progress Tracking

### Aluminum Frontmatter Evolution
- **Original**: 1034 lines with massive duplication
- **After first cleanup**: 905 lines
- **Properties nested**: 906 lines (properties moved under proper parent)
- **Current**: 859 lines (legacy duplicates removed) ✅
- **Target**: ~750 lines
- **Gap**: 109 lines (12.7% over target)
- **Remaining work**: 
  1. ❌ Restore `components.micro` with before/after content (~10 lines)
  2. ❌ Complete `components.description` truncation (~2 lines)
  3. ❌ Complete FAQ answer truncation (~1 line)
  4. Final cleanup and optimization (~96 lines)

### Files Requiring Updates
1. ✅ **MaterialsLayout.tsx** - Updated to support both nested and root-level properties
2. ✅ **PropertyBars.tsx** - Fixed to handle metadata.materialProperties fallback
3. ✅ **Micro.tsx** - Updated to check both frontmatter.micro and frontmatter.components.micro
4. 📝 **Aluminum frontmatter** - Needs legacy duplicate removal
5. 📝 **Other material frontmatter** - Need property data population per PROPERTIES_DATA_MISSING_CRITICAL.md
