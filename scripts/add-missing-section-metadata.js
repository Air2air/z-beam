#!/usr/bin/env node

/**
 * Add missing _section metadata to material frontmatter files
 * 
 * This script scans all material frontmatter files and adds the required
 * _section metadata to properties.materialCharacteristics if it's missing.
 * 
 * Required by: MaterialCharacteristics component (TIER 1 policy)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIR = path.join(__dirname, '../frontmatter/materials');

const SECTION_METADATA = {
  icon: 'atom',
  order: 1,
  variant: 'default',
  group: 'properties',
  domain: 'materials',
  schemaDescription: 'Core physical and chemical properties of the material',
  notes: 'Foundational material data for laser cleaning applications',
  sectionTitle: 'Material Characteristics',
  sectionDescription: 'Core physical and chemical properties that define the material\'s behavior under laser cleaning'
};

function addSectionMetadata() {
  const files = fs.readdirSync(FRONTMATTER_DIR)
    .filter(f => f.endsWith('.yaml'));

  let processedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  console.log(`\n🔍 Scanning ${files.length} material files...\n`);

  for (const file of files) {
    const filePath = path.join(FRONTMATTER_DIR, file);
    processedCount++;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      // Check if material has properties.materialCharacteristics
      if (!data?.properties?.materialCharacteristics) {
        skippedCount++;
        continue;
      }

      // Check if _section already exists
      if (data.properties.materialCharacteristics._section) {
        skippedCount++;
        continue;
      }

      // Add _section metadata
      data.properties.materialCharacteristics._section = SECTION_METADATA;

      // Write back to file
      const updatedYaml = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });

      fs.writeFileSync(filePath, updatedYaml, 'utf8');
      updatedCount++;
      console.log(`✅ Updated: ${file}`);

    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total files: ${processedCount}`);
  console.log(`   ✅ Updated: ${updatedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log();
}

// Run the script
addSectionMetadata();
