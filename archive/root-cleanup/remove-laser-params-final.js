const fs = require('fs');
const path = require('path');

function removeLaserParameters(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the laser_parameters section and remove it
    const laserParamsMatch = content.match(/^laser_parameters:[\s\S]*$/m);
    
    if (laserParamsMatch) {
      // Remove the laser_parameters section and any trailing comments
      const updatedContent = content.replace(/^# YAML v2\.0 Laser Parameters\s*\n^laser_parameters:[\s\S]*$/m, '').trim() + '\n';
      
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

// Process all caption files
const captionDir = './content/components/caption';
const files = fs.readdirSync(captionDir).filter(file => file.endsWith('.yaml'));

console.log(`🧹 Processing ${files.length} caption files...`);

let cleanedCount = 0;
files.forEach(file => {
  const filePath = path.join(captionDir, file);
  if (removeLaserParameters(filePath)) {
    cleanedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   📁 Caption files processed: ${files.length}`);
console.log(`   🧹 Files cleaned: ${cleanedCount}`);
console.log(`   📂 Caption directory: ${captionDir}`);
