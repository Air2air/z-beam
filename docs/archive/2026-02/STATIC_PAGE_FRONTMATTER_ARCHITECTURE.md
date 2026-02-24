# Static Page Frontmatter Architecture

## Overview

This document describes the new static page architecture that uses frontmatter YAML files within static page directories, similar to the article page pattern but keeping frontmatter local to each page.

## Architecture Pattern

### Before (Hardcoded)
```tsx
// app/example-page/page.tsx
export const metadata = {
  title: 'Example Page Title | Z-Beam', // ❌ Hardcoded
  description: 'Example page description...',   // ❌ Hardcoded
  // ... more hardcoded values
};

export default function Page() {
  return (
    <Layout title="Example Page">  {/* ❌ Hardcoded */}
      <BaseSection 
        title="Example Section Title"  {/* ❌ Hardcoded */}
        description="Section description..."        {/* ❌ Hardcoded */}
      >
```

### After (Frontmatter-Driven)
```tsx
// app/example-page/page.tsx
const frontmatter = loadStaticPageFrontmatter('example-page');

export const metadata = generateStaticPageMetadata({
  title: frontmatter.pageTitle,           // ✅ From YAML
  description: frontmatter.pageDescription, // ✅ From YAML
  keywords: frontmatter.keywords          // ✅ From YAML
});

export default function Page() {
  const pageConfig = loadStaticPageContent('example-page', false, true);
  
  return (
    <Layout 
      title={pageConfig.title}           // ✅ From YAML
      pageDescription={pageConfig.description} // ✅ From YAML
    >
      {pageConfig.contentCards && (
        <ContentSection items={pageConfig.contentCards} />
      )}
```

## File Structure

```
app/
├── example-page/
│   ├── page.yaml          # ✅ Frontmatter data
│   ├── page.tsx           # ✅ Component using frontmatter
│   ├── content.md         # ❌ Legacy (can be removed)
│   └── comparison-details.md # ✅ Additional content (optional)
│
├── contact/
│   ├── page.yaml          # ✅ Frontmatter data
│   ├── page.tsx           # ✅ Component using frontmatter
│   └── content.md         # ❌ Legacy (can be removed)
│
└── about/
    ├── page.yaml          # ✅ Frontmatter data
    ├── page.tsx           # ✅ Component using frontmatter
    └── content.md         # ❌ Legacy (can be removed)
```

## Frontmatter Schema

### Required Fields
```yaml
pageTitle: 'Page Title for SEO'
pageDescription: 'Page description for SEO and meta tags'
description: 'Internal description for components'
category: 'services|company|information'
subcategory: 'cleaning|rental|about|contact'
slug: 'page-slug'
```

### Optional Fields
```yaml
datePublished: '2024-01-15'
dateModified: '2025-02-11'
keywords:
  - keyword1
  - keyword2
breadcrumb:
  - label: 'Home'
    href: '/'
  - label: 'Page Name'
    href: '/page-slug'
images:
  hero:
    url: '/images/pages/page.jpg'
    alt: 'Alt text'
    width: 1920
    height: 1080
  og:
    url: '/images/pages/page-og.jpg'
    alt: 'Alt text'
    width: 1200
    height: 630
contentCards:
  - order: 1
    heading: 'Section Title'
    text: 'Section description'
    image:
      url: '/images/section.jpg'
      alt: 'Alt text'
    imagePosition: 'left|right'
    details:
      - 'Detail point 1'
      - 'Detail point 2'
schema:
  '@type': 'WebPage|AboutPage|ContactPage'
  name: 'Schema name'
  description: 'Schema description'
```

## Utility Functions

### loadStaticPageFrontmatter()
```typescript
// Load frontmatter YAML from app/[pageDirectory]/page.yaml
const frontmatter = loadStaticPageFrontmatter('example-page');
```

### loadStaticPageContent() with frontmatter
```typescript
// Load structured content from frontmatter
const pageConfig = loadStaticPageContent('example-page', false, true);
// Returns: { title, description, contentCards, slug }
```

## Migration Steps

### 1. Create Frontmatter File
Create `app/[page]/page.yaml` with all page data:

```yaml
pageTitle: 'SEO Title'
pageDescription: 'SEO Description'
# ... all other data
```

### 2. Update Page Component
Replace hardcoded values with frontmatter loading:

```tsx
import { loadStaticPageFrontmatter, loadStaticPageContent } from '../utils/staticPageLoader';

const frontmatter = loadStaticPageFrontmatter('page-name');

export const metadata = generateStaticPageMetadata({
  title: frontmatter.pageTitle,
  description: frontmatter.pageDescription,
  // ...
});
```

### 3. Update Layout Usage
Use frontmatter data in components:

```tsx
export default function Page() {
  const pageConfig = loadStaticPageContent('page-name', false, true);
  
  return (
    <Layout 
      title={pageConfig.title}
      pageDescription={pageConfig.description}
      metadata={{
        ...frontmatter,
        breadcrumb: frontmatter.breadcrumb,
        slug: frontmatter.slug
      }}
    >
```

### 4. Remove Legacy Files
After migration is complete and tested:
- Remove `content.md` files
- Update any references to old markdown loading

## Benefits

### ✅ Advantages
- **Centralized Data**: All page data in one YAML file
- **Type Safety**: Consistent structure across pages  
- **SEO Friendly**: Easy to manage meta tags and schema
- **Content Management**: Non-developers can edit YAML
- **Consistent Layout**: Reusable ContentSection pattern
- **Local to Page**: Frontmatter lives with the page code

### ✅ Maintained Benefits
- **Build-time Loading**: Still compatible with static export
- **Performance**: No runtime file system operations
- **Flexibility**: Can still use additional markdown files if needed

## Best Practices

### 1. Consistent Naming
Use consistent field names across all frontmatter files:
- `pageTitle` for SEO title
- `pageDescription` for SEO description
- `description` for component usage
- `slug` for URL slug

### 2. Image Management
Always include multiple image sizes:
- `hero`: Large format (1920x1080)
- `og`: Open Graph format (1200x630)
- `twitter`: Twitter card format (1200x630)

### 3. Content Cards
Structure content using the ContentCard pattern:
```yaml
contentCards:
  - order: 1
    heading: 'Section Title'
    text: 'Description'
    image: { url, alt }
    imagePosition: 'left|right'
    details: ['Point 1', 'Point 2']
```

### 4. Schema Integration
Include structured data in frontmatter:
```yaml
schema:
  '@type': 'WebPage'
  name: 'Page Name'
  description: 'Page Description'
  # Additional schema properties
```

## Migration Status

### ✅ Completed
- `contact` - Frontmatter file created
- `about` - Frontmatter file created

### 🔄 Pending
- Update contact/page.tsx to use frontmatter
- Update about/page.tsx to use frontmatter  
- Migrate other static pages (rental, operations, etc.)
- Remove legacy content.md files
- Update documentation

### 📋 Testing Checklist
For each migrated page:
- [ ] Page loads without errors
- [ ] SEO metadata is correct
- [ ] Content cards display properly
- [ ] Images load correctly
- [ ] Breadcrumbs work
- [ ] Schema.org markup is valid
- [ ] Mobile responsive layout
- [ ] Accessibility compliance

## Future Enhancements

### 1. Type Definitions
Create TypeScript interfaces for frontmatter structure:
```typescript
interface StaticPageFrontmatter extends ArticleMetadata {
  pageTitle: string;
  pageDescription: string;
  contentCards?: ContentCardItem[];
  comparisonSection?: {
    title: string;
    description: string;
  };
  schema?: SchemaOrgData;
}
```

### 2. Validation
Add runtime validation for frontmatter structure:
```typescript
function validateFrontmatter(data: any): StaticPageFrontmatter {
  // Validate required fields
  // Return typed data
}
```

### 3. CMS Integration
Consider integrating with headless CMS for non-technical content editing:
- Sanity.io
- Strapi
- Contentful

### 4. Build-time Validation
Add build step to validate all frontmatter files:
```bash
npm run validate:frontmatter
```

## Related Files

### Core Files
- `app/utils/staticPageLoader.ts` - Utility functions
- `lib/metadata/generators.ts` - Metadata generation
- `lib/schema/generators.ts` - Schema generation

### Legacy Files (to be removed)
- `app/*/content.md` - After migration complete
- References to `loadMarkdownContent` in page components