#!/usr/bin/env node
/**
 * NoopContext Error Fix Utility
 * Specifically addresses the util_1.NoopContext constructor error
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class NoopContextFixer {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.fixesAttempted = [];
    this.fixesSuccessful = [];
  }

  log(message, type = 'info') {
    const prefix = {
      'info': '✅',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🔍',
      'fix': '🔧'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} ${message}`);
  }

  runCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.workspaceRoot,
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return { 
        success: false, 
        output: error.stdout || error.stderr || '',
        error: error.message 
      };
    }
  }

  async testBuild() {
    this.log('Testing current build status...', 'debug');
    const result = this.runCommand('npm run build', { silent: true });
    
    if (result.success) {
      this.log('Build successful!', 'info');
      return true;
    } else if (result.output.includes('NoopContext is not a constructor')) {
      this.log('NoopContext error confirmed', 'error');
      return false;
    } else {
      this.log('Different build error detected', 'warn');
      console.log('Error output:', result.output.slice(0, 500));
      return false;
    }
  }

  async fix1_UpdateDependencies() {
    this.log('Fix 1: Updating Next.js and React dependencies...', 'fix');
    this.fixesAttempted.push('dependency-update');
    
    try {
      // Update core dependencies
      const updateResult = this.runCommand('npm update next react react-dom @types/react @types/react-dom', { silent: true });
      
      if (updateResult.success) {
        this.log('Dependencies updated successfully', 'info');
        this.fixesSuccessful.push('dependency-update');
        return true;
      } else {
        this.log('Dependency update failed', 'warn');
        return false;
      }
    } catch (error) {
      this.log(`Dependency update error: ${error.message}`, 'error');
      return false;
    }
  }

  async fix2_ClearCaches() {
    this.log('Fix 2: Clearing all caches and rebuilding...', 'fix');
    this.fixesAttempted.push('cache-clear');
    
    try {
      // Clear Next.js cache
      this.runCommand('rm -rf .next', { silent: true });
      
      // Clear node modules cache
      this.runCommand('rm -rf node_modules/.cache', { silent: true });
      
      // Clear npm cache
      this.runCommand('npm cache clean --force', { silent: true });
      
      // Reinstall dependencies
      const installResult = this.runCommand('npm install', { silent: true });
      
      if (installResult.success) {
        this.log('Caches cleared and dependencies reinstalled', 'info');
        this.fixesSuccessful.push('cache-clear');
        return true;
      } else {
        this.log('Cache clear/reinstall failed', 'warn');
        return false;
      }
    } catch (error) {
      this.log(`Cache clear error: ${error.message}`, 'error');
      return false;
    }
  }

  async fix3_CheckNextjsCompatibility() {
    this.log('Fix 3: Checking Next.js version compatibility...', 'fix');
    this.fixesAttempted.push('nextjs-compatibility');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.workspaceRoot, 'package.json'), 'utf8'));
      const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
      
      this.log(`Current Next.js version: ${nextVersion}`, 'debug');
      
      // Check if we're using a compatible version
      if (nextVersion && nextVersion.includes('15.')) {
        this.log('Next.js 15.x detected - potential compatibility issue', 'warn');
        
        // Try downgrading to stable version
        const downgradeResult = this.runCommand('npm install next@14.2.18', { silent: true });
        
        if (downgradeResult.success) {
          this.log('Downgraded to Next.js 14.2.18 (stable)', 'info');
          this.fixesSuccessful.push('nextjs-compatibility');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.log(`Next.js compatibility check error: ${error.message}`, 'error');
      return false;
    }
  }

  async fix4_FixTypeScriptConfig() {
    this.log('Fix 4: Optimizing TypeScript configuration...', 'fix');
    this.fixesAttempted.push('typescript-config');
    
    try {
      const tsconfigPath = path.join(this.workspaceRoot, 'tsconfig.json');
      
      if (fs.existsSync(tsconfigPath)) {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        
        // Ensure proper module resolution
        tsconfig.compilerOptions = tsconfig.compilerOptions || {};
        tsconfig.compilerOptions.moduleResolution = 'node';
        tsconfig.compilerOptions.allowSyntheticDefaultImports = true;
        tsconfig.compilerOptions.esModuleInterop = true;
        
        // Write back the configuration
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        
        this.log('TypeScript configuration optimized', 'info');
        this.fixesSuccessful.push('typescript-config');
        return true;
      }
      
      return false;
    } catch (error) {
      this.log(`TypeScript config error: ${error.message}`, 'error');
      return false;
    }
  }

  async fix5_CheckNodeModulesIntegrity() {
    this.log('Fix 5: Checking node_modules integrity...', 'fix');
    this.fixesAttempted.push('node-modules-integrity');
    
    try {
      // Remove and reinstall node_modules completely
      this.runCommand('rm -rf node_modules package-lock.json', { silent: true });
      
      const installResult = this.runCommand('npm install', { silent: true });
      
      if (installResult.success) {
        this.log('Node modules reinstalled from scratch', 'info');
        this.fixesSuccessful.push('node-modules-integrity');
        return true;
      } else {
        this.log('Fresh node_modules install failed', 'warn');
        return false;
      }
    } catch (error) {
      this.log(`Node modules integrity check error: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllFixes() {
    console.log('🔧 NOOP CONTEXT ERROR FIXER');
    console.log('============================');
    console.log(`📁 Workspace: ${this.workspaceRoot}\n`);
    
    // Test initial state
    const initialBuildWorks = await this.testBuild();
    if (initialBuildWorks) {
      this.log('Build is already working! No fixes needed.', 'info');
      return true;
    }
    
    // Apply fixes sequentially, testing after each one
    const fixes = [
      () => this.fix1_UpdateDependencies(),
      () => this.fix2_ClearCaches(),
      () => this.fix3_CheckNextjsCompatibility(),
      () => this.fix4_FixTypeScriptConfig(),
      () => this.fix5_CheckNodeModulesIntegrity()
    ];
    
    for (let i = 0; i < fixes.length; i++) {
      console.log(`\n--- Applying Fix ${i + 1} ---`);
      
      const fixResult = await fixes[i]();
      
      if (fixResult) {
        // Test if this fix resolved the issue
        const buildWorks = await this.testBuild();
        
        if (buildWorks) {
          this.log(`🎉 Issue resolved with Fix ${i + 1}!`, 'info');
          this.printSummary(true);
          return true;
        } else {
          this.log(`Fix ${i + 1} applied but issue persists`, 'warn');
        }
      } else {
        this.log(`Fix ${i + 1} failed to apply`, 'error');
      }
    }
    
    // All fixes attempted but issue persists
    this.log('All fixes attempted but NoopContext error persists', 'error');
    this.printSummary(false);
    return false;
  }

  printSummary(success) {
    console.log('\n🎯 NOOP CONTEXT FIX SUMMARY');
    console.log('============================');
    console.log(`📊 Fixes attempted: ${this.fixesAttempted.length}`);
    console.log(`✅ Fixes successful: ${this.fixesSuccessful.length}`);
    console.log(`🎯 Final result: ${success ? 'RESOLVED' : 'UNRESOLVED'}`);
    
    if (this.fixesSuccessful.length > 0) {
      console.log('\n✅ Successful fixes:');
      this.fixesSuccessful.forEach(fix => console.log(`   • ${fix}`));
    }
    
    if (!success) {
      console.log('\n🔍 Next steps for manual resolution:');
      console.log('   • Check Next.js GitHub issues for NoopContext errors');
      console.log('   • Verify all peer dependencies are compatible');
      console.log('   • Consider using a different Next.js version');
      console.log('   • Check for conflicting webpack configurations');
    }
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new NoopContextFixer();
  fixer.runAllFixes().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('NoopContext fixer failed:', error);
    process.exit(1);
  });
}

module.exports = NoopContextFixer;
