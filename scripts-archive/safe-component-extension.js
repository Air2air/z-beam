#!/usr/bin/env node

/**
 * Safe Component Extension Tool
 * Helps developers extend existing shared components instead of creating new ones
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 SAFE COMPONENT EXTENSION TOOL');
console.log('=================================');
console.log('');

const componentName = process.argv[2];
if (!componentName) {
    console.log('Usage: node safe-component-extension.js <ComponentName>');
    console.log('');
    console.log('Example: node safe-component-extension.js SmartTagList');
    console.log('');
    console.log('This tool helps you safely extend existing components following modify-first principles.');
    process.exit(1);
}

console.log(`🎯 Extending component: ${componentName}`);
console.log('');

// 1. Find the component file
console.log('🔍 STEP 1: Locating component file...');
console.log('');

const componentsDir = 'app/components';
const componentFile = `${componentName}.tsx`;
const componentPath = path.join(componentsDir, componentFile);

if (!fs.existsSync(componentPath)) {
    console.log(`❌ Component not found: ${componentPath}`);
    console.log('');
    console.log('Available components:');
    const existingComponents = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));
    existingComponents.forEach(comp => console.log(`   - ${comp.replace('.tsx', '')}`));
    process.exit(1);
}

console.log(`✅ Found component: ${componentPath}`);

// 2. Analyze current component
console.log('');
console.log('📋 STEP 2: Analyzing current component structure...');
console.log('');

const componentContent = fs.readFileSync(componentPath, 'utf8');

// Extract interface name
const interfaceMatch = componentContent.match(/export interface (\w+Props)/);
const interfaceName = interfaceMatch ? interfaceMatch[1] : `${componentName}Props`;

// Extract current props
const interfacePattern = new RegExp(`export interface ${interfaceName}\\s*{([^}]+)}`, 's');
const propsMatch = componentContent.match(interfacePattern);
const currentProps = propsMatch ? propsMatch[1].trim() : '';

console.log(`📝 Current interface: ${interfaceName}`);
console.log('📝 Current props:');
if (currentProps) {
    currentProps.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
            console.log(`   ${trimmed}`);
        }
    });
} else {
    console.log('   (Could not parse current props - manual review required)');
}

// 3. Suggest extension patterns
console.log('');
console.log('🛠️  STEP 3: Suggested extension patterns...');
console.log('');

console.log('Based on common extension patterns, consider adding:');
console.log('');

console.log('🎨 **Variant Pattern** (recommended):');
console.log('   variant?: "default" | "compact" | "minimal" | "specialty";');
console.log('   // Enables different visual styles while maintaining core functionality');
console.log('');

console.log('📏 **Size Pattern**:');
console.log('   size?: "xs" | "sm" | "md" | "lg" | "xl";');
console.log('   // Enables different sizing without duplicating components');
console.log('');

console.log('🎭 **Appearance Pattern**:');
console.log('   appearance?: "solid" | "outline" | "ghost" | "link";');
console.log('   // Enables different visual treatments');
console.log('');

console.log('🏷️  **Context Pattern**:');
console.log('   context?: "page" | "modal" | "sidebar" | "card" | "inline";');
console.log('   // Enables context-specific optimizations');
console.log('');

console.log('⚙️  **Feature Flags**:');
console.log('   showIcon?: boolean;');
console.log('   linkable?: boolean;');
console.log('   sortable?: boolean;');
console.log('   // Enables/disables specific features');
console.log('');

// 4. Create backup
console.log('💾 STEP 4: Creating backup...');
console.log('');

const backupPath = `${componentPath}.backup.${Date.now()}`;
fs.copyFileSync(componentPath, backupPath);
console.log(`✅ Backup created: ${backupPath}`);

// 5. Interactive guidance
console.log('');
console.log('🤝 STEP 5: Extension guidance...');
console.log('');

console.log('To safely extend this component:');
console.log('');

console.log('1. **Add new props to the interface** (maintain backward compatibility):');
console.log(`   export interface ${interfaceName} {`);
console.log('     // ...existing props...');
console.log('     variant?: "default" | "yourNewVariant";  // Add your extension');
console.log('   }');
console.log('');

console.log('2. **Update the component function signature**:');
console.log(`   export function ${componentName}({`);
console.log('     // ...existing destructured props...,');
console.log('     variant = "default"  // Default to existing behavior');
console.log(`   }: ${interfaceName}) {`);
console.log('');

console.log('3. **Add conditional logic that preserves existing behavior**:');
console.log('   const styles = variant === "yourNewVariant" ? "new-styles" : "existing-styles";');
console.log('');

console.log('4. **Test all existing usages** to ensure no regressions:');
console.log('   - Run dev server: npm run dev');
console.log('   - Check all pages that use this component');
console.log('   - Verify backward compatibility');
console.log('');

// 6. Generate extension template
console.log('📄 STEP 6: Extension code template...');
console.log('');

const extensionTemplate = `
// EXTENSION EXAMPLE for ${componentName}

// 1. EXTEND THE INTERFACE (add to existing interface)
export interface ${interfaceName} {
  // ...existing props...
  
  // NEW EXTENSION PROPS (choose what fits your needs):
  variant?: 'default' | 'compact' | 'specialty' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  appearance?: 'solid' | 'outline' | 'ghost';
  showIcon?: boolean;
  linkable?: boolean;
  
  // Add your specific extension props here:
  // yourNewProp?: string;
}

// 2. EXTEND THE COMPONENT FUNCTION (preserve existing signature, add new params)
export function ${componentName}({
  // ...existing destructured props...,
  
  // NEW PROPS WITH SAFE DEFAULTS:
  variant = 'default',    // Preserves existing behavior
  size = 'md',
  appearance = 'solid',
  showIcon = false,
  linkable = true,
  
  // Add your new props:
  // yourNewProp = 'defaultValue'
}: ${interfaceName}) {
  
  // 3. CONDITIONAL LOGIC (only activates with new props)
  const variantStyles = {
    default: 'existing-styles',     // Preserve original styling
    compact: 'px-1 py-0.5 text-xs',
    specialty: 'bg-green-100 text-green-700',
    minimal: 'bg-transparent border-0'
  };
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',  // Default matches existing
    lg: 'text-base px-4 py-2'
  };
  
  // 4. COMBINE STYLES (maintain existing behavior)
  const componentStyles = \`
    \${variantStyles[variant]} 
    \${sizeStyles[size]} 
    \${appearance === 'outline' ? 'border border-current bg-transparent' : ''}
    \${className}
  \`.trim();
  
  // 5. RENDER WITH EXTENSIONS (preserve existing structure)
  return (
    <div className={componentStyles}>
      {showIcon && <IconComponent />}
      {/* existing component content */}
      {linkable ? <LinkWrapper>{content}</LinkWrapper> : content}
    </div>
  );
}
`;

console.log(extensionTemplate);

// 7. Check for similar patterns in codebase
console.log('');
console.log('🔍 STEP 7: Checking for consolidation opportunities...');
console.log('');

try {
    const grepResult = execSync(`grep -r "className.*px-.*py-.*rounded" app/components/ || true`, { encoding: 'utf8' });
    if (grepResult.trim()) {
        console.log('Found similar styling patterns that could be consolidated:');
        grepResult.split('\n').slice(0, 5).forEach(line => {
            if (line.trim()) console.log(`   ${line}`);
        });
        console.log('');
        console.log('💡 Consider extending this component to replace these hardcoded patterns!');
    } else {
        console.log('✅ No obvious similar patterns found - good component reuse!');
    }
} catch (error) {
    console.log('⚠️  Could not check for similar patterns (grep not available)');
}

// 8. Final recommendations
console.log('');
console.log('🎯 FINAL RECOMMENDATIONS:');
console.log('');
console.log('✅ **DO THIS:**');
console.log('   1. Add variant props for different styling needs');
console.log('   2. Keep existing props and behavior as defaults');
console.log('   3. Test backward compatibility thoroughly');
console.log('   4. Update component documentation');
console.log('   5. Replace any hardcoded implementations with this extended component');
console.log('');
console.log('❌ **AVOID THIS:**');
console.log('   1. Breaking existing usages of the component');
console.log('   2. Changing default behavior without backward compatibility');
console.log('   3. Making the component overly complex (consider splitting if needed)');
console.log('   4. Duplicating functionality that could be handled with props');
console.log('');

console.log('📖 **NEXT STEPS:**');
console.log('   1. Edit the component file with your extensions');
console.log('   2. Test with: npm run dev');
console.log('   3. Run enforcement check: npm run enforce-components');
console.log('   4. Update all hardcoded usages to use the extended component');
console.log('   5. Document the changes in component comments');
console.log('');

console.log('🛡️  Component extension guidance completed!');
console.log(`📁 Original backed up to: ${backupPath}`);
