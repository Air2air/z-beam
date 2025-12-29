#!/usr/bin/env node
/**
 * Rename nested 'title:' fields to 'section_title:' in frontmatter YAML files
 * Only renames non-root level title fields (indented)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTMATTER_DIR = path.join(__dirname, '..', 'frontmatter');

function getAllYamlFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllYamlFiles(fullPath));
    } else if (entry.name.endsWith('.yaml')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function renameNestedTitles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  
  // Track if we're in author section
  let inAuthorSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect author section (starts with "author:" or "authorInfo:")
    if (/^(author|authorInfo):/.test(line)) {
      inAuthorSection = true;
    } else if (/^\S/.test(line) && inAuthorSection) {
      // Root level key found, we've left author section
      inAuthorSection = false;
    }
    
    // Match indented 'title:' fields (at least 2 spaces before 'title:')
    // Ignore root-level 'title:' (no indentation)
    // Ignore author academic title
    if (/^\s{2,}title:/.test(line) && !inAuthorSection) {
      // Replace '  title:' with '  section_title:' (preserving indentation)
      lines[i] = line.replace(/^(\s+)title:/, '$1section_title:');
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    return true;
  }
  
  return false;
}

function fixAuthorTitles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  
  // Track if we're in author section
  let inAuthorSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect author section
    if (/^(author|authorInfo):/.test(line)) {
      inAuthorSection = true;
    } else if (/^\S/.test(line) && inAuthorSection) {
      inAuthorSection = false;
    }
    
    // Fix author academic titles: section_title → author_title
    if (/^\s{2,}section_title:\s*(MA|Ph\.D\.|B\.Sc\.|M\.Sc\.)/.test(line) && inAuthorSection) {
      lines[i] = line.replace(/^(\s+)section_title:/, '$1author_title:');
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔍 Finding all frontmatter YAML files...');
  const yamlFiles = getAllYamlFiles(FRONTMATTER_DIR);
  console.log(`📄 Found ${yamlFiles.length} YAML files`);
  
  console.log('\n� Fixing author academic titles (section_title → title)...');
  let authorTitlesFixed = 0;
  
  for (const file of yamlFiles) {
    const wasFixed = fixAuthorTitles(file);
    if (wasFixed) {
      authorTitlesFixed++;
    }
  }
  
  console.log(`✅ Fixed ${authorTitlesFixed} files with author academic titles`);
  
  console.log('\n🔍 Verification:');
  const remainingAuthorSectionTitles = execSync(
    `grep -rE "section_title: (MA|Ph\\.D\\.|B\\.Sc\\.|M\\.Sc\\.)" frontmatter/ --include="*.yaml" | wc -l`,
    { encoding: 'utf8', cwd: path.join(__dirname, '..') }
  ).trim();
  
  console.log(`   Remaining author section_title fields: ${remainingAuthorSectionTitles}`);
  
  if (parseInt(remainingAuthorSectionTitles) === 0) {
    console.log('\n✅ SUCCESS: All author academic titles corrected!');
  } else {
    console.log('\n⚠️  WARNING: Some author academic titles still incorrect');
  }
}

main();
