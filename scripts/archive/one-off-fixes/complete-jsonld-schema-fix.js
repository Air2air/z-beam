#!/usr/bin/env node

/**
 * Complete JSON-LD Schema.org Compliance Fixer
 * Fixes invalid Schema.org types across ALL JSON-LD files (.json and .yaml)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const JSONLD_DIR = 'content/components/jsonld';
const SCHEMA_DIR = 'app/utils/schemas';

function fixAllJsonLdCompliance() {
  console.log('🔧 Comprehensive JSON-LD Schema.org compliance fix...\n');
  
  // Get all JSON-LD files (both .json and .yaml)
  const jsonFiles = glob.sync(`${JSONLD_DIR}/*.json`);
  const yamlFiles = glob.sync(`${JSONLD_DIR}/*.yaml`);
  const schemaFiles = glob.sync(`${SCHEMA_DIR}/*.json`);
  
  const allFiles = [...jsonFiles, ...yamlFiles, ...schemaFiles];
  
  let fixedCount = 0;
  let errorCount = 0;
  let processedCount = 0;

  console.log(`📊 Found files to process:`);
  console.log(`   • JSON-LD .json files: ${jsonFiles.length}`);
  console.log(`   • JSON-LD .yaml files: ${yamlFiles.length}`);
  console.log(`   • Schema template files: ${schemaFiles.length}`);
  console.log(`   • Total files: ${allFiles.length}\n`);

  allFiles.forEach(file => {
    try {
      const fileName = path.basename(file);
      console.log(`Processing: ${fileName}`);
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      processedCount++;

      // Fix 1: Replace invalid "@type": "Material" with "@type": "Product"
      if (content.includes('"@type": "Material"')) {
        console.log('  ❌ Found invalid @type: "Material"');
        content = content.replace(/"@type":\s*"Material"/g, '"@type": "Product"');
        modified = true;
        console.log('  ✅ Fixed: @type "Material" → "Product"');
      }

      // Fix 2: Check for other common Schema.org issues
      const issues = [];
      
      // Check for missing required properties in Article schema
      if (content.includes('"@type": "Article"')) {
        if (!content.includes('"headline"')) issues.push('Missing required "headline" for Article');
        if (!content.includes('"author"')) issues.push('Missing required "author" for Article');
        if (!content.includes('"datePublished"')) issues.push('Missing required "datePublished" for Article');
      }

      // Check for proper Organization schema
      if (content.includes('"@type": "Organization"')) {
        if (!content.includes('"name"')) issues.push('Missing required "name" for Organization');
        if (!content.includes('"url"')) issues.push('Missing required "url" for Organization');
      }

      // Check for Product schema completeness
      if (content.includes('"@type": "Product"')) {
        if (!content.includes('"name"')) issues.push('Missing required "name" for Product');
      }

      if (issues.length > 0) {
        console.log('  ⚠️  Schema warnings:');
        issues.forEach(issue => console.log(`     • ${issue}`));
      }

      // Fix 3: Validate JSON syntax for .json files
      if (file.endsWith('.json')) {
        try {
          JSON.parse(content);
          console.log('  ✅ JSON syntax valid');
        } catch (parseError) {
          console.log(`  ❌ JSON syntax error: ${parseError.message}`);
          errorCount++;
          return; // Skip writing invalid JSON
        }
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

  console.log('🏁 Complete JSON-LD Schema.org compliance fix finished!');
  console.log(`📊 Results:`);
  console.log(`   • Files processed: ${processedCount}`);
  console.log(`   • Files fixed: ${fixedCount}`);
  console.log(`   • Files with errors: ${errorCount}`);

  // Check for remaining invalid types
  console.log('\n🔍 Verification check...');
  const remainingMaterialTypes = [];
  
  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('"@type": "Material"')) {
        remainingMaterialTypes.push(path.basename(file));
      }
    } catch (error) {
      // Skip files that can't be read
    }
  });

  if (remainingMaterialTypes.length > 0) {
    console.log(`❌ ${remainingMaterialTypes.length} files still have invalid @type: "Material"`);
    remainingMaterialTypes.slice(0, 10).forEach(file => console.log(`   • ${file}`));
    if (remainingMaterialTypes.length > 10) {
      console.log(`   • ... and ${remainingMaterialTypes.length - 10} more`);
    }
  } else {
    console.log('✅ No remaining invalid @type: "Material" found');
  }

  return errorCount === 0 && remainingMaterialTypes.length === 0;
}

// Run the comprehensive fix
if (require.main === module) {
  const success = fixAllJsonLdCompliance();
  console.log(`\n${success ? '🎉' : '⚠️'} ${success ? 'SUCCESS' : 'ISSUES REMAIN'}: Schema.org compliance ${success ? 'complete' : 'needs attention'}`);
  process.exit(success ? 0 : 1);
}

module.exports = { fixAllJsonLdCompliance };