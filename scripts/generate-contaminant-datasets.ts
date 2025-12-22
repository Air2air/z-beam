// scripts/generate-contaminant-datasets.ts
// Generates static dataset files (JSON, CSV, TXT) for contaminants
// Adapts structure to expose composition, safety data, and laser removal parameters

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Inline config to avoid module resolution issues
const SITE_CONFIG = {
  url: 'https://www.z-beam.com',
  datasets: {
    version: '1.0',
    license: {
      name: 'Creative Commons Attribution 4.0 International',
      url: 'https://creativecommons.org/licenses/by/4.0/',
      description: 'Free to share and adapt with attribution'
    },
    publisher: {
      name: 'Z-Beam Laser Cleaning Research Lab',
      type: 'Organization',
      url: 'https://www.z-beam.com',
      email: 'info@z-beam.com',
      contactType: 'Data Support'
    },
    catalog: {
      name: 'Z-Beam Contamination Removal Database',
      description: 'Comprehensive database of contamination removal parameters, safety data, and laser cleaning specifications',
      url: 'https://www.z-beam.com/datasets/contaminants'
    },
    attribution: {
      format: 'Z-Beam ({year}). {materialName}. Retrieved from {url}'
    },
    metadata: {
      language: 'en-US'
    }
  }
};

interface ContaminantData {
  id: string;
  name: string;
  category: string;
  full_path: string;
  description: string;
  composition?: string[];
  safety_data?: {
    fire_explosion_risk?: string;
    toxic_gas_risk?: string;
    visibility_hazard?: string;
    ppe_requirements?: {
      respiratory?: string;
      eye_protection?: string;
      protective_clothing?: string;
      gloves?: string;
    };
    ventilation_requirements?: {
      minimum_air_changes_per_hour?: number;
      fume_extraction?: string;
    };
  };
  laser_properties?: Record<string, any>;
  removal_by_material?: Record<string, any>;
  visual_characteristics?: {
    appearance_on_categories?: Record<string, any>;
  };
  [key: string]: any;
}

// Convert contaminant to JSON format
function generateJSON(contaminant: ContaminantData, slug: string): string {
  const config = SITE_CONFIG.datasets;
  const baseUrl = SITE_CONFIG.url;
  const currentYear = new Date().getFullYear();
  const contaminantUrl = `${baseUrl}${contaminant.full_path}`;
  
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${contaminantUrl}#dataset`,
    name: `${contaminant.name} Removal Dataset`,
    description: `Comprehensive contamination dataset for ${contaminant.name}. Includes chemical composition, safety metrics, PPE requirements, and laser removal parameters for effective contamination removal.`,
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
    
    // Publisher/Creator information
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
      contaminant.name.toLowerCase(),
      'contamination removal',
      'laser cleaning',
      contaminant.category,
      'safety data',
      'chemical composition',
      'PPE requirements'
    ],
    inLanguage: config.metadata.language,
    
    // Provenance & Coverage
    temporalCoverage: '2025',
    spatialCoverage: 'Global',
    measurementTechnique: 'Laser contamination removal analysis, safety assessment, chemical characterization',
    
    // Data Catalog
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: 'Z-Beam Contamination Removal Database',
      description: 'Comprehensive database of contamination removal parameters, safety data, and laser cleaning specifications',
      url: `${baseUrl}/datasets/contaminants`
    },
    
    // Distribution (all formats)
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${baseUrl}/datasets/contaminants/${slug}.json`,
        name: `${contaminant.name} Dataset (JSON)`
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${baseUrl}/datasets/contaminants/${slug}.csv`,
        name: `${contaminant.name} Dataset (CSV)`
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/plain',
        contentUrl: `${baseUrl}/datasets/contaminants/${slug}.txt`,
        name: `${contaminant.name} Dataset (TXT)`
      }
    ],
    
    // Accessibility
    isAccessibleForFree: true,
    
    // Usage information
    usageInfo: `${baseUrl}/datasets/usage-terms`,
    
    // Data Quality
    dataQuality: {
      verificationMethod: 'Multi-source validation and expert review',
      sources: ['Industry safety databases', 'Chemical composition analysis', 'Field testing results'],
      updateFrequency: 'Quarterly',
      accuracyLevel: 'High',
      lastVerified: new Date().toISOString().split('T')[0]
    },
    
    // Contaminant data
    contaminant: {
      name: contaminant.name,
      slug: slug,
      category: contaminant.category,
      description: contaminant.description,
      
      // Chemical composition
      composition: contaminant.composition || [],
      
      // Safety data
      safetyData: {
        fireExplosionRisk: contaminant.safety_data?.fire_explosion_risk || 'Unknown',
        toxicGasRisk: contaminant.safety_data?.toxic_gas_risk || 'Unknown',
        visibilityHazard: contaminant.safety_data?.visibility_hazard || 'Unknown',
        ppeRequirements: {
          respiratory: contaminant.safety_data?.ppe_requirements?.respiratory || 'Not specified',
          eyeProtection: contaminant.safety_data?.ppe_requirements?.eye_protection || 'Not specified',
          protectiveClothing: contaminant.safety_data?.ppe_requirements?.protective_clothing || 'Not specified',
          gloves: contaminant.safety_data?.ppe_requirements?.gloves || 'Not specified'
        },
        ventilationRequirements: contaminant.safety_data?.ventilation_requirements || {}
      },
      
      // Laser removal properties
      laserProperties: contaminant.laser_properties || {},
      
      // Material-specific removal data (summary)
      removalComplexity: contaminant.removal_by_material ? 
        `Data available for ${Object.keys(contaminant.removal_by_material).length} material types` : 
        'No material-specific data',
      
      // Visual identification data (summary)
      visualCharacteristics: contaminant.visual_characteristics?.appearance_on_categories ?
        `Visual identification data available for ${Object.keys(contaminant.visual_characteristics.appearance_on_categories).length} material categories` :
        'No visual identification data'
    },
    
    // Variables measured
    variableMeasured: extractVariables(contaminant),
    
    // Author information (E-E-A-T)
    author: contaminant.author ? {
      '@type': 'Person',
      name: contaminant.author.name,
      jobTitle: contaminant.author.jobTitle || contaminant.author.title,
      affiliation: contaminant.author.affiliation ? {
        '@type': 'Organization',
        name: contaminant.author.affiliation.name
      } : undefined,
      email: contaminant.author.email,
      url: contaminant.author.url ? `${baseUrl}${contaminant.author.url}` : undefined,
      image: contaminant.author.image ? {
        '@type': 'ImageObject',
        contentUrl: `${baseUrl}${contaminant.author.image}`,
        description: contaminant.author.imageAlt
      } : undefined
    } : undefined,
    
    // Images
    image: contaminant.images ? [
      contaminant.images.hero ? {
        '@type': 'ImageObject',
        contentUrl: `${baseUrl}${contaminant.images.hero.url}`,
        description: contaminant.images.hero.alt,
        representativeOfPage: true
      } : null,
      contaminant.images.micro ? {
        '@type': 'ImageObject',
        contentUrl: `${baseUrl}${contaminant.images.micro.url}`,
        description: contaminant.images.micro.alt,
        thumbnail: true
      } : null
    ].filter(Boolean) : undefined,
    
    // Citation array (must be array with ≥3 items)
    citation: [
      // Primary dataset citation
      {
        '@type': 'CreativeWork',
        name: `${contaminant.name} Contamination Removal Dataset`,
        author: contaminant.author ? {
          '@type': 'Person',
          name: contaminant.author.name,
          jobTitle: contaminant.author.jobTitle || contaminant.author.title
        } : { '@type': 'Organization', name: config.publisher.name },
        datePublished: contaminant.datePublished || new Date().toISOString().split('T')[0],
        url: contaminantUrl,
        citation: config.attribution.format
          .replace('{year}', String(currentYear))
          .replace('{materialName}', contaminant.name + ' Contamination Removal')
          .replace('{url}', contaminantUrl)
      },
      // Publisher citation
      {
        '@type': 'CreativeWork',
        name: config.catalog.name,
        publisher: {
          '@type': 'Organization',
          name: config.publisher.name,
          url: config.publisher.url
        },
        url: config.catalog.url
      },
      // Regulatory standards as additional citations
      ...(contaminant.relationships?.regulatory_standards || []).slice(0, 3).map((reg: any) => ({
        '@type': 'CreativeWork',
        name: reg.type || 'Regulatory Standard',
        identifier: reg.id,
        description: 'Safety and regulatory compliance standard'
      }))
    ]
  };

  return JSON.stringify(dataset, null, 2);
}

// Extract variables for Schema.org
function extractVariables(contaminant: ContaminantData): any[] {
  const variables: any[] = [];
  
  // Composition data
  if (contaminant.composition && Array.isArray(contaminant.composition)) {
    contaminant.composition.forEach((compound, index) => {
      variables.push({
        '@type': 'PropertyValue',
        propertyID: `composition_${index}`,
        name: 'Chemical Composition',
        value: compound,
        description: 'Primary chemical compound in contamination'
      });
    });
  }
  
  // Safety assessments
  if (contaminant.safety_data) {
    if (contaminant.safety_data.fire_explosion_risk) {
      variables.push({
        '@type': 'PropertyValue',
        propertyID: 'fire_explosion_risk',
        name: 'Fire/Explosion Risk',
        value: contaminant.safety_data.fire_explosion_risk
      });
    }
    
    if (contaminant.safety_data.toxic_gas_risk) {
      variables.push({
        '@type': 'PropertyValue',
        propertyID: 'toxic_gas_risk',
        name: 'Toxic Gas Risk',
        value: contaminant.safety_data.toxic_gas_risk
      });
    }
    
    if (contaminant.safety_data.visibility_hazard) {
      variables.push({
        '@type': 'PropertyValue',
        propertyID: 'visibility_hazard',
        name: 'Visibility Hazard',
        value: contaminant.safety_data.visibility_hazard
      });
    }
    
    // PPE requirements
    if (contaminant.safety_data.ppe_requirements) {
      const ppe = contaminant.safety_data.ppe_requirements;
      
      if (ppe.respiratory) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: 'ppe_respiratory',
          name: 'Required Respiratory Protection',
          value: ppe.respiratory
        });
      }
      
      if (ppe.eye_protection) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: 'ppe_eye_protection',
          name: 'Required Eye Protection',
          value: ppe.eye_protection
        });
      }
      
      if (ppe.protective_clothing) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: 'ppe_protective_clothing',
          name: 'Required Protective Clothing',
          value: ppe.protective_clothing
        });
      }
      
      if (ppe.gloves) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: 'ppe_gloves',
          name: 'Required Gloves',
          value: ppe.gloves
        });
      }
    }
    
    // Ventilation requirements
    if (contaminant.safety_data.ventilation_requirements) {
      const vent = contaminant.safety_data.ventilation_requirements;
      
      if (vent.minimum_air_changes_per_hour) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: 'ventilation_ach',
          name: 'Minimum Air Changes Per Hour',
          value: vent.minimum_air_changes_per_hour,
          unitText: 'ACH'
        });
      }
      
      if (vent.fume_extraction) {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: 'fume_extraction',
          name: 'Fume Extraction Requirements',
          value: vent.fume_extraction
        });
      }
    }
  }
  
  // Laser properties
  if (contaminant.laser_properties) {
    Object.entries(contaminant.laser_properties).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        variables.push({
          '@type': 'PropertyValue',
          propertyID: key,
          name: key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          value: value,
          description: 'Laser property for contamination removal'
        });
      }
    });
  }
  
  // Material-specific removal count
  if (contaminant.removal_by_material) {
    variables.push({
      '@type': 'PropertyValue',
      propertyID: 'material_specific_removal_count',
      name: 'Material-Specific Removal Methods Available',
      value: Object.keys(contaminant.removal_by_material).length,
      unitText: 'material types'
    });
  }
  
  // Visual characteristics count
  if (contaminant.visual_characteristics?.appearance_on_categories) {
    variables.push({
      '@type': 'PropertyValue',
      propertyID: 'visual_identification_categories',
      name: 'Visual Identification Data Available',
      value: Object.keys(contaminant.visual_characteristics.appearance_on_categories).length,
      unitText: 'material categories'
    });
    
    // Add detailed visual characteristics per material category
    Object.entries(contaminant.visual_characteristics.appearance_on_categories).forEach(([category, data]: [string, any]) => {
      variables.push({
        '@type': 'PropertyValue',
        propertyID: `appearance_${category}`,
        name: `Appearance on ${category}`,
        value: data.appearance || 'Not specified',
        description: `Visual appearance characteristics on ${category} materials`
      });
      
      variables.push({
        '@type': 'PropertyValue',
        propertyID: `coverage_${category}`,
        name: `Coverage pattern on ${category}`,
        value: data.coverage || 'Not specified',
        description: `Coverage pattern on ${category} materials`
      });
      
      variables.push({
        '@type': 'PropertyValue',
        propertyID: `pattern_${category}`,
        name: `Pattern on ${category}`,
        value: data.pattern || 'Not specified',
        description: `Distribution pattern on ${category} materials`
      });
    });
  }
  
  // Add relationship data for compounds produced
  if (contaminant.relationships?.produces_compounds && Array.isArray(contaminant.relationships.produces_compounds)) {
    contaminant.relationships.produces_compounds.forEach((compound: any, index: number) => {
      variables.push({
        '@type': 'PropertyValue',
        propertyID: `hazardous_compound_${index}`,
        name: `Hazardous Compound: ${compound.id || 'Unknown'}`,
        value: compound.phase || 'Unknown',
        description: `Hazard level: ${compound.hazard_level || 'Unknown'}`,
        url: compound.url
      });
    });
  }
  
  // Add material frequency data
  if (contaminant.relationships?.found_on_materials && Array.isArray(contaminant.relationships.found_on_materials)) {
    contaminant.relationships.found_on_materials.forEach((material: any, index: number) => {
      variables.push({
        '@type': 'PropertyValue',
        propertyID: `contamination_frequency_${index}`,
        name: `Found on ${material.id || 'Unknown'}`,
        value: material.frequency || 'Unknown',
        description: 'Contamination occurrence frequency on this material',
        url: material.url
      });
    });
  }
  
  return variables;
}

// Generate CSV format
function generateCSV(contaminant: ContaminantData, slug: string): string {
  let csv = '# Contaminant Removal Dataset (CSV Format)\n';
  csv += `# Contaminant: ${contaminant.name}\n`;
  csv += `# Category: ${contaminant.category}\n`;
  csv += `# Generated: ${new Date().toISOString().split('T')[0]}\n`;
  csv += `# License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)\n`;
  csv += `# URL: ${SITE_CONFIG.url}${contaminant.full_path}\n\n`;
  
  // Composition section
  csv += '## CHEMICAL COMPOSITION\n';
  csv += 'Index,Compound\n';
  if (contaminant.composition && Array.isArray(contaminant.composition)) {
    contaminant.composition.forEach((compound, index) => {
      csv += `${index + 1},"${compound}"\n`;
    });
  } else {
    csv += 'N/A,No composition data available\n';
  }
  csv += '\n';
  
  // Safety data section
  csv += '## SAFETY DATA\n';
  csv += 'Assessment,Risk Level\n';
  if (contaminant.safety_data) {
    csv += `Fire/Explosion Risk,"${contaminant.safety_data.fire_explosion_risk || 'Unknown'}"\n`;
    csv += `Toxic Gas Risk,"${contaminant.safety_data.toxic_gas_risk || 'Unknown'}"\n`;
    csv += `Visibility Hazard,"${contaminant.safety_data.visibility_hazard || 'Unknown'}"\n`;
  } else {
    csv += 'N/A,No safety data available\n';
  }
  csv += '\n';
  
  // PPE requirements
  csv += '## PPE REQUIREMENTS\n';
  csv += 'Protection Type,Requirement\n';
  if (contaminant.safety_data?.ppe_requirements) {
    const ppe = contaminant.safety_data.ppe_requirements;
    csv += `Respiratory,"${ppe.respiratory || 'Not specified'}"\n`;
    csv += `Eye Protection,"${ppe.eye_protection || 'Not specified'}"\n`;
    csv += `Protective Clothing,"${ppe.protective_clothing || 'Not specified'}"\n`;
    csv += `Gloves,"${ppe.gloves || 'Not specified'}"\n`;
  } else {
    csv += 'N/A,No PPE requirements specified\n';
  }
  csv += '\n';
  
  // Ventilation requirements
  csv += '## VENTILATION REQUIREMENTS\n';
  csv += 'Parameter,Value\n';
  if (contaminant.safety_data?.ventilation_requirements) {
    const vent = contaminant.safety_data.ventilation_requirements;
    if (vent.minimum_air_changes_per_hour) {
      csv += `Minimum ACH,${vent.minimum_air_changes_per_hour}\n`;
    }
    if (vent.fume_extraction) {
      csv += `Fume Extraction,"${vent.fume_extraction}"\n`;
    }
  } else {
    csv += 'N/A,No ventilation requirements specified\n';
  }
  csv += '\n';
  
  // Laser properties
  csv += '## LASER REMOVAL PROPERTIES\n';
  csv += 'Property,Value\n';
  if (contaminant.laser_properties && Object.keys(contaminant.laser_properties).length > 0) {
    Object.entries(contaminant.laser_properties).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      csv += `"${formattedKey}","${value}"\n`;
    });
  } else {
    csv += 'N/A,No laser property data available\n';
  }
  csv += '\n';
  
  // Data availability summary
  csv += '## DATA AVAILABILITY\n';
  csv += 'Data Type,Availability\n';
  csv += `Material-Specific Removal,"${contaminant.removal_by_material ? Object.keys(contaminant.removal_by_material).length + ' materials' : 'Not available'}"\n`;
  csv += `Visual Characteristics,"${contaminant.visual_characteristics?.appearance_on_categories ? Object.keys(contaminant.visual_characteristics.appearance_on_categories).length + ' categories' : 'Not available'}"\n`;
  
  return csv;
}

// Generate TXT format
function generateTXT(contaminant: ContaminantData, slug: string): string {
  let txt = '═══════════════════════════════════════════════════════════════\n';
  txt += `  ${contaminant.name.toUpperCase()} CONTAMINATION REMOVAL DATASET\n`;
  txt += '═══════════════════════════════════════════════════════════════\n\n';
  
  txt += `Category: ${contaminant.category}\n`;
  txt += `Generated: ${new Date().toISOString().split('T')[0]}\n`;
  txt += `License: CC BY 4.0\n`;
  txt += `URL: ${SITE_CONFIG.url}${contaminant.full_path}\n\n`;
  
  txt += '───────────────────────────────────────────────────────────────\n';
  txt += 'DESCRIPTION\n';
  txt += '───────────────────────────────────────────────────────────────\n\n';
  txt += wrapText(contaminant.description, 63) + '\n\n';
  
  txt += '───────────────────────────────────────────────────────────────\n';
  txt += 'CHEMICAL COMPOSITION\n';
  txt += '───────────────────────────────────────────────────────────────\n\n';
  if (contaminant.composition && contaminant.composition.length > 0) {
    contaminant.composition.forEach((compound, index) => {
      txt += `  ${index + 1}. ${compound}\n`;
    });
  } else {
    txt += '  No composition data available\n';
  }
  txt += '\n';
  
  txt += '───────────────────────────────────────────────────────────────\n';
  txt += 'SAFETY ASSESSMENTS\n';
  txt += '───────────────────────────────────────────────────────────────\n\n';
  if (contaminant.safety_data) {
    txt += `  Fire/Explosion Risk:     ${contaminant.safety_data.fire_explosion_risk || 'Unknown'}\n`;
    txt += `  Toxic Gas Risk:          ${contaminant.safety_data.toxic_gas_risk || 'Unknown'}\n`;
    txt += `  Visibility Hazard:       ${contaminant.safety_data.visibility_hazard || 'Unknown'}\n`;
  } else {
    txt += '  No safety data available\n';
  }
  txt += '\n';
  
  txt += '───────────────────────────────────────────────────────────────\n';
  txt += 'PPE REQUIREMENTS\n';
  txt += '───────────────────────────────────────────────────────────────\n\n';
  if (contaminant.safety_data?.ppe_requirements) {
    const ppe = contaminant.safety_data.ppe_requirements;
    txt += `  Respiratory Protection:  ${ppe.respiratory || 'Not specified'}\n`;
    txt += `  Eye Protection:          ${ppe.eye_protection || 'Not specified'}\n`;
    txt += `  Protective Clothing:     ${ppe.protective_clothing || 'Not specified'}\n`;
    txt += `  Gloves:                  ${ppe.gloves || 'Not specified'}\n`;
  } else {
    txt += '  No PPE requirements specified\n';
  }
  txt += '\n';
  
  txt += '───────────────────────────────────────────────────────────────\n';
  txt += 'VENTILATION REQUIREMENTS\n';
  txt += '───────────────────────────────────────────────────────────────\n\n';
  if (contaminant.safety_data?.ventilation_requirements) {
    const vent = contaminant.safety_data.ventilation_requirements;
    if (vent.minimum_air_changes_per_hour) {
      txt += `  Minimum ACH:             ${vent.minimum_air_changes_per_hour} air changes/hour\n`;
    }
    if (vent.fume_extraction) {
      txt += `  Fume Extraction:         ${vent.fume_extraction}\n`;
    }
  } else {
    txt += '  No ventilation requirements specified\n';
  }
  txt += '\n';
  
  txt += '───────────────────────────────────────────────────────────────\n';
  txt += 'LASER REMOVAL PROPERTIES\n';
  txt += '───────────────────────────────────────────────────────────────\n\n';
  if (contaminant.laser_properties && Object.keys(contaminant.laser_properties).length > 0) {
    Object.entries(contaminant.laser_properties).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      txt += `  ${formattedKey.padEnd(25)}: ${value}\n`;
    });
  } else {
    txt += '  No laser property data available\n';
  }
  txt += '\n';
  
  txt += '───────────────────────────────────────────────────────────────\n';
  txt += 'DATA AVAILABILITY SUMMARY\n';
  txt += '───────────────────────────────────────────────────────────────\n\n';
  txt += `  Material-Specific Data:  ${contaminant.removal_by_material ? Object.keys(contaminant.removal_by_material).length + ' materials' : 'Not available'}\n`;
  txt += `  Visual Characteristics:  ${contaminant.visual_characteristics?.appearance_on_categories ? Object.keys(contaminant.visual_characteristics.appearance_on_categories).length + ' categories' : 'Not available'}\n`;
  txt += '\n';
  
  txt += '═══════════════════════════════════════════════════════════════\n';
  txt += 'For complete dataset with material-specific removal parameters\n';
  txt += 'and visual identification data, visit:\n';
  txt += `${SITE_CONFIG.url}${contaminant.full_path}\n`;
  txt += '═══════════════════════════════════════════════════════════════\n';
  
  return txt;
}

// Wrap text to specified width
function wrapText(text: string, width: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines.join('\n');
}

// Main execution
async function main() {
  console.log('🔬 Contaminant Dataset Generator');
  console.log('═══════════════════════════════════════════════\n');
  
  const contaminantsDir = path.join(process.cwd(), 'frontmatter', 'contaminants');
  const outputDir = path.join(process.cwd(), 'public', 'datasets', 'contaminants');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Created output directory: ${outputDir}\n`);
  }
  
  // Read all contaminant files
  const files = fs.readdirSync(contaminantsDir).filter(f => f.endsWith('.yaml'));
  console.log(`📁 Found ${files.length} contaminant files\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const slug = file.replace('.yaml', '');
    
    try {
      // Load contaminant data
      const filePath = path.join(contaminantsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const contaminant = yaml.load(content) as ContaminantData;
      
      if (!contaminant.name) {
        console.log(`  ⚠️  ${slug}: Missing name, skipping`);
        errorCount++;
        continue;
      }
      
      // Generate JSON
      const json = generateJSON(contaminant, slug);
      fs.writeFileSync(path.join(outputDir, `${slug}.json`), json);
      
      // Generate CSV
      const csv = generateCSV(contaminant, slug);
      fs.writeFileSync(path.join(outputDir, `${slug}.csv`), csv);
      
      // Generate TXT
      const txt = generateTXT(contaminant, slug);
      fs.writeFileSync(path.join(outputDir, `${slug}.txt`), txt);
      
      console.log(`  ✅ ${contaminant.name}`);
      console.log(`     📊 Composition: ${contaminant.composition?.length || 0} compounds`);
      console.log(`     🛡️  Safety data: ${contaminant.safety_data ? 'Yes' : 'No'}`);
      console.log(`     🔬 Laser props: ${contaminant.laser_properties ? Object.keys(contaminant.laser_properties).length : 0}`);
      
      successCount++;
      
    } catch (error) {
      console.log(`  ❌ ${slug}: ${(error as Error).message}`);
      errorCount++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log(`✅ Success: ${successCount} contaminants`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total files: ${successCount * 3} (JSON + CSV + TXT)`);
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(console.error);
