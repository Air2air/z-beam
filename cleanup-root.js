#!/usr/bin/env node

/**
 * Root Directory Cleanup Script
 * 
 * Safely removes common dead/outdated files from the project root:
 * - Documentation files (*_COMPLETE.md, *_SUMMARY.md, *_ASSESSMENT.md, *_FINAL.md, *_IMPROVEMENTS.md)
 * - Project documentation (GITHUB_ACTIONS_*.md, PACKAGE_SCRIPTS_*.md, PREDEPLOY_*.md, VERCEL_*.md)
 * - Progress/analysis documentation (*_PROGRESS.md, *_ANALYSIS.md, *_REPORT.md)
 * - Legacy test files in root (test-*.js)
 * - Debug scripts (debug-*.js) 
 * - Cleanup utilities (cleanup-*.js, cleanup-*.sh, except cleanup-root.js)
 * - Author system files (author-*.js, evaluate-*.js, final-*.js)
 * - Legacy predeploy versions (streamlined-predeploy*.js, adaptive-predeploy*.js)
 * - Predeploy artifacts (predeploy-*.json, terminal-insights.json)
 * - Build artifacts (*.tsbuildinfo)
 * - Backup files (*.backup, *.bak, *.orig, *.log)
 * 
 * Protected files include essential configs, current predeploy system, and core utilities.
 * 
 * Usage: npm run cleanup:root
 */

const fs = require('fs');
const path = require('path');

// Files that should never be removed
const PROTECTED_FILES = [
  'package.json', 'package-lock.json', 'README.md', 'next.config.js',
  'tailwind.config.js', 'tsconfig.json', 'tsconfig.prod.json', 
  'postcss.config.js', 'next-env.d.ts', 'vercel.json', '.env', 
  '.env.local', '.env.example', '.nvmrc', '.gitignore', 
  '.eslintrc.json', 'stop-dev-server.sh', 'cleanup-root.js',
  'jest.config.js', 'intelligent-predeploy.js', 'terminal-log-monitor.js',
  'production-build-validator.js', 'vercel-diagnostics.js'
];

// Patterns for files to clean up
const CLEANUP_PATTERNS = [
  /.*_(COMPLETE|SUMMARY|PROGRESS|ANALYSIS|REPORT|EVALUATION|IMPLEMENTATION|PLAN|ASSESSMENT|FINAL|IMPROVEMENTS|STANDARDIZATION|CONSOLIDATION|GUIDE)\.md$/i,
  /^test-.*\.js$/,
  /.*\.tsbuildinfo$/,
  /.*\.(backup|bak|orig|log)$/,
  /^debug-.*\.js$/,
  /^cleanup-.*\.js$/,
  /^cleanup-.*\.sh$/,
  /^author-.*\.js$/,
  /^evaluate-.*\.js$/,
  /^final-.*\.js$/,
  /^remove-.*\.js$/,
  /^streamlined-predeploy.*\.js$/,
  /^adaptive-predeploy.*\.js$/,
  /predeploy-.*\.json$/,
  /terminal-insights\.json$/,
  /^predeploy-self-optimizer\.js$/,
  /^GITHUB_ACTIONS_.*\.md$/i,
  /^PACKAGE_SCRIPTS_.*\.md$/i,
  /^PREDEPLOY_.*\.md$/i,
  /^VERCEL_.*\.md$/i
];

function shouldCleanFile(filename) {
  if (PROTECTED_FILES.includes(filename)) {
    return false;
  }
  
  return CLEANUP_PATTERNS.some(pattern => pattern.test(filename));
}

function main() {
  const rootDir = process.cwd();
  
  console.log('🧹 Cleaning root directory...');
  console.log('');
  
  try {
    // Get all files in root
    const items = fs.readdirSync(rootDir);
    const files = items.filter(item => {
      const fullPath = path.join(rootDir, item);
      return fs.statSync(fullPath).isFile();
    });
    
    // Find files to clean
    const filesToClean = files.filter(shouldCleanFile);
    
    if (filesToClean.length === 0) {
      console.log('✨ Root directory is already clean!');
      return;
    }
    
    console.log(`Found ${filesToClean.length} files to clean:`);
    filesToClean.forEach(file => console.log(`  🗑️  ${file}`));
    console.log('');
    
    // Remove files
    let cleaned = 0;
    let errors = 0;
    
    for (const filename of filesToClean) {
      try {
        const fullPath = path.join(rootDir, filename);
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed: ${filename}`);
        cleaned++;
      } catch (error) {
        console.log(`❌ Error removing ${filename}: ${error.message}`);
        errors++;
      }
    }
    
    console.log('');
    console.log(`✨ Cleanup complete! Removed ${cleaned} files`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} files could not be removed`);
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
