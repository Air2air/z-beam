#!/usr/bin/env node
/**
 * Monitored Deployment Script
 * 
 * Wraps the deployment process with comprehensive terminal monitoring
 */

const { TerminalMonitor } = require('../validation/lib/terminal-monitor');
const path = require('path');

async function runMonitoredDeploy() {
  const monitor = new TerminalMonitor({
    logDir: '.terminal-logs/deploy',
    alertPatterns: [
      /error/i,
      /failed/i,
      /fatal/i,
      /exception/i,
      /cannot find/i,
      /deployment failed/i,
      /build failed/i
    ],
    warningPatterns: [
      /warning/i,
      /deprecated/i,
      /skipped/i,
      /slow/i
    ]
  });

  console.log('🚀 Starting Monitored Deployment Pipeline\n');
  console.log('═'.repeat(60));
  
  // Clean old logs first
  monitor.cleanOldLogs();

  const stages = [
    {
      name: 'Pre-flight Quality Checks',
      command: 'npm run check',
      critical: true
    },
    {
      name: 'Content Validation',
      command: 'npm run validate:content',
      critical: true
    },
    {
      name: 'Component Tests',
      command: 'npm run test:components',
      critical: false // non-blocking
    },
    {
      name: 'Vercel Production Deploy',
      command: 'vercel --prod',
      critical: true
    }
  ];

  const results = [];
  let totalDuration = 0;

  for (const stage of stages) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📋 Stage: ${stage.name}`);
    console.log(`${'═'.repeat(60)}\n`);

    try {
      const result = await monitor.monitorCommand(stage.command, stage.name.replace(/\s+/g, '-'));
      results.push({
        stage: stage.name,
        success: true,
        duration: result.duration,
        errors: result.errors.length,
        warnings: result.warnings.length
      });
      totalDuration += parseFloat(result.duration);
      
      console.log(`\n✅ ${stage.name} completed successfully\n`);
    } catch (error) {
      results.push({
        stage: stage.name,
        success: false,
        duration: error.duration || 0,
        errors: error.errors?.length || 1,
        warnings: error.warnings?.length || 0,
        error: error.error || 'Unknown error'
      });
      
      totalDuration += parseFloat(error.duration || 0);
      
      if (stage.critical) {
        console.error(`\n❌ ${stage.name} failed - Aborting deployment\n`);
        printFinalSummary(results, totalDuration);
        process.exit(1);
      } else {
        console.warn(`\n⚠️  ${stage.name} failed - Continuing anyway (non-critical)\n`);
      }
    }
  }

  // Post-deployment validation
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📋 Post-Deployment Validation`);
  console.log(`${'═'.repeat(60)}\n`);

  try {
    const result = await monitor.monitorCommand(
      'npm run validate:production',
      'Post-Deployment-Validation'
    );
    results.push({
      stage: 'Post-Deployment Validation',
      success: true,
      duration: result.duration,
      errors: result.errors.length,
      warnings: result.warnings.length
    });
    totalDuration += parseFloat(result.duration);
  } catch (error) {
    results.push({
      stage: 'Post-Deployment Validation',
      success: false,
      duration: error.duration || 0,
      errors: error.errors?.length || 1,
      warnings: error.warnings?.length || 0
    });
    totalDuration += parseFloat(error.duration || 0);
    // Post-deployment validation failures are non-critical
    console.warn(`\n⚠️  Post-deployment validation had issues (non-critical)\n`);
  }

  printFinalSummary(results, totalDuration);
  
  const hasFailures = results.some(r => !r.success && r.stage !== 'Post-Deployment Validation');
  process.exit(hasFailures ? 1 : 0);
}

function printFinalSummary(results, totalDuration) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 DEPLOYMENT SUMMARY`);
  console.log(`${'═'.repeat(60)}\n`);
  
  console.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)}s\n`);
  
  console.log('📋 Stage Results:\n');
  results.forEach((result, i) => {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'SUCCESS' : 'FAILED';
    console.log(`${i + 1}. ${icon} ${result.stage}`);
    console.log(`   Status: ${status}`);
    console.log(`   Duration: ${result.duration}s`);
    if (result.errors > 0) {
      console.log(`   Errors: ${result.errors}`);
    }
    if (result.warnings > 0) {
      console.log(`   Warnings: ${result.warnings}`);
    }
    console.log();
  });
  
  const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
  const totalWarnings = results.reduce((sum, r) => sum + (r.warnings || 0), 0);
  const successCount = results.filter(r => r.success).length;
  
  console.log(`📈 Overall Statistics:`);
  console.log(`   Stages: ${successCount}/${results.length} successful`);
  console.log(`   Total Errors: ${totalErrors}`);
  console.log(`   Total Warnings: ${totalWarnings}`);
  console.log(`   Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`);
  
  console.log(`\n📁 Logs saved to: .terminal-logs/deploy/`);
  console.log(`   View: npm run logs:view`);
  console.log(`   Clean: npm run logs:clean\n`);
  
  console.log(`${'═'.repeat(60)}\n`);
  
  if (successCount === results.length) {
    console.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉\n');
  } else if (totalErrors === 0 && totalWarnings > 0) {
    console.log('⚠️  Deployment completed with warnings\n');
  } else {
    console.log('❌ Deployment failed\n');
  }
}

// Run deployment
if (require.main === module) {
  runMonitoredDeploy().catch(error => {
    console.error('💥 Deployment script error:', error);
    process.exit(1);
  });
}

module.exports = { runMonitoredDeploy };
