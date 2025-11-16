#!/usr/bin/env node
/**
 * Run Quick Quality Checks
 * Fast pre-push validation (runs in parallel)
 */

const { runParallel, validation, exitWithResults } = require('./parallel');

async function main() {
  const validations = [
    validation('Type check', 'npx tsc --noEmit'),
    validation('Linting', 'npx eslint app/ --ext .ts,.tsx'),
    validation('Unit tests', 'npx jest tests/utils tests/lib --coverage=false --passWithNoTests'),
    validation('Naming conventions', 'node scripts/validation/content/validate-naming-e2e.js'),
    validation('Metadata sync', 'node scripts/validation/content/validate-metadata-sync.js')
  ];
  
  const results = await runParallel(validations);
  exitWithResults(results);
}

main().catch((error) => {
  console.error('Error running checks:', error);
  process.exit(1);
});
