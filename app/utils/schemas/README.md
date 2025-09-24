# JSON-LD Schema Templates

This directory contains Schema.org compliant JSON-LD templates for the Z-Beam website.

## Available Schemas

### 1. Material Schema (`material-schema.json`)
- **Type**: Product
- **Purpose**: Describes individual material pages
- **EEAT Features**: Expertise (author), Experience (applications), Authoritativeness (publisher), Trustworthiness (structured properties)

### 2. HowTo Schema (`howto-schema.json`) 
- **Type**: HowTo
- **Purpose**: Step-by-step laser cleaning process
- **Features**: Tools, supplies, detailed steps with images

### 3. Breadcrumb Schema (`breadcrumb-schema.json`)
- **Type**: BreadcrumbList  
- **Purpose**: Site navigation structure
- **SEO**: Helps search engines understand page hierarchy

### 4. Organization Schema (`organization-schema.json`)
- **Type**: Organization
- **Purpose**: Company information and expertise
- **Features**: Contact info, expertise areas, social media

### 5. Website Schema (`website-schema.json`)
- **Type**: WebSite
- **Purpose**: Main website structure and search functionality
- **Features**: Site search, main categories

## Usage

### Template Variables
Replace these placeholders in the JSON files:

- `{{MATERIAL_NAME}}` - Material title (e.g., "Steel")
- `{{MATERIAL_DESCRIPTION}}` - Material description
- `{{SLUG}}` - URL slug (e.g., "steel-laser-cleaning")
- `{{MATERIAL_CATEGORY}}` - Category (e.g., "metal", "plastic")
- `{{AUTHOR_NAME}}` - Author name
- `{{DENSITY_VALUE}}` - Density number
- `{{DENSITY_UNIT}}` - Unit (e.g., "g/cm³")
- `{{THERMAL_CONDUCTIVITY}}` - Thermal conductivity value
- `{{THERMAL_UNIT}}` - Unit (e.g., "W/m·K")
- `{{KEYWORDS}}` - Comma-separated keywords
- `{{LAST_MODIFIED}}` - ISO date string
- `{{DATE_PUBLISHED}}` - ISO date string
- `{{APPLICATIONS}}` - Additional applications

### Example Implementation

```javascript
// Load template
import materialSchema from './schemas/material-schema.json';

// Replace variables
const populatedSchema = JSON.stringify(materialSchema)
  .replace(/{{MATERIAL_NAME}}/g, 'Steel')
  .replace(/{{MATERIAL_DESCRIPTION}}/g, 'Technical overview of Steel laser cleaning')
  .replace(/{{SLUG}}/g, 'steel-laser-cleaning')
  .replace(/{{MATERIAL_CATEGORY}}/g, 'metal')
  .replace(/{{AUTHOR_NAME}}/g, 'Z-Beam Technical Team')
  .replace(/{{DENSITY_VALUE}}/g, '7.85')
  .replace(/{{DENSITY_UNIT}}/g, 'g/cm³')
  .replace(/{{THERMAL_CONDUCTIVITY}}/g, '50.2')
  .replace(/{{THERMAL_UNIT}}/g, 'W/m·K')
  .replace(/{{KEYWORDS}}/g, 'steel, metal, laser cleaning')
  .replace(/{{LAST_MODIFIED}}/g, new Date().toISOString())
  .replace(/{{DATE_PUBLISHED}}/g, new Date().toISOString())
  .replace(/{{APPLICATIONS}}/g, 'Automotive');

// Use in HTML
<script type="application/ld+json">
  {populatedSchema}
</script>
```

### React Component Example

```tsx
import materialTemplate from '../utils/schemas/material-schema.json';
import breadcrumbTemplate from '../utils/schemas/breadcrumb-schema.json';

function MaterialPage({ material }: { material: MaterialData }) {
  const materialSchema = JSON.stringify(materialTemplate)
    .replace(/{{MATERIAL_NAME}}/g, material.title)
    .replace(/{{SLUG}}/g, material.slug)
    // ... other replacements

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: materialSchema }}
      />
      {/* Your content */}
    </>
  );
}
```

## EEAT Optimization

These schemas are optimized for Google's EEAT guidelines:

- **Expertise**: Author credentials and technical team attribution
- **Experience**: Detailed how-to processes and real-world applications  
- **Authoritativeness**: Publisher organization info and expertise areas
- **Trustworthiness**: Structured data compliance and comprehensive properties