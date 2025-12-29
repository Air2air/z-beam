#!/usr/bin/env node

/**
 * Audit Field Rendering
 * Checks which frontmatter fields exist in YAML but don't appear in rendered HTML
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Sample URLs to check
const testUrls = [
  { type: 'settings', path: '/settings/metal/ferrous/steel-settings', yamlPath: 'frontmatter/settings/steel-settings.yaml' },
  { type: 'material', path: '/materials/metal/ferrous/steel-laser-cleaning', yamlPath: 'frontmatter/materials/steel-laser-cleaning.yaml' },
  { type: 'contaminant', path: '/contaminants/oxide/iron-based/rust-oxidation-contamination', yamlPath: 'frontmatter/contaminants/rust-oxidation-contamination.yaml' },
];

// Fields to check across all content types
const criticalFields = [
  'page_description',
  'page_title',
  'meta_description',
  'description',
  'subtitle',
  'author.name',
  'author.jobTitle',
  'datePublished',
  'dateModified'
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('FRONTMATTER FIELD RENDERING AUDIT');
console.log('═══════════════════════════════════════════════════════════════\n');

// Check each URL
testUrls.forEach((testCase) => {
  console.log(`\n📄 ${testCase.type.toUpperCase()}: ${testCase.path}`);
  console.log('─'.repeat(70));
  
  try {
    // Load YAML
    const yamlFullPath = path.join(__dirname, testCase.yamlPath);
    const yamlContent = fs.readFileSync(yamlFullPath, 'utf8');
    const frontmatter = yaml.load(yamlContent);
    
    console.log('\n✅ Frontmatter Fields Present:');
    criticalFields.forEach(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], frontmatter)
        : frontmatter[field];
      
      if (value) {
        const preview = typeof value === 'string' && value.length > 60 
          ? value.substring(0, 60) + '...' 
          : value;
        console.log(`   • ${field}: ${JSON.stringify(preview)}`);
      }
    });
    
    console.log('\n⚠️  RECOMMENDATION: Check if these appear in rendered HTML');
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('NEXT STEPS:');
console.log('1. Start dev server: npm run dev');
console.log('2. curl each URL and grep for field values');
console.log('3. Identify missing fields in HTML output');
console.log('═══════════════════════════════════════════════════════════════\n');
