# Frontmatter Display Components

**Created**: 2025-10-23  
**Purpose**: Display comprehensive frontmatter data from material pages

## Overview

Three new components have been created to display previously unused frontmatter sections:

1. **RegulatoryStandards** - Displays compliance information with official logos
2. **ApplicationsList** - Shows industry applications with visual badges
3. **EnvironmentalImpact** - Renders environmental and safety metrics

These components are automatically integrated into the Layout component and will display when the corresponding frontmatter data is present.

## Components

### 1. RegulatoryStandards

**Location**: `app/components/RegulatoryStandards/RegulatoryStandards.tsx`

**Purpose**: Displays regulatory standards and compliance information with official logos and links to documentation.

**Props**:
```typescript
interface RegulatoryStandardsProps {
  standards: RegulatoryStandard[];  // Array of standards from frontmatter
  className?: string;                // Optional CSS classes
  showTitle?: boolean;               // Show section title (default: true)
  title?: string;                    // Custom title (default: "Regulatory Standards & Compliance")
}

interface RegulatoryStandard {
  name: string;         // Standard name (e.g., "ANSI", "IEC")
  description: string;  // Full description
  url: string;          // Official documentation URL
  image: string;        // Logo path
}
```

**Features**:
- Displays standards in a responsive 2-column grid
- Shows official logos using Next.js Image optimization
- Links to official documentation (opens in new tab)
- Includes trust signal footer about compliance
- Fully accessible with proper ARIA labels

**Usage in Layout**:
```tsx
{metadata?.regulatoryStandards && metadata.regulatoryStandards.length > 0 && (
  <section aria-labelledby="regulatory-standards-section" className="my-8">
    <RegulatoryStandards standards={metadata.regulatoryStandards} />
  </section>
)}
```

**Frontmatter Structure**:
```yaml
regulatoryStandards:
  - name: ANSI
    description: ANSI Z136.1 - Safe Use of Lasers standard
    url: https://webstore.ansi.org/standards/lia/ansiz1362014
    image: /images/logo/logo-org-ansi.png
  - name: IEC
    description: IEC 60825-1 - Safety of laser products
    url: https://webstore.iec.ch/publication/3587
    image: /images/logo/logo-org-iec.png
```

### 2. ApplicationsList

**Location**: `app/components/ApplicationsList/ApplicationsList.tsx`

**Purpose**: Displays industry applications and use cases as visual badges with icons.

**Props**:
```typescript
interface ApplicationsListProps {
  applications: string[];  // Array of application names
  className?: string;      // Optional CSS classes
  showTitle?: boolean;     // Show section title (default: true)
  title?: string;          // Custom title (default: "Industry Applications")
  materialName?: string;   // Material name for subtitle
}
```

**Features**:
- Responsive grid layout (2-5 columns based on screen size)
- Industry-specific emoji icons (✈️ Aerospace, 🚗 Automotive, etc.)
- Hover effects with scale and shadow transitions
- Shows application count below grid
- Blue gradient background for visual appeal

**Icon Mapping**:
- Aerospace/Aviation → ✈️
- Automotive/Vehicle → 🚗
- Medical/Healthcare → ⚕️
- Electronics/Electrical → ⚡
- Marine/Ship → ⚓
- Architecture/Construction → 🏗️
- Art/Sculpture → 🎨
- Energy/Power → ⚡
- Manufacturing/Industrial → 🏭
- Packaging → 📦
- Food/Beverage → 🍽️
- Defense/Military → 🛡️
- Default → 🔧

**Usage in Layout**:
```tsx
{metadata?.applications && metadata.applications.length > 0 && (
  <section aria-labelledby="applications-section" className="my-8">
    <ApplicationsList 
      applications={metadata.applications} 
      materialName={metadata?.name || materialName}
    />
  </section>
)}
```

**Frontmatter Structure**:
```yaml
applications:
  - Aerospace
  - Automotive
  - Medical
  - Electronics
  - Marine
  - Architecture
```

### 3. EnvironmentalImpact

**Location**: `app/components/EnvironmentalImpact/EnvironmentalImpact.tsx`

**Purpose**: Displays environmental impact metrics including emissions, energy consumption, and safety data.

**Props**:
```typescript
interface EnvironmentalImpactProps {
  environmentalImpact: {
    [categoryKey: string]: PropertyCategory;  // Categorized metrics
  };
  className?: string;      // Optional CSS classes
  showTitle?: boolean;     // Show section title (default: true)
  title?: string;          // Custom title
  layout?: 'grid' | 'auto' | 'compact';  // Grid layout style
}
```

**Features**:
- Categorized metrics with colored headers
- Category icons (💨 Emissions, ⚡ Energy, 🛡️ Safety, ♻️ Waste, 🌍 General)
- Uses MetricsCard component for individual metrics
- Responsive grid layout
- Sustainability footer with environmental commitment message
- Color-coded categories for visual distinction

**Category Icons & Colors**:
- Emissions → 💨 (orange)
- Energy → ⚡ (yellow)
- Safety → 🛡️ (green)
- Waste → ♻️ (blue)
- Default → 🌍 (emerald)

**Usage in Layout**:
```tsx
{metadata?.environmentalImpact && Object.keys(metadata.environmentalImpact).length > 0 && (
  <section aria-labelledby="environmental-impact-section" className="my-8">
    <EnvironmentalImpact environmentalImpact={metadata.environmentalImpact} />
  </section>
)}
```

**Frontmatter Structure**:
```yaml
environmentalImpact:
  emission_metrics:
    label: Emission Metrics
    description: Particulate and VOC emissions
    particulateEmission:
      value: 0.5
      min: 0.1
      max: 2.0
      unit: mg/m³
      research_basis: environmental_monitoring_studies
    volatileOrganicCompounds:
      value: 0.2
      min: 0.05
      max: 1.0
      unit: ppm
      research_basis: environmental_monitoring_studies
  
  energy_consumption:
    label: Energy Consumption
    description: Power usage and efficiency
    energyConsumption:
      value: 1.5
      unit: kWh/m²
    energyEfficiency:
      value: 85.0
      unit: "%"
  
  safety_metrics:
    label: Safety Metrics
    description: Operator safety limits
    noiseLevel:
      value: 75.0
      unit: dB
```

## Integration in Layout

All three components are integrated into `app/components/Layout/Layout.tsx` in the `ArticleHeader` section. They render conditionally when the corresponding frontmatter data exists:

```tsx
// In ArticleHeader component
{metadata?.applications && metadata.applications.length > 0 && (
  <section aria-labelledby="applications-section" className="my-8">
    <ApplicationsList 
      applications={metadata.applications} 
      materialName={metadata?.name || materialName}
    />
  </section>
)}

{metadata?.regulatoryStandards && metadata.regulatoryStandards.length > 0 && (
  <section aria-labelledby="regulatory-standards-section" className="my-8">
    <RegulatoryStandards standards={metadata.regulatoryStandards} />
  </section>
)}

{metadata?.environmentalImpact && Object.keys(metadata.environmentalImpact).length > 0 && (
  <section aria-labelledby="environmental-impact-section" className="my-8">
    <EnvironmentalImpact environmentalImpact={metadata.environmentalImpact} />
  </section>
)}
```

## Display Order in Material Pages

The components appear in this order on material pages:

1. **Hero Image** (images.hero)
2. **Title & Subtitle**
3. **Author Info**
4. **Material Properties** (MetricsGrid - materialProperties)
5. **Machine Settings** (MetricsGrid - machineSettings)
6. **Caption** (images.micro with before/after text)
7. **Applications List** ← NEW
8. **Regulatory Standards** ← NEW
9. **Environmental Impact** ← NEW
10. **Main Content** (markdown)
11. **Tables**
12. **Tags**

## Testing

A test page has been created at `/test-frontmatter-components` to verify component rendering with sample data.

**Test URL**: `http://localhost:3000/test-frontmatter-components`

## Data Coverage

Based on the frontmatter analysis:

- **Regulatory Standards**: All 132 material files have 2 standards (ANSI, IEC)
- **Applications**: All 132 files have 6-12 applications
- **Environmental Impact**: All 132 files have comprehensive environmental data

## Styling & Design

All components follow the existing design system:

- **Dark mode support** via Tailwind dark: classes
- **Responsive design** with mobile-first approach
- **Consistent spacing** using my-8 section spacing
- **Color palette** matching existing components
- **Hover effects** for interactive elements
- **Accessibility** with proper ARIA labels and semantic HTML

## Future Enhancements

Potential improvements:

1. **Filtering**: Add ability to filter applications by category
2. **Comparison**: Compare environmental impact across materials
3. **Charts**: Visualize environmental metrics with charts
4. **Export**: Allow downloading standards documentation
5. **Analytics**: Track which applications/standards users interact with

## Files Created

```
app/components/RegulatoryStandards/
├── RegulatoryStandards.tsx
└── index.ts

app/components/ApplicationsList/
├── ApplicationsList.tsx
└── index.ts

app/components/EnvironmentalImpact/
├── EnvironmentalImpact.tsx
└── index.ts

app/test-frontmatter-components/
└── page.tsx
```

## Modified Files

```
app/components/Layout/Layout.tsx
├── Added imports for new components
└── Added conditional rendering sections
```

## Accessibility

All components include:

- ✅ Proper heading hierarchy
- ✅ ARIA labels for sections
- ✅ Semantic HTML5 elements
- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ Focus indicators
- ✅ Color contrast compliance

## Performance

- **Code splitting**: Components are lazy-loaded via Next.js
- **Image optimization**: Uses Next.js Image component
- **Conditional rendering**: Only renders when data exists
- **CSS-in-JS**: Uses Tailwind for minimal CSS overhead
- **No external dependencies**: Uses existing project components

## Conclusion

These three components unlock comprehensive frontmatter data that was previously not displayed, providing users with:

1. **Transparency**: Clear compliance and safety information
2. **Context**: Industry applications showing real-world use cases
3. **Trust**: Environmental metrics demonstrating sustainability
4. **Authority**: Official standards with links to documentation

All components are production-ready, fully accessible, and integrated into the existing material page template.
