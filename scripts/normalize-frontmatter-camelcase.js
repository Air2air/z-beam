#!/usr/bin/env node
/**
 * Normalize all frontmatter YAML files to camelCase
 * 
 * Conversions:
 * - full_path → fullPath
 * - meta_description → metaDescription  
 * - page_title → pageTitle
 * - page_description → pageDescription
 * - date_published → datePublished (already camelCase)
 * - date_modified → dateModified (already camelCase)
 * - content_type → contentType
 * - schema_version → schemaVersion
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const FIELD_CONVERSIONS = {
  'full_path': 'fullPath',
  'meta_description': 'metaDescription',
  'page_title': 'pageTitle',
  'page_description': 'pageDescription',
  'content_type': 'contentType',
  'schema_version': 'schemaVersion',
};

function convertYamlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Convert each snake_case field to camelCase
    Object.entries(FIELD_CONVERSIONS).forEach(([snakeCase, camelCase]) => {
      const regex = new RegExp(`^${snakeCase}:`, 'gm');
      if (regex.test(content)) {
        content = content.replace(regex, `${camelCase}:`);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { modified: true, file: filePath };
    }
    
    return { modified: false, file: filePath };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { modified: false, file: filePath, error: error.message };
  }
}

function main() {
  console.log('🔄 Starting frontmatter normalization to camelCase...\n');
  
  // Find all YAML files in frontmatter directories
  const yamlFiles = glob.sync('frontmatter/**/*.yaml', { cwd: process.cwd() });
  
  console.log(`Found ${yamlFiles.length} YAML files\n`);
  
  let modifiedCount = 0;
  let errorCount = 0;
  
  yamlFiles.forEach((file, index) => {
    const result = convertYamlFile(file);
    
    if (result.error) {
      console.error(`❌ [${index + 1}/${yamlFiles.length}] ${file} - ERROR: ${result.error}`);
      errorCount++;
    } else if (result.modified) {
      if (modifiedCount < 10) {
        console.log(`✅ [${index + 1}/${yamlFiles.length}] ${file}`);
      } else if (modifiedCount === 10) {
        console.log(`... (showing first 10, continuing silently)`);
      }
      modifiedCount++;
    }
  });
  
  console.log(`\n✨ Normalization complete!`);
  console.log(`   Modified: ${modifiedCount} files`);
  console.log(`   Unchanged: ${yamlFiles.length - modifiedCount - errorCount} files`);
  console.log(`   Errors: ${errorCount} files`);
  
  if (modifiedCount > 0) {
    console.log(`\n📝 Field conversions applied:`);
    Object.entries(FIELD_CONVERSIONS).forEach(([snake, camel]) => {
      console.log(`   ${snake} → ${camel}`);
    });
  }
}

main();
