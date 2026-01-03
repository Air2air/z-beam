#!/usr/bin/env node
/**
 * Normalize Settings frontmatter to match other domains
 * Adds 'description' field using value from 'meta_description'
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const settingsDir = path.join(__dirname, '../frontmatter/settings');

function normalizeSettingsFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    // Skip if description already exists
    if (data.description) {
      console.log(`✓ ${path.basename(filePath)} - already has description field`);
      return false;
    }
    
    // Skip if no meta_description to copy from
    if (!data.meta_description) {
      console.log(`⚠ ${path.basename(filePath)} - no meta_description to copy`);
      return false;
    }
    
    // Add description field after meta_description
    const lines = content.split('\n');
    const metaDescIndex = lines.findIndex(line => line.startsWith('meta_description:'));
    
    if (metaDescIndex === -1) {
      console.log(`⚠ ${path.basename(filePath)} - could not find meta_description line`);
      return false;
    }
    
    // Extract the meta_description value properly
    const metaDescLine = lines[metaDescIndex];
    const metaDescValue = metaDescLine.substring('meta_description:'.length).trim();
    
    // Insert description field right after meta_description with the same value
    lines.splice(metaDescIndex + 1, 0, `description: ${metaDescValue}`);
    
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`✅ ${path.basename(filePath)} - added description field`);
    return true;
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} - error: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔧 Normalizing Settings frontmatter files...\n');
  
  const files = fs.readdirSync(settingsDir)
    .filter(file => file.endsWith('.yaml'))
    .map(file => path.join(settingsDir, file));
  
  console.log(`Found ${files.length} settings files\n`);
  
  let updated = 0;
  let skipped = 0;
  
  files.forEach(file => {
    if (normalizeSettingsFile(file)) {
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
