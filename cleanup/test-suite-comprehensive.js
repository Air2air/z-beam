// Comprehensive Test Suite Runner with Cleanup
console.log('🧪 COMPREHENSIVE TEST SUITE WITH CLEANUP');
console.log('========================================\n');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestSuiteRunner {
  constructor() {
    this.results = {
      tests: {},
      cleanup: {},
      overall: {}
    };
  }

  // Run a test file and capture results
  async runTest(testFile, description) {
    console.log(`🔄 Running: ${description}`);
    
    try {
      const startTime = Date.now();
      // Change to project root to run tests
      const output = execSync(`node ${testFile}`, { 
        encoding: 'utf8',
        timeout: 30000, // 30 second timeout
        cwd: path.join(__dirname, '..')
      });
      const duration = Date.now() - startTime;
      
      this.results.tests[testFile] = {
        status: 'PASS',
        description,
        duration,
        output: output.slice(0, 500) // Truncate long outputs
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

  // Run cleanup analysis
  async runCleanupAnalysis() {
    console.log('🧹 RUNNING CLEANUP ANALYSIS');
    console.log('===========================\n');
    
    try {
      const output = execSync('node cleanup/test-dead-file-cleanup.js', { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
      
      // Parse cleanup results
      const cleanupFile = path.join(__dirname, 'cleanup-analysis.json');
      if (fs.existsSync(cleanupFile)) {
        const cleanupData = JSON.parse(fs.readFileSync(cleanupFile, 'utf8'));
        this.results.cleanup = cleanupData;
        
        console.log('✅ Cleanup analysis completed\n');
        return true;
      }
    } catch (error) {
      console.log(`❌ Cleanup analysis failed: ${error.message}\n`);
      return false;
    }
  }

  // Execute cleanup actions (with smart defaults)
  async executeCleanup(autoClean = false) {
    if (!this.results.cleanup.recommendations) {
      console.log('⚠️  No cleanup recommendations available\n');
      return;
    }

    const safeFiles = this.results.cleanup.recommendations.safe || [];
    
    if (safeFiles.length === 0) {
      console.log('✅ No files identified for safe removal\n');
      return;
    }

    console.log('🗑️  CLEANUP EXECUTION');
    console.log('====================\n');

    // Categorize files for smart cleanup
    const obviouslySafe = safeFiles.filter(item => 
      item.file.match(/\.(json|log|tmp)$/) || 
      item.file.includes('temp') || 
      item.file.includes('.old') ||
      item.reason.includes('temporary analysis')
    );
    
    const requiresReview = safeFiles.filter(item => !obviouslySafe.includes(item));

    // Auto-clean obviously safe files by default
    if (obviouslySafe.length > 0) {
      console.log('🔄 Auto-cleaning obviously safe files:');
      let cleanedCount = 0;
      
      obviouslySafe.forEach(item => {
        try {
          if (fs.existsSync(item.file)) {
            fs.unlinkSync(item.file);
            console.log(`✅ Removed ${item.file} (${item.reason})`);
            cleanedCount++;
          }
        } catch (error) {
          console.log(`❌ Failed to remove ${item.file}: ${error.message}`);
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`\n🎉 Auto-cleaned ${cleanedCount} obviously safe files\n`);
      }
    }

    // Handle files that require review
    if (requiresReview.length > 0) {
      if (!autoClean) {
        console.log('🤔 Manual review required for these files:');
        requiresReview.forEach(item => {
          console.log(`   • ${item.file} - ${item.reason}`);
        });
        console.log('\nTo auto-execute all cleanup, run with --auto-clean flag\n');
        return;
      }

      // Auto-cleanup all files (if enabled with flag)
      console.log('🔄 Auto-cleaning all remaining files:');
      let additionalCleaned = 0;

      requiresReview.forEach(item => {
        try {
          if (fs.existsSync(item.file)) {
            fs.unlinkSync(item.file);
            console.log(`✅ Removed ${item.file} (${item.reason})`);
            additionalCleaned++;
          }
        } catch (error) {
          console.log(`❌ Failed to remove ${item.file}: ${error.message}`);
        }
      });
      
      if (additionalCleaned > 0) {
        console.log(`\n🎉 Auto-cleaned ${additionalCleaned} additional files\n`);
      }
    }
  }

  // Run all tests in the suite
  async runFullSuite() {
    console.log('🚀 STARTING COMPREHENSIVE TEST SUITE');
    console.log('====================================\n');

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
      }
    ];

    let passedTests = 0;
    let totalTests = testSuite.length;

    // Run each test
    for (const test of testSuite) {
      if (fs.existsSync(test.file)) {
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

    // Run cleanup analysis
    await this.runCleanupAnalysis();

    // Generate summary
    this.generateSummary(passedTests, totalTests);

    return this.results;
  }

  // Generate comprehensive summary
  generateSummary(passedTests, totalTests) {
    console.log('📊 TEST SUITE SUMMARY');
    console.log('====================\n');

    // Test Results
    console.log('🧪 Test Results:');
    Object.entries(this.results.tests).forEach(([file, result]) => {
      const status = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : '⏸️';
      console.log(`   ${status} ${file} - ${result.description}`);
    });

    const passRate = Math.round((passedTests / totalTests) * 100);
    console.log(`\n📈 Pass Rate: ${passedTests}/${totalTests} (${passRate}%)`);

    // Cleanup Results
    if (this.results.cleanup.stats) {
      const stats = this.results.cleanup.stats;
      console.log('\n🧹 Cleanup Analysis:');
      console.log(`   📁 Total files: ${stats.total}`);
      console.log(`   💀 Dead files: ${stats.dead}`);
      console.log(`   🧪 Test files: ${stats.test}`);
      console.log(`   🐛 Debug files: ${stats.debug}`);
      
      const safeFiles = this.results.cleanup.recommendations?.safe?.length || 0;
      const reviewFiles = this.results.cleanup.recommendations?.review?.length || 0;
      console.log(`   🗑️  Safe to remove: ${safeFiles} files`);
      console.log(`   👀 Need review: ${reviewFiles} files`);
    }

    // Overall Assessment
    console.log('\n🏆 OVERALL ASSESSMENT:');
    console.log('======================');
    
    if (passRate >= 80 && this.results.cleanup.stats) {
      console.log('🟢 EXCELLENT - Tests passing and cleanup analysis complete');
    } else if (passRate >= 60) {
      console.log('🟡 GOOD - Most tests passing, some areas need attention');
    } else {
      console.log('🔴 NEEDS WORK - Significant test failures or missing cleanup');
    }

    // Store overall results
    this.results.overall = {
      passRate,
      passedTests,
      totalTests,
      cleanupAvailable: !!this.results.cleanup.stats,
      timestamp: new Date().toISOString()
    };

    // Save detailed results
    const resultsFile = path.join(__dirname, 'test-suite-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
  }
}

// Run the comprehensive test suite
async function main() {
  const runner = new TestSuiteRunner();
  
  // Check for auto-clean flag
  const autoClean = process.argv.includes('--auto-clean');
  
  try {
    await runner.runFullSuite();
    
    // Execute cleanup if requested
    if (autoClean) {
      await runner.executeCleanup(true);
    } else {
      await runner.executeCleanup(false);
    }
    
    console.log('\n✅ Comprehensive test suite with cleanup complete!');
  } catch (error) {
    console.error(`❌ Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { TestSuiteRunner };
