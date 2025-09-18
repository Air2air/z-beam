#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix image paths in YAML files
function fixImagePaths() {
  console.log('Starting image path fixes...');
  
  // Find all YAML files in the caption directory
  const yamlFiles = glob.sync('content/components/caption/**/*.yaml');
  
  let filesFixed = 0;
  let totalReplacements = 0;
  
  yamlFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Replace the pattern: from "*-cleaning-analysis.jpg" to "*-laser-cleaning-micro.jpg"
      // This handles various material names including ones with spaces, dashes, etc.
      const replacements = content.match(/\/images\/[^"]*-cleaning-analysis\.jpg/g);
      
      if (replacements && replacements.length > 0) {
        replacements.forEach(oldPath => {
          // Extract the material name part before "-cleaning-analysis.jpg"
          const materialMatch = oldPath.match(/\/images\/(.+)-cleaning-analysis\.jpg/);
          if (materialMatch) {
            const materialName = materialMatch[1];
            const newPath = `/images/${materialName}-laser-cleaning-micro.jpg`;
            content = content.replace(oldPath, newPath);
            totalReplacements++;
            console.log(`  ${path.basename(filePath)}: ${oldPath} → ${newPath}`);
          }
        });
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
        filesFixed++;
      }
      
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\nCompleted: Fixed ${totalReplacements} image paths in ${filesFixed} files`);
}

// Run the fix
fixImagePaths();
