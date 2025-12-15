# Contaminant Page Components Proposal

**Date:** December 15, 2025  
**Status:** Proposal  
**Purpose:** Define reusable components for contaminant pages based on existing materials/settings architecture

---

## Executive Summary

Contaminant pages have rich data structures similar to materials pages. This document proposes extending existing components to handle contamination-specific data while maintaining consistency with the materials/settings page architecture.

---

## Current Contaminant Data Structure

### Key Sections in Contaminant Frontmatter

1. **Basic Metadata**
   - `name`, `slug`, `category`, `subcategory`
   - `title`, `contamination_description`
   - `author`, `breadcrumb`, `images` (hero, micro)

2. **Laser Properties** ⭐ **RICH DATA**
   - `laser_parameters` (beam profile, fluence, pulse duration, scan speed, wavelengths)
   - `optical_properties` (absorption, reflectivity, refractive index)
   - `removal_characteristics` (byproducts, efficiency, mechanisms)
   - `thermal_properties` (ablation threshold, decomposition temp, conductivity)
   - `safety_data` (fumes, PPE, ventilation, hazards)

3. **Context**
   - `micro` (before/after descriptions)
   - `context_notes` (where contamination occurs)
   - `valid_materials` (list of applicable materials)
   - `eeat` (citations, regulatory references)

---

## Existing Components Analysis

### Components from MaterialsLayout (Can Be Extended)

#### ✅ **1. LaserMaterialInteraction**
**Current Use:** Materials - displays laser-material interaction properties  
**Location:** `app/components/LaserMaterialInteraction/LaserMaterialInteraction.tsx`

**Contaminant Data Available:**
- `laser_properties.laser_parameters` ✅
- `laser_properties.optical_properties` ✅
- `laser_properties.thermal_properties` ✅

**Extension Strategy:**
- Rename to `LaserContaminantInteraction` or make generic `LaserInteractionProperties`
- Accept both `materialProperties.laser_material_interaction` OR `laser_properties`
- Display laser parameters, optical properties, thermal properties using PropertyBars

**Priority:** 🔴 **HIGH** - Core technical data

---

#### ✅ **2. RegulatoryStandards**
**Current Use:** Materials - displays compliance standards  
**Location:** `app/components/RegulatoryStandards/RegulatoryStandards.tsx`

**Contaminant Data Available:**
- `eeat.citations` ✅
- `eeat.isBasedOn` ✅

**Extension Strategy:**
- **NO CHANGES NEEDED** - Already accepts generic `standards` array
- Pass `metadata.eeat.citations` converted to standards format
- Component already renders standards with logos/links

**Priority:** 🟡 **MEDIUM** - Regulatory compliance

---

#### ✅ **3. MaterialFAQ**
**Current Use:** Materials - Q&A section  
**Location:** `app/components/FAQ/MaterialFAQ.tsx`

**Contaminant Data Available:**
- **NOT CURRENTLY IN FRONTMATTER** ❌
- But structure supports adding `faq` field

**Extension Strategy:**
- Rename to generic `FAQ` or `ContentFAQ`
- Accept `itemName` instead of `materialName`
- No other changes needed

**Priority:** 🟢 **LOW** - Future enhancement

---

#### ✅ **4. Micro**
**Current Use:** Materials - before/after comparison  
**Location:** `app/components/Micro/Micro.tsx`

**Contaminant Data Available:**
- `micro.before` ✅
- `micro.after` ✅
- `images.micro.url` ✅

**Extension Strategy:**
- **NO CHANGES NEEDED** - Already generic
- Component works with any frontmatter containing `micro` field

**Priority:** 🔴 **HIGH** - Visual impact

---

#### ✅ **5. PropertyBars**
**Current Use:** Materials/Settings - visual property display  
**Location:** `app/components/PropertyBars/PropertyBars.tsx`

**Contaminant Data Available:**
- ALL laser_properties sections use numeric values ✅
- Perfect for visual bar representation

**Extension Strategy:**
- **NO CHANGES NEEDED** - Fully generic
- Pass contaminant laser properties directly
- Component auto-generates bars from nested data

**Priority:** 🔴 **HIGH** - Core visualization

---

#### ⚠️ **6. MaterialCharacteristics**
**Current Use:** Materials - displays material characteristics  
**Location:** `app/components/MaterialCharacteristics/MaterialCharacteristics.tsx`

**Contaminant Data Available:**
- `removal_characteristics` ✅ (partial match)
- Different structure than materials

**Extension Strategy:**
- Create new `ContaminantRemovalCharacteristics` component
- Display removal efficiency, process speed, surface quality
- Use PropertyBars for numeric values
- Use text display for categorical values (mechanisms, byproducts)

**Priority:** 🔴 **HIGH** - Unique to contaminants

---

#### ❌ **7. RelatedMaterials**
**Current Use:** Materials - shows related materials  
**Location:** `app/components/RelatedMaterials/RelatedMaterials.tsx`

**Contaminant Equivalent:**
- Create `RelatedContaminants` or `ValidMaterials` component
- Display `valid_materials` list as related content
- Show which materials this contamination affects

**Extension Strategy:**
- Create new `ValidMaterialsGrid` component
- Display materials from `valid_materials` array
- Link to material pages for cross-referencing

**Priority:** 🟡 **MEDIUM** - Cross-linking value

---

### New Components Needed for Contaminants

#### 🆕 **1. SafetyDataPanel**
**Purpose:** Display safety information (PPE, hazards, ventilation)  
**Data Source:** `laser_properties.safety_data`

**Features:**
- PPE requirements with icons (goggles, gloves, respirator)
- Fumes generated table (compound, concentration, hazard class)
- Ventilation requirements
- Fire/explosion risk indicators
- Particulate generation specs

**Priority:** 🔴 **HIGH** - Safety critical

**Design:**
```tsx
<SectionContainer title="Safety Requirements" icon={<Shield />}>
  <SafetyDataPanel safetyData={metadata.laser_properties.safety_data} />
</SectionContainer>
```

---

#### 🆕 **2. RemovalProcessPanel**
**Purpose:** Display removal characteristics and process details  
**Data Source:** `laser_properties.removal_characteristics`

**Features:**
- Primary/secondary removal mechanisms
- Removal efficiency (passes, single-pass efficiency)
- Process speed (area coverage rate)
- Surface quality after removal
- Damage risk to substrate

**Priority:** 🔴 **HIGH** - Core technical content

**Design:**
```tsx
<SectionContainer title="Removal Process" icon={<Zap />}>
  <RemovalProcessPanel removalData={metadata.laser_properties.removal_characteristics} />
</SectionContainer>
```

---

#### 🆕 **3. ValidMaterialsGrid**
**Purpose:** Display materials compatible with this contamination removal  
**Data Source:** `valid_materials`

**Features:**
- Grid of material names (similar to RelatedMaterials)
- Filter by category (metals, plastics, glass, wood, ceramic)
- Link to material pages
- Visual icons for material types

**Priority:** 🟡 **MEDIUM** - Cross-referencing

**Design:**
```tsx
<SectionContainer title="Compatible Materials" icon={<Layers />}>
  <ValidMaterialsGrid materials={metadata.valid_materials} />
</SectionContainer>
```

---

#### 🆕 **4. ByproductsTable**
**Purpose:** Display removal byproducts and hazards  
**Data Source:** `laser_properties.removal_characteristics.byproducts`

**Features:**
- Table: Compound | Phase | Hazard Level
- Color-coded hazard levels (low=green, moderate=yellow, high=red)
- Filterable/sortable
- Can be part of SafetyDataPanel or standalone

**Priority:** 🔴 **HIGH** - Safety critical

---

#### 🆕 **5. ContaminationContext**
**Purpose:** Display context notes about where/how contamination occurs  
**Data Source:** `context_notes`

**Features:**
- Simple text display with formatting
- Icons representing common scenarios
- Can integrate with hero image

**Priority:** 🟢 **LOW** - Nice to have

---

## Proposed ContaminantLayout Component

### Component Structure

```tsx
// app/components/ContaminantsLayout/ContaminantsLayout.tsx

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout } from '../Layout/Layout';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { ScheduleCards } from '../Schedule/ScheduleCards';
import { LaserInteractionProperties } from '../LaserInteractionProperties/LaserInteractionProperties';
import { SafetyDataPanel } from '../SafetyDataPanel/SafetyDataPanel';
import { RemovalProcessPanel } from '../RemovalProcessPanel/RemovalProcessPanel';
import { ValidMaterialsGrid } from '../ValidMaterialsGrid/ValidMaterialsGrid';
import type { LayoutProps } from '@/types';

const Micro = dynamic(() => import('../Micro/Micro').then(mod => ({ default: mod.Micro })), {
  ssr: true
});

interface ContaminantsLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
}

export function ContaminantsLayout(props: ContaminantsLayoutProps) {
  const { metadata, children, slug = '', category = '', subcategory = '' } = props;
  const contaminantName = (metadata?.title as string) || metadata?.name || slug;
  
  return (
    <Layout {...props}>
      {/* Page-specific content passed from contaminants page */}
      {children}
      
      {/* Laser-Contaminant Interaction Properties */}
      {(metadata as any)?.laser_properties && (
        <div className="mb-16">
          <LaserInteractionProperties
            itemName={contaminantName}
            laserProperties={(metadata as any).laser_properties}
            category={category}
            subcategory={subcategory}
            slug={slug}
          />
        </div>
      )}
      
      {/* Removal Process Characteristics */}
      {(metadata as any)?.laser_properties?.removal_characteristics && (
        <div className="mb-16">
          <RemovalProcessPanel
            contaminantName={contaminantName}
            removalData={(metadata as any).laser_properties.removal_characteristics}
          />
        </div>
      )}
      
      {/* Safety Data */}
      {(metadata as any)?.laser_properties?.safety_data && (
        <div className="mb-16">
          <SafetyDataPanel
            safetyData={(metadata as any).laser_properties.safety_data}
          />
        </div>
      )}
      
      {/* Micro - before/after */}
      {metadata?.images?.micro?.url && (
        <div className="mb-16">
          <Micro 
            frontmatter={metadata as any}
            config={{}}
          />
        </div>
      )}
      
      {/* Regulatory Standards */}
      {(metadata as any)?.eeat?.citations && (
        <div className="mb-16">
          <RegulatoryStandards 
            standards={(metadata as any).eeat.citations}
            heroImage={(metadata as any)?.images?.hero?.url}
            thumbnailLink={`/contaminants/${category}/${subcategory}/${slug}`}
          />
        </div>
      )}
      
      {/* Valid Materials Grid */}
      {(metadata as any)?.valid_materials && (metadata as any).valid_materials.length > 0 && (
        <div className="mb-16">
          <ValidMaterialsGrid 
            materials={(metadata as any).valid_materials}
            contaminantName={contaminantName}
          />
        </div>
      )}
      
      {/* Schedule Cards */}
      <div className="mb-16">
        <ScheduleCards />
      </div>
    </Layout>
  );
}
```

---

## Component Mapping Matrix

| Contaminant Data | Component | Status | Priority |
|------------------|-----------|--------|----------|
| `contamination_description` | Title (Layout) | ✅ Done | 🔴 HIGH |
| `laser_properties.laser_parameters` | LaserInteractionProperties | 🆕 New | 🔴 HIGH |
| `laser_properties.optical_properties` | LaserInteractionProperties | 🆕 New | 🔴 HIGH |
| `laser_properties.thermal_properties` | LaserInteractionProperties | 🆕 New | 🔴 HIGH |
| `laser_properties.removal_characteristics` | RemovalProcessPanel | 🆕 New | 🔴 HIGH |
| `laser_properties.safety_data` | SafetyDataPanel | 🆕 New | 🔴 HIGH |
| `micro` (before/after) | Micro | ✅ Reuse | 🔴 HIGH |
| `eeat.citations` | RegulatoryStandards | ✅ Reuse | 🟡 MEDIUM |
| `valid_materials` | ValidMaterialsGrid | 🆕 New | 🟡 MEDIUM |
| `context_notes` | ContaminationContext | 🆕 New | 🟢 LOW |
| `breadcrumb` | Breadcrumbs | ✅ Done | 🔴 HIGH |
| `author` | Author | ✅ Reuse | 🟡 MEDIUM |
| `images` (hero) | Hero | ✅ Reuse | 🔴 HIGH |

---

## Implementation Phases

### Phase 1: Foundation (Week 1) 🔴
**Goal:** Get basic contaminant pages rendering

1. ✅ Create `ContaminantsLayout` component
2. ✅ Update breadcrumb structure (DONE)
3. ✅ Pass `contamination_description` to Title (DONE)
4. ⬜ Implement basic page routing test

**Deliverable:** Contaminant pages load with title, description, hero, author

---

### Phase 2: Core Data Components (Week 2) 🔴
**Goal:** Display laser properties and safety data

1. ⬜ Create `LaserInteractionProperties` component (extend LaserMaterialInteraction)
2. ⬜ Create `SafetyDataPanel` component (NEW)
3. ⬜ Create `RemovalProcessPanel` component (NEW)
4. ⬜ Integrate PropertyBars for numeric visualizations

**Deliverable:** Technical laser parameters and safety info displayed

---

### Phase 3: Cross-Reference Components (Week 3) 🟡
**Goal:** Connect contaminants to materials

1. ⬜ Create `ValidMaterialsGrid` component
2. ⬜ Implement material filtering/grouping
3. ⬜ Add links to material pages
4. ⬜ Convert `eeat.citations` to RegulatoryStandards format

**Deliverable:** Material cross-referencing and regulatory compliance display

---

### Phase 4: Polish & Enhancements (Week 4) 🟢
**Goal:** Complete user experience

1. ⬜ Add ContaminationContext component
2. ⬜ Implement FAQ section (if needed)
3. ⬜ Add related contaminants suggestion
4. ⬜ Create dataset export for contamination data
5. ⬜ Mobile optimization and accessibility

**Deliverable:** Full-featured contaminant pages

---

## Technical Considerations

### 1. Data Structure Normalization
- Materials use `materialProperties.laser_material_interaction`
- Contaminants use `laser_properties.laser_parameters`
- **Solution:** Create adapter layer or unified interface

### 2. PropertyBars Integration
- PropertyBars expects nested object structure with `value`, `min`, `max`
- Contaminant data already follows this pattern ✅
- Can reuse PropertyBars without modification

### 3. Safety Data Complexity
- Fumes table has multiple fields (compound, concentration, limits, hazard class)
- Needs custom table component, not just PropertyBars
- Consider responsive design for mobile

### 4. Valid Materials Array
- Currently just string array
- Needs enrichment with material metadata (category, subcategory, slug)
- May require API call or static data mapping

---

## Open Questions

1. **FAQ Section:** Should contaminants have FAQs? Current frontmatter doesn't include them
2. **Dataset Export:** Should contamination data be downloadable like materials data?
3. **Related Contaminants:** Show contaminants in same category/subcategory?
4. **Search/Filter:** Do we need search within valid_materials list?
5. **Comparison Tool:** Allow comparing removal methods for different contaminants?

---

## Success Metrics

- ✅ All contaminant frontmatter data displayed
- ✅ Consistent design with materials/settings pages
- ✅ Component reusability >60%
- ✅ Mobile-responsive layouts
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Page load performance <2s

---

## Related Documentation

- [CONTAMINANT_BREADCRUMB_STRUCTURE.md](./CONTAMINANT_BREADCRUMB_STRUCTURE.md)
- MaterialsLayout: `app/components/MaterialsLayout/MaterialsLayout.tsx`
- PropertyBars: `app/components/PropertyBars/PropertyBars.tsx`
- Contaminant Frontmatter: `frontmatter/contaminants/`

---

## Approval & Next Steps

**Reviewed By:** [Pending]  
**Approved:** [Pending]  
**Next Action:** Begin Phase 1 implementation

**Questions/Feedback:** Contact development team
