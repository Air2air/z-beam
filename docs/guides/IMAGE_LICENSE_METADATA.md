# Image License Metadata Implementation Guide

**Date**: October 25, 2025  
**Implementation**: Google Image License Structured Data  
**Reference**: https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata

## Overview

This guide explains how to add license metadata to hero and micro images in Z-Beam content to help images appear in Google Image Search with proper licensing information.

## Why Add License Metadata?

**Benefits:**
- **Copyright Protection**: Clearly state image ownership and usage rights
- **Google Image Search**: Images can appear in "Licensable" badge in search results
- **Attribution**: Proper credit to image creators
- **Legal Clarity**: Define terms for image reuse
- **SEO Enhancement**: Better visibility in image search results

## Two Implementation Methods

Google supports two ways to add image license metadata:

### 1. Structured Data (JSON-LD) - Current Implementation

**What we use**: Schema.org ImageObject in JSON-LD format  
**How it works**: License metadata added to page HTML, associated with images  
**Pros**: 
- Easy to implement in YAML frontmatter
- Centralized management
- No image file modification needed
- Already integrated with our schema system

**Cons**:
- Metadata doesn't travel with the image file
- Must be added to each page where image appears

### 2. IPTC Photo Metadata (XMP) - Alternative

**What it is**: License info embedded directly in image files  
**How it works**: Metadata stored in XMP format within JPEG/PNG files  
**Pros**:
- Metadata travels with the image
- Only needs to be added once per image
- Works even if image is copied to other sites
- Professional photography standard

**Cons**:
- Requires image editing software (Adobe Lightroom, Photoshop, ExifTool)
- Must modify actual image files
- Harder to bulk update
- Increases file size slightly

**IPTC Fields Google Extracts**:
- Copyright Notice
- Creator
- Credit Line  
- Web Statement of Rights (license URL)
- Licensor URL (acquire license page)

**Note**: If both IPTC and structured data are present, Google uses the structured data. We're using structured data (method #1) for easier management.

### Photoshop and XMP Metadata Warning

**Important**: Photoshop can strip XMP/IPTC metadata depending on export method:

- ❌ **"Save for Web"** (Legacy): Removes ALL metadata by default
- ⚠️ **"Export As"**: Has checkbox - select "Metadata: Copyright and Contact Info" to preserve
- ✅ **"Save As"**: Preserves metadata by default

**If using IPTC method**: Always verify metadata is preserved after exporting. Use ExifTool or Adobe Bridge to confirm:
```bash
exiftool -IPTC:all -XMP:all your-image.jpg
```

**For Z-Beam**: We use structured data (JSON-LD) so image metadata doesn't need to be in the files. However, embedding metadata in files is good practice for copyright protection.

## Implementation

### 1. Type Definition

The `ImageMetadata` interface in `types/centralized.ts` now includes:

```typescript
export interface ImageMetadata {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  
  // Google Image License Metadata
  license?: string;              // URL to license page
  acquireLicensePage?: string;   // URL to acquire license
  creditText?: string;           // Attribution text
  creator?: string | {           // Creator information (optional - uses page author by default)
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  copyrightNotice?: string;      // Copyright statement
}
```

**Note**: The `creator` field is optional. If not specified, the Schema.org generator will automatically use the page author as the creator.

### 2. Schema.org Generation

The `SchemaFactory.ts` automatically generates proper ImageObject schema with license metadata. If no explicit `creator` is specified in the image metadata, it uses the page author:

```json
{
  "@type": "ImageObject",
  "@id": "https://z-beam.com/materials/metal/aluminum#image",
  "url": "/images/material/aluminum-laser-cleaning-hero.jpg",
  "caption": "Aluminum surface undergoing laser cleaning",
  "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
  "acquireLicensePage": "https://z-beam.com/image-licensing",
  "creditText": "Photo by Todd Dunning for Z-Beam",
  "creator": {
    "@type": "Person",
    "name": "Todd Dunning"
  },
  "copyrightNotice": "© 2025 Z-Beam. All rights reserved."
}
```

## Usage in YAML Frontmatter

### Option 1: Full License Metadata (Recommended)

**Note**: The `creator` field is optional. If omitted, the system automatically uses the page author.

```yaml
images:
  hero:
    alt: Aluminum surface undergoing laser cleaning showing precise contamination removal
    url: /images/material/aluminum-laser-cleaning-hero.jpg
    width: 1920
    height: 1080
    license: https://creativecommons.org/licenses/by-nc-nd/4.0/
    acquireLicensePage: https://z-beam.com/image-licensing
    creditText: Photo by Todd Dunning for Z-Beam
    copyrightNotice: © 2025 Z-Beam. All rights reserved.
    # creator: Optional - uses page author by default
  
  micro:
    alt: Microscopic view of aluminum surface showing laser cleaning effects
    url: /images/material/aluminum-laser-cleaning-micro.jpg
    width: 1200
    height: 800
    license: https://creativecommons.org/licenses/by-nc-nd/4.0/
    creditText: # Uses caption.description automatically
    copyrightNotice: © 2025 Z-Beam
    # creator: Automatically populated from page author

author:
  name: Todd Dunning
  title: MA
  expertise: Optical Materials for Laser Systems
  # Author info automatically used as image creator
```

### Option 2: Minimal License Metadata

For simplicity, you can include just the essential fields:

```yaml
images:
  hero:
    alt: Aluminum laser cleaning demonstration
    url: /images/material/aluminum-laser-cleaning-hero.jpg
    license: https://creativecommons.org/licenses/by-nc-nd/4.0/
    creditText: Z-Beam Industrial Solutions
  
  micro:
    alt: Microscopic aluminum surface analysis
    url: /images/material/aluminum-laser-cleaning-micro.jpg
    license: https://creativecommons.org/licenses/by-nc-nd/4.0/
    creditText: Z-Beam Research Team
```

### Option 3: Proprietary/All Rights Reserved

```yaml
images:
  hero:
    alt: Proprietary laser cleaning process
    url: /images/material/aluminum-laser-cleaning-hero.jpg
    acquireLicensePage: https://z-beam.com/contact
    creditText: Proprietary image - Z-Beam Industrial Solutions
    copyrightNotice: © 2025 Z-Beam Industrial Solutions. All rights reserved. No reproduction without permission.
```

## License Field Options

### Required Fields

1. **`license`** (URL): Link to the license under which the image can be used
   - Creative Commons: `https://creativecommons.org/licenses/by/4.0/`
   - Custom license: `https://z-beam.com/image-license`

**OR**

2. **`acquireLicensePage`** (URL): Page where users can get licensing information or permission
   - Contact page: `https://z-beam.com/contact`
   - Licensing page: `https://z-beam.com/image-licensing`

**Note:** You must include **at least one** of these two fields.

### Optional Fields

- **`creditText`**: Text attribution for the image
- **`creator`**: Person or organization who created the image (optional - uses page author by default)
- **`copyrightNotice`**: Copyright statement

**Note**: If you don't specify a `creator`, the system will automatically use the page author information. Only add an explicit `creator` field if the image was created by someone different from the page author.

## Common License URLs

### Creative Commons Licenses

```yaml
# Attribution (CC BY)
license: https://creativecommons.org/licenses/by/4.0/

# Attribution-ShareAlike (CC BY-SA)
license: https://creativecommons.org/licenses/by-sa/4.0/

# Attribution-NoDerivs (CC BY-ND)
license: https://creativecommons.org/licenses/by-nd/4.0/

# Attribution-NonCommercial (CC BY-NC)
license: https://creativecommons.org/licenses/by-nc/4.0/

# Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)
license: https://creativecommons.org/licenses/by-nc-sa/4.0/

# Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)
license: https://creativecommons.org/licenses/by-nc-nd/4.0/

# Public Domain (CC0)
license: https://creativecommons.org/publicdomain/zero/1.0/
```

### Proprietary Licenses

```yaml
# Custom license page
license: https://z-beam.com/image-license

# Contact for licensing
acquireLicensePage: https://z-beam.com/contact

# All rights reserved (use acquireLicensePage instead of license)
acquireLicensePage: https://z-beam.com/image-licensing
copyrightNotice: © 2025 Z-Beam Industrial Solutions. All rights reserved.
```

## Recommended Setup for Z-Beam

### For Original Z-Beam Photography

Images are automatically attributed to the page author. Simply add license info:

```yaml
images:
  hero:
    alt: [Description]
    url: [Path]
    license: https://creativecommons.org/licenses/by-nc-nd/4.0/
    creditText: Photo by [Author Name] for Z-Beam Industrial Solutions
    copyrightNotice: © 2025 Z-Beam Industrial Solutions

author:
  name: Todd Dunning
  # Author automatically becomes image creator in schema
```

### For Images by Different Creator

Only specify `creator` if different from page author:

```yaml
images:
  hero:
    alt: [Description]
    url: [Path]
    license: https://creativecommons.org/licenses/by-nc-nd/4.0/
    creditText: Photo by Jane Smith for Z-Beam
    creator:
      '@type': Person
      name: Jane Smith
    copyrightNotice: © 2025 Z-Beam Industrial Solutions
```

### For Stock/Licensed Images

```yaml
images:
  hero:
    alt: [Description]
    url: [Path]
    acquireLicensePage: https://z-beam.com/contact
    creditText: Licensed from [Source]
    copyrightNotice: © [Year] [Copyright Holder]. Used with permission.
```

## Bulk Update Script

To add license metadata to all existing material YAML files:

```bash
# Create a script to add default license metadata
cat > scripts/add-image-licenses.sh << 'EOF'
#!/bin/bash

# Default license configuration
LICENSE_URL="https://creativecommons.org/licenses/by-nc-nd/4.0/"
CREDIT_TEXT="Z-Beam Industrial Solutions"
COPYRIGHT_YEAR="2025"

# Process all frontmatter YAML files
find content/frontmatter -name "*.yaml" | while read file; do
  echo "Processing: $file"
  
  # Add license metadata to hero images (using yq or manual editing)
  # This is a template - adjust based on your needs
done
EOF

chmod +x scripts/add-image-licenses.sh
```

## Testing & Validation

### 1. Google Rich Results Test

Test individual pages:
```
https://search.google.com/test/rich-results?url=https://z-beam.com/materials/metal/aluminum
```

### 2. Check JSON-LD Output

View page source and search for ImageObject schema:
```json
{
  "@type": "ImageObject",
  "license": "...",
  "acquireLicensePage": "...",
  "creditText": "..."
}
```

### 3. Validate with Schema.org Validator

```
https://validator.schema.org/
```

## Google Image Search Results

Once implemented, your images may appear in Google Image Search with:

- **"Licensable" badge**: Shows when `license` or `acquireLicensePage` is present
- **License information**: Displayed when users view image details
- **Creator attribution**: Shows `creditText` and `creator` information
- **Copyright notice**: Displayed with the image

## Example: Complete Material YAML

```yaml
name: Aluminum
title: Aluminum Laser Cleaning
category: metal
subcategory: non-ferrous
description: Laser cleaning parameters for Aluminum

images:
  hero:
    alt: Aluminum surface undergoing laser cleaning showing precise contamination removal
    url: /images/material/aluminum-laser-cleaning-hero.jpg
    width: 1920
    height: 1080
    license: https://creativecommons.org/licenses/by-nc-nd/4.0/
    acquireLicensePage: https://z-beam.com/image-licensing
    creditText: Photo by Todd Dunning for Z-Beam
    copyrightNotice: © 2025 Z-Beam. All rights reserved.
    # creator automatically populated from author below
  
  micro:
    alt: Microscopic view of aluminum surface showing laser cleaning effects at 1000x magnification
    url: /images/material/aluminum-laser-cleaning-micro.jpg
    width: 1200
    height: 800
    license: https://creativecommons.org/licenses/by-nc-nd/4.0/
    creditText: # Uses caption.description
    copyrightNotice: © 2025 Z-Beam
    # creator automatically populated from author below

author:
  name: Todd Dunning
  title: MA
  expertise: Optical Materials for Laser Systems
  country: United States (California)
  # This author info is automatically used as the image creator in Schema.org

materialProperties:
  # ... rest of material data
```

## Next Steps

1. **Create License Page**: Set up `/image-licensing` page explaining usage rights
2. **Update Existing Content**: Add license metadata to all 546 material YAML files
3. **Test Implementation**: Validate with Google Rich Results Test
4. **Monitor Results**: Check Google Search Console for "Licensable" badge appearance
5. **Document Policy**: Create clear image usage policy for your website

## Resources

- [Google Image License Documentation](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata)
- [Schema.org ImageObject](https://schema.org/ImageObject)
- [Creative Commons Licenses](https://creativecommons.org/licenses/)
- [Copyright Best Practices](https://www.copyright.gov/help/faq/)

---

**Status**: ✅ Implemented  
**Last Updated**: October 25, 2025  
**Compatibility**: Google Image Search, Bing Images, Schema.org compliant
