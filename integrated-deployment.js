#!/usr/bin/env node

/**
 * INTEGRATED DEPLOYMENT SYSTEM
 * ============================
 * 
 * Complete deployment solution that:
 * - Runs intelligent predeploy checks
 * - Monitors Vercel deployment in real-time
 * - Captures and analyzes all terminal output
 * - Provides comprehensive reporting
 * - Takes automated actions based on results
 */

const IntelligentPredeploy = require('./intelligent-predeploy');
const VercelDeploymentMonitor = require('./vercel-deployment-monitor');
const fs = require('fs');

class IntegratedDeploymentSystem {
  constructor() {
    this.startTime = new Date();
    this.predeployResults = null;
    this.deploymentResults = null;
    this.overallStatus = 'starting';
  }

  /**
   * Run complete deployment pipeline
   */
  async deploy(vercelArgs = ['--prod', '--debug']) {
    console.log('🚀 INTEGRATED DEPLOYMENT SYSTEM');
    console.log('================================');
    console.log(`🕐 Started at: ${this.startTime.toISOString()}`);
    console.log(`📋 Vercel args: ${vercelArgs.join(' ')}`);
    console.log('');

    try {
      // Phase 1: Intelligent Predeploy
      console.log('📋 PHASE 1: PREDEPLOY VALIDATION');
      console.log('=================================');
      
      const predeploy = new IntelligentPredeploy();
      await predeploy.main();
      
      this.predeployResults = {
        success: true,
        errors: predeploy.errorPatterns,
        warnings: predeploy.buildWarnings,
        vercelMessages: predeploy.vercelMessages
      };

      console.log('✅ Predeploy validation completed successfully');
      console.log('');

      // Phase 2: Vercel Deployment with Monitoring
      console.log('📋 PHASE 2: VERCEL DEPLOYMENT');
      console.log('=============================');
      
      const monitor = new VercelDeploymentMonitor();
      const deploymentSuccess = await monitor.monitorDeployment(vercelArgs);
      
      this.deploymentResults = {
        success: deploymentSuccess,
        urls: monitor.vercelUrls,
        errors: monitor.buildErrors,
        phase: monitor.deploymentPhase,
        log: monitor.deploymentLog
      };

      // Phase 3: Final Analysis
      this.performFinalAnalysis();

      if (this.predeployResults.success && this.deploymentResults.success) {
        this.overallStatus = 'success';
        console.log('\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
        return true;
      } else {
        this.overallStatus = 'failed';
        console.log('\n❌ DEPLOYMENT FAILED!');
        return false;
      }

    } catch (error) {
      this.overallStatus = 'error';
      console.error('\n💥 DEPLOYMENT SYSTEM ERROR:', error.message);
      this.generateErrorReport(error);
      return false;
    }
  }

  /**
   * Perform final analysis and reporting
   */
  performFinalAnalysis() {
    const endTime = new Date();
    const totalDuration = Math.round((endTime - this.startTime) / 1000);

    console.log('\n📊 FINAL DEPLOYMENT ANALYSIS');
    console.log('============================');
    console.log(`⏰ Total Duration: ${totalDuration} seconds`);
    console.log(`📊 Overall Status: ${this.overallStatus}`);
    console.log(`🔍 Predeploy: ${this.predeployResults.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🚀 Deployment: ${this.deploymentResults.success ? 'SUCCESS' : 'FAILED'}`);

    // URL Summary
    if (this.deploymentResults.urls && this.deploymentResults.urls.length > 0) {
      console.log('\n🌐 DEPLOYMENT URLS:');
      this.deploymentResults.urls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
    }

    // Error Summary
    const totalErrors = (this.predeployResults.errors?.length || 0) + (this.deploymentResults.errors?.length || 0);
    if (totalErrors > 0) {
      console.log(`\n❌ TOTAL ERRORS: ${totalErrors}`);
      
      if (this.predeployResults.errors?.length > 0) {
        console.log('\n🔍 PREDEPLOY ERRORS:');
        this.predeployResults.errors.forEach((err, index) => {
          console.log(`   ${index + 1}. ${err.suggested_fix}`);
        });
      }

      if (this.deploymentResults.errors?.length > 0) {
        console.log('\n🚀 DEPLOYMENT ERRORS:');
        this.deploymentResults.errors.forEach((err, index) => {
          console.log(`   ${index + 1}. ${err.error.substring(0, 100)}...`);
        });
      }
    }

    // Warning Summary
    const totalWarnings = this.predeployResults.warnings?.length || 0;
    if (totalWarnings > 0) {
      console.log(`\n⚠️  TOTAL WARNINGS: ${totalWarnings}`);
    }

    // Save comprehensive report
    this.generateComprehensiveReport();

    // Provide next steps
    this.provideNextSteps();
  }

  /**
   * Generate comprehensive deployment report
   */
  generateComprehensiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      startTime: this.startTime.toISOString(),
      endTime: new Date().toISOString(),
      overallStatus: this.overallStatus,
      predeployResults: this.predeployResults,
      deploymentResults: this.deploymentResults,
      summary: {
        totalDuration: Math.round((new Date() - this.startTime) / 1000),
        totalErrors: (this.predeployResults?.errors?.length || 0) + (this.deploymentResults?.errors?.length || 0),
        totalWarnings: this.predeployResults?.warnings?.length || 0,
        urlsGenerated: this.deploymentResults?.urls?.length || 0
      }
    };

    const reportPath = `integrated-deployment-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Comprehensive report saved: ${reportPath}`);
  }

  /**
   * Generate error report
   */
  generateErrorReport(error) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      predeployResults: this.predeployResults,
      deploymentResults: this.deploymentResults
    };

    const reportPath = `deployment-error-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(errorReport, null, 2));
    console.log(`📋 Error report saved: ${reportPath}`);
  }

  /**
   * Provide next steps based on results
   */
  provideNextSteps() {
    console.log('\n💡 NEXT STEPS:');

    if (this.overallStatus === 'success') {
      console.log('✅ Deployment successful! Recommended actions:');
      console.log('   1. Test the deployed application thoroughly');
      console.log('   2. Monitor for any runtime errors or issues');
      console.log('   3. Check performance metrics and user experience');
      console.log('   4. Verify all features are working as expected');
      
      if (this.deploymentResults.urls?.length > 0) {
        console.log('   5. Share the deployment URL with stakeholders');
      }
    } else {
      console.log('❌ Deployment failed! Recommended actions:');
      console.log('   1. Review the error analysis above');
      console.log('   2. Fix any identified issues in the codebase');
      console.log('   3. Test fixes locally before redeploying');
      console.log('   4. Consider running individual validation steps:');
      console.log('      - npm run type-check');
      console.log('      - npm run lint:fix');
      console.log('      - npm run build');
      console.log('   5. Retry deployment once issues are resolved');
    }
  }
}

// Handle command line execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse arguments for Vercel
  const vercelArgs = args.length > 0 ? args : ['--prod', '--debug'];
  
  const deploymentSystem = new IntegratedDeploymentSystem();
  deploymentSystem.deploy(vercelArgs).then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error('💥 DEPLOYMENT SYSTEM FAILED:', error.message);
    process.exit(1);
  });
}

module.exports = IntegratedDeploymentSystem;
