// scripts/buildValidation.ts
// GROK-Compliant Build-Time Validation System
// Comprehensive checks for types, content, and components during build process

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../app/utils/logger';
import { ConfigurationError } from '../app/utils/errorSystem';
import { contentValidator } from '../app/utils/contentValidator';
import { ComponentAuditor } from './componentAudit';

interface BuildValidationResult {
  success: boolean;
  timestamp: string;
  duration: number;
  checks: {
    typescript: { success: boolean; errors: string[]; warnings: string[] };
    content: { success: boolean; errors: string[]; warnings: string[] };
    components: { success: boolean; errors: string[]; warnings: string[] };
    dependencies: { success: boolean; errors: string[]; warnings: string[] };
    configuration: { success: boolean; errors: string[]; warnings: string[] };
    performance: { success: boolean; errors: string[]; warnings: string[] };
  };
  summary: {
    totalErrors: number;
    totalWarnings: number;
    criticalIssues: string[];
    recommendations: string[];
  };
}

class BuildValidator {
  private readonly workspaceRoot: string;
  private readonly strictMode: boolean;
  private result: BuildValidationResult;

  constructor(workspaceRoot: string = process.cwd(), strictMode: boolean = true) {
    this.workspaceRoot = workspaceRoot;
    this.strictMode = strictMode;
    this.result = this.initializeResult();
  }

  private initializeResult(): BuildValidationResult {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      duration: 0,
      checks: {
        typescript: { success: true, errors: [], warnings: [] },
        content: { success: true, errors: [], warnings: [] },
        components: { success: true, errors: [], warnings: [] },
        dependencies: { success: true, errors: [], warnings: [] },
        configuration: { success: true, errors: [], warnings: [] },
        performance: { success: true, errors: [], warnings: [] }
      },
      summary: {
        totalErrors: 0,
        totalWarnings: 0,
        criticalIssues: [],
        recommendations: []
      }
    };
  }

  // Main validation function (fail-fast approach)
  async validateBuild(): Promise<BuildValidationResult> {
    const startTime = performance.now();
    
    try {
      logger.info('Starting comprehensive build validation');

      // 1. TypeScript compilation check
      await this.validateTypeScript();
      
      // 2. Content integrity validation
      await this.validateContent();
      
      // 3. Component structure validation
      await this.validateComponents();
      
      // 4. Dependency validation
      await this.validateDependencies();
      
      // 5. Configuration validation
      await this.validateConfiguration();
      
      // 6. Performance validation
      await this.validatePerformance();
      
      // 7. Generate summary
      this.generateSummary();
      
      this.result.duration = performance.now() - startTime;
      
      logger.performance('Build validation completed', this.result.duration, {
        success: this.result.success,
        totalErrors: this.result.summary.totalErrors,
        totalWarnings: this.result.summary.totalWarnings
      });

      // Fail fast if critical issues found
      if (this.strictMode && this.result.summary.totalErrors > 0) {
        throw new ConfigurationError(
          `Build validation failed with ${this.result.summary.totalErrors} errors`,
          { 
            result: this.result,
            criticalIssues: this.result.summary.criticalIssues
          }
        );
      }

      return this.result;

    } catch (error) {
      this.result.success = false;
      this.result.duration = performance.now() - startTime;
      
      if (error instanceof ConfigurationError) {
        throw error;
      }
      
      throw new ConfigurationError(
        `Build validation system error: ${error}`,
        { 
          originalError: error,
          validationResult: this.result,
          duration: this.result.duration
        }
      );
    }
  }

  // Validate TypeScript compilation
  private async validateTypeScript(): Promise<void> {
    try {
      logger.info('Validating TypeScript compilation');
      
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Check if TypeScript is available
      const tsconfigPath = path.join(this.workspaceRoot, 'tsconfig.json');
      if (!fs.existsSync(tsconfigPath)) {
        this.result.checks.typescript.warnings.push('No tsconfig.json found - skipping TypeScript validation');
        return;
      }

      try {
        // Run TypeScript compiler in check mode
        const { stdout, stderr } = await execAsync(
          'npx tsc --noEmit --pretty false',
          { cwd: this.workspaceRoot, timeout: 60000 }
        );
        
        if (stderr) {
          // Parse TypeScript errors
          const errorLines = stderr.split('\n').filter(line => line.trim());
          const errors = errorLines.filter(line => line.includes('error TS'));
          const warnings = errorLines.filter(line => line.includes('warning TS'));
          
          this.result.checks.typescript.errors.push(...errors);
          this.result.checks.typescript.warnings.push(...warnings);
          
          if (errors.length > 0) {
            this.result.checks.typescript.success = false;
          }
        }
        
      } catch (execError: any) {
        if (execError.code === 2) {
          // TypeScript compilation errors (expected for error detection)
          const errorOutput = execError.stdout || execError.stderr || '';
          const errorLines = errorOutput.split('\n').filter((line: string) => line.trim());
          const errors = errorLines.filter((line: string) => line.includes('error TS'));
          
          this.result.checks.typescript.errors.push(...errors);
          this.result.checks.typescript.success = false;
        } else {
          throw execError;
        }
      }
      
    } catch (error) {
      this.result.checks.typescript.errors.push(`TypeScript validation failed: ${error}`);
      this.result.checks.typescript.success = false;
    }
  }

  // Validate content integrity
  private async validateContent(): Promise<void> {
    try {
      logger.info('Validating content integrity');
      
      const validationResult = await contentValidator.validateAllContent();
      
      if (!validationResult.passed) {
        this.result.checks.content.success = false;
        this.result.checks.content.errors.push(...validationResult.errors.map(e => e.message));
      }
      
      if (validationResult.warnings.length > 0) {
        this.result.checks.content.warnings.push(...validationResult.warnings.map(w => w.message));
      }
      
      // Additional content-specific checks
      await this.validateContentStructure();
      await this.validateYamlIntegrity();
      
    } catch (error) {
      this.result.checks.content.errors.push(`Content validation failed: ${error}`);
      this.result.checks.content.success = false;
    }
  }

  // Validate content directory structure
  private async validateContentStructure(): Promise<void> {
    const requiredDirs = [
      'content/frontmatter',
      'content/components/badgesymbol',
      'content/components'
    ];
    
    for (const dir of requiredDirs) {
      const fullPath = path.join(this.workspaceRoot, dir);
      if (!fs.existsSync(fullPath)) {
        this.result.checks.content.errors.push(`Missing required content directory: ${dir}`);
        this.result.checks.content.success = false;
      } else {
        // Check if directory has content
        const files = fs.readdirSync(fullPath);
        if (files.length === 0) {
          this.result.checks.content.warnings.push(`Empty content directory: ${dir}`);
        }
      }
    }
  }

  // Validate YAML file integrity
  private async validateYamlIntegrity(): Promise<void> {
    const yamlDirs = [
      'content/frontmatter',
      'content/components/badgesymbol'
    ];
    
    for (const dir of yamlDirs) {
      const fullPath = path.join(this.workspaceRoot, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
        
        for (const file of files) {
          try {
            const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');
            if (!content.trim()) {
              this.result.checks.content.warnings.push(`Empty YAML file: ${dir}/${file}`);
            }
            
            // Basic YAML structure validation
            const yaml = require('yaml');
            yaml.parse(content);
            
          } catch (error) {
            this.result.checks.content.errors.push(`Invalid YAML file ${dir}/${file}: ${error}`);
            this.result.checks.content.success = false;
          }
        }
      }
    }
  }

  // Validate component structure and integrity
  private async validateComponents(): Promise<void> {
    try {
      logger.info('Validating component structure');
      
      const auditor = new ComponentAuditor(this.workspaceRoot);
      const auditResult = await auditor.performAudit();
      
      // Check for high-risk components
      const highRiskComponents = auditResult.components.filter(c => c.duplicateRisk.score >= 5);
      if (highRiskComponents.length > 0) {
        this.result.checks.components.warnings.push(
          `${highRiskComponents.length} components have high duplication risk`
        );
      }
      
      // Check for critical recommendations
      const criticalRecs = auditResult.recommendations.filter(r => r.priority === 'high');
      if (criticalRecs.length > 0) {
        this.result.checks.components.warnings.push(
          `${criticalRecs.length} high-priority component optimization opportunities found`
        );
      }
      
      // Validate component file structure
      await this.validateComponentFiles();
      
    } catch (error) {
      this.result.checks.components.errors.push(`Component validation failed: ${error}`);
      this.result.checks.components.success = false;
    }
  }

  // Validate individual component files
  private async validateComponentFiles(): Promise<void> {
    const componentDirs = ['app/components', 'components'];
    
    for (const dir of componentDirs) {
      const fullPath = path.join(this.workspaceRoot, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath, { recursive: true, withFileTypes: true });
        
        for (const file of files) {
          if (file.isFile() && /\.(tsx?|jsx?)$/.test(file.name)) {
            try {
              const filePath = path.join(fullPath, file.name);
              const content = fs.readFileSync(filePath, 'utf-8');
              
              // Check for common issues
              if (!content.includes('export') && !content.includes('module.exports')) {
                this.result.checks.components.warnings.push(
                  `Component file has no exports: ${dir}/${file.name}`
                );
              }
              
              if (content.includes('console.log') || content.includes('console.error')) {
                this.result.checks.components.warnings.push(
                  `Component contains console statements: ${dir}/${file.name}`
                );
              }
              
              // Check for proper React imports
              if (content.includes('React') && !content.includes('import React') && !content.includes('import * as React')) {
                this.result.checks.components.warnings.push(
                  `Component uses React without proper import: ${dir}/${file.name}`
                );
              }
              
            } catch (error) {
              this.result.checks.components.errors.push(
                `Failed to validate component file ${dir}/${file.name}: ${error}`
              );
              this.result.checks.components.success = false;
            }
          }
        }
      }
    }
  }

  // Validate project dependencies
  private async validateDependencies(): Promise<void> {
    try {
      logger.info('Validating project dependencies');
      
      // Check package.json exists
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        this.result.checks.dependencies.errors.push('package.json not found');
        this.result.checks.dependencies.success = false;
        return;
      }
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Check for required dependencies
      const requiredDeps = ['react', 'next'];
      const requiredDevDeps = ['typescript', '@types/react'];
      
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies?.[dep]) {
          this.result.checks.dependencies.errors.push(`Missing required dependency: ${dep}`);
          this.result.checks.dependencies.success = false;
        }
      }
      
      for (const devDep of requiredDevDeps) {
        if (!packageJson.devDependencies?.[devDep]) {
          this.result.checks.dependencies.warnings.push(`Missing recommended dev dependency: ${devDep}`);
        }
      }
      
      // Check for security vulnerabilities (if audit command is available)
      await this.checkSecurityVulnerabilities();
      
    } catch (error) {
      this.result.checks.dependencies.errors.push(`Dependency validation failed: ${error}`);
      this.result.checks.dependencies.success = false;
    }
  }

  // Check for security vulnerabilities
  private async checkSecurityVulnerabilities(): Promise<void> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync(
        'npm audit --audit-level=high --json',
        { cwd: this.workspaceRoot, timeout: 30000 }
      );
      
      const auditResult = JSON.parse(stdout);
      if (auditResult.metadata?.vulnerabilities?.high > 0 || auditResult.metadata?.vulnerabilities?.critical > 0) {
        this.result.checks.dependencies.warnings.push(
          `Security vulnerabilities found: ${auditResult.metadata.vulnerabilities.high} high, ${auditResult.metadata.vulnerabilities.critical} critical`
        );
      }
      
    } catch (error) {
      // Audit command might not be available or might fail - not critical
      this.result.checks.dependencies.warnings.push('Could not run security audit check');
    }
  }

  // Validate configuration files
  private async validateConfiguration(): Promise<void> {
    try {
      logger.info('Validating configuration files');
      
      const configFiles = [
        { path: 'next.config.js', required: true },
        { path: 'tailwind.config.js', required: false },
        { path: 'postcss.config.js', required: false },
        { path: 'tsconfig.json', required: true }
      ];
      
      for (const config of configFiles) {
        const fullPath = path.join(this.workspaceRoot, config.path);
        
        if (!fs.existsSync(fullPath)) {
          if (config.required) {
            this.result.checks.configuration.errors.push(`Missing required config file: ${config.path}`);
            this.result.checks.configuration.success = false;
          } else {
            this.result.checks.configuration.warnings.push(`Optional config file not found: ${config.path}`);
          }
        } else {
          // Basic syntax validation for JSON files
          if (config.path.endsWith('.json')) {
            try {
              JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            } catch (error) {
              this.result.checks.configuration.errors.push(`Invalid JSON in ${config.path}: ${error}`);
              this.result.checks.configuration.success = false;
            }
          }
        }
      }
      
    } catch (error) {
      this.result.checks.configuration.errors.push(`Configuration validation failed: ${error}`);
      this.result.checks.configuration.success = false;
    }
  }

  // Validate performance considerations
  private async validatePerformance(): Promise<void> {
    try {
      logger.info('Validating performance considerations');
      
      // Check for potential performance issues
      await this.checkBundleSize();
      await this.checkImageOptimization();
      await this.checkLargeFiles();
      
    } catch (error) {
      this.result.checks.performance.errors.push(`Performance validation failed: ${error}`);
      this.result.checks.performance.success = false;
    }
  }

  // Check estimated bundle size
  private async checkBundleSize(): Promise<void> {
    try {
      // Calculate estimated JavaScript bundle size
      const jsFiles = await this.findFiles('**/*.{js,jsx,ts,tsx}', ['node_modules', '.next']);
      let totalSize = 0;
      
      for (const file of jsFiles) {
        const stats = fs.statSync(file);
        totalSize += stats.size;
      }
      
      // Rough estimation: source size * 0.3 for minified bundle
      const estimatedBundleSize = totalSize * 0.3;
      const sizeMB = estimatedBundleSize / (1024 * 1024);
      
      if (sizeMB > 5) {
        this.result.checks.performance.warnings.push(
          `Large estimated bundle size: ${sizeMB.toFixed(2)}MB - consider code splitting`
        );
      }
      
    } catch (error) {
      this.result.checks.performance.warnings.push(`Could not estimate bundle size: ${error}`);
    }
  }

  // Check image optimization
  private async checkImageOptimization(): Promise<void> {
    const imageFiles = await this.findFiles('**/*.{jpg,jpeg,png,gif,webp}', ['node_modules']);
    let largeImages = 0;
    
    for (const file of imageFiles) {
      const stats = fs.statSync(file);
      if (stats.size > 500 * 1024) { // 500KB
        largeImages++;
      }
    }
    
    if (largeImages > 0) {
      this.result.checks.performance.warnings.push(
        `${largeImages} large image files found - consider optimization`
      );
    }
  }

  // Check for unnecessarily large files
  private async checkLargeFiles(): Promise<void> {
    const sourceFiles = await this.findFiles('**/*.{js,jsx,ts,tsx,css,scss}', ['node_modules', '.next']);
    let largeFiles = 0;
    
    for (const file of sourceFiles) {
      const stats = fs.statSync(file);
      if (stats.size > 100 * 1024) { // 100KB
        largeFiles++;
      }
    }
    
    if (largeFiles > 5) {
      this.result.checks.performance.warnings.push(
        `${largeFiles} large source files found - consider splitting or optimization`
      );
    }
  }

  // Helper function to find files by pattern
  private async findFiles(pattern: string, excludeDirs: string[] = []): Promise<string[]> {
    const glob = require('glob');
    const { promisify } = require('util');
    const globAsync = promisify(glob);
    
    const files = await globAsync(pattern, {
      cwd: this.workspaceRoot,
      absolute: true,
      ignore: excludeDirs.map(dir => `**/${dir}/**`)
    });
    
    return files;
  }

  // Generate validation summary
  private generateSummary(): void {
    const allChecks = Object.values(this.result.checks);
    
    // Count errors and warnings
    this.result.summary.totalErrors = allChecks.reduce((sum, check) => sum + check.errors.length, 0);
    this.result.summary.totalWarnings = allChecks.reduce((sum, check) => sum + check.warnings.length, 0);
    
    // Determine overall success
    this.result.success = allChecks.every(check => check.success);
    
    // Collect critical issues
    this.result.summary.criticalIssues = allChecks
      .filter(check => !check.success)
      .flatMap(check => check.errors);
    
    // Generate recommendations
    if (this.result.checks.typescript.errors.length > 0) {
      this.result.summary.recommendations.push('Fix TypeScript compilation errors before deployment');
    }
    
    if (this.result.checks.content.errors.length > 0) {
      this.result.summary.recommendations.push('Resolve content integrity issues');
    }
    
    if (this.result.summary.totalWarnings > 10) {
      this.result.summary.recommendations.push('Address accumulated warnings to improve code quality');
    }
    
    if (this.result.checks.performance.warnings.length > 0) {
      this.result.summary.recommendations.push('Consider performance optimizations for better user experience');
    }
  }

  // Generate detailed validation report
  generateReport(): string {
    const { checks, summary } = this.result;
    
    let report = `# Build Validation Report
Generated: ${this.result.timestamp}
Duration: ${Math.round(this.result.duration)}ms
Success: ${this.result.success ? '✅ PASS' : '❌ FAIL'}

## Summary
- **Total Errors**: ${summary.totalErrors}
- **Total Warnings**: ${summary.totalWarnings}
- **Critical Issues**: ${summary.criticalIssues.length}

## Validation Results

### TypeScript Compilation ${checks.typescript.success ? '✅' : '❌'}
- Errors: ${checks.typescript.errors.length}
- Warnings: ${checks.typescript.warnings.length}
${checks.typescript.errors.length > 0 ? '\n**Errors:**\n' + checks.typescript.errors.map(e => `- ${e}`).join('\n') : ''}

### Content Integrity ${checks.content.success ? '✅' : '❌'}
- Errors: ${checks.content.errors.length}
- Warnings: ${checks.content.warnings.length}
${checks.content.errors.length > 0 ? '\n**Errors:**\n' + checks.content.errors.map(e => `- ${e}`).join('\n') : ''}

### Component Structure ${checks.components.success ? '✅' : '❌'}
- Errors: ${checks.components.errors.length}
- Warnings: ${checks.components.warnings.length}

### Dependencies ${checks.dependencies.success ? '✅' : '❌'}
- Errors: ${checks.dependencies.errors.length}
- Warnings: ${checks.dependencies.warnings.length}

### Configuration ${checks.configuration.success ? '✅' : '❌'}
- Errors: ${checks.configuration.errors.length}
- Warnings: ${checks.configuration.warnings.length}

### Performance ${checks.performance.success ? '✅' : '❌'}
- Errors: ${checks.performance.errors.length}
- Warnings: ${checks.performance.warnings.length}

## Recommendations
${summary.recommendations.map(r => `- ${r}`).join('\n')}

---
Generated by Z-Beam Build Validation System (GROK-Compliant)
`;

    return report;
  }
}

// Export for use in other scripts
export { BuildValidator };
export type { BuildValidationResult };

// CLI execution (when run directly)
if (require.main === module) {
  const strictMode = process.argv.includes('--strict');
  const validator = new BuildValidator(process.cwd(), strictMode);
  
  validator.validateBuild()
    .then(result => {
      console.log('\n=== BUILD VALIDATION COMPLETED ===');
      console.log(`Success: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Duration: ${Math.round(result.duration)}ms`);
      console.log(`Errors: ${result.summary.totalErrors}`);
      console.log(`Warnings: ${result.summary.totalWarnings}`);
      
      if (result.summary.recommendations.length > 0) {
        console.log('\nRecommendations:');
        result.summary.recommendations.forEach(rec => console.log(`- ${rec}`));
      }
      
      // Save detailed report
      fs.writeFileSync(
        path.join(process.cwd(), 'build-validation-report.md'),
        validator.generateReport()
      );
      
      console.log('\nDetailed report saved to: build-validation-report.md');
      
      // Exit with error code if validation failed
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Build validation failed:', error);
      process.exit(1);
    });
}
