#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT MONITOR
 * =========================
 * 
 * This script monitors Vercel deployment in real-time,
 * captures all terminal output, and provides intelligent responses
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelDeploymentMonitor {
  constructor() {
    this.deploymentLog = [];
    this.vercelUrls = [];
    this.buildErrors = [];
    this.deploymentPhase = 'starting';
    this.startTime = new Date();
  }

  /**
   * Parse and categorize Vercel output
   */
  parseVercelOutput(data) {
    const output = data.toString();
    const timestamp = new Date().toISOString();
    
    this.deploymentLog.push({
      timestamp,
      content: output,
      phase: this.deploymentPhase
    });

    // Update deployment phase based on output
    this.updateDeploymentPhase(output);

    // Extract important information
    this.extractInformation(output);

    // Display formatted output
    this.displayFormattedOutput(output);
  }

  /**
   * Update deployment phase tracking
   */
  updateDeploymentPhase(output) {
    const lowerOutput = output.toLowerCase();

    if (lowerOutput.includes('uploading') || lowerOutput.includes('building')) {
      this.deploymentPhase = 'building';
    } else if (lowerOutput.includes('deploying')) {
      this.deploymentPhase = 'deploying';
    } else if (lowerOutput.includes('ready') || lowerOutput.includes('preview:')) {
      this.deploymentPhase = 'completed';
    } else if (lowerOutput.includes('error') || lowerOutput.includes('failed')) {
      this.deploymentPhase = 'failed';
    }
  }

  /**
   * Extract URLs, errors, and other important info
   */
  extractInformation(output) {
    // Extract URLs
    const urlRegex = /https:\/\/[a-zA-Z0-9\-\.]+\.vercel\.app[^\s]*/g;
    const urls = output.match(urlRegex);
    if (urls) {
      urls.forEach(url => {
        if (!this.vercelUrls.includes(url)) {
          this.vercelUrls.push(url);
          console.log(`🌐 NEW URL DETECTED: ${url}`);
        }
      });
    }

    // Extract build errors
    if (output.toLowerCase().includes('error')) {
      this.buildErrors.push({
        timestamp: new Date().toISOString(),
        error: output.trim()
      });
    }
  }

  /**
   * Display formatted output with analysis
   */
  displayFormattedOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('building')) {
        console.log(`🔨 ${line}`);
      } else if (lowerLine.includes('deploying')) {
        console.log(`🚀 ${line}`);
      } else if (lowerLine.includes('ready') || lowerLine.includes('✓')) {
        console.log(`✅ ${line}`);
      } else if (lowerLine.includes('error') || lowerLine.includes('❌')) {
        console.log(`❌ ${line}`);
      } else if (lowerLine.includes('warning') || lowerLine.includes('⚠')) {
        console.log(`⚠️  ${line}`);
      } else if (lowerLine.includes('preview:') || lowerLine.includes('production:')) {
        console.log(`🌐 ${line}`);
      } else if (line.trim()) {
        console.log(`📋 ${line}`);
      }
    });
  }

  /**
   * Monitor Vercel deployment
   */
  async monitorDeployment(args = []) {
    console.log('🔍 VERCEL DEPLOYMENT MONITOR');
    console.log('============================');
    console.log(`🕐 Started at: ${this.startTime.toISOString()}`);
    console.log(`📋 Command: vercel ${args.join(' ')}`);
    console.log('');

    return new Promise((resolve, reject) => {
      const vercelProcess = spawn('vercel', args, { stdio: 'pipe' });

      vercelProcess.stdout.on('data', (data) => {
        this.parseVercelOutput(data);
      });

      vercelProcess.stderr.on('data', (data) => {
        this.parseVercelOutput(data);
      });

      vercelProcess.on('close', (code) => {
        this.handleDeploymentComplete(code);
        
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      vercelProcess.on('error', (error) => {
        console.error(`💥 DEPLOYMENT ERROR: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Handle deployment completion
   */
  handleDeploymentComplete(exitCode) {
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);

    console.log('\n📊 DEPLOYMENT SUMMARY');
    console.log('=====================');
    console.log(`⏰ Duration: ${duration} seconds`);
    console.log(`📊 Exit Code: ${exitCode}`);
    console.log(`🔄 Final Phase: ${this.deploymentPhase}`);
    console.log(`🌐 URLs Discovered: ${this.vercelUrls.length}`);
    console.log(`❌ Errors: ${this.buildErrors.length}`);

    if (this.vercelUrls.length > 0) {
      console.log('\n🌐 DEPLOYMENT URLS:');
      this.vercelUrls.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
    }

    if (this.buildErrors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      this.buildErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.error.substring(0, 100)}...`);
      });
    }

    // Save deployment report
    this.saveDeploymentReport();

    // Provide recommendations
    this.provideRecommendations(exitCode);
  }

  /**
   * Save detailed deployment report
   */
  saveDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      startTime: this.startTime.toISOString(),
      endTime: new Date().toISOString(),
      deploymentPhase: this.deploymentPhase,
      vercelUrls: this.vercelUrls,
      buildErrors: this.buildErrors,
      fullLog: this.deploymentLog
    };

    const reportPath = `vercel-deployment-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Detailed report saved: ${reportPath}`);
  }

  /**
   * Provide post-deployment recommendations
   */
  provideRecommendations(exitCode) {
    console.log('\n💡 RECOMMENDATIONS:');

    if (exitCode === 0) {
      console.log('✅ Deployment successful!');
      
      if (this.vercelUrls.length > 0) {
        console.log('🔍 Next steps:');
        console.log('   1. Test the deployed application');
        console.log('   2. Verify all features work correctly');
        console.log('   3. Check performance metrics');
        console.log('   4. Monitor for any runtime errors');
      }
    } else {
      console.log('❌ Deployment failed!');
      console.log('🔧 Suggested actions:');
      console.log('   1. Review error messages above');
      console.log('   2. Run: npm run build locally to reproduce issues');
      console.log('   3. Check: npm run type-check for TypeScript errors');
      console.log('   4. Verify: package.json dependencies are correct');
      console.log('   5. Try: npm run predeploy to run full validation');
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

// Default to production deployment with debug
if (args.length === 0) {
  args.push('--prod', '--debug');
}

// Create monitor and start deployment
const monitor = new VercelDeploymentMonitor();
monitor.monitorDeployment(args).then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('💥 MONITOR FAILED:', error.message);
  process.exit(1);
});

module.exports = VercelDeploymentMonitor;
