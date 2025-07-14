#!/usr/bin/env node

/**
 * Component Duplication Enforcement Script
 * This script enforces component reusability rules and fails builds when violations are found
 * STREAMLINED: Uses external config file to eliminate duplication
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Load configuration from external config file
const config = require('./component-enforcement.config.js');

let hasViolations = false;
let warnings = [];

console.log('🛡️  ENFORCING COMPONENT REUSABILITY RULES');
console.log('==========================================');
console.log('');

/**
 * Check for pattern violations with modify-first guidance
 */
function checkPattern(pattern, description, threshold, isCritical = true, violationType = null) {
  try {
    const command = `grep -r "${pattern}" app/ --exclude-dir=node_modules`;
    const output = execSync(command, { encoding: 'utf8' });
    
    const matches = output.trim().split('\n').filter(line => {
      // Exclude shared component files (these are allowed to have patterns)
      const isExcluded = config.excludedFiles.some(excluded => line.includes(excluded));
      
      // Additional safety: exclude files with "Component" in the name that might be new shared components
      const isSharedComponent = line.includes('/components/') && 
                               (line.includes('Component.tsx') || line.includes('Button.tsx') || 
                                line.includes('Card.tsx') || line.includes('Badge.tsx'));
      
      return !isExcluded && !isSharedComponent;
    });
    
    const count = matches.length;
    
    if (count > threshold) {
      if (isCritical) {
        console.log(`❌ CRITICAL VIOLATION: ${description}`);
        console.log(`   Found: ${count} instances (Max allowed: ${threshold})`);
        console.log('   Locations:');
        matches.slice(0, 5).forEach(match => console.log(`   - ${match}`));
        if (matches.length > 5) console.log(`   ... and ${matches.length - 5} more`);
        
        // MODIFY-FIRST GUIDANCE
        if (violationType && matches.length > 0) {
          console.log('');
          console.log(`    📋 MODIFY-FIRST GUIDANCE:`);
          console.log(`       Before creating a new component, check if existing components can be extended.`);
          console.log(`    🔍 Search for extensible components: node find-component-to-extend.js "${violationType.toLowerCase()}"`);
          console.log(`    🛠️  If extending existing: node safe-component-extension.js <ComponentName>`);
          console.log(`    🆕 If creating new: node safe-component-creation.js <ComponentName>`);
          console.log('');
        }
        
        // Safety suggestion
        console.log('   💡 SAFETY CHECK: If you recently created a new shared component,');
        console.log('      add it to excludedFiles in component-enforcement.config.js');
        console.log('');
        
        hasViolations = true;
      } else {
        warnings.push(`⚠️  WARNING: ${description} - ${count} instances (threshold: ${threshold})`);
      }
    } else {
      console.log(`✅ ${description}: ${count} instances (within threshold: ${threshold})`);
    }
  } catch (error) {
    // No matches found - this is good!
    console.log(`✅ ${description}: 0 instances (within threshold: ${threshold})`);
  }
}

/**
 * Check for required shared components
 */
function checkSharedComponents() {
  console.log('📋 CHECKING SHARED COMPONENT EXISTENCE:');
  
  const requiredComponents = [
    'app/components/SmartTagList.tsx'
  ];
  
  let missingComponents = [];
  
  requiredComponents.forEach(component => {
    if (fs.existsSync(component)) {
      console.log(`✅ Required component exists: ${component}`);
    } else {
      console.log(`❌ MISSING required component: ${component}`);
      missingComponents.push(component);
      hasViolations = true;
    }
  });
  
  return missingComponents;
}

/**
 * Main enforcement function
 */
function enforceRules() {
  console.log('🔍 CHECKING FOR COMPONENT DUPLICATION VIOLATIONS:\n');
  
  // Check critical violations with modify-first guidance
  config.patterns.badge.forEach((pattern, index) => {
    checkPattern(pattern, `Badge hardcoded implementation #${index + 1}`, config.thresholds.badge.hardcodedMax, true, 'badge');
  });
  
  config.patterns.button.forEach((pattern, index) => {
    checkPattern(pattern, `Button hardcoded implementation #${index + 1}`, config.thresholds.button.hardcodedMax, true, 'button');
  });
  
  config.patterns.card.forEach((pattern, index) => {
    checkPattern(pattern, `Card hardcoded implementation #${index + 1}`, config.thresholds.card.hardcodedMax, true, 'card');
  });
  
  console.log('');
  
  // Check shared components exist
  checkSharedComponents();
  
  console.log('');
  
  // Check warning-level patterns
  console.log('⚠️  CHECKING WARNING-LEVEL PATTERNS:\n');
  checkPattern('bg-.*text-', 'Background/text patterns', config.thresholds.patterns.bgTextWarning, false);
  checkPattern('px-.*py-.*rounded', 'Padding/rounded patterns', config.thresholds.patterns.paddingWarning, false);
  
  // Display warnings
  if (warnings.length > 0) {
    console.log('\n📋 WARNINGS:');
    warnings.forEach(warning => console.log(warning));
  }
  
  // Final result
  console.log('\n==========================================');
  if (hasViolations) {
    console.log('❌ BUILD FAILED: Component reusability violations found!');
    console.log('');
    console.log('🔧 TO FIX (MODIFY-FIRST APPROACH):');
    console.log('1. 🔍 FIRST: Search for components to extend with specific guidance above');
    console.log('2. 🛠️  EXTEND existing components using: node safe-component-extension.js <ComponentName>');
    console.log('3. 🆕 CREATE new components ONLY if no suitable ones exist: node safe-component-creation.js <Name>');
    console.log('4. 🔍 Find similar components: node find-component-to-extend.js <pattern>');
    console.log('5. ✅ Replace hardcoded implementations with extended shared components');
    console.log('6. 📖 Review PROJECT_GUIDE.md "MODIFY-FIRST POLICY" section for detailed guidance');
    console.log('');
    console.log('🛡️  SAFETY OPTIONS:');
    console.log('- Edit configuration: component-enforcement.config.js');
    console.log('- To temporarily bypass (NOT RECOMMENDED): npm run build:skip-check');
    process.exit(1);
  } else {
    console.log('✅ BUILD PASSED: All component reusability rules followed!');
    if (warnings.length > 0) {
      console.log(`⚠️  Note: ${warnings.length} warnings found - consider refactoring`);
    }
    process.exit(0);
  }
}

// Run the enforcement
enforceRules();
