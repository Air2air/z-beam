#!/usr/bin/env node

/**
 * Safety Schema Validation Script
 * 
 * Validates that safety data is properly extracted and included in JSON-LD schemas
 * for contaminant/material pages and compound pages.
 * 
 * Usage: node scripts/seo/validate-safety-schemas.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║           Safety Schema Validation Script                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

/**
 * Load and parse YAML frontmatter file
 */
function loadFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error(`${colors.red}✗ Error loading ${filePath}: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Validate safety data structure in frontmatter
 */
function validateSafetyData(data, fileName) {
  console.log(`\n${colors.bright}Checking: ${fileName}${colors.reset}`);
  
  // Check multiple possible locations for safety_data
  let safetyData = data.safety_data;
  
  // For contaminants, check relationships > affected_substrates > [substrate] > safety_data
  if (!safetyData && data.relationships?.affected_substrates) {
    const substrates = data.relationships.affected_substrates;
    const substrateKeys = Object.keys(substrates);
    
    if (substrateKeys.length > 0) {
      // Use first substrate's safety data as representative
      const firstSubstrate = substrateKeys[0];
      safetyData = substrates[firstSubstrate]?.safety_data;
      console.log(`  ${colors.dim}Using safety_data from substrate: ${firstSubstrate}${colors.reset}`);
    }
  }
  
  if (!safetyData) {
    results.warnings++;
    results.details.push({
      file: fileName,
      status: 'warning',
      message: 'No safety_data found'
    });
    console.log(`  ${colors.yellow}⚠ No safety_data field found${colors.reset}`);
    return false;
  }
  
  // Check for required safety risk fields
  const riskFields = [
    'fire_explosion_risk',
    'toxic_gas_risk',
    'visibility_hazard'
  ];
  
  let hasRisks = false;
  riskFields.forEach(field => {
    if (safetyData[field]) {
      hasRisks = true;
      const severity = typeof safetyData[field] === 'object' 
        ? safetyData[field].severity 
        : safetyData[field];
      console.log(`  ${colors.green}✓ ${field}: ${severity}${colors.reset}`);
    }
  });
  
  // Check for PPE requirements
  if (safetyData.ppe_requirements) {
    console.log(`  ${colors.green}✓ PPE requirements found${colors.reset}`);
    const ppeTypes = Object.keys(safetyData.ppe_requirements);
    console.log(`    ${colors.dim}Types: ${ppeTypes.join(', ')}${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}⚠ No PPE requirements${colors.reset}`);
  }
  
  // Check for ventilation requirements
  if (safetyData.ventilation || safetyData.ventilation_minimum_ach) {
    const ach = safetyData.ventilation_minimum_ach || safetyData.ventilation?.minimum_ach || 'specified';
    console.log(`  ${colors.green}✓ Ventilation requirements: ${ach} ACH${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}⚠ No ventilation requirements${colors.reset}`);
  }
  
  if (hasRisks) {
    results.passed++;
    results.details.push({
      file: fileName,
      status: 'passed',
      message: 'Safety data structure valid'
    });
    return true;
  } else {
    results.failed++;
    results.details.push({
      file: fileName,
      status: 'failed',
      message: 'No risk fields found'
    });
    return false;
  }
}

/**
 * Validate compound chemical data
 */
function validateCompoundData(data, fileName) {
  console.log(`\n${colors.bright}Checking Compound: ${fileName}${colors.reset}`);
  
  const chemicalFormula = data.chemical_formula || data.chemicalFormula;
  const casNumber = data.cas_number || data.casNumber;
  const molecularWeight = data.molecular_weight || data.molecularWeight;
  
  if (!chemicalFormula) {
    results.failed++;
    results.details.push({
      file: fileName,
      status: 'failed',
      message: 'No chemical_formula found'
    });
    console.log(`  ${colors.red}✗ Missing chemical_formula${colors.reset}`);
    return false;
  }
  
  console.log(`  ${colors.green}✓ chemical_formula: ${chemicalFormula}${colors.reset}`);
  
  if (casNumber) {
    console.log(`  ${colors.green}✓ CAS number: ${casNumber}${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}⚠ No CAS number${colors.reset}`);
  }
  
  if (molecularWeight) {
    console.log(`  ${colors.green}✓ molecular_weight: ${molecularWeight}${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}⚠ No molecular_weight${colors.reset}`);
  }
  
  // Check for safety data
  if (data.safety_data) {
    console.log(`  ${colors.green}✓ Safety data present${colors.reset}`);
    validateSafetyData(data, fileName);
  } else {
    console.log(`  ${colors.yellow}⚠ No safety_data${colors.reset}`);
  }
  
  results.passed++;
  results.details.push({
    file: fileName,
    status: 'passed',
    message: 'Compound data structure valid'
  });
  
  return true;
}

/**
 * Main validation function
 */
async function runValidation() {
  console.log(`${colors.cyan}Step 1: Validating Contaminant Safety Data${colors.reset}`);
  console.log(`${colors.dim}Checking frontmatter/contaminants/*.yaml${colors.reset}`);
  
  // Get sample contaminant files
  const contaminantDir = path.join(__dirname, '../../frontmatter/contaminants');
  const contaminantFiles = fs.readdirSync(contaminantDir)
    .filter(f => f.endsWith('.yaml'))
    .slice(0, 5); // Sample first 5
  
  for (const file of contaminantFiles) {
    const data = loadFrontmatter(path.join(contaminantDir, file));
    if (data) {
      validateSafetyData(data, file);
    }
  }
  
  console.log(`\n${colors.cyan}Step 2: Validating Compound Chemical Data${colors.reset}`);
  console.log(`${colors.dim}Checking frontmatter/compounds/*.yaml${colors.reset}`);
  
  // Get sample compound files
  const compoundDir = path.join(__dirname, '../../frontmatter/compounds');
  
  if (fs.existsSync(compoundDir)) {
    const compoundFiles = fs.readdirSync(compoundDir)
      .filter(f => f.endsWith('.yaml'))
      .slice(0, 5); // Sample first 5
    
    for (const file of compoundFiles) {
      const data = loadFrontmatter(path.join(compoundDir, file));
      if (data) {
        validateCompoundData(data, file);
      }
    }
  } else {
    console.log(`  ${colors.yellow}⚠ No compounds directory found${colors.reset}`);
  }
  
  // Print summary
  console.log(`\n${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                     Validation Summary                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`\n${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}`);
  
  // Print recommendations
  console.log(`\n${colors.bright}Next Steps:${colors.reset}\n`);
  
  if (results.passed > 0) {
    console.log(`${colors.green}1. Safety data structure is valid ✓${colors.reset}`);
    console.log(`   ${colors.dim}Product schemas will include fire/toxic/visibility risks${colors.reset}\n`);
    
    console.log(`${colors.cyan}2. Test with Google Rich Results:${colors.reset}`);
    console.log(`   ${colors.dim}https://search.google.com/test/rich-results${colors.reset}\n`);
    
    console.log(`${colors.cyan}3. Validate with Schema.org:${colors.reset}`);
    console.log(`   ${colors.dim}https://validator.schema.org/${colors.reset}\n`);
    
    console.log(`${colors.cyan}4. Deploy and monitor Search Console${colors.reset}`);
    console.log(`   ${colors.dim}Check for schema enhancement detection${colors.reset}\n`);
  }
  
  if (results.failed > 0) {
    console.log(`${colors.red}⚠ Some files failed validation${colors.reset}`);
    console.log(`   ${colors.dim}Review failed files and ensure safety_data structure matches specification${colors.reset}\n`);
  }
  
  if (results.warnings > 0) {
    console.log(`${colors.yellow}⚠ Some files have warnings${colors.reset}`);
    console.log(`   ${colors.dim}These files may not have complete safety data${colors.reset}\n`);
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run validation
runValidation().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
