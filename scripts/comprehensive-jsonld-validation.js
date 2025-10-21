#!/usr/bin/env node

/**
 * Comprehensive JSON-LD Validation Script
 * Validates all JSON-LD files (.json and .yaml) across the entire codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function comprehensiveJsonLdValidation() {
  console.log('🔍 Comprehensive JSON-LD validation across entire codebase...\n');
  
  // Get all JSON-LD files from all locations
  const jsonFiles = glob.sync('content/components/jsonld/*.json');
  const yamlFiles = glob.sync('content/components/jsonld/*.yaml');
  const schemaFiles = glob.sync('app/utils/schemas/*.json');
  
  const allFiles = [...jsonFiles, ...yamlFiles, ...schemaFiles];
  
  let validCount = 0;
  let errorCount = 0;
  let warningCount = 0;
  const errors = [];
  const warnings = [];

  console.log(`📊 Files to validate:`);
  console.log(`   • JSON-LD .json files: ${jsonFiles.length}`);
  console.log(`   • JSON-LD .yaml files: ${yamlFiles.length}`);
  console.log(`   • Schema template files: ${schemaFiles.length}`);
  console.log(`   • Total files: ${allFiles.length}\n`);

  allFiles.forEach(file => {
    try {
      const fileName = path.basename(file);
      const content = fs.readFileSync(file, 'utf8');
      
      // For .json files, validate JSON syntax
      if (file.endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (parseError) {
          errors.push(`${fileName}: JSON syntax error - ${parseError.message}`);
          errorCount++;
          return;
        }
      }
      
      // For .yaml files, extract JSON portion
      let jsonContent = content;
      if (file.endsWith('.yaml')) {
        const jsonMatch = content.match(/^(\{[\s\S]*?\})\s*$/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
          try {
            JSON.parse(jsonContent);
          } catch (parseError) {
            errors.push(`${fileName}: JSON syntax error - ${parseError.message}`);
            errorCount++;
            return;
          }
        } else {
          errors.push(`${fileName}: Could not extract JSON content`);
          errorCount++;
          return;
        }
      }

      // Schema.org compliance checks
      const schemaIssues = [];
      
      // Check for invalid @type: "Material"
      if (content.includes('"@type": "Material"')) {
        schemaIssues.push('Invalid @type: "Material" - not a valid Schema.org type');
      }
      
      // Check required properties for common schema types
      if (content.includes('"@type": "Article"')) {
        if (!content.includes('"headline"')) schemaIssues.push('Article missing required "headline"');
        if (!content.includes('"author"')) schemaIssues.push('Article missing required "author"');
        if (!content.includes('"datePublished"')) schemaIssues.push('Article missing required "datePublished"');
      }
      
      if (content.includes('"@type": "Organization"')) {
        if (!content.includes('"name"')) schemaIssues.push('Organization missing required "name"');
      }
      
      if (content.includes('"@type": "Product"')) {
        if (!content.includes('"name"')) schemaIssues.push('Product missing required "name"');
      }

      if (schemaIssues.length > 0) {
        warnings.push(`${fileName}: ${schemaIssues.join(', ')}`);
        warningCount++;
      }

      validCount++;

    } catch (error) {
      errors.push(`${fileName}: File read error - ${error.message}`);
      errorCount++;
    }
  });

  console.log('🏁 Comprehensive JSON-LD validation complete!\n');
  console.log(`📊 Results:`);
  console.log(`   • Files processed: ${allFiles.length}`);
  console.log(`   • Valid files: ${validCount}`);
  console.log(`   • Files with errors: ${errorCount}`);
  console.log(`   • Files with warnings: ${warningCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors found:');
    errors.slice(0, 10).forEach(error => console.log(`   • ${error}`));
    if (errors.length > 10) {
      console.log(`   • ... and ${errors.length - 10} more errors`);
    }
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings found:');
    warnings.slice(0, 10).forEach(warning => console.log(`   • ${warning}`));
    if (warnings.length > 10) {
      console.log(`   • ... and ${warnings.length - 10} more warnings`);
    }
  }

  if (errorCount === 0 && warningCount === 0) {
    console.log('\n✅ Perfect! All JSON-LD files are valid and Schema.org compliant!');
    console.log('🎯 Ready for production deployment and search engine optimization');
  } else if (errorCount === 0) {
    console.log('\n✅ All JSON-LD files have valid syntax');
    console.log('⚠️  Some warnings found - review for optimal Schema.org compliance');
  }

  // Summary statistics
  console.log('\n📈 Compliance Summary:');
  console.log(`   • Syntax Compliance: ${((validCount / allFiles.length) * 100).toFixed(1)}%`);
  console.log(`   • Schema.org Compliance: ${(((allFiles.length - warningCount) / allFiles.length) * 100).toFixed(1)}%`);
  console.log(`   • Overall Health: ${(((validCount - warningCount) / allFiles.length) * 100).toFixed(1)}%`);

  return errorCount === 0;
}

// Run validation
if (require.main === module) {
  const isValid = comprehensiveJsonLdValidation();
  process.exit(isValid ? 0 : 1);
}

module.exports = { comprehensiveJsonLdValidation };