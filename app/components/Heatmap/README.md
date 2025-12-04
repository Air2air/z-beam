# Heatmap Component System

A reusable, extensible heatmap visualization system for displaying parameter analysis across power and pulse width ranges.

## Architecture

### Base Component: `BaseHeatmap.tsx`
The foundational component that provides:
- **Status bar**: Full-width bar above grid showing fluence (J/cm²), distance from optimal (%), and status keyword
  - **Distance from optimal**: Calculated based on score level (0% at level 25, 100% at level 1)
- **15×15 grid rendering** (configurable via `gridRows`/`gridCols` props)
- **Hover interactions** with debounced analysis panel updates
- **Direct HSL color interpolation** for perfectly smooth gradients
- **Current setting indicators** (blue overlay)
- **Auto-generated analysis panels** from `factorCards` configuration
- **Responsive design** (mobile-first, stacks vertically on small screens)

### Reusable UI Components

#### `AnalysisCards.tsx`
Grid-based analysis panel following PropertyBars design pattern:
- **StatusSummaryCard**: First card showing overall score with color-coded background
- **AnalysisCard**: Individual factor cards with horizontal progress bars
  - **Dynamic colors**: Bar color changes based on score value (green ≥80%, lime ≥60%, yellow ≥40%, orange ≥20%, red <20%)
  - Score semantics: Higher score = better outcome = longer bar = greener color
- Responsive grid layout (2→3→4→5 columns)
- Semantic HTML (article, header, figure, data elements)
- ARIA labels for accessibility
- Standalone exports for custom layouts

#### `HeatmapStatusSummary.tsx` (Legacy)
Status banner showing current parameters, score, and progress bar:
- Power × Pulse display
- Level score (X/25)
- Score label (e.g., "SAFE - Low Risk")
- Progress bar with gradient
- `scoreType` prop: `'safety'` or `'effectiveness'` for different styling

#### `HeatmapFactorCard.tsx`
Individual factor analysis cards:
- Label, weight, description
- Progress bar based on factor score
- Optional status indicator
- Optional data rows with custom formatting
- Color-coded: red, orange, yellow, green, blue, lime

### Specialized Extensions

#### 1. `MaterialSafetyHeatmap.tsx`
**Purpose**: Damage risk assessment
- **Question**: "Will this damage my material?"
- **Scoring**: Fluence-based safety calculation
  - 55% Material Safety (fluence vs damage threshold)
  - 25% Power Safety (safety at current power level)
  - 20% Pulse Safety (safety at current pulse duration)
- **Color Scale**: Red (danger) → Orange → Yellow → Green (safe)
- **Features**: 3 factor cards with dynamic scores based on position

#### 2. `ProcessEffectivenessHeatmap.tsx`
**Purpose**: Cleaning performance optimization
- **Question**: "Will this clean effectively?"
- **Scoring**: Multi-factor effectiveness calculation
  - 50% Ablation Effectiveness (fluence vs ablation threshold)
  - 30% Removal Rate (speed of material removal)
  - 20% Energy Efficiency (proximity to optimal parameters)
- **Color Scale**: Red (ineffective) → Yellow (moderate) → Green (optimal)
- **Features**: 3 factor cards with fluence data

#### 3. `EnergyCouplingHeatmap.tsx`
**Purpose**: Laser-to-material energy transfer analysis
- **Question**: "How efficiently does laser energy couple into this material?"
- **Data Source**: `z-beam-generator/data/materials/MaterialProperties.yaml`
- **Scoring**: Multi-factor energy coupling calculation
  - 35% Energy Absorption (energy absorbed vs reflected, offset by surface roughness)
  - 30% Absorption Efficiency (material absorption + porosity bonus)
  - 20% Surface Interaction (penetration depth + roughness trapping)
  - 15% Thermal Mass (effective density considering porosity)
- **Key Properties Used**:
  - `reflectivity` - Fraction of energy reflected (e.g., 0.92 for polished Aluminum)
  - `absorptivity` - Fraction of energy absorbed (e.g., 0.06 for Aluminum)
  - `absorptionCoefficient` - Depth of energy penetration
  - `surfaceRoughness` - Surface texture affecting absorption (rougher = better)
  - `density` - Material density affecting energy distribution
  - `porosity` - Void fraction affecting energy trapping
- **Color Scale**: Red (poor coupling) → Yellow (moderate) → Green (optimal)
- **Features**: 4 factor cards with coupling efficiency data, porosity/roughness details

#### 4. `ThermalStressHeatmap.tsx`
**Purpose**: Thermal stress and cracking risk assessment
- **Question**: "Will thermal gradients cause stress or cracking?"
- **Data Source**: `z-beam-generator/data/materials/MaterialProperties.yaml`
- **Scoring**: Multi-factor thermal stress calculation
  - 35% Expansion Tolerance (tolerance for thermal expansion, parameter-driven)
  - 25% Heat Spreading (diffusivity + conductivity combined)
  - 25% Temperature Margin (considers both melting and boiling points)
  - 15% Shock Tolerance (thermal shock resistance + thermal mass bonus)
- **Key Properties Used**:
  - `thermalExpansionCoefficient` - Expansion rate (e.g., 23.1×10⁻⁶/K for Aluminum)
  - `thermalDiffusivity` - Heat spreading rate
  - `meltingPoint` - Upper temperature limit
  - `boilingPoint` - Extreme scenario limit (for safety margin)
  - `thermalConductivity` - Heat transfer efficiency
  - `specificHeat` - Energy required per degree temperature change
  - `density` - Used to calculate thermal mass (density × specificHeat)
- **Color Scale**: Red (high stress risk) → Yellow (moderate) → Green (low risk)
- **Features**: 4 factor cards with stress, temperature, and thermal mass data

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
  materialName="Aluminum"
/>
```

### Creating Custom Extensions with factorCards

```tsx
import { BaseHeatmap } from '@/app/components/Heatmap';
import { FactorCardConfig } from '@/app/components/Heatmap/types';

export const CustomHeatmap: React.FC<CustomProps> = (props) => {
  const calculateScore = (power, pulse, matProps) => {
    // Your custom scoring logic
    return { 
      level: calculatedLevel,
      analysis: { customScore: 0.8, otherFactor: 0.6 }
    };
  };

  const factorCards: FactorCardConfig[] = [
    {
      id: 'custom',
      label: 'Custom Factor',
      weight: '60%',
      description: 'Your custom analysis factor',
      color: 'green',
      getValue: (analysis) => analysis.customScore,
      getStatus: (analysis) => 
        analysis.customScore > 0.7 
          ? { text: '✓ Good', color: 'green' }
          : { text: '⚠ Warning', color: 'yellow' },
    },
    {
      id: 'other',
      label: 'Other Factor',
      weight: '40%',
      description: 'Secondary factor',
      color: 'blue',
      getValue: (analysis) => analysis.otherFactor,
    },
  ];

  return (
    <BaseHeatmap
      {...props}
      title="Custom Analysis"
      calculateScore={calculateScore}
      getScoreLabel={(level) => level >= 20 ? 'Excellent' : level >= 15 ? 'Good' : 'Poor'}
      factorCards={factorCards}
      scoreType="effectiveness"
      // colorAnchors and legendItems are optional - defaults provided
    />
  );
};
```

### Using Custom renderAnalysisPanel (advanced)

For full control, bypass `factorCards` and provide custom renderer:

```tsx
<BaseHeatmap
  {...props}
  renderAnalysisPanel={(hoveredCell, currentPower, currentPulse) => (
    <div>Custom analysis content</div>
  )}
/>
```

## File Structure

```
app/components/Heatmap/
├── BaseHeatmap.tsx              # Core component with grid/UI logic
├── AnalysisCards.tsx            # Grid-based analysis panel (PropertyBars-style)
├── HeatmapFactorCard.tsx        # Legacy factor analysis card
├── HeatmapStatusSummary.tsx     # Legacy status banner
├── MaterialSafetyHeatmap.tsx    # Safety-focused extension
├── EnergyCouplingHeatmap.tsx    # Energy transfer efficiency extension
├── ThermalStressHeatmap.tsx     # Thermal stress risk extension
├── ProcessEffectivenessHeatmap.tsx # Performance-focused extension
├── types.ts                     # Re-exports from centralized types
└── index.ts                     # Public exports
```

### Display Order in Settings Pages
Heatmaps are displayed in this order on material settings pages:
1. **Material Safety** - Primary concern: "Will this damage my material?"
2. **Energy Coupling** - Secondary: "How efficiently is energy transferred?"
3. **Thermal Stress** - Tertiary: "What's the risk of thermal damage?"
4. **Process Effectiveness** - Final: "How effective is the cleaning?"

## Type System

### Key Interfaces

```typescript
interface BaseHeatmapProps {
  powerRange: HeatmapRange;
  pulseRange: HeatmapRange;
  optimalPower: [number, number];
  optimalPulse: [number, number];
  materialProperties?: MaterialProperties;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  gridRows?: number;  // default: 15
  gridCols?: number;  // default: 15
  
  // Required
  calculateScore: (power, pulse, matProps?) => { level: number; analysis: CellAnalysis };
  getScoreLabel: (level: number) => string;
  
  // Optional - defaults provided
  colorAnchors?: ColorAnchor[];
  legendItems?: LegendItem[];
  adaptiveColorScale?: boolean;  // default: true - normalize colors to actual data range
  
  // Analysis panel - choose one approach:
  factorCards?: FactorCardConfig[];  // Auto-generate panel from config
  scoreType?: 'safety' | 'effectiveness';
  renderAnalysisPanel?: (hoveredCell, currentPower, currentPulse) => ReactNode;  // Full custom
}

interface FactorCardConfig {
  id: string;
  label: string;
  weight: string;  // e.g., "50%"
  description: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'lime';
  getValue: (analysis: CellAnalysis) => number;  // 0-1 score
  dataRows?: Array<{
    label: string;
    getValue: (analysis: CellAnalysis) => string;
    getColor?: (analysis: CellAnalysis) => string;
  }>;
  getStatus?: (analysis: CellAnalysis) => { text: string; color: string } | null;
}

interface CellAnalysis {
  level: number;
  finalScore: number;
  [key: string]: any;  // Extension-specific data
}
```

## Features

### Responsive Layout
- **Desktop**: Side-by-side (60% heatmap, 40% analysis)
- **Mobile**: Stacked (analysis on top, heatmap below)
- Uses `sm:` breakpoint for transitions

### Color System
- **Direct HSL interpolation**: Continuous gradient from red (0°) to green (~137°)
- **Adaptive scaling**: By default, colors normalize to the actual data range in each heatmap
  - If scores range from 12-20, the full red→green gradient maps to that range
  - Set `adaptiveColorScale={false}` to use fixed 1-25 range
- **Seamless grid**: `gap-0` creates contiguous tiles without spacing
- **Perceptually uniform**: Consistent visual progression
- **Configurable**: Override with `colorAnchors` prop if needed

### Interaction
- **Status bar**: Above-grid bar showing real-time fluence, optimal distance, and status keyword with color-coded text
- **Hover tooltips**: Show parameter values
- **Debounced analysis panel**: Updates after 150ms pause (prevents flicker)
- **Current settings**: Blue overlay on grid cells near current parameters

## Design Principles

1. **Separation of Concerns**: UI logic in base, domain logic in extensions
2. **Configuration over Code**: `factorCards` array replaces custom JSX
3. **Type Safety**: Full TypeScript coverage with centralized types
4. **Extensibility**: Easy to create new analysis types
5. **Consistency**: Shared visual language across extensions
6. **Performance**: 15×15 grid (225 cells) optimized from original 20×20 (400 cells)

## December 2025 Updates

### Early December 2025
- **Status bar**: New full-width bar above grid showing:
  - Fluence value (J/cm²) - actual energy density at current parameters
  - Distance from optimal (%) - how far current position is from optimal zone
  - Status keyword (e.g., "SAFE", "DANGER", "OPTIMAL") - color-coded summary
- **AnalysisCards component**: New grid-based analysis panel following PropertyBars design
- **StatusSummaryCard**: Standalone export with color-coded background matching grid cell
  - Now displays only the description part of label (strips keyword, e.g., "Low Risk" instead of "SAFE - Low Risk")
- **Horizontal bars**: Progress bars changed from vertical to horizontal orientation
- **Semantic HTML**: Added article, header, figure, data elements with ARIA labels
- **Heatmap ordering**: Reordered to Material Safety → Energy Coupling → Thermal Stress → Process Effectiveness
- **Position-based scoring**: Added power/pulse position factors for fuller color range in all heatmaps
- **Immediate updates**: StatusSummaryCard background and status bar text update immediately with 150ms transition
- **X-axis labels**: Increased to 7 labels for better readability
- **Cell styling**: Changed from `.aspect-square` to `.heatmap-cell` class

### November 2025
- **Grid size**: Reduced from 20×20 to 15×15 (44% fewer calculations)
- **Grid spacing**: Changed from `gap-1` to `gap-0` for seamless tiles
- **Color interpolation**: Changed from anchor-based to direct HSL gradient
- **Adaptive color scaling**: Colors now normalize to actual data range
- **factorCards prop**: New declarative way to define analysis panels
- **scoreType prop**: Controls 'safety' vs 'effectiveness' styling
- **Reusable components**: `HeatmapFactorCard`, `HeatmapStatusSummary`
- **Optional defaults**: `colorAnchors` and `legendItems` now have sensible defaults
- **Simplified extensions**: MaterialSafetyHeatmap and ProcessEffectivenessHeatmap now ~50 lines shorter
- **Test coverage**: 39 tests (`tests/components/Heatmap.test.tsx`)
- **New heatmaps from generator data**:
  - `EnergyCouplingHeatmap`: Analyzes laser energy absorption using reflectivity, absorptivity, surface roughness
  - `ThermalStressHeatmap`: Assesses thermal stress risk using expansion coefficients, melting points, thermal properties
- **Extended HeatmapMaterialProperties**: Added optical and thermal properties (reflectivity, absorptivity, thermalExpansionCoefficient, etc.)

## Data Sources

The heatmap system now leverages comprehensive material data from `z-beam-generator/data/materials/`:

### MaterialProperties.yaml
Contains 55+ properties per material including:
- **Optical**: reflectivity, absorptivity, absorptionCoefficient
- **Thermal**: thermalExpansion, thermalDiffusivity, meltingPoint, thermalConductivity, specificHeat
- **Mechanical**: density, porosity, tensileStrength, hardness
- **Laser-specific**: ablationThreshold, damageThreshold, fluenceOptimal

### Property Extensions
The `HeatmapMaterialProperties` interface has been extended to include these additional properties,
enabling richer analysis in the new heatmap types.
