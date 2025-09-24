# Comprehensive Article JSON-LD Schema

This single comprehensive schema provides complete structured data for your article pages using Schema.org's `@graph` format, which allows multiple related entities in one script tag.

## What's Included

### 🔍 **7 Schema Types in One**:

1. **Article** - Main article content with EEAT optimization
2. **Product** - Material properties and specifications  
3. **HowTo** - Step-by-step laser cleaning process
4. **BreadcrumbList** - Site navigation structure
5. **WebPage** - Page metadata and relationships
6. **Website** - Site-wide information and search
7. **FAQPage** - Common questions and answers

## ✅ **EEAT Optimized Features**:

- **Expertise**: Author credentials, technical knowledge areas
- **Experience**: Detailed how-to steps, real applications
- **Authoritativeness**: Publisher info, organization details  
- **Trustworthiness**: Structured properties, comprehensive data

## 🎯 **SEO Benefits**:

- **Rich Snippets**: Article, product, and how-to results
- **Enhanced Search**: FAQ boxes, breadcrumb navigation
- **Knowledge Graph**: Entity relationships and properties
- **Voice Search**: Structured Q&A for smart assistants

## 📊 **Auto-Populated Data**:

The schema automatically pulls data from your existing frontmatter:

```yaml
# Your existing frontmatter
title: "Steel Laser Cleaning"
description: "Technical overview..."
category: "metal"
author: "Z-Beam Technical Team"
properties:
  density: 7.85
  densityUnit: "g/cm³"
  thermalConductivity: 50.2
laserSettings:
  wavelength: 1064
  power: 100
applications:
  - "Automotive"
  - "Manufacturing"
```

## 🔧 **Implementation**:

Simply import and use in your pages:

```tsx
import { createJsonLdForArticle } from '../utils/jsonld-helper';

// In your page component
const jsonLdSchema = createJsonLdForArticle(article, slug);

return (
  <>
    {jsonLdSchema && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSchema, null, 2)
        }}
      />
    )}
    <YourPageContent />
  </>
);
```

## 📋 **Template Variables**:

The schema uses these placeholders that get auto-replaced:

### Article Info:
- `{{SLUG}}` - Page URL slug
- `{{ARTICLE_TITLE}}` - Article title  
- `{{ARTICLE_DESCRIPTION}}` - Meta description
- `{{AUTHOR_NAME}}` - Content author
- `{{KEYWORDS}}` - SEO keywords
- `{{WORD_COUNT}}` - Estimated word count

### Material Properties:
- `{{MATERIAL_NAME}}` - Material name (extracted from title)
- `{{DENSITY_VALUE}}` - Density number
- `{{THERMAL_CONDUCTIVITY}}` - Thermal properties
- `{{MELTING_POINT}}` - Temperature data

### Laser Parameters:
- `{{LASER_TYPE}}` - Laser system type
- `{{LASER_POWER}}` - Power rating
- `{{LASER_WAVELENGTH}}` - Operating wavelength

### Applications:
- `{{PRIMARY_APPLICATION}}` - Main use case
- `{{SECONDARY_APPLICATION}}` - Secondary use

## 🌟 **Key Advantages**:

1. **Single Script Tag**: One comprehensive schema instead of multiple
2. **Automatic Data**: Uses your existing frontmatter structure  
3. **SEO Complete**: All major schema types covered
4. **EEAT Compliant**: Follows Google's quality guidelines
5. **Rich Results**: Eligible for enhanced search features
6. **Easy Maintenance**: Template-based with auto-population

## 🔍 **Validation**:

Test your schema with:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Search Console](https://search.google.com/search-console)

The comprehensive schema provides maximum SEO benefit with minimal implementation effort!