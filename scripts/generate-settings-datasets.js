#!/usr/bin/env node
// scripts/generate-settings-datasets.js
/**
 * Generate dataset files (JSON, CSV, TXT) from settings YAML frontmatter
 * Creates /public/datasets/settings/ directory structure
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SETTINGS_DIR = path.join(__dirname, '../frontmatter/settings');
const MATERIALS_DIR = path.join(__dirname, '../frontmatter/materials');
const OUTPUT_DIR = path.join(__dirname, '../public/datasets/settings');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✓ Created directory: ${OUTPUT_DIR}`);
}

/**
 * Convert settings YAML to structured dataset
 * Merges data from settings YAML (structure) and materials YAML (descriptions)
 * @returns {object} Result with success flag and details
 */
function processSettingsFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContent);
    
    // Extract base slug (remove -laser-cleaning or -settings suffix)
    const fileName = path.basename(filePath, '.yaml');
    let baseSlug = fileName;
    if (fileName.endsWith('-laser-cleaning')) {
      baseSlug = fileName.replace('-laser-cleaning', '');
    } else if (fileName.endsWith('-settings')) {
      baseSlug = fileName.replace('-settings', '');
    }
    
    const outputSlug = `${baseSlug}-settings`;
    
    // Try to load corresponding material YAML for descriptions
    const materialPath = path.join(MATERIALS_DIR, `${baseSlug}-laser-cleaning.yaml`);
    let materialData = null;
    if (fs.existsSync(materialPath)) {
      try {
        const materialContent = fs.readFileSync(materialPath, 'utf8');
        materialData = yaml.load(materialContent);
      } catch (e) {
        console.warn(`  ⚠ Could not load material data for ${baseSlug}: ${e.message}`);
      }
    }
    
    // Merge machine settings: use material descriptions if available
    if (materialData && materialData.machineSettings) {
      Object.keys(data.machineSettings || {}).forEach(param => {
        if (materialData.machineSettings[param]?.description) {
          data.machineSettings[param] = {
            ...data.machineSettings[param],
            description: materialData.machineSettings[param].description
          };
        }
      });
    }
    
    // Build structured dataset
    const dataset = {
      metadata: {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        title: data.title,
        description: data.description,
        datePublished: data.datePublished || new Date().toISOString(),
        dateModified: data.dateModified || new Date().toISOString(),
        author: data.author
      },
      machineSettings: data.machineSettings || {},
      components: data.components || {},
      research_library: data.research_library || {},
      seo_settings_page: data.seo_settings_page || {}
    };
    
    // Generate JSON
    const jsonPath = path.join(OUTPUT_DIR, `${outputSlug}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2));
    
    // Generate CSV (flatten all machine settings parameters)
    const csvRows = ['Parameter,Value,Unit,Min,Max,Description'];
    if (dataset.machineSettings) {
      // Always include all parameters: powerRange, wavelength, spotSize, repetitionRate, 
      // energyDensity, pulseWidth, scanSpeed, passCount, overlapRatio
      Object.entries(dataset.machineSettings).forEach(([key, param]) => {
        if (typeof param === 'object' && param !== null) {
          const row = [
            key,
            param.value || '',
            param.unit || '',
            param.min || '',
            param.max || '',
            (param.description || '').replace(/"/g, '""') // Escape quotes for CSV
          ].map(v => `"${v}"`).join(',');
          csvRows.push(row);
        }
      });
    }
    const csvPath = path.join(OUTPUT_DIR, `${outputSlug}.csv`);
    fs.writeFileSync(csvPath, csvRows.join('\n'));
    
    // Generate TXT (human-readable format)
    const txtLines = [
      `${data.name.toUpperCase()} LASER CLEANING SETTINGS`,
      '='.repeat(60),
      '',
      `Category: ${data.category} > ${data.subcategory}`,
      `Title: ${data.title}`,
      `Description: ${data.description}`,
      '',
      'MACHINE SETTINGS - ALL PARAMETERS',
      '-'.repeat(60),
      '',
      'The following parameters must ALL be configured for optimal laser cleaning.',
      'These values are scientifically derived from material properties and research.'
    ];
    
    if (dataset.machineSettings) {
      // Always include ALL parameters in consistent order
      const paramOrder = [
        'powerRange', 'wavelength', 'spotSize', 'repetitionRate',
        'energyDensity', 'pulseWidth', 'scanSpeed', 'passCount', 'overlapRatio'
      ];
      
      paramOrder.forEach(key => {
        const param = dataset.machineSettings[key];
        if (param && typeof param === 'object') {
          txtLines.push('');
          txtLines.push(`${key.replace(/([A-Z])/g, ' $1').toUpperCase()}:`);
          txtLines.push(`  Value: ${param.value} ${param.unit}`);
          if (param.min !== undefined && param.max !== undefined) {
            txtLines.push(`  Range: ${param.min}-${param.max} ${param.unit}`);
          }
          if (param.description) {
            // Wrap description at 70 chars
            const words = param.description.split(' ');
            let line = '  Description: ';
            words.forEach(word => {
              if (line.length + word.length > 70 && line.length > 15) {
                txtLines.push(line);
                line = '               ' + word + ' ';
              } else {
                line += word + ' ';
              }
            });
            if (line.trim().length > 15) txtLines.push(line.trimEnd());
          }
        }
      });
      
      // Add any additional parameters not in the standard order
      Object.entries(dataset.machineSettings).forEach(([key, param]) => {
        if (!paramOrder.includes(key) && typeof param === 'object' && param !== null) {
          txtLines.push('');
          txtLines.push(`${key.replace(/([A-Z])/g, ' $1').toUpperCase()}:`);
          txtLines.push(`  Value: ${param.value} ${param.unit}`);
          if (param.min !== undefined && param.max !== undefined) {
            txtLines.push(`  Range: ${param.min}-${param.max} ${param.unit}`);
          }
          if (param.description) {
            txtLines.push(`  Description: ${param.description}`);
          }
        }
      });
    }
    
    // Add research citations if available
    if (dataset.research_library?.citations?.length > 0) {
      txtLines.push('');
      txtLines.push('');
      txtLines.push('RESEARCH CITATIONS');
      txtLines.push('-'.repeat(60));
      dataset.research_library.citations.forEach((citation, idx) => {
        txtLines.push('');
        txtLines.push(`${idx + 1}. ${citation.author} (${citation.year})`);
        txtLines.push(`   ${citation.title}`);
        txtLines.push(`   ${citation.journal}`);
        if (citation.doi) {
          txtLines.push(`   DOI: ${citation.doi}`);
        }
      });
    }
    
    txtLines.push('');
    txtLines.push('');
    txtLines.push(`Generated: ${new Date().toISOString()}`);
    txtLines.push(`License: CC BY 4.0`);
    
    const txtPath = path.join(OUTPUT_DIR, `${outputSlug}.txt`);
    fs.writeFileSync(txtPath, txtLines.join('\n'));
    
    return { outputSlug, success: true };
  } catch (error) {
    console.error(`✗ Error processing ${path.basename(filePath)}:`, error.message);
    return { outputSlug: null, success: false, error: error.message };
  }
}

/**
 * Main execution
 */
function main() {
  console.log('Generating settings datasets...\n');
  
  const files = fs.readdirSync(SETTINGS_DIR)
    .filter(f => f.endsWith('.yaml'));
  
  let successCount = 0;
  let errorCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(SETTINGS_DIR, file);
    const result = processSettingsFile(filePath);
    
    if (result.success) {
      console.log(`✓ Generated: ${result.outputSlug}`);
      successCount++;
    } else {
      console.error(`✗ Failed: ${file} - ${result.error}`);
      errorCount++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`✓ Success: ${successCount} files`);
  if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount} files`);
  }
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(60) + '\n');
  
  if (errorCount > 0) {
    console.error('❌ Settings dataset generation completed with errors');
    process.exit(1);
  }
  
  if (successCount === 0) {
    console.error('⚠️  No settings datasets generated!');
    process.exit(1);
  }
  
  console.log('✅ Settings datasets generated successfully\n');
  process.exit(0);
}

main();
