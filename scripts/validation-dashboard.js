#!/usr/bin/env node

/**
 * Validation Dashboard
 * 
 * Aggregates all validation results and generates an interactive HTML dashboard:
 * - WCAG 2.2 AA compliance
 * - Core Web Vitals performance
 * - Accessibility tree analysis
 * - Modern SEO metrics
 * - Schema richness opportunities
 * 
 * Usage:
 *   npm run validate:dashboard
 *   npm run validate:dashboard -- --export-json
 *   npm run validate:dashboard -- --export-csv
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DASHBOARD_DIR = path.join(process.cwd(), '.validation-dashboard');
const REPORT_FILE = path.join(DASHBOARD_DIR, 'validation-report.html');
const HISTORY_FILE = path.join(DASHBOARD_DIR, 'history.json');
const EXPORT_JSON = process.argv.includes('--export-json');
const EXPORT_CSV = process.argv.includes('--export-csv');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Run a validation command and capture result
 */
async function runValidation(name, command) {
  log(`\n🔍 Running ${name}...`, 'cyan');
  const startTime = Date.now();
  
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000, // 2 min timeout
    });
    
    const duration = Date.now() - startTime;
    log(`  ✓ Passed (${(duration / 1000).toFixed(1)}s)`, 'green');
    
    return {
      name,
      passed: true,
      duration,
      output: output.trim(),
      error: null,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const exitCode = error.status || 1;
    
    // Check if it's a timeout or actual failure
    if (error.killed) {
      log(`  ⏱ Timeout (${(duration / 1000).toFixed(1)}s)`, 'yellow');
      return {
        name,
        passed: false,
        duration,
        output: '',
        error: 'Timeout exceeded 2 minutes',
        exitCode: 124,
      };
    }
    
    log(`  ✗ Failed (${(duration / 1000).toFixed(1)}s)`, 'red');
    return {
      name,
      passed: false,
      duration,
      output: error.stdout?.trim() || '',
      error: error.stderr?.trim() || error.message,
      exitCode,
    };
  }
}

/**
 * Run all validation scripts
 */
async function runAllValidations() {
  const validations = [
    {
      name: 'Type Check',
      command: 'npm run type-check',
      category: 'Build',
      weight: 5,
    },
    {
      name: 'Linting',
      command: 'npm run lint',
      category: 'Build',
      weight: 3,
    },
    {
      name: 'Unit Tests',
      command: 'npm run test:unit',
      category: 'Testing',
      weight: 5,
    },
    {
      name: 'Naming Conventions',
      command: 'npm run validate:naming',
      category: 'Build',
      weight: 3,
    },
    {
      name: 'Metadata Sync',
      command: 'npm run validate:metadata',
      category: 'Content',
      weight: 5,
    },
    {
      name: 'WCAG 2.2 AA',
      command: 'npm run validate:wcag-2.2:static',
      category: 'Accessibility',
      weight: 10,
    },
    {
      name: 'Accessibility Tree',
      command: 'npm run validate:a11y-tree',
      category: 'Accessibility',
      weight: 10,
      optional: true, // Requires dev server
    },
    {
      name: 'Core Web Vitals',
      command: 'npm run validate:core-web-vitals',
      category: 'Performance',
      weight: 10,
      optional: true, // Requires dev server
    },
    {
      name: 'Modern SEO',
      command: 'npm run validate:seo',
      category: 'SEO',
      weight: 10,
      optional: true, // Requires dev server
    },
    {
      name: 'Schema Richness',
      command: 'npm run validate:schema-richness',
      category: 'SEO',
      weight: 10,
      optional: true, // Requires dev server
    },
  ];
  
  const results = [];
  
  for (const validation of validations) {
    const result = await runValidation(validation.name, validation.command);
    results.push({
      ...result,
      category: validation.category,
      weight: validation.weight,
      optional: validation.optional || false,
    });
  }
  
  return results;
}

/**
 * Calculate validation maturity score
 */
function calculateMaturityScore(results) {
  let totalWeight = 0;
  let achievedWeight = 0;
  let optionalWeight = 0;
  let optionalAchieved = 0;
  
  results.forEach(result => {
    if (result.optional) {
      optionalWeight += result.weight;
      if (result.passed) {
        optionalAchieved += result.weight;
      }
    } else {
      totalWeight += result.weight;
      if (result.passed) {
        achievedWeight += result.weight;
      }
    }
  });
  
  const coreScore = totalWeight > 0 ? (achievedWeight / totalWeight) * 60 : 0;
  const optionalScore = optionalWeight > 0 ? (optionalAchieved / optionalWeight) * 40 : 0;
  const totalScore = Math.round(coreScore + optionalScore);
  
  return {
    total: totalScore,
    core: Math.round(coreScore),
    optional: Math.round(optionalScore),
    coreMax: 60,
    optionalMax: 40,
    breakdown: {
      coreAchieved: achievedWeight,
      coreTotal: totalWeight,
      optionalAchieved,
      optionalTotal: optionalWeight,
    },
  };
}

/**
 * Generate HTML dashboard
 */
async function generateHTML(results, score) {
  const timestamp = new Date().toISOString();
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed && !r.optional).length;
  const skipped = results.filter(r => !r.passed && r.optional).length;
  
  const categoryGroups = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Z-Beam Validation Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      text-align: center;
    }
    .header h1 {
      color: #2d3748;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .header p {
      color: #718096;
      font-size: 1rem;
    }
    .score-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      text-align: center;
    }
    .score-circle {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: conic-gradient(
        #48bb78 0% ${score.total}%,
        #e2e8f0 ${score.total}% 100%
      );
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      position: relative;
    }
    .score-circle::before {
      content: '';
      width: 170px;
      height: 170px;
      background: white;
      border-radius: 50%;
      position: absolute;
    }
    .score-value {
      font-size: 3rem;
      font-weight: bold;
      color: #2d3748;
      position: relative;
      z-index: 1;
    }
    .score-label {
      font-size: 1rem;
      color: #718096;
      margin-top: -0.5rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 2rem;
    }
    .stat {
      text-align: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .stat-value.passed { color: #48bb78; }
    .stat-value.failed { color: #f56565; }
    .stat-value.skipped { color: #ed8936; }
    .stat-label {
      color: #718096;
      font-size: 0.875rem;
    }
    .category {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }
    .category-header {
      font-size: 1.5rem;
      color: #2d3748;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }
    .validation-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border-left: 4px solid #e2e8f0;
    }
    .validation-item.passed {
      border-left-color: #48bb78;
    }
    .validation-item.failed {
      border-left-color: #f56565;
    }
    .validation-item.skipped {
      border-left-color: #ed8936;
    }
    .validation-name {
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .validation-status {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .status-badge.passed {
      background: #c6f6d5;
      color: #22543d;
    }
    .status-badge.failed {
      background: #fed7d7;
      color: #742a2a;
    }
    .status-badge.skipped {
      background: #feebc8;
      color: #7c2d12;
    }
    .duration {
      color: #718096;
      font-size: 0.875rem;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 2rem;
      opacity: 0.8;
    }
    .icon {
      font-size: 1.25rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Z-Beam Validation Dashboard</h1>
      <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
    </div>

    <div class="score-card">
      <div class="score-circle">
        <div class="score-value">${score.total}</div>
      </div>
      <div class="score-label">Validation Maturity Score</div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value passed">${passed}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat">
          <div class="stat-value failed">${failed}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat">
          <div class="stat-value skipped">${skipped}</div>
          <div class="stat-label">Skipped</div>
        </div>
      </div>
    </div>

    ${Object.entries(categoryGroups).map(([category, items]) => `
    <div class="category">
      <div class="category-header">${category}</div>
      ${items.map(item => `
      <div class="validation-item ${item.passed ? 'passed' : item.optional ? 'skipped' : 'failed'}">
        <div class="validation-name">
          <span class="icon">${item.passed ? '✓' : item.optional ? '⊘' : '✗'}</span>
          ${item.name}
        </div>
        <div class="validation-status">
          <span class="duration">${(item.duration / 1000).toFixed(1)}s</span>
          <span class="status-badge ${item.passed ? 'passed' : item.optional ? 'skipped' : 'failed'}">
            ${item.passed ? 'PASSED' : item.optional ? 'SKIPPED' : 'FAILED'}
          </span>
        </div>
      </div>
      `).join('')}
    </div>
    `).join('')}

    <div class="footer">
      <p>Z-Beam Validation Infrastructure v2.0</p>
      <p>Validation Maturity: ${score.core}/${score.coreMax} core + ${score.optional}/${score.optionalMax} optional = ${score.total}/100</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

/**
 * Save validation history
 */
async function saveHistory(results, score) {
  const timestamp = new Date().toISOString();
  
  let history = [];
  try {
    const existingHistory = await fs.readFile(HISTORY_FILE, 'utf8');
    history = JSON.parse(existingHistory);
  } catch (error) {
    // No existing history, start fresh
  }
  
  history.push({
    timestamp,
    score: score.total,
    coreScore: score.core,
    optionalScore: score.optional,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed && !r.optional).length,
    skipped: results.filter(r => !r.passed && r.optional).length,
    results: results.map(r => ({
      name: r.name,
      category: r.category,
      passed: r.passed,
      duration: r.duration,
      optional: r.optional,
    })),
  });
  
  // Keep last 100 runs
  if (history.length > 100) {
    history = history.slice(-100);
  }
  
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Export to JSON
 */
async function exportJSON(results, score) {
  const exportFile = path.join(DASHBOARD_DIR, 'validation-results.json');
  const data = {
    timestamp: new Date().toISOString(),
    score,
    results,
  };
  
  await fs.writeFile(exportFile, JSON.stringify(data, null, 2));
  log(`\n📄 Exported JSON: ${exportFile}`, 'green');
}

/**
 * Export to CSV
 */
async function exportCSV(results, score) {
  const exportFile = path.join(DASHBOARD_DIR, 'validation-results.csv');
  
  const headers = 'Name,Category,Status,Duration (s),Optional,Error\n';
  const rows = results.map(r => 
    `"${r.name}","${r.category}","${r.passed ? 'PASSED' : 'FAILED'}",${(r.duration / 1000).toFixed(1)},${r.optional},${r.error ? `"${r.error.replace(/"/g, '""')}"` : ''}`
  ).join('\n');
  
  await fs.writeFile(exportFile, headers + rows);
  log(`\n📊 Exported CSV: ${exportFile}`, 'green');
}

/**
 * Main dashboard function
 */
async function generateDashboard() {
  log('\n' + '='.repeat(60), 'bright');
  log('  Validation Dashboard Generator', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  try {
    // Ensure dashboard directory exists
    await fs.mkdir(DASHBOARD_DIR, { recursive: true });
    
    // Run all validations
    log('🚀 Running all validations...', 'cyan');
    const results = await runAllValidations();
    
    // Calculate score
    const score = calculateMaturityScore(results);
    
    // Generate HTML report
    log('\n📊 Generating HTML report...', 'cyan');
    const html = await generateHTML(results, score);
    await fs.writeFile(REPORT_FILE, html);
    log(`  ✓ Report saved: ${REPORT_FILE}`, 'green');
    
    // Save history
    log('📝 Saving validation history...', 'cyan');
    await saveHistory(results, score);
    log(`  ✓ History saved: ${HISTORY_FILE}`, 'green');
    
    // Export formats
    if (EXPORT_JSON) {
      await exportJSON(results, score);
    }
    
    if (EXPORT_CSV) {
      await exportCSV(results, score);
    }
    
    // Summary
    log('\n' + '='.repeat(60), 'bright');
    log('  Summary', 'bright');
    log('='.repeat(60) + '\n', 'bright');
    
    log(`Validation Maturity Score: ${score.total}/100`, score.total >= 90 ? 'green' : score.total >= 70 ? 'yellow' : 'red');
    log(`  Core validations: ${score.core}/${score.coreMax}`, 'cyan');
    log(`  Optional validations: ${score.optional}/${score.optionalMax}`, 'cyan');
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed && !r.optional).length;
    const skipped = results.filter(r => !r.passed && r.optional).length;
    
    log(`\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped`, 'cyan');
    
    // Open dashboard
    log('\n🌐 Opening dashboard in browser...', 'cyan');
    const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    
    try {
      execSync(`${opener} "${REPORT_FILE}"`, { stdio: 'ignore' });
      log('  ✓ Dashboard opened', 'green');
    } catch (error) {
      log(`  ⚠ Could not auto-open. View manually: ${REPORT_FILE}`, 'yellow');
    }
    
    log('\n✅ Dashboard generation complete!\n', 'green');
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n✗ Dashboard generation failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(2);
  }
}

// Run dashboard
generateDashboard();
