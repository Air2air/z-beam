/**
 * Revert Section Property Names
 * Purpose: Convert title/description back to sectionTitle/sectionDescription in _section objects
 * This fixes the error where properties were incorrectly converted
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIR = path.join(__dirname, '..', 'frontmatter');

function revertSectionNames(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  // Revert property names within _section objects
  if (obj._section && typeof obj._section === 'object') {
    if (obj._section.title && !obj._section.sectionTitle) {
      obj._section.sectionTitle = obj._section.title;
      delete obj._section.title;
      console.log('✅ Reverted title → sectionTitle');
    }
    
    if (obj._section.description && !obj._section.sectionDescription) {
      obj._section.sectionDescription = obj._section.description;
      delete obj._section.description;
      console.log('✅ Reverted description → sectionDescription');
    }
  }

  // Recursively process all nested objects and arrays
  if (Array.isArray(obj)) {
    return obj.map(item => revertSectionNames(item));
  } else if (typeof obj === 'object') {
    const reverted = {};
    for (const [key, value] of Object.entries(obj)) {
      reverted[key] = revertSectionNames(value);
    }
    return reverted;
  }

  return obj;
}

function revertFile(filePath) {
  try {
    console.log(`\n🔍 Processing: ${path.basename(filePath)}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    const originalData = JSON.stringify(data);
    
    // Revert section property names
    const revertedData = revertSectionNames(data);
    
    // Check if any changes were made
    const newData = JSON.stringify(revertedData);
    if (originalData !== newData) {
      // Write the reverted data back
      const yamlOutput = yaml.dump(revertedData, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
      
      fs.writeFileSync(filePath, yamlOutput, 'utf8');
      console.log('✅ Reverted: Section property names fixed');
    } else {
      console.log('⏭️  No changes needed');
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
  }
}

function revertAllFiles() {
  console.log('🔧 REVERTING SECTION PROPERTY NAMES');
  console.log('Converting title/description back to sectionTitle/sectionDescription\n');

  const domains = ['materials', 'contaminants', 'compounds', 'settings'];
  let totalFiles = 0;
  let processedFiles = 0;

  domains.forEach(domain => {
    const domainPath = path.join(FRONTMATTER_DIR, domain);
    
    if (!fs.existsSync(domainPath)) {
      console.log(`⚠️  Domain path not found: ${domain}`);
      return;
    }

    const files = fs.readdirSync(domainPath)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => path.join(domainPath, file));

    files.forEach(filePath => {
      totalFiles++;
      revertFile(filePath);
      processedFiles++;
    });
  });

  console.log(`\n📊 Summary:`);
  console.log(`  📁 Processed: ${processedFiles} files`);
  console.log(`  📁 Total found: ${totalFiles} files`);
  console.log(`\n🎉 Section property name reversion complete!`);
  console.log(`📝 Changes: Converted title/description → sectionTitle/sectionDescription`);
}

// Run the reversion
revertAllFiles();