# Image Naming Conventions

## Overview

This document outlines the standardized image naming conventions for the Z-Beam laser cleaning project. All image references have been updated to follow consistent patterns for better maintainability and clarity.

## Current Naming Patterns (Updated September 2025)

### 1. Laser Cleaning Analysis Images

**Format**: `{material-name}-laser-cleaning-micro.jpg`

**Examples**:
- `/images/material/oak-laser-cleaning-micro.jpg`
- `/images/material/aluminum-laser-cleaning-micro.jpg`
- `/images/material/stainless-steel-laser-cleaning-micro.jpg`

**Usage**: Microscopic analysis images showing before/after laser cleaning results

### 2. Hero Images

**Format**: `{material-name}-laser-cleaning-hero.jpg`

**Examples**:
- `/images/material/oak-laser-cleaning-hero.jpg`
- `/images/material/aluminum-laser-cleaning-hero.jpg`
- `/images/material/stainless-steel-laser-cleaning-hero.jpg`

**Usage**: Main promotional/header images for material pages

### 3. Social Media Images

**Format**: `{material-name}-laser-cleaning-micro-social.jpg`

**Examples**:
- `/images/material/oak-laser-cleaning-micro-social.jpg`
- `/images/material/aluminum-laser-cleaning-micro-social.jpg`

**Usage**: Optimized images for social media sharing (Open Graph, Twitter Cards)

## Migration from Legacy Naming

### ❌ Old Pattern (Deprecated)
```
{material-name}-cleaning-analysis.jpg
{material-name}-cleaning-analysis-social.jpg
```

### ✅ New Pattern (Current)
```
{material-name}-laser-cleaning-micro.jpg
{material-name}-laser-cleaning-micro-social.jpg
```

### Migration Status
- **✅ Complete**: All 100+ YAML files in `[REMOVED] content/components/caption/`
- **✅ Complete**: TypeScript configuration files
- **✅ Complete**: Example data files
- **✅ Complete**: Social media image references

## Implementation in Code

### TypeScript/JavaScript
```typescript
// Correct implementation
const imageUrl = `/images/material/${materialName}-laser-cleaning-micro.jpg`;
const socialImage = `/images/material/${materialName}-laser-cleaning-micro-social.jpg`;
const heroImage = `/images/material/${materialName}-laser-cleaning-hero.jpg`;
```

### YAML Frontmatter
```yaml
images:
  micro:
    url: "/images/material/oak-laser-cleaning-micro.jpg"
    alt: "Microscopic comparison of oak surface before and after laser cleaning"
    width: 800
    height: 450
    format: "JPEG"
```

### SEO Metadata
```yaml
seo_data:
  og_image: "/images/material/oak-laser-cleaning-micro-social.jpg"
  twitter_card: "summary_large_image"
```

## Validation Scripts

Use the following scripts to verify image naming compliance:

```bash
# Analyze current image path patterns
node scripts/analyze-image-paths.js

# Search for any remaining old patterns
grep -r "cleaning-analysis" . --exclude-dir=node_modules

# Verify new pattern implementation
grep -r "laser-cleaning-micro" . --exclude-dir=node_modules
```

## Guidelines for New Images

When adding new material images:

1. **Follow the naming pattern**: `{material-name}-laser-cleaning-{type}.jpg`
2. **Supported types**: `micro`, `hero`, `micro-social`
3. **Use kebab-case**: Convert spaces to hyphens, lowercase all letters
4. **Material name consistency**: Ensure the same material name across all related files

### Example for New Material "Carbon Fiber"
```
/images/material/carbon-fiber-laser-cleaning-hero.jpg
/images/material/carbon-fiber-laser-cleaning-micro.jpg
/images/material/carbon-fiber-laser-cleaning-micro-social.jpg
```

## Other Image Categories (Not Affected)

The following image categories maintain their existing naming patterns:

- **Author images**: `/images/author/{author-name}.jpg`
- **Product images**: `/images/products/{product-name}.jpg`
- **Site images**: `/images/home-og.jpg`, `/images/Favicon/*`
- **Logo images**: `/images/logo-*.png`

## Quality Assurance

### Automated Checks
- No references to old `cleaning-analysis` pattern should remain
- All laser cleaning images must follow `laser-cleaning-micro` pattern
- Social images must include `-social` suffix

### Manual Verification
1. Check that image files exist in `/public/images/`
2. Verify alt text is descriptive and accessible
3. Ensure proper image dimensions (800x450 for micro images)
4. Confirm social images are optimized for sharing

## Related Documentation

- [Project README](../README.md) - Main project documentation
- [Technical Implementation](./TECHNICAL_IMPLEMENTATION.md) - Implementation details
- [Author Architecture](./AUTHOR_ARCHITECTURE.md) - Author system documentation
