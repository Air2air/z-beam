# Static Page Pattern Documentation

## Overview

The `StaticPage` component is a reusable page template for simple static content pages that load from YAML configuration and markdown content files.

## Architecture

### Component Location
- **Component**: `app/components/StaticPage/StaticPage.tsx`
- **Index Export**: `app/components/StaticPage/index.ts`

### Data Sources
- **Configuration**: `content/pages/{slug}.yaml` - Page metadata, hero images, settings
- **Content**: `content/components/text/{slug}.md` - Markdown page content

## When to Use StaticPage

✅ **Use StaticPage when:**
- Page has simple YAML config + markdown content
- No custom React components needed
- Standard layout with optional hero image
- Examples: `/services`, `/rental`

❌ **Don't use StaticPage when:**
- Page has custom React components (forms, interactive widgets)
- Page uses `loadPageData` with component arrays
- Dynamic routes with parameters `[slug]` or `[category]`
- Examples: `/contact` (has ContactForm), `/about` (uses loadPageData)

## Implementation

### Step 1: Create YAML Configuration

Create `content/pages/{slug}.yaml`:

```yaml
title: "Your Page Title"
description: "SEO description for the page"
showHero: true
images:
  hero:
    url: "/images/hero/your-image.jpg"
    alt: "Hero image description"
    width: 1920
    height: 600

# Optional: Add a callout section (appears before main content)
callout:
  heading: "Important Announcement"
  text: "This is a highlighted message that appears prominently on the page with optional image support."
  imagePosition: "right"  # Options: 'left' or 'right'
  theme: "navbar"          # Options: 'body' or 'navbar'
  image:
    url: "/images/callout-image.jpg"
    alt: "Callout image description"
```

### Step 2: Create Markdown Content

Create `content/components/text/{slug}.md`:

```markdown
# Page Content

Your markdown content here...

## Section 1
Content for section 1...

## Section 2
Content for section 2...
```

### Step 3: Create Page Component

Create `app/{slug}/page.tsx`:

```typescript
// app/your-page/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/utils/constants";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Your Page | ${SITE_CONFIG.shortName}`,
  description: "SEO description for search engines",
};

export default async function YourPage() {
  return (
    <StaticPage 
      slug="your-page" 
      fallbackTitle="Your Page Title"
      fallbackDescription={metadata.description}
    />
  );
}
```

## Component API

### Props

```typescript
interface StaticPageProps {
  /** 
   * Slug for the page (e.g., 'services', 'rental')
   * Used to load both YAML config and markdown content 
   */
  slug: string;
  
  /** Optional fallback title if YAML doesn't have one */
  fallbackTitle?: string;
  
  /** Optional fallback description if YAML doesn't have one */
  fallbackDescription?: string;
}
```

## Current Implementations

### Services Page
- **Route**: `/services`
- **Config**: `content/pages/services.yaml`
- **Content**: `content/components/text/services.md`
- **Features**: Hero image, markdown content

### Rental Page
- **Route**: `/rental`
- **Config**: `content/pages/rental.yaml`
- **Content**: `content/components/text/rental.md`
- **Features**: Hero image, markdown content

## Hero Image Configuration

Hero images are automatically rendered when:
1. `showHero: true` in YAML config
2. `images.hero.url` is defined in YAML config

The Layout component checks both conditions and renders the Hero component accordingly.

## Callout Component

The `Callout` component provides a visually prominent section for important announcements, CTAs, or highlighted content.

### Features
- **Flexible Layout**: Image on left or right side
- **Theme Support**: Light or dark color schemes
- **Responsive**: Automatically adapts to mobile/tablet/desktop
- **Optional Image**: Works with or without an image

### Configuration

#### Single Callout

Add to your YAML frontmatter:

```yaml
callout:
  heading: "Your Attention-Grabbing Headline"
  text: "A compelling paragraph that provides important information or calls users to action."
  imagePosition: "right"  # Options: 'left' | 'right' (default: 'right')
  theme: "navbar"          # Options: 'body' | 'navbar' (default: 'navbar')
  variant: "default"       # Options: 'default' | 'inline' (default: 'default')
  image:                   # Optional: omit for text-only callout
    url: "/images/your-callout-image.jpg"
    alt: "Descriptive alt text"
```

#### Multiple Callouts

For pages with multiple callouts, use the `callouts` array:

```yaml
callouts:
  - heading: "First Callout"
    text: "This appears first with default spacing."
    theme: "body"
    variant: "default"  # Has padding, margin, shadow
    
  - heading: "Second Callout"
    text: "This appears second with inline variant for seamless flow."
    theme: "navbar"
    variant: "inline"  # No outer margin/shadow, flows naturally
    imagePosition: "left"
    image:
      url: "/images/inline-callout.jpg"
      alt: "Inline callout image"
```

### Theme Options

**Body Theme** (`theme: "body"`):
- Matches main body background (`bg-gray-700`)
- White text on medium gray background
- Consistent with page body
- Best for CTAs and important announcements that need to stand out

**Navbar Theme** (`theme: "navbar"`):
- Matches navigation bar background (`bg-white dark:bg-gray-800`)
- Dark text in light mode, light text in dark mode
- Adapts to user's theme preference
- Best for informational content that blends with the UI

### Variant Options

**Default Variant** (`variant: "default"`):
- Full padding and margin
- Drop shadow for visual separation
- Use for primary callouts that should stand out
- Best for CTA sections and announcements

**Inline Variant** (`variant: "inline"`):
- No outer vertical margin
- No drop shadow
- Internal padding preserved for content
- Seamlessly integrates into page flow
- Perfect for second/third callouts or content sections

### Image Position

**Right Position** (`imagePosition: "right"`):
- Text on left, image on right
- Default behavior
- Traditional reading flow

**Left Position** (`imagePosition: "left"`):
- Image on left, text on right
- Visual-first approach
- Good for product showcases

### Examples

#### CTA with Image (Body Theme)
```yaml
callout:
  heading: "Ready to Get Started?"
  text: "Contact our team today for a free consultation and see how our solutions can help."
  imagePosition: "right"
  theme: "body"  # Stands out with body background color
  image:
    url: "/images/team-consultation.jpg"
    alt: "Our expert team ready to help"
```

#### Announcement without Image (Navbar Theme)
```yaml
callout:
  heading: "New Service Available"
  text: "We're excited to announce our expanded service area now covering the entire Pacific Northwest region."
  theme: "navbar"  # Blends with UI, adapts to light/dark mode
  # No image specified - will render as centered text
```

#### Product Feature (Image Left, Navbar Theme)
```yaml
callout:
  heading: "Advanced Laser Technology"
  text: "Our Netalux equipment delivers precision cleaning with minimal environmental impact."
  imagePosition: "left"
  theme: "navbar"
  image:
    url: "/images/equipment-feature.jpg"
    alt: "Netalux laser cleaning equipment"
```

#### Multiple Callouts on One Page
```yaml
# services.yaml example with multiple callouts
callouts:
  # Primary CTA - default variant with full spacing
  - heading: "Ready to Transform Your Operations?"
    text: "Contact us today for a free consultation."
    theme: "body"
    variant: "default"
    imagePosition: "right"
    image:
      url: "/images/cta-image.jpg"
      alt: "Call to action"
  
  # Secondary information - inline variant flows naturally
  - heading: "Why Choose Our Services?"
    text: "We combine cutting-edge technology with decades of expertise."
    theme: "navbar"
    variant: "inline"
    imagePosition: "left"
    image:
      url: "/images/expertise.jpg"
      alt: "Our expertise"
  
  # Tertiary information - inline variant, no image
  - heading: "Certified & Insured"
    text: "All our technicians are certified professionals with comprehensive insurance coverage."
    theme: "navbar"
    variant: "inline"
```

## Benefits of This Pattern

1. **DRY Principle**: No code duplication across static pages
2. **Consistency**: All static pages use the same rendering logic
3. **Maintainability**: Update one component, all pages benefit
4. **Type Safety**: TypeScript ensures correct prop types
5. **Documentation**: Clear usage patterns for AI assistants

## Migration Guide

To convert an existing static page:

### Before (Duplicated Code):
```typescript
import { Layout } from "../components/Layout/Layout";
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

export default async function MyPage() {
  const yamlPath = path.join(process.cwd(), 'content/pages/mypage.yaml');
  const yamlContent = await fs.readFile(yamlPath, 'utf8');
  const pageConfig = yaml.load(yamlContent) as ArticleMetadata & { showHero?: boolean };
  
  const mdPath = path.join(process.cwd(), 'content/components/text/mypage.md');
  const markdownContent = await fs.readFile(mdPath, 'utf8');
  const htmlContent = marked(markdownContent);
  
  return (
    <Layout
      title={pageConfig.title || "My Page"}
      description={pageConfig.description}
      showHero={pageConfig.showHero ?? false}
      metadata={pageConfig}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert" 
           dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </Layout>
  );
}
```

### After (Reusable Component):
```typescript
import { StaticPage } from "../components/StaticPage/StaticPage";

export default async function MyPage() {
  return (
    <StaticPage 
      slug="mypage" 
      fallbackTitle="My Page"
    />
  );
}
```

**Result**: ~35 lines → ~8 lines (77% reduction)

## AI Assistant Guidelines

When creating new static pages:

1. **Check if page is truly static** - No custom React components
2. **Create YAML + MD files first** - Configuration and content
3. **Use StaticPage component** - Import from `../components/StaticPage/StaticPage`
4. **Pass correct slug** - Must match YAML and MD filenames
5. **Set proper metadata** - For SEO and social sharing
6. **Include static exports** - `dynamic = 'force-static'` and `revalidate = false`

## Related Documentation

- [Hero Image Guide](./hero-image-guide.md) - Comprehensive hero image implementation
- [Component Map](../COMPONENT_MAP.md) - Component relationship overview
- [AI Quick Reference](../AI_QUICK_REFERENCE.md) - Critical coding rules
