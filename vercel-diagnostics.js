#!/usr/bin/env node
/**
 * Vercel Deployment Diagnostics Tool
 * Provides comprehensive feedback on Vercel deployment failures
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelDiagnostics {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.startTime = Date.now();
    this.diagnostics = [];
    
    console.log('🔍 VERCEL DEPLOYMENT DIAGNOSTICS');
    console.log('=================================');
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
        return error.stdout || error.stderr || error.message;
      }
      throw error;
    }
  }

  async checkVercelCLI() {
    console.log('📋 VERCEL CLI SETUP');
    console.log('===================');
    
    try {
      const version = this.runCommand('vercel --version', { silent: true });
      console.log(`✅ Vercel CLI installed: ${version.trim()}`);
      
      // Check authentication
      try {
        const whoami = this.runCommand('vercel whoami', { silent: true });
        console.log(`✅ Authenticated as: ${whoami.trim()}`);
      } catch (error) {
        console.log('❌ Not authenticated with Vercel CLI');
        console.log('💡 Run: vercel login');
        this.diagnostics.push({
          type: 'ERROR',
          category: 'Authentication',
          issue: 'Not logged into Vercel CLI',
          solution: 'Run: vercel login'
        });
      }
      
    } catch (error) {
      console.log('❌ Vercel CLI not installed');
      console.log('💡 Install: npm i -g vercel');
      this.diagnostics.push({
        type: 'ERROR',
        category: 'CLI',
        issue: 'Vercel CLI not installed',
        solution: 'Run: npm i -g vercel'
      });
    }
    
    console.log();
  }

  async checkProjectConfiguration() {
    console.log('📋 PROJECT CONFIGURATION');
    console.log('========================');
    
    // Check vercel.json
    const vercelConfigPath = path.join(this.workspaceRoot, 'vercel.json');
    if (fs.existsSync(vercelConfigPath)) {
      console.log('✅ vercel.json found');
      try {
        const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
        console.log(`   📝 Version: ${config.version || 'not specified'}`);
        console.log(`   📝 Build config: ${config.build ? 'present' : 'default'}`);
        console.log(`   📝 Functions config: ${config.functions ? 'present' : 'default'}`);
      } catch (error) {
        console.log('⚠️ vercel.json syntax error');
        this.diagnostics.push({
          type: 'WARNING',
          category: 'Configuration',
          issue: 'vercel.json syntax error',
          solution: 'Validate JSON syntax'
        });
      }
    } else {
      console.log('ℹ️ No vercel.json (using defaults)');
    }
    
    // Check package.json
    const packagePath = path.join(this.workspaceRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      console.log('✅ package.json found');
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log(`   📝 Build script: ${pkg.scripts?.build ? '✅ present' : '❌ missing'}`);
        console.log(`   📝 Start script: ${pkg.scripts?.start ? '✅ present' : '❌ missing'}`);
        console.log(`   📝 Node engine: ${pkg.engines?.node || 'not specified'}`);
        
        if (!pkg.scripts?.build) {
          this.diagnostics.push({
            type: 'ERROR',
            category: 'Package Scripts',
            issue: 'Missing build script',
            solution: 'Add "build": "next build" to package.json scripts'
          });
        }
      } catch (error) {
        console.log('❌ package.json syntax error');
        this.diagnostics.push({
          type: 'ERROR',
          category: 'Configuration',
          issue: 'package.json syntax error',
          solution: 'Fix JSON syntax in package.json'
        });
      }
    }
    
    console.log();
  }

  async checkBuildProcess() {
    console.log('📋 BUILD PROCESS VALIDATION');
    console.log('===========================');
    
    try {
      console.log('🏗️ Testing local build...');
      const buildOutput = this.runCommand('npm run build', { 
        ignoreErrors: true, 
        silent: true,
        timeout: 120000 // 2 minutes
      });
      
      if (buildOutput.includes('✓ Compiled successfully')) {
        console.log('✅ Local build successful');
        
        // Check build output
        const nextDir = path.join(this.workspaceRoot, '.next');
        if (fs.existsSync(nextDir)) {
          const buildStats = fs.statSync(nextDir);
          console.log(`   📁 Build output created: ${buildStats.isDirectory() ? '✅ directory' : '❌ not directory'}`);
          
          // Check for static files
          const staticDir = path.join(nextDir, 'static');
          if (fs.existsSync(staticDir)) {
            console.log('   📄 Static assets generated: ✅');
          } else {
            console.log('   📄 Static assets: ⚠️ not found');
          }
        }
      } else {
        console.log('❌ Local build failed');
        console.log('Build Output:', buildOutput.substring(0, 500));
        this.diagnostics.push({
          type: 'ERROR',
          category: 'Build',
          issue: 'Local build fails',
          solution: 'Fix build errors shown above',
          details: buildOutput
        });
      }
    } catch (error) {
      console.log('❌ Build process error:', error.message);
      this.diagnostics.push({
        type: 'ERROR',
        category: 'Build',
        issue: 'Build process crashed',
        solution: 'Check build script and dependencies',
        details: error.message
      });
    }
    
    console.log();
  }

  async checkDependencies() {
    console.log('📋 DEPENDENCY ANALYSIS');
    console.log('======================');
    
    try {
      // Check for lockfile
      const hasPackageLock = fs.existsSync(path.join(this.workspaceRoot, 'package-lock.json'));
      const hasYarnLock = fs.existsSync(path.join(this.workspaceRoot, 'yarn.lock'));
      const hasPnpmLock = fs.existsSync(path.join(this.workspaceRoot, 'pnpm-lock.yaml'));
      
      console.log(`📦 npm lockfile: ${hasPackageLock ? '✅' : '❌'}`);
      console.log(`📦 yarn lockfile: ${hasYarnLock ? '✅' : '❌'}`);
      console.log(`📦 pnpm lockfile: ${hasPnpmLock ? '✅' : '❌'}`);
      
      if (!hasPackageLock && !hasYarnLock && !hasPnpmLock) {
        this.diagnostics.push({
          type: 'WARNING',
          category: 'Dependencies',
          issue: 'No lockfile found',
          solution: 'Run npm install to generate package-lock.json'
        });
      }
      
      // Check node_modules
      const nodeModulesExists = fs.existsSync(path.join(this.workspaceRoot, 'node_modules'));
      console.log(`📁 node_modules: ${nodeModulesExists ? '✅' : '❌'}`);
      
      if (!nodeModulesExists) {
        this.diagnostics.push({
          type: 'ERROR',
          category: 'Dependencies',
          issue: 'node_modules not found',
          solution: 'Run npm install'
        });
      }
      
    } catch (error) {
      console.log('❌ Dependency check failed:', error.message);
    }
    
    console.log();
  }

  async performVercelDeployment(dryRun = false) {
    console.log(`📋 VERCEL DEPLOYMENT ${dryRun ? '(DRY RUN)' : ''}`);
    console.log('========================');
    
    if (this.diagnostics.filter(d => d.type === 'ERROR').length > 0) {
      console.log('⚠️ Skipping deployment due to errors found above');
      return false;
    }
    
    try {
      const deployCommand = dryRun ? 'vercel build' : 'vercel --prod';
      console.log(`🚀 Running: ${deployCommand}`);
      
      // For actual deployment, show live output
      if (!dryRun) {
        const child = spawn('vercel', ['--prod'], {
          cwd: this.workspaceRoot,
          stdio: 'inherit'
        });
        
        return new Promise((resolve, reject) => {
          child.on('exit', (code) => {
            if (code === 0) {
              console.log('\n✅ Deployment successful!');
              resolve(true);
            } else {
              console.log(`\n❌ Deployment failed with exit code: ${code}`);
              reject(new Error(`Deployment failed with code ${code}`));
            }
          });
          
          child.on('error', (error) => {
            console.log('\n❌ Deployment process error:', error.message);
            reject(error);
          });
        });
      } else {
        // Dry run - just check if command would work
        const result = this.runCommand('vercel build', { 
          ignoreErrors: true, 
          silent: false,
          timeout: 180000 // 3 minutes
        });
        
        if (result.includes('Build Completed')) {
          console.log('✅ Dry run successful - deployment should work');
          return true;
        } else {
          console.log('❌ Dry run failed');
          console.log('Output:', result);
          return false;
        }
      }
      
    } catch (error) {
      console.log('❌ Deployment failed:', error.message);
      this.diagnostics.push({
        type: 'ERROR',
        category: 'Deployment',
        issue: 'Deployment process failed',
        solution: 'Check error details above',
        details: error.message
      });
      return false;
    }
  }

  async getDeploymentLogs() {
    console.log('📋 RECENT DEPLOYMENT LOGS');
    console.log('=========================');
    
    try {
      const logs = this.runCommand('vercel logs --limit=10', { silent: true });
      console.log(logs);
    } catch (error) {
      console.log('⚠️ Could not fetch deployment logs');
      console.log('💡 Run: vercel logs manually to see recent deployments');
    }
    
    console.log();
  }

  printDiagnosticsSummary() {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('🎯 DIAGNOSTICS SUMMARY');
    console.log('======================');
    console.log(`⏱️ Analysis Time: ${totalTime}s`);
    
    const errors = this.diagnostics.filter(d => d.type === 'ERROR');
    const warnings = this.diagnostics.filter(d => d.type === 'WARNING');
    
    console.log(`🚨 Errors: ${errors.length}`);
    console.log(`⚠️ Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES TO FIX:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.category}: ${error.issue}`);
        console.log(`   💡 Solution: ${error.solution}`);
        if (error.details) {
          console.log(`   📝 Details: ${error.details.substring(0, 200)}...`);
        }
        console.log();
      });
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ WARNINGS TO CONSIDER:');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.category}: ${warning.issue}`);
        console.log(`   💡 Solution: ${warning.solution}`);
        console.log();
      });
    }
    
    if (errors.length === 0) {
      console.log('\n🎉 No critical issues found! Your project should deploy successfully.');
    } else {
      console.log('\n❌ Please fix the critical issues above before deploying.');
    }
  }

  async run(mode = 'diagnose') {
    try {
      await this.checkVercelCLI();
      await this.checkProjectConfiguration();
      await this.checkDependencies();
      await this.checkBuildProcess();
      
      if (mode === 'deploy' || mode === 'dry-run') {
        const success = await this.performVercelDeployment(mode === 'dry-run');
        if (!success && mode === 'deploy') {
          await this.getDeploymentLogs();
        }
      }
      
      this.printDiagnosticsSummary();
      
      const hasErrors = this.diagnostics.filter(d => d.type === 'ERROR').length > 0;
      process.exit(hasErrors ? 1 : 0);
      
    } catch (error) {
      console.error('\n❌ Diagnostics failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const mode = process.argv[2] || 'diagnose';
  
  if (!['diagnose', 'dry-run', 'deploy'].includes(mode)) {
    console.log('Usage: node vercel-diagnostics.js [diagnose|dry-run|deploy]');
    console.log('  diagnose: Check configuration and build process');
    console.log('  dry-run:  Test deployment without actually deploying');
    console.log('  deploy:   Perform actual deployment with detailed feedback');
    process.exit(1);
  }
  
  const diagnostics = new VercelDiagnostics();
  diagnostics.run(mode);
}

module.exports = VercelDiagnostics;
