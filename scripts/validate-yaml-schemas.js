#!/usr/bin/env node

/**
 * YAML Schema Validator
 * Validates all frontmatter YAML files against JSON schema
 * Usage: node scripts/validate-yaml-schemas.js [--fix]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Configuration
const SCHEMA_PATH = path.join(__dirname, '../schemas/frontmatter-v5.0.0.json');
const FRONTMATTER_DIRS = [
  path.join(__dirname, '../frontmatter/settings'),
  path.join(__dirname, '../frontmatter/materials'),
  path.join(__dirname, '../frontmatter/contaminants'),
  path.join(__dirname, '../frontmatter/compounds'),
];

// Initialize validator
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Load schema
let schema;
try {
  schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  console.log('✅ Loaded schema:', SCHEMA_PATH);
} catch (error) {
  console.error('❌ Failed to load schema:', error.message);
  process.exit(1);
}

const validate = ajv.compile(schema);

// Collect all YAML files
function collectYamlFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...collectYamlFiles(fullPath));
    } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Validate single file
function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    const valid = validate(data);
    
    if (!valid) {
      return {
        valid: false,
        errors: validate.errors.map(err => ({
          path: err.instancePath,
          message: err.message,
          params: err.params,
        })),
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: `Parse error: ${error.message}` }],
    };
  }
}

// Main validation
function main() {
  console.log('\n🔍 Collecting YAML files...\n');
  
  const allFiles = [];
  for (const dir of FRONTMATTER_DIRS) {
    const files = collectYamlFiles(dir);
    allFiles.push(...files);
    console.log(`   Found ${files.length} files in ${path.basename(dir)}/`);
  }
  
  console.log(`\n📊 Total files to validate: ${allFiles.length}\n`);
  console.log('─'.repeat(80));
  
  const results = {
    total: allFiles.length,
    valid: 0,
    invalid: 0,
    errors: [],
  };
  
  for (const filePath of allFiles) {
    const result = validateFile(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    if (result.valid) {
      results.valid++;
      console.log(`✅ ${relativePath}`);
    } else {
      results.invalid++;
      results.errors.push({
        file: relativePath,
        errors: result.errors,
      });
      console.log(`❌ ${relativePath}`);
      for (const err of result.errors) {
        console.log(`   └─ ${err.path || 'root'}: ${err.message}`);
      }
    }
  }
  
  console.log('─'.repeat(80));
  console.log('\n📊 VALIDATION SUMMARY:\n');
  console.log(`   Total files:    ${results.total}`);
  console.log(`   ✅ Valid:        ${results.valid} (${((results.valid / results.total) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Invalid:      ${results.invalid} (${((results.invalid / results.total) * 100).toFixed(1)}%)`);
  
  if (results.invalid > 0) {
    console.log('\n❌ VALIDATION FAILED\n');
    console.log('Files with errors:');
    for (const { file, errors } of results.errors) {
      console.log(`\n   ${file}:`);
      for (const err of errors) {
        console.log(`      • ${err.path || 'root'}: ${err.message}`);
      }
    }
    process.exit(1);
  }
  
  console.log('\n✅ ALL FILES VALID\n');
  process.exit(0);
}

// Run
if (require.main === module) {
  main();
}

module.exports = { validateFile, collectYamlFiles };
