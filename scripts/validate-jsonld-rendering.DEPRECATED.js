#!/usr/bin/env node

/**
 * Validate JSON-LD Rendering
 * Tests that JSON-LD schemas are properly rendered in HTML for all page types
 */

const { spawn, execSync } = require('child_process');
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
let usingExistingServer = false;
const PORT = 3010;
const SERVER_TIMEOUT = 30000; // Reduced from 60s to 30s

function killPortProcesses(port) {
  try {
    console.log(`🧹 Cleaning up processes on port ${port}...`);
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'pipe' });
    console.log(`✅ Port ${port} cleaned`);
    return true;
  } catch (error) {
    // Port was already free
    return true;
  }
}

function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startServer() {
  console.log('🚀 Starting Next.js dev server on port', PORT);
  
  // First, check if server is already running and responsive
  const isRunning = await checkServerReady(PORT);
  
  if (isRunning) {
    console.log('✅ Server already running on port', PORT);
    usingExistingServer = true;
    serverReady = true;
    return;
  }
  
  // Kill any stuck processes on the port
  killPortProcesses(PORT);
  
  // Wait a moment for port to be released
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verify port is now free
  const stillRunning = await checkServerReady(PORT);
  if (stillRunning) {
    throw new Error(`Port ${PORT} still in use after cleanup. Please manually stop the process.`);
  }
  
  return new Promise((resolve, reject) => {
    // Start the server
    serverProcess = spawn('npm', ['run', 'dev', '--', '-p', PORT], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: PORT.toString() },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    let resolved = false;
    
    const dataHandler = (data) => {
      const text = data.toString();
      output += text;
      
      // Look for success indicators
      if (!resolved && (text.includes('Local:') || text.includes('Ready in') || text.includes('started server'))) {
        serverReady = true;
        resolved = true;
        console.log('✅ Server started successfully');
        setTimeout(() => resolve(), 3000); // Wait 3s for full startup
      }
    };

    serverProcess.stdout.on('data', dataHandler);
    serverProcess.stderr.on('data', dataHandler);

    serverProcess.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Failed to start server: ${err.message}`));
      }
    });
    
    serverProcess.on('exit', (code) => {
      if (!resolved && code !== 0) {
        resolved = true;
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout handler
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error('❌ Server output:', output.substring(0, 500));
        reject(new Error(`Server failed to start within ${SERVER_TIMEOUT/1000}s timeout. Port may be in use or build may have failed.`));
      }
    }, SERVER_TIMEOUT);
    
    // Clear timeout if resolved early
    serverProcess.once('close', () => clearTimeout(timeoutId));
  });
}

function stopServer() {
  if (serverProcess && !usingExistingServer) {
    console.log('\n🛑 Stopping server...');
    try {
      serverProcess.kill('SIGTERM');
      // Give it time to clean up
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }, 2000);
    } catch (error) {
      console.warn('⚠️  Error stopping server:', error.message);
    }
  } else if (usingExistingServer) {
    console.log('\n✅ Leaving existing server running');
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
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout after 30s'));
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
  
  let serverStarted = false;
  
  try {
    await startServer();
    serverStarted = true;
    console.log('✅ Server ready\n');
    
    // Wait longer for server to be fully ready (first build takes time)
    console.log('⏳ Waiting for server to fully initialize...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
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
    if (!serverStarted) {
      console.error('\n💡 Tip: Make sure no other dev server is running on port', PORT);
      console.error('    Run: lsof -ti:' + PORT + ' | xargs kill -9');
    }
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
