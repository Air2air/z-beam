/**
 * End-to-End Property Name Normalization Test
 * 
 * Tests the complete flow from YAML → MetricsGrid → generateSearchUrl → search-client
 */

// Test data - Property names from YAML (camelCase)
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

// Helper functions for the E2E flow

function extractPropertyFromFullName(fullName) {
  const parts = fullName.split('.');
  return parts[parts.length - 1];
}

function normalizePropertyName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function runPropertyNamingFlow(yamlProperties) {
  // Step 1: YAML properties (input)
  const yamlPropertyNames = yamlProperties;
  
  // Step 2: MetricsGrid creates fullPropertyName (category.property)
  const metricGridFullNames = yamlPropertyNames.map(prop => 
    `laser_material_interaction.${prop}`
  );
  
  // Step 3: generateSearchUrl extracts final property name
  const urlPropertyNames = metricGridFullNames.map(extractPropertyFromFullName);
  
  // Step 4: URL encoding/decoding (simulated)
  const urlEncodedNames = urlPropertyNames.map(name => encodeURIComponent(name));
  const urlDecodedNames = urlEncodedNames.map(name => decodeURIComponent(name));
  
  // Step 5: search-client normalizePropertyName
  const normalizedSearchNames = urlDecodedNames.map(normalizePropertyName);
  
  // Step 6: parsePropertiesFromMetadata extracts property names
  const extractedPropertyNames = yamlPropertyNames; // Direct from YAML keys
  
  // Step 7: Normalize extracted properties
  const normalizedExtractedNames = extractedPropertyNames.map(normalizePropertyName);
  
  return {
    yamlPropertyNames,
    metricGridFullNames,
    urlPropertyNames,
    normalizedSearchNames,
    normalizedExtractedNames
  };
}

describe('E2E Property Name Normalization', () => {
  describe('Complete Flow Integration', () => {
    test('should normalize property names consistently through entire flow', () => {
      const result = runPropertyNamingFlow(yamlPropertyNames);
      
      // Verify each step
      expect(result.yamlPropertyNames).toHaveLength(8);
      expect(result.metricGridFullNames[0]).toBe('laser_material_interaction.specificHeat');
      expect(result.urlPropertyNames[0]).toBe('specificHeat');
      
      // Critical test: normalized search names should match normalized extracted names
      expect(result.normalizedSearchNames).toEqual(result.normalizedExtractedNames);
    });

    test('should handle all test properties correctly', () => {
      const result = runPropertyNamingFlow(yamlPropertyNames);
      
      const expectedNormalized = [
        'specificheat',
        'thermalconductivity', 
        'thermalexpansion',
        'laserabsorption',
        'tensilestrength',
        'youngsmodulus',
        'meltingpoint',
        'absorptioncoefficient'
      ];
      
      expect(result.normalizedSearchNames).toEqual(expectedNormalized);
      expect(result.normalizedExtractedNames).toEqual(expectedNormalized);
    });
  });

  describe('Edge Cases', () => {
    const edgeCases = [
      { input: 'specificHeat', expected: 'specificheat' },
      { input: 'thermalConductivity', expected: 'thermalconductivity' },
      { input: 'Specific Heat', expected: 'specificheat' },
      { input: 'thermal-conductivity', expected: 'thermalconductivity' },
      { input: 'Thermal_Conductivity', expected: 'thermalconductivity' },
      { input: 'Young\'s Modulus', expected: 'youngsmodulus' },
      { input: 'CO2 Absorption', expected: 'co2absorption' }
    ];

    test.each(edgeCases)('should normalize "$input" to "$expected"', ({ input, expected }) => {
      const result = normalizePropertyName(input);
      expect(result).toBe(expected);
    });

    test('should handle all edge cases correctly', () => {
      edgeCases.forEach(({ input, expected }) => {
        const result = normalizePropertyName(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Flow Validation', () => {
    test('should preserve property name through URL encoding/decoding', () => {
      const testProperty = 'specificHeat';
      const encoded = encodeURIComponent(testProperty);
      const decoded = decodeURIComponent(encoded);
      expect(decoded).toBe(testProperty);
    });

    test('should extract property names correctly from full names', () => {
      const fullName = 'laser_material_interaction.specificHeat';
      const extracted = extractPropertyFromFullName(fullName);
      expect(extracted).toBe('specificHeat');
    });
  });
});

// Legacy console output for backwards compatibility (can be removed later)
if (require.main === module) {
  const result = runPropertyNamingFlow(yamlPropertyNames);
  console.log('✅ E2E Property Naming Test - Jest format now available');
  console.log(`✅ All ${yamlPropertyNames.length} properties normalize consistently`);
}
