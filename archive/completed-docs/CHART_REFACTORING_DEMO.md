# Chart Utility Refactoring Demo

## 🔧 **BEFORE** - Duplicated Code (60+ instances across MDX files)

```jsx
// Every single chart in every MDX file had this repeated code:
<ChartComponent
  chartId="chartContaminantImpactTin"
  chartType="bar"
  data={{
    labels: ["Tin Oxide", "Machining Oils", "Fingerprints", "Atmospheric Dust"],
    datasets: [{
      label: 'Impact on Performance',
      data: [80, 60, 40, 20],
      backgroundColor: Array.from({length: 4}, (_, i) => { const t = i / 3; if (t < 0.5) { const alpha = 0.6 - 0.3 * (t / 0.5); return `rgba(255,255,255,${alpha})`; } else { const alpha = 0.3 + 0.3 * ((t - 0.5) / 0.5); return `rgba(80,80,80,${alpha})`; } }),
      borderColor: Array.from({length: 4}, (_, i) => { const t = i / 3; if (t < 0.5) { const alpha = 0.6 - 0.3 * (t / 0.5); return `rgba(255,255,255,${alpha})`; } else { const alpha = 0.3 + 0.3 * ((t - 0.5) / 0.5); return `rgba(80,80,80,${alpha})`; } }),
      borderWidth: 0
    }]
  }}
  options={{
    scales: {
      y: {
        title: { text: 'Impact on Performance' },
      },
    },
  }}
/>
```

**Problems:**
- 120+ characters of duplicated color generation logic per chart
- ~60 charts = 7,200+ characters of duplicate code
- Hard to maintain - changes require updating every file
- Prone to copy/paste errors
- No consistency guarantees

---

## ✅ **AFTER** - Clean Utility-Based Approach

### Option 1: Simple Color Generation
```jsx
import { generateChartColors } from '../utils/chart';

<ChartComponent
  chartId="chartContaminantImpactTin"
  chartType="bar"
  data={{
    labels: ["Tin Oxide", "Machining Oils", "Fingerprints", "Atmospheric Dust"],
    datasets: [{
      label: 'Impact on Performance',
      data: [80, 60, 40, 20],
      backgroundColor: generateChartColors(4),
      borderColor: generateChartColors(4),
      borderWidth: 0
    }]
  }}
  options={{
    scales: {
      y: {
        title: { text: 'Impact on Performance' },
      },
    },
  }}
/>
```

### Option 2: Pre-built Chart Helper
```jsx
import { createContaminantImpactChart } from '../utils/chart';

<ChartComponent
  chartId="chartContaminantImpactTin"
  chartType="bar"
  {...createContaminantImpactChart(
    ["Tin Oxide", "Machining Oils", "Fingerprints", "Atmospheric Dust"],
    [80, 60, 40, 20],
    'Impact on Performance'
  )}
/>
```

### Option 3: Enhanced Component with Auto-Styling
```jsx
<EnhancedChartComponent
  chartId="chartContaminantImpactTin"
  chartType="bar"
  useStandardColors={true}
  data={{
    labels: ["Tin Oxide", "Machining Oils", "Fingerprints", "Atmospheric Dust"],
    datasets: [{
      label: 'Impact on Performance',
      data: [80, 60, 40, 20]
      // Colors automatically applied!
    }]
  }}
  options={{
    scales: {
      y: {
        title: { text: 'Impact on Performance' },
      },
    },
  }}
/>
```

---

## 📊 **Impact Summary**

### **Code Reduction:**
- **Before**: ~120 characters of duplicated logic per chart
- **After**: ~20 characters for color generation
- **Savings**: ~100 characters per chart × 60 charts = **6,000+ characters eliminated**

### **Maintainability:**
- **Single source of truth** for color generation
- **Consistent styling** across all charts
- **Easy to modify** color schemes globally
- **Type-safe** utility functions
- **Reusable patterns** for common chart types

### **Developer Experience:**
- **Faster development** - no copy/paste required
- **Fewer errors** - no manual color calculation mistakes
- **Better readability** - focus on data, not styling
- **Consistent results** - same visual style everywhere

---

## 🚀 **Available Utilities**

```typescript
// Color generation
generateChartColors(length?: number): string[]
generateChartBorderColors(length?: number): string[]

// Dataset creation
createChartDataset(label: string, data: number[], length?: number)
createChartData(labels: string[], datasets: Array<{label: string, data: number[]}>)

// Pre-built chart types
createEffectivenessChart(customData?: number[])
createRiskComparisonChart(customData?: number[])
createContaminantImpactChart(labels: string[], data: number[], yAxisTitle?: string)

// Standard configurations
CHART_DEFAULTS.colors
CHART_DEFAULTS.options
CLEANING_COMPARISON_DATA
```

This refactoring eliminates massive code duplication while providing a clean, maintainable, and consistent approach to chart styling across the entire Z-Beam website.
