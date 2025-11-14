// scripts/generate-datasets.ts
// Generates static dataset files (JSON, CSV, TXT) for each material at build time

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { normalizeForUrl } from '../app/utils/urlBuilder';
import type { MaterialDatasetData } from '../types/centralized.js';
import { SITE_CONFIG } from '../app/config/site.js';

// Extended interface for script processing
interface MaterialData extends MaterialDatasetData {
  safetyConsiderations?: string[];
  [key: string]: any;
}

// Convert material to JSON format
function generateJSON(material: MaterialData, slug: string): string {
  const config = SITE_CONFIG.datasets;
  const baseUrl = SITE_CONFIG.url;
  const currentYear = new Date().getFullYear();
  const category = normalizeForUrl(material.category || '');
  const subcategory = normalizeForUrl(material.subcategory || '');
  const materialUrl = `${baseUrl}/materials/${category}/${subcategory}/${slug}`;
  
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${materialUrl}#dataset`,
    name: `${material.name} Laser Cleaning Dataset`,
    description: `Comprehensive laser cleaning parameters and material properties for ${material.name}. Includes thermal, optical, mechanical, and laser interaction properties validated against industry standards.`,
    version: config.version,
    dateModified: new Date().toISOString().split('T')[0],
    datePublished: new Date().toISOString().split('T')[0],
    
    // License information
    license: {
      '@type': 'CreativeWork',
      name: config.license.name,
      url: config.license.url,
      description: config.license.description
    },
    
    // Publisher/Creator information (E-E-A-T)
    creator: {
      '@type': config.publisher.type,
      name: config.publisher.name,
      url: config.publisher.url,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: config.publisher.contactType,
        email: config.publisher.email
      }
    },
    
    publisher: {
      '@type': config.publisher.type,
      name: config.publisher.name,
      url: config.publisher.url
    },
    
    // Discoverability
    keywords: [
      material.name.toLowerCase(),
      'laser cleaning',
      material.category,
      material.subcategory,
      ...config.metadata.keywords
    ],
    inLanguage: config.metadata.language,
    
    // Provenance & Coverage
    temporalCoverage: config.metadata.temporalCoverage,
    spatialCoverage: config.metadata.spatialCoverage,
    measurementTechnique: config.metadata.measurementTechnique,
    
    // Data Catalog
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: config.catalog.name,
      description: config.catalog.description,
      url: config.catalog.url
    },
    
    // Distribution (all formats)
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${baseUrl}/datasets/materials/${slug}.json`,
        name: `${material.name} Dataset (JSON)`
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${baseUrl}/datasets/materials/${slug}.csv`,
        name: `${material.name} Dataset (CSV)`
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/plain',
        contentUrl: `${baseUrl}/datasets/materials/${slug}.txt`,
        name: `${material.name} Dataset (TXT)`
      }
    ],
    
    // Accessibility
    isAccessibleForFree: true,
    
    // Usage information
    usageInfo: `${baseUrl}/datasets/usage-terms`,
    
    // Data Quality
    dataQuality: {
      verificationMethod: config.quality.verificationMethod,
      sources: config.quality.sources,
      updateFrequency: config.quality.updateFrequency,
      accuracyLevel: config.quality.accuracyLevel,
      lastVerified: config.quality.lastVerified
    },
    
    // Material data
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
    
    // Variables measured (properly populated)
    variableMeasured: extractVariables(material),
    
    // Citation
    citation: config.attribution.format
      .replace('{year}', String(currentYear))
      .replace('{materialName}', material.name)
      .replace('{url}', materialUrl)
  };

  return JSON.stringify(dataset, null, 2);
}

// Extract variables for Schema.org - properly populated with all properties
function extractVariables(material: MaterialData): any[] {
  const variables: any[] = [];
  
  // Helper to format property names
  const formatPropertyName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };
  
  // Extract laser parameters
  if (material.parameters) {
    Object.entries(material.parameters).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value?.value !== undefined) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: key,
          name: formatPropertyName(key),
          value: value.value,
          unitText: value.unit || '',
          ...(value.min !== undefined && { minValue: value.min }),
          ...(value.max !== undefined && { maxValue: value.max }),
          ...(value.source && { measurementTechnique: value.source })
        });
      }
    });
  }
  
  // Extract material properties from all categories
  if (material.materialProperties) {
    Object.entries(material.materialProperties).forEach(([categoryKey, categoryData]: [string, any]) => {
      // Skip label and percentage fields
      const properties = Object.entries(categoryData).filter(
        ([key]) => key !== 'label' && key !== 'percentage'
      );
      
      properties.forEach(([propKey, propValue]: [string, any]) => {
        if (typeof propValue === 'object' && propValue?.value !== undefined) {
          variables.push({
            '@type': 'PropertyValue',
            propertyID: propKey,
            name: formatPropertyName(propKey),
            description: `${formatPropertyName(propKey)} - ${categoryKey.replace(/_/g, ' ')}`,
            value: propValue.value,
            unitText: propValue.unit || '',
            ...(propValue.min !== undefined && { minValue: propValue.min }),
            ...(propValue.max !== undefined && { maxValue: propValue.max }),
            ...(propValue.source && { measurementTechnique: propValue.source })
          });
        }
      });
    });
  }
  
  return variables;
}

// Convert material to CSV format with proper escaping and metadata
function generateCSV(material: MaterialData, slug: string): string {
  const config = SITE_CONFIG.datasets;
  const currentDate = new Date().toISOString().split('T')[0];
  const category = normalizeForUrl(material.category || '');
  const subcategory = normalizeForUrl(material.subcategory || '');
  const materialUrl = `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${slug}`;
  
  const rows: string[][] = [];
  
  // Metadata header (as comments)
  const metadata = [
    `# ${material.name} Laser Cleaning Dataset`,
    `# License: ${config.license.type} (${config.license.url})`,
    `# Source: ${config.publisher.name}`,
    `# URL: ${materialUrl}`,
    `# Last Updated: ${currentDate}`,
    `# Version: ${config.version}`,
    `# Contact: ${config.publisher.email}`,
    '#',
    `# Citation: ${config.attribution.format.replace('{year}', new Date().getFullYear().toString()).replace('{materialName}', material.name).replace('{url}', materialUrl)}`,
    '#'
  ];
  
  // Add metadata as separate lines
  const metadataString = metadata.join('\n') + '\n';
  
  // Column headers with extended fields
  rows.push(['Field', 'Category', 'Property', 'Value', 'Unit', 'Min', 'Max', 'Source', 'Description']);
  
  // Helper to escape CSV cells properly
  const escapeCSV = (value: any): string => {
    const str = String(value ?? '');
    // If contains comma, quote, or newline, wrap in quotes and escape existing quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  // Basic info
  rows.push(['Basic', 'Info', 'Name', material.name || '', '', '', '', '', 'Material name']);
  rows.push(['Basic', 'Info', 'Category', material.category || '', '', '', '', '', 'Material category']);
  rows.push(['Basic', 'Info', 'Subcategory', material.subcategory || '', '', '', '', '', 'Material subcategory']);
  rows.push(['Basic', 'Info', 'Slug', slug, '', '', '', '', 'URL identifier']);
  
  // Laser parameters
  if (material.parameters) {
    Object.entries(material.parameters).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value?.value !== undefined) {
        rows.push([
          'Parameter',
          'Laser',
          key,
          String(value.value),
          value.unit || '',
          value.min !== undefined ? String(value.min) : '',
          value.max !== undefined ? String(value.max) : '',
          value.source || '',
          `Laser parameter: ${key}`
        ]);
      }
    });
  }
  
  // Material properties
  if (material.materialProperties) {
    Object.entries(material.materialProperties).forEach(([category, categoryData]: [string, any]) => {
      // Skip label and percentage fields
      const props = Object.entries(categoryData).filter(
        ([key]) => key !== 'label' && key !== 'percentage'
      );
      
      props.forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value?.value !== undefined) {
          rows.push([
            'Property',
            category,
            key,
            String(value.value),
            value.unit || '',
            value.min !== undefined ? String(value.min) : '',
            value.max !== undefined ? String(value.max) : '',
            value.source || '',
            `Material property: ${key}`
          ]);
        }
      });
    });
  }
  
  // Applications
  if (material.applications && Array.isArray(material.applications)) {
    material.applications.forEach((app: string, index: number) => {
      rows.push(['Application', 'Industries', `Application ${index + 1}`, app, '', '', '', '', 'Industry application']);
    });
  }
  
  // Safety Considerations
  if (material.safetyConsiderations && Array.isArray(material.safetyConsiderations)) {
    material.safetyConsiderations.forEach((safety: string, index: number) => {
      rows.push(['Safety', 'Considerations', `Item ${index + 1}`, safety, '', '', '', '', 'Safety consideration']);
    });
  }
  
  // Convert to CSV string with proper escaping
  const csvContent = rows.map(row => 
    row.map(cell => escapeCSV(cell)).join(',')
  ).join('\n');
  
  return metadataString + csvContent;
}

// Generate TXT format (human-readable) with enhanced metadata
function generateTXT(material: MaterialData, slug: string): string {
  const config = SITE_CONFIG.datasets;
  const currentDate = new Date().toISOString().split('T')[0];
  const category = normalizeForUrl(material.category || '');
  const subcategory = normalizeForUrl(material.subcategory || '');
  const materialUrl = `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${slug}`;
  
  let txt = '';
  
  // Header with formatting
  const headerBar = '='.repeat(80);
  txt += `${headerBar}\n`;
  txt += `${material.name.toUpperCase()} LASER CLEANING DATASET\n`;
  txt += `${headerBar}\n\n`;
  
  // Dataset Information Section
  txt += `DATASET INFORMATION\n`;
  txt += `${'-'.repeat(80)}\n`;
  txt += `Title:          ${material.name} Laser Cleaning Dataset\n`;
  txt += `Version:        ${config.version}\n`;
  txt += `Last Updated:   ${currentDate}\n`;
  txt += `License:        ${config.license.name}\n`;
  txt += `License URL:    ${config.license.url}\n`;
  txt += `Source:         ${config.publisher.name}\n`;
  txt += `Contact:        ${config.publisher.email}\n`;
  txt += `URL:            ${materialUrl}\n\n`;
  
  // Data Quality Information
  txt += `DATA QUALITY\n`;
  txt += `${'-'.repeat(80)}\n`;
  txt += `Verification:   ${config.quality.verificationMethod}\n`;
  txt += `Accuracy:       ${config.quality.accuracyLevel}\n`;
  txt += `Update Cycle:   ${config.quality.updateFrequency}\n`;
  txt += `Last Verified:  ${config.quality.lastVerified}\n`;
  txt += `Sources:        ${config.quality.sources.join(', ')}\n\n`;
  
  // Material Information
  txt += `${headerBar}\n`;
  txt += `MATERIAL INFORMATION\n`;
  txt += `${headerBar}\n\n`;
  txt += `Material:       ${material.name}\n`;
  txt += `Category:       ${material.category}\n`;
  txt += `Subcategory:    ${material.subcategory || 'N/A'}\n`;
  txt += `Identifier:     ${slug}\n\n`;
  
  // Laser Parameters
  if (material.parameters && Object.keys(material.parameters).length > 0) {
    txt += `${headerBar}\n`;
    txt += `LASER PARAMETERS\n`;
    txt += `${headerBar}\n\n`;
    Object.entries(material.parameters).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value?.value !== undefined) {
        txt += `${key}:\n`;
        txt += `  Value:  ${value.value} ${value.unit || ''}\n`;
        if (value.min !== undefined) txt += `  Min:    ${value.min} ${value.unit || ''}\n`;
        if (value.max !== undefined) txt += `  Max:    ${value.max} ${value.unit || ''}\n`;
        if (value.source) txt += `  Source: ${value.source}\n`;
        txt += '\n';
      }
    });
  }
  
  // Material Properties
  if (material.materialProperties) {
    txt += `${headerBar}\n`;
    txt += `MATERIAL PROPERTIES\n`;
    txt += `${headerBar}\n\n`;
    Object.entries(material.materialProperties).forEach(([category, categoryData]: [string, any]) => {
      // Skip label and percentage
      const props = Object.entries(categoryData).filter(
        ([key]) => key !== 'label' && key !== 'percentage'
      );
      
      if (props.length > 0) {
        txt += `${category.replace(/_/g, ' ').toUpperCase()}:\n`;
        txt += `${'-'.repeat(80)}\n`;
        
        props.forEach(([key, value]: [string, any]) => {
          if (typeof value === 'object' && value?.value !== undefined) {
            txt += `  ${key}:\n`;
            txt += `    Value:  ${value.value} ${value.unit || ''}\n`;
            if (value.min !== undefined) txt += `    Min:    ${value.min} ${value.unit || ''}\n`;
            if (value.max !== undefined) txt += `    Max:    ${value.max} ${value.unit || ''}\n`;
            if (value.source) txt += `    Source: ${value.source}\n`;
            txt += '\n';
          }
        });
      }
    });
  }
  
  // Applications
  if (material.applications && material.applications.length > 0) {
    txt += `${headerBar}\n`;
    txt += `APPLICATIONS\n`;
    txt += `${headerBar}\n\n`;
    material.applications.forEach((app: string, index: number) => {
      txt += `${index + 1}. ${app}\n`;
    });
    txt += '\n';
  }
  
  // Safety Considerations
  if (material.safetyConsiderations && material.safetyConsiderations.length > 0) {
    txt += `${headerBar}\n`;
    txt += `SAFETY CONSIDERATIONS\n`;
    txt += `${headerBar}\n\n`;
    material.safetyConsiderations.forEach((safety: string, index: number) => {
      txt += `${index + 1}. ${safety}\n`;
    });
    txt += '\n';
  }
  
  // Citation & Usage
  txt += `${headerBar}\n`;
  txt += `CITATION & USAGE\n`;
  txt += `${headerBar}\n\n`;
  txt += `Citation:\n`;
  txt += `  ${config.attribution.format
    .replace('{year}', new Date().getFullYear().toString())
    .replace('{materialName}', material.name)
    .replace('{url}', materialUrl)}\n\n`;
  
  txt += `License:\n`;
  txt += `  ${config.license.name}\n`;
  txt += `  ${config.license.url}\n`;
  txt += `  ${config.license.description}\n\n`;
  
  txt += `Usage Terms:\n`;
  config.usageInfo.requirements.forEach((req: string) => {
    txt += `  • ${req}\n`;
  });
  txt += '\n';
  
  txt += `${headerBar}\n`;
  txt += `For questions or support, contact: ${config.publisher.email}\n`;
  txt += `${headerBar}\n`;
  
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
      const jsonContent = generateJSON(material, datasetName);
      fs.writeFileSync(path.join(outputDir, `${datasetName}.json`), jsonContent);
      
      // Generate CSV
      const csvContent = generateCSV(material, datasetName);
      fs.writeFileSync(path.join(outputDir, `${datasetName}.csv`), csvContent);
      
      // Generate TXT
      const txtContent = generateTXT(material, datasetName);
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
  
  if (errorCount > 0) {
    console.log(`\n❌ Dataset generation completed with ${errorCount} error(s)\n`);
    process.exit(1);
  }
  
  if (successCount === 0) {
    console.log(`\n⚠️  No datasets generated!\n`);
    process.exit(1);
  }
  
  console.log(`\n✨ Done!\n`);
  process.exit(0);
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
