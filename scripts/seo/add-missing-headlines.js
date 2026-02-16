#!/usr/bin/env node
/**
 * Add missing headline fields to material frontmatter files
 * Fixes the 50 files identified in SEO test as missing required Article schema headline
 * 
 * Created: February 15, 2026
 * Purpose: Improve SEO infrastructure from 50.6% to 85%+ quality score
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const FRONTMATTER_DIR = path.join(__dirname, '../../frontmatter/materials');

// Read all material files
const materialFiles = fs.readdirSync(FRONTMATTER_DIR)
  .filter(file => file.endsWith('.yaml') && !file.startsWith('.'));

console.log(`\n📊 Checking ${materialFiles.length} material files for missing headlines...\n`);

let filesUpdated = 0;
let filesSkipped = 0;
let filesErrored = 0;

materialFiles.forEach(file => {
  const filePath = path.join(FRONTMATTER_DIR, file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.parse(content);
    
    // Check if headline already exists
    if (data.headline) {
      filesSkipped++;
      console.log(`✅ ${file}: headline already exists`);
      return;
    }
    
    // Generate headline from name/displayName
    const materialName = data.displayName || data.name || 'Unknown Material';
    const headline = `${materialName}: Advanced Laser Cleaning Technology`;
    
    // Add headline after pageDescription (or after pageTitle if pageDescription doesn't exist)
    let newContent = content;
    
    // Strategy: Add headline after pageDescription line
    if (content.includes('pageDescription:')) {
      // Find the end of pageDescription (next line that doesn't start with whitespace)
      const lines = content.split('\n');
      let insertIndex = -1;
      let inPageDescription = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('pageDescription:')) {
          inPageDescription = true;
          continue;
        }
        
        if (inPageDescription) {
          // Check if this line is part of pageDescription (starts with spaces) or next field
          if (!lines[i].startsWith(' ') && !lines[i].startsWith('\t') && lines[i].trim() !== '') {
            insertIndex = i;
            break;
          }
        }
      }
      
      if (insertIndex > -1) {
        lines.splice(insertIndex, 0, `headline: '${headline}'`);
        newContent = lines.join('\n');
      }
    } else if (content.includes('pageTitle:')) {
      // Fallback: add after pageTitle
      newContent = content.replace(
        /(pageTitle:.*\n)/,
        `$1headline: '${headline}'\n`
      );
    } else {
      // Last resort: add after displayName or name
      const searchKey = data.displayName ? 'displayName:' : 'name:';
      newContent = content.replace(
        new RegExp(`(${searchKey}.*\n)`),
        `$1headline: '${headline}'\n`
      );
    }
    
    // Write updated content
    fs.writeFileSync(filePath, newContent, 'utf8');
    filesUpdated++;
    console.log(`✨ ${file}: added headline`);
    
  } catch (error) {
    filesErrored++;
    console.error(`❌ ${file}: ${error.message}`);
  }
});

console.log(`\n${'='.repeat(70)}`);
console.log(`📊 SUMMARY`);
console.log(`${'='.repeat(70)}`);
console.log(`Total files: ${materialFiles.length}`);
console.log(`✨ Updated: ${filesUpdated}`);
console.log(`✅ Skipped (already had headline): ${filesSkipped}`);
console.log(`❌ Errored: ${filesErrored}`);
console.log(`${'='.repeat(70)}\n`);

if (filesUpdated > 0) {
  console.log(`✅ SUCCESS: Added headlines to ${filesUpdated} material files`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Run: npm run test:seo:comprehensive`);
  console.log(`   2. Verify Article schema compliance improved`);
  console.log(`   3. Check that OVERALL QUALITY SCORE increased\n`);
} else {
  console.log(`ℹ️  No files needed updates\n`);
}
