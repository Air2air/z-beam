# Z-Beam Debugging System

The Z-Beam platform includes a comprehensive debugging system to help developers diagnose issues and test functionality. This document provides an overview of the debugging tools available and how to use them.

## Debug Pages

### Main Debug Dashboard

The main debug dashboard is accessible at `/debug`. This page provides access to various debugging tools and visualizations.

**Available Debug Categories:**

- **Thumbnail Test** - View and test thumbnail generation
- **Image Test** - Test image loading and rendering
- **Material Fallback** - Test material fallback mechanisms
- **Card Debug** - Debug card rendering and data
- **Frontmatter Debug** - Inspect frontmatter data
- **Borosilicate Test** - Test specific material properties
- **Category Fallback** - Test category fallback mechanisms
- **Tag System** - Debug the tag system

### Specialized Debug Pages

- **/debug/tags** - Focused debugging tools for the tag system
- **/debug/content** - Tools for debugging content structure and frontmatter

## Debug API

The debug API provides programmatic access to debugging data. This can be accessed at `/api/debug`.

### API Parameters

- `category` - Filter results by category (e.g., tags, thumbnails, images)
- `slug` - Get debug data for a specific content item

### Example Usage

```javascript
// Fetch tag debug data
fetch('/api/debug?category=tags')
  .then(response => response.json())
  .then(data => console.log(data));

// Fetch thumbnail debug data for a specific article
fetch('/api/debug?category=thumbnails&slug=example-article')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Debug Components

The debugging system includes several React components that can be imported and used in your own debugging tools:

- `DebugLayout` - Consistent layout for debug pages
- `TagDebug` - Tag system debugging component
- `FrontmatterDebug` - Frontmatter inspection component
- `FrontmatterNameChecker` - Tool to check frontmatter field names

Example usage:

```jsx
import { DebugLayout } from '@/app/components/Debug/DebugLayout';
import { TagDebug } from '@/app/components/Debug/TagDebug';

export default function CustomDebugPage() {
  return (
    <DebugLayout>
      <h1>Custom Debug Page</h1>
      <TagDebug />
    </DebugLayout>
  );
}
```

## Adding New Debug Tools

To add new debugging functionality:

1. Create a new debug component in `app/components/Debug/`
2. Add the component to the appropriate debug page
3. If needed, add a new API endpoint in `app/api/debug/route.ts`
4. Update this documentation to reflect the new debugging capability

## Best Practices

- Use the debug tools during development, not in production
- Clear debug data from localStorage when it's no longer needed
- Don't leave debugging code in production components
- Use the centralized debug API for consistent data access
