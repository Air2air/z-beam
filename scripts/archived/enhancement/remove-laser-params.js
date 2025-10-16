#!/usr/bin/env node

/**
 * Remove Laser Parameters from Caption Components
 * Removes the laser_parameters section from caption files for cleaner content
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CAPTION_DIR = './content/components/caption';

function removeLaserParameters(captionFilePath) {
  try {
    let content = fs.readFileSync(captionFilePath, 'utf8');
    let originalContent = content;
    
    // Try to load the whole content first
    try {
      const data = yaml.load(content);
      
      if (data && data.laser_parameters) {
        // Remove the laser_parameters section
        delete data.laser_parameters;
        
        // Convert back to YAML
        const cleanedContent = yaml.dump(data, {
          indent: 2,
          lineWidth: 120,
          noRefs: true,
          quotingType: '"',
          forceQuotes: false
        });
        
        // Write the cleaned content back
        fs.writeFileSync(captionFilePath, cleanedContent);
        console.log(`✅ Removed laser_parameters from ${path.basename(captionFilePath)}`);
        return true;
      } else {
        console.log(`⚠️  No laser_parameters found in ${path.basename(captionFilePath)}`);
        return false;
      }
    } catch (yamlError) {
      console.log(`📋 Multi-document YAML detected in ${path.basename(captionFilePath)}, trying document splitting...`);
      
      // Handle potential multiple document separators by taking the first document
      if (content.includes('---')) {
        const parts = content.split('---');
        // Find the first non-empty section that contains actual YAML data
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim();
          if (part && !part.startsWith('#') && part.includes(':')) {
            content = part;
            break;
          }
        }
      }
      
      const data = yaml.load(content);
      
      if (!data || !data.laser_parameters) {
        console.log(`⚠️  No laser_parameters found after document splitting in ${path.basename(captionFilePath)}`);
        return false;
      }

      // Remove the laser_parameters section
      delete data.laser_parameters;
      
      // Convert back to YAML
      const cleanedContent = yaml.dump(data, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false
      });
      
      // Write the cleaned content back
      fs.writeFileSync(captionFilePath, cleanedContent);
      console.log(`✅ Removed laser_parameters from ${path.basename(captionFilePath)} (multi-doc)`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(captionFilePath)}:`, error.message);
    return false;
  }
}

function processAllCaptions() {
  console.log('🧹 Removing laser_parameters from caption components...\n');
  
  const captionFiles = fs.readdirSync(CAPTION_DIR)
    .filter(file => file.endsWith('.yaml'))
    .sort();

  let processed = 0;
  let cleaned = 0;

  for (const file of captionFiles) {
    const captionPath = path.join(CAPTION_DIR, file);
    console.log(`📝 Processing: ${file}`);
    
    if (removeLaserParameters(captionPath)) {
      cleaned++;
    }
    processed++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   📁 Caption files processed: ${processed}`);
  console.log(`   🧹 Files cleaned: ${cleaned}`);
  console.log(`   📂 Caption directory: ${CAPTION_DIR}`);
  
  if (cleaned > 0) {
    console.log(`\n🎉 Successfully removed laser_parameters from caption components!`);
    console.log(`   Machine settings data has been cleaned from caption files.`);
  }
}

// Run the cleanup
processAllCaptions();
