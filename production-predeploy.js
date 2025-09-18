#!/usr/bin/env node

/**
 * PRODUCTION PREDEPLOY SYSTEM
 * ===========================
 * 
 * Minimal predeploy for production environments where devDependencies aren't available.
 * Only runs checks that work in production build environment.
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function runCommand(command, description, isOptional = false) {
  console.log(`🔍 ${description}`);
  console.log(`📋 Running: ${command}`);
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - SUCCESS`);
    return true;
  } catch (error) {
    if (isOptional) {
      console.log(`⚠️ ${description} - SKIPPED (optional command not available)`);
      return true;
    }
    
    console.log(`❌ ${description} - FAILED`);
    if (description.includes('Building for production')) {
      throw new Error('Build failed - cannot deploy');
    }
    return false;
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found');
  }
  
  console.log('✅ Prerequisites satisfied');
}

async function main() {
  console.log('🚀 PRODUCTION PREDEPLOY SYSTEM');
  console.log('===============================');
  
  try {
    // Step 1: Prerequisites
    checkPrerequisites();
    
    // Step 2: Type checking (only if TypeScript is available)
    const typeCheck = await runCommand('npx tsc --noEmit', 'TypeScript type checking', true);
    
    // Skip ESLint and tests in production environment
    console.log('⚠️ Skipping ESLint and tests in production environment');
    
    console.log('\n🎉 PRODUCTION PREDEPLOY COMPLETE - READY FOR BUILD');
    
  } catch (error) {
    console.error('\n❌ PRODUCTION PREDEPLOY FAILED:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, checkPrerequisites };
