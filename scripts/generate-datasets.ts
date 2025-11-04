// scripts/generate-datasets.ts
// Generates static dataset files (JSON, CSV) for each material at build time

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { MaterialDatasetData } from '../types/centralized';

// Extended interface for script processing
interface MaterialData extends MaterialDatasetData {
  safetyConsiderations?: string[];
  [key: string]: any;
}

// Convert material to JSON format
function generateJSON(material: MaterialData, slug: string): string {
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `https://www.z-beam.com/materials/${material.category}/${material.subcategory}/${slug}#dataset`,
    name: `${material.name} Laser Cleaning Dataset`,
    description: `Comprehensive laser cleaning parameters and material properties for ${material.name}`,
    version: '1.0',
    dateModified: new Date().toISOString().split('T')[0],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: 'Z-Beam Laser Cleaning',
      url: 'https://www.z-beam.com'
    },
    material: {
      name: material.name,
      slug: slug,
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
    citation: `Z-Beam (2025). ${material.name} Laser Cleaning Dataset. https://www.z-beam.com/materials/${material.category}/${material.subcategory}/${slug}`
  };

  return JSON.stringify(dataset, null, 2);
}

// Extract variables for Schema.org
function extractVariables(material: MaterialData): any[] {
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

// Convert material to CSV format
function generateCSV(material: MaterialData, slug: string): string {
  const rows: string[][] = [];
  
  // Headers
  rows.push(['Field', 'Category', 'Property', 'Value', 'Unit']);
  
  // Basic info
  rows.push(['Basic', 'Info', 'Name', material.name || '', '']);
  rows.push(['Basic', 'Info', 'Category', material.category || '', '']);
  rows.push(['Basic', 'Info', 'Subcategory', material.subcategory || '', '']);
  rows.push(['Basic', 'Info', 'Slug', slug, '']);
  
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
  
  // Safety Considerations
  if (material.safetyConsiderations && Array.isArray(material.safetyConsiderations)) {
    material.safetyConsiderations.forEach((safety: string, index: number) => {
      rows.push(['Safety', 'Considerations', `Item ${index + 1}`, safety, '']);
    });
  }
  
  // Convert to CSV string
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

// Generate TXT format (human-readable)
function generateTXT(material: MaterialData, slug: string): string {
  let txt = '';
  
  txt += `${material.name} Laser Cleaning Dataset\n`;
  txt += `${'='.repeat(material.name.length + 27)}\n\n`;
  
  txt += `Material: ${material.name}\n`;
  txt += `Category: ${material.category}\n`;
  txt += `Subcategory: ${material.subcategory || 'N/A'}\n`;
  txt += `Slug: ${slug}\n\n`;
  
  // Laser Parameters
  if (material.parameters) {
    txt += `LASER PARAMETERS\n`;
    txt += `-`.repeat(50) + '\n';
    Object.entries(material.parameters).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value?.value !== undefined) {
        txt += `${key}: ${value.value} ${value.unit || ''}\n`;
      }
    });
    txt += '\n';
  }
  
  // Material Properties
  if (material.materialProperties) {
    txt += `MATERIAL PROPERTIES\n`;
    txt += `-`.repeat(50) + '\n';
    Object.entries(material.materialProperties).forEach(([category, categoryData]: [string, any]) => {
      txt += `\n${category.toUpperCase()}:\n`;
      const props = categoryData?.properties || categoryData;
      if (typeof props === 'object') {
        Object.entries(props).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'object' && value?.value !== undefined) {
            txt += `  ${key}: ${value.value} ${value.unit || ''}\n`;
          }
        });
      }
    });
    txt += '\n';
  }
  
  // Applications
  if (material.applications && material.applications.length > 0) {
    txt += `APPLICATIONS\n`;
    txt += `-`.repeat(50) + '\n';
    material.applications.forEach((app: string) => {
      txt += `• ${app}\n`;
    });
    txt += '\n';
  }
  
  // Citation
  txt += `CITATION\n`;
  txt += `-`.repeat(50) + '\n';
  txt += `Z-Beam (2025). ${material.name} Laser Cleaning Dataset.\n`;
  txt += `https://www.z-beam.com/materials/${material.category}/${material.subcategory}/${slug}\n\n`;
  
  txt += `LICENSE: Creative Commons BY 4.0\n`;
  txt += `https://creativecommons.org/licenses/by/4.0/\n`;
  
  return txt;
}

// Main function to generate all datasets
async function generateAllDatasets() {
  console.log('🚀 Generating material datasets...\n');
  
  const frontmatterDir = path.join(process.cwd(), 'frontmatter', 'materials');
  const outputDir = path.join(process.cwd(), 'public', 'datasets', 'materials');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all material YAML files
  const files = fs.readdirSync(frontmatterDir).filter(f => f.endsWith('.yaml'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      const slug = file.replace('-laser-cleaning.yaml', '').replace('.yaml', '');
      const datasetName = `${slug}-laser-cleaning`;
      const filePath = path.join(frontmatterDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const material = yaml.load(content) as MaterialData;
      
      if (!material.name) {
        console.warn(`⚠️  Skipping ${file}: Missing name field`);
        continue;
      }
      
      // Generate JSON
      const jsonContent = generateJSON(material, slug);
      fs.writeFileSync(path.join(outputDir, `${datasetName}.json`), jsonContent);
      
      // Generate CSV
      const csvContent = generateCSV(material, slug);
      fs.writeFileSync(path.join(outputDir, `${datasetName}.csv`), csvContent);
      
      // Generate TXT
      const txtContent = generateTXT(material, slug);
      fs.writeFileSync(path.join(outputDir, `${datasetName}.txt`), txtContent);
      
      successCount++;
      console.log(`✅ Generated: ${material.name} (${slug})`);
      
    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  // Generate index file
  generateIndexFile(outputDir);
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount} materials`);
  console.log(`   ❌ Errors: ${errorCount} materials`);
  console.log(`   📁 Output: ${outputDir}`);
  console.log(`\n✨ Done!\n`);
}

// Generate index.json with all materials metadata
function generateIndexFile(outputDir: string) {
  const materials: any[] = [];
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  for (const file of files) {
    const jsonFile = path.join(outputDir, file);
    if (fs.existsSync(jsonFile)) {
      const content = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      const datasetName = file.replace('.json', '');
      materials.push({
        name: content.material.name,
        slug: content.material.slug,
        category: content.material.classification.category,
        subcategory: content.material.classification.subcategory,
        downloads: {
          json: `/datasets/materials/${datasetName}.json`,
          csv: `/datasets/materials/${datasetName}.csv`,
          txt: `/datasets/materials/${datasetName}.txt`
        }
      });
    }
  }
  
  const index = {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    name: 'Z-Beam Materials Database',
    description: 'Complete collection of laser cleaning parameters for all materials',
    dateModified: new Date().toISOString().split('T')[0],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    totalDatasets: materials.length,
    datasets: materials
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(index, null, 2)
  );
  
  console.log(`\n📋 Generated index file with ${materials.length} materials`);
}

// Run the script
generateAllDatasets().catch(console.error);
