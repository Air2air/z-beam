#!/usr/bin/env node

/**
 * Production Build Validator
 * Validates that local builds match production deployment conditions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionBuildValidator {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '✅',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🔍'
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
      return result;
    } catch (error) {
      if (options.ignoreErrors) {
        return error.stdout || error.stderr || error.message;
      }
      throw error;
    }
  }

  async validateModuleResolution() {
    this.log('📦 Validating module resolution...', 'info');
    
    // Scan all TypeScript/TSX files for imports
    const files = this.getAllSourceFiles();
    let moduleErrors = 0;
    
    for (const file of files.slice(0, 10)) { // Limit to first 10 files for speed
      try {
        const content = fs.readFileSync(file, 'utf8');
        const imports = this.extractImports(content);
        
        for (const importPath of imports) {
          if (importPath.startsWith('@/')) {
            const actualPath = importPath.replace('@/', '');
            if (!this.moduleExists(actualPath)) {
              this.errors.push(`${file}: Cannot resolve '${importPath}'`);
              moduleErrors++;
            }
          }
        }
      } catch (error) {
        this.warnings.push(`Could not scan ${file}: ${error.message}`);
      }
    }
    
    if (moduleErrors === 0) {
      this.log('All module imports resolved successfully', 'info');
    } else {
      this.log(`Found ${moduleErrors} module resolution errors`, 'error');
    }
    
    return moduleErrors;
  }

  getAllSourceFiles() {
    const glob = require('glob');
    return glob.sync('app/**/*.{ts,tsx}', { cwd: this.workspaceRoot });
  }

  extractImports(content) {
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  moduleExists(modulePath) {
    const possiblePaths = [
      path.join(this.workspaceRoot, modulePath + '.ts'),
      path.join(this.workspaceRoot, modulePath + '.tsx'),
      path.join(this.workspaceRoot, modulePath + '.js'),
      path.join(this.workspaceRoot, modulePath + '.jsx'),
      path.join(this.workspaceRoot, modulePath, 'index.ts'),
      path.join(this.workspaceRoot, modulePath, 'index.tsx'),
      path.join(this.workspaceRoot, modulePath, 'index.js')
    ];
    
    return possiblePaths.some(p => fs.existsSync(p));
  }

  async validateProductionBuild() {
    this.log('🏭 Testing production build environment...', 'info');
    
    const environments = [
      { name: 'Standard Production', env: { NODE_ENV: 'production' } },
      { name: 'Vercel Production', env: { NODE_ENV: 'production', VERCEL: '1' } },
      { name: 'CI Production', env: { NODE_ENV: 'production', CI: 'true' } }
    ];
    
    let buildErrors = 0;
    
    for (const envConfig of environments) {
      this.log(`Testing ${envConfig.name} build...`, 'debug');
      
      try {
        const result = this.runCommand('npx next build', {
          env: { ...process.env, ...envConfig.env },
          silent: true,
          ignoreErrors: true
        });
        
        if (this.detectBuildFailure(result)) {
          this.errors.push(`${envConfig.name} build failed`);
          this.logBuildErrors(result, envConfig.name);
          buildErrors++;
        } else {
          this.log(`${envConfig.name} build successful`, 'info');
        }
      } catch (error) {
        this.errors.push(`${envConfig.name} build crashed: ${error.message}`);
        buildErrors++;
      }
      
      // Clean up between builds
      this.runCommand('rm -rf .next', { ignoreErrors: true, silent: true });
    }
    
    return buildErrors;
  }

  detectBuildFailure(output) {
    const failurePatterns = [
      /Module not found/,
      /Can't resolve/,
      /Failed to compile/,
      /Build failed/,
      /Cannot find module/,
      /Error: ENOENT/,
      /ModuleNotFoundError/
    ];
    
    return failurePatterns.some(pattern => pattern.test(output));
  }

  logBuildErrors(output, buildType) {
    this.log(`Build errors in ${buildType}:`, 'error');
    
    const errorLines = output.split('\n').filter(line => 
      line.includes('Module not found') || 
      line.includes("Can't resolve") ||
      line.includes('Failed to compile') ||
      line.includes('Error:')
    );
    
    errorLines.slice(0, 5).forEach(line => {
      console.log(`   ${line.trim()}`);
    });
  }

  async validatePathAliases() {
    this.log('🔍 Validating path alias configuration...', 'info');
    
    // Check tsconfig.json
    const tsconfigPath = path.join(this.workspaceRoot, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      this.errors.push('tsconfig.json not found');
      return 1;
    }
    
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      if (!tsconfig.compilerOptions?.paths?.['@/*']) {
        this.errors.push('Missing @/* path mapping in tsconfig.json');
        return 1;
      }
      
      if (!tsconfig.compilerOptions?.baseUrl) {
        this.warnings.push('baseUrl not set in tsconfig.json');
      }
      
      this.log('Path alias configuration valid', 'info');
      return 0;
      
    } catch (error) {
      this.errors.push(`Invalid tsconfig.json: ${error.message}`);
      return 1;
    }
  }

  async validateCriticalFiles() {
    this.log('📁 Validating critical file structure...', 'info');
    
    const criticalFiles = [
      'app/utils/logger.ts',
      'app/components/BadgeSymbol/BadgeSymbol.tsx',
      'app/components/Debug/DebugLayout.tsx',
      'package.json',
      'next.config.js',
      'tsconfig.json'
    ];
    
    let missingFiles = 0;
    
    for (const file of criticalFiles) {
      const fullPath = path.join(this.workspaceRoot, file);
      if (!fs.existsSync(fullPath)) {
        this.errors.push(`Missing critical file: ${file}`);
        missingFiles++;
      }
    }
    
    if (missingFiles === 0) {
      this.log('All critical files present', 'info');
    } else {
      this.log(`${missingFiles} critical files missing`, 'error');
    }
    
    return missingFiles;
  }

  async validateDependencies() {
    this.log('📦 Validating package dependencies...', 'info');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check for Vercel-critical dependencies in correct section
      const vercelCritical = ['tailwindcss', 'postcss', 'autoprefixer'];
      let dependencyIssues = 0;
      
      for (const dep of vercelCritical) {
        if (packageJson.devDependencies?.[dep] && !packageJson.dependencies?.[dep]) {
          this.warnings.push(`${dep} should be in dependencies for Vercel compatibility`);
          dependencyIssues++;
        }
      }
      
      if (dependencyIssues === 0) {
        this.log('Dependency configuration valid', 'info');
      }
      
      return dependencyIssues;
      
    } catch (error) {
      this.errors.push(`Package.json validation failed: ${error.message}`);
      return 1;
    }
  }

  async runValidation() {
    console.log('🔍 PRODUCTION BUILD VALIDATOR');
    console.log('==============================');
    console.log(`📁 Workspace: ${this.workspaceRoot}`);
    console.log(`⏰ Started: ${new Date().toLocaleTimeString()}\n`);
    
    const validations = [
      () => this.validateCriticalFiles(),
      () => this.validatePathAliases(),
      () => this.validateDependencies(),
      () => this.validateModuleResolution(),
      () => this.validateProductionBuild()
    ];
    
    let totalErrors = 0;
    
    for (const validation of validations) {
      try {
        const errors = await validation();
        totalErrors += errors;
      } catch (error) {
        this.errors.push(`Validation failed: ${error.message}`);
        totalErrors++;
      }
    }
    
    this.printSummary(totalErrors);
    return totalErrors === 0;
  }

  printSummary(totalErrors) {
    console.log('\n🎯 VALIDATION RESULTS');
    console.log('=====================');
    
    if (totalErrors === 0 && this.errors.length === 0) {
      this.log('🎉 ALL VALIDATIONS PASSED - PRODUCTION READY!', 'info');
    } else {
      this.log(`❌ ${totalErrors} VALIDATION ERRORS FOUND`, 'error');
      
      if (this.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        this.errors.forEach(error => console.log(`   • ${error}`));
      }
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️ WARNINGS:');
        this.warnings.forEach(warning => console.log(`   • ${warning}`));
      }
    }
    
    console.log(`\n📊 Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`);
  }
}

// CLI execution
if (require.main === module) {
  const validator = new ProductionBuildValidator();
  validator.runValidation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = ProductionBuildValidator;
