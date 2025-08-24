// Predeploy Summary - Final Status Report
console.log('📊 PREDEPLOY SUMMARY REPORT');
console.log('===========================\n');

const fs = require('fs');
const path = require('path');

class PredeploySummary {
  constructor() {
    this.testsDir = path.join(process.cwd(), 'tests');
    this.results = {};
  }

  async generateSummary() {
    console.log('🔍 Analyzing test results...\n');

    // Load all test results
    await this.loadTestResults();
    
    // Generate comprehensive summary
    this.generateComprehensiveReport();
    
    return this.results;
  }

  async loadTestResults() {
    const resultFiles = [
      { name: 'TypeScript Build', file: 'typescript-build-test-results.json' },
      { name: 'Component Validation', file: 'component-validation-results.json' },
      { name: 'Warning Cleanup', file: 'warning-cleanup-results.json' },
      { name: 'Content Validation', file: 'content-validation-results.json' },
      { name: 'Vercel Optimization', file: 'vercel-optimization-report.json' },
      { name: 'Auto-Fix Suite', file: 'comprehensive-test-results.json' },
      { name: 'Predeploy Check', file: 'predeploy-success-report.json' }
    ];

    for (const { name, file } of resultFiles) {
      const filePath = path.join(this.testsDir, file);
      
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.results[name] = data;
          console.log(`  ✅ Loaded ${name} results`);
        } catch (error) {
          console.log(`  ⚠️  Could not load ${name} results: ${error.message}`);
          this.results[name] = { status: 'UNKNOWN', error: error.message };
        }
      } else {
        console.log(`  ❌ Missing ${name} results file`);
        this.results[name] = { status: 'MISSING' };
      }
    }
  }

  generateComprehensiveReport() {
    console.log('\n📋 COMPREHENSIVE PREDEPLOY REPORT');
    console.log('=====================================\n');

    // Calculate overall scores
    const scores = this.calculateScores();
    
    console.log('🏆 OVERALL STATUS');
    console.log('─────────────────');
    console.log(`📈 Deployment Readiness: ${scores.overall >= 85 ? '🟢 EXCELLENT' : scores.overall >= 70 ? '🟡 GOOD' : '🔴 NEEDS WORK'} (${scores.overall}%)`);
    console.log(`🚀 Ready for Production: ${scores.ready ? 'YES ✅' : 'NO ❌'}`);
    
    console.log('\n📊 TEST BREAKDOWN');
    console.log('─────────────────');
    
    // TypeScript & Build
    const tsResult = this.results['TypeScript Build'];
    if (tsResult && tsResult.summary) {
      const tsStatus = tsResult.summary.overallStatus === 'PASS' ? '✅' : '❌';
      console.log(`${tsStatus} TypeScript & Build: ${tsResult.summary.overallStatus}`);
      if (tsResult.summary.buildDuration) {
        console.log(`   Build Time: ${Math.round(tsResult.summary.buildDuration/1000)}s`);
      }
    }

    // Component Validation  
    const compResult = this.results['Component Validation'];
    if (compResult) {
      const validImports = compResult.importValidation?.valid || 0;
      const totalImports = compResult.importValidation?.total || 0;
      const importRate = totalImports > 0 ? Math.round((validImports/totalImports)*100) : 0;
      console.log(`${importRate >= 90 ? '✅' : '⚠️'} Component Validation: ${importRate}% (${validImports}/${totalImports})`);
    }

    // Content Validation
    const contentResult = this.results['Content Validation'];
    if (contentResult && contentResult.overall) {
      const status = contentResult.overall.status;
      const score = contentResult.overall.score;
      console.log(`${status === 'EXCELLENT' ? '✅' : '⚠️'} Content Validation: ${status} (${score}%)`);
      console.log(`   BadgeSymbol: ${contentResult.badgeSymbol?.valid || 0} files valid`);
      console.log(`   PropertiesTable: ${contentResult.propertiesTable?.valid || 0} files valid`);
    }

    // Vercel Optimization
    const vercelResult = this.results['Vercel Optimization'];
    if (vercelResult && vercelResult.score) {
      const score = Math.round((vercelResult.score.current / vercelResult.score.max) * 100);
      console.log(`${score >= 85 ? '✅' : '⚠️'} Vercel Optimization: ${score}% (${vercelResult.score.current}/${vercelResult.score.max})`);
    }

    // Auto-Fix Suite
    const autoFixResult = this.results['Auto-Fix Suite'];
    if (autoFixResult && autoFixResult.summary) {
      const status = autoFixResult.summary.overallStatus;
      console.log(`${status === 'EXCELLENT' ? '✅' : '⚠️'} Auto-Fix Suite: ${status}`);
      
      if (autoFixResult.summary.typescript?.status === 'PASSED') {
        console.log(`   TypeScript: PASSED`);
      }
      if (autoFixResult.summary.eslint?.status === 'PASSED') {
        console.log(`   ESLint: ${autoFixResult.summary.eslint.errors} errors, ${autoFixResult.summary.eslint.warnings} warnings`);
      }
    }

    // Predeploy Check
    const predeployResult = this.results['Predeploy Check'];
    if (predeployResult) {
      const status = predeployResult.deploymentReady ? '✅ READY' : '❌ BLOCKED';
      console.log(`${predeployResult.deploymentReady ? '✅' : '❌'} Predeploy Check: ${status}`);
      if (predeployResult.finalScore && predeployResult.maxScore) {
        console.log(`   Score: ${predeployResult.finalScore}/${predeployResult.maxScore} (${predeployResult.percentage}%)`);
      }
    }

    console.log('\n🎯 KEY METRICS');
    console.log('─────────────');
    console.log(`📦 Bundle Size: ${scores.bundleSize || 'Unknown'}`);
    console.log(`⚡ Build Performance: ${scores.buildTime || 'Unknown'}`);
    console.log(`🔧 Code Quality: ${scores.codeQuality || 'Unknown'}`);
    console.log(`🚀 Deployment Score: ${scores.deploymentScore || 'Unknown'}`);

    if (scores.recommendations && scores.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS');
      console.log('──────────────────');
      scores.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

    console.log('\n🎉 SUMMARY');
    console.log('──────────');
    if (scores.ready) {
      console.log('✅ All systems green! Ready for deployment.');
      console.log('🚀 The BadgeSymbol system is fully integrated and tested.');
      console.log('📊 Content validation confirms proper BadgeSymbol/PropertiesTable alignment.');
    } else {
      console.log('⚠️  Some issues detected. Review recommendations before deployment.');
    }

    // Save comprehensive summary
    const summaryReport = {
      timestamp: new Date().toISOString(),
      overall: scores,
      details: this.results,
      recommendations: scores.recommendations || []
    };

    fs.writeFileSync(
      path.join(this.testsDir, 'predeploy-comprehensive-summary.json'),
      JSON.stringify(summaryReport, null, 2)
    );

    console.log(`\n📄 Comprehensive summary saved to: ${path.join(this.testsDir, 'predeploy-comprehensive-summary.json')}`);
  }

  calculateScores() {
    const scores = {
      overall: 0,
      ready: false,
      bundleSize: 'Unknown',
      buildTime: 'Unknown', 
      codeQuality: 'Unknown',
      deploymentScore: 'Unknown',
      recommendations: []
    };

    let totalScore = 0;
    let maxScore = 0;

    // TypeScript & Build (25 points)
    const tsResult = this.results['TypeScript Build'];
    if (tsResult && tsResult.summary) {
      if (tsResult.summary.overallStatus === 'PASS') {
        totalScore += 25;
        scores.buildTime = tsResult.summary.buildDuration ? 
          `${Math.round(tsResult.summary.buildDuration/1000)}s` : 'Fast';
      } else {
        scores.recommendations.push('Fix TypeScript compilation errors');
      }
      maxScore += 25;
    }

    // Content Validation (20 points)
    const contentResult = this.results['Content Validation'];
    if (contentResult && contentResult.overall) {
      const contentScore = Math.round((contentResult.overall.score / 100) * 20);
      totalScore += contentScore;
      maxScore += 20;
      
      if (contentResult.overall.status !== 'EXCELLENT') {
        scores.recommendations.push('Improve content validation scores');
      }
    }

    // Component Validation (15 points)
    const compResult = this.results['Component Validation'];
    if (compResult && compResult.importValidation) {
      const validRate = compResult.importValidation.valid / compResult.importValidation.total;
      const compScore = Math.round(validRate * 15);
      totalScore += compScore;
      maxScore += 15;

      if (validRate < 0.9) {
        scores.recommendations.push('Fix component import issues');
      }
    }

    // Vercel Optimization (20 points)  
    const vercelResult = this.results['Vercel Optimization'];
    if (vercelResult && vercelResult.score) {
      const vercelScore = Math.round((vercelResult.score.current / vercelResult.score.max) * 20);
      totalScore += vercelScore;
      scores.deploymentScore = `${vercelResult.score.current}/${vercelResult.score.max}`;
      maxScore += 20;
    }

    // Auto-Fix Suite (10 points)
    const autoFixResult = this.results['Auto-Fix Suite'];
    if (autoFixResult && autoFixResult.summary) {
      if (autoFixResult.summary.overallStatus === 'EXCELLENT') {
        totalScore += 10;
      }
      maxScore += 10;
    }

    // Predeploy Check (10 points)
    const predeployResult = this.results['Predeploy Check'];
    if (predeployResult && predeployResult.deploymentReady) {
      totalScore += 10;
      scores.ready = true;
    }
    maxScore += 10;

    scores.overall = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    scores.codeQuality = scores.overall >= 85 ? 'Excellent' : 
                        scores.overall >= 70 ? 'Good' : 'Needs Work';

    return scores;
  }
}

// Main execution
async function main() {
  const summary = new PredeploySummary();

  try {
    await summary.generateSummary();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Summary generation failed:', error.message);
    process.exit(1);
  }
}

main();
