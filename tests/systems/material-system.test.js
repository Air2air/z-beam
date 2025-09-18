/**
 * @jest-environment jsdom
 */

const path = require('path');
const fs = require('fs');

// Mock content API functions for material system testing
const mockMaterialData = {
  'aluminum-laser-cleaning': {
    title: 'Laser Cleaning Aluminum',
    materialType: 'Metal',
    symbol: 'Al',
    properties: {
      density: '2.70 g/cm³',
      meltingPoint: '660.3°C',
      thermalConductivity: '237 W/m·K'
    },
    laserParameters: {
      wavelength: '1064nm',
      power: '50-200W',
      pulseFrequency: '20-50kHz'
    }
  },
  'steel-laser-cleaning': {
    title: 'Laser Cleaning Steel',
    materialType: 'Metal',
    symbol: 'Fe',
    properties: {
      density: '7.87 g/cm³',
      meltingPoint: '1538°C',
      thermalConductivity: '80.4 W/m·K'
    },
    laserParameters: {
      wavelength: '1064nm',
      power: '100-500W',
      pulseFrequency: '10-30kHz'
    }
  }
};

// Mock material validation functions
const validateMaterialProperties = (material) => {
  const requiredFields = ['title', 'materialType', 'symbol', 'properties', 'laserParameters'];
  for (const field of requiredFields) {
    if (!material[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  if (!material.properties.density || !material.properties.meltingPoint) {
    throw new Error('Missing required material properties');
  }
  
  if (!material.laserParameters.wavelength || !material.laserParameters.power) {
    throw new Error('Missing required laser parameters');
  }
  
  return true;
};

const calculateLaserEfficiency = (material, laserSettings) => {
  const baseEfficiency = 0.85;
  const materialFactor = material.materialType === 'Metal' ? 1.2 : 1.0;
  const powerFactor = laserSettings.power > 200 ? 1.1 : 1.0;
  
  return baseEfficiency * materialFactor * powerFactor;
};

const generateMaterialReport = (material) => {
  return {
    materialId: material.symbol,
    title: material.title,
    processingComplexity: material.materialType === 'Metal' ? 'Medium' : 'High',
    recommendedSettings: material.laserParameters,
    safetyRating: 'A',
    estimatedEfficiency: calculateLaserEfficiency(material, material.laserParameters)
  };
};

describe('Material System Tests', () => {
  
  describe('Material Data Validation', () => {
    it('should validate complete material data structure', () => {
      expect(() => {
        validateMaterialProperties(mockMaterialData['aluminum-laser-cleaning']);
      }).not.toThrow();
    });

    it('should throw error for missing required fields', () => {
      const incompleteMaterial = {
        title: 'Test Material',
        materialType: 'Metal'
        // Missing symbol, properties, and laserParameters
      };
      
      expect(() => {
        validateMaterialProperties(incompleteMaterial);
      }).toThrow('Missing required field: symbol');
    });

    it('should validate material properties completeness', () => {
      const materialWithoutProperties = {
        title: 'Test Material',
        materialType: 'Metal',
        symbol: 'Tm',
        properties: {
          density: '5.0 g/cm³'
          // Missing meltingPoint
        },
        laserParameters: {
          wavelength: '1064nm',
          power: '100W'
        }
      };
      
      expect(() => {
        validateMaterialProperties(materialWithoutProperties);
      }).toThrow('Missing required material properties');
    });

    it('should validate laser parameters completeness', () => {
      const materialWithoutLaserParams = {
        title: 'Test Material',
        materialType: 'Metal',
        symbol: 'Tm',
        properties: {
          density: '5.0 g/cm³',
          meltingPoint: '1000°C'
        },
        laserParameters: {
          wavelength: '1064nm'
          // Missing power
        }
      };
      
      expect(() => {
        validateMaterialProperties(materialWithoutLaserParams);
      }).toThrow('Missing required laser parameters');
    });
  });

  describe('Laser Efficiency Calculations', () => {
    it('should calculate base efficiency for standard materials', () => {
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      const efficiency = calculateLaserEfficiency(aluminum, aluminum.laserParameters);
      
      expect(efficiency).toBeGreaterThan(0.8);
      expect(efficiency).toBeLessThanOrEqual(1.5);
    });

    it('should apply material type factor for metals', () => {
      const metalMaterial = {
        materialType: 'Metal',
        laserParameters: { power: 100 }
      };
      
      const nonMetalMaterial = {
        materialType: 'Polymer',
        laserParameters: { power: 100 }
      };
      
      const metalEfficiency = calculateLaserEfficiency(metalMaterial, metalMaterial.laserParameters);
      const nonMetalEfficiency = calculateLaserEfficiency(nonMetalMaterial, nonMetalMaterial.laserParameters);
      
      expect(metalEfficiency).toBeGreaterThan(nonMetalEfficiency);
    });

    it('should apply power factor for high-power settings', () => {
      const lowPowerSettings = { power: 100 };
      const highPowerSettings = { power: 300 };
      
      const material = { materialType: 'Metal' };
      
      const lowPowerEfficiency = calculateLaserEfficiency(material, lowPowerSettings);
      const highPowerEfficiency = calculateLaserEfficiency(material, highPowerSettings);
      
      expect(highPowerEfficiency).toBeGreaterThan(lowPowerEfficiency);
    });
  });

  describe('Material Report Generation', () => {
    it('should generate complete material processing report', () => {
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      const report = generateMaterialReport(aluminum);
      
      expect(report).toHaveProperty('materialId', 'Al');
      expect(report).toHaveProperty('title', 'Laser Cleaning Aluminum');
      expect(report).toHaveProperty('processingComplexity');
      expect(report).toHaveProperty('recommendedSettings');
      expect(report).toHaveProperty('safetyRating');
      expect(report).toHaveProperty('estimatedEfficiency');
    });

    it('should set processing complexity based on material type', () => {
      const metalMaterial = { ...mockMaterialData['aluminum-laser-cleaning'] };
      const report = generateMaterialReport(metalMaterial);
      
      expect(report.processingComplexity).toBe('Medium');
    });

    it('should include recommended laser settings', () => {
      const steel = mockMaterialData['steel-laser-cleaning'];
      const report = generateMaterialReport(steel);
      
      expect(report.recommendedSettings).toEqual(steel.laserParameters);
    });

    it('should calculate realistic efficiency values', () => {
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      const report = generateMaterialReport(aluminum);
      
      expect(report.estimatedEfficiency).toBeGreaterThan(0.5);
      expect(report.estimatedEfficiency).toBeLessThan(2.0);
    });
  });

  describe('Material Database Operations', () => {
    it('should handle material lookups by slug', () => {
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      expect(aluminum).toBeDefined();
      expect(aluminum.title).toBe('Laser Cleaning Aluminum');
    });

    it('should handle material lookups by symbol', () => {
      const materials = Object.values(mockMaterialData);
      const aluminumBySymbol = materials.find(m => m.symbol === 'Al');
      
      expect(aluminumBySymbol).toBeDefined();
      expect(aluminumBySymbol.title).toBe('Laser Cleaning Aluminum');
    });

    it('should filter materials by type', () => {
      const materials = Object.values(mockMaterialData);
      const metals = materials.filter(m => m.materialType === 'Metal');
      
      expect(metals).toHaveLength(2);
      expect(metals.every(m => m.materialType === 'Metal')).toBe(true);
    });

    it('should sort materials by processing complexity', () => {
      const materials = Object.values(mockMaterialData);
      const reports = materials.map(generateMaterialReport);
      const sorted = reports.sort((a, b) => {
        const complexityOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
        return complexityOrder[a.processingComplexity] - complexityOrder[b.processingComplexity];
      });
      
      expect(sorted[0].processingComplexity).toBe('Medium');
    });
  });

  describe('Material Safety and Compliance', () => {
    it('should assign appropriate safety ratings', () => {
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      const report = generateMaterialReport(aluminum);
      
      expect(['A', 'B', 'C']).toContain(report.safetyRating);
    });

    it('should validate laser parameter ranges', () => {
      const validateLaserParameters = (params) => {
        const powerValue = parseInt(params.power.split('-')[0]);
        const freqValue = parseInt(params.pulseFrequency.split('-')[0]);
        
        return powerValue >= 10 && powerValue <= 1000 && freqValue >= 1 && freqValue <= 100;
      };
      
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      expect(validateLaserParameters(aluminum.laserParameters)).toBe(true);
    });

    it('should enforce material property constraints', () => {
      const validateMaterialConstraints = (material) => {
        const density = parseFloat(material.properties.density);
        const meltingPoint = parseFloat(material.properties.meltingPoint);
        
        return density > 0 && density < 25 && meltingPoint > 0 && meltingPoint < 5000;
      };
      
      const steel = mockMaterialData['steel-laser-cleaning'];
      expect(validateMaterialConstraints(steel)).toBe(true);
    });
  });

  describe('Integration with Content System', () => {
    it('should format material data for content generation', () => {
      const formatForContent = (material) => {
        return {
          slug: material.title.toLowerCase().replace(/\s+/g, '-'),
          metadata: {
            title: material.title,
            materialType: material.materialType,
            symbol: material.symbol
          },
          content: {
            properties: material.properties,
            laserSettings: material.laserParameters
          }
        };
      };
      
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      const formatted = formatForContent(aluminum);
      
      expect(formatted.slug).toBe('laser-cleaning-aluminum');
      expect(formatted.metadata.title).toBe(aluminum.title);
      expect(formatted.content.properties).toEqual(aluminum.properties);
    });

    it('should generate SEO-friendly material descriptions', () => {
      const generateSEODescription = (material) => {
        return `Comprehensive guide for laser cleaning ${material.title.toLowerCase()}. ` +
               `Learn about ${material.materialType.toLowerCase()} properties, ` +
               `optimal laser parameters, and processing techniques.`;
      };
      
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      const description = generateSEODescription(aluminum);
      
      expect(description).toContain('laser cleaning');
      expect(description).toContain('aluminum');
      expect(description).toContain('metal properties');
      expect(description.length).toBeGreaterThan(50);
    });

    it('should create material cross-references', () => {
      const createCrossReferences = (targetMaterial, allMaterials) => {
        return Object.values(allMaterials)
          .filter(m => m.materialType === targetMaterial.materialType && m.symbol !== targetMaterial.symbol)
          .map(m => ({
            title: m.title,
            symbol: m.symbol,
            slug: m.title.toLowerCase().replace(/\s+/g, '-')
          }));
      };
      
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      const references = createCrossReferences(aluminum, mockMaterialData);
      
      expect(references).toHaveLength(1);
      expect(references[0].symbol).toBe('Fe');
    });
  });

  describe('Performance and Optimization', () => {
    it('should efficiently process multiple materials', () => {
      const startTime = Date.now();
      
      const materials = Object.values(mockMaterialData);
      const reports = materials.map(generateMaterialReport);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(reports).toHaveLength(2);
      expect(processingTime).toBeLessThan(100); // Should process quickly
    });

    it('should cache material calculations', () => {
      const cache = new Map();
      
      const getCachedEfficiency = (material) => {
        const key = `${material.symbol}-${material.laserParameters.power}`;
        if (cache.has(key)) {
          return cache.get(key);
        }
        
        const efficiency = calculateLaserEfficiency(material, material.laserParameters);
        cache.set(key, efficiency);
        return efficiency;
      };
      
      const aluminum = mockMaterialData['aluminum-laser-cleaning'];
      
      const firstCall = getCachedEfficiency(aluminum);
      const secondCall = getCachedEfficiency(aluminum);
      
      expect(firstCall).toBe(secondCall);
      expect(cache.size).toBe(1);
    });

    it('should handle batch material processing', () => {
      const processMaterialBatch = (materials) => {
        return materials.map(material => {
          try {
            validateMaterialProperties(material);
            return {
              success: true,
              material: material.symbol,
              report: generateMaterialReport(material)
            };
          } catch (error) {
            return {
              success: false,
              material: material.symbol || 'unknown',
              error: error.message
            };
          }
        });
      };
      
      const materials = Object.values(mockMaterialData);
      const results = processMaterialBatch(materials);
      
      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed material data gracefully', () => {
      const malformedMaterial = {
        title: null,
        materialType: undefined,
        properties: 'invalid'
      };
      
      expect(() => {
        validateMaterialProperties(malformedMaterial);
      }).toThrow();
    });

    it('should handle extreme laser parameter values', () => {
      const extremeMaterial = {
        materialType: 'Exotic',
        laserParameters: { power: 999999 }
      };
      
      const efficiency = calculateLaserEfficiency(extremeMaterial, extremeMaterial.laserParameters);
      expect(efficiency).toBeGreaterThan(0);
      expect(efficiency).toBeLessThan(10);
    });

    it('should handle empty material database', () => {
      const emptyDatabase = {};
      const materials = Object.values(emptyDatabase);
      
      expect(materials).toHaveLength(0);
      expect(() => {
        materials.map(generateMaterialReport);
      }).not.toThrow();
    });

    it('should validate material type consistency', () => {
      const validateTypeConsistency = (material) => {
        const validTypes = ['Metal', 'Polymer', 'Ceramic', 'Composite', 'Glass'];
        return validTypes.includes(material.materialType);
      };
      
      const validMaterial = mockMaterialData['aluminum-laser-cleaning'];
      const invalidMaterial = { ...validMaterial, materialType: 'InvalidType' };
      
      expect(validateTypeConsistency(validMaterial)).toBe(true);
      expect(validateTypeConsistency(invalidMaterial)).toBe(false);
    });
  });
});
