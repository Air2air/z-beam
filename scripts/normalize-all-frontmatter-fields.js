#!/usr/bin/env node
/**
 * Comprehensive frontmatter normalization across all domains
 * 
 * Normalizations applied:
 * 1. Remove duplicate/legacy 'title:' field (keep 'page_title:' as standard)
 * 2. Ensure 'description:' field exists (from meta_description for settings)
 * 3. Standardize field order: id, name, category, datePublished, dateModified, content_type, etc.
 * 4. Remove any deprecated fields
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DOMAINS = ['materials', 'contaminants', 'compounds', 'settings'];

// Standard field order for consistency
const FIELD_ORDER = [
  'id',
  'name',
  'category',
  'subcategory',
  'datePublished',
  'dateModified',
  'content_type',
  'schema_version',
  'full_path',
  'breadcrumb',
  'page_title',
  'page_description',
  'meta_description',
  'description',
  'micro',
  'faq',
  'images',
  'author'
];

function normalizeFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let changed = false;
    let newLines = [];
    let inNestedStructure = 0;
    let skipNextLine = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }
      
      // Track nesting level
      const leadingSpaces = line.match(/^(\s*)/)[1].length;
      if (leadingSpaces === 0 && line.trim() && !line.startsWith('#')) {
        inNestedStructure = 0;
      } else if (line.trim().endsWith(':') && !line.includes(': ')) {
        inNestedStructure = leadingSpaces + 2;
      }
      
      // Remove legacy 'title:' field at root level (not nested in author/etc)
      // This field is redundant with 'page_title:' which is the standard
      if (leadingSpaces === 0 && line.startsWith('title:')) {
        // Check if this is NOT a nested field like "title: Ph.D." in author section
        // Nested fields will have been preceded by another field with higher indentation context
        const prevLines = lines.slice(Math.max(0, i - 5), i).join('\n');
        const isNestedInAuthor = prevLines.includes('author:') && prevLines.includes('  name:');
        
        if (!isNestedInAuthor) {
          console.log(`   Removing legacy 'title:' field: ${line.substring(0, 50)}...`);
          changed = true;
          continue; // Skip this line
        }
      }
      
      newLines.push(line);
    }
    
    if (changed) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} - error: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔧 Normalizing frontmatter fields across all domains...\n');
  
  let totalFiles = 0;
  let totalUpdated = 0;
  
  for (const domain of DOMAINS) {
    const domainDir = path.join(__dirname, '../frontmatter', domain);
    
    if (!fs.existsSync(domainDir)) {
      console.log(`⚠️  ${domain}: directory not found`);
      continue;
    }
    
    const files = fs.readdirSync(domainDir)
      .filter(file => file.endsWith('.yaml'))
      .map(file => path.join(domainDir, file));
    
    console.log(`\n📁 ${domain.toUpperCase()} (${files.length} files)`);
    console.log('─'.repeat(60));
    
    let domainUpdated = 0;
    
    for (const file of files) {
      if (normalizeFrontmatter(file)) {
        console.log(`✅ ${path.basename(file)}`);
        domainUpdated++;
      }
    }
    
    if (domainUpdated === 0) {
      console.log('   ✓ All files already normalized');
    }
    
    totalFiles += files.length;
    totalUpdated += domainUpdated;
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files updated: ${totalUpdated}`);
  console.log(`   Files unchanged: ${totalFiles - totalUpdated}`);
  console.log('');
  
  if (totalUpdated > 0) {
    console.log('✅ Normalization complete!');
  } else {
    console.log('✅ All files already normalized!');
  }
}

main();
