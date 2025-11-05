#!/usr/bin/env node

/**
 * Validate JSON-LD Rendering
 * Tests that JSON-LD schemas are properly rendered in HTML for all page types
 */

const { spawn } = require('child_process');
const http = require('http');

const TEST_PAGES = [
  {
    path: '/materials/ceramic',
    name: 'Category Page (Ceramic)',
    expectedSchemas: ['CollectionPage', 'BreadcrumbList', 'ItemList', 'Dataset', 'WebPage']
  },
  {
    path: '/materials/ceramic/oxide',
    name: 'Subcategory Page (Ceramic Oxide)',
    expectedSchemas: ['CollectionPage', 'BreadcrumbList', 'ItemList', 'Dataset', 'WebPage']
  },
  {
    path: '/materials/ceramic/oxide/alumina-laser-cleaning',
    name: 'Material Page (Alumina)',
    expectedSchemas: ['Article', 'Dataset', 'HowTo', 'Product', 'BreadcrumbList', 'Person']
  },
  {
    path: '/',
    name: 'Home Page',
    expectedSchemas: ['WebPage']
  }
];

let serverProcess;
let serverReady = false;
const PORT = 3010;

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Next.js dev server on port', PORT);
    
    serverProcess = spawn('npm', ['run', 'dev', '--', '-p', PORT], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: PORT.toString() }
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready in') || output.includes('started server')) {
        serverReady = true;
        setTimeout(() => resolve(), 2000); // Wait 2s for full startup
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready in') || output.includes('started server')) {
        serverReady = true;
        setTimeout(() => resolve(), 2000);
      }
    });

    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Server failed to start within timeout'));
      }
    }, 30000);
  });
}

function stopServer() {
  if (serverProcess) {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill();
  }
}

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JSONLDValidator/1.0)'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

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

async function testPage(page) {
  console.log(`\n📄 Testing: ${page.name}`);
  console.log(`   Path: ${page.path}`);
  
  try {
    const html = await fetchPage(page.path);
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

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  JSON-LD Rendering Validation');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    await startServer();
    console.log('✅ Server ready\n');
    
    const results = [];
    for (const page of TEST_PAGES) {
      const passed = await testPage(page);
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
    } else {
      console.log('⚠️  Some tests failed. Check output above.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    stopServer();
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

main();
