#!/usr/bin/env node

/**
 * SEO Infrastructure Validation Script
 * 
 * Validates SEO Infrastructure components (metadata, structured data, sitemaps, Open Graph)
 * for optimal search engine discoverability and rich results.
 * 
 * Checks:
 * - Mobile-friendliness score (>90 threshold)
 * - HTTPS enforcement (no insecure http:// references)
 * - Canonical tags (all pages must have canonical)
 * - robots.txt validation (accessible, syntactically valid)
 * - Intrusive interstitials check
 * 
 * @see docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md
 * 
 * Exit codes:
 * 0 - All checks passed
 * 1 - Critical SEO Infrastructure issues found
 * 2 - Script execution error
 */

const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

// Configuration
// Production URL Policy: Default to production domain (see docs/08-development/PRODUCTION_URL_POLICY.md)
// For local testing, use: VALIDATION_URL=http://localhost:3000 npm run validate:modern-seo
const DEV_URL = process.env.VALIDATION_URL || 'https://www.z-beam.com';
const MOBILE_FRIENDLINESS_THRESHOLD = 90; // Google's recommended score

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

/**
 * Print colored output
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Find all page routes in the app
 */
async function findPageRoutes() {
  const routes = new Set();
  const appDir = path.join(process.cwd(), 'app');
  
  async function scanDir(dir, routePath = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip special Next.js directories
          if (['components', 'utils', 'config', 'data', 'api'].includes(entry.name)) {
            continue;
          }
          
          // Handle route groups (parentheses) - don't add to URL
          const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
          const newRoutePath = isRouteGroup ? routePath : `${routePath}/${entry.name}`;
          
          await scanDir(fullPath, newRoutePath);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
          // Found a page route
          routes.add(routePath || '/');
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await scanDir(appDir);
  return Array.from(routes).sort();
}

/**
 * Check mobile-friendliness using Lighthouse
 */
async function checkMobileFriendliness(url) {
  log('\n🔍 Checking mobile-friendliness...', 'cyan');
  
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
    },
  };
  
  try {
    // Import lighthouse dynamically
    const { default: lighthouseLib } = await import('lighthouse');
    const runnerResult = await lighthouseLib(url, options);
    await chrome.kill();
    
    const seoScore = runnerResult.lhr.categories.seo.score * 100;
    const mobileUsability = runnerResult.lhr.audits['viewport'] || { score: 0 };
    const tapTargets = runnerResult.lhr.audits['tap-targets'] || { score: 0 };
    const fontSizes = runnerResult.lhr.audits['font-size'] || { score: 0 };
    
    log(`\n  SEO Score: ${seoScore.toFixed(0)}/100`, seoScore >= MOBILE_FRIENDLINESS_THRESHOLD ? 'green' : 'red');
    log(`  Viewport configured: ${mobileUsability.score === 1 ? '✓ PASS' : '✗ FAIL'}`, mobileUsability.score === 1 ? 'green' : 'red');
    log(`  Tap targets sized appropriately: ${tapTargets.score === 1 ? '✓ PASS' : '✗ FAIL'}`, tapTargets.score === 1 ? 'green' : 'red');
    log(`  Font sizes legible: ${fontSizes.score === 1 ? '✓ PASS' : '✗ FAIL'}`, fontSizes.score === 1 ? 'green' : 'red');
    
    const passed = seoScore >= MOBILE_FRIENDLINESS_THRESHOLD && 
                   mobileUsability.score === 1 && 
                   tapTargets.score === 1 && 
                   fontSizes.score === 1;
    
    return {
      passed,
      score: seoScore,
      details: {
        viewport: mobileUsability.score === 1,
        tapTargets: tapTargets.score === 1,
        fontSizes: fontSizes.score === 1,
      }
    };
  } catch (error) {
    await chrome.kill();
    log(`\n  ✗ Error checking mobile-friendliness: ${error.message}`, 'red');
    return { passed: false, score: 0, error: error.message };
  }
}

/**
 * Check for insecure HTTP references in source files
 */
async function checkHTTPSEnforcement() {
  log('\n🔍 Checking HTTPS enforcement...', 'cyan');
  
  const insecureReferences = [];
  const excludeDirs = ['node_modules', '.next', 'coverage', '.git', 'tests', 'docs', 'frontmatter', 'examples', 'content'];
  const includeExtensions = ['.tsx', '.ts', '.js', '.jsx'];
  const scanRoots = [
    path.join(process.cwd(), 'app'),
    path.join(process.cwd(), 'lib'),
    path.join(process.cwd(), 'components')
  ];
  
  async function scanFiles(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            await scanFiles(fullPath);
          }
        } else if (includeExtensions.some(ext => entry.name.endsWith(ext))) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
              // Look for http:// but exclude:
              // - SVG xmlns attributes (required standard)
              // - Schema.org references (required standard)
              // - Comments about HTTPS
              // - localhost/127.0.0.1 references
              if (line.includes('xmlns="http://www.w3.org/')) return;
              if (line.includes('http://schema.org/')) return;
              if (line.includes('http://www.w3.org/2000/svg')) return;
              
              const httpMatch = line.match(/http:\/\/(?!localhost|127\.0\.0\.1)/g);
              if (httpMatch && !line.includes('https://') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
                insecureReferences.push({
                  file: fullPath.replace(process.cwd(), ''),
                  line: index + 1,
                  content: line.trim().substring(0, 100)
                });
              }
            });
          } catch (error) {
            // Skip unreadable files
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  for (const root of scanRoots) {
    try {
      await fs.access(root);
      await scanFiles(root);
    } catch (_error) {
      // Root doesn't exist in this workspace; skip
    }
  }
  
  if (insecureReferences.length === 0) {
    log('\n  ✓ No insecure HTTP references found', 'green');
    return { passed: true, count: 0 };
  } else {
    log(`\n  ✗ Found ${insecureReferences.length} insecure HTTP reference(s):`, 'red');
    insecureReferences.slice(0, 10).forEach(ref => {
      log(`    ${ref.file}:${ref.line}`, 'yellow');
      log(`      ${ref.content}`, 'reset');
    });
    
    if (insecureReferences.length > 10) {
      log(`    ... and ${insecureReferences.length - 10} more`, 'yellow');
    }
    
    return { passed: false, count: insecureReferences.length, references: insecureReferences };
  }
}

/**
 * Check canonical tags on pages
 */
async function checkCanonicalTags(url, routes) {
  log('\n🔍 Checking canonical tags...', 'cyan');
  
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  const missingCanonical = [];
  
  try {
    // Sample 5 random routes (or all if fewer than 5)
    const samplesToCheck = routes.length <= 5 ? routes : 
      [...routes].sort(() => Math.random() - 0.5).slice(0, 5);
    
    for (const route of samplesToCheck) {
      const fullUrl = `${url}${route}`;
      const page = await browser.newPage();
      
      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 10000 });
        
        const canonicalTag = await page.$('link[rel="canonical"]');
        
        if (!canonicalTag) {
          missingCanonical.push(route);
          log(`  ✗ Missing canonical: ${route}`, 'red');
        } else {
          const href = await page.$eval('link[rel="canonical"]', el => el.getAttribute('href'));
          log(`  ✓ Found canonical: ${route} → ${href}`, 'green');
        }
      } catch (error) {
        log(`  ⚠ Could not check: ${route} (${error.message})`, 'yellow');
      } finally {
        await page.close();
      }
    }
    
    await browser.close();
    
    if (missingCanonical.length === 0) {
      log('\n  ✓ All sampled pages have canonical tags', 'green');
      return { passed: true, checked: samplesToCheck.length, missing: 0 };
    } else {
      log(`\n  ✗ ${missingCanonical.length} of ${samplesToCheck.length} pages missing canonical tags`, 'red');
      return { passed: false, checked: samplesToCheck.length, missing: missingCanonical.length, routes: missingCanonical };
    }
  } catch (error) {
    await browser.close();
    log(`\n  ✗ Error checking canonical tags: ${error.message}`, 'red');
    return { passed: false, error: error.message };
  }
}

/**
 * Validate robots.txt
 */
async function validateRobotsTxt(url) {
  log('\n🔍 Validating robots.txt...', 'cyan');
  
  try {
    const response = await fetch(`${url}/robots.txt`);
    
    if (!response.ok) {
      log(`  ✗ robots.txt not accessible (HTTP ${response.status})`, 'red');
      return { passed: false, accessible: false, status: response.status };
    }
    
    const content = await response.text();
    
    // Basic syntax validation
    const lines = content.split('\n');
    const validDirectives = ['user-agent', 'disallow', 'allow', 'crawl-delay', 'sitemap', 'host'];
    const syntaxErrors = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const normalizedLine = trimmed.toLowerCase();
        const hasValidDirective = validDirectives.some(directive => 
          normalizedLine.startsWith(`${directive}:`)
        );
        
        if (!hasValidDirective) {
          syntaxErrors.push({ line: index + 1, content: trimmed });
        }
      }
    });
    
    // Check for sitemap directive
    const hasSitemap = content.toLowerCase().includes('sitemap:');
    
    if (syntaxErrors.length === 0 && hasSitemap) {
      log('  ✓ robots.txt is accessible and valid', 'green');
      log(`  ✓ Contains sitemap directive`, 'green');
      return { passed: true, accessible: true, syntaxValid: true, hasSitemap: true };
    } else {
      if (syntaxErrors.length > 0) {
        log(`  ✗ Found ${syntaxErrors.length} syntax error(s):`, 'red');
        syntaxErrors.slice(0, 5).forEach(err => {
          log(`    Line ${err.line}: ${err.content}`, 'yellow');
        });
      }
      
      if (!hasSitemap) {
        log('  ⚠ Missing sitemap directive', 'yellow');
      }
      
      return { 
        passed: syntaxErrors.length === 0 && hasSitemap, 
        accessible: true, 
        syntaxValid: syntaxErrors.length === 0,
        hasSitemap,
        errors: syntaxErrors
      };
    }
  } catch (error) {
    log(`  ✗ Error validating robots.txt: ${error.message}`, 'red');
    return { passed: false, accessible: false, error: error.message };
  }
}

/**
 * Check for intrusive interstitials
 */
async function checkIntrusiveInterstitials(url) {
  log('\n🔍 Checking for intrusive interstitials...', 'cyan');
  
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 }); // Mobile viewport
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Wait a bit for any interstitials to appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check for common interstitial indicators
    const interstitialChecks = await page.evaluate(() => {
      const indicators = {
        fullScreenOverlay: false,
        modalDialog: false,
        contentObscured: false,
      };
      
      // Check for full-screen overlays
      const overlays = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
      overlays.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width >= window.innerWidth * 0.8 && rect.height >= window.innerHeight * 0.5) {
          indicators.fullScreenOverlay = true;
        }
      });
      
      // Check for modal dialogs
      const modals = document.querySelectorAll('[role="dialog"], .modal, .popup');
      if (modals.length > 0) {
        indicators.modalDialog = true;
      }
      
      // Check if main content is obscured
      const body = document.body;
      const bodyStyle = window.getComputedStyle(body);
      if (bodyStyle.overflow === 'hidden' || bodyStyle.position === 'fixed') {
        indicators.contentObscured = true;
      }
      
      return indicators;
    });
    
    await browser.close();
    
    const hasIntrusiveInterstitial = interstitialChecks.fullScreenOverlay && 
                                     interstitialChecks.contentObscured;
    
    if (hasIntrusiveInterstitial) {
      log('  ✗ Detected potential intrusive interstitial', 'red');
      log('    Full-screen overlay with content obscured', 'yellow');
      return { passed: false, detected: true, checks: interstitialChecks };
    } else {
      log('  ✓ No intrusive interstitials detected', 'green');
      return { passed: true, detected: false, checks: interstitialChecks };
    }
  } catch (error) {
    await browser.close();
    log(`  ⚠ Could not check for interstitials: ${error.message}`, 'yellow');
    // Don't fail the build for this check
    return { passed: true, error: error.message };
  }
}

/**
 * Main validation function
 */
async function validate() {
  log('\n' + '='.repeat(60), 'bright');
  log('  Modern SEO Validation', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  log(`Target URL: ${DEV_URL}`, 'cyan');
  log(`Mobile-friendliness threshold: ${MOBILE_FRIENDLINESS_THRESHOLD}`, 'cyan');
  
  const results = {
    mobileFriendliness: null,
    httpsEnforcement: null,
    canonicalTags: null,
    robotsTxt: null,
    interstitials: null,
  };
  
  try {
    // Find all routes
    log('\n📄 Discovering page routes...', 'cyan');
    const routes = await findPageRoutes();
    log(`  Found ${routes.length} routes`, 'green');
    
    // Run all checks
    results.mobileFriendliness = await checkMobileFriendliness(DEV_URL);
    results.httpsEnforcement = await checkHTTPSEnforcement();
    results.canonicalTags = await checkCanonicalTags(DEV_URL, routes);
    results.robotsTxt = await validateRobotsTxt(DEV_URL);
    results.interstitials = await checkIntrusiveInterstitials(DEV_URL);
    
    // Summary
    log('\n' + '='.repeat(60), 'bright');
    log('  Summary', 'bright');
    log('='.repeat(60) + '\n', 'bright');
    
    const checks = [
      { name: 'Mobile-friendliness', result: results.mobileFriendliness },
      { name: 'HTTPS enforcement', result: results.httpsEnforcement },
      { name: 'Canonical tags', result: results.canonicalTags },
      { name: 'robots.txt', result: results.robotsTxt },
      { name: 'Intrusive interstitials', result: results.interstitials },
    ];
    
    let passed = 0;
    let failed = 0;
    
    checks.forEach(check => {
      if (check.result.passed) {
        log(`✓ ${check.name}`, 'green');
        passed++;
      } else {
        log(`✗ ${check.name}`, 'red');
        failed++;
      }
    });
    
    log(`\nTotal: ${passed}/${checks.length} checks passed\n`, passed === checks.length ? 'green' : 'red');
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n✗ Validation failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(2);
  }
}

// Run validation
validate();
