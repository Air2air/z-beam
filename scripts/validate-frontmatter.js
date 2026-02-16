#!/usr/bin/env node

/**
 * Static Page Frontmatter Validator
 * 
 * This script validates frontmatter YAML files in static page directories
 * and checks for required fields and proper structure.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Required fields for all static pages
const REQUIRED_FIELDS = [
  'pageTitle',
  'pageDescription', 
  'description',
  'slug'
];

// Optional but recommended fields
const RECOMMENDED_FIELDS = [
  'category',
  'keywords',
  'breadcrumb',
  'images',
  'contentCards'
];

function validateFrontmatter(filePath) {
  console.log(`\n📝 Validating: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    // Check required fields
    const missing = REQUIRED_FIELDS.filter(field => !data[field]);
    if (missing.length > 0) {
      console.log(`❌ Missing required fields: ${missing.join(', ')}`);
      return false;
    }
    
    // Check recommended fields
    const missingRecommended = RECOMMENDED_FIELDS.filter(field => !data[field]);
    if (missingRecommended.length > 0) {
      console.log(`⚠️  Missing recommended fields: ${missingRecommended.join(', ')}`);
    }
    
    // Validate specific structures
    if (data.breadcrumb && !Array.isArray(data.breadcrumb)) {
      console.log(`❌ breadcrumb must be an array`);
      return false;
    }
    
    if (data.contentCards && !Array.isArray(data.contentCards)) {
      console.log(`❌ contentCards must be an array`);
      return false;
    }
    
    if (data.keywords && !Array.isArray(data.keywords)) {
      console.log(`❌ keywords must be an array`);
      return false;
    }
    
    // Check content cards structure
    if (data.contentCards) {
      for (const card of data.contentCards) {
        if (!card.heading || !card.text) {
          console.log(`❌ Content card missing heading or text`);
          return false;
        }
        if (card.image && (!card.image.url || !card.image.alt)) {
          console.log(`❌ Content card image missing url or alt text`);
          return false;
        }
      }
    }
    
    console.log(`✅ Valid frontmatter structure`);
    console.log(`   - Title: ${data.pageTitle}`);
    console.log(`   - Slug: ${data.slug}`);
    if (data.contentCards) {
      console.log(`   - Content cards: ${data.contentCards.length}`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error parsing YAML: ${error.message}`);
    return false;
  }
}

function findFrontmatterFiles() {
  const appDir = path.join(process.cwd(), 'app');
  const files = [];
  
  // Read all directories in app/
  const entries = fs.readdirSync(appDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const yamlPath = path.join(appDir, entry.name, 'page.yaml');
      if (fs.existsSync(yamlPath)) {
        files.push(yamlPath);
      }
    }
  }
  
  return files;
}

function main() {
  console.log('🔍 Static Page Frontmatter Validator');
  console.log('=====================================\n');
  
  const files = findFrontmatterFiles();
  
  if (files.length === 0) {
    console.log('No frontmatter files found in app/ directories.');
    return;
  }
  
  console.log(`Found ${files.length} frontmatter file(s):\n`);
  
  let validCount = 0;
  let totalCount = files.length;
  
  for (const file of files) {
    if (validateFrontmatter(file)) {
      validCount++;
    }
  }
  
  console.log('\n=====================================');
  console.log(`📊 Summary: ${validCount}/${totalCount} files valid`);
  
  if (validCount === totalCount) {
    console.log('🎉 All frontmatter files are valid!');
    process.exit(0);
  } else {
    console.log('⚠️  Some files need attention.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateFrontmatter, findFrontmatterFiles };