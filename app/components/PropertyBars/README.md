# PropertyBars Component

Compact three-bar visualization for material properties that replaces the traditional MetricsCard grid system.

## Features

- **Compact Design**: 70px height vs 640px for 5 MetricsCards (89% space savings)
- **Visual Comparison**: Min/Value/Max bars show value position in range instantly
- **Responsive Grid**: 3/4/6 columns on mobile/tablet/desktop
- **Unit Badges**: Units displayed as overlay badges (no wrapping)
- **Color-Coded**: Each property gets a distinct gradient color
- **Type-Safe**: Full TypeScript support

## Basic Usage

```tsx
import { PropertyBars, extractPropertiesFromMetadata } from '@/app/components/PropertyBars/PropertyBars';

// Extract from metadata
const properties = extractPropertiesFromMetadata(metadata);

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
- Filters out non-numeric values
- Auto-assigns colors based on property names
- Removes "dimensionless" units
- Formats property names (snake_case → Title Case)

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
