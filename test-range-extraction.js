// test-range-extraction.js
const { extractNumericValue, rangesOverlap } = require('./app/utils/propertyRangeSearch.ts');

// Test cases from our property data
const testValues = [
  "2.6-2.7…",
  "2.7g/cm³", 
  "670-750…",
  "276MPa",
  "1.7-2.0…",
  "237W/mK",
  "N/A",
  "Stone",
  "2.32g/c…"
];

console.log('🧪 Testing Numeric Range Extraction');
console.log('===================================\n');

testValues.forEach(value => {
  const result = extractNumericValue(value);
  console.log(`Input: "${value}"`);
  console.log(`Result:`, result);
  console.log('---');
});

// Test range overlaps
console.log('\n📊 Testing Range Overlaps');
console.log('=========================\n');

const range1 = { min: 2.6, max: 2.7, unit: 'g/cm³', original: '2.6-2.7g/cm³' };
const range2 = { min: 2.7, max: 2.7, unit: 'g/cm³', original: '2.7g/cm³' };
const range3 = { min: 670, max: 750, unit: 'kg/m³', original: '670-750kg/m³' };

console.log('Range 1:', range1);
console.log('Range 2:', range2);
console.log('Overlap:', rangesOverlap(range1, range2));
console.log('---');

console.log('Range 1:', range1);
console.log('Range 3:', range3);
console.log('Overlap:', rangesOverlap(range1, range3));
console.log('---');
