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

// ❌ NEVER hardcode paths
const imageSrc = "/images/default.jpg";

// ❌ NEVER manual string checking  
const title = data.title || "";

// ❌ NEVER import from relative paths for types
import { SomeType } from "./localTypes";
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

---

## 🎯 **KEY COMPONENTS & THEIR TYPES**

| Component | Props Type | Key Props | Notes |
|-----------|------------|-----------|-------|
| `CardGrid` | `CardGridProps` | `articles`, `mode`, `columns` | Mode: simple/category-grouped/search-results |
| `Card` | `CardProps` | `frontmatter`, `href`, `variant` | Variant: standard/compact/featured/preview |
| `Caption` | `CaptionProps` | `frontmatter` | Auto-parses caption data formats |
| `MetricsCard` | `MetricsCardProps` | `title`, `data`, `mode` | Displays technical metrics |
| `ProgressBar` | `ProgressBarProps` | `min`, `max`, `value`, `title` | Auto-calculates percentages |

---

## 🔧 **UTILITY FUNCTIONS**

| Function | Import From | Use When |
|----------|-------------|----------|
| `extractSafeValue()` | `@/utils/stringHelpers` | Processing unknown string data |
| `cleanupFloat()` | `@/utils/formatting` | Displaying numbers |
| `capitalizeWords()` | `@/utils/formatting` | Formatting display text |
| `slugToDisplayName()` | `@/utils/formatting` | Converting slugs to readable text |

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
- Create `content/pages/mypage.yaml` (config + hero image + optional callout)
- Create `content/components/text/mypage.md` (markdown content)
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