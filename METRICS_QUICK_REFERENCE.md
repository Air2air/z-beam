# Metrics Architecture - Quick Reference

## 🎯 TL;DR

**Use PropertyBars for all metrics visualization. MetricsGrid/MetricsCard are deprecated.**

## One Component, One API

```tsx
import { PropertyBars } from '@/app/components/PropertyBars/PropertyBars';

// Material Properties (automatically handles grouped properties)
<PropertyBars metadata={metadata} dataSource="materialProperties" />

// Machine Settings
<PropertyBars metadata={metadata} dataSource="machineSettings" />
```

## Grouped Properties Support

PropertyBars automatically detects and renders grouped properties in separate sections:

```yaml
materialProperties:
  Material Characteristics:
    label: 'Material Characteristics'
    density:
      value: 3210
      unit: 'kg/m³'
  
  Laser-Material Interaction:
    label: 'Laser-Material Interaction'
    absorptionCoefficient:
      value: 104
      unit: 'cm⁻¹'
```

**Result**: Two sections rendered automatically with titled `SectionContainer` wrappers.

## Section Order in Layout

1. **Machine Settings** (top)
2. **Material Characteristics** (if grouped)
3. **Laser-Material Interaction** (if grouped)

## Component Status

| Component | Status | Location | Usage |
|-----------|--------|----------|-------|
| **PropertyBars** | ✅ ACTIVE | `app/components/PropertyBars/` | All production pages |
| MetricsGrid | ⚠️ DEPRECATED | `app/components/_deprecated/MetricsCard/` | Archived |
| MetricsCard | ⚠️ DEPRECATED | `app/components/_deprecated/MetricsCard/` | Archived |

## Why PropertyBars?

- **89% space savings**: 70px vs 640px
- **82% less code**: 179 lines vs 991 lines
- **Single API**: No confusion about which component to use
- **Drop-in replacement**: Same API as MetricsGrid
- **Better performance**: Simpler DOM, faster render
- **Auto-grouped sections**: Detects and renders property groups automatically
- **Ultra-thin bars**: 8px width with equal spacing distribution
- **Smart badges**: Value + unit display with gray-600 background

## Data Format

```yaml
properties:
  property_name:
    value: 123
    min: 0
    max: 200
    unit: "unit"
```

## Complete Migration (November 8, 2025)

✅ All material pages updated (via Layout component)  
✅ ComparisonPage updated  
✅ Legacy components archived to `_deprecated/`  
✅ Documentation complete

## Need More Info?

- **Full Documentation**: `app/components/PropertyBars/README.md`
- **Architecture Details**: `docs/METRICS_ARCHITECTURE_NORMALIZED.md`
- **Migration Guide**: `scripts/MIGRATION_GUIDE.md`
- **Migration Script**: `scripts/migrate-to-property-bars.js`

## Quick Examples

### Basic Usage
```tsx
<PropertyBars metadata={metadata} dataSource="materialProperties" />
```

### Grouped Properties (Automatic)
```tsx
// No special code needed - grouping is detected automatically!
<PropertyBars metadata={metadata} dataSource="materialProperties" />
// Renders multiple sections if properties are grouped
```

### Custom Grid
```tsx
<PropertyBars 
  metadata={metadata} 
  dataSource="machineSettings"
  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
  height={80}
/>
```

### Custom Properties
```tsx
<PropertyBars 
  properties={[
    { name: 'Density', value: 2650, min: 1800, max: 3200, unit: 'kg/m³' }
  ]}
/>
```

---

**Last Updated**: November 8, 2025  
**Architecture Version**: 2.0 (Normalized)
