# Callout Component - Quick Reference

## Overview
The `Callout` component provides a visually prominent section for important announcements, CTAs, or highlighted content in static pages.

## Location
- **Component**: `app/components/Callout/Callout.tsx`
- **Types**: `types/centralized.ts` (CalloutProps, CalloutConfig)
- **Integration**: Automatically rendered by `StaticPage` component

## Usage in YAML

Add to any static page's YAML frontmatter:

```yaml
callout:
  heading: "Your Attention-Grabbing Headline"
  text: "A compelling paragraph that provides important information or calls users to action."
  imagePosition: "right"  # Optional: 'left' | 'right' (default: 'right')
  theme: "dark"            # Optional: 'light' | 'dark' (default: 'light')
  image:                   # Optional: omit entire section for text-only callout
    url: "/images/your-callout-image.jpg"
    alt: "Descriptive alt text"
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `heading` | string | ✅ Yes | - | Main headline text |
| `text` | string | ✅ Yes | - | Paragraph content |
| `imagePosition` | 'left' \| 'right' | ❌ No | 'right' | Side where image appears |
| `theme` | 'light' \| 'dark' | ❌ No | 'light' | Color scheme |
| `image.url` | string | ❌ No | - | Path to image |
| `image.alt` | string | ❌ No | heading | Alt text for accessibility |

## Theme Options

### Light Theme (`theme: "light"`)
- 🎨 **Background**: Light gray (`bg-gray-50`)
- 📝 **Text**: Dark gray (`text-gray-700`)
- 🎯 **Best for**: Informational content, announcements
- ✨ **Appearance**: Subtle, blends with page

### Dark Theme (`theme: "dark"`)
- 🎨 **Background**: Dark gray/black (`bg-gray-900`)
- 📝 **Text**: White/light gray (`text-white`)
- 🎯 **Best for**: CTAs, urgent announcements, premium features
- ✨ **Appearance**: High contrast, stands out

## Image Position

### Right Position (`imagePosition: "right"`)
- 📖 Content on left, image on right
- ✅ Default behavior
- 🎯 Traditional left-to-right reading flow

### Left Position (`imagePosition: "left"`)
- 🖼️ Image on left, content on right
- 🎯 Visual-first approach
- ✨ Good for product/feature showcases

## Examples

### 1. CTA with Image (Dark Theme)
```yaml
callout:
  heading: "Ready to Transform Your Operations?"
  text: "Contact our team today for a free consultation and see how our solutions can help."
  imagePosition: "right"
  theme: "dark"
  image:
    url: "/images/team-consultation.jpg"
    alt: "Our expert team ready to help"
```

**Use case**: Primary call-to-action on service pages

---

### 2. Text-Only Announcement (Light Theme)
```yaml
callout:
  heading: "New Service Available"
  text: "We're excited to announce our expanded service area now covering the entire Pacific Northwest."
  theme: "light"
  # No image - will render centered text layout
```

**Use case**: Simple announcements, updates, notices

---

### 3. Product Feature (Image Left, Light Theme)
```yaml
callout:
  heading: "Advanced Laser Technology"
  text: "Our Netalux equipment delivers precision cleaning with minimal environmental impact."
  imagePosition: "left"
  theme: "light"
  image:
    url: "/images/equipment-feature.jpg"
    alt: "Netalux laser cleaning equipment"
```

**Use case**: Product/feature highlights, equipment showcases

---

### 4. Urgent Notice (Dark Theme, No Image)
```yaml
callout:
  heading: "⚠️ Important Safety Notice"
  text: "All maintenance operations are scheduled for this weekend. Services will resume Monday morning."
  theme: "dark"
```

**Use case**: Urgent alerts, maintenance notices, critical information

## Responsive Behavior

- **Mobile** (`< 768px`): 
  - Single column layout
  - Image stacks above/below text
  - Image height: 16rem (256px)
  
- **Tablet/Desktop** (`≥ 768px`):
  - Two-column grid layout
  - Image and text side-by-side
  - Image height: 20rem (320px)

## Accessibility

✅ **Built-in Features**:
- Semantic HTML structure
- Alt text for images (defaults to heading if not provided)
- High contrast ratios (WCAG AA compliant)
- Responsive font sizing
- Focus-visible states

## Integration with StaticPage

The Callout component is automatically integrated into the `StaticPage` component:

1. **YAML Config**: Add `callout:` section to page YAML
2. **Automatic Rendering**: StaticPage detects config and renders Callout
3. **Position**: Always appears **before** main markdown content
4. **Conditional**: Only renders if `callout` config exists

## TypeScript Types

```typescript
// CalloutConfig - Used in YAML frontmatter (ArticleMetadata)
interface CalloutConfig {
  heading: string;
  text: string;
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
  theme?: 'light' | 'dark';
}

// CalloutProps - Used in component
interface CalloutProps {
  heading: string;
  text: string;
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
  theme?: 'light' | 'dark';
}
```

## Common Use Cases

| Use Case | Theme | Image | Position |
|----------|-------|-------|----------|
| Call-to-Action | Dark | Yes | Right |
| Product Feature | Light | Yes | Left |
| Announcement | Light | No | N/A |
| Urgent Alert | Dark | No | N/A |
| Testimonial | Light | Yes | Right |
| New Feature | Dark | Yes | Left |

## Current Implementations

### Services Page
```yaml
# static-pages/services.yaml
callout:
  heading: "Ready to Transform Your Operations?"
  text: "Our expert team is here to help you achieve superior cleaning results..."
  imagePosition: "right"
  theme: "dark"
  image:
    url: "/images/material/copper-laser-cleaning-hero.jpg"
    alt: "Professional laser cleaning in action"
```

**Live**: `http://localhost:3002/services`

## See Also

- [Static Page Pattern Guide](./static-page-pattern.md) - Complete StaticPage documentation
- [AI Quick Reference](../AI_QUICK_REFERENCE.md) - Quick coding patterns
- [Component Map](../COMPONENT_MAP.md) - Component relationships
