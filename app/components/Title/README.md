# PageTitle Component

## Overview

The PageTitle component is an extended variant of the Title component with full-width description support. It provides a comprehensive, WCAG 2.1 AAA compliant page title implementation with optional description text and action buttons.

## Props (TitleProps)

```typescript
interface TitleProps {
  title: string;                    // Page title text
  level?: 'page' | 'section' | 'card'; // Semantic heading level (default: 'page')
  alignment?: 'left' | 'center' | 'right'; // Text alignment
  className?: string;               // Additional CSS classes
  id?: string;                      // Custom element ID
  page_description?: string;        // Description text displayed below title
  rightContent?: ReactNode;         // Optional content for right side (replaces default button)
  
  // WCAG & Accessibility Props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  role?: string;
  tabIndex?: number;
  
  // Search & SEO Props
  searchKeywords?: string[];
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  
  // Navigation Props
  skipLink?: boolean;               // Add skip link for keyboard navigation
  landmark?: boolean;               // Mark as ARIA landmark
  nextHeaderId?: string;            // ID of next header for keyboard nav
  prevHeaderId?: string;            // ID of previous header for keyboard nav
  
  // Content Props
  context?: string;                 // Additional context for SEO
  
  // Event Handlers
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
}
```

## Usage

### Basic Usage

```tsx
import { PageTitle } from '@/app/components/Title';

export default function Page() {
  return (
    <PageTitle 
      title="Laser Cleaning Materials"
      page_description="Comprehensive database of materials suitable for laser cleaning"
    />
  );
}
```

### With Custom Right Content

```tsx
<PageTitle 
  title="Machine Settings"
  page_description="Optimal laser parameters for different materials"
  rightContent={<CustomButton />}
/>
```

### With Accessibility Features

```tsx
<PageTitle 
  title="Technical Documentation"
  page_description="In-depth guides for laser cleaning processes"
  level="page"
  skipLink={true}
  landmark={true}
  searchKeywords={['laser', 'cleaning', 'documentation']}
  priority="high"
/>
```

## Layout Structure

- **H1 and Button on same row** (side-by-side on desktop)
- **Description spans full width** below H1 and Button
- **Responsive**: Button hidden on mobile (< 640px)

## Key Features

### WCAG 2.1 AAA Compliance
- Semantic heading structure (h1/h2/h3)
- Full ARIA support with proper roles and labels
- Keyboard navigation with arrow keys and vim-style shortcuts
- Skip links for efficient navigation
- Proper focus management

### SEO Optimization
- Structured data (JSON-LD) generation
- Schema.org microdata attributes
- Automatic page headline detection
- Search keyword integration

### Keyboard Navigation
- **Arrow Down/j**: Next header
- **Arrow Up/k**: Previous header
- **Home**: First header of same level
- **End**: Last header of same level

## Breaking Changes (December 26, 2025)

### Description Prop Renamed

The `description` prop has been renamed to `page_description` to avoid naming conflicts and improve clarity.

**Before:**
```tsx
<PageTitle 
  title="Materials"
  description="Material descriptions"
/>
```

**After:**
```tsx
<PageTitle 
  title="Materials"
  page_description="Material descriptions"
/>
```

## Notes

- The default `rightContent` for level="page" is a "Let's talk" button linking to `/contact`
- All visual styling is handled through Tailwind CSS and global.css
- Component generates unique IDs for elements when not provided
- Structured data is automatically injected into document head when `searchKeywords` are provided
