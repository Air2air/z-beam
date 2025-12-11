# DatePanel Component

A reusable component that displays publication date information in a styled panel.

## Overview

DatePanel is a small, focused component extracted from the Author component to handle date display. It shows a "Published" label with a formatted date and Calendar icon, designed to be hidden on mobile and visible on small+ screens.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datePublished` | `string` | `undefined` | ISO date string (e.g., "2024-11-26") |
| `className` | `string` | `""` | Additional CSS classes to apply to the panel |

## Usage

### Basic Usage

```tsx
import { DatePanel } from '@/app/components/DatePanel/DatePanel';

function MyComponent() {
  return (
    <DatePanel datePublished="2024-11-26" />
  );
}
```

### With Custom Styling

```tsx
<DatePanel 
  datePublished="2024-11-26" 
  className="ml-4" 
/>
```

### Conditional Rendering

The component returns `null` if no date is provided, so you can use it directly without wrapping in conditional logic:

```tsx
// This is safe - no extra check needed
<DatePanel datePublished={frontmatter?.datePublished} />
```

## Styling

### Default Styles

- **Responsive**: Hidden on mobile (`hidden`), visible on small+ screens (`sm:flex`)
- **Layout**: Flex column with gap-2
- **Colors**: Muted text on primary background
- **Spacing**: px-3 py-2 padding, rounded corners
- **Sizing**: flex-shrink-0 to prevent compression

### Label Styles

The "Published" label uses:
- `text-muted` - Low contrast color
- `text-[10px]` - Very small text size
- `uppercase` - All caps
- `tracking-wide` - Increased letter spacing

### Date Value Styles

The formatted date uses:
- `font-medium` - Semi-bold weight

## Layout Integration

DatePanel is designed to fit into flex layouts, particularly as a side element in Author cards:

```tsx
<div className="flex items-center justify-between gap-4">
  <div className="flex-1">
    {/* Main content */}
  </div>
  <DatePanel datePublished={date} />
</div>
```

## Dependencies

- **lucide-react**: Calendar icon component
- **dateFormatting utility**: `formatDate()` function for consistent date display

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< sm` (< 640px) | Hidden (`display: none`) |
| `≥ sm` (≥ 640px) | Visible (`display: flex`) |

## Accessibility

- Semantic HTML structure
- Calendar icon provides visual context
- Date formatting uses locale-aware display

## Examples

### In Author Component

```tsx
<Link href={`/search?q=${author}`}>
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 flex-1">
      {/* Author info */}
    </div>
    <DatePanel datePublished={frontmatter?.datePublished} />
  </div>
</Link>
```

### Standalone Panel

```tsx
<article>
  <header className="flex items-center justify-between">
    <h1>Article Title</h1>
    <DatePanel datePublished="2024-11-26" />
  </header>
</article>
```

## Testing

See `tests/components/DatePanel.test.js` for comprehensive test coverage including:
- Basic rendering with valid/missing dates
- CSS class application
- Date formatting
- Responsive behavior
- Icon integration
- Layout structure

## Design Decisions

### Why Extracted from Author?

1. **Reusability**: Date panels may be useful in other components
2. **Separation of Concerns**: Date display logic isolated from author logic
3. **Maintainability**: Easier to test and modify independently
4. **Consistency**: Single source of truth for date panel styling

### Why Conditional Rendering Inside Component?

Rather than requiring consumers to check `if (date)` before rendering, DatePanel handles this internally by returning `null`. This simplifies usage and follows React best practices.

### Why Hidden on Mobile?

Date information is considered secondary metadata that can be omitted on small screens where space is limited. The focus on mobile is the primary author information.

## Related Components

- **Author**: Primary consumer of DatePanel
- **Micro**: Another metadata display component
- **SectionContainer**: Similar pattern of optional title/metadata display
