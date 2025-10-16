const fs = require('fs');
const path = require('path');

function removeLaserParameters(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the laser_parameters section and remove it
    const laserParamsMatch = content.match(/^(laser_parameters:[\s\S]*?)(?=^[a-zA-Z_]|\n$)/m);
    
    if (laserParamsMatch) {
      // Remove the laser_parameters section
      const updatedContent = content.replace(/^laser_parameters:[\s\S]*$/m, '').trim() + '\n';
      
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Removed laser_parameters from ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`⚠️ No laser_parameters found in ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Test with one file first
const testFile = './content/components/caption/steel-laser-cleaning.yaml';
console.log('Testing with:', testFile);
removeLaserParameters(testFile);
