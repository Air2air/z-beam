# Static Page Hero Component Usage Guide

## Overview

Static pages now support custom Hero images and videos directly through markdown frontmatter. The existing Hero component automatically receives and renders these settings.

## How It Works

### 1. **Markdown Frontmatter Fields**

Add these fields to your markdown file's frontmatter:

```yaml
---
title: Equipment Rental
description: Professional laser cleaning equipment rental
author: Z-Beam Team
date: 2025-10-03
heroImage: /images/hero/rental-equipment.jpg  # Path to hero image
heroVideo: dQw4w9WgXcQ                             # YouTube video ID (optional)
heroAlt: Professional laser cleaning equipment      # Alt text for accessibility
---
```

### 2. **Field Descriptions**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `heroImage` | string | No | Path to image (relative to /public) or full URL |
| `heroVideo` | string | No | YouTube video ID (takes priority over image if both provided) |
| `heroAlt` | string | No | Alt text for the image (auto-generated if omitted) |

### 3. **How Data Flows**

```
Markdown Frontmatter
    ↓
UniversalPage extracts fields
    ↓
Metadata object created with:
  - image: heroImage value
  - video: heroVideo value  
  - images.hero.url: heroImage value
  - images.hero.alt: heroAlt value
    ↓
Passed to Layout component
    ↓
ArticleHeader checks for content
    ↓
Hero component renders with frontmatter data
```

### 4. **Implementation Details**

**UniversalPage.tsx** (lines 55-70):
```typescript
pageData = {
  metadata: { 
    ...data, 
    title: title || data.title, 
    description: description || data.description,
    // Pass hero fields from frontmatter
    image: data.heroImage || data.image,
    video: data.heroVideo || data.video,
    images: {
      hero: data.heroImage ? {
        url: data.heroImage,
        alt: data.heroAlt || `Hero image for ${data.title || title}`
      } : data.images?.hero
    }
  },
  components: { content: { content: htmlContent } }
};
```

**Layout.tsx hasHeroContent** (simplified):
```typescript
const hasHeroContent = (metadata: any) => {
  return metadata?.images?.hero?.url || metadata?.video?.id;
};
```

**Hero.tsx** (lines 58-61):
```typescript
// Get video ID from frontmatter
const videoId = frontmatter?.video;

// Get image source from frontmatter  
const imageSource = frontmatter?.images?.hero?.url || frontmatter?.image;
```

## Usage Examples

### Example 1: Image Hero
```yaml
---
title: Equipment Rental
heroImage: /images/equipment/laser-system.jpg
heroAlt: Professional laser cleaning system
---
```

### Example 2: YouTube Video Hero
```yaml
---
title: How It Works
heroVideo: dQw4w9WgXcQ  # Just the video ID, not full URL
heroAlt: Laser cleaning demonstration video
---
```

### Example 3: Both (Video Takes Priority)
```yaml
---
title: Product Demo
heroImage: /images/fallback-image.jpg  # Used if video fails
heroVideo: abc123xyz
heroAlt: Product demonstration
---
```

### Example 4: No Hero (Default Behavior)
```yaml
---
title: Privacy Policy
# No hero fields = uses default logo placeholder
---
```

## Priority Order

1. **YouTube Video** - If `heroVideo` is set, video plays
2. **Image** - If `heroImage` is set (and no video), image displays
3. **Material-based** - For material pages, uses material name
4. **Default Logo** - Fallback when nothing else is available

## Image Requirements

### Recommended Specifications
- **Format**: JPG, PNG, or WebP
- **Dimensions**: 1920x1080px (16:9 aspect ratio)
- **File Size**: < 500KB for optimal performance
- **Location**: `/public/images/` directory

### Image Paths
All images must be relative to the `/public` directory:
```yaml
✅ heroImage: /images/hero/rental.jpg
✅ heroImage: /images/equipment/system.png
❌ heroImage: images/rental.jpg  # Missing leading slash
❌ heroImage: public/images/rental.jpg  # Don't include 'public'
```

## Video Requirements

### YouTube Video ID
Only provide the video ID, not the full URL:
```yaml
✅ heroVideo: dQw4w9WgXcQ
❌ heroVideo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
❌ heroVideo: https://youtu.be/dQw4w9WgXcQ
```

### Video Features
- Auto-plays muted
- Loops continuously
- Minimal YouTube branding
- Responsive sizing

## Page Configuration

Each static page is configured in `UniversalPage.tsx`:

```typescript
export const pageConfigs = {
  rental: {
    slug: 'rental',
    title: 'Equipment Rental | Z-Beam',
    description: 'Rent professional laser cleaning equipment...',
    useContentAPI: false,
    markdownPath: 'app/pages/rental.md',
    dynamic: 'force-static' as const,
    revalidate: false,
    showHero: true,  // ← Controls whether Hero component renders
  }
};
```

### Key Settings
- `showHero: true` - Hero component will render (with image/video/default)
- `showHero: false` - No hero, shows spacer instead
- `markdownPath` - Path to markdown file with frontmatter

## Testing Your Hero

### 1. Add to Markdown
```yaml
---
heroImage: /images/logo/logo_.png
---
```

### 2. View in Dev Server
```bash
npm run dev
# Visit http://localhost:3000/rental
```

### 3. Check Browser DevTools
- Hero section should have class `hero-section`
- Background div should contain `<img>` or `<iframe>`
- Image should not have `animate-pulse` class (loading state)

## Troubleshooting

### Image Not Displaying
1. **Check file exists**: Verify file is in `/public/images/` directory
2. **Check path**: Ensure path starts with `/` and doesn't include `public`
3. **Check console**: Look for 404 errors in browser console
4. **Check case**: File paths are case-sensitive on production

### Video Not Playing
1. **Check video ID**: Ensure it's just the ID, not full URL
2. **Check video privacy**: Video must be public or unlisted (not private)
3. **Check network**: Some networks block YouTube embeds
4. **Check browser**: Ensure browser allows iframe embeds

### Hero Not Rendering
1. **Check showHero**: Verify `showHero: true` in pageConfigs
2. **Check frontmatter**: Ensure heroImage/heroVideo is in frontmatter
3. **Check syntax**: Verify YAML frontmatter is valid
4. **Check logs**: Look for errors in server console

## Best Practices

### 1. Always Provide Alt Text
```yaml
heroImage: /images/equipment.jpg
heroAlt: Industrial laser cleaning equipment in use  # Good for SEO and accessibility
```

### 2. Optimize Images
```bash
# Use ImageOptim, TinyPNG, or similar before uploading
# Target: < 500KB file size
```

### 3. Use Meaningful Names
```yaml
✅ heroImage: /images/rental/netalux-needle-system.jpg
❌ heroImage: /images/img_001.jpg
```

### 4. Test Responsively
- Desktop (1920px)
- Tablet (768px)
- Mobile (375px)

### 5. Consider Loading Performance
- Use WebP format when possible
- Lazy load below-the-fold content
- Hero image loads with `priority` flag

## Migration Guide

### From Material Pages (No Change Needed)
Material pages continue working as before - they use material name for hero.

### From Custom Hero Implementation
Replace custom hero code with frontmatter:

**Before:**
```tsx
<Hero image="/images/custom.jpg" />
```

**After:**
```yaml
---
heroImage: /images/custom.jpg
---
```

## Future Enhancements

Potential additions (not yet implemented):
- [ ] Video poster image for faster loading
- [ ] Multiple hero images (slideshow)
- [ ] Hero overlay text from frontmatter
- [ ] Hero height customization
- [ ] Background video (MP4) support
- [ ] Parallax scrolling effects

## Support

For issues or questions:
1. Check this documentation
2. Review `app/components/Hero/Hero.tsx`
3. Review `app/components/Templates/UniversalPage.tsx`
4. Check browser console for errors
5. Review deployment logs for build issues
