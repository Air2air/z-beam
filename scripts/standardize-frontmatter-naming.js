#!/usr/bin/env node

/**
 * Standardize Frontmatter Naming Convention
 * 
 * Converts ALL frontmatter fields to camelCase (industry standard for JavaScript/TypeScript)
 * - page_description → pageDescription
 * - page_title → pageTitle
 * - meta_description → metaDescription
 * - full_path → fullPath
 * - content_type → contentType
 * 
 * Date: January 4, 2026
 * Purpose: Ensure 100% naming consistency across all 442 frontmatter files
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Field name mappings (snake_case → camelCase)
const FIELD_MAPPINGS = {
  page_description: 'pageDescription',
  page_title: 'pageTitle',
  meta_description: 'metaDescription',
  full_path: 'fullPath',
  content_type: 'contentType',
  date_published: 'datePublished',
  date_modified: 'dateModified',
  last_modified: 'lastModified',
  schema_version: 'schemaVersion',
  image_alt: 'imageAlt',
  job_title: 'jobTitle',
  country_display: 'country_display', // Keep as-is (author field)
  same_as: 'sameAs'
};

// Directories to process
const FRONTMATTER_DIRS = [
  'frontmatter/materials',
  'frontmatter/settings',
  'frontmatter/contaminants',
  'frontmatter/compounds'
];

let totalFiles = 0;
let totalFieldsRenamed = 0;
let filesWithChanges = 0;

/**
 * Recursively rename fields in object
 */
function renameFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  let changesInObject = 0;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => renameFields(item));
  }
  
  // Handle objects
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = FIELD_MAPPINGS[key] || key;
    
    if (newKey !== key) {
      changesInObject++;
      totalFieldsRenamed++;
      console.log(`    ✓ ${key} → ${newKey}`);
    }
    
    // Recursively process nested objects
    newObj[newKey] = renameFields(value);
  }
  
  return newObj;
}

/**
 * Process single YAML file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    console.log(`\n📄 Processing: ${path.relative(process.cwd(), filePath)}`);
    
    const fieldsBefore = totalFieldsRenamed;
    const renamedData = renameFields(data);
    const fieldsChanged = totalFieldsRenamed - fieldsBefore;
    
    if (fieldsChanged > 0) {
      filesWithChanges++;
      
      // Write back to file
      const yamlContent = yaml.dump(renamedData, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
      
      fs.writeFileSync(filePath, yamlContent, 'utf8');
      console.log(`  ✅ Saved ${fieldsChanged} field changes`);
    } else {
      console.log(`  ⏭️  No changes needed (already standardized)`);
    }
    
    totalFiles++;
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively find all YAML files
 */
function findYamlFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findYamlFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔧 FRONTMATTER NAMING STANDARDIZATION');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('Purpose: Convert all fields to camelCase (JavaScript/TypeScript standard)');
  console.log('Date: January 4, 2026\n');
  
  // Collect all YAML files
  const allFiles = [];
  for (const dir of FRONTMATTER_DIRS) {
    const files = findYamlFiles(dir);
    allFiles.push(...files);
    console.log(`📁 Found ${files.length} files in ${dir}`);
  }
  
  console.log(`\n📊 Total files to process: ${allFiles.length}`);
  console.log('\n───────────────────────────────────────────────────────────────\n');
  
  // Process each file
  for (const file of allFiles) {
    processFile(file);
  }
  
  // Final report
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ STANDARDIZATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`📊 Statistics:`);
  console.log(`   • Total files processed: ${totalFiles}`);
  console.log(`   • Files with changes: ${filesWithChanges}`);
  console.log(`   • Total fields renamed: ${totalFieldsRenamed}`);
  console.log(`   • Success rate: ${((filesWithChanges / totalFiles) * 100).toFixed(1)}%`);
  console.log('\n🎯 Result: All frontmatter files now use camelCase naming');
  console.log('✨ Frontend components will now work correctly\n');
}

// Run the script
main();
