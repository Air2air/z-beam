# RiskCard Component

**Purpose**: Standardized card component for displaying risk assessment with color-coded severity levels

**Status**: ✅ Production Ready  
**Schema**: [SAFETY_RISK_SEVERITY_SCHEMA.md](../../../docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md)  
**Last Updated**: December 20, 2025

---

## Overview

RiskCard displays risk assessment information with automatic color coding based on severity level. Used in unified safety grids alongside InfoCard components.

## Props

```typescript
interface RiskCardProps {
  icon: LucideIcon;        // Icon component from lucide-react
  label: string;           // Risk category label (e.g., "Fire/Explosion Risk")
  severity: string;        // Severity level: critical | high | moderate | medium | low | none
  className?: string;      // Optional additional CSS classes
}
```

## Severity Levels

Automatically applies color coding based on severity:

| Severity | Color | Visual Treatment |
|----------|-------|------------------|
| `critical` | Red | `text-red-400 bg-red-900/20 border-red-500` |
| `high` | Red | `text-red-400 bg-red-900/20 border-red-500` |
| `moderate` | Yellow | `text-yellow-400 bg-yellow-900/20 border-yellow-500` |
| `medium` | Yellow | `text-yellow-400 bg-yellow-900/20 border-yellow-500` |
| `low` | Green | `text-green-400 bg-green-900/20 border-green-500` |
| `none` | Gray | `text-gray-400 bg-gray-800/50 border-gray-600` |

## Usage

### Basic Example

```tsx
import { RiskCard } from '@/app/components/RiskCard/RiskCard';
import { Flame } from 'lucide-react';

<RiskCard
  icon={Flame}
  label="Fire/Explosion Risk"
  severity="moderate"
/>
```

### Unified Safety Grid (Recommended Pattern)

```tsx
import { RiskCard } from '@/app/components/RiskCard/RiskCard';
import { InfoCard } from '@/app/components/InfoCard/InfoCard';
import { getGridClasses } from '@/app/utils/gridConfig';
import { Flame, AlertTriangle, Eye } from 'lucide-react';

<div className={getGridClasses({ columns: 3, gap: 'md' })}>
  {/* Risk Assessment Cards */}
  <RiskCard
    icon={Flame}
    label="Fire/Explosion Risk"
    severity={safetyData.fire_explosion_risk}
  />
  <RiskCard
    icon={AlertTriangle}
    label="Toxic Gas Risk"
    severity={safetyData.toxic_gas_risk}
  />
  <RiskCard
    icon={Eye}
    label="Visibility Hazard"
    severity={safetyData.visibility_hazard}
  />
  
  {/* Info cards follow... */}
</div>
```

## Implementation Details

- **Color Coding**: Uses `getRiskColor()` utility from [app/utils/layoutHelpers.ts](../../utils/layoutHelpers.ts)
- **Case Insensitive**: Severity matching is case-insensitive
- **Responsive**: Works within responsive grid layouts (3→2→1 columns)
- **Consistent Styling**: Matches InfoCard design for unified appearance

## Schema Compliance

Fully compliant with [SAFETY_RISK_SEVERITY_SCHEMA.md](../../../docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md):
- ✅ All severity levels supported
- ✅ Color mapping verified
- ✅ Field naming matches schema
- ✅ Test coverage: 8/8 tests passing

## Related Components

- **InfoCard**: Companion component for non-risk safety data (PPE, ventilation, etc.)
- **SafetyDataPanel**: Materials safety display using unified grid
- **SafetyOverview**: Contaminants safety display using unified grid

## Testing

See [tests/utils/layoutHelpers.test.ts](../../../tests/utils/layoutHelpers.test.ts) for `getRiskColor()` utility tests.

## Integration Points

Used in:
- Materials pages (`SafetyDataPanel.tsx`)
- Contaminants pages (`SafetyOverview.tsx`)
- Any page requiring risk assessment display

## Design Notes

- Fixed padding: `p-4`
- Icon size: `w-6 h-6`
- Severity text: `text-xl font-semibold capitalize`
- Label text: `text-sm text-gray-400`
- Rounded corners: `rounded-md`
