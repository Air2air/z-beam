# MetricsCard Component

The `MetricsCard` component provides a standalone, flexible solution for displaying machine settings data in a visually appealing grid format. It extracts and displays key laser processing parameters from article metadata, making it perfect for technical documentation and material processing guides.

## Key Features

### 🔧 Completely Standalone
- **Zero dependencies on Card or StatCard components**
- **Self-contained styling and color schemes**
- **Built-in data extraction from frontmatter and MD files**
- **No external component requirements**

### 🎨 Flexible Display Options
- **Multiple grid layouts**: auto, grid-2, grid-3, grid-4
- **Priority-based filtering**: Show only high-priority settings
- **Customizable titles and descriptions**
- **Responsive design with Tailwind CSS**

### 🚀 Ready-to-Use Components
- **MetricsCard**: Machine settings from frontmatter
- **MetricsProperties**: Material properties from MD files
- **PrimaryMetricsCard**: Essential parameters only
- **CompactMetricsCard**: Space-efficient 2x2 grid
- **MinimalMetricsCard**: Clean display without title

### 📊 Two Component Types
- **Machine Settings** (`metricsmachinesettings`): Laser processing parameters (power, wavelength, etc.)
- **Material Properties** (`metricsproperties`): Material characteristics (density, thermal conductivity, etc.)

## Quick Start

```tsx
import { MetricsCard, PrimaryMetricsCard, CompactMetricsCard } from '@/components/MetricsCard';
import MetricsProperties from '@/components/MetricsCard/MetricsProperties';

// Machine Settings - Basic usage with article metadata
<MetricsCard 
  metadata={articleMetadata} 
  baseHref="/property/aluminum-6061"
/>

// Material Properties - Display material properties from MD files
<MetricsProperties 
  metadata={articleMetadata} 
  title="Material Properties"
  className="mb-8"
  mode="advanced"
/>

// Primary settings only (high priority)
<PrimaryMetricsCard 
  metadata={articleMetadata} 
  baseHref="/property/aluminum-6061"
/>

// Compact 2x2 grid layout
<CompactMetricsCard 
  metadata={articleMetadata} 
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