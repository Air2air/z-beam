# Component-Data Quick Reference Card

**For Developers**: Quick lookup table showing which components use which data fields.

---

## 🎯 Quick Component Lookup

### Materials Pages

```typescript
// Extract from frontmatter
const applications = metadata?.applications;           // string[]
const materialProperties = relationships?.materialProperties;
const contaminated_by = relationships?.contaminated_by; // minimal refs
const regulatory_standards = relationships?.regulatory_standards;

// Components that use this data
<Badge>{app}</Badge>                                   // applications[]
<MaterialCharacteristics {...materialProperties} />    // materialProperties
<CardGrid items={enrichedContaminants} />             // contaminated_by (enriched)
<RegulatoryStandards {...regulatory_standards} />     // regulatory_standards
```

### Compounds Pages

```typescript
// Extract from frontmatter
const cas_number = metadata?.cas_number;               // string
const chemical_formula = metadata?.chemical_formula;   // string
const molecular_weight = metadata?.molecular_weight;   // number
const physical_properties = metadata?.physical_properties; // object
const exposure_limits = metadata?.exposure_limits;     // object
const health_effects = metadata?.health_effects_keywords; // string[]
const ppe_requirements = metadata?.ppe_requirements;   // object

// Components that use this data
<InfoCard 
  icon={Beaker}
  title="Chemical Identity"
  data={[
    { label: 'CAS', value: cas_number },
    { label: 'Formula', value: chemical_formula },
    { label: 'MW', value: `${molecular_weight} g/mol` }
  ]}
/>

<InfoCard 
  icon={Thermometer}
  title="Physical Properties"
  data={[
    { label: 'Boiling Point', value: `${physical_properties.boiling_point_c}°C` }
  ]}
/>

<SafetyDataPanel 
  ppe_requirements={ppe_requirements}
  exposure_limits={exposure_limits}
  // ... other safety fields
/>
```

### Contaminants Pages

```typescript
// Extract from frontmatter
const produces_compounds = relationships?.produces_compounds; // minimal refs
const found_on_materials = relationships?.found_on_materials; // minimal refs
const laser_properties = relationships?.laser_properties;
const regulatory_standards = relationships?.regulatory_standards;

// Components that use this data
<CompoundSafetyGrid compounds={enrichedCompounds} /> // produces_compounds (enriched)
<CardGrid items={enrichedMaterials} />               // found_on_materials (enriched)
<SafetyDataPanel {...laser_properties.safety_data} />
<RegulatoryStandards {...regulatory_standards} />
```

---

## 📊 Data Field → Component Matrix

| Field | Type | Component | Location | Example |
|-------|------|-----------|----------|---------|
| `applications[]` | `string[]` | Badge | MaterialsLayout | `<Badge>Aerospace</Badge>` |
| `cas_number` | `string` | InfoCard | CompoundsLayout | Chemical Identity card |
| `chemical_formula` | `string` | InfoCard | CompoundsLayout | Chemical Identity card |
| `molecular_weight` | `number` | InfoCard | CompoundsLayout | Chemical Identity card |
| `physical_properties.*` | `object` | InfoCard | CompoundsLayout | Physical Properties card |
| `exposure_limits.*` | `object` | InfoCard | CompoundsLayout | Exposure Limits card |
| `health_effects_keywords[]` | `string[]` | InfoCard | CompoundsLayout | Health Effects card |
| `synonyms_identifiers` | `array/object` | InfoCard | CompoundsLayout | Synonyms card |
| `ppe_requirements` | `object` | SafetyDataPanel | CompoundsLayout | Full safety panel |
| `relationships.contaminated_by[]` | `array` | CardGrid | MaterialsLayout | Enriched contaminant cards |
| `relationships.produces_compounds[]` | `array` | CompoundSafetyGrid | ContaminantsLayout | Enriched compound cards |
| `relationships.found_on_materials[]` | `array` | CardGrid | ContaminantsLayout | Enriched material cards |
| `relationships.materialProperties` | `object` | MaterialCharacteristics | MaterialsLayout | Material properties display |
| `faq[]` | `array` | MaterialFAQ | MaterialsLayout | FAQ accordion |

---

## 🔧 Component Props Quick Reference

### InfoCard

```typescript
interface InfoCardProps {
  icon: LucideIcon;              // From lucide-react
  title: string;                 // Card title
  data: Array<{                  // Data rows
    label: string;
    value: string | number;
  }>;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
}

// Example
<InfoCard
  icon={Beaker}
  title="Chemical Identity"
  data={[
    { label: 'CAS Number', value: '71-43-2' },
    { label: 'Formula', value: 'C₆H₆' }
  ]}
/>
```

### Badge

```typescript
interface BadgeProps {
  children: ReactNode;           // Badge text
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Example
<Badge variant="secondary" size="lg">
  <Briefcase className="h-4 w-4" />
  Aerospace
</Badge>
```

### CardGrid

```typescript
interface CardGridProps {
  items: Array<{
    id: string;
    title: string;
    url: string;
    image?: string;
    // ... enriched fields
  }>;
  columns?: 2 | 3 | 4;
  sortBy?: 'frequency' | 'severity' | 'title';
  title?: string;
  description?: string;
}

// Example
<CardGrid
  items={enrichedContaminants}
  columns={3}
  sortBy="frequency"
  title="Common Contaminants"
/>
```

### SectionContainer

```typescript
interface SectionContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
  // Note: Does NOT support 'description' prop
}

// Example
<SectionContainer title="Chemical Properties">
  {/* Child components */}
</SectionContainer>
```

---

## 🚀 Quick Start: Adding New Data

### Step 1: Add to YAML
```yaml
# frontmatter/materials/aluminum-laser-cleaning.yaml
applications:  # → Component: Badge (MaterialsLayout)
  - Aerospace
  - Automotive
  - Construction
```

### Step 2: Extract in Layout
```typescript
// MaterialsLayout.tsx
const applications = (metadata as any)?.applications;  // Badge component
```

### Step 3: Add SectionConfig
```typescript
const sections: SectionConfig[] = [
  {
    component: () => (
      <SectionContainer title="Industry Applications">
        <div className="flex flex-wrap gap-2">
          {applications?.map((app: string) => (
            <Badge key={app} variant="secondary" size="lg">
              <Briefcase className="h-4 w-4" />
              {app}
            </Badge>
          ))}
        </div>
      </SectionContainer>
    ),
  },
];
```

### Step 4: Update Types (if needed)
```typescript
// types/centralized.ts
export interface ArticleMetadata {
  // ... existing fields
  applications?: string[]; // Add new field
}
```

---

## ✅ Checklist for New Components

- [ ] Added data field to YAML frontmatter
- [ ] Extracted data in appropriate layout component
- [ ] Used existing components (InfoCard, Badge, CardGrid, etc.)
- [ ] Added conditional rendering check
- [ ] Updated `types/centralized.ts` if new type needed
- [ ] Updated `/docs/DATA_COMPONENT_MAPPING.md` documentation
- [ ] Tested with actual data

---

## 🔍 Where to Find Data

| Content Type | Primary Data | Relationships | Enrichment |
|--------------|--------------|---------------|------------|
| Materials | `metadata.*` | `relationships.contaminated_by`, `relationships.related_materials` | `getContaminantArticle()`, `getArticle()` |
| Compounds | `metadata.*` | `relationships.produced_by_contaminants` | `getContaminantArticle()` |
| Contaminants | `metadata.*` | `relationships.produces_compounds`, `relationships.found_on_materials` | `getCompoundArticle()`, `getArticle()` |

---

## 📚 Related Documentation

- **Full Reference**: `/docs/DATA_COMPONENT_MAPPING.md`
- **Type Definitions**: `/types/centralized.ts`
- **Frontmatter Analysis**: `/docs/FRONTMATTER_COMPLETENESS_ANALYSIS_DEC22_2025.md`
- **Component Architecture**: `/docs/02-features/component-architecture.md`

---

**Last Updated**: December 22, 2025
