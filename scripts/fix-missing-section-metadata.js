#!/usr/bin/env node

/**
 * Fix Missing _section Metadata in Material Frontmatter Files
 * 
 * Problem: 150 materials missing _section metadata in laserMaterialInteraction properties section
 * Solution: Add complete _section block with required fields to all affected files
 * 
 * This is a STRUCTURAL fix (no AI/prompt pipeline needed):
 * - Adds standardized YAML metadata blocks
 * - Uses deterministic values (icon: "zap", order: 2, etc.)
 * - Preserves all existing content
 * 
 * Usage: node scripts/fix-missing-section-metadata.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const FRONTMATTER_DIR = path.join(process.cwd(), 'frontmatter', 'materials');
const DRY_RUN = process.argv.includes('--dry-run');

// Template for missing _section metadata
const LASER_MATERIAL_INTERACTION_SECTION = {
  icon: 'zap',
  order: 2,
  variant: 'default',
  group: 'properties',
  domain: 'materials',
  schemaDescription: 'Thermal and optical properties affecting laser-material interaction',
  notes: 'Laser interaction parameters for optimal cleaning',
  sectionTitle: 'Laser-Material Interaction',
  sectionDescription: 'Thermal and optical properties that govern how the material responds to laser energy during cleaning'
};

/**
 * Check if a file needs fixing
 */
function needsFix(frontmatter) {
  if (!frontmatter.properties?.laserMaterialInteraction) {
    return false; // Section doesn't exist
  }
  
  if (frontmatter.properties.laserMaterialInteraction._section) {
    return false; // Already has _section
  }
  
  return true; // Needs fix
}

/**
 * Fix a YAML file by adding missing _section metadata
 * 
 * Strategy: Parse YAML, modify object, write back
 * This preserves comments and formatting as much as possible
 */
function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = yaml.load(content);
  
  if (!needsFix(frontmatter)) {
    return { fixed: false, reason: 'No fix needed' };
  }
  
  // Add _section metadata to laserMaterialInteraction
  frontmatter.properties.laserMaterialInteraction._section = LASER_MATERIAL_INTERACTION_SECTION;
  
  if (!DRY_RUN) {
    // Write back to file with proper YAML formatting
    const newContent = yaml.dump(frontmatter, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    });
    
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
  
  return { fixed: true, reason: 'Added _section metadata' };
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Fix Missing _section Metadata');
  console.log('=================================\n');
  
  if (DRY_RUN) {
    console.log('🏃 DRY RUN MODE - No files will be modified\n');
  }
  
  if (!fs.existsSync(FRONTMATTER_DIR)) {
    console.error(`❌ Error: Materials directory not found: ${FRONTMATTER_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(FRONTMATTER_DIR).filter(f => f.endsWith('.yaml'));
  console.log(`📁 Found ${files.length} material files\n`);
  
  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const fixedFiles = [];
  const errors = [];
  
  for (const file of files) {
    const filePath = path.join(FRONTMATTER_DIR, file);
    
    try {
      const result = fixFile(filePath);
      
      if (result.fixed) {
        fixedCount++;
        fixedFiles.push(file);
        console.log(`✅ ${file} - ${result.reason}`);
      } else {
        skippedCount++;
        if (!DRY_RUN) {
          console.log(`⏭️  ${file} - ${result.reason}`);
        }
      }
    } catch (error) {
      errorCount++;
      errors.push({ file, error: error.message });
      console.error(`❌ ${file} - ERROR: ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n=================================');
  console.log('📊 SUMMARY');
  console.log('=================================');
  console.log(`Total files processed: ${files.length}`);
  console.log(`✅ Fixed: ${fixedCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (DRY_RUN) {
    console.log('\n💡 This was a DRY RUN. Run without --dry-run to apply fixes.');
  } else {
    console.log('\n✅ Fixes applied successfully!');
    
    if (fixedFiles.length > 0) {
      console.log('\n📝 Fixed files:');
      fixedFiles.slice(0, 10).forEach(f => console.log(`   - ${f}`));
      if (fixedFiles.length > 10) {
        console.log(`   ... and ${fixedFiles.length - 10} more`);
      }
    }
  }
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    errors.forEach(({ file, error }) => console.log(`   - ${file}: ${error}`));
  }
  
  console.log('\n🧪 Run test to verify:');
  console.log('   npm test -- tests/frontmatter/section-structure-validation.test.ts');
  
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run
main();
