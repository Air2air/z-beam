#!/usr/bin/env node
/**
 * Fix contaminant breadcrumb URLs
 * 
 * Issues to fix:
 * 1. Double "contamination" suffix in URLs
 * 2. Missing subcategory level in URL structure
 * 
 * Correct pattern: /contamination/{category}/{subcategory}/{slug}
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const contaminantsDir = path.join(__dirname, 'frontmatter', 'contaminants');
const files = fs.readdirSync(contaminantsDir).filter(f => f.endsWith('.yaml'));

console.log(`Found ${files.length} contaminant files to process\n`);

let fixedCount = 0;
let errorCount = 0;

files.forEach(file => {
  const filePath = path.join(contaminantsDir, file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.parse(content);
    
    if (!data?.metadata) {
      console.log(`⚠️  Skipping ${file}: No metadata found`);
      return;
    }
    
    const { category, subcategory, slug } = data.metadata;
    
    if (!category || !subcategory || !slug) {
      console.log(`⚠️  Skipping ${file}: Missing category, subcategory, or slug`);
      return;
    }
    
    // Build correct URL
    const correctUrl = `/contamination/${category}/${subcategory}/${slug}`;
    
    // Check if breadcrumb exists and needs fixing
    if (data.metadata.breadcrumb && Array.isArray(data.metadata.breadcrumb)) {
      const lastBreadcrumb = data.metadata.breadcrumb[data.metadata.breadcrumb.length - 1];
      
      if (lastBreadcrumb && lastBreadcrumb.href !== correctUrl) {
        const oldUrl = lastBreadcrumb.href;
        lastBreadcrumb.href = correctUrl;
        
        // Write back to file
        const newContent = yaml.stringify(data);
        fs.writeFileSync(filePath, newContent, 'utf8');
        
        console.log(`✅ Fixed ${file}`);
        console.log(`   Old: ${oldUrl}`);
        console.log(`   New: ${correctUrl}\n`);
        
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Fixed: ${fixedCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log(`📊 Total: ${files.length} files`);
console.log(`${'='.repeat(60)}\n`);
