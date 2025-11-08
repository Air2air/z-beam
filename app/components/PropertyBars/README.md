# PropertyBars Component

Compact three-bar visualization for material properties that replaces the traditional MetricsCard grid system.

## Features

- **Compact Design**: 70px height vs 640px for 5 MetricsCards (89% space savings)
- **Visual Comparison**: Min/Value/Max bars show value position in range instantly
- **Grouped Properties**: Automatically detects and renders property groups in separate sections
- **Responsive Grid**: 3/4/6 columns on mobile/tablet/desktop
- **Unit Badges**: Units displayed as overlay badges with value (no wrapping)
- **Color-Coded**: Each property gets a distinct gradient color
- **Equal Spacing**: Bars distributed evenly with flex-1 for uniform appearance
- **Type-Safe**: Full TypeScript support

## Visual Specifications

- **Bar Width**: Ultra-thin at 8px (w-2)
- **Spacing**: flexbox justify-between with px-4 padding + flex-1 for equal distribution
- **Badge**: bg-gray-600 with white text, shows value (text-sm) + unit (text-[9px])
- **Labels**: font-normal weight, whitespace-nowrap, center-aligned in flex-col structure
- **Height**: Fixed at 70px per row

## Basic Usage

### Drop-in Replacement for MetricsGrid

PropertyBars supports the exact same API as MetricsGrid:

```tsx
import { PropertyBars } from '@/app/components/PropertyBars/PropertyBars';

// Material Properties (same as MetricsGrid)
<PropertyBars 
  metadata={metadata} 
  dataSource="materialProperties" 
/>

// Machine Settings (same as MetricsGrid)
<PropertyBars 
  metadata={metadata} 
  dataSource="machineSettings" 
/>
```

### Grouped Properties (Automatic Section Detection)

PropertyBars automatically detects grouped properties and renders them in separate `SectionContainer` components:

```yaml
# frontmatter/materials/silicon-carbide.yaml
materialProperties:
  Material Characteristics:
    label: 'Material Characteristics'
    density:
      value: 3210
      min: 3100
      max: 3300
      unit: 'kg/m³'
    hardness:
      value: 9.5
      min: 9
      max: 10
      unit: 'Mohs'
  
  Laser-Material Interaction:
    label: 'Laser-Material Interaction'
    absorptionCoefficient:
      value: 104
      min: 100
      max: 108
      unit: 'cm⁻¹'
```

When rendered, this automatically creates two sections:
- **Material Characteristics** (with density and hardness bars)
- **Laser-Material Interaction** (with absorption coefficient bar)

No code changes needed - the component detects the structure and handles it automatically!
```

### Direct Properties Array

For more control, extract and pass properties directly:

```tsx
import { PropertyBars, extractPropertiesFromMetadata } from '@/app/components/PropertyBars/PropertyBars';

// Extract from metadata
const properties = extractPropertiesFromMetadata(metadata, 'materialProperties');

// Display
<PropertyBars properties={properties} />
```

## With MetricsGrid Data Source

Replace existing MetricsGrid:

```tsx
// OLD: MetricsCard Grid
<MetricsGrid
  metadata={metadata}
  dataSource="materialProperties"
  title="Material Properties"
/>

// NEW: PropertyBars
<SectionTitle title="Material Properties" />
<PropertyBars 
  properties={extractPropertiesFromMetadata(metadata)}
  columns={{ mobile: 3, tablet: 4, desktop: 6 }}
  height={70}
/>
```

## Manual Property Data

```tsx
<PropertyBars 
  properties={[
    {
      name: 'Density',
      value: 2650,
      min: 1800,
      max: 3200,
      unit: 'kg/m³',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Hardness',
      value: 6.5,
      min: 3,
      max: 10,
      unit: 'Mohs',
      color: 'from-blue-500 to-cyan-500'
    }
  ]}
/>
```

## Props

### PropertyBars

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `properties` | `PropertyData[]` | Required | Array of property objects |
| `columns` | `{mobile, tablet, desktop}` | `{3, 4, 6}` | Responsive column counts |
| `height` | `number` | `70` | Bar height in pixels |
| `className` | `string` | `''` | Additional CSS classes |

### PropertyData

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Property display name |
| `value` | `number` | Yes | Current value |
| `min` | `number` | Yes | Minimum in range |
| `max` | `number` | Yes | Maximum in range |
| `unit` | `string` | No | Display unit (e.g., "kg/m³") |
| `color` | `string` | No | Tailwind gradient class |

## Helper Functions

### extractPropertiesFromMetadata

Converts frontmatter metadata to PropertyData array:

```tsx
extractPropertiesFromMetadata(
  metadata: any,
  selectedProperties?: string[]
): PropertyData[]
```

- Handles both `properties` and `materialProperties` structures
- Handles grouped properties (nested with labels)
- Filters out non-numeric values
- Auto-assigns colors based on property names
- Removes "dimensionless" units
- Formats property names (snake_case → Title Case)

### hasGroupedProperties

Detects if properties are organized into groups:

```tsx
hasGroupedProperties(properties: Record<string, any>): boolean
```

Returns `true` if properties contain nested groups with labels, `false` for flat property structures.

### extractGroupedProperties

Extracts properties organized by group:

```tsx
extractGroupedProperties(
  properties: Record<string, any>
): Array<{ label: string; properties: PropertyData[] }>
```

Returns array of groups, each containing a label and array of properties.

## Migration from MetricsGrid

### Step 1: Import

```tsx
import { PropertyBars, extractPropertiesFromMetadata } from '@/app/components/PropertyBars/PropertyBars';
import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';
```

### Step 2: Extract Properties

```tsx
const properties = extractPropertiesFromMetadata(metadata);
```

### Step 3: Replace Component

```tsx
<SectionContainer>
  <SectionTitle title="Material Properties" />
  <PropertyBars properties={properties} />
</SectionContainer>
```

**Note**: For grouped properties, PropertyBars renders its own `SectionContainer` elements automatically. In Layout.tsx, only wrap `machineSettings` in a SectionContainer - `materialProperties` handles its own sections when grouped.

### Section Ordering in Layout.tsx

The current section order is:
1. **Machine Settings** (always in a SectionContainer)
2. **Material Characteristics** (auto-rendered if grouped)
3. **Laser-Material Interaction** (auto-rendered if grouped)

This order prioritizes practical machine settings first, followed by material property groups.

## Space Comparison

| Component | Height | Cards | Total Height |
|-----------|--------|-------|--------------|
| MetricsCard Grid | 128-160px each | 5 | ~640-800px |
| PropertyBars | 70px total | 9 | ~70px |
| **Savings** | - | - | **89%** |

## Color Scheme

Auto-assigned colors for common properties:

- `density`: Purple to Pink
- `hardness`: Blue to Cyan
- `thermal_conductivity`: Orange to Red
- `laser_absorption`: Green to Emerald
- `specific_heat`: Indigo to Purple
- `laser_damage_threshold`: Yellow to Orange
- `porosity`: Pink to Rose
- `reflectivity`: Cyan to Blue
- `thermal_expansion`: Red to Orange

## Data Requirements

Frontmatter structure (same as MetricsGrid):

```yaml
properties:
  density:
    value: 2650
    min: 1800
    max: 3200
    unit: 'kg/m³'
  hardness:
    value: 6.5
    min: 3
    max: 10
    unit: 'Mohs'
```

No migration needed for existing frontmatter!
