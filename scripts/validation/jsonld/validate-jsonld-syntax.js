#!/usr/bin/env node

/**
 * JSON-LD Syntax Validator
 * 
 * @deprecated Runtime validation is now handled automatically
 *             by app/utils/validators/schemaValidator.ts
 * 
 * This script remains useful for:
 * - Batch validation of static JSON-LD files in content/components/jsonld/
 * - CI/CD pipeline validation
 * - Pre-deployment schema checking
 * 
 * For runtime validation, schemas are automatically validated in development
 * mode by the MaterialJsonLD component.
 * 
 * Validates JSON syntax in all JSON-LD YAML files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const JSONLD_DIR = 'content/components/jsonld';

function validateJsonLdSyntax() {
  console.log('🔍 Validating JSON-LD syntax...\n');
  
  const files = glob.sync(`${JSONLD_DIR}/*.yaml`);
  let validCount = 0;
  let errorCount = 0;
  const errors = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Extract JSON part (entire file content as JSON)
      const jsonMatch = content.match(/^(\{[\s\S]*?\})\s*$/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1];
        
        // Validate JSON syntax
        JSON.parse(jsonContent);
        validCount++;
        
        // Check for common Schema.org issues
        const parsed = JSON.parse(jsonContent);
        const warnings = [];
        
        // Check for required Schema.org properties
        if (parsed['@type'] === 'Article') {
          if (!parsed.headline) warnings.push('Missing required "headline" property');
          if (!parsed.author) warnings.push('Missing required "author" property');
          if (!parsed.datePublished) warnings.push('Missing required "datePublished" property');
        }
        
        if (parsed.about && parsed.about['@type'] === 'Material') {
          warnings.push('Invalid @type "Material" - not a valid Schema.org type');
        }
        
        if (warnings.length > 0) {
          console.log(`⚠️  ${path.basename(file)}:`);
          warnings.forEach(warning => console.log(`   • ${warning}`));
          console.log();
        } else {
          console.log(`✅ ${path.basename(file)} - Valid`);
        }
        
      } else {
        errors.push(`${file}: Could not extract JSON content`);
        errorCount++;
      }
      
    } catch (error) {
      const errorMsg = `${path.basename(file)}: ${error.message}`;
      errors.push(errorMsg);
      errorCount++;
      console.log(`❌ ${errorMsg}`);
    }
  });

  console.log('\n🏁 JSON-LD validation complete!');
  console.log(`📊 Results:`);
  console.log(`   • Files processed: ${files.length}`);
  console.log(`   • Valid files: ${validCount}`);
  console.log(`   • Files with errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors found:');
    errors.forEach(error => console.log(`   • ${error}`));
  } else {
    console.log('\n✅ All JSON-LD files have valid syntax!');
  }

  return errorCount === 0;
}

// Run validation
if (require.main === module) {
  const isValid = validateJsonLdSyntax();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateJsonLdSyntax };