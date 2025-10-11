#!/usr/bin/env node

/**
 * Debug Font Loading
 * Checks if Roboto is actually being applied
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Debugging Roboto Font Loading...\n');

// Check 1: Font config file
const fontConfigPath = path.join(process.cwd(), 'app/config/fonts.ts');
const fontConfig = fs.readFileSync(fontConfigPath, 'utf8');

console.log('✓ Font Config Contents:');
console.log('  - File exists:', fs.existsSync(fontConfigPath));
console.log('  - Contains Roboto import:', fontConfig.includes('Roboto'));
console.log('  - Contains next/font/google:', fontConfig.includes('next/font/google'));

// Check 2: Layout file
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

console.log('\n✓ Layout File:');
console.log('  - Imports roboto:', layoutContent.includes('import { roboto }'));
console.log('  - Uses roboto.className:', layoutContent.includes('roboto.className'));

// Check 3: Look for the actual className pattern
const classNameMatch = layoutContent.match(/className=\{`\$\{roboto\.className\}([^`]+)`\}/);
if (classNameMatch) {
  console.log('  - Body classes:', classNameMatch[0]);
}

console.log('\n📝 Notes:');
console.log('  1. Next.js font optimization generates a unique class at build time');
console.log('  2. The className will look like "__className_a1b2c3" in the HTML');
console.log('  3. Font files are automatically added to the page <head>');
console.log('\n💡 To verify font is loading:');
console.log('  1. Open browser DevTools');
console.log('  2. Check Network tab for font files (woff2)');
console.log('  3. Inspect <body> element for the generated font class');
console.log('  4. Check Computed styles to see font-family\n');
