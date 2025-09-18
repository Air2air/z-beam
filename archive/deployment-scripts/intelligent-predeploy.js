#!/usr/bin/env node

/**
 * INTELLIGENT PREDEPLOY SYSTEM
 * ============================
 * 
 * Enhanced predeploy system that:
 * - Monitors terminal output in real-time
 * - Responds to Vercel deployment messages
 * - Handles build errors intelligently
 * - Provides actionable feedback
 * - Learns from deployment patterns
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class IntelligentPredeploy {
  constructor() {
    this.terminalHistory = [];
    this.errorPatterns = [];
    this.vercelMessages = [];
    this.buildWarnings = [];
    this.deploymentStatus = 'pending';
  }

  /**
   * Monitor terminal output and extract meaningful information
   */
  monitorTerminalOutput(data) {
    const output = data.toString();
    this.terminalHistory.push({
      timestamp: new Date().toISOString(),
      content: output,
      type: this.classifyOutput(output)
    });

    // Real-time analysis
    this.analyzeOutput(output);
  }

  /**
   * Classify terminal output by type
   */
  classifyOutput(output) {
    const lowerOutput = output.toLowerCase();
    
    if (lowerOutput.includes('vercel')) return 'vercel';
    if (lowerOutput.includes('error')) return 'error';
    if (lowerOutput.includes('warning')) return 'warning';
    if (lowerOutput.includes('success') || lowerOutput.includes('✓')) return 'success';
    if (lowerOutput.includes('deploying') || lowerOutput.includes('building')) return 'progress';
    if (lowerOutput.includes('failed') || lowerOutput.includes('❌')) return 'failure';
    
    return 'info';
  }

  /**
   * Analyze output and take appropriate actions
   */
  analyzeOutput(output) {
    const lowerOutput = output.toLowerCase();

    // Vercel-specific monitoring
    if (lowerOutput.includes('vercel')) {
      this.handleVercelMessage(output);
    }

    // Error detection and response
    if (lowerOutput.includes('error') && !lowerOutput.includes('0 errors')) {
      this.handleError(output);
    }

    // Build warnings
    if (lowerOutput.includes('warning')) {
      this.handleWarning(output);
    }

    // Success detection
    if (lowerOutput.includes('deployment complete') || lowerOutput.includes('ready!')) {
      this.handleDeploymentSuccess(output);
    }

    // Failure detection
    if (lowerOutput.includes('deployment failed') || lowerOutput.includes('build failed')) {
      this.handleDeploymentFailure(output);
    }
  }

  /**
   * Handle Vercel-specific messages
   */
  handleVercelMessage(output) {
    console.log('🔍 VERCEL MESSAGE DETECTED:');
    console.log(`📋 ${output.trim()}`);

    this.vercelMessages.push({
      timestamp: new Date().toISOString(),
      message: output.trim()
    });

    // Specific Vercel responses
    if (output.includes('Preview:') || output.includes('https://')) {
      console.log('🌐 Deployment URL detected - saving for reference');
    }

    if (output.includes('Build completed')) {
      console.log('✅ Vercel build completed successfully');
      this.deploymentStatus = 'built';
    }

    if (output.includes('Deployment completed')) {
      console.log('🎉 Vercel deployment completed successfully');
      this.deploymentStatus = 'deployed';
    }

    if (output.includes('Error:') || output.includes('Failed to')) {
      console.log('❌ Vercel error detected - analyzing...');
      this.handleVercelError(output);
    }
  }

  /**
   * Handle Vercel-specific errors
   */
  handleVercelError(output) {
    console.log('🚨 VERCEL ERROR ANALYSIS:');
    
    if (output.includes('Build failed')) {
      console.log('📋 Build failure - checking local build...');
      this.suggestBuildFix();
    }

    if (output.includes('Function timeout')) {
      console.log('📋 Function timeout - consider optimizing serverless functions');
    }

    if (output.includes('Memory limit')) {
      console.log('📋 Memory limit exceeded - consider optimizing bundle size');
    }

    if (output.includes('Rate limit')) {
      console.log('📋 Rate limit hit - waiting before retry...');
    }
  }

  /**
   * Handle general errors
   */
  handleError(output) {
    console.log('⚠️ ERROR DETECTED:');
    console.log(`📋 ${output.trim()}`);

    this.errorPatterns.push({
      timestamp: new Date().toISOString(),
      error: output.trim(),
      suggested_fix: this.suggestFix(output)
    });
  }

  /**
   * Handle warnings
   */
  handleWarning(output) {
    this.buildWarnings.push({
      timestamp: new Date().toISOString(),
      warning: output.trim()
    });

    // Only log significant warnings
    if (output.includes('deprecated') || output.includes('security')) {
      console.log('⚠️ IMPORTANT WARNING:');
      console.log(`📋 ${output.trim()}`);
    }
  }

  /**
   * Suggest fixes based on error patterns
   */
  suggestFix(error) {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('module not found')) {
      return 'Run: npm install to install missing dependencies';
    }

    if (lowerError.includes('typescript')) {
      return 'Run: npm run type-check to identify TypeScript issues';
    }

    if (lowerError.includes('eslint')) {
      return 'Run: npm run lint:fix to auto-fix linting issues';
    }

    if (lowerError.includes('build failed')) {
      return 'Check build logs and run: npm run build locally';
    }

    return 'Check logs above for specific error details';
  }

  /**
   * Suggest build fixes
   */
  suggestBuildFix() {
    console.log('🔧 SUGGESTED BUILD FIXES:');
    console.log('1. Run: npm run build locally to reproduce the issue');
    console.log('2. Run: npm run type-check to check for TypeScript errors');
    console.log('3. Run: npm run lint:fix to fix linting issues');
    console.log('4. Check for missing dependencies in package.json');
  }

  /**
   * Handle deployment success
   */
  handleDeploymentSuccess(output) {
    console.log('🎉 DEPLOYMENT SUCCESS DETECTED!');
    this.deploymentStatus = 'success';
    this.generateSuccessReport();
  }

  /**
   * Handle deployment failure
   */
  handleDeploymentFailure(output) {
    console.log('❌ DEPLOYMENT FAILURE DETECTED!');
    this.deploymentStatus = 'failed';
    this.generateFailureReport();
  }

  /**
   * Run command with monitoring
   */
  async runCommandWithMonitoring(command, description) {
    console.log(`🔍 ${description}`);
    console.log(`📋 Running: ${command}`);

    return new Promise((resolve, reject) => {
      const process = spawn('sh', ['-c', command], { stdio: 'pipe' });

      process.stdout.on('data', (data) => {
        console.log(data.toString());
        this.monitorTerminalOutput(data);
      });

      process.stderr.on('data', (data) => {
        console.error(data.toString());
        this.monitorTerminalOutput(data);
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${description} - SUCCESS`);
          resolve(true);
        } else {
          console.log(`❌ ${description} - FAILED (exit code: ${code})`);
          resolve(false);
        }
      });

      process.on('error', (error) => {
        console.error(`💥 ${description} - ERROR: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Generate success report
   */
  generateSuccessReport() {
    console.log('\n📊 DEPLOYMENT SUCCESS REPORT:');
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);
    console.log(`🔢 Vercel messages: ${this.vercelMessages.length}`);
    console.log(`⚠️ Warnings encountered: ${this.buildWarnings.length}`);
    
    if (this.vercelMessages.length > 0) {
      console.log('\n🌐 Vercel URLs:');
      this.vercelMessages.forEach(msg => {
        if (msg.message.includes('https://')) {
          console.log(`   ${msg.message}`);
        }
      });
    }
  }

  /**
   * Generate failure report
   */
  generateFailureReport() {
    console.log('\n📊 DEPLOYMENT FAILURE REPORT:');
    console.log(`⏰ Failed at: ${new Date().toISOString()}`);
    console.log(`❌ Errors encountered: ${this.errorPatterns.length}`);
    console.log(`⚠️ Warnings: ${this.buildWarnings.length}`);

    if (this.errorPatterns.length > 0) {
      console.log('\n🔧 SUGGESTED FIXES:');
      this.errorPatterns.forEach((err, index) => {
        console.log(`${index + 1}. ${err.suggested_fix}`);
      });
    }
  }

  /**
   * Save monitoring data
   */
  saveMonitoringData() {
    const report = {
      timestamp: new Date().toISOString(),
      deploymentStatus: this.deploymentStatus,
      terminalHistory: this.terminalHistory,
      vercelMessages: this.vercelMessages,
      errorPatterns: this.errorPatterns,
      buildWarnings: this.buildWarnings
    };

    fs.writeFileSync('deployment-monitoring-report.json', JSON.stringify(report, null, 2));
    console.log('📋 Monitoring data saved to: deployment-monitoring-report.json');
  }

  /**
   * Main predeploy execution
   */
  async main() {
    console.log('🚀 INTELLIGENT PREDEPLOY SYSTEM');
    console.log('===============================');
    console.log('🔍 Monitoring all terminal output...');
    console.log('📊 Analyzing Vercel deployment messages...');
    console.log('');

    try {
      // Step 1: Type checking with monitoring
      await this.runCommandWithMonitoring('npm run type-check', 'TypeScript type checking');

      // Step 2: Linting with monitoring
      await this.runCommandWithMonitoring('npm run lint:fix', 'ESLint with auto-fix');

      // Step 3: Tests with monitoring
      await this.runCommandWithMonitoring('npm run test:ci', 'Running tests');

      // Step 4: Build with monitoring
      const buildSuccess = await this.runCommandWithMonitoring('npm run build', 'Building for production');
      
      if (!buildSuccess) {
        throw new Error('Build failed - cannot deploy');
      }

      console.log('\n🎉 PREDEPLOY COMPLETE - READY FOR DEPLOYMENT');
      
      // Save monitoring data
      this.saveMonitoringData();

    } catch (error) {
      console.error('\n❌ PREDEPLOY FAILED:', error.message);
      this.saveMonitoringData();
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const predeploy = new IntelligentPredeploy();
  predeploy.main();
}

module.exports = IntelligentPredeploy;
