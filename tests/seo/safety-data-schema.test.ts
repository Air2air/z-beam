/**
 * Safety Data Schema Integration Tests
 * Validates that safety data from frontmatter relationships
 * is properly exposed in Schema.org Product and ChemicalSubstance schemas
 * 
 * Implementation: January 16, 2026
 * Purpose: SEO exposure of critical safety information
 */

import { generateProductSchema } from '@/app/utils/schemas/generators/product';
import { generateChemicalSubstanceSchema } from '@/app/utils/schemas/generators/chemicalSubstance';
import type { SchemaContext } from '@/app/utils/schemas/generators/types';

describe('Safety Data Schema Integration', () => {
  const mockContext: SchemaContext = {
    baseUrl: 'https://z-beam.com',
    pageUrl: 'https://z-beam.com/test',
    slug: 'test-material',
  };

  describe('Product Schema - Safety Data', () => {
    it('should include fire & explosion risk in additionalProperty', () => {
      const options = {
        context: mockContext,
        name: 'Test Material',
        description: 'Test description',
        category: 'metal',
        relationships: {
          safety: {
            fireExplosionRisk: {
              items: [{
                riskLevel: 'High',
                hazardDescription: 'Combustible dust formation during ablation'
              }]
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      expect(schema.additionalProperty).toBeDefined();
      const fireRiskProp = schema.additionalProperty.find(
        (prop: any) => prop.propertyID === 'fireExplosionRisk'
      );
      expect(fireRiskProp).toBeDefined();
      expect(fireRiskProp.name).toBe('Fire & Explosion Risk');
      expect(fireRiskProp.value).toBe('High');
      expect(fireRiskProp.description).toContain('Combustible');
    });

    it('should include toxic gas risk with compound information', () => {
      const options = {
        context: mockContext,
        name: 'Test Material',
        description: 'Test description',
        category: 'metal',
        relationships: {
          safety: {
            toxicGasRisk: {
              items: [{
                riskLevel: 'Severe',
                compoundsProduced: ['Carbon Monoxide', 'Hydrogen Cyanide']
              }]
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      const toxicGasProp = schema.additionalProperty.find(
        (prop: any) => prop.propertyID === 'toxicGasRisk'
      );
      expect(toxicGasProp).toBeDefined();
      expect(toxicGasProp.value).toBe('Severe');
      expect(toxicGasProp.description).toContain('Carbon Monoxide');
      expect(toxicGasProp.description).toContain('Hydrogen Cyanide');
    });

    it('should include PPE requirements with comprehensive details', () => {
      const options = {
        context: mockContext,
        name: 'Test Material',
        description: 'Test description',
        category: 'metal',
        relationships: {
          safety: {
            ppeRequirements: {
              items: [{
                respiratory: 'SCBA or supplied-air respirator',
                eye: 'Chemical safety goggles with face shield',
                skin: 'Nitrile gloves with thermal protection',
                minimumLevel: 'Level B',
                specialNotes: 'Cryogenic hazard - full protection required'
              }]
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      const ppeProp = schema.additionalProperty.find(
        (prop: any) => prop.propertyID === 'ppeRequirements'
      );
      expect(ppeProp).toBeDefined();
      expect(ppeProp.value).toContain('Respiratory: SCBA');
      expect(ppeProp.value).toContain('Eye: Chemical safety goggles');
      expect(ppeProp.value).toContain('Skin: Nitrile gloves');
      expect(ppeProp.value).toContain('Minimum Level: Level B');
      expect(ppeProp.description).toContain('Cryogenic');
    });

    it('should include ventilation requirements with specifications', () => {
      const options = {
        context: mockContext,
        name: 'Test Material',
        description: 'Test description',
        category: 'metal',
        relationships: {
          safety: {
            ventilationRequirements: {
              items: [{
                airChangesPerHour: '12-15',
                exhaustVelocity: '100 fpm',
                filtrationRequired: 'HEPA + activated carbon',
                specialNotes: 'Local exhaust ventilation mandatory'
              }]
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      const ventProp = schema.additionalProperty.find(
        (prop: any) => prop.propertyID === 'ventilationRequirements'
      );
      expect(ventProp).toBeDefined();
      expect(ventProp.value).toContain('12-15 ACH');
      expect(ventProp.value).toContain('100 fpm velocity');
      expect(ventProp.value).toContain('Filtration: HEPA');
    });

    it('should include particulate generation data', () => {
      const options = {
        context: mockContext,
        name: 'Test Material',
        description: 'Test description',
        category: 'metal',
        relationships: {
          safety: {
            particulateGeneration: {
              items: [{
                particleSize: '0.5-5 μm',
                respirableFraction: '60-80%'
              }]
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      const partProp = schema.additionalProperty.find(
        (prop: any) => prop.propertyID === 'particulateGeneration'
      );
      expect(partProp).toBeDefined();
      expect(partProp.value).toContain('0.5-5');
      expect(partProp.description).toContain('60-80%');
    });

    it('should include visibility hazard information', () => {
      const options = {
        context: mockContext,
        name: 'Test Material',
        description: 'Test description',
        category: 'metal',
        relationships: {
          safety: {
            visibilityHazard: {
              items: [{
                severity: 'Moderate',
                hazardDescription: 'Dense smoke plume formation'
              }]
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      const visProp = schema.additionalProperty.find(
        (prop: any) => prop.propertyID === 'visibilityHazard'
      );
      expect(visProp).toBeDefined();
      expect(visProp.value).toBe('Moderate');
      expect(visProp.description).toContain('smoke plume');
    });

    it('should add warning field when critical hazards present', () => {
      const options = {
        context: mockContext,
        name: 'Test Material',
        description: 'Test description',
        category: 'metal',
        relationships: {
          safety: {
            fireExplosionRisk: {
              items: [{ riskLevel: 'Critical' }]
            },
            toxicGasRisk: {
              items: [{ riskLevel: 'Severe' }]
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      expect(schema.warning).toBeDefined();
      expect(schema.warning).toContain('safety hazards');
      expect(schema.warning).toContain('PPE');
      expect(schema.warning).toContain('ventilation');
    });

    it('should NOT add warning when only low-level hazards present', () => {
      const options = {
        context: mockContext,
        name: 'Test Material',
        description: 'Test description',
        category: 'metal',
        relationships: {
          safety: {
            fireExplosionRisk: {
              items: [{ riskLevel: 'Low' }]
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      expect(schema.warning).toBeUndefined();
    });
  });

  describe('ChemicalSubstance Schema - Safety Data', () => {
    it('should include fire & explosion risk for compounds', () => {
      const data = {
        frontmatter: {
          name: 'Sulfur Dioxide',
          description: 'Toxic gas compound',
          chemicalFormula: 'SO2',
          relationships: {
            safety: {
              fireExplosionRisk: {
                items: [{
                  riskLevel: 'High',
                  hazardDescription: 'Cylinders may explode when heated'
                }]
              }
            }
          }
        }
      };

      const schema = generateChemicalSubstanceSchema(data, mockContext);
      
      expect(schema?.additionalProperty).toBeDefined();
      const fireRiskProp = schema.additionalProperty.find(
        (prop: any) => prop.propertyID === 'fireExplosionRisk'
      );
      expect(fireRiskProp).toBeDefined();
      expect(fireRiskProp.value).toBe('High');
    });

    it('should include exposure limits for compounds', () => {
      const data = {
        frontmatter: {
          name: 'Sulfur Dioxide',
          description: 'Toxic gas compound',
          chemicalFormula: 'SO2',
          relationships: {
            safety: {
              exposureLimits: {
                items: [{
                  oshaPelPpm: 5,
                  nioshRelPpm: 2,
                  acgihTlvPpm: 0.25
                }]
              }
            }
          }
        }
      };

      const schema = generateChemicalSubstanceSchema(data, mockContext);
      
      const exposureProp = schema?.additionalProperty?.find(
        (prop: any) => prop.propertyID === 'exposureLimits'
      );
      expect(exposureProp).toBeDefined();
      expect(exposureProp.value).toContain('OSHA PEL: 5 ppm');
      expect(exposureProp.value).toContain('NIOSH REL: 2 ppm');
      expect(exposureProp.value).toContain('ACGIH TLV: 0.25 ppm');
    });

    it('should add safety warning for critical compound hazards', () => {
      const data = {
        frontmatter: {
          name: 'Hydrogen Cyanide',
          description: 'Extremely toxic compound',
          chemicalFormula: 'HCN',
          relationships: {
            safety: {
              toxicGasRisk: {
                items: [{
                  riskLevel: 'Critical',
                  compoundsProduced: ['Fatal if inhaled']
                }]
              }
            }
          }
        }
      };

      const schema = generateChemicalSubstanceSchema(data, mockContext);
      
      expect(schema?.warning).toBeDefined();
      expect(schema.warning).toContain('significant safety hazards');
      expect(schema.warning).toContain('Professional handling');
    });
  });

  describe('Integration - Multiple Safety Factors', () => {
    it('should combine all safety data types in single schema', () => {
      const options = {
        context: mockContext,
        name: 'High-Risk Material',
        description: 'Material with multiple safety concerns',
        category: 'metal',
        relationships: {
          safety: {
            fireExplosionRisk: { items: [{ riskLevel: 'High' }] },
            toxicGasRisk: { items: [{ riskLevel: 'Severe', compoundsProduced: ['HCN'] }] },
            ppeRequirements: { items: [{ respiratory: 'SCBA', minimumLevel: 'Level B' }] },
            ventilationRequirements: { items: [{ airChangesPerHour: '15+' }] },
            particulateGeneration: { items: [{ particleSize: '<2 μm', respirableFraction: '80%' }] },
            visibilityHazard: { items: [{ severity: 'High' }] }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      expect(schema.additionalProperty.length).toBeGreaterThanOrEqual(6);
      expect(schema.warning).toBeDefined();
      
      // Verify all safety types present
      const propIds = schema.additionalProperty.map((p: any) => p.propertyID);
      expect(propIds).toContain('fireExplosionRisk');
      expect(propIds).toContain('toxicGasRisk');
      expect(propIds).toContain('ppeRequirements');
      expect(propIds).toContain('ventilationRequirements');
      expect(propIds).toContain('particulateGeneration');
      expect(propIds).toContain('visibilityHazard');
    });
  });

  describe('SEO Impact - Rich Snippets', () => {
    it('should structure safety data for Google Rich Results', () => {
      const options = {
        context: mockContext,
        name: 'Industrial Material',
        description: 'Material requiring safety precautions',
        category: 'metal',
        relationships: {
          safety: {
            fireExplosionRisk: { items: [{ riskLevel: 'Moderate' }] },
            ppeRequirements: { 
              items: [{ 
                respiratory: 'N95 respirator',
                eye: 'Safety goggles',
                minimumLevel: 'Level C'
              }] 
            }
          }
        }
      };

      const schema = generateProductSchema(options);
      
      // Schema.org PropertyValue format required by Google
      schema.additionalProperty.forEach((prop: any) => {
        expect(prop['@type']).toBe('PropertyValue');
        expect(prop.propertyID).toBeDefined();
        expect(prop.name).toBeDefined();
        expect(prop.value).toBeDefined();
      });
    });
  });
});
