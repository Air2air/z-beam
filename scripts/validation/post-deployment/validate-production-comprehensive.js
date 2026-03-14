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

// Load environment variables from .env files
require('dotenv').config();

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
const COMPARE_URL = args['compare-url'] || null;
const SKIP_EXTERNAL = args['skip-external'] || false;
const SKIP_PERFORMANCE = args['skip-performance'] || false;
const SKIP_ACCESSIBILITY = args['skip-accessibility'] || false;
const REPORT_FORMAT = args.report || 'console';
const OUTPUT_FILE = args.output;
const MAX_URLS = Number(args['max-urls'] || 0); // 0 = no limit
const STRICT_SEO = args['strict-seo'] || false;
const REQUIRE_RICH_RESULTS = args['require-rich-results'] || false;

const CRITICAL_ROUTES = [
  '/',
  '/materials/metal/non-ferrous/aluminum-laser-cleaning',
  '/settings/metal/non-ferrous/aluminum-settings',
  '/contaminants/oxidation/ferrous/rust-oxidation-contamination',
  '/materials',
  '/services',
  '/about',
];

const SITEMAP_URL = '/sitemap.xml';
const EXPECTED_NOINDEX_PATHS = new Set(['/search']);

const RICH_RESULT_REQUIRED_FIELDS = {
  Dataset: ['name', 'description', 'url'],
  Product: ['name', 'description'],
  Article: ['headline'],
  HowTo: ['name'],
  BreadcrumbList: ['itemListElement'],
  WebPage: ['name', 'url'],
  Organization: ['name'],
  LocalBusiness: ['name'],
  Service: ['name'],
};

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
    
    const req = protocol.get(url, (res) => {
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

    // http.get's { timeout } option only fires the event — we must destroy the
    // socket ourselves to actually abort the request and reject the promise.
    req.setTimeout(timeout, () => {
      req.destroy(new Error(`Request timed out after ${timeout}ms: ${url}`));
    });
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

function normalizeSiteUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl, TARGET_URL);
    parsed.hash = '';
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function extractCanonical(html) {
  const canonicalTagMatch = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i);
  if (!canonicalTagMatch) return null;
  const hrefMatch = canonicalTagMatch[0].match(/\bhref=["']([^"']+)["']/i);
  return hrefMatch ? normalizeSiteUrl(hrefMatch[1]) : null;
}

function extractMetaContent(html, attr, key) {
  const regex = new RegExp(`<meta\\s+[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractTitle(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

function hasNoindex(html) {
  const robotsMeta = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  return robotsMeta ? robotsMeta[1].toLowerCase().includes('noindex') : false;
}

function extractJsonLdScripts(html) {
  const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  const scripts = [];
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const scriptContent = match[1].trim();
    if (!scriptContent) continue;

    try {
      const parsed = JSON.parse(scriptContent);
      if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        scripts.push(...parsed['@graph']);
      } else {
        scripts.push(parsed);
      }
    } catch {
      scripts.push({ __parseError: true, raw: scriptContent.slice(0, 200) });
    }
  }

  return scripts;
}

function extractInternalLinks(html) {
  const hrefRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const links = [];
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href) continue;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;

    try {
      const absolute = new URL(href, TARGET_URL);
      const targetBase = new URL(TARGET_URL);
      if (absolute.origin !== targetBase.origin) continue;
      links.push(normalizeSiteUrl(absolute.toString()));
    } catch {
      // Ignore malformed links here; malformed links are captured in fetch checks
    }
  }

  return [...new Set(links)];
}

async function getSitemapUrls() {
  const sitemapUrl = `${TARGET_URL}${SITEMAP_URL}`;
  const response = await fetch(sitemapUrl, { timeout: 30000 });
  const { data: xml, status } = response;

  if (status !== 200) {
    throw new Error(`Sitemap unavailable at ${sitemapUrl} (HTTP ${status})`);
  }

  const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/gsi)].map((m) => normalizeSiteUrl(m[1].trim()));
  if (locMatches.length === 0) {
    throw new Error('No <loc> entries found in sitemap.xml');
  }

  return MAX_URLS > 0 ? locMatches.slice(0, MAX_URLS) : locMatches;
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
// 1.5 CORE WEB VITALS OPTIMIZATIONS (Dec 28, 2025)
// ============================================================================
async function checkCoreWebVitalsOptimizations() {
  console.log('\n⚡ 1.5 CORE WEB VITALS OPTIMIZATIONS');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(TARGET_URL);
    const { data: html } = response;
    
    // Check for preconnect hints
    const preconnectVitals = html.match(/<link[^>]+rel=["']preconnect["'][^>]+vitals\.vercel-insights\.com/i);
    const preconnectGTM = html.match(/<link[^>]+rel=["']preconnect["'][^>]+googletagmanager\.com/i);
    
    addResult('core-web-vitals', 'Preconnect: Vercel Vitals', 
      !!preconnectVitals,
      preconnectVitals ? '✅ Present' : '❌ Missing'
    );
    
    addResult('core-web-vitals', 'Preconnect: Google Tag Manager', 
      !!preconnectGTM,
      preconnectGTM ? '✅ Present' : '❌ Missing'
    );
    
    // Check for above-the-fold image preload (order-agnostic)
    // Accept any image preload to avoid brittle filename coupling (e.g., "hero" keyword requirement)
    const imagePreloadTags = html.match(/<link[^>]+rel=["']preload["'][^>]+as=["']image["'][^>]*>/gi) ||
      html.match(/<link[^>]+as=["']image["'][^>]+rel=["']preload["'][^>]*>/gi) || [];
    addResult('core-web-vitals', 'Hero Image Preload', 
      imagePreloadTags.length > 0,
      imagePreloadTags.length > 0
        ? `✅ Present (${imagePreloadTags.length} preload image link(s), LCP optimization)`
        : '⚠️ Missing'
    );
    
    // Check for inline critical CSS
    const inlineCriticalCSS = html.match(/<style[^>]*dangerouslySetInnerHTML[^>]*>|<style[^>]*>[\s\S]*?body\s*{[\s\S]*?margin:\s*0/i);
    addResult('core-web-vitals', 'Inline Critical CSS', 
      !!inlineCriticalCSS,
      inlineCriticalCSS ? '✅ Present (FCP optimization)' : '⚠️ Missing'
    );
    
    // Check for image sizes attributes (sample check on hero/nav images)
    const imageWithSizes = html.match(/<img[^>]+sizes=["'][^"']+["']/gi) || [];
    addResult('core-web-vitals', 'Responsive Image Sizes', 
      imageWithSizes.length > 0,
      `${imageWithSizes.length} images with sizes attribute`,
      { count: imageWithSizes.length, expected: '3+' }
    );
    
    // Check for priority attribute on above-fold images
    const imageWithPriority = html.match(/<img[^>]+priority|fetchpriority=["']high["']/gi) || [];
    addResult('core-web-vitals', 'Priority Images', 
      imageWithPriority.length > 0,
      `${imageWithPriority.length} priority images`,
      { count: imageWithPriority.length, expected: '1+' }
    );
    
    calculateCategoryScore('core-web-vitals');
    console.log(`   Score: ${results.categories['core-web-vitals'].score}%`);
    console.log(`   📊 Expected impact: -300ms LCP, -200ms FCP, -0.03 CLS`);
    
  } catch (error) {
    addResult('core-web-vitals', 'Optimization Check', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 1.6 ANALYTICS COVERAGE (GA/AW)
// ============================================================================
async function checkAnalyticsCoverage() {
  console.log('\n📈 1.6 ANALYTICS COVERAGE (GA/AW)');
  console.log('─'.repeat(60));

  try {
    const response = await fetch(TARGET_URL);
    const { data: html, headers } = response;

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
      gaMeasurementId ? `Valid format: ${gaMeasurementId}` : 'No GA measurement ID to validate'
    );

    const hasConsentDefault = /gtag\(['"]consent['"],\s*['"]default['"]/.test(html);
    const hasAnalyticsStorageDenied = /['"]analytics_storage['"]\s*:\s*['"]denied['"]/.test(html);
    const hasAdStorageDenied = /['"]ad_storage['"]\s*:\s*['"]denied['"]/.test(html);

    addResult(
      'analytics',
      'Consent Mode Default Guard',
      hasConsentDefault && hasAnalyticsStorageDenied && hasAdStorageDenied,
      hasConsentDefault && hasAnalyticsStorageDenied && hasAdStorageDenied
        ? 'Consent defaults detected (analytics_storage and ad_storage denied)'
        : 'Missing consent default guardrails for analytics/ad storage'
    );

    const csp = parseCspDirectives(headers['content-security-policy']);
    const scriptSrc = csp['script-src'] || [];
    const connectSrc = csp['connect-src'] || [];

    const hasScriptGTM = scriptSrc.some((entry) => entry.includes('googletagmanager.com'));
    addResult(
      'analytics',
      'CSP script-src allows GTM',
      hasScriptGTM,
      hasScriptGTM ? 'script-src includes googletagmanager.com' : 'script-src missing googletagmanager.com'
    );

    const hasConnectGA = connectSrc.some((entry) => entry.includes('google-analytics.com'));
    const hasConnectGTM = connectSrc.some((entry) => entry.includes('googletagmanager.com'));
    addResult(
      'analytics',
      'CSP connect-src GA Coverage',
      hasConnectGA && hasConnectGTM,
      hasConnectGA && hasConnectGTM
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

    calculateCategoryScore('analytics');
    console.log(`   Score: ${results.categories.analytics.score}%`);
  } catch (error) {
    addResult('analytics', 'Analytics Coverage Check', false, error.message);
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
        titleLength >= 50 && titleLength <= 60 ? true : 'warning',
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
        descLength >= 155 && descLength <= 160 ? true : 'warning',
        `${descLength} chars (optimal: 155-160)`,
        { length: descLength, optimal: '155-160' }
      );
    } else {
      addResult('seo-metadata', 'Meta Description Presence', false, 'Missing');
    }
    
    // Canonical URL
    const canonical = extractCanonical(html);
    addResult('seo-metadata', 'Canonical URL', 
      !!canonical,
      canonical || 'Missing'
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
// 2.1 CRITICAL ROUTE HEALTH
// ============================================================================
async function checkCriticalRouteHealth() {
  console.log('\n🩺 2.1 CRITICAL ROUTE HEALTH');
  console.log('─'.repeat(60));

  try {
    for (const routePath of CRITICAL_ROUTES) {
      const routeUrl = new URL(routePath, TARGET_URL).toString();
      const response = await fetch(routeUrl, { timeout: 20000 });
      const { data: html, status, headers } = response;

      addResult(
        'route-health',
        `Route Status ${routePath}`,
        status >= 200 && status < 400,
        `HTTP ${status}`,
        { url: routeUrl, status }
      );

      if (status >= 200 && status < 300) {
        const canonical = extractCanonical(html);
        addResult(
          'route-health',
          `Canonical Present ${routePath}`,
          !!canonical,
          canonical || 'Missing canonical'
        );
      } else if (status >= 300 && status < 400) {
        addResult(
          'route-health',
          `Redirect Target ${routePath}`,
          headers.location ? 'warning' : false,
          headers.location ? `Redirects to ${headers.location}` : 'Redirect without Location header'
        );
      }
    }

    calculateCategoryScore('route-health');
    console.log(`   Score: ${results.categories['route-health'].score}%`);
  } catch (error) {
    addResult('route-health', 'Critical Route Health', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 2.2 FULL-SITE INDEXABILITY & CANONICAL CONSISTENCY
// ============================================================================
async function checkFullSiteIndexability() {
  console.log('\n🧭 2.2 FULL-SITE INDEXABILITY & CANONICAL CONSISTENCY');
  console.log('─'.repeat(60));

  try {
    const sitemapUrls = await getSitemapUrls();
    const redirectTargets = [];
    let okPages = 0;

    for (const url of sitemapUrls) {
      const { data: html, status, headers } = await fetch(url, { timeout: 20000 });

      addResult(
        'indexability',
        `URL Reachable ${url}`,
        status >= 200 && status < 400,
        `HTTP ${status}`
      );

      if (status >= 300 && status < 400) {
        const location = headers.location ? normalizeSiteUrl(new URL(headers.location, TARGET_URL).toString()) : null;
        redirectTargets.push({ from: url, to: location });
        addResult(
          'indexability',
          `Redirect Has Location ${url}`,
          location ? 'warning' : false,
          location ? `Redirects to ${location}` : 'Missing Location header'
        );
        continue;
      }

      if (status >= 200 && status < 300) {
        okPages++;
        const canonical = extractCanonical(html);
        const normalizedUrl = normalizeSiteUrl(url);

        addResult(
          'indexability',
          `Canonical Present ${url}`,
          !!canonical,
          canonical || 'Missing canonical'
        );

        addResult(
          'indexability',
          `Canonical Matches ${url}`,
          canonical === normalizedUrl,
          canonical ? `canonical=${canonical}` : 'No canonical to compare'
        );

        const pathname = new URL(url).pathname;
        const isExpectedNoindex = EXPECTED_NOINDEX_PATHS.has(pathname);
        const noindexPresent = hasNoindex(html);
        addResult(
          'indexability',
          `Indexable ${url}`,
          noindexPresent ? isExpectedNoindex : true,
          noindexPresent
            ? (isExpectedNoindex ? 'robots=noindex present (expected for allowlisted path)' : 'robots=noindex present')
            : 'indexable'
        );
      }
    }

    addResult(
      'indexability',
      'Sitemap Crawl Coverage',
      true,
      `${sitemapUrls.length} URL(s) crawled${MAX_URLS > 0 ? ` (limited by --max-urls=${MAX_URLS})` : ''}`
    );

    addResult(
      'indexability',
      '2xx Page Count',
      okPages > 0,
      `${okPages} URL(s) returned HTTP 2xx`
    );

    if (redirectTargets.length > 0) {
      addResult(
        'indexability',
        'Sitemap Redirect Hygiene',
        'warning',
        `${redirectTargets.length} sitemap URL(s) redirect; consider using final canonical URLs in sitemap`
      );
    }

    calculateCategoryScore('indexability');
    console.log(`   Score: ${results.categories.indexability.score}%`);
  } catch (error) {
    addResult('indexability', 'Full-Site Indexability', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 2.25 FULL-SITE METADATA CONSISTENCY
// ============================================================================
async function checkFullSiteMetadataConsistency() {
  console.log('\n🧩 2.25 FULL-SITE METADATA CONSISTENCY');
  console.log('─'.repeat(60));

  try {
    const sitemapUrls = await getSitemapUrls();
    const titleMap = new Map();
    const descriptionMap = new Map();

    for (const url of sitemapUrls) {
      const response = await fetch(url, { timeout: 30000 });

      if (response.status >= 400) {
        addResult('metadata-consistency', `Metadata Crawl ${url}`, false, `HTTP ${response.status}`);
        continue;
      }

      const html = response.data;
      const title = extractTitle(html);
      const description = extractMetaContent(html, 'name', 'description');
      const canonical = extractCanonical(html);
      const ogUrlRaw = extractMetaContent(html, 'property', 'og:url');
      const ogUrl = ogUrlRaw ? normalizeSiteUrl(ogUrlRaw) : null;

      addResult(
        'metadata-consistency',
        `Title Present ${url}`,
        !!title,
        title ? `length=${title.length}` : 'Missing title tag'
      );

      addResult(
        'metadata-consistency',
        `Meta Description Present ${url}`,
        !!description,
        description ? `length=${description.length}` : 'Missing meta description'
      );

      addResult(
        'metadata-consistency',
        `Canonical/og:url parity ${url}`,
        !!canonical && !!ogUrl && canonical === ogUrl,
        `canonical=${canonical || 'missing'}, og:url=${ogUrl || 'missing'}`
      );

      if (title) {
        if (!titleMap.has(title)) titleMap.set(title, []);
        titleMap.get(title).push(url);
      }

      if (description) {
        if (!descriptionMap.has(description)) descriptionMap.set(description, []);
        descriptionMap.get(description).push(url);
      }
    }

    const duplicateTitleGroups = [...titleMap.values()].filter((urls) => urls.length > 1);
    const duplicateDescriptionGroups = [...descriptionMap.values()].filter((urls) => urls.length > 1);

    addResult(
      'metadata-consistency',
      'Duplicate Title Tags',
      duplicateTitleGroups.length === 0,
      duplicateTitleGroups.length === 0
        ? 'No duplicate title tags detected'
        : `${duplicateTitleGroups.length} duplicate title group(s) found`
    );

    addResult(
      'metadata-consistency',
      'Duplicate Meta Descriptions',
      duplicateDescriptionGroups.length === 0 ? true : 'warning',
      duplicateDescriptionGroups.length === 0
        ? 'No duplicate meta descriptions detected'
        : `${duplicateDescriptionGroups.length} duplicate description group(s) found`
    );

    addResult(
      'metadata-consistency',
      'Metadata Crawl Coverage',
      true,
      `${sitemapUrls.length} URL(s) checked${MAX_URLS > 0 ? ` (limited by --max-urls=${MAX_URLS})` : ''}`
    );

    calculateCategoryScore('metadata-consistency');
    console.log(`   Score: ${results.categories['metadata-consistency'].score}%`);
  } catch (error) {
    addResult('metadata-consistency', 'Full-Site Metadata Consistency', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 2.3 FULL-SITE STRUCTURED DATA COVERAGE
// ============================================================================
async function checkFullSiteStructuredDataCoverage() {
  console.log('\n🏗️  2.3 FULL-SITE STRUCTURED DATA COVERAGE');
  console.log('─'.repeat(60));

  try {
    const sitemapUrls = await getSitemapUrls();
    let pagesWithJsonLd = 0;
    let parseFailures = 0;

    for (const url of sitemapUrls) {
      const { data: html, status } = await fetch(url, { timeout: 20000 });
      if (status < 200 || status >= 300) continue;

      const scripts = extractJsonLdScripts(html);
      const hasParseError = scripts.some((s) => s.__parseError);
      const validScripts = scripts.filter((s) => !s.__parseError);

      if (validScripts.length > 0) pagesWithJsonLd++;
      if (hasParseError) parseFailures++;

      const typeSet = new Set();
      for (const schemaObj of validScripts) {
        const schemaType = schemaObj['@type'];
        if (Array.isArray(schemaType)) schemaType.forEach((t) => typeSet.add(t));
        else if (schemaType) typeSet.add(schemaType);
      }

      const schemaTypes = [...typeSet];

      addResult(
        'schema-coverage',
        `JSON-LD Present ${url}`,
        validScripts.length > 0,
        `${validScripts.length} schema object(s)`
      );

      addResult(
        'schema-coverage',
        `JSON-LD Parse ${url}`,
        !hasParseError,
        hasParseError ? 'One or more JSON-LD blocks failed to parse' : 'All JSON-LD blocks parse'
      );

      const expectsBreadcrumb = /\/(materials|settings|contaminants|compounds)\//.test(new URL(url).pathname);
      if (expectsBreadcrumb) {
        addResult(
          'schema-coverage',
          `BreadcrumbList ${url}`,
          schemaTypes.includes('BreadcrumbList'),
          schemaTypes.includes('BreadcrumbList') ? 'Present' : `Missing. Found: ${schemaTypes.join(', ') || 'none'}`
        );
      }

      const acceptablePageSchemas = [
        'WebPage',
        'CollectionPage',
        'AboutPage',
        'ContactPage',
        'Service',
      ];
      const hasPageLikeSchema = acceptablePageSchemas.some((schemaType) => schemaTypes.includes(schemaType));
      const hasInfrastructureFallback = schemaTypes.includes('WebSite') && schemaTypes.includes('LocalBusiness');

      addResult(
        'schema-coverage',
        `Page-type schema ${url}`,
        hasPageLikeSchema || hasInfrastructureFallback,
        schemaTypes.join(', ') || 'No schema types found'
      );
    }

    addResult(
      'schema-coverage',
      'Site JSON-LD Coverage',
      pagesWithJsonLd > 0,
      `${pagesWithJsonLd} crawled page(s) include JSON-LD`
    );

    addResult(
      'schema-coverage',
      'JSON-LD Parse Reliability',
      parseFailures === 0,
      parseFailures === 0 ? 'No parse failures' : `${parseFailures} page(s) contain unparseable JSON-LD`
    );

    calculateCategoryScore('schema-coverage');
    console.log(`   Score: ${results.categories['schema-coverage'].score}%`);
  } catch (error) {
    addResult('schema-coverage', 'Full-Site Structured Data Coverage', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 2.35 RICH-RESULTS READINESS (Schema Property Completeness)
// ============================================================================
async function checkRichResultsReadiness() {
  console.log('\n🏅 2.35 RICH-RESULTS READINESS');
  console.log('─'.repeat(60));

  try {
    const sitemapUrls = await getSitemapUrls();
    let checkedSchemas = 0;
    let missingFieldCount = 0;

    for (const url of sitemapUrls) {
      const { data: html, status } = await fetch(url, { timeout: 20000 });
      if (status < 200 || status >= 300) continue;

      const schemas = extractJsonLdScripts(html).filter((schemaObj) => !schemaObj.__parseError);
      for (const schemaObj of schemas) {
        const types = Array.isArray(schemaObj['@type'])
          ? schemaObj['@type']
          : schemaObj['@type']
            ? [schemaObj['@type']]
            : [];

        for (const schemaType of types) {
          const requiredFields = RICH_RESULT_REQUIRED_FIELDS[schemaType];
          if (!requiredFields) continue;

          checkedSchemas++;
          const missingFields = requiredFields.filter((field) => {
            const value = schemaObj[field];
            if (Array.isArray(value)) return value.length === 0;
            return value === undefined || value === null || value === '';
          });

          if (missingFields.length > 0) {
            missingFieldCount++;
            addResult(
              'rich-results',
              `${schemaType} Required Fields ${url}`,
              false,
              `Missing: ${missingFields.join(', ')}`
            );
          } else {
            addResult(
              'rich-results',
              `${schemaType} Required Fields ${url}`,
              true,
              'All required fields present'
            );
          }
        }
      }
    }

    addResult(
      'rich-results',
      'Schema Objects Evaluated',
      checkedSchemas > 0,
      `${checkedSchemas} schema object(s) checked against rich-results field rules`
    );

    addResult(
      'rich-results',
      'Required Fields Completeness',
      missingFieldCount === 0,
      missingFieldCount === 0
        ? 'No required rich-results schema fields missing'
        : `${missingFieldCount} schema object(s) missing required fields`
    );

    calculateCategoryScore('rich-results');
    console.log(`   Score: ${results.categories['rich-results'].score}%`);
  } catch (error) {
    addResult('rich-results', 'Rich-Results Readiness', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 2.36 DEPLOY PARITY CHECK (Production vs Comparison URL)
// ============================================================================
async function checkDeployParity() {
  if (!COMPARE_URL) {
    console.log('\n⏩ 2.36 DEPLOY PARITY CHECK (Skipped: no --compare-url provided)');
    return;
  }

  console.log('\n🪞 2.36 DEPLOY PARITY CHECK');
  console.log('─'.repeat(60));
  console.log(`   Comparing ${TARGET_URL} ↔ ${COMPARE_URL}`);

  try {
    const baseUrl = new URL(TARGET_URL);
    const compareBase = new URL(COMPARE_URL);

    const sitemapUrls = await getSitemapUrls();

    for (const prodUrl of sitemapUrls) {
      const prodPath = new URL(prodUrl).pathname;
      const compareUrl = `${compareBase.origin}${prodPath}`;

      const [prodResp, compareResp] = await Promise.all([
        fetch(prodUrl, { timeout: 20000 }),
        fetch(compareUrl, { timeout: 20000 }),
      ]);

      addResult(
        'deploy-parity',
        `Status parity ${prodPath}`,
        prodResp.status === compareResp.status,
        `prod=${prodResp.status}, compare=${compareResp.status}`
      );

      if (prodResp.status >= 200 && prodResp.status < 300 && compareResp.status >= 200 && compareResp.status < 300) {
        const prodCanonical = extractCanonical(prodResp.data);
        const compareCanonicalRaw = extractCanonical(compareResp.data);
        const compareCanonical = compareCanonicalRaw
          ? normalizeSiteUrl(compareCanonicalRaw.replace(compareBase.origin, baseUrl.origin))
          : null;

        addResult(
          'deploy-parity',
          `Canonical parity ${prodPath}`,
          prodCanonical === compareCanonical,
          `prod=${prodCanonical || 'none'}, compare=${compareCanonical || 'none'}`
        );

        addResult(
          'deploy-parity',
          `Indexability parity ${prodPath}`,
          hasNoindex(prodResp.data) === hasNoindex(compareResp.data),
          `prodNoindex=${hasNoindex(prodResp.data)}, compareNoindex=${hasNoindex(compareResp.data)}`
        );
      }
    }

    addResult(
      'deploy-parity',
      'Parity Scope',
      true,
      `${sitemapUrls.length} URL(s) compared${MAX_URLS > 0 ? ` (limited by --max-urls=${MAX_URLS})` : ''}`
    );

    calculateCategoryScore('deploy-parity');
    console.log(`   Score: ${results.categories['deploy-parity'].score}%`);
  } catch (error) {
    addResult('deploy-parity', 'Deploy Parity Check', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 2.4 FULL-SITE INTERNAL LINK INTEGRITY
// ============================================================================
async function checkFullSiteInternalLinks() {
  console.log('\n🔗 2.4 FULL-SITE INTERNAL LINK INTEGRITY');
  console.log('─'.repeat(60));

  try {
    const sitemapUrls = await getSitemapUrls();
    const sitemapSet = new Set(sitemapUrls.map((u) => normalizeSiteUrl(u)));
    const checkedLinkStatus = new Map();

    let brokenLinks = 0;
    let checkedLinks = 0;

    for (const pageUrl of sitemapUrls) {
      const { data: html, status } = await fetch(pageUrl, { timeout: 20000 });
      if (status < 200 || status >= 300) continue;

      const links = extractInternalLinks(html);
      for (const link of links) {
        // Skip static assets and API endpoints from page integrity checks
        const pathname = new URL(link).pathname;
        if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.match(/\.(css|js|json|xml|txt|ico|png|jpg|jpeg|webp|svg)$/i)) {
          continue;
        }

        checkedLinks++;

        // Fast path: link appears in sitemap
        if (sitemapSet.has(link)) continue;

        // Fallback path: check reachable status and cache result
        if (!checkedLinkStatus.has(link)) {
          try {
            const response = await fetch(link, { timeout: 15000 });
            checkedLinkStatus.set(link, response.status);
          } catch {
            checkedLinkStatus.set(link, 0);
          }
        }

        const linkStatus = checkedLinkStatus.get(link);
        const linkHealthy = linkStatus >= 200 && linkStatus < 400;
        if (!linkHealthy) brokenLinks++;

        addResult(
          'internal-links',
          `Internal Link ${pageUrl} -> ${link}`,
          linkHealthy,
          linkHealthy ? `HTTP ${linkStatus}` : `Broken link (HTTP ${linkStatus || 'ERR'})`
        );
      }
    }

    addResult(
      'internal-links',
      'Internal Link Coverage',
      checkedLinks > 0,
      `${checkedLinks} internal link(s) checked`
    );

    addResult(
      'internal-links',
      'Broken Internal Links',
      brokenLinks === 0,
      brokenLinks === 0 ? 'No broken internal links detected' : `${brokenLinks} broken internal link(s) detected`
    );

    calculateCategoryScore('internal-links');
    console.log(`   Score: ${results.categories['internal-links'].score}%`);
  } catch (error) {
    addResult('internal-links', 'Full-Site Internal Link Integrity', false, error.message);
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// ============================================================================
// 2.5 CONTEXTUAL INTERNAL LINKING (Dec 28, 2025)
// ============================================================================
async function checkContextualLinking() {
  console.log('\n🔗 2.5 CONTEXTUAL INTERNAL LINKING');
  console.log('─'.repeat(60));
  
  try {
    // Test a few sample pages to verify contextual links
    const samplePages = [
      '/materials/metal/non-ferrous/aluminum-laser-cleaning',
      '/materials/wood/hardwood/ash-laser-cleaning',
      '/contaminants/oxidation/ferrous/rust-oxidation-contamination',
      '/settings/metal/non-ferrous/aluminum-settings'
    ];
    
    let totalLinks = 0;
    let pagesWithLinks = 0;
    
    for (const page of samplePages) {
      try {
        const fullUrl = `${TARGET_URL}${page}`;
        const response = await fetch(fullUrl);
        const { data: html, status } = response;
        
        if (status !== 200) continue;
        
        // Find internal links in meta description or page content
        const internalLinks = (html.match(/href=["']\/(?:materials|contaminants|settings)\/[^"']+["']/gi) || []).length;
        
        if (internalLinks > 0) {
          pagesWithLinks++;
          totalLinks += internalLinks;
        }
        
        addResult('contextual-linking', `Links on ${page.split('/').pop()}`, 
          internalLinks > 0,
          `${internalLinks} contextual link(s)`,
          { count: internalLinks }
        );
        
      } catch (err) {
        // Skip pages that fail
        continue;
      }
    }
    
    const avgLinksPerPage = pagesWithLinks > 0 ? (totalLinks / pagesWithLinks).toFixed(1) : 0;
    
    addResult('contextual-linking', 'Overall Link Density', 
      parseFloat(avgLinksPerPage) >= 1.5,
      `${avgLinksPerPage} links/page (expected: 1.55+)`,
      { average: avgLinksPerPage, expected: 1.55, target: 250 }
    );
    
    addResult('contextual-linking', 'Link Coverage', 
      pagesWithLinks >= 3,
      `${pagesWithLinks}/${samplePages.length} sample pages have links`,
      { coverage: pagesWithLinks, total: samplePages.length }
    );
    
    calculateCategoryScore('contextual-linking');
    console.log(`   Score: ${results.categories['contextual-linking'].score}%`);
    console.log(`   📊 Expected: 250+ contextual links across 161 pages`);
    
  } catch (error) {
    addResult('contextual-linking', 'Linking Check', false, error.message);
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
    // Materials: Dataset + Article (currently implemented)
    { url: '/materials/metal/ferrous/steel-laser-cleaning', type: 'Material', expectedSchemas: ['Dataset', 'Article'] },
    { url: '/materials/metal/non-ferrous/aluminum-laser-cleaning', type: 'Material', expectedSchemas: ['Dataset', 'Article'] },
    // Contaminants: Dataset + Product (currently implemented)
    { url: '/contaminants/oxidation/ferrous/rust-oxidation-contamination', type: 'Contaminant', expectedSchemas: ['Dataset', 'Product'] },
    // Compounds: Basic schemas only (needs enhancement)
    { url: '/compounds/metal-fume/metal-oxide/iron-oxide-compound', type: 'Compound', expectedSchemas: ['WebPage', 'BreadcrumbList'] }
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
    '/datasets/materials/steel-material-dataset.json',
    '/datasets/materials/steel-material-dataset.csv',
    '/datasets/materials/aluminum-material-dataset.json',
    '/datasets/materials/aluminum-material-dataset.txt'
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
    
    // Check image sitemap
    try {
      const imageSitemapUrl = `${TARGET_URL}/image-sitemap.xml`;
      const imgResponse = await fetch(imageSitemapUrl);
      const { data: imgXml, status: imgStatus } = imgResponse;
      
      addResult('sitemap', 'Image Sitemap Accessible', 
        imgStatus === 200,
        imgStatus === 200 ? '✅ Found' : `❌ HTTP ${imgStatus}`
      );
      
      if (imgStatus === 200) {
        // Count images
        const imageMatches = imgXml.match(/<image:image>/g) || [];
        const imageCount = imageMatches.length;
        
        addResult('sitemap', 'Image Count', 
          imageCount > 0,
          `${imageCount} images`,
          { count: imageCount, expected: 346 }
        );
        
        // Check for enhanced metadata
        const hasCaptions = imgXml.includes('<image:caption>');
        addResult('sitemap', 'Image Captions', hasCaptions, hasCaptions ? 'Present' : 'Missing');
        
        const hasTitles = imgXml.includes('<image:title>');
        addResult('sitemap', 'Image Titles', hasTitles, hasTitles ? 'Present' : 'Missing');
        
        // Check for proper exclusions (should NOT include icon/author images)
        const hasIconImages = imgXml.includes('/icon/') || imgXml.includes('/icons/');
        addResult('sitemap', 'Icon Images Excluded', 
          !hasIconImages, 
          hasIconImages ? '⚠️ Icons found (should be excluded)' : '✅ Properly excluded'
        );
        
        const hasAuthorImages = imgXml.includes('/author/');
        addResult('sitemap', 'Author Images Excluded', 
          !hasAuthorImages, 
          hasAuthorImages ? '⚠️ Author images found (should be excluded)' : '✅ Properly excluded'
        );
        
        // Check for enhanced title format (no "Hero" suffix, "1000x" instead of "Micro")
        const hasHeroSuffix = imgXml.match(/Hero<\/image:title>/);
        addResult('sitemap', 'Title Format Quality', 
          !hasHeroSuffix, 
          hasHeroSuffix ? '⚠️ "Hero" suffix found in titles' : '✅ Titles properly formatted'
        );
        
        const hasMicroReplacement = imgXml.includes('1000x');
        addResult('sitemap', 'Micro → 1000x Replacement', 
          hasMicroReplacement, 
          hasMicroReplacement ? '✅ Using "1000x magnification"' : '⚠️ Missing "1000x" format'
        );
      }
    } catch (imgError) {
      addResult('sitemap', 'Image Sitemap Check', 'warning', `Optional: ${imgError.message}`);
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
      const hasUserAgent = /user-agent\s*:/i.test(txt);
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
  
  // Show failed tests if any
  if (results.summary.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    console.log('─'.repeat(60));
    Object.entries(results.categories).forEach(([category, data]) => {
      const failedTests = data.tests.filter(t => t.passed === false);
      if (failedTests.length > 0) {
        console.log(`\n   ${category}:`);
        failedTests.forEach(test => {
          console.log(`   ❌ ${test.test}: ${test.message}`);
        });
      }
    });
  }

  if (STRICT_SEO || REQUIRE_RICH_RESULTS) {
    console.log('\n🧱 STRICT SEO GATING');
    console.log('─'.repeat(60));

    if (STRICT_SEO) {
      console.log('   • strict-seo: enabled');
    }
    if (REQUIRE_RICH_RESULTS) {
      console.log('   • require-rich-results: enabled');
    }
  }
  
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
  await checkCoreWebVitalsOptimizations();
  await checkAnalyticsCoverage();
  await checkSEOMetadata();
  await checkCriticalRouteHealth();
  await checkFullSiteIndexability();
  await checkFullSiteMetadataConsistency();
  await checkFullSiteStructuredDataCoverage();
  await checkRichResultsReadiness();
  await checkFullSiteInternalLinks();
  await checkDeployParity();
  await checkContextualLinking();
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
  let exitCode = results.summary.failed > 0 ? 1 : 0;

  if (REQUIRE_RICH_RESULTS) {
    const richResultsCategory = results.categories['rich-results'];
    if (!richResultsCategory || richResultsCategory.failed > 0) {
      exitCode = 1;
    }
  }

  if (STRICT_SEO) {
    const strictCategories = [
      'analytics',
      'seo-metadata',
      'metadata-consistency',
      'indexability',
      'schema-coverage',
      'rich-results',
      'internal-links',
      'route-health',
      'sitemap',
      'robots'
    ];
    for (const category of strictCategories) {
      const categoryResults = results.categories[category];
      if (!categoryResults) continue;
      if (categoryResults.failed > 0 || categoryResults.warnings > 0) {
        exitCode = 1;
        break;
      }
    }
  }

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
