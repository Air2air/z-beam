# Z-Beam Implementation Standards

## Overview
This document defines the standardized patterns for all pages across the Z-Beam project. **ALL content types** (materials, settings, pages, etc.) must follow these standards.

## 🎯 Core Principle
**"Follow the materials page pattern"**

The materials page implementation at `/app/materials/[category]/[subcategory]/[slug]/page.tsx` serves as the **reference implementation** for all pages in the project.

---

## 1. Author Implementation (REQUIRED)

### Standard Pattern
All pages MUST include author metadata with E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals.

### YAML Frontmatter Structure
```yaml
author:
  name: "Todd Dunning"
  jobTitle: "Laser Systems Engineer"  # REQUIRED - Establishes expertise
  description: "Industrial laser specialist with 15+ years experience in laser cleaning applications and material science"  # REQUIRED - Provides context
  expertise:  # REQUIRED - Demonstrates specialization
    - "Laser cleaning process optimization"
    - "Material-specific parameter development"
    - "Industrial surface treatment"
  url: "https://z-beam.com/about"
  email: "todd@z-beam.com"
  image: "/images/authors/todd-dunning.jpg"
  
  # Optional but recommended
  credentials:
    - "M.S. Laser Physics, MIT"
    - "Professional Member, Laser Institute of America"
  publications:
    - "Advanced Laser Cleaning Techniques (2023)"
  yearsExperience: 15
```

### Component Usage
```tsx
// Author component is AUTO-INCLUDED via Layout component
// DO NOT manually implement - Layout handles it automatically

import { Layout } from "@/app/components/Layout/Layout";

// Layout component automatically renders Author based on metadata.author
<Layout 
  components={components} 
  metadata={article.metadata}
  slug={slug}
>
  {/* Your content */}
</Layout>
```

### Why Required
1. **Google E-E-A-T**: Core ranking factor for YMYL content
2. **Backlink Trust**: Credibility signal for linking sites
3. **User Confidence**: Establishes content authority
4. **Schema.org**: Person markup for SEO
5. **Standardization**: Consistent across entire site

### Reference Implementation
- **File**: `/app/components/Author/Author.tsx`
- **Usage**: See any material page (e.g., `/app/materials/metal/non-ferrous/aluminum-laser-cleaning/`)
- **Schema**: Person schema.org markup automatically generated

---

## 2. Layout Implementation (REQUIRED)

### Standard Pattern
All pages MUST use the Layout component, which automatically includes:
- **Navigation** (Nav component)
- **Page Title** (Title component)
- **Footer** (Footer component)
- **Breadcrumbs** (Breadcrumbs component)
- **Date Metadata** (DateMetadata component)
- **Author** (Author component with E-E-A-T)

### Component Usage
```tsx
import { Layout } from "@/app/components/Layout/Layout";
import type { ArticleMetadata } from "@/app/utils/metadata";

export default async function YourPage({ params }: YourPageProps) {
  const article = await getArticle(slug);
  
  return (
    <>
      {/* Schema.org JSON-LD */}
      <MaterialJsonLD article={article} slug={slug} />
      
      {/* Layout wraps all content */}
      <Layout 
        components={article.components}  // Article components from YAML
        metadata={article.metadata as ArticleMetadata}  // Frontmatter metadata
        slug={slug}  // Full path for routing/breadcrumbs
      >
        {/* Your page-specific content here */}
        <YourContent />
      </Layout>
    </>
  );
}
```

### What Layout Provides
| Element | Component | Purpose |
|---------|-----------|---------|
| Navigation | Nav | Site-wide navigation bar |
| Title | Title | Page title with proper hierarchy |
| Footer | Footer | Site-wide footer |
| Breadcrumbs | Breadcrumbs | Navigation trail |
| DateMetadata | DateMetadata | Published/updated timestamps |
| Author | Author | E-E-A-T author component |

### DO NOT
- ❌ Manually implement Nav, Title, or Footer
- ❌ Bypass Layout component
- ❌ Duplicate Layout functionality
- ❌ Create custom layout patterns

### Reference Implementation
- **File**: `/app/components/Layout/Layout.tsx`
- **Usage**: All materials pages use this exact pattern

---

## 3. Content Structure Standards

### SectionContainer (REQUIRED)
All major content sections MUST use SectionContainer for consistent styling and spacing.

```tsx
import { SectionContainer } from "@/app/components/SectionContainer/SectionContainer";

<SectionContainer 
  title="Section Title"  // Section heading
  className="mb-12"       // Additional spacing
  bgColor="navbar"        // Optional: background color
  horizPadding={true}     // Optional: horizontal padding
  radius={true}           // Optional: rounded corners
  icon={<YourIcon />}     // Optional: title icon
>
  {/* Section content */}
</SectionContainer>
```

### Spacing Standards
```tsx
import { CONTAINER_STYLES } from "@/app/utils/containerStyles";

// Article container
<article className={CONTAINER_STYLES.article}>
  {/* Content */}
</article>

// Spacer between sections
<div className="h-8 sm:h-12 md:h-16" />
```

### Content Flow Pattern
1. **Hero Section** - Images, title, subtitle (Hero component)
2. **Main Content** - Overview, description (MarkdownRenderer)
3. **Data Sections** - Wrapped in SectionContainer
4. **Related Content** - Cross-links, comparisons

### Example Structure
```tsx
<Layout components={components} metadata={metadata} slug={slug}>
  {/* 1. Hero Section */}
  <Hero 
    image={metadata.images?.hero}
    title={metadata.title}
    subtitle={metadata.subtitle}
  />
  
  {/* 2. Main Content */}
  <article className={CONTAINER_STYLES.article}>
    <MarkdownRenderer content={content} />
  </article>
  
  {/* 3. Data Sections */}
  <BaseSection title="Machine Settings" spacing="normal">
    <PropertyBars metadata={metadata} dataSource="machineSettings" />
  </BaseSection>
  
  <BaseSection title="Material Properties" spacing="normal">
    <PropertyBars metadata={metadata} dataSource="materialProperties" />
  </BaseSection>
  
  {/* 4. Related Content */}
  <BaseSection title="Related Materials" spacing="normal">
    <RelatedMaterials currentSlug={slug} />
  </BaseSection>
</Layout>
```

---

## 4. Component Usage Standards

### PropertyBars (Metrics Display)
Use for displaying parameters, settings, or metrics.

```tsx
import { PropertyBars } from "@/app/components/PropertyBars/PropertyBars";

<SectionContainer title="Machine Settings">
  <PropertyBars 
    metadata={metadata}
    dataSource="machineSettings"  // or "materialProperties"
    showTitle={false}              // Title handled by SectionContainer
    searchable={true}              // Enable search functionality
  />
</SectionContainer>
```

### MarkdownRenderer (Content Display)
Use for rendering markdown content from YAML.

```tsx
import { MarkdownRenderer } from "@/app/components/Base/MarkdownRenderer";

<MarkdownRenderer content={article.content} />
```

### Hero Component
Use for page headers with images.

```tsx
import { Hero } from "@/app/components/Hero/Hero";

<Hero 
  image={metadata.images?.hero}
  title={metadata.title}
  subtitle={metadata.subtitle}
  micro={metadata.micro}
/>
```

### RegulatoryStandards
Use for displaying compliance information.

```tsx
import { RegulatoryStandards } from "@/app/components/RegulatoryStandards";

{metadata.regulatoryStandards && (
  <SectionContainer title="Regulatory Standards">
    <RegulatoryStandards standards={metadata.regulatoryStandards} />
  </SectionContainer>
)}
```

### MaterialFAQ
Use for FAQ sections.

```tsx
import { MaterialFAQ } from "@/app/components/FAQ/MaterialFAQ";

{metadata.faq && (
  <SectionContainer title="Frequently Asked Questions">
    <MaterialFAQ faqs={metadata.faq} materialName={metadata.name} />
  </SectionContainer>
)}
```

---

## 5. Metadata Standards

### ArticleMetadata Type
All pages must provide metadata conforming to ArticleMetadata type.

```typescript
import type { ArticleMetadata } from "@/app/utils/metadata";

const metadata: ArticleMetadata = {
  title: "Page Title",
  description: "Page description",
  slug: "page-slug",
  author: {
    name: "Todd Dunning",
    jobTitle: "Laser Systems Engineer",
    description: "...",
    expertise: [...]
  },
  // ... other fields
};
```

### createMetadata Utility
Use for generating Next.js metadata.

```tsx
import { createMetadata } from "@/app/utils/metadata";

export async function generateMetadata({ params }: PageProps) {
  const article = await getArticle(params.slug);
  
  return createMetadata({
    ...article.metadata,
    canonical: `/your-path/${params.slug}`
  } as ArticleMetadata);
}
```

---

## 6. Schema.org / JSON-LD Standards

### Standard Pattern
All pages must include appropriate schema.org markup.

```tsx
import { MaterialJsonLD } from "@/app/components/JsonLD/JsonLD";

export default async function YourPage({ params }: PageProps) {
  return (
    <>
      {/* Schema.org JSON-LD - Place before Layout */}
      <MaterialJsonLD 
        article={article} 
        slug={`your-path/${params.slug}`} 
      />
      
      <Layout>
        {/* Content */}
      </Layout>
    </>
  );
}
```

### Available JSON-LD Components
- `MaterialJsonLD` - For material pages
- `HowToJsonLD` - For tutorial/process pages
- `FAQJsonLD` - For FAQ pages
- `PersonJsonLD` - Auto-generated from author metadata

---

## 7. Reference Implementation

### Primary Reference
**File**: `/app/materials/[category]/[subcategory]/[slug]/page.tsx`

This file demonstrates ALL standards:
- ✅ Author metadata with E-E-A-T
- ✅ Layout component usage
- ✅ SectionContainer for sections
- ✅ PropertyBars for metrics
- ✅ MarkdownRenderer for content
- ✅ Schema.org JSON-LD
- ✅ Proper metadata generation
- ✅ Component hierarchy

### How to Use This Reference
1. Open `/app/materials/[category]/[subcategory]/[slug]/page.tsx`
2. Copy the overall structure
3. Adapt content sections to your needs
4. Maintain all Layout patterns
5. Keep Author implementation identical
6. Use same component patterns

---

## 8. Checklist for New Pages

Before creating a new page type, verify:

- [ ] Author metadata with `jobTitle` and `description` in YAML
- [ ] Layout component wraps all content
- [ ] SectionContainer used for all major sections
- [ ] PropertyBars used for metrics/parameters (if applicable)
- [ ] MarkdownRenderer used for markdown content
- [ ] Schema.org JSON-LD component included
- [ ] Metadata conforms to ArticleMetadata type
- [ ] CONTAINER_STYLES and SPACER_CLASSES used for spacing
- [ ] No manual Nav, Title, or Footer implementation
- [ ] Follows materials page content flow pattern

---

## 9. Common Mistakes to Avoid

### ❌ Don't Do This
```tsx
// Manual navigation implementation
<nav>...</nav>

// Manual title implementation
<h1>{title}</h1>

// Manual footer implementation
<footer>...</footer>

// Bypassing Layout
export default function MyPage() {
  return <div>...</div>;  // Missing Layout
}

// Missing Author metadata
const metadata = {
  title: "...",
  // No author field!
};

// Manual sections without SectionContainer
<div className="my-section">
  <h2>Section Title</h2>
  {/* Content */}
</div>
```

### ✅ Do This Instead
```tsx
// Use Layout (includes Nav, Title, Footer automatically)
export default function MyPage() {
  return (
    <Layout components={components} metadata={metadata} slug={slug}>
      {/* Your content */}
    </Layout>
  );
}

// Include Author metadata
const metadata = {
  title: "...",
  author: {
    name: "Todd Dunning",
    jobTitle: "Laser Systems Engineer",
    description: "...",
    expertise: [...]
  }
};

// Use SectionContainer
<SectionContainer title="Section Title">
  {/* Content */}
</SectionContainer>
```

---

## 10. Questions & Support

### Where to Look
1. **Reference Implementation**: `/app/materials/[category]/[subcategory]/[slug]/page.tsx`
2. **Component Docs**: `/app/components/[ComponentName]/README.md`
3. **Type Definitions**: `/types/centralized.ts`
4. **This Document**: `/docs/IMPLEMENTATION_STANDARDS.md`

### Common Questions

**Q: Do I need to implement navigation?**
A: No. Layout component handles it automatically.

**Q: How do I add author information?**
A: Add `author` field to YAML frontmatter with `jobTitle`, `description`, and `expertise`. Layout component renders it automatically.

**Q: Can I create a custom layout?**
A: No. All pages must use the Layout component for consistency.

**Q: What if my page doesn't need sections?**
A: You still use SectionContainer for any major content groupings. It provides consistent styling.

**Q: How do I display machine settings?**
A: Use PropertyBars component with `dataSource="machineSettings"` wrapped in SectionContainer.

---

## 11. Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-10 | 1.0 | Initial standards document based on materials page implementation |

---

## 12. Enforcement

These standards are **mandatory** for all new pages and should be applied to existing pages during refactoring.

- All pull requests must conform to these standards
- Code reviews should verify Layout usage
- All new content types require Author metadata
- SectionContainer is non-negotiable for sections

**Rationale**: Consistency enables scalability, maintainability, and SEO optimization across the entire site.
