#!/usr/bin/env node

/**
 * Component Extension Finder
 * Helps identify which existing components can be extended for new UI needs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 COMPONENT EXTENSION FINDER');
console.log('=============================');
console.log('');

const searchTerm = process.argv[2];
if (!searchTerm) {
    console.log('Usage: node find-component-to-extend.js <ui-pattern>');
    console.log('');
    console.log('Examples:');
    console.log('  node find-component-to-extend.js button');
    console.log('  node find-component-to-extend.js tag');
    console.log('  node find-component-to-extend.js card');
    console.log('  node find-component-to-extend.js "px-3 py-1"');
    console.log('');
    console.log('This tool helps you find existing components to extend instead of creating new ones.');
    process.exit(1);
}

console.log(`🎯 Searching for components related to: "${searchTerm}"`);
console.log('');

// 1. Search by component name patterns
console.log('🔍 STEP 1: Searching by component names...');
console.log('');

const componentsDir = 'app/components';
const components = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));

const nameMatches = components.filter(comp => 
    comp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    searchTerm.toLowerCase().includes(comp.replace('.tsx', '').toLowerCase())
);

if (nameMatches.length > 0) {
    console.log('📋 Found components by name:');
    nameMatches.forEach(comp => {
        console.log(`   ✅ ${comp.replace('.tsx', '')} (app/components/${comp})`);
    });
    console.log('');
} else {
    console.log('📋 No components found by name matching "' + searchTerm + '"');
    console.log('');
}

// 2. Search by component content/functionality
console.log('🔍 STEP 2: Searching component content...');
console.log('');

try {
    const contentMatches = execSync(
        `grep -l "${searchTerm}" app/components/*.tsx 2>/dev/null || true`, 
        { encoding: 'utf8' }
    ).trim().split('\n').filter(file => file.trim());

    if (contentMatches.length > 0 && contentMatches[0] !== '') {
        console.log('📋 Found components with matching content:');
        contentMatches.forEach(file => {
            const componentName = path.basename(file, '.tsx');
            console.log(`   ✅ ${componentName} (${file})`);
        });
        console.log('');
    } else {
        console.log('📋 No components found with content matching "' + searchTerm + '"');
        console.log('');
    }
} catch (error) {
    console.log('⚠️  Could not search component content');
    console.log('');
}

// 3. Search by styling patterns
console.log('🔍 STEP 3: Searching for similar styling patterns...');
console.log('');

const stylePatterns = [
    'px-.*py-',
    'bg-.*text-',
    'rounded-',
    'border-',
    'shadow-',
    'hover:',
    'focus:'
];

try {
    for (const pattern of stylePatterns) {
        const styleMatches = execSync(
            `grep -l "${pattern}" app/components/*.tsx 2>/dev/null || true`, 
            { encoding: 'utf8' }
        ).trim().split('\n').filter(file => file.trim());

        if (styleMatches.length > 0 && styleMatches[0] !== '') {
            console.log(`📋 Components with ${pattern} patterns:`);
            const uniqueFiles = [...new Set(styleMatches)];
            uniqueFiles.slice(0, 3).forEach(file => {
                const componentName = path.basename(file, '.tsx');
                console.log(`   💅 ${componentName}`);
            });
            if (uniqueFiles.length > 3) {
                console.log(`   ... and ${uniqueFiles.length - 3} more`);
            }
            console.log('');
        }
    }
} catch (error) {
    console.log('⚠️  Could not search styling patterns');
    console.log('');
}

// 4. Analyze extensibility of found components
console.log('🔍 STEP 4: Analyzing component extensibility...');
console.log('');

const allMatches = [...new Set([...nameMatches, ...contentMatches.map(f => path.basename(f))])];

if (allMatches.length === 0) {
    console.log('❌ No directly matching components found.');
    console.log('');
    console.log('💡 **SUGGESTION**: Consider these highly extensible base components:');
    
    const baseComponents = ['SmartTagList', 'Button', 'Card', 'Container', 'ActionButton'];
    const existingBase = baseComponents.filter(name => 
        fs.existsSync(path.join(componentsDir, `${name}.tsx`))
    );
    
    if (existingBase.length > 0) {
        existingBase.forEach(comp => {
            console.log(`   🚀 ${comp} - Highly configurable base component`);
        });
    } else {
        console.log('   🆕 No base components exist yet - this might be a good candidate for a new base component');
    }
    console.log('');
} else {
    allMatches.forEach(componentFile => {
        const componentName = componentFile.replace('.tsx', '');
        const filePath = path.join(componentsDir, componentFile);
        
        if (fs.existsSync(filePath)) {
            console.log(`🔬 Analyzing: ${componentName}`);
            
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for extensibility indicators
            const hasVariants = content.includes('variant');
            const hasSize = content.includes('size');
            const hasClassName = content.includes('className');
            const hasConditionalLogic = content.includes('?') && content.includes(':');
            const hasProps = content.includes('Props');
            
            const extensibilityScore = [hasVariants, hasSize, hasClassName, hasConditionalLogic, hasProps]
                .filter(Boolean).length;
            
            console.log(`   📊 Extensibility Score: ${extensibilityScore}/5`);
            
            if (hasVariants) console.log('   ✅ Already has variant support');
            if (hasSize) console.log('   ✅ Already has size support');
            if (hasClassName) console.log('   ✅ Accepts custom className');
            if (hasConditionalLogic) console.log('   ✅ Has conditional logic');
            if (hasProps) console.log('   ✅ Uses TypeScript props interface');
            
            if (extensibilityScore >= 3) {
                console.log(`   🎯 **HIGHLY EXTENSIBLE** - Great candidate for extension!`);
            } else if (extensibilityScore >= 1) {
                console.log(`   🔧 **MODERATELY EXTENSIBLE** - Can be enhanced for extension`);
            } else {
                console.log(`   ⚠️  **LOW EXTENSIBILITY** - May need refactoring for extension`);
            }
            
            console.log('');
        }
    });
}

// 5. Provide recommendations
console.log('🎯 RECOMMENDATIONS:');
console.log('');

if (allMatches.length > 0) {
    console.log('Based on the analysis above:');
    console.log('');
    
    const highlyExtensible = allMatches.filter(componentFile => {
        const filePath = path.join(componentsDir, componentFile);
        if (!fs.existsSync(filePath)) return false;
        
        const content = fs.readFileSync(filePath, 'utf8');
        const score = [
            content.includes('variant'),
            content.includes('size'),
            content.includes('className'),
            content.includes('?') && content.includes(':'),
            content.includes('Props')
        ].filter(Boolean).length;
        
        return score >= 3;
    });
    
    if (highlyExtensible.length > 0) {
        console.log('🚀 **RECOMMENDED FOR EXTENSION:**');
        highlyExtensible.forEach(comp => {
            const name = comp.replace('.tsx', '');
            console.log(`   ✅ Extend ${name} - Use: node safe-component-extension.js ${name}`);
        });
        console.log('');
    }
    
    const moderatelyExtensible = allMatches.filter(componentFile => {
        const filePath = path.join(componentsDir, componentFile);
        if (!fs.existsSync(filePath)) return false;
        
        const content = fs.readFileSync(filePath, 'utf8');
        const score = [
            content.includes('variant'),
            content.includes('size'), 
            content.includes('className'),
            content.includes('?') && content.includes(':'),
            content.includes('Props')
        ].filter(Boolean).length;
        
        return score >= 1 && score < 3;
    });
    
    if (moderatelyExtensible.length > 0) {
        console.log('🔧 **NEEDS ENHANCEMENT FOR EXTENSION:**');
        moderatelyExtensible.forEach(comp => {
            const name = comp.replace('.tsx', '');
            console.log(`   ⚡ Enhance ${name} first, then extend`);
        });
        console.log('');
    }
    
} else {
    console.log('Since no matching components were found:');
    console.log('');
    console.log('🆕 **CONSIDER CREATING A NEW BASE COMPONENT** if:');
    console.log('   - This is a fundamental UI pattern (button, card, input, etc.)');
    console.log('   - It will be used in multiple places');
    console.log('   - It can be designed with maximum reusability');
    console.log('');
    console.log('🔍 **OR SEARCH MORE BROADLY** with:');
    console.log('   - Related terms (e.g., "badge" instead of "tag")');
    console.log('   - Styling patterns (e.g., "px-3 py-1 rounded")');
    console.log('   - Functional patterns (e.g., "onClick" for interactive elements)');
    console.log('');
}

console.log('🛠️  **NEXT STEPS:**');
console.log('');
console.log('If you found a component to extend:');
console.log('   1. Run: node safe-component-extension.js <ComponentName>');
console.log('   2. Follow the guided extension process');
console.log('   3. Test the extended component thoroughly');
console.log('');
console.log('If no suitable component exists:');
console.log('   1. Run: node safe-component-creation.js <ComponentName>');
console.log('   2. Design with maximum reusability in mind');
console.log('   3. Consider future extension needs');
console.log('');

console.log('📖 For more guidance, see REQUIREMENTS.md section "MODIFY-FIRST POLICY"');
console.log('🔍 Component search completed!');
