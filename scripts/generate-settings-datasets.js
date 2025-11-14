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
const OUTPUT_DIR = path.join(__dirname, '../public/datasets/settings');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✓ Created directory: ${OUTPUT_DIR}`);
}

/**
 * Convert settings YAML to structured dataset
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
    
    // Generate CSV (flatten essential parameters)
    const csvRows = ['Parameter,Value,Unit,Min,Max,Optimal_Min,Optimal_Max,Criticality'];
    if (dataset.machineSettings?.essential_parameters) {
      Object.entries(dataset.machineSettings.essential_parameters).forEach(([key, param]) => {
        const row = [
          key,
          param.value || '',
          param.unit || '',
          param.min || '',
          param.max || '',
          param.optimal_range?.[0] || '',
          param.optimal_range?.[1] || '',
          param.criticality || ''
        ].map(v => `"${v}"`).join(',');
        csvRows.push(row);
      });
    }
    const csvPath = path.join(OUTPUT_DIR, `${outputSlug}.csv`);
    fs.writeFileSync(csvPath, csvRows.join('\n'));
    
    // Generate TXT (human-readable format)
    const txtLines = [
      `${data.name} LASER CLEANING SETTINGS`,
      '='.repeat(60),
      '',
      `Category: ${data.category} > ${data.subcategory}`,
      `Title: ${data.title}`,
      `Description: ${data.description}`,
      '',
      'ESSENTIAL PARAMETERS',
      '-'.repeat(60)
    ];
    
    if (dataset.machineSettings?.essential_parameters) {
      Object.entries(dataset.machineSettings.essential_parameters).forEach(([key, param]) => {
        txtLines.push('');
        txtLines.push(`${key}:`);
        txtLines.push(`  Value: ${param.value} ${param.unit}`);
        if (param.min && param.max) {
          txtLines.push(`  Range: ${param.min}-${param.max} ${param.unit}`);
        }
        if (param.optimal_range) {
          txtLines.push(`  Optimal: ${param.optimal_range[0]}-${param.optimal_range[1]} ${param.unit}`);
        }
        if (param.criticality) {
          txtLines.push(`  Criticality: ${param.criticality.toUpperCase()}`);
        }
        if (param.rationale) {
          txtLines.push(`  Rationale: ${param.rationale.substring(0, 200)}...`);
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
