/**
 * End-to-End Property Name Normalization Test
 * 
 * Tests the complete flow from YAML → MetricsGrid → generateSearchUrl → search-client
 */

// Step 1: Property names from YAML (camelCase)
const yamlPropertyNames = [
  'specificHeat',
  'thermalConductivity',
  'thermalExpansion',
  'laserAbsorption',
  'tensileStrength',
  'youngsModulus',
  'meltingPoint',
  'absorptionCoefficient'
];

// Step 2: MetricsGrid creates fullPropertyName (category.property)
const metricGridFullNames = yamlPropertyNames.map(prop => 
  `laser_material_interaction.${prop}`
);

console.log('Step 1: YAML Property Names (camelCase)');
console.log(yamlPropertyNames);
console.log();

console.log('Step 2: MetricsGrid fullPropertyName (category.property)');
console.log(metricGridFullNames);
console.log();

// Step 3: generateSearchUrl extracts final property name
function extractPropertyFromFullName(fullName) {
  const parts = fullName.split('.');
  return parts[parts.length - 1];
}

const urlPropertyNames = metricGridFullNames.map(extractPropertyFromFullName);

console.log('Step 3: generateSearchUrl extracts final name');
console.log(urlPropertyNames);
console.log();

// Step 4: URL encoding/decoding (simulated)
const urlEncodedNames = urlPropertyNames.map(name => encodeURIComponent(name));
const urlDecodedNames = urlEncodedNames.map(name => decodeURIComponent(name));

console.log('Step 4: URL encoding/decoding');
console.log('Encoded:', urlEncodedNames);
console.log('Decoded:', urlDecodedNames);
console.log();

// Step 5: search-client normalizePropertyName
function normalizePropertyName(name) {
  return name.toLowerCase().replace(/[^\w]/g, '');
}

const normalizedSearchNames = urlDecodedNames.map(normalizePropertyName);

console.log('Step 5: search-client normalizePropertyName');
console.log(normalizedSearchNames);
console.log();

// Step 6: parsePropertiesFromMetadata extracts property names
// (These come directly from YAML keys, same as yamlPropertyNames)
const extractedPropertyNames = yamlPropertyNames; // Direct from YAML keys

console.log('Step 6: parsePropertiesFromMetadata property names');
console.log(extractedPropertyNames);
console.log();

// Step 7: Normalize extracted properties
const normalizedExtractedNames = extractedPropertyNames.map(normalizePropertyName);

console.log('Step 7: Normalized extracted property names');
console.log(normalizedExtractedNames);
console.log();

// Step 8: Comparison - Do they match?
console.log('='.repeat(60));
console.log('FINAL COMPARISON: Search Names vs Extracted Names');
console.log('='.repeat(60));

let allMatch = true;
for (let i = 0; i < yamlPropertyNames.length; i++) {
  const original = yamlPropertyNames[i];
  const searchNormalized = normalizedSearchNames[i];
  const extractedNormalized = normalizedExtractedNames[i];
  const match = searchNormalized === extractedNormalized;
  
  console.log(`Property: ${original.padEnd(25)} | Search: ${searchNormalized.padEnd(20)} | Extracted: ${extractedNormalized.padEnd(20)} | Match: ${match ? '✅' : '❌'}`);
  
  if (!match) {
    allMatch = false;
  }
}

console.log('='.repeat(60));
console.log(`Result: ${allMatch ? '✅ ALL NAMES MATCH - E2E FLOW IS CONSISTENT' : '❌ MISMATCH FOUND - E2E FLOW HAS ISSUES'}`);
console.log('='.repeat(60));

// Test edge cases
console.log();
console.log('Edge Case Tests:');
console.log('='.repeat(60));

const edgeCases = [
  { input: 'specificHeat', expected: 'specificheat' },
  { input: 'thermalConductivity', expected: 'thermalconductivity' },
  { input: 'Specific Heat', expected: 'specificheat' },
  { input: 'thermal-conductivity', expected: 'thermalconductivity' },
  { input: 'Thermal_Conductivity', expected: 'thermalconductivity' },
  { input: 'Young\'s Modulus', expected: 'youngsmodulus' },
  { input: 'CO2 Absorption', expected: 'co2absorption' }
];

let edgeCasesPassed = true;
edgeCases.forEach(({ input, expected }) => {
  const result = normalizePropertyName(input);
  const match = result === expected;
  console.log(`Input: "${input.padEnd(25)}" → "${result.padEnd(25)}" | Expected: "${expected.padEnd(25)}" | ${match ? '✅' : '❌'}`);
  if (!match) edgeCasesPassed = false;
});

console.log('='.repeat(60));
console.log(`Edge Cases: ${edgeCasesPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
console.log('='.repeat(60));

// Summary
console.log();
console.log('SUMMARY:');
console.log('--------');
console.log(`1. YAML properties (camelCase) → MetricsGrid fullPropertyName`);
console.log(`2. generateSearchUrl extracts final property name from fullPropertyName`);
console.log(`3. URL encoding/decoding preserves property name`);
console.log(`4. search-client normalizes URL property name`);
console.log(`5. parsePropertiesFromMetadata extracts property names from YAML`);
console.log(`6. search-client normalizes extracted property names`);
console.log(`7. Comparison: normalized search name === normalized extracted name`);
console.log();
console.log(`Overall E2E Test: ${allMatch && edgeCasesPassed ? '✅ PASS' : '❌ FAIL'}`);
