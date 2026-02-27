#!/usr/bin/env node
/**
 * Complete Post-Deployment Validation Orchestrator
 * 
 * Runs all validation checks in the correct order and aggregates results.
 * This ensures NOTHING is missed after deployment.
 * 
 * Usage: npm run postdeploy
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

// Ensure Chrome is findable on macOS for Lighthouse/Core Web Vitals checks
if (!process.env.CHROME_PATH) {
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const { existsSync } = require('fs');
  if (existsSync(macChrome)) {
    process.env.CHROME_PATH = macChrome;
  }
}

// Validation categories and their commands
const VALIDATION_SUITE = {
  '1. Core Functionality': [
    { name: 'Site Accessibility', command: 'curl -Is https://www.z-beam.com | head -1' },
    { name: 'Material Pages Load', command: 'curl -Is https://www.z-beam.com/materials/aluminum-laser-cleaning | head -1' },
    { name: 'Materials Index Load', command: 'curl -Is https://www.z-beam.com/materials | head -1' }
  ],
  
  '2. Content Validation': [
    { name: 'Frontmatter Structure', command: 'node scripts/validation/content/validate-frontmatter-structure.js' },
    { name: 'Metadata Sync', command: 'node scripts/validation/content/validate-metadata-sync.js' },
    { name: 'Naming Conventions', command: 'node scripts/validation/content/validate-naming-e2e.js' },
    { name: 'Breadcrumbs', command: 'tsx scripts/validation/content/validate-breadcrumbs.ts' }
  ],
  
  '3. SEO & Schemas': [
    { name: 'Comprehensive SEO Testing 🔥', command: 'npm run test:seo:comprehensive' },
    { name: 'SEO Infrastructure', command: 'node scripts/validation/seo/validate-seo-infrastructure.js' },
    { name: 'Schema Richness', command: 'node scripts/validation/jsonld/validate-schema-richness.js' },
    { name: 'Sitemap Verification', command: 'bash scripts/sitemap/verify-sitemap.sh' },
    { name: 'URL Validation', command: 'node scripts/validation/jsonld/validate-jsonld-urls.js' }
  ],
  
  '4. Performance': [
    {
      name: 'Core Web Vitals',
      command: 'node scripts/validation/seo/validate-core-web-vitals.js',
      retries: 1
    },
    {
      name: 'Lighthouse Metrics',
      command: 'node scripts/validation/seo/validate-lighthouse-metrics.js',
      retries: 1
    }
  ],
  
  '5. Accessibility': [
    { name: 'WCAG 2.2 Compliance', command: 'node scripts/validation/accessibility/validate-wcag-2.2.js' },
    { name: 'Static A11y Check', command: 'node scripts/validation/accessibility/validate-static-a11y.js' }
  ],
  
  '6. Production Environment': [
    {
      name: 'Comprehensive Production Check',
      command: 'node scripts/validation/post-deployment/validate-production-comprehensive.js --skip-external',
      timeout: 900000,
      retries: 1
    }
  ],

  '7. Advanced SEO Hardening': [
    {
      name: 'Delta Sitemap Generation',
      command: 'node scripts/seo/advanced/generate-delta-sitemap.js',
      critical: false
    },
    {
      name: 'Crawl Budget Policy',
      command: 'node scripts/seo/advanced/validate-crawl-budget-policy.js',
      critical: false,
      retries: 1
    },
    {
      name: 'Canonical Graph Audit',
      command: 'node scripts/seo/advanced/analyze-canonical-graph.js',
      critical: false,
      retries: 1
    },
    {
      name: 'Entity Graph Consistency',
      command: 'node scripts/seo/advanced/validate-entity-graph-consistency.js',
      critical: false,
      retries: 1
    },
    {
      name: 'Soft-404 / Orphan Detection',
      command: 'node scripts/seo/advanced/detect-soft404-orphans.js',
      critical: false,
      retries: 1
    },
    {
      name: 'Bot Log Intelligence',
      command: 'node scripts/seo/advanced/analyze-bot-logs.js',
      critical: false,
      optional: true
    },
    {
      name: 'SERP Trend Monitoring',
      command: 'node scripts/seo/advanced/monitor-serp-trends.js',
      critical: false,
      optional: true
    }
  ]
};

// Results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  failedCritical: 0,
  failedNonCritical: 0,
  skipped: 0,
  categories: {}
};

// Utility: Run command and capture result
function runValidation(name, command, optional = false, timeout = 300000, retries = 0, critical = true) {
  results.total++;
  
  console.log(`\n   🔍 ${name}...`);
  const attempts = retries + 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const output = execSync(command, {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout
      });

      console.log(`   ✅ ${chalk.green('PASSED')}${attempt > 1 ? chalk.gray(` (attempt ${attempt}/${attempts})`) : ''}`);
      results.passed++;
      return { status: 'passed', output, attempt };
    } catch (error) {
      const canRetry = attempt < attempts;
      if (canRetry) {
        console.log(`   ⚠️  ${chalk.yellow(`Retrying (${attempt}/${attempts}) due to transient failure...`)}`);
        continue;
      }

      if (optional) {
        console.log(`   ⏭️  ${chalk.gray('SKIPPED (optional)')}`);
        results.skipped++;
        return { status: 'skipped', error: error.message, attempt };
      }

      const failureLabel = critical ? 'FAILED' : 'WARN (non-critical)';
      const failureColor = critical ? chalk.red : chalk.yellow;
      console.log(`   ❌ ${failureColor(failureLabel)}`);
      console.error(`      ${error.message}`);
      results.failed++;
      if (critical) {
        results.failedCritical++;
      } else {
        results.failedNonCritical++;
      }
      return { status: 'failed', error: error.message, attempt, critical };
    }
  }
}

// Main execution
async function main() {
  console.log(chalk.bold('\n' + '='.repeat(70)));
  console.log(chalk.bold.cyan('   COMPREHENSIVE POST-DEPLOYMENT VALIDATION'));
  console.log(chalk.bold('='.repeat(70)));
  console.log(`   Target: ${process.env.PRODUCTION_URL || 'https://www.z-beam.com'}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  
  // Run all validation categories
  for (const [category, checks] of Object.entries(VALIDATION_SUITE)) {
    console.log(chalk.bold(`\n📋 ${category}`));
    console.log('─'.repeat(70));
    
    const categoryResults = [];
    
    for (const check of checks) {
      const result = runValidation(
        check.name,
        check.command,
        check.optional,
        check.timeout,
        check.retries || 0,
        check.critical !== false
      );
      categoryResults.push(result);
    }
    
    results.categories[category] = categoryResults;
  }
  
  // Generate summary report
  console.log(chalk.bold('\n' + '='.repeat(70)));
  console.log(chalk.bold('   VALIDATION SUMMARY'));
  console.log('='.repeat(70));
  
  console.log(`\n   Total Checks:  ${results.total}`);
  console.log(`   ✅ Passed:     ${chalk.green(results.passed)}`);
  console.log(`   ❌ Failed:     ${chalk.red(results.failed)}`);
  console.log(`   🚨 Critical:   ${chalk.red(results.failedCritical)}`);
  console.log(`   ⚠️  Non-Crit:   ${chalk.yellow(results.failedNonCritical)}`);
  console.log(`   ⏭️  Skipped:    ${chalk.gray(results.skipped)}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\n   Success Rate: ${successRate}%`);
  
  // Determine overall status
  if (results.failed === 0) {
    console.log(chalk.bold.green('\n   🎉 ALL VALIDATIONS PASSED!'));
    console.log(chalk.green('   ✅ Production deployment is healthy\n'));
    process.exit(0);
  } else if (results.failedCritical === 0) {
    console.log(chalk.bold.yellow('\n   ⚠️  VALIDATION PASSED WITH WARNINGS'));
    console.log(chalk.yellow(`   ${results.failedNonCritical} non-critical checks failed`));
    console.log(chalk.yellow('   Review failures and consider fixes\n'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n   ❌ VALIDATION FAILED'));
    console.log(chalk.red(`   ${results.failedCritical} critical checks failed`));
    console.log(chalk.red('   Consider rollback or hotfix\n'));
    process.exit(1);
  }
}

// Run validation
main().catch(error => {
  console.error(chalk.red('\n❌ FATAL ERROR:'), error);
  process.exit(1);
});
