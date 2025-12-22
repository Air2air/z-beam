# Data Structure & Component Mapping

**Purpose**: Normalize the relationship between frontmatter YAML data fields and the React components that consume them.

**Last Updated**: December 22, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Component-Data Matrix](#component-data-matrix)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Frontmatter Field Reference](#frontmatter-field-reference)
5. [Component Field Requirements](#component-field-requirements)
6. [Type Definitions](#type-definitions)
7. [Usage Examples](#usage-examples)

---

## Overview

This document provides a **single source of truth** for understanding:
- Which frontmatter fields feed which components
- What data each component requires vs. optionally accepts
- The complete data flow from YAML → Layout → Component

### Key Principles

1. **Type Safety**: All component props defined in `types/centralized.ts`
2. **Conditional Rendering**: Components only render when required data exists
3. **Graceful Degradation**: Missing optional fields don't break layouts
4. **Data Enrichment**: Relationships enriched with full article data via `getArticle()` utils

---

## Component-Data Matrix

### Materials Pages

**Note**: All components render unconditionally. Components handle missing data gracefully with "No data available" messages.

| Component | Data Fields Used | Fallback Behavior | Data Source |
|-----------|------------------|-------------------|-------------|
| **MaterialsLayout** | `title`, `name`, `images.hero.url`, `category`, `subcategory` | - | materials YAML |
| **MaterialCharacteristics** | `relationships.materialProperties` OR `properties.material_characteristics` | Shows "No properties available" | Dual-source: relationships → direct properties |
| **LaserMaterialInteraction** | `relationships.materialProperties` OR `properties.laser_material_interaction` | Shows "No properties available" | Dual-source: relationships → direct properties |
| **RegulatoryStandards** | `relationships.regulatory_standards` OR `relationships.regulatory` | Empty standards list | Dual-source lookup |
| **MaterialFAQ** | `faq[]` | Empty FAQ list | materials YAML → faq array |
| **RelatedMaterials** | `relationships.related_materials` | Shows 6 items from same category | materials YAML → relationships |
| **CardGrid** (Contaminants) | `relationships.contaminated_by[]` | Empty card grid | materials YAML → enriched with `getContaminantArticle()` |
| **MaterialDatasetDownloader** | `slug`, `category`, `subcategory`, `machineSettings`, `materialProperties` | Dataset with available fields only | page props + metadata |
| **ScheduleCards** | - | Always renders | N/A |

### Compounds Pages

| Component | Required Fields | Optional Fields | Data Source |
|-----------|----------------|-----------------|-------------|
| **CompoundsLayout** | `title`, `name`, `category`, `subcategory` | `relationships.*` | compounds YAML |
| **SafetyDataPanel** | One of: `ppe_requirements`, `storage_requirements`, `regulatory_classification`, `workplace_exposure`, `reactivity`, `environmental_impact`, `detection_monitoring` | - | compounds YAML → safety data fields |
| **InfoCard** (Chemical Identity) | - | `cas_number`, `chemical_formula`, `molecular_weight` | compounds YAML |
| **InfoCard** (Physical Properties) | - | `physical_properties.*` | compounds YAML → physical_properties object |
| **InfoCard** (Exposure Limits) | - | `exposure_limits.osha_pel_*`, `exposure_limits.niosh_rel_*`, `exposure_limits.acgih_tlv_*` | compounds YAML → exposure_limits object |
| **InfoCard** (Health Effects) | - | `health_effects_keywords[]` | compounds YAML → health_effects_keywords array |
| **InfoCard** (Synonyms) | - | `synonyms_identifiers[]` or `synonyms_identifiers.*.name` | compounds YAML → synonyms_identifiers |
| **CardGrid** (Source Contaminants) | `relationships.produced_by_contaminants[]` or `relationships.source_contaminants[]` | - | compounds YAML → enriched with `getContaminantArticle()` |
| **ScheduleCards** | `slug` | - | page props |

### Contaminants Pages

| Component | Required Fields | Optional Fields | Data Source |
|-----------|----------------|-----------------|-------------|
| **ContaminantsLayout** | `title`, `name`, `images.hero.url`, `category`, `subcategory` | `relationships.*` | contaminants YAML |
| **SafetyOverview** | `metadata` | - | contaminants YAML (entire metadata) |
| **SafetyDataPanel** | `relationships.laser_properties.safety_data` | - | contaminants YAML → relationships |
| **RegulatoryStandards** | `citations[]` (converted) | - | contaminants YAML → citations (via `convertCitationsToStandards()`) |
| **CompoundSafetyGrid** | `relationships.produces_compounds[]` | - | contaminants YAML → enriched with `getCompoundArticle()` |
| **CardGrid** (Materials) | `relationships.found_on_materials[]` | - | contaminants YAML → enriched with `getArticle()` |
| **GridSection** | `relationships.related_contaminants[]` | - | contaminants YAML → relationships |
| **ContaminantDatasetDownloader** | `slug`, `category`, `subcategory` | - | page props |
| **ScheduleCards** | `slug` | - | page props |

### Settings Pages

**Critical**: MachineSettings component only renders when `metadata.content_type === 'settings'`. This prevents machine settings from appearing on materials pages.

| Component | Data Fields Used | Fallback Behavior | Data Source |
|-----------|------------------|-------------------|-------------|
| **SettingsLayout** | `title`, `name`, `category`, `subcategory` | - | settings YAML |
| **MachineSettings** | `machineSettings` (with `content_type === 'settings'` guard) | Shows "No settings available" | settings YAML (settings pages only) |
| **ParameterRelationships** | `components.parameter_relationships` OR `machineSettings` | Empty parameters | settings YAML |
| **MaterialSafetyHeatmap** | `powerRange`, `pulseRange`, `materialProperties` | Uses default ranges | settings YAML + material properties |
| **ProcessEffectivenessHeatmap** | `powerRange`, `pulseRange`, thermal properties | Uses default ranges | settings YAML + material properties |
| **EnergyCouplingHeatmap** | `powerRange`, `pulseRange`, reflectivity, absorptivity | Uses default ranges | settings YAML + material properties |
| **ThermalStressHeatmap** | `powerRange`, `pulseRange`, thermal expansion | Uses default ranges | settings YAML + material properties |
| **HeatBuildup** | `power`, `repRate`, `scanSpeed`, `passCount`, thermal properties | Uses defaults | settings YAML + material properties |
| **DiagnosticCenter** | `machineSettings.material_challenges`, `common_issues` | Default challenges | settings YAML |
| **Citations** | `research_library` | Empty citations | settings YAML |
| **FAQSettings** | `faq[]` | Empty FAQ | settings YAML |
| **MaterialDatasetDownloader** | `slug`, `category`, `machineSettings` | Dataset with available fields | settings YAML |
| **ScheduleCards** | - | Always renders | N/A |

---

## Data Flow Architecture

```
┌─────────────────────┐
│  Frontmatter YAML   │  ← Source of truth
└──────────┬──────────┘
           │
           │ Read by getArticle() utils
           │
           ▼
┌─────────────────────┐
│  Page Component     │  ← materials/[...slug]/page.tsx
│  (Server Component) │
└──────────┬──────────┘
           │
           │ Pass metadata prop
           │
           ▼
┌─────────────────────┐
│  Layout Component   │  ← MaterialsLayout / CompoundsLayout / etc.
│  (Async Function)   │
└──────────┬──────────┘
           │
           │ Extract & enrich data
           │ - Access metadata fields
           │ - Enrich relationships via getArticle() utils
           │ - Configure SectionConfig[] array
           │
           ▼
┌─────────────────────┐
│ BaseContentLayout   │  ← Unified layout wrapper
└──────────┬──────────┘
           │
           │ Render sections
           │
           ▼
┌─────────────────────┐
│ UI Components       │  ← InfoCard, Badge, CardGrid, etc.
│ (React Components)  │
└─────────────────────┘
```

### Data Enrichment Pattern

Layouts perform **data enrichment** to transform minimal relationship IDs into full article data:

```typescript
// Example: Enriching compound relationships in ContaminantsLayout
const producesCompounds = relationships?.produces_compounds || [];
const enrichedCompounds = await Promise.all(
  producesCompounds.map(async (ref: { id: string; phase?: string; hazard_level?: string }) => {
    const article = await getCompoundArticle(ref.id);
    if (!article) return null;
    
    const metadata = article.metadata;
    return {
      id: ref.id,
      title: metadata.name || metadata.title,
      category: metadata.category,
      description: metadata.description,
      url: metadata.full_path || `/compounds/${ref.id}`,
      phase: ref.phase,              // ← From relationship
      hazard_level: ref.hazard_level, // ← From relationship
      image: metadata.images?.hero?.url, // ← From article
    };
  })
).then(items => items.filter(Boolean));
```

### Dual-Source Data Pattern (December 2025)

MaterialsLayout implements a **dual-source fallback pattern** for material properties:

```typescript
// Priority: relationships (enriched) → direct properties (frontmatter)
const materialProperties = relationships?.materialProperties || (metadata as any)?.properties;
const regulatoryStandards = relationships?.regulatory_standards || relationships?.regulatory;
```

**Why**: Materials data can exist in two locations:
1. **`relationships.materialProperties`** - Enriched relationship data loaded via `getEnrichmentMetadata()`
2. **`metadata.properties`** - Direct frontmatter data (`properties.material_characteristics`, `properties.laser_material_interaction`)

Components check both sources, ensuring data displays regardless of structure.

### Content Type Guards (December 2025)

Layout.tsx includes **content-type-specific rendering** to prevent component misplacement:

```typescript
// MachineSettings ONLY on settings pages
{metadata?.machineSettings && !metadata?.materialProperties && metadata?.content_type === 'settings' && (
  <SectionContainer title="Machine Settings">
    <PropertyBars metadata={metadata} dataSource="machineSettings" />
  </SectionContainer>
)}
```

**Critical guard**: `metadata?.content_type === 'settings'` prevents MachineSettings from rendering on materials pages.

---

## Frontmatter Field Reference

### Materials YAML Structure

```yaml
# Core Identification
id: string (required)
name: string (required)
title: string (required)
category: string (required)
datePublished: ISO 8601 timestamp
dateModified: ISO 8601 timestamp
content_type: 'materials'
schema_version: '5.0.0'
full_path: string (generated)
breadcrumb: array (generated)

# Content Fields
description: string (required) - Main article content
  # → Component: Article body (rendered directly)
micro: string (optional) - Short technical description
  # → Component: Micro component
faq: array (optional)
  # → Component: MaterialFAQ
  - question: string
    answer: string

# Visual Assets
images:
  # → Component: Hero image, thumbnails, social cards
  hero:
    url: string (required)
    alt: string (required)
  micro:
    url: string (optional)
    alt: string (optional)

# Authorship
author:
  # → Component: Author byline, E-E-A-T signals
  id: number | string (required)
  name: string (required)
  country: string (required)
  country_display: string (optional)
  title: string (required) - e.g., "Ph.D."
  sex: 'm' | 'f' (required)
  jobTitle: string (required)

# Industry Data (NEW - Dec 22, 2025)
applications: string[] (optional)
  # → Component: Badge (in MaterialsLayout)
  # Example: ["Aerospace", "Automotive", "Construction"]

# Relationships
relationships:
  materialProperties: object (optional)
    # → Component: MaterialCharacteristics
  regulatory_standards: array (optional)
    # → Component: RegulatoryStandards
    - type: 'regulatory_standards'
      id: string
  contaminated_by: array (optional)
    # → Component: CardGrid (enriched via getContaminantArticle)
    - id: string
      frequency: 'very_common' | 'common' | 'occasional' | 'rare'
      severity: 'high' | 'moderate' | 'low'
      typical_context: string
  related_materials: array (optional)
    # → Component: RelatedMaterials
    - id: string
```

### Compounds YAML Structure

```yaml
# Core Identification
id: string (required)
name: string (required)
display_name: string (optional)
category: string (required)
hazard_class: string (required)
datePublished: ISO 8601 timestamp
dateModified: ISO 8601 timestamp
content_type: 'compounds'
schema_version: '5.0.0'
full_path: string (generated)
breadcrumb: array (generated)

# Chemical Identity
chemical_formula: string (optional)
  # → Component: InfoCard (Chemical Identity)
cas_number: string (optional)
  # → Component: InfoCard (Chemical Identity)
molecular_weight: number (optional) - in g/mol
  # → Component: InfoCard (Chemical Identity)

# Content Fields
description: string (required)
  # → Component: Article body (rendered directly)
exposure_guidelines: string (optional)
  # → Component: Article section
detection_methods: string (optional)
  # → Component: Article section
first_aid: string (optional)
  # → Component: Article section

# Safety Data
exposure_limits: object (optional)
  # → Component: InfoCard (Exposure Limits Comparison)
  osha_pel_ppm: number
  osha_pel_mg_m3: number
  niosh_rel_ppm: number
  niosh_rel_mg_m3: number
  acgih_tlv_ppm: number
  acgih_tlv_mg_m3: number

health_effects_keywords: string[] (optional)
  # → Component: InfoCard (Health Effects)
  # Example: ["leukemia", "bone_marrow_damage", "blood_disorders"]

monitoring_required: boolean (optional)
  # → Component: Badge or status indicator
typical_concentration_range: string (optional)
  # → Component: InfoCard (Concentration Range)

sources_in_laser_cleaning: string[] (optional)
  # → Component: List or Badge group

# Physical Properties (NEW - Dec 22, 2025)
physical_properties: object (optional)
  # → Component: InfoCard (Physical Properties)
  boiling_point_c: number
  melting_point_c: number
  flash_point_c: number
  vapor_pressure_mmhg: number
  specific_gravity: number
  # ... additional properties

# Synonyms/Identifiers (NEW - Dec 22, 2025)
synonyms_identifiers: array | object (optional)
  # → Component: InfoCard (Synonyms)
  # Array format: ["name1", "name2"]
  # Object format: [{ name: "name1", type: "trade_name" }]

# PPE Requirements (NEW - Dec 22, 2025)
ppe_requirements: object (optional)
  # → Component: SafetyDataPanel
storage_requirements: object (optional)
  # → Component: SafetyDataPanel
regulatory_classification: object (optional)
  # → Component: SafetyDataPanel
workplace_exposure: object (optional)
  # → Component: SafetyDataPanel
reactivity: object (optional)
  # → Component: SafetyDataPanel
environmental_impact: object (optional)
  # → Component: SafetyDataPanel
detection_monitoring: object (optional)
  # → Component: SafetyDataPanel

# Relationships
relationships:
  chemical_properties: array (optional)
    # → Component: Related content links
  health_effects: array (optional)
    # → Component: Related content links
  environmental_impact: array (optional)
    # → Component: Related content links
  detection_monitoring: array (optional)
    # → Component: Related content links
  ppe_requirements: array (optional)
    # → Component: Related content links
  emergency_response: array (optional)
    # → Component: Related content links
  produced_by_contaminants: array (optional) - alias: source_contaminants
    # → Component: CardGrid (enriched via getContaminantArticle)
    - id: string
      url: string
      frequency: string
      severity: string
      typical_context: string
```

### Contaminants YAML Structure

```yaml
# Core Identification
id: string (required)
name: string (required)
category: string (required)
datePublished: ISO 8601 timestamp
dateModified: ISO 8601 timestamp
content_type: 'contaminants'
schema_version: '5.0.0'
full_path: string (generated)
breadcrumb: array (generated)

# Content Fields
description: string (required)
  # → Component: Article body (rendered directly)
micro: object (optional)
  # → Component: Micro before/after display
  before: string
  after: string

# Relationships
relationships:
  regulatory_standards: array (optional)
    # → Component: RegulatoryStandards
    - type: 'regulatory_standards'
      id: string
  laser_properties: object (optional)
    # → Component: SafetyDataPanel
    safety_data: object
  produces_compounds: array (optional)
    # → Component: CompoundSafetyGrid (enriched via getCompoundArticle)
    - id: string
      phase: 'gas' | 'solid' | 'liquid'
      hazard_level: 'low' | 'moderate' | 'high'
      url: string
  found_on_materials: array (optional)
    # → Component: CardGrid (enriched via getArticle)
    - id: string
      frequency: 'very_common' | 'common' | 'occasional' | 'rare'
      url: string
  related_contaminants: array (optional)
    # → Component: GridSection
  visual_characteristics: object (optional)
    # → Component: Visual characteristics display panel
    appearance_on_categories: object
      [category_name]: object
        description: string
        color_variations: string
        common_patterns: string
        # ... additional characteristics

# Citations (converted to regulatory_standards)
citations: array (optional) - LEGACY, use relationships.regulatory_standards
  # → Component: Converted to RegulatoryStandards via convertCitationsToStandards()
```

---

## Component Field Requirements

### InfoCard Component

**Purpose**: Display structured data in card format with icon, title, and data points

**Required Props**:
```typescript
{
  icon: LucideIcon,              // From lucide-react
  title: string,                 // Card heading
  data: Array<{                  // Data points to display
    label: string,
    value: string | number
  }>
}
```

**Optional Props**:
```typescript
{
  className?: string,            // Tailwind classes
  variant?: 'default' | 'outlined' | 'filled'
}
```

**Usage Pattern**:
```tsx
<InfoCard
  icon={Beaker}
  title="Chemical Identity"
  data={[
    { label: 'CAS Number', value: '71-43-2' },
    { label: 'Formula', value: 'C₆H₆' },
    { label: 'Molecular Weight', value: '78.11 g/mol' },
  ]}
/>
```

**Data Sources**:
- Compounds: `cas_number`, `chemical_formula`, `molecular_weight`, `physical_properties.*`, `exposure_limits.*`, `health_effects_keywords[]`, `synonyms_identifiers`

---

### Badge Component

**Purpose**: Display tags/labels with optional icons

**Required Props**:
```typescript
{
  children: ReactNode,           // Badge text content
}
```

**Optional Props**:
```typescript
{
  variant?: 'default' | 'secondary' | 'outline' | 'destructive',
  size?: 'sm' | 'md' | 'lg',
  className?: string,
  icon?: LucideIcon,             // Optional leading icon
}
```

**Usage Pattern**:
```tsx
<Badge variant="secondary" size="lg" className="flex items-center gap-2">
  <Briefcase className="h-4 w-4" />
  Aerospace
</Badge>
```

**Data Sources**:
- Materials: `applications[]` array items

---

### CardGrid Component

**Purpose**: Display grid of related items with images and metadata

**Required Props**:
```typescript
{
  items: Array<{
    id: string,
    title: string,
    url: string,
    image?: string,
    // ... additional enriched fields
  }>,
}
```

**Optional Props**:
```typescript
{
  columns?: 2 | 3 | 4,
  sortBy?: 'frequency' | 'severity' | 'title',
  variant?: 'default' | 'compact',
  className?: string,
}
```

**Usage Pattern**:
```tsx
<CardGrid
  items={enrichedContaminants}
  columns={3}
  sortBy="frequency"
  title="Common Contaminants"
  description="Substances frequently found on this material"
/>
```

**Data Sources**:
- Materials: `relationships.contaminated_by[]` (enriched via `getContaminantArticle()`)
- Compounds: `relationships.produced_by_contaminants[]` (enriched via `getContaminantArticle()`)
- Contaminants: `relationships.found_on_materials[]` (enriched via `getArticle()`), `relationships.produces_compounds[]` (enriched via `getCompoundArticle()`)

---

### SectionContainer Component

**Purpose**: Wraps sections with consistent spacing and optional title

**Required Props**:
```typescript
{
  children: ReactNode,
}
```

**Optional Props**:
```typescript
{
  title?: string,                // Section heading
  className?: string,
  // Note: Does NOT support 'description' prop
}
```

**Usage Pattern**:
```tsx
<SectionContainer title="Chemical Properties">
  {/* Child components */}
</SectionContainer>
```

---

### SafetyDataPanel Component

**Purpose**: Display comprehensive safety information for compounds/contaminants

**Required Props**:
```typescript
{
  // At least ONE of these fields must be present:
  ppe_requirements?: object,
  storage_requirements?: object,
  regulatory_classification?: object,
  workplace_exposure?: object,
  reactivity?: object,
  environmental_impact?: object,
  detection_monitoring?: object,
}
```

**Usage Pattern**:
```tsx
<SafetyDataPanel
  ppe_requirements={metadata.ppe_requirements}
  storage_requirements={metadata.storage_requirements}
  regulatory_classification={metadata.regulatory_classification}
  workplace_exposure={metadata.workplace_exposure}
  reactivity={metadata.reactivity}
  environmental_impact={metadata.environmental_impact}
  detection_monitoring={metadata.detection_monitoring}
/>
```

**Data Sources**:
- Compounds: `ppe_requirements`, `storage_requirements`, `regulatory_classification`, `workplace_exposure`, `reactivity`, `environmental_impact`, `detection_monitoring`
- Contaminants: `relationships.laser_properties.safety_data`

---

## Type Definitions

All types are defined in `/types/centralized.ts`. Key interfaces:

```typescript
// Article metadata structure
export interface ArticleMetadata {
  id: string;
  name: string;
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  content_type: ContentType;
  full_path: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumb?: Breadcrumb[];
  images?: {
    hero?: ImageMetadata;
    micro?: ImageMetadata;
  };
  author?: Author;
  relationships?: Record<string, any>;
  // ... additional fields
}

// Layout component props
export interface LayoutProps {
  metadata: ArticleMetadata;
  children: ReactNode;
}

export interface MaterialsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export interface CompoundsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export interface ContaminantsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

// Section configuration for BaseContentLayout
export interface SectionConfig {
  component: () => ReactNode | Promise<ReactNode>;
}
```

**Import Pattern**:
```typescript
import type { 
  ArticleMetadata, 
  LayoutProps, 
  MaterialsLayoutProps,
  SectionConfig 
} from '@/types';
```

---

## Usage Examples

### Example 1: Adding Applications to Materials

**Frontmatter** (`aluminum-laser-cleaning.yaml`):
```yaml
applications:
  - Aerospace
  - Automotive
  - Construction
  - Electronics Manufacturing
  - Food and Beverage Processing
  - Marine
  - Packaging
```

**Layout** (`MaterialsLayout.tsx`):
```typescript
const applications = (metadata as any)?.applications;

const sections: SectionConfig[] = [
  {
    component: () => (
      <SectionContainer title="Industry Applications">
        <div className="flex flex-wrap gap-2">
          {applications && applications.map((app: string, idx: number) => (
            <Badge 
              key={idx}
              variant="secondary"
              size="lg"
              className="flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              {app}
            </Badge>
          ))}
        </div>
      </SectionContainer>
    ),
    condition: () => applications && applications.length > 0,
  },
  // ... other sections
];
```

---

### Example 2: Adding Chemical Properties to Compounds

**Frontmatter** (`benzene-compound.yaml`):
```yaml
cas_number: '71-43-2'
chemical_formula: 'C₆H₆'
molecular_weight: 78.11

physical_properties:
  boiling_point_c: 80.1
  melting_point_c: 5.5
  flash_point_c: -11
  vapor_pressure_mmhg: 95.2
  specific_gravity: 0.879

exposure_limits:
  osha_pel_ppm: 1
  osha_pel_mg_m3: 3.2
  niosh_rel_ppm: 0.1
  niosh_rel_mg_m3: 0.32
  acgih_tlv_ppm: 0.5
  acgih_tlv_mg_m3: 1.6

health_effects_keywords:
  - leukemia
  - bone_marrow_damage
  - blood_disorders
  - dizziness
  - drowsiness
```

**Layout** (`CompoundsLayout.tsx`):
```typescript
// Extract data from metadata
const physicalProperties = (metadata as any)?.physical_properties;
const exposureLimits = (metadata as any)?.exposure_limits;
const healthEffects = (metadata as any)?.health_effects_keywords;
const casNumber = (metadata as any)?.cas_number;
const molecularWeight = (metadata as any)?.molecular_weight;
const chemicalFormula = (metadata as any)?.chemical_formula;

const sections: SectionConfig[] = [
  {
    component: () => (
      <SectionContainer title="Chemical Properties">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Chemical Identity Card */}
          {(casNumber || molecularWeight || chemicalFormula) && (
            <InfoCard
              icon={Beaker}
              title="Chemical Identity"
              data={[
                casNumber && { label: 'CAS Number', value: casNumber },
                chemicalFormula && { label: 'Formula', value: chemicalFormula },
                molecularWeight && { label: 'Molecular Weight', value: `${molecularWeight} g/mol` },
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}
          
          {/* Physical Properties Card */}
          {physicalProperties && (
            <InfoCard
              icon={Thermometer}
              title="Physical Properties"
              data={[
                physicalProperties.boiling_point_c && {
                  label: 'Boiling Point',
                  value: `${physicalProperties.boiling_point_c}°C`
                },
                physicalProperties.melting_point_c && {
                  label: 'Melting Point',
                  value: `${physicalProperties.melting_point_c}°C`
                },
                physicalProperties.flash_point_c && {
                  label: 'Flash Point',
                  value: `${physicalProperties.flash_point_c}°C`
                },
                physicalProperties.vapor_pressure_mmhg && {
                  label: 'Vapor Pressure',
                  value: `${physicalProperties.vapor_pressure_mmhg} mmHg`
                },
                physicalProperties.specific_gravity && {
                  label: 'Specific Gravity',
                  value: physicalProperties.specific_gravity
                },
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}
          
          {/* Exposure Limits Card */}
          {exposureLimits && (
            <InfoCard
              icon={Activity}
              title="Exposure Limits Comparison"
              data={[
                exposureLimits.osha_pel_ppm && {
                  label: 'OSHA PEL',
                  value: `${exposureLimits.osha_pel_ppm} ppm (${exposureLimits.osha_pel_mg_m3} mg/m³)`
                },
                exposureLimits.niosh_rel_ppm && {
                  label: 'NIOSH REL',
                  value: `${exposureLimits.niosh_rel_ppm} ppm (${exposureLimits.niosh_rel_mg_m3} mg/m³)`
                },
                exposureLimits.acgih_tlv_ppm && {
                  label: 'ACGIH TLV',
                  value: `${exposureLimits.acgih_tlv_ppm} ppm (${exposureLimits.acgih_tlv_mg_m3} mg/m³)`
                },
              ].filter(Boolean) as Array<{ label: string; value: string | number }>}
            />
          )}
          
          {/* Health Effects Card */}
          {healthEffects && healthEffects.length > 0 && (
            <InfoCard
              icon={FileText}
              title="Health Effects"
              data={healthEffects.slice(0, 5).map((effect: string) => ({
                label: effect.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                value: '✓'
              }))}
            />
          )}
        </div>
      </SectionContainer>
    ),
  },
  // ... other sections
];
```

---

### Example 3: Enriching Relationship Data

**Frontmatter** (`industrial-oil-contamination.yaml`):
```yaml
relationships:
  produces_compounds:
    - id: carbon-dioxide-compound
      phase: gas
      hazard_level: low
      url: /compounds/asphyxiant/simple-asphyxiant/carbon-dioxide-compound
    - id: carbon-monoxide-compound
      phase: gas
      hazard_level: moderate
      url: /compounds/toxic-gas/asphyxiant/carbon-monoxide-compound
```

**Layout** (`ContaminantsLayout.tsx`):
```typescript
// Extract minimal relationship data
const producesCompounds = relationships?.produces_compounds || [];

// Enrich with full article data
const enrichedCompounds = await Promise.all(
  producesCompounds.map(async (ref: { 
    id: string; 
    phase?: string; 
    hazard_level?: string;
    url?: string; 
  }) => {
    // Fetch full compound article
    const article = await getCompoundArticle(ref.id);
    if (!article) return null;
    
    const metadata = article.metadata;
    
    // Combine relationship metadata + article metadata
    return {
      id: ref.id,
      title: metadata.name || metadata.title,           // From article
      category: metadata.category,                      // From article
      description: metadata.description,                // From article
      url: metadata.full_path || `/compounds/${ref.id}`, // From article
      phase: ref.phase,                                 // From relationship
      hazard_level: ref.hazard_level,                   // From relationship
      image: metadata.images?.hero?.url,                // From article
    };
  })
).then(items => items.filter(Boolean));

// Use enriched data in CardGrid
const sections: SectionConfig[] = [
  {
    component: () => (
      <CompoundSafetyGrid
        compounds={enrichedCompounds}
        title="Hazardous Compounds Produced"
      />
    ),
  },
];
```

---

## Summary

### ✅ Normalized Patterns

1. **Type Safety**: All props defined in `types/centralized.ts`
2. **Conditional Rendering**: Components check for required data before rendering
3. **Data Enrichment**: Relationships enriched via utility functions
4. **Graceful Degradation**: Missing optional fields don't break pages
5. **Consistent Structure**: All layouts follow `SectionConfig[]` pattern

### 📝 Adding New Data Fields

When adding a new data field:

1. **Update frontmatter YAML** with new field
2. **Update this document** with field description and usage
3. **Extract data in layout** component
4. **Add SectionConfig** with conditional rendering
5. **Use existing components** (InfoCard, Badge, CardGrid) where possible
6. **Update TypeScript types** in `types/centralized.ts` if needed

### 🚫 Anti-Patterns to Avoid

- ❌ Creating duplicate type definitions (always use `types/centralized.ts`)
- ❌ Hardcoding data in components (always pull from metadata)
- ❌ Rendering components without data checks (always check if data exists)
- ❌ Creating new components when existing ones suffice (reuse InfoCard, Badge, etc.)
- ❌ Ignoring optional vs. required field distinctions

---

**Last Updated**: December 22, 2025  
**Maintained By**: Z-Beam Development Team  
**Related Docs**: 
- [Type Definitions](/types/centralized.ts)
- [Frontmatter Completeness Analysis](/docs/FRONTMATTER_COMPLETENESS_ANALYSIS_DEC22_2025.md)
- [Component Architecture](/docs/02-features/component-architecture.md)
