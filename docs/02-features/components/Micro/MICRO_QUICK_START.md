# Micro Component Quick Start Guide

**Last Updated:** September 30, 2025

---

## Usage

### Basic Implementation

```tsx
import { Micro } from '@/components/Micro/Micro';

// In your component
<Micro frontmatter={metadata} />
```

The Micro component expects metadata with a `micro` property at `frontmatter.micro`.

---

## Data Structure

### Required Format

```typescript
const metadata = {
  micro: {
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
import { MicroProps, ParsedMicroData, FrontmatterType } from '@/types';

// ❌ Wrong
import { MicroProps } from './Micro';  // Don't import from component
```

---

## Common Patterns

### With Next.js Page

```tsx
import { Micro } from '@/components/Micro/Micro';
import { getContentMetadata } from '@/utils/contentAPI';

export default function ArticlePage({ slug }) {
  const metadata = await getContentMetadata(slug);
  
  return (
    <main>
      <Micro frontmatter={metadata} />
      {/* other content */}
    </main>
  );
}
```

### With Custom Styling

```tsx
<Micro 
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
import { Micro } from '@/components/Micro/Micro';

const mockData = {
  material: 'Test Material',
  beforeText: 'Before treatment description',
  afterText: 'After treatment description',
  imageUrl: { url: '/test-image.jpg', alt: 'Test' }
};

// ✅ Correct test render
render(<Micro frontmatter={{ micro: mockData }} />);

// ❌ Wrong - old API
render(<Micro data={mockData} />);
```

---

## Troubleshooting

### Micro Not Displaying

**Check:**
1. Metadata structure has `micro` property at correct path
2. Using camelCase for `beforeText` and `afterText`
3. Image source available (checks both `images.micro.url` and `imageUrl.url`)

### TypeScript Errors

**Solution:**
- Import types from `@/types` only
- Ensure `MicroDataStructure` properties match your data

### Test Failures

**Common issues:**
- Using `data` prop instead of `frontmatter={{ micro: ... }}`
- Using snake_case properties in test data
- Missing closing braces in JSX

---

## Best Practices

1. ✅ **Always use centralized types** from `@/types`
2. ✅ **Use camelCase** for all Micro data properties
3. ✅ **Provide image fallbacks** when possible
4. ✅ **Test with both image sources** (micro and imageUrl)
5. ✅ **Keep metadata structure consistent** across pages

---

## API Reference

### MicroProps

```typescript
interface MicroProps {
  frontmatter: FrontmatterType;  // Required
  config?: {
    className?: string;           // Optional
  };
}
```

### MicroDataStructure

```typescript
interface MicroDataStructure {
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

- **Migration Guide:** [CAPTION_TO_MICRO_MIGRATION_DEC11_2025.md](../../../CAPTION_TO_MICRO_MIGRATION_DEC11_2025.md)
- **Type Definitions:** `types/centralized.ts`
- **Component Source:** `app/components/Micro/Micro.tsx`
- **Test Examples:** `tests/components/Micro.accessibility.test.tsx`

---

## Support

For issues or questions:
1. Check [CAPTION_TO_MICRO_MIGRATION_DEC11_2025.md](../../../CAPTION_TO_MICRO_MIGRATION_DEC11_2025.md) for migration details
2. Review type definitions in `types/centralized.ts`
3. Examine working tests in `tests/components/Micro.accessibility.test.tsx`

---

**Quick Start Version:** 1.0  
**Component Status:** ✅ Production Ready
