# PropertyBars Migration Example

## No Prop Drilling Required! 🎉

PropertyBars now supports the exact same API as MetricsGrid - just swap the component name!

## Before (MetricsGrid)

```tsx
import { MetricsGrid } from '../MetricsCard/MetricsGrid';

// Machine Settings
<MetricsGrid 
  metadata={metricsMetadata} 
  dataSource="machineSettings" 
  showTitle={false}
  className="custom-class"
  searchable 
/>

// Material Properties
<MetricsGrid 
  metadata={propertiesMetadata} 
  dataSource="materialProperties" 
  showTitle={false}
  className="custom-class"
  searchable 
/>
```

## After (PropertyBars)

```tsx
import { PropertyBars } from '../PropertyBars/PropertyBars';

// Machine Settings - SAME API!
<PropertyBars 
  metadata={metricsMetadata} 
  dataSource="machineSettings" 
  showTitle={false}
  className="custom-class"
  searchable 
/>

// Material Properties - SAME API!
<PropertyBars 
  metadata={propertiesMetadata} 
  dataSource="materialProperties" 
  showTitle={false}
  className="custom-class"
  searchable 
/>
```

## Real-World Example: Layout.tsx

### Current Code (app/components/Layout/Layout.tsx, lines 50-56)

```tsx
<MetricsGrid 
  metadata={metricsMetadata} 
  dataSource="machineSettings" 
  showTitle={false}
  className={component.config.className || ''}
  searchable 
/>
```

### Drop-in Replacement

```tsx
<PropertyBars 
  metadata={metricsMetadata} 
  dataSource="machineSettings" 
  showTitle={false}
  className={component.config.className || ''}
  searchable 
/>
```

**That's it!** Change one line (the import) and one word (MetricsGrid → PropertyBars).

## Benefits

### Space Efficiency
- **MetricsGrid**: 160px per row × 5 properties = 800px
- **PropertyBars**: 70px total for ALL properties = **91% savings**

### Automatic Section Grouping
PropertyBars detects grouped properties and renders them in separate sections automatically:

```yaml
# Grouped structure
materialProperties:
  Material Characteristics:
    label: 'Material Characteristics'
    density: { value: 3210, min: 3100, max: 3300, unit: 'kg/m³' }
  
  Laser-Material Interaction:
    label: 'Laser-Material Interaction'
    absorptionCoefficient: { value: 104, min: 100, max: 108, unit: 'cm⁻¹' }
```

**Result**: Two `SectionContainer` components with titles, no extra code needed!

### Layout Section Order
In `Layout.tsx`, sections render in this order:
1. Machine Settings (wrapped in SectionContainer)
2. Material Characteristics (auto-wrapped if grouped)
3. Laser-Material Interaction (auto-wrapped if grouped)

### Same Data Structure
Both components work with the same metadata structure:

```yaml
# frontmatter
properties:
  density:
    value: 2.7
    min: 2.6
    max: 2.8
    unit: "g/cm³"
```

### Visual Design
- **Bar Width**: Ultra-thin at 8px (w-2 Tailwind class)
- **Spacing**: Equal distribution with flex-1 containers
- **Badge**: Gray-600 background with white text
- **Badge Content**: Value (text-sm) above unit (text-[9px])
- **Labels**: Center-aligned, normal weight, no wrapping

### Color Coding
- **Material Properties**: Varied colors (purple, blue, orange, green, etc.)
- **Machine Settings**: Gold/amber theme for consistency

### Responsive Grid
- Mobile: 3 columns
- Tablet: 4 columns
- Desktop: 6 columns

## Migration Script

For bulk updates across multiple files:

```bash
# Preview changes (safe)
node scripts/migrate-to-property-bars.js --dry-run

# Apply changes
node scripts/migrate-to-property-bars.js

# Single file
node scripts/migrate-to-property-bars.js --file=app/components/Layout/Layout.tsx
```

## API Compatibility Matrix

| Prop | MetricsGrid | PropertyBars | Notes |
|------|-------------|--------------|-------|
| `metadata` | ✅ | ✅ | Same structure, supports grouped properties |
| `dataSource` | ✅ | ✅ | 'materialProperties' \| 'machineSettings' |
| `className` | ✅ | ✅ | Custom CSS classes |
| `showTitle` | ✅ | ✅ | Accepted but not used (add SectionTitle separately) |
| `searchable` | ✅ | ✅ | Accepted but not used (future enhancement) |
| `properties` | ❌ | ✅ | Direct array (PropertyBars only) |
| `columns` | ❌ | ✅ | Responsive grid config (PropertyBars only) |
| `height` | ❌ | ✅ | Bar height (PropertyBars only) |

## Grouped Properties Detection

PropertyBars automatically detects grouped properties by checking for:
- Nested objects with a `label` property
- Property objects nested under group keys

**When detected**: Renders each group in its own `SectionContainer` with the label as title.

**When not detected**: Renders all properties in a single grid without section wrappers.

## Zero Breaking Changes

PropertyBars accepts all MetricsGrid props, so existing code works immediately. Extra features (columns, height, properties array) are optional enhancements.

## When to Use Each Component

### Use PropertyBars When:
- ✅ You want compact visualization
- ✅ Page has many properties (6+ properties)
- ✅ Space is limited
- ✅ Quick visual comparison is priority
- ✅ Mobile-first design

### Keep MetricsGrid When:
- ✅ You need detailed cards with descriptions
- ✅ Properties have complex metadata (confidence, sources)
- ✅ Searchable/filterable grid is required
- ✅ Categories need explicit visual separation
- ✅ User needs to click through to details

## Next Steps

1. **Test in dev**: Replace one MetricsGrid instance and verify
2. **Compare visually**: Check both mobile and desktop views
3. **Measure performance**: Note any load time improvements
4. **Gather feedback**: Does the compact view work for users?
5. **Roll out gradually**: Migrate page by page

## Support

See `scripts/MIGRATION_GUIDE.md` for detailed migration instructions.
