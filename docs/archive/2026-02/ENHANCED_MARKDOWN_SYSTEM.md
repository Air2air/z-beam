# Enhanced Markdown Content System

## Overview

The enhanced markdown content system allows you to pass markdown content as props to components and use additional markdown files within static page directories. This provides greater flexibility for complex page layouts and component-specific content.

## Basic Usage (Current Pattern)

### Standard Static Pages
All static pages use the normalized pattern with content.md files:

```tsx
import { loadStaticPageContent } from "../utils/staticPageLoader";

const pageConfig = loadStaticPageContent('contact');

export default function ContactPage() {
  return (
    <Layout title={pageConfig.title} pageDescription={pageConfig.description}>
      {pageConfig.contentCards && pageConfig.contentCards.length > 0 && (
        <ContentSection items={pageConfig.contentCards as ContentCardItem[]} />
      )}
    </Layout>
  );
}
```

## Enhanced Usage (Flexible Markdown)

### 1. Enhanced Content Loading
Use the enhanced loader to access both main content and additional markdown files:

```tsx
import { parseSurfaceCleaningContentEnhanced } from "../utils/staticPageLoader";

const enhancedPageData = parseExampleContentEnhanced();
```

### 2. Additional Markdown Files
Place additional .md files in your page directory:

```
app/example-page/
├── content.md           // Main content (standard format)
├── comparison-details.md // Additional content
├── safety-info.md       // Additional content
└── page.tsx
```

### 3. MarkdownContent Component
Use the MarkdownContent component to render additional markdown as props:

```tsx
import MarkdownContent from '@/components/MarkdownContent';

{enhancedPageData.additionalContent['comparison-details'] && (
  <MarkdownContent
    title={enhancedPageData.additionalContent['comparison-details'].title}
    sections={enhancedPageData.additionalContent['comparison-details'].sections}
  />
)}
```

## Enhanced Data Structure

The enhanced loader returns:

```typescript
{
  title: string;
  description: string;
  contentCards: ContentCardItem[];
  additionalContent: Record<string, {
    title?: string;
    content: string; // Raw markdown
    sections: Array<{
      heading: string;
      content: string;
      list?: string[];
    }>;
  }>;
}
```

## Additional Markdown Format

Additional markdown files should follow this structure:

```markdown
# Main Title

## Section 1
Content for section 1 here.

- List item 1
- List item 2

## Section 2
Content for section 2 here.
```

## MarkdownContent Component Props

```typescript
interface MarkdownContentProps {
  title?: string;
  sections: MarkdownSectionProps[];
  className?: string;
  children?: ReactNode;
}

interface MarkdownSectionProps {
  heading: string;
  content: string;
  list?: string[];
}
```

## Component Features

- **Automatic styling** with BaseSection wrapper
- **Responsive typography** with prose classes
- **List rendering** with proper spacing
- **Custom styling** via className prop
- **Additional children** support

## Example Implementation

See any enhanced page directory for a complete example:

1. `content.md` - Main content using standard format
2. `additional-content.md` - Additional detailed content
3. `page.tsx` - Shows both standard and enhanced usage

## Benefits

1. **Content separation** - Split complex pages into logical sections
2. **Component flexibility** - Pass markdown content as props to any component
3. **Maintainable structure** - Keep related content together in page directories
4. **Backward compatibility** - Works alongside existing normalized pattern
5. **Type safety** - Full TypeScript support for content structures

## Migration Path

1. **Keep existing pages** using the standard pattern
2. **Add enhanced loading** only where needed for complex layouts
3. **Create additional .md files** for component-specific content
4. **Use MarkdownContent component** to render additional content

The system is designed to be backward compatible and optional - use it only where you need the additional flexibility.