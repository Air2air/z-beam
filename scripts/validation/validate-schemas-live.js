#!/usr/bin/env node

/**
 * Live Schema Validation Script
 * Validates that JSON-LD schemas are properly rendered on live site
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_URL =
  process.env.SCHEMA_VALIDATION_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  'https://www.z-beam.com';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = Number.parseInt(process.env.SCHEMA_FETCH_RETRIES || '2', 10);
const RETRY_DELAY_MS = Number.parseInt(process.env.SCHEMA_FETCH_RETRY_DELAY_MS || '750', 10);
const RECOMMENDED_MISSING_MAX = Number.parseInt(
  process.env.SCHEMA_RECOMMENDED_MISSING_MAX || '-1',
  10,
);
const REPORT_PATH = process.env.SCHEMA_REPORT_PATH || '.validation-cache/schema-live-report.json';

const TEST_URLS = [
  '/',
  '/materials/metal/non-ferrous/aluminum-laser-cleaning',
  '/materials/metal/ferrous/stainless-steel-laser-cleaning',
  '/materials/composite/fiber-reinforced/carbon-fiber-reinforced-polymer-laser-cleaning',
  '/contaminants/oxidation/battery/battery-corrosion-contamination',
];

const EXPECTED_SCHEMA_RULES = [
  {
    name: 'homepage',
    test: (pathname) => pathname === '/',
    requiredAll: ['WebSite', 'WebPage', 'BreadcrumbList'],
    requiredAnyGroups: [['Organization', 'LocalBusiness']],
  },
  {
    name: 'material-detail-page',
    test: (pathname) => pathname.startsWith('/materials/') && pathname.endsWith('-laser-cleaning'),
    requiredAll: ['WebSite'],
    requiredAnyGroups: [['Organization', 'LocalBusiness']],
    recommendedAll: ['WebPage', 'BreadcrumbList', 'Article', 'Dataset', 'Person', 'ImageObject'],
  },
  {
    name: 'contaminant-detail-page',
    test: (pathname) => pathname.startsWith('/contaminants/') && pathname.endsWith('-contamination'),
    requiredAll: ['WebSite'],
    requiredAnyGroups: [['Organization', 'LocalBusiness']],
    recommendedAll: ['WebPage', 'BreadcrumbList', 'Article', 'Dataset', 'Person', 'ImageObject'],
  },
];

function getExpectedSchemasForPath(pathname) {
  return EXPECTED_SCHEMA_RULES.find((rule) => rule.test(pathname));
}

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'http:' ? http : https;

    const request = client.get(url, {
      headers: {
        'User-Agent': 'ZBeam-SchemaValidator/1.0',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        resolve(data);
      });
    });

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms for ${url}`));
    });

    request.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const message = (error && error.message) || '';
  return (
    message.includes('HTTP 5') ||
    message.includes('ECONNRESET') ||
    message.includes('ECONNREFUSED') ||
    message.includes('Request timeout')
  );
}

async function fetchPageWithRetry(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    try {
      return await fetchPage(url);
    } catch (error) {
      lastError = error;
      const canRetry = attempt <= MAX_RETRIES && isRetryableError(error);
      if (!canRetry) {
        throw error;
      }

      console.log(`   ⚠️  Transient fetch error (attempt ${attempt}/${MAX_RETRIES + 1}): ${error.message}`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

function extractSchemas(html) {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const scripts = [...html.matchAll(scriptRegex)];
  const schemas = new Set();

  const addType = (typeValue) => {
    if (!typeValue) return;
    if (Array.isArray(typeValue)) {
      typeValue.forEach((t) => t && schemas.add(t));
      return;
    }
    schemas.add(typeValue);
  };

  scripts.forEach((scriptMatch) => {
    try {
      const jsonStr = scriptMatch[1];
      const data = JSON.parse(jsonStr);

      if (data['@graph']) {
        data['@graph'].forEach((item) => {
          addType(item && item['@type']);
        });
      } else if (data['@type']) {
        addType(data['@type']);
      }
    } catch (e) {
      // Ignore parse errors
    }
  });

  return Array.from(schemas);
}

async function validateSchemas() {
  if (!SITE_URL) {
    console.log('❌ Missing SITE_URL configuration (SCHEMA_VALIDATION_URL or BASE_URL)');
    process.exit(1);
  }

  if (!/^https?:\/\//i.test(SITE_URL)) {
    console.log(`❌ Invalid SITE_URL format: ${SITE_URL}`);
    console.log('   Expected URL starting with http:// or https://');
    process.exit(1);
  }

  console.log('🔍 Validating JSON-LD Schemas on Live Site\n');
  console.log(`🌐 Target: ${SITE_URL}\n`);
  
  let allPassed = true;
  const results = [];
  let totalRecommendedMissing = 0;
  
  for (const routePath of TEST_URLS) {
    const url = new URL(routePath, SITE_URL).toString();
    console.log(`\n📄 Testing: ${routePath}`);
    
    try {
      const html = await fetchPageWithRetry(url);
      const foundSchemas = extractSchemas(html);
      const rule = getExpectedSchemasForPath(routePath);

      const pageResult = {
        path: routePath,
        url,
        status: 'passed',
        foundSchemas,
        ruleName: rule ? rule.name : null,
        missingRequiredAll: [],
        missingRequiredAnyGroups: [],
        missingRecommendedAll: [],
        error: null,
      };
      
      console.log(`   Found ${foundSchemas.length} schemas: ${foundSchemas.join(', ')}`);
      
      if (rule) {
        const missingRequiredAll = rule.requiredAll.filter((s) => !foundSchemas.includes(s));
        const missingAnyGroups = (rule.requiredAnyGroups || []).filter(
          (group) => !group.some((s) => foundSchemas.includes(s))
        );
        const missingRecommendedAll = (rule.recommendedAll || []).filter((s) => !foundSchemas.includes(s));

        if (missingRequiredAll.length > 0 || missingAnyGroups.length > 0) {
          pageResult.status = 'failed';
          pageResult.missingRequiredAll = missingRequiredAll;
          pageResult.missingRequiredAnyGroups = missingAnyGroups;
          if (missingRequiredAll.length > 0) {
            console.log(`   ❌ Missing required schemas: ${missingRequiredAll.join(', ')}`);
          }
          if (missingAnyGroups.length > 0) {
            const formattedGroups = missingAnyGroups.map((group) => `(${group.join(' OR ')})`).join(', ');
            console.log(`   ❌ Missing one-of schema groups: ${formattedGroups}`);
          }
          allPassed = false;
        } else {
          console.log(`   ✅ Rule '${rule.name}' passed`);
          pageResult.missingRecommendedAll = missingRecommendedAll;
          totalRecommendedMissing += missingRecommendedAll.length;
          if (missingRecommendedAll.length > 0) {
            pageResult.status = 'warning';
            console.log(`   ⚠️  Recommended schemas missing: ${missingRecommendedAll.join(', ')}`);
          }
        }
      } else {
        console.log(`   ℹ️  No schema rule defined`);
      }

      results.push(pageResult);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      allPassed = false;
      results.push({
        path: routePath,
        url,
        status: 'error',
        foundSchemas: [],
        ruleName: null,
        missingRequiredAll: [],
        missingRequiredAnyGroups: [],
        missingRecommendedAll: [],
        error: error.message,
      });
    }
  }

  const failedPages = results.filter((r) => r.status === 'failed' || r.status === 'error').length;
  const warningPages = results.filter((r) => r.status === 'warning').length;
  const recommendedThresholdEnabled = RECOMMENDED_MISSING_MAX >= 0;
  const recommendedThresholdFailed =
    recommendedThresholdEnabled && totalRecommendedMissing > RECOMMENDED_MISSING_MAX;

  if (recommendedThresholdEnabled) {
    if (recommendedThresholdFailed) {
      console.log(
        `\n❌ Recommended schema threshold exceeded: ${totalRecommendedMissing} > ${RECOMMENDED_MISSING_MAX}`,
      );
      allPassed = false;
    } else {
      console.log(
        `\n✅ Recommended schema threshold check passed: ${totalRecommendedMissing} <= ${RECOMMENDED_MISSING_MAX}`,
      );
    }
  } else {
    console.log(`\nℹ️  Recommended schema threshold disabled (SCHEMA_RECOMMENDED_MISSING_MAX=${RECOMMENDED_MISSING_MAX})`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    target: SITE_URL,
    summary: {
      totalPages: TEST_URLS.length,
      failedPages,
      warningPages,
      totalRecommendedMissing,
      recommendedThresholdEnabled,
      recommendedMissingMax: RECOMMENDED_MISSING_MAX,
      recommendedThresholdFailed,
      passed: allPassed,
    },
    results,
  };

  const reportDir = path.dirname(REPORT_PATH);
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`📄 Schema validation report written: ${REPORT_PATH}`);
  
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All schema validations passed!');
    process.exit(0);
  } else {
    console.log('❌ Some schema validations failed');
    process.exit(1);
  }
}

validateSchemas();
