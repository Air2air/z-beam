# Domain Linkages Structure - Complete Specification

⚠️ **SUPERSEDED** by Frontmatter Structure v5.0.0  
**Version**: 1.0.0 (v4.0.0 nested structure)  
**Date**: December 15, 2025  
**Status**: DEPRECATED - Superseded by flattened structure  
**Superseded By**: `FRONTMATTER_STRUCTURE_SPECIFICATION.md` (v5.0.0)

---

## ⚠️ Supersession Notice

This document specifies **v4.0.0 nested structure** with `domain_linkages` object.

**As of December 17, 2025**, frontmatter uses **v5.0.0 flattened structure**:
- Linkage arrays are TOP-LEVEL fields
- No nested `domain_linkages` object
- Direct property access: `metadata.produces_compounds` (not `metadata.domain_linkages.produces_compounds`)

**For current structure**: See `FRONTMATTER_STRUCTURE_SPECIFICATION.md`  
**For migration details**: See `FLATTENED_ARCHITECTURE_MIGRATION_COMPLETE.md`

---

## Legacy Specification (v4.0.0 - Historical Reference)

This document describes the original nested structure (NO LONGER IN USE).

---

## Executive Summary

This document specifies the complete `domain_linkages` data structure for bidirectional cross-domain relationships with enhanced card-based UI display requirements.

**Key Features**:
- ✅ Standardized `id`, `title`, `url`, `image` for all linkages
- ✅ Domain-specific metadata (frequency, severity, source, etc.)
- ✅ Adaptive UI layouts based on result count (1-4, 5-12, 13-24, 25+)
- ✅ Category and subcategory filtering for large result sets
- ✅ Single source of truth (no duplicated exposure limits or standards)

---

## 1. Data Structure

### 1.1 Core Schema

All domains use the `domain_linkages` top-level key:

```yaml
domain_linkages:
  related_materials: []      # Materials affected by/compatible with this entity
  related_compounds: []      # Compounds produced/involved
  related_contaminants: []   # Contaminants that form/apply
  related_settings: []       # Machine settings applicable
  regulatory_compliance: []  # Standards and regulations
  ppe_requirements: []       # Personal protective equipment
```

### 1.2 Universal Fields

**ALL linkage entries include**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | Kebab-case identifier (e.g., "aluminum", "formaldehyde") |
| `title` | string | ✅ Yes | Human-readable display name (e.g., "Aluminum", "Formaldehyde") |
| `url` | string | ✅ Yes | Relative URL to entity page (e.g., "/materials/metals/aluminum/aluminum") |
| `image` | string | ✅ Yes | Path to entity image (e.g., "/images/materials/aluminum.jpg") |

---

## 2. Domain-Specific Schemas

### 2.1 Related Materials

**Used by**: Contaminants, Settings, Compounds

```yaml
related_materials:
  - id: "aluminum"
    title: "Aluminum"
    url: "/materials/metals/aluminum/aluminum"
    image: "/images/materials/aluminum.jpg"
    frequency: "common"           # very_high, high, common, moderate, low, rare
    severity: "moderate"           # low, moderate, high, severe
    typical_context: "manufacturing"  # Context where this relationship applies
```

**Context values**: `manufacturing`, `shipping`, `outdoor`, `industrial`, `marine`, `aerospace`, `general`

---

### 2.2 Related Compounds

**Used by**: Contaminants

```yaml
related_compounds:
  - id: "formaldehyde"
    title: "Formaldehyde"
    url: "/compounds/formaldehyde"
    image: "/images/compounds/formaldehyde.jpg"
    source: "thermal_decomposition"  # How compound is generated
    concentration_range_mg_m3: "1-10"  # Typical concentration range
    # NOTE: exposure_limit comes from Compounds.yaml (not duplicated)
```

**Source values**: `thermal_decomposition`, `laser_ablation`, `chemical_breakdown`, `vaporization`, `combustion`

---

### 2.3 Related Contaminants

**Used by**: Materials, Settings, Compounds

```yaml
related_contaminants:
  - id: "aluminum-oxidation"
    title: "Aluminum Oxidation"
    url: "/contaminants/corrosion/oxidation/aluminum-oxidation"
    image: "/images/contaminants/aluminum-oxidation.jpg"
    frequency: "common"            # How often this occurs
    severity: "moderate"           # Impact severity
    typical_context: "outdoor"     # Where this occurs
```

---

### 2.4 Regulatory Compliance

**Used by**: Materials, Contaminants, Compounds, Settings

```yaml
regulatory_compliance:
  - id: "iec-60825"
    title: "IEC 60825"
    url: "https://webstore.iec.ch/publication/3587"
    image: "/images/standards/iec-logo.svg"
    applicability: "laser_operation"  # What this standard applies to
    requirement: "International standard for laser product safety..."
```

**Applicability values**: `laser_operation`, `ppe_requirements`, `chemical_handling`, `exposure_limits`, `transportation`, `waste_management`

---

### 2.5 PPE Requirements

**Used by**: Contaminants, Compounds, Settings

```yaml
ppe_requirements:
  - id: "ppe-respiratory-full-face"
    title: "Full-Face Respirator"
    url: "/ppe/ppe-respiratory-full-face"
    image: "/images/ppe/ppe-respiratory-full-face.jpg"
    reason: "toxic_fumes"         # Why this PPE is required
    required: true                # Mandatory vs recommended
    context: "carcinogenic_compounds_present"  # When it's required
```

**Reason values**: `particulate_generation`, `toxic_fumes`, `chemical_contact`, `laser_exposure`, `thermal_hazard`

**Context values**: `all_operations`, `carcinogenic_compounds_present`, `high_concentration`, `enclosed_spaces`, `poor_ventilation`

---

### 2.6 Related Settings

**Used by**: Materials, Contaminants

```yaml
related_settings:
  - id: "pulsed-fiber-100w"
    title: "Pulsed Fiber 100W"
    url: "/settings/pulsed-fiber/pulsed-fiber-100w"
    image: "/images/settings/pulsed-fiber.jpg"
    frequency: "very_high"        # How commonly used
    applicability: "high"          # How suitable for this material/contaminant
```

---

## 3. Complete Example: Adhesive Residue Contamination

```yaml
domain_linkages:
  # 49 materials affected
  related_materials:
    - id: "aluminum"
      title: "Aluminum"
      url: "/materials/metals/aluminum/aluminum"
      image: "/images/materials/aluminum.jpg"
      frequency: "common"
      severity: "moderate"
      typical_context: "manufacturing"
    
    - id: "steel"
      title: "Steel"
      url: "/materials/metals/steel/steel"
      image: "/images/materials/steel.jpg"
      frequency: "common"
      severity: "moderate"
      typical_context: "shipping"
    
    # ... 47 more materials
  
  # 6 compounds produced during removal
  related_compounds:
    - id: "formaldehyde"
      title: "Formaldehyde"
      url: "/compounds/formaldehyde"
      image: "/images/compounds/formaldehyde.jpg"
      source: "thermal_decomposition"
      concentration_range_mg_m3: "1-10"
    
    - id: "acetaldehyde"
      title: "Acetaldehyde"
      url: "/compounds/acetaldehyde"
      image: "/images/compounds/acetaldehyde.jpg"
      source: "thermal_decomposition"
      concentration_range_mg_m3: "5-25"
    
    # ... 4 more compounds
  
  # 2 regulatory standards
  regulatory_compliance:
    - id: "iec-60825"
      title: "IEC 60825"
      url: "https://webstore.iec.ch/publication/3587"
      image: "/images/standards/iec-logo.svg"
      applicability: "laser_operation"
      requirement: "International standard for laser product safety and classification"
    
    - id: "osha-29-cfr-1926-95"
      title: "OSHA 29 CFR 1926.95"
      url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.95"
      image: "/images/standards/osha-logo.svg"
      applicability: "ppe_requirements"
      requirement: "Requirements for PPE in construction environments"
  
  # 3 PPE items required
  ppe_requirements:
    - id: "ppe-eye-goggles"
      title: "Safety Goggles"
      url: "/ppe/ppe-eye-goggles"
      image: "/images/ppe/ppe-eye-goggles.jpg"
      reason: "particulate_generation"
      required: true
      context: "all_operations"
    
    - id: "ppe-respiratory-full-face"
      title: "Full-Face Respirator"
      url: "/ppe/ppe-respiratory-full-face"
      image: "/images/ppe/ppe-respiratory-full-face.jpg"
      reason: "toxic_fumes"
      required: true
      context: "carcinogenic_compounds_present"
    
    - id: "ppe-skin-nitrile-gloves"
      title: "Nitrile Gloves (Chemical-Resistant)"
      url: "/ppe/ppe-skin-nitrile-gloves"
      image: "/images/ppe/ppe-skin-nitrile-gloves.jpg"
      reason: "chemical_contact"
      required: true
      context: "handling_contaminated_parts"
```

---

## 4. UI/UX Display Requirements

### 4.1 Universal Requirements

**ALL domain pages MUST include**:

1. **Section Container**: `<section class="domain-linkages">`
2. **Domain-Based Grouping**: Separate sections per target domain
3. **Adaptive Layouts**: Based on result count (see decision matrix below)
4. **Category Filtering**: When results exceed thresholds
5. **Subcategory Navigation**: For large category groups (25+ results)

### 4.2 Layout Decision Matrix

| Result Count | Layout | Category Filter | Subcategory Filter | Grid Columns | Example |
|--------------|--------|----------------|-------------------|--------------|---------|
| **1-4** | List/Horizontal | No | No | 1-2 | Regulatory standards |
| **5-12** | Grid | No | No | 2-3 | Settings on contaminant |
| **13-24** | Grid with filters | Yes | No | 3-4 | Contaminants on material |
| **25-50** | Grid with filters | Yes | Yes* | 4 | Materials in setting |
| **51+** | Paginated grid | Yes | Yes* | 4 | All materials |

*Subcategory shown only if selected category has 13+ results

### 4.3 Category Groups by Domain

```typescript
const categoryGroups = {
  materials: {
    primary: ['metals', 'plastics', 'glass', 'wood', 'ceramics', 'other'],
    secondary: {
      metals: ['ferrous', 'non-ferrous', 'alloys'],
      plastics: ['thermoplastic', 'thermoset'],
      glass: ['soda-lime', 'borosilicate', 'specialty'],
      wood: ['hardwood', 'softwood'],
      ceramics: ['oxide', 'non-oxide', 'composite']
    }
  },
  
  contaminants: {
    primary: ['corrosion', 'organic-residue', 'particulate', 'coating', 'biological'],
    secondary: {
      corrosion: ['oxidation', 'pitting', 'general'],
      'organic-residue': ['adhesive', 'grease', 'oil', 'sealant', 'wax'],
      particulate: ['dust', 'debris', 'filings', 'powder'],
      coating: ['paint', 'powder-coat', 'plating', 'anodizing']
    }
  },
  
  compounds: {
    primary: ['carcinogenic', 'toxic', 'irritant', 'inert'],
    secondary: {
      carcinogenic: ['iarc-group-1', 'iarc-group-2a', 'iarc-group-2b'],
      toxic: ['acute', 'chronic', 'systemic'],
      irritant: ['respiratory', 'dermal', 'ocular']
    }
  },
  
  settings: {
    primary: ['pulsed-fiber', 'continuous-wave', 'q-switched', 'ultrafast'],
    secondary: {
      'pulsed-fiber': ['low-power', 'medium-power', 'high-power'],
      'continuous-wave': ['low-power', 'high-power']
    }
  }
}
```

### 4.4 Example Implementations

**Small Result Set (1-4): Simple List**
```vue
<section class="domain-linkages">
  <h2>Regulatory Standards</h2>
  <div class="standards-list">
    <StandardCard
      v-for="standard in entity.regulatory_compliance"
      :key="standard.id"
      v-bind="standard"
    />
  </div>
</section>
```

**Medium Result Set (5-12): Grid**
```vue
<section class="domain-linkages">
  <h2>Related Compounds</h2>
  <div class="entity-grid cols-3">
    <CompoundCard
      v-for="compound in entity.related_compounds"
      :key="compound.id"
      v-bind="compound"
    />
  </div>
</section>
```

**Large Result Set (13-24): Grid with Category Filters**
```vue
<section class="domain-linkages">
  <h2>Related Materials</h2>
  
  <div class="linkage-filters">
    <button @click="filterCategory('all')" :class="{active: filter === 'all'}">
      All (18)
    </button>
    <button @click="filterCategory('metals')" :class="{active: filter === 'metals'}">
      Metals (12)
    </button>
    <button @click="filterCategory('plastics')" :class="{active: filter === 'plastics'}">
      Plastics (6)
    </button>
  </div>
  
  <div class="entity-grid cols-4">
    <MaterialCard
      v-for="material in filteredMaterials"
      :key="material.id"
      v-bind="material"
    />
  </div>
</section>
```

**Very Large Result Set (25+): Grid with Category + Subcategory**
```vue
<section class="domain-linkages">
  <h2>Compatible Materials</h2>
  
  <!-- Primary category filter -->
  <div class="linkage-filters">
    <button @click="filterCategory('all')">All (52)</button>
    <button @click="filterCategory('metals')" :class="{active: filter === 'metals'}">
      Metals (35)
    </button>
    <button @click="filterCategory('plastics')">Plastics (12)</button>
    <button @click="filterCategory('glass')">Glass (5)</button>
  </div>
  
  <!-- Subcategory tabs (shown when category has 13+ results) -->
  <div v-if="filter === 'metals' && metalCount >= 13" class="subcategory-tabs">
    <a href="#ferrous" :class="{active: subcategory === 'ferrous'}">
      Ferrous (12)
    </a>
    <a href="#non-ferrous" :class="{active: subcategory === 'non-ferrous'}">
      Non-Ferrous (15)
    </a>
    <a href="#alloys" :class="{active: subcategory === 'alloys'}">
      Alloys (8)
    </a>
  </div>
  
  <div class="entity-grid cols-4">
    <MaterialCard
      v-for="material in filteredMaterials"
      :key="material.id"
      v-bind="material"
    />
  </div>
</section>
```

---

## 4.5 Component Reuse Strategy ✅ **UPDATED DEC 15, 2025**

### Reuse Existing Category/Subcategory Grid Infrastructure

**Implementation Approach**: Domain linkages will **REUSE existing grid components** already built for category/subcategory pages, rather than creating duplicate components.

**Existing Components to Leverage**:
- `CardGridSSR` (`app/components/CardGrid/CardGridSSR.tsx`) - 345-line server-side grid with adaptive layouts
- `CategoryGrid` (`app/components/Dataset/CategoryGrid.tsx`) - Category card display with icons/colors
- `Card` (`app/components/Card/Card.tsx`) - Individual item cards with badges/metadata/hover states
- Grid utilities (`app/utils/gridConfig.ts`) - Layout classes and configuration

### Minimal New Code Required

**DomainLinkageSection** (NEW - ~50 lines):
```typescript
// Lightweight wrapper that transforms domain_linkages to CardGridSSR format
interface DomainLinkageSectionProps {
  title: string;
  items: DomainLinkage[];  // From frontmatter domain_linkages
  domain: 'materials' | 'contaminants' | 'compounds' | 'settings';
}

export function DomainLinkageSection({ title, items, domain }: DomainLinkageSectionProps) {
  // Transform domain_linkages to GridItemSSR format
  const gridItems = items.map(linkage => ({
    slug: linkage.id,
    title: linkage.title,
    url: linkage.url,
    image: linkage.image,
    category: linkage.category || 'general',
    subcategory: linkage.subcategory,
    badges: buildBadgesFromDomainFields(linkage, domain),
    metadata: { domain, ...linkage }
  }));

  // CardGridSSR already handles all adaptive layout logic
  return (
    <section className="domain-linkages">
      <h2>{title}</h2>
      <CardGridSSR
        items={gridItems}
        mode={items.length > 24 ? 'category-grouped' : 'simple'}
        columns={items.length > 50 ? 5 : items.length > 12 ? 4 : 3}
        filterBy={items.length > 12 ? 'category' : 'all'}
        showBadgeSymbols={true}
      />
    </section>
  );
}
```

**Badge Mapping** (NEW - ~50 lines):
```typescript
function buildBadgesFromDomainFields(linkage: DomainLinkage, domain: string): BadgeData[] {
  switch(domain) {
    case 'materials':
      return [
        { type: 'frequency', value: linkage.frequency },
        { type: 'severity', value: linkage.severity }
      ];
    case 'compounds':
      return [
        { type: 'hazard', value: linkage.hazard_level },
        { type: 'phase', value: linkage.phase }
      ];
    case 'contaminants':
      return [
        { type: 'severity', value: linkage.severity },
        { type: 'category', value: linkage.category }
      ];
    case 'settings':
      return [
        { type: 'applicability', value: linkage.applicability },
        { type: 'laser_type', value: linkage.laser_type }
      ];
    default:
      return [];
  }
}
```

### CardGridSSR Already Implements All Required Layouts ✅

**No new layout code needed** - CardGridSSR (app/components/CardGrid/CardGridSSR.tsx) already has:

#### 1-4 Items: List Layout
- `mode='simple'` with automatic vertical stacking
- Full-width cards with detailed info

#### 5-12 Items: Simple Grid
- `columns={3}` (responsive: 2 cols mobile, 3 desktop, 4 large screens)
- Standard card size with hover effects

#### 13-24 Items: Grid with Filtering
- Automatic category/subcategory filters when `filterBy='category'`
- Grid adjusts based on active filters

#### 25-50 Items: Category-Grouped Grid
- `mode='category-grouped'`
- Automatic grouping by category field
- Section headers for each category

#### 51+ Items: Category-Grouped with Dense Layout
- `mode='category-grouped'` + `columns={5}`
- Subcategory filtering enabled
- Compact card variant for higher density

### Benefits of Component Reuse

✅ **Code Reduction**: ~800-1000 lines saved (no duplicate grid system)  
✅ **Visual Consistency**: All grids use identical styling/behavior  
✅ **Maintenance**: Single codebase for all grid displays  
✅ **Performance**: CardGridSSR already optimized for SSR  
✅ **Accessibility**: Existing components already ARIA-compliant  
✅ **Battle-Tested**: CardGridSSR used across 153 materials, 98 contaminants, 169 settings  

### Implementation Effort

**Total new code**: ~200 lines (vs ~1000 lines for duplicate grid system)

- DomainLinkageSection wrapper: ~50 lines
- Data transformation logic: ~100 lines
- Badge mapping: ~50 lines

**Time savings**: 80% reduction in UI implementation effort

---

## 5. Migration Impact Summary

### What Changes

**Legacy Format** → **New Format**:
```yaml
# BEFORE (scattered and inconsistent)
valid_materials: ["Aluminum", "Steel", ...]      # Array of names
eeat.citations: ["IEC 60825 - ...", ...]         # Free text
fumes_generated:
  - compound: "Formaldehyde"                      # Name
    exposure_limit_mg_m3: 0.3                     # DUPLICATED
    hazard_class: carcinogenic                    # DUPLICATED
ppe_requirements:
  eye_protection: "goggles"                       # Simple key-value
  respiratory: "full_face"

# AFTER (normalized with domain_linkages)
domain_linkages:
  related_materials:
    - id: "aluminum"
      title: "Aluminum"
      url: "/materials/metals/aluminum/aluminum"
      image: "/images/materials/aluminum.jpg"
      frequency: "common"
      severity: "moderate"
      
  related_compounds:
    - id: "formaldehyde"
      title: "Formaldehyde"
      url: "/compounds/formaldehyde"
      image: "/images/compounds/formaldehyde.jpg"
      source: "thermal_decomposition"
      concentration_range_mg_m3: "1-10"
      # exposure_limit comes from Compounds.yaml via id
      
  regulatory_compliance:
    - id: "iec-60825"
      title: "IEC 60825"
      url: "https://webstore.iec.ch/publication/3587"
      image: "/images/standards/iec-logo.svg"
      applicability: "laser_operation"
      
  ppe_requirements:
    - id: "ppe-respiratory-full-face"
      title: "Full-Face Respirator"
      url: "/ppe/ppe-respiratory-full-face"
      image: "/images/ppe/ppe-respiratory-full-face.jpg"
      reason: "toxic_fumes"
      required: true
      context: "carcinogenic_compounds_present"
```

### Benefits

✅ **Card-ready format** - All linkages have id, title, url, image  
✅ **No duplication** - Exposure limits only in Compounds.yaml  
✅ **Standardized PPE** - References shared PPE.yaml  
✅ **Standardized regulatory** - References shared RegulatoryStandards.yaml  
✅ **UI-friendly** - Structured for adaptive layouts and filtering  
✅ **Bidirectional** - Materials know contaminants AND vice versa  

---

## 6. Migration Steps

1. **Phase 1**: Create shared schemas (RegulatoryStandards.yaml, PPE.yaml) ✅ DONE
2. **Phase 2**: Run migration script to add domain_linkages to all entities
3. **Phase 3**: Update UI components to use new structure
4. **Phase 4**: Verify all linkages are bidirectional
5. **Phase 5**: Remove legacy fields (valid_materials, eeat.citations, etc.)

---

## 7. Review Checklist

Before approving migration:

- [ ] All linkage entries have required fields (id, title, url, image)
- [ ] Domain-specific fields are appropriate (frequency, severity, source, etc.)
- [ ] UI layout requirements are clear and implementable
- [ ] Category groupings make sense for each domain
- [ ] Subcategory thresholds (13+ for filters, 25+ for subcategories) are reasonable
- [ ] Examples cover all common scenarios
- [ ] Migration preserves all existing data
- [ ] No data duplication (exposure limits, hazard classes)

---

**Status**: ✅ Ready for Review  
**Next Step**: Approve structure, then run migration on Contaminants.yaml  
**Estimated Time**: 2-3 hours to migrate all 98 contaminants + update UI components
