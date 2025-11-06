#!/usr/bin/env node

// Redirect to fast static validator (validates pre-built HTML, ~1s vs 130s)
console.log('⚡ Redirecting to fast static validator...\n');

const { execSync } = require('child_process');
try {
  execSync('node scripts/validate-jsonld-static.js', { stdio: 'inherit', cwd: process.cwd() });
} catch (error) {
  process.exit(error.status || 1);
}
