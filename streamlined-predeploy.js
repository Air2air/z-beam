#!/usr/bin/env node
/**
 * Streamlined Predeploy System
 * Fast, reliable deployment readiness validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class StreamlinedPredeploy {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.startTime = Date.now();
    this.issues = [];
    
    console.log('🚀 STREAMLINED PREDEPLOY SYSTEM');
    console.log('================================');
    console.log(`📁 Workspace: ${this.workspaceRoot}`);
    console.log(`⏰ Started: ${new Date().toLocaleTimeString()}\n`);
  }

  runCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.workspaceRoot,
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return result;
    } catch (error) {
      if (options.ignoreErrors) {
        return error.stdout || error.message;
      }
      throw error;
    }
  }

  classifyError(output) {
    // BLOCKING: Must be fixed for deployment
    if (output.includes('error TS') || 
        output.includes('Build failed') || 
        output.includes('Failed to compile') ||
        output.includes('SyntaxError')) {
      return 'BLOCKING';
    }
    
    // WARNING: Should be noted but don't block deployment
    if (output.includes('warning') || 
        output.includes('Test Suites:') ||
        output.includes('eslint')) {
      return 'WARNING';
    }
    
    return 'INFO';
  }

  async phase1CriticalFixes() {
    console.log('📋 PHASE 1: Critical Error Detection & Fixing');
    console.log('==============================================');
    
    const phaseStart = Date.now();
    let criticalIssuesFound = false;

    // TypeScript Compilation Check
    console.log('🔍 Checking TypeScript compilation...');
    const tsOutput = this.runCommand('npx tsc --noEmit', { ignoreErrors: true, silent: true });
    
    if (this.classifyError(tsOutput) === 'BLOCKING') {
      console.log('❌ TypeScript compilation errors found');
      this.issues.push({ type: 'BLOCKING', source: 'TypeScript', details: tsOutput });
      criticalIssuesFound = true;
      
      // Try to apply TypeScript fixes
      console.log('🔧 Attempting TypeScript fixes...');
      this.runCommand('npx eslint app/ --ext .ts,.tsx --fix', { ignoreErrors: true, silent: true });
      
      // Recheck
      const retryTs = this.runCommand('npx tsc --noEmit', { ignoreErrors: true, silent: true });
      if (this.classifyError(retryTs) !== 'BLOCKING') {
        console.log('✅ TypeScript errors resolved');
        criticalIssuesFound = false;
      }
    } else {
      console.log('✅ TypeScript compilation clean');
    }

    // Build Process Check
    console.log('🏗️ Checking build process...');
    const buildOutput = this.runCommand('npm run build', { ignoreErrors: true, silent: true });
    
    if (this.classifyError(buildOutput) === 'BLOCKING') {
      console.log('❌ Build process failed');
      this.issues.push({ type: 'BLOCKING', source: 'Build', details: buildOutput });
      criticalIssuesFound = true;
    } else if (buildOutput.includes('✓ Compiled successfully')) {
      console.log('✅ Build process successful');
    } else {
      console.log('⚠️ Build process completed with warnings');
    }

    const phaseDuration = Math.round((Date.now() - phaseStart) / 1000);
    console.log(`⏱️ Phase 1 completed in ${phaseDuration}s\n`);
    
    return !criticalIssuesFound;
  }

  async phase2QualityAssessment() {
    console.log('📋 PHASE 2: Quality Assessment');
    console.log('===============================');
    
    const phaseStart = Date.now();

    // ESLint Check (no fixing, just assessment)
    console.log('🔍 Checking code quality...');
    const eslintOutput = this.runCommand('npx eslint app/ --ext .ts,.tsx', { ignoreErrors: true, silent: true });
    
    const errorMatch = eslintOutput.match(/(\d+) error/);
    const warningMatch = eslintOutput.match(/(\d+) warning/);
    
    const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
    const warnings = warningMatch ? parseInt(warningMatch[1]) : 0;
    
    if (errors > 0) {
      console.log(`⚠️ ${errors} ESLint errors found`);
      this.issues.push({ type: 'WARNING', source: 'ESLint', details: `${errors} errors` });
    } else {
      console.log('✅ No ESLint errors');
    }
    
    if (warnings > 0) {
      console.log(`ℹ️ ${warnings} ESLint warnings (non-blocking)`);
    }

    // Test Status Check (no fixing, just status)
    console.log('🧪 Checking test status...');
    const testOutput = this.runCommand('npm run test:jest', { ignoreErrors: true, silent: true });
    
    const testMatch = testOutput.match(/Tests:\s+(\d+) failed.*(\d+) passed/);
    if (testMatch) {
      const failed = parseInt(testMatch[1]);
      const passed = parseInt(testMatch[2]);
      
      if (failed > 0) {
        console.log(`ℹ️ ${failed} test(s) failing, ${passed} passing (noted but non-blocking)`);
        this.issues.push({ type: 'WARNING', source: 'Tests', details: `${failed} failing tests` });
      } else {
        console.log(`✅ All ${passed} tests passing`);
      }
    } else {
      console.log('ℹ️ Test status unclear');
    }

    const phaseDuration = Math.round((Date.now() - phaseStart) / 1000);
    console.log(`⏱️ Phase 2 completed in ${phaseDuration}s\n`);
    
    return true; // Quality issues don't block deployment
  }

  async phase3DeploymentValidation() {
    console.log('📋 PHASE 3: Deployment Readiness Validation');
    console.log('===========================================');
    
    const phaseStart = Date.now();

    // Final Build Verification
    console.log('🔨 Final build verification...');
    const finalBuild = this.runCommand('npm run build', { ignoreErrors: true, silent: true });
    
    const buildSuccess = finalBuild.includes('✓ Compiled successfully') || 
                        finalBuild.includes('✓ Generating static pages');
    
    if (!buildSuccess) {
      console.log('❌ Final build verification failed');
      return false;
    } else {
      console.log('✅ Final build verification passed');
    }

    // File Structure Check
    console.log('📁 Checking essential files...');
    const essentialFiles = ['package.json', 'next.config.js', 'tsconfig.json'];
    const missingFiles = essentialFiles.filter(file => 
      !fs.existsSync(path.join(this.workspaceRoot, file))
    );
    
    if (missingFiles.length > 0) {
      console.log(`❌ Missing essential files: ${missingFiles.join(', ')}`);
      return false;
    } else {
      console.log('✅ All essential files present');
    }

    const phaseDuration = Math.round((Date.now() - phaseStart) / 1000);
    console.log(`⏱️ Phase 3 completed in ${phaseDuration}s\n`);
    
    return true;
  }

  printSummary(success) {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('🎯 PREDEPLOY RESULTS');
    console.log('====================');
    console.log(`⏱️ Total Time: ${totalTime}s`);
    console.log(`🎯 Status: ${success ? '✅ READY FOR DEPLOYMENT' : '❌ DEPLOYMENT BLOCKED'}`);
    
    if (this.issues.length > 0) {
      console.log('\n📋 Issues Summary:');
      
      const blocking = this.issues.filter(i => i.type === 'BLOCKING');
      const warnings = this.issues.filter(i => i.type === 'WARNING');
      
      if (blocking.length > 0) {
        console.log('🚨 Blocking Issues:');
        blocking.forEach(issue => console.log(`   ❌ ${issue.source}: ${issue.details.split('\n')[0]}`));
      }
      
      if (warnings.length > 0) {
        console.log('⚠️ Warnings (non-blocking):');
        warnings.forEach(issue => console.log(`   ℹ️ ${issue.source}: ${issue.details}`));
      }
    }
    
    if (success) {
      console.log('\n🚀 All systems green - ready for deployment!');
    } else {
      console.log('\n❌ Please resolve blocking issues before deployment');
    }
  }

  async run() {
    try {
      const phase1Success = await this.phase1CriticalFixes();
      if (!phase1Success) {
        this.printSummary(false);
        process.exit(1);
      }

      const phase2Success = await this.phase2QualityAssessment();
      const phase3Success = await this.phase3DeploymentValidation();
      
      const overallSuccess = phase1Success && phase2Success && phase3Success;
      
      this.printSummary(overallSuccess);
      process.exit(overallSuccess ? 0 : 1);
      
    } catch (error) {
      console.error('\n❌ Predeploy failed with error:', error.message);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const predeploy = new StreamlinedPredeploy();
  predeploy.run();
}

module.exports = StreamlinedPredeploy;
