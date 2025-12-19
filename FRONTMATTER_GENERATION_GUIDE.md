# Frontmatter Generation Guide for AI Assistants

**Version**: 2.0  
**Last Updated**: December 16, 2025  
**For**: AI assistants generating frontmatter files across all domains

---

## 🎯 Purpose

This guide ensures all generated frontmatter files meet Z-Beam's quality, completeness, and SEO standards. Follow these requirements precisely when generating or updating frontmatter YAML files across **4 domains**: Materials, Contaminants, Settings, and Compounds.

---

## 📁 Frontmatter Domains Overview

Z-Beam uses **4 frontmatter domains** with 424 total files:

| Domain | Files | Purpose | Schema | Status |
|--------|-------|---------|--------|--------|
| **Materials** | 153 | Material laser cleaning data | 4.0.0 | ⚠️ Needs dates + metadata |
| **Contaminants** | 98 | Contamination types & cleaning | 4.0.0 | ⚠️ Needs dates |
| **Settings** | 153 | Laser parameter settings | 4.0.0 | ⚠️ Needs dates |
| **Compounds** | 20 | Chemical compound data | N/A | ✅ **Reference model** |

### 🎯 Domain-Specific Content Types

```yaml
# Materials domain
content_type: unified_material

# Contaminants domain
content_type: unified_contamination

# Settings domain
content_type: unified_settings

# Compounds domain
# (No content_type field - uses simpler structure)
```

---

## 🚨 Critical Cross-Domain Issue: Null Dates

**404 of 424 files** (95%) have null date fields:

- ✅ **Compounds**: 0/20 null dates (0%) - **USE AS REFERENCE MODEL**
- ❌ **Contaminants**: 98/98 null dates (100%)
- ❌ **Materials**: 153/153 null dates (100%)
- ❌ **Settings**: 153/153 null dates (100%)

**ACTION REQUIRED**: The compounds generator successfully creates valid ISO 8601 timestamps. Apply the same date generation logic to the other 3 domains.

---

## 📋 Schema Version & Structure by Domain

### **Materials Domain** (153 files)

**Required Schema Version**: `4.0.0`

```yaml
schema_version: 4.0.0
content_type: unified_material
```

**Unique Requirements**:
- Full EEAT data structure
- Material metadata with completeness scores
- 21 material properties + 9 laser interaction properties
- Related contaminants linkages

### **Contaminants Domain** (98 files)

**Required Schema Version**: `4.0.0`

```yaml
schema_version: 4.0.0
content_type: unified_contamination
```

**Unique Requirements**:
- EEAT data (10 files currently have it)
- Contamination categories: organic-residue, corrosion, oxide-layer, etc.
- Related materials linkages
- Cleaning difficulty ratings

### **Settings Domain** (153 files)

**Required Schema Version**: `4.0.0`

```yaml
schema_version: 4.0.0
content_type: unified_settings
active: true
```

**Unique Requirements**:
- Laser parameter specifications
- Power ranges, wavelengths, pulse durations
- Safety thresholds
- Material-specific adjustments
- No EEAT or material_metadata (settings-specific schema)

### **Compounds Domain** (20 files) ✅ **Reference Model**

**No schema version field**

```yaml
id: [compound-name]-compound
name: [Compound Name]
chemical_formula: [Formula]
cas_number: [CAS#]
```

**✅ SUCCESS MODEL**: This domain correctly generates ISO 8601 timestamps for all files. Study its date generation logic.

**Unique Requirements**:
- CAS numbers, molecular weights
- Exposure limits (OSHA, NIOSH, ACGIH)
- Health effects and hazard classifications
- No content_type or schema_version fields

---

## ✅ Required Fields Checklist

### 🎯 Domain Selection

First, identify which domain you're generating for:
- **Materials**: Laser cleaning of materials (metals, plastics, ceramics, etc.)
- **Contaminants**: Types of contamination and their removal
- **Settings**: Laser parameter configurations per material
- **Compounds**: Chemical compounds encountered in cleaning

The following sections apply primarily to **Materials, Contaminants, and Settings** domains (schema 4.0.0).

### **1. Basic Metadata** (MANDATORY - All Domains)

**Materials Domain**:
```yaml
name: [Material Name]
slug: [kebab-case-slug]
id: [material-slug-laser-cleaning]
category: [metal|plastic|ceramic|composite|wood|other]
subcategory: [specific type]
content_type: unified_material
schema_version: 4.0.0
```

**Contaminants Domain**:
```yaml
name: [Contaminant Name]
slug: [kebab-case-slug]
id: [contaminant-slug-contamination]
category: [organic-residue|corrosion|oxide-layer|coating|biological|other]
subcategory: [specific type]
content_type: unified_contamination
schema_version: 4.0.0
```

**Settings Domain**:
```yaml
name: [Material Name]
slug: [kebab-case-slug]
id: [material-slug-settings]
category: [metal|plastic|ceramic|composite|wood|other]
subcategory: [specific type]
content_type: unified_settings
schema_version: 4.0.0
active: true
```

**Compounds Domain** (simplified):
```yaml
id: [compound-name]-compound
name: [Compound Name]
display_name: [Name with Formula Subscripts]
slug: [kebab-case-slug]
chemical_formula: [Formula]
cas_number: [CAS Number]
molecular_weight: [g/mol]
category: [irritant|toxic|hazardous_gas|other]
subcategory: [specific type]
hazard_class: [classification]
```

### **2. Publication Dates** (MUST NOT BE NULL) 🔥 **CRITICAL - ALL DOMAINS**

```yaml
datePublished: '2025-12-16T00:00:00Z'  # ISO 8601 format - REQUIRED
dateModified: '2025-12-16T00:00:00Z'   # ISO 8601 format - REQUIRED
```

**✅ CORRECT**: Use generation date or current date  
**❌ WRONG**: `datePublished: null` or `dateModified: null`

**🚨 DISCOVERED ISSUE - AFFECTS 404 FILES**:
- Materials: 153/153 files (100%) have null dates
- Contaminants: 98/98 files (100%) have null dates
- Settings: 153/153 files (100%) have null dates
- **Compounds: 0/20 files (0%) have null dates** ✅ **USE AS MODEL**

**SEO IMPACT**: Blocks Google freshness signals, reduces ranking potential  
**FIX PRIORITY**: Critical - must be addressed before deployment  
**SOLUTION**: Study compounds domain date generation logic and apply to other domains

### **3. Author Information** (MANDATORY - Materials, Contaminants, Settings)

**Applies to**: Materials, Contaminants, Settings domains  
**Not used in**: Compounds domain

```yaml
author:
  id: [1-4]
  name: [Full Name]
  country: [Country]
  country_display: [Display Name]
  title: [Degree/Title]
  sex: [m|f]
  jobTitle: [Professional Title]
  expertise:
    - [Area 1]
    - [Area 2]
  affiliation:
    name: [Organization]
    type: Organization
  credentials:
    - [Credential 1]
    - [Credential 2]
  email: info@z-beam.com
  image: /images/author/[slug].jpg
  imageAlt: [Descriptive alt text]
  url: https://z-beam.com/authors/[slug]
  sameAs:
    - [LinkedIn URL]
    - [Professional profile URL]
  persona_file: [country]_persona.yaml
  formatting_file: [country]_formatting.yaml
```

**Example Authors by Domain**:
- **Materials**: Todd Dunning (US), Yuki Nakamura (Japan), Friedrich Weber (Germany), Yi-Chun Lin (Taiwan)
- **Contaminants**: Yi-Chun Lin (Taiwan) - common author
- **Settings**: Same author pool as materials

### **4. Voice Metadata** (MANDATORY)

```yaml
_metadata:
  voice:
    author_name: [Author Name]
    author_country: [Country]
    voice_applied: true
    content_type: material
```

### **5. Title & Description** (MANDATORY)

```yaml
title: [Material Name] Laser Cleaning
material_description: [30-50 word description highlighting key benefits and characteristics for laser cleaning applications]
```

**Requirements**:
- Description: 30-50 words
- Focus on practical benefits
- Technical but accessible language
- Avoid generic phrases like "ideal for" or "perfect for"

### **6. Breadcrumb Navigation** (MANDATORY)

```yaml
breadcrumb:
  - label: Home
    href: /
  - label: Materials
    href: /materials
  - label: [Category]
    href: /materials/[category-slug]
  - label: [Subcategory]
    href: /materials/[category-slug]/[subcategory-slug]
  - label: [Material Name]
    href: /materials/[category-slug]/[subcategory-slug]/[material-slug]
```

**Requirements**:
- Always 5 levels (Home → Materials → Category → Subcategory → Material)
- URLs must match directory structure
- Labels must match material hierarchy

### **7. Images** (MANDATORY)

```yaml
images:
  hero:
    alt: [Material name] surface during precision laser cleaning process removing contamination layer
    url: /images/material/[material-slug]-laser-cleaning-hero.jpg
  micro:
    alt: [Material name] surface at 500x magnification showing laser cleaning results
    url: /images/material/[material-slug]-laser-cleaning-micro.jpg
```

### **8. Micro Content** (MANDATORY - Before/After)

```yaml
micro:
  before: [60-80 words describing contaminated surface in vivid detail at high magnification. Use sensory language, describe texture, distribution, and visual characteristics.]
  after: [60-80 words describing cleaned surface. Contrast with before state, emphasize clarity, smoothness, and restoration quality.]
```

**Requirements**:
- Each section: 60-80 words
- Use vivid, descriptive language
- Focus on visual and tactile characteristics
- Maintain scientific accuracy
- Use present tense

### **9. FAQ Section** (MANDATORY - Minimum 3 Questions)

```yaml
faq:
  - question: [Practical question about laser cleaning this material]
    answer: [100-150 word answer with practical guidance, comparisons, and real-world context. Include author's experience.]
  - question: [Another practical question]
    answer: [100-150 word answer]
  - question: [Third practical question]
    answer: [100-150 word answer - MUST BE COMPLETE]
  # Additional FAQs encouraged for complex materials
```

**Requirements**:
- Minimum 3 FAQ items (more encouraged for complex topics)
- Questions: Practical, specific to material
- Answers: 100-150 words each
- Include comparisons to similar materials
- Mention real-world applications
- Use first-person experience ("I've seen", "In my experience")
- **ALL answers must be complete** - no truncation

### **10. Regulatory Standards** (MANDATORY - Minimum 2)

```yaml
regulatoryStandards:
  - description: [Standard identifier] - [Standard name]
    image: /images/logo/logo-org-[org-slug].png
    longName: [Full organization name]
    name: [Acronym]
    url: [Official standard URL]
```

**Common Standards**:
- FDA 21 CFR 1040.10 (Laser Product Performance)
- ANSI Z136.1 (Safe Use of Lasers)
- OSHA regulations
- ISO standards

### **11. Material Properties** (MANDATORY - Materials Domain Only)

**Applies to**: Materials domain (153 files)  
**Not used in**: Contaminants, Settings, Compounds

```yaml
materialProperties:
  material_characteristics:
    label: Material Characteristics
    percentage: 60.0
    density:
      value: [number]
      unit: g/cm³
      min: [category min]
      max: [category max]
    # ... 11 more properties with values, units, min/max
    
  laser_material_interaction:
    label: Laser-Material Interaction
    percentage: 40.0
    thermalDestruction:
      value: [number]
      unit: K
      min: [category min]
      max: [category max]
    # ... 8 more properties with scientific citations
```

**Required Material Characteristics** (12 total):
- density, porosity, surfaceRoughness, tensileStrength
- youngsModulus, hardness, flexuralStrength, oxidationResistance
- corrosionResistance, compressiveStrength, fractureToughness, electricalResistivity

**Required Laser Interaction Properties** (9 total):
- thermalDestruction, laserAbsorption, laserDamageThreshold, ablationThreshold
- thermalDiffusivity, thermalExpansion, specificHeat, thermalConductivity, laserReflectivity

**For Properties with Research**:
```yaml
propertyName:
  value: [number]
  unit: [unit]
  source: scientific_literature
  source_type: [journal_article|materials_database|reference_handbook]
  source_name: [Publication name]
  citation: [Full citation with DOI if available]
  context: [Material purity, temperature, test conditions, methodology]
  researched_date: [ISO 8601 timestamp]
  needs_validation: true
  min: [category min]
  max: [category max]
```

### **11a. Contaminant Properties** (Contaminants Domain)

**Applies to**: Contaminants domain (98 files)

```yaml
removal_difficulty:
  rating: [easy|moderate|difficult|very_difficult]
  factors:
    - [Factor affecting difficulty]
    - [Another factor]
surface_interaction:
  bonding_type: [mechanical|chemical|electrostatic|mixed]
  penetration_depth: [surface|shallow|deep]
cleaning_parameters:
  recommended_wavelength: [nm]
  recommended_power: [W]
  pulse_duration_range: [ns range]
```

### **11b. Laser Settings** (Settings Domain)

**Applies to**: Settings domain (153 files)

```yaml
laserSettings:
  wavelength:
    value: [number]
    unit: nm
    range: [min-max]
  power:
    value: [number]
    unit: W
    min: [number]
    max: [number]
  pulse_duration:
    value: [number]
    unit: [ns|ps|fs]
    range: [min-max]
  repetition_rate:
    value: [number]
    unit: Hz
    range: [min-max]
  spot_size:
    value: [number]
    unit: mm
  safety_limits:
    max_power: [W]
    max_fluence: [J/cm²]
```

### **11c. Chemical Properties** (Compounds Domain)

**Applies to**: Compounds domain (20 files)

```yaml
exposure_limits:
  osha_pel_ppm: [number or null]
  osha_pel_mg_m3: [number or null]
  niosh_rel_ppm: [number or null]
  niosh_rel_mg_m3: [number or null]
  acgih_tlv_ppm: [number]
  acgih_tlv_mg_m3: [number]
health_effects_keywords:
  - [keyword_1]
  - [keyword_2]
monitoring_required: [true|false]
typical_concentration_range: [range string]
sources_in_laser_cleaning:
  - [source_1]
  - [source_2]
```

### **12. Domain Linkages** (MANDATORY - 4 Contaminants)

```yaml
domain_linkages:
  related_contaminants:
    - id: [contaminant-slug]
      title: [Contaminant Title]
      url: /contaminants/[path]/[slug]
      image: /images/contaminants/[path]/[slug].jpg
      frequency: [rare|occasional|common|frequent]
      severity: [low|moderate|high|critical]
      typical_context: [industrial|general|specialized]
```

**Requirements**:
- Include 4-6 relevant contaminants
- All fields must be complete
- URLs must be valid paths
- Frequency/severity should reflect real-world occurrence

### **13. Service Offering** (MANDATORY)

```yaml
serviceOffering:
  enabled: true
  type: professionalCleaning
  materialSpecific:
    estimatedHoursMin: [1-8]
    estimatedHoursTypical: [2-12]
    targetContaminants:
      - [Contaminant type 1]
      - [Contaminant type 2]
    notes: [Specific considerations for this material]
```

### **14. EEAT Data** (Materials & Some Contaminants)

**Applies to**: 
- Materials domain: REQUIRED (all 153 files should have it)
- Contaminants domain: Optional (10 of 98 files currently have it)
- Settings domain: Not used
- Compounds domain: Not used

**🚨 DISCOVERED ISSUE**: 
- Materials: 21/153 files (14%) have null EEAT data
- Contaminants: 88/98 files (90%) missing EEAT data

**GOOD EXAMPLE** (from Alabaster):

```yaml
eeat:
  reviewedBy: Z-Beam Quality Assurance Team
  citations:
    - IEC 60825 - Safety of Laser Products
    - OSHA 29 CFR 1926.95 - Personal Protective Equipment
    - FDA 21 CFR 1040.10 - Laser Product Performance
  isBasedOn:
    name: IEC 60825 - Safety of Laser Products
    url: https://webstore.iec.ch/publication/3587
```

**ALTERNATIVE STRUCTURE** (more detailed):

```yaml
eeat:
  experience_indicators:
    hands_on_projects: [number or description]
    years_in_field: [number]
    practical_applications: [list of applications]
  expertise_indicators:
    technical_depth: [high|medium]
    specialization_areas:
      - [Area 1]
      - [Area 2]
    credentials_mentioned: true
  authoritativeness_indicators:
    institutional_affiliation: true
    professional_credentials: [list]
    publication_record: [description if applicable]
  trustworthiness_indicators:
    factual_accuracy: true
    cited_sources: true
    balanced_perspective: true
    limitations_acknowledged: [true if applicable]
```

### **15. Material Metadata** (Materials Domain Only)

**Applies to**: Materials domain (153 files)  
**Not used in**: Contaminants, Settings, Compounds

**🚨 DISCOVERED ISSUE**: 21/153 files (14%) have null material_metadata  
**GOOD EXAMPLE** (from Alabaster):

```yaml
material_metadata:
  last_updated: '2025-10-27T23:48:40.921556Z'
  normalization_applied: true
  normalization_date: '2025-10-27T23:48:40.921587Z'
  structure_version: '2.0'
```

**COMPREHENSIVE STRUCTURE** (recommended):

```yaml
material_metadata:
  completeness_score: 0.95  # 0.0-1.0 based on filled fields
  last_updated: '2025-12-16T00:00:00Z'
  last_verified: '2025-12-16T00:00:00Z'
  normalization_applied: true
  normalization_date: '2025-12-16T00:00:00Z'
  structure_version: '4.0.0'  # Match schema_version
  content_quality:
    technical_depth: high
    practical_utility: high
    seo_optimized: true
  relevance_scores:
    industrial_applications: 0.9
    research_applications: 0.7
    consumer_applications: 0.5
```

### **16. Preserved Data** (MANDATORY)

```yaml
preservedData:
  generationMetadata:
    generated_date: '[ISO 8601 timestamp]'
    generation_context: [brief description]
    quality_checks_passed: true
```

---

## � DISCOVERED ISSUES FROM EXISTING FILES (Dec 2025)

### **Analysis of 153 Material Files**

**Last Generated**: December 15, 2025 (all files)  
**Schema Version**: 4.0.0 ✅  
**Overall Grade**: B (82/100)

#### **Critical Issues (Must Fix)**

| Issue | Affected Files | Impact | Priority |
|-------|----------------|--------|----------|
| **Null datePublished** | 153/153 (100%) | SEO rankings blocked | 🔴 Critical |
| **Null dateModified** | 153/153 (100%) | Change tracking missing | 🔴 Critical |
| **Null eeat** | 21/153 (14%) | E-E-A-T signals missing | 🟡 High |
| **Null material_metadata** | 21/153 (14%) | Completeness tracking absent | 🟡 High |
| **Truncated FAQ answers** | ~3 files | Incomplete content | 🟡 High |

#### **Quality Highlights** ✅

- ✅ **Material Properties**: 100% complete with research citations
- ✅ **FAQ Content**: Most files have 3-9 FAQs (good depth)
- ✅ **Regulatory Standards**: 2-4 standards per file
- ✅ **Domain Linkages**: 4+ related contaminants
- ✅ **Schema Compliance**: All files use schema 4.0.0
- ✅ **Content Quality**: Descriptions, micro content within target ranges

#### **Examples of Excellence**

**Iron (iron-laser-cleaning.yaml)**:
- ✅ 9 comprehensive FAQ items
- ✅ Technical depth with specific parameters
- ✅ Complete micro before/after descriptions
- ✅ 4 regulatory standards
- ⚠️ Missing: dates, some metadata
- **Grade**: 88% (B+)

**Alabaster (alabaster-laser-cleaning.yaml)**:
- ✅ Complete EEAT structure
- ✅ Material metadata present
- ✅ Citations and isBasedOn fields
- ⚠️ Missing: dates (assumed)
- **Grade**: 85-90% (B+/A-)

#### **Immediate Actions Required**

1. **Add ISO 8601 timestamps** to all datePublished/dateModified fields
2. **Populate EEAT data** for 21 files missing it
3. **Add material_metadata** for 21 files missing it
4. **Complete truncated FAQs** (Aluminum Bronze, possibly others)
5. **Verify no mid-sentence endings** across all FAQ answers

#### **Success Metrics**

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Date fields populated | 0% | 100% | ❌ |
| EEAT data present | 86% | 100% | 🟡 |
| Material metadata | 86% | 100% | 🟡 |
| Content completeness | 98% | 100% | 🟢 |
| Schema compliance | 100% | 100% | ✅ |

---

## �🚫 Common Issues to Avoid

### **Issue #1: Null Date Fields**
```yaml
# ❌ WRONG
datePublished: null
dateModified: null

# ✅ CORRECT
datePublished: '2025-12-16T00:00:00Z'
dateModified: '2025-12-16T00:00:00Z'
```

### **Issue #2: Truncated FAQ Answers**
```yaml
# ❌ WRONG (incomplete answer)
answer: Laser cleaning acrylic demands careful control since its clear nature can fog from uneven heating. Compared to opaque thermoplastics, PMMA reveals contaminants easily but risks haze if pulses are too intense.

# ✅ CORRECT (complete answer)
answer: Laser cleaning acrylic demands careful control since its clear nature can fog from uneven heating. Compared to opaque thermoplastics, PMMA reveals contaminants easily but risks haze if pulses are too intense. I've found that gradual power ramping prevents this issue, letting you restore optical clarity without compromising the surface finish for applications like lenses and display panels.
```

### **Issue #3: Null EEAT/Metadata Fields**
```yaml
# ❌ WRONG
eeat: null
material_metadata: null

# ✅ CORRECT - Always populate these fields
```

### **Issue #4: Incomplete Property Research**
```yaml
# ❌ WRONG - Missing citation details
laserDamageThreshold:
  value: 1.8
  unit: J/cm²

# ✅ CORRECT - Full research metadata
laserDamageThreshold:
  value: 1.8
  unit: J/cm²
  source: scientific_literature
  source_type: journal_article
  source_name: 'Applied Physics A: Materials Science & Processing'
  citation: 'B. W. Smith et al., Applied Physics A 79, 1023-1026 (2004)'
  context: Commercial-grade clear PMMA (99% purity), 25°C, 532 nm Nd:YAG laser
  researched_date: '2025-11-24T12:30:31.076360'
  needs_validation: true
  min: 0.71
  max: 2.6
```

---

## 📊 Quality Standards

### **Content Quality Requirements**

| Section | Min Words | Max Words | Quality Check |
|---------|-----------|-----------|---------------|
| material_description | 30 | 50 | Technical + practical benefits |
| micro.before | 60 | 80 | Vivid sensory description |
| micro.after | 60 | 80 | Clear contrast with before |
| FAQ answer | 100 | 150 | Complete, practical, experienced |
| FAQ count | 3+ | No limit | More for complex materials |

### **Completeness Requirements**

- ✅ **100%** of material properties must have values
- ✅ **100%** of laser interaction properties must have research metadata
- ✅ **4-6** related contaminants with complete metadata
- ✅ **3+ FAQ items** (more for complex materials - Iron has 9!)
- ✅ **2+** regulatory standards (most files have 2-4)
- ✅ **0** null fields in critical sections (datePublished, dateModified, eeat, material_metadata)

**🚨 CRITICAL**: Current files fail on date fields (100% null rate) and partial metadata (14% null rate)

### **SEO Requirements**

- ✅ Title follows pattern: "[Material Name] Laser Cleaning"
- ✅ All image alt text is descriptive and unique
- ✅ Breadcrumb navigation is complete and accurate
- ✅ URLs are properly formatted and consistent
- ✅ Meta descriptions are concise and keyword-rich

---

## 🎯 Example: High-Quality Frontmatter

See `/Users/todddunning/Desktop/Z-Beam/z-beam/frontmatter/materials/acrylic-pmma-laser-cleaning.yaml` for a reference implementation that scores **93%** quality (with only minor date/metadata issues).

**Strengths to Emulate**:
- ✅ 100% complete material properties with scientific citations
- ✅ Rich, vivid micro before/after descriptions
- ✅ Well-structured FAQ with practical guidance
- ✅ Complete domain linkages with 4 related contaminants
- ✅ Comprehensive author metadata
- ✅ Strong service offering details

---

## 🔧 Pre-Generation Checklist

Before generating frontmatter:

- [ ] Verify material name, category, and subcategory
- [ ] Confirm author assignment (ID 1-4)
- [ ] **🔥 Generate ISO 8601 timestamps for dates** (CRITICAL - currently 100% missing)
- [ ] Research all 21 material properties with citations
- [ ] Identify 4-6 relevant contaminants
- [ ] Draft complete FAQ answers (no truncation, 100-150 words each)
- [ ] **🔥 Populate EEAT data** (14% of files missing this)
- [ ] **🔥 Calculate and add material_metadata** (14% of files missing this)
- [ ] Validate all URLs and image paths
- [ ] Ensure no null fields in critical sections
- [ ] **Verify FAQ answers are complete** (check for mid-sentence endings)
- [ ] Test with one file before batch generation

---

## 🎓 After Generation

1. **Validate Structure**: Ensure YAML is valid and properly indented
2. **Check Completeness**: All required fields present and non-null
3. **Verify Quality**: Word counts, descriptions meet standards
4. **Test URLs**: All href/url values are valid paths
5. **Review Content**: Technical accuracy and readability
6. **Grade Result**: Aim for 95%+ quality score

---

## 📞 Questions?

When uncertain about:
- **Author selection**: Choose based on material expertise
- **Property values**: Research from scientific literature
- **Contaminant linkages**: Consider real-world cleaning scenarios
- **Quality standards**: Default to higher quality and completeness

**Target**: Every frontmatter file should be production-ready at 95%+ quality.
