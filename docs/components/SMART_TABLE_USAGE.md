# Smart Table Component - Usage Examples

The enhanced Table component now supports three intelligent display modes that organize frontmatter data for maximum clarity and usefulness.

## Hybrid Mode (Recommended Default)

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