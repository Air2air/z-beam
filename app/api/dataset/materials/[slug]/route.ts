// app/api/dataset/materials/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getArticle } from '@/app/utils/contentAPI';

// Generate CSV from material data
function generateCSV(material: any): string {
  const rows: string[][] = [];
  
  // Headers
  rows.push(['Field', 'Category', 'Property', 'Value', 'Unit']);
  
  // Basic info
  rows.push(['Basic', 'Info', 'Name', material.name || '', '']);
  rows.push(['Basic', 'Info', 'Category', material.category || '', '']);
  rows.push(['Basic', 'Info', 'Subcategory', material.subcategory || '', '']);
  
  // Laser parameters
  if (material.parameters) {
    Object.entries(material.parameters).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value?.value !== undefined) {
        rows.push(['Parameter', 'Laser', key, String(value.value), value.unit || '']);
      }
    });
  }
  
  // Material properties
  if (material.materialProperties) {
    Object.entries(material.materialProperties).forEach(([category, categoryData]: [string, any]) => {
      const props = categoryData?.properties || categoryData;
      if (typeof props === 'object') {
        Object.entries(props).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'object' && value?.value !== undefined) {
            rows.push(['Property', category, key, String(value.value), value.unit || '']);
          }
        });
      }
    });
  }
  
  // Applications
  if (material.applications && Array.isArray(material.applications)) {
    material.applications.forEach((app: string, index: number) => {
      rows.push(['Application', 'Industries', `Application ${index + 1}`, app, '']);
    });
  }
  
  // Convert to CSV string
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

// Generate JSON dataset
function generateJSON(material: any): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `https://www.z-beam.com/materials/${material.category}/${material.subcategory}/${material.slug}#dataset`,
    name: `${material.name} Laser Cleaning Dataset`,
    description: `Comprehensive laser cleaning parameters and material properties for ${material.name}`,
    version: '1.0',
    dateModified: material.dateModified || new Date().toISOString().split('T')[0],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: 'Z-Beam Laser Cleaning',
      url: 'https://www.z-beam.com'
    },
    material: {
      name: material.name,
      slug: material.slug,
      classification: {
        category: material.category,
        subcategory: material.subcategory
      },
      laserParameters: material.parameters || {},
      materialProperties: material.materialProperties || {},
      applications: material.applications || [],
      safetyConsiderations: material.safetyConsiderations || [],
      faqs: material.faqs?.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer
      })) || []
    },
    variableMeasured: extractVariables(material),
    citation: `Z-Beam (2025). ${material.name} Laser Cleaning Dataset. https://www.z-beam.com/materials/${material.category}/${material.subcategory}/${material.slug}`
  };
}

// Extract variables for Schema.org
function extractVariables(material: any): any[] {
  const variables: any[] = [];
  
  if (material.parameters) {
    Object.entries(material.parameters).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value?.value !== undefined) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: key,
          name: key,
          value: value.value,
          unitText: value.unit
        });
      }
    });
  }
  
  return variables;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    // Get material data
    const article = await getArticle(slug);
    const material = article?.metadata as any;
    
    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }
    
    // Generate response based on format
    if (format === 'csv') {
      const csv = generateCSV(material);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${slug}-dataset.csv"`
        }
      });
    }
    
    // Default to JSON
    const json = generateJSON(material);
    return NextResponse.json(json, {
      headers: {
        'Content-Type': 'application/ld+json',
        'Content-Disposition': `attachment; filename="${slug}-dataset.json"`
      }
    });
    
  } catch (error) {
    console.error('Dataset generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate dataset' },
      { status: 500 }
    );
  }
}
