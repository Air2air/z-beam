#!/usr/bin/env node

/**
 * Enhanced Test Coverage Assessment
 * Analyzes current test quality and provides actionable improvements
 */

const fs = require('fs');
const path = require('path');

class TestCoverageAnalyzer {
  constructor() {
    this.results = {
      coverage: {
        components: { total: 0, tested: 0, percentage: 0 },
        utilities: { total: 0, tested: 0, percentage: 0 },
        types: { total: 0, tested: 0, percentage: 0 },
        integration: { total: 0, tested: 0, percentage: 0 }
      },
      quality: {
        unitTests: [],
        integrationTests: [],
        e2eTests: [],
        typeTests: []
      },
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 COMPREHENSIVE TEST COVERAGE ASSESSMENT');
    console.log('=========================================');

    await this.analyzeComponentCoverage();
    await this.analyzeUtilityCoverage();
    await this.analyzeTypeValidation();
    await this.analyzeIntegrationTests();
    await this.generateRecommendations();
    
    this.printReport();
    return this.results;
  }

  async analyzeComponentCoverage() {
    const componentsDir = path.join(process.cwd(), 'app', 'components');
    const testDir = path.join(process.cwd(), 'tests');
    
    // Count component files
    const components = this.getFilesRecursively(componentsDir, '.tsx');
    this.results.coverage.components.total = components.length;
    
    // Count component tests
    const componentTests = this.getFilesRecursively(testDir, '.js')
      .filter(file => file.includes('component') || file.includes('test-'));
    
    this.results.coverage.components.tested = componentTests.length;
    this.results.coverage.components.percentage = 
      Math.round((componentTests.length / components.length) * 100);

    console.log(`📊 Component Coverage: ${this.results.coverage.components.tested}/${this.results.coverage.components.total} (${this.results.coverage.components.percentage}%)`);
  }

  async analyzeUtilityCoverage() {
    const utilsDir = path.join(process.cwd(), 'app', 'utils');
    const testDir = path.join(process.cwd(), 'tests');
    
    // Count utility files
    const utilities = this.getFilesRecursively(utilsDir, '.ts');
    this.results.coverage.utilities.total = utilities.length;
    
    // Count utility tests
    const utilityTests = this.getFilesRecursively(testDir, '.js')
      .filter(file => file.includes('util') || file.includes('helper'));
    
    this.results.coverage.utilities.tested = utilityTests.length;
    this.results.coverage.utilities.percentage = 
      Math.round((utilityTests.length / utilities.length) * 100);

    console.log(`🔧 Utility Coverage: ${this.results.coverage.utilities.tested}/${this.results.coverage.utilities.total} (${this.results.coverage.utilities.percentage}%)`);
  }

  async analyzeTypeValidation() {
    const typesDir = path.join(process.cwd(), 'types');
    const hasTypeTests = fs.existsSync(path.join(process.cwd(), 'tests', 'test-typescript-build.js'));
    
    this.results.coverage.types.total = this.getFilesRecursively(typesDir, '.ts').length;
    this.results.coverage.types.tested = hasTypeTests ? 1 : 0;
    this.results.coverage.types.percentage = hasTypeTests ? 100 : 0;

    console.log(`📝 Type Validation: ${hasTypeTests ? 'ACTIVE' : 'MISSING'}`);
  }

  async analyzeIntegrationTests() {
    const testDir = path.join(process.cwd(), 'tests');
    const integrationTests = this.getFilesRecursively(testDir, '.js')
      .filter(file => file.includes('integration') || file.includes('e2e') || file.includes('auto-fix'));
    
    this.results.coverage.integration.tested = integrationTests.length;
    this.results.coverage.integration.total = 10; // Expected integration test areas
    this.results.coverage.integration.percentage = 
      Math.round((integrationTests.length / 10) * 100);

    console.log(`🔗 Integration Tests: ${integrationTests.length}/10 areas covered`);
  }

  generateRecommendations() {
    const recs = [];

    // Component testing recommendations
    if (this.results.coverage.components.percentage < 25) {
      recs.push({
        priority: 'HIGH',
        area: 'Component Testing',
        issue: `Only ${this.results.coverage.components.percentage}% component coverage`,
        action: 'Create unit tests for core components (Badge, Card, SearchResults)',
        effort: 'Medium'
      });
    }

    // Utility testing recommendations
    if (this.results.coverage.utilities.percentage < 50) {
      recs.push({
        priority: 'HIGH',
        area: 'Utility Testing',
        issue: 'Low utility function coverage',
        action: 'Add tests for articleEnrichment, contentAPI, searchUtils',
        effort: 'Low'
      });
    }

    // Type validation recommendations
    if (this.results.coverage.types.percentage < 100) {
      recs.push({
        priority: 'MEDIUM',
        area: 'Type Validation',
        issue: 'Missing comprehensive type testing',
        action: 'Add type compatibility and validation tests',
        effort: 'Low'
      });
    }

    // Performance testing recommendations
    recs.push({
      priority: 'MEDIUM',
      area: 'Performance Testing',
      issue: 'No performance benchmarks',
      action: 'Add performance tests for search, build, and load times',
      effort: 'Medium'
    });

    // E2E testing recommendations
    recs.push({
      priority: 'LOW',
      area: 'End-to-End Testing',
      issue: 'No browser automation tests',
      action: 'Consider adding Cypress for critical user flows',
      effort: 'High'
    });

    this.results.recommendations = recs;
  }

  getFilesRecursively(dir, extension) {
    if (!fs.existsSync(dir)) return [];
    
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursively(fullPath, extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  printReport() {
    console.log('\n📈 COVERAGE SUMMARY');
    console.log('==================');
    console.log(`Components: ${this.results.coverage.components.percentage}%`);
    console.log(`Utilities: ${this.results.coverage.utilities.percentage}%`);
    console.log(`Types: ${this.results.coverage.types.percentage}%`);
    console.log(`Integration: ${this.results.coverage.integration.percentage}%`);

    console.log('\n🎯 RECOMMENDATIONS');
    console.log('==================');
    
    this.results.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.area}`);
      console.log(`   Issue: ${rec.issue}`);
      console.log(`   Action: ${rec.action}`);
      console.log(`   Effort: ${rec.effort}`);
      console.log('');
    });

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'tests', 'enhanced-coverage-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new TestCoverageAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = TestCoverageAnalyzer;
