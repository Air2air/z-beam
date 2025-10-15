# PropertyCategory Structure - Visual Reference

**Updated:** October 14, 2025  
**Architecture Version:** 2.0 (with explicit labels)

## Complete Structure Diagram

```
PropertyCategory
├── label: string              ← DISPLAY NAME (shown in UI)
│   └── Example: "Thermal Response Properties"
│
├── percentage: number         ← IMPORTANCE (for sorting)
│   └── Example: 35
│
├── description: string        ← PURPOSE (metadata, not shown)
│   └── Example: "Heat-related material characteristics"
│
└── properties: object         ← ACTUAL PROPERTIES
    ├── propertyName1: PropertyValue
    │   ├── value: number | string
    │   ├── unit: string
    │   ├── confidence: number (0-100)
    │   ├── description: string
    │   ├── min?: number
    │   └── max?: number
    │
    ├── propertyName2: PropertyValue
    │   └── ...
    │
    └── propertyName3: PropertyValue
        └── ...
```

## Field Hierarchy

### Level 1: Category Object
```typescript
thermal_response: PropertyCategory
```

### Level 2: Category Metadata
```typescript
{
  label: "Thermal Response Properties",  // What users see
  percentage: 35,                        // Sort order
  description: "Heat-related...",        // Internal docs
  properties: { ... }                    // The data
}
```

### Level 3: Property Map
```typescript
properties: {
  thermalConductivity: PropertyValue,
  thermalExpansion: PropertyValue,
  meltingPoint: PropertyValue
}
```

### Level 4: Property Values
```typescript
thermalConductivity: {
  value: 167,
  unit: "W/m·K",
  confidence: 95,
  description: "Excellent thermal conductor",
  min: 160,
  max: 175
}
```

## Real YAML Example

```yaml
# Material: Porcelain
materialProperties:
  
  # CATEGORY 1
  material_properties:                    # ← Category ID
    label: Material Properties            # ← Display name (shown in h3)
    percentage: 40.0                      # ← Sort weight (highest first)
    description: 'Intrinsic properties'   # ← Internal documentation
    properties:                           # ← Start of properties map
      density:                            # ← Property name
        value: 2.4                        # ← Numeric or string value
        unit: g/cm³                       # ← Unit of measurement
        confidence: 95                    # ← Data confidence (0-100)
        description: 'Typical density'    # ← Property description
        min: 2.2                          # ← Optional: range minimum
        max: 19.3                         # ← Optional: range maximum
      porosity:
        value: 2.0
        unit: '%'
        confidence: 91
        description: 'Typical porosity'
      chemicalStability:
        value: 95
        unit: '% resistance'
        confidence: 93
        description: 'Chemical resistance'
  
  # CATEGORY 2
  structural_response:
    label: Structural Response Properties
    percentage: 18.2
    description: 'Physical reaction to thermal stress'
    properties:
      hardness:
        value: 7.0
        unit: Mohs
        confidence: 94
        description: 'Mohs hardness scale'
        min: 1.0
        max: 10.0
      tensileStrength:
        value: 50.0
        unit: MPa
        confidence: 95
        description: 'Ultimate tensile strength'
        min: 50
        max: 1000
  
  # CATEGORY 3
  energy_coupling:
    label: Energy Coupling Properties
    percentage: 16.4
    description: 'First-order photon coupling'
    properties:
      laserAbsorption:
        value: 32.7
        unit: '%'
        confidence: 92
        description: 'Laser absorption rate'
      reflectivity:
        value: 0.12
        unit: dimensionless
        confidence: 83
        description: 'Surface reflectivity'
```

## Data Flow Visualization

```
YAML File
    │
    ├─→ materialProperties
    │       │
    │       ├─→ thermal_response (category ID)
    │       │       │
    │       │       ├─→ label: "Thermal Response Properties"
    │       │       │         │
    │       │       │         └─→ <h3>Thermal Response Properties</h3>
    │       │       │
    │       │       ├─→ percentage: 35
    │       │       │         │
    │       │       │         └─→ [Used for sorting categories]
    │       │       │
    │       │       ├─→ description: "..."
    │       │       │         │
    │       │       │         └─→ [Metadata only, not displayed]
    │       │       │
    │       │       └─→ properties
    │       │               │
    │       │               ├─→ thermalConductivity
    │       │               │       │
    │       │               │       └─→ <MetricsCard
    │       │               │             title="Therm. Cond."
    │       │               │             value={237}
    │       │               │             unit="W/m·K"
    │       │               │             color="#FF6B6B40" />
    │       │               │
    │       │               ├─→ meltingPoint
    │       │               │       │
    │       │               │       └─→ <MetricsCard ... />
    │       │               │
    │       │               └─→ specificHeat
    │       │                       │
    │       │                       └─→ <MetricsCard ... />
    │       │
    │       ├─→ mechanical_response (category ID)
    │       │       └─→ [Same structure]
    │       │
    │       └─→ laser_interaction (category ID)
    │               └─→ [Same structure]
    │
    └─→ Rendered as:
            <section>
              <div class="category-section">
                <h3>Thermal Response Properties</h3>
                <div class="grid">
                  <MetricsCard ... />
                  <MetricsCard ... />
                  <MetricsCard ... />
                </div>
              </div>
              <div class="category-section">
                <h3>Mechanical Response Properties</h3>
                <div class="grid">...</div>
              </div>
            </section>
```

## Field Usage Matrix

| Field | Required | Used In UI | Used For Sorting | Used In Tests | Source |
|-------|----------|------------|------------------|---------------|--------|
| `label` | ✅ Yes | ✅ Yes (h3 header) | ❌ No | ✅ Yes | YAML |
| `percentage` | ✅ Yes | ❌ No | ✅ Yes (descending) | ✅ Yes | YAML |
| `description` | ✅ Yes | ❌ No | ❌ No | ✅ Yes | YAML |
| `properties` | ✅ Yes | ✅ Yes (cards) | ❌ No | ✅ Yes | YAML |

## Component Consumption

### TypeScript Interface
```typescript
export interface PropertyCategory {
  label: string;        // Display name
  description: string;  // Internal docs
  percentage: number;   // Sort weight
  properties: {
    [propertyName: string]: PropertyValue;
  };
}
```

### React Component
```tsx
function CategoryHeader({ category }: { category: PropertyCategory }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">
        {category.label}  {/* ← Uses YAML label */}
      </h3>
    </div>
  );
}
```

### Sorting Logic
```tsx
const sortedCategories = Object.entries(materialProperties)
  .sort(([, a], [, b]) => (b.percentage || 0) - (a.percentage || 0));
  //                          ↑ Uses percentage field
```

## Validation Rules

### Required Fields
```typescript
// Component validates these fields exist
if (!category || typeof category !== 'object') return false;
if (!('label' in category)) return false;           // ← NEW
if (!('properties' in category)) return false;

// TypeScript enforces at compile time
const category: PropertyCategory = {
  label: string,        // ← Must provide
  description: string,  // ← Must provide
  percentage: number,   // ← Must provide
  properties: object    // ← Must provide
};
```

### Field Types
- `label`: Non-empty string, human-readable
- `percentage`: Number 0-100 (can exceed 100 if desired)
- `description`: String, any length
- `properties`: Object with at least one property

### Best Practices
```yaml
# ✅ GOOD
material_properties:
  label: Material Properties              # Clear, descriptive
  percentage: 40.0                        # Realistic weight
  description: 'Intrinsic properties...'  # Meaningful description
  properties:                             # Has properties
    density: { ... }

# ❌ BAD
material_properties:
  label: props                            # Too vague
  percentage: 0                           # No weight
  description: ''                         # Empty
  properties: {}                          # No properties

# ❌ BAD - Missing required field
material_properties:
  # label: MISSING!                       # Will fail validation
  percentage: 40
  description: '...'
  properties: { ... }
```

## Common Category Labels

Reference for consistent naming:

```yaml
# Physical Properties
material_properties:
  label: Material Properties

# Thermal Domain
thermal_response:
  label: Thermal Response Properties

thermal:
  label: Thermal Properties

# Mechanical Domain
mechanical_response:
  label: Mechanical Response Properties

mechanical:
  label: Mechanical Properties

structural_response:
  label: Structural Response Properties

# Optical/Laser Domain
laser_interaction:
  label: Laser Interaction Properties

energy_coupling:
  label: Energy Coupling Properties

optical_laser:
  label: Optical & Laser Properties

# Other Domains
surface_properties:
  label: Surface Properties

chemical_properties:
  label: Chemical Properties

electrical_properties:
  label: Electrical Properties

environmental:
  label: Environmental Properties
```

## Debug Checklist

If categories aren't displaying:

1. ☑️ Check `label` field exists and is a string
2. ☑️ Check `properties` field exists and is an object
3. ☑️ Check `properties` has at least one property
4. ☑️ Check `percentage` is a number
5. ☑️ Check property values have `value` and `unit` fields
6. ☑️ Check YAML syntax is valid (no indentation errors)

## Quick Reference

```typescript
// Minimal valid category
const category: PropertyCategory = {
  label: "My Properties",
  description: "Description here",
  percentage: 25,
  properties: {
    myProp: {
      value: 100,
      unit: "units",
      confidence: 90,
      description: "Property description"
    }
  }
};
```

---

**Reference Version:** 2.0  
**Last Updated:** October 14, 2025  
**Status:** Current
