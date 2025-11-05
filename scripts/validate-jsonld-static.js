#!/usr/bin/env node

/**
 * Validate JSON-LD in Static Build
 * Tests that JSON-LD schemas are properly rendered in built HTML files
 */

const fs = require('fs');
const path = require('path');

const TEST_PAGES = [
  {
    file: '.next/server/app/materials/ceramic/oxide.html',
    name: 'Subcategory Page (Ceramic Oxide)',
    expectedSchemas: ['CollectionPage', 'BreadcrumbList', 'ItemList', 'Dataset', 'WebPage']
  },
  {
    file: '.next/server/app/materials/ceramic/carbide.html',
    name: 'Subcategory Page (Ceramic Carbide)',
    expectedSchemas: ['CollectionPage', 'BreadcrumbList', 'ItemList', 'Dataset', 'WebPage']
  },
  {
    file: '.next/server/app/materials/ceramic/oxide/alumina-laser-cleaning.html',
    name: 'Material Page (Alumina)',
    expectedSchemas: ['Article', 'Dataset', 'HowTo', 'Product', 'BreadcrumbList', 'Person']
  },
  {
    file: '.next/server/app/index.html',
    name: 'Home Page',
    expectedSchemas: ['Organization', 'WebSite'] // Home has Organization + WebSite from layout
  }
];

function extractJsonLd(html) {
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      matches.push(json);
    } catch (e) {
      console.warn('⚠️  Failed to parse JSON-LD:', e.message);
    }
  }
  
  return matches;
}

function validateSchemas(schemas, expectedTypes) {
  const foundTypes = new Set();
  
  schemas.forEach(schema => {
    if (schema['@graph']) {
      schema['@graph'].forEach(entity => {
        if (entity['@type']) {
          foundTypes.add(entity['@type']);
        }
      });
    } else if (schema['@type']) {
      foundTypes.add(schema['@type']);
    }
  });
  
  return {
    foundTypes: Array.from(foundTypes),
    missing: expectedTypes.filter(type => !foundTypes.has(type)),
    extra: Array.from(foundTypes).filter(type => !expectedTypes.includes(type))
  };
}

function testPage(page) {
  console.log(`\n📄 Testing: ${page.name}`);
  console.log(`   File: ${page.file}`);
  
  const filePath = path.join(process.cwd(), page.file);
  
  if (!fs.existsSync(filePath)) {
    console.log('   ❌ File not found!');
    return false;
  }
  
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const schemas = extractJsonLd(html);
    
    if (schemas.length === 0) {
      console.log('   ❌ No JSON-LD found in HTML!');
      return false;
    }
    
    console.log(`   ✅ Found ${schemas.length} JSON-LD block(s)`);
    
    const validation = validateSchemas(schemas, page.expectedSchemas);
    console.log(`   📊 Schema types: ${validation.foundTypes.join(', ')}`);
    
    if (validation.missing.length > 0) {
      console.log(`   ⚠️  Missing schemas: ${validation.missing.join(', ')}`);
      return false;
    }
    
    if (validation.extra.length > 0) {
      console.log(`   ℹ️  Extra schemas: ${validation.extra.join(', ')}`);
    }
    
    console.log('   ✅ All expected schemas present');
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  JSON-LD Static Build Validation');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Check if build exists
  const buildPath = path.join(process.cwd(), '.next/server/app');
  if (!fs.existsSync(buildPath)) {
    console.error('❌ Build not found! Run "npm run build" first.\n');
    process.exit(1);
  }
  
  const results = [];
  for (const page of TEST_PAGES) {
    const passed = testPage(page);
    results.push({ page: page.name, passed });
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}\n`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! JSON-LD is rendering correctly.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check output above.\n');
    process.exit(1);
  }
}

main();
