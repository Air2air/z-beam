# Image Naming Conventions

## Overview

This document defines the standardized image naming conventions used across the Z-Beam platform to ensure consistency, maintainability, and SEO optimization.

## Standard Format

Images follow this pattern:
```
{material-name}-{image-type}.{extension}
```

### Components

1. **material-name**: Lowercase, hyphenated material identifier
2. **image-type**: Purpose of the image (hero, micro, etc.)
3. **extension**: File format (jpg, png, webp)

## Image Types

### Hero Images
Primary visual representation for material/contaminant pages.

**Format**: `{material-name}-hero.jpg`

**Examples**:
- `aluminum-hero.jpg`
- `steel-hero.jpg`
- `rust-contamination-hero.jpg`

### Micro Images
Detailed close-up or microscopic images.

**Format**: `{material-name}-micro.jpg`

**Examples**:
- `laser-cleaning-micro.jpg`
- `aluminum-oxide-micro.jpg`
- `copper-surface-micro.jpg`

### Process Images
Step-by-step or process documentation images.

**Format**: `{material-name}-{process-step}.jpg`

**Examples**:
- `aluminum-before-cleaning.jpg`
- `aluminum-after-cleaning.jpg`
- `steel-ablation-process.jpg`

### Diagram Images
Technical diagrams and illustrations.

**Format**: `{material-name}-{diagram-type}.png`

**Examples**:
- `laser-beam-diagram.png`
- `thermal-distribution-diagram.png`
- `wavelength-absorption-chart.png`

## File Format Guidelines

### JPEG (.jpg)
- **Use for**: Photographs, hero images, process images
- **Quality**: 85-90% for web optimization
- **Max size**: 500KB for hero, 200KB for micro

### PNG (.png)
- **Use for**: Diagrams, charts, images requiring transparency
- **Optimization**: Use compression tools (tinypng, pngquant)
- **Max size**: 300KB

### WebP (.webp)
- **Use for**: Next-generation format with better compression
- **Fallback**: Always provide JPEG/PNG fallback
- **Max size**: 250KB

## Directory Structure

```
public/images/
├── materials/
│   ├── metals/
│   │   ├── aluminum-hero.jpg
│   │   ├── aluminum-micro.jpg
│   │   └── steel-hero.jpg
│   ├── ceramics/
│   └── polymers/
├── contaminants/
│   ├── rust-contamination-hero.jpg
│   └── oil-residue-micro.jpg
├── processes/
│   ├── laser-cleaning-micro.jpg
│   └── ablation-process.jpg
└── diagrams/
    └── wavelength-absorption-chart.png
```

## SEO Best Practices

### Alt Text
Always provide descriptive alt text in frontmatter:

```yaml
images:
  hero:
    url: /images/materials/metals/aluminum-hero.jpg
    alt: Industrial laser cleaning aluminum surface showing oxide layer removal
    width: 1200
    height: 630
```

### File Naming for SEO
- Use descriptive, hyphenated names
- Include primary keyword (material name)
- Avoid generic names (image1.jpg, photo.jpg)
- Keep names concise but meaningful

## Migration from Legacy Naming

### Legacy Pattern
Old inconsistent patterns to avoid:
- `IMG_1234.jpg` (non-descriptive)
- `aluminum_hero.jpg` (underscores instead of hyphens)
- `AluminumHero.jpg` (mixed case)
- `alu-hero.jpg` (abbreviated names)

### Migration Steps
1. Identify images with legacy naming
2. Rename following standard format
3. Update frontmatter references
4. Verify broken image links
5. Update CDN/cache if applicable

### Automated Migration
Use the provided script:
```bash
node scripts/migrate-image-names.js
```

## Validation

### Manual Checks
- Verify all lowercase
- Confirm hyphen usage (not underscores)
- Check file size limits
- Validate alt text presence

### Automated Validation
Jest tests verify naming conventions:
```bash
npm test -- image-naming-conventions.test.js
```

## Common Patterns

### Material Pages
```
aluminum-hero.jpg       # Main visual
aluminum-micro.jpg      # Detailed view
aluminum-cleaning-process.jpg
```

### Contaminant Pages
```
rust-contamination-hero.jpg
rust-removal-before.jpg
rust-removal-after.jpg
rust-contamination-micro.jpg
```

### Settings Pages
```
laser-settings-power-diagram.png
laser-settings-wavelength-chart.png
```

## Exceptions

### Logos and Branding
Company logos maintain their original naming:
- `coherent-logo.png`
- `z-beam-logo.svg`

### Icons and UI Elements
UI components use descriptive names:
- `warning-icon.svg`
- `checkmark-icon.svg`
- `laser-icon.png`

## References

- SEO Image Optimization: [Google Image Best Practices](https://developers.google.com/search/docs/advanced/guidelines/google-images)
- Web Performance: [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- Accessibility: [WCAG Image Guidelines](https://www.w3.org/WAI/tutorials/images/)

## Changelog

### 2025-12-20
- Initial documentation created
- Defined standard naming patterns
- Added migration guidelines
- Included validation processes
