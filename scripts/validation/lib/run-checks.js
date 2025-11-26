#!/usr/bin/env node
/**
 * Run Comprehensive Pre-Push Validation
 * Fast validations that don't require running server (runs in parallel)
 * 
 * Excludes server-dependent checks (JSON-LD rendering, SEO, accessibility)
 * which run during deployment validation instead.
 */

const { runParallel, validation, exitWithResults } = require('./parallel');

async function main() {
  const validations = [
    // Code quality (critical)
    validation('Type check', 'npx tsc --noEmit'),
    validation('Linting', 'npx eslint app/ --ext .ts,.tsx'),
    
    // Testing (critical)
    validation('Unit tests', 'npx jest tests/utils tests/lib --coverage=false --passWithNoTests'),
    validation('Component tests', 'npx jest tests/components --coverage=false --passWithNoTests'),
    
    // Content validation (critical)
    validation('Frontmatter structure', 'node scripts/validation/content/validate-frontmatter-structure.js'),
    validation('Naming conventions', 'node scripts/validation/content/validate-naming-e2e.js'),
    validation('Metadata sync', 'node scripts/validation/content/validate-metadata-sync.js'),
    validation('Breadcrumbs', 'tsx scripts/validation/content/validate-breadcrumbs.ts'),
    
    // Schema validation (critical)
    validation('JSON-LD syntax', 'node scripts/validation/jsonld/validate-jsonld-syntax.js'),
    
    // Sitemap (critical)
    validation('Sitemap structure', 'bash scripts/sitemap/verify-sitemap.sh')
  ];
  
  const results = await runParallel(validations);
  exitWithResults(results);
}

main().catch((error) => {
  console.error('Error running checks:', error);
  process.exit(1);
});
