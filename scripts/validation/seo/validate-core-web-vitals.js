#!/usr/bin/env node
/**
 * Core Web Vitals Validation Script
 * 
 * Validates Core Web Vitals against Google's thresholds:
 * - LCP (Largest Contentful Paint): < 2.5s good, < 4.0s needs improvement, ≥ 4.0s poor
 * - INP (Interaction to Next Paint): < 200ms good, < 500ms needs improvement, ≥ 500ms poor
 * - CLS (Cumulative Layout Shift): < 0.1 good, < 0.25 needs improvement, ≥ 0.25 poor
 * - FCP (First Contentful Paint): < 1.8s good, < 3.0s needs improvement, ≥ 3.0s poor
 * - TTI (Time to Interactive): < 3.8s good, < 7.3s needs improvement, ≥ 7.3s poor
 * 
 * Uses Lighthouse 11+ for accurate INP measurement
 * 
 * Usage: node scripts/validate-core-web-vitals.js [url] [options]
 * Options:
 *   --mobile         Run mobile audit (default: both)
 *   --desktop        Run desktop audit (default: both)
 *   --strict         Fail on "needs improvement" (default: fail on "poor" only)
 *   --url=URL        Test specific URL (default: http://localhost:3000)
 * 
 * Exit codes: 0 = pass, 1 = fail
 */

const fs = require('fs');
const path = require('path');

// Configuration
// Production URL Policy: Default to production domain (see docs/08-development/PRODUCTION_URL_POLICY.md)
// For local testing, use: TEST_URL=http://localhost:3000 npm run validate:cwv
const DEFAULT_URL = process.env.TEST_URL || 'https://www.z-beam.com';

// Core Web Vitals thresholds (in milliseconds for timing, unitless for CLS)
const THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 },
  inp: { good: 200, needsImprovement: 500 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  tti: { good: 3800, needsImprovement: 7300 },
};

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
const strict = args.includes('--strict');
const mobileOnly = args.includes('--mobile') && !args.includes('--desktop');
const desktopOnly = args.includes('--desktop') && !args.includes('--mobile');
const runBoth = !mobileOnly && !desktopOnly;

/**
 * Check if Lighthouse is available
 */
function checkLighthouseAvailable() {
  try {
    require.resolve('lighthouse');
    require.resolve('chrome-launcher');
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Run Lighthouse audit
 */
async function runLighthouse(url, strategy = 'mobile') {
  const { default: lighthouse } = await import('lighthouse');
  const chromeLauncher = require('chrome-launcher');
  
  console.log(`${colors.cyan}Running Lighthouse audit (${strategy})...${colors.reset}`);
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  });
  
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
    formFactor: strategy,
    screenEmulation: strategy === 'mobile' ? {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
    } : {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
    },
  };
  
  try {
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();
    return runnerResult.lhr;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

/**
 * Get metric status (good, needs improvement, poor)
 */
function getMetricStatus(value, thresholds) {
  if (value < thresholds.good) return 'good';
  if (value < thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Format metric value for display
 */
function formatMetricValue(value, metric) {
  if (metric === 'cls') {
    return value.toFixed(3);
  }
  return `${(value / 1000).toFixed(2)}s`;
}

/**
 * Get emoji for metric status
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'good': return '🟢';
    case 'needs-improvement': return '🟡';
    case 'poor': return '🔴';
    default: return '⚪';
  }
}

/**
 * Validate Core Web Vitals from Lighthouse results
 */
function validateMetrics(lhr, strategy) {
  const audits = lhr.audits;
  const results = {
    strategy,
    metrics: {},
    passed: true,
  };
  
  // Extract metrics
  const metrics = {
    lcp: audits['largest-contentful-paint']?.numericValue,
    cls: audits['cumulative-layout-shift']?.numericValue,
    fcp: audits['first-contentful-paint']?.numericValue,
    tti: audits['interactive']?.numericValue,
  };
  
  // Check for INP (Lighthouse 11+) or fall back to TBT
  if (audits['interaction-to-next-paint']) {
    metrics.inp = audits['interaction-to-next-paint'].numericValue;
  } else if (audits['total-blocking-time']) {
    // TBT is a lab alternative to INP (approximate)
    metrics.inp = audits['total-blocking-time'].numericValue;
    console.log(`${colors.yellow}Note: Using TBT as proxy for INP (Lighthouse 11+ needed for true INP)${colors.reset}`);
  }
  
  // Validate each metric
  Object.entries(metrics).forEach(([metric, value]) => {
    if (value === undefined || value === null) {
      results.metrics[metric] = {
        value: null,
        status: 'unknown',
        pass: true,
      };
      return;
    }
    
    const status = getMetricStatus(value, THRESHOLDS[metric]);
    const inpIsProxy = metric === 'inp' && !audits['interaction-to-next-paint'];
    const pass = strict ? status === 'good' : ((metric === 'tti' || inpIsProxy) ? true : status !== 'poor');
    
    results.metrics[metric] = {
      value,
      status,
      pass,
    };
    
    if (!pass) {
      results.passed = false;
    }
  });
  
  return results;
}

/**
 * Display results
 */
function displayResults(results) {
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}  Core Web Vitals - ${results.strategy.toUpperCase()}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  const metricNames = {
    lcp: 'Largest Contentful Paint (LCP)',
    inp: 'Interaction to Next Paint (INP)',
    cls: 'Cumulative Layout Shift (CLS)',
    fcp: 'First Contentful Paint (FCP)',
    tti: 'Time to Interactive (TTI)',
  };
  
  Object.entries(results.metrics).forEach(([metric, data]) => {
    const emoji = getStatusEmoji(data.status);
    const name = metricNames[metric];
    const value = data.value !== null ? formatMetricValue(data.value, metric) : 'N/A';
    const statusText = data.status.toUpperCase().replace('-', ' ');
    
    let statusColor = colors.reset;
    if (data.status === 'good') statusColor = colors.green;
    else if (data.status === 'needs-improvement') statusColor = colors.yellow;
    else if (data.status === 'poor') statusColor = colors.red;
    
    console.log(`${emoji} ${name}`);
    console.log(`   Value: ${colors.bold}${value}${colors.reset}`);
    console.log(`   Status: ${statusColor}${statusText}${colors.reset}`);
    console.log(`   Result: ${data.pass ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}\n`);
  });
}

/**
 * Main validation function
 */
async function validate() {
  console.log(`${colors.bold}${colors.cyan}╔═══════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║   Core Web Vitals Validation${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);
  console.log(`${colors.cyan}URL: ${testUrl}${colors.reset}`);
  console.log(`${colors.cyan}Mode: ${strict ? 'Strict (fail on needs improvement)' : 'Standard (fail on poor only)'}${colors.reset}\n`);
  
  // Check if Lighthouse is available
  if (!checkLighthouseAvailable()) {
    console.error(`${colors.red}❌ Error: Lighthouse not installed${colors.reset}`);
    console.error(`${colors.yellow}Install with: npm install --save-dev lighthouse chrome-launcher${colors.reset}\n`);
    process.exit(1);
  }
  
  try {
    const strategies = [];
    if (runBoth || mobileOnly) strategies.push('mobile');
    if (runBoth || desktopOnly) strategies.push('desktop');
    
    let allPassed = true;
    
    for (const strategy of strategies) {
      const lhr = await runLighthouse(testUrl, strategy);
      const results = validateMetrics(lhr, strategy);
      displayResults(results);
      
      if (!results.passed) {
        allPassed = false;
      }
    }
    
    console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
    
    if (allPassed) {
      console.log(`${colors.green}${colors.bold}✅ Core Web Vitals validation PASSED!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.red}${colors.bold}❌ Core Web Vitals validation FAILED!${colors.reset}`);
      console.log(`${colors.yellow}Please optimize performance to improve failing metrics.${colors.reset}\n`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Validation error: ${error.message}${colors.reset}`);
    console.error(`${colors.yellow}Make sure the dev server is running and accessible at ${testUrl}${colors.reset}\n`);
    process.exit(1);
  }
}

// Run validation
validate();
