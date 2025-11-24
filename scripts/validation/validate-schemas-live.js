#!/usr/bin/env node

/**
 * Live Schema Validation Script
 * Validates that JSON-LD schemas are properly rendered on live site
 */

const https = require('https');

const SITE_URL = 'https://www.z-beam.com';

const TEST_URLS = [
  '/',
  '/materials/metal/non-ferrous/aluminum-laser-cleaning',
  '/materials/metal/ferrous/stainless-steel-laser-cleaning',
  '/materials/composite/fiber-reinforced-polymer-laser-cleaning',
];

const EXPECTED_SCHEMAS = {
  '/': ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList'],
  '/materials/metal/non-ferrous/aluminum-laser-cleaning': [
    'Organization',
    'WebSite',
    'Article',
    'FAQPage',
    'Dataset',
    'Person',
    'ImageObject',
    'WebPage',
    'BreadcrumbList',
  ],
};

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractSchemas(html) {
  const scripts = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs) || [];
  const schemas = new Set();
  
  scripts.forEach(script => {
    try {
      const jsonStr = script.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
      const data = JSON.parse(jsonStr);
      
      if (data['@graph']) {
        data['@graph'].forEach(item => {
          if (item['@type']) schemas.add(item['@type']);
        });
      } else if (data['@type']) {
        schemas.add(data['@type']);
      }
    } catch (e) {
      // Ignore parse errors
    }
  });
  
  return Array.from(schemas);
}

async function validateSchemas() {
  console.log('🔍 Validating JSON-LD Schemas on Live Site\n');
  
  let allPassed = true;
  
  for (const path of TEST_URLS) {
    const url = SITE_URL + path;
    console.log(`\n📄 Testing: ${path}`);
    
    try {
      const html = await fetchPage(url);
      const foundSchemas = extractSchemas(html);
      const expected = EXPECTED_SCHEMAS[path] || [];
      
      console.log(`   Found ${foundSchemas.length} schemas: ${foundSchemas.join(', ')}`);
      
      if (expected.length > 0) {
        const missing = expected.filter(s => !foundSchemas.includes(s));
        if (missing.length > 0) {
          console.log(`   ❌ Missing: ${missing.join(', ')}`);
          allPassed = false;
        } else {
          console.log(`   ✅ All expected schemas present`);
        }
      } else {
        console.log(`   ℹ️  No expectations defined`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All schema validations passed!');
    process.exit(0);
  } else {
    console.log('❌ Some schema validations failed');
    process.exit(1);
  }
}

validateSchemas();
