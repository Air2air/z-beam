# Generic MetricsCard Usage Guide

The MetricsCard component has been enhanced to be reusable with any frontmatter keys that contain numeric values. This makes it flexible for displaying metrics from any type of content, not just laser processing parameters.

## Key Features

- **Auto-Discovery**: Automatically find and display any numeric values in your frontmatter
- **Custom Configurations**: Define specific keys to display with custom styling and descriptions
- **Backward Compatibility**: All existing MetricsCard usage continues to work unchanged
- **Flexible Data Sources**: Works with PropertyWithUnits objects, simple numbers, and string values containing numbers

## Usage Examples

### 1. Auto-Discovery Mode (Simplest)

```tsx
import { GenericMetricsCard } from '@/app/components/MetricsCard/MetricsCard';

// Automatically finds and displays ALL numeric values in metadata
<GenericMetricsCard 
  metadata={metadata}
  title="Material Properties"
  maxCards={8}
  excludeKeys={['id', 'version']} // Optional: exclude specific keys
/>
```

### 2. Custom Configuration Mode (Most Control)

```tsx
import { CustomMetricsCard, createMetricConfigs } from '@/app/components/MetricsCard/MetricsCard';

// Define exactly which keys to show and how to display them
const configs = [
  {
    key: 'density',
    title: 'Material Density',
    description: 'Physical density of the material',
    priority: 1,
    colorScheme: 'blue'
  },
  {
    key: 'meltingPoint',
    title: 'Melting Point',
    description: 'Temperature at which material melts',
    priority: 1,
    colorScheme: 'red'
  },
  {
    key: 'thermalConductivity',
    title: 'Thermal Conductivity',
    description: 'Rate of heat transfer through material',
    priority: 2,
    colorScheme: 'green'
  }
];

<CustomMetricsCard
  metadata={metadata}
  metricConfigs={configs}
  title="Key Material Properties"
  layout="grid-3"
/>
```

### 3. Quick Configuration Helper

```tsx
import { CustomMetricsCard, createMetricConfigs } from '@/app/components/MetricsCard/MetricsCard';

// Quick way to create configs for multiple keys
const configs = createMetricConfigs(
  ['density', 'meltingPoint', 'thermalConductivity', 'hardness'],
  {
    defaultPriority: 2,
    titleFormatter: (key) => key.replace(/([A-Z])/g, ' $1').toUpperCase(),
    descriptionFormatter: (key) => `Material ${key} measurement`
  }
);

<CustomMetricsCard
  metadata={metadata}
  metricConfigs={configs}
  title="Material Specifications"
/>
```

### 4. Generic Mode with Main Component

```tsx
import { MetricsCard } from '@/app/components/MetricsCard/MetricsCard';

// Use generic mode with the main component
<MetricsCard
  metadata={metadata}
  mode="generic"
  useGenericExtraction={true}
  title="Auto-Discovered Metrics"
  autoDiscovery={{
    includePatterns: ['.*temperature.*', '.*pressure.*', '.*speed.*'], // Only temperature, pressure, speed values
    excludeKeys: ['id', 'slug', 'title'],
    maxMetrics: 6
  }}
/>
```

## Supported Data Types

The component automatically handles various data formats:

### PropertyWithUnits Objects (Recommended)
```yaml
# In your frontmatter
density:
  numeric: 2.7
  units: "g/cm³"
  min: 2.5
  max: 2.9

temperature:
  text: "1200°C"
  numeric: 1200
  units: "°C"
  range:
    min: 1000
    max: 1500
```

### Simple Numbers
```yaml
# In your frontmatter
hardness: 150
youngModulus: 70000
porosity: 0.05
```

### String Values with Numbers
```yaml
# In your frontmatter
density: "2.7 g/cm³"
temperature: "1200°C"
pressure: "15.5 MPa"
```

## Configuration Options

### GenericMetricConfig
- `key`: The frontmatter key to extract
- `title`: Display name for the metric
- `description`: Explanatory text shown on the card
- `priority`: Sorting priority (1 = highest)
- `colorScheme`: Color theme ('blue', 'indigo', 'purple', 'green', 'yellow', 'red', 'gray')
- `defaultUnit`: Unit to use if not found in data
- `customColor`: Custom hex color (overrides colorScheme)

### MetricAutoDiscoveryConfig
- `includeKeys`: Specific keys to include (if empty, includes all numeric keys)
- `excludeKeys`: Keys to exclude from auto-discovery
- `includePatterns`: Regex patterns for key inclusion
- `excludePatterns`: Regex patterns for key exclusion
- `maxMetrics`: Maximum number of metrics to discover
- `defaultPriority`: Priority assigned to auto-discovered metrics
- `includeNested`: Whether to search nested objects

## Migration from Hardcoded Usage

If you're currently using MetricsCard with hardcoded laser parameters, you can easily switch to generic mode:

### Before (Hardcoded)
```tsx
<MetricsCard 
  metadata={metadata}
  title="Laser Parameters"
  dataSource="machineSettings"
/>
```

### After (Generic)
```tsx
<GenericMetricsCard
  metadata={metadata}
  title="Laser Parameters"
  excludeKeys={['id', 'slug']}
/>
```

Or for more control:
```tsx
<CustomMetricsCard
  metadata={metadata}
  title="Laser Parameters"
  metricConfigs={createMetricConfigs(['power', 'wavelength', 'frequency', 'spotSize'])}
/>
```

## Backward Compatibility

All existing MetricsCard usage continues to work unchanged:
- `mode="advanced"` (default): Uses legacy machine settings extraction
- `mode="simple"`: Uses simple card display mode
- `mode="generic"`: Uses new generic extraction

The component automatically falls back to legacy behavior when no generic options are provided.