# AI Assistant Quick Reference

**⚡ CRITICAL RULES for AI when working with Z-Beam codebase**

> **📍 LOCATION:** This file should be read FIRST when working on the Z-Beam codebase  
> **🔗 Referenced in:** README.md, GROK_INSTRUCTIONS.md  
> **🎯 PURPOSE:** Prevent common AI coding mistakes and enforce project patterns

---

## 🚨 **NEVER DO THIS**

```tsx
// ❌ NEVER create local interfaces
interface MyComponentProps {
  title: string;
}

// ❌ NEVER hardcode paths or colors
const imageSrc = "/images/default.jpg";
const color = "#ff6811";  // Use bg-brand-orange instead

// ❌ NEVER manual string checking  
const title = data.title || "";

// ❌ NEVER import from relative paths for types
import { SomeType } from "./localTypes";

// ❌ NEVER use dangerouslySetInnerHTML (security risk)
<div dangerouslySetInnerHTML={{ __html: content }} />

// ❌ NEVER create CSS files for simple styling
// styles.css: .my-class { position: absolute; }  // Use Tailwind!

// ❌ NEVER use raw HTML tags in content components
<h1>Title</h1>  // Use Typography.H1
<p>Content</p>  // Use Typography.P
```

---

## ✅ **ALWAYS DO THIS**

```tsx
// ✅ ALWAYS use StaticPage for simple YAML+MD pages
import { StaticPage } from "../components/StaticPage/StaticPage";

export default async function MyPage() {
  return <StaticPage slug="mypage" fallbackTitle="My Page" />;
}
```

```tsx
// ✅ Import types from centralized location
import type { MyComponentProps } from '@/types';

// ✅ Use SITE_CONFIG constants
import { SITE_CONFIG } from '@/utils/constants';
const imageSrc = SITE_CONFIG.images.default;

// ✅ Use safe string extraction
import { extractSafeValue } from '@/utils/stringHelpers';
const title = extractSafeValue(data.title);

// ✅ Follow import pattern
import React from 'react';
import type { ComponentProps } from '@/types';
import { utilityFunction } from '@/utils/specificUtil';
```

```tsx
// ✅ Use Typography components for content
import { H1, H2, P, A } from '@/components/Typography';
<H1>Page Title</H1>
<P>Content with <A href="/link">link</A></P>

// ✅ Use MarkdownRenderer for markdown strings
import { MarkdownRenderer } from '@/components/Base/MarkdownRenderer';
<MarkdownRenderer content={markdownString} convertMarkdown={true} />

// ✅ Use Tailwind for styling (inline utilities)
<div className="absolute top-2 right-2 z-[100] bg-brand-orange text-white rounded-lg">

// ✅ Use brand colors from Tailwind config
<div className="bg-brand-orange text-brand-orange border-brand-orange">

// ✅ Use optional chaining for type safety
const value = metrics?.totalRequests ?? 0;
```

---

## 🎯 **KEY COMPONENTS & THEIR TYPES**

| Component | Props Type | Key Props | Notes |
|-----------|------------|-----------|-------|
| `CardGrid` | `CardGridProps` | `articles`, `mode`, `columns` | Mode: simple/category-grouped/search-results |
| `Card` | `CardProps` | `frontmatter`, `href`, `variant` | Variant: standard/compact/featured/preview |
| `HeroCard` | `HeroCardProps` | `image`, `title`, `items?` | Hero image section with badge list |
| `Micro` | `MicroProps` | `text` | Subtitle/eyebrow text |
| `ContentCard` | `ContentCardProps` | `image?`, `alt?`, `title`, `children` | Flexible content display |
| `MetricsCard` | `MetricsCardProps` | `title`, `data`, `mode` | Displays technical metrics |
| `ProgressBar` | `ProgressBarProps` | `min`, `max`, `value`, `title` | Auto-calculates percentages |
| `H1` - `H6` | `TypographyProps` | `className?`, `children` | Semantic heading components |
| `P`, `A`, `Strong`, `Em` | `TypographyProps` | `className?`, `children`, `href?` | Semantic text components |
| `MarkdownRenderer` | `MarkdownRendererProps` | `content`, `convertMarkdown?` | Markdown to component rendering |

---

## 🔧 **UTILITY FUNCTIONS**

| Function | Import From | Use When |
|----------|-------------|----------|
| `extractSafeValue()` | `@/utils/stringHelpers` | Processing unknown string data |
| `cleanupFloat()` | `@/utils/formatting` | Displaying numbers |
| `capitalizeWords()` | `@/utils/formatting` | Formatting display text |
| `slugToDisplayName()` | `@/utils/formatting` | Converting slugs to readable text |
| `getMaterialColor()` | `@/utils/badgeColors` | Client-safe material color mapping |
| `logger` | `@/utils/logger` | Script logging (debug/info/warn/error) |

---

## � **REUSABLE PAGE PATTERNS**

### **Static Page (YAML + Markdown):**
Use `StaticPage` for simple pages with YAML config and markdown content:

```tsx
// app/mypage/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/utils/constants";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `My Page | ${SITE_CONFIG.shortName}`,
  description: "SEO description",
};

export default async function MyPage() {
  return (
    <StaticPage 
      slug="mypage" 
      fallbackTitle="My Page"
      fallbackDescription={metadata.description}
    />
  );
}
```

**Requirements:**
- Create `static-pages/mypage.yaml` (config + hero image + optional callout)
- Create `[REMOVED] content/components/text/mypage.md` (markdown content)
- No custom React components needed

**Optional Callout Section(s):**
Single callout:
```yaml
callout:
  heading: "Important Announcement"
  text: "Your compelling message here."
  imagePosition: "right"  # 'left' or 'right'
  theme: "body"            # 'body' (gray-700) or 'navbar' (white/gray-800)
  variant: "default"       # 'default' (padded) or 'inline' (no outer margin)
  image:
    url: "/images/callout.jpg"
    alt: "Image description"
```

Multiple callouts:
```yaml
callouts:
  - heading: "First Callout"
    text: "Primary CTA with full spacing."
    theme: "body"
    variant: "default"
  - heading: "Second Callout"
    text: "Inline variant flows naturally."
    theme: "navbar"
    variant: "inline"
```

**Examples:** `/services`, `/rental`

**See:** [Static Page Pattern Guide](./guides/static-page-pattern.md)

---

## �📋 **COMPONENT TEMPLATES**

### **Basic Component:**
```tsx
/**
 * @component ComponentName
 * @purpose Brief description
 * @dependencies @/types (ComponentProps), @/utils/needed
 * @aiContext Key usage notes for AI
 */
import React from 'react';
import type { ComponentProps } from '@/types';
import { SITE_CONFIG } from '@/utils/constants';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  return (
    <div className="component-wrapper">
      {/* Component content */}
    </div>
  );
}
```

### **Component with Data Processing:**
```tsx
import React from 'react';
import type { ComponentProps } from '@/types';
import { extractSafeValue } from '@/utils/stringHelpers';

export function ComponentName({ data }: ComponentProps) {
  const safeTitle = extractSafeValue(data?.title);
  const safeDescription = extractSafeValue(data?.description);
  
  return (
    <div>
      <h2>{safeTitle}</h2>
      <p>{safeDescription}</p>
    </div>
  );
}
```

---

## 🎨 **CSS & STYLING**

```scss
// Use CSS custom properties from SITE_CONFIG
.component {
  background: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}

// Follow BEM naming
.card {
  &__header { }
  &__content { }
  &--featured { }
}
```

---

## 🔍 **DEBUGGING CHECKLIST**

When AI-generated code has issues:

1. ✅ **Types imported from `@/types`?**
2. ✅ **Using `extractSafeValue()` for strings?**
3. ✅ **Constants from `SITE_CONFIG`?**
4. ✅ **Proper import order?**
5. ✅ **Component header documentation?**

---

## 📊 **CURRENT STATUS**

- **TypeScript Errors:** 23 (mostly cache safety, not type issues)
- **Centralized Types:** ✅ 1,830+ lines in `types/centralized.ts`  
- **Component Props:** ✅ All major components use centralized types
- **Utility Functions:** ✅ Consolidated in `@/utils/*`

---

**🎯 GOAL:** Generate consistent, bug-free code that follows Z-Beam patterns