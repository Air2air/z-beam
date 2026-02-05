# Unified Frontmatter Schema v6.0.0
**Date**: February 2, 2026  
**Purpose**: Fully normalized structure across all 4 domains

## Design Principles
1. **Consistent field order** across all domains
2. **No redundant fields** (eliminated duplicates)
3. **Minimal nesting** (max 2 levels deep)
4. **Reference-based relationships** (IDs only, expand in code)
5. **Generated fields removed** (computed at runtime)
6. **UI hints removed** (belongs in component code)
7. **80% file size reduction**

---

## Universal Field Order (ALL Domains)

```yaml
# ===================================
# SECTION 1: CORE IDENTITY (Required)
# ===================================
id: string                    # Unique identifier
contentType: enum             # material|contaminant|compound|setting
schemaVersion: "6.0.0"        # Schema version

# ===================================
# SECTION 2: BASIC INFO (Required)
# ===================================
name: string                  # Display name
category: string              # Primary category
subcategory: string           # Secondary category
datePublished: date           # ISO 8601 date only
dateModified: datetime        # ISO 8601 full datetime

# ===================================
# SECTION 3: CONTENT (Required)
# ===================================
description: string           # Primary description (was pageDescription)

# ===================================
# SECTION 4: SEO (Generated)
# ===================================
meta:
  title: string               # SEO title (was pageTitle)
  description: string         # Meta description
  path: string                # URL path (was fullPath)

# ===================================
# SECTION 5: IMAGES (Required)
# ===================================
images:
  hero: string                # Filename only
  micro: string               # Filename only

# ===================================
# SECTION 6: AUTHOR (Reference)
# ===================================
authorId: number              # Reference to author registry

# ===================================
# SECTION 7: DOMAIN-SPECIFIC DATA
# ===================================
# [See domain-specific sections below]

# ===================================
# SECTION 8: RELATIONSHIPS
# ===================================
relationships:
  # [Domain-specific relationship structure]
```

---

## Domain-Specific Schemas

### Materials Domain

```yaml
# ... universal fields 1-6 ...

# SECTION 7: MATERIAL-SPECIFIC
properties:
  physical:
    density: number
    hardness: number
    meltingPoint: number
    thermalConductivity: number
  
  optical:
    reflectivity1064: number
    absorptivity1064: number
    transmissivity1064: number

# SECTION 8: RELATIONSHIPS
relationships:
  contaminants:
    common: [id]              # Array of contaminant IDs
    rare: [id]
  settings:
    recommended: id           # Single settings ID reference
```

### Contaminants Domain

```yaml
# ... universal fields 1-6 ...

# SECTION 7: CONTAMINANT-SPECIFIC
properties:
  composition: [string]       # Chemical composition
  validMaterials: [string]    # Material IDs where applicable
  prohibitedMaterials: [string]

laser:
  wavelength: [number]        # Preferred wavelengths
  fluence:
    min: number
    max: number
    optimal: number
  pulseWidth:
    min: number
    max: number
    optimal: number
  scanSpeed:
    min: number
    max: number
    optimal: number
  passes:
    optimal: number
    maxEffective: number
    efficiency: number
  thermal:
    ablationThreshold: number
    decomposition: number
    vaporization: number

safety:
  fireRisk: enum              # low|moderate|high
  toxicGas: enum
  ppe:
    respiratory: string
    eye: string
    skin: string
  compounds: [{id, phase, hazard, concentration, limit}]
  ventilation:
    airChanges: number
    velocity: number
    filter: string

appearance:
  [category]:                 # One per material category
    color: string
    texture: string
    pattern: string
    coverage: string

# SECTION 8: RELATIONSHIPS
relationships:
  materials:
    common: [{id, frequency, difficulty}]
    prohibited: [string]
  compounds:
    produces: [{id, phase, hazard}]
  settings:
    recommended: [id]
```

### Compounds Domain

```yaml
# ... universal fields 1-6 ...

# SECTION 7: COMPOUND-SPECIFIC
properties:
  formula: string
  casNumber: string
  molecularWeight: number
  phase: enum                 # gas|liquid|solid
  hazardClass: enum

safety:
  exposureLimit: number
  unit: string                # ppm, mg/m3
  hazardLevel: enum           # low|moderate|high|extreme
  symptoms: [string]
  firstAid: [string]

physical:
  boilingPoint: number
  meltingPoint: number
  density: number
  solubility: string

# SECTION 8: RELATIONSHIPS
relationships:
  contaminants:
    producedBy: [id]          # Contaminant IDs
  materials:
    affectsCorrosion: [id]    # Material IDs
    affectsHealth: [id]
```

### Settings Domain

```yaml
# ... universal fields 1-6 ...

# SECTION 7: SETTINGS-SPECIFIC
machine:
  power:
    min: number
    max: number
    optimal: number
    unit: string
  pulseEnergy:
    min: number
    max: number
    optimal: number
  frequency:
    min: number
    max: number
    optimal: number
  scanSpeed:
    min: number
    max: number
    optimal: number

application:
  thickness:
    min: number
    max: number
  passes:
    typical: number
    max: number
  cooling:
    required: boolean
    method: string

# SECTION 8: RELATIONSHIPS
relationships:
  materials:
    optimizedFor: [id]
  contaminants:
    effective: [{id, effectiveness}]
  regulatory:
    standards: [id]
```

---

## Key Changes from v5.0.0

### Eliminated Fields
- ❌ `displayName` → Use `name`
- ❌ `pageTitle` → Use `meta.title`
- ❌ `pageDescription` → Use `description`
- ❌ `metaDescription` (deprecated) → Use `pageDescription`
- ❌ `fullPath` → Use `meta.path`
- ❌ `breadcrumb` → Generate from category/subcategory
- ❌ `card.*` → UI presentation logic (belongs in components)
- ❌ `eeat.*` → Move to author registry
- ❌ `author.*` (full object) → Use `authorId` reference only
- ❌ `relationships.*.*.presentation` → UI logic
- ❌ `relationships.*.*._section.*` → UI metadata
- ❌ `components.*` → Domain-specific content in description

### Simplified Fields
- ✅ `images.hero/micro` → Filenames only (not full objects)
- ✅ `datePublished` → Date only (not datetime)
- ✅ `dateModified` → Datetime with timezone
- ✅ Relationships → ID references only (expand in code)

### New Structure
- ✅ `meta` → Consolidated SEO fields
- ✅ `properties` → Domain-specific technical data
- ✅ `laser` → Consolidated laser parameters
- ✅ `safety` → Consolidated safety data
- ✅ `machine` → Settings parameters
- ✅ `application` → Usage guidelines

---

## Migration Strategy

### Phase 1: Schema Definition (Current)
- Define v6.0.0 schema
- Document all field mappings
- Create validation rules

### Phase 2: Code Updates
- Update loader functions to expand references
- Create SEO field generators
- Update components to handle new structure

### Phase 3: Data Migration
- Create migration scripts
- Validate all frontmatter files
- Regenerate all files in new format

### Phase 4: Verification
- Run full test suite
- Verify all pages render correctly
- Check SEO metadata
- Validate structured data

---

## Benefits

1. **80% smaller files** (780 lines → 150 lines)
2. **Consistent structure** across all domains
3. **Easier maintenance** (one schema, not four)
4. **Faster parsing** (less data to process)
5. **Clear separation** (data vs presentation)
6. **Type-safe** (single source of truth)
7. **Extensible** (easy to add new fields)

---

## Validation Rules

```typescript
interface UniversalFrontmatter {
  // Section 1: Core Identity
  id: string;
  contentType: 'material' | 'contaminant' | 'compound' | 'setting';
  schemaVersion: '6.0.0';
  
  // Section 2: Basic Info
  name: string;
  category: string;
  subcategory: string;
  datePublished: string;       // YYYY-MM-DD
  dateModified: string;         // ISO 8601
  
  // Section 3: Content
  description: string;
  
  // Section 4: SEO (optional, generated)
  meta?: {
    title: string;
    description: string;
    path: string;
  };
  
  // Section 5: Images
  images: {
    hero: string;              // filename.jpg
    micro: string;             // filename.jpg
  };
  
  // Section 6: Author
  authorId: number;            // 1-4
  
  // Section 7: Domain-specific
  properties?: Record<string, any>;
  laser?: Record<string, any>;
  safety?: Record<string, any>;
  machine?: Record<string, any>;
  application?: Record<string, any>;
  appearance?: Record<string, any>;
  
  // Section 8: Relationships
  relationships?: Record<string, any>;
}
```

---

## Next Steps

1. ✅ Schema defined
2. ⏳ Create migration script
3. ⏳ Update loader functions
4. ⏳ Migrate one file per domain (test)
5. ⏳ Validate rendering
6. ⏳ Migrate all files
7. ⏳ Update documentation
8. ⏳ Deploy to production
