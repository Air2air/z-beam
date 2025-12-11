# Hero Image Configuration Guide

## 🎯 Quick Reference

### Adding a Hero Image to YAML Files

```yaml
# Basic configuration
showHero: true

# Image configuration (option 1: Detailed)
images:
  hero:
    url: "/images/hero/your-image.webp"
    alt: "Descriptive alt text for accessibility"
    width: 1920
    height: 1080

# Image configuration (option 2: Simple)
image: "/images/hero/your-image.webp"
```

---

## 📖 Complete Examples

### Example 1: Services Page with Hero Image
```yaml
title: "Z-Beam Laser Cleaning Services"
description: "Professional laser cleaning services"
slug: "services"
showHero: true

images:
  hero:
    url: "/images/hero/services-hero.webp"
    alt: "Industrial laser cleaning services in action"
    width: 1920
    height: 1080
```

### Example 2: With Video Background (YouTube)
```yaml
title: "My Page"
slug: "my-page"
showHero: true

# YouTube video ID (will loop as background)
video:
  id: "dQw4w9WgXcQ"

# Fallback image (shown while video loads)
images:
  hero:
    url: "/images/hero/fallback-image.webp"
    alt: "Background image"
```

### Example 3: Multiple Image Sizes
```yaml
title: "My Page"
slug: "my-page"
showHero: true

images:
  hero:
    url: "/images/hero/main-hero.webp"
    alt: "Main hero image"
    width: 1920
    height: 1080
  micro:
    url: "/images/thumbnails/micro-thumb.webp"
    alt: "Thumbnail"
    width: 400
    height: 225
  social:
    url: "/images/social/og-image.webp"
    alt: "Social media preview"
```

---

## 🖼️ Image Specifications

### Recommended Dimensions
- **Desktop Hero:** 1920x1080 (16:9 aspect ratio)
- **Tablet:** 1280x720 (automatically scaled)
- **Mobile:** 768x432 (automatically scaled)

### Recommended Formats
1. **WebP** (preferred) - Best compression, modern browsers
2. **JPEG** - Good compatibility, reasonable file size
3. **PNG** - Use only if transparency needed

### File Locations
```
public/images/
├── hero/              # Hero images (1920x1080)
├── thumbnails/        # Smaller images (400x225)
└── social/           # Social media previews (1200x630)
```

---

## 🎨 Theme Options

```yaml
# Dark theme (default)
showHero: true
# Theme is controlled by the page component, not YAML

# The Hero component automatically adjusts based on:
# - Image brightness
# - Page context
# - Content requirements
```

---

## ⚙️ Advanced Configuration

### With Micro Data
```yaml
title: "Material Page"
slug: "silicon"
showHero: true

images:
  hero:
    url: "/images/materials/silicon-hero.webp"
    alt: "Silicon substrate for laser cleaning"
    width: 1920
    height: 1080

# Micro data for additional context
micro:
  material: "Silicon"
  imageUrl:
    url: "/images/materials/silicon-micro.webp"
    alt: "Microscopic view of silicon"
  beforeText: "Before laser cleaning"
  afterText: "After laser cleaning"
```

---

## 🔍 Troubleshooting

### Hero Not Showing?
1. ✅ Check `showHero: true` is set
2. ✅ Verify image path starts with `/images/`
3. ✅ Confirm image file exists in `public/images/`
4. ✅ Check console for 404 errors

### Image Not Loading?
```yaml
# ❌ Wrong - relative path
images:
  hero:
    url: "images/hero/image.webp"

# ✅ Correct - absolute path from public
images:
  hero:
    url: "/images/hero/image.webp"
```

### Poor Performance?
- Optimize images with WebP format
- Use appropriate dimensions (don't use 4K images)
- Enable lazy loading (automatic in Hero component)
- Consider using video thumbnail as fallback

---

## 📚 Related Documentation

- **Hero Component:** `app/components/Hero/Hero.tsx`
- **Type Definitions:** `types/centralized.ts` (ArticleMetadata, HeroProps)
- **Image Guidelines:** `docs/IMAGE_NAMING_CONVENTIONS.md`

---

## ✅ Best Practices

1. **Always provide alt text** for accessibility
2. **Use WebP format** for better compression
3. **Maintain 16:9 aspect ratio** for consistency
4. **Optimize file size** (aim for <200KB)
5. **Test on mobile devices** for responsiveness
6. **Use descriptive filenames** (e.g., `services-hero.webp`)

---

**Last Updated:** October 7, 2025  
**Status:** ✅ Current with Hero component v2.0
