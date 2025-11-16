# Font Class Consolidation Strategy

## Problem
Currently there are **100+ inline font weight classes** scattered across components:
- `font-thin`, `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`, `font-black`

## Solution
Move ALL font weight definitions to `global.css` using semantic element selectors and utility classes.

## Current H1 Weight
- **font-thin (100)** - defined in `app/css/global.css`

## Files with Inline Font Classes (100+ instances)
- app/components/Hero/Hero.tsx - 3 instances
- app/components/CardGrid/CardGrid.tsx - 8 instances  
- app/components/Table/Table.tsx - 5 instances
- app/components/Typography/Typography.tsx - 6 instances
- app/components/Button.tsx - 1 instance
- app/components/BadgeSymbol/BadgeSymbol.tsx - 2 instances
- app/components/MetricsCard/MetricsCard.tsx - 3 instances
- app/components/SectionTitle/SectionTitle.tsx - 1 instance
- app/components/WorkflowSection/WorkflowSection.tsx - 2 instances
- app/components/Callout/Callout.tsx - 1 instance
- app/components/Debug/* - 20+ instances
- app/debug/* - 40+ instances
- app/not-found.tsx - 1 instance

## Proposed Global CSS Structure

```css
@layer base {
  /* Headings - Default weights */
  h1 { @apply text-4xl font-thin; }      /* 100 */
  h2 { @apply text-3xl font-light; }     /* 300 */
  h3 { @apply text-2xl font-semibold; }  /* 600 */
  h4 { @apply text-xl font-medium; }     /* 500 */
  h5 { @apply text-lg font-medium; }     /* 500 */
  h6 { @apply text-base font-medium; }   /* 500 */
  
  /* Semantic elements */
  strong, b { @apply font-bold; }         /* 700 */
  em { @apply font-normal; }              /* 400 */
  
  /* Body text */
  body { @apply font-normal; }            /* 400 */
  p { @apply font-normal; }               /* 400 */
}

@layer components {
  /* Button weights */
  .btn { @apply font-medium; }
  
  /* Card titles */
  .card-title { @apply font-semibold; }
  
  /* Table headers */
  .table-header { @apply font-medium; }
  
  /* Metrics/Stats */
  .metric-value { @apply font-bold; }
  .metric-label { @apply font-normal; }
}
```

## Implementation Steps

1. Update `global.css` with comprehensive font weight definitions
2. Remove inline `font-*` classes from all components  
3. Let semantic HTML elements handle font weights automatically
4. Use specific CSS classes only when needed for special cases

## Benefits

- ✅ No inline font classes in JSX
- ✅ Consistent typography across the app
- ✅ Single source of truth for font weights
- ✅ Easier to maintain and update
- ✅ Cleaner component code
