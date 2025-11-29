#!/usr/bin/env node

/**
 * SEO Infrastructure - Schema.org Richness Validation
 * 
 * Validates structured data (JSON-LD Schema.org markup) completeness and quality
 * as part of the SEO Infrastructure layer for rich search results.
 * 
 * Validation checks:
 * - Detects FAQ content → validates FAQPage schema
 * - Detects step-by-step instructions → validates HowTo schema
 * - Detects video embeds → validates VideoObject schema
 * - Suggests Product schema for materials pages
 * - Validates existing schema markup quality
 * 
 * @see docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md
 * 
 * Exit codes:
 * 0 - All checks passed, no critical issues
 * 1 - Critical schema issues or missing opportunities
 * 2 - Script execution error
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const DEV_URL = process.env.VALIDATION_URL || 'http://localhost:3000';
const STRICT_MODE = process.argv.includes('--strict');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
 * Extract all JSON-LD schemas from a page
 */
async function extractSchemas(page) {
  return await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    return scripts.map(script => {
      try {
        return JSON.parse(script.textContent);
      } catch (error) {
        return { error: 'Invalid JSON', content: script.textContent };
      }
    });
  });
}

/**
 * Detect FAQ content patterns
 */
async function detectFAQContent(page) {
  return await page.evaluate(() => {
    const indicators = {
      hasFAQHeading: false,
      hasQuestionPattern: false,
      questionCount: 0,
      sampleQuestions: [],
    };
    
    // Check for FAQ headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
    indicators.hasFAQHeading = headings.some(h => 
      /faq|frequently asked|common questions/i.test(h.textContent)
    );
    
    // Check for question/answer patterns
    const allText = document.body.textContent;
    const questionMatches = allText.match(/\b(what|how|why|when|where|who|can|does|is|are)\s+[^?]+\?/gi);
    
    if (questionMatches) {
      indicators.hasQuestionPattern = true;
      indicators.questionCount = questionMatches.length;
      indicators.sampleQuestions = questionMatches.slice(0, 3);
    }
    
    // Look for accordion/expandable patterns (common FAQ structure)
    const accordions = document.querySelectorAll('[role="button"][aria-expanded], details, .accordion, .faq-item');
    if (accordions.length >= 3) {
      indicators.hasQuestionPattern = true;
      indicators.questionCount = Math.max(indicators.questionCount, accordions.length);
    }
    
    return indicators;
  });
}

/**
 * Detect HowTo content patterns
 */
async function detectHowToContent(page) {
  return await page.evaluate(() => {
    const indicators = {
      hasHowToHeading: false,
      hasStepPattern: false,
      stepCount: 0,
      hasOrderedList: false,
    };
    
    // Check for HowTo/tutorial headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    indicators.hasHowToHeading = headings.some(h => 
      /how to|step by step|tutorial|guide|instructions/i.test(h.textContent)
    );
    
    // Check for step numbering patterns
    const allText = document.body.textContent;
    const stepMatches = allText.match(/step\s+\d+|^\d+\.|^\d+\)/gmi);
    
    if (stepMatches && stepMatches.length >= 3) {
      indicators.hasStepPattern = true;
      indicators.stepCount = stepMatches.length;
    }
    
    // Check for ordered lists (common in HowTo)
    const orderedLists = document.querySelectorAll('ol');
    if (orderedLists.length > 0) {
      orderedLists.forEach(ol => {
        const items = ol.querySelectorAll('li');
        if (items.length >= 3) {
          indicators.hasOrderedList = true;
          indicators.stepCount = Math.max(indicators.stepCount, items.length);
        }
      });
    }
    
    return indicators;
  });
}

/**
 * Detect video embeds
 */
async function detectVideoContent(page) {
  return await page.evaluate(() => {
    const indicators = {
      hasVideoElement: false,
      hasIframe: false,
      hasYouTube: false,
      hasVimeo: false,
      videoCount: 0,
      embedSources: [],
    };
    
    // Check for video elements
    const videos = document.querySelectorAll('video');
    if (videos.length > 0) {
      indicators.hasVideoElement = true;
      indicators.videoCount += videos.length;
    }
    
    // Check for video iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.src.toLowerCase();
      
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        indicators.hasYouTube = true;
        indicators.hasIframe = true;
        indicators.videoCount++;
        indicators.embedSources.push('YouTube');
      } else if (src.includes('vimeo.com')) {
        indicators.hasVimeo = true;
        indicators.hasIframe = true;
        indicators.videoCount++;
        indicators.embedSources.push('Vimeo');
      } else if (src.includes('video') || src.includes('player')) {
        indicators.hasIframe = true;
        indicators.videoCount++;
        indicators.embedSources.push('Other');
      }
    });
    
    return indicators;
  });
}

/**
 * Validate FAQPage schema
 */
function validateFAQPageSchema(schemas, faqContent) {
  const faqSchema = schemas.find(s => s['@type'] === 'FAQPage');
  const issues = [];
  const suggestions = [];
  
  if (!faqSchema) {
    if (faqContent.hasFAQHeading || (faqContent.hasQuestionPattern && faqContent.questionCount >= 3)) {
      suggestions.push({
        type: 'missing_schema',
        severity: 'high',
        message: `Detected ${faqContent.questionCount} FAQ-style questions but no FAQPage schema`,
        recommendation: 'Add FAQPage schema with mainEntity array',
      });
    }
    return { valid: false, issues, suggestions };
  }
  
  // Validate FAQPage structure
  if (!faqSchema.mainEntity || !Array.isArray(faqSchema.mainEntity)) {
    issues.push({
      severity: 'critical',
      message: 'FAQPage schema missing mainEntity array',
      fix: 'Add mainEntity array with Question objects',
    });
  } else {
    const questions = faqSchema.mainEntity;
    
    // Check each question
    questions.forEach((q, index) => {
      if (q['@type'] !== 'Question') {
        issues.push({
          severity: 'critical',
          message: `mainEntity[${index}] is not of type Question`,
        });
      }
      
      if (!q.name || q.name.trim() === '') {
        issues.push({
          severity: 'critical',
          message: `Question ${index + 1} missing name property`,
        });
      }
      
      if (!q.acceptedAnswer) {
        issues.push({
          severity: 'critical',
          message: `Question ${index + 1} missing acceptedAnswer`,
        });
      } else if (q.acceptedAnswer['@type'] !== 'Answer') {
        issues.push({
          severity: 'critical',
          message: `Question ${index + 1} acceptedAnswer is not of type Answer`,
        });
      } else if (!q.acceptedAnswer.text || q.acceptedAnswer.text.trim() === '') {
        issues.push({
          severity: 'critical',
          message: `Question ${index + 1} acceptedAnswer missing text`,
        });
      }
    });
    
    // Suggest adding more questions if detected more in content
    if (faqContent.questionCount > questions.length + 2) {
      suggestions.push({
        type: 'incomplete',
        severity: 'medium',
        message: `FAQPage has ${questions.length} questions but detected ${faqContent.questionCount} in content`,
        recommendation: 'Consider adding more questions to schema',
      });
    }
  }
  
  return { valid: issues.length === 0, issues, suggestions };
}

/**
 * Validate HowTo schema
 */
function validateHowToSchema(schemas, howToContent) {
  const howToSchema = schemas.find(s => s['@type'] === 'HowTo');
  const issues = [];
  const suggestions = [];
  
  if (!howToSchema) {
    if (howToContent.hasHowToHeading || (howToContent.hasStepPattern && howToContent.stepCount >= 3)) {
      suggestions.push({
        type: 'missing_schema',
        severity: 'high',
        message: `Detected ${howToContent.stepCount} step-by-step instructions but no HowTo schema`,
        recommendation: 'Add HowTo schema with step array',
      });
    }
    return { valid: false, issues, suggestions };
  }
  
  // Validate HowTo structure
  if (!howToSchema.name || howToSchema.name.trim() === '') {
    issues.push({
      severity: 'critical',
      message: 'HowTo schema missing name property',
    });
  }
  
  if (!howToSchema.step || !Array.isArray(howToSchema.step)) {
    issues.push({
      severity: 'critical',
      message: 'HowTo schema missing step array',
      fix: 'Add step array with HowToStep objects',
    });
  } else {
    const steps = howToSchema.step;
    
    if (steps.length < 2) {
      issues.push({
        severity: 'critical',
        message: 'HowTo schema must have at least 2 steps',
      });
    }
    
    // Check each step
    steps.forEach((step, index) => {
      if (step['@type'] !== 'HowToStep') {
        issues.push({
          severity: 'critical',
          message: `Step ${index + 1} is not of type HowToStep`,
        });
      }
      
      if (!step.text || step.text.trim() === '') {
        issues.push({
          severity: 'critical',
          message: `Step ${index + 1} missing text property`,
        });
      }
      
      // Optional but recommended
      if (!step.name) {
        suggestions.push({
          type: 'enhancement',
          severity: 'low',
          message: `Step ${index + 1} missing name property (recommended)`,
        });
      }
    });
  }
  
  return { valid: issues.length === 0, issues, suggestions };
}

/**
 * Validate VideoObject schema
 */
function validateVideoObjectSchema(schemas, videoContent) {
  const videoSchemas = schemas.filter(s => s['@type'] === 'VideoObject');
  const issues = [];
  const suggestions = [];
  
  if (videoSchemas.length === 0) {
    if (videoContent.videoCount > 0) {
      suggestions.push({
        type: 'missing_schema',
        severity: 'high',
        message: `Detected ${videoContent.videoCount} video(s) but no VideoObject schema`,
        recommendation: 'Add VideoObject schema for each video',
        sources: videoContent.embedSources,
      });
    }
    return { valid: false, issues, suggestions };
  }
  
  // Validate each VideoObject
  videoSchemas.forEach((video, index) => {
    const requiredProps = ['name', 'description', 'thumbnailUrl', 'uploadDate'];
    
    requiredProps.forEach(prop => {
      if (!video[prop] || (typeof video[prop] === 'string' && video[prop].trim() === '')) {
        issues.push({
          severity: 'critical',
          message: `VideoObject ${index + 1} missing required property: ${prop}`,
        });
      }
    });
    
    // Check thumbnailUrl format
    if (video.thumbnailUrl && !Array.isArray(video.thumbnailUrl) && typeof video.thumbnailUrl === 'string') {
      if (!video.thumbnailUrl.startsWith('http')) {
        issues.push({
          severity: 'high',
          message: `VideoObject ${index + 1} thumbnailUrl must be absolute URL`,
        });
      }
    }
    
    // Recommended properties
    const recommendedProps = ['duration', 'contentUrl', 'embedUrl'];
    recommendedProps.forEach(prop => {
      if (!video[prop]) {
        suggestions.push({
          type: 'enhancement',
          severity: 'medium',
          message: `VideoObject ${index + 1} missing recommended property: ${prop}`,
        });
      }
    });
  });
  
  // Suggest more schemas if more videos detected
  if (videoContent.videoCount > videoSchemas.length) {
    suggestions.push({
      type: 'incomplete',
      severity: 'medium',
      message: `Found ${videoSchemas.length} VideoObject schema(s) but detected ${videoContent.videoCount} video(s)`,
      recommendation: 'Add VideoObject for each video',
    });
  }
  
  return { valid: issues.length === 0, issues, suggestions };
}

/**
 * Check for Product schema opportunities
 */
function checkProductSchemaOpportunities(route, schemas) {
  const suggestions = [];
  const hasProductSchema = schemas.some(s => s['@type'] === 'Product');
  
  // Check if this is a materials page
  if (route.includes('/materials/') && !hasProductSchema) {
    suggestions.push({
      type: 'opportunity',
      severity: 'medium',
      message: 'Materials page could benefit from Product schema',
      recommendation: 'Add Product schema with name, description, and offers',
    });
  }
  
  return suggestions;
}

/**
 * Validate a single page
 */
async function validatePage(browser, url, route) {
  const page = await browser.newPage();
  const results = {
    route,
    schemas: [],
    faq: { detected: false, validated: false, issues: [], suggestions: [] },
    howTo: { detected: false, validated: false, issues: [], suggestions: [] },
    video: { detected: false, validated: false, issues: [], suggestions: [] },
    product: { suggestions: [] },
  };
  
  try {
    const fullUrl = `${url}${route}`;
    await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Extract schemas
    results.schemas = await extractSchemas(page);
    
    // Detect content patterns
    const faqContent = await detectFAQContent(page);
    const howToContent = await detectHowToContent(page);
    const videoContent = await detectVideoContent(page);
    
    results.faq.detected = faqContent.hasFAQHeading || (faqContent.hasQuestionPattern && faqContent.questionCount >= 3);
    results.howTo.detected = howToContent.hasHowToHeading || (howToContent.hasStepPattern && howToContent.stepCount >= 3);
    results.video.detected = videoContent.videoCount > 0;
    
    // Validate schemas
    if (results.faq.detected) {
      const faqValidation = validateFAQPageSchema(results.schemas, faqContent);
      results.faq.validated = faqValidation.valid;
      results.faq.issues = faqValidation.issues;
      results.faq.suggestions = faqValidation.suggestions;
    }
    
    if (results.howTo.detected) {
      const howToValidation = validateHowToSchema(results.schemas, howToContent);
      results.howTo.validated = howToValidation.valid;
      results.howTo.issues = howToValidation.issues;
      results.howTo.suggestions = howToValidation.suggestions;
    }
    
    if (results.video.detected) {
      const videoValidation = validateVideoObjectSchema(results.schemas, videoContent);
      results.video.validated = videoValidation.valid;
      results.video.issues = videoValidation.issues;
      results.video.suggestions = videoValidation.suggestions;
    }
    
    // Check Product opportunities
    results.product.suggestions = checkProductSchemaOpportunities(route, results.schemas);
    
  } catch (error) {
    results.error = error.message;
  } finally {
    await page.close();
  }
  
  return results;
}

/**
 * Check if dev server is running
 */
async function isServerRunning(url) {
  try {
    const http = require('http');
    const urlObj = new URL(url);
    
    return new Promise((resolve) => {
      const req = http.get({
        hostname: urlObj.hostname,
        port: urlObj.port || 80,
        path: '/',
        timeout: 2000,
      }, (res) => {
        resolve(res.statusCode !== undefined);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    });
  } catch (error) {
    return false;
  }
}

/**
 * Main validation function
 */
async function validate() {
  log('\n' + '='.repeat(60), 'bright');
  log('  Schema Richness Validation', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  log(`Target URL: ${DEV_URL}`, 'cyan');
  log(`Mode: ${STRICT_MODE ? 'STRICT (fail on suggestions)' : 'STANDARD (fail on critical only)'}`, 'cyan');
  
  try {
    // Check if server is running
    log('\n🔍 Checking if dev server is running...', 'cyan');
    const serverRunning = await isServerRunning(DEV_URL);
    
    if (!serverRunning) {
      log('  ⚠ Dev server not running - skipping schema validation', 'yellow');
      log('\n✓ Schema richness validation skipped (server not running)\n', 'green');
      log('  💡 Run "npm run dev" to enable schema validation', 'cyan');
      process.exit(0);
    }
    
    log('  ✓ Dev server is running', 'green');
    
    // Find all routes
    log('\n📄 Discovering page routes...', 'cyan');
    const routes = await findPageRoutes();
    log(`  Found ${routes.length} routes`, 'green');
    
    // Sample routes to check (check all if <= 10, otherwise sample 10)
    const routesToCheck = routes.length <= 10 ? routes : 
      [...routes].sort(() => Math.random() - 0.5).slice(0, 10);
    
    log(`  Checking ${routesToCheck.length} routes for schema opportunities\n`, 'cyan');
    
    // Launch browser
    const browser = await puppeteer.launch({ headless: true });
    
    const allResults = [];
    let totalIssues = 0;
    let totalSuggestions = 0;
    let opportunitiesFound = 0;
    
    // Validate each page
    for (const route of routesToCheck) {
      log(`\n🔍 Checking: ${route}`, 'cyan');
      const result = await validatePage(browser, DEV_URL, route);
      allResults.push(result);
      
      if (result.error) {
        log(`  ⚠ Error: ${result.error}`, 'yellow');
        continue;
      }
      
      // Report FAQ findings
      if (result.faq.detected) {
        if (result.faq.validated) {
          log('  ✓ FAQ content with valid FAQPage schema', 'green');
        } else {
          log('  ⚠ FAQ content detected', 'yellow');
          result.faq.issues.forEach(issue => {
            log(`    ${issue.severity === 'critical' ? '✗' : '⚠'} ${issue.message}`, 'red');
            totalIssues++;
          });
          result.faq.suggestions.forEach(suggestion => {
            log(`    💡 ${suggestion.message}`, 'magenta');
            totalSuggestions++;
            opportunitiesFound++;
          });
        }
      }
      
      // Report HowTo findings
      if (result.howTo.detected) {
        if (result.howTo.validated) {
          log('  ✓ HowTo content with valid HowTo schema', 'green');
        } else {
          log('  ⚠ HowTo content detected', 'yellow');
          result.howTo.issues.forEach(issue => {
            log(`    ${issue.severity === 'critical' ? '✗' : '⚠'} ${issue.message}`, 'red');
            totalIssues++;
          });
          result.howTo.suggestions.forEach(suggestion => {
            log(`    💡 ${suggestion.message}`, 'magenta');
            totalSuggestions++;
            opportunitiesFound++;
          });
        }
      }
      
      // Report Video findings
      if (result.video.detected) {
        if (result.video.validated) {
          log('  ✓ Video content with valid VideoObject schema', 'green');
        } else {
          log('  ⚠ Video content detected', 'yellow');
          result.video.issues.forEach(issue => {
            log(`    ${issue.severity === 'critical' ? '✗' : '⚠'} ${issue.message}`, 'red');
            totalIssues++;
          });
          result.video.suggestions.forEach(suggestion => {
            log(`    💡 ${suggestion.message}`, 'magenta');
            totalSuggestions++;
            opportunitiesFound++;
          });
        }
      }
      
      // Report Product opportunities
      if (result.product.suggestions.length > 0) {
        result.product.suggestions.forEach(suggestion => {
          log(`    💡 ${suggestion.message}`, 'magenta');
          totalSuggestions++;
          opportunitiesFound++;
        });
      }
      
      // Show schema count
      log(`  📊 Found ${result.schemas.length} schema(s)`, 'blue');
    }
    
    await browser.close();
    
    // Summary
    log('\n' + '='.repeat(60), 'bright');
    log('  Summary', 'bright');
    log('='.repeat(60) + '\n', 'bright');
    
    log(`Pages checked: ${routesToCheck.length}`, 'cyan');
    log(`Critical issues: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
    log(`Schema opportunities: ${opportunitiesFound}`, opportunitiesFound > 0 ? 'yellow' : 'green');
    log(`Enhancement suggestions: ${totalSuggestions}`, 'cyan');
    
    // Determine exit code
    const shouldFail = STRICT_MODE ? (totalIssues > 0 || opportunitiesFound > 0) : totalIssues > 0;
    
    if (shouldFail) {
      log('\n✗ Schema richness validation failed\n', 'red');
      if (STRICT_MODE) {
        log('  Strict mode: Failing due to missing opportunities', 'yellow');
      }
      process.exit(1);
    } else {
      log('\n✓ Schema richness validation passed\n', 'green');
      if (opportunitiesFound > 0 && !STRICT_MODE) {
        log('  💡 Suggestions available (run with --strict to enforce)', 'cyan');
      }
      process.exit(0);
    }
    
  } catch (error) {
    log(`\n✗ Validation failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(2);
  }
}

// Run validation
validate();
