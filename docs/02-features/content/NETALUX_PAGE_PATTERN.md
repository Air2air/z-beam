# Netalux Equipment Page Pattern

This document describes the pattern used for equipment pages with interleaved content cards and specification tables, as demonstrated by the Netalux page.

## Overview

The Netalux page pattern combines:
- **ContentCards**: Rich descriptive content with images
- **ComparisonTable**: Side-by-side model comparisons
- **SmartTable**: Individual equipment specifications
- **StaticPage**: Intelligent layout that interleaves cards and tables

## Page Structure

```
┌─────────────────────────────────┐
│  Hero Section (title/subtitle)  │
├─────────────────────────────────┤
│  Needle® ContentCard            │ ← Equipment description
├─────────────────────────────────┤
│  Needle® Comparison Table       │ ← Model specifications
├─────────────────────────────────┤
│  Jango® ContentCard             │ ← Equipment description
├─────────────────────────────────┤
│  Jango® Specifications Table    │ ← Technical specs
├─────────────────────────────────┤
│  About Netalux ContentCard      │ ← Company info
└─────────────────────────────────┘
```

## YAML Structure

### Complete Page Configuration

```yaml
# static-pages/netalux.yaml
title: "Netalux Laser Cleaning Equipment"
description: "Award-winning precision laser cleaning systems"
slug: "netalux"

# Model 1 specifications
needle100_150:
  materialProperties:
    laserType: "Nano-second pulsed ytterbium fiber laser"
    wavelength: "1064 nm"
    laserClass: "Class 4"
    beamShape: "Gaussian"
    coolingSystem: "Air cooled"
  machineSettings:
    averagePower: "100W / 150W"
    totalWeight: "20 kg (44 lb)"
    fiberLength: "4.5 m"
  applications: "Weld cleaning, small parts"

# Model 2 specifications
needle200_300:
  materialProperties:
    laserType: "Nano-second pulsed ytterbium fiber laser"
    wavelength: "1064 nm"
    laserClass: "Class 4"
    beamShape: "Gaussian"
    coolingSystem: "Air cooled"
  machineSettings:
    averagePower: "200W / 300W"
    totalWeight: "43 kg (95 lb)"
    fiberLength: "5.7 m"
  applications: "Higher power applications"

# Single equipment specifications
jangoSpecs:
  materialProperties:
    laserType: "Nano-second pulsed ytterbium fiber laser"
    wavelength: "1064 nm"
    beamShape: "Top hat"
    coolingSystem: "Water cooled"
  machineSettings:
    averagePower: "7500 W"
    totalWeight: "850 kg (1874 lb)"
    fiberLength: "50 m"
  applications: "Large-scale industrial cleaning"

# Content cards
contentCards:
  - order: 1
    heading: "Needle® - Precision Laser Cleaning"
    text: "Detailed equipment description..."
    image:
      url: "/images/partners/partner-netalux.webp"
      alt: "Netalux Needle system"
    imagePosition: "right"
    details:
      - "Power Range: 100W - 300W"
      - "Beam Shape: Gaussian (precision)"
      - "Cooling: Air-cooled"
    
  - order: 2
    heading: "Jango® - Industrial Power"
    text: "Detailed equipment description..."
    image:
      url: "/images/partners/partner-netalux.webp"
      alt: "Netalux Jango system"
    imagePosition: "left"
    details:
      - "Power: 7,500W"
      - "Beam Shape: Top-Hat"
      - "Cooling: Water-cooled"
    
  - order: 3
    heading: "About Netalux"
    text: "Company description..."
    imagePosition: "right"
```

## Page Component

```tsx
// app/netalux/page.tsx
import { StaticPage } from '@/app/components/StaticPage/StaticPage';

export const metadata = {
  title: 'Netalux Laser Cleaning Equipment | Z-Beam',
  description: 'Award-winning Netalux laser cleaning systems...'
};

export default async function NetaluxPage() {
  return (
    <StaticPage 
      slug="netalux"
      fallbackTitle="Netalux Equipment"
      fallbackDescription="Laser cleaning systems"
    />
  );
}
```

## StaticPage Logic

The StaticPage component automatically:

1. **Identifies equipment cards** by heading text (contains "Needle" or "Jango")
2. **Interleaves cards with tables**:
   - Needle card → Needle comparison table
   - Jango card → Jango specs table
   - Other cards → Render after equipment sections

```tsx
// Simplified StaticPage logic
const needleCard = contentCards.find(card => card.heading?.includes('Needle'));
const jangoCard = contentCards.find(card => card.heading?.includes('Jango'));
const otherCards = contentCards.filter(/* not equipment */);

return (
  <>
    {/* Needle Section */}
    {needleCard && (
      <>
        <ContentSection items={[needleCard]} />
        <ComparisonTable 
          model1Data={needle100_150}
          model2Data={needle200_300}
        />
      </>
    )}
    
    {/* Jango Section */}
    {jangoCard && (
      <>
        <ContentSection items={[jangoCard]} />
        <Table frontmatterData={jangoSpecs} />
      </>
    )}
    
    {/* Other cards */}
    <ContentSection items={otherCards} />
  </>
);
```

## Key Components

### 1. ComparisonTable
For side-by-side model comparisons:

```tsx
<ComparisonTable
  title="Needle® Model Comparison"
  model1Data={needle100_150}
  model2Data={needle200_300}
  model1Name="Needle® 100/150"
  model2Name="Needle® 200/300"
/>
```

Features:
- Three columns: Property | Model 1 | Model 2
- Groups properties by section (Material Properties, Machine Settings, etc.)
- Filters metadata fields
- Shows values side-by-side

### 2. SmartTable
For single equipment specifications:

```tsx
<Table 
  frontmatterData={jangoSpecs}
  config={{
    micro: "Jango® Specifications"
  }}
/>
```

Features:
- Two columns: Property | Value
- Flattens nested objects
- Filters metadata fields
- Clean, simple display

### 3. ContentCard
For equipment descriptions:

```yaml
- heading: "Needle® - Precision Laser Cleaning"
  text: "Rich descriptive content..."
  image:
    url: "/path/to/image"
    alt: "Description"
  imagePosition: "right"  # or "left"
  details:
    - "Bullet point 1"
    - "Bullet point 2"
```

## Data Structure Guidelines

### Comparison Models
When creating comparison data, structure both models identically:

```yaml
model1:
  materialProperties:
    property1: "value1a"
    property2: "value2a"
  machineSettings:
    setting1: "value1a"
    setting2: "value2a"

model2:
  materialProperties:
    property1: "value1b"
    property2: "value2b"
  machineSettings:
    setting1: "value1b"
    setting2: "value2b"
```

### Single Equipment
For single equipment, use descriptive field names:

```yaml
equipment:
  materialProperties:
    laserType: "Type with full description"
    wavelength: "Value with units"
  machineSettings:
    averagePower: "Value with units"
    totalWeight: "Value with units and conversion"
```

### Metadata Fields
These fields are automatically filtered from tables:
- `name`: Use for internal reference
- `category`: Equipment category
- `subcategory`: Equipment type
- `description`: SEO/page description
- `slug`: URL component
- `keywords`: SEO keywords

Use them for page metadata without cluttering tables.

## Styling and Layout

### Image Positioning
Alternate image positions for visual interest:
- Needle: `imagePosition: "right"`
- Jango: `imagePosition: "left"`
- About: `imagePosition: "right"`

### Section Spacing
Tables have automatic spacing (`my-12` class) between cards.

### Responsive Behavior
- Tables scroll horizontally on mobile
- ContentCards stack on mobile
- Images resize responsively

## Use Cases

### Equipment Manufacturer Pages
Perfect for:
- Multiple product lines
- Model comparisons
- Detailed specifications
- Company information

### Product Family Pages
Use for:
- Portable vs Industrial models
- Entry-level vs Professional
- Series comparisons (100/150 vs 200/300)

### Technology Showcase
Ideal for:
- Different beam shapes (Gaussian vs Top-Hat)
- Cooling systems (Air vs Water)
- Power ranges (100W vs 7500W)

## Best Practices

### 1. Consistent Naming
Use the same field names across compared models:
```yaml
# Good
model1:
  materialProperties:
    laserType: "..."
model2:
  materialProperties:
    laserType: "..."

# Bad - different field names
model1:
  materialProperties:
    type: "..."
model2:
  materialProperties:
    laserType: "..."
```

### 2. Complete Data
Provide all fields for both models:
```yaml
# Good - both have all fields
model1:
  materialProperties:
    laserType: "Fiber"
    wavelength: "1064 nm"
model2:
  materialProperties:
    laserType: "Fiber"
    wavelength: "1064 nm"

# Acceptable - missing values show as "—"
model1:
  materialProperties:
    laserType: "Fiber"
model2:
  materialProperties:
    laserType: "Fiber"
    wavelength: "1064 nm"  # Shows "—" for model1
```

### 3. Descriptive ContentCards
Make card headings include equipment names:
- ✅ "Needle® - Precision Laser Cleaning"
- ✅ "Jango® - Industrial Power"
- ❌ "Equipment 1"
- ❌ "Laser System"

### 4. Meaningful Details
Use ContentCard details for key differentiators:
```yaml
details:
  - "Power Range: 100W - 300W"
  - "Beam Shape: Gaussian (precision)"
  - "Cooling: Air-cooled"
  - "Weight: 20-43 kg (portable)"
```

## Troubleshooting

### Cards and tables not interleaving
- Check card headings contain "Needle" or "Jango"
- Verify data field names match (`needle100_150`, `needle200_300`, `jangoSpecs`)

### Comparison table empty
- Ensure both model data objects exist
- Verify fields exist beyond metadata fields
- Check for typos in field names

### Single table not showing
- Verify `jangoSpecs` (or equipment name) is defined
- Check that object has properties beyond metadata
- Ensure nested objects have values

### Wrong card order
- Check `order` field in contentCards
- Verify equipment cards come before "About" card

## Related Documentation

- [SmartTable Usage](../components/SMART_TABLE_USAGE.md)
- [ComparisonTable Tests](../../tests/components/ComparisonTable.test.tsx)
- [StaticPage Component](../../app/components/StaticPage/StaticPage.tsx)
- [ContentCard System](../components/CONTENTCARD_SYSTEM.md)
