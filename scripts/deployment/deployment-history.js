#!/usr/bin/env node

/**
 * DEPLOYMENT HISTORY TRACKER
 * ===========================
 * Logs deployment history with timestamps, status, and duration
 * Useful for analyzing deployment patterns and performance
 */

const fs = require('fs');
const path = require('path');

const HISTORY_FILE = '.vercel-deployment-history.json';

// ANSI colors
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

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    log(`Warning: Could not load history: ${error.message}`, colors.yellow);
  }
  return { deployments: [], metadata: { firstDeployment: null, lastDeployment: null } };
}

function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    log(`Error saving history: ${error.message}`, colors.red);
  }
}

function addDeployment(deployment) {
  const history = loadHistory();
  
  // Update metadata
  if (!history.metadata.firstDeployment) {
    history.metadata.firstDeployment = deployment.timestamp;
  }
  history.metadata.lastDeployment = deployment.timestamp;
  
  // Add deployment
  history.deployments.unshift(deployment); // Add to beginning
  
  // Keep last 100 deployments
  if (history.deployments.length > 100) {
    history.deployments = history.deployments.slice(0, 100);
  }
  
  saveHistory(history);
  return history;
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function getStatusSymbol(status) {
  const symbols = {
    'success': '✅',
    'failure': '❌',
    'timeout': '⏱️',
    'canceled': '🚫',
  };
  return symbols[status] || '❓';
}

function getStatusColor(status) {
  const statusColors = {
    'success': colors.green,
    'failure': colors.red,
    'timeout': colors.yellow,
    'canceled': colors.yellow,
  };
  return statusColors[status] || colors.reset;
}

function displayHistory(options = {}) {
  const history = loadHistory();
  const { limit = 10, status = null, format = 'table' } = options;
  
  if (history.deployments.length === 0) {
    log('\n📊 No deployment history found', colors.yellow);
    log('💡 History is automatically tracked after each deployment\n', colors.cyan);
    return;
  }
  
  log('\n📊 DEPLOYMENT HISTORY', colors.bright + colors.cyan);
  log('═══════════════════════════════════════════════════\n', colors.cyan);
  
  // Filter by status if specified
  let deployments = history.deployments;
  if (status) {
    deployments = deployments.filter(d => d.status === status);
  }
  
  // Limit results
  deployments = deployments.slice(0, limit);
  
  if (deployments.length === 0) {
    log(`No deployments found with status: ${status}`, colors.yellow);
    return;
  }
  
  // Display based on format
  if (format === 'json') {
    console.log(JSON.stringify(deployments, null, 2));
    return;
  }
  
  // Table format
  deployments.forEach((deployment, index) => {
    const symbol = getStatusSymbol(deployment.status);
    const statusColor = getStatusColor(deployment.status);
    const durationText = formatDuration(deployment.duration);
    
    log(`${symbol} #${index + 1}: ${deployment.status.toUpperCase()}`, statusColor + colors.bright);
    log(`   Time: ${formatTimestamp(deployment.timestamp)}`, colors.reset);
    if (deployment.url) {
      log(`   URL: ${deployment.url}`, colors.blue);
    }
    if (deployment.duration) {
      log(`   Duration: ${durationText}`, colors.cyan);
    }
    if (deployment.branch) {
      log(`   Branch: ${deployment.branch}`, colors.reset);
    }
    if (deployment.commit) {
      log(`   Commit: ${deployment.commit.substring(0, 8)}`, colors.reset);
    }
    if (deployment.errorType) {
      log(`   Error: ${deployment.errorType}`, colors.red);
    }
    log('', colors.reset); // Empty line
  });
}

function displayStats() {
  const history = loadHistory();
  
  if (history.deployments.length === 0) {
    log('\n📊 No deployment history found\n', colors.yellow);
    return;
  }
  
  log('\n📊 DEPLOYMENT STATISTICS', colors.bright + colors.cyan);
  log('═══════════════════════════════════════════════════\n', colors.cyan);
  
  // Calculate stats
  const total = history.deployments.length;
  const successes = history.deployments.filter(d => d.status === 'success').length;
  const failures = history.deployments.filter(d => d.status === 'failure').length;
  const timeouts = history.deployments.filter(d => d.status === 'timeout').length;
  const successRate = ((successes / total) * 100).toFixed(1);
  
  // Average duration (successful deployments only)
  const successfulDurations = history.deployments
    .filter(d => d.status === 'success' && d.duration)
    .map(d => d.duration);
  const avgDuration = successfulDurations.length > 0
    ? Math.round(successfulDurations.reduce((a, b) => a + b, 0) / successfulDurations.length)
    : 0;
  
  // Recent trend (last 10)
  const recent = history.deployments.slice(0, 10);
  const recentSuccesses = recent.filter(d => d.status === 'success').length;
  const recentRate = ((recentSuccesses / recent.length) * 100).toFixed(1);
  
  // Common error types
  const errorTypes = {};
  history.deployments
    .filter(d => d.errorType)
    .forEach(d => {
      errorTypes[d.errorType] = (errorTypes[d.errorType] || 0) + 1;
    });
  
  // Display stats
  log(`📈 Total Deployments: ${total}`, colors.bright);
  log(`✅ Successes: ${successes} (${successRate}%)`, colors.green);
  log(`❌ Failures: ${failures}`, colors.red);
  log(`⏱️  Timeouts: ${timeouts}`, colors.yellow);
  
  if (avgDuration > 0) {
    log(`\n⏱️  Average Duration: ${formatDuration(avgDuration)}`, colors.cyan);
  }
  
  log(`\n📊 Recent Trend (last 10): ${recentRate}% success`, 
    parseFloat(recentRate) >= 80 ? colors.green : colors.yellow);
  
  if (Object.keys(errorTypes).length > 0) {
    log(`\n🔍 Common Errors:`, colors.red);
    Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([error, count]) => {
        log(`   ${error}: ${count} occurrence(s)`, colors.yellow);
      });
  }
  
  if (history.metadata.firstDeployment) {
    log(`\n📅 First Tracked: ${formatTimestamp(history.metadata.firstDeployment)}`, colors.cyan);
  }
  if (history.metadata.lastDeployment) {
    log(`📅 Last Deployment: ${formatTimestamp(history.metadata.lastDeployment)}`, colors.cyan);
  }
  
  log('', colors.reset);
}

function clearHistory(options = {}) {
  const { keepLast = 0 } = options;
  
  if (keepLast > 0) {
    const history = loadHistory();
    history.deployments = history.deployments.slice(0, keepLast);
    saveHistory(history);
    log(`\n✅ Kept last ${keepLast} deployment(s)`, colors.green);
  } else {
    saveHistory({ deployments: [], metadata: {} });
    log('\n✅ Deployment history cleared', colors.green);
  }
}

function exportHistory(format = 'json', outputFile = null) {
  const history = loadHistory();
  
  if (format === 'csv') {
    // Convert to CSV
    const headers = 'Timestamp,Status,Duration,URL,Branch,Commit,ErrorType\n';
    const rows = history.deployments.map(d => {
      return [
        d.timestamp,
        d.status,
        d.duration || '',
        d.url || '',
        d.branch || '',
        d.commit || '',
        d.errorType || ''
      ].join(',');
    }).join('\n');
    
    const csv = headers + rows;
    
    if (outputFile) {
      fs.writeFileSync(outputFile, csv);
      log(`\n✅ Exported to ${outputFile}`, colors.green);
    } else {
      console.log(csv);
    }
  } else {
    // JSON format
    const json = JSON.stringify(history, null, 2);
    
    if (outputFile) {
      fs.writeFileSync(outputFile, json);
      log(`\n✅ Exported to ${outputFile}`, colors.green);
    } else {
      console.log(json);
    }
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Deployment History Tracker

Usage:
  node deployment-history.js <command> [options]

Commands:
  add <status> [options]   Add a deployment to history
  list [options]           Display deployment history
  stats                    Show deployment statistics
  clear [--keep N]         Clear history (optionally keep last N)
  export [format] [file]   Export history (json|csv)

Options for 'add':
  --url <url>              Deployment URL
  --duration <seconds>     Build duration in seconds
  --branch <name>          Git branch
  --commit <sha>           Commit SHA
  --error-type <type>      Error type (for failures)

Options for 'list':
  --limit <n>              Number of deployments to show (default: 10)
  --status <status>        Filter by status (success|failure|timeout)
  --format <format>        Output format (table|json)

Examples:
  node deployment-history.js add success --url "z-beam-abc.vercel.app" --duration 120
  node deployment-history.js add failure --error-type "Module not found"
  node deployment-history.js list --limit 20
  node deployment-history.js list --status failure
  node deployment-history.js stats
  node deployment-history.js export csv deployments.csv
    `);
    process.exit(0);
  }
  
  switch (command) {
    case 'add': {
      const status = args[1];
      if (!status) {
        log('Error: Status required (success|failure|timeout|canceled)', colors.red);
        process.exit(1);
      }
      
      const deployment = {
        timestamp: new Date().toISOString(),
        status,
      };
      
      // Parse options
      for (let i = 2; i < args.length; i += 2) {
        const option = args[i];
        const value = args[i + 1];
        
        if (option === '--url') deployment.url = value;
        else if (option === '--duration') deployment.duration = parseInt(value);
        else if (option === '--branch') deployment.branch = value;
        else if (option === '--commit') deployment.commit = value;
        else if (option === '--error-type') deployment.errorType = value;
      }
      
      addDeployment(deployment);
      log(`\n✅ Added ${status} deployment to history`, colors.green);
      break;
    }
    
    case 'list': {
      const options = {};
      for (let i = 1; i < args.length; i += 2) {
        const option = args[i];
        const value = args[i + 1];
        
        if (option === '--limit') options.limit = parseInt(value);
        else if (option === '--status') options.status = value;
        else if (option === '--format') options.format = value;
      }
      
      displayHistory(options);
      break;
    }
    
    case 'stats': {
      displayStats();
      break;
    }
    
    case 'clear': {
      const keepIndex = args.indexOf('--keep');
      const options = {};
      if (keepIndex >= 0 && args[keepIndex + 1]) {
        options.keepLast = parseInt(args[keepIndex + 1]);
      }
      
      clearHistory(options);
      break;
    }
    
    case 'export': {
      const format = args[1] || 'json';
      const outputFile = args[2];
      exportHistory(format, outputFile);
      break;
    }
    
    default: {
      log(`Unknown command: ${command}`, colors.red);
      log('Run with --help to see available commands', colors.cyan);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    log(`\nError: ${error.message}`, colors.red);
    process.exit(1);
  }
}

module.exports = {
  addDeployment,
  loadHistory,
  displayHistory,
  displayStats,
  clearHistory,
  exportHistory,
};
