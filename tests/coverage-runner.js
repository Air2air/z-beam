// Test Coverage Analysis for Node.js Tests
console.log('📊 TEST COVERAGE ANALYSIS');
console.log('========================\n');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CoverageAnalyzer {
  constructor() {
    this.results = {
      coverage: {},
      summary: {},
      timestamp: new Date().toISOString()
    };
  }

  // Analyze file coverage based on test execution
  async analyzeTestCoverage() {
    console.log('🔍 Analyzing test coverage...\n');

    const testFiles = [
      { file: 'tests/test-layout-structure.js', description: 'Layout Structure Tests' },
      { file: 'tests/test-sanitizer.js', description: 'YAML Sanitizer Tests' },
      { file: 'tests/test-yaml-errors.js', description: 'YAML Error Tests' }
    ];

    let totalTests = 0;
    let passedTests = 0;
    let coverage = {};

    for (const test of testFiles) {
      console.log(`📋 Running: ${test.description}`);
      
      try {
        const startTime = Date.now();
        const output = execSync(`node ${test.file}`, { 
          encoding: 'utf8',
          timeout: 30000,
          cwd: path.join(__dirname, '..')
        });
        const duration = Date.now() - startTime;

        // Analyze what files/components are tested
        const testedComponents = this.extractTestedComponents(output);
        
        coverage[test.file] = {
          status: 'PASS',
          description: test.description,
          duration,
          testedComponents,
          outputLines: output.split('\n').length
        };

        console.log(`  ✅ PASSED (${duration}ms)`);
        console.log(`  📁 Components tested: ${testedComponents.length}`);
        passedTests++;
        
      } catch (error) {
        coverage[test.file] = {
          status: 'FAIL',
          description: test.description,
          error: error.message.slice(0, 200),
          testedComponents: []
        };
        console.log(`  ❌ FAILED: ${error.message.slice(0, 100)}...`);
      }
      
      totalTests++;
      console.log('');
    }

    this.results.coverage = coverage;
    this.results.summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      testPassRate: ((passedTests / totalTests) * 100).toFixed(1),
      timestamp: new Date().toISOString()
    };

    return this.results;
  }

  // Extract components/files that are being tested
  extractTestedComponents(output) {
    const components = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Look for component mentions, file paths, etc.
      if (line.includes('✅') || line.includes('Testing') || line.includes('Checking')) {
        const match = line.match(/([A-Z][a-zA-Z]+(?:Component|\.tsx|\.ts|\.js))/);
        if (match && !components.includes(match[1])) {
          components.push(match[1]);
        }
      }
      
      // Look for file path patterns
      const fileMatch = line.match(/(app\/components\/[^\\s]+|tests\/[^\\s]+)/);
      if (fileMatch && !components.includes(fileMatch[1])) {
        components.push(fileMatch[1]);
      }
    }
    
    return components;
  }

  // Analyze component directory coverage
  async analyzeComponentCoverage() {
    console.log('🏗️  Analyzing component coverage...\n');
    
    const componentDir = path.join(__dirname, '..', 'app', 'components');
    const components = this.getComponentList(componentDir);
    
    const testResults = this.results.coverage;
    const testedComponents = new Set();
    
    // Collect all tested components
    Object.values(testResults).forEach(result => {
      if (result.testedComponents) {
        result.testedComponents.forEach(comp => testedComponents.add(comp));
      }
    });

    const coverageReport = {
      totalComponents: components.length,
      testedComponents: testedComponents.size,
      coveragePercentage: ((testedComponents.size / components.length) * 100).toFixed(1),
      untestedComponents: components.filter(comp => !Array.from(testedComponents).some(tested => tested.includes(comp)))
    };

    console.log(`📊 Component Coverage Summary:`);
    console.log(`   Total Components: ${coverageReport.totalComponents}`);
    console.log(`   Tested Components: ${coverageReport.testedComponents}`);
    console.log(`   Coverage: ${coverageReport.coveragePercentage}%`);
    
    if (coverageReport.untestedComponents.length > 0) {
      console.log(`\n📝 Untested Components:`);
      coverageReport.untestedComponents.forEach(comp => {
        console.log(`   • ${comp}`);
      });
    }

    this.results.componentCoverage = coverageReport;
    return coverageReport;
  }

  // Get list of components from directory
  getComponentList(dir) {
    const components = [];
    
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          components.push(item);
          // Recursively check subdirectories
          const subComponents = this.getComponentList(itemPath);
          subComponents.forEach(sub => components.push(`${item}/${sub}`));
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          components.push(item);
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not read directory: ${dir}`);
    }
    
    return components;
  }

  // Generate coverage report
  generateReport() {
    console.log('\n📄 COVERAGE REPORT');
    console.log('==================\n');

    const summary = this.results.summary;
    console.log(`🧪 Test Execution Summary:`);
    console.log(`   Tests Run: ${summary.totalTests}`);
    console.log(`   Passed: ${summary.passedTests}`);
    console.log(`   Failed: ${summary.failedTests}`);
    console.log(`   Pass Rate: ${summary.testPassRate}%\n`);

    if (this.results.componentCoverage) {
      const coverage = this.results.componentCoverage;
      console.log(`🏗️  Component Coverage:`);
      console.log(`   Components: ${coverage.testedComponents}/${coverage.totalComponents}`);
      console.log(`   Coverage: ${coverage.coveragePercentage}%\n`);
    }

    // Save detailed results
    const reportPath = path.join(__dirname, 'coverage-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📁 Detailed coverage report saved to: ${reportPath}`);
  }
}

// Run coverage analysis
async function main() {
  const analyzer = new CoverageAnalyzer();
  
  try {
    await analyzer.analyzeTestCoverage();
    await analyzer.analyzeComponentCoverage();
    analyzer.generateReport();
    
    console.log('\n✅ Coverage analysis complete!');
  } catch (error) {
    console.error('\n❌ Coverage analysis failed:', error.message);
    process.exit(1);
  }
}

main();
