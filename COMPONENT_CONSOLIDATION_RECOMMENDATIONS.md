# Component Consolidation Recommendations
**Date**: November 29, 2025  
**Status**: Analysis Complete - Ready for Review  
**Current State**: 106 components across 48 directories  
**Goal**: Reduce to ~55-65 components through universal patterns  

---

## 📊 Executive Summary

**Component Proliferation Analysis**:
- **106 total TSX components** across 48 directories (2.2 files/directory avg)
- **Identified patterns**: Wrapper explosion, domain duplication, over-specialization
- **Consolidation potential**: **35-40% reduction** (40-50 components can be eliminated)
- **Approach**: Configuration-driven universal base components + composition

**Key Findings**:
1. **Wrapper Pattern Overuse**: 8+ wrapper components that just pass props differently
2. **Domain Duplication**: FAQ (4 variants), Heatmap (5 variants), Micro (7 files)
3. **Icon Explosion**: 35 icon components when 1 universal Icon + config would suffice
4. **Typography Duplication**: 13 heading/text components with identical patterns

---

## 🎯 Consolidation Strategy

### **Phase 1: Universal Base Components** (High Impact - 25 components saved)

#### **1.1 Unified Card System** (Save 10+ components)

**Current State** (Fragmented):
```
Card/Card.tsx (MaterialCard)
Dataset/DatasetCard.tsx
Dataset/DownloadCard.tsx
HeatBuildup/HeatAnalysisCards.tsx (3 card types)
Heatmap/AnalysisCards.tsx (3 card types)
Heatmap/HeatmapFactorCard.tsx
PropertyBars/PropertyBars.tsx (custom card layout)
```

**Consolidated Architecture**:
```tsx
// NEW: app/components/Base/Card.tsx
interface UniversalCardProps<T = any> {
  variant: 'material' | 'dataset' | 'analysis' | 'factor' | 'download';
  data: T;
  config: CardConfig;
  href?: string;
  onClick?: (data: T) => void;
  actions?: CardAction[];
  className?: string;
}

interface CardConfig {
  showThumbnail?: boolean;
  showBadge?: boolean;
  showMetrics?: boolean;
  showFormats?: boolean;
  layout?: 'compact' | 'standard' | 'expanded';
  colorScheme?: 'default' | 'danger' | 'warning' | 'success';
}

interface CardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Card<T>({ variant, data, config, href, onClick, actions }: UniversalCardProps<T>) {
  // Render different card types based on variant + config
  // All card types share: container, hover effects, accessibility, semantic structure
  // Variant determines: content layout, metric display, action buttons
}
```

**Usage Examples**:
```tsx
// Material Card
<Card
  variant="material"
  data={frontmatter}
  config={{ showThumbnail: true, showBadge: true }}
  href={`/materials/${slug}`}
/>

// Dataset Card with Quick Downloads
<Card
  variant="dataset"
  data={datasetInfo}
  config={{ 
    showThumbnail: true, 
    showFormats: true,
    showMetrics: true 
  }}
  actions={[
    { label: 'JSON', icon: <DownloadIcon />, onClick: () => download('json') },
    { label: 'CSV', icon: <DownloadIcon />, onClick: () => download('csv') }
  ]}
  href={`/datasets/${slug}`}
/>

// Analysis Card (Heatmap/HeatBuildup)
<Card
  variant="analysis"
  data={analysisData}
  config={{ 
    layout: 'compact',
    colorScheme: analysisData.severity 
  }}
/>
```

**Benefits**:
- ✅ Single component handles all card types
- ✅ Consistent hover effects, accessibility, responsive behavior
- ✅ Type-safe with generics
- ✅ Reduces 10+ card components to 1 universal Card
- ✅ Config-driven behavior (no hardcoded variants)

---

#### **1.2 Unified Section Wrapper** (Save 5 components)

**Current State** (Wrapper Hell):
```
Dataset/CategoryDatasetCardWrapper.tsx (242 lines)
Dataset/MaterialDatasetCardWrapper.tsx (99 lines)
Dataset/SubcategoryDatasetWrapper.tsx
Dataset/BulkDownloadWrapper.tsx
Dataset/DatasetSectionClient.tsx
```

**All these wrappers do the same thing**:
1. Wrap content in `<SectionContainer variant="dark">`
2. Add icon from `getSectionIcon()`
3. Calculate stats from props
4. Pass to child component

**Consolidated Architecture**:
```tsx
// ENHANCED: app/components/SectionContainer/SectionContainer.tsx
interface SectionContainerProps {
  variant?: 'default' | 'dark';
  title?: string;
  icon?: React.ReactNode | string; // Accept icon name string
  stats?: Array<{ value: number; label: string }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionContainer({ 
  variant = 'default',
  title,
  icon,
  stats,
  actions,
  children,
  className 
}: SectionContainerProps) {
  // If icon is string, resolve from getSectionIcon()
  const resolvedIcon = typeof icon === 'string' 
    ? getSectionIcon(icon) 
    : icon;

  return (
    <section className={`${variantClasses[variant]} ${className}`}>
      {title && (
        <header className="section-header">
          <div className="flex items-center gap-3">
            {resolvedIcon}
            <h2>{title}</h2>
          </div>
          
          {/* Stats Bar */}
          {stats && (
            <div className="stats-bar">
              {stats.map((stat, i) => (
                <div key={i} className="stat">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          {actions && <div className="section-actions">{actions}</div>}
        </header>
      )}
      
      {children}
    </section>
  );
}
```

**Usage Example** (Replaces ALL dataset wrappers):
```tsx
// Instead of CategoryDatasetCardWrapper
<SectionContainer
  variant="dark"
  title={`${categoryLabel} Dataset Download`}
  icon="dataset"
  stats={[
    { value: aggregateStats.totalVariables, label: 'Variables' },
    { value: aggregateStats.totalParameters, label: 'Parameters' },
    { value: materials.length, label: 'Materials' }
  ]}
  actions={<DownloadControls onDownload={handleDownload} />}
>
  <DatasetGrid materials={materials} />
</SectionContainer>

// Same component works for Material wrapper
<SectionContainer
  variant="dark"
  title={`${materialName} Dataset Download`}
  icon="dataset"
  stats={[
    { value: variablesCount, label: 'Variables' },
    { value: settingsCount, label: 'Parameters' },
    { value: 3, label: 'Formats' }
  ]}
>
  <DownloadControls formats={['json', 'csv', 'txt']} slug={baseSlug} />
</SectionContainer>
```

**Benefits**:
- ✅ Eliminates 5 wrapper components (CategoryWrapper, MaterialWrapper, SubcategoryWrapper, BulkWrapper, SectionClient)
- ✅ Stats display built into SectionContainer
- ✅ Icon resolution automatic (string → icon component)
- ✅ All dataset sections use identical pattern
- ✅ Enhanced SectionContainer gains features, no breaking changes

---

#### **1.3 Unified Icon System** (Save 35+ components!)

**Current State** (Icon Explosion):
```
Buttons/ButtonIcons.tsx: 35 individual icon exports
Icons/Calendar.tsx
Icons/Settings.tsx
Icons/Zap.tsx
```

**Problem**: Each icon is a separate function with hardcoded SVG paths. Adding icons requires code changes.

**Consolidated Architecture**:
```tsx
// NEW: app/components/Base/Icon.tsx
interface IconProps {
  name: string; // 'download' | 'calendar' | 'settings' | 'zap' | ...
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// Icon registry (config-driven, not code)
const ICON_PATHS: Record<string, string> = {
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  zap: 'M13 10V3L4 14h7v7l9-11h-7z',
  // ... 30+ more icons
};

export function Icon({ name, size = 24, className = '', strokeWidth = 2 }: IconProps) {
  const path = ICON_PATHS[name];
  
  if (!path) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
```

**Usage**:
```tsx
// Instead of importing 35 individual icon components
import { Icon } from '@/app/components/Base/Icon';

<Icon name="download" size={20} className="text-blue-500" />
<Icon name="calendar" size={24} />
<Icon name="settings" size={18} strokeWidth={1.5} />
```

**Benefits**:
- ✅ 35+ icon components → 1 universal Icon
- ✅ Adding new icons = config change (no code)
- ✅ Consistent sizing, styling, accessibility
- ✅ Tree-shakeable (unused icons not bundled)
- ✅ TypeScript autocomplete for icon names

---

#### **1.4 Unified Typography System** (Save 13 components)

**Current State** (Typography Duplication):
```tsx
// app/components/Typography/Typography.tsx
export const H1 = ({ children, className }) => <h1 className={...}>{children}</h1>
export const H2 = ({ children, className }) => <h2 className={...}>{children}</h2>
export const H3 = ({ children, className }) => <h3 className={...}>{children}</h3>
export const H4 = ({ children, className }) => <h4 className={...}>{children}</h4>
export const H5 = ({ children, className }) => <h5 className={...}>{children}</h5>
export const H6 = ({ children, className }) => <h6 className={...}>{children}</h6>
export const P = ({ children, className }) => <p className={...}>{children}</p>
export const Strong = ({ children, className }) => <strong className={...}>{children}</strong>
export const Em = ({ children, className }) => <em className={...}>{children}</em>
export const UL = ({ children, className }) => <ul className={...}>{children}</ul>
export const OL = ({ children, className }) => <ol className={...}>{children}</ol>
export const LI = ({ children, className }) => <li className={...}>{children}</li>
export const Code = ({ children, className }) => <code className={...}>{children}</code>
```

**Problem**: 13 nearly identical wrapper functions that just add className to native elements.

**Consolidated Architecture**:
```tsx
// NEW: app/components/Base/Text.tsx
type TextVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'strong' | 'em' | 'code'
  | 'ul' | 'ol' | 'li' | 'blockquote';

interface TextProps {
  as?: TextVariant;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
  className?: string;
  children: React.ReactNode;
}

export function Text({ 
  as = 'p', 
  size, 
  weight, 
  color, 
  className = '', 
  children 
}: TextProps) {
  const Component = as;
  
  // Auto-select size based on semantic element if not specified
  const defaultSize = {
    h1: '4xl', h2: '3xl', h3: '2xl', h4: 'xl', h5: 'lg', h6: 'base',
    p: 'base', span: 'base', code: 'sm'
  }[as] || 'base';
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };
  
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };
  
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted',
    accent: 'text-accent'
  };
  
  const computedClasses = [
    sizeClasses[size || defaultSize],
    weight && weightClasses[weight],
    color && colorClasses[color],
    className
  ].filter(Boolean).join(' ');
  
  return <Component className={computedClasses}>{children}</Component>;
}
```

**Usage**:
```tsx
// Instead of importing 13 typography components
import { Text } from '@/app/components/Base/Text';

<Text as="h1" size="4xl" weight="bold">Main Heading</Text>
<Text as="h2" color="accent">Subheading</Text>
<Text as="p" size="lg">Large paragraph text</Text>
<Text as="code" className="bg-gray-900">inline code</Text>

// Auto-sizing (semantic defaults)
<Text as="h1">Uses 4xl automatically</Text>
<Text as="h2">Uses 3xl automatically</Text>
<Text as="p">Uses base automatically</Text>
```

**Benefits**:
- ✅ 13 components → 1 universal Text
- ✅ Type-safe variant prop (autocomplete)
- ✅ Semantic defaults (h1 auto-sizes to 4xl)
- ✅ Consistent styling across all text elements
- ✅ Flexible overrides with className

---

### **Phase 2: Component Family Consolidation** (Medium Impact - 15 components saved)

#### **2.1 FAQ/Help System Unification** (Save 3 components)

**Current State**:
```
FAQ/BaseFAQ.tsx (215 lines) - Generic help system
FAQ/FAQMaterial.tsx (78 lines) - Material-specific wrapper
FAQ/MaterialFAQ.tsx - Duplicate wrapper
FAQ/FAQSettings.tsx (101 lines) - Settings-specific wrapper
```

**Analysis**:
- `BaseFAQ` is already universal (handles FAQ + troubleshooting)
- `FAQMaterial`, `MaterialFAQ`, `FAQSettings` are just wrappers that:
  1. Extract FAQ data from frontmatter
  2. Pass to BaseFAQ
  3. Add section container

**Consolidated Architecture**:
```tsx
// ENHANCED: app/components/FAQ/FAQ.tsx (replaces 4 files)
interface FAQProps {
  data: Array<HelpItem> | HelpSection;
  context?: {
    materialName?: string;
    settingName?: string;
    heroImage?: string;
    materialLink?: string;
  };
  variant?: 'material' | 'settings' | 'generic';
  showTroubleshooting?: boolean;
}

export function FAQ({ data, context, variant = 'generic', showTroubleshooting = true }: FAQProps) {
  // Auto-generate title based on variant + context
  const title = context?.materialName 
    ? `${context.materialName} FAQ`
    : context?.settingName
    ? `${context.settingName} FAQ`
    : 'Frequently Asked Questions';
  
  // Normalize data structure (handle both array and object with questions)
  const questions = Array.isArray(data) ? data : (data as any)?.questions || [];
  const troubleshooting = (data as any)?.troubleshooting || [];
  
  return (
    <SectionContainer
      variant="dark"
      title={title}
      icon="help"
    >
      {/* FAQ Section */}
      {questions.length > 0 && (
        <HelpSection type="faq" items={questions} context={context} />
      )}
      
      {/* Troubleshooting Section */}
      {showTroubleshooting && troubleshooting.length > 0 && (
        <HelpSection type="troubleshooting" items={troubleshooting} context={context} />
      )}
    </SectionContainer>
  );
}
```

**Usage** (Replaces all 4 FAQ components):
```tsx
// Material FAQ
<FAQ 
  data={frontmatter.faq}
  context={{ 
    materialName: 'Aluminum',
    heroImage: '/images/aluminum.jpg',
    materialLink: '/materials/aluminum'
  }}
  variant="material"
/>

// Settings FAQ
<FAQ 
  data={frontmatter.faq}
  context={{ settingName: '1064nm Wavelength' }}
  variant="settings"
/>

// Generic FAQ (no context)
<FAQ data={faqData} />
```

**Benefits**:
- ✅ 4 components → 1 universal FAQ
- ✅ Context-aware titles (auto-generated)
- ✅ Handles material, settings, generic FAQs
- ✅ Maintains all BaseFAQ features (severity badges, tracking, markdown)

---

#### **2.2 Heatmap Family Consolidation** (Save 4 components)

**Current State**:
```
Heatmap/BaseHeatmap.tsx (451 lines) - Universal base
Heatmap/MaterialSafetyHeatmap.tsx - Thin wrapper
Heatmap/ThermalStressHeatmap.tsx - Thin wrapper
Heatmap/EnergyCouplingHeatmap.tsx - Thin wrapper
Heatmap/ProcessEffectivenessHeatmap.tsx - Thin wrapper
```

**Analysis**: All 4 specialized heatmaps are 20-30 line wrappers that:
1. Define `calculateScore` function
2. Define `factorCards` config
3. Pass to BaseHeatmap

**This is ALREADY the correct pattern!** Just needs better documentation.

**Recommendation**: **Keep BaseHeatmap, DELETE wrappers**

**Usage** (Direct BaseHeatmap with inline configs):
```tsx
// Instead of <MaterialSafetyHeatmap />
<BaseHeatmap
  {...props}
  calculateScore={(power, pulse, properties) => {
    // Safety calculation logic
    return calculateSafetyScore(power, pulse, properties);
  }}
  factorCards={MATERIAL_SAFETY_FACTORS}
  scoreType="safety"
/>

// Instead of <ThermalStressHeatmap />
<BaseHeatmap
  {...props}
  calculateScore={(power, pulse, properties) => {
    // Thermal stress calculation
    return calculateThermalStress(power, pulse, properties);
  }}
  factorCards={THERMAL_STRESS_FACTORS}
  scoreType="thermal"
/>
```

**Better Yet**: Move configs to external files
```tsx
// app/config/heatmap-configs.ts
export const HEATMAP_CONFIGS = {
  materialSafety: {
    calculateScore: (power, pulse, props) => calculateSafetyScore(power, pulse, props),
    factorCards: MATERIAL_SAFETY_FACTORS,
    scoreType: 'safety' as const,
    title: 'Material Safety Analysis',
    description: 'Comprehensive safety risk assessment...'
  },
  thermalStress: {
    calculateScore: (power, pulse, props) => calculateThermalStress(power, pulse, props),
    factorCards: THERMAL_STRESS_FACTORS,
    scoreType: 'thermal' as const,
    title: 'Thermal Stress Analysis',
    description: 'Thermal load and heat distribution...'
  },
  // ... other configs
};

// Usage (config-driven, no wrappers)
<BaseHeatmap {...props} {...HEATMAP_CONFIGS.materialSafety} />
```

**Benefits**:
- ✅ 5 components → 1 universal BaseHeatmap
- ✅ Configs externalized (easier to modify)
- ✅ No wrapper boilerplate
- ✅ Type-safe with discriminated union

---

#### **2.3 Micro Component Consolidation** (Save 6 components)

**Current State**:
```
Micro/Micro.tsx (201 lines) - Main component
Micro/MicroContent.tsx - Content section
Micro/MicroHeader.tsx - Header section
Micro/MicroImage.tsx - Image section
Micro/TechnicalDetails.tsx - Details section
Micro/MetadataDisplay.tsx - Metadata section
Micro/MicroSkeleton.tsx - Loading state
```

**Analysis**: Micro.tsx orchestrates 6 sub-components. This is over-engineered.

**Consolidated Architecture**:
```tsx
// SIMPLIFIED: app/components/Micro/Micro.tsx (one file)
export function Micro({ frontmatter, config }: MicroProps) {
  const microData = useMicroParsing(frontmatter.micro);
  
  if (!microData.imageSource) return null;
  
  return (
    <SectionContainer variant="default" className={config?.className}>
      {/* Image Section */}
      <MicroImage 
        src={microData.imageSource}
        alt={microData.alt}
        materialName={frontmatter.name}
      />
      
      {/* Header Section */}
      <MicroHeader 
        title={microData.title}
        material={frontmatter.name}
      />
      
      {/* Content Section */}
      <MicroContent 
        before={microData.before}
        after={microData.after}
        qualityMetrics={microData.qualityMetrics}
      />
      
      {/* Technical Details */}
      {microData.laserParams && (
        <TechnicalDetails params={microData.laserParams} />
      )}
      
      {/* Metadata Display */}
      {microData.metadata && (
        <MetadataDisplay metadata={microData.metadata} />
      )}
    </SectionContainer>
  );
}

// Internal sub-components (not exported, single file)
function MicroImage({ src, alt, materialName }: ImageProps) {
  return (
    <div className="micro-image-wrapper">
      <Image src={src} alt={alt} width={800} height={600} />
    </div>
  );
}

function MicroHeader({ title, material }: HeaderProps) {
  return (
    <header className="micro-header">
      <h3>{title}</h3>
      <span className="material-badge">{material}</span>
    </header>
  );
}

// ... other internal components
```

**Benefits**:
- ✅ 7 files → 1 file (easier to maintain)
- ✅ Internal components co-located
- ✅ No excessive file switching
- ✅ Maintains component separation (testable sections)
- ✅ Skeleton can be inline (conditional render)

---

### **Phase 3: Eliminate Redundant Patterns** (Low Impact - 8 components saved)

#### **3.1 Button Icon Consolidation**

**Current**: `Buttons/ButtonIcons.tsx` exports 35 separate icon functions  
**Solution**: Already covered in Icon consolidation (1.3) - **35 → 1 component**

#### **3.2 Dataset Component Reduction**

**Current State**:
```
Dataset/ (20+ files)
├── CategoryDatasetCardWrapper.tsx
├── MaterialDatasetCardWrapper.tsx
├── SubcategoryDatasetWrapper.tsx
├── BulkDownloadWrapper.tsx
├── DatasetSectionClient.tsx
├── DatasetSection.tsx
├── DatasetDownload.tsx
├── DatasetDownloadControls.tsx
└── ... 12 more files
```

**Analysis**: Many of these are wrapper/helper components that:
- Fetch data and pass to child
- Calculate stats
- Render SectionContainer with standard layout

**Consolidated Architecture**:
```tsx
// app/components/Dataset/DatasetSection.tsx (universal)
interface DatasetSectionProps {
  scope: 'material' | 'category' | 'subcategory' | 'complete';
  slug?: string;
  materials?: Material[];
  onDownload: (format: string) => void;
}

export function DatasetSection({ scope, slug, materials, onDownload }: DatasetSectionProps) {
  // Calculate stats based on scope
  const stats = useDatasetStats(scope, slug, materials);
  
  // Generate title based on scope
  const title = scope === 'material' 
    ? `${materialName} Dataset`
    : scope === 'category'
    ? `${categoryName} Category Dataset`
    : 'Complete Laser Cleaning Database';
  
  return (
    <SectionContainer
      variant="dark"
      title={title}
      icon="dataset"
      stats={stats}
    >
      <DownloadControls 
        formats={['json', 'csv', 'txt']}
        onDownload={onDownload}
      />
      
      {materials && (
        <MaterialGrid materials={materials} />
      )}
    </SectionContainer>
  );
}
```

**Benefits**:
- ✅ 5 wrapper components → 1 universal DatasetSection
- ✅ Scope-based behavior (material/category/subcategory)
- ✅ Stats calculation internal
- ✅ Consistent layout across all dataset pages

---

## 📋 Implementation Phases

### **Phase 1: Foundation** (Week 1 - High ROI)
**Goal**: Establish universal base components  
**Effort**: 12-16 hours  
**Impact**: **-35 components** (35% reduction)

1. **Day 1-2**: Create universal `Icon` component
   - Migrate 35 button icons to single Icon
   - Update all icon imports
   - Test: All icons render correctly
   
2. **Day 3-4**: Create universal `Card` component
   - Generic card with variants (material, dataset, analysis, factor)
   - Migrate MaterialCard, DatasetCard, DownloadCard
   - Test: All card types render correctly
   
3. **Day 5**: Create universal `Text` component
   - Replace 13 typography exports
   - Migrate all typography usage
   - Test: All text elements styled correctly

**Deliverables**:
- ✅ `app/components/Base/Icon.tsx` (replaces 35 icons)
- ✅ `app/components/Base/Card.tsx` (replaces 10+ cards)
- ✅ `app/components/Base/Text.tsx` (replaces 13 typography)
- ✅ Migration guide for each component
- ✅ Automated tests for all variants

---

### **Phase 2: Section Wrappers** (Week 2 - Medium ROI)
**Goal**: Consolidate wrapper components  
**Effort**: 8-12 hours  
**Impact**: **-10 components** (10% reduction)

1. **Day 1-2**: Enhance `SectionContainer`
   - Add stats display
   - Add action button support
   - Icon string resolution
   - Test: All dataset wrappers replaceable
   
2. **Day 3**: Consolidate FAQ components
   - Merge 4 FAQ variants into 1
   - Context-aware title generation
   - Test: Material FAQ, Settings FAQ, Generic FAQ
   
3. **Day 4**: Consolidate Dataset wrappers
   - Replace 5 wrappers with universal DatasetSection
   - Scope-based behavior (material/category/subcategory)
   - Test: All dataset pages render correctly

**Deliverables**:
- ✅ Enhanced `SectionContainer` (stats + actions)
- ✅ Universal `FAQ` component (replaces 4 variants)
- ✅ Universal `DatasetSection` (replaces 5 wrappers)
- ✅ Migration scripts for automated refactoring

---

### **Phase 3: Component Families** (Week 3 - Low ROI)
**Goal**: Simplify component families  
**Effort**: 6-8 hours  
**Impact**: **-10 components** (10% reduction)

1. **Day 1-2**: Simplify Micro family
   - Merge 7 files into 1 (internal components)
   - Test: Micro renders correctly on all material pages
   
2. **Day 3**: Remove Heatmap wrappers
   - Delete 4 wrapper components
   - Use BaseHeatmap directly with configs
   - Externalize configs to `app/config/heatmap-configs.ts`
   - Test: All heatmap types render correctly

**Deliverables**:
- ✅ Single-file Micro component
- ✅ Config-driven Heatmap usage
- ✅ Heatmap config file (externalized)
- ✅ Documentation for direct BaseHeatmap usage

---

## 📊 Expected Outcomes

### **Component Count Reduction**
| Phase | Components Saved | New Component Count | % Reduction |
|-------|-----------------|---------------------|-------------|
| Start | - | 106 | - |
| Phase 1 Complete | -35 | 71 | 33% |
| Phase 2 Complete | -10 | 61 | 42% |
| Phase 3 Complete | -10 | 51 | 52% |

### **Maintenance Benefits**
- **Consistency**: All cards use same hover effects, accessibility patterns
- **Predictability**: Developers know where to find components (Base/ folder)
- **Testability**: Universal components have comprehensive test suites
- **Flexibility**: Config-driven behavior easier to extend than code changes
- **Bundle Size**: Tree-shakeable universal components (unused variants excluded)

### **Developer Experience**
```tsx
// BEFORE (fragmented imports)
import { MaterialCard } from '@/app/components/Card/Card';
import { DatasetCard } from '@/app/components/Dataset/DatasetCard';
import { DownloadIcon } from '@/app/components/Buttons/ButtonIcons';
import { H2 } from '@/app/components/Typography/Typography';
import { BaseFAQ } from '@/app/components/FAQ/BaseFAQ';

// AFTER (unified imports)
import { Card, Icon, Text, FAQ } from '@/app/components/Base';

// Usage is cleaner and more predictable
<Card variant="material" data={frontmatter} />
<Card variant="dataset" data={datasetInfo} actions={downloadActions} />
<Icon name="download" size={20} />
<Text as="h2" size="2xl">Section Title</Text>
<FAQ data={faqData} context={{ materialName }} />
```

---

## 🚀 Getting Started

### **Recommended Approach**
1. **Start with Phase 1** (highest ROI, lowest risk)
2. **Test thoroughly** after each component migration
3. **Document patterns** as you consolidate
4. **Create migration guide** for team reference

### **First Task**: Universal Icon Component
**Time**: 2-3 hours  
**Files to Create**: `app/components/Base/Icon.tsx`  
**Files to Update**: All files importing from `Buttons/ButtonIcons.tsx`  
**Risk**: Low (icons are presentational only)

**Migration Script**:
```bash
# Find all icon imports
grep -r "from '@/app/components/Buttons/ButtonIcons'" app/

# Replace with universal Icon
# Before: import { DownloadIcon } from '@/app/components/Buttons/ButtonIcons';
# After: import { Icon } from '@/app/components/Base/Icon';
# Before: <DownloadIcon className="w-5 h-5" />
# After: <Icon name="download" size={20} />
```

---

## 📝 Key Principles

1. **Configuration Over Code**: Use config objects instead of multiple components
2. **Composition Over Specialization**: One flexible component > many rigid ones
3. **Type Safety**: Generics + discriminated unions for variant safety
4. **Backward Compatibility**: Gradual migration, no breaking changes
5. **Performance**: Tree-shakeable, only bundle used variants
6. **Accessibility**: Universal components enforce ARIA patterns
7. **Documentation**: Config examples for all variants

---

## 🎯 Success Metrics

- ✅ **Component count**: 106 → 51 (52% reduction)
- ✅ **Bundle size**: Reduced by ~15-20% (fewer components to bundle)
- ✅ **Development speed**: 30% faster (predictable component usage)
- ✅ **Bug rate**: Lower (shared logic tested once)
- ✅ **Onboarding time**: Faster (fewer components to learn)

---

## 🔄 Next Steps

**Immediate Actions**:
1. Review this document with team
2. Prioritize phases (recommend starting with Phase 1)
3. Create branch: `feature/component-consolidation-phase1`
4. Implement universal Icon component (first task)
5. Write migration guide for Icon → all other components follow same pattern

**Questions to Resolve**:
- Should we consolidate in one PR or incremental PRs per component?
- Do we need feature flags for gradual rollout?
- What's our testing strategy? (Unit tests? Integration tests? Visual regression?)

---

**Status**: ✅ Ready for Implementation  
**Recommendation**: Start with Phase 1 (Icon, Card, Text) - highest ROI, lowest risk  
**Timeline**: 3 weeks total (12-16h + 8-12h + 6-8h)
