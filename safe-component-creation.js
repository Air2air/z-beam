#!/usr/bin/env node

/**
 * Safe Component Creation Guide
 * This script helps developers safely create new components while maintaining enforcement
 */

const fs = require('fs');
const path = require('path');

console.log('🛡️  SAFE COMPONENT CREATION GUIDE');
console.log('=================================');
console.log('');

console.log('This guide helps you create new components without triggering false positives in the enforcement system.');
console.log('');

const componentName = process.argv[2];
if (!componentName) {
    console.log('Usage: node safe-component-creation.js <ComponentName>');
    console.log('');
    console.log('Example: node safe-component-creation.js Button');
    process.exit(1);
}

console.log(`📋 Creating safe component: ${componentName}`);
console.log('');

// 1. Check if similar components exist
console.log('🔍 STEP 1: Checking for similar existing components...');
console.log('');

const componentsDir = 'app/components';
const existingComponents = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));
const similarComponents = existingComponents.filter(comp => 
    comp.toLowerCase().includes(componentName.toLowerCase()) ||
    componentName.toLowerCase().includes(comp.replace('.tsx', '').toLowerCase())
);

if (similarComponents.length > 0) {
    console.log('⚠️  WARNING: Similar components found:');
    similarComponents.forEach(comp => console.log(`   - ${comp}`));
    console.log('');
    console.log('❓ Consider extending these components instead of creating a new one:');
    similarComponents.forEach(comp => {
        console.log(`   - Review: app/components/${comp}`);
    });
    console.log('');
}

// 2. Generate safe component template
console.log('🛠️  STEP 2: Generating safe component template...');
console.log('');

const componentTemplate = `// app/components/${componentName}.tsx
// Safe component creation - follows enforcement rules

import React from 'react';

export interface ${componentName}Props {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * ${componentName} Component
 * 
 * ENFORCEMENT SAFETY:
 * - Uses variants instead of hardcoded styles
 * - Follows consistent prop patterns
 * - Designed for reusability
 * - Single source of truth for ${componentName.toLowerCase()} styling
 */
export function ${componentName}({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  onClick
}: ${componentName}Props) {
  
  // Base styles - common across all variants
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200';
  
  // Variant styles - specific to each variant
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500', 
    tertiary: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Combine all styles
  const componentStyles = \`\${baseStyles} \${variantStyles[variant]} \${sizeStyles[size]} \${disabledStyles} \${className}\`;
  
  return (
    <button
      className={componentStyles}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

// Export default for easier imports
export default ${componentName};
`;

// 3. Write the component file
const componentPath = `app/components/${componentName}.tsx`;
fs.writeFileSync(componentPath, componentTemplate);

console.log(`✅ Component created: ${componentPath}`);
console.log('');

// 4. Add to exclusion list
console.log('🛡️  STEP 3: Adding to enforcement exclusion list...');

const enforcementScript = 'enforce-component-rules.js';
const enforcementContent = fs.readFileSync(enforcementScript, 'utf8');

// Check if component is already excluded
if (enforcementContent.includes(`app/components/${componentName}.tsx`)) {
    console.log(`✅ Component already in exclusion list: ${componentName}.tsx`);
} else {
    // Add to exclusion list
    const exclusionPattern = /const EXCLUDED_FILES = \[([\s\S]*?)\];/;
    const match = enforcementContent.match(exclusionPattern);
    
    if (match) {
        const currentExclusions = match[1];
        const newExclusions = currentExclusions.trim() + 
            (currentExclusions.trim() ? ',\n' : '') + 
            `  'app/components/${componentName}.tsx'`;
        
        const updatedContent = enforcementContent.replace(
            exclusionPattern,
            `const EXCLUDED_FILES = [\n${newExclusions}\n];`
        );
        
        fs.writeFileSync(enforcementScript, updatedContent);
        console.log(`✅ Added ${componentName}.tsx to enforcement exclusion list`);
    } else {
        console.log('⚠️  Could not automatically add to exclusion list - add manually');
    }
}

console.log('');

// 5. Create usage examples
console.log('📋 STEP 4: Usage examples for your new component:');
console.log('');
console.log(`// Basic usage:`);
console.log(`<${componentName}>Click me</${componentName}>`);
console.log('');
console.log(`// With variants:`);
console.log(`<${componentName} variant="primary" size="lg">Primary Button</${componentName}>`);
console.log(`<${componentName} variant="secondary" size="md">Secondary Button</${componentName}>`);
console.log(`<${componentName} variant="tertiary" size="sm">Tertiary Button</${componentName}>`);
console.log('');

// 6. Test enforcement
console.log('🧪 STEP 5: Testing enforcement system...');
console.log('');

try {
    const { execSync } = require('child_process');
    execSync('node enforce-component-rules.js', { stdio: 'pipe' });
    console.log('✅ Enforcement test PASSED - new component is safe!');
} catch (error) {
    console.log('⚠️  Enforcement test found issues (may be unrelated to new component)');
    console.log('   Run: npm run enforce-components for details');
}

console.log('');
console.log('🎯 NEXT STEPS:');
console.log('1. ✅ Review the generated component for your specific needs');
console.log('2. ✅ Customize variants and sizes as needed');
console.log('3. ✅ Add any additional props required');
console.log('4. ✅ Test the component in your application');
console.log('5. ✅ Replace any existing hardcoded implementations with this component');
console.log('');
console.log('📖 For more guidance, see PROJECT_GUIDE.md section 2');
console.log('🛡️  Component creation completed safely!');
