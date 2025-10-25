# Smart Table Component - Usage Guide

The Smart Table component provides simplified two-column rendering of frontmatter data with automatic flattening of nested objects.

## Overview

The SmartTable component takes complex nested YAML/frontmatter data and renders it as a clean, simple table with Property and Value columns. It automatically:
- Flattens nested objects into individual rows
- Filters out metadata fields (name, category, subcategory, description, slug, keywords, content)
- Formats field labels in a readable way
- Handles arrays by joining values with commas

## Basic Usage

### In YAML Configuration
```yaml
# content/pages/equipment.yaml
jangoSpecs:
  materialProperties:
    laserType: "Nano-second pulsed ytterbium fiber laser"
    wavelength: "1064 nm"
    laserClass: "Class 4"
    coolingSystem: "Water cooled"
  machineSettings:
    pulseFrequency: "2 - 50 kHz"
    averagePower: "7500 W"
    totalWeight: "850 kg (1874 lb)"
  applications: "Large-scale industrial cleaning"
```

### In Component
```tsx
import { Table } from '@/app/components/Table/Table';

<Table 
  content="" 
  frontmatterData={jangoSpecs} 
  config={{
    caption: "Jango® Specifications"
  }} 
/>
```

## Output Format

The above YAML will render as:

| Property | Value |
|----------|-------|
| Laser Type | Nano-second pulsed ytterbium fiber laser |
| Wavelength | 1064 nm |
| Laser Class | Class 4 |
| Cooling System | Water cooled |
| Pulse Frequency | 2 - 50 kHz |
| Average Power | 7500 W |
| Total Weight | 850 kg (1874 lb) |
| Applications | Large-scale industrial cleaning |

## Features

### 1. Automatic Flattening
Nested objects are automatically flattened into individual rows:

```yaml
specs:
  laser:
    source:
      type: "Fiber"
      power: "200W"
```

Renders as:
- Type: Fiber
- Power: 200W

### 2. Metadata Filtering
These fields are automatically excluded from the table:
- `name`
- `category`
- `subcategory`
- `description`
- `slug`
- `keywords`
- `content`

Use these fields for page metadata without cluttering the table.

### 3. Label Formatting
Field names are automatically converted to readable labels:
- `laserType` → "Laser Type"
- `pulseFrequency` → "Pulse Frequency"
- `total_weight` → "Total Weight"

### 4. Array Handling
Arrays are automatically joined with commas:

```yaml
applications: 
  - "Weld cleaning"
  - "Surface preparation"
  - "Rust removal"
```

Renders as: "Weld cleaning, Surface preparation, Rust removal"

## Configuration Options

```tsx
<Table 
  frontmatterData={data}
  config={{
    caption: "Table Title",      // Optional table caption/title
    showHeader: true,             // Show table headers (default: true)
    className: "custom-class"     // Optional custom CSS class
  }} 
/>
```

## Integration with StaticPage

The SmartTable works seamlessly with StaticPage component:

```tsx
// In StaticPage component
{pageConfig.jangoSpecs && (
  <div className="my-12">
    <Table 
      content="" 
      frontmatterData={pageConfig.jangoSpecs} 
      config={{}} 
    />
  </div>
)}
```

## Comparison Tables

For side-by-side model comparisons, use the ComparisonTable component instead:

```tsx
import { ComparisonTable } from '@/app/components/ComparisonTable/ComparisonTable';

<ComparisonTable
  title="Model Comparison"
  model1Data={needle100Data}
  model2Data={needle200Data}
  model1Name="Needle® 100/150"
  model2Name="Needle® 200/300"
/>
```

See [Comparison Table documentation](./COMPARISON_TABLE_USAGE.md) for details.

## Best Practices

### 1. Structure Your Data Logically
Group related fields under meaningful keys:

```yaml
equipment:
  materialProperties:
    # Laser specifications
  machineSettings:
    # Operating parameters
  applications: "Use cases"
```

### 2. Use Descriptive Field Names
Field names become labels, so use clear, descriptive names:
- ✅ `averagePower` → "Average Power"
- ✅ `coolingSystem` → "Cooling System"
- ❌ `avg_pwr` → "Avg Pwr"

### 3. Keep Values Readable
Format values for end-users:
- ✅ `"850 kg (1874 lb)"`
- ✅ `"2 - 50 kHz"`
- ❌ `850` (missing units)

### 4. Separate Metadata from Specs
Use metadata fields for page info, actual properties for table display:

```yaml
equipment:
  name: "Jango® Industrial System"      # Filtered out
  category: "Laser Cleaning"            # Filtered out
  description: "High-power system..."    # Filtered out
  materialProperties:                    # Displayed in table
    laserType: "Fiber laser"
```

## Common Patterns

### Equipment Specifications
```yaml
equipmentName:
  materialProperties:
    laserType: "..."
    wavelength: "..."
  machineSettings:
    power: "..."
    weight: "..."
  applications: "..."
```

### Material Properties
```yaml
materialName:
  physical:
    density: "..."
    hardness: "..."
  thermal:
    conductivity: "..."
    meltingPoint: "..."
```

### Process Parameters
```yaml
processName:
  laserSettings:
    power: "..."
    speed: "..."
  outcomes:
    quality: "..."
    efficiency: "..."
```

## Troubleshooting

### Table shows no data
- Verify `frontmatterData` is defined
- Check that you have fields beyond metadata fields
- Ensure nested objects have actual values

### Fields not appearing
- Check if field name is in metadata filter list
- Verify field has a non-null, non-undefined value

### Label formatting issues
- Use camelCase or snake_case for field names
- Avoid special characters in field names

## Migration from Old Display Modes

Previous versions supported `displayMode` (hybrid/content/technical). The new version:
- ✅ Simpler two-column format
- ✅ No mode configuration needed
- ✅ Automatic field organization
- ❌ No sectioned display modes
- ❌ No expandable sections

Update your code:
```tsx
// Old
<Table 
  frontmatterData={data}
  config={{ displayMode: 'technical' }}
/>

// New (remove displayMode)
<Table 
  frontmatterData={data}
  config={{}}
/>
```

Hybrid mode provides an intelligent combination of content and technical information with expandable sections, offering the best user experience for most scenarios.

### Example Usage
```yaml
# In your component YAML configuration
components:
  - type: table
    config:
      displayMode: hybrid
      layoutMode: detailed
      caption: "Comprehensive Material Overview"
```

### What Hybrid Mode Shows:

**1. Core Identity** (Essential badge - Always visible)
- Material Name
- Primary Category  
- Specific Type
- Chemical Symbol/Formula
- Atomic Number

**2. Content Summary** (Collapsed by default)
- Article Title and Description
- Key Applications
- Target Audience

**3. Laser Processing Parameters** (Critical badge - High priority)
- Machine settings and optimal parameters
- Power ranges, wavelengths, scan speeds
- Confidence indicators for reliability

**4. Material Properties** (Technical badge - Expanded)
- Essential technical characteristics (categorized by type)
- Physical, thermal, optical, and mechanical data
- Enhanced visual organization with subcategories

**5. Process Outcomes** (Results badge - Key metrics)
- Expected cleaning results and performance
- Quantified success metrics with confidence levels
- Up to 5 key outcome indicators

## Content View Mode

Content View focuses on descriptive and educational content, organizing information into user-friendly sections:

### Example Usage
```yaml
# In your component YAML configuration
components:
  - type: table
    config:
      displayMode: content
      layoutMode: detailed
      caption: "Material Overview"
```

### What Content View Shows:

**1. Material Identity** (Essential badge)
- Material Name
- Primary Category  
- Specific Type
- Chemical Symbol
- Chemical Formula
- Atomic Number

**2. Content Overview**
- Article Title
- Extended Description
- Overview/Summary
- Target Audience
- Content Type

**3. Applications & Usage**
- Practical applications
- Compatible materials/processes  
- Expected outcomes

**4. Safety & Environment** (Important badge)
- Safety guidelines
- Environmental considerations
- Regulatory standards

**5. Keywords & Topics**
- Content classification
- Search terms (displayed as hashtags)

---

## Technical View Mode

Technical View focuses on specifications and technical data, organizing information for engineers and researchers:

### Example Usage
```yaml
# In your component YAML configuration  
components:
  - type: table
    config:
      displayMode: technical
      layoutMode: detailed
      caption: "Technical Specifications"
```

### What Technical View Shows:

**1. Material Properties** (Technical badge)
- Physical characteristics (density, hardness)
- Thermal properties (conductivity, expansion)
- Mechanical properties (strength, modulus)
- Optical/laser properties (absorption, reflectivity)
- Up to 12 most relevant properties

**2. Laser Parameters** (Parameters badge)
- Wavelength settings
- Power ranges
- Spot size configurations  
- Scan speed recommendations
- Processing parameters

**3. Research & Validation** (Research badge)
- Research foundation
- Validation methodology
- Data sources
- Confidence levels

**4. Quality Metrics**
- Performance measurements
- Outcome tracking
- Success criteria

---

## Smart Features

### Intelligent Field Formatting
- **Keywords**: Displayed as hashtags (#laser #cleaning #aluminum)
- **Safety**: Shows warning icon ⚠️ with count
- **Numbers**: Color-coded with units (green for technical values)  
- **Arrays**: Bullet-separated or comma-separated based on content
- **Text**: Auto-truncated for readability

### Progressive Disclosure
- Sections are collapsible with expand/collapse controls
- Essential and Important sections default to expanded
- Badge indicators show section importance
- Field counts shown in section headers

### Confidence Indicators
- Visual confidence bars for data quality
- Color-coded: Green (95%+), Yellow (90-94%), Red (<90%)
- Percentage display for transparency

### Source Attribution
- Research basis and validation methods displayed
- Truncated source citations with full details on hover
- Author and publication information

---

## Configuration Options

```typescript
// All types now centralized in types/centralized.ts

interface TableProps {
  content: string;
  config?: TableConfig;
  frontmatterData?: SmartTableData;
}

interface TableConfig {
  displayMode?: 'auto' | 'content' | 'technical' | 'hybrid';
  layoutMode?: 'compact' | 'detailed' | 'cards';
  caption?: string;
  includedFields?: string[];
  excludedFields?: string[];
  showHeader?: boolean;
  className?: string;
  variant?: 'default' | 'sectioned' | 'compact';
  tableType?: 'auto' | 'frontmatter' | 'legacy';
}

// RECOMMENDED: Optimize section priority and organization
// - Core Identity (Priority 1) - Always visible
// - Technical Properties (Priority 2) - Laser parameters, material properties  
// - Process Outcomes (Priority 3) - Results, metrics, compliance
// - Supporting Info (Priority 4) - Environmental, references

type DisplayMode = 'auto' | 'content' | 'technical' | 'hybrid';

interface SmartField {
  key: string;
  label: string;
  value: any;
  type: 'text' | 'array' | 'object' | 'number' | 'boolean';
  category: 'identity' | 'content' | 'technical' | 'reference';
  confidence?: number;
  source?: string;
  description?: string;
  unit?: string;
  displayMode?: DisplayMode[];
}
```

### Display Modes:
- **hybrid**: Intelligent combination of content and technical data (recommended default)
- **content**: Descriptive, educational focus
- **technical**: Specifications, research focus  
- **auto**: Intelligently chooses based on available data

### Layout Modes:
- **detailed**: Full information with descriptions and metadata
- **compact**: Essential information only
- **cards**: Card-based layout (future enhancement)

---

## Visual Indicators & Badge System

### Section Badges
- **Essential**: Core material identity information
- **Critical**: High-priority laser parameters for operators
- **Technical**: Material properties and specifications
- **Results**: Process outcomes and performance metrics
- **Compliance**: Environmental and regulatory information

### Confidence Indicators
- 🟢 **High Confidence (95%+)**: Verified, reliable data
- 🟡 **Moderate Confidence (90-94%)**: Generally reliable, some validation needed
- 🔴 **Low Confidence (<90%)**: Requires verification or additional research

### Special Formatting
- 🌱 **Environmental Benefits**: Card-based presentation with green theming
- 📊 **Quantified Metrics**: Data with measurable impacts
- • **Outcome Metrics**: Bullet points for key performance indicators

## Benefits

### For Content Creators
- Automatic organization of complex frontmatter
- No manual table creation required
- Consistent presentation across materials
- Hybrid mode provides optimal default experience
- Enhanced subcategorization for better information architecture
- **Visual impact** through improved environmental messaging

### For End Users  
- Logical information grouping with strict category boundaries
- Progressive disclosure reduces overwhelm
- **Enhanced visual confidence indicators** with progress bars and color coding
- Easy scanning with color-coded content and hover effects
- Expandable sections for customized information access
- **Improved environmental benefits** with card-based presentation and icons
- **Priority-based section ordering** optimized for different user roles
- **Better visual hierarchy** with badges and indicators

### For Developers
- **Centralized types** in `types/centralized.ts` eliminate duplication
- **Type safety** with comprehensive TypeScript interfaces
- Backward compatible with existing tables
- Extensible architecture for new field types and modes
- Clean separation of concerns with mode-specific logic
- **Reduced overlap** between display modes
- **Enhanced categorization system** for property grouping
- **Performance optimized** rendering with improved caching

---

## Implementation Status ✅

- ✅ **Hybrid Mode**: Intelligent default combining content and technical views
- ✅ Content View with 5 organized sections
- ✅ Technical View with 4 specialized sections  
- ✅ **Type Consolidation**: All interfaces centralized in `types/centralized.ts`
- ✅ **No Type Duplications**: Single source of truth for all Smart Table types
- ✅ **Reduced Mode Overlap**: Strict field categorization with clear boundaries
- ✅ Smart field categorization and formatting
- ✅ Expandable sections with badges and progressive disclosure
- ✅ Confidence indicators and source attribution
- ✅ Backward compatibility with legacy tables
- ✅ **Enhanced TypeScript**: Comprehensive interfaces and type safety
- ✅ **Priority-Based Organization**: Laser parameters prioritized for operators
- ✅ **Enhanced Environmental Display**: Card-based formatting with icons
- ✅ **Improved Confidence Indicators**: Progress bars with color coding
- ✅ **Expanded Outcome Metrics**: Up to 5 key performance indicators
- ✅ **Better Visual Hierarchy**: Enhanced badges and hover effects

## Latest Improvements (October 2025)

### 🚀 Enhanced User Experience
- **Laser Parameters First**: Critical settings prioritized for operational users
- **Visual Confidence**: Progress bars with green/yellow/red indicators
- **Environmental Cards**: 🌱 Card-based presentation with quantified benefits
- **Expanded Outcomes**: 5 key metrics instead of 3 for comprehensive results

### 🎨 Visual Enhancements
- **Interactive Elements**: Hover effects and smooth transitions
- **Badge System**: Critical, Technical, Results, Compliance badges
- **Better Typography**: Improved hierarchy and readability
- **Icon Integration**: Environmental (🌱) and metrics (📊) icons

### 🔧 Technical Improvements
- **Performance Optimized**: Faster rendering with improved caching
- **Enhanced Arrays**: Special formatting for environmental benefits
- **Better Categorization**: Subcategories for material properties
- **Accessibility**: Screen reader support and keyboard navigation

The Smart Table component now provides a comprehensive, visually appealing, and highly functional interface for displaying complex laser cleaning data with role-based optimization and enhanced user experience.

---

📋 **Complete Technical Details**: See [TABLE_IMPROVEMENTS_SUMMARY.md](./TABLE_IMPROVEMENTS_SUMMARY.md)