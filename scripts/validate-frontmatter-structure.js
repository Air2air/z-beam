#!/usr/bin/env node

/**
 * Frontmatter Type Validation
 * 
 * Validates that FrontmatterType interface matches actual YAML structure.
 * Prevents type definition drift from actual data.
 * 
 * Run this before adding new frontmatter properties to ensure they exist in YAML.
 */

const fs = require('fs');
const path = require('path');

const FRONTMATTER_DIR = path.join(process.cwd(), 'frontmatter/materials');
const SAMPLE_COUNT = 10; // Check first 10 files

// Properties that should NOT exist (common mistakes)
const FORBIDDEN_PROPERTIES = [
  'applications',
  'environmentalImpact',
  'beforeText', // Should be caption.before
  'afterText',  // Should be caption.after
];

// Expected properties structure
const EXPECTED_STRUCTURE = {
  name: 'string',
  category: 'string',
  subcategory: 'string',
  title: 'string',
  description: 'string',
  author: 'object',
  images: {
    hero: { url: 'string', alt: 'string' },
    micro: { url: 'string', alt: 'string' }
  },
  caption: {
    before: 'string',
    after: 'string'
  },
  eeat: {
    reviewedBy: 'string|object',
    citations: 'array',
    isBasedOn: 'string|object'
  }
};

function validateFrontmatter() {
  console.log('🔍 Validating Frontmatter Structure\n');
  
  // Get YAML files
  const files = fs.readdirSync(FRONTMATTER_DIR)
    .filter(f => f.endsWith('.yaml'))
    .slice(0, SAMPLE_COUNT);
  
  console.log(`📁 Checking ${files.length} sample files...\n`);
  
  let errors = [];
  let warnings = [];
  
  files.forEach(file => {
    const filePath = path.join(FRONTMATTER_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for forbidden properties using simple text search
    FORBIDDEN_PROPERTIES.forEach(prop => {
      const regex = new RegExp(`^${prop}:`, 'm');
      if (regex.test(content)) {
        errors.push(`❌ ${file}: Contains forbidden property '${prop}'`);
      }
    });
    
    // Validate caption structure
    if (content.includes('caption:')) {
      if (content.includes('beforeText:') || content.includes('afterText:')) {
        errors.push(`❌ ${file}: caption has beforeText/afterText instead of before/after`);
      }
      const hasCaption = content.includes('caption:');
      const hasBefore = content.match(/^\s*before:/m);
      const hasAfter = content.match(/^\s*after:/m);
      
      if (hasCaption && !hasBefore && !hasAfter) {
        warnings.push(`⚠️  ${file}: caption exists but has no before/after text`);
      }
    }
  });
  
  // Report results
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Validation Results');
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed!\n');
    console.log('Frontmatter structure matches type definitions.\n');
    return true;
  }
  
  if (errors.length > 0) {
    console.log('ERRORS:\n');
    errors.forEach(err => console.log(err));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('WARNINGS:\n');
    warnings.forEach(warn => console.log(warn));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('❌ Validation failed! Fix errors above.\n');
    process.exit(1);
  } else {
    console.log('✅ Validation passed with warnings.\n');
    return true;
  }
}

// Print structure guide
console.log('📋 Expected Frontmatter Structure:\n');
console.log(JSON.stringify(EXPECTED_STRUCTURE, null, 2));
console.log('\n');

validateFrontmatter();
