#!/usr/bin/env node

/**
 * Component Duplication Enforcement Script
 * This script enforces component reusability rules and fails builds when violations are found
 * ENHANCED: Now provides modify-first guidance when violations are detected
 * Run this as part of CI/CD pipeline to ensure compliance
 */

const { execSync } = require('child_process');
const fs = require('fs');

// THRESHOLDS - These define what constitutes a violation
const THRESHOLDS = {
  // Critical violations - these MUST be 0 or build fails
  BADGE_HARDCODED_MAX: 0,        // No hardcoded badge implementations allowed
  BUTTON_HARDCODED_MAX: 1,       // Maximum 1 hardcoded button (for emergency cases)
  CARD_HARDCODED_MAX: 1,         // Maximum 1 hardcoded card (for emergency cases)
  
  // Warning thresholds - these generate warnings but don't fail build
  BG_TEXT_PATTERNS_WARNING: 10,  // Warn if more than 10 bg/text patterns
  PADDING_PATTERNS_WARNING: 15,  // Warn if more than 15 padding patterns
};

// VIOLATION PATTERNS - These patterns indicate component duplication
const VIOLATION_PATTERNS = {
  // Badge/tag hardcoded implementations (excluding shared components)
  BADGE_VIOLATIONS: [
    'px-.*py-.*rounded-full.*bg-blue-100',
    'bg-blue-100.*px-.*py-.*rounded-full', 
    'inline-block.*px-.*py-.*rounded-full.*bg-'
  ],
  
  // Button hardcoded implementations
  BUTTON_VIOLATIONS: [
    'px-.*py-.*bg-blue-600.*hover:',
    'bg-blue-600.*px-.*py-.*hover:'
  ],
  
  // Card hardcoded implementations
  CARD_VIOLATIONS: [
    'bg-white.*rounded-lg.*shadow-',
    'rounded-lg.*shadow-.*bg-white'
  ]
};

// FILES TO EXCLUDE from checks (shared components are allowed to have these patterns)
const EXCLUDED_FILES = [
  'app/components/SmartTagList.tsx',
  'app/components/TagList.tsx',
  'app/components/Button.tsx',
  'app/components/Card.tsx',
  'app/components/Input.tsx',
  'app/components/Badge.tsx',
  'app/components/AuthorTagCloud.tsx'
];

// PATTERNS TO ALLOW - These are legitimate shared component patterns
const ALLOWED_PATTERNS = {
  // Shared component implementations - these are GOOD
  SHARED_COMPONENT_BADGES: [
    'app/components/SmartTagList.tsx',
    'app/components/TagList.tsx',
    'app/components/Badge.tsx'
  ],
  SHARED_COMPONENT_BUTTONS: [
    'app/components/Button.tsx',
    'app/components/ActionButton.tsx'
  ],
  SHARED_COMPONENT_CARDS: [
    'app/components/Card.tsx',
    'app/components/Container.tsx'
  ]
};

// MODIFY-FIRST GUIDANCE - Suggestions for extending existing components
const EXTENSION_SUGGESTIONS = {
  BADGE_VIOLATIONS: [
    {
      pattern: 'bg-blue-100.*text-blue-800',
      suggestion: 'Consider extending SmartTagList with variant="info" instead of hardcoding',
      component: 'SmartTagList',
      props: 'variant="info"',
      example: '<SmartTagList tags={tags} variant="info" />'
    },
    {
      pattern: 'bg-green-100.*text-green-700',
      suggestion: 'Consider extending SmartTagList with variant="success" instead of hardcoding',
      component: 'SmartTagList',
      props: 'variant="success"',
      example: '<SmartTagList tags={tags} variant="success" />'
    },
    {
      pattern: 'px-.*py-.*rounded-full',
      suggestion: 'Consider extending SmartTagList with variant="pill" for rounded tags',
      component: 'SmartTagList',
      props: 'variant="pill"',
      example: '<SmartTagList tags={tags} variant="pill" />'
    }
  ],
  
  BUTTON_VIOLATIONS: [
    {
      pattern: 'bg-blue-600.*hover:bg-blue-700',
      suggestion: 'Consider extending Button component with variant="primary" instead of hardcoding',
      component: 'Button',
      props: 'variant="primary"',
      example: '<Button variant="primary" onClick={handler}>Click me</Button>'
    },
    {
      pattern: 'bg-gray-.*hover:bg-gray-',
      suggestion: 'Consider extending Button component with variant="secondary" instead of hardcoding',
      component: 'Button',
      props: 'variant="secondary"',
      example: '<Button variant="secondary" onClick={handler}>Click me</Button>'
    }
  ],
  
  CARD_VIOLATIONS: [
    {
      pattern: 'bg-white.*rounded-lg.*shadow-',
      suggestion: 'Consider extending Card component with variant="default" instead of hardcoding',
      component: 'Card',
      props: 'variant="default"',
      example: '<Card variant="default">{content}</Card>'
    },
    {
      pattern: 'border.*rounded-lg',
      suggestion: 'Consider extending Card component with variant="outlined" instead of hardcoding',
      component: 'Card',
      props: 'variant="outlined"',
      example: '<Card variant="outlined">{content}</Card>'
    }
  ]
};

let hasViolations = false;
let warnings = [];

console.log('🛡️  ENFORCING COMPONENT REUSABILITY RULES');
console.log('==========================================');
console.log('');

/**
 * Check for pattern violations with safety mechanisms
 */
function checkPattern(pattern, description, threshold, isCritical = true, violationType = null) {
  try {
    const command = `grep -r "${pattern}" app/ --exclude-dir=node_modules`;
    const output = execSync(command, { encoding: 'utf8' });
    const matches = output.trim().split('\n').filter(line => {
      // Exclude shared component files (these are allowed to have patterns)
      const isExcluded = EXCLUDED_FILES.some(excluded => line.includes(excluded));
      
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
        
        // MODIFY-FIRST GUIDANCE - Show specific extension suggestions
        if (violationType && matches.length > 0) {
          console.log('');
          const firstMatch = matches[0];
          const [file, ...lineParts] = firstMatch.split(':');
          const lineContent = lineParts.join(':');
          generateExtensionGuidance(violationType, pattern, file, lineContent);
        }
        
        // Safety suggestion
        console.log('   💡 SAFETY CHECK: If you recently created a new shared component,');
        console.log('      add it to EXCLUDED_FILES in enforce-component-rules.js');
        console.log('      or use: node safe-component-creation.js <ComponentName>');
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
    'app/components/SmartTagList.tsx',
    // 'app/components/Button.tsx',  // Could be future requirement
    // 'app/components/Card.tsx'     // Could be future requirement
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
 * COMPONENT AVAILABILITY CHECK
 */
function checkComponentExists(componentName) {
  const componentPath = `app/components/${componentName}.tsx`;
  return fs.existsSync(componentPath);
}

/**
 * GENERATE MODIFY-FIRST GUIDANCE
 */
function generateExtensionGuidance(violationType, pattern, file, line) {
  const suggestions = EXTENSION_SUGGESTIONS[violationType] || [];
  const matchingSuggestion = suggestions.find(s => line.match(new RegExp(s.pattern)));
  
  if (matchingSuggestion) {
    const componentExists = checkComponentExists(matchingSuggestion.component);
    
    console.log(`    📋 MODIFY-FIRST SUGGESTION:`);
    console.log(`       ${matchingSuggestion.suggestion}`);
    
    if (componentExists) {
      console.log(`    ✅ Component available: ${matchingSuggestion.component}`);
      console.log(`    🔧 Extend with: node safe-component-extension.js ${matchingSuggestion.component}`);
      console.log(`    💡 Example usage: ${matchingSuggestion.example}`);
    } else {
      console.log(`    ⚠️  Component not found: ${matchingSuggestion.component}`);
      console.log(`    🆕 Create with: node safe-component-creation.js ${matchingSuggestion.component}`);
    }
    
    console.log(`    🔍 Find alternatives: node find-component-to-extend.js "${violationType.toLowerCase()}"`);
    console.log('');
  } else {
    // Generic guidance
    console.log(`    📋 MODIFY-FIRST GUIDANCE:`);
    console.log(`       Before creating a new component, check if existing components can be extended.`);
    console.log(`    🔍 Search for extensible components: node find-component-to-extend.js "${violationType.toLowerCase()}"`);
    console.log(`    🛠️  If extending existing: node safe-component-extension.js <ComponentName>`);
    console.log(`    🆕 If creating new: node safe-component-creation.js <ComponentName>`);
    console.log('');
  }
}

/**
 * Main enforcement function
 */
function enforceRules() {
  console.log('🔍 CHECKING FOR COMPONENT DUPLICATION VIOLATIONS:\n');
  
  // Check critical violations
  VIOLATION_PATTERNS.BADGE_VIOLATIONS.forEach((pattern, index) => {
    checkPattern(pattern, `Badge hardcoded implementation #${index + 1}`, THRESHOLDS.BADGE_HARDCODED_MAX, true, 'BADGE_VIOLATIONS');
  });
  
  VIOLATION_PATTERNS.BUTTON_VIOLATIONS.forEach((pattern, index) => {
    checkPattern(pattern, `Button hardcoded implementation #${index + 1}`, THRESHOLDS.BUTTON_HARDCODED_MAX, true, 'BUTTON_VIOLATIONS');
  });
  
  VIOLATION_PATTERNS.CARD_VIOLATIONS.forEach((pattern, index) => {
    checkPattern(pattern, `Card hardcoded implementation #${index + 1}`, THRESHOLDS.CARD_HARDCODED_MAX, true, 'CARD_VIOLATIONS');
  });
  
  console.log('');
  
  // Check shared components exist
  checkSharedComponents();
  
  console.log('');
  
  // Check warning-level patterns
  console.log('⚠️  CHECKING WARNING-LEVEL PATTERNS:\n');
  checkPattern('bg-.*text-', 'Background/text patterns', THRESHOLDS.BG_TEXT_PATTERNS_WARNING, false);
  checkPattern('px-.*py-.*rounded', 'Padding/rounded patterns', THRESHOLDS.PADDING_PATTERNS_WARNING, false);
  
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
    console.log('🔧 TO FIX:');
    console.log('1. Replace hardcoded badge implementations with SmartTagList');
    console.log('2. Replace hardcoded button implementations with shared Button component');
    console.log('3. Replace hardcoded card implementations with shared Card component');
    console.log('4. Run ./quick-audit.sh to see specific violations');
    console.log('5. Review REQUIREMENTS.md section 2 for guidance');
    console.log('');
    console.log('🛡️  SAFETY OPTIONS:');
    console.log('- If creating a NEW shared component, use: node safe-component-creation.js <Name>');
    console.log('- To temporarily bypass (NOT RECOMMENDED): npm run build:skip-check');
    console.log('- To add legitimate exclusion: Edit EXCLUDED_FILES in enforce-component-rules.js');
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
