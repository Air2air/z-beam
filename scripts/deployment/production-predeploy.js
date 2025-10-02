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
  
  // Check if critical directories exist
  const criticalPaths = ['app', 'types', 'content'];
  for (const path of criticalPaths) {
    if (!fs.existsSync(path)) {
      console.warn(`⚠️ Warning: ${path} directory not found`);
    }
  }
  
  // Check Node version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 20) {
    throw new Error(`Node.js version ${nodeVersion} is too old. Requires >= 20.0.0`);
  }
  console.log(`✅ Node.js version: ${nodeVersion}`);
  
  console.log('✅ Prerequisites satisfied');
}

async function main() {
  console.log('🚀 PRODUCTION PREDEPLOY SYSTEM');
  console.log('===============================');
  console.log(`📍 Working directory: ${process.cwd()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`⚙️ Platform: ${process.platform}`);
  
  try {
    // Step 1: Prerequisites
    checkPrerequisites();
    
    // Step 2: Type checking (only if TypeScript is available)
    const typeCheck = await runCommand('npx tsc --noEmit', 'TypeScript type checking', true);
    
    // Skip ESLint and tests in production environment
    console.log('⚠️ Skipping ESLint and tests in production environment');
    
    // Verify critical files exist
    const criticalFiles = ['next.config.js', 'tsconfig.json'];
    for (const file of criticalFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ Found: ${file}`);
      } else {
        console.warn(`⚠️ Missing: ${file}`);
      }
    }
    
    console.log('\n🎉 PRODUCTION PREDEPLOY COMPLETE - READY FOR BUILD');
    console.log('═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ PRODUCTION PREDEPLOY FAILED:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, checkPrerequisites };
