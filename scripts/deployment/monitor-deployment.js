#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT MONITOR
 * =========================
 * Monitors Vercel deployments in real-time and reports status
 */

const { execSync } = require('child_process');
const { setTimeout } = require('timers/promises');

const CHECK_INTERVAL = 5000; // 5 seconds
const MAX_WAIT_TIME = 600000; // 10 minutes
const VERCEL_CLI = 'vercel';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function getLatestDeployment() {
  try {
    const output = execSync(`${VERCEL_CLI} ls --json`, { encoding: 'utf-8' });
    const data = JSON.parse(output);
    
    if (!data.deployments || data.deployments.length === 0) {
      return null;
    }
    
    // Get the most recent deployment
    return data.deployments[0];
  } catch (error) {
    log(`Error fetching deployments: ${error.message}`, colors.red);
    return null;
  }
}

function formatDuration(seconds) {
  if (!seconds) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function getStatusSymbol(state) {
  const symbols = {
    'BUILDING': '🔨',
    'READY': '✅',
    'ERROR': '❌',
    'QUEUED': '⏳',
    'INITIALIZING': '🚀',
    'CANCELED': '🚫',
  };
  return symbols[state] || '❓';
}

function getStatusColor(state) {
  const statusColors = {
    'BUILDING': colors.yellow,
    'READY': colors.green,
    'ERROR': colors.red,
    'QUEUED': colors.cyan,
    'INITIALIZING': colors.blue,
    'CANCELED': colors.red,
  };
  return statusColors[state] || colors.reset;
}

async function monitorDeployment(deploymentUrl = null) {
  log('\n🔍 VERCEL DEPLOYMENT MONITOR', colors.bright + colors.cyan);
  log('═══════════════════════════════════════\n', colors.cyan);
  
  const startTime = Date.now();
  let previousState = null;
  let checkCount = 0;
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    checkCount++;
    const deployment = getLatestDeployment();
    
    if (!deployment) {
      log('No deployments found. Waiting...', colors.yellow);
      await setTimeout(CHECK_INTERVAL);
      continue;
    }
    
    const { 
      url, 
      state, 
      readyState,
      created,
      meta = {},
      target = 'production'
    } = deployment;
    
    const currentState = readyState || state;
    const symbol = getStatusSymbol(currentState);
    const statusColor = getStatusColor(currentState);
    
    // Only log if state changed or every 5 checks
    if (currentState !== previousState || checkCount % 5 === 0) {
      const age = Math.floor((Date.now() - created) / 1000);
      
      log(`\n${symbol} Status: ${currentState}`, statusColor);
      log(`📍 URL: ${url}`, colors.blue);
      log(`🌍 Target: ${target}`, colors.cyan);
      log(`⏱️  Age: ${formatDuration(age)}`, colors.reset);
      log(`🔄 Check #${checkCount}`, colors.reset);
      
      if (meta.githubCommitMessage) {
        log(`💬 Commit: ${meta.githubCommitMessage.substring(0, 60)}...`, colors.reset);
      }
      
      previousState = currentState;
    }
    
    // Check for terminal states
    if (currentState === 'READY') {
      log('\n✅ DEPLOYMENT SUCCESSFUL!', colors.bright + colors.green);
      log(`🌐 Live at: ${url}`, colors.green);
      log(`⏱️  Total time: ${formatDuration(Math.floor((Date.now() - startTime) / 1000))}`, colors.green);
      
      // Open browser if requested
      if (process.argv.includes('--open')) {
        log('\n🌐 Opening in browser...', colors.cyan);
        const { exec } = require('child_process');
        exec(`open ${url}`);
      }
      
      return { success: true, url, state: currentState };
    }
    
    if (currentState === 'ERROR' || currentState === 'CANCELED') {
      log('\n❌ DEPLOYMENT FAILED!', colors.bright + colors.red);
      log(`📍 URL: ${url}`, colors.red);
      
      // Fetch deployment logs for error analysis
      log('\n� Fetching error logs...', colors.yellow);
      try {
        const logs = execSync(`${VERCEL_CLI} logs ${url} --output raw 2>&1 | tail -100`, { 
          encoding: 'utf-8',
          timeout: 10000
        });
        
        if (logs && logs.trim()) {
          log('\n📋 BUILD ERROR LOGS:', colors.red + colors.bright);
          log('═════════════════════════════════════════════', colors.red);
          console.log(logs);
          log('═════════════════════════════════════════════', colors.red);
        }
        
        // Save logs to file for Copilot to analyze
        const fs = require('fs');
        const logFile = '.vercel-deployment-error.log';
        fs.writeFileSync(logFile, logs);
        log(`\n💾 Error logs saved to: ${logFile}`, colors.cyan);
        log('💡 Show this file to Copilot to analyze and create fixes', colors.cyan);
        
      } catch (logError) {
        log(`⚠️  Could not fetch logs: ${logError.message}`, colors.yellow);
      }
      
      log('\n💡 Inspect deployment: vercel inspect ${url}', colors.yellow);
      
      return { success: false, url, state: currentState };
    }
    
    // Wait before next check
    await setTimeout(CHECK_INTERVAL);
  }
  
  log('\n⏱️  TIMEOUT: Deployment is taking longer than expected', colors.yellow);
  log(`💡 Monitor manually: vercel ls`, colors.yellow);
  
  return { success: false, timeout: true };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const deploymentUrl = args.find(arg => arg.startsWith('http'));
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Vercel Deployment Monitor

Usage:
  node monitor-deployment.js [options] [deployment-url]

Options:
  --help, -h    Show this help message
  --open        Open the deployment in browser when ready
  --quiet       Only show final result

Examples:
  node monitor-deployment.js
  node monitor-deployment.js --open
  node monitor-deployment.js https://z-beam-xyz.vercel.app
    `);
    process.exit(0);
  }
  
  const quiet = args.includes('--quiet');
  
  if (quiet) {
    // Suppress intermediate logs
    const originalLog = console.log;
    console.log = () => {};
    
    const result = await monitorDeployment(deploymentUrl);
    
    console.log = originalLog;
    console.log(result.success ? '✅ SUCCESS' : '❌ FAILED');
    process.exit(result.success ? 0 : 1);
  } else {
    const result = await monitorDeployment(deploymentUrl);
    process.exit(result.success ? 0 : 1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Monitor error:', error);
    process.exit(1);
  });
}

module.exports = { monitorDeployment };
