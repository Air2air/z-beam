#!/usr/bin/env node

/**
 * Normalize frontmatter section metadata from "Section:" to "_section:"
 * 
 * PROBLEM: Components expect _section (with underscore) but frontmatter has Section (no underscore)
 * SOLUTION: Convert all "Section:" to "_section:" in all frontmatter YAML files
 * 
 * Usage: node normalize_section_to_underscore.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIRS = [
  'frontmatter/materials',
  'frontmatter/contaminants',
  'frontmatter/compounds',
  'frontmatter/settings'
];

let filesProcessed = 0;
let filesModified = 0;
let errorsEncountered = 0;

/**
 * Recursively convert "Section" keys to "_section" keys
 */
function convertSectionKeys(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertSectionKeys);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'Section') {
      result['_section'] = convertSectionKeys(value);
    } else {
      result[key] = convertSectionKeys(value);
    }
  }
  return result;
}

/**
 * Process a single YAML file
 */
function processFile(filePath) {
  try {
    filesProcessed++;
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse YAML
    const data = yaml.load(content);
    
    if (!data) {
      console.log(`⚠️  Skipping empty file: ${filePath}`);
      return;
    }

    // Convert Section keys to _section
    const converted = convertSectionKeys(data);
    
    // Check if anything changed
    const newContent = yaml.dump(converted, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    
    if (content !== newContent) {
      // Write back to file
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesModified++;
      console.log(`✅ Converted: ${path.basename(filePath)}`);
    }
    
  } catch (error) {
    errorsEncountered++;
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Process all YAML files in a directory
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      processFile(filePath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Starting Section → _section conversion...\n');
  
  for (const dir of FRONTMATTER_DIRS) {
    console.log(`\n📁 Processing directory: ${dir}`);
    processDirectory(dir);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ CONVERSION COMPLETE');
  console.log('='.repeat(80));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`Errors: ${errorsEncountered}`);
  console.log('='.repeat(80));
  
  if (filesModified > 0) {
    console.log('\n✅ All Section: keys have been converted to _section: keys');
    console.log('Components now expect _section (with underscore) consistently');
  } else {
    console.log('\n✨ No files needed conversion - all already using _section');
  }
}

// Run the script
main();
