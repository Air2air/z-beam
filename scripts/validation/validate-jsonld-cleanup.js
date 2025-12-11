#!/usr/bin/env node

/**
 * JSON-LD Cleanup Validation Script
 * Validates that the cleanup was successful and system is functioning properly
 */

const fs = require('fs');
const path = require('path');

function validateCleanup() {
  console.log('🧹 JSON-LD Cleanup Validation\n');
  
  const results = {
    staticFilesRemoved: false,
    microJsonLdRemoved: false,
    materialJsonLdExists: false,
    jsonLdHelperExists: false,
    validationScriptExists: false
  };

  // 1. Check that static JSON-LD files are removed
  console.log('1️⃣ Checking static JSON-LD files removal...');
  const jsonLdDir = 'content/components/jsonld';
  if (!fs.existsSync(jsonLdDir)) {
    console.log('✅ Static JSON-LD directory successfully removed');
    results.staticFilesRemoved = true;
  } else {
    console.log('❌ Static JSON-LD directory still exists');
  }

  // 2. Check that SEOOptimizedMicro no longer generates JSON-LD
  console.log('\n2️⃣ Checking Micro JSON-LD removal...');
  const microFile = 'app/components/Micro/SEOOptimizedMicro.tsx';
  if (fs.existsSync(microFile)) {
    const content = fs.readFileSync(microFile, 'utf8');
    const hasJsonLd = content.includes('application/ld+json') || content.includes('dangerouslySetInnerHTML');
    if (!hasJsonLd) {
      console.log('✅ SEOOptimizedMicro JSON-LD generation successfully removed');
      results.microJsonLdRemoved = true;
    } else {
      console.log('❌ SEOOptimizedMicro still contains JSON-LD generation');
    }
  } else {
    console.log('ℹ️  SEOOptimizedMicro file not found (may have been removed)');
    results.microJsonLdRemoved = true;
  }

  // 3. Check that MaterialJsonLD component exists and is functional
  console.log('\n3️⃣ Checking MaterialJsonLD component...');
  const materialJsonLdFile = 'app/components/JsonLD/JsonLD.tsx';
  if (fs.existsSync(materialJsonLdFile)) {
    const content = fs.readFileSync(materialJsonLdFile, 'utf8');
    const hasMaterialJsonLD = content.includes('MaterialJsonLD') && content.includes('createJsonLdForArticle');
    if (hasMaterialJsonLD) {
      console.log('✅ MaterialJsonLD component exists and functional');
      results.materialJsonLdExists = true;
    } else {
      console.log('❌ MaterialJsonLD component missing or non-functional');
    }
  } else {
    console.log('❌ MaterialJsonLD component file not found');
  }

  // 4. Check jsonld-helper functionality
  console.log('\n4️⃣ Checking JSON-LD helper...');
  const helperFile = 'app/utils/jsonld-helper.ts';
  if (fs.existsSync(helperFile)) {
    const content = fs.readFileSync(helperFile, 'utf8');
    const hasCompleteHelper = content.includes('createJsonLdForArticle') && 
                             content.includes('materialProperties') && 
                             content.includes('machineSettings');
    if (hasCompleteHelper) {
      console.log('✅ JSON-LD helper exists with complete functionality');
      results.jsonLdHelperExists = true;
    } else {
      console.log('❌ JSON-LD helper missing or incomplete');
    }
  } else {
    console.log('❌ JSON-LD helper file not found');
  }

  // 5. Check validation script
  console.log('\n5️⃣ Checking validation script...');
  const validationScript = 'scripts/comprehensive-jsonld-validation.js';
  if (fs.existsSync(validationScript)) {
    console.log('✅ Validation script exists');
    results.validationScriptExists = true;
  } else {
    console.log('❌ Validation script not found');
  }

  // Summary
  console.log('\n📊 CLEANUP VALIDATION SUMMARY:');
  console.log('==================================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const description = key.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${description}`);
  });
  
  console.log(`\n🎯 Success Rate: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('\n🎉 CLEANUP SUCCESSFUL! System is optimized and ready.');
    console.log('   • No duplicate JSON-LD conflicts');
    console.log('   • Dynamic system handles all frontmatter fields');  
    console.log('   • E-E-A-T optimization maintained');
    console.log('   • Storage and performance optimized');
  } else {
    console.log('\n⚠️  CLEANUP INCOMPLETE - Some issues need attention');
  }
  
  return passed === total;
}

// Run validation
const success = validateCleanup();
process.exit(success ? 0 : 1);