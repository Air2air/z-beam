#!/usr/bin/env node

/**
 * Add Legal Disclaimers to All Dataset Files
 * 
 * Adds liability disclaimers and warranty notices to:
 * - Materials datasets (459 files: CSV, JSON, TXT)
 * - Settings datasets (306 files: JSON, TXT)
 * - Contaminants datasets (297 files: CSV, JSON, TXT)
 * 
 * Total: ~1,062 files
 */

const fs = require('fs');
const path = require('path');

// Legal disclaimer text
const DISCLAIMER = {
  full: `DISCLAIMER: This data is provided for informational and educational purposes only, without any warranties, express or implied. Z-Beam makes no representations regarding the accuracy, completeness, or suitability of this information for any particular purpose. Use of this data is at your own risk. Z-Beam assumes no liability for any damages, injuries, or losses arising from the application or interpretation of this data. Always consult qualified professionals and follow applicable safety regulations when working with laser equipment.`,
  
  short: `Provided for informational purposes only, without warranties. Use at your own risk. Z-Beam assumes no liability for damages arising from its application.`,
  
  noWarranty: `NO WARRANTY: THIS DATA IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.`,
  
  noLiability: `LIMITATION OF LIABILITY: IN NO EVENT SHALL Z-BEAM BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES ARISING FROM THE USE OF THIS DATA.`
};

// License text with liability limitation
const LICENSE_WITH_DISCLAIMER = {
  name: "Creative Commons Attribution 4.0 International with Disclaimer",
  ccUrl: "https://creativecommons.org/licenses/by/4.0/",
  description: "Free to share and adapt with attribution. No warranty provided. Use at your own risk.",
  fullText: `This dataset is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0), with the following additional terms:

${DISCLAIMER.noWarranty}

${DISCLAIMER.noLiability}

Professional Consultation Required: This data should not be used as the sole basis for operational decisions. Always consult with qualified laser safety professionals and follow all applicable regulations (ANSI Z136, IEC 60825, OSHA, etc.).`
};

/**
 * Update JSON files with disclaimer
 */
function updateJSONFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Add disclaimer field at top level
    data.disclaimer = DISCLAIMER.full;
    
    // Update license description
    if (data.license && typeof data.license === 'object') {
      data.license.description = LICENSE_WITH_DISCLAIMER.description;
      data.license.disclaimer = DISCLAIMER.noWarranty + ' ' + DISCLAIMER.noLiability;
    }
    
    // Add usageInfo if not present
    if (!data.usageInfo) {
      data.usageInfo = {
        terms: "https://www.z-beam.com/datasets/usage-terms",
        disclaimer: DISCLAIMER.full,
        professionalConsultation: "Always consult qualified professionals and follow applicable safety regulations",
        warranty: "NO WARRANTY - PROVIDED AS IS",
        liability: "NO LIABILITY FOR DAMAGES ARISING FROM USE"
      };
    }
    
    // Write back with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    console.error(`Error updating JSON file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Update TXT files with disclaimer section
 */
function updateTXTFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if disclaimer already exists
    if (content.includes('DISCLAIMER') || content.includes('NO WARRANTY')) {
      console.log(`Skipping ${path.basename(filePath)} - already has disclaimer`);
      return true;
    }
    
    // Try to find footer section (materials format with ===)
    const footerMatch = content.match(/(=+)\s*$/);
    
    if (footerMatch) {
      // Materials format - insert before final separator
      const disclaimerSection = `
DISCLAIMER AND LIABILITY LIMITATION
--------------------------------------------------------------------------------
${DISCLAIMER.full}

NO WARRANTY: This data is provided "AS IS" without warranty of any kind, either
express or implied, including but not limited to the implied warranties of
merchantability and fitness for a particular purpose.

LIMITATION OF LIABILITY: In no event shall Z-Beam be liable for any direct,
indirect, incidental, special, exemplary, or consequential damages arising from
the use of this data.

PROFESSIONAL CONSULTATION REQUIRED: This data should not be used as the sole
basis for operational decisions. Always consult with qualified laser safety
professionals and follow all applicable regulations (ANSI Z136, IEC 60825,
OSHA, etc.).

`;
      content = content.replace(/(=+)\s*$/, disclaimerSection + '$1');
    } else {
      // Settings/contaminants format - append to end
      const disclaimerSection = `

================================================================================
DISCLAIMER AND LIABILITY LIMITATION
================================================================================

${DISCLAIMER.full}

NO WARRANTY: This data is provided "AS IS" without warranty of any kind, either
express or implied, including but not limited to the implied warranties of
merchantability and fitness for a particular purpose.

LIMITATION OF LIABILITY: In no event shall Z-Beam be liable for any direct,
indirect, incidental, special, exemplary, or consequential damages arising from
the use of this data.

PROFESSIONAL CONSULTATION REQUIRED: This data should not be used as the sole
basis for operational decisions. Always consult with qualified laser safety
professionals and follow all applicable regulations (ANSI Z136, IEC 60825,
OSHA, etc.).

================================================================================
`;
      content = content.trimEnd() + disclaimerSection;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error updating TXT file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Update CSV files with disclaimer row
 */
function updateCSVFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if disclaimer already exists
    if (content.includes('DISCLAIMER') || content.includes('NO WARRANTY')) {
      console.log(`Skipping ${path.basename(filePath)} - already has disclaimer`);
      return true;
    }
    
    // Add disclaimer at the end
    const disclaimerRows = `
LEGAL NOTICE,
DISCLAIMER,"${DISCLAIMER.short}"
NO WARRANTY,"This data is provided AS IS without warranty of any kind"
NO LIABILITY,"Z-Beam assumes no liability for damages arising from use of this data"
PROFESSIONAL CONSULTATION,"Always consult qualified professionals and follow safety regulations"
`;
    
    content = content.trimEnd() + disclaimerRows;
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error updating CSV file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Process all files in a directory
 */
function processDirectory(dirPath, fileTypes) {
  const files = fs.readdirSync(dirPath);
  let stats = { total: 0, success: 0, failed: 0, skipped: 0 };
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      const ext = path.extname(file);
      
      if (fileTypes.includes(ext)) {
        stats.total++;
        
        let success = false;
        if (ext === '.json') {
          success = updateJSONFile(filePath);
        } else if (ext === '.txt') {
          success = updateTXTFile(filePath);
        } else if (ext === '.csv') {
          success = updateCSVFile(filePath);
        }
        
        if (success) {
          stats.success++;
        } else {
          stats.failed++;
        }
      }
    }
  }
  
  return stats;
}

/**
 * Main execution
 */
function main() {
  console.log('================================================================================');
  console.log('ADDING LEGAL DISCLAIMERS TO ALL DATASET FILES');
  console.log('================================================================================\n');
  
  const datasetsDir = path.join(__dirname, '../../public/datasets');
  
  // Process materials
  console.log('📁 Processing Materials Datasets...');
  const materialsDir = path.join(datasetsDir, 'materials');
  const materialsStats = processDirectory(materialsDir, ['.json', '.csv', '.txt']);
  console.log(`   ✅ ${materialsStats.success} files updated`);
  console.log(`   ⚠️  ${materialsStats.failed} files failed`);
  console.log(`   ⏭️  ${materialsStats.skipped} files skipped\n`);
  
  // Process settings
  console.log('📁 Processing Settings Datasets...');
  const settingsDir = path.join(datasetsDir, 'settings');
  const settingsStats = processDirectory(settingsDir, ['.json', '.txt']);
  console.log(`   ✅ ${settingsStats.success} files updated`);
  console.log(`   ⚠️  ${settingsStats.failed} files failed`);
  console.log(`   ⏭️  ${settingsStats.skipped} files skipped\n`);
  
  // Process contaminants
  console.log('📁 Processing Contaminants Datasets...');
  const contaminantsDir = path.join(datasetsDir, 'contaminants');
  const contaminantsStats = processDirectory(contaminantsDir, ['.json', '.csv', '.txt']);
  console.log(`   ✅ ${contaminantsStats.success} files updated`);
  console.log(`   ⚠️  ${contaminantsStats.failed} files failed`);
  console.log(`   ⏭️  ${contaminantsStats.skipped} files skipped\n`);
  
  // Summary
  const totalSuccess = materialsStats.success + settingsStats.success + contaminantsStats.success;
  const totalFailed = materialsStats.failed + settingsStats.failed + contaminantsStats.failed;
  const totalFiles = materialsStats.total + settingsStats.total + contaminantsStats.total;
  
  console.log('================================================================================');
  console.log('SUMMARY');
  console.log('================================================================================');
  console.log(`Total Files Processed: ${totalFiles}`);
  console.log(`✅ Successfully Updated: ${totalSuccess}`);
  console.log(`⚠️  Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalSuccess / totalFiles) * 100).toFixed(1)}%\n`);
  
  if (totalFailed === 0) {
    console.log('🎉 All dataset files now include legal disclaimers!');
  } else {
    console.log('⚠️  Some files failed to update. Please review the errors above.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { updateJSONFile, updateTXTFile, updateCSVFile };
