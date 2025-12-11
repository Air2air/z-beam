# Thermal Property Architecture Proposal
## Rearchitecting MaterialProperties Cards with New Thermal Fields

**Date:** October 14, 2025  
**Status:** Proposal for Implementation  
**Impact:** Material tables, property cards, frontmatter structure

---

## Current State Analysis

### 1. **Current Frontmatter Structure**

Material frontmatter currently uses a **single generic field** for thermal destruction temperature:

```yaml
chemicalProperties:
  density: "2.7 g/cm³"
  meltingPoint: "660°C"  # ← Generic field for ALL materials
  thermalConductivity: "237 W/m·K"
  formula: "Al"
  materialType: "metal"
```

**Problems:**
- ❌ Scientifically inaccurate for 70+ non-melting materials
- ❌ No differentiation between melting, decomposition, sintering, etc.
- ❌ Misleading for woods, ceramics, polymers, rocks
- ❌ Single field doesn't capture material-specific thermal behavior

### 2. **Current Component Usage**

The `SEOOptimizedMicro` component (recently updated) dynamically determines labels:

```tsx
// Determines label based on material name
const thermalProperty = getThermalPropertyLabel(materialName);

// Renders dynamic label but reads from generic field
<span>{thermalProperty.label}:</span>  // "Decomposition Point:"
<span>{frontmatter.chemicalProperties.meltingPoint}</span>  // Still reads meltingPoint
```

**Current limitation:** Smart labeling but dumb data source.

### 3. **Material Table Structure**

Tables in YAML files use generic "Melting Point" property:

```yaml
materialTables:
  tables:
  - header: '## Physical & Mechanical Properties'
    rows:
    - property: Melting Point  # ← Generic label
      value: '660'
      unit: °C
```

---

## Proposed Architecture

### Phase 1: Enhanced Frontmatter Structure

Add **material-specific thermal property fields** to `chemicalProperties`:

```yaml
chemicalProperties:
  # Existing fields
  density: "2.7 g/cm³"
  thermalConductivity: "237 W/m·K"
  formula: "Al"
  materialType: "metal"
  
  # NEW: Thermal destruction properties (use appropriate field per material type)
  meltingPoint: "660°C"              # For metals & crystalline materials
  decompositionPoint: null            # For organic materials (wood, paper)
  sinteringPoint: null                # For ceramics
  thermalDegradationPoint: null       # For rocks/stone
  degradationPoint: null              # For polymers/composites  
  softeningPoint: null                # For glasses
  glassTransitionTemp: null           # For polymers (Tg)
  sublimationPoint: null              # For materials that sublimate
  
  # Optional: Multiple thermal events
  thermalEvents:
    - type: "softening"
      temperature: "600°C"
      description: "Glass softening begins"
    - type: "melting"
      temperature: "1500°C"
      description: "Complete liquefaction"
```

**Benefits:**
- ✅ Scientifically accurate field names
- ✅ Material-specific thermal data
- ✅ Supports multiple thermal events
- ✅ Backward compatible (keep `meltingPoint` for metals)
- ✅ Extensible for future material types

### Phase 2: Enhanced TypeScript Interfaces

Update `types/centralized.ts`:

```typescript
export interface ChemicalProperties {
  formula?: string;
  symbol?: string;
  materialType?: MaterialType;
  density?: string;
  thermalConductivity?: string;
  
  // Thermal destruction properties (use appropriate field)
  meltingPoint?: string;              // Metals, crystalline materials
  decompositionPoint?: string;        // Organic materials
  sinteringPoint?: string;            // Ceramics
  thermalDegradationPoint?: string;   // Rocks, stone
  degradationPoint?: string;          // Polymers, composites
  softeningPoint?: string;            // Glasses (gradual softening)
  glassTransitionTemp?: string;       // Polymers (Tg)
  sublimationPoint?: string;          // Materials that sublimate
  
  // Optional: Array of thermal events for complex materials
  thermalEvents?: Array<{
    type: 'softening' | 'melting' | 'decomposition' | 'degradation' | 'sintering' | 'sublimation';
    temperature: string;
    description?: string;
  }>;
}
```

### Phase 3: Intelligent Property Accessor Function

Create a smart helper to get the correct thermal property:

```typescript
// app/utils/thermalPropertyHelpers.ts

export interface ThermalPropertyResult {
  value: string | null;
  label: string;
  schemaProperty: string;
  type: 'melting' | 'decomposition' | 'sintering' | 'degradation' | 'softening' | 'sublimation';
}

export function getThermalProperty(
  chemicalProperties: ChemicalProperties,
  materialName: string
): ThermalPropertyResult {
  
  // Priority 1: Check for specific thermal property fields
  if (chemicalProperties.decompositionPoint) {
    return {
      value: chemicalProperties.decompositionPoint,
      label: 'Decomposition Point',
      schemaProperty: 'decompositionTemperature',
      type: 'decomposition'
    };
  }
  
  if (chemicalProperties.sinteringPoint) {
    return {
      value: chemicalProperties.sinteringPoint,
      label: 'Sintering Point',
      schemaProperty: 'sinteringTemperature',
      type: 'sintering'
    };
  }
  
  if (chemicalProperties.thermalDegradationPoint) {
    return {
      value: chemicalProperties.thermalDegradationPoint,
      label: 'Thermal Degradation',
      schemaProperty: 'thermalDegradation',
      type: 'degradation'
    };
  }
  
  if (chemicalProperties.degradationPoint) {
    return {
      value: chemicalProperties.degradationPoint,
      label: 'Degradation Point',
      schemaProperty: 'degradationTemperature',
      type: 'degradation'
    };
  }
  
  if (chemicalProperties.softeningPoint) {
    return {
      value: chemicalProperties.softeningPoint,
      label: 'Softening Point',
      schemaProperty: 'softeningPoint',
      type: 'softening'
    };
  }
  
  if (chemicalProperties.sublimationPoint) {
    return {
      value: chemicalProperties.sublimationPoint,
      label: 'Sublimation Point',
      schemaProperty: 'sublimationPoint',
      type: 'sublimation'
    };
  }
  
  // Priority 2: Fallback to meltingPoint (for metals/backward compatibility)
  if (chemicalProperties.meltingPoint) {
    return {
      value: chemicalProperties.meltingPoint,
      label: 'Melting Point',
      schemaProperty: 'meltingPoint',
      type: 'melting'
    };
  }
  
  // Priority 3: Infer from material name (legacy support)
  const inferred = getThermalPropertyLabel(materialName);
  return {
    value: null,
    label: inferred.label,
    schemaProperty: inferred.property,
    type: inferTypeFromLabel(inferred.label)
  };
}
```

### Phase 4: Update SEOOptimizedMicro Component

Replace current hardcoded logic with smart accessor:

```tsx
// app/components/Micro/SEOOptimizedMicro.tsx

import { getThermalProperty } from '@/app/utils/thermalPropertyHelpers';

export function SEOOptimizedMicro({ materialName, frontmatter, ... }) {
  // Get intelligent thermal property
  const thermalProperty = getThermalProperty(
    frontmatter?.chemicalProperties || {},
    materialName
  );
  
  return (
    <div className="properties-grid">
      {/* Density */}
      {frontmatter?.chemicalProperties?.density && (
        <div className="property-item">
          <span>Density:</span>
          <span>{frontmatter.chemicalProperties.density}</span>
        </div>
      )}
      
      {/* Thermal Property - Smart! */}
      {thermalProperty.value && (
        <div className="property-item">
          <span>{thermalProperty.label}:</span>
          <span itemProp={thermalProperty.schemaProperty}>
            {thermalProperty.value}
          </span>
        </div>
      )}
      
      {/* Thermal Conductivity */}
      {frontmatter?.chemicalProperties?.thermalConductivity && (
        <div className="property-item">
          <span>Thermal Conductivity:</span>
          <span>{frontmatter.chemicalProperties.thermalConductivity}</span>
        </div>
      )}
    </div>
  );
}
```

### Phase 5: Update Material Tables

Enhance table YAML structure to support specific thermal properties:

```yaml
materialTables:
  tables:
  - header: '## Physical Properties'
    rows:
    - property: Density
      value: '0.52'
      unit: 'g/cm³'
    
    # NEW: Material-specific thermal property
    - property: Decomposition Point  # ← Specific label for wood
      thermalType: decomposition     # ← Semantic type
      value: '300-500'
      unit: '°C'
      description: 'Pyrolysis temperature range for pine cellulose'
    
    - property: Thermal Conductivity
      value: '0.12'
      unit: 'W/m·K'
```

**For metals:**
```yaml
    - property: Melting Point
      thermalType: melting
      value: '660'
      unit: '°C'
      description: 'Pure aluminum melting point at standard pressure'
```

**For ceramics:**
```yaml
    - property: Sintering Point
      thermalType: sintering
      value: '1200-1400'
      unit: '°C'
      description: 'Temperature range for particle fusion'
```

---

## Material-Specific Field Mapping

### Metals (35 materials)
```yaml
chemicalProperties:
  meltingPoint: "1064°C"
  # All other thermal fields: null
```

### Woods (20 materials)
```yaml
chemicalProperties:
  decompositionPoint: "300-500°C"
  # Optional
  glassTransitionTemp: "60-80°C"  # For lignin
```

### Ceramics (15 materials)
```yaml
chemicalProperties:
  sinteringPoint: "1200-1400°C"
  # Optional
  thermalEvents:
    - type: sintering
      temperature: "1200°C"
      description: "Initial particle fusion"
    - type: decomposition
      temperature: "1400°C"
      description: "Chemical breakdown (if applicable)"
```

### Rocks (15 materials)
```yaml
chemicalProperties:
  thermalDegradationPoint: "800-1200°C"
  # Optional for limestone/marble
  decompositionPoint: "825°C"  # CaCO₃ decomposition
```

### Polymers/Composites (12 materials)
```yaml
chemicalProperties:
  glassTransitionTemp: "150°C"  # Tg
  degradationPoint: "400°C"     # Chain scission
  # Optional
  thermalEvents:
    - type: softening
      temperature: "150°C"
      description: "Glass transition"
    - type: degradation
      temperature: "400°C"
      description: "Thermal decomposition"
```

### Glass (8 materials)
```yaml
chemicalProperties:
  softeningPoint: "600°C"
  meltingPoint: "1500°C"
  # Optional
  thermalEvents:
    - type: softening
      temperature: "600°C"
      description: "Softening point (Littleton)"
    - type: melting
      temperature: "1500°C"
      description: "Complete liquefaction"
```

---

## Implementation Plan

### ✅ Already Completed
- [x] Dynamic label generation in `SEOOptimizedMicro`
- [x] Material categorization logic
- [x] Documentation of thermal behaviors

### 📋 Phase 1: Foundation (Week 1)
- [ ] Update TypeScript interfaces (`types/centralized.ts`)
- [ ] Create `thermalPropertyHelpers.ts` utility
- [ ] Add new fields to `ChemicalProperties` interface
- [ ] Update YAML schema documentation

### 📋 Phase 2: Component Updates (Week 1-2)
- [ ] Refactor `SEOOptimizedMicro` to use smart accessor
- [ ] Update any other components reading `meltingPoint`
- [ ] Add fallback logic for backward compatibility
- [ ] Create migration helper for legacy data

### 📋 Phase 3: Data Migration (Week 2-3)
- [ ] Script to add appropriate thermal fields to existing YAML
- [ ] Migrate wood materials → `decompositionPoint`
- [ ] Migrate ceramics → `sinteringPoint`
- [ ] Migrate rocks → `thermalDegradationPoint`
- [ ] Migrate polymers → `degradationPoint`
- [ ] Migrate glasses → `softeningPoint`
- [ ] Keep metals with `meltingPoint` (no change)

### 📋 Phase 4: Table Component Updates (Week 3-4)
- [ ] Update table rendering to handle new `thermalType` field
- [ ] Add conditional styling based on thermal type
- [ ] Update table YAML for all materials
- [ ] Generate material-specific property labels

### 📋 Phase 5: Testing & Documentation (Week 4)
- [ ] Test all material types
- [ ] Verify Schema.org properties
- [ ] Update component documentation
- [ ] Create migration guide for future materials

---

## Benefits of New Architecture

### 1. **Scientific Accuracy**
- ✅ Correct terminology for each material class
- ✅ Reflects actual thermal behavior
- ✅ Educates users about material science

### 2. **Data Integrity**
- ✅ Explicit field names prevent confusion
- ✅ Type-safe access with TypeScript
- ✅ Clear semantic meaning

### 3. **Extensibility**
- ✅ Easy to add new thermal properties
- ✅ Support for multiple thermal events
- ✅ Future-proof for new material types

### 4. **SEO Enhancement**
- ✅ More specific Schema.org properties
- ✅ Material-specific structured data
- ✅ Better search engine understanding

### 5. **Backward Compatibility**
- ✅ Legacy `meltingPoint` still works
- ✅ Fallback to inferred labels
- ✅ Gradual migration path

---

## Example: Pine Wood Migration

### Before (Current)
```yaml
chemicalProperties:
  formula: "C6H10O5"
  density: "0.52 g/cm³"
  meltingPoint: "300-500°C"  # ❌ Scientifically incorrect
  thermalConductivity: "0.12 W/m·K"
  materialType: "organic"
```

### After (Proposed)
```yaml
chemicalProperties:
  formula: "C6H10O5"
  density: "0.52 g/cm³"
  decompositionPoint: "300-500°C"  # ✅ Scientifically correct
  glassTransitionTemp: "60-80°C"   # ✅ Optional lignin Tg
  thermalConductivity: "0.12 W/m·K"
  materialType: "organic"
  
  # Optional: Detailed thermal events
  thermalEvents:
    - type: decomposition
      temperature: "200°C"
      description: "Hemicellulose breakdown begins"
    - type: decomposition
      temperature: "300°C"
      description: "Cellulose pyrolysis"
    - type: decomposition
      temperature: "500°C"
      description: "Lignin charring"
```

---

## Migration Script Outline

```typescript
// scripts/migrate-thermal-properties.ts

import { getMaterialCategory } from './thermalPropertyHelpers';

interface MaterialFile {
  path: string;
  frontmatter: {
    chemicalProperties: any;
  };
}

async function migrateMaterial(file: MaterialFile) {
  const { chemicalProperties } = file.frontmatter;
  const materialName = extractMaterialName(file.path);
  const category = getMaterialCategory(materialName);
  
  // Keep existing meltingPoint value
  const thermalValue = chemicalProperties.meltingPoint;
  
  // Determine new field based on category
  switch (category) {
    case 'wood':
      chemicalProperties.decompositionPoint = thermalValue;
      delete chemicalProperties.meltingPoint;
      break;
      
    case 'ceramic':
      chemicalProperties.sinteringPoint = thermalValue;
      delete chemicalProperties.meltingPoint;
      break;
      
    case 'rock':
      chemicalProperties.thermalDegradationPoint = thermalValue;
      delete chemicalProperties.meltingPoint;
      break;
      
    case 'polymer':
      chemicalProperties.degradationPoint = thermalValue;
      delete chemicalProperties.meltingPoint;
      break;
      
    case 'glass':
      chemicalProperties.softeningPoint = thermalValue;
      // Keep meltingPoint for glasses (they have both)
      break;
      
    case 'metal':
      // No change - metals keep meltingPoint
      break;
  }
  
  // Write updated frontmatter
  await writeFile(file.path, updatedFrontmatter);
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('getThermalProperty', () => {
  test('returns decompositionPoint for wood', () => {
    const props = {
      decompositionPoint: '300-500°C',
      materialType: 'organic'
    };
    const result = getThermalProperty(props, 'pine');
    expect(result.label).toBe('Decomposition Point');
    expect(result.value).toBe('300-500°C');
  });
  
  test('falls back to meltingPoint for metals', () => {
    const props = {
      meltingPoint: '660°C',
      materialType: 'metal'
    };
    const result = getThermalProperty(props, 'aluminum');
    expect(result.label).toBe('Melting Point');
    expect(result.value).toBe('660°C');
  });
  
  test('handles missing data with inference', () => {
    const props = { materialType: 'organic' };
    const result = getThermalProperty(props, 'oak');
    expect(result.label).toBe('Decomposition Point');
    expect(result.value).toBeNull();
  });
});
```

---

## Rollout Strategy

### Stage 1: Non-Breaking Addition (Week 1)
- Add new fields to types
- Deploy helper functions
- Test in development

### Stage 2: Parallel Support (Week 2-3)
- Components read from new fields first, fall back to old
- Migrate data incrementally
- Monitor for issues

### Stage 3: Full Migration (Week 3-4)
- Complete data migration
- Update all components
- Remove legacy fallbacks (optional)

### Stage 4: Optimization (Week 4+)
- Performance testing
- SEO validation
- User feedback

---

## Success Metrics

- ✅ **Accuracy:** 100% of materials use scientifically correct thermal property labels
- ✅ **Coverage:** All 100+ materials have appropriate thermal field populated
- ✅ **SEO:** Schema.org validation passes with specific thermal properties
- ✅ **Performance:** No degradation in page load times
- ✅ **Compatibility:** Zero breaking changes to existing pages

---

## Conclusion

This architectural proposal provides a **scientifically accurate**, **type-safe**, and **extensible** system for representing material thermal properties. The phased implementation ensures backward compatibility while enabling future enhancements.

**Recommendation:** Proceed with Phase 1 foundation work immediately, with full rollout over 4 weeks.

---

**Next Steps:**
1. Review and approve this proposal
2. Create implementation tickets
3. Begin Phase 1 TypeScript interface updates
4. Develop migration scripts
5. Test with pilot materials (one from each category)

