# MetricsCard Component

The `MetricsCard` component provides a standalone, flexible solution for displaying frontmatter data in a visually appealing grid format. It can extract and display either machine settings or material properties from article metadata, making it perfect for technical documentation and material processing guides.

## Key Features

### 🔧 Completely Standalone
- **Zero dependencies on other Card components**
- **Self-contained styling and color schemes**
- **Built-in data extraction from frontmatter and MD files**
- **No external component requirements**

### 🎨 Flexible Display Options
- **Multiple grid layouts**: auto, grid-2, grid-3, grid-4
- **Priority-based filtering**: Show only high-priority settings
- **Customizable titles and descriptions**
- **Responsive design with Tailwind CSS**

### 🚀 Ready-to-Use Components
- **MetricsCard**: Unified component for both machine settings and material properties from frontmatter
- **PrimaryMetricsCard**: Essential parameters only
- **CompactMetricsCard**: Space-efficient 2x2 grid
- **MinimalMetricsCard**: Clean display without title
- **GenericMetricsCard**: Auto-discover any numeric frontmatter keys
- **CustomMetricsCard**: Display specific keys with custom configurations

### 📊 Two Data Sources
- **Machine Settings** (`dataSource="machineSettings"`): Laser processing parameters from frontmatter (power, wavelength, etc.)
- **Material Properties** (`dataSource="materialProperties"`): Material characteristics from frontmatter (density, thermal conductivity, etc.)

## Quick Start

```tsx
import { MetricsCard, PrimaryMetricsCard, CompactMetricsCard } from '@/components/MetricsCard';

// Machine Settings from frontmatter - Basic usage with article metadata
<MetricsCard 
  metadata={articleMetadata}
  dataSource="machineSettings" 
  baseHref="/materials/aluminum-6061"
/>

// Material Properties from frontmatter - Display material properties
<MetricsCard 
  metadata={articleMetadata}
  dataSource="materialProperties"
  title="Material Properties"
  className="mb-8"
  mode="advanced"
/>

// Primary settings only (high priority) - works with both data sources
<PrimaryMetricsCard 
  metadata={articleMetadata}
  dataSource="machineSettings"
  baseHref="/property/aluminum-6061"
/>

// Compact 2x2 grid layout - works with both data sources
<CompactMetricsCard 
  metadata={articleMetadata}
  dataSource="materialProperties"
  baseHref="/property/aluminum-6061"
/>
```

## Component Props

### MetricsCardProps
```tsx
interface MetricsCardProps {
  metadata: ArticleMetadata;           // Article metadata containing machineSettings
  baseHref: string;                    // Base URL for card navigation links
  title?: string;                      // Grid section title (default: "Machine Settings")
  description?: string;                // Optional description text
  layout?: 'auto' | 'grid-2' | 'grid-3' | 'grid-4';  // Grid layout
  maxCards?: number;                   // Maximum cards to display (default: 6)
  priorityFilter?: number[];           // Priority levels to show (default: [1, 2])
  showTitle?: boolean;                 // Show/hide section title (default: true)
  className?: string;                  // Additional CSS classes
}
```

## Supported Machine Settings

The component automatically extracts and displays these common laser parameters:

### Priority 1 (Essential)
- **Power Range**: Laser power output with units and ranges
- **Wavelength**: Optical wavelength for material interaction
- **Fluence Range**: Energy density per pulse

### Priority 2 (Important)
- **Pulse Duration**: Temporal width of laser pulses
- **Spot Size**: Focused beam diameter
- **Repetition Rate**: Pulse frequency

Each setting includes:
- ✅ Descriptive title and technical description
- ✅ Value with appropriate units
- ✅ Min/max range display when available
- ✅ Color-coded visual themes
- ✅ Clickable links to detailed sections

## Advanced Configuration

### Custom Layout and Filtering
```tsx
<MetricsCard 
  metadata={metadata}
  baseHref={href}
  title="Laser Parameters"
  description="Optimized settings for this material"
  layout="grid-3"
  maxCards={6}
  priorityFilter={[1, 2]}  // Show priority 1 and 2 settings
  className="my-custom-class"
/>
```

### Component Variants
```tsx
// Essential settings only (priority 1)
<PrimaryMetricsCard 
  metadata={metadata} 
  baseHref={href}
  className="mb-8"
/>

// Compact 4-card layout
<CompactMetricsCard 
  metadata={metadata} 
  baseHref={href}
  className="lg:col-span-2"
/>

// Minimal without header
<MinimalMetricsCard 
  metadata={metadata} 
  baseHref={href}
  className="border rounded-lg p-4"
/>
```

## Data Requirements

### Frontmatter Structure
The component expects `machineSettings` in your article frontmatter:

```yaml
---
machineSettings:
  powerRange: 80
  powerRangeUnit: '%'
  powerRangeMin: 60
  powerRangeMax: 100
  
  wavelength: 1064
  wavelengthUnit: 'nm'
  wavelengthMin: 1060
  wavelengthMax: 1070
  
  fluenceRange: 2.5
  fluenceRangeUnit: 'J/cm²'
  fluenceRangeMin: 1.0
  fluenceRangeMax: 5.0
  
  pulseDuration: 10
  pulseDurationUnit: 'ns'
  
  spotSize: 50
  spotSizeUnit: 'μm'
  
  repetitionRate: 20000
  repetitionRateUnit: 'Hz'
---
```

### TypeScript Integration
Fully typed with proper interfaces:
- `SettingData`: Individual setting structure
- `SettingCardConfig`: Configuration mapping
- `MetricsCardProps`: Component props with strict typing

## Styling & Theming

### Color Schemes
Each setting type has a dedicated color theme:
- 🔵 **Blue**: Power settings
- 🟣 **Indigo**: Wavelength settings  
- 🟪 **Purple**: Fluence settings
- 🟢 **Green**: Pulse duration settings
- 🟡 **Yellow**: Spot size settings
- 🔴 **Red**: Repetition rate settings
- ⚫ **Gray**: Default/fallback theme

### Dark Mode Support
- ✅ Complete dark mode compatibility
- ✅ Automatic theme switching
- ✅ Proper contrast ratios
- ✅ Accessible color combinations

## Migration from SettingsCards

This component replaces the previous `SettingsCards` implementation:

```tsx
// Old approach
import { SettingsCards } from '@/components/SettingsCards';

// New approach
import { MetricsCard } from '@/components/MetricsCard';

// Same functionality, better name
<MetricsCard metadata={metadata} baseHref={href} />
```

## Performance & Best Practices

- **Lightweight**: Self-contained with minimal bundle impact
- **Efficient**: Only renders available settings from metadata
- **Accessible**: Proper semantic HTML and ARIA attributes
- **Responsive**: Mobile-first grid layouts
- **SEO-friendly**: Structured content with meaningful links

The MetricsCard component provides a complete, standalone solution for displaying technical machine settings in a professional, visually appealing format.