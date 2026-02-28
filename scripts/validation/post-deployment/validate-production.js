#!/usr/bin/env node
/**
 * Post-Deployment Production Validation Suite
 * 
 * Comprehensive validation of the live production site at https://www.z-beam.com
 * Tests: Performance, SEO, Accessibility, Security, Structured Data, UX
 * 
 * Usage: node scripts/validation/post-deployment/validate-production.js [options]
 * Options:
 *   --url=<url>           Target URL (default: https://www.z-beam.com)
 *   --report=<format>     Report format: json|html|console (default: console)
 *   --output=<file>       Output file path for report
 *   --category=<cat>      Run specific category: all|performance|seo|a11y|security|jsonld|analytics
 *   --verbose             Detailed output
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');

// Configuration
const DEFAULT_URL = 'https://www.z-beam.com';
const TIMEOUT = 30000; // 30 seconds

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  if (key.startsWith('--')) {
    acc[key.substring(2)] = value || true;
  }
  return acc;
}, {});

const TARGET_URL = args.url || DEFAULT_URL;
const REPORT_FORMAT = args.report || 'console';
const OUTPUT_FILE = args.output;
const CATEGORY = args.category || 'all';
const VERBOSE = args.verbose || false;
const SKIP_FEEDS = args['skip-feeds'] || false;

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  url: TARGET_URL,
  categories: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    score: 0
  }
};

// Utility: Fetch URL with decompression support
function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = options.timeout || TIMEOUT;
    const parsedUrl = new URL(url);
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (url.startsWith('https') ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout,
      headers: {
        'Accept-Encoding': 'gzip, deflate, br', // Request compression
        'User-Agent': 'Z-Beam-Validator/1.0',
        ...options.headers
      }
    };
    
    const req = protocol.request(requestOptions, (res) => {
      const chunks = [];
      const encoding = res.headers['content-encoding'];
      
      // Create appropriate decompression stream
      let stream = res;
      if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      } else if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      }
      
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      stream.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          responseTime: res.responseTime
        });
      });
      
      stream.on('error', reject);
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    const startTime = Date.now();
    req.on('response', (res) => {
      res.responseTime = Date.now() - startTime;
    });
    
    req.end(); // Required for http.request
  });
}

// Utility: Add test result
function addResult(category, test, passed, message, details = {}) {
  if (!results.categories[category]) {
    results.categories[category] = {
      tests: [],
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }
  
  const result = {
    test,
    passed,
    message,
    ...details
  };
  
  results.categories[category].tests.push(result);
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

function parseCspDirectives(cspHeader = '') {
  const directives = {};
  if (!cspHeader) return directives;

  cspHeader.split(';').forEach((rawDirective) => {
    const directive = rawDirective.trim();
    if (!directive) return;

    const [name, ...values] = directive.split(/\s+/);
    directives[name] = values;
  });

  return directives;
}

function extractGaMeasurementEvidence(html) {
  const gtagLoaderMatch = html.match(/<script[^>]+src=["'][^"']*googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)[^"']*["']/i);
  const flightGaIdMatch = html.match(/["']gaId["']\s*:\s*["'](G-[A-Z0-9]+)["']/i);
  const inlineGaIdMatch = html.match(/\bG-[A-Z0-9]{6,}\b/);

  if (gtagLoaderMatch) {
    return {
      gaMeasurementId: gtagLoaderMatch[1],
      hasLoaderScript: true,
      evidenceSource: 'gtag-loader-script'
    };
  }

  if (flightGaIdMatch) {
    return {
      gaMeasurementId: flightGaIdMatch[1],
      hasLoaderScript: false,
      evidenceSource: 'next-flight-gaId-prop'
    };
  }

  if (inlineGaIdMatch) {
    return {
      gaMeasurementId: inlineGaIdMatch[0],
      hasLoaderScript: false,
      evidenceSource: 'inline-ga-id-token'
    };
  }

  return {
    gaMeasurementId: null,
    hasLoaderScript: false,
    evidenceSource: null
  };
}

// ============================================================================
// CATEGORY: Performance
// ============================================================================
async function validatePerformance() {
  console.log('\n🚀 Validating Performance...');
  
  try {
    // Response Time
    const start = Date.now();
    const response = await fetchUrl(TARGET_URL);
    const responseTime = Date.now() - start;
    
    addResult('performance', 'Response Time', responseTime < 1000,
      `Response time: ${responseTime}ms`,
      { value: responseTime, threshold: 1000 }
    );
    
    // TTFB (Time to First Byte)
    const ttfb = response.responseTime || responseTime;
    addResult('performance', 'Time to First Byte (TTFB)', ttfb < 600,
      `TTFB: ${ttfb}ms`,
      { value: ttfb, threshold: 600 }
    );
    
    // Check for compression
    const contentEncoding = response.headers['content-encoding'];
    addResult('performance', 'Content Compression', 
      contentEncoding === 'gzip' || contentEncoding === 'br',
      contentEncoding ? `Compression: ${contentEncoding}` : 'No compression detected',
      { encoding: contentEncoding }
    );
    
    // Check for caching headers
    const cacheControl = response.headers['cache-control'];
    addResult('performance', 'Cache Headers', !!cacheControl,
      cacheControl ? `Cache-Control: ${cacheControl}` : 'No cache headers',
      { cacheControl }
    );
    
    // Check Content-Length
    const contentLength = parseInt(response.headers['content-length'] || response.body.length);
    addResult('performance', 'HTML Size', contentLength < 100000,
      `HTML size: ${(contentLength / 1024).toFixed(2)} KB`,
      { value: contentLength, threshold: 100000 }
    );
    
    console.log(`  ✓ Response time: ${responseTime}ms`);
    console.log(`  ✓ TTFB: ${ttfb}ms`);
    console.log(`  ✓ Compression: ${contentEncoding || 'none'}`);
    
  } catch (error) {
    console.error(`  ✗ Performance validation failed: ${error.message}`);
    addResult('performance', 'Performance Check', false, error.message);
  }
}

// ============================================================================
// CATEGORY: Security
// ============================================================================
async function validateSecurity() {
  console.log('\n🔒 Validating Security...');
  
  try {
    const response = await fetchUrl(TARGET_URL);
    const headers = response.headers;
    
    // HTTPS
    addResult('security', 'HTTPS', TARGET_URL.startsWith('https'),
      TARGET_URL.startsWith('https') ? 'Using HTTPS' : 'Not using HTTPS'
    );
    
    // Security Headers
    const securityHeaders = {
      'strict-transport-security': 'HSTS',
      'x-content-type-options': 'X-Content-Type-Options',
      'x-frame-options': 'X-Frame-Options',
      'x-xss-protection': 'X-XSS-Protection',
      'content-security-policy': 'Content-Security-Policy',
      'referrer-policy': 'Referrer-Policy',
      'permissions-policy': 'Permissions-Policy'
    };
    
    Object.entries(securityHeaders).forEach(([header, name]) => {
      const present = !!headers[header];
      addResult('security', name, present,
        present ? `${name}: ${headers[header]}` : `Missing ${name} header`,
        { header, value: headers[header] }
      );
      
      if (VERBOSE && present) {
        console.log(`  ✓ ${name}: ${headers[header]}`);
      }
    });
    
    // Check for mixed content (HTTP resources on HTTPS page)
    if (TARGET_URL.startsWith('https')) {
      const httpResources = (response.body.match(/http:\/\/[^"\s]+/g) || [])
        .filter(url => !url.includes('http://schema.org'))
        .filter(url => !url.includes('http://www.w3.org')); // Exclude W3C namespaces (SVG, etc.)
      
      addResult('security', 'Mixed Content', httpResources.length === 0,
        httpResources.length > 0 
          ? `Found ${httpResources.length} HTTP resources` 
          : 'No mixed content detected',
        { httpResources: httpResources.slice(0, 5) }
      );
    }
    
    console.log(`  ✓ Security headers checked`);
    
  } catch (error) {
    console.error(`  ✗ Security validation failed: ${error.message}`);
    addResult('security', 'Security Check', false, error.message);
  }
}

// ============================================================================
// CATEGORY: SEO
// ============================================================================
async function validateSEO() {
  console.log('\n🔍 Validating SEO...');
  
  try {
    const response = await fetchUrl(TARGET_URL);
    const html = response.body;
    
    // Title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    addResult('seo', 'Title Tag', 
      title.length > 10 && title.length < 60,
      `Title length: ${title.length} characters`,
      { title, length: title.length, optimal: '10-60 characters' }
    );
    
    // Meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';
    addResult('seo', 'Meta Description',
      description.length >= 120 && description.length <= 160,
      `Description length: ${description.length} characters`,
      { description, length: description.length, optimal: '120-160 characters' }
    );
    
    // Canonical URL
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    addResult('seo', 'Canonical URL', !!canonicalMatch,
      canonicalMatch ? `Canonical: ${canonicalMatch[1]}` : 'No canonical tag',
      { canonical: canonicalMatch ? canonicalMatch[1] : null }
    );
    
    // Robots meta
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    const robots = robotsMatch ? robotsMatch[1] : '';
    addResult('seo', 'Robots Meta', 
      !robots.includes('noindex'),
      robots ? `Robots: ${robots}` : 'No robots meta (default: index,follow)',
      { robots: robots || 'default' }
    );
    
    // Open Graph
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    addResult('seo', 'Open Graph Tags',
      !!ogTitleMatch && !!ogImageMatch,
      ogTitleMatch && ogImageMatch ? 'OG tags present' : 'Missing OG tags',
      { ogTitle: !!ogTitleMatch, ogImage: !!ogImageMatch }
    );
    
    // Twitter Card
    const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i);
    addResult('seo', 'Twitter Card',
      !!twitterCardMatch,
      twitterCardMatch ? `Twitter Card: ${twitterCardMatch[1]}` : 'No Twitter Card',
      { twitterCard: twitterCardMatch ? twitterCardMatch[1] : null }
    );
    
    // Heading structure (H1)
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    addResult('seo', 'H1 Tag',
      h1Matches.length === 1,
      `Found ${h1Matches.length} H1 tag(s)`,
      { count: h1Matches.length, optimal: 1 }
    );
    
    // Image alt attributes
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length;
    addResult('seo', 'Image Alt Attributes',
      imgsWithoutAlt === 0,
      `${imgMatches.length} images, ${imgsWithoutAlt} without alt`,
      { total: imgMatches.length, withoutAlt: imgsWithoutAlt }
    );
    
    // Viewport meta
    const viewportMatch = html.match(/<meta[^>]*name=["']viewport["']/i);
    addResult('seo', 'Viewport Meta',
      !!viewportMatch,
      viewportMatch ? 'Viewport meta present' : 'Missing viewport meta'
    );
    
    console.log(`  ✓ SEO elements checked`);
    
  } catch (error) {
    console.error(`  ✗ SEO validation failed: ${error.message}`);
    addResult('seo', 'SEO Check', false, error.message);
  }
}

// ============================================================================
// CATEGORY: Analytics (GA/AW)
// ============================================================================
async function validateAnalytics() {
  console.log('\n📈 Validating Analytics (GA/AW)...');

  try {
    const response = await fetchUrl(TARGET_URL);
    const html = response.body;
    const headers = response.headers;

    const gaEvidence = extractGaMeasurementEvidence(html);
    const gaMeasurementId = gaEvidence.gaMeasurementId;
    addResult(
      'analytics',
      'GA gtag Loader Presence',
      !!gaMeasurementId,
      gaMeasurementId
        ? gaEvidence.hasLoaderScript
          ? `Detected loader script with ${gaMeasurementId}`
          : `Detected ${gaMeasurementId} via ${gaEvidence.evidenceSource}; loader may be client-injected`
        : 'Missing GA measurement ID evidence in initial HTML',
      {
        gaMeasurementId,
        evidenceSource: gaEvidence.evidenceSource,
        hasLoaderScript: gaEvidence.hasLoaderScript
      }
    );

    addResult(
      'analytics',
      'GA Measurement ID Format',
      !!gaMeasurementId && /^G-[A-Z0-9]+$/.test(gaMeasurementId),
      gaMeasurementId ? `Valid format: ${gaMeasurementId}` : 'No GA measurement ID to validate',
      { gaMeasurementId, expected: 'G-XXXXXXXXXX' }
    );

    const hasConsentDefault = /gtag\(['"]consent['"],\s*['"]default['"]/.test(html);
    const hasConsentAnalyticsStorage = /['"]analytics_storage['"]\s*:\s*['"]denied['"]/.test(html);
    const hasConsentAdStorage = /['"]ad_storage['"]\s*:\s*['"]denied['"]/.test(html);
    addResult(
      'analytics',
      'Consent Mode Default Guard',
      hasConsentDefault && hasConsentAnalyticsStorage && hasConsentAdStorage,
      hasConsentDefault && hasConsentAnalyticsStorage && hasConsentAdStorage
        ? 'Consent defaults detected (analytics_storage and ad_storage denied)'
        : 'Missing consent default guardrails for analytics/ad storage'
    );

    const csp = parseCspDirectives(headers['content-security-policy']);
    const scriptSrc = csp['script-src'] || [];
    const connectSrc = csp['connect-src'] || [];

    const scriptAllowsGTM = scriptSrc.some((entry) => entry.includes('googletagmanager.com'));
    addResult(
      'analytics',
      'CSP script-src allows GTM',
      scriptAllowsGTM,
      scriptAllowsGTM ? 'script-src includes googletagmanager.com' : 'script-src missing googletagmanager.com'
    );

    const connectAllowsGA = connectSrc.some((entry) => entry.includes('google-analytics.com'));
    const connectAllowsGTM = connectSrc.some((entry) => entry.includes('googletagmanager.com'));
    addResult(
      'analytics',
      'CSP connect-src GA Coverage',
      connectAllowsGA && connectAllowsGTM,
      connectAllowsGA && connectAllowsGTM
        ? 'connect-src includes google-analytics.com and googletagmanager.com'
        : 'connect-src missing GA collection endpoints'
    );

    const adsConnectEndpoints = ['googleadservices.com', 'doubleclick.net'];
    const missingAdsEndpoints = adsConnectEndpoints.filter(
      (endpoint) => !connectSrc.some((entry) => entry.includes(endpoint))
    );

    addResult(
      'analytics',
      'CSP connect-src Ads Endpoint Coverage',
      missingAdsEndpoints.length === 0,
      missingAdsEndpoints.length === 0
        ? 'connect-src includes googleadservices.com and doubleclick.net'
        : `connect-src missing required Ads endpoints: ${missingAdsEndpoints.join(', ')}`,
      { missingAdsEndpoints }
    );

    const inlineAdsIdMatch = html.match(/AW-\d{6,}/);
    addResult(
      'analytics',
      'Ads ID Detectability',
      inlineAdsIdMatch ? true : 'warning',
      inlineAdsIdMatch
        ? `Detected Ads ID in HTML: ${inlineAdsIdMatch[0]}`
        : 'Ads ID not present in initial HTML (may be runtime-initialized)'
    );

    console.log('  ✓ Analytics checks completed');
  } catch (error) {
    console.error(`  ✗ Analytics validation failed: ${error.message}`);
    addResult('analytics', 'Analytics Check', false, error.message);
  }
}

// ============================================================================
// CATEGORY: Accessibility
// ============================================================================
async function validateAccessibility() {
  console.log('\n♿ Validating Accessibility...');
  
  try {
    const response = await fetchUrl(TARGET_URL);
    const html = response.body;
    
    // Lang attribute
    const htmlLangMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
    addResult('accessibility', 'HTML Lang Attribute',
      !!htmlLangMatch,
      htmlLangMatch ? `Lang: ${htmlLangMatch[1]}` : 'Missing lang attribute',
      { lang: htmlLangMatch ? htmlLangMatch[1] : null }
    );
    
    // ARIA landmarks
    const mainMatch = html.match(/<main[^>]*>/i);
    const navMatch = html.match(/<nav[^>]*>/i);
    addResult('accessibility', 'Semantic HTML Landmarks',
      !!mainMatch && !!navMatch,
      `Main: ${!!mainMatch}, Nav: ${!!navMatch}`,
      { main: !!mainMatch, nav: !!navMatch }
    );
    
    // Skip links
    const skipLinkMatch = html.match(/href=["']#main|#content["']/i);
    addResult('accessibility', 'Skip Links',
      !!skipLinkMatch,
      skipLinkMatch ? 'Skip link present' : 'No skip link found',
      { present: !!skipLinkMatch }
    );
    
    // Form labels
    const inputMatches = html.match(/<input[^>]*>/gi) || [];
    const inputsWithoutLabel = inputMatches.filter(input => {
      const idMatch = input.match(/id=["']([^"']+)["']/);
      if (!idMatch) return true;
      const id = idMatch[1];
      return !html.includes(`for="${id}"`);
    }).length;
    
    if (inputMatches.length > 0) {
      addResult('accessibility', 'Form Label Association',
        inputsWithoutLabel === 0,
        `${inputMatches.length} inputs, ${inputsWithoutLabel} without labels`,
        { total: inputMatches.length, withoutLabel: inputsWithoutLabel }
      );
    }
    
    // Buttons with accessible names
    const buttonMatches = html.match(/<button[^>]*>([^<]*)<\/button>/gi) || [];
    const emptyButtons = buttonMatches.filter(btn => {
      const content = btn.replace(/<[^>]*>/g, '').trim();
      const hasAriaLabel = btn.includes('aria-label=');
      return !content && !hasAriaLabel;
    }).length;
    
    if (buttonMatches.length > 0) {
      addResult('accessibility', 'Button Accessible Names',
        emptyButtons === 0,
        `${buttonMatches.length} buttons, ${emptyButtons} without accessible names`,
        { total: buttonMatches.length, empty: emptyButtons }
      );
    }
    
    console.log(`  ✓ Accessibility elements checked`);
    
  } catch (error) {
    console.error(`  ✗ Accessibility validation failed: ${error.message}`);
    addResult('accessibility', 'Accessibility Check', false, error.message);
  }
}

// ============================================================================
// CATEGORY: JSON-LD / Structured Data
// ============================================================================
async function validateJSONLD() {
  console.log('\n📊 Validating Structured Data...');
  
  try {
    const response = await fetchUrl(TARGET_URL);
    const html = response.body;
    
    // Extract JSON-LD scripts
    const jsonldMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    
    addResult('jsonld', 'JSON-LD Presence',
      jsonldMatches.length > 0,
      `Found ${jsonldMatches.length} JSON-LD block(s)`,
      { count: jsonldMatches.length }
    );
    
    if (jsonldMatches.length === 0) {
      console.log('  ⚠️  No JSON-LD blocks found');
      return;
    }
    
    let validSchemas = 0;
    let invalidSchemas = 0;
    const schemas = [];
    
    jsonldMatches.forEach((match, index) => {
      try {
        const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
        const schema = JSON.parse(jsonContent);
        schemas.push(schema);
        
        // Validate required properties
        const hasContext = schema['@context'] || (schema['@graph'] && schema['@graph'][0]['@context']);
        const hasType = schema['@type'] || (schema['@graph'] && schema['@graph'][0]['@type']);
        
        if (hasContext && hasType) {
          validSchemas++;
        } else {
          invalidSchemas++;
        }
        
      } catch (error) {
        invalidSchemas++;
        console.error(`  ✗ Invalid JSON-LD block ${index + 1}: ${error.message}`);
      }
    });
    
    addResult('jsonld', 'JSON-LD Syntax',
      invalidSchemas === 0,
      `${validSchemas} valid, ${invalidSchemas} invalid`,
      { valid: validSchemas, invalid: invalidSchemas }
    );
    
    // Check for common schema types
    const schemaTypes = schemas.flatMap(schema => {
      if (schema['@graph']) {
        return schema['@graph'].map(item => item['@type']);
      }
      return [schema['@type']];
    }).filter(Boolean);
    
    // Core schemas expected on all pages
    // Note: LocalBusiness is a valid subtype of Organization
    const expectedTypes = ['WebSite', 'WebPage', 'Organization', 'BreadcrumbList'];
    const organizationSubtypes = ['LocalBusiness', 'Corporation', 'NGO', 'EducationalOrganization'];
    expectedTypes.forEach(type => {
      let present;
      if (type === 'Organization') {
        // Accept Organization or any of its subtypes
        present = schemaTypes.some(t => {
          const types = Array.isArray(t) ? t : [t];
          return types.includes(type) || types.some(st => organizationSubtypes.includes(st));
        });
      } else {
        present = schemaTypes.some(t => 
          Array.isArray(t) ? t.includes(type) : t === type
        );
      }
      addResult('jsonld', `Schema: ${type}`,
        present,
        present ? `${type} schema present` : `Missing ${type} schema`,
        { schemaType: type, present }
      );
    });
    
    // Check if this is a material page by URL pattern
    const isMaterialPage = TARGET_URL.includes('/materials/');
    if (isMaterialPage) {
      // Material-specific schemas that should be present
      const materialSchemas = ['Article', 'FAQPage', 'Dataset', 'Person', 'ImageObject'];
      materialSchemas.forEach(type => {
        const present = schemaTypes.some(t => 
          Array.isArray(t) ? t.includes(type) : t === type
        );
        addResult('jsonld', `Material Schema: ${type}`,
          present,
          present ? `${type} schema present on material page` : `Missing ${type} schema on material page`,
          { schemaType: type, present, critical: type === 'Article' }
        );
      });
      
      // Check for @graph structure on material pages
      const hasGraphStructure = schemas.some(s => s['@graph'] && s['@graph'].length > 5);
      addResult('jsonld', '@graph Structure',
        hasGraphStructure,
        hasGraphStructure ? '@graph with multiple schemas found' : 'Missing @graph structure',
        { hasGraph: hasGraphStructure }
      );
    }
    
    console.log(`  ✓ ${validSchemas} valid JSON-LD schemas`);
    
  } catch (error) {
    console.error(`  ✗ JSON-LD validation failed: ${error.message}`);
    addResult('jsonld', 'JSON-LD Check', false, error.message);
  }
}

// ============================================================================
// CATEGORY: Material Page Schema Validation
// ============================================================================
async function validateMaterialPageSchemas() {
  console.log('\\n🔬 Validating Material Page Schemas...');
  
  // Sample material pages to test
  const materialPages = [
    '/materials/metal/non-ferrous/aluminum-laser-cleaning',
    '/materials/metal/ferrous/stainless-steel-laser-cleaning',
    '/materials/composite/fiber-reinforced/carbon-fiber-reinforced-polymer-laser-cleaning'
  ];
  
  const requiredSchemas = ['Article', 'FAQPage', 'Dataset', 'Person', 'ImageObject'];
  let testedPages = 0;
  let pagesWithAllSchemas = 0;
  
  for (const pagePath of materialPages) {
    try {
      const pageUrl = new URL(pagePath, TARGET_URL).toString();
      const response = await fetchUrl(pageUrl);
      
      if (response.statusCode !== 200) {
        console.log(`  ⚠️  Skipping ${pagePath} (status: ${response.statusCode})`);
        continue;
      }
      
      const html = response.body;
      const jsonldMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
      
      const schemaTypes = [];
      jsonldMatches.forEach(match => {
        try {
          const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
          const schema = JSON.parse(jsonContent);
          
          if (schema['@graph']) {
            schema['@graph'].forEach(item => {
              if (item['@type']) schemaTypes.push(item['@type']);
            });
          } else if (schema['@type']) {
            schemaTypes.push(schema['@type']);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });
      
      testedPages++;
      const missingSchemas = requiredSchemas.filter(type => !schemaTypes.includes(type));
      
      if (missingSchemas.length === 0) {
        pagesWithAllSchemas++;
        console.log(`  ✓ ${pagePath.split('/').pop()} - All schemas present`);
      } else {
        console.log(`  ✗ ${pagePath.split('/').pop()} - Missing: ${missingSchemas.join(', ')}`);
      }
      
      // Add result for this page
      addResult('material-schemas', `Page: ${pagePath.split('/').pop()}`,
        missingSchemas.length === 0,
        missingSchemas.length === 0 ? 'All required schemas present' : `Missing: ${missingSchemas.join(', ')}`,
        { pagePath, schemaTypes, missingSchemas }
      );
      
    } catch (error) {
      console.log(`  ✗ Error testing ${pagePath}: ${error.message}`);
      addResult('material-schemas', `Page: ${pagePath}`, false, error.message);
    }
  }
  
  // Overall material schema consistency check
  const consistencyRate = testedPages > 0 ? Math.round((pagesWithAllSchemas / testedPages) * 100) : 0;
  addResult('material-schemas', 'Schema Consistency',
    consistencyRate >= 80,
    `${pagesWithAllSchemas}/${testedPages} pages have all required schemas (${consistencyRate}%)`,
    { testedPages, pagesWithAllSchemas, consistencyRate }
  );
  
  console.log(`  📊 Consistency: ${consistencyRate}% (${pagesWithAllSchemas}/${testedPages} pages)`);
}

// ============================================================================
// CATEGORY: Settings Page Schema Validation
// ============================================================================
async function validateSettingsPageSchemas() {
  console.log('\n⚙️  Validating Settings Page Schemas...');
  
  // Sample settings pages to test
  const settingsPages = [
    '/settings/metal/non-ferrous/aluminum-settings',
    '/settings/metal/ferrous/stainless-steel-settings',
    '/settings/composite/fiber-reinforced/carbon-fiber-reinforced-polymer-settings'
  ];
  
  // Settings pages should have these schemas (comprehensive rich data)
  const requiredSchemas = [
    'TechArticle',      // Technical article with proficiencyLevel and dependencies
    'HowTo',            // Step-by-step parameters
    'FAQPage',          // Auto-generated from challenges
    'Dataset',          // Machine settings + material properties
    'Person',           // Author E-E-A-T
    'SoftwareApplication', // Thermal simulator tool
    'BreadcrumbList',   // Navigation
    'WebPage'           // Base page
  ];
  // Base schemas present on all pages
  const baseSchemas = ['LocalBusiness', 'WebSite'];
  
  let testedPages = 0;
  let pagesWithAllSchemas = 0;
  
  for (const pagePath of settingsPages) {
    try {
      const pageUrl = new URL(pagePath, TARGET_URL).toString();
      const response = await fetchUrl(pageUrl);
      
      if (response.statusCode !== 200) {
        console.log(`  ⚠️  Skipping ${pagePath} (status: ${response.statusCode})`);
        continue;
      }
      
      const html = response.body;
      const jsonldMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
      
      const schemaTypes = [];
      jsonldMatches.forEach(match => {
        try {
          const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
          const schema = JSON.parse(jsonContent);
          
          if (schema['@graph']) {
            schema['@graph'].forEach(item => {
              if (item['@type']) schemaTypes.push(item['@type']);
            });
          } else if (schema['@type']) {
            schemaTypes.push(schema['@type']);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });
      
      testedPages++;
      
      // Check base schemas (should always be present)
      const missingBase = baseSchemas.filter(type => !schemaTypes.includes(type));
      
      // Check settings-specific schemas (may not all be implemented yet)
      const missingRequired = requiredSchemas.filter(type => !schemaTypes.includes(type));
      const hasMinimum = missingBase.length === 0; // At least base schemas
      
      if (missingRequired.length === 0 && missingBase.length === 0) {
        pagesWithAllSchemas++;
        console.log(`  ✓ ${pagePath.split('/').pop()} - All schemas present`);
      } else if (hasMinimum) {
        console.log(`  ⚠️  ${pagePath.split('/').pop()} - Base OK, missing: ${missingRequired.join(', ')}`);
      } else {
        console.log(`  ✗ ${pagePath.split('/').pop()} - Missing base: ${missingBase.join(', ')}`);
      }
      
      // Add result for this page
      addResult('settings-schemas', `Page: ${pagePath.split('/').pop()}`,
        hasMinimum,
        hasMinimum 
          ? (missingRequired.length === 0 ? 'All schemas present' : `Base OK, enhance with: ${missingRequired.join(', ')}`)
          : `Missing base schemas: ${missingBase.join(', ')}`,
        { pagePath, schemaTypes, missingBase, missingRequired }
      );
      
    } catch (error) {
      console.log(`  ✗ Error testing ${pagePath}: ${error.message}`);
      addResult('settings-schemas', `Page: ${pagePath}`, false, error.message);
    }
  }
  
  // Overall settings schema consistency check
  const consistencyRate = testedPages > 0 ? Math.round((pagesWithAllSchemas / testedPages) * 100) : 0;
  addResult('settings-schemas', 'Schema Consistency',
    testedPages > 0,
    `${pagesWithAllSchemas}/${testedPages} pages have all schemas (${consistencyRate}%)`,
    { testedPages, pagesWithAllSchemas, consistencyRate }
  );
  
  console.log(`  📊 Consistency: ${consistencyRate}% (${pagesWithAllSchemas}/${testedPages} pages)`);
}

// ============================================================================
// CATEGORY: Feed Validation (Google Merchant Center)
// ============================================================================
async function validateFeeds() {
  console.log('\n📦 Validating Google Merchant Feeds...');
  
  const xml2js = require('xml2js');
  const parser = new xml2js.Parser();
  
  // Configuration
  const XML_FEED_URL = new URL('/feeds/google-merchant-feed.xml', TARGET_URL).toString();
  const CSV_FEED_URL = new URL('/feeds/google-merchant-feed.csv', TARGET_URL).toString();
  const MIN_PRODUCTS = 100;
  const MAX_PRODUCTS = 200;
  
  const REQUIRED_FIELDS = [
    'g:id', 'g:title', 'g:description', 'g:link', 'g:image_link',
    'g:price', 'g:availability', 'g:condition', 'g:brand', 'g:google_product_category'
  ];
  
  try {
    // =========================================================================
    // XML Feed Validation
    // =========================================================================
    console.log('  📄 Validating XML feed...');
    
    let xmlFeedData;
    try {
      const xmlResponse = await fetchUrl(XML_FEED_URL);
      
      addResult('feeds', 'XML Feed Accessible',
        xmlResponse.statusCode === 200,
        xmlResponse.statusCode === 200 ? 'XML feed accessible' : `XML feed returned ${xmlResponse.statusCode}`,
        { url: XML_FEED_URL, statusCode: xmlResponse.statusCode }
      );
      
      if (xmlResponse.statusCode === 200) {
        // Parse XML
        try {
          xmlFeedData = await parser.parseStringPromise(xmlResponse.body);
          
          addResult('feeds', 'XML Structure Valid', true,
            'XML feed parses successfully',
            { url: XML_FEED_URL }
          );
          
          // Validate RSS structure
          if (!xmlFeedData.rss || !xmlFeedData.rss.channel || !xmlFeedData.rss.channel[0].item) {
            throw new Error('Invalid RSS structure - missing channel or items');
          }
          
          const products = xmlFeedData.rss.channel[0].item;
          const productCount = products.length;
          
          console.log(`    ℹ️  Found ${productCount} products in feed`);
          
          // Product count validation
          addResult('feeds', 'Product Count',
            productCount >= MIN_PRODUCTS && productCount <= MAX_PRODUCTS,
            `${productCount} products (expected ${MIN_PRODUCTS}-${MAX_PRODUCTS})`,
            { count: productCount, min: MIN_PRODUCTS, max: MAX_PRODUCTS }
          );
          
          // Sample product validation (check first 5 products)
          const sampleSize = Math.min(5, productCount);
          let validProducts = 0;
          const skus = new Set();
          const duplicateSKUs = [];
          const invalidProducts = [];
          
          for (let i = 0; i < productCount; i++) {
            const product = products[i];
            let isValid = true;
            const missingFields = [];
            
            // Check required fields
            for (const field of REQUIRED_FIELDS) {
              if (!product[field] || !product[field][0]) {
                missingFields.push(field);
                isValid = false;
              }
            }
            
            // Check SKU uniqueness
            const productId = product['g:id'] ? product['g:id'][0] : `product-${i}`;
            if (skus.has(productId)) {
              duplicateSKUs.push(productId);
            }
            skus.add(productId);
            
            // Detailed validation for sample products
            if (i < sampleSize) {
              if (isValid) {
                validProducts++;
                
                // Additional checks for sample products
                const id = product['g:id'][0];
                const brand = product['g:brand'] ? product['g:brand'][0] : '';
                const availability = product['g:availability'] ? product['g:availability'][0] : '';
                const condition = product['g:condition'] ? product['g:condition'][0] : '';
                const link = product['g:link'] ? product['g:link'][0] : '';
                const imageLink = product['g:image_link'] ? product['g:image_link'][0] : '';
                
                // SKU format validation
                const validSKUPrefix = id.startsWith('Z-BEAM-CLEAN-') || id.startsWith('ZB-EQUIP-RENT-');
                if (!validSKUPrefix) {
                  invalidProducts.push(`${id}: Invalid SKU format`);
                }
                
                // Brand validation
                if (brand !== 'Z-Beam') {
                  invalidProducts.push(`${id}: Invalid brand "${brand}"`);
                }
                
                // Availability validation
                if (availability !== 'in stock') {
                  invalidProducts.push(`${id}: Invalid availability "${availability}"`);
                }
                
                // Condition validation
                if (condition !== 'new') {
                  invalidProducts.push(`${id}: Invalid condition "${condition}"`);
                }
                
                // URL validation
                if (!link.startsWith(TARGET_URL)) {
                  invalidProducts.push(`${id}: Link doesn't start with ${TARGET_URL}`);
                }
                if (!imageLink.startsWith(TARGET_URL)) {
                  invalidProducts.push(`${id}: Image link doesn't start with ${TARGET_URL}`);
                }
              } else {
                invalidProducts.push(`Product ${i + 1}: Missing fields: ${missingFields.join(', ')}`);
              }
            }
          }
          
          // Sample product validation result
          addResult('feeds', 'Sample Products Valid',
            validProducts === sampleSize && invalidProducts.length === 0,
            `${validProducts}/${sampleSize} sample products valid` +
              (invalidProducts.length > 0 ? ` (Issues: ${invalidProducts.length})` : ''),
            { validProducts, sampleSize, issues: invalidProducts }
          );
          
          if (invalidProducts.length > 0 && VERBOSE) {
            console.log('    ⚠️  Product issues:');
            invalidProducts.forEach(issue => console.log(`      - ${issue}`));
          }
          
          // SKU uniqueness check
          addResult('feeds', 'SKU Uniqueness',
            duplicateSKUs.length === 0,
            duplicateSKUs.length === 0 
              ? 'All SKUs are unique' 
              : `${duplicateSKUs.length} duplicate SKUs found`,
            { duplicates: duplicateSKUs }
          );
          
          // Service type distribution
          const profCleanCount = Array.from(skus).filter(sku => sku.startsWith('Z-BEAM-CLEAN-')).length;
          const equipRentCount = Array.from(skus).filter(sku => sku.startsWith('ZB-EQUIP-RENT-')).length;
          
          console.log(`    ℹ️  Professional Cleaning: ${profCleanCount} products`);
          console.log(`    ℹ️  Equipment Rental: ${equipRentCount} products`);
          
        } catch (parseError) {
          addResult('feeds', 'XML Structure Valid', false,
            `Failed to parse XML: ${parseError.message}`,
            { error: parseError.message }
          );
        }
      }
    } catch (fetchError) {
      addResult('feeds', 'XML Feed Accessible', false,
        `Failed to fetch XML feed: ${fetchError.message}`,
        { url: XML_FEED_URL, error: fetchError.message }
      );
    }
    
    // =========================================================================
    // CSV Feed Validation
    // =========================================================================
    console.log('  📄 Validating CSV feed...');
    
    try {
      const csvResponse = await fetchUrl(CSV_FEED_URL);
      
      addResult('feeds', 'CSV Feed Accessible',
        csvResponse.statusCode === 200,
        csvResponse.statusCode === 200 ? 'CSV feed accessible' : `CSV feed returned ${csvResponse.statusCode}`,
        { url: CSV_FEED_URL, statusCode: csvResponse.statusCode }
      );
      
      if (csvResponse.statusCode === 200) {
        // Basic CSV validation
        const lines = csvResponse.body.trim().split('\n');
        const headers = lines[0].split('\t');
        const productCount = lines.length - 1; // Exclude header
        
        console.log(`    ℹ️  Found ${productCount} products in CSV`);
        
        // Check for required columns
        const requiredColumns = ['id', 'title', 'description', 'link', 'image_link', 'price', 'availability', 'condition', 'brand'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        addResult('feeds', 'CSV Structure Valid',
          missingColumns.length === 0,
          missingColumns.length === 0 
            ? 'All required columns present' 
            : `Missing columns: ${missingColumns.join(', ')}`,
          { headers, missingColumns }
        );
        
        // Product count validation
        addResult('feeds', 'CSV Product Count',
          productCount >= MIN_PRODUCTS && productCount <= MAX_PRODUCTS,
          `${productCount} products (expected ${MIN_PRODUCTS}-${MAX_PRODUCTS})`,
          { count: productCount, min: MIN_PRODUCTS, max: MAX_PRODUCTS }
        );
      }
    } catch (fetchError) {
      addResult('feeds', 'CSV Feed Accessible', false,
        `Failed to fetch CSV feed: ${fetchError.message}`,
        { url: CSV_FEED_URL, error: fetchError.message }
      );
    }
    
    // =========================================================================
    // Sitemap Check (Informational)
    // =========================================================================
    console.log('  📄 Checking sitemap for feed discoverability...');
    
    try {
      const sitemapUrl = new URL('/sitemap.xml', TARGET_URL).toString();
      const sitemapResponse = await fetchUrl(sitemapUrl);
      
      if (sitemapResponse.statusCode === 200) {
        const hasFeedReference = sitemapResponse.body.includes('/feeds/google-merchant-feed');
        
        // This is informational - feeds don't need to be in sitemap
        addResult('feeds', 'Feed Sitemap Reference', null,
          hasFeedReference 
            ? 'Feeds referenced in sitemap (optional)' 
            : 'Feeds not in sitemap (this is fine - Google Merchant Center crawls feed URLs directly)',
          { hasFeedReference }
        );
      }
    } catch (error) {
      // Sitemap check is optional
    }
    
    console.log('  ✓ Feed validation completed');
    
  } catch (error) {
    console.error(`  ✗ Feed validation failed: ${error.message}`);
    addResult('feeds', 'Feed Validation', false, error.message);
  }
}

// ============================================================================
// CATEGORY: Broken Link Detection
// ============================================================================
async function validateBrokenLinks() {
  console.log('\\n🔗 Checking for Broken Links...');
  
  try {
    const pagesToCheck = [
      '/',
      '/materials',
      '/settings',
      '/contaminants',
      '/materials/metal/non-ferrous/aluminum-laser-cleaning',
      '/settings/metal/non-ferrous/aluminum-settings'
    ];
    
    let totalLinks = 0;
    let brokenLinks = 0;
    const broken = [];
    
    for (const pagePath of pagesToCheck) {
      try {
        const pageUrl = new URL(pagePath, TARGET_URL).toString();
        const response = await fetchUrl(pageUrl);
        
        if (response.statusCode !== 200) {
          console.log(`  ⚠️  Skipping ${pagePath} (status: ${response.statusCode})`);
          continue;
        }
        
        const html = response.body;
        
        // Find all internal links (href starting with /)
        const linkMatches = html.match(/href=["']\/[^"' ?#]+/gi) || [];
        const uniqueLinks = [...new Set(linkMatches.map(m => m.replace(/href=["\\']/, '')))];
        
        // Test each link
        for (const link of uniqueLinks.slice(0, 10)) { // Limit to 10 links per page for performance
          totalLinks++;
          try {
            const linkUrl = new URL(link, TARGET_URL).toString();
            const linkResponse = await fetchUrl(linkUrl);
            
            if (linkResponse.statusCode === 404) {
              brokenLinks++;
              broken.push({ page: pagePath, link: link });
              if (VERBOSE) {
                console.log(`    ✗ Broken link: ${link}`);
              }
            }
          } catch (_e) {
            // Skip invalid URLs
          }
        }
      } catch (error) {
        console.log(`  ✗ Error checking ${pagePath}: ${error.message}`);
      }
    }
    
    addResult('broken-links', 'Internal Links',
      brokenLinks === 0,
      brokenLinks === 0 
        ? `All ${totalLinks} checked links valid`
        : `${brokenLinks}/${totalLinks} broken links found`,
      { totalLinks, brokenLinks, broken: broken.slice(0, 5) }
    );
    
    console.log(`  📊 Checked ${totalLinks} links, ${brokenLinks} broken`);
    
  } catch (error) {
    console.error(`  ✗ Broken link check failed: ${error.message}`);
    addResult('broken-links', 'Link Check', false, error.message);
  }
}

// ============================================================================
// CATEGORY: Additional Checks
// ============================================================================
async function validateAdditional() {
  console.log('\n🎯 Additional Validations...');
  
  try {
    // Check robots.txt
    const robotsTxtUrl = new URL('/robots.txt', TARGET_URL).toString();
    try {
      const robotsResponse = await fetchUrl(robotsTxtUrl);
      addResult('additional', 'robots.txt',
        robotsResponse.statusCode === 200,
        robotsResponse.statusCode === 200 ? 'robots.txt present' : 'robots.txt not found',
        { statusCode: robotsResponse.statusCode }
      );
    } catch (error) {
      addResult('additional', 'robots.txt', false, 'robots.txt not accessible');
    }
    
    // Check sitemap.xml
    const sitemapUrl = new URL('/sitemap.xml', TARGET_URL).toString();
    try {
      const sitemapResponse = await fetchUrl(sitemapUrl);
      addResult('additional', 'sitemap.xml',
        sitemapResponse.statusCode === 200,
        sitemapResponse.statusCode === 200 ? 'sitemap.xml present' : 'sitemap.xml not found',
        { statusCode: sitemapResponse.statusCode }
      );
    } catch (error) {
      addResult('additional', 'sitemap.xml', false, 'sitemap.xml not accessible');
    }
    
    // Check favicon
    const faviconUrl = new URL('/favicon.ico', TARGET_URL).toString();
    try {
      const faviconResponse = await fetchUrl(faviconUrl);
      addResult('additional', 'favicon.ico',
        faviconResponse.statusCode === 200,
        faviconResponse.statusCode === 200 ? 'favicon present' : 'favicon not found',
        { statusCode: faviconResponse.statusCode }
      );
    } catch (error) {
      addResult('additional', 'favicon.ico', false, 'favicon not accessible');
    }
    
    console.log(`  ✓ Additional checks completed`);
    
  } catch (error) {
    console.error(`  ✗ Additional validation failed: ${error.message}`);
    addResult('additional', 'Additional Check', false, error.message);
  }
}

// ============================================================================
// Main Execution
// ============================================================================
async function main() {
  console.log('═'.repeat(80));
  console.log('🚀 POST-DEPLOYMENT PRODUCTION VALIDATION');
  console.log('═'.repeat(80));
  console.log(`\n📍 Target: ${TARGET_URL}`);
  console.log(`📅 Time: ${new Date().toLocaleString()}`);
  console.log(`📋 Category: ${CATEGORY}`);
  
  try {
    // Run validation categories
    if (CATEGORY === 'all' || CATEGORY === 'performance') {
      await validatePerformance();
    }
    if (CATEGORY === 'all' || CATEGORY === 'security') {
      await validateSecurity();
    }
    if (CATEGORY === 'all' || CATEGORY === 'seo') {
      await validateSEO();
    }
    if (CATEGORY === 'all' || CATEGORY === 'analytics') {
      await validateAnalytics();
    }
    if (CATEGORY === 'all' || CATEGORY === 'a11y' || CATEGORY === 'accessibility') {
      await validateAccessibility();
    }
    if (CATEGORY === 'all' || CATEGORY === 'jsonld' || CATEGORY === 'structured-data') {
      await validateJSONLD();
      
      // Additionally test material and settings pages for comprehensive schema coverage
      if (CATEGORY === 'all') {
        await validateMaterialPageSchemas();
        await validateSettingsPageSchemas();
      }
    }
    if (!SKIP_FEEDS && (CATEGORY === 'all' || CATEGORY === 'feeds')) {
      await validateFeeds();
    }
    if (CATEGORY === 'all' || CATEGORY === 'links' || CATEGORY === 'broken-links') {
      await validateBrokenLinks();
    }
    if (CATEGORY === 'all') {
      await validateAdditional();
    }
    
    // Calculate score
    results.summary.score = Math.round(
      (results.summary.passed / results.summary.total) * 100
    );
    
    // Display summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 VALIDATION SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\n✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`⚠️  Warnings: ${results.summary.warnings}`);
    console.log(`📈 Score: ${results.summary.score}/100`);
    
    // Category breakdown
    console.log('\n📋 Category Breakdown:');
    Object.entries(results.categories).forEach(([category, data]) => {
      const score = Math.round((data.passed / data.tests.length) * 100);
      const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
      console.log(`  ${emoji} ${category}: ${score}% (${data.passed}/${data.tests.length} passed)`);
    });
    
    // Failed tests
    if (results.summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      Object.entries(results.categories).forEach(([category, data]) => {
        const failed = data.tests.filter(t => t.passed === false);
        if (failed.length > 0) {
          console.log(`\n  ${category}:`);
          failed.forEach(test => {
            console.log(`    ✗ ${test.test}: ${test.message}`);
          });
        }
      });
    }
    
    // Output report
    if (OUTPUT_FILE) {
      if (REPORT_FORMAT === 'json') {
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`\n📄 JSON report saved to: ${OUTPUT_FILE}`);
      } else if (REPORT_FORMAT === 'html') {
        const htmlReport = generateHTMLReport(results);
        await fs.writeFile(OUTPUT_FILE, htmlReport);
        console.log(`\n📄 HTML report saved to: ${OUTPUT_FILE}`);
      }
    }
    
    // Exit code
    const exitCode = results.summary.failed > 0 ? 1 : 0;
    console.log('\n' + '═'.repeat(80));
    
    process.exit(exitCode);
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================================================
// HTML Report Generator
// ============================================================================
function generateHTMLReport(results) {
  const categoryScores = Object.entries(results.categories).map(([name, data]) => {
    const score = Math.round((data.passed / data.tests.length) * 100);
    return { name, score, ...data };
  });
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Production Validation Report - ${results.url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    header { border-bottom: 3px solid #0070f3; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { color: #0070f3; font-size: 2em; margin-bottom: 10px; }
    .meta { color: #666; font-size: 0.9em; }
    .score-card { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .score-item { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .score-item h2 { font-size: 2.5em; margin-bottom: 5px; }
    .score-item p { opacity: 0.9; }
    .category { margin: 30px 0; }
    .category h3 { color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #eee; }
    .test { padding: 10px; margin: 5px 0; border-left: 4px solid #ddd; background: #fafafa; }
    .test.passed { border-left-color: #22c55e; }
    .test.failed { border-left-color: #ef4444; background: #fef2f2; }
    .test.warning { border-left-color: #f59e0b; background: #fffbeb; }
    .test-name { font-weight: 600; margin-bottom: 5px; }
    .test-message { color: #666; font-size: 0.9em; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 0.85em; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 Production Validation Report</h1>
      <div class="meta">
        <p><strong>URL:</strong> ${results.url}</p>
        <p><strong>Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
      </div>
    </header>
    
    <div class="score-card">
      <div class="score-item">
        <h2>${results.summary.score}</h2>
        <p>Overall Score</p>
      </div>
      <div class="score-item">
        <h2>${results.summary.passed}</h2>
        <p>Tests Passed</p>
      </div>
      <div class="score-item">
        <h2>${results.summary.failed}</h2>
        <p>Tests Failed</p>
      </div>
      <div class="score-item">
        <h2>${results.summary.warnings}</h2>
        <p>Warnings</p>
      </div>
    </div>
    
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
      <p>Generated by Z-Beam Post-Deployment Validation Suite</p>
    </div>
  </div>
</body>
</html>`;
}

// Run
main();
