#!/usr/bin/env node
/**
 * Update visual_characteristics presentation from 'descriptive' to 'collapsible'
 * for all contaminant frontmatter files with appearance_on_categories
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIR = path.join(process.cwd(), 'frontmatter/contaminants');

function updateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    // Check if file has visual_characteristics with appearance_on_categories
    if (!data.relationships?.visual_characteristics) {
      return { updated: false, reason: 'no visual_characteristics' };
    }
    
    const visualChars = data.relationships.visual_characteristics;
    
    // Check if it has appearance_on_categories in items
    const hasAppearanceOnCategories = visualChars.items?.some(item => 
      item && typeof item === 'object' && 'appearance_on_categories' in item
    );
    
    if (!hasAppearanceOnCategories) {
      return { updated: false, reason: 'no appearance_on_categories' };
    }
    
    // Update presentation to collapsible
    if (visualChars.presentation === 'descriptive') {
      visualChars.presentation = 'collapsible';
      
      // Write back to file
      const newContent = yaml.dump(data, {
        indent: 2,
        lineWidth: 120,
        noRefs: true
      });
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      return { updated: true };
    }
    
    return { updated: false, reason: `already ${visualChars.presentation}` };
  } catch (error) {
    return { updated: false, reason: error.message };
  }
}

function main() {
  console.log('🔄 Updating visual_characteristics presentation to collapsible...\n');
  
  const files = fs.readdirSync(FRONTMATTER_DIR)
    .filter(f => f.endsWith('.yaml'));
  
  let updated = 0;
  let skipped = 0;
  const reasons = {};
  
  for (const file of files) {
    const filePath = path.join(FRONTMATTER_DIR, file);
    const result = updateFile(filePath);
    
    if (result.updated) {
      updated++;
      console.log(`✅ ${file}`);
    } else {
      skipped++;
      reasons[result.reason] = (reasons[result.reason] || 0) + 1;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${files.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  
  if (Object.keys(reasons).length > 0) {
    console.log('\nSkip reasons:');
    for (const [reason, count] of Object.entries(reasons)) {
      console.log(`  - ${reason}: ${count}`);
    }
  }
  
  console.log('='.repeat(60));
  console.log(updated > 0 ? '✅ Update complete!' : '⚠️  No files updated');
}

main();
