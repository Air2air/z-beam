# DataMetrics Component Documentation

## Overview

The DataMetrics component is a unified, intelligent metrics display component that automatically handles all types of data visualization in the Z-Beam application. It replaces the previous separate components (MetricsCard, DataMetricsGrid, StatCard) with a single, smart interface.

## Key Features

- **🧠 Intelligent Mode Detection**: Automatically selects the best display format based on data type
- **📊 Multi-Format Support**: Handles quality metrics, statistical data, and metadata properties  
- **⚡ Performance Optimized**: Smart limiting and responsive layouts
- **🎯 Type-Safe**: Full TypeScript support with comprehensive error handling
- **♿ Accessible**: Proper semantic structure and keyboard navigation support

## Installation & Usage

```typescript
import { DataMetrics } from '@/app/components/DataMetrics';

// Basic usage with auto-detection
<DataMetrics />

// Advanced usage with customization
<DataMetrics 
  mode="auto"
  title="Material Properties & Specifications"
  maxCards={8}
  layout="auto"
  showTitle={true}
  className="custom-metrics"
/>
```

## Component Props

```typescript
interface DataMetricsProps {
  mode?: 'auto' | 'grid' | 'stats' | 'cards';  // Display mode
  title?: string;                               // Optional section title
  maxCards?: number;                           // Limit number of cards displayed
  layout?: 'auto' | 'grid' | 'flex';          // Layout strategy
  showTitle?: boolean;                         // Show/hide title
  className?: string;                          // Additional CSS classes
  qualityMetrics?: QualityMetric[];           // Manual quality data
  statisticalData?: StatisticalDataItem[];    // Manual stats data
  metadata?: Record<string, any>;             // Manual metadata
}
```

## Display Modes

### Auto Mode (Recommended)
```typescript
<DataMetrics mode="auto" />
```
Automatically detects the best display format based on available data:
- **Quality Metrics Present** → Grid layout with metric cards
- **Statistical Data Present** → Stats layout with trend indicators  
- **Metadata Present** → Cards layout with property information

### Grid Mode
```typescript
<DataMetrics mode="grid" qualityMetrics={qualityData} />
```
Displays quality metrics in a responsive grid:
- Surface quality measurements
- Contamination removal rates
- Process efficiency indicators

### Stats Mode  
```typescript
<DataMetrics mode="stats" statisticalData={statsData} />
```
Shows statistical data with trend analysis:
- Change indicators (↑/↓)
- Percentage improvements
- Historical comparisons

### Cards Mode
```typescript
<DataMetrics mode="cards" metadata={materialData} />
```
Renders metadata as property cards:
- Material specifications
- Technical parameters
- Confidence scores and ranges

## Data Processing

The component intelligently processes three types of data:

### Quality Metrics Data Structure
```typescript
interface QualityMetric {
  name: string;
  value: number | string;
  unit?: string;
  status?: 'good' | 'warning' | 'error';
  description?: string;
}
```

### Statistical Data Structure
```typescript
interface StatisticalDataItem {
  name: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
}
```

### Metadata Structure
```typescript
interface PropertyData {
  value: string | number;
  unit?: string;
  confidence?: number;
  description?: string;
  min?: number;
  max?: number;
}
```

## Layout Integration

### In Layout.tsx
```typescript
import { DataMetrics } from '@/app/components/DataMetrics';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Single unified metrics section */}
      <DataMetrics 
        mode="auto"
        title="Material Properties & Specifications"
        maxCards={8}
        layout="auto"
      />
      {children}
    </div>
  );
}
```

## Performance Considerations

- **Smart Limiting**: Use `maxCards` prop to prevent performance issues with large datasets
- **Responsive Design**: Component automatically adapts to screen sizes
- **Memoization**: Expensive calculations are cached for better performance
- **Lazy Loading**: Large datasets are processed incrementally

## Error Handling

The component includes comprehensive error boundaries and graceful degradation:

```typescript
// Handles missing data
<DataMetrics mode="auto" />  // Shows empty state gracefully

// Handles malformed data
<DataMetrics qualityMetrics={badData} />  // Filters invalid entries

// Handles API failures
<DataMetrics />  // Shows fallback content
```

## Migration Guide

### From MetricsCard
```typescript
// OLD
<MetricsCard data={metadata} />

// NEW  
<DataMetrics mode="cards" metadata={metadata} />
// OR (recommended)
<DataMetrics mode="auto" />  // Auto-detects cards mode
```

### From DataMetricsGrid
```typescript
// OLD
<DataMetricsGrid qualityMetrics={quality} />

// NEW
<DataMetrics mode="grid" qualityMetrics={quality} />
// OR (recommended)  
<DataMetrics mode="auto" />  // Auto-detects grid mode
```

### From StatCard
```typescript
// OLD
<StatCard statisticalData={stats} />

// NEW
<DataMetrics mode="stats" statisticalData={stats} />
// OR (recommended)
<DataMetrics mode="auto" />  // Auto-detects stats mode
```

## Testing

Comprehensive test coverage includes:

- **Null Safety**: Handles undefined/null data gracefully
- **Mode Detection**: Correctly identifies optimal display format
- **Data Processing**: Properly formats different value types
- **Error Handling**: Manages malformed or missing data
- **Accessibility**: Screen reader and keyboard navigation support
- **Performance**: Memory leak prevention and optimization

```bash
npm test -- tests/components/DataMetrics.test.tsx
```

## Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **High Contrast**: Supports system color preferences
- **Focus Management**: Proper focus indicators and management

## Advanced Usage

### Custom Data Processing
```typescript
// Process data before passing to component
const processedData = qualityMetrics.map(metric => ({
  ...metric,
  status: metric.value > threshold ? 'good' : 'warning'
}));

<DataMetrics mode="grid" qualityMetrics={processedData} />
```

### Conditional Rendering
```typescript
// Show different modes based on user preferences
const mode = user.preferredView || 'auto';
<DataMetrics mode={mode} />
```

### Integration with Content API
```typescript
// Automatic data loading from YAML files
import { getDataMetrics } from '@/app/utils/contentAPI';

const MetricsSection = async () => {
  const data = await getDataMetrics();
  return <DataMetrics mode="auto" {...data} />;
};
```

## Architecture Benefits

- **✅ Unified Interface**: Single component for all metrics display needs
- **✅ Intelligent Automation**: Smart mode detection reduces developer decisions
- **✅ Type Safety**: Full TypeScript support with comprehensive interfaces
- **✅ Performance Optimized**: Built-in optimizations and lazy loading
- **✅ Accessible**: WCAG compliant with full screen reader support
- **✅ Maintainable**: Single component reduces code duplication and complexity

## Support

For issues or questions:
1. Check the test files for usage examples
2. Review the component source code for implementation details  
3. Refer to the main README.md for project-wide architecture information

---

*Last updated: Component consolidation completed - All 29 tests passing*