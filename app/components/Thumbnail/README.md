# Thumbnail Component

## Overview
The Thumbnail component provides responsive image display with automatic fallback to the Z-BEAM logo when images are unavailable or fail to load.

## Features

### Primary Image Display
- Next.js Image optimization with `fill` layout
- Configurable object-fit (cover, contain, fill, none, scale-down)
- Priority loading support for above-the-fold images
- Lazy loading for non-critical images
- Responsive sizes based on viewport
- Automatic error handling with fallback

### Fallback Image
When no image URL is provided or an image fails to load:
- **Image**: Z-BEAM logo (`/images/logo/logo-zbeam.png`)
- **Dimensions**: 150×50px
- **Positioning**: 30% above center (`-translate-y-[30%]`)
- **Size**: 30% of container height (`h-[30%]`)
- **Opacity**: 40% default, 100% on hover
- **Transition**: Smooth 300ms opacity fade
- **Hover**: Container-level hover detection via `group` class

## Usage

```tsx
import { Thumbnail } from '@/app/components/Thumbnail';

// With explicit image URL
<Thumbnail
  imageUrl="/images/hero/aluminum.jpg"
  alt="Aluminum laser cleaning"
  priority={true}
  objectFit="cover"
/>

// With frontmatter data
<Thumbnail
  frontmatter={articleData}
  alt="Material thumbnail"
  objectFit="contain"
/>

// Fallback (no image)
<Thumbnail
  alt="Fallback logo"
  objectFit="contain"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageUrl` | `string` | `undefined` | Explicit image URL (takes precedence) |
| `frontmatter` | `object` | `undefined` | Frontmatter with `images.hero.url` |
| `alt` | `string` | **required** | Alt text for accessibility |
| `priority` | `boolean` | `false` | Use eager loading (for above-fold) |
| `objectFit` | `string` | `'cover'` | CSS object-fit value |
| `width` | `number` | `undefined` | Fixed width (optional) |
| `height` | `number` | `undefined` | Fixed height (optional) |
| `className` | `string` | `''` | Additional CSS classes |

## Styling Details

### Primary Image
```tsx
className={objectFitClass} // object-cover, object-contain, etc.
fill={true}
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
quality={priority ? 85 : 75}
```

### Fallback Logo
```tsx
className="object-contain h-[30%] w-auto opacity-40 group-hover:opacity-100 -translate-y-[30%] transition-opacity duration-300"
```

### Container Classes
- Primary: `relative w-full h-full overflow-hidden`
- Fallback: `w-full h-full flex items-center justify-center bg-tertiary group`

## Testing

### Component Tests
Located in: `tests/components/SectionTitle.test.tsx`

```tsx
describe('Thumbnail', () => {
  it('renders thumbnail image when provided');
  it('renders fallback logo when no thumbnail provided');
  it('has correct dimensions class');
  it('fallback logo has correct styling');
  it('fallback container has group class for hover effects');
});
```

### Test Coverage
- ✅ Image rendering with URL
- ✅ Fallback logo dimensions (150×50)
- ✅ Fallback styling classes
- ✅ Group hover functionality
- ✅ Error handling

## Accessibility

- All images require meaningful `alt` text
- Fallback logo uses `alt="Z-BEAM Logo"`
- Semantic HTML structure
- Keyboard navigation support via hover states

## Performance

### Image Optimization
- Next.js automatic optimization
- WebP format support
- Responsive image sizes
- Lazy loading by default
- Priority loading for critical images

### Fallback Optimization
- SVG-based logo (small file size)
- CSS-only animations (no JavaScript)
- GPU-accelerated transforms
- Minimal repaints

## Dependencies

- `next/image` - Image optimization
- `@/types` - TypeScript definitions
- Tailwind CSS - Styling utilities

## Related Components

- **SectionTitle** - Uses Thumbnail for hero images
- **MaterialCard** - Uses Thumbnail for material previews
- **ArticleGrid** - Uses Thumbnail for grid layouts

## Version History

### Current (Dec 2025)
- Improved fallback logo styling
- Added hover opacity transition
- Positioned logo 30% above center
- Reduced logo to 30% height
- Container-level hover detection

### Previous
- Basic fallback with orange filter
- 60×60 logo dimensions
- No hover effects
