#!/usr/bin/env node
/**
 * Run Content Validation
 * Validates frontmatter, metadata, naming, and breadcrumbs in sequence
 */

const { ValidationResult } = require('./exitCodes');

async function runValidation(name, command) {
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    console.log(`\n🔍 ${name}...`);
    const proc = spawn('bash', ['-c', command], { stdio: 'inherit' });
    
    proc.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  const result = new ValidationResult('Content Validation');
  
  // Run validations in sequence (they're interdependent)
  const validations = [
    { name: 'Frontmatter structure', command: 'node scripts/validation/content/validate-frontmatter-structure.js', critical: true },
    { name: 'Naming conventions', command: 'node scripts/validation/content/validate-naming-e2e.js', critical: true },
    { name: 'Metadata sync', command: 'node scripts/validation/content/validate-metadata-sync.js', critical: true },
    { name: 'Sitemap verification', command: 'bash scripts/sitemap/verify-sitemap.sh', critical: true },
    { name: 'Breadcrumbs', command: 'tsx scripts/validation/content/validate-breadcrumbs.ts', critical: false }
  ];
  
  for (const validation of validations) {
    const success = await runValidation(validation.name, validation.command);
    if (success) {
      result.addPassed(validation.name);
    } else {
      // Breadcrumbs is non-critical - treat as warning during migration
      if (validation.critical) {
        result.addFailure(validation.name);
      } else {
        result.addWarning(`${validation.name} validation failed (non-blocking during migration)`);
      }
    }
  }
  
  result.exit();
}

main().catch((error) => {
  console.error('Error running content validation:', error);
  process.exit(1);
});
