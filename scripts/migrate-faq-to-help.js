#!/usr/bin/env node
/**
 * Migrate existing FAQ data to unified help schema
 * Converts faq arrays to help sections with type='faq', context='material'
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const MATERIALS_DIR = path.join(__dirname, '../frontmatter/materials');

function migrateMaterialFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    // Skip if no FAQ or already migrated
    if (!data.faq || data.help) {
      return { skipped: true, reason: data.help ? 'already migrated' : 'no faq' };
    }
    
    // Create help section from existing FAQ
    const helpSection = {
      type: 'faq',
      context: 'material',
      items: data.faq.map(item => ({
        question: item.question,
        answer: item.answer
      }))
    };
    
    // Add help array, keep old faq for now (backward compat)
    data.help = [helpSection];
    
    // Write back
    const newContent = yaml.dump(data, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false
    });
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    return { migrated: true, faqCount: data.faq.length };
    
  } catch (error) {
    return { error: error.message };
  }
}

function main() {
  console.log('🔄 Migrating FAQ data to unified help schema...\n');
  
  const files = fs.readdirSync(MATERIALS_DIR)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map(f => path.join(MATERIALS_DIR, f));
  
  const results = {
    migrated: 0,
    skipped: 0,
    errors: 0,
    totalItems: 0
  };
  
  files.forEach(file => {
    const result = migrateMaterialFile(file);
    const filename = path.basename(file);
    
    if (result.migrated) {
      results.migrated++;
      results.totalItems += result.faqCount;
      console.log(`✅ ${filename}: Migrated ${result.faqCount} FAQ items`);
    } else if (result.skipped) {
      results.skipped++;
      console.log(`⏭️  ${filename}: Skipped (${result.reason})`);
    } else if (result.error) {
      results.errors++;
      console.log(`❌ ${filename}: Error - ${result.error}`);
    }
  });
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   Migrated: ${results.migrated} files (${results.totalItems} FAQ items)`);
  console.log(`   Skipped: ${results.skipped} files`);
  console.log(`   Errors: ${results.errors} files`);
}

main();
