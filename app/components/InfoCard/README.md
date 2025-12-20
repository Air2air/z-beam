# InfoCard Component

**Purpose**: Standardized card component for displaying structured safety information (PPE, ventilation, particulates)

**Status**: ✅ Production Ready  
**Schema**: [SAFETY_RISK_SEVERITY_SCHEMA.md](../../../docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md)  
**Last Updated**: December 20, 2025

---

## Overview

InfoCard displays structured safety information with label/value pairs. Designed to integrate seamlessly with RiskCard in unified safety grids. Used for PPE requirements, ventilation specifications, and particulate generation data.

## Props

```typescript
interface InfoCardProps {
  icon: LucideIcon;                              // Icon component from lucide-react
  title: string;                                 // Card title (e.g., "PPE Requirements")
  data: Array<{ label: string; value: string | number }>;  // Label/value pairs
  className?: string;                            // Optional additional CSS classes
}
```

## Usage

### PPE Requirements

```tsx
import { InfoCard } from '@/app/components/InfoCard/InfoCard';
import { Shield } from 'lucide-react';

<InfoCard
  icon={Shield}
  title="PPE Requirements"
  data={[
    { label: 'Respiratory Protection', value: 'P100 Respirator' },
    { label: 'Eye Protection', value: 'Safety Goggles' },
    { label: 'Skin Protection', value: 'Leather Gloves' }
  ]}
/>
```

### Ventilation Requirements

```tsx
import { InfoCard } from '@/app/components/InfoCard/InfoCard';
import { Wind } from 'lucide-react';

<InfoCard
  icon={Wind}
  title="Ventilation Requirements"
  data={[
    { label: 'Air Changes Per Hour', value: 12 },
    { label: 'Exhaust Velocity', value: '0.75 m/s' },
    { label: 'Filtration Type', value: 'HEPA + Activated Carbon' }
  ]}
/>
```

### Particulate Generation

```tsx
import { InfoCard } from '@/app/components/InfoCard/InfoCard';
import { AlertTriangle } from 'lucide-react';

<InfoCard
  icon={AlertTriangle}
  title="Particulate Generation"
  data={[
    { label: 'Respirable Fraction', value: '65%' },
    { label: 'Size Range', value: '0.5-10 μm' }
  ]}
/>
```

### Unified Safety Grid (Recommended Pattern)

```tsx
import { RiskCard } from '@/app/components/RiskCard/RiskCard';
import { InfoCard } from '@/app/components/InfoCard/InfoCard';
import { getGridClasses } from '@/app/utils/gridConfig';
import { Flame, Shield, Wind, AlertTriangle } from 'lucide-react';

<div className={getGridClasses({ columns: 3, gap: 'md' })}>
  {/* Risk Cards */}
  <RiskCard
    icon={Flame}
    label="Fire/Explosion Risk"
    severity="moderate"
  />
  
  {/* Info Cards */}
  <InfoCard
    icon={Shield}
    title="PPE Requirements"
    data={[
      { label: 'Respiratory', value: 'P100 Respirator' },
      { label: 'Eye', value: 'Safety Goggles' }
    ]}
  />
  <InfoCard
    icon={Wind}
    title="Ventilation"
    data={[
      { label: 'Air Changes/Hour', value: 12 },
      { label: 'Exhaust Velocity', value: '0.75 m/s' }
    ]}
  />
</div>
```

## Data Formatting

InfoCard handles various value types automatically:

```tsx
// Numbers (displayed as-is)
{ label: 'Air Changes Per Hour', value: 12 }

// Strings (displayed as-is)
{ label: 'Respiratory', value: 'P100 Respirator' }

// Pre-formatted values (with units)
{ label: 'Exhaust Velocity', value: '0.75 m/s' }
{ label: 'Size Range', value: '0.5-10 μm' }
{ label: 'Respirable Fraction', value: '65%' }
```

## Styling

- **Background**: `bg-gray-800/50`
- **Border**: `border border-gray-700`
- **Icon**: `w-5 h-5 text-blue-400`
- **Title**: `text-base font-semibold text-white`
- **Label**: `text-xs text-gray-400`
- **Value**: `text-base font-medium text-white`
- **Spacing**: `space-y-2` between data items

## Schema Compliance

Fully compliant with [SAFETY_RISK_SEVERITY_SCHEMA.md](../../../docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md):
- ✅ PPE fields: respiratory, eye_protection, skin_protection
- ✅ Ventilation fields: minimum_air_changes_per_hour, exhaust_velocity_m_s, filtration_type
- ✅ Particulate fields: respirable_fraction, size_range_um
- ✅ Flexible data array structure for any label/value pairs

## Related Components

- **RiskCard**: Companion component for risk assessment cards
- **SafetyDataPanel**: Materials safety display using unified grid
- **SafetyOverview**: Contaminants safety display using unified grid

## Common Data Patterns

### Filter Undefined Values

```tsx
<InfoCard
  icon={Shield}
  title="PPE Requirements"
  data={[
    safetyData.ppe_requirements.respiratory && {
      label: 'Respiratory Protection',
      value: safetyData.ppe_requirements.respiratory
    },
    safetyData.ppe_requirements.eye_protection && {
      label: 'Eye Protection',
      value: safetyData.ppe_requirements.eye_protection
    },
    safetyData.ppe_requirements.skin_protection && {
      label: 'Skin Protection',
      value: safetyData.ppe_requirements.skin_protection
    }
  ].filter(Boolean) as Array<{ label: string; value: string | number }>}
/>
```

### Format Particulate Fraction

```tsx
// Schema: respirable_fraction is 0.0-1.0
// Display: Convert to percentage
{
  label: 'Respirable Fraction',
  value: `${(safetyData.particulate_generation.respirable_fraction * 100).toFixed(0)}%`
}
```

### Format Size Range

```tsx
// Schema: size_range_um is [min, max]
// Display: Format as range with units
{
  label: 'Size Range',
  value: `${safetyData.particulate_generation.size_range_um[0]}-${safetyData.particulate_generation.size_range_um[1]} μm`
}
```

## Design Notes

- Consistent styling with RiskCard for unified appearance
- Responsive within grid layouts
- Icon and title header provides visual context
- Flexible data array supports any number of fields
- Clean vertical spacing between items
