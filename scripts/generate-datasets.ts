// scripts/generate-datasets.ts
// Generates unified static dataset files (JSON, CSV, TXT) combining material properties AND machine settings
// Machine settings appear FIRST in all formats for easy reference

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { normalizeForUrl } from '../app/utils/urlBuilder';
import type { MaterialDatasetData } from '../types/centralized.js';
import { SITE_CONFIG } from '../app/config/site.js';
import { 
  validateDatasetCompleteness,
  getDatasetQualityMetrics,
  formatQualityReport
} from '../app/utils/datasetValidation';

// Extended interface for script processing
interface MaterialData extends MaterialDatasetData {
  safetyConsiderations?: string[];
  machineSettings?: any;
  [key: string]: any;
}

// Load machine settings from settings file
function loadMachineSettings(materialSlug: string): any {
  const settingsPath = path.join(process.cwd(), 'frontmatter', 'settings', `${materialSlug}-settings.yaml`);
  if (fs.existsSync(settingsPath)) {
    try {
      const content = fs.readFileSync(settingsPath, 'utf8');
      const data = yaml.load(content) as any;
      return data.machineSettings || null;
    } catch (error) {
      console.warn(`  ⚠ Could not load machine settings for ${materialSlug}`);
      return null;
    }
  }
  return null;
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
    
    // Material data (with machine settings FIRST)
    material: {
      name: material.name,
      slug: slug,
      classification: {
        category: material.category,
        subcategory: material.subcategory
      },
      // Machine settings at the top
      machineSettings: material.machineSettings || {},
      // Then material properties
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
  
  // MACHINE SETTINGS FIRST
  if (material.machineSettings) {
    Object.entries(material.machineSettings).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value !== null) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: `machine_${key}`,
          name: `Machine Setting: ${formatPropertyName(key)}`,
          value: value.value || 'N/A',
          unitText: value.unit || '',
          ...(value.min !== undefined && { minValue: value.min }),
          ...(value.max !== undefined && { maxValue: value.max }),
          ...(value.source && { measurementTechnique: value.source }),
          ...(value.description && { description: value.description })
        });
      }
    });
  }
  
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
  
  // Metadata header (as comments) - max 80 chars per line
  const citation = config.attribution.format
    .replace('{year}', new Date().getFullYear().toString())
    .replace('{materialName}', material.name)
    .replace('{url}', materialUrl);
  
  const metadata = [
    `# ${material.name} Laser Cleaning Dataset`,
    `# License: ${config.license.type}`,
    `# URL: ${config.license.url}`,
    `# Source: ${config.publisher.name}`,
    `# Contact: ${config.publisher.email}`,
    `# Dataset: ${materialUrl}`,
    `# Updated: ${currentDate} | Version: ${config.version}`,
    '#',
    `# Citation: ${citation}`,
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
  
  // MACHINE SETTINGS FIRST
  if (material.machineSettings) {
    Object.entries(material.machineSettings).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value !== null) {
        rows.push([
          'Machine',
          'Settings',
          key,
          String(value.value || ''),
          value.unit || '',
          value.min !== undefined ? String(value.min) : '',
          value.max !== undefined ? String(value.max) : '',
          value.source || '',
          value.description || `Machine setting: ${key}`
        ]);
      }
    });
  }
  
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
  const sectionBar = '-'.repeat(80);
  txt += `DATASET INFORMATION\n`;
  txt += `${sectionBar}\n`;
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
  txt += `${sectionBar}\n`;
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
  
  // MACHINE SETTINGS FIRST
  if (material.machineSettings && Object.keys(material.machineSettings).length > 0) {
    txt += `${headerBar}\n`;
    txt += `MACHINE SETTINGS\n`;
    txt += `${headerBar}\n\n`;
    Object.entries(material.machineSettings).forEach(([key, value]: [string, any]) => {
      if (typeof value === 'object' && value !== null) {
        txt += `${key}:\n`;
        txt += `  Value:  ${value.value || 'N/A'} ${value.unit || ''}\n`;
        if (value.min !== undefined) txt += `  Min:    ${value.min} ${value.unit || ''}\n`;
        if (value.max !== undefined) txt += `  Max:    ${value.max} ${value.unit || ''}\n`;
        if (value.source) txt += `  Source: ${value.source}\n`;
        if (value.description) txt += `  Note:   ${value.description}\n`;
        txt += '\n';
      }
    });
  }
  
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
        txt += `${sectionBar}\n`;
        
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
  let skippedCount = 0;
  const skippedMaterials: Array<{name: string, reason: string}> = [];
  
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
      
      // Load machine settings from settings file
      const machineSettings = loadMachineSettings(slug);
      if (machineSettings) {
        material.machineSettings = machineSettings;
        console.log(`   📋 Loaded machine settings for ${slug}`);
      }
      
      // DATASET QUALITY POLICY: Validate completeness before generation
      // validateDatasetCompleteness(materialSlug, machineSettings, materialProperties, additionalData)
      const validation = validateDatasetCompleteness(slug, machineSettings, material.materialProperties);
      
      if (!validation.valid) {
        skippedCount++;
        skippedMaterials.push({
          name: material.name || slug,
          reason: validation.reason || 'Unknown'
        });
        console.log(`⏭️  Skipped: ${material.name} - ${validation.reason}`);
        continue; // Skip this dataset entirely
      }
      
      // Log warnings for low Tier 2 completeness
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          console.warn(`⚠️  ${material.name}: ${warning}`);
        });
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
  console.log(`   ✅ Generated: ${successCount} materials`);
  console.log(`   ⏭️  Skipped: ${skippedCount} materials (incomplete data)`);
  console.log(`   ❌ Errors: ${errorCount} materials`);
  console.log(`   📁 Output: ${outputDir}`);
  
  // Show skipped materials details
  if (skippedCount > 0) {
    console.log(`\n⚠️  Skipped Materials (Dataset Quality Policy):`);
    skippedMaterials.forEach(({ name, reason }) => {
      console.log(`   • ${name}: ${reason}`);
    });
  }
  
  if (errorCount > 0) {
    console.log(`\n❌ Dataset generation completed with ${errorCount} error(s)\n`);
    process.exit(1);
  }
  
  if (successCount === 0) {
    console.log(`\n⚠️  No datasets generated (all materials lack machine settings data)\n`);
    console.log(`   This is expected until machine settings are populated.`);
    console.log(`   Build will continue without datasets.\n`);
    // Don't exit with error - allow build to proceed
  } else {
    // Generate material index only if we have datasets
    generateIndexFile(outputDir);
    
    // Generate contaminant datasets
    await generateContaminantDatasets();
    
    // Generate contaminant index
    generateContaminantIndexFile();
    
    console.log(`\n✨ All datasets generated successfully!\n`);
  }
  
  process.exit(0);
}

// Generate contaminant datasets
async function generateContaminantDatasets() {
  console.log('\n📦 Generating contaminant datasets...\n');
  
  const contaminantDir = path.join(process.cwd(), 'frontmatter/contaminants');
  const outputDir = path.join(process.cwd(), 'public/datasets/contaminants');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const files = fs.readdirSync(contaminantDir).filter(f => f.endsWith('.yaml'));
  let successCount = 0;
  let skipCount = 0;
  
  for (const file of files) {
    const filePath = path.join(contaminantDir, file);
    const slug = file.replace('.yaml', '');
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content) as any;
      
      if (!data || !data.slug) {
        console.log(`⚠️  Skipping ${file}: Invalid structure`);
        skipCount++;
        continue;
      }
      
      const category = normalizeForUrl(data.category || '');
      const subcategory = normalizeForUrl(data.subcategory || '');
      const baseUrl = SITE_CONFIG.url;
      const contaminantUrl = `${baseUrl}/contaminants/${category}/${subcategory}/${slug}`;
      
      // Generate Dataset schema
      const dataset = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: `${data.name || data.title} Contamination Data`,
        description: data.contamination_description || data.description || '',
        url: contaminantUrl,
        identifier: `contaminant-${slug}`,
        keywords: data.keywords || [],
        
        // Variable measurements
        variableMeasured: data.laser_properties?.safety_data ? [
          'Fire/Explosion Risk Level',
          'Toxic Gas Risk Level',
          'Visibility Hazard Level',
          'PPE Requirements',
          'Ventilation Requirements',
          'Particulate Generation'
        ] : [],
        
        // Measurement techniques
        measurementTechnique: [
          'Laser-induced breakdown spectroscopy (LIBS)',
          'Safety hazard assessment',
          'Fume generation analysis',
          'PPE requirement evaluation'
        ],
        
        // Distribution formats
        distribution: [
          {
            '@type': 'DataDownload',
            encodingFormat: 'application/json',
            contentUrl: `${baseUrl}/datasets/contaminants/${slug}.json`,
            name: `${data.name || data.title} - JSON Format`
          },
          {
            '@type': 'DataDownload',
            encodingFormat: 'text/csv',
            contentUrl: `${baseUrl}/datasets/contaminants/${slug}.csv`,
            name: `${data.name || data.title} - CSV Format`
          },
          {
            '@type': 'DataDownload',
            encodingFormat: 'text/plain',
            contentUrl: `${baseUrl}/datasets/contaminants/${slug}.txt`,
            name: `${data.name || data.title} - Text Format`
          }
        ],
        
        // Creator
        creator: {
          '@type': 'Organization',
          name: 'Z-Beam Technical Team',
          url: `${baseUrl}/about`
        },
        
        // License
        license: 'https://creativecommons.org/licenses/by/4.0/',
        
        // Dates
        datePublished: data.datePublished || new Date().toISOString().split('T')[0],
        dateModified: fs.statSync(filePath).mtime.toISOString().split('T')[0],
        
        // Contamination data
        contamination: {
          name: data.name || data.title,
          slug: slug,
          category: data.category,
          subcategory: data.subcategory,
          description: data.contamination_description || data.description
        },
        
        // Safety data
        safetyData: data.laser_properties?.safety_data || null,
        
        // Laser properties
        laserProperties: data.laser_properties || null,
        
        // Valid materials
        validMaterials: data.valid_materials || [],
        
        // Regulatory standards
        regulatoryStandards: data.eeat?.citations || []
      };
      
      // Write JSON
      const jsonPath = path.join(outputDir, `${slug}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2));
      
      // Write CSV
      const csvPath = path.join(outputDir, `${slug}.csv`);
      const csvData = convertContaminantToCSV(dataset);
      fs.writeFileSync(csvPath, csvData);
      
      // Write TXT
      const txtPath = path.join(outputDir, `${slug}.txt`);
      const txtData = convertContaminantToText(dataset);
      fs.writeFileSync(txtPath, txtData);
      
      console.log(`✅ ${slug}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
      skipCount++;
    }
  }
  
  console.log(`\n📊 Contaminant dataset summary:`);
  console.log(`   • Generated: ${successCount}`);
  console.log(`   • Skipped: ${skipCount}`);
  console.log(`   • Total files: ${successCount * 3} (JSON + CSV + TXT)`);
}

// Convert contaminant to CSV format
function convertContaminantToCSV(dataset: any): string {
  const rows: string[] = [];
  
  // Header
  rows.push('Property,Value');
  
  // Basic info
  rows.push(`Name,"${dataset.contamination.name}"`);
  rows.push(`Category,"${dataset.contamination.category}"`);
  rows.push(`Subcategory,"${dataset.contamination.subcategory}"`);
  rows.push(`Description,"${dataset.contamination.description}"`);
  
  // Safety data
  if (dataset.safetyData) {
    rows.push('');
    rows.push('SAFETY INFORMATION,');
    rows.push(`Fire/Explosion Risk,"${dataset.safetyData.fire_explosion_risk || 'N/A'}"`);
    rows.push(`Toxic Gas Risk,"${dataset.safetyData.toxic_gas_risk || 'N/A'}"`);
    rows.push(`Visibility Hazard,"${dataset.safetyData.visibility_hazard || 'N/A'}"`);
    
    if (dataset.safetyData.ppe_requirements) {
      rows.push(`Respiratory Protection,"${dataset.safetyData.ppe_requirements.respiratory || 'N/A'}"`);
      rows.push(`Eye Protection,"${dataset.safetyData.ppe_requirements.eye_protection || 'N/A'}"`);
      rows.push(`Skin Protection,"${dataset.safetyData.ppe_requirements.skin_protection || 'N/A'}"`);
    }
  }
  
  // Valid materials
  if (dataset.validMaterials && dataset.validMaterials.length > 0) {
    rows.push('');
    rows.push('COMPATIBLE MATERIALS,');
    dataset.validMaterials.forEach((mat: any) => {
      rows.push(`"${mat.name || mat}","${mat.effectiveness || 'Compatible'}"`);
    });
  }
  
  return rows.join('\n');
}

// Convert contaminant to text format
function convertContaminantToText(dataset: any): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push(`${dataset.contamination.name} - Contamination Dataset`);
  lines.push('='.repeat(80));
  lines.push('');
  
  lines.push(`Category: ${dataset.contamination.category}`);
  lines.push(`Subcategory: ${dataset.contamination.subcategory}`);
  lines.push(`URL: ${dataset.url}`);
  lines.push('');
  
  lines.push('DESCRIPTION');
  lines.push('-'.repeat(80));
  lines.push(dataset.contamination.description);
  lines.push('');
  
  // Safety information
  if (dataset.safetyData) {
    lines.push('SAFETY INFORMATION');
    lines.push('-'.repeat(80));
    lines.push(`Fire/Explosion Risk: ${dataset.safetyData.fire_explosion_risk || 'N/A'}`);
    lines.push(`Toxic Gas Risk: ${dataset.safetyData.toxic_gas_risk || 'N/A'}`);
    lines.push(`Visibility Hazard: ${dataset.safetyData.visibility_hazard || 'N/A'}`);
    lines.push('');
    
    if (dataset.safetyData.ppe_requirements) {
      lines.push('PPE REQUIREMENTS:');
      lines.push(`  • Respiratory: ${dataset.safetyData.ppe_requirements.respiratory || 'N/A'}`);
      lines.push(`  • Eye Protection: ${dataset.safetyData.ppe_requirements.eye_protection || 'N/A'}`);
      lines.push(`  • Skin Protection: ${dataset.safetyData.ppe_requirements.skin_protection || 'N/A'}`);
      lines.push('');
    }
    
    if (dataset.safetyData.ventilation_requirements) {
      lines.push('VENTILATION REQUIREMENTS:');
      lines.push(`  • Air Changes/Hour: ${dataset.safetyData.ventilation_requirements.minimum_air_changes_per_hour || 'N/A'}`);
      lines.push(`  • Exhaust Velocity: ${dataset.safetyData.ventilation_requirements.exhaust_velocity_m_s || 'N/A'} m/s`);
      lines.push(`  • Filtration Type: ${dataset.safetyData.ventilation_requirements.filtration_type || 'N/A'}`);
      lines.push('');
    }
  }
  
  // Valid materials
  if (dataset.validMaterials && dataset.validMaterials.length > 0) {
    lines.push('COMPATIBLE MATERIALS');
    lines.push('-'.repeat(80));
    dataset.validMaterials.forEach((mat: any) => {
      lines.push(`  • ${mat.name || mat}${mat.effectiveness ? ` (${mat.effectiveness})` : ''}`);
    });
    lines.push('');
  }
  
  lines.push('='.repeat(80));
  lines.push(`Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push(`License: Creative Commons Attribution 4.0 (CC BY 4.0)`);
  lines.push('='.repeat(80));
  
  return lines.join('\n');
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

// Generate contaminant index.json with all contaminants metadata
function generateContaminantIndexFile() {
  const outputDir = path.join(process.cwd(), 'public/datasets/contaminants');
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  const contaminants = files.map(file => {
    const content = fs.readFileSync(path.join(outputDir, file), 'utf8');
    const data = JSON.parse(content);
    
    return {
      name: data.contamination.name,
      slug: data.contamination.slug,
      category: data.contamination.category,
      subcategory: data.contamination.subcategory,
      description: data.contamination.description,
      url: data.url,
      downloads: {
        json: data.distribution[0].contentUrl,
        csv: data.distribution[1].contentUrl,
        txt: data.distribution[2].contentUrl
      },
      safetyRisks: data.safetyData ? {
        fire: data.safetyData.fire_explosion_risk,
        toxicGas: data.safetyData.toxic_gas_risk,
        visibility: data.safetyData.visibility_hazard
      } : null
    };
  });
  
  const index = {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    name: 'Z-Beam Contamination Datasets',
    description: 'Comprehensive database of laser cleaning contamination data including safety information, PPE requirements, and removal properties',
    url: `${SITE_CONFIG.url}/datasets/contaminants/`,
    provider: {
      '@type': 'Organization',
      name: 'Z-Beam Technical Team',
      url: `${SITE_CONFIG.url}/about`
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    totalDatasets: contaminants.length,
    datasets: contaminants
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(index, null, 2)
  );
  
  console.log(`\n📋 Generated contaminant index file with ${contaminants.length} contaminants`);
}

// Run the script
generateAllDatasets().catch(console.error);
