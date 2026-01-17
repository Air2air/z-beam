#!/usr/bin/env node

/**
 * Frontmatter Section Metadata Normalization Script
 * Purpose: Fix redundant sectionMetadata wrappers and inconsistent _section nesting
 * Target: BaseSection component prop validation errors
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIR = path.join(__dirname, '..', 'frontmatter');

function normalizeSectionMetadata(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  // Process _section objects to flatten sectionMetadata
  if (obj._section && obj._section.sectionMetadata) {
    const { sectionMetadata, ...otherSectionProps } = obj._section;
    
    // Flatten sectionMetadata properties into _section
    obj._section = {
      ...otherSectionProps,
      ...sectionMetadata
    };
    
    console.log(`✅ Flattened sectionMetadata into _section`);
  }

  // Recursively process all nested objects and arrays
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeSectionMetadata(item));
  } else if (typeof obj === 'object') {
    const normalized = {};
    for (const [key, value] of Object.entries(obj)) {
      normalized[key] = normalizeSectionMetadata(value);
    }
    return normalized;
  }

  return obj;
}

function normalizeFile(filePath) {
  try {
    console.log(`\n🔍 Processing: ${path.basename(filePath)}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    if (!data) {
      console.log(`⚠️  Skipped: Empty or invalid YAML`);
      return false;
    }

    const originalData = JSON.stringify(data);
    const normalizedData = normalizeSectionMetadata(data);
    
    // Check if changes were made
    if (JSON.stringify(normalizedData) === originalData) {
      console.log(`✅ No changes needed`);
      return false;
    }

    // Write normalized data back to file
    const normalizedYaml = yaml.dump(normalizedData, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      quotingType: '"'
    });

    fs.writeFileSync(filePath, normalizedYaml);
    console.log(`✅ Normalized: Flattened section metadata`);
    return true;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findYamlFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.endsWith('.yaml') || entry.endsWith('.yml')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return files;
}

async function main() {
  console.log('🚀 Starting Frontmatter Section Metadata Normalization...');
  console.log(`📁 Scanning: ${FRONTMATTER_DIR}`);

  if (!fs.existsSync(FRONTMATTER_DIR)) {
    console.error(`❌ Frontmatter directory not found: ${FRONTMATTER_DIR}`);
    process.exit(1);
  }

  const yamlFiles = findYamlFiles(FRONTMATTER_DIR);
  console.log(`📋 Found ${yamlFiles.length} YAML files`);

  let processedCount = 0;
  let normalizedCount = 0;

  // Process aluminum file first (our test case)
  const aluminumFile = yamlFiles.find(f => f.includes('aluminum-laser-cleaning'));
  if (aluminumFile) {
    console.log(`\n🎯 Processing aluminum test file first...`);
    if (normalizeFile(aluminumFile)) {
      normalizedCount++;
    }
    processedCount++;
  }

  // Process remaining files
  for (const filePath of yamlFiles) {
    if (filePath === aluminumFile) continue; // Skip already processed
    
    processedCount++;
    if (normalizeFile(filePath)) {
      normalizedCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  📁 Processed: ${processedCount} files`);
  console.log(`  ✅ Normalized: ${normalizedCount} files`);
  console.log(`  ⏭️  Unchanged: ${processedCount - normalizedCount} files`);

  if (normalizedCount > 0) {
    console.log(`\n🎉 Section metadata normalization complete!`);
    console.log(`📝 Changes: Flattened redundant sectionMetadata wrappers`);
  } else {
    console.log(`\n✨ All files already properly normalized`);
  }
}

// Handle both direct execution and module export
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { normalizeSectionMetadata, normalizeFile };