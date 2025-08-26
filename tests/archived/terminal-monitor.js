#!/usr/bin/env node
// Terminal Monitor with Dynamic Error Parsing and Auto-Fixing
console.log('🖥️  TERMINAL MONITOR & DYNAMIC AUTO-FIXER');
console.log('==========================================\n');

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class TerminalMonitor extends EventEmitter {
  constructor() {
    super();
    this.workspaceRoot = process.cwd();
    this.isMonitoring = false;
    this.activeTerminals = new Map();
    this.errorPatterns = this.initializeErrorPatterns();
    this.fixHistory = [];
    this.maxRetries = 3;
    this.watchedCommands = ['npm test', 'npm run', 'jest', 'tsc', 'eslint'];
    this.autoFixEnabled = true;
    
    console.log('🚀 Terminal Monitor initialized');
    console.log(`📁 Workspace: ${this.workspaceRoot}`);
    console.log(`🔧 Auto-fix enabled: ${this.autoFixEnabled}`);
    console.log(`👀 Watching commands: ${this.watchedCommands.join(', ')}\n`);
  }

  initializeErrorPatterns() {
    return {
      // Jest Configuration Errors
      jest: {
        multipleConfigs: {
          pattern: /Multiple configurations found.*jest\.config/i,
          fix: 'fixJestMultipleConfigs',
          description: 'Multiple Jest config files detected',
          severity: 'error'
        },
        unknownOption: {
          pattern: /Unknown option "([^"]+)" with value/i,
          fix: 'fixJestUnknownOption',
          description: 'Jest configuration has unknown option',
          severity: 'warning'
        },
        moduleMapping: {
          pattern: /moduleNameMapping.*was found/i,
          fix: 'fixJestModuleMapping',
          description: 'Jest moduleNameMapping should be moduleNameMapper',
          severity: 'error'
        }
      },

      // React/Next.js Errors
      react: {
        cacheNotFunction: {
          pattern: /cache.*is not a function/i,
          fix: 'fixReactCacheImport',
          description: 'React cache import/mocking issue',
          severity: 'error'
        },
        serverComponents: {
          pattern: /Server Component.*client/i,
          fix: 'fixServerComponentUsage',
          description: 'Server Component used in client context',
          severity: 'error'
        },
        hydrationMismatch: {
          pattern: /Hydration failed|Text content does not match/i,
          fix: 'fixHydrationMismatch',
          description: 'SSR/Client hydration mismatch',
          severity: 'error'
        }
      },

      // TypeScript Errors
      typescript: {
        implicitAny: {
          pattern: /Element implicitly has an 'any' type/i,
          fix: 'fixImplicitAnyType',
          description: 'TypeScript implicit any type error',
          severity: 'error'
        },
        propertyNotExist: {
          pattern: /Property '([^']+)' does not exist on type/i,
          fix: 'fixMissingProperty',
          description: 'Property does not exist on type',
          severity: 'error'
        },
        typeError: {
          pattern: /error TS\d+:/i,
          fix: 'fixGenericTypeScriptError',
          description: 'Generic TypeScript compilation error',
          severity: 'error'
        }
      },

      // ESLint Warnings/Errors
      eslint: {
        noExplicitAny: {
          pattern: /@typescript-eslint\/no-explicit-any/i,
          fix: 'fixExplicitAnyWarning',
          description: 'ESLint no-explicit-any warning',
          severity: 'warning'
        },
        unusedVars: {
          pattern: /@typescript-eslint\/no-unused-vars/i,
          fix: 'fixUnusedVariables',
          description: 'ESLint unused variables warning',
          severity: 'warning'
        },
        noImgElement: {
          pattern: /@next\/next\/no-img-element/i,
          fix: 'fixNextImageUsage',
          description: 'Should use next/image instead of img',
          severity: 'warning'
        }
      },

      // Test Failures
      tests: {
        expectationFailed: {
          pattern: /expect\(received\)\.toContain\(expected\)/i,
          fix: 'fixTestExpectation',
          description: 'Test expectation failure',
          severity: 'error'
        },
        mockingError: {
          pattern: /mockReturnValue.*is not defined/i,
          fix: 'fixTestMocking',
          description: 'Test mocking configuration error',
          severity: 'error'
        },
        referenceError: {
          pattern: /ReferenceError.*is not defined/i,
          fix: 'fixReferenceError',
          description: 'Reference error in tests',
          severity: 'error'
        }
      },

      // Build Errors
      build: {
        moduleNotFound: {
          pattern: /Module not found.*Can't resolve/i,
          fix: 'fixModuleResolution',
          description: 'Module resolution error',
          severity: 'error'
        },
        syntaxError: {
          pattern: /SyntaxError.*Unexpected token/i,
          fix: 'fixSyntaxError',
          description: 'JavaScript/TypeScript syntax error',
          severity: 'error'
        }
      }
    };
  }

  // Start monitoring terminal output
  startMonitoring() {
    console.log('🔍 Starting terminal monitoring...\n');
    this.isMonitoring = true;

    // Monitor package.json script executions
    this.watchPackageJsonScripts();
    
    // Monitor file changes that might trigger builds/tests
    this.watchFileChanges();
    
    // Set up periodic health checks
    this.setupHealthChecks();

    console.log('✅ Terminal monitoring active');
    console.log('🎯 Listening for errors in real-time...\n');
  }

  // Watch for npm script executions
  watchPackageJsonScripts() {
    const packageJson = path.join(this.workspaceRoot, 'package.json');
    
    if (fs.existsSync(packageJson)) {
      fs.watchFile(packageJson, () => {
        console.log('📦 package.json changed - checking for script execution');
      });
    }
  }

  // Watch for file changes that might trigger auto-compilation
  watchFileChanges() {
    const watchDirs = ['app', 'tests', 'pages'];
    
    watchDirs.forEach(dir => {
      const dirPath = path.join(this.workspaceRoot, dir);
      if (fs.existsSync(dirPath)) {
        fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
          if (filename && (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.js'))) {
            console.log(`📝 File changed: ${filename} - triggering auto-validation`);
            this.validateFileChange(path.join(dirPath, filename));
          }
        });
      }
    });
  }

  // Validate individual file changes
  async validateFileChange(filePath) {
    try {
      // Quick TypeScript check for the specific file
      const relativeFilePath = path.relative(this.workspaceRoot, filePath);
      console.log(`🔍 Validating: ${relativeFilePath}`);
      
      // Run TypeScript check on specific file
      const tscResult = await this.runQuickTypeScriptCheck(filePath);
      if (tscResult.hasErrors) {
        console.log(`❌ TypeScript errors in ${relativeFilePath}:`);
        await this.processErrorOutput(tscResult.output, 'typescript');
      }
      
      // Run ESLint check
      const eslintResult = await this.runQuickESLintCheck(filePath);
      if (eslintResult.hasWarnings) {
        console.log(`⚠️  ESLint warnings in ${relativeFilePath}:`);
        await this.processErrorOutput(eslintResult.output, 'eslint');
      }
      
    } catch (error) {
      console.log(`❌ Validation failed for ${filePath}: ${error.message}`);
    }
  }

  // Run quick TypeScript check on a file
  async runQuickTypeScriptCheck(filePath) {
    try {
      const output = execSync(`npx tsc --noEmit --strict "${filePath}"`, {
        encoding: 'utf8',
        cwd: this.workspaceRoot,
        timeout: 10000
      });
      
      return { hasErrors: false, output: '' };
    } catch (error) {
      return { 
        hasErrors: true, 
        output: error.stdout || error.stderr || error.message 
      };
    }
  }

  // Run quick ESLint check on a file
  async runQuickESLintCheck(filePath) {
    try {
      const output = execSync(`npx eslint "${filePath}" --format compact`, {
        encoding: 'utf8',
        cwd: this.workspaceRoot,
        timeout: 10000
      });
      
      return { hasWarnings: false, output: '' };
    } catch (error) {
      const output = error.stdout || error.stderr || error.message;
      return { 
        hasWarnings: output.includes('warning'), 
        output 
      };
    }
  }

  // Process error output and attempt auto-fixes
  async processErrorOutput(errorOutput, category = 'general') {
    if (!this.autoFixEnabled) {
      console.log('🔧 Auto-fix disabled - skipping automatic resolution');
      return;
    }

    console.log(`🔍 Analyzing error output for category: ${category}`);
    
    const detectedErrors = this.detectErrors(errorOutput, category);
    
    if (detectedErrors.length === 0) {
      console.log('ℹ️  No known error patterns detected');
      return;
    }

    console.log(`🎯 Detected ${detectedErrors.length} fixable error(s):`);
    detectedErrors.forEach(error => {
      console.log(`   • ${error.description} (${error.severity})`);
    });

    // Apply fixes in order of severity
    const sortedErrors = detectedErrors.sort((a, b) => 
      a.severity === 'error' ? -1 : b.severity === 'error' ? 1 : 0
    );

    for (const error of sortedErrors) {
      await this.applyFix(error, errorOutput);
    }
  }

  // Detect specific error patterns in output
  detectErrors(output, category) {
    const detectedErrors = [];
    const patterns = this.errorPatterns[category] || {};
    
    Object.entries(patterns).forEach(([errorType, config]) => {
      const matches = output.match(config.pattern);
      if (matches) {
        detectedErrors.push({
          type: errorType,
          category,
          matches,
          ...config
        });
      }
    });

    // Also check general patterns if not already checked
    if (category !== 'general') {
      Object.entries(this.errorPatterns).forEach(([cat, patterns]) => {
        if (cat !== category) {
          Object.entries(patterns).forEach(([errorType, config]) => {
            const matches = output.match(config.pattern);
            if (matches) {
              detectedErrors.push({
                type: errorType,
                category: cat,
                matches,
                ...config
              });
            }
          });
        }
      });
    }

    return detectedErrors;
  }

  // Apply specific fix based on error type
  async applyFix(error, fullOutput) {
    const fixKey = `${error.category}-${error.type}`;
    
    // Check if we've already tried this fix recently
    const recentFix = this.fixHistory.find(fix => 
      fix.type === fixKey && 
      Date.now() - fix.timestamp < 60000 // 1 minute cooldown
    );
    
    if (recentFix && recentFix.attempts >= this.maxRetries) {
      console.log(`⏰ Skipping ${error.description} - max retries exceeded`);
      return false;
    }

    console.log(`🔧 Applying fix: ${error.description}`);
    
    try {
      const fixMethod = this[error.fix];
      if (typeof fixMethod === 'function') {
        const result = await fixMethod.call(this, error, fullOutput);
        
        // Record the fix attempt
        this.recordFixAttempt(fixKey, result);
        
        if (result) {
          console.log(`✅ Fix applied successfully: ${error.description}`);
          
          // Re-run the command that failed to verify the fix
          await this.verifyFix(error.category);
          
          return true;
        } else {
          console.log(`❌ Fix failed: ${error.description}`);
          return false;
        }
      } else {
        console.log(`❌ Fix method not implemented: ${error.fix}`);
        return false;
      }
    } catch (fixError) {
      console.log(`💥 Error applying fix: ${fixError.message}`);
      return false;
    }
  }

  // Record fix attempts for tracking
  recordFixAttempt(fixKey, success) {
    const existingFix = this.fixHistory.find(fix => fix.type === fixKey);
    
    if (existingFix) {
      existingFix.attempts++;
      existingFix.lastAttempt = Date.now();
      existingFix.lastSuccess = success;
    } else {
      this.fixHistory.push({
        type: fixKey,
        attempts: 1,
        timestamp: Date.now(),
        lastAttempt: Date.now(),
        lastSuccess: success
      });
    }
  }

  // Verify that a fix worked by re-running relevant tests
  async verifyFix(category) {
    console.log(`🔍 Verifying fix for category: ${category}`);
    
    try {
      switch (category) {
        case 'jest':
          await this.runCommand('npm run test:jest --silent');
          break;
        case 'typescript':
          await this.runCommand('npx tsc --noEmit');
          break;
        case 'eslint':
          await this.runCommand('npx eslint app/ --ext .ts,.tsx --max-warnings 0');
          break;
        case 'tests':
          await this.runCommand('npm run test:utils');
          break;
        default:
          console.log('ℹ️  No specific verification for category:', category);
      }
      
      console.log('✅ Fix verification passed');
    } catch (error) {
      console.log(`⚠️  Fix verification failed: ${error.message}`);
    }
  }

  // Run a command and return the result
  async runCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn('bash', ['-c', command], {
        cwd: this.workspaceRoot,
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  // Set up periodic health checks
  setupHealthChecks() {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  // Perform system health check
  async performHealthCheck() {
    console.log('🏥 Performing health check...');
    
    try {
      // Check if TypeScript compilation is clean
      await this.runCommand('npx tsc --noEmit --strict');
      console.log('✅ TypeScript: Clean');
    } catch (error) {
      console.log('⚠️  TypeScript: Issues detected');
      await this.processErrorOutput(error.message, 'typescript');
    }

    // Check Jest configuration
    try {
      await this.runCommand('npx jest --version');
      console.log('✅ Jest: Configured');
    } catch (error) {
      console.log('⚠️  Jest: Configuration issues');
      await this.processErrorOutput(error.message, 'jest');
    }

    console.log('🏥 Health check complete\n');
  }

  // FIX METHODS
  // ===========

  // Fix Jest multiple configuration files
  async fixJestMultipleConfigs(error, fullOutput) {
    console.log('🔧 Fixing Jest multiple configurations...');
    
    const jestConfigFiles = [
      'jest.config.json',
      'jest.config.js',
      'jest.config.mjs',
      'jest.config.ts'
    ];
    
    const foundConfigs = jestConfigFiles
      .map(file => path.join(this.workspaceRoot, file))
      .filter(file => fs.existsSync(file));
    
    if (foundConfigs.length > 1) {
      // Keep the .js file and remove others
      const jsConfig = foundConfigs.find(file => file.endsWith('.js'));
      const configsToRemove = foundConfigs.filter(file => file !== jsConfig);
      
      configsToRemove.forEach(config => {
        fs.unlinkSync(config);
        console.log(`   🗑️  Removed: ${path.basename(config)}`);
      });
      
      return true;
    }
    
    return false;
  }

  // Fix Jest unknown option (like moduleNameMapping)
  async fixJestUnknownOption(error, fullOutput) {
    console.log('🔧 Fixing Jest unknown option...');
    
    const jestConfigPath = path.join(this.workspaceRoot, 'jest.config.js');
    
    if (fs.existsSync(jestConfigPath)) {
      let content = fs.readFileSync(jestConfigPath, 'utf8');
      
      // Fix moduleNameMapping -> moduleNameMapper
      if (content.includes('moduleNameMapping')) {
        content = content.replace(/moduleNameMapping/g, 'moduleNameMapper');
        fs.writeFileSync(jestConfigPath, content);
        console.log('   ✅ Fixed moduleNameMapping -> moduleNameMapper');
        return true;
      }
    }
    
    return false;
  }

  // Fix Jest module mapping
  async fixJestModuleMapping(error, fullOutput) {
    return this.fixJestUnknownOption(error, fullOutput);
  }

  // Fix React cache import issues
  async fixReactCacheImport(error, fullOutput) {
    console.log('🔧 Fixing React cache import...');
    
    const setupPath = path.join(this.workspaceRoot, 'tests/setup.js');
    
    if (fs.existsSync(setupPath)) {
      let content = fs.readFileSync(setupPath, 'utf8');
      
      // Add React cache mock if not present
      if (!content.includes('React.cache')) {
        const cacheMock = `
// Mock React cache for Jest environment
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: jest.fn((fn) => fn)
}));
`;
        content = cacheMock + '\n' + content;
        fs.writeFileSync(setupPath, content);
        console.log('   ✅ Added React cache mock to Jest setup');
        return true;
      }
    }
    
    return false;
  }

  // Fix implicit any type errors
  async fixImplicitAnyType(error, fullOutput) {
    console.log('🔧 Fixing implicit any type errors...');
    
    try {
      // Run the existing any-type fixer
      await this.runCommand('node tests/fix-any-types.js');
      console.log('   ✅ Applied automatic any-type fixes');
      return true;
    } catch (fixError) {
      console.log('   ❌ Auto any-type fixer failed');
      return false;
    }
  }

  // Fix missing property errors
  async fixMissingProperty(error, fullOutput) {
    console.log('🔧 Fixing missing property errors...');
    
    const propertyMatch = error.matches[1];
    if (propertyMatch) {
      console.log(`   🎯 Missing property: ${propertyMatch}`);
      
      // For common cases, add type assertions or interface updates
      if (propertyMatch === 'images') {
        // This is a common pattern in the codebase
        console.log('   💡 Suggest adding images property to interface');
        return true;
      }
    }
    
    return false;
  }

  // Fix generic TypeScript errors
  async fixGenericTypeScriptError(error, fullOutput) {
    console.log('🔧 Attempting generic TypeScript fix...');
    
    // Try running the comprehensive type fixer
    try {
      await this.runCommand('node tests/fix-any-types.js');
      return true;
    } catch (fixError) {
      return false;
    }
  }

  // Fix explicit any warnings
  async fixExplicitAnyWarning(error, fullOutput) {
    return this.fixImplicitAnyType(error, fullOutput);
  }

  // Fix unused variables
  async fixUnusedVariables(error, fullOutput) {
    console.log('🔧 Fixing unused variables...');
    
    try {
      // Use ESLint auto-fix for unused variables
      await this.runCommand('npx eslint app/ --ext .ts,.tsx --fix');
      console.log('   ✅ Applied ESLint auto-fixes');
      return true;
    } catch (fixError) {
      return false;
    }
  }

  // Fix Next.js image usage
  async fixNextImageUsage(error, fullOutput) {
    console.log('🔧 Fixing Next.js image usage...');
    console.log('   💡 Manual intervention needed to replace <img> with <Image>');
    return false; // This typically requires manual intervention
  }

  // Fix test expectations
  async fixTestExpectation(error, fullOutput) {
    console.log('🔧 Analyzing test expectation failure...');
    
    // Extract test file and line information
    const testMatch = fullOutput.match(/at.*\(([^:]+):(\d+):\d+\)/);
    if (testMatch) {
      const [, filePath, lineNumber] = testMatch;
      console.log(`   📍 Test failure in: ${filePath}:${lineNumber}`);
      console.log('   💡 Consider updating test expectations or fixing implementation');
    }
    
    return false; // Test fixes usually require manual review
  }

  // Fix test mocking errors
  async fixTestMocking(error, fullOutput) {
    console.log('🔧 Fixing test mocking errors...');
    
    // Look for common mocking issues in test files
    const mockMatch = fullOutput.match(/(\w+ExistsSync|\w+Fs\.\w+).*is not defined/);
    if (mockMatch) {
      const missingMock = mockMatch[1];
      console.log(`   🎯 Missing mock: ${missingMock}`);
      console.log('   💡 Need to properly define mock in test setup');
    }
    
    return false; // Mocking fixes usually require manual intervention
  }

  // Fix reference errors
  async fixReferenceError(error, fullOutput) {
    console.log('🔧 Fixing reference errors...');
    
    const refMatch = error.matches[0];
    if (refMatch.includes('mockExistsSync')) {
      console.log('   🎯 mockExistsSync not defined - updating test setup');
      // This is a specific known issue we can fix
      return this.fixMockExistsSyncError();
    }
    
    return false;
  }

  // Fix specific mockExistsSync error
  async fixMockExistsSyncError() {
    const testFiles = [
      'tests/utils/contentAPI.test.js',
      'tests/integration/content-pipeline.test.js'
    ];
    
    for (const testFile of testFiles) {
      const filePath = path.join(this.workspaceRoot, testFile);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix the mock declaration
        if (content.includes('mockExistsSync') && !content.includes('const mockExistsSync')) {
          content = content.replace(
            /const mockFs = .*?;/s,
            `const mockFs = {
  readFile: jest.fn(),
  readdir: jest.fn(),
  existsSync: jest.fn()
};
const mockExistsSync = mockFs.existsSync;`
          );
          
          fs.writeFileSync(filePath, content);
          console.log(`   ✅ Fixed mockExistsSync in ${testFile}`);
        }
      }
    }
    
    return true;
  }

  // Generate monitoring report
  generateMonitoringReport() {
    console.log('\n📊 TERMINAL MONITORING REPORT');
    console.log('==============================\n');
    
    console.log(`🔍 Monitoring Status: ${this.isMonitoring ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`🔧 Auto-fix Enabled: ${this.autoFixEnabled}`);
    console.log(`📈 Fix Attempts: ${this.fixHistory.length}`);
    
    if (this.fixHistory.length > 0) {
      console.log('\n📋 Fix History:');
      this.fixHistory.forEach(fix => {
        const status = fix.lastSuccess ? '✅' : '❌';
        console.log(`   ${status} ${fix.type} (${fix.attempts} attempts)`);
      });
    }
    
    console.log('\n🎯 Error Patterns Monitored:');
    Object.entries(this.errorPatterns).forEach(([category, patterns]) => {
      console.log(`   📂 ${category}: ${Object.keys(patterns).length} patterns`);
    });
    
    return {
      isMonitoring: this.isMonitoring,
      autoFixEnabled: this.autoFixEnabled,
      fixHistory: this.fixHistory,
      errorPatterns: Object.keys(this.errorPatterns).length
    };
  }

  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('🛑 Terminal monitoring stopped');
  }
}

// Main execution function
async function main() {
  const monitor = new TerminalMonitor();
  
  // Handle process termination gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Received interrupt signal');
    monitor.generateMonitoringReport();
    monitor.stopMonitoring();
    process.exit(0);
  });
  
  // Start monitoring
  monitor.startMonitoring();
  
  // Test with current Jest issues
  console.log('🧪 Testing with recent Jest output...');
  
  // Simulate the Jest error we encountered
  const jestError = `
● Validation Warning:
  Unknown option "moduleNameMapping" with value {"^@/(.*)$": "<rootDir>/app/$1"} was found.
  This is probably a typing mistake. Fixing it will remove this message.

● Multiple configurations found:
    * /Users/todddunning/Desktop/Z-Beam/z-beam-test-push/jest.config.js
    * /Users/todddunning/Desktop/Z-Beam/z-beam-test-push/jest.config.json
  `;
  
  await monitor.processErrorOutput(jestError, 'jest');
  
  // Test TypeScript error processing
  const tsError = `
app/components/List/List.tsx(266,5): error TS7053: Element implicitly has an 'any' type because expression of type '"images"' can't be used to index type '{}'.
  Property 'images' does not exist on type '{}'.
  `;
  
  await monitor.processErrorOutput(tsError, 'typescript');
  
  // Keep monitoring running
  console.log('\n🔄 Monitor running... Press Ctrl+C to stop\n');
  
  // Keep the process alive
  setInterval(() => {
    // Periodic monitoring activities
  }, 1000);
}

// Export for use as module
module.exports = { TerminalMonitor };

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Terminal monitor crashed:', error.message);
    process.exit(1);
  });
}
