// tests/test-property-range-search.js
/**
 * Comprehensive test suite for enhanced property range search functionality
 */

const { 
  extractNumericValue, 
  rangesOverlap, 
  fuzzyPropertySearch,
  getPropertyRangeSuggestions 
} = require('../app/utils/propertyRangeSearch.ts');

const { getAllPropertyValues } = require('../app/utils/propertySearch');

/**
 * Test numeric value extraction
 */
function testNumericExtraction() {
  console.log('\n=== Testing Numeric Value Extraction ===');
  
  const testCases = [
    // Single values
    { input: '2.7g/cm³', expected: { min: 2.7, max: 2.7, unit: 'g/cm³' }},
    { input: '276MPa', expected: { min: 276, max: 276, unit: 'MPa' }},
    { input: '150°C', expected: { min: 150, max: 150, unit: '°C' }},
    
    // Ranges
    { input: '2.6-2.7g/cm³', expected: { min: 2.6, max: 2.7, unit: 'g/cm³' }},
    { input: '670-750°C', expected: { min: 670, max: 750, unit: '°C' }},
    { input: '1.2-1.8', expected: { min: 1.2, max: 1.8, unit: undefined }},
    
    // With ellipsis
    { input: '2.6-2.7…', expected: { min: 2.6, max: 2.7, unit: undefined }},
    
    // Non-numeric
    { input: 'High', expected: null },
    { input: 'Crystalline', expected: null },
    { input: 'N/A', expected: null },
    { input: '', expected: null }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = extractNumericValue(testCase.input);
    const isMatch = JSON.stringify(result) === JSON.stringify(testCase.expected);
    
    if (isMatch) {
      console.log(`✅ Test ${index + 1}: "${testCase.input}" → ${JSON.stringify(result)}`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: "${testCase.input}"`);
      console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
      console.log(`   Got:      ${JSON.stringify(result)}`);
      failed++;
    }
  });
  
  console.log(`\nNumeric Extraction Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

/**
 * Test range overlap detection
 */
function testRangeOverlap() {
  console.log('\n=== Testing Range Overlap Detection ===');
  
  const testCases = [
    // Exact overlap
    {
      range1: { min: 2.6, max: 2.7, unit: 'g/cm³' },
      range2: { min: 2.6, max: 2.7, unit: 'g/cm³' },
      tolerance: 0.15,
      expected: true,
      description: 'Exact same range'
    },
    
    // Overlapping ranges
    {
      range1: { min: 2.6, max: 2.8, unit: 'g/cm³' },
      range2: { min: 2.7, max: 2.9, unit: 'g/cm³' },
      tolerance: 0.15,
      expected: true,
      description: 'Overlapping ranges'
    },
    
    // Close ranges within tolerance
    {
      range1: { min: 2.7, max: 2.7, unit: 'g/cm³' },
      range2: { min: 2.8, max: 2.8, unit: 'g/cm³' },
      tolerance: 0.15,
      expected: true,
      description: 'Close values within tolerance'
    },
    
    // Different units - should not match
    {
      range1: { min: 2.7, max: 2.7, unit: 'g/cm³' },
      range2: { min: 2.7, max: 2.7, unit: 'kg/m³' },
      tolerance: 0.15,
      expected: false,
      description: 'Different units'
    },
    
    // Far apart ranges
    {
      range1: { min: 1.0, max: 1.0, unit: 'g/cm³' },
      range2: { min: 5.0, max: 5.0, unit: 'g/cm³' },
      tolerance: 0.15,
      expected: false,
      description: 'Far apart values'
    },
    
    // One range, one exact value
    {
      range1: { min: 2.6, max: 2.8, unit: 'g/cm³' },
      range2: { min: 2.7, max: 2.7, unit: 'g/cm³' },
      tolerance: 0.15,
      expected: true,
      description: 'Range contains exact value'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = rangesOverlap(testCase.range1, testCase.range2, testCase.tolerance);
    
    if (result === testCase.expected) {
      console.log(`✅ Test ${index + 1}: ${testCase.description}`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: ${testCase.description}`);
      console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
      console.log(`   Range1: ${JSON.stringify(testCase.range1)}`);
      console.log(`   Range2: ${JSON.stringify(testCase.range2)}`);
      failed++;
    }
  });
  
  console.log(`\nRange Overlap Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

/**
 * Test integration with actual property data
 */
async function testPropertyIntegration() {
  console.log('\n=== Testing Property Data Integration ===');
  
  try {
    const allPropertyValues = await getAllPropertyValues();
    
    // Find some numeric properties to test
    const numericProperties = [];
    const sampledValues = allPropertyValues.slice(0, 100); // Sample for testing
    
    for (const pv of sampledValues) {
      const numericValue = extractNumericValue(pv.value);
      if (numericValue) {
        numericProperties.push({
          property: pv.property,
          value: pv.value,
          numeric: numericValue,
          slug: pv.slug
        });
      }
    }
    
    console.log(`📊 Found ${numericProperties.length} numeric properties in sample`);
    
    // Test some specific cases
    const densityValues = numericProperties.filter(p => 
      p.property.toLowerCase().includes('density')
    );
    
    if (densityValues.length > 0) {
      console.log(`🔍 Testing density values: ${densityValues.length} found`);
      
      // Test fuzzy search on density
      const testDensity = densityValues[0];
      console.log(`   Testing with: ${testDensity.value} (${testDensity.numeric.min}-${testDensity.numeric.max})`);
      
      const fuzzyResults = await fuzzyPropertySearch(
        testDensity.property, 
        testDensity.value, 
        0.15
      );
      
      console.log(`   Fuzzy search found ${fuzzyResults.length} similar materials`);
      
      if (fuzzyResults.length > 0) {
        console.log(`✅ Integration test passed - found similar density materials`);
      }
    }
    
    // Test range suggestions
    const suggestions = await getPropertyRangeSuggestions('Density', '2.7g/cm³');
    console.log(`📋 Range suggestions for Density 2.7g/cm³: ${suggestions.length} found`);
    
    console.log('\n✅ Property Integration Tests Completed');
    return true;
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    return false;
  }
}

/**
 * Test performance with large datasets
 */
async function testPerformance() {
  console.log('\n=== Testing Performance ===');
  
  try {
    const startTime = Date.now();
    
    // Test extracting numeric values from many strings
    const testValues = [
      '2.7g/cm³', '2.6-2.8g/cm³', '150°C', '670-750°C', 
      '276MPa', 'High', 'Crystalline', '1.2-1.8',
      'N/A', '5.2', '10-15%', '0.1-0.3mm'
    ];
    
    for (let i = 0; i < 1000; i++) {
      for (const value of testValues) {
        extractNumericValue(value);
      }
    }
    
    const extractTime = Date.now() - startTime;
    console.log(`⚡ Extracted 12,000 values in ${extractTime}ms (${(12000/extractTime).toFixed(1)} values/ms)`);
    
    // Test range overlap calculations
    const range1 = { min: 2.6, max: 2.8, unit: 'g/cm³' };
    const range2 = { min: 2.7, max: 2.9, unit: 'g/cm³' };
    
    const overlapStartTime = Date.now();
    for (let i = 0; i < 10000; i++) {
      rangesOverlap(range1, range2, 0.15);
    }
    const overlapTime = Date.now() - overlapStartTime;
    console.log(`⚡ Performed 10,000 overlap checks in ${overlapTime}ms (${(10000/overlapTime).toFixed(1)} checks/ms)`);
    
    if (extractTime < 1000 && overlapTime < 1000) {
      console.log('✅ Performance tests passed - operations are fast enough');
      return true;
    } else {
      console.log('⚠️ Performance may be slow for large datasets');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 Running Enhanced Property Range Search Tests\n');
  
  const testResults = {
    numericExtraction: testNumericExtraction(),
    rangeOverlap: testRangeOverlap(),
    propertyIntegration: await testPropertyIntegration(),
    performance: await testPerformance()
  };
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(Boolean).length;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 ENHANCED RANGE SEARCH TEST SUMMARY');
  console.log('='.repeat(50));
  
  Object.entries(testResults).forEach(([testName, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} ${testName}`);
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} test suites passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Enhanced range search is working correctly!');
  } else {
    console.log('⚠️ Some tests failed - review implementation');
  }
  
  return passedTests === totalTests;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = {
  testNumericExtraction,
  testRangeOverlap,
  testPropertyIntegration,
  testPerformance,
  runAllTests
};
