#!/usr/bin/env node

/**
 * Comprehensive JSON-LD Validation Suite
 * 
 * Tests JSON-LD schemas for:
 * - Schema.org compliance
 * - Required properties completeness
 * - Rich snippet eligibility
 * - Google structured data validation
 * - SEO best practices
 * - E-E-A-T signals
 * - Accessibility metadata
 */

const https = require('https');
const fs = require('fs');

// Import validation infrastructure
const { requiresServer } = require('../lib/environment');
const { ValidationResult } = require('../lib/exitCodes');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Production URL Policy: Default to production domain (see docs/08-development/PRODUCTION_URL_POLICY.md)
// For local testing, use: BASE_URL=http://localhost:3000 npm run validate:jsonld
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'https://www.z-beam.com',
  timeout: 30000,
  testPages: [
    // Material pages (individual materials)
    '/materials/ceramic/oxide/alumina-laser-cleaning',
    '/materials/metal/non-ferrous/copper-laser-cleaning',
    // Category pages (new dynamic category pages)
    '/materials/metal',
    '/materials/ceramic',
    '/materials/wood',
    '/materials/stone',
    // Dataset pages
    '/datasets',
    // Static pages
    '/services/laser-cleaning',
    '/about',
    '/contact',
    // Home page
    '/'
  ]
};

// Schema.org required properties by type
const SCHEMA_REQUIREMENTS = {
  Article: {
    required: ['headline', 'datePublished', 'author'],
    recommended: ['dateModified', 'image', 'publisher', 'mainEntityOfPage'],
    eeat: ['author.jobTitle', 'author.knowsAbout', 'author.affiliation']
  },
  Product: {
    required: ['name', 'description'],
    recommended: ['image', 'brand', 'offers', 'aggregateRating'],
    eeat: ['manufacturer', 'material', 'brand']
  },
  HowTo: {
    required: ['name', 'step'],
    recommended: ['image', 'totalTime', 'estimatedCost', 'tool', 'supply'],
    eeat: ['author', 'performTime', 'prepTime']
  },
  Dataset: {
    required: ['name', 'description'],
    recommended: ['creator', 'datePublished', 'license', 'distribution'],
    eeat: ['creator', 'citation', 'isBasedOn']
  },
  DataCatalog: {
    required: ['name', 'description'],
    recommended: ['creator', 'license', 'distribution', 'dateModified'],
    eeat: ['creator', 'temporalCoverage', 'spatialCoverage']
  },
  CollectionPage: {
    required: ['name'],
    recommended: ['description', 'breadcrumb', 'mainEntity'],
    eeat: ['dateModified', 'about']
  },
  Person: {
    required: ['name'],
    recommended: ['jobTitle', 'email', 'url', 'image'],
    eeat: ['knowsAbout', 'affiliation', 'alumniOf', 'award']
  },
  BreadcrumbList: {
    required: ['itemListElement'],
    recommended: [],
    eeat: []
  },
  WebPage: {
    required: ['name', 'url'],
    recommended: ['description', 'breadcrumb', 'mainEntity'],
    eeat: ['author', 'datePublished', 'dateModified']
  },
  VideoObject: {
    required: ['name', 'description', 'uploadDate'],
    recommended: ['thumbnailUrl', 'duration', 'contentUrl', 'embedUrl'],
    eeat: ['author', 'publisher']
  },
  ItemList: {
    required: ['itemListElement'],
    recommended: ['numberOfItems', 'itemListOrder'],
    eeat: []
  },
  Service: {
    required: ['name', 'description'],
    recommended: ['provider', 'serviceType', 'areaServed'],
    eeat: ['provider', 'offers']
  }
};

// Rich snippet eligibility checks
const RICH_SNIPPET_CHECKS = {
  Article: {
    googleEligible: schema => {
      return schema.headline &&
             schema.datePublished &&
             schema.author &&
             schema.image &&
             (typeof schema.image === 'object' ? schema.image.url : schema.image);
    },
    recommendations: [
      'Add image with dimensions (width/height) for better visibility',
      'Include publisher organization for credibility',
      'Add dateModified to show content freshness',
      'Include articleSection for categorization'
    ]
  },
  Product: {
    googleEligible: schema => {
      return schema.name &&
             schema.description &&
             schema.image;
    },
    recommendations: [
      'Add offers with price for shopping eligibility',
      'Include aggregateRating for star ratings in search',
      'Add brand for product graph',
      'Include availability status'
    ]
  },
  HowTo: {
    googleEligible: schema => {
      const hasSteps = schema.step && Array.isArray(schema.step) && schema.step.length >= 2;
      const hasName = !!schema.name;
      return hasName && hasSteps;
    },
    recommendations: [
      'Add image to each step for visual guides',
      'Include totalTime for user planning',
      'Add tool and supply lists for completeness',
      'Include estimatedCost when applicable'
    ]
  },
  Dataset: {
    googleEligible: schema => {
      return schema.name &&
             schema.description &&
             schema.license;
    },
    recommendations: [
      'Add distribution with downloadUrl for Dataset Search',
      'Include creator with full Person schema',
      'Add temporalCoverage for time-series data',
      'Include spatialCoverage for geographic data'
    ]
  },
  DataCatalog: {
    googleEligible: schema => {
      return schema.name &&
             schema.description &&
             schema.license &&
             schema.distribution;
    },
    recommendations: [
      'Add distribution with encoding formats',
      'Include creator organization',
      'Add temporalCoverage for data freshness',
      'Include dateModified to show updates'
    ]
  },
  CollectionPage: {
    googleEligible: schema => {
      return schema.name &&
             schema.description;
    },
    recommendations: [
      'Add mainEntity for primary content',
      'Include breadcrumb navigation',
      'Add about property for categorization'
    ]
  }
};

// E-E-A-T (Experience, Expertise, Authoritativeness, Trust) signals
const EEAT_SIGNALS = {
  // Core Author Signals (34 points)
  author: {
    score: 10,
    check: schema => !!(schema.author && typeof schema.author === 'object')
  },
  authorJobTitle: {
    score: 5,
    check: schema => schema.author?.jobTitle
  },
  authorKnowsAbout: {
    score: 8,
    check: schema => schema.author?.knowsAbout && schema.author.knowsAbout.length > 0
  },
  authorAffiliation: {
    score: 7,
    check: schema => schema.author?.affiliation
  },
  authorImage: {
    score: 4,
    check: schema => !!schema.author?.image
  },
  
  // Authority & Verification Signals (24 points)
  authorSameAs: {
    score: 8,
    check: schema => schema.author?.sameAs && (Array.isArray(schema.author.sameAs) ? schema.author.sameAs.length > 0 : true)
  },
  authorHasCredential: {
    score: 9,
    check: schema => schema.author?.hasCredential && schema.author.hasCredential.length > 0
  },
  authorAlumniOf: {
    score: 7,
    check: schema => !!schema.author?.alumniOf
  },
  
  // Publisher Signals (13 points)
  publisher: {
    score: 8,
    check: schema => !!(schema.publisher && typeof schema.publisher === 'object')
  },
  publisherLogo: {
    score: 5,
    check: schema => !!schema.publisher?.logo
  },
  
  // Freshness & Trust Signals (26 points)
  dateModified: {
    score: 5,
    check: schema => !!schema.dateModified
  },
  reviewedBy: {
    score: 10,
    check: schema => !!schema.reviewedBy
  },
  citation: {
    score: 6,
    check: schema => schema.citation && schema.citation.length > 0
  },
  isBasedOn: {
    score: 5,
    check: schema => !!schema.isBasedOn
  }
  // Total possible: 97 points (up from 64)
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: CONFIG.timeout
    };

    const protocol = urlObj.protocol === 'https:' ? https : require('http');
    
    const req = protocol.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function extractSchemas(html) {
  const blocks = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || [];
  return blocks.map(block => {
    try {
      const json = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

function flattenGraph(schema) {
  if (schema['@graph']) {
    return schema['@graph'];
  }
  return [schema];
}

function validateSchema(schema, type) {
  const requirements = SCHEMA_REQUIREMENTS[type];
  if (!requirements) return { valid: true, missing: [], recommended: [] };

  const missing = requirements.required.filter(prop => {
    const parts = prop.split('.');
    let value = schema;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return true;
    }
    return false;
  });

  const missingRecommended = requirements.recommended.filter(prop => {
    const parts = prop.split('.');
    let value = schema;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return true;
    }
    return false;
  });

  return {
    valid: missing.length === 0,
    missing,
    recommended: missingRecommended
  };
}

function calculateEEATScore(schema) {
  let totalScore = 0;
  let earnedScore = 0;
  const presentSignals = [];
  const missingSignals = [];

  for (const [signal, config] of Object.entries(EEAT_SIGNALS)) {
    totalScore += config.score;
    if (config.check(schema)) {
      earnedScore += config.score;
      presentSignals.push(signal);
    } else {
      missingSignals.push(signal);
    }
  }

  return {
    score: earnedScore,
    maxScore: totalScore,
    percentage: Math.round((earnedScore / totalScore) * 100),
    present: presentSignals,
    missing: missingSignals
  };
}

function checkRichSnippetEligibility(schema, type) {
  const check = RICH_SNIPPET_CHECKS[type];
  if (!check) return { eligible: null, recommendations: [] };

  return {
    eligible: check.googleEligible(schema),
    recommendations: check.recommendations || []
  };
}

// ============================================================================
// REPORTING
// ============================================================================

function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE JSON-LD VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');

  let totalSchemas = 0;
  let validSchemas = 0;
  let totalEEATScore = 0;
  let totalEEATMax = 0;
  let richSnippetEligible = 0;
  let richSnippetTotal = 0;

  for (const result of results) {
    console.log(`\n🔍 Page: ${result.url}`);
    console.log('-'.repeat(80));

    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
      continue;
    }

    console.log(`\n📦 Total JSON-LD blocks: ${result.schemas.length}`);
    
    const types = new Set();
    result.schemas.forEach(s => {
      const schemas = flattenGraph(s);
      schemas.forEach(schema => types.add(schema['@type']));
    });
    
    console.log(`📋 Schema types: ${Array.from(types).join(', ')}`);

    // Validate each schema
    for (const schemaBlock of result.schemas) {
      const schemas = flattenGraph(schemaBlock);
      
      for (const schema of schemas) {
        totalSchemas++;
        const type = schema['@type'];
        
        console.log(`\n  ▶ ${type}`);
        
        // Required properties validation
        const validation = validateSchema(schema, type);
        if (validation.valid) {
          validSchemas++;
          console.log(`    ✅ All required properties present`);
        } else {
          console.log(`    ❌ Missing required: ${validation.missing.join(', ')}`);
        }

        if (validation.recommended.length > 0) {
          console.log(`    ⚠️  Missing recommended: ${validation.recommended.join(', ')}`);
        }

        // E-E-A-T scoring
        if (['Article', 'Person', 'Dataset'].includes(type)) {
          const eeat = calculateEEATScore(schema);
          totalEEATScore += eeat.score;
          totalEEATMax += eeat.maxScore;
          
          console.log(`    🎯 E-E-A-T Score: ${eeat.score}/${eeat.maxScore} (${eeat.percentage}%)`);
          if (eeat.missing.length > 0) {
            console.log(`       Missing signals: ${eeat.missing.slice(0, 3).join(', ')}`);
          }
        }

        // Rich snippet eligibility
        const richSnippet = checkRichSnippetEligibility(schema, type);
        if (richSnippet.eligible !== null) {
          richSnippetTotal++;
          if (richSnippet.eligible) {
            richSnippetEligible++;
            console.log(`    ✅ Rich snippet eligible`);
          } else {
            console.log(`    ❌ Not eligible for rich snippets`);
            console.log(`       Suggestions: ${richSnippet.recommendations[0]}`);
          }
        }
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✅ Valid schemas: ${validSchemas}/${totalSchemas} (${Math.round(validSchemas/totalSchemas*100)}%)`);
  
  if (totalEEATMax > 0) {
    const eetatPercentage = Math.round((totalEEATScore / totalEEATMax) * 100);
    console.log(`🎯 E-E-A-T Score: ${totalEEATScore}/${totalEEATMax} (${eetatPercentage}%)`);
    
    if (eetatPercentage >= 80) {
      console.log('   🌟 Excellent E-E-A-T implementation!');
    } else if (eetatPercentage >= 60) {
      console.log('   ✅ Good E-E-A-T coverage, room for improvement');
    } else {
      console.log('   ⚠️  E-E-A-T needs enhancement for better rankings');
    }
  }

  if (richSnippetTotal > 0) {
    const snippetPercentage = Math.round((richSnippetEligible / richSnippetTotal) * 100);
    console.log(`🎨 Rich snippets: ${richSnippetEligible}/${richSnippetTotal} eligible (${snippetPercentage}%)`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('');

  return {
    totalSchemas,
    validSchemas,
    validPercentage: Math.round(validSchemas/totalSchemas*100),
    eetatScore: totalEEATScore,
    eetatMax: totalEEATMax,
    eetatPercentage: totalEEATMax > 0 ? Math.round((totalEEATScore / totalEEATMax) * 100) : 0,
    richSnippetEligible,
    richSnippetTotal,
    richSnippetPercentage: richSnippetTotal > 0 ? Math.round((richSnippetEligible / richSnippetTotal) * 100) : 0
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  // Check if server is available (skip in CI)
  await requiresServer('JSON-LD comprehensive validation');
  
  console.log('🚀 Starting comprehensive JSON-LD validation...\n');

  const result = new ValidationResult('JSON-LD Comprehensive Validation');
  const results = [];

  for (const path of CONFIG.testPages) {
    const url = CONFIG.baseUrl + path;
    console.log(`Fetching: ${url}`);

    try {
      const html = await fetchPage(url);
      const schemas = extractSchemas(html);
      results.push({ url: path, schemas });
      result.addPassed(`Validated ${path}`);
    } catch (error) {
      results.push({ url: path, error: error.message });
      result.addFailure(`Failed to validate ${path}`, error.message);
    }
  }

  const summary = generateReport(results);

  // Add summary to result
  if (summary.validPercentage === 100) {
    console.log('✅ All validations passed!\n');
  } else {
    console.log('⚠️  Some validations failed. Review the report above.\n');
  }

  result.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
