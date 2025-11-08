#!/usr/bin/env node
/**
 * Accessibility Tree Validation Script
 * 
 * Validates the accessibility tree using aXe-core:
 * - Computed accessible names for all interactive elements
 * - ARIA roles validity and correctness
 * - ARIA states and properties validity
 * - Focus order and management
 * 
 * Uses Puppeteer + aXe-core for comprehensive accessibility testing
 * 
 * Usage: node scripts/validate-accessibility-tree.js [url] [options]
 * Options:
 *   --url=URL        Test specific URL (default: http://localhost:3000)
 *   --verbose        Show detailed output
 *   --report         Generate HTML report
 * 
 * Exit codes: 0 = pass, 1 = fail
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_URL = process.env.TEST_URL || 'http://localhost:3000';
const REPORT_DIR = path.join(__dirname, '../coverage/accessibility');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Parse command line arguments
const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url='));
const testUrl = urlArg ? urlArg.split('=')[1] : DEFAULT_URL;
const verbose = args.includes('--verbose');
const generateReport = args.includes('--report');

/**
 * Check if dependencies are available
 */
function checkDependenciesAvailable() {
  try {
    require.resolve('puppeteer');
    require.resolve('axe-core');
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Run aXe accessibility audit
 */
async function runAxeAudit(url) {
  const puppeteer = require('puppeteer');
  const axeCore = require('axe-core');
  
  console.log(`${colors.cyan}Launching browser...${colors.reset}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    
    console.log(`${colors.cyan}Loading page: ${url}${colors.reset}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log(`${colors.cyan}Injecting aXe-core...${colors.reset}`);
    await page.addScriptTag({ path: require.resolve('axe-core') });
    
    console.log(`${colors.cyan}Running accessibility audit...${colors.reset}`);
    
    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        // Configure aXe to check for accessibility tree issues
        const config = {
          rules: [
            // Accessible names
            { id: 'button-name', enabled: true },
            { id: 'link-name', enabled: true },
            { id: 'input-button-name', enabled: true },
            { id: 'image-alt', enabled: true },
            { id: 'label', enabled: true },
            
            // ARIA usage
            { id: 'aria-valid-attr', enabled: true },
            { id: 'aria-valid-attr-value', enabled: true },
            { id: 'aria-required-attr', enabled: true },
            { id: 'aria-required-children', enabled: true },
            { id: 'aria-required-parent', enabled: true },
            { id: 'aria-roles', enabled: true },
            { id: 'aria-allowed-attr', enabled: true },
            
            // Focus management
            { id: 'focus-order-semantics', enabled: true },
            { id: 'tabindex', enabled: true },
            
            // Semantic structure
            { id: 'landmark-one-main', enabled: true },
            { id: 'page-has-heading-one', enabled: true },
            { id: 'heading-order', enabled: true },
          ],
        };
        
        window.axe.run(config, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });
    
    await browser.close();
    return results;
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Categorize violations by severity
 */
function categorizeViolations(violations) {
  const categorized = {
    critical: [],
    serious: [],
    moderate: [],
    minor: [],
  };
  
  violations.forEach(violation => {
    const impact = violation.impact || 'minor';
    if (categorized[impact]) {
      categorized[impact].push(violation);
    }
  });
  
  return categorized;
}

/**
 * Display results
 */
function displayResults(results) {
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}  Accessibility Tree Validation Results${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.green}✅ Passed: ${results.passes.length}${colors.reset}`);
  console.log(`${colors.red}❌ Violations: ${results.violations.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Incomplete: ${results.incomplete.length}${colors.reset}\n`);
  
  if (results.violations.length > 0) {
    const categorized = categorizeViolations(results.violations);
    
    // Display critical violations
    if (categorized.critical.length > 0) {
      console.log(`${colors.red}${colors.bold}Critical Violations (${categorized.critical.length}):${colors.reset}`);
      categorized.critical.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${colors.red}${violation.description}${colors.reset}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Impact: ${violation.impact.toUpperCase()}`);
        console.log(`   Elements affected: ${violation.nodes.length}`);
        
        if (verbose) {
          violation.nodes.slice(0, 3).forEach(node => {
            console.log(`   - ${node.target.join(' ')}`);
            console.log(`     ${node.html.substring(0, 100)}...`);
          });
        }
      });
      console.log('');
    }
    
    // Display serious violations
    if (categorized.serious.length > 0) {
      console.log(`${colors.red}${colors.bold}Serious Violations (${categorized.serious.length}):${colors.reset}`);
      categorized.serious.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${colors.red}${violation.description}${colors.reset}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Elements affected: ${violation.nodes.length}`);
        
        if (verbose) {
          violation.nodes.slice(0, 2).forEach(node => {
            console.log(`   - ${node.target.join(' ')}`);
          });
        }
      });
      console.log('');
    }
    
    // Display moderate violations
    if (categorized.moderate.length > 0) {
      console.log(`${colors.yellow}${colors.bold}Moderate Violations (${categorized.moderate.length}):${colors.reset}`);
      categorized.moderate.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.description} (${violation.nodes.length} elements)`);
      });
      console.log('');
    }
    
    // Display minor violations
    if (categorized.minor.length > 0 && verbose) {
      console.log(`${colors.yellow}${colors.bold}Minor Violations (${categorized.minor.length}):${colors.reset}`);
      categorized.minor.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.description} (${violation.nodes.length} elements)`);
      });
      console.log('');
    }
  }
  
  if (results.incomplete.length > 0 && verbose) {
    console.log(`${colors.yellow}${colors.bold}Incomplete Checks (${results.incomplete.length}):${colors.reset}`);
    results.incomplete.forEach((item, index) => {
      console.log(`${index + 1}. ${item.description} - Requires manual review`);
    });
    console.log('');
  }
}

/**
 * Generate HTML report
 */
function generateHtmlReport(results, url) {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORT_DIR, `accessibility-report-${timestamp}.html`);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Tree Validation Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-top: 0; }
    .summary { display: flex; gap: 20px; margin: 30px 0; }
    .stat { flex: 1; padding: 20px; border-radius: 8px; text-align: center; }
    .stat.passed { background: #d4edda; color: #155724; }
    .stat.violations { background: #f8d7da; color: #721c24; }
    .stat.incomplete { background: #fff3cd; color: #856404; }
    .stat-number { font-size: 48px; font-weight: bold; }
    .stat-label { font-size: 14px; text-transform: uppercase; margin-top: 5px; }
    .violation { margin: 20px 0; padding: 20px; border-left: 4px solid #dc3545; background: #f8f9fa; }
    .violation.critical { border-color: #dc3545; }
    .violation.serious { border-color: #fd7e14; }
    .violation.moderate { border-color: #ffc107; }
    .violation.minor { border-color: #28a745; }
    .violation h3 { margin-top: 0; }
    .help-link { color: #007bff; text-decoration: none; }
    .node { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .meta { color: #6c757d; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Accessibility Tree Validation Report</h1>
    <div class="meta">
      <div><strong>URL:</strong> ${url}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleString()}</div>
      <div><strong>Tool:</strong> aXe-core ${results.testEngine.version}</div>
    </div>
    
    <div class="summary">
      <div class="stat passed">
        <div class="stat-number">${results.passes.length}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat violations">
        <div class="stat-number">${results.violations.length}</div>
        <div class="stat-label">Violations</div>
      </div>
      <div class="stat incomplete">
        <div class="stat-number">${results.incomplete.length}</div>
        <div class="stat-label">Incomplete</div>
      </div>
    </div>
    
    ${results.violations.length > 0 ? `
      <h2>Violations</h2>
      ${results.violations.map(v => `
        <div class="violation ${v.impact}">
          <h3>${v.description}</h3>
          <p><strong>Impact:</strong> ${v.impact.toUpperCase()} | <strong>Elements:</strong> ${v.nodes.length}</p>
          <p><a href="${v.helpUrl}" class="help-link" target="_blank">Learn more →</a></p>
          ${v.nodes.slice(0, 5).map(node => `
            <div class="node">
              <strong>Selector:</strong> ${node.target.join(' ')}<br>
              <strong>HTML:</strong> ${node.html.substring(0, 150)}...
            </div>
          `).join('')}
        </div>
      `).join('')}
    ` : '<p>No violations found!</p>'}
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`${colors.green}Report generated: ${reportPath}${colors.reset}\n`);
}

/**
 * Main validation function
 */
async function validate() {
  console.log(`${colors.bold}${colors.cyan}╔═══════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║   Accessibility Tree Validation${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);
  console.log(`${colors.cyan}URL: ${testUrl}${colors.reset}\n`);
  
  // Check if dependencies are available
  if (!checkDependenciesAvailable()) {
    console.error(`${colors.red}❌ Error: Required dependencies not installed${colors.reset}`);
    console.error(`${colors.yellow}Install with: npm install --save-dev puppeteer axe-core${colors.reset}\n`);
    process.exit(1);
  }
  
  try {
    const results = await runAxeAudit(testUrl);
    
    displayResults(results);
    
    if (generateReport) {
      generateHtmlReport(results, testUrl);
    }
    
    console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
    
    // Fail if there are critical or serious violations
    const categorized = categorizeViolations(results.violations);
    const criticalOrSerious = categorized.critical.length + categorized.serious.length;
    
    if (criticalOrSerious > 0) {
      console.log(`${colors.red}${colors.bold}❌ Accessibility tree validation FAILED!${colors.reset}`);
      console.log(`${colors.yellow}Found ${criticalOrSerious} critical/serious violations that must be fixed.${colors.reset}\n`);
      process.exit(1);
    } else if (results.violations.length > 0) {
      console.log(`${colors.yellow}${colors.bold}⚠️  Accessibility tree validation passed with warnings${colors.reset}`);
      console.log(`${colors.yellow}Found ${results.violations.length} moderate/minor violations. Consider fixing for best accessibility.${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.green}${colors.bold}✅ Accessibility tree validation PASSED!${colors.reset}`);
      console.log(`${colors.green}No accessibility violations found.${colors.reset}\n`);
      process.exit(0);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Validation error: ${error.message}${colors.reset}`);
    console.error(`${colors.yellow}Make sure the dev server is running and accessible at ${testUrl}${colors.reset}\n`);
    process.exit(1);
  }
}

// Run validation
validate();
