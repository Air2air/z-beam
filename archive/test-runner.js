// Pure Test Runner - Testing Only
console.log('🧪 RUNNING TEST SUITE');
console.log('==================\n');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestRunner {
  constructor() {
    this.results = {
      tests: {},
      summary: {}
    };
  }

  // Run a single test file
  async runTest(testFile, description) {
    console.log(`🔄 Running: ${description}`);
    
    try {
      const startTime = Date.now();
      const output = execSync(`node ${testFile}`, { 
        encoding: 'utf8',
        timeout: 30000,
        cwd: path.join(__dirname, '..')
      });
      const duration = Date.now() - startTime;
      
      this.results.tests[testFile] = {
        status: 'PASS',
        description,
        duration,
        output: output.slice(0, 500)
      };
      
      console.log(`✅ PASSED (${duration}ms)\n`);
      return true;
    } catch (error) {
      this.results.tests[testFile] = {
        status: 'FAIL',
        description,
        error: error.message.slice(0, 500)
      };
      
      console.log(`❌ FAILED: ${error.message.slice(0, 100)}...\n`);
      return false;
    }
  }

  // Run the complete test suite
  async runAllTests() {
    const testSuite = [
      {
        file: 'tests/test-yaml-errors.js',
        description: 'YAML Error Detection and Validation'
      },
      {
        file: 'tests/test-sanitizer.js', 
        description: 'YAML Sanitization and Pattern Fixing'
      },
      {
        file: 'tests/test-layout-structure.js',
        description: 'Layout Component Structure and Positioning'
      },
      {
        file: 'tests/test-typescript-build.js',
        description: 'TypeScript Compilation and Build Validation'
      },
      {
        file: 'tests/test-component-validation.js',
        description: 'Component Import and Props Validation'
      }
    ];

    let passedTests = 0;
    let totalTests = testSuite.length;

    // Run each test
    for (const test of testSuite) {
      if (fs.existsSync(path.join(__dirname, '..', test.file))) {
        const passed = await this.runTest(test.file, test.description);
        if (passed) passedTests++;
      } else {
        console.log(`⚠️  Test file not found: ${test.file}\n`);
        this.results.tests[test.file] = {
          status: 'SKIP',
          description: test.description,
          error: 'File not found'
        };
      }
    }

    // Generate summary
    const passRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('======================\n');
    
    console.log('🧪 Test Results:');
    Object.entries(this.results.tests).forEach(([file, result]) => {
      const status = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : '⏸️';
      console.log(`   ${status} ${file} - ${result.description}`);
    });
    
    console.log(`\n📈 Pass Rate: ${passedTests}/${totalTests} (${passRate}%)`);
    
    // Overall assessment
    console.log('\n🏆 OVERALL TEST ASSESSMENT:');
    console.log('===========================');
    
    if (passRate === 100) {
      console.log('🟢 EXCELLENT - All tests passing');
    } else if (passRate >= 80) {
      console.log('🟡 GOOD - Most tests passing, some need attention');
    } else {
      console.log('🔴 NEEDS WORK - Significant test failures');
    }

    // Save results
    this.results.summary = {
      passedTests,
      totalTests,
      passRate,
      timestamp: new Date().toISOString()
    };

    const resultsFile = path.join(__dirname, '..', 'tests', 'test-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Test results saved to: tests/test-results.json`);

    return passRate === 100;
  }
}

// Main execution
async function main() {
  const runner = new TestRunner();
  
  try {
    const allPassed = await runner.runAllTests();
    
    if (allPassed) {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Check results for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Test runner failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { TestRunner };
