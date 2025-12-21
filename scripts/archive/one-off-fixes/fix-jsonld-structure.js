#!/usr/bin/env node

/**
 * JSON-LD Structure Fixer
 * Properly fixes JSON-LD file structure and Schema.org compliance
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const JSONLD_DIR = 'content/components/jsonld';

function fixJsonLdStructure() {
  console.log('🔧 Fixing JSON-LD structure and Schema.org compliance...\n');
  
  const files = glob.sync(`${JSONLD_DIR}/*.yaml`);
  let fixedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    try {
      console.log(`Processing: ${path.basename(file)}`);
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Fix JSON syntax error: Remove trailing comma after publisher closing brace
      const publisherCommaFix = content.replace(
        /("publisher":\s*\{[^}]*\}),(\s*"offers":\s*\{[^}]*\})/g,
        '$1,$2'
      );

      if (publisherCommaFix !== content) {
        content = publisherCommaFix;
        modified = true;
        console.log('  ✅ Fixed: Publisher trailing comma');
      }

      // Fix misplaced offers section - ensure it's at the top level, not inside publisher
      const offersInsidePublisher = /"publisher":\s*\{([^}]*)\s*,\s*"offers":\s*\{([^}]*)\}\s*\}/g;
      if (offersInsidePublisher.test(content)) {
        content = content.replace(offersInsidePublisher, (match, publisherContent, offersContent) => {
          return `"publisher": {${publisherContent}},\n  "offers": {${offersContent}}`;
        });
        modified = true;
        console.log('  ✅ Fixed: Moved offers outside publisher');
      }

      // Validate JSON structure
      try {
        const jsonMatch = content.match(/^(\{[\s\S]*?\})\s*(\n---[\s\S]*)?$/);
        if (jsonMatch) {
          const jsonContent = jsonMatch[1];
          JSON.parse(jsonContent); // Validate JSON syntax
          console.log('  ✅ JSON syntax valid');
        } else {
          console.log('  ⚠️  Could not parse JSON structure');
        }
      } catch (parseError) {
        console.log(`  ❌ JSON syntax error: ${parseError.message}`);
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

  console.log('🏁 JSON-LD structure fix complete!');
  console.log(`📊 Results:`);
  console.log(`   • Files processed: ${files.length}`);
  console.log(`   • Files fixed: ${fixedCount}`);
  console.log(`   • Errors: ${errorCount}`);
}

// Run the fix
if (require.main === module) {
  fixJsonLdStructure();
}

module.exports = { fixJsonLdStructure };