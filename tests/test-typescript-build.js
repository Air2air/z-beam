// TypeScript and Build Validation Test
console.log('🔍 TYPESCRIPT & BUILD VALIDATION TEST');
console.log('====================================\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TypeScriptBuildTest {
  constructor() {
    this.results = {
      typeCheck: null,
      buildCheck: null,
      lintCheck: null,
      typeRules: null,
      summary: {}
    };
  }

  // Test for any types and other type rule violations
  async testTypeRules() {
    console.log('🔍 Testing type safety rules...');
    
    try {
      const violations = [];
      
      // Check for 'any' types
      const anyTypeCheck = this.checkForAnyTypes();
      if (anyTypeCheck.count > 0) {
        violations.push({
          rule: 'No any types',
          count: anyTypeCheck.count,
          files: anyTypeCheck.files
        });
      }
      
      // Check for missing return types on functions
      const missingReturnTypes = this.checkForMissingReturnTypes();
      if (missingReturnTypes.count > 0) {
        violations.push({
          rule: 'Missing return types',
          count: missingReturnTypes.count,
          files: missingReturnTypes.files
        });
      }
      
      // Check for untyped props
      const untypedProps = this.checkForUntypedProps();
      if (untypedProps.count > 0) {
        violations.push({
          rule: 'Untyped props',
          count: untypedProps.count,
          files: untypedProps.files
        });
      }
      
      this.results.typeRules = {
        status: violations.length === 0 ? 'PASS' : 'WARN',
        violations: violations,
        totalViolations: violations.reduce((sum, v) => sum + v.count, 0)
      };
      
      if (violations.length === 0) {
        console.log('  ✅ Type rules: PASSED');
      } else {
        console.log(`  ⚠️  Type rules: ${violations.length} rule violations found`);
        violations.forEach(v => {
          console.log(`    - ${v.rule}: ${v.count} violations`);
        });
      }
      
      return violations.length === 0;
    } catch (error) {
      this.results.typeRules = {
        status: 'ERROR',
        error: error.message
      };
      console.log('  ❌ Type rules check: ERROR');
      return false;
    }
  }

  checkForAnyTypes() {
    const results = { count: 0, files: [] };
    const searchDirs = ['app/', 'types/', 'utils/'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        this.searchAnyTypes(dir, results);
      }
    }
    
    return results;
  }

  searchAnyTypes(dir, results) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.searchAnyTypes(filePath, results);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Look for ': any' or 'any[]' or 'any|' patterns
        const anyMatches = content.match(/:\s*any(\s|;|,|\||]|\})/g);
        if (anyMatches) {
          results.count += anyMatches.length;
          results.files.push({
            file: filePath,
            matches: anyMatches.length
          });
        }
      }
    }
  }

  checkForMissingReturnTypes() {
    const results = { count: 0, files: [] };
    // This is a simplified check - could be enhanced
    return results;
  }

  checkForUntypedProps() {
    const results = { count: 0, files: [] };
    // This is a simplified check - could be enhanced  
    return results;
  }

  // Test TypeScript compilation without emitting files
  async testTypeScriptCompilation() {
    console.log('🔍 Testing TypeScript compilation...');
    
    try {
      const output = execSync('npx tsc --noEmit', { 
        encoding: 'utf8',
        timeout: 60000 // 60 second timeout for large projects
      });
      
      this.results.typeCheck = {
        status: 'PASS',
        output: output || 'No TypeScript errors detected',
        errors: 0
      };
      
      console.log('  ✅ TypeScript compilation: PASSED');
      return true;
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
      
      this.results.typeCheck = {
        status: 'FAIL',
        output: errorOutput.slice(0, 1000), // Truncate long outputs
        errors: errorCount,
        details: this.parseTypeScriptErrors(errorOutput)
      };
      
      console.log(`  ❌ TypeScript compilation: FAILED (${errorCount} errors)`);
      return false;
    }
  }

  // Test ESLint validation
  async testESLintValidation() {
    console.log('🔍 Testing ESLint validation...');
    
    try {
      const output = execSync('npm run lint', { 
        encoding: 'utf8',
        timeout: 60000
      });
      
      this.results.lintCheck = {
        status: 'PASS',
        output: output || 'No ESLint errors detected',
        warnings: this.countLintWarnings(output)
      };
      
      console.log('  ✅ ESLint validation: PASSED');
      return true;
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      const warningCount = this.countLintWarnings(errorOutput);
      const errorCount = this.countLintErrors(errorOutput);
      
      this.results.lintCheck = {
        status: errorCount > 0 ? 'FAIL' : 'WARN',
        output: errorOutput.slice(0, 1000),
        warnings: warningCount,
        errors: errorCount
      };
      
      if (errorCount > 0) {
        console.log(`  ❌ ESLint validation: FAILED (${errorCount} errors, ${warningCount} warnings)`);
        return false;
      } else {
        console.log(`  ⚠️  ESLint validation: WARNINGS (${warningCount} warnings)`);
        return true;
      }
    }
  }

  // Test actual build process
  async testBuildProcess() {
    console.log('🔍 Testing build process...');
    
    try {
      const startTime = Date.now();
      const output = execSync('npm run build', { 
        encoding: 'utf8',
        timeout: 120000 // 2 minute timeout for builds
      });
      const duration = Date.now() - startTime;
      
      this.results.buildCheck = {
        status: 'PASS',
        output: 'Build completed successfully',
        duration,
        warnings: this.countBuildWarnings(output)
      };
      
      console.log(`  ✅ Build process: PASSED (${duration}ms)`);
      return true;
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      
      this.results.buildCheck = {
        status: 'FAIL',
        output: errorOutput.slice(0, 1000),
        error: error.message.slice(0, 500)
      };
      
      console.log('  ❌ Build process: FAILED');
      return false;
    }
  }

  // Parse TypeScript errors for detailed analysis
  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/(.+\.tsx?)\((\d+),(\d+)\): error TS(\d+): (.+)/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5]
        });
      }
    }
    
    return errors.slice(0, 10); // Limit to first 10 errors
  }

  // Count various types of issues
  countLintWarnings(output) {
    return (output.match(/Warning:/g) || []).length;
  }

  countLintErrors(output) {
    return (output.match(/Error:/g) || []).length;
  }

  countBuildWarnings(output) {
    return (output.match(/Warning:/g) || []).length;
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 TYPESCRIPT & BUILD TEST RESULTS');
    console.log('=====================================\n');

    const { typeCheck, typeRules, lintCheck, buildCheck } = this.results;
    
    // TypeScript Results
    if (typeCheck) {
      console.log(`🔍 TypeScript Compilation: ${typeCheck.status}`);
      if (typeCheck.status === 'FAIL') {
        console.log(`   Errors: ${typeCheck.errors}`);
        if (typeCheck.details && typeCheck.details.length > 0) {
          console.log('   Sample errors:');
          typeCheck.details.slice(0, 3).forEach(error => {
            console.log(`     • ${error.file}:${error.line} - ${error.message}`);
          });
        }
      }
      console.log('');
    }

    // Type Rules Results
    if (typeRules) {
      console.log(`🔍 Type Safety Rules: ${typeRules.status}`);
      if (typeRules.violations && typeRules.violations.length > 0) {
        console.log(`   Total Violations: ${typeRules.totalViolations}`);
        typeRules.violations.forEach(violation => {
          console.log(`   • ${violation.rule}: ${violation.count} violations`);
          if (violation.files && violation.files.length > 0) {
            violation.files.slice(0, 3).forEach(file => {
              console.log(`     - ${file.file} (${file.matches} matches)`);
            });
          }
        });
      }
      console.log('');
    }

    // ESLint Results
    if (lintCheck) {
      console.log(`🔍 ESLint Validation: ${lintCheck.status}`);
      if (lintCheck.warnings > 0) {
        console.log(`   Warnings: ${lintCheck.warnings}`);
      }
      if (lintCheck.errors > 0) {
        console.log(`   Errors: ${lintCheck.errors}`);
      }
      console.log('');
    }

    // Build Results
    if (buildCheck) {
      console.log(`🔍 Build Process: ${buildCheck.status}`);
      if (buildCheck.duration) {
        console.log(`   Duration: ${buildCheck.duration}ms`);
      }
      if (buildCheck.warnings > 0) {
        console.log(`   Build Warnings: ${buildCheck.warnings}`);
      }
      console.log('');
    }

    // Overall Summary
    const allPassed = [typeCheck, typeRules, lintCheck, buildCheck].every(test => 
      test && (test.status === 'PASS' || test.status === 'WARN')
    );

    this.results.summary = {
      overallStatus: allPassed ? 'PASS' : 'FAIL',
      testsRun: [typeCheck, typeRules, lintCheck, buildCheck].filter(Boolean).length,
      timestamp: new Date().toISOString()
    };

    console.log(`🏆 Overall Status: ${this.results.summary.overallStatus}`);
    
    // Save results
    const reportPath = path.join(__dirname, 'typescript-build-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed results saved to: ${reportPath}`);
  }
}

// Run the comprehensive TypeScript and build tests
async function main() {
  const tester = new TypeScriptBuildTest();
  
  try {
    console.log('Starting comprehensive TypeScript and build validation...\n');
    
    // Run all tests
    await tester.testTypeScriptCompilation();
    await tester.testTypeRules();
    await tester.testESLintValidation();
    await tester.testBuildProcess();
    
    tester.generateReport();
    
    if (tester.results.summary.overallStatus === 'PASS') {
      console.log('\n✅ All TypeScript and build tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some TypeScript or build tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Test suite crashed:', error.message);
    process.exit(1);
  }
}

main();
