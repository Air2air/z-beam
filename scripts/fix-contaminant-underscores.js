#!/usr/bin/env node

/**
 * Fix underscores in contaminant YAML category and subcategory fields
 * Converts: organic_residue -> organic-residue
 * Uses regex replacement to avoid yaml dependency
 */

const fs = require('fs').promises;
const path = require('path');

const CONTAMINANTS_DIR = path.join(__dirname, '../frontmatter/contaminants');

async function fixUnderscores() {
  try {
    const files = await fs.readdir(CONTAMINANTS_DIR);
    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    
    let filesModified = 0;
    let categoriesFixed = 0;
    let subcategoriesFixed = 0;
    
    console.log(`Found ${yamlFiles.length} contaminant files to process...\n`);
    
    for (const file of yamlFiles) {
      const filePath = path.join(CONTAMINANTS_DIR, file);
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;
      
      // Fix category: line with underscores
      const categoryMatch = content.match(/^category:\s*(.+)$/m);
      if (categoryMatch && categoryMatch[1].includes('_')) {
        const oldValue = categoryMatch[1];
        const newValue = oldValue.replace(/_/g, '-');
        content = content.replace(/^category:\s*.+$/m, `category: ${newValue}`);
        console.log(`  ${file}: category "${oldValue}" -> "${newValue}"`);
        categoriesFixed++;
        modified = true;
      }
      
      // Fix subcategory: line with underscores
      const subcategoryMatch = content.match(/^subcategory:\s*(.+)$/m);
      if (subcategoryMatch && subcategoryMatch[1].includes('_')) {
        const oldValue = subcategoryMatch[1];
        const newValue = oldValue.replace(/_/g, '-');
        content = content.replace(/^subcategory:\s*.+$/m, `subcategory: ${newValue}`);
        console.log(`  ${file}: subcategory "${oldValue}" -> "${newValue}"`);
        subcategoriesFixed++;
        modified = true;
      }
      
      // Write back if modified
      if (modified) {
        await fs.writeFile(filePath, content, 'utf8');
        filesModified++;
      }
    }
    
    console.log(`\n✅ Complete!`);
    console.log(`   Files modified: ${filesModified}`);
    console.log(`   Categories fixed: ${categoriesFixed}`);
    console.log(`   Subcategories fixed: ${subcategoriesFixed}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixUnderscores();
