# MetricsCard Search Functionality

The MetricsCard component now supports automatic search functionality when clicking on metric values.

## Usage

### Basic Searchable MetricsCard

```tsx
import { MetricsCard } from './components/MetricsCard/MetricsCard';

// Property-based search (for property keywords like "temperature", "pressure", etc.)
<MetricsCard
  title="Thermal Conductivity"
  value={150}
  unit="W/mK" 
  color="#4F46E5"
  searchable={true}
/>
// Clicking will navigate to: /search?property=Thermal%20Conductivity&value=150

// General search (for non-property values)
<MetricsCard
  title="Material Grade"
  value="Al6061"
  color="#10B981"
  searchable={true}
/>
// Clicking will navigate to: /search?q=Al6061
```

### Search URL Generation Logic

The component automatically determines the best search strategy:

1. **Property Search**: If the title contains property keywords (`temperature`, `pressure`, `density`, `conductivity`, `strength`, `modulus`, `hardness`, `coefficient`), it generates a property-based search URL
2. **General Search**: For other titles, it generates a general search query

### Override with Custom href

```tsx
<MetricsCard
  title="Temperature"
  value={500}
  unit="°C"
  color="#4F46E5"
  href="/custom-page"  // Custom href takes priority
  searchable={true}    // This will be ignored
/>
```

### Non-clickable Cards

```tsx
<MetricsCard
  title="Temperature"
  value={500}
  unit="°C"
  color="#4F46E5"
  searchable={false}  // Default behavior - not clickable
/>
```

## Features

- **Smart URL Generation**: Automatically chooses between property-based and general search
- **Value Cleaning**: Removes special characters from search values
- **Hover Effects**: Visual feedback for clickable cards
- **Accessibility**: Includes helpful title attributes
- **Backward Compatibility**: Existing MetricsCard usage remains unchanged

## Property Keywords

The following keywords in the title trigger property-based search:
- temperature
- pressure  
- density
- conductivity
- strength
- modulus
- hardness
- coefficient

All other titles use general search functionality.