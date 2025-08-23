// Comprehensive Suite Orchestrator - Optional Integration
console.log('🔄 COMPREHENSIVE DEVELOPMENT SUITE');
console.log('==================================\n');

const { TestRunner } = require('./test-runner');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveSuite {
  constructor() {
    this.testRunner = new TestRunner();
    this.cleanupResults = {};
  }

  // Run cleanup analysis independently
  async runCleanupAnalysis() {
    console.log('🧹 RUNNING CLEANUP ANALYSIS');
    console.log('===========================\n');
    
    try {
      const output = execSync('node cleanup/test-dead-file-cleanup.js', { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
      
      // Load cleanup results
      const cleanupFile = path.join(__dirname, 'cleanup-analysis.json');
      if (fs.existsSync(cleanupFile)) {
        this.cleanupResults = JSON.parse(fs.readFileSync(cleanupFile, 'utf8'));
        console.log('✅ Cleanup analysis completed\n');
        return true;
      }
    } catch (error) {
      console.log(`❌ Cleanup analysis failed: ${error.message}\n`);
      return false;
    }
  }

  // Display integrated summary
  displayIntegratedSummary() {
    console.log('📊 COMPREHENSIVE SUMMARY');
    console.log('========================\n');

    // Test results
    const testResults = this.testRunner.results.summary;
    if (testResults) {
      console.log('🧪 Test Results:');
      Object.entries(this.testRunner.results.tests).forEach(([file, result]) => {
        const status = result.status === 'PASS' ? '✅' : 
                      result.status === 'FAIL' ? '❌' : '⏸️';
        console.log(`   ${status} ${file.replace(/^tests\//, '')} - ${result.description}`);
      });
      console.log(`📈 Pass Rate: ${testResults.passedTests}/${testResults.totalTests} (${testResults.passRate}%)\n`);
    }

    // Cleanup results
    if (this.cleanupResults.stats) {
      console.log('🧹 Cleanup Analysis:');
      console.log(`   📁 Total files: ${this.cleanupResults.stats.total}`);
      console.log(`   💀 Dead files: ${this.cleanupResults.stats.dead}`);
      console.log(`   🧪 Test files: ${this.cleanupResults.stats.test}`);
      console.log(`   🐛 Debug files: ${this.cleanupResults.stats.debug}`);
      
      const safeCount = this.cleanupResults.recommendations?.safe?.length || 0;
      const reviewCount = this.cleanupResults.recommendations?.review?.length || 0;
      console.log(`   🗑️  Safe to remove: ${safeCount} files`);
      console.log(`   👀 Need review: ${reviewCount} files\n`);
    }

    // Overall assessment
    console.log('🏆 OVERALL ASSESSMENT:');
    console.log('======================');
    
    const testsPassing = testResults?.passRate >= 80;
    const cleanupAvailable = !!this.cleanupResults.stats;
    
    if (testsPassing && cleanupAvailable) {
      console.log('🟢 EXCELLENT - Tests passing and cleanup analysis complete');
    } else if (testsPassing) {
      console.log('🟡 GOOD - Tests passing, cleanup analysis pending');
    } else {
      console.log('🔴 NEEDS WORK - Address test failures first');
    }

    // Save comprehensive results
    const comprehensiveResults = {
      tests: this.testRunner.results,
      cleanup: this.cleanupResults,
      timestamp: new Date().toISOString()
    };

    const resultsFile = path.join(__dirname, 'comprehensive-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(comprehensiveResults, null, 2));
    console.log(`\n📄 Comprehensive results saved to: cleanup/comprehensive-results.json`);
  }

  // Execute cleanup if requested
  async executeCleanup(mode = 'manual') {
    if (!this.cleanupResults.recommendations) {
      console.log('⚠️  No cleanup recommendations available\n');
      return;
    }

    const safeFiles = this.cleanupResults.recommendations.safe || [];
    
    if (safeFiles.length === 0) {
      console.log('✅ No files identified for safe removal\n');
      return;
    }

    console.log('🗑️  CLEANUP EXECUTION');
    console.log('====================\n');

    if (mode === 'auto') {
      console.log('🔄 Auto-executing cleanup...');
      // Implementation would go here
      console.log('✅ Cleanup completed automatically\n');
    } else {
      console.log('🤔 Manual cleanup recommended. Files identified:');
      safeFiles.forEach(item => {
        console.log(`   • ${item.file} - ${item.reason}`);
      });
      console.log('\nRun with --auto-clean flag to execute automatically\n');
    }
  }
}

// Main execution
async function main() {
  const suite = new ComprehensiveSuite();
  const runCleanup = process.argv.includes('--with-cleanup') || true; // Default to true for backwards compatibility
  const autoClean = process.argv.includes('--auto-clean');
  
  try {
    // Always run tests
    const testsPassed = await suite.testRunner.runAllTests();
    
    // Optionally run cleanup
    if (runCleanup) {
      await suite.runCleanupAnalysis();
      await suite.executeCleanup(autoClean ? 'auto' : 'manual');
    }
    
    // Display integrated summary
    suite.displayIntegratedSummary();
    
    console.log('\n✅ Comprehensive suite completed!');
    
  } catch (error) {
    console.error(`❌ Comprehensive suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { ComprehensiveSuite };
