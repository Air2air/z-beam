#!/usr/bin/env node

/**
 * BUILD CACHE & WORKFLOW OPTIMIZATION
 * ===================================
 * 
 * This script optimizes the build cache handling and workflow execution
 * to eliminate recurring TypeScript build errors and improve reliability.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WorkflowOptimizer {
  constructor() {
    this.optimizations = [];
  }

  // Enhanced cache clearing strategy
  async optimizeCacheHandling() {
    console.log('🗂️  Optimizing cache handling...');
    
    // Update package.json scripts with better cache management
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Enhanced fix:types script with cache clearing
    const originalFixTypes = packageJson.scripts['fix:types'];
    packageJson.scripts['fix:types'] = 'rm -rf .next && tsc --noEmit';
    
    // Enhanced test:compile with cache clearing
    const originalTestCompile = packageJson.scripts['test:compile'];
    packageJson.scripts['test:compile'] = 'rm -rf .next && tsc --noEmit';
    
    // Add cache cleanup utility
    packageJson.scripts['cache:clean'] = 'rm -rf .next && rm -rf node_modules/.cache && rm -rf .vercel';
    
    // Enhanced build script with pre-cleanup
    packageJson.scripts['build:clean'] = 'npm run cache:clean && npm run build';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    
    this.optimizations.push('Enhanced cache clearing in TypeScript compilation');
    this.optimizations.push('Added cache:clean utility script');
    this.optimizations.push('Added build:clean for reliable builds');
    
    console.log('  ✅ Cache handling optimized');
  }

  // Optimize workflow execution order
  async optimizeWorkflowOrder() {
    console.log('⚡ Optimizing workflow execution...');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Optimize fix pipeline with better error handling
    packageJson.scripts['fix'] = 'npm run fix:auto && npm run fix:lint && npm run fix:recurring && npm run cache:clean && npm run fix:types';
    
    // Optimize test pipeline with cache pre-clearing
    packageJson.scripts['test'] = 'npm run cache:clean && npm run test:compile && npm run test:suite && npm run test:build';
    
    // Enhanced validate pipeline
    packageJson.scripts['validate'] = 'npm run fix && npm run test';
    
    // Enhanced predeploy with comprehensive checks
    packageJson.scripts['predeploy'] = 'npm run cache:clean && npm run validate && npm run build:clean';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    
    this.optimizations.push('Optimized fix pipeline execution order');
    this.optimizations.push('Enhanced test pipeline with cache pre-clearing');
    this.optimizations.push('Improved predeploy reliability');
    
    console.log('  ✅ Workflow execution optimized');
  }

  // Create intelligent build validation
  async createBuildValidation() {
    console.log('🔧 Creating intelligent build validation...');
    
    const validationScript = `#!/usr/bin/env node

/**
 * INTELLIGENT BUILD VALIDATOR
 * ===========================
 * 
 * This script performs comprehensive build validation with automatic
 * issue detection and resolution.
 */

const { execSync } = require('child_process');

async function validateBuild() {
  console.log('🔍 INTELLIGENT BUILD VALIDATION');
  console.log('===============================\\n');
  
  let issues = [];
  let fixes = [];
  
  // Step 1: Clean environment
  console.log('1. 🧹 Cleaning build environment...');
  try {
    execSync('rm -rf .next && rm -rf node_modules/.cache', { stdio: 'pipe' });
    console.log('   ✅ Environment cleaned');
  } catch (error) {
    console.log('   ⚠️  Cache cleanup had issues (continuing...)');
  }
  
  // Step 2: TypeScript validation
  console.log('\\n2. 📝 TypeScript validation...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('   ✅ TypeScript: PASSED');
  } catch (error) {
    console.log('   ❌ TypeScript: ISSUES DETECTED');
    issues.push('TypeScript compilation errors');
    
    // Attempt automatic fix
    try {
      execSync('npm run fix:recurring', { stdio: 'pipe' });
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('   🔧 TypeScript: FIXED automatically');
      fixes.push('Applied recurring type fixes');
    } catch (fixError) {
      console.log('   ⚠️  TypeScript: Manual review required');
    }
  }
  
  // Step 3: ESLint validation
  console.log('\\n3. 📋 ESLint validation...');
  try {
    const lintOutput = execSync('npm run fix:lint 2>&1', { encoding: 'utf8', stdio: 'pipe' });
    const warningCount = (lintOutput.match(/Warning:/g) || []).length;
    const errorCount = (lintOutput.match(/Error:/g) || []).length;
    
    if (errorCount === 0) {
      console.log(\`   ✅ ESLint: PASSED (\${warningCount} warnings)\`);
    } else {
      console.log(\`   ❌ ESLint: \${errorCount} errors, \${warningCount} warnings\`);
      issues.push(\`ESLint: \${errorCount} errors\`);
    }
  } catch (error) {
    console.log('   ❌ ESLint: FAILED');
    issues.push('ESLint execution failed');
  }
  
  // Step 4: Build test
  console.log('\\n4. 🏗️  Build validation...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('   ✅ Build: PASSED');
  } catch (error) {
    console.log('   ❌ Build: FAILED');
    issues.push('Build compilation failed');
  }
  
  // Summary
  console.log('\\n📊 VALIDATION SUMMARY');
  console.log('=====================');
  console.log(\`Issues detected: \${issues.length}\`);
  console.log(\`Fixes applied: \${fixes.length}\`);
  
  if (issues.length === 0) {
    console.log('\\n✅ BUILD VALIDATION PASSED');
    console.log('🚀 Ready for deployment!');
    return true;
  } else {
    console.log('\\n❌ BUILD VALIDATION FAILED');
    console.log('Issues to resolve:');
    issues.forEach(issue => console.log(\`  • \${issue}\`));
    return false;
  }
}

if (require.main === module) {
  validateBuild();
}`;

    fs.writeFileSync(path.join(process.cwd(), 'scripts', 'intelligent-build-validator.js'), validationScript);
    
    // Add to package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts['validate:build'] = 'node scripts/intelligent-build-validator.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    
    this.optimizations.push('Created intelligent build validator');
    this.optimizations.push('Added automated issue detection and resolution');
    
    console.log('  ✅ Intelligent build validation created');
  }

  async testOptimizations() {
    console.log('\\n🧪 Testing optimizations...');
    
    try {
      // Test the optimized cache clearing
      execSync('npm run cache:clean', { stdio: 'pipe' });
      console.log('  ✅ Cache clearing: WORKING');
      
      // Test optimized TypeScript compilation
      execSync('npm run fix:types', { stdio: 'pipe' });
      console.log('  ✅ Enhanced TypeScript validation: WORKING');
      
      // Test intelligent build validator
      const result = execSync('npm run validate:build', { encoding: 'utf8', stdio: 'pipe' });
      console.log('  ✅ Intelligent build validator: WORKING');
      
      return true;
    } catch (error) {
      console.log('  ❌ Some optimizations need adjustment');
      return false;
    }
  }

  async run() {
    console.log('⚡ BUILD CACHE & WORKFLOW OPTIMIZATION');
    console.log('=====================================\\n');
    
    await this.optimizeCacheHandling();
    await this.optimizeWorkflowOrder();
    await this.createBuildValidation();
    
    const testResults = await this.testOptimizations();
    
    console.log('\\n📊 OPTIMIZATION SUMMARY:');
    this.optimizations.forEach(opt => console.log(\`  ✅ \${opt}\`));
    
    if (testResults) {
      console.log('\\n✅ PHASE 2 COMPLETE: Workflow optimization successful!');
      console.log('🎯 Build reliability improved significantly.');
      console.log('🚀 Enhanced scripts ready for use.');
    } else {
      console.log('\\n⚠️  PHASE 2 PARTIAL: Some optimizations may need fine-tuning.');
    }
  }
}

if (require.main === module) {
  const optimizer = new WorkflowOptimizer();
  optimizer.run();
}`;

    fs.writeFileSync(path.join(process.cwd(), 'scripts', 'workflow-optimizer.js'), optimizationScript);
    
    this.optimizations.push('Created intelligent build validator');
    this.optimizations.push('Added automated issue detection and resolution');
    
    console.log('  ✅ Intelligent build validation created');
  }

  async testOptimizations() {
    console.log('\n🧪 Testing optimizations...');
    
    try {
      // Test the optimized cache clearing
      execSync('npm run cache:clean', { stdio: 'pipe' });
      console.log('  ✅ Cache clearing: WORKING');
      
      // Test optimized TypeScript compilation
      execSync('npm run fix:types', { stdio: 'pipe' });
      console.log('  ✅ Enhanced TypeScript validation: WORKING');
      
      // Test intelligent build validator
      const result = execSync('npm run validate:build', { encoding: 'utf8', stdio: 'pipe' });
      console.log('  ✅ Intelligent build validator: WORKING');
      
      return true;
    } catch (error) {
      console.log('  ❌ Some optimizations need adjustment');
      return false;
    }
  }

  async run() {
    console.log('⚡ BUILD CACHE & WORKFLOW OPTIMIZATION');
    console.log('=====================================\n');
    
    await this.optimizeCacheHandling();
    await this.optimizeWorkflowOrder();
    await this.createBuildValidation();
    
    const testResults = await this.testOptimizations();
    
    console.log('\n📊 OPTIMIZATION SUMMARY:');
    this.optimizations.forEach(opt => console.log(`  ✅ ${opt}`));
    
    if (testResults) {
      console.log('\n✅ PHASE 2 COMPLETE: Workflow optimization successful!');
      console.log('🎯 Build reliability improved significantly.');
      console.log('🚀 Enhanced scripts ready for use.');
    } else {
      console.log('\n⚠️  PHASE 2 PARTIAL: Some optimizations may need fine-tuning.');
    }
  }
}

if (require.main === module) {
  const optimizer = new WorkflowOptimizer();
  optimizer.run();
}
