# JsonLD Component System - Usage Guide

**Last Updated**: October 16, 2025  
**Components**: `JsonLD`, `MaterialJsonLD`  
**Location**: `app/components/JsonLD/JsonLD.tsx`

---

## 📋 Overview

The JsonLD component system provides two complementary approaches for adding structured data to pages:

1. **`JsonLD`** - Base component for rendering pre-generated JSON-LD schemas
2. **`MaterialJsonLD`** - Enhanced component that automatically generates comprehensive E-E-A-T optimized schemas from frontmatter

---

## 🎯 MaterialJsonLD Component (Recommended for Material Pages)

### Purpose
Automatically generates 8 comprehensive Schema.org schemas optimized for Google's E-E-A-T guidelines, extracting data dynamically from frontmatter structure.

### Generated Schema Types

| Schema Type | Purpose | E-E-A-T Aspect | Frontmatter Source |
|-------------|---------|----------------|-------------------|
| **TechnicalArticle** | Main content | Expertise & Authority | title, description, author, images |
| **Product** | Material specs | Authoritativeness | materialProperties (all categories) |
| **HowTo** | Process steps | Experience | machineSettings, outcomeMetrics |
| **Dataset** | Verified data | Trustworthiness | materialProperties + metadata |
| **BreadcrumbList** | Navigation | - | category, title, slug |
| **WebPage** | Page metadata | - | title, description, dates |
| **Person** | Author profile | Expertise | author (full profile) |
| **Certification** | Compliance | Trustworthiness | regulatoryStandards |

### Usage

#### Basic Implementation
```tsx
import { MaterialJsonLD } from '../components/JsonLD/JsonLD';

export default async function MaterialPage({ params }) {
  const article = await getArticle(params.slug);
  
  return (
    <>
      <MaterialJsonLD article={article} slug={params.slug} />
      <Layout components={article.components} />
    </>
  );
}
```

#### What It Does
The component automatically:
- ✅ Extracts ALL frontmatter fields
- ✅ Generates 8 interconnected schemas in `@graph` structure
- ✅ Includes confidence scores for trustworthiness
- ✅ Adds source citations for authoritativeness
- ✅ Includes verification metadata with dates
- ✅ Links author credentials to article
- ✅ Maps machine settings to process steps
- ✅ Includes regulatory compliance data

### Dynamic Frontmatter Integration

#### Property Categories (Automatically Detected)
```yaml
materialProperties:
  laser_material_interaction:
    laserAbsorption:
      value: 85.0
      unit: '%'
      confidence: 92
      source: 'Optical Database'
      metadata:
        last_verified: '2025-10-15T00:00:00Z'
  
  material_characteristics:
    thermalConductivity:
      value: 200.0
      unit: 'W/m·K'
      confidence: 95
```

**Result**: Both categories automatically extracted to Product schema with confidence scores.

#### Machine Settings → HowTo Steps
```yaml
machineSettings:
  powerRange:
    value: '50-100'
    unit: 'W'
    description: 'Optimal power range'
  wavelength:
    value: '1064'
    unit: 'nm'
    description: 'Nd:YAG laser'
```

**Result**: Automatically converted to HowTo steps:
```json
{
  "@type": "HowTo",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Set Laser Power",
      "text": "Configure laser power to 50-100 W",
      "description": "Optimal power range"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Select Wavelength",
      "text": "Set wavelength to 1064 nm",
      "description": "Nd:YAG laser"
    }
  ]
}
```

#### Author Profile → Person Schema
```yaml
author:
  id: 2
  name: Alessandro Moretti
  title: Ph.D.
  country: Italy
  expertise: Laser-Based Additive Manufacturing
  image: /images/authors/alessandro-moretti.jpg
```

**Result**: Full Person schema with expertise and credentials.

#### Environmental Impact → Product Sustainability
```yaml
environmentalImpact:
  - benefit: Chemical Waste Elimination
    description: Eliminates hazardous chemical waste streams
    quantifiedBenefits: Up to 100% reduction in chemical cleaning agents
```

**Result**: Added to Product schema sustainability field.

#### Outcome Metrics → HowTo Expected Output
```yaml
outcomeMetrics:
  - metric: Contaminant Removal Efficiency
    description: Percentage of target contaminants successfully removed
    typicalRanges: 95-99.9% depending on application and material
    measurementMethod: Surface profilometry and microscopy analysis
```

**Result**: Added as HowTo expectedOutput field.

#### Regulatory Standards → Certification Schema
```yaml
regulatoryStandards:
  - name: FDA 21 CFR Part 820
    description: Quality System Regulation for medical device manufacturing
    issuingOrganization: FDA
```

**Result**: Generates Certification schema for trustworthiness.

---

## 🔧 Base JsonLD Component

### Purpose
Render pre-generated JSON-LD schemas for custom use cases.

### Usage

```tsx
import { JsonLD } from '../components/JsonLD/JsonLD';

const customSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is laser cleaning?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Laser cleaning is a non-contact process...'
      }
    }
  ]
};

export default function FAQPage() {
  return (
    <>
      <JsonLD data={customSchema} />
      <div>FAQ Content</div>
    </>
  );
}
```

---

## 📊 E-E-A-T Optimization

### Experience Signals
- ✅ Detailed process steps from `machineSettings`
- ✅ Outcome metrics with typical ranges
- ✅ Application examples from `applications` array
- ✅ Before/after analysis from `micro`
- ✅ Environmental impact data

### Expertise Signals
- ✅ Author credentials (`title`, `expertise`)
- ✅ Technical specifications with precision
- ✅ Confidence scores on measurements
- ✅ Min/max ranges for properties
- ✅ Detailed descriptions for context

### Authoritativeness Signals
- ✅ Source citations for each property
- ✅ Publisher information
- ✅ Industry-standard categorization
- ✅ Regulatory compliance certifications
- ✅ Author affiliations

### Trustworthiness Signals
- ✅ Verification metadata with dates
- ✅ Data provenance tracking
- ✅ Transparent confidence scores
- ✅ Fix reason documentation
- ✅ Licensed data (CC BY 4.0)

---

## 🔄 Dynamic Updates

### Frontmatter Changes Automatically Propagate

**Add New Property**:
```yaml
materialProperties:
  laser_material_interaction:
    newProperty:  # <-- Add new property
      value: 42.0
      unit: 'J/cm²'
      confidence: 90
```
✅ Automatically appears in Product schema with confidence score.

**Update Author Credentials**:
```yaml
author:
  title: Ph.D., P.E.  # <-- Updated title
  expertise: Advanced Laser Physics  # <-- New expertise
```
✅ Person schema automatically updated with new credentials.

**Add Machine Parameter**:
```yaml
machineSettings:
  newParameter:  # <-- Add new setting
    value: '10'
    unit: 'kHz'
    description: 'Pulse frequency'
```
✅ Automatically becomes new HowTo step.

**Add Environmental Benefit**:
```yaml
environmentalImpact:
  - benefit: Energy Efficiency  # <-- New benefit
    description: Reduces energy consumption by 40%
    quantifiedBenefits: 40% reduction vs traditional methods
```
✅ Added to Product sustainability array.

---

## 🧪 Testing

### Unit Tests
Location: `tests/unit/MaterialJsonLD.test.tsx`

Run tests:
```bash
npm test -- MaterialJsonLD.test.tsx
```

### Test Coverage
- ✅ Schema generation for all 8 types
- ✅ Confidence score inclusion
- ✅ Author profile extraction
- ✅ Machine settings → HowTo steps conversion
- ✅ Environmental impact integration
- ✅ Dynamic frontmatter updates
- ✅ Missing field handling
- ✅ Invalid data handling

---

## 🔍 Validation

### Google Rich Results Test
1. Deploy page with MaterialJsonLD component
2. Visit: https://search.google.com/test/rich-results
3. Enter page URL
4. Verify schemas detected:
   - ✅ Article/TechnicalArticle
   - ✅ Product
   - ✅ HowTo
   - ✅ BreadcrumbList
   - ✅ Person

### Schema.org Validator
1. Copy JSON-LD output from page source
2. Visit: https://validator.schema.org/
3. Paste and validate
4. Verify no errors/warnings

### Manual Inspection
View page source and find:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechnicalArticle",
      ...
    },
    {
      "@type": "Product",
      ...
    },
    ...
  ]
}
</script>
```

---

## 📈 SEO Benefits

### Rich Snippets
- Enhanced search result appearance
- Product specifications in results
- How-to steps may appear as featured content
- Breadcrumb navigation in results
- Author byline with credentials

### Knowledge Graph
- Potential inclusion in Google's knowledge panels
- Material property quick facts
- Expert author recognition
- Related materials suggestions

### E-E-A-T Ranking Boost
- Comprehensive expertise signals
- Verified data with sources
- Author credibility
- Data provenance and transparency

---

## 🎯 Best Practices

### 1. Always Include Author Credentials
```yaml
author:
  title: Ph.D.  # Include academic/professional credentials
  expertise: Specific Field  # Be specific about knowledge areas
  image: /path/to/photo.jpg  # Profile photo builds trust
```

### 2. Add Confidence Scores
```yaml
materialProperties:
  category:
    property:
      confidence: 92  # Include for all measurements
      source: 'Source Name'  # Always cite sources
```

### 3. Document Verification
```yaml
materialProperties:
  category:
    property:
      metadata:
        last_verified: '2025-10-15T00:00:00Z'
        verification_source: 'Lab measurement'
        fix_reason: 'Corrected physical constraint'  # If applicable
```

### 4. Provide Detailed Machine Settings
```yaml
machineSettings:
  parameter:
    description: 'Detailed explanation of what this does'  # Be thorough
```

### 5. Quantify Environmental Impact
```yaml
environmentalImpact:
  - quantifiedBenefits: 'Up to 100% reduction'  # Use numbers
```

### 6. Include Regulatory Standards
```yaml
regulatoryStandards:
  - name: 'Standard Name'
    issuingOrganization: 'Organization'  # Builds authority
```

---

## 🚀 Future Enhancements

### Potential Additions
- **FAQPage Schema**: From outcome metrics questions
- **VideoObject Schema**: If demonstration videos added
- **Review Schema**: Customer testimonials
- **ItemList Schema**: Related materials section
- **Event Schema**: Webinars or training sessions

### To Add New Schema Type
1. Edit `app/utils/jsonld-helper.ts`
2. Create new builder function (e.g., `createFAQSchema`)
3. Add to `@graph` array in `createJsonLdForArticle()`
4. Update tests in `MaterialJsonLD.test.tsx`
5. Document in this guide

---

## 📚 Related Documentation

- [JSON-LD E-E-A-T Implementation](JSONLD_EEAT_IMPLEMENTATION.md) - Comprehensive schema details
- [Frontmatter Current Structure](FRONTMATTER_CURRENT_STRUCTURE.md) - All available fields
- [Frontmatter Value Investigation](../FRONTMATTER_VALUE_INVESTIGATION.md) - Data quality analysis

---

## ✅ Quick Reference

### Import
```tsx
import { MaterialJsonLD } from '../components/JsonLD/JsonLD';
```

### Use in Material Page
```tsx
<MaterialJsonLD article={article} slug={slug} />
```

### What Happens
- ✅ Extracts ALL frontmatter fields
- ✅ Generates 8 E-E-A-T optimized schemas
- ✅ Updates automatically with frontmatter changes
- ✅ No manual schema maintenance needed

### Validation
- Google Rich Results Test
- Schema.org Validator
- Manual source inspection

### Benefits
- 🎯 Enhanced search results
- 🔍 Rich snippets
- 📊 Knowledge graph inclusion
- ⭐ E-E-A-T ranking boost
- 🤖 Zero maintenance

---

## 💡 Summary

The `MaterialJsonLD` component provides:
- ✅ **Automatic** schema generation from frontmatter
- ✅ **Comprehensive** E-E-A-T optimization
- ✅ **Dynamic** updates with frontmatter changes
- ✅ **Zero** manual maintenance required
- ✅ **8 schema types** in single component
- ✅ **100%** frontmatter field coverage

Simply add the component to your material page and all structured data is automatically generated and optimized! 🎉
