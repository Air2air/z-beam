# Image Naming Conventions

## Overview
This document defines the naming conventions for images used throughout the Z-Beam website.

## General Rules

### Format
```
{material-name}-laser-cleaning-{variant}.{ext}
```

### Examples
- `aluminum-laser-cleaning-hero.jpg`
- `aluminum-laser-cleaning-micro.jpg`
- `steel-laser-cleaning-before.jpg`
- `copper-laser-cleaning-after.jpg`
- `aluminum-laser-cleaning-micro-social.jpg`

## Image Types

### Hero Images
**Format**: `{material-name}-laser-cleaning-hero.{ext}`
- Primary material page image
- Recommended size: 1920x1080 (16:9)
- Format: JPG or WebP

### Micro Images
**Format**: `{material-name}-laser-cleaning-micro.{ext}`
- Close-up detail images of laser cleaning results
- Shows fine surface details and cleaning quality
- Used in material pages and comparison sections

### Social Images  
**Format**: `{material-name}-laser-cleaning-micro-social.{ext}`
- Optimized for social media sharing (Open Graph, Twitter Cards)
- Typically 1200x630 for optimal display
- Includes branding or text overlay when appropriate

### Before/After Images
**Format**: `{material-name}-laser-cleaning-{before|after}.{ext}`
- Comparison images showing cleaning results
- Both images should match in size/composition

### Settings Images
**Format**: `{material-name}-settings-{descriptor}.{ext}`
- Machine settings or parameter visualization
- Use descriptive suffixes

### Process Images
**Format**: `{material-name}-process-{step}.{ext}`
- Step-by-step process documentation
- Number steps sequentially

## File Naming Rules

1. **Use kebab-case**: All lowercase, words separated by hyphens
2. **Be descriptive**: Name should indicate content clearly
3. **Include material**: Always include material name
4. **Consistent suffixes**: Use standard suffixes (hero, before, after, etc.)
5. **No spaces**: Use hyphens instead of spaces
6. **No special characters**: Only alphanumeric and hyphens

## Directory Structure

```
public/images/
├── material/          # Material-specific images
│   ├── aluminum-laser-cleaning-hero.jpg
│   ├── steel-laser-cleaning-hero.jpg
│   └── ...
├── pages/             # Static page images
├── logo/              # Brand assets
└── favicon/           # Site icons
```

## Optimization

- **JPG**: For photos (quality 80-85%)
- **WebP**: Modern browsers (quality 80-85%)
- **PNG**: For graphics with transparency
- **SVG**: For logos and icons

## Accessibility

All images must have descriptive `alt` text in the frontmatter:
```yaml
images:
  hero:
    url: /images/material/aluminum-laser-cleaning-hero.jpg
    alt: "Aluminum surface after laser cleaning showing restored metallic finish"
    width: 1920
    height: 1080
```

## Migration from Legacy Naming

### Old Pattern (Deprecated)
```
cleaning-analysis.jpg
cleaning-analysis-social.jpg
```

### New Pattern (Current)
```
{material-name}-laser-cleaning-micro.jpg
{material-name}-laser-cleaning-micro-social.jpg
```

### Migration Steps
1. Identify all files using the old pattern
2. Rename to include material name and use kebab-case
3. Update all references in YAML frontmatter files
4. Update component code to use new paths
5. Test that all images load correctly
6. Remove old image files after verification

### Benefits of New Pattern
- **Material-specific**: Clearly indicates which material the image belongs to
- **Scalable**: Supports multiple images per material
- **SEO-friendly**: Descriptive filenames improve search discoverability
- **Maintainable**: Consistent naming makes finding and updating images easier

