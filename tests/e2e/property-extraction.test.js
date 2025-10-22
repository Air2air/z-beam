// E2E test for property extraction functionality
describe('E2E Property Extraction', () => {
  // Test data
  const testMetadata = {
    materialProperties: {
      laser_material_interaction: {
        label: "Laser-Material Interaction",
        properties: {
          specificHeat: {
            value: 840.0,
            unit: "J/(kg·K)",
            confidence: 88
          }
        }
      }
    }
  };

  // Helper functions
  function normalizePropertyName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function parsePropertiesFromMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') return [];
    
    const properties = [];
    
    const extractProperty = (key, data, parentKey) => {
      if (!data) return;
      
      if (typeof data === 'object' && data !== null) {
        if (data.value !== undefined || data.numeric !== undefined) {
          const propertyName = key;
          const value = data.value !== undefined
            ? (data.unit ? `${data.value} ${data.unit}` : String(data.value))
            : (data.units ? `${data.numeric} ${data.units}` : String(data.numeric));
          properties.push({ property: propertyName, value });
        } else {
          const hasCategoryStructure = 
            data.hasOwnProperty('label') && 
            data.hasOwnProperty('properties') && 
            typeof data.properties === 'object';
          
          const metadataKeys = ['label', 'description', 'percentage'];
          const isMetadataKey = metadataKeys.includes(key);
          
          Object.entries(data).forEach(([nestedKey, nestedValue]) => {
            if (hasCategoryStructure || isMetadataKey) {
              extractProperty(nestedKey, nestedValue, key === 'properties' ? parentKey : key);
            } else {
              const newParentKey = parentKey ? `${parentKey}.${key}` : key;
              extractProperty(nestedKey, nestedValue, newParentKey);
            }
          });
        }
      } else if (data !== null && data !== undefined) {
        const propertyName = parentKey ? `${parentKey}.${key}` : key;
        properties.push({ property: propertyName, value: String(data) });
      }
    };
    
    if (metadata.materialProperties) {
      Object.entries(metadata.materialProperties).forEach(([key, value]) => {
        extractProperty(key, value);
      });
    }
    
    return properties;
  }

  function findNumericMatch(searchValue, propValue, tolerance = 0.1) {
    const searchVal = String(searchValue).toLowerCase().trim();
    const actualVal = String(propValue).toLowerCase().trim();
    
    const searchNum = parseFloat(searchVal.match(/[\d.]+/)?.[0] || searchVal);
    const propValString = actualVal.match(/[\d.]+/)?.[0] || actualVal;
    const propNum = parseFloat(propValString);
    
    if (!isNaN(searchNum) && !isNaN(propNum)) {
      const toleranceValue = Math.max(Math.abs(searchNum * tolerance), 0.1);
      const diff = Math.abs(propNum - searchNum);
      return { match: diff <= toleranceValue, searchNum, propNum, diff, tolerance: toleranceValue };
    }
    
    return { match: false, searchNum: NaN, propNum: NaN, diff: NaN, tolerance: NaN };
  }

  describe('Property Extraction', () => {
    test('should extract properties from metadata correctly', () => {
      const extracted = parsePropertiesFromMetadata(testMetadata);
      
      expect(extracted).toHaveLength(2);
      expect(extracted).toContainEqual({
        property: 'specificHeat',
        value: '840 J/(kg·K)'
      });
      expect(extracted).toContainEqual({
        property: 'laser_material_interaction.label',
        value: 'Laser-Material Interaction'
      });
    });

    test('should handle empty metadata', () => {
      const extracted = parsePropertiesFromMetadata({});
      expect(extracted).toEqual([]);
    });

    test('should handle null metadata', () => {
      const extracted = parsePropertiesFromMetadata(null);
      expect(extracted).toEqual([]);
    });
  });

  describe('Property Matching', () => {
    test('should match properties by normalized name', () => {
      const extracted = parsePropertiesFromMetadata(testMetadata);
      const searchProperty = 'specificHeat';
      const normalizedSearchProperty = normalizePropertyName(searchProperty);
      
      const matchingProperty = extracted.find(prop => {
        const normalizedPropName = normalizePropertyName(prop.property);
        return normalizedPropName === normalizedSearchProperty;
      });
      
      expect(matchingProperty).toBeDefined();
      expect(matchingProperty.property).toBe('specificHeat');
      expect(normalizePropertyName(matchingProperty.property)).toBe('specificheat');
    });

    test('should perform numeric value matching within tolerance', () => {
      const extracted = parsePropertiesFromMetadata(testMetadata);
      const searchValue = '840';
      
      // Find the specificHeat property
      const property = extracted.find(p => p.property === 'specificHeat');
      expect(property).toBeDefined();
      
      const numericMatch = findNumericMatch(searchValue, property.value);
      
      expect(numericMatch.match).toBe(true);
      expect(numericMatch.searchNum).toBe(840);
      expect(numericMatch.propNum).toBe(840);
      expect(numericMatch.diff).toBe(0);
    });

    test('should handle tolerance in numeric matching', () => {
      const testCases = [
        { search: '840', prop: '840 J/(kg·K)', shouldMatch: true },
        { search: '835', prop: '840 J/(kg·K)', shouldMatch: true }, // Within 10% tolerance
        { search: '750', prop: '840 J/(kg·K)', shouldMatch: false }, // Outside tolerance
      ];

      testCases.forEach(({ search, prop, shouldMatch }) => {
        const result = findNumericMatch(search, prop);
        expect(result.match).toBe(shouldMatch);
      });
    });
  });

  describe('Complete Flow Integration', () => {
    test('should perform complete property search flow', () => {
      const searchProperty = 'specificHeat';
      const searchValue = '840';
      
      // Extract properties
      const extracted = parsePropertiesFromMetadata(testMetadata);
      expect(extracted).toHaveLength(2);
      
      // Find matching property by normalized name
      const normalizedSearchProperty = normalizePropertyName(searchProperty);
      const matchingProperty = extracted.find(prop => {
        const normalizedPropName = normalizePropertyName(prop.property);
        return normalizedPropName === normalizedSearchProperty;
      });
      
      expect(matchingProperty).toBeDefined();
      
      // Test numeric matching
      const numericMatch = findNumericMatch(searchValue, matchingProperty.value);
      expect(numericMatch.match).toBe(true);
      
      // Complete flow verification
      expect({
        propertyFound: !!matchingProperty,
        nameMatch: normalizePropertyName(matchingProperty.property) === normalizedSearchProperty,
        valueMatch: numericMatch.match,
        extractedValue: matchingProperty.value,
        searchValue: searchValue
      }).toEqual({
        propertyFound: true,
        nameMatch: true,
        valueMatch: true,
        extractedValue: '840 J/(kg·K)',
        searchValue: '840'
      });
    });
  });
});
