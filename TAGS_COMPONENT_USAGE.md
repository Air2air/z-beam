# Tags Component - Complete Documentation

The Tags component provides comprehensive support for both legacy string-based tags and modern YAML v2.0 structured tag data with advanced categorization and metadata features.

## Supported Formats

### 1. Legacy String Format (Backward Compatible)
```
aluminum, cleaning, laser, aerospace
```

### 2. YAML v1.0 Format (Backward Compatible)
```yaml
tags:
  - aluminum
  - cleaning
  - laser
metadata:
  material: aluminum
  count: 4
```

### 3. YAML v2.0 Format (New Enhanced Format)
```yaml
tags:
  - electronics
  - aerospace
  - manufacturing
  - passivation
  - polishing
  - expert
  - industrial
  - decontamination
count: 8
categories:
  industry:
    - electronics
    - aerospace
    - manufacturing
    - industrial
  process:
    - passivation
    - polishing
    - decontamination
  other:
    - expert
metadata:
  format: "yaml"
  version: "2.0"
  material: "copper"
  author: "AI Assistant"
  generated: "2025-09-17T11:50:36.211572"
```

## Component Usage Examples

### Basic Usage (All Formats Supported)
```tsx
// Legacy string format
<Tags content="aluminum, cleaning, laser, aerospace" />

// YAML v1.0 format
<Tags content={yamlV1Data} />

// YAML v2.0 format
<Tags content={yamlV2Data} />
```

### Advanced Configuration Options

#### Standard Tag Display
```tsx
<Tags 
  content={yamlData} 
  config={{
    title: "Article Tags",
    className: "my-custom-tags",
    pillColor: "bg-blue-600",
    textColor: "text-white",
    hoverColor: "hover:bg-blue-700",
    linkPrefix: "/tags/"
  }}
/>
```

#### Metadata Display
```tsx
<Tags 
  content={yamlV2Data} 
  config={{
    showMetadata: true,
    title: "Tag Information"
  }}
/>
```
**Output:**
- Material: Copper
- Tags: 8
- Categories: Industry, Process, Other
- Format: yaml v2.0

#### Categorized Tag Display
```tsx
<Tags 
  content={yamlV2Data} 
  config={{
    showCategorized: true,
    title: "Categorized Tags"
  }}
/>
```
**Output:**
- **Industry**: Electronics, Aerospace, Manufacturing, Industrial
- **Process**: Passivation, Polishing, Decontamination  
- **Other**: Expert

#### Complete Feature Set
```tsx
<Tags 
  content={yamlV2Data} 
  config={{
    showMetadata: true,
    showCategorized: true,
    title: "Complete Tag Analysis",
    pillColor: "bg-green-600",
    textColor: "text-white",
    hoverColor: "hover:bg-green-700",
    linkPrefix: "/explore/tags/",
    className: "comprehensive-tags"
  }}
/>
```

#### Interactive Mode (Click Handlers)
```tsx
const [selectedTag, setSelectedTag] = useState('');

<Tags 
  content={yamlV2Data} 
  config={{
    onClick: (tag) => {
      setSelectedTag(tag);
      // Handle filtering or other actions
    },
    showCategorized: true,
    title: "Filter by Tag"
  }}
/>
```

## TypeScript Interface

```typescript
interface TagsData {
  tags?: string[];                    // Direct tag array
  count?: number;                     // Total tag count
  categories?: {                      // Organized tag categories
    industry?: string[];
    process?: string[];
    other?: string[];
    [key: string]: string[] | undefined;
  };
  metadata?: {                        // Enhanced metadata
    format?: string;                  // Data format identifier
    version?: string;                 // Format version
    material?: string;                // Associated material
    author?: string;                  // Content author
    generated?: string;               // Generation timestamp
  };
}

interface TagsProps {
  content: string | TagsData;         // Flexible content input
  config?: {
    className?: string;               // Custom container class
    title?: string;                   // Component title
    pillColor?: string;               // Tag background color
    textColor?: string;               // Tag text color
    hoverColor?: string;              // Tag hover color
    linkPrefix?: string;              // URL prefix for links
    onClick?: (tag: string) => void;  // Click handler (disables links)
    hideEmptyTags?: boolean;          // Hide tags with no articles
    articleMatchCount?: Record<string, number>; // Tag usage counts
    showMetadata?: boolean;           // Display metadata panel
    showCategorized?: boolean;        // Group tags by category
    [key: string]: unknown;
  };
}
```

## Configuration Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `className` | string | `"my-6"` | Container CSS classes |
| `title` | string | `"Tags"` | Component title |
| `pillColor` | string | `"bg-gray-800"` | Tag background color |
| `textColor` | string | `"text-blue-800 dark:text-blue-200"` | Tag text color |
| `hoverColor` | string | `"dark:hover:bg-gray-900"` | Tag hover effect |
| `linkPrefix` | string | `"/tag/"` | URL prefix for tag links |
| `onClick` | function | `undefined` | Custom click handler |
| `hideEmptyTags` | boolean | `false` | Hide unused tags |
| `articleMatchCount` | object | `{}` | Tag usage statistics |
| `showMetadata` | boolean | `false` | Display metadata info |
| `showCategorized` | boolean | `false` | Group by categories |

## Data Processing Logic

### Tag Resolution Priority
1. **YAML v2.0 with tags array**: Uses `tags` directly
2. **YAML v2.0 with categories only**: Flattens all category arrays
3. **YAML v1.0**: Uses `tags` array from metadata
4. **String format**: Splits by comma and trims

### Categorized Display Logic
- When `showCategorized: true` and `categories` exist:
  - Groups tags under category headers
  - Maintains individual tag styling and links
  - Shows categories in alphabetical order
- When `showCategorized: false` or no categories:
  - Displays flat list of all tags
  - Uses standard tag resolution priority

### Metadata Display Logic
- Shows available metadata fields when `showMetadata: true`
- Displays material, count, categories, and format version
- Gracefully handles missing metadata fields
- Supports dark mode styling

## Migration Guide

### From String Format
```tsx
// Before (string only)
<Tags content="aluminum, cleaning, laser" />

// After (enhanced with metadata)
<Tags 
  content={{
    tags: ['aluminum', 'cleaning', 'laser'],
    metadata: { material: 'aluminum' }
  }}
  config={{ showMetadata: true }}
/>
```

### From YAML v1.0 to v2.0
```yaml
# Before (v1.0)
tags:
  - aluminum
  - cleaning
metadata:
  count: 2

# After (v2.0)
tags:
  - aluminum
  - cleaning
count: 2
categories:
  material: [aluminum]
  process: [cleaning]
metadata:
  format: "yaml"
  version: "2.0"
```

### Adding Categorization
```tsx
// Before (flat tags)
<Tags content={simpleData} />

// After (categorized)
<Tags 
  content={categorizedData} 
  config={{ showCategorized: true }}
/>
```

## Testing

The component includes comprehensive test coverage:

### Unit Tests
- String format parsing
- YAML v2.0 data handling
- Configuration options
- Edge cases and error handling

### Integration Tests
- Full YAML v2.0 feature integration
- Backward compatibility verification
- Performance with large datasets
- Cross-format consistency

### Test Files
- `tests/components/Tags.test.tsx` - Component unit tests
- `tests/utils/tags.test.js` - Utility function tests
- `tests/integration/tags-yaml-v2.test.js` - Integration tests

### Running Tests
```bash
# Run all tag-related tests
npm test -- --testPathPattern=tags

# Run specific test files
npm test tests/components/Tags.test.tsx
npm test tests/integration/tags-yaml-v2.test.js
```

## Performance Considerations

### Optimization Features
- React.cache() for server-side caching
- Efficient tag resolution algorithms
- Minimal re-renders with proper memoization
- Large dataset handling (100+ tags tested)

### Best Practices
- Use `showCategorized` for better organization with many tags
- Enable `showMetadata` for informational displays
- Consider `hideEmptyTags` for dynamic content
- Use `onClick` for client-side filtering instead of navigation

## Accessibility

### Built-in Features
- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Semantic HTML structure

### ARIA Labels
- Links: "View all articles tagged with {tag}"
- Buttons: "Filter by {tag} tag"  
- Metadata: Proper label associations

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Full TypeScript support
- Next.js 14+ compatible
- React 18+ compatible

## Troubleshooting

### Common Issues

**Tags not displaying:**
- Check content format and structure
- Verify YAML syntax if using structured data
- Ensure content is not null/undefined

**Metadata not showing:**
- Confirm `showMetadata: true` in config
- Verify metadata exists in content
- Check that content is YAML format (not string)

**Categories not grouping:**
- Enable `showCategorized: true` in config
- Ensure categories object exists in content
- Verify category arrays are properly formatted

**Styling issues:**
- Check Tailwind CSS classes are available
- Verify custom color classes are defined
- Test dark mode styling separately

### Debug Tips
- Use browser dev tools to inspect component structure
- Check console for parsing warnings
- Verify data structure with `console.log(content)`
- Test with minimal config first, then add features

## Version History

- **v1.0**: Initial string-based tag support
- **v1.1**: Added YAML v1.0 support with basic metadata
- **v2.0**: Complete YAML v2.0 support with categorization
- **v2.1**: Enhanced testing and documentation
