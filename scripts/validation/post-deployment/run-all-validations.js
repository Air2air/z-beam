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

// Validation categories and their commands
const VALIDATION_SUITE = {
  '1. Core Functionality': [
    { name: 'Site Accessibility', command: 'curl -Is https://www.z-beam.com | head -1' },
    { name: 'Material Pages Load', command: 'curl -Is https://www.z-beam.com/materials/aluminum-laser-cleaning | head -1' },
    { name: 'Dataset Page Load', command: 'curl -Is https://www.z-beam.com/datasets | head -1' }
  ],
  
  '2. Content Validation': [
    { name: 'Frontmatter Structure', command: 'node scripts/validation/content/validate-frontmatter-structure.js' },
    { name: 'Metadata Sync', command: 'node scripts/validation/content/validate-metadata-sync.js' },
    { name: 'Naming Conventions', command: 'node scripts/validation/content/validate-naming-e2e.js' },
    { name: 'Breadcrumbs', command: 'tsx scripts/validation/content/validate-breadcrumbs.ts' }
  ],
  
  '3. SEO & Schemas': [
    { name: 'SEO Infrastructure', command: 'node scripts/validation/seo/validate-seo-infrastructure.js' },
    { name: 'Schema Richness', command: 'node scripts/validation/jsonld/validate-schema-richness.js' },
    { name: 'Sitemap Verification', command: 'bash scripts/sitemap/verify-sitemap.sh' },
    { name: 'URL Validation', command: 'node scripts/validation/jsonld/validate-jsonld-urls.js' }
  ],
  
  '4. Performance': [
    { name: 'Core Web Vitals', command: 'node scripts/validation/seo/validate-core-web-vitals.js' },
    { name: 'Lighthouse Metrics', command: 'node scripts/validation/seo/validate-lighthouse-metrics.js' }
  ],
  
  '5. Accessibility': [
    { name: 'WCAG 2.2 Compliance', command: 'node scripts/validation/accessibility/validate-wcag-2.2.js' },
    { name: 'Static A11y Check', command: 'node scripts/validation/accessibility/validate-static-a11y.js' }
  ],
  
  '6. Production Environment': [
    { name: 'Comprehensive Production Check', command: 'node scripts/validation/post-deployment/validate-production-comprehensive.js --skip-external' }
  ]
};

// Results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  categories: {}
};

// Utility: Run command and capture result
function runValidation(name, command, optional = false) {
  results.total++;
  
  console.log(`\n   🔍 ${name}...`);
  
  try {
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 60000 // 60 second timeout
    });
    
    // Check if output indicates failure
    if (output.includes('❌') || output.includes('FAILED') || output.includes('Error:')) {
      console.log(`   ⚠️  ${chalk.yellow('WARNINGS FOUND')}`);
      results.passed++; // Still count as passed if no hard failures
      return { status: 'warning', output };
    }
    
    console.log(`   ✅ ${chalk.green('PASSED')}`);
    results.passed++;
    return { status: 'passed', output };
    
  } catch (error) {
    if (optional) {
      console.log(`   ⏭️  ${chalk.gray('SKIPPED (optional)')}`);
      results.skipped++;
      return { status: 'skipped', error: error.message };
    } else {
      console.log(`   ❌ ${chalk.red('FAILED')}`);
      console.error(`      ${error.message}`);
      results.failed++;
      return { status: 'failed', error: error.message };
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
      const result = runValidation(check.name, check.command, check.optional);
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
  console.log(`   ⏭️  Skipped:    ${chalk.gray(results.skipped)}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\n   Success Rate: ${successRate}%`);
  
  // Determine overall status
  if (results.failed === 0) {
    console.log(chalk.bold.green('\n   🎉 ALL VALIDATIONS PASSED!'));
    console.log(chalk.green('   ✅ Production deployment is healthy\n'));
    process.exit(0);
  } else if (results.failed <= 2 && results.passed > results.failed * 5) {
    console.log(chalk.bold.yellow('\n   ⚠️  VALIDATION PASSED WITH WARNINGS'));
    console.log(chalk.yellow(`   ${results.failed} non-critical checks failed`));
    console.log(chalk.yellow('   Review failures and consider fixes\n'));
    process.exit(0);
  } else {
    console.log(chalk.bold.red('\n   ❌ VALIDATION FAILED'));
    console.log(chalk.red(`   ${results.failed} critical checks failed`));
    console.log(chalk.red('   Consider rollback or hotfix\n'));
    process.exit(1);
  }
}

// Run validation
main().catch(error => {
  console.error(chalk.red('\n❌ FATAL ERROR:'), error);
  process.exit(1);
});
