#!/usr/bin/env node
/**
 * E2E Property Name Normalization Script
 * Converts all snake_case property names to camelCase in YAML frontmatter files
 * 
 * Changes:
 * - machine_settings → machineSettings
 * - material_properties → materialProperties
 * - laser_properties → laserProperties
 * - safety_data → safetyData
 * - removal_by_material → removalByMaterial
 * - visual_characteristics → visualCharacteristics
 * - regulatory_standards → regulatoryStandards
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PROPERTY_MAP = {
  'machine_settings': 'machineSettings',
  'material_properties': 'materialProperties',
  'laser_properties': 'laserProperties',
  'safety_data': 'safetyData',
  'removal_by_material': 'removalByMaterial',
  'visual_characteristics': 'visualCharacteristics',
  'regulatory_standards': 'regulatoryStandards'
};

function normalizeYamlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [snakeCase, camelCase] of Object.entries(PROPERTY_MAP)) {
    // Match property at start of line (top-level property)
    const regex = new RegExp(`^(\\s*)${snakeCase}:`, 'gm');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${camelCase}:`);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Find all YAML files in frontmatter directory
const yamlFiles = glob.sync('frontmatter/**/*.yaml', { cwd: process.cwd() });

console.log(`🔍 Found ${yamlFiles.length} YAML files`);
console.log('🔄 Normalizing property names...\n');

let changedCount = 0;
let errorCount = 0;

for (const file of yamlFiles) {
  try {
    if (normalizeYamlFile(file)) {
      changedCount++;
      console.log(`✅ ${file}`);
    }
  } catch (error) {
    errorCount++;
    console.error(`❌ ${file}: ${error.message}`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   ✅ Changed: ${changedCount}`);
console.log(`   ⏭️  Unchanged: ${yamlFiles.length - changedCount - errorCount}`);
console.log(`   ❌ Errors: ${errorCount}`);

if (changedCount > 0) {
  console.log(`\n✨ Successfully normalized ${changedCount} files!`);
  process.exit(0);
} else {
  console.log('\n✅ All files already normalized!');
  process.exit(0);
}
