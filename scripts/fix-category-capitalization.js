#!/usr/bin/env node
/**
 * Fix Category Capitalization in Frontmatter Files
 * 
 * Converts all category fields from TitleCase to lowercase-with-hyphens
 * Example: "Metal" → "metal", "Rare-Earth" → "rare-earth"
 * 
 * Run: node scripts/fix-category-capitalization.js
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

async function fixFrontmatterFiles() {
  const frontmatterDir = path.join(process.cwd(), 'frontmatter/materials');
  const files = await fs.readdir(frontmatterDir);
  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  
  console.log(`🔧 Fixing category capitalization in ${yamlFiles.length} files...\n`);
  
  let fixedCount = 0;
  let skippedCount = 0;
  
  for (const file of yamlFiles) {
    const filePath = path.join(frontmatterDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    const data = yaml.load(content);
    
    let modified = false;
    
    // Fix category if it's capitalized
    if (data.category) {
      const lowercaseCategory = data.category.toLowerCase().replace(/\s+/g, '-');
      if (data.category !== lowercaseCategory) {
        console.log(`  • ${file}: "${data.category}" → "${lowercaseCategory}"`);
        data.category = lowercaseCategory;
        modified = true;
      }
    }
    
    // Fix subcategory if it's capitalized
    if (data.subcategory) {
      const lowercaseSubcategory = data.subcategory.toLowerCase().replace(/\s+/g, '-');
      if (data.subcategory !== lowercaseSubcategory) {
        console.log(`  • ${file}: subcategory "${data.subcategory}" → "${lowercaseSubcategory}"`);
        data.subcategory = lowercaseSubcategory;
        modified = true;
      }
    }
    
    if (modified) {
      // Write back to file, preserving structure
      const newContent = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
      await fs.writeFile(filePath, newContent, 'utf8');
      fixedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log(`\n✅ Fixed: ${fixedCount} files`);
  console.log(`⏭️  Skipped: ${skippedCount} files (already correct)`);
  console.log(`\n📋 Total: ${yamlFiles.length} files processed`);
}

fixFrontmatterFiles().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
