# StatCard Component

The StatCard component extends the base Card component to display statistical data extracted from frontmatter properties and machine settings.

## Features

- **Data Model Integration**: Automatically extracts statistical data from frontmatter
- **Range Analysis**: Shows value position within min/max ranges with trend indicators  
- **Flexible Display**: Support for multiple stats in various layouts (vertical, horizontal, grid)
- **Color Schemes**: Context-aware coloring based on data type and performance
- **Rich Metadata**: Supports titles, descriptions, comparisons, and trend analysis

## Basic Usage

```typescript
import { StatCard } from '@/components/Card/StatCard';
import { extractPropertyStat, commonPropertyStats } from '@/utils/statCardHelpers';

// Extract stat from frontmatter
const densityStat = extractPropertyStat(metadata, {
  ...commonPropertyStats.density(),
  title: 'Material Density',
  description: 'Current density measurement within acceptable range'
});

// Render StatCard
<StatCard
  href="/materials/aluminum"
  cardTitle="Aluminum Properties"
  cardDescription="Physical properties for laser cleaning analysis"
  primaryStat={densityStat}
  colorScheme="info"
/>
```

## Frontmatter Data Structure

The StatCard expects frontmatter data in this format:

```yaml
properties:
  density: 2.5
  densityUnit: g/cm³
  densityMin: 1.5
  densityMax: 3.4
  thermalConductivity: 1.5
  thermalConductivityUnit: W/m·K
  thermalConductivityMin: 0.2
  thermalConductivityMax: 5.0

machineSettings:
  powerRange: 50.0
  powerRangeUnit: W
  powerRangeMin: 20.0  
  powerRangeMax: 500.0
  wavelength: 1064.0
  wavelengthUnit: nm
```

## StatData Interface

```typescript
interface StatData {
  value: number | string;
  label: string;
  title?: string;              // Display title (overrides label)
  description?: string;        // Additional context
  unit?: string;
  change?: number;             // Percentage change
  trend?: 'up' | 'down' | 'stable';
  comparison?: {
    label: string;
    value: number | string;
    unit?: string;
  };
  format?: 'number' | 'percentage' | 'currency' | 'decimal';
  precision?: number;
}
```

## StatCard Props

```typescript
interface StatCardProps extends Omit<CardProps, 'description'> {
  cardTitle?: string;          // Card title (overrides CardProps.title)
  cardDescription?: string;    // Card description
  primaryStat: StatData;       // Main statistic to display
  secondaryStats?: StatData[]; // Additional stats
  showTrendIcon?: boolean;     // Show trend indicators
  showComparison?: boolean;    // Show comparison data
  statLayout?: 'vertical' | 'horizontal' | 'grid';
  colorScheme?: 'default' | 'success' | 'warning' | 'error' | 'info';
}
```

## Helper Functions

### Extract Property Stats

```typescript
import { extractPropertyStat, commonPropertyStats } from '@/utils/statCardHelpers';

// Use pre-configured common properties
const densityStat = extractPropertyStat(metadata, commonPropertyStats.density());

// Or create custom configuration
const customStat = extractPropertyStat(metadata, {
  propertyKey: 'density',
  label: 'Material Density',
  title: 'Density Analysis',
  description: 'Current measurement within operational range',
  format: 'decimal',
  precision: 2
});
```

### Extract Machine Setting Stats

```typescript
import { extractMachineSettingStat, commonMachineSettingStats } from '@/utils/statCardHelpers';

const powerStat = extractMachineSettingStat(metadata, 
  commonMachineSettingStats.power()
);
```

### Available Common Stats

**Properties:**
- `commonPropertyStats.density()`
- `commonPropertyStats.thermalConductivity()`
- `commonPropertyStats.hardness()`
- `commonPropertyStats.tensileStrength()`

**Machine Settings:**
- `commonMachineSettingStats.power()`
- `commonMachineSettingStats.wavelength()`
- `commonMachineSettingStats.pulseDuration()`
- `commonMachineSettingStats.spotSize()`
- `commonMachineSettingStats.repetitionRate()`
- `commonMachineSettingStats.fluence()`

## Layout Options

### Vertical Layout (Default)
Primary stat prominently displayed, secondary stats stacked below:
```typescript
<StatCard
  primaryStat={mainStat}
  secondaryStats={[stat1, stat2]}
  statLayout="vertical"
/>
```

### Horizontal Layout
Stats displayed side by side:
```typescript
<StatCard
  primaryStat={mainStat}
  secondaryStats={[stat1, stat2]}
  statLayout="horizontal"
/>
```

### Grid Layout
Stats arranged in a 2-column grid:
```typescript
<StatCard
  primaryStat={mainStat}
  secondaryStats={[stat1, stat2, stat3, stat4]}
  statLayout="grid"
/>
```

## Color Schemes

- **default**: Standard blue theme
- **success**: Green theme for positive metrics
- **warning**: Yellow theme for caution/thermal data
- **error**: Red theme for critical values
- **info**: Blue theme for informational data

Auto-assignment based on property type:
```typescript
import { getPropertyColorScheme } from '@/utils/statCardHelpers';

const scheme = getPropertyColorScheme('density'); // Returns 'info'
const scheme2 = getPropertyColorScheme('thermalConductivity'); // Returns 'warning'
```

## Examples

### Single Property Card
```typescript
<StatCard
  href="/materials/alabaster"
  cardTitle="Density Analysis"
  cardDescription="Material density within operational parameters"
  primaryStat={{
    value: 2.5,
    label: 'Density',
    unit: 'g/cm³',
    trend: 'stable',
    comparison: {
      label: 'Range Average',
      value: 2.45,
      unit: 'g/cm³'
    }
  }}
  colorScheme="info"
/>
```

### Multi-Property Dashboard
```typescript
const properties = createPropertyStats(metadata, [
  commonPropertyStats.density(),
  commonPropertyStats.hardness(),
  commonPropertyStats.thermalConductivity()
]);

<StatCard
  href="/materials/alabaster"
  cardTitle="Material Properties"
  cardDescription="Complete property analysis"
  primaryStat={properties[0]}
  secondaryStats={properties.slice(1)}
  statLayout="grid"
  colorScheme="info"
/>
```

### Machine Settings Card
```typescript
const settings = createMachineSettingStats(metadata, [
  commonMachineSettingStats.power(),
  commonMachineSettingStats.wavelength(),
  commonMachineSettingStats.pulseDuration()
]);

<StatCard
  href="/settings/laser-config"
  cardTitle="Optimal Settings"
  cardDescription="Recommended laser parameters"
  primaryStat={settings[0]}
  secondaryStats={settings.slice(1)}
  statLayout="vertical"
/>
```

## Utility Functions

### Quick Property Card Creation
```typescript
const card = createPropertyStatCard(metadata, 'density', {
  href: '/materials/aluminum',
  cardTitle: 'Aluminum Density',
  cardDescription: 'Physical property analysis',
  description: 'Current density within operational range'
});
```

### Quick Machine Setting Card Creation
```typescript
const card = createMachineSettingStatCard(metadata, 'powerRange', {
  href: '/settings/power',
  cardTitle: 'Laser Power',
  cardDescription: 'Optimal power configuration',
  description: 'Recommended power setting for this material'
});
```

## Integration with Existing Cards

StatCards can be mixed with regular Cards in grid layouts:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card href="/materials/overview" title="Overview" />
  <StatCard 
    href="/materials/properties" 
    primaryStat={densityStat}
    cardTitle="Properties"
  />
  <Card href="/settings/advanced" title="Advanced Settings" />
</div>
```