#!/usr/bin/env node
/**
 * Intelligent Predeploy System - Essential vs Optional Validation
 * Focuses on deployment-blocking issues vs quality improvements
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class IntelligentPredeploy {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.startTime = Date.now();
    this.results = {
      essential: {},
      optional: {},
      summary: {}
    };
    
    console.log('🧠 INTELLIGENT PREDEPLOY SYSTEM');
    console.log('===============================');
    console.log('🎯 Focus: Deployment Success vs Quality Improvement');
    console.log(`📁 Workspace: ${this.workspaceRoot}`);
    console.log(`⏰ Started: ${new Date().toLocaleTimeString()}\\n`);
  }

  runCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.workspaceRoot,
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return { success: true, output: result, error: null };
    } catch (error) {
      return { 
        success: false, 
        output: error.stdout || '', 
        error: error.message,
        code: error.status 
      };
    }
  }

  // =========================================
  // ESSENTIAL VALIDATION (DEPLOYMENT BLOCKING)
  // =========================================

  async validateTypeScript() {
    console.log('🔍 ESSENTIAL: TypeScript Compilation');
    console.log('------------------------------------');
    
    const result = this.runCommand('npx tsc --noEmit', { silent: true });
    
    if (result.success) {
      console.log('✅ TypeScript compilation: CLEAN');
      this.results.essential.typescript = { status: 'PASS', errors: 0 };
      return true;
    } else {
      const errorCount = (result.output.match(/error TS\\d+/g) || []).length;
      console.log(`❌ TypeScript compilation: ${errorCount} errors`);
      
      // Show first few errors for debugging
      const errorLines = result.output.split('\\n').filter(line => line.includes('error TS'));
      errorLines.slice(0, 3).forEach(line => console.log(`   ${line.trim()}`));
      
      this.results.essential.typescript = { status: 'FAIL', errors: errorCount };
      return false;
    }
  }

  async validateESLintErrors() {
    console.log('\\n🔍 ESSENTIAL: ESLint Error Check (Warnings OK)');
    console.log('------------------------------------------------');
    
    const result = this.runCommand('npx eslint app/ --ext .ts,.tsx', { silent: true });
    
    // Extract actual errors (not warnings)
    const errorMatch = result.output.match(/(\\d+) error/);
    const errorCount = errorMatch ? parseInt(errorMatch[1]) : 0;
    
    // Extract warnings for info
    const warningMatch = result.output.match(/(\\d+) warning/);
    const warningCount = warningMatch ? parseInt(warningMatch[1]) : 0;
    
    if (errorCount === 0) {
      console.log('✅ ESLint errors: NONE');
      if (warningCount > 0) {
        console.log(`ℹ️ ESLint warnings: ${warningCount} (non-blocking)`);
      }
      this.results.essential.eslint = { status: 'PASS', errors: errorCount, warnings: warningCount };
      return true;
    } else {
      console.log(`❌ ESLint errors: ${errorCount} (BLOCKING)`);
      this.results.essential.eslint = { status: 'FAIL', errors: errorCount, warnings: warningCount };
      return false;
    }
  }

  async validateBuild() {
    console.log('\\n🔍 ESSENTIAL: Production Build');
    console.log('-------------------------------');
    
    const result = this.runCommand('npm run build', { silent: true });
    
    if (result.success) {
      console.log('✅ Production build: SUCCESS');
      this.results.essential.build = { status: 'PASS' };
      return true;
    } else {
      console.log('❌ Production build: FAILED');
      
      // Show build error details
      const errorLines = result.output.split('\\n')
        .filter(line => line.includes('Error') || line.includes('Failed'))
        .slice(0, 3);
      errorLines.forEach(line => console.log(`   ${line.trim()}`));
      
      this.results.essential.build = { status: 'FAIL', error: result.error };
      return false;
    }
  }

  async validateCriticalPaths() {
    console.log('\\n🔍 ESSENTIAL: Critical Path Validation');
    console.log('---------------------------------------');
    
    // Check if critical files exist and are valid
    const criticalFiles = [
      'package.json',
      'next.config.js', 
      'app/page.tsx',
      'app/layout.tsx'
    ];
    
    const missingFiles = criticalFiles.filter(file => {
      const fullPath = path.join(this.workspaceRoot, file);
      return !fs.existsSync(fullPath);
    });
    
    if (missingFiles.length === 0) {
      console.log('✅ Critical files: ALL PRESENT');
      this.results.essential.criticalPaths = { status: 'PASS' };
      return true;
    } else {
      console.log(`❌ Critical files: ${missingFiles.length} missing`);
      missingFiles.forEach(file => console.log(`   Missing: ${file}`));
      this.results.essential.criticalPaths = { status: 'FAIL', missing: missingFiles };
      return false;
    }
  }

  // =========================================
  // OPTIONAL VALIDATION (QUALITY IMPROVEMENT)
  // =========================================

  async validateTests() {
    console.log('\\n🔍 OPTIONAL: Test Suite');
    console.log('------------------------');
    
    const result = this.runCommand('npm run test', { silent: true });
    
    if (result.success) {
      console.log('✅ Tests: ALL PASSING');
      this.results.optional.tests = { status: 'PASS' };
      return true;
    } else {
      // Extract test failure info
      const failMatch = result.output.match(/Tests:\\s+(\\d+) failed/);
      const failCount = failMatch ? parseInt(failMatch[1]) : 'unknown';
      
      console.log(`⚠️ Tests: ${failCount} failing (non-blocking for deployment)`);
      this.results.optional.tests = { status: 'FAIL', failures: failCount };
      return false;
    }
  }

  async validateCodeQuality() {
    console.log('\\n🔍 OPTIONAL: Code Quality Metrics');
    console.log('----------------------------------');
    
    // This is where we'd put code coverage, complexity analysis, etc.
    // For now, just check ESLint warnings
    const result = this.runCommand('npx eslint app/ --ext .ts,.tsx', { silent: true });
    const warningMatch = result.output.match(/(\\d+) warning/);
    const warningCount = warningMatch ? parseInt(warningMatch[1]) : 0;
    
    if (warningCount === 0) {
      console.log('✅ Code quality: EXCELLENT (no warnings)');
      this.results.optional.codeQuality = { status: 'EXCELLENT', warnings: 0 };
    } else if (warningCount < 20) {
      console.log(`✅ Code quality: GOOD (${warningCount} minor warnings)`);
      this.results.optional.codeQuality = { status: 'GOOD', warnings: warningCount };
    } else {
      console.log(`⚠️ Code quality: NEEDS IMPROVEMENT (${warningCount} warnings)`);
      this.results.optional.codeQuality = { status: 'NEEDS_IMPROVEMENT', warnings: warningCount };
    }
    
    return true; // Never block deployment for code quality
  }

  // =========================================
  // INTELLIGENT VALIDATION ORCHESTRATION
  // =========================================

  async runEssentialValidation() {
    console.log('🚨 ESSENTIAL VALIDATION (Deployment Blocking)');
    console.log('='.repeat(50));
    
    const essentialChecks = await Promise.allSettled([
      this.validateTypeScript(),
      this.validateESLintErrors(), 
      this.validateBuild(),
      this.validateCriticalPaths()
    ]);
    
    const essentialResults = essentialChecks.map(result => result.value);
    const allEssentialPass = essentialResults.every(Boolean);
    
    this.results.essential.overall = allEssentialPass;
    return allEssentialPass;
  }

  async runOptionalValidation() {
    console.log('\\n🌟 OPTIONAL VALIDATION (Quality Improvement)');
    console.log('='.repeat(50));
    
    const optionalChecks = await Promise.allSettled([
      this.validateTests(),
      this.validateCodeQuality()
    ]);
    
    const optionalResults = optionalChecks.map(result => result.value);
    const allOptionalPass = optionalResults.every(Boolean);
    
    this.results.optional.overall = allOptionalPass;
    return allOptionalPass;
  }

  displayResults(essentialPass, optionalPass) {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('\\n' + '='.repeat(60));
    console.log('🏁 INTELLIGENT PREDEPLOY RESULTS');
    console.log('='.repeat(60));
    console.log(`⏱️ Total time: ${elapsed}s`);
    
    // Essential Results
    console.log('\\n🚨 ESSENTIAL (Deployment Blocking):');
    console.log(`   TypeScript: ${this.results.essential.typescript?.status || 'UNKNOWN'}`);
    console.log(`   ESLint Errors: ${this.results.essential.eslint?.status || 'UNKNOWN'}`);
    console.log(`   Build: ${this.results.essential.build?.status || 'UNKNOWN'}`);
    console.log(`   Critical Paths: ${this.results.essential.criticalPaths?.status || 'UNKNOWN'}`);
    
    // Optional Results  
    console.log('\\n🌟 OPTIONAL (Quality Improvement):');
    console.log(`   Tests: ${this.results.optional.tests?.status || 'UNKNOWN'}`);
    console.log(`   Code Quality: ${this.results.optional.codeQuality?.status || 'UNKNOWN'}`);
    
    // Final Decision
    console.log('\\n🎯 DEPLOYMENT DECISION:');
    if (essentialPass) {
      console.log('✅ DEPLOYMENT APPROVED');
      console.log('🚀 Core systems validated - Safe to deploy');
      
      if (optionalPass) {
        console.log('🌟 PERFECT QUALITY - All systems optimal');
      } else {
        console.log('⚠️ Quality improvements recommended (non-blocking)');
      }
    } else {
      console.log('❌ DEPLOYMENT BLOCKED');
      console.log('🚫 Core systems failing - Manual intervention required');
    }
    
    console.log('='.repeat(60));
  }

  async run() {
    try {
      const essentialPass = await this.runEssentialValidation();
      const optionalPass = await this.runOptionalValidation();
      
      this.displayResults(essentialPass, optionalPass);
      
      // Exit codes: 0 = can deploy, 1 = cannot deploy
      process.exit(essentialPass ? 0 : 1);
      
    } catch (error) {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const predeploy = new IntelligentPredeploy();
  predeploy.run();
}

module.exports = IntelligentPredeploy;
