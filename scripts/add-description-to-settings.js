#!/usr/bin/env node
/**
 * Add description field to Settings frontmatter (using meta_description value)
 * This ensures Settings pages have the same field structure as other domains
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const settingsDir = path.join(__dirname, '../frontmatter/settings');

function addDescriptionField(filePath) {
  try {
    // Read and parse the YAML
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    // Skip if description already exists
    if (data.description) {
      return false;
    }
    
    // Skip if no meta_description to copy from
    if (!data.meta_description) {
      console.log(`⚠ ${path.basename(filePath)} - no meta_description to copy`);
      return false;
    }
    
    // Add description field (same as meta_description)
    data.description = data.meta_description;
    
    // Write back to file with proper YAML formatting
    const newContent = yaml.dump(data, {
      lineWidth: -1, // Don't wrap lines
      noRefs: true,  // Don't use YAML references
      quotingType: "'", // Use single quotes
      forceQuotes: false // Only quote when necessary
    });
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} - error: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔧 Adding description field to Settings frontmatter...\n');
  
  const files = fs.readdirSync(settingsDir)
    .filter(file => file.endsWith('.yaml'))
    .map(file => path.join(settingsDir, file));
  
  console.log(`Found ${files.length} settings files\n`);
  
  let updated = 0;
  let skipped = 0;
  
  files.forEach(file => {
    if (addDescriptionField(file)) {
      updated++;
    } else {
      skipped++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${files.length}`);
}

main();
