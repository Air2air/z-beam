# Frontmatter Normalization Specification

**Date**: December 19, 2025  
**Purpose**: Consolidate, deduplicate, and normalize frontmatter structure across all domains  
**Scope**: ~650 files (materials, contaminants, compounds, settings)  
**Status**: 🟢 Ready for Implementation

---

## 📋 Overview

Five key normalizations to create consistent, maintainable frontmatter structure:

1. **Settings Restructure** - Move data into relationships (consistency)
2. **Remove Redundant Fields** - Eliminate category/subcategory/slug from items
3. **Standardize Naming** - Consistent relationship section names
4. **Group Contaminants** - Add semantic grouping like materials
5. **Clean Unused Fields** - Remove fields that provide no value

---

## 🔧 **Change 1: Settings Structure Restructure**

### Current Structure (Inconsistent)
```yaml
id: Aluminum
name: Aluminum
machine_settings:  # ❌ Root level
  powerRange:
    description: ...
    unit: W
    value: 100
relationships:     # Separate section
  related_materials: []
challenges:        # ❌ Root level
  thermal_management: []
```

### Target Structure (Consistent with Compounds)
```yaml
id: Aluminum
name: Aluminum
datePublished: '2025-12-19T08:18:36.206590Z'
dateModified: '2025-12-19T08:18:36.206590Z'
content_type: settings
schema_version: 5.0.0
full_path: /settings/Aluminum
breadcrumb: [...]
author: {...}

relationships:
  machine_settings:  # ✅ Inside relationships
    powerRange:
      description: Optimal average power for Aluminum oxide layer removal
      unit: W
      value: 100
    wavelength:
      description: Near-IR wavelength for optimal Aluminum absorption
      unit: nm
      value: 1064
    spotSize:
      description: Beam spot diameter for effective cleaning resolution
      unit: μm
      value: 50
    repetitionRate:
      description: Optimal repetition rate for continuous cleaning coverage
      unit: kHz
      value: 50
    energyDensity:
      description: Fluence threshold for Aluminum oxide removal
      unit: J/cm²
      value: 5.1
    pulseWidth:
      description: Nanosecond pulse duration for efficient oxide removal
      unit: ns
      value: 10
    scanSpeed:
      description: Optimal scanning speed for efficient coverage
      unit: mm/s
      value: 500
    passCount:
      description: Recommended number of passes for complete removal
      unit: passes
      value: 3
    overlapRatio:
      description: Optimal pulse overlap for uniform cleaning coverage
      unit: '%'
      value: 50
  
  challenges:        # ✅ Inside relationships
    thermal_management:
    - challenge: High thermal conductivity and heat spread
      severity: medium
      property_value: 4-400 W/(m·K) depending on metal
      impact: Heat spreads rapidly causing large heat-affected zones
      solutions:
      - Use shorter pulse durations (picosecond/femtosecond)
      - Increase scan speed to minimize dwell time
      - Apply cooling between passes
    
    surface_characteristics:
    - challenge: High reflectivity
      severity: high
      reflectivity_range: 60-95% at 1064nm
      impact: Most laser energy reflected
      solutions:
      - Use shorter wavelengths (355nm UV)
      - Increase power density
    
    contamination_challenges:
    - challenge: Rust and oxide layer removal
      severity: medium
      impact: Requires multiple passes
      solutions:
      - First pass at higher power
      - Second pass at lower power
  
  related_materials: []
  related_contaminants: []
  regulatory_standards:
  - type: regulatory_standards
    id: osha-ppe-requirements

description: "..."  # ✅ Keep at root (AI-generated content, universal field)
regulatory_standards_detail: [...]  # ✅ Keep at root (expanded reference data)
seo_description: "..."
excerpt: "..."
```

**Migration**:
- Move `machine_settings` → `relationships.machine_settings`
- Move `challenges` → `relationships.challenges`
- Keep AI-generated fields at root (`description`, `seo_description`, `excerpt`)
- Keep reference expansion at root (`regulatory_standards_detail`)

**Files Affected**: ~400 settings files

---

## 🔧 **Change 2: Remove Redundant Fields from Relationship Items**

### Current (Redundant Data)
```yaml
relationships:
  contaminants:
    groups:
      organic_residues:
        items:
        - id: adhesive-residue-contamination
          title: Adhesive Residue / Tape Marks
          url: /contaminants/adhesive-residue
          image: /images/contaminants/adhesive-residue.jpg
          category: organic-residue        # ❌ REMOVE (in URL)
          subcategory: adhesive            # ❌ REMOVE (in URL)
          slug: adhesive-residue           # ❌ REMOVE (unused)
          frequency: common                # ✅ KEEP
          severity: moderate               # ✅ KEEP
          typical_context: general         # ❌ REMOVE (always same)
```

### Target (Clean)
```yaml
relationships:
  contaminants:
    groups:
      organic_residues:
        items:
        - id: adhesive-residue-contamination
          title: Adhesive Residue / Tape Marks
          url: /contaminants/organic-residue/adhesive/adhesive-residue-contamination
          image: /images/contaminants/adhesive-residue.jpg
          frequency: common
          severity: moderate
          notes: Common during manufacturing and shipping processes
```

**Changes**:
- ❌ Remove: `category`, `subcategory`, `slug`, `typical_context`
- ✅ Keep: `id`, `title`, `url`, `image`, `frequency`, `severity`
- ✅ Add: `notes` (optional, for important context)
- ✅ Fix: URLs to use full paths with IDs

**Files Affected**: All 650+ files with relationship items

---

## 🔧 **Change 3: Standardize Relationship Naming**

### Current (Inconsistent)
```yaml
# Materials:
relationships:
  contaminants:              # Good

# Contaminants:
relationships:
  related_materials:         # ❌ Inconsistent prefix

# Compounds:
relationships:
  produced_by_contaminants:  # ❌ Too verbose
  found_on_materials:        # ❌ Too verbose

# Settings:
relationships:
  related_materials:         # ❌ Inconsistent prefix
  related_contaminants:      # ❌ Inconsistent prefix
```

### Target (Consistent)
```yaml
# Materials:
relationships:
  contaminants:              # ✅ Simple noun

# Contaminants:
relationships:
  materials:                 # ✅ Simple noun (removed "related_")

# Compounds:
relationships:
  source_contaminants:       # ✅ Clear, concise
  affected_materials:        # ✅ Clear, concise

# Settings:
relationships:
  materials:                 # ✅ Simple noun
  contaminants:              # ✅ Simple noun
```

**Naming Rules**:
1. Use simple nouns for basic relationships (`materials`, `contaminants`)
2. Use descriptive prefixes only when clarifying role (`source_`, `affected_`)
3. Never use `related_` prefix (redundant - they're all related)
4. Consistent across all domains

**Files Affected**: All 650+ files

---

## 🔧 **Change 4: Group Contaminants Relationships**

### Current (Flat)
```yaml
# contaminants/adhesive-residue-contamination.yaml
relationships:
  related_materials:  # Flat array of 100+ items
  - id: mahogany-laser-cleaning
    title: Mahogany
  - id: stainless-steel-laser-cleaning
    title: Stainless Steel
  - id: aluminum-laser-cleaning
    title: Aluminum
  - id: bamboo-laser-cleaning
    title: Bamboo
  # ... 100+ more items
```

### Target (Grouped)
```yaml
# contaminants/adhesive-residue-contamination.yaml
relationships:
  materials:
    title: Affected Materials
    description: Materials where this contaminant commonly occurs and requires laser cleaning removal
    groups:
      metals:
        title: Metal Substrates
        description: Ferrous and non-ferrous metals affected by this contamination
        items:
        - id: stainless-steel-laser-cleaning
          title: Stainless Steel
          url: /materials/metal/ferrous/stainless-steel-laser-cleaning
          image: /images/materials/stainless-steel.jpg
          frequency: common
          severity: moderate
        - id: aluminum-laser-cleaning
          title: Aluminum
          url: /materials/metal/non-ferrous/aluminum-laser-cleaning
          image: /images/materials/aluminum.jpg
          frequency: common
          severity: moderate
      
      woods:
        title: Wood Products
        description: Hardwood and softwood materials affected by this contamination
        items:
        - id: mahogany-laser-cleaning
          title: Mahogany
          url: /materials/wood/hardwood/mahogany-laser-cleaning
          image: /images/materials/mahogany.jpg
          frequency: common
          severity: moderate
        - id: bamboo-laser-cleaning
          title: Bamboo
          url: /materials/wood/hardwood/bamboo-laser-cleaning
          image: /images/materials/bamboo.jpg
          frequency: common
          severity: moderate
      
      plastics:
        title: Plastic Materials
        description: Thermoplastic and composite materials affected by this contamination
        items:
        - id: acrylic-pmma-laser-cleaning
          title: Acrylic (PMMA)
          url: /materials/plastic/thermoplastic/acrylic-pmma-laser-cleaning
          image: /images/materials/acrylic-pmma.jpg
          frequency: common
          severity: moderate
      
      ceramics:
        title: Ceramic Materials
        description: Ceramic and glass materials affected by this contamination
        items:
        - id: porcelain-laser-cleaning
          title: Porcelain
          url: /materials/ceramic/porcelain/porcelain-laser-cleaning
          image: /images/materials/porcelain.jpg
          frequency: moderate
          severity: low
```

**Grouping Strategy**:
- **metals**: All materials with category=metal
- **woods**: All materials with category=wood
- **plastics**: All materials with category=plastic
- **ceramics**: All materials with category=ceramic
- **composites**: All materials with category=composite
- **stone**: All materials with category=stone

**Files Affected**: ~200 contaminant files

---

## 🔧 **Change 5: Remove Unused Fields**

### Fields to Remove

**1. `slug` in relationship items** (unused)
```yaml
# BEFORE:
- id: aluminum-laser-cleaning
  slug: aluminum              # ❌ Remove
  title: Aluminum

# AFTER:
- id: aluminum-laser-cleaning
  title: Aluminum
```

**2. `typical_context` when always "general"** (no value)
```yaml
# BEFORE:
- id: aluminum-laser-cleaning
  frequency: common
  severity: moderate
  typical_context: general    # ❌ Remove (always same)

# AFTER:
- id: aluminum-laser-cleaning
  frequency: common
  severity: moderate
  notes: Common in aerospace and automotive applications  # ✅ Add if specific context exists
```

**Rule**: Only include `notes` field when there's specific, valuable context to provide.

**Files Affected**: All 650+ files with relationship items

---

## 📊 **Complete Example: Before & After**

### BEFORE (Current)

#### Materials
```yaml
relationships:
  contaminants:
    groups:
      organic_residues:
        items:
        - id: adhesive-residue-contamination
          title: Adhesive Residue
          url: /contaminants/adhesive-residue
          category: organic-residue
          subcategory: adhesive
          slug: adhesive-residue
          frequency: common
          severity: moderate
          typical_context: general
```

#### Contaminants
```yaml
relationships:
  related_materials:  # Flat
  - id: aluminum-laser-cleaning
    title: Aluminum
    url: /materials/aluminum
    category: metal
    subcategory: non-ferrous
    slug: aluminum
    frequency: common
    severity: moderate
    typical_context: general
```

#### Compounds
```yaml
relationships:
  produced_by_contaminants:
  - id: adhesive-residue-contamination
    title: Adhesive Residue
```

#### Settings
```yaml
machine_settings:  # Root level
  powerRange: {...}
challenges:        # Root level
  thermal_management: []
relationships:
  related_materials: []
```

---

### AFTER (Target)

#### Materials
```yaml
relationships:
  contaminants:
    groups:
      organic_residues:
        items:
        - id: adhesive-residue-contamination
          title: Adhesive Residue / Tape Marks
          url: /contaminants/organic-residue/adhesive/adhesive-residue-contamination
          image: /images/contaminants/adhesive-residue.jpg
          frequency: common
          severity: moderate
```

#### Contaminants
```yaml
relationships:
  materials:  # Grouped
    title: Affected Materials
    groups:
      metals:
        title: Metal Substrates
        items:
        - id: aluminum-laser-cleaning
          title: Aluminum
          url: /materials/metal/non-ferrous/aluminum-laser-cleaning
          image: /images/materials/aluminum.jpg
          frequency: common
          severity: moderate
```

#### Compounds
```yaml
relationships:
  source_contaminants:
    title: Contaminant Sources
    items:
    - id: adhesive-residue-contamination
      title: Adhesive Residue / Tape Marks
      url: /contaminants/organic-residue/adhesive/adhesive-residue-contamination
      image: /images/contaminants/adhesive-residue.jpg
      production_likelihood: high
      typical_conditions: Laser ablation of adhesive polymers
```

#### Settings
```yaml
relationships:
  machine_settings:  # Inside relationships
    powerRange: {...}
  challenges:        # Inside relationships
    thermal_management: []
  materials: []
  contaminants: []
```

---

## 🎯 **Implementation Checklist**

### Phase 1: Settings Restructure (~400 files)
- [ ] Move `machine_settings` into `relationships.machine_settings`
- [ ] Move `challenges` into `relationships.challenges`
- [ ] Rename `related_materials` → `materials`
- [ ] Rename `related_contaminants` → `contaminants`
- [ ] Keep AI content at root (`description`, etc.)
- [ ] Update website code to access `relationships.machine_settings`

### Phase 2: Remove Redundant Fields (650+ files)
- [ ] Remove `category` from all relationship items
- [ ] Remove `subcategory` from all relationship items
- [ ] Remove `slug` from all relationship items
- [ ] Remove `typical_context: general` from items
- [ ] Update URLs to full paths with IDs
- [ ] Add `notes` field only where valuable

### Phase 3: Standardize Naming (650+ files)
- [ ] Materials: Keep `contaminants` ✅
- [ ] Contaminants: `related_materials` → `materials`
- [ ] Compounds: `produced_by_contaminants` → `source_contaminants`
- [ ] Compounds: `found_on_materials` → `affected_materials`
- [ ] Settings: `related_materials` → `materials`
- [ ] Settings: `related_contaminants` → `contaminants`

### Phase 4: Group Contaminants (~200 files)
- [ ] Add `materials` section with title/description
- [ ] Create `groups` object
- [ ] Group by category: metals, woods, plastics, ceramics, composites, stone
- [ ] Add title/description to each group
- [ ] Organize items into appropriate groups
- [ ] Maintain all item metadata (id, title, url, image, frequency, severity)

### Phase 5: Validation
- [ ] Run integrity checker on all files
- [ ] Verify schema compliance
- [ ] Test website rendering for each domain
- [ ] Validate cross-references work correctly
- [ ] Check no broken links or missing images

---

## 📈 **Expected Results**

### Consistency
- ✅ All domains follow same pattern: technical data under `relationships`
- ✅ Consistent naming: `materials`, `contaminants`, `source_contaminants`
- ✅ Uniform structure across 650+ files

### Simplicity
- ✅ Removed 2,600+ redundant fields (4 fields × 650 files)
- ✅ Cleaner data, easier to maintain
- ✅ Shorter files, faster parsing

### Usability
- ✅ Grouped contaminants improve navigation
- ✅ Full URLs make debugging easier
- ✅ `notes` field provides valuable context when needed

### Maintainability
- ✅ Single pattern for all domains
- ✅ Less confusion about field placement
- ✅ Easier to add new domains

---

## ⏱️ **Estimated Effort**

| Phase | Files | Time | Priority |
|-------|-------|------|----------|
| 1. Settings restructure | 400 | 4-6 hours | 🔴 HIGH |
| 2. Remove redundant fields | 650+ | 2-3 hours | 🟡 MEDIUM |
| 3. Standardize naming | 650+ | 1-2 hours | 🟡 MEDIUM |
| 4. Group contaminants | 200 | 3-4 hours | 🟢 LOW |
| 5. Validation | All | 2-3 hours | 🔴 HIGH |
| **TOTAL** | **650+** | **12-18 hours** | |

**Recommendation**: Implement in phases over 2-3 days with validation between each phase.

---

## 🚨 **Breaking Changes**

### Website Code Changes Required

**1. Settings Access Pattern**
```typescript
// OLD:
const machineSettings = settings?.machine_settings;

// NEW:
const machineSettings = settings?.relationships?.machine_settings;
```

**2. Relationship Names**
```typescript
// OLD:
const materials = contaminant?.relationships?.related_materials;

// NEW:
const materials = contaminant?.relationships?.materials;
```

**3. Item Field Access**
```typescript
// OLD:
const category = item.category;
const subcategory = item.subcategory;

// NEW:
// Parse from URL or don't use (not needed)
```

---

## ✅ **Validation Criteria**

A normalized frontmatter file must:

1. ✅ Have technical data ONLY under `relationships.*`
2. ✅ Use consistent relationship names (`materials`, `contaminants`, not `related_*`)
3. ✅ NOT have redundant fields in relationship items (no `category`, `subcategory`, `slug`, `typical_context`)
4. ✅ Use full URLs with IDs in all cross-references
5. ✅ Have grouped structures where applicable (contaminants)
6. ✅ Match target structure examples in this spec

---

**Version**: 1.0  
**Last Updated**: December 19, 2025  
**Status**: Ready for Implementation  
**See Also**: 
- `COMPOUND_FRONTMATTER_RESTRUCTURE_SPEC.md`
- `COMPOUND_SECTIONS_TO_MOVE.md`
- `RELATIONSHIP_GROUPING_PROPOSAL_DEC18_2025.md`
