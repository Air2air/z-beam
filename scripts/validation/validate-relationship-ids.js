#!/usr/bin/env node

/**
 * Orphaned ID Validator
 * 
 * Scans frontmatter files to find orphaned entity IDs in relationships
 * (IDs that reference entities that don't exist)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Content type directories
const CONTENT_DIRS = {
  materials: 'frontmatter/materials',
  compounds: 'frontmatter/compounds',
  contaminants: 'frontmatter/contaminants',
  settings: 'frontmatter/settings',
};

// Build entity ID index
const entityIndex = new Set();

/**
 * Build index of all entity IDs
 */
function buildEntityIndex() {
  console.log('Building entity index...');
  
  for (const [contentType, dir] of Object.entries(CONTENT_DIRS)) {
    const dirPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory not found: ${dir}`);
      continue;
    }
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.yaml'));
    
    for (const file of files) {
      const entityId = file.replace('.yaml', '');
      entityIndex.add(entityId);
    }
    
    console.log(`  ${contentType}: ${files.length} entities`);
  }
  
  console.log(`\nTotal entities indexed: ${entityIndex.size}\n`);
}

/**
 * Check if entity exists
 */
function entityExists(entityId) {
  return entityIndex.has(entityId);
}

/**
 * Extract all entity IDs from relationship items
 */
function extractRelationshipIds(relationships) {
  const ids = [];
  
  if (!relationships || typeof relationships !== 'object') {
    return ids;
  }
  
  for (const [key, value] of Object.entries(relationships)) {
    // Skip null values and _section metadata
    if (!value || key === '_section') continue;
    
    // Handle new structure (with items array)
    if (value.items && Array.isArray(value.items)) {
      for (const item of value.items) {
        if (item && item.id) {
          ids.push({ key, id: item.id });
        }
      }
    }
    // Handle old structure (flat array)
    else if (Array.isArray(value)) {
      for (const item of value) {
        if (item && item.id) {
          ids.push({ key, id: item.id });
        }
      }
    }
  }
  
  return ids;
}

/**
 * Validate single frontmatter file
 */
function validateFile(filePath, contentType) {
  const fileName = path.basename(filePath);
  
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const frontmatter = yaml.load(fileContents);
    
    if (!frontmatter || !frontmatter.relationships) {
      return { file: fileName, orphaned: [], errors: [] };
    }
    
    const relationshipIds = extractRelationshipIds(frontmatter.relationships);
    const orphaned = [];
    
    for (const { key, id } of relationshipIds) {
      if (!entityExists(id)) {
        orphaned.push({ key, id });
      }
    }
    
    return { file: fileName, orphaned, errors: [] };
  } catch (error) {
    return {
      file: fileName,
      orphaned: [],
      errors: [`Parse error: ${error.message}`]
    };
  }
}

/**
 * Validate all files in directory
 */
function validateDirectory(dir, contentType) {
  const dirPath = path.join(process.cwd(), dir);
  
  if (!fs.existsSync(dirPath)) {
    return { contentType, results: [], summary: { total: 0, withOrphans: 0, totalOrphans: 0 } };
  }
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.yaml'));
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = validateFile(filePath, contentType);
    
    if (result.orphaned.length > 0 || result.errors.length > 0) {
      results.push(result);
    }
  }
  
  const summary = {
    total: files.length,
    withOrphans: results.filter(r => r.orphaned.length > 0).length,
    totalOrphans: results.reduce((sum, r) => sum + r.orphaned.length, 0),
    withErrors: results.filter(r => r.errors.length > 0).length,
  };
  
  return { contentType, results, summary };
}

/**
 * Main validation
 */
function main() {
  console.log('=' .repeat(80));
  console.log('ORPHANED ID VALIDATOR');
  console.log('=' .repeat(80));
  console.log();
  
  // Build entity index
  buildEntityIndex();
  
  // Validate all content types
  const allResults = [];
  let totalOrphans = 0;
  let totalErrors = 0;
  
  for (const [contentType, dir] of Object.entries(CONTENT_DIRS)) {
    console.log(`Validating ${contentType}...`);
    const { results, summary } = validateDirectory(dir, contentType);
    allResults.push({ contentType, results, summary });
    totalOrphans += summary.totalOrphans;
    totalErrors += summary.withErrors;
    
    if (results.length > 0) {
      console.log(`  ⚠️  Found ${summary.withOrphans} files with orphaned IDs`);
      console.log(`  ⚠️  Total orphaned IDs: ${summary.totalOrphans}`);
      if (summary.withErrors > 0) {
        console.log(`  ❌ Files with errors: ${summary.withErrors}`);
      }
    } else {
      console.log(`  ✅ No orphaned IDs found`);
    }
    console.log();
  }
  
  // Print detailed results
  if (totalOrphans > 0 || totalErrors > 0) {
    console.log('=' .repeat(80));
    console.log('DETAILED RESULTS');
    console.log('=' .repeat(80));
    console.log();
    
    for (const { contentType, results } of allResults) {
      if (results.length === 0) continue;
      
      console.log(`\n${contentType.toUpperCase()}:`);
      console.log('-'.repeat(80));
      
      for (const { file, orphaned, errors } of results) {
        console.log(`\n  File: ${file}`);
        
        if (errors.length > 0) {
          console.log(`    ❌ Errors:`);
          for (const error of errors) {
            console.log(`       - ${error}`);
          }
        }
        
        if (orphaned.length > 0) {
          console.log(`    ⚠️  Orphaned IDs:`);
          for (const { key, id } of orphaned) {
            console.log(`       - ${key}: ${id}`);
          }
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total orphaned IDs: ${totalOrphans}`);
    console.log(`Files with errors: ${totalErrors}`);
    console.log();
    
    // Exit with error code
    process.exit(1);
  } else {
    console.log('✅ All relationship IDs are valid!');
    console.log();
    process.exit(0);
  }
}

// Run validation
if (require.main === module) {
  main();
}

module.exports = { buildEntityIndex, entityExists, validateFile, validateDirectory };
