# Caption Component Quick Start Guide

**Last Updated:** September 30, 2025

---

## Usage

### Basic Implementation

```tsx
import { Caption } from '@/components/Caption/Caption';

// In your component
<Caption frontmatter={metadata} />
```

The Caption component expects metadata with a `caption` property at `frontmatter.caption`.

---

## Data Structure

### Required Format

```typescript
const metadata = {
  caption: {
    material: 'Aluminum 6061-T6',
    imageUrl: {
      url: '/images/analysis/aluminum-comparison.jpg',
      alt: 'Surface analysis comparison'
    },
    beforeText: 'Surface condition before treatment...',
    afterText: 'Surface condition after treatment...',
    quality_metrics: {
      surface_roughness_ra: 0.8,
      thermal_conductivity: 167,
      // ... more metrics
    }
  }
  // ... other metadata
};
```

### Property Naming Convention

⚠️ **Important:** Use **camelCase** for text properties:
- ✅ `beforeText` 
- ✅ `afterText`
- ❌ ~~`before_text`~~ (deprecated)
- ❌ ~~`after_text`~~ (deprecated)

---

## Type Imports

### Always use centralized types:

```typescript
// ✅ Correct
import { CaptionProps, ParsedCaptionData, FrontmatterType } from '@/types';

// ❌ Wrong
import { CaptionProps } from './Caption';  // Don't import from component
```

---

## Common Patterns

### With Next.js Page

```tsx
import { Caption } from '@/components/Caption/Caption';
import { getContentMetadata } from '@/utils/contentAPI';

export default function ArticlePage({ slug }) {
  const metadata = await getContentMetadata(slug);
  
  return (
    <main>
      <Caption frontmatter={metadata} />
      {/* other content */}
    </main>
  );
}
```

### With Custom Styling

```tsx
<Caption 
  frontmatter={metadata}
  config={{
    className: 'my-custom-class'
  }}
/>
```

---

## Testing

### Test Setup

```typescript
import { render, screen } from '@testing-library/react';
import { Caption } from '@/components/Caption/Caption';

const mockData = {
  material: 'Test Material',
  beforeText: 'Before treatment description',
  afterText: 'After treatment description',
  imageUrl: { url: '/test-image.jpg', alt: 'Test' }
};

// ✅ Correct test render
render(<Caption frontmatter={{ caption: mockData }} />);

// ❌ Wrong - old API
render(<Caption data={mockData} />);
```

---

## Troubleshooting

### Caption Not Displaying

**Check:**
1. Metadata structure has `caption` property at correct path
2. Using camelCase for `beforeText` and `afterText`
3. Image source available (checks both `images.micro.url` and `imageUrl.url`)

### TypeScript Errors

**Solution:**
- Import types from `@/types` only
- Ensure `CaptionDataStructure` properties match your data

### Test Failures

**Common issues:**
- Using `data` prop instead of `frontmatter={{ caption: ... }}`
- Using snake_case properties in test data
- Missing closing braces in JSX

---

## Best Practices

1. ✅ **Always use centralized types** from `@/types`
2. ✅ **Use camelCase** for all Caption data properties
3. ✅ **Provide image fallbacks** when possible
4. ✅ **Test with both image sources** (micro and imageUrl)
5. ✅ **Keep metadata structure consistent** across pages

---

## API Reference

### CaptionProps

```typescript
interface CaptionProps {
  frontmatter: FrontmatterType;  // Required
  config?: {
    className?: string;           // Optional
  };
}
```

### CaptionDataStructure

```typescript
interface CaptionDataStructure {
  material?: string;
  imageUrl?: { url?: string; alt?: string; };
  images?: { micro?: { url?: string; }; };
  beforeText?: string;
  afterText?: string;
  quality_metrics?: { [key: string]: number };
}
```

See `types/centralized.ts` for complete definitions.

---

## Related Documentation

- **Full Details:** [CAPTION_COMPONENT_FIXES_SUMMARY.md](./CAPTION_COMPONENT_FIXES_SUMMARY.md)
- **Type Definitions:** `types/centralized.ts`
- **Component Source:** `app/components/Caption/Caption.tsx`
- **Test Examples:** `tests/accessibility/Caption.comprehensive.test.tsx`

---

## Support

For issues or questions:
1. Check [CAPTION_COMPONENT_FIXES_SUMMARY.md](./CAPTION_COMPONENT_FIXES_SUMMARY.md) for detailed information
2. Review type definitions in `types/centralized.ts`
3. Examine working tests in `tests/accessibility/Caption.comprehensive.test.tsx`

---

**Quick Start Version:** 1.0  
**Component Status:** ✅ Production Ready
