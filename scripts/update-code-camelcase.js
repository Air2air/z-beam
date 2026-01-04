#!/usr/bin/env node
/**
 * Update all code references from snake_case to camelCase with backward compatibility
 * 
 * Updates code to check for both fullPath and full_path (prefer fullPath)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CODE_UPDATES = [
  {
    // Pattern: metadata.full_path or article.full_path → support both
    pattern: /(\w+)\.full_path(?!\?)/g,
    replacement: '$1.fullPath || $1.full_path',
    description: 'Update object.full_path → object.fullPath || object.full_path'
  },
  {
    // Pattern: meta_description → metaDescription with fallback
    pattern: /(\w+)\.meta_description(?!\?)/g,
    replacement: '$1.metaDescription || $1.meta_description',
    description: 'Update object.meta_description → object.metaDescription || object.meta_description'
  },
  {
    // Pattern: page_title → pageTitle with fallback
    pattern: /(\w+)\.page_title(?!\?)/g,
    replacement: '$1.pageTitle || $1.page_title',
    description: 'Update object.page_title → object.pageTitle || object.page_title'
  },
  {
    // Pattern: page_description → pageDescription with fallback
    pattern: /(\w+)\.page_description(?!\?)/g,
    replacement: '$1.pageDescription || $1.page_description',
    description: 'Update object.page_description → object.pageDescription || object.page_description'
  },
  {
    // Pattern: content_type → contentType with fallback
    pattern: /(\w+)\.content_type(?!\?)/g,
    replacement: '$1.contentType || $1.content_type',
    description: 'Update object.content_type → object.contentType || object.content_type'
  },
  {
    // Pattern: schema_version → schemaVersion with fallback
    pattern: /(\w+)\.schema_version(?!\?)/g,
    replacement: '$1.schemaVersion || $1.schema_version',
    description: 'Update object.schema_version → object.schemaVersion || object.schema_version'
  }
];

function updateCodeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];
    
    CODE_UPDATES.forEach(({ pattern, replacement, description }) => {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      
      if (content !== originalContent) {
        modified = true;
        changes.push(description);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { modified: true, file: filePath, changes };
    }
    
    return { modified: false, file: filePath };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { modified: false, file: filePath, error: error.message };
  }
}

function main() {
  console.log('🔄 Updating code references to use camelCase with backward compatibility...\n');
  
  // Find all TypeScript/TSX files in app directory
  const codeFiles = glob.sync('app/**/*.{ts,tsx}', { cwd: process.cwd() });
  
  console.log(`Found ${codeFiles.length} code files\n`);
  
  let modifiedCount = 0;
  let errorCount = 0;
  
  codeFiles.forEach((file, index) => {
    const result = updateCodeFile(file);
    
    if (result.error) {
      console.error(`❌ [${index + 1}/${codeFiles.length}] ${file} - ERROR: ${result.error}`);
      errorCount++;
    } else if (result.modified) {
      if (modifiedCount < 10) {
        console.log(`✅ [${index + 1}/${codeFiles.length}] ${file}`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      } else if (modifiedCount === 10) {
        console.log(`... (continuing silently)`);
      }
      modifiedCount++;
    }
  });
  
  console.log(`\n✨ Code update complete!`);
  console.log(`   Modified: ${modifiedCount} files`);
  console.log(`   Unchanged: ${codeFiles.length - modifiedCount - errorCount} files`);
  console.log(`   Errors: ${errorCount} files`);
  
  console.log(`\n📝 All code now supports both camelCase (primary) and snake_case (fallback)`);
}

main();
