#!/usr/bin/env node

/**
 * Comprehensive JSON-LD Quality & Coverage Audit
 * 
 * Evaluates:
 * - Schema.org coverage across all page types
 * - Best practices compliance
 * - E-E-A-T signal strength
 * - Rich snippet opportunities
 * - Missing enhancements
 * - Competitive positioning
 * - Implementation completeness
 */

const https = require('https');
const http = require('http');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  samplePages: {
    material: '/materials/metal/non-ferrous/aluminum-laser-cleaning',
    materialCeramic: '/materials/ceramic/oxide/alumina-laser-cleaning',
    categoryMetal: '/materials/metal',
    categoryCeramic: '/materials/ceramic',
    categoryWood: '/materials/wood',
    datasets: '/datasets',
    service: '/services/laser-cleaning',
    about: '/about',
    contact: '/contact',
    home: '/'
  }
};

// ============================================================================
// SCHEMA EVALUATION CRITERIA
// ============================================================================

const BEST_PRACTICES = {
  // Google Rich Results Requirements
  richSnippets: {
    Article: {
      required: ['headline', 'image', 'datePublished', 'author'],
      recommended: ['dateModified', 'publisher'],
      score: 10
    },
    Product: {
      required: ['name', 'image', 'offers.price', 'offers.priceCurrency'],
      recommended: ['aggregateRating', 'review', 'brand'],
      score: 15
    },
    HowTo: {
      required: ['name', 'step'],
      recommended: ['image', 'totalTime', 'tool', 'supply'],
      score: 12
    },
    VideoObject: {
      required: ['name', 'description', 'thumbnailUrl', 'uploadDate'],
      recommended: ['duration', 'contentUrl'],
      score: 8
    }
  },

  // E-E-A-T Signal Strength (Experience, Expertise, Authoritativeness, Trust)
  eeatSignals: {
    critical: [
      { field: 'author', score: 10, category: 'Experience' },
      { field: 'knowsAbout', score: 8, category: 'Expertise' }, // Person.knowsAbout
      { field: 'affiliation', score: 7, category: 'Authoritativeness' }, // Person.affiliation
      { field: 'hasCredential', score: 6, category: 'Expertise' }, // Person.hasCredential
      { field: 'publisher.logo', score: 5, category: 'Trust' },
      { field: 'dateModified', score: 5, category: 'Trust' }
    ],
    advanced: [
      { field: 'reviewedBy', score: 10, category: 'Trust' },
      { field: 'citation', score: 6, category: 'Authoritativeness' },
      { field: 'isBasedOn', score: 5, category: 'Authoritativeness' },
      { field: 'sameAs', score: 5, category: 'Trust' }, // Person.sameAs
      { field: 'alumniOf', score: 4, category: 'Authoritativeness' }, // Person.alumniOf
      { field: 'award', score: 4, category: 'Authoritativeness' }
    ]
  },

  // Technical SEO Best Practices
  technicalSEO: {
    graphStructure: { check: 'uses @graph for multiple schemas', score: 5 },
    uniqueIds: { check: 'all schemas have unique @id', score: 3 },
    imageOptimization: { check: 'images have width/height', score: 4 },
    logoCompliance: { check: 'logo meets 112px height min', score: 3 },
    breadcrumbs: { check: 'BreadcrumbList present', score: 4 },
    mainEntity: { check: 'WebPage has mainEntity', score: 3 },
    inLanguage: { check: 'inLanguage specified', score: 2 }
  },

  // Coverage Opportunities
  schemaOpportunities: {
    Person: { context: 'Author profiles', impact: 'High', score: 10 },
    Organization: { context: 'Publisher/Brand', impact: 'High', score: 8 },
    Dataset: { context: 'Material data', impact: 'Medium', score: 7 },
    FAQPage: { context: 'FAQ sections', impact: 'Medium', score: 6 },
    VideoObject: { context: 'Tutorial videos', impact: 'Medium', score: 6 },
    ImageObject: { context: 'Hero images', impact: 'Low', score: 4 },
    WebSite: { context: 'Site search', impact: 'Low', score: 3 }
  }
};

// ============================================================================
// AUDIT FUNCTIONS
// ============================================================================

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: CONFIG.timeout
    };

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

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

function evaluateEEAT(schemas) {
  const eeatResults = {
    critical: { present: [], missing: [], score: 0, maxScore: 0 },
    advanced: { present: [], missing: [], score: 0, maxScore: 0 }
  };

  const allSchemas = schemas.flatMap(s => s['@graph'] || [s]);
  
  // Get Person schemas specifically (Schema.org standard: Person type contains author fields)
  const personSchemas = allSchemas.filter(s => s['@type'] === 'Person');

  ['critical', 'advanced'].forEach(level => {
    BEST_PRACTICES.eeatSignals[level].forEach(signal => {
      eeatResults[level].maxScore += signal.score;
      
      let found = false;
      
      // Check in all schemas for Article-level fields
      if (signal.field === 'author' || signal.field === 'publisher.logo' || 
          signal.field === 'dateModified' || signal.field === 'reviewedBy' ||
          signal.field === 'citation' || signal.field === 'isBasedOn' || 
          signal.field === 'award') {
        found = allSchemas.some(schema => {
          const value = getNestedValue(schema, signal.field);
          return value !== undefined && value !== null && value !== '';
        });
      } else {
        // Check Person schemas for Person-specific fields (Schema.org standard)
        found = personSchemas.some(schema => {
          const value = getNestedValue(schema, signal.field);
          return value !== undefined && value !== null && 
                 (Array.isArray(value) ? value.length > 0 : value !== '');
        });
      }

      if (found) {
        eeatResults[level].present.push({ ...signal, found: true });
        eeatResults[level].score += signal.score;
      } else {
        eeatResults[level].missing.push({ ...signal, found: false });
      }
    });
  });

  const totalScore = eeatResults.critical.score + eeatResults.advanced.score;
  const maxTotalScore = eeatResults.critical.maxScore + eeatResults.advanced.maxScore;

  return {
    ...eeatResults,
    overall: {
      score: totalScore,
      maxScore: maxTotalScore,
      percentage: Math.round((totalScore / maxTotalScore) * 100),
      grade: totalScore >= maxTotalScore * 0.8 ? 'A' :
             totalScore >= maxTotalScore * 0.6 ? 'B' :
             totalScore >= maxTotalScore * 0.4 ? 'C' :
             totalScore >= maxTotalScore * 0.2 ? 'D' : 'F'
    }
  };
}

function evaluateRichSnippets(schemas) {
  const results = {
    eligible: [],
    partial: [],
    notEligible: [],
    opportunities: []
  };

  const allSchemas = schemas.flatMap(s => s['@graph'] || [s]);

  Object.entries(BEST_PRACTICES.richSnippets).forEach(([type, requirements]) => {
    const schema = allSchemas.find(s => s['@type'] === type);
    
    if (!schema) {
      results.opportunities.push({
        type,
        reason: 'Schema type not present',
        impact: requirements.score
      });
      return;
    }

    const requiredPresent = requirements.required.every(field => {
      const value = getNestedValue(schema, field);
      return value !== undefined && value !== null && value !== '';
    });

    const recommendedPresent = requirements.recommended.filter(field => {
      const value = getNestedValue(schema, field);
      return value !== undefined && value !== null && value !== '';
    });

    if (requiredPresent && recommendedPresent.length === requirements.recommended.length) {
      results.eligible.push({
        type,
        status: 'Fully Eligible',
        score: requirements.score,
        details: 'All required and recommended fields present'
      });
    } else if (requiredPresent) {
      results.partial.push({
        type,
        status: 'Partially Eligible',
        score: Math.round(requirements.score * 0.6),
        missing: requirements.recommended.filter(f => !getNestedValue(schema, f)),
        details: `Missing ${requirements.recommended.length - recommendedPresent.length} recommended fields`
      });
    } else {
      results.notEligible.push({
        type,
        status: 'Not Eligible',
        score: 0,
        missing: requirements.required.filter(f => !getNestedValue(schema, f)),
        details: 'Missing required fields'
      });
    }
  });

  const totalScore = [
    ...results.eligible,
    ...results.partial
  ].reduce((sum, item) => sum + item.score, 0);

  const maxScore = Object.values(BEST_PRACTICES.richSnippets)
    .reduce((sum, req) => sum + req.score, 0);

  return {
    ...results,
    summary: {
      eligible: results.eligible.length,
      partial: results.partial.length,
      notEligible: results.notEligible.length,
      opportunities: results.opportunities.length,
      score: totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100)
    }
  };
}

function evaluateTechnicalSEO(schemas) {
  const results = {
    passed: [],
    failed: [],
    score: 0,
    maxScore: 0
  };

  const allSchemas = schemas.flatMap(s => s['@graph'] || [s]);
  const usesGraph = schemas.some(s => s['@graph']);

  Object.entries(BEST_PRACTICES.technicalSEO).forEach(([key, criteria]) => {
    results.maxScore += criteria.score;
    let passed = false;

    switch (key) {
      case 'graphStructure':
        passed = usesGraph;
        break;
      case 'uniqueIds':
        const ids = allSchemas.map(s => s['@id']).filter(Boolean);
        passed = ids.length === new Set(ids).size && ids.length > 0;
        break;
      case 'imageOptimization':
        const images = allSchemas.filter(s => s['@type'] === 'ImageObject');
        passed = images.length > 0 && images.every(img => img.width && img.height);
        break;
      case 'logoCompliance':
        const logos = allSchemas
          .filter(s => s['@type'] === 'Organization' && s.logo)
          .map(s => s.logo);
        passed = logos.length > 0 && logos.every(logo => 
          (logo.height || 0) >= 112
        );
        break;
      case 'breadcrumbs':
        passed = allSchemas.some(s => s['@type'] === 'BreadcrumbList');
        break;
      case 'mainEntity':
        const webPages = allSchemas.filter(s => s['@type'] === 'WebPage');
        passed = webPages.length > 0 && webPages.some(p => p.mainEntity);
        break;
      case 'inLanguage':
        passed = allSchemas.some(s => s.inLanguage);
        break;
    }

    if (passed) {
      results.passed.push({ check: criteria.check, score: criteria.score });
      results.score += criteria.score;
    } else {
      results.failed.push({ check: criteria.check, score: criteria.score });
    }
  });

  return {
    ...results,
    percentage: Math.round((results.score / results.maxScore) * 100),
    grade: results.score >= results.maxScore * 0.9 ? 'A' :
           results.score >= results.maxScore * 0.7 ? 'B' :
           results.score >= results.maxScore * 0.5 ? 'C' : 'D'
  };
}

function evaluateCoverage(schemas) {
  const allSchemas = schemas.flatMap(s => s['@graph'] || [s]);
  const presentTypes = new Set(allSchemas.map(s => s['@type']));

  const results = {
    implemented: [],
    missing: [],
    score: 0,
    maxScore: 0
  };

  Object.entries(BEST_PRACTICES.schemaOpportunities).forEach(([type, details]) => {
    results.maxScore += details.score;
    
    if (presentTypes.has(type)) {
      results.implemented.push({
        type,
        ...details,
        status: 'Implemented'
      });
      results.score += details.score;
    } else {
      results.missing.push({
        type,
        ...details,
        status: 'Not Implemented'
      });
    }
  });

  return {
    ...results,
    percentage: Math.round((results.score / results.maxScore) * 100),
    summary: {
      implemented: results.implemented.length,
      missing: results.missing.length,
      total: Object.keys(BEST_PRACTICES.schemaOpportunities).length
    }
  };
}

function validateSchemaOrgCompliance(schemas) {
  // Schema.org standard field names by type
  const SCHEMA_ORG_FIELDS = {
    Person: {
      valid: ['name', 'jobTitle', 'email', 'url', 'affiliation', 'knowsAbout', 
              'hasCredential', 'nationality', 'image', 'sameAs', 'alumniOf', 
              'honorificPrefix', 'honorificSuffix', 'gender', 'birthDate', 
              'knowsLanguage', 'memberOf', 'worksFor', 'award', 'description'],
      required: ['name']
    },
    Article: {
      valid: ['headline', 'author', 'publisher', 'datePublished', 'dateModified',
              'image', 'articleBody', 'description', 'url', 'mainEntityOfPage',
              'keywords', 'articleSection', 'wordCount', 'about', 'citation',
              'isBasedOn', 'reviewedBy', 'inLanguage'],
      required: ['headline', 'author', 'datePublished']
    },
    Organization: {
      valid: ['name', 'url', 'logo', 'description', 'address', 'contactPoint',
              'sameAs', 'foundingDate', 'numberOfEmployees', 'naics', 'legalName',
              'image', 'hasOfferCatalog', 'areaServed', 'potentialAction'],
      required: ['name']
    },
    ImageObject: {
      valid: ['url', 'width', 'height', 'caption', 'description'],
      required: ['url']
    }
  };

  const allSchemas = schemas.flatMap(s => s['@graph'] || [s]);
  const results = {
    compliant: [],
    issues: [],
    warnings: []
  };

  allSchemas.forEach(schema => {
    const schemaType = schema['@type'];
    if (!schemaType) return;

    const standards = SCHEMA_ORG_FIELDS[schemaType];
    if (!standards) return; // Type not in our validation list

    const schemaFields = Object.keys(schema).filter(k => !k.startsWith('@'));
    
    // Check required fields
    standards.required.forEach(field => {
      if (!schema[field]) {
        results.issues.push({
          type: schemaType,
          field,
          issue: 'Missing required Schema.org field',
          severity: 'error'
        });
      }
    });

    // Check for invalid fields (not in Schema.org spec)
    schemaFields.forEach(field => {
      if (!standards.valid.includes(field)) {
        results.warnings.push({
          type: schemaType,
          field,
          issue: `Field '${field}' not in Schema.org ${schemaType} specification`,
          severity: 'warning'
        });
      }
    });

    // If no issues, mark as compliant
    const hasIssues = results.issues.some(i => i.type === schemaType);
    if (!hasIssues) {
      results.compliant.push({
        type: schemaType,
        fields: schemaFields.length,
        status: 'Valid Schema.org structure'
      });
    }
  });

  return {
    ...results,
    summary: {
      compliant: results.compliant.length,
      issues: results.issues.length,
      warnings: results.warnings.length,
      percentage: allSchemas.length > 0 
        ? Math.round((results.compliant.length / allSchemas.length) * 100)
        : 0
    }
  };
}

function generateRecommendations(eeat, richSnippets, technical, coverage) {
  const recommendations = [];

  // E-E-A-T Recommendations
  if (eeat.overall.percentage < 60) {
    eeat.critical.missing.slice(0, 3).forEach(signal => {
      recommendations.push({
        priority: 'High',
        category: 'E-E-A-T',
        action: `Add ${signal.field} to enhance ${signal.category}`,
        impact: `+${signal.score} points`,
        effort: 'Low'
      });
    });
  }

  // Rich Snippet Recommendations
  richSnippets.notEligible.forEach(item => {
    if (item.missing && item.missing.length > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Rich Snippets',
        action: `Add required fields to ${item.type}: ${item.missing.join(', ')}`,
        impact: `Unlock ${item.type} rich results`,
        effort: 'Medium'
      });
    }
  });

  richSnippets.partial.forEach(item => {
    if (item.missing && item.missing.length > 0) {
      recommendations.push({
        priority: 'Medium',
        category: 'Rich Snippets',
        action: `Complete ${item.type} with: ${item.missing.join(', ')}`,
        impact: `+${Math.round(item.score * 0.4)} points`,
        effort: 'Low'
      });
    }
  });

  // Technical SEO Recommendations
  technical.failed.forEach(check => {
    recommendations.push({
      priority: 'Medium',
      category: 'Technical SEO',
      action: check.check,
      impact: `+${check.score} points`,
      effort: 'Low'
    });
  });

  // Coverage Recommendations
  coverage.missing
    .filter(item => item.impact === 'High')
    .forEach(item => {
      recommendations.push({
        priority: 'Medium',
        category: 'Schema Coverage',
        action: `Implement ${item.type} schema for ${item.context}`,
        impact: `+${item.score} points, ${item.impact} impact`,
        effort: 'Medium'
      });
    });

  // Sort by priority and impact
  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations.slice(0, 10); // Top 10 recommendations
}

// ============================================================================
// MAIN AUDIT
// ============================================================================

async function auditPage(pageName, url) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 Auditing: ${pageName}`);
  console.log(`📍 URL: ${url}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    const html = await fetchPage(url);
    const schemas = extractSchemas(html);

    if (schemas.length === 0) {
      console.log('❌ No JSON-LD schemas found\n');
      return null;
    }

    console.log(`📦 Found ${schemas.length} JSON-LD block(s)\n`);

    // Evaluate all aspects
    const eeat = evaluateEEAT(schemas);
    const richSnippets = evaluateRichSnippets(schemas);
    const technical = evaluateTechnicalSEO(schemas);
    const coverage = evaluateCoverage(schemas);
    const schemaOrgCompliance = validateSchemaOrgCompliance(schemas);

    // Display Schema.org compliance first
    console.log('✅ SCHEMA.ORG COMPLIANCE');
    console.log(`${'─'.repeat(80)}`);
    console.log(`Compliant Schemas: ${schemaOrgCompliance.summary.compliant}/${schemas.flatMap(s => s['@graph'] || [s]).length} (${schemaOrgCompliance.summary.percentage}%)`);
    if (schemaOrgCompliance.issues.length > 0) {
      console.log(`\n❌ Errors: ${schemaOrgCompliance.issues.length}`);
      schemaOrgCompliance.issues.slice(0, 3).forEach(issue => {
        console.log(`   • ${issue.type}: ${issue.issue} - '${issue.field}'`);
      });
    }
    if (schemaOrgCompliance.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${schemaOrgCompliance.warnings.length}`);
      schemaOrgCompliance.warnings.slice(0, 3).forEach(warning => {
        console.log(`   • ${warning.type}: ${warning.issue}`);
      });
    }
    if (schemaOrgCompliance.issues.length === 0 && schemaOrgCompliance.warnings.length === 0) {
      console.log('✅ All schemas follow Schema.org standards');
    }

    // Display results
    console.log('\n📊 E-E-A-T SIGNALS');
    console.log(`${'─'.repeat(80)}`);
    console.log(`Overall Score: ${eeat.overall.score}/${eeat.overall.maxScore} (${eeat.overall.percentage}%) - Grade: ${eeat.overall.grade}`);
    console.log(`\nCritical Signals: ${eeat.critical.score}/${eeat.critical.maxScore}`);
    console.log(`  ✅ Present: ${eeat.critical.present.length}`);
    console.log(`  ❌ Missing: ${eeat.critical.missing.length}`);
    if (eeat.critical.missing.length > 0) {
      eeat.critical.missing.slice(0, 3).forEach(signal => {
        console.log(`     • ${signal.field} (${signal.category}) - ${signal.score} points`);
      });
    }
    console.log(`\nAdvanced Signals: ${eeat.advanced.score}/${eeat.advanced.maxScore}`);
    console.log(`  ✅ Present: ${eeat.advanced.present.length}`);
    console.log(`  ❌ Missing: ${eeat.advanced.missing.length}`);

    console.log(`\n🎨 RICH SNIPPET ELIGIBILITY`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`Score: ${richSnippets.summary.score}/${richSnippets.summary.maxScore} (${richSnippets.summary.percentage}%)`);
    console.log(`✅ Fully Eligible: ${richSnippets.summary.eligible}`);
    console.log(`⚠️  Partially Eligible: ${richSnippets.summary.partial}`);
    console.log(`❌ Not Eligible: ${richSnippets.summary.notEligible}`);
    console.log(`💡 Opportunities: ${richSnippets.summary.opportunities}`);

    console.log(`\n🔧 TECHNICAL SEO`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`Score: ${technical.score}/${technical.maxScore} (${technical.percentage}%) - Grade: ${technical.grade}`);
    console.log(`✅ Passed: ${technical.passed.length}`);
    console.log(`❌ Failed: ${technical.failed.length}`);
    if (technical.failed.length > 0) {
      technical.failed.forEach(check => {
        console.log(`   • ${check.check}`);
      });
    }

    console.log(`\n📋 SCHEMA COVERAGE`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`Score: ${coverage.score}/${coverage.maxScore} (${coverage.percentage}%)`);
    console.log(`✅ Implemented: ${coverage.summary.implemented}/${coverage.summary.total}`);
    console.log(`❌ Missing: ${coverage.summary.missing}/${coverage.summary.total}`);

    // Generate recommendations
    const recommendations = generateRecommendations(eeat, richSnippets, technical, coverage);
    
    if (recommendations.length > 0) {
      console.log(`\n💡 TOP RECOMMENDATIONS`);
      console.log(`${'─'.repeat(80)}`);
      recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority}] ${rec.action}`);
        console.log(`   Category: ${rec.category} | Impact: ${rec.impact} | Effort: ${rec.effort}`);
      });
    }

    return {
      pageName,
      url,
      schemaOrgCompliance,
      eeat,
      richSnippets,
      technical,
      coverage,
      recommendations
    };

  } catch (error) {
    console.error(`❌ Error auditing ${pageName}: ${error.message}\n`);
    return null;
  }
}

async function runComprehensiveAudit() {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('  COMPREHENSIVE JSON-LD QUALITY & COVERAGE AUDIT');
  console.log('═'.repeat(80));

  const results = [];

  for (const [name, path] of Object.entries(CONFIG.samplePages)) {
    const url = `${CONFIG.baseUrl}${path}`;
    const result = await auditPage(name, url);
    if (result) {
      results.push(result);
    }
  }

  // Overall summary
  if (results.length > 0) {
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('  OVERALL SUMMARY');
    console.log('═'.repeat(80));

    const avgSchemaOrg = Math.round(
      results.reduce((sum, r) => sum + r.schemaOrgCompliance.summary.percentage, 0) / results.length
    );
    const avgEEAT = Math.round(
      results.reduce((sum, r) => sum + r.eeat.overall.percentage, 0) / results.length
    );
    const avgRichSnippets = Math.round(
      results.reduce((sum, r) => sum + r.richSnippets.summary.percentage, 0) / results.length
    );
    const avgTechnical = Math.round(
      results.reduce((sum, r) => sum + r.technical.percentage, 0) / results.length
    );
    const avgCoverage = Math.round(
      results.reduce((sum, r) => sum + r.coverage.percentage, 0) / results.length
    );

    console.log(`\nAverage Schema.org Compliance: ${avgSchemaOrg}%`);
    console.log(`Average E-E-A-T Score: ${avgEEAT}%`);
    console.log(`Average Rich Snippet Eligibility: ${avgRichSnippets}%`);
    console.log(`Average Technical SEO: ${avgTechnical}%`);
    console.log(`Average Schema Coverage: ${avgCoverage}%`);

    const overallScore = Math.round((avgSchemaOrg + avgEEAT + avgRichSnippets + avgTechnical + avgCoverage) / 5);
    const overallGrade = overallScore >= 80 ? 'A' :
                         overallScore >= 60 ? 'B' :
                         overallScore >= 40 ? 'C' : 'D';

    console.log(`\n🎯 OVERALL GRADE: ${overallGrade} (${overallScore}%)`);

    console.log('\n📈 IMPROVEMENT POTENTIAL:');
    console.log(`   Schema.org Compliance: ${100 - avgSchemaOrg}% improvement available`);
    console.log(`   E-E-A-T: ${100 - avgEEAT}% improvement available`);
    console.log(`   Rich Snippets: ${100 - avgRichSnippets}% improvement available`);
    console.log(`   Technical SEO: ${100 - avgTechnical}% improvement available`);
    console.log(`   Schema Coverage: ${100 - avgCoverage}% improvement available`);

    console.log('\n✅ Audit complete!\n');
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  runComprehensiveAudit().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  auditPage,
  evaluateEEAT,
  evaluateRichSnippets,
  evaluateTechnicalSEO,
  evaluateCoverage
};
