#!/usr/bin/env node

/**
 * COMPREHENSIVE END-TO-END EVALUATION SYSTEM
 * ===========================================
 * 
 * This system performs complete validation from source to deployment,
 * catching errors that individual tools miss.
 */

const fs = require('fs').promises;
const { spawn, exec } = require('child_process');
const path = require('path');

class EndToEndValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      phases: {},
      errors: [],
      warnings: [],
      critical: [],
      passed: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };
    
    this.workspaceRoot = process.cwd();
    this.testEnvironments = ['development', 'production', 'vercel'];
  }

  log(level, message, phase = 'general') {
    const entry = { level, message, phase, timestamp: new Date().toISOString() };
    console.log(`[${level.toUpperCase()}] ${phase}: ${message}`);
    
    if (level === 'error' || level === 'critical') {
      this.results.errors.push(entry);
      this.results.failedTests++;
    } else if (level === 'warning') {
      this.results.warnings.push(entry);
    } else if (level === 'pass') {
      this.results.passed.push(entry);
      this.results.passedTests++;
    }
    
    this.results.totalTests++;
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      exec(command, { 
        cwd: this.workspaceRoot,
        timeout: 120000, // 2 minute timeout
        ...options 
      }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          exitCode: error ? error.code : 0,
          stdout: stdout || '',
          stderr: stderr || '',
          error
        });
      });
    });
  }

  async phase1_SourceCodeValidation() {
    this.log('info', 'Starting Source Code Validation', 'phase1');
    this.results.phases.phase1 = { started: new Date().toISOString() };

    // 1.1 TypeScript Compilation
    const tsCheck = await this.runCommand('npx tsc --noEmit');
    if (!tsCheck.success) {
      this.log('critical', `TypeScript compilation failed: ${tsCheck.stderr}`, 'phase1');
      return false;
    } else {
      this.log('pass', 'TypeScript compilation successful', 'phase1');
    }

    // 1.2 ESLint Validation
    const lintCheck = await this.runCommand('npm run lint');
    if (!lintCheck.success) {
      this.log('error', `ESLint failed: ${lintCheck.stderr}`, 'phase1');
    } else {
      this.log('pass', 'ESLint validation passed', 'phase1');
    }

    // 1.3 Import Path Validation
    await this.validateImportPaths();

    // 1.4 File Structure Validation
    await this.validateFileStructure();

    this.results.phases.phase1.completed = new Date().toISOString();
    return true;
  }

  async validateImportPaths() {
    this.log('info', 'Validating import paths', 'phase1');
    
    // Check for absolute imports that will fail in Vercel
    const findAbsoluteImports = await this.runCommand("grep -r \"from '@/\" app/ || true");
    if (findAbsoluteImports.stdout.trim()) {
      this.log('critical', `Absolute imports found that will fail in Vercel:\n${findAbsoluteImports.stdout}`, 'phase1');
      return false;
    }

    // Check for relative import issues
    const files = await this.getAllTSFiles();
    let importErrors = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const imports = content.match(/import.*from ['"](.+)['"];?/g) || [];
        
        for (const imp of imports) {
          const match = imp.match(/from ['"](.+)['"];?/);
          if (match && match[1].startsWith('.')) {
            const importPath = match[1];
            const resolvedPath = path.resolve(path.dirname(file), importPath);
            
            // Check if the imported file exists
            const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx'];
            let exists = false;
            
            for (const ext of possibleExtensions) {
              try {
                await fs.access(resolvedPath + ext);
                exists = true;
                break;
              } catch {}
            }
            
            if (!exists) {
              this.log('critical', `Broken import in ${file}: ${importPath}`, 'phase1');
              importErrors++;
            }
          }
        }
      } catch (error) {
        this.log('error', `Error reading file ${file}: ${error.message}`, 'phase1');
      }
    }

    if (importErrors === 0) {
      this.log('pass', 'All import paths validated successfully', 'phase1');
      return true;
    } else {
      this.log('critical', `Found ${importErrors} broken import paths`, 'phase1');
      return false;
    }
  }

  async getAllTSFiles() {
    const findFiles = await this.runCommand("find app/ -name '*.ts' -o -name '*.tsx' | head -100");
    return findFiles.stdout.trim().split('\n').filter(f => f.length > 0);
  }

  async validateFileStructure() {
    this.log('info', 'Validating file structure', 'phase1');
    
    const requiredDirs = ['app', 'app/utils', 'app/components'];
    for (const dir of requiredDirs) {
      try {
        await fs.access(dir);
        this.log('pass', `Required directory exists: ${dir}`, 'phase1');
      } catch {
        this.log('critical', `Missing required directory: ${dir}`, 'phase1');
      }
    }

    // Check for required files
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      'app/layout.tsx',
      'app/page.tsx'
    ];

    for (const file of requiredFiles) {
      try {
        await fs.access(file);
        this.log('pass', `Required file exists: ${file}`, 'phase1');
      } catch {
        this.log('critical', `Missing required file: ${file}`, 'phase1');
      }
    }
  }

  async phase2_UnitTestValidation() {
    this.log('info', 'Starting Unit Test Validation', 'phase2');
    this.results.phases.phase2 = { started: new Date().toISOString() };

    // 2.1 Test Suite Execution
    const testResult = await this.runCommand('npm test');
    
    if (!testResult.success) {
      // Analyze test failures
      const failureAnalysis = this.analyzeTestFailures(testResult.stdout + testResult.stderr);
      
      if (failureAnalysis.criticalFailures > 0) {
        this.log('critical', `${failureAnalysis.criticalFailures} critical test failures that will break deployment`, 'phase2');
      } else {
        this.log('warning', `${failureAnalysis.totalFailures} test failures - non-critical`, 'phase2');
      }
    } else {
      this.log('pass', 'All unit tests passed', 'phase2');
    }

    // 2.2 Test Coverage Analysis
    const coverageResult = await this.runCommand('npm run test:coverage');
    if (coverageResult.success) {
      this.log('pass', 'Test coverage analysis completed', 'phase2');
    }

    this.results.phases.phase2.completed = new Date().toISOString();
    return testResult.success;
  }

  analyzeTestFailures(output) {
    const lines = output.split('\n');
    let totalFailures = 0;
    let criticalFailures = 0;
    
    for (const line of lines) {
      if (line.includes('FAIL') || line.includes('✕')) {
        totalFailures++;
        
        // Identify critical failures
        if (line.includes('ReferenceError') || 
            line.includes('TypeError') || 
            line.includes('SyntaxError') ||
            line.includes('Module not found')) {
          criticalFailures++;
        }
      }
    }
    
    return { totalFailures, criticalFailures };
  }

  async phase3_BuildValidation() {
    this.log('info', 'Starting Build Validation', 'phase3');
    this.results.phases.phase3 = { started: new Date().toISOString() };

    // 3.1 Clean build test
    this.log('info', 'Cleaning previous build artifacts', 'phase3');
    await this.runCommand('rm -rf .next');

    // 3.2 Development build
    const devBuild = await this.runCommand('NODE_ENV=development npm run build');
    if (!devBuild.success) {
      this.log('critical', `Development build failed: ${devBuild.stderr}`, 'phase3');
      return false;
    } else {
      this.log('pass', 'Development build successful', 'phase3');
    }

    // 3.3 Production build
    const prodBuild = await this.runCommand('NODE_ENV=production npm run build');
    if (!prodBuild.success) {
      this.log('critical', `Production build failed: ${prodBuild.stderr}`, 'phase3');
      return false;
    } else {
      this.log('pass', 'Production build successful', 'phase3');
    }

    // 3.4 Build output validation
    await this.validateBuildOutput();

    this.results.phases.phase3.completed = new Date().toISOString();
    return true;
  }

  async validateBuildOutput() {
    this.log('info', 'Validating build output', 'phase3');
    
    try {
      await fs.access('.next');
      this.log('pass', 'Build directory created', 'phase3');
      
      const buildManifest = await fs.readFile('.next/build-manifest.json', 'utf8');
      const manifest = JSON.parse(buildManifest);
      
      if (manifest.pages && Object.keys(manifest.pages).length > 0) {
        this.log('pass', `Build generated ${Object.keys(manifest.pages).length} pages`, 'phase3');
      } else {
        this.log('error', 'Build manifest shows no pages generated', 'phase3');
      }
      
    } catch (error) {
      this.log('critical', `Build output validation failed: ${error.message}`, 'phase3');
    }
  }

  async phase4_IntegrationValidation() {
    this.log('info', 'Starting Integration Validation', 'phase4');
    this.results.phases.phase4 = { started: new Date().toISOString() };

    // 4.1 API Route Testing
    await this.validateAPIRoutes();

    // 4.2 Page Generation Testing
    await this.validatePageGeneration();

    // 4.3 Static Asset Validation
    await this.validateStaticAssets();

    this.results.phases.phase4.completed = new Date().toISOString();
    return true;
  }

  async validateAPIRoutes() {
    this.log('info', 'Validating API routes', 'phase4');
    
    const apiFiles = await this.runCommand("find app/api -name 'route.ts' -o -name 'route.js' || true");
    const routes = apiFiles.stdout.trim().split('\n').filter(f => f.length > 0);
    
    for (const route of routes) {
      try {
        const content = await fs.readFile(route, 'utf8');
        
        // Check for export of HTTP methods
        const hasExports = /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/.test(content);
        if (hasExports) {
          this.log('pass', `API route validated: ${route}`, 'phase4');
        } else {
          this.log('error', `API route missing HTTP method exports: ${route}`, 'phase4');
        }
      } catch (error) {
        this.log('error', `Error validating API route ${route}: ${error.message}`, 'phase4');
      }
    }
  }

  async validatePageGeneration() {
    this.log('info', 'Validating page generation', 'phase4');
    
    try {
      const prerender = await fs.readFile('.next/prerender-manifest.json', 'utf8');
      const manifest = JSON.parse(prerender);
      
      const staticPages = Object.keys(manifest.routes || {});
      if (staticPages.length > 0) {
        this.log('pass', `${staticPages.length} static pages generated successfully`, 'phase4');
      } else {
        this.log('warning', 'No static pages found in prerender manifest', 'phase4');
      }
    } catch (error) {
      this.log('error', `Page generation validation failed: ${error.message}`, 'phase4');
    }
  }

  async validateStaticAssets() {
    this.log('info', 'Validating static assets', 'phase4');
    
    try {
      await fs.access('.next/static');
      this.log('pass', 'Static assets directory exists', 'phase4');
      
      const staticFiles = await this.runCommand('find .next/static -type f | wc -l');
      const fileCount = parseInt(staticFiles.stdout.trim());
      
      if (fileCount > 0) {
        this.log('pass', `${fileCount} static files generated`, 'phase4');
      } else {
        this.log('error', 'No static files generated', 'phase4');
      }
    } catch (error) {
      this.log('error', `Static asset validation failed: ${error.message}`, 'phase4');
    }
  }

  async phase5_DeploymentReadiness() {
    this.log('info', 'Starting Deployment Readiness Validation', 'phase5');
    this.results.phases.phase5 = { started: new Date().toISOString() };

    // 5.1 Vercel Configuration Validation
    await this.validateVercelConfig();

    // 5.2 Environment Variable Validation
    await this.validateEnvironmentVars();

    // 5.3 Package.json Validation
    await this.validatePackageJson();

    // 5.4 Dependency Security Audit
    await this.validateDependencies();

    this.results.phases.phase5.completed = new Date().toISOString();
    return true;
  }

  async validateVercelConfig() {
    this.log('info', 'Validating Vercel configuration', 'phase5');
    
    try {
      const vercelConfig = await fs.readFile('vercel.json', 'utf8');
      const config = JSON.parse(vercelConfig);
      
      if (config.framework === 'nextjs') {
        this.log('pass', 'Vercel framework correctly set to nextjs', 'phase5');
      } else {
        this.log('warning', 'Vercel framework not explicitly set to nextjs', 'phase5');
      }
      
      if (config.buildCommand) {
        this.log('pass', 'Custom build command configured', 'phase5');
      }
      
    } catch (error) {
      this.log('warning', 'No vercel.json found - using defaults', 'phase5');
    }
  }

  async validateEnvironmentVars() {
    this.log('info', 'Validating environment variables', 'phase5');
    
    // Check for required environment variables
    const requiredVars = ['NODE_ENV'];
    let missingVars = 0;
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.log('warning', `Environment variable not set: ${varName}`, 'phase5');
        missingVars++;
      } else {
        this.log('pass', `Environment variable configured: ${varName}`, 'phase5');
      }
    }
    
    return missingVars === 0;
  }

  async validatePackageJson() {
    this.log('info', 'Validating package.json', 'phase5');
    
    try {
      const packageJson = await fs.readFile('package.json', 'utf8');
      const pkg = JSON.parse(packageJson);
      
      // Check for required scripts
      const requiredScripts = ['build', 'start', 'dev'];
      for (const script of requiredScripts) {
        if (pkg.scripts[script]) {
          this.log('pass', `Required script exists: ${script}`, 'phase5');
        } else {
          this.log('critical', `Missing required script: ${script}`, 'phase5');
        }
      }
      
      // Check for vercel-build script
      if (pkg.scripts['vercel-build']) {
        this.log('pass', 'Vercel build script configured', 'phase5');
      } else {
        this.log('warning', 'No custom vercel-build script', 'phase5');
      }
      
      // Check Node.js version compatibility
      if (pkg.engines && pkg.engines.node) {
        this.log('pass', `Node.js version requirement specified: ${pkg.engines.node}`, 'phase5');
      } else {
        this.log('warning', 'No Node.js version requirement specified', 'phase5');
      }
      
    } catch (error) {
      this.log('critical', `Package.json validation failed: ${error.message}`, 'phase5');
      return false;
    }
    
    return true;
  }

  async validateDependencies() {
    this.log('info', 'Validating dependencies', 'phase5');
    
    const auditResult = await this.runCommand('npm audit --audit-level=high');
    if (auditResult.success) {
      this.log('pass', 'No high-severity dependency vulnerabilities', 'phase5');
    } else {
      this.log('error', 'High-severity dependency vulnerabilities found', 'phase5');
    }
    
    // Check for outdated critical dependencies
    const outdatedResult = await this.runCommand('npm outdated');
    if (outdatedResult.stdout.includes('next') || outdatedResult.stdout.includes('react')) {
      this.log('warning', 'Critical dependencies may be outdated', 'phase5');
    }
  }

  async generateReport() {
    this.results.endTime = new Date().toISOString();
    this.results.duration = Date.now() - new Date(this.results.timestamp).getTime();
    this.results.success = this.results.errors.length === 0 && this.results.critical.length === 0;
    
    const report = {
      summary: {
        status: this.results.success ? 'PASS' : 'FAIL',
        totalTests: this.results.totalTests,
        passed: this.results.passedTests,
        failed: this.results.failedTests,
        criticalIssues: this.results.errors.filter(e => e.level === 'critical').length,
        warnings: this.results.warnings.length,
        duration: `${Math.round(this.results.duration / 1000)}s`
      },
      phases: this.results.phases,
      issues: {
        critical: this.results.errors.filter(e => e.level === 'critical'),
        errors: this.results.errors.filter(e => e.level === 'error'),
        warnings: this.results.warnings
      },
      recommendations: this.generateRecommendations()
    };

    // Save detailed report
    await fs.writeFile('end-to-end-evaluation-report.json', JSON.stringify(this.results, null, 2));
    
    // Display summary
    console.log('\n' + '='.repeat(80));
    console.log('END-TO-END EVALUATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Status: ${report.summary.status}`);
    console.log(`Duration: ${report.summary.duration}`);
    console.log(`Tests: ${report.summary.passed}/${report.summary.totalTests} passed`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    
    if (report.issues.critical.length > 0) {
      console.log('\nCRITICAL ISSUES:');
      report.issues.critical.forEach(issue => {
        console.log(`  ❌ ${issue.phase}: ${issue.message}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\nRECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  💡 ${rec}`);
      });
    }
    
    console.log('='.repeat(80));
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.errors.some(e => e.message.includes('import'))) {
      recommendations.push('Fix import path issues before deployment');
    }
    
    if (this.results.errors.some(e => e.message.includes('test'))) {
      recommendations.push('Resolve unit test failures to ensure code quality');
    }
    
    if (this.results.warnings.some(w => w.message.includes('dependency'))) {
      recommendations.push('Update outdated dependencies for security and compatibility');
    }
    
    if (this.results.errors.some(e => e.message.includes('build'))) {
      recommendations.push('Fix build errors - deployment will fail');
    }
    
    return recommendations;
  }

  async runCompleteEvaluation() {
    console.log('🚀 Starting Comprehensive End-to-End Evaluation\n');
    
    try {
      const phase1Success = await this.phase1_SourceCodeValidation();
      if (!phase1Success) {
        this.log('critical', 'Phase 1 failed - stopping evaluation', 'general');
        return await this.generateReport();
      }

      await this.phase2_UnitTestValidation();
      
      const phase3Success = await this.phase3_BuildValidation();
      if (!phase3Success) {
        this.log('critical', 'Phase 3 failed - deployment will fail', 'general');
        return await this.generateReport();
      }

      await this.phase4_IntegrationValidation();
      await this.phase5_DeploymentReadiness();

      return await this.generateReport();
      
    } catch (error) {
      this.log('critical', `Evaluation system error: ${error.message}`, 'general');
      return await this.generateReport();
    }
  }
}

// Run the evaluation if this script is executed directly
if (require.main === module) {
  const validator = new EndToEndValidator();
  validator.runCompleteEvaluation()
    .then(report => {
      process.exit(report.summary.status === 'PASS' ? 0 : 1);
    })
    .catch(error => {
      console.error('Evaluation failed:', error);
      process.exit(1);
    });
}

module.exports = EndToEndValidator;
