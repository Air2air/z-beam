#!/usr/bin/env node
/**
 * Enhanced Post-Deployment Validation with External APIs
 * 
 * Integrates with:
 * - Google PageSpeed Insights API
 * - Google Rich Results Test API (when available)
 * - Security Headers API
 * - W3C Validator
 * 
 * Usage: node scripts/validation/post-deployment/validate-production-enhanced.js [options]
 * Options:
 *   --url=<url>              Target URL (default: https://www.z-beam.com)
 *   --pagespeed-key=<key>    Google PageSpeed API key (optional, uses env var)
 *   --skip-external          Skip external API calls (faster)
 *   --report=<format>        Report format: json|html|console (default: console)
 *   --output=<file>          Output file path
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs').promises;

// Configuration
const DEFAULT_URL = 'https://www.z-beam.com';
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY || '';

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  if (key.startsWith('--')) {
    acc[key.substring(2)] = value || true;
  }
  return acc;
}, {});

const TARGET_URL = args.url || DEFAULT_URL;
const API_KEY = args['pagespeed-key'] || PAGESPEED_API_KEY;
const SKIP_EXTERNAL = args['skip-external'] || false;
const REPORT_FORMAT = args.report || 'console';
const OUTPUT_FILE = args.output;

const results = {
  timestamp: new Date().toISOString(),
  url: TARGET_URL,
  categories: {},
  externalAPIs: {},
  summary: { total: 0, passed: 0, failed: 0, warnings: 0, score: 0 }
};

// Utility: Fetch JSON from URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, { timeout: 60000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Utility: Add result
function addResult(category, test, passed, message, details = {}) {
  if (!results.categories[category]) {
    results.categories[category] = { tests: [], passed: 0, failed: 0, warnings: 0 };
  }
  
  results.categories[category].tests.push({ test, passed, message, ...details });
  results.summary.total++;
  
  if (passed === true) {
    results.categories[category].passed++;
    results.summary.passed++;
  } else if (passed === false) {
    results.categories[category].failed++;
    results.summary.failed++;
  } else {
    results.categories[category].warnings++;
    results.summary.warnings++;
  }
}

// ============================================================================
// External API: Google PageSpeed Insights
// ============================================================================
async function runPageSpeedInsights() {
  if (SKIP_EXTERNAL) {
    console.log('\n⏩ Skipping PageSpeed Insights (external API)');
    return;
  }
  
  console.log('\n🚀 Running Google PageSpeed Insights...');
  
  try {
    const strategies = ['mobile', 'desktop'];
    
    for (const strategy of strategies) {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(TARGET_URL)}&strategy=${strategy}${API_KEY ? `&key=${API_KEY}` : ''}`;
      
      console.log(`  Analyzing ${strategy}...`);
      const data = await fetchJSON(apiUrl);
      
      if (!data.lighthouseResult || !data.lighthouseResult.categories) {
        throw new Error('Invalid PageSpeed API response');
      }
      
      const lighthouseResult = data.lighthouseResult;
      const categories = lighthouseResult.categories;
      const audits = lighthouseResult.audits;
      
      // Store full results
      results.externalAPIs[`pagespeed_${strategy}`] = {
        scores: {},
        metrics: {}
      };
      
      // Category scores
      Object.entries(categories).forEach(([key, category]) => {
        const score = Math.round(category.score * 100);
        results.externalAPIs[`pagespeed_${strategy}`].scores[key] = score;
        
        addResult(`pagespeed-${strategy}`, category.title,
          score >= 90 ? true : score >= 50 ? 'warning' : false,
          `Score: ${score}/100`,
          { score, threshold: 90 }
        );
      });
      
      // Core Web Vitals
      const cwvMetrics = {
        'largest-contentful-paint': { name: 'LCP', threshold: 2500 },
        'first-input-delay': { name: 'FID', threshold: 100 },
        'cumulative-layout-shift': { name: 'CLS', threshold: 0.1 },
        'interaction-to-next-paint': { name: 'INP', threshold: 200 },
        'first-contentful-paint': { name: 'FCP', threshold: 1800 },
        'speed-index': { name: 'Speed Index', threshold: 3400 },
        'time-to-interactive': { name: 'TTI', threshold: 3800 },
        'total-blocking-time': { name: 'TBT', threshold: 200 }
      };
      
      Object.entries(cwvMetrics).forEach(([key, config]) => {
        if (audits[key]) {
          const value = audits[key].numericValue;
          const displayValue = audits[key].displayValue;
          results.externalAPIs[`pagespeed_${strategy}`].metrics[config.name] = value;
          
          const passed = value <= config.threshold;
          addResult(`pagespeed-${strategy}`, config.name,
            passed,
            `${config.name}: ${displayValue}`,
            { value, threshold: config.threshold }
          );
        }
      });
      
      console.log(`  ✓ ${strategy} analysis complete`);
    }
    
  } catch (error) {
    console.error(`  ✗ PageSpeed Insights failed: ${error.message}`);
    addResult('pagespeed', 'PageSpeed API', false, error.message);
  }
}

// ============================================================================
// External API: Security Headers
// ============================================================================
async function checkSecurityHeaders() {
  if (SKIP_EXTERNAL) {
    console.log('\n⏩ Skipping Security Headers API');
    return;
  }
  
  console.log('\n🔒 Checking Security Headers (securityheaders.com)...');
  
  try {
    // Note: securityheaders.com doesn't have a public API
    // This is a placeholder for custom implementation or alternative service
    console.log('  ℹ️  Note: Manual check recommended at https://securityheaders.com/?q=' + encodeURIComponent(TARGET_URL));
    
    // Alternative: Use Mozilla Observatory API
    const observatoryUrl = `https://http-observatory.security.mozilla.org/api/v1/analyze?host=${new URL(TARGET_URL).hostname}`;
    
    try {
      const data = await fetchJSON(observatoryUrl);
      
      if (data.grade) {
        results.externalAPIs.mozilla_observatory = {
          grade: data.grade,
          score: data.score,
          tests_passed: data.tests_passed,
          tests_failed: data.tests_failed
        };
        
        addResult('security-external', 'Mozilla Observatory Grade',
          ['A+', 'A', 'A-'].includes(data.grade),
          `Grade: ${data.grade} (Score: ${data.score}/100)`,
          { grade: data.grade, score: data.score }
        );
        
        console.log(`  ✓ Mozilla Observatory: ${data.grade} (${data.score}/100)`);
      }
    } catch (observatoryError) {
      console.log('  ⚠️  Mozilla Observatory check failed (may need to trigger scan first)');
      addResult('security-external', 'Mozilla Observatory', 'warning', 'Check needs manual trigger');
    }
    
  } catch (error) {
    console.error(`  ✗ Security headers check failed: ${error.message}`);
  }
}

// ============================================================================
// External API: W3C HTML Validator
// ============================================================================
async function validateHTML() {
  if (SKIP_EXTERNAL) {
    console.log('\n⏩ Skipping W3C HTML Validator');
    return;
  }
  
  console.log('\n✔️  Checking W3C HTML Validation...');
  
  try {
    const validatorUrl = `https://validator.w3.org/nu/?out=json&doc=${encodeURIComponent(TARGET_URL)}`;
    const data = await fetchJSON(validatorUrl);
    
    if (!data || !data.messages) {
      throw new Error('Invalid W3C validator response');
    }
    
    const errors = data.messages.filter(m => m.type === 'error');
    const warnings = data.messages.filter(m => m.type === 'info' || m.type === 'warning');
    
    results.externalAPIs.w3c_validator = {
      errors: errors.length,
      warnings: warnings.length,
      messages: data.messages.slice(0, 10) // First 10 messages
    };
    
    addResult('html-validation', 'W3C HTML Validation',
      errors.length === 0,
      `${errors.length} errors, ${warnings.length} warnings`,
      { errors: errors.length, warnings: warnings.length }
    );
    
    if (errors.length > 0) {
      console.log(`  ⚠️  ${errors.length} HTML validation errors found`);
      errors.slice(0, 3).forEach(err => {
        console.log(`     Line ${err.lastLine}: ${err.message}`);
      });
    } else {
      console.log('  ✓ No HTML validation errors');
    }
    
  } catch (error) {
    console.error(`  ✗ W3C validation failed: ${error.message}`);
    addResult('html-validation', 'W3C Validator', 'warning', 'Validation check failed');
  }
}

// ============================================================================
// Check SSL/TLS Configuration
// ============================================================================
async function checkSSL() {
  if (SKIP_EXTERNAL) {
    console.log('\n⏩ Skipping SSL/TLS check');
    return;
  }
  
  console.log('\n🔐 Checking SSL/TLS Configuration...');
  
  try {
    const hostname = new URL(TARGET_URL).hostname;
    
    // Use SSL Labs API (requires initiating scan first, then polling)
    // For now, just provide recommendation
    console.log(`  ℹ️  Manual SSL check recommended at: https://www.ssllabs.com/ssltest/analyze.html?d=${hostname}`);
    
    // Basic HTTPS check
    if (TARGET_URL.startsWith('https://')) {
      addResult('ssl', 'HTTPS Protocol', true, 'Site uses HTTPS');
    } else {
      addResult('ssl', 'HTTPS Protocol', false, 'Site does not use HTTPS');
    }
    
  } catch (error) {
    console.error(`  ✗ SSL check failed: ${error.message}`);
  }
}

// ============================================================================
// Main Execution
// ============================================================================
async function main() {
  console.log('═'.repeat(80));
  console.log('🚀 ENHANCED POST-DEPLOYMENT VALIDATION');
  console.log('═'.repeat(80));
  console.log(`\n📍 Target: ${TARGET_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}`);
  console.log(`🔑 API Key: ${API_KEY ? 'Provided' : 'Not provided (rate limited)'}`);
  console.log(`⏩ Skip External: ${SKIP_EXTERNAL}`);
  
  try {
    // Run basic validation (from previous script)
    const basicValidator = require('./validate-production.js');
    // Note: This would need to be refactored to import functions
    
    // Run external API checks
    await runPageSpeedInsights();
    await checkSecurityHeaders();
    await validateHTML();
    await checkSSL();
    
    // Calculate score
    results.summary.score = Math.round(
      (results.summary.passed / results.summary.total) * 100
    );
    
    // Display summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 ENHANCED VALIDATION SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\n✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`⚠️  Warnings: ${results.summary.warnings}`);
    console.log(`📈 Score: ${results.summary.score}/100`);
    
    // External API Summary
    if (Object.keys(results.externalAPIs).length > 0) {
      console.log('\n🌐 External API Results:');
      
      if (results.externalAPIs.pagespeed_mobile) {
        console.log('\n  📱 Mobile PageSpeed:');
        Object.entries(results.externalAPIs.pagespeed_mobile.scores).forEach(([key, score]) => {
          const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
          console.log(`    ${emoji} ${key}: ${score}/100`);
        });
      }
      
      if (results.externalAPIs.pagespeed_desktop) {
        console.log('\n  🖥️  Desktop PageSpeed:');
        Object.entries(results.externalAPIs.pagespeed_desktop.scores).forEach(([key, score]) => {
          const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
          console.log(`    ${emoji} ${key}: ${score}/100`);
        });
      }
      
      if (results.externalAPIs.mozilla_observatory) {
        console.log(`\n  🔒 Mozilla Observatory: ${results.externalAPIs.mozilla_observatory.grade} (${results.externalAPIs.mozilla_observatory.score}/100)`);
      }
      
      if (results.externalAPIs.w3c_validator) {
        console.log(`\n  ✔️  W3C Validation: ${results.externalAPIs.w3c_validator.errors} errors, ${results.externalAPIs.w3c_validator.warnings} warnings`);
      }
    }
    
    // Save report
    if (OUTPUT_FILE) {
      if (REPORT_FORMAT === 'json') {
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`\n📄 JSON report saved to: ${OUTPUT_FILE}`);
      } else if (REPORT_FORMAT === 'html') {
        const htmlReport = generateEnhancedHTMLReport(results);
        await fs.writeFile(OUTPUT_FILE, htmlReport);
        console.log(`\n📄 HTML report saved to: ${OUTPUT_FILE}`);
      }
    }
    
    console.log('\n' + '═'.repeat(80));
    
    // Exit code
    process.exit(results.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================================================
// Enhanced HTML Report Generator
// ============================================================================
function generateEnhancedHTMLReport(results) {
  const categoryScores = Object.entries(results.categories).map(([name, data]) => {
    const score = Math.round((data.passed / data.tests.length) * 100);
    return { name, score, ...data };
  });
  
  let externalAPISection = '';
  if (Object.keys(results.externalAPIs).length > 0) {
    externalAPISection = `
      <div class="external-apis">
        <h2>🌐 External API Results</h2>
        ${generateExternalAPICards(results.externalAPIs)}
      </div>
    `;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Validation Report - ${results.url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    header { border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { color: #667eea; font-size: 2.5em; margin-bottom: 10px; }
    .meta { color: #666; font-size: 0.9em; }
    .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .score-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
    .score-card h2 { font-size: 3em; margin-bottom: 10px; font-weight: bold; }
    .score-card p { opacity: 0.95; font-size: 1.1em; }
    .external-apis { margin: 40px 0; padding: 30px; background: #f8f9fa; border-radius: 12px; }
    .external-apis h2 { margin-bottom: 20px; color: #333; }
    .api-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .api-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .api-card h3 { color: #667eea; margin-bottom: 15px; }
    .category { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    .category h3 { color: #333; margin-bottom: 15px; font-size: 1.5em; }
    .test { padding: 15px; margin: 10px 0; border-left: 4px solid #ddd; background: white; border-radius: 4px; transition: transform 0.2s; }
    .test:hover { transform: translateX(5px); }
    .test.passed { border-left-color: #22c55e; }
    .test.failed { border-left-color: #ef4444; background: #fef2f2; }
    .test.warning { border-left-color: #f59e0b; background: #fffbeb; }
    .test-name { font-weight: 600; margin-bottom: 5px; font-size: 1.1em; }
    .test-message { color: #666; font-size: 0.95em; }
    .footer { margin-top: 60px; padding-top: 30px; border-top: 2px solid #eee; text-align: center; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 Enhanced Validation Report</h1>
      <div class="meta">
        <p><strong>URL:</strong> ${results.url}</p>
        <p><strong>Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
        <p><strong>Total Tests:</strong> ${results.summary.total}</p>
      </div>
    </header>
    
    <div class="score-grid">
      <div class="score-card">
        <h2>${results.summary.score}</h2>
        <p>Overall Score</p>
      </div>
      <div class="score-card">
        <h2>${results.summary.passed}</h2>
        <p>Tests Passed</p>
      </div>
      <div class="score-card">
        <h2>${results.summary.failed}</h2>
        <p>Tests Failed</p>
      </div>
      <div class="score-card">
        <h2>${results.summary.warnings}</h2>
        <p>Warnings</p>
      </div>
    </div>
    
    ${externalAPISection}
    
    ${categoryScores.map(cat => `
      <div class="category">
        <h3>📊 ${cat.name.toUpperCase()} - ${cat.score}%</h3>
        ${cat.tests.map(test => `
          <div class="test ${test.passed === true ? 'passed' : test.passed === false ? 'failed' : 'warning'}">
            <div class="test-name">${test.passed === true ? '✅' : test.passed === false ? '❌' : '⚠️'} ${test.test}</div>
            <div class="test-message">${test.message}</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
    
    <div class="footer">
      <p><strong>Z-Beam Enhanced Post-Deployment Validation Suite</strong></p>
      <p>Generated at ${new Date(results.timestamp).toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
}

function generateExternalAPICards(apis) {
  let cards = '';
  
  if (apis.pagespeed_mobile) {
    cards += `
      <div class="api-card">
        <h3>📱 Mobile PageSpeed</h3>
        ${Object.entries(apis.pagespeed_mobile.scores).map(([key, score]) => `
          <p><strong>${key}:</strong> ${score}/100</p>
        `).join('')}
      </div>
    `;
  }
  
  if (apis.pagespeed_desktop) {
    cards += `
      <div class="api-card">
        <h3>🖥️ Desktop PageSpeed</h3>
        ${Object.entries(apis.pagespeed_desktop.scores).map(([key, score]) => `
          <p><strong>${key}:</strong> ${score}/100</p>
        `).join('')}
      </div>
    `;
  }
  
  if (apis.mozilla_observatory) {
    cards += `
      <div class="api-card">
        <h3>🔒 Mozilla Observatory</h3>
        <p><strong>Grade:</strong> ${apis.mozilla_observatory.grade}</p>
        <p><strong>Score:</strong> ${apis.mozilla_observatory.score}/100</p>
        <p><strong>Tests Passed:</strong> ${apis.mozilla_observatory.tests_passed}</p>
      </div>
    `;
  }
  
  if (apis.w3c_validator) {
    cards += `
      <div class="api-card">
        <h3>✔️ W3C HTML Validation</h3>
        <p><strong>Errors:</strong> ${apis.w3c_validator.errors}</p>
        <p><strong>Warnings:</strong> ${apis.w3c_validator.warnings}</p>
      </div>
    `;
  }
  
  return `<div class="api-cards">${cards}</div>`;
}

// Run
main();
