# ContentCard Component System

## Overview

The **ContentCard** system consolidates the former `Callout` and `WorkflowSection` components into a single, flexible component suite that handles all highlighted content needs across the site.

## Architecture

### Components

1. **ContentCard** - Base component for individual content cards
2. **ContentSection** - Wrapper for collections of ContentCards
3. **Backward Compatibility** - Old component names still work via exports

## Component Details

### ContentCard

Single flexible component that replaces both Callout and WorkflowSection items.

#### Props

```typescript
interface ContentCardProps {
  // Core content (required)
  heading: string;
  text: string;
  
  // Optional workflow features
  order?: number;              // Shows numbered badge (for workflow steps)
  details?: string[];          // Bullet list of details
  
  // Visual options
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
  theme?: 'body' | 'navbar';
  variant?: 'default' | 'inline';
}
```

#### Usage Examples

**Simple Callout (no order number):**
```tsx
<ContentCard
  heading="Important Notice"
  text="This is important information for users."
  image={{ url: "/images/callout.jpg", alt: "Descriptive text" }}
  imagePosition="right"
  theme="navbar"
  variant="default"
/>
```

**Workflow Step (with order number and details):**
```tsx
<ContentCard
  order={1}
  heading="Initial Consultation"
  text="We begin with a comprehensive consultation..."
  details={[
    "Material composition analysis",
    "Contamination assessment",
    "Quality standards review"
  ]}
  image={{ url: "/images/consultation.jpg", alt: "Consultation" }}
  imagePosition="right"
  theme="navbar"
/>
```

**Inline Variant (no background):**
```tsx
<ContentCard
  heading="Feature Highlight"
  text="This appears inline without a background container."
  variant="inline"
  theme="navbar"
/>
```

### ContentSection

Wrapper component for rendering collections of ContentCards with an optional section title.

#### Props

```typescript
interface ContentSectionProps {
  title?: string;
  items: (WorkflowItem | CalloutProps)[];
  theme?: 'body' | 'navbar';
}
```

#### Usage Examples

**Workflow Section:**
```tsx
<ContentSection 
  title="Our Process" 
  items={pageConfig.workflow}
  theme="navbar"
/>
```

**Multiple Callouts:**
```tsx
<ContentSection 
  items={pageConfig.callouts}
  theme="navbar"
/>
```

## Styling Features

### Themes

**navbar** (default):
- Light mode: Gradient from white → gray-700
- Dark mode: Gradient from gray-800 → gray-700
- Text: Dark text in light mode, light text in dark mode

**body**:
- Solid gray-700 background
- White text
- Used for content on main body background

### Variants

**default**:
- Background container with padding
- Rounded corners
- Used for distinct content blocks

**inline**:
- No background container
- Minimal padding
- Used for content that flows with surrounding elements

### Layout Features

1. **Order Number Badge** (when `order` prop provided):
   - Circular badge with number
   - Blue color scheme
   - Gray-700 background
   - Positioned at top-left of card
   - Heading spans to the right

2. **Image Positioning**:
   - Left or right side placement
   - 16:9 aspect ratio
   - Responsive: full width on mobile, 50% on desktop

3. **Details List** (when `details` prop provided):
   - Checkmark bullets (✓)
   - Blue accent color
   - Proper spacing and alignment

4. **Grid Layout**:
   - Single column on mobile
   - Two columns on desktop (when image present)
   - Centered content when no image

## Migration Guide

### From Callout Component

**Old:**
```tsx
import { Callout } from '../Callout/Callout';

<Callout
  heading="Title"
  text="Description"
  image={...}
  imagePosition="right"
  theme="navbar"
  variant="default"
/>
```

**New:**
```tsx
import { ContentCard } from '../ContentCard';

<ContentCard
  heading="Title"
  text="Description"
  image={...}
  imagePosition="right"
  theme="navbar"
  variant="default"
/>
```

**Or use backward compatible import:**
```tsx
import { Callout } from '../ContentCard';
// Works exactly the same!
```

### From WorkflowSection Component

**Old:**
```tsx
import { WorkflowSection } from '../WorkflowSection/WorkflowSection';

<WorkflowSection 
  workflow={pageConfig.workflow}
  title="Our Process"
  theme="navbar"
/>
```

**New:**
```tsx
import { ContentSection } from '../ContentCard';

<ContentSection 
  title="Our Process"
  items={pageConfig.workflow}
  theme="navbar"
/>
```

**Or use backward compatible import:**
```tsx
import { WorkflowSection } from '../ContentCard';
// Works exactly the same!
```

## YAML Configuration

### Unified contentCards Structure (Recommended)

The new unified structure combines callouts and workflow into a single `contentCards` array:

```yaml
contentCards:
  # Simple callout (no order property)
  - heading: "Important Feature"
    text: "Description of the feature"
    imagePosition: "right"
    theme: "navbar"
    variant: "inline"
    image:
      url: "/images/feature.jpg"
      alt: "Feature image"
  
  # Another callout
  - heading: "Another Feature"
    text: "More information"
    imagePosition: "left"
    variant: "default"
    image:
      url: "/images/feature2.jpg"
      alt: "Feature 2"
  
  # Workflow step (has order property = renders with numbered badge)
  - order: 1
    heading: "Initial Consultation"
    text: "We begin by understanding your needs..."
    details:
      - "Material assessment"
      - "Budget planning"
      - "Timeline setup"
    image:
      url: "/images/consultation.jpg"
      alt: "Consultation meeting"
    imagePosition: "right"
  
  - order: 2
    heading: "Proposal Development"
    text: "We create a detailed proposal..."
    details:
      - "Scope definition"
      - "Timeline planning"
    imagePosition: "left"
```

**Key Points:**
- Items **without** `order` property render as simple callouts
- Items **with** `order` property render as workflow steps with numbered badges
- Automatic sorting: Items with order numbers appear first (sorted by order), then callouts in YAML order
- All items in one array = simpler structure, easier to maintain

### Legacy YAML Structures (Backward Compatible)

Old YAML files still work:

**Legacy Callouts:**
```yaml
callouts:
  - heading: "Important Feature"
    text: "Description"
    # ... other props
```

**Legacy Workflow:**
```yaml
workflow:
  - stage: "Step 1"
    order: 1
    name: "Initial Consultation"
    description: "Description"
    details: [...]
```

These are automatically combined and processed by StaticPage component.

## Benefits of Consolidation

1. **Single Source of Truth**: One component handles all content card needs
2. **Consistent Styling**: Unified theme system across all content types
3. **Flexible Options**: Optional props enable simple or complex layouts
4. **Backward Compatible**: Existing code continues to work
5. **Reduced Bundle Size**: Eliminates duplicate code
6. **Easier Maintenance**: Update styling in one place
7. **Better DX**: Simpler mental model for developers

## File Structure

```
app/components/ContentCard/
├── ContentCard.tsx       # Base component
├── ContentSection.tsx    # Collection wrapper
└── index.ts             # Exports (including backward compatible aliases)
```

## When to Use

✅ **Use ContentCard for:**
- Simple callouts and announcements
- Workflow/process steps
- Feature highlights
- Any content block with heading + text + optional image

✅ **Use ContentSection for:**
- Collections of workflow steps
- Multiple related callouts
- Any grouped content with optional title

❌ **Don't use for:**
- Complex interactive components
- Forms or input elements
- Navigation elements
- Data tables

## Implementation Status

### Component System
- ✅ ContentCard component created
- ✅ ContentSection wrapper created
- ✅ Backward compatibility exports added
- ✅ StaticPage component updated
- ✅ All TypeScript types defined
- ✅ Gradient backgrounds implemented
- ✅ Shadow-free styling applied

### YAML Consolidation
- ✅ ContentCardItem type created (unified interface)
- ✅ contentCards field added to ArticleMetadata
- ✅ StaticPage auto-detects contentCards vs legacy fields
- ✅ ContentSection normalizes all item types
- ✅ services.yaml migrated to contentCards
- ✅ rental.yaml migrated to contentCards
- ✅ Backward compatibility maintained for legacy YAML

### To Deprecate (Optional)
- ⏳ Old Callout component file (aliased in ContentCard/index.ts)
- ⏳ Old WorkflowSection component file (aliased in ContentCard/index.ts)
- ⏳ Legacy callout/callouts/workflow YAML fields (still supported)

## Next Steps

1. ✅ ~~Update all direct component imports to use ContentCard~~ (Backward compatible)
2. ✅ ~~Test all pages using the components~~ (services, rental tested)
3. Consider migrating remaining pages to contentCards structure
4. Update tests to use new components and types
5. Optionally remove deprecated component files after migration period

---

**Created**: October 9, 2025  
**Last Updated**: October 9, 2025  
**Status**: ✅ Fully Implemented and Active
