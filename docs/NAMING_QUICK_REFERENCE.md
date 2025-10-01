# Naming Conventions Quick Reference

**Last Updated:** December 2024  
**Status:** Active Guidelines

---

## 📋 Quick Summary

This project completed comprehensive naming normalization in **4 phases**:
- **12 type aliases** created for shorter names
- **71+ variables** renamed for clarity
- **Zero breaking changes** (100% backward compatible)
- **Naming guidelines** established for future development

---

## 🎯 Type Aliases Available

### Use These Shorter Names (Recommended)

```typescript
// Instead of verbose originals, use these:
import {
  // Metrics (40-44% shorter)
  MetricConfig,        // was: GenericMetricConfig
  MetricData,          // was: GenericMetricData
  
  // Templates (6-28% shorter)
  PageTemplateProps,   // was: UniversalPageProps
  TemplateProps,       // was: UniversalPageProps (even shorter!)
  
  // Interactivity (17% shorter)
  InteractiveProps,    // was: BaseInteractiveProps
  
  // Discovery (21% shorter)
  MetricDiscoveryConfig, // was: MetricAutoDiscoveryConfig
  
  // Search (32% shorter)
  SearchGridProps,     // was: SearchResultsGridProps
} from '@/types/centralized';

// Caption types (37-46% shorter)
import {
  CaptionImgProps,     // was: CaptionImageComponentProps
  SEOCaptionProps,     // was: SEOOptimizedCaptionProps
} from '@/app/components/Caption/...';

import {
  CaptionDataV2,       // was: EnhancedCaptionYamlData
} from '@/app/components/Caption/useCaptionParsing';

// Utility functions (19-27% shorter)
import {
  getMaterialAlt,      // was: generateMaterialAltText
  wantsReducedMotion,  // was: prefersReducedMotion
} from '@/app/utils/helpers';
```

---

## ✅ Naming Guidelines

### DO Use These Patterns

#### ✅ Domain-Specific Terms
```typescript
// Good: Specific, describes the domain
interface MetricConfig { }
interface TemplateProps { }
interface CaptionData { }
```

#### ✅ Version Indicators
```typescript
// Good: Clear versioning
interface CaptionDataV2 { }
interface APIResponseV3 { }
const CONFIG_VERSION_2 = { };
```

#### ✅ Behavior Descriptions
```typescript
// Good: Describes what it does
const processedContent = transform(input);
const filteredResults = filter(data);
const sortedItems = sort(list);
```

#### ✅ Feature Flags
```typescript
// Good: Describes capability
const hasV2Features = checkVersion();
const hasMetrics = !!data.metrics;
const supportsWebP = checkFormat();
```

#### ✅ Legitimate Technical Terms
```typescript
// Good: Domain-appropriate SEO/performance terms
const optimizedAlt = generateSEOAlt();
const seoOptimized = true;
const performanceOptimized = true;
```

---

### ❌ AVOID These Patterns

#### ❌ Subjective Decorations
```typescript
// Bad: Vague, subjective
interface EnhancedUserData { }  // Enhanced how?
const improvedResults = process(); // Improved compared to what?
class AdvancedHandler { }       // Advanced in what way?
const betterConfig = { };       // Better than what?
const smartComponent = <div />; // Smart how?
const superOptimizer = () => {}; // Super in what way?
```

#### ❌ Generic Prefixes
```typescript
// Bad: "Generic" adds no value
interface GenericMetricConfig { }
// Good: Just use the name
interface MetricConfig { }

// Bad: "Universal" is usually not truly universal
interface UniversalProps { }
// Good: Be more specific
interface TemplateProps { }
```

#### ❌ Vague Intensifiers
```typescript
// Bad: Adds no semantic meaning
const enhancedData = transform();
const modernLayout = <Layout />;
const powerfulEngine = new Engine();
```

---

## 📖 Examples

### Example 1: Type Usage

```typescript
// ✅ GOOD - Using new aliases
import { MetricConfig, MetricData } from '@/types';

function displayMetric(config: MetricConfig, data: MetricData) {
  return `${config.displayName}: ${data.value}${config.unit}`;
}

// Still valid but verbose
import { GenericMetricConfig, GenericMetricData } from '@/types';

function displayMetric(
  config: GenericMetricConfig,
  data: GenericMetricData
) {
  return `${config.displayName}: ${data.value}${config.unit}`;
}
```

### Example 2: Variable Naming

```typescript
// ❌ BAD - Vague decoration
const enhancedData = fetchData();
const improvedResults = process(enhancedData);

// ✅ GOOD - Descriptive
const captionData = fetchData();
const filteredResults = process(captionData);
```

### Example 3: Component Props

```typescript
// ❌ BAD - Overly verbose
import { SEOOptimizedCaptionProps } from './SEOOptimizedCaption';

function MyComponent(props: SEOOptimizedCaptionProps) {
  // ...
}

// ✅ GOOD - Concise alias
import { SEOCaptionProps } from './SEOOptimizedCaption';

function MyComponent(props: SEOCaptionProps) {
  // ...
}
```

### Example 4: CSS Classes

```typescript
// ❌ BAD - Vague "enhanced"
<div className="card-hover-enhanced">

// ✅ GOOD - Describes behavior
<div className="card-hover-interactive">
```

---

## 🔄 Migration Path

### No Rush to Change

All original names still work:
```typescript
// Both work - use whichever you prefer
const config1: GenericMetricConfig = { };
const config2: MetricConfig = { };
```

### Gradual Adoption

1. ✅ **New code:** Use new aliases
2. ✅ **Refactoring:** Update to new names when convenient
3. ✅ **Reading code:** Recognize both old and new names
4. ✅ **Reviews:** Suggest new names in PRs but don't require immediate changes

---

## 🎨 Naming Decision Tree

```
Need to name something?
│
├─ Is it a type/interface?
│  ├─ Version difference? → Use V2, V3, etc.
│  ├─ Domain-specific? → Use domain term
│  └─ Avoid: Enhanced*, Generic*, Advanced*
│
├─ Is it a variable?
│  ├─ What operation? → processed, filtered, sorted
│  ├─ What check? → hasMetrics, supportsFeature
│  └─ Avoid: enhanced*, improved*, better*
│
├─ Is it a CSS class?
│  ├─ What behavior? → interactive, responsive
│  ├─ What state? → active, disabled, loading
│  └─ Avoid: enhanced-, advanced-, super-
│
└─ Is it SEO/performance related?
   ├─ Specific metric? → optimizedAlt, seoTitle
   └─ OK to use "optimized" in this context
```

---

## 📊 Before/After Quick Reference

| Category | ❌ Avoid | ✅ Prefer | Reason |
|----------|----------|-----------|--------|
| Types | `EnhancedData` | `DataV2` | Version clear |
| Types | `GenericConfig` | `Config` | Remove redundant |
| Types | `UniversalProps` | `TemplateProps` | Be specific |
| Variables | `enhancedData` | `captionData` | Descriptive |
| Variables | `isEnhanced` | `hasV2Features` | Clear intent |
| Variables | `improvedResults` | `filteredResults` | Operation clear |
| CSS | `.enhanced-section` | `.feature-section` | Semantic |
| CSS | `.advanced-mode` | `.expert-mode` | Specific |
| Functions | `enhanceContent()` | `processContent()` | Action clear |

---

## 🔍 Common Patterns

### Metrics & Data

```typescript
// ✅ Good patterns
interface MetricConfig { }
interface MetricData { }
const metricValue = calculate();
const hasMetrics = !!data.metrics;

// ❌ Avoid
interface EnhancedMetricConfig { }
const improvedMetrics = calculate();
```

### Templates & Pages

```typescript
// ✅ Good patterns
interface TemplateProps { }
interface PageTemplateProps { }
const pageData = load();

// ❌ Avoid
interface UniversalPageProps { }
const enhancedPage = load();
```

### Content Processing

```typescript
// ✅ Good patterns
const processedContent = transform(html);
const filteredItems = filter(list);
const sortedResults = sort(data);

// ❌ Avoid
const enhancedContent = transform(html);
const betterItems = filter(list);
const improvedResults = sort(data);
```

---

## 💡 Tips

1. **Ask yourself:** Can I describe this more specifically?
   - Instead of "enhanced", what specifically changed?
   - Instead of "improved", how is it different?

2. **Use verbs for processing:**
   - `processed`, `filtered`, `sorted`, `transformed`

3. **Use adjectives for states:**
   - `active`, `disabled`, `loading`, `error`

4. **Use "has/is/can" for booleans:**
   - `hasMetrics`, `isLoading`, `canEdit`

5. **Version with V2/V3:**
   - `DataV2`, `ConfigV3` (not EnhancedData, ImprovedConfig)

---

## 📚 Full Documentation

For complete details, see:
- `docs/NAMING_E2E_REVIEW_COMPLETE.md` - Complete E2E review
- `docs/NAMING_PHASE_1_COMPLETE.md` - Phase 1 verbosity reduction
- `docs/NAMING_PHASE_2A_COMPLETE.md` - Phase 2A decoration aliases
- `docs/NAMING_PHASE_2B_COMPLETE.md` - Phase 2B variable renaming
- `docs/NAMING_DECORATION_ANALYSIS.md` - Original analysis

---

## ✅ Quick Checklist for PRs

Before submitting code, check:

- [ ] No new "Enhanced*" type names
- [ ] No new "Generic*" type names (unless truly generic)
- [ ] No "improved*" or "better*" variable names
- [ ] Boolean flags use "has/is/can" prefixes
- [ ] Processing variables use verb forms
- [ ] CSS classes describe behavior or state
- [ ] SEO/performance terms used appropriately
- [ ] Version indicators use V2/V3 format

---

**Status:** Active Guidelines  
**Applies To:** All new code and refactoring  
**Enforcement:** Suggest in PRs, not blocking
