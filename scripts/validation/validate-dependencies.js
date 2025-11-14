#!/usr/bin/env node
/**
 * Dependency Validation Script
 * 
 * Validates that all required dependencies for prebuild scripts are installed.
 * Prevents build failures due to missing packages.
 * 
 * Run: node scripts/validation/validate-dependencies.js
 * In package.json: npm run validate:deps
 */

const fs = require('fs');
const path = require('path');

// Define required dependencies for each script group
const DEPENDENCIES = {
  'Validation Scripts': {
    'js-yaml': {
      scripts: ['validate-naming-e2e.js', 'validate-metadata-sync.js', 'validate-breadcrumbs.ts'],
      required: true
    },
    'glob': {
      scripts: ['validate-naming-e2e.js', 'validate-metadata-sync.js'],
      required: true
    },
    'tsx': {
      scripts: ['validate-breadcrumbs.ts', 'generate-datasets.ts'],
      required: true
    }
  },
  'Testing & Build': {
    'jest': {
      scripts: ['validate:jsonld (test suite)'],
      required: true
    },
    'jsdom': {
      scripts: ['validate-jsonld-urls.js'],
      required: true,
      devOnly: true
    }
  }
};

function checkDependency(packageName, isDevOnly = false) {
  try {
    // First check package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    if (dependencies[packageName] || devDependencies[packageName]) {
      return { installed: true, version: dependencies[packageName] || devDependencies[packageName], direct: true };
    }
    
    // Check if available as transitive dependency
    try {
      require.resolve(packageName);
      return { installed: true, version: 'transitive', direct: false };
    } catch (e) {
      return { installed: false, version: null, direct: false };
    }
    
  } catch (error) {
    return { installed: false, version: null, error: error.message, direct: false };
  }
}

function validateAllDependencies() {
  console.log('🔍 Validating Prebuild Dependencies\n');
  console.log('='.repeat(70) + '\n');
  
  let missingCount = 0;
  let totalCount = 0;
  const missing = [];
  
  for (const [category, deps] of Object.entries(DEPENDENCIES)) {
    console.log(`📦 ${category}:\n`);
    
    for (const [pkg, info] of Object.entries(deps)) {
      totalCount++;
      const result = checkDependency(pkg, info.devOnly);
      
      if (result.installed) {
        const versionInfo = result.direct ? result.version : `${result.version} (indirect)`;
        console.log(`   ✅ ${pkg.padEnd(20)} ${versionInfo}`);
        if (info.scripts.length > 0) {
          console.log(`      Used by: ${info.scripts.join(', ')}`);
        }
      } else {
        console.log(`   ❌ ${pkg.padEnd(20)} NOT INSTALLED`);
        console.log(`      Required by: ${info.scripts.join(', ')}`);
        missingCount++;
        missing.push({
          package: pkg,
          scripts: info.scripts,
          devOnly: info.devOnly
        });
      }
      console.log('');
    }
  }
  
  console.log('='.repeat(70) + '\n');
  console.log(`📊 Summary: ${totalCount - missingCount}/${totalCount} dependencies installed\n`);
  
  if (missingCount > 0) {
    console.log('❌ MISSING DEPENDENCIES:\n');
    
    const prodPackages = missing.filter(m => !m.devOnly).map(m => m.package);
    const devPackages = missing.filter(m => m.devOnly).map(m => m.package);
    
    if (prodPackages.length > 0) {
      console.log('Install production dependencies:');
      console.log(`   npm install --save ${prodPackages.join(' ')}\n`);
    }
    
    if (devPackages.length > 0) {
      console.log('Install development dependencies:');
      console.log(`   npm install --save-dev ${devPackages.join(' ')}\n`);
    }
    
    console.log('⚠️  Build may fail without these dependencies!\n');
    process.exit(1);
  } else {
    console.log('✅ All required dependencies are installed!\n');
    console.log('🎉 Prebuild scripts are ready to run.\n');
    process.exit(0);
  }
}

// Run validation
validateAllDependencies();
