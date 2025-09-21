# Settings Component API Documentation

## Overview

The Settings component provides a modular solution for displaying machine parameters and laser settings in an organized, tabular format. This component is designed to work independently from caption content, achieving clean separation of concerns.

**Key Features:**
- **Table Component Consistency**: Settings component uses identical markup and styling patterns as the Table component for seamless visual integration
- **Unified Styling**: All table elements (thead, th, tbody, td) match Table component styling exactly
- **Responsive Design**: Inherited responsive behavior from Table component with proper mobile handling
- **Dark Mode Support**: Complete dark mode compatibility using Table component color schemes
- **Sectioned Display**: Support for multiple parameter groups with consistent visual treatment

## Component API

### Settings Component

```typescript
import { Settings } from 'app/components/Settings';

interface SettingsProps {
  settingsData: {
    content: string;
    config?: {
      showHeader?: boolean;
      caption?: string;
      className?: string;
      [sectionName: string]: any;
    };
  } | null;
}
```

### Usage Examples

#### Basic Usage
```typescript
// Load settings data
const settingsData = await loadComponent('settings', 'steel-laser-cleaning');

// Render settings component
<Settings settingsData={settingsData} />
```

#### With Layout Integration
```typescript
import { UniversalLayout } from 'app/components/Layout/Layout';
import { Settings } from 'app/components/Settings';

export default function MaterialPage({ slug }: { slug: string }) {
  const settingsData = await loadComponent('settings', slug);
  
  return (
    <UniversalLayout title="Machine Settings" slug={slug}>
      <Settings settingsData={settingsData} />
    </UniversalLayout>
  );
}
```

## ContentAPI Integration

### Settings Processing

The contentAPI automatically processes settings YAML files and converts them to formatted markdown tables.

```typescript
// ContentAPI method for settings
async function loadComponent(
  componentType: 'settings',
  slug: string,
  options?: { convertMarkdown?: boolean }
): Promise<{
  content: string;
  config: any;
} | null>
```

### YAML Structure

Settings files follow a sectioned structure for organized display:

```yaml
# Basic power parameters
power_section:
  power: "100-500W"
  wavelength: "1064nm"
  energy_density: "1.0-10 J/cm²"

# Speed and timing parameters  
speed_section:
  scanning_speed: "100-5000 mm/s"
  frequency: "20-100kHz"
  pulse_duration: "10-200ns"

# Optional beam parameters
beam_section:
  spot_size: "0.1-1.0mm"
  beam_profile: "Top-hat or Gaussian"
```

### Flat Structure Support

The component also supports flat YAML structures:

```yaml
power: "100-500W"
wavelength: "1064nm"
scanning_speed: "100-5000 mm/s"
frequency: "20-100kHz"
```

## Generated Output

### Sectioned Display

For sectioned YAML, the component generates:

```markdown
## Power Section

| Parameter | Value |
|-----------|-------|
| power | 100-500W |
| wavelength | 1064nm |
| energy_density | 1.0-10 J/cm² |

## Speed Section

| Parameter | Value |
|-----------|-------|
| scanning_speed | 100-5000 mm/s |
| frequency | 20-100kHz |
| pulse_duration | 10-200ns |
```

### Flat Display

For flat YAML, the component generates:

```markdown
| Parameter | Value |
|-----------|-------|
| power | 100-500W |
| wavelength | 1064nm |
| scanning_speed | 100-5000 mm/s |
| frequency | 20-100kHz |
```

## File Structure

### Settings Component Files

```
app/components/Settings/
├── Settings.tsx        # Main component
├── styles.css         # Component styling
└── index.ts           # Export configuration
```

### Content Files

```
content/components/settings/
├── steel-laser-cleaning.yaml
├── aluminum-laser-cleaning.yaml
├── copper-laser-cleaning.yaml
└── [material]-laser-cleaning.yaml
```

## CSS Classes

The Settings component uses identical styling to the Table component for visual consistency:

### Table Structure Classes
- `.settings-section-group` - Section container (matches `.table-section-group` behavior)
- `.table-container` - Table wrapper with overflow handling
- `thead` - Header styling with `#f9fafb` background (`#1f2937` in dark mode)
- `th` - Header cell styling with proper typography and spacing
- `tbody` - Body styling with white background (`#111827` in dark mode)
- `td` - Data cell styling with consistent padding and borders

### Visual Enhancement Classes
- `.parameter-value` - Highlighted parameter values
- `.category-badge` - Category badges with proper styling
- Hover effects with smooth transitions
- Responsive design with mobile-first approach

### Style Inheritance
The Settings component inherits all visual characteristics from the Table component including:
- Border collapse and table layout
- Typography scales and font weights
- Color schemes for light and dark modes
- Spacing and padding consistency
- Responsive behavior patterns

## Error Handling

### Null Data Handling
```typescript
// Component handles null settings data gracefully
<Settings settingsData={null} />
// Renders: "No settings data available"
```

### Missing Files
```typescript
// ContentAPI returns null for missing files
const settingsData = await loadComponent('settings', 'non-existent');
// settingsData will be null
```

### Malformed YAML
```typescript
// ContentAPI handles YAML parsing errors gracefully
// Returns null on parsing failures
```

## Testing

### Unit Tests
```typescript
// Test settings component rendering
import { render, screen } from '@testing-library/react';
import { Settings } from 'app/components/Settings';

test('renders settings with data', () => {
  const mockData = {
    content: '## Power\n| power | 100W |',
    config: { power_section: { power: '100W' } }
  };
  
  render(<Settings settingsData={mockData} />);
  expect(screen.getByText('Machine Settings')).toBeTruthy();
});
```

### Integration Tests
```typescript
// Test contentAPI settings processing
import { loadComponent } from 'app/utils/contentAPI';

test('processes settings YAML correctly', async () => {
  const result = await loadComponent('settings', 'test-settings');
  expect(result).toHaveProperty('content');
  expect(result).toHaveProperty('config');
});
```

## Migration from Legacy System

### Before (Caption with embedded parameters)
```yaml
before_text: "Surface contamination visible"
after_text: "Surface restored to pristine condition"

laser_parameters:
  power: "100-500W"
  wavelength: "1064nm"
  frequency: "20-100kHz"
```

### After (Separated components)

**Caption file (caption/steel-laser-cleaning.yaml):**
```yaml
before_text: "Surface contamination visible"
after_text: "Surface restored to pristine condition"
```

**Settings file (settings/steel-laser-cleaning.yaml):**
```yaml
power_section:
  power: "100-500W"
  wavelength: "1064nm"
  frequency: "20-100kHz"
```

## Best Practices

1. **Use sectioned YAML** for complex parameter sets
2. **Group related parameters** into logical sections
3. **Include units** in parameter values (e.g., "100W", "1064nm")
4. **Use consistent naming** across material files
5. **Test with null data** to ensure graceful handling
6. **Validate YAML structure** before deployment

## Related Documentation

- [README.md](../README.md) - Project overview and Settings architecture
- [Component Tests](../tests/components/Settings.test.tsx) - Test examples
- [ContentAPI Tests](../tests/utils/contentAPI.test.js) - API testing
- [Layout Integration](../tests/components/Layout.test.tsx) - Layout component tests
