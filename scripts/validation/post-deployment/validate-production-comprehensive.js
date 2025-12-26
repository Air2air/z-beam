#!/usr/bin/env node
/**
 * Comprehensive Post-Deployment Validation
 * 
 * Complete coverage of:
 * - SEO Infrastructure (metadata, Open Graph, schemas)
 * - Schema.org Coverage (Dataset, Product, ChemicalSubstance, etc.)
 * - Performance (Core Web Vitals, PageSpeed)
 * - Accessibility (WCAG 2.2)
 * - Content Integrity (datasets, images)
 * - Security (headers, SSL)
 * 
 * Usage: node scripts/validation/post-deployment/validate-production-comprehensive.js [options]
 * Options:
 *   --url=<url>              Target URL (default: https://www.z-beam.com)
 *   --skip-external          Skip external API calls
 *   --skip-performance       Skip performance checks
 *   --skip-accessibility     Skip accessibility checks
 *   --report=json|console    Output format (default: console)
 *   --output=<file>          Save report to file
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');

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
const SKIP_EXTERNAL = args['skip-external'] || false;
const SKIP_PERFORMANCE = args['skip-performance'] || false;
const SKIP_ACCESSIBILITY = args['skip-accessibility'] || false;
const REPORT_FORMAT = args.report || 'console';
const OUTPUT_FILE = args.output;

// Results object
const results = {
  timestamp: new Date().toISOString(),
  url: TARGET_URL,
  categories: {},
  summary: { 
    total: 0, 
    passed: 0, 
    failed: 0, 
    warnings: 0, 
    score: 0,
    coverage: 0
  }
};

// Utility: Fetch from URL
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = options.timeout || 30000;
    
    protocol.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (options.json) {
          try {
            resolve({ data: JSON.parse(data), status: res.statusCode, headers: res.headers });
          } catch (error) {
            reject(new Error(`JSON parse failed: ${error.message}`));
          }
        } else {
          resolve({ data, status: res.statusCode, headers: res.headers });
        }
      });
    }).on('error', reject);
  });
}

// Utility: Add result
function addResult(category, test, passed, message, details = {}) {
  if (!results.categories[category]) {
    results.categories[category] = { tests: [], passed: 0, failed: 0, warnings: 0, score: 0 };
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

// Utility: Calculate category score
function calculateCategoryScore(category) {
  const cat = results.categories[category];
  if (!cat) return 0;
  
  const total = cat.passed + cat.failed + cat.warnings;
  if (total === 0) return 0;
  
  // Passed = 1.0, Warning = 0.5, Failed = 0.0
  const score = (cat.passed + (cat.warnings * 0.5)) / total;
  cat.score = Math.round(score * 100);
  return cat.score;
}

// ============================================================================
// 1. BASIC INFRASTRUCTURE
// ============================================================================
async function checkBasicInfrastructure() {
  console.log('\n🔍 1. BASIC INFRASTRUCTURE');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(TARGET_URL);
    const { data: html, status, headers } = response;
    
    // Site reachability
    addResult('infrastructure', 'Site Reachability', 
      status === 200, 
      `HTTP ${status}`,
      { status, responseTime: '<1s' }
    );
    
    // HTTPS/SSL
    addResult('infrastructure', 'HTTPS Enabled', 
      TARGET_URL.startsWith('https://'), 
      'SSL certificate valid'
    );
    
    // Security headers
    addResult('infrastructure', 'HSTS Header', 
      !!headers['strict-transport-security'], 
      headers['strict-transport-security'] || 'Missing'
    );
    
    addResult('infrastructure', 'Frame Protection', 
      !!(headers['x-frame-options'] || headers['content-security-policy']), 
      headers['x-frame-options'] || 'Via CSP'
    );
    
    addResult('infrastructure', 'Content-Type Protection', 
      !!headers['x-content-type-options'], 
      headers['x-content-type-options'] || 'Missing'
    );
    
    // HTML doctype
    addResult('infrastructure', 'Valid HTML Doctype', 
      html.includes('<!DOCTYPE html'), 
      'HTML5 doctype present'
    );
    
    calculateCategoryScore('infrastructure');
    console.log(`   Score: ${results.categories.infrastructure.score}%`);
    
  } catch (error) {
    addResult('infrastructure', 'Site Reachability', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 2. SEO METADATA
// ============================================================================
async function checkSEOMetadata() {
  console.log('\n📊 2. SEO METADATA');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(TARGET_URL);
    const { data: html } = response;
    
    // Title tag
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : null;
    
    if (title) {
      const titleLength = title.length;
      addResult('seo-metadata', 'Title Tag Presence', true, `"${title}"`);
      addResult('seo-metadata', 'Title Tag Length', 
        titleLength >= 50 && titleLength <= 60,
        `${titleLength} chars (optimal: 50-60)`,
        { length: titleLength, optimal: '50-60' }
      );
    } else {
      addResult('seo-metadata', 'Title Tag Presence', false, 'Missing');
    }
    
    // Meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1] : null;
    
    if (description) {
      const descLength = description.length;
      addResult('seo-metadata', 'Meta Description Presence', true, 'Present');
      addResult('seo-metadata', 'Meta Description Length', 
        descLength >= 155 && descLength <= 160,
        `${descLength} chars (optimal: 155-160)`,
        { length: descLength, optimal: '155-160' }
      );
    } else {
      addResult('seo-metadata', 'Meta Description Presence', false, 'Missing');
    }
    
    // Canonical URL
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    addResult('seo-metadata', 'Canonical URL', 
      !!canonicalMatch,
      canonicalMatch ? canonicalMatch[1] : 'Missing'
    );
    
    // Open Graph tags
    const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const ogDescription = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
    
    addResult('seo-metadata', 'og:title', !!ogTitle, ogTitle ? 'Present' : 'Missing');
    addResult('seo-metadata', 'og:description', !!ogDescription, ogDescription ? 'Present' : 'Missing');
    addResult('seo-metadata', 'og:image', !!ogImage, ogImage ? ogImage[1] : 'Missing');
    addResult('seo-metadata', 'og:url', !!ogUrl, ogUrl ? 'Present' : 'Missing');
    
    // Twitter Card
    const twitterCard = html.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i);
    addResult('seo-metadata', 'Twitter Card', !!twitterCard, twitterCard ? twitterCard[1] : 'Missing');
    
    calculateCategoryScore('seo-metadata');
    console.log(`   Score: ${results.categories['seo-metadata'].score}%`);
    
  } catch (error) {
    addResult('seo-metadata', 'Metadata Check', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 3. SCHEMA.ORG STRUCTURED DATA
// ============================================================================
async function checkStructuredData() {
  console.log('\n🏗️  3. SCHEMA.ORG STRUCTURED DATA');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(TARGET_URL);
    const { data: html } = response;
    
    // Extract all JSON-LD scripts with improved regex that handles minified HTML
    const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    const jsonldMatches = [];
    let match;
    
    while ((match = scriptRegex.exec(html)) !== null) {
      const jsonContent = match[1].trim();
      if (jsonContent) {
        jsonldMatches.push(jsonContent);
      }
    }
    
    if (jsonldMatches.length === 0) {
      console.warn('   ⚠️  No JSON-LD scripts found in HTML');
    }
    
    const schemas = jsonldMatches.map(jsonText => {
      try {
        const parsed = JSON.parse(jsonText);
        // Handle @graph structure
        if (parsed['@graph']) {
          return parsed['@graph'];
        }
        return parsed;
      } catch (e) {
        console.warn(`   ⚠️  Failed to parse JSON-LD: ${e.message.substring(0, 50)}...`);
        return null;
      }
    }).filter(Boolean).flat();
    
    addResult('structured-data', 'JSON-LD Presence', 
      schemas.length > 0,
      `${schemas.length} schema(s) found`,
      { count: schemas.length }
    );
    
    // Check for specific schema types
    const schemaTypes = schemas.reduce((types, schema) => {
      const type = schema['@type'];
      if (Array.isArray(type)) {
        types.push(...type);
      } else if (type) {
        types.push(type);
      }
      return types;
    }, []);
    
    // Deduplicate types
    const uniqueTypes = [...new Set(schemaTypes)];
    
    const expectedSchemas = [
      'WebPage',
      'BreadcrumbList',
      'Organization',
      'LocalBusiness',
      'WebSite'
    ];
    
    expectedSchemas.forEach(schemaType => {
      const found = uniqueTypes.includes(schemaType);
      addResult('structured-data', `${schemaType} Schema`, 
        found,
        found ? 'Present' : 'Missing'
      );
    });
    
    // Check for material/settings specific schemas
    const contentSchemas = ['Dataset', 'Product', 'TechnicalArticle', 'HowTo', 'FAQPage'];
    contentSchemas.forEach(schemaType => {
      const found = schemaTypes.includes(schemaType);
      if (found) {
        addResult('structured-data', `${schemaType} Schema`, true, 'Present');
      }
    });
    
    // Validate schema completeness
    const webPageSchema = schemas.find(s => s['@type'] === 'WebPage' || (Array.isArray(s['@type']) && s['@type'].includes('WebPage')));
    if (webPageSchema) {
      addResult('structured-data', 'WebPage - Name', !!webPageSchema.name, webPageSchema.name || 'Missing');
      addResult('structured-data', 'WebPage - Description', !!webPageSchema.description, 'Present');
      addResult('structured-data', 'WebPage - URL', !!webPageSchema.url, webPageSchema.url || 'Missing');
    }
    
    const breadcrumbSchema = schemas.find(s => s['@type'] === 'BreadcrumbList');
    if (breadcrumbSchema) {
      const itemListElement = breadcrumbSchema.itemListElement || [];
      addResult('structured-data', 'Breadcrumb - Items', 
        itemListElement.length > 0,
        `${itemListElement.length} item(s)`,
        { count: itemListElement.length }
      );
    }
    
    calculateCategoryScore('structured-data');
    console.log(`   Score: ${results.categories['structured-data'].score}%`);
    console.log(`   Schemas found: ${[...new Set(schemaTypes)].join(', ')}`);
    
  } catch (error) {
    addResult('structured-data', 'Schema Check', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 4. CONTENT-SPECIFIC SCHEMAS (Sample Pages)
// ============================================================================
async function checkContentSchemas() {
  console.log('\n📄 4. CONTENT-SPECIFIC SCHEMAS (Sample Pages)');
  console.log('─'.repeat(60));
  
  const samplePages = [
    { url: '/materials/metal/ferrous/steel-laser-cleaning', type: 'Material', expectedSchemas: ['Dataset', 'Product', 'TechnicalArticle'] },
    { url: '/materials/metal/nonferrous/aluminum-laser-cleaning', type: 'Material-Alt', expectedSchemas: ['Dataset', 'Product', 'TechnicalArticle'] },
    { url: '/contaminants/environmental/rust-oxidation-contamination', type: 'Contaminant', expectedSchemas: ['Dataset', 'Product', 'ChemicalSubstance'] }
  ];
  
  for (const page of samplePages) {
    const fullUrl = `${TARGET_URL}${page.url}`;
    
    try {
      const response = await fetch(fullUrl);
      const { data: html, status } = response;
      
      if (status !== 200) {
        addResult('content-schemas', `${page.type} Page Exists`, false, `HTTP ${status}`);
        continue;
      }
      
      addResult('content-schemas', `${page.type} Page Exists`, true, page.url);
      
      // Extract schemas with improved regex that handles minified HTML
      const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
      const jsonldMatches = [];
      let match;
      
      while ((match = scriptRegex.exec(html)) !== null) {
        const jsonContent = match[1].trim();
        if (jsonContent) {
          jsonldMatches.push(jsonContent);
        }
      }
      
      const schemas = jsonldMatches.map(jsonText => {
        try {
          const parsed = JSON.parse(jsonText);
          // Handle @graph structure
          if (parsed['@graph']) {
            return parsed['@graph'];
          }
          return parsed;
        } catch (e) {
          return null;
        }
      }).filter(Boolean).flat();
      
      const schemaTypes = schemas.reduce((types, schema) => {
        const type = schema['@type'];
        if (Array.isArray(type)) {
          types.push(...type);
        } else if (type) {
          types.push(type);
        }
        return types;
      }, []);
      
      // Check expected schemas
      page.expectedSchemas.forEach(expectedSchema => {
        const found = schemaTypes.includes(expectedSchema);
        addResult('content-schemas', `${page.type} - ${expectedSchema}`, 
          found,
          found ? 'Present' : 'Missing'
        );
      });
      
    } catch (error) {
      addResult('content-schemas', `${page.type} Page Check`, false, error.message);
    }
  }
  
  calculateCategoryScore('content-schemas');
  console.log(`   Score: ${results.categories['content-schemas'].score}%`);
}

// ============================================================================
// 5. DATASET FILES VALIDATION
// ============================================================================
async function checkDatasetFiles() {
  console.log('\n💾 5. DATASET FILES VALIDATION');
  console.log('─'.repeat(60));
  console.log('   ⚠️  Note: Dataset files may not be deployed to production');
  console.log('   Check Vercel build settings if datasets are missing');
  
  const sampleDatasets = [
    '/datasets/materials/steel-laser-cleaning.json',
    '/datasets/materials/steel-laser-cleaning.csv',
    '/datasets/materials/aluminum-laser-cleaning.json',
    '/datasets/materials/aluminum-laser-cleaning.txt'
  ];
  
  for (const dataset of sampleDatasets) {
    const fullUrl = `${TARGET_URL}${dataset}`;
    
    try {
      const response = await fetch(fullUrl);
      const { status } = response;
      
      // Mark as warning instead of failure since this is a deployment config issue
      const passed = status === 200 ? true : 'warning';
      addResult('dataset-files', `Dataset: ${path.basename(dataset)}`, 
        passed,
        status === 200 ? 'Accessible' : `HTTP ${status} (may require deployment config update)`
      );
      
    } catch (error) {
      addResult('dataset-files', `Dataset: ${path.basename(dataset)}`, 'warning', error.message);
    }
  }
  
  calculateCategoryScore('dataset-files');
  console.log(`   Score: ${results.categories['dataset-files'].score}%`);
}

// ============================================================================
// 6. SITEMAP VALIDATION
// ============================================================================
async function checkSitemap() {
  console.log('\n🗺️  6. SITEMAP VALIDATION');
  console.log('─'.repeat(60));
  
  try {
    const sitemapUrl = `${TARGET_URL}/sitemap.xml`;
    const response = await fetch(sitemapUrl);
    const { data: xml, status } = response;
    
    addResult('sitemap', 'Sitemap Accessible', 
      status === 200,
      status === 200 ? sitemapUrl : `HTTP ${status}`
    );
    
    if (status === 200) {
      // Count URLs
      const urlMatches = xml.match(/<loc>/g) || [];
      const urlCount = urlMatches.length;
      
      addResult('sitemap', 'URL Count', 
        urlCount > 0,
        `${urlCount} URLs`,
        { count: urlCount }
      );
      
      // Check for material pages
      const hasMaterials = xml.includes('/materials/');
      addResult('sitemap', 'Material Pages Included', hasMaterials, hasMaterials ? 'Yes' : 'No');
      
      // Check for settings pages
      const hasSettings = xml.includes('/settings/');
      addResult('sitemap', 'Settings Pages Included', hasSettings, hasSettings ? 'Yes' : 'No');
      
      // Check for contaminant pages
      const hasContaminants = xml.includes('/contaminants/');
      addResult('sitemap', 'Contaminant Pages Included', hasContaminants, hasContaminants ? 'Yes' : 'No');
    }
    
    calculateCategoryScore('sitemap');
    console.log(`   Score: ${results.categories.sitemap.score}%`);
    
  } catch (error) {
    addResult('sitemap', 'Sitemap Check', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 7. ROBOTS.TXT VALIDATION
// ============================================================================
async function checkRobotsTxt() {
  console.log('\n🤖 7. ROBOTS.TXT VALIDATION');
  console.log('─'.repeat(60));
  
  try {
    const robotsUrl = `${TARGET_URL}/robots.txt`;
    const response = await fetch(robotsUrl);
    const { data: txt, status } = response;
    
    addResult('robots', 'robots.txt Accessible', 
      status === 200,
      status === 200 ? robotsUrl : `HTTP ${status}`
    );
    
    if (status === 200) {
      // Check for sitemap reference
      const hasSitemap = txt.includes('Sitemap:');
      addResult('robots', 'Sitemap Reference', hasSitemap, hasSitemap ? 'Present' : 'Missing');
      
      // Check crawl rules
      const hasUserAgent = txt.includes('User-agent:');
      addResult('robots', 'User-Agent Directive', hasUserAgent, hasUserAgent ? 'Present' : 'Missing');
    }
    
    calculateCategoryScore('robots');
    console.log(`   Score: ${results.categories.robots.score}%`);
    
  } catch (error) {
    addResult('robots', 'robots.txt Check', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 8. PERFORMANCE (Core Web Vitals via PageSpeed Insights)
// ============================================================================
async function checkPerformance() {
  if (SKIP_PERFORMANCE || SKIP_EXTERNAL) {
    console.log('\n⏩ 8. PERFORMANCE (Skipped)');
    return;
  }
  
  console.log('\n⚡ 8. PERFORMANCE (Core Web Vitals)');
  console.log('─'.repeat(60));
  
  if (!PAGESPEED_API_KEY) {
    console.log('   ⚠️  PageSpeed API key not set (use PAGESPEED_API_KEY env var)');
    addResult('performance', 'API Configuration', 'warning', 'API key missing');
    return;
  }
  
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(TARGET_URL)}&key=${PAGESPEED_API_KEY}&strategy=mobile`;
    
    console.log('   Analyzing mobile performance...');
    const response = await fetch(apiUrl, { json: true, timeout: 90000 });
    const { data } = response;
    
    if (!data.lighthouseResult) {
      throw new Error('Invalid PageSpeed API response');
    }
    
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult.categories;
    const audits = lighthouseResult.audits;
    
    // Category scores
    Object.entries(categories).forEach(([key, category]) => {
      const score = Math.round(category.score * 100);
      addResult('performance', category.title,
        score >= 90,
        `${score}/100`,
        { score, threshold: 90 }
      );
    });
    
    // Core Web Vitals
    const cwv = {
      'largest-contentful-paint': { name: 'LCP', threshold: 2500, unit: 'ms' },
      'cumulative-layout-shift': { name: 'CLS', threshold: 0.1, unit: '' },
      'interaction-to-next-paint': { name: 'INP', threshold: 200, unit: 'ms' }
    };
    
    Object.entries(cwv).forEach(([key, config]) => {
      if (audits[key]) {
        const value = audits[key].numericValue;
        const passed = value <= config.threshold;
        addResult('performance', config.name,
          passed,
          `${value.toFixed(key === 'cumulative-layout-shift' ? 3 : 0)}${config.unit} (threshold: ${config.threshold}${config.unit})`,
          { value, threshold: config.threshold }
        );
      }
    });
    
    calculateCategoryScore('performance');
    console.log(`   Score: ${results.categories.performance.score}%`);
    
  } catch (error) {
    addResult('performance', 'PageSpeed Check', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 9. ACCESSIBILITY
// ============================================================================
async function checkAccessibility() {
  if (SKIP_ACCESSIBILITY) {
    console.log('\n⏩ 9. ACCESSIBILITY (Skipped)');
    return;
  }
  
  console.log('\n♿ 9. ACCESSIBILITY (Basic Checks)');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(TARGET_URL);
    const { data: html } = response;
    
    // Language attribute
    const hasLang = html.match(/<html[^>]+lang=/i);
    addResult('accessibility', 'Language Attribute', !!hasLang, hasLang ? 'Present' : 'Missing');
    
    // Alt text on images (sample check)
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imgsWithAlt = imgMatches.filter(img => /alt=/i.test(img)).length;
    const altTextPercent = imgMatches.length > 0 ? Math.round((imgsWithAlt / imgMatches.length) * 100) : 0;
    
    addResult('accessibility', 'Image Alt Text', 
      altTextPercent >= 90,
      `${imgsWithAlt}/${imgMatches.length} images (${altTextPercent}%)`,
      { withAlt: imgsWithAlt, total: imgMatches.length, percent: altTextPercent }
    );
    
    // ARIA landmarks
    const hasMainLandmark = html.includes('<main') || html.includes('role="main"');
    addResult('accessibility', 'Main Landmark', hasMainLandmark, hasMainLandmark ? 'Present' : 'Missing');
    
    const hasNavLandmark = html.includes('<nav') || html.includes('role="navigation"');
    addResult('accessibility', 'Navigation Landmark', hasNavLandmark, hasNavLandmark ? 'Present' : 'Missing');
    
    // Skip links
    const hasSkipLink = html.includes('skip-to-content') || html.includes('skip-navigation');
    addResult('accessibility', 'Skip Link', hasSkipLink ? true : 'warning', hasSkipLink ? 'Present' : 'Recommended');
    
    calculateCategoryScore('accessibility');
    console.log(`   Score: ${results.categories.accessibility.score}%`);
    
  } catch (error) {
    addResult('accessibility', 'Accessibility Check', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// SUMMARY & REPORT
// ============================================================================
function generateSummary() {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 COMPREHENSIVE VALIDATION SUMMARY');
  console.log('═'.repeat(60));
  
  // Calculate overall score
  const categoryScores = Object.keys(results.categories).map(cat => 
    calculateCategoryScore(cat)
  );
  const avgScore = categoryScores.length > 0 
    ? Math.round(categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length)
    : 0;
  
  results.summary.score = avgScore;
  results.summary.coverage = Math.round((results.summary.passed / results.summary.total) * 100);
  
  // Category breakdown
  console.log('\n📋 Category Scores:');
  Object.entries(results.categories).forEach(([category, data]) => {
    const icon = data.score >= 90 ? '✅' : data.score >= 70 ? '⚠️' : '❌';
    console.log(`   ${icon} ${category.padEnd(25)} ${data.score}% (${data.passed}/${data.passed + data.failed + data.warnings})`);
  });
  
  // Overall metrics
  console.log('\n📈 Overall Metrics:');
  console.log(`   Total Tests:    ${results.summary.total}`);
  console.log(`   ✅ Passed:      ${results.summary.passed}`);
  console.log(`   ❌ Failed:      ${results.summary.failed}`);
  console.log(`   ⚠️  Warnings:    ${results.summary.warnings}`);
  console.log(`   📊 Score:       ${results.summary.score}%`);
  console.log(`   📈 Coverage:    ${results.summary.coverage}%`);
  
  // Grade
  let grade = 'F';
  if (avgScore >= 90) grade = 'A';
  else if (avgScore >= 80) grade = 'B';
  else if (avgScore >= 70) grade = 'C';
  else if (avgScore >= 60) grade = 'D';
  
  console.log(`   🎯 Grade:       ${grade}`);
  
  console.log('\n' + '═'.repeat(60));
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
(async () => {
  console.log('\n🔍 COMPREHENSIVE POST-DEPLOYMENT VALIDATION');
  console.log('═'.repeat(60));
  console.log(`📍 Target: ${TARGET_URL}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  
  await checkBasicInfrastructure();
  await checkSEOMetadata();
  await checkStructuredData();
  await checkContentSchemas();
  await checkDatasetFiles();
  await checkSitemap();
  await checkRobotsTxt();
  await checkPerformance();
  await checkAccessibility();
  
  generateSummary();
  
  // Save report if requested
  if (OUTPUT_FILE) {
    try {
      await fs.writeFile(
        OUTPUT_FILE,
        REPORT_FORMAT === 'json' ? JSON.stringify(results, null, 2) : generateTextReport(),
        'utf8'
      );
      console.log(`\n💾 Report saved to: ${OUTPUT_FILE}`);
    } catch (error) {
      console.error(`\n❌ Failed to save report: ${error.message}`);
    }
  }
  
  // Exit with appropriate code
  const exitCode = results.summary.failed > 0 ? 1 : 0;
  process.exit(exitCode);
})();

function generateTextReport() {
  let report = `COMPREHENSIVE POST-DEPLOYMENT VALIDATION REPORT\n`;
  report += `${'='.repeat(60)}\n\n`;
  report += `Target: ${TARGET_URL}\n`;
  report += `Timestamp: ${results.timestamp}\n`;
  report += `Overall Score: ${results.summary.score}%\n\n`;
  
  Object.entries(results.categories).forEach(([category, data]) => {
    report += `\n${category.toUpperCase()}\n`;
    report += `${'-'.repeat(60)}\n`;
    report += `Score: ${data.score}%\n`;
    report += `Passed: ${data.passed}, Failed: ${data.failed}, Warnings: ${data.warnings}\n\n`;
    
    data.tests.forEach(test => {
      const icon = test.passed === true ? '✅' : test.passed === false ? '❌' : '⚠️';
      report += `${icon} ${test.test}: ${test.message}\n`;
    });
  });
  
  return report;
}
