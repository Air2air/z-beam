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
      summary: {}
    };
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

    const { typeCheck, lintCheck, buildCheck } = this.results;
    
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
    const allPassed = [typeCheck, lintCheck, buildCheck].every(test => 
      test && (test.status === 'PASS' || test.status === 'WARN')
    );

    this.results.summary = {
      overallStatus: allPassed ? 'PASS' : 'FAIL',
      testsRun: [typeCheck, lintCheck, buildCheck].filter(Boolean).length,
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
