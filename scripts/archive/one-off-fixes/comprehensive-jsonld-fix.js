#!/usr/bin/env node

/**
 * Comprehensive JSON-LD Fixer
 * Fixes all JSON syntax issues in JSON-LD files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const JSONLD_DIR = 'content/components/jsonld';

function fixAllJsonLdFiles() {
  console.log('🔧 Comprehensive JSON-LD fix...\n');
  
  const files = glob.sync(`${JSONLD_DIR}/*.yaml`);
  let fixedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    try {
      console.log(`Processing: ${path.basename(file)}`);
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Fix 1: Move offers outside publisher (most common issue)
      const publisherWithOffers = /("publisher":\s*\{[^}]*"logo":\s*\{[^}]*\}\s*),\s*("offers":\s*\{[^}]*\}),(\s*"sameAs":\s*\[[^\]]*\]\s*\})/g;
      if (publisherWithOffers.test(content)) {
        content = content.replace(publisherWithOffers, (match, beforeOffers, offers, afterOffers) => {
          return `${beforeOffers},${afterOffers},\n  ${offers}`;
        });
        modified = true;
        console.log('  ✅ Fixed: Moved offers outside publisher');
      }

      // Fix 2: Correct logo URL path
      content = content.replace(/"url":\s*"https:\/\/z-beam\.com\/images\/logo\/logo_\.png"/g, '"url": "https://z-beam.com/images/logo.png"');
      if (content.includes('logo_.png')) {
        modified = true;
        console.log('  ✅ Fixed: Logo URL path');
      }

      // Fix 3: Ensure proper JSON structure (check for valid closing)
      try {
        const jsonMatch = content.match(/^(\{[\s\S]*?\})\s*(\n---[\s\S]*)?$/);
        if (jsonMatch) {
          JSON.parse(jsonMatch[1]);
          console.log('  ✅ JSON syntax valid');
        }
      } catch (e) {
        console.log(`  ❌ JSON syntax still invalid: ${e.message}`);
        errorCount++;
        return; // Skip writing invalid JSON
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

  console.log('🏁 Comprehensive JSON-LD fix complete!');
  console.log(`📊 Results:`);
  console.log(`   • Files processed: ${files.length}`);
  console.log(`   • Files fixed: ${fixedCount}`);
  console.log(`   • Files with errors: ${errorCount}`);

  return errorCount === 0;
}

// Run the fix
if (require.main === module) {
  const success = fixAllJsonLdFiles();
  process.exit(success ? 0 : 1);
}

module.exports = { fixAllJsonLdFiles };