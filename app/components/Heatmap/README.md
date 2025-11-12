# Heatmap Component System

A reusable, extensible heatmap visualization system for displaying parameter analysis across power and pulse width ranges.

## Architecture

### Base Component: `BaseHeatmap.tsx`
The foundational component that provides:
- **20×20 grid rendering** with responsive layout
- **Hover interactions** with tooltips
- **Color interpolation** for smooth gradients
- **Current setting indicators** (blue overlay)
- **Flexible analysis panel** system
- **Responsive design** (mobile-first, stacks vertically on small screens)

### Specialized Extensions

#### 1. `MaterialSafetyHeatmap.tsx`
**Purpose**: Damage risk assessment
- **Question**: "Will this damage my material?"
- **Scoring**: Fluence-based safety calculation
  - 60% Damage Risk (fluence vs threshold)
  - 25% Power Factor (spatial modifiers)
  - 10% Pulse Factor (thermal accumulation)
  - 5% Shock Resistance (material properties)
- **Color Scale**: Red (danger) → Yellow (caution) → Cyan (safe) → Green (optimal)
- **Features**: Detailed analysis panel with weighted factor breakdowns

#### 2. `ProcessEffectivenessHeatmap.tsx`
**Purpose**: Cleaning performance optimization
- **Question**: "Will this clean effectively?"
- **Scoring**: Multi-factor effectiveness calculation
  - 50% Ablation Effectiveness (fluence vs ablation threshold)
  - 30% Removal Rate (speed of material removal)
  - 20% Energy Efficiency (proximity to optimal parameters)
- **Color Scale**: Red (ineffective) → Yellow (moderate) → Green (optimal)
- **Features**: Performance-oriented visualization

## Usage

### Basic Implementation
```tsx
import { MaterialSafetyHeatmap } from '@/app/components/Heatmap';

<MaterialSafetyHeatmap
  powerRange={{ min: 10, max: 100, current: 50 }}
  pulseRange={{ min: 100, max: 300, current: 180 }}
  optimalPower={[40, 60]}
  optimalPulse={[150, 200]}
  materialProperties={materialData}
/>
```

### Creating Custom Extensions

```tsx
import { BaseHeatmap, BaseHeatmapProps } from '@/app/components/Heatmap';

export const CustomHeatmap: React.FC<CustomProps> = (props) => {
  const calculateScore = (power, pulse, matProps) => {
    // Your custom scoring logic
    return { 
      level: calculatedLevel,
      analysis: { ...customData }
    };
  };

  return (
    <BaseHeatmap
      {...props}
      title="Custom Analysis"
      calculateScore={calculateScore}
      colorAnchors={[
        { level: 1, color: '#DC2626' },
        { level: 25, color: '#10B981' }
      ]}
      getScoreLabel={(level) => `Level ${level}`}
      legendItems={[...]}
    />
  );
};
```

## File Structure

```
app/components/Heatmap/
├── BaseHeatmap.tsx           # Core component with grid/UI logic
├── MaterialSafetyHeatmap.tsx # Safety-focused extension
├── ProcessEffectivenessHeatmap.tsx # Performance-focused extension
├── types.ts                  # Shared TypeScript interfaces
└── index.ts                  # Public exports
```

## Type System

### Key Interfaces

```typescript
interface BaseHeatmapProps {
  powerRange: HeatmapRange;
  pulseRange: HeatmapRange;
  calculateScore: (power, pulse, matProps?) => { level, analysis };
  colorAnchors: ColorAnchor[];
  getScoreLabel: (level) => string;
  legendItems: LegendItem[];
  // ... optional customization props
}

interface CellAnalysis {
  level: number;
  finalScore: number;
  [key: string]: any; // Extension-specific data
}
```

## Features

### Responsive Layout
- **Desktop**: Side-by-side (60% heatmap, 40% analysis)
- **Mobile**: Stacked (analysis on top, heatmap below)
- Uses `sm:` breakpoint for transitions

### Color System
- **Continuous gradients** with floating-point interpolation
- **6-anchor system** for smooth transitions
- **Perceptually-uniform mapping** (cube root transform)

### Interaction
- **Hover tooltips**: Show parameter values
- **Analysis panel**: Updates with hovered cell or current settings
- **Current settings**: Blue overlay on grid cells

## Design Principles

1. **Separation of Concerns**: UI logic in base, domain logic in extensions
2. **Type Safety**: Full TypeScript coverage with generic interfaces
3. **Extensibility**: Easy to create new analysis types
4. **Consistency**: Shared visual language across extensions
5. **Performance**: Memoized calculations, efficient rendering

## Migration Notes

Old structure:
```
app/components/MaterialSafetyHeatmap/MaterialSafetyHeatmap.tsx
app/components/ProcessEffectivenessHeatmap/ProcessEffectivenessHeatmap.tsx
```

New structure:
```
app/components/Heatmap/
├── BaseHeatmap.tsx
├── MaterialSafetyHeatmap.tsx
├── ProcessEffectivenessHeatmap.tsx
```

Import change:
```tsx
// Old
import { MaterialSafetyHeatmap } from '@/app/components/MaterialSafetyHeatmap/MaterialSafetyHeatmap';

// New
import { MaterialSafetyHeatmap } from '@/app/components/Heatmap';
```

## Future Enhancements

Potential extensions:
- **ThermalEffectHeatmap**: Heat accumulation analysis
- **QualityMetricHeatmap**: Surface finish prediction
- **CostOptimizationHeatmap**: Operating cost vs performance
- **ReliabilityHeatmap**: Process consistency scoring
