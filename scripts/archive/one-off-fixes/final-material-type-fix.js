#!/usr/bin/env node

/**
 * Final Schema.org Material Type Fix
 * Fixes remaining @type: "Material" issues in about sections
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const JSONLD_DIR = 'content/components/jsonld';

function fixMaterialType() {
  console.log('🔧 Final fix for @type: "Material" issues...\n');
  
  const files = glob.sync(`${JSONLD_DIR}/*.yaml`);
  let fixedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    try {
      console.log(`Processing: ${path.basename(file)}`);
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Check if file contains @type: "Material"
      if (content.includes('"@type": "Material"')) {
        console.log('  ❌ Found invalid @type: "Material"');
        
        // Replace @type: "Material" with @type: "Product" 
        content = content.replace(/"@type":\s*"Material"/g, '"@type": "Product"');
        modified = true;
        console.log('  ✅ Fixed: @type "Material" → "Product"');
      }

      // Write file if modified
      if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        fixedCount++;
        console.log('  💾 File updated');
      } else {
        console.log('  ✅ No changes needed');
      }
      console.log();

    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
      errorCount++;
    }
  });

  console.log('🏁 Final @type: "Material" fix complete!');
  console.log(`📊 Results:`);
  console.log(`   • Files processed: ${files.length}`);
  console.log(`   • Files fixed: ${fixedCount}`);
  console.log(`   • Files with errors: ${errorCount}`);

  return errorCount === 0;
}

// Run the fix
if (require.main === module) {
  const success = fixMaterialType();
  process.exit(success ? 0 : 1);
}

module.exports = { fixMaterialType };