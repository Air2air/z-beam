#!/usr/bin/env node

/**
 * Comprehensive Author Component Testing Framework
 * 
 * This script provides complete testing coverage for:
 * 1. Author API endpoints
 * 2. Author content parsing
 * 3. Author component rendering
 * 4. Integration testing with real pages
 * 5. Error handling and edge cases
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002',
  authorSlugs: [
    'aluminum-laser-cleaning',
    'steel-laser-cleaning'
  ],
  expectedAuthors: {
    'aluminum-laser-cleaning': {
      name: 'Yi-Chun Lin',
      credentials: 'Materials Science and Laser Technology',
      country: 'Taiwan',
      avatar: 'public/images/author/yi-chun-lin.jpg'
    },
    'steel-laser-cleaning': {
      name: 'Alessandro Moretti', 
      credentials: 'Materials Science and Laser Technology',
      country: 'Italy',
      avatar: 'public/images/author/alessandro-moretti.jpg'
    }
  }
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = {
    'info': '📝',
    'success': '✅',
    'error': '❌',
    'warn': '⚠️',
    'debug': '🔍'
  }[type] || '📝';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function addTestResult(name, status, message, details = null) {
  testResults.total++;
  testResults[status]++;
  testResults.details.push({
    name,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  });
  
  const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏸️';
  log(`${icon} ${name}: ${message}`, status === 'passed' ? 'success' : 'error');
}

// HTTP request helper
async function makeRequest(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Not JSON, keep as text
      data = text;
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Test categories
class AuthorTestSuite {
  
  // 1. Author API Testing
  async testAuthorAPIEndpoints() {
    log('🔬 Testing Author API Endpoints', 'info');
    
    for (const slug of TEST_CONFIG.authorSlugs) {
      try {
        const url = `${TEST_CONFIG.baseUrl}/api/component-data?slug=${slug}&type=author`;
        const response = await makeRequest(url);
        
        if (response.ok && response.data.content) {
          addTestResult(
            `API: ${slug}`,
            'passed',
            `API returned content (${response.data.content.length} chars)`,
            { status: response.status, hasContent: true }
          );
        } else {
          addTestResult(
            `API: ${slug}`,
            'failed',
            `API failed: ${response.status}`,
            response
          );
        }
      } catch (error) {
        addTestResult(
          `API: ${slug}`,
          'failed',
          `API error: ${error.message}`,
          { error: error.message }
        );
      }
    }
  }

  // 2. Author Content Parsing Testing
  async testAuthorContentParsing() {
    log('🔬 Testing Author Content Parsing', 'info');
    
    // Import parsing functions
    const { parseAuthorContent } = require('./app/utils/authorParser.ts');
    
    for (const slug of TEST_CONFIG.authorSlugs) {
      try {
        const url = `${TEST_CONFIG.baseUrl}/api/component-data?slug=${slug}&type=author`;
        const response = await makeRequest(url);
        
        if (response.ok && response.data.content) {
          const parsed = parseAuthorContent(response.data.content);
          const expected = TEST_CONFIG.expectedAuthors[slug];
          
          // Validate parsed data
          const checks = [
            { field: 'author_name', actual: parsed.author_name, expected: expected.name },
            { field: 'credentials', actual: parsed.credentials, expected: expected.credentials },
            { field: 'author_country', actual: parsed.author_country, expected: expected.country },
            { field: 'avatar', actual: parsed.avatar, expected: expected.avatar }
          ];
          
          let allPassed = true;
          let failedChecks = [];
          
          for (const check of checks) {
            if (check.actual !== check.expected) {
              allPassed = false;
              failedChecks.push(`${check.field}: got "${check.actual}", expected "${check.expected}"`);
            }
          }
          
          if (allPassed) {
            addTestResult(
              `Parsing: ${slug}`,
              'passed',
              'All fields parsed correctly',
              parsed
            );
          } else {
            addTestResult(
              `Parsing: ${slug}`,
              'failed',
              `Parsing mismatches: ${failedChecks.join(', ')}`,
              { parsed, expected, failedChecks }
            );
          }
        } else {
          addTestResult(
            `Parsing: ${slug}`,
            'skipped',
            'No content to parse (API failed)',
            null
          );
        }
      } catch (error) {
        addTestResult(
          `Parsing: ${slug}`,
          'failed',
          `Parsing error: ${error.message}`,
          { error: error.message }
        );
      }
    }
  }

  // 3. Author Component Rendering Testing
  async testAuthorComponentRendering() {
    log('🔬 Testing Author Component Rendering', 'info');
    
    for (const slug of TEST_CONFIG.authorSlugs) {
      try {
        const url = `${TEST_CONFIG.baseUrl}/${slug}`;
        const response = await makeRequest(url);
        
        if (response.ok && typeof response.data === 'string') {
          const html = response.data;
          const expected = TEST_CONFIG.expectedAuthors[slug];
          
          // Check for author component presence
          const hasAuthorComponent = html.includes('author-component');
          const hasAuthorName = html.includes(expected.name);
          const hasAuthorCredentials = html.includes(expected.credentials);
          const hasAuthorCountry = html.includes(expected.country);
          
          const checks = [
            { name: 'Author Component', passed: hasAuthorComponent },
            { name: 'Author Name', passed: hasAuthorName },
            { name: 'Author Credentials', passed: hasAuthorCredentials },
            { name: 'Author Country', passed: hasAuthorCountry }
          ];
          
          const passedChecks = checks.filter(c => c.passed);
          const failedChecks = checks.filter(c => !c.passed);
          
          if (failedChecks.length === 0) {
            addTestResult(
              `Rendering: ${slug}`,
              'passed',
              `All author elements rendered (${passedChecks.length}/4)`,
              { checks }
            );
          } else {
            addTestResult(
              `Rendering: ${slug}`,
              'failed',
              `Missing elements: ${failedChecks.map(c => c.name).join(', ')}`,
              { checks, passedChecks: passedChecks.length, totalChecks: checks.length }
            );
          }
        } else {
          addTestResult(
            `Rendering: ${slug}`,
            'failed',
            `Page failed to load: ${response.status}`,
            response
          );
        }
      } catch (error) {
        addTestResult(
          `Rendering: ${slug}`,
          'failed',
          `Rendering test error: ${error.message}`,
          { error: error.message }
        );
      }
    }
  }

  // 4. Integration Testing
  async testIntegration() {
    log('🔬 Testing Complete Integration Flow', 'info');
    
    for (const slug of TEST_CONFIG.authorSlugs) {
      try {
        // Step 1: Check if author file exists
        const authorFile = path.join(__dirname, 'content', 'components', 'author', `${slug}.md`);
        const fileExists = fs.existsSync(authorFile);
        
        if (!fileExists) {
          addTestResult(
            `Integration: ${slug}`,
            'failed',
            'Author markdown file does not exist',
            { expectedPath: authorFile }
          );
          continue;
        }
        
        // Step 2: API → Parsing → Rendering pipeline
        const apiResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/component-data?slug=${slug}&type=author`);
        
        if (!apiResponse.ok) {
          addTestResult(
            `Integration: ${slug}`,
            'failed',
            'API failed in integration test',
            apiResponse
          );
          continue;
        }
        
        // Step 3: Check page renders without errors
        const pageResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/${slug}`);
        
        if (!pageResponse.ok) {
          addTestResult(
            `Integration: ${slug}`,
            'failed',
            'Page failed to render in integration test',
            pageResponse
          );
          continue;
        }
        
        // Step 4: Verify complete pipeline
        const expected = TEST_CONFIG.expectedAuthors[slug];
        const html = pageResponse.data;
        
        const fullCheck = [
          html.includes('author-component'),
          html.includes(expected.name),
          html.includes(expected.credentials),
          html.includes(expected.country)
        ].every(Boolean);
        
        if (fullCheck) {
          addTestResult(
            `Integration: ${slug}`,
            'passed',
            'Full pipeline working: File → API → Parsing → Rendering',
            { 
              fileExists: true,
              apiWorking: true,
              pageRendering: true,
              authorDataPresent: true
            }
          );
        } else {
          addTestResult(
            `Integration: ${slug}`,
            'failed',
            'Pipeline incomplete: some author data missing in final render',
            { 
              fileExists,
              apiWorking: apiResponse.ok,
              pageRendering: pageResponse.ok,
              authorDataPresent: false
            }
          );
        }
        
      } catch (error) {
        addTestResult(
          `Integration: ${slug}`,
          'failed',
          `Integration test error: ${error.message}`,
          { error: error.message }
        );
      }
    }
  }

  // 5. Error Handling and Edge Cases
  async testErrorHandling() {
    log('🔬 Testing Error Handling and Edge Cases', 'info');
    
    // Test non-existent author
    try {
      const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/component-data?slug=non-existent-material&type=author`);
      
      if (response.status === 404) {
        addTestResult(
          'Error: Non-existent author',
          'passed',
          'Correctly returns 404 for non-existent author',
          { status: response.status }
        );
      } else {
        addTestResult(
          'Error: Non-existent author',
          'failed',
          `Expected 404, got ${response.status}`,
          response
        );
      }
    } catch (error) {
      addTestResult(
        'Error: Non-existent author',
        'failed',
        `Error handling test failed: ${error.message}`,
        { error: error.message }
      );
    }

    // Test malformed request
    try {
      const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/component-data?type=author`);
      
      if (response.status >= 400) {
        addTestResult(
          'Error: Missing slug parameter',
          'passed',
          'Correctly handles missing slug parameter',
          { status: response.status }
        );
      } else {
        addTestResult(
          'Error: Missing slug parameter',
          'failed',
          `Expected error status, got ${response.status}`,
          response
        );
      }
    } catch (error) {
      addTestResult(
        'Error: Missing slug parameter',
        'failed',
        `Malformed request test failed: ${error.message}`,
        { error: error.message }
      );
    }
  }

  // 6. Performance and Load Testing
  async testPerformance() {
    log('🔬 Testing Performance', 'info');
    
    for (const slug of TEST_CONFIG.authorSlugs) {
      try {
        const startTime = Date.now();
        const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/component-data?slug=${slug}&type=author`);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (response.ok && responseTime < 1000) {
          addTestResult(
            `Performance: ${slug}`,
            'passed',
            `API response in ${responseTime}ms (< 1000ms)`,
            { responseTime, threshold: 1000 }
          );
        } else if (response.ok) {
          addTestResult(
            `Performance: ${slug}`,
            'failed',
            `API response slow: ${responseTime}ms (>= 1000ms)`,
            { responseTime, threshold: 1000 }
          );
        } else {
          addTestResult(
            `Performance: ${slug}`,
            'failed',
            `API failed during performance test`,
            response
          );
        }
      } catch (error) {
        addTestResult(
          `Performance: ${slug}`,
          'failed',
          `Performance test error: ${error.message}`,
          { error: error.message }
        );
      }
    }
  }

  // Run all test suites
  async runAllTests() {
    log('🚀 Starting Comprehensive Author Component Testing', 'info');
    console.log('='.repeat(60));
    
    await this.testAuthorAPIEndpoints();
    console.log('');
    
    await this.testAuthorContentParsing();
    console.log('');
    
    await this.testAuthorComponentRendering();
    console.log('');
    
    await this.testIntegration();
    console.log('');
    
    await this.testErrorHandling();
    console.log('');
    
    await this.testPerformance();
    console.log('');
    
    this.printSummary();
  }

  // Print test summary
  printSummary() {
    console.log('='.repeat(60));
    log('📊 TEST SUMMARY', 'info');
    console.log('='.repeat(60));
    
    const { total, passed, failed, skipped } = testResults;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    console.log(`📈 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed} (${passRate}%)`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏸️  Skipped: ${skipped}`);
    console.log('');
    
    if (failed > 0) {
      log('❌ FAILED TESTS:', 'error');
      testResults.details
        .filter(t => t.status === 'failed')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.message}`);
        });
      console.log('');
    }
    
    // Overall status
    if (failed === 0 && passed > 0) {
      log('🎉 ALL TESTS PASSED! Author component system is working correctly.', 'success');
    } else if (failed > 0) {
      log(`⚠️  ${failed} test(s) failed. Please review the failures above.`, 'warn');
    } else {
      log('⚠️  No tests were completed successfully.', 'warn');
    }
    
    console.log('='.repeat(60));
    
    // Save detailed results
    const resultsFile = path.join(__dirname, 'test-results-author.json');
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
    log(`📄 Detailed results saved to: ${resultsFile}`, 'info');
  }
}

// Main execution
async function main() {
  const testSuite = new AuthorTestSuite();
  
  try {
    await testSuite.runAllTests();
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`💥 Test suite crashed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { AuthorTestSuite, TEST_CONFIG };
