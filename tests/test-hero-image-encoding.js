// Hero Component Image Encoding Test
console.log('🎬 HERO COMPONENT IMAGE ENCODING TEST');
console.log('====================================\n');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class HeroImageEncodingTest {
  constructor() {
    this.results = {
      encodingTests: {},
      integrationTests: {},
      regressionTests: {},
      summary: {},
      timestamp: new Date().toISOString()
    };
    this.heroComponentPath = path.join(__dirname, '..', 'app', 'components', 'Hero', 'Hero.tsx');
    this.publicImagesPath = path.join(__dirname, '..', 'public', 'images');
  }

  // Test URL encoding functionality
  async testURLEncoding() {
    console.log('🔍 Testing URL encoding functionality...\n');
    
    const testCases = [
      {
        name: 'Parentheses in filename',
        input: '/images/ceramic-matrix-composites-(cmcs)-laser-cleaning-hero.jpg',
        expected: '/images/ceramic-matrix-composites-%28cmcs%29-laser-cleaning-hero.jpg',
        description: 'Should encode parentheses for CSS background-image'
      },
      {
        name: 'No special characters',
        input: '/images/aluminum-laser-cleaning-hero.jpg',
        expected: '/images/aluminum-laser-cleaning-hero.jpg',
        description: 'Should leave normal filenames unchanged'
      },
      {
        name: 'Multiple parentheses',
        input: '/images/test-(group)-(variant)-hero.jpg',
        expected: '/images/test-%28group%29-%28variant%29-hero.jpg',
        description: 'Should encode all parentheses'
      },
      {
        name: 'Empty string',
        input: '',
        expected: null,
        description: 'Should handle empty strings gracefully'
      },
      {
        name: 'Null input',
        input: null,
        expected: null,
        description: 'Should handle null input gracefully'
      }
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const testCase of testCases) {
      console.log(`📋 Testing: ${testCase.name}`);
      
      try {
        // Extract the encoding logic from Hero component
        const encodedResult = this.simulateHeroEncoding(testCase.input);
        
        const passed = encodedResult === testCase.expected;
        
        this.results.encodingTests[testCase.name] = {
          status: passed ? 'PASS' : 'FAIL',
          input: testCase.input,
          expected: testCase.expected,
          actual: encodedResult,
          description: testCase.description
        };

        if (passed) {
          console.log(`  ✅ PASS: ${testCase.description}`);
          console.log(`     Input: ${JSON.stringify(testCase.input)}`);
          console.log(`     Output: ${JSON.stringify(encodedResult)}`);
          passedTests++;
        } else {
          console.log(`  ❌ FAIL: ${testCase.description}`);
          console.log(`     Input: ${JSON.stringify(testCase.input)}`);
          console.log(`     Expected: ${JSON.stringify(testCase.expected)}`);
          console.log(`     Actual: ${JSON.stringify(encodedResult)}`);
          failedTests++;
        }
      } catch (error) {
        console.log(`  💥 ERROR: ${error.message}`);
        this.results.encodingTests[testCase.name] = {
          status: 'ERROR',
          error: error.message
        };
        failedTests++;
      }
      
      console.log('');
    }

    console.log(`📊 URL Encoding Test Summary:`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Total: ${passedTests + failedTests}\n`);

    return { passedTests, failedTests };
  }

  // Test integration with actual component
  async testComponentIntegration() {
    console.log('🔍 Testing Hero component integration...\n');
    
    let integrationPassed = 0;
    let integrationFailed = 0;

    // Test 1: Check if Hero component exists and has encoding logic
    console.log('📋 Testing: Component file exists and contains encoding logic');
    try {
      if (!fs.existsSync(this.heroComponentPath)) {
        throw new Error('Hero component file not found');
      }

      const heroContent = fs.readFileSync(this.heroComponentPath, 'utf8');
      
      const hasEncoding = heroContent.includes('replace(/\\(/g, \'%28\')') && 
                         heroContent.includes('replace(/\\)/g, \'%29\')');
      
      if (hasEncoding) {
        console.log('  ✅ PASS: Hero component contains parentheses encoding logic');
        this.results.integrationTests.encodingLogic = {
          status: 'PASS',
          message: 'Encoding logic found in component'
        };
        integrationPassed++;
      } else {
        console.log('  ❌ FAIL: Hero component missing parentheses encoding logic');
        this.results.integrationTests.encodingLogic = {
          status: 'FAIL',
          message: 'Encoding logic not found in component'
        };
        integrationFailed++;
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.integrationTests.encodingLogic = {
        status: 'ERROR',
        error: error.message
      };
      integrationFailed++;
    }

    // Test 2: Check TypeScript compilation with Hero component
    console.log('📋 Testing: TypeScript compilation with Hero component');
    try {
      execSync('npx tsc --noEmit', {
        cwd: path.join(__dirname, '..'),
        timeout: 30000,
        stdio: 'pipe'
      });
      
      console.log('  ✅ PASS: Hero component compiles without TypeScript errors');
      this.results.integrationTests.typescript = {
        status: 'PASS',
        message: 'TypeScript compilation successful'
      };
      integrationPassed++;
    } catch (error) {
      console.log('  ❌ FAIL: TypeScript compilation errors with Hero component');
      this.results.integrationTests.typescript = {
        status: 'FAIL',
        error: error.stderr || error.message
      };
      integrationFailed++;
    }

    // Test 3: Check if test image files with parentheses exist
    console.log('📋 Testing: Test image files with parentheses exist');
    try {
      const testImagePath = path.join(this.publicImagesPath, 'ceramic-matrix-composites-(cmcs)-laser-cleaning-hero.jpg');
      
      if (fs.existsSync(testImagePath)) {
        console.log('  ✅ PASS: Test image with parentheses exists');
        this.results.integrationTests.testImage = {
          status: 'PASS',
          path: testImagePath,
          message: 'Test image file found'
        };
        integrationPassed++;
      } else {
        console.log('  ⚠️  WARN: Test image with parentheses not found');
        this.results.integrationTests.testImage = {
          status: 'WARN',
          path: testImagePath,
          message: 'Test image file not found - integration test incomplete'
        };
        // Don't count as failed since this is just a warning
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.integrationTests.testImage = {
        status: 'ERROR',
        error: error.message
      };
      integrationFailed++;
    }

    console.log('');
    console.log(`📊 Integration Test Summary:`);
    console.log(`   Passed: ${integrationPassed}`);
    console.log(`   Failed: ${integrationFailed}\n`);

    return { integrationPassed, integrationFailed };
  }

  // Test for regressions
  async testRegressions() {
    console.log('🔍 Testing for regressions...\n');
    
    let regressionPassed = 0;
    let regressionFailed = 0;

    // Test 1: Normal images without special characters still work
    console.log('📋 Testing: Normal image paths without special characters');
    try {
      const normalPath = '/images/aluminum-laser-cleaning-hero.jpg';
      const encoded = this.simulateHeroEncoding(normalPath);
      
      if (encoded === normalPath) {
        console.log('  ✅ PASS: Normal image paths unchanged');
        this.results.regressionTests.normalPaths = {
          status: 'PASS',
          message: 'Normal paths work correctly'
        };
        regressionPassed++;
      } else {
        console.log('  ❌ FAIL: Normal image paths being modified incorrectly');
        this.results.regressionTests.normalPaths = {
          status: 'FAIL',
          expected: normalPath,
          actual: encoded
        };
        regressionFailed++;
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.regressionTests.normalPaths = {
        status: 'ERROR',
        error: error.message
      };
      regressionFailed++;
    }

    // Test 2: Component still handles null/undefined gracefully
    console.log('📋 Testing: Null/undefined image paths handled gracefully');
    try {
      const nullResult = this.simulateHeroEncoding(null);
      const undefinedResult = this.simulateHeroEncoding(undefined);
      
      if (nullResult === null && undefinedResult === null) {
        console.log('  ✅ PASS: Null/undefined paths handled gracefully');
        this.results.regressionTests.nullHandling = {
          status: 'PASS',
          message: 'Null/undefined handling works correctly'
        };
        regressionPassed++;
      } else {
        console.log('  ❌ FAIL: Null/undefined paths not handled correctly');
        this.results.regressionTests.nullHandling = {
          status: 'FAIL',
          nullResult,
          undefinedResult
        };
        regressionFailed++;
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.regressionTests.nullHandling = {
        status: 'ERROR',
        error: error.message
      };
      regressionFailed++;
    }

    // Test 3: Component props interface unchanged
    console.log('📋 Testing: Component props interface unchanged');
    try {
      const heroContent = fs.readFileSync(this.heroComponentPath, 'utf8');
      
      const hasImageProp = heroContent.includes('image?: string');
      const hasFrontmatterProp = heroContent.includes('frontmatter?:');
      const hasThemeProp = heroContent.includes('theme?:');
      
      if (hasImageProp && hasFrontmatterProp && hasThemeProp) {
        console.log('  ✅ PASS: Component props interface preserved');
        this.results.regressionTests.propsInterface = {
          status: 'PASS',
          message: 'Props interface unchanged'
        };
        regressionPassed++;
      } else {
        console.log('  ❌ FAIL: Component props interface changed unexpectedly');
        this.results.regressionTests.propsInterface = {
          status: 'FAIL',
          message: 'Props interface may have changed'
        };
        regressionFailed++;
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.regressionTests.propsInterface = {
        status: 'ERROR',
        error: error.message
      };
      regressionFailed++;
    }

    console.log('');
    console.log(`📊 Regression Test Summary:`);
    console.log(`   Passed: ${regressionPassed}`);
    console.log(`   Failed: ${regressionFailed}\n`);

    return { regressionPassed, regressionFailed };
  }

  // Simulate the Hero component's encoding logic
  simulateHeroEncoding(imageSource) {
    // This replicates the logic from Hero.tsx:
    // const encodedImageSource = imageSource ? imageSource.replace(/\(/g, '%28').replace(/\)/g, '%29') : null;
    
    if (!imageSource) {
      return null;
    }
    
    if (typeof imageSource !== 'string') {
      return null;
    }
    
    return imageSource.replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  // Generate comprehensive report
  generateReport() {
    console.log('📊 HERO IMAGE ENCODING TEST REPORT');
    console.log('==================================\n');

    const encodingResults = Object.values(this.results.encodingTests);
    const integrationResults = Object.values(this.results.integrationTests);
    const regressionResults = Object.values(this.results.regressionTests);

    const encodingStats = {
      total: encodingResults.length,
      passed: encodingResults.filter(r => r.status === 'PASS').length,
      failed: encodingResults.filter(r => r.status === 'FAIL').length,
      errors: encodingResults.filter(r => r.status === 'ERROR').length
    };

    const integrationStats = {
      total: integrationResults.length,
      passed: integrationResults.filter(r => r.status === 'PASS').length,
      failed: integrationResults.filter(r => r.status === 'FAIL').length,
      warnings: integrationResults.filter(r => r.status === 'WARN').length,
      errors: integrationResults.filter(r => r.status === 'ERROR').length
    };

    const regressionStats = {
      total: regressionResults.length,
      passed: regressionResults.filter(r => r.status === 'PASS').length,
      failed: regressionResults.filter(r => r.status === 'FAIL').length,
      errors: regressionResults.filter(r => r.status === 'ERROR').length
    };

    console.log(`🔍 URL Encoding Tests:`);
    console.log(`   Total: ${encodingStats.total}`);
    console.log(`   Passed: ${encodingStats.passed}`);
    console.log(`   Failed: ${encodingStats.failed}`);
    console.log(`   Errors: ${encodingStats.errors}\n`);

    console.log(`🔍 Integration Tests:`);
    console.log(`   Total: ${integrationStats.total}`);
    console.log(`   Passed: ${integrationStats.passed}`);
    console.log(`   Failed: ${integrationStats.failed}`);
    console.log(`   Warnings: ${integrationStats.warnings}`);
    console.log(`   Errors: ${integrationStats.errors}\n`);

    console.log(`🔍 Regression Tests:`);
    console.log(`   Total: ${regressionStats.total}`);
    console.log(`   Passed: ${regressionStats.passed}`);
    console.log(`   Failed: ${regressionStats.failed}`);
    console.log(`   Errors: ${regressionStats.errors}\n`);

    // Overall assessment
    const totalFailed = encodingStats.failed + integrationStats.failed + regressionStats.failed;
    const totalErrors = encodingStats.errors + integrationStats.errors + regressionStats.errors;
    
    let overallStatus;
    if (totalErrors > 0) {
      overallStatus = 'ERROR';
    } else if (totalFailed > 0) {
      overallStatus = 'FAIL';
    } else if (integrationStats.warnings > 0) {
      overallStatus = 'WARN';
    } else {
      overallStatus = 'PASS';
    }

    this.results.summary = {
      overallStatus,
      encodingTests: encodingStats,
      integrationTests: integrationStats,
      regressionTests: regressionStats,
      timestamp: new Date().toISOString()
    };

    console.log(`🏆 Overall Status: ${overallStatus}\n`);

    // Show key findings
    if (overallStatus === 'PASS') {
      console.log('🎉 All Hero image encoding tests passed!');
      console.log('✅ URL encoding works correctly for parentheses');
      console.log('✅ Component integration successful');
      console.log('✅ No regressions detected');
    } else {
      console.log('⚠️  Issues detected in Hero image encoding:');
      
      if (encodingStats.failed > 0) {
        console.log(`   • ${encodingStats.failed} URL encoding test(s) failed`);
      }
      
      if (integrationStats.failed > 0) {
        console.log(`   • ${integrationStats.failed} integration test(s) failed`);
      }
      
      if (regressionStats.failed > 0) {
        console.log(`   • ${regressionStats.failed} regression test(s) failed`);
      }
    }

    // Save results
    const reportPath = path.join(__dirname, 'hero-image-encoding-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📁 Detailed results saved to: ${reportPath}`);

    return this.results;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Hero Image Encoding Test Suite...\n');
    
    try {
      const encodingResults = await this.testURLEncoding();
      const integrationResults = await this.testComponentIntegration();
      const regressionResults = await this.testRegressions();
      
      const report = this.generateReport();
      
      // Return appropriate exit code
      if (report.summary.overallStatus === 'ERROR' || report.summary.overallStatus === 'FAIL') {
        return 1;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('\n💥 Hero image encoding test suite crashed:', error.message);
      return 1;
    }
  }
}

// Run the test suite
async function main() {
  const testSuite = new HeroImageEncodingTest();
  const exitCode = await testSuite.runAllTests();
  
  if (exitCode === 0) {
    console.log('\n✅ Hero image encoding test suite completed successfully!');
  } else {
    console.log('\n❌ Hero image encoding test suite completed with issues!');
  }
  
  process.exit(exitCode);
}

main();
