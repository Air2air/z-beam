#!/usr/bin/env node

/**
 * Test JSON-LD generation on live server
 */

const http = require('http');

const TEST_URL = 'http://localhost:3000/materials/ceramic/oxide/alumina-laser-cleaning';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function analyzeSchemas(html) {
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  const allTypes = new Set();
  let blockCount = 0;

  while ((match = regex.exec(html)) !== null) {
    blockCount++;
    try {
      const json = JSON.parse(match[1]);
      if (json['@type']) allTypes.add(json['@type']);
      if (json['@graph']) {
        json['@graph'].forEach(e => {
          if (e['@type']) allTypes.add(e['@type']);
        });
      }
    } catch(e) {
      console.error(`Block ${blockCount}: Parse error`);
    }
  }

  return { blockCount, allTypes };
}

async function main() {
  console.log('🔍 Testing JSON-LD Generation on Live Server\n');
  console.log(`Fetching: ${TEST_URL}\n`);
  
  try {
    const html = await fetchPage(TEST_URL);
    const { blockCount, allTypes } = await analyzeSchemas(html);
    
    const expected = ['Article', 'Dataset', 'HowTo', 'Product', 'Person', 'BreadcrumbList', 'WebPage'];
    const present = expected.filter(t => allTypes.has(t));
    const missing = expected.filter(t => !allTypes.has(t));
    
    console.log('📊 Results:');
    console.log(`   Total JSON-LD blocks: ${blockCount}`);
    console.log(`   Unique schema types: ${allTypes.size}`);
    console.log('');
    
    console.log('✅ Present:', present.join(', ') || 'none');
    console.log('❌ Missing:', missing.join(', ') || 'none');
    console.log('');
    
    console.log('All types found:', Array.from(allTypes).sort().join(', '));
    console.log('');
    
    if (missing.length === 0) {
      console.log('🎉 SUCCESS: All expected schemas are present!');
      process.exit(0);
    } else {
      console.log('⚠️  WARNING: Some expected schemas are missing.');
      console.log('\nThis indicates the SchemaFactory conditions are still not matching.');
      console.log('Check that metadata is being passed correctly to SchemaFactory.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
