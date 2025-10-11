#!/usr/bin/env node

/**
 * Font Configuration Verification Script
 * 
 * This script verifies that the font configuration is properly set up.
 * Run with: node scripts/verify-font-config.js
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    checks.passed.push(`✓ ${description}: ${filePath}`);
    return true;
  } else {
    checks.failed.push(`✗ ${description}: ${filePath} not found`);
    return false;
  }
}

function checkFileContent(filePath, searchString, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(searchString)) {
      checks.passed.push(`✓ ${description}`);
      return true;
    } else {
      checks.failed.push(`✗ ${description}: "${searchString}" not found in ${filePath}`);
      return false;
    }
  } else {
    checks.failed.push(`✗ ${description}: ${filePath} not found`);
    return false;
  }
}

console.log('\n🔍 Verifying Font Configuration...\n');

// Check 1: Font config file exists
checkFile('app/config/fonts.ts', 'Font config file exists');

// Check 2: Font config imports Roboto
checkFileContent('app/config/fonts.ts', 'from \'next/font/google\'', 'Font config imports from next/font/google');
checkFileContent('app/config/fonts.ts', 'Roboto', 'Font config uses Roboto');

// Check 3: Layout imports font config
checkFileContent('app/layout.tsx', 'from "./config/fonts"', 'Layout imports font config');
checkFileContent('app/layout.tsx', 'roboto.className', 'Layout applies font className');

// Check 5: Global CSS has documentation
checkFileContent('app/css/global.css', 'Font Configuration', 'Global CSS includes font documentation');

// Check 6: Documentation exists
checkFile('docs/FONT_CONFIGURATION.md', 'Font documentation exists');

// Print results
console.log('✅ PASSED CHECKS:');
checks.passed.forEach(check => console.log(`   ${check}`));

if (checks.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  checks.warnings.forEach(warning => console.log(`   ${warning}`));
}

if (checks.failed.length > 0) {
  console.log('\n❌ FAILED CHECKS:');
  checks.failed.forEach(fail => console.log(`   ${fail}`));
  console.log('\n❌ Font configuration verification FAILED\n');
  process.exit(1);
} else {
  console.log('\n✅ All font configuration checks passed!\n');
  console.log('📚 Font Configuration Summary:');
  console.log('   • Primary font: Roboto (via next/font/google)');
  console.log('   • Configuration file: app/config/fonts.ts');
  console.log('   • Applied in: app/layout.tsx (via className)');
  console.log('   • Documentation: docs/FONT_CONFIGURATION.md');
  console.log('\n🚀 Font is applied by DEFAULT to all elements!');
  console.log('   • No need to add font classes to components');
  console.log('   • Just use weight classes: font-light, font-normal, font-bold, etc.');
  console.log('   • Example: <h1 className="font-bold">Title</h1>\n');
  process.exit(0);
}
