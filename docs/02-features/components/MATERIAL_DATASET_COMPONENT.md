# Material Dataset Component - Usage Guide

## Overview

The `MaterialDatasetCard` component provides a reusable dataset download interface for each material page. It allows users to download structured data in JSON or CSV formats directly from the material page.

## Features

✅ **Multiple Formats** - JSON and CSV downloads
✅ **API Access** - Direct API endpoint with copy-to-clipboard
✅ **Data Preview** - Shows what's included in the dataset
✅ **Schema.org Compliant** - JSON-LD format for Google Dataset Search
✅ **License Information** - Clear CC BY 4.0 licensing
✅ **Responsive Design** - Works on all devices
✅ **Dark Mode Support** - Automatic theme adaptation

## Installation

### 1. Component Location
```
app/components/Dataset/MaterialDatasetCard.tsx
```

### 2. API Endpoint
```
app/api/dataset/materials/[slug]/route.ts
```

## Usage

### Basic Usage

Add the component to any material page:

```tsx
import MaterialDatasetCard from '@/app/components/Dataset/MaterialDatasetCard';

export default async function MaterialPage({ params }) {
  const material = await getArticle(params.slug);
  
  return (
    <div>
      {/* Your existing content */}
      
      {/* Add Dataset Card */}
      <MaterialDatasetCard 
        material={material.metadata} 
      />
    </div>
  );
}
```

### With Full Dataset Link

Show a link to the complete dataset page:

```tsx
<MaterialDatasetCard 
  material={material.metadata}
  showFullDataset={true}
/>
```

### Example Integration in Material Page

```tsx
// app/materials/[category]/[subcategory]/[slug]/page.tsx

import MaterialDatasetCard from '@/app/components/Dataset/MaterialDatasetCard';

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { category, subcategory, slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) notFound();
  
  const material = article.metadata as any;
  
  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection material={material} />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          <MaterialContent article={article} />
        </div>
        
        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Dataset Card */}
          <MaterialDatasetCard 
            material={material}
            showFullDataset={true}
          />
          
          {/* Other sidebar components */}
          <RelatedMaterials category={category} />
        </div>
      </div>
    </Layout>
  );
}
```

## API Endpoints

### Single Material Dataset

**Endpoint:** `/api/dataset/materials/[slug]`

**Parameters:**
- `format` (optional): `json` | `csv` (default: `json`)

**Examples:**
```bash
# JSON format
GET /api/dataset/materials/titanium-laser-cleaning

# CSV format
GET /api/dataset/materials/titanium-laser-cleaning?format=csv
```

### Response Format

**JSON Response:**
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": "https://www.z-beam.com/materials/metal/non-ferrous/titanium-laser-cleaning#dataset",
  "name": "Titanium Laser Cleaning Dataset",
  "description": "Comprehensive laser cleaning parameters and material properties for Titanium",
  "version": "1.0",
  "dateModified": "2025-11-03",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "creator": {
    "@type": "Organization",
    "name": "Z-Beam Laser Cleaning",
    "url": "https://www.z-beam.com"
  },
  "material": {
    "name": "Titanium",
    "slug": "titanium-laser-cleaning",
    "classification": {
      "category": "metal",
      "subcategory": "non-ferrous"
    },
    "laserParameters": {
      "power": { "value": 100, "unit": "W" },
      "fluence": { "value": 2.5, "unit": "J/cm²" },
      "wavelength": { "value": 1064, "unit": "nm" }
    },
    "materialProperties": { ... },
    "applications": [...],
    "safetyConsiderations": [...]
  },
  "variableMeasured": [...],
  "citation": "Z-Beam (2025). Titanium Laser Cleaning Dataset. https://www.z-beam.com/materials/metal/non-ferrous/titanium-laser-cleaning"
}
```

**CSV Response:**
```csv
"Field","Category","Property","Value","Unit"
"Basic","Info","Name","Titanium",""
"Basic","Info","Category","metal",""
"Basic","Info","Subcategory","non-ferrous",""
"Parameter","Laser","power","100","W"
"Parameter","Laser","fluence","2.5","J/cm²"
"Parameter","Laser","wavelength","1064","nm"
...
```

## Data Structure

### Material Data Interface

```typescript
interface MaterialData {
  name: string;                    // Material name
  category: string;                // Primary category
  subcategory?: string;            // Subcategory
  slug: string;                    // URL slug
  parameters?: {                   // Laser parameters
    power?: { value: number; unit: string };
    fluence?: { value: number; unit: string };
    wavelength?: { value: number; unit: string };
    scanSpeed?: { value: number; unit: string };
    spotSize?: { value: number; unit: string };
    pulseDuration?: { value: number; unit: string };
  };
  materialProperties?: any;        // Physical properties
  applications?: string[];         // Industry applications
  faqs?: Array<{                  // Technical FAQs
    question: string;
    answer: string;
  }>;
}
```

## Styling

The component uses Tailwind CSS and includes:
- Gradient backgrounds
- Dark mode support
- Responsive design
- Lucide React icons

### Customization

You can customize colors by modifying the component:

```tsx
// Change primary color from blue to purple
className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900"
```

## License & Attribution

All datasets are licensed under **Creative Commons BY 4.0**:
- ✅ Free to use
- ✅ Free to modify
- ✅ Free for commercial use
- ✅ Must provide attribution

**Citation Format:**
```
Z-Beam (2025). [Material Name] Laser Cleaning Dataset. 
https://www.z-beam.com/materials/[category]/[subcategory]/[slug]
```

## SEO Benefits

### Google Dataset Search
The JSON-LD format is automatically indexed by Google Dataset Search, making your data discoverable at:
https://datasetsearch.research.google.com/

### Schema.org Compliance
Each dataset includes proper Schema.org markup with:
- `@type: Dataset`
- Creator information
- License
- Variable measurements
- Citation information

## Troubleshooting

### Downloads Not Working
- Check API endpoint is accessible: `/api/dataset/materials/[slug]`
- Verify material slug is correct
- Check browser console for errors

### Empty CSV
- Ensure material has `parameters` or `materialProperties`
- Check data structure matches interface

### API Returns 404
- Verify slug exists in content system
- Check `getArticle()` function works
- Ensure material metadata is properly structured

## Future Enhancements

Potential additions:
- [ ] Excel (.xlsx) format support
- [ ] XML format for legacy systems
- [ ] Bulk download (all materials)
- [ ] API authentication for rate limiting
- [ ] Dataset versioning
- [ ] Change log tracking
- [ ] Custom field selection
- [ ] Advanced filtering options

## Support

For issues or questions:
- GitHub: [Your repo]
- Email: info@z-beam.com
- Documentation: /docs/dataset
