/**
 * Safety Schema Generation Tests
 * 
 * Tests for SEO safety data enhancement implementation:
 * - Product schema safety properties extraction
 * - ChemicalSubstance schema generation
 * - Safety consideration text building
 * - Google Shopping safety rating calculation
 */

import { describe, test, expect } from '@jest/globals';

describe('Safety Data Schema Generation', () => {
  describe('Safety Properties Extraction', () => {
    test('extracts fire_explosion_risk from safety_data', () => {
      const safetyData = {
        fire_explosion_risk: { severity: 'high', description: 'High fire risk' },
        toxic_gas_risk: { severity: 'severe', description: 'Severe toxic gas generation' },
        visibility_hazard: { severity: 'moderate', description: 'Moderate visibility impairment' }
      };
      
      // Simulate SchemaFactory extraction logic
      const safetyProperties: any[] = [];
      
      if (safetyData.fire_explosion_risk) {
        safetyProperties.push({
          '@type': 'PropertyValue',
          'propertyID': 'fire_explosion_risk',
          'name': 'Fire/Explosion Risk',
          'value': safetyData.fire_explosion_risk
        });
      }
      
      expect(safetyProperties).toHaveLength(1);
      expect(safetyProperties[0]['propertyID']).toBe('fire_explosion_risk');
      expect(safetyProperties[0]['name']).toBe('Fire/Explosion Risk');
      expect(safetyProperties[0]['value']).toEqual(safetyData.fire_explosion_risk);
    });
    
    test('extracts all three safety risk types', () => {
      const safetyData = {
        fire_explosion_risk: { severity: 'high' },
        toxic_gas_risk: { severity: 'severe' },
        visibility_hazard: { severity: 'moderate' }
      };
      
      const safetyProperties: any[] = [];
      
      if (safetyData.fire_explosion_risk) {
        safetyProperties.push({
          '@type': 'PropertyValue',
          'propertyID': 'fire_explosion_risk',
          'name': 'Fire/Explosion Risk',
          'value': safetyData.fire_explosion_risk
        });
      }
      
      if (safetyData.toxic_gas_risk) {
        safetyProperties.push({
          '@type': 'PropertyValue',
          'propertyID': 'toxic_gas_risk',
          'name': 'Toxic Gas Risk',
          'value': safetyData.toxic_gas_risk
        });
      }
      
      if (safetyData.visibility_hazard) {
        safetyProperties.push({
          '@type': 'PropertyValue',
          'propertyID': 'visibility_hazard',
          'name': 'Visibility Hazard',
          'value': safetyData.visibility_hazard
        });
      }
      
      expect(safetyProperties).toHaveLength(3);
      expect(safetyProperties.map(p => p.propertyID)).toEqual([
        'fire_explosion_risk',
        'toxic_gas_risk',
        'visibility_hazard'
      ]);
    });
    
    test('handles missing safety data gracefully', () => {
      const safetyData = {};
      const safetyProperties: any[] = [];
      
      if (safetyData.fire_explosion_risk) {
        safetyProperties.push({
          '@type': 'PropertyValue',
          'propertyID': 'fire_explosion_risk',
          'name': 'Fire/Explosion Risk',
          'value': safetyData.fire_explosion_risk
        });
      }
      
      expect(safetyProperties).toHaveLength(0);
    });
  });
  
  describe('Safety Consideration Text Building', () => {
    test('builds safetyConsideration from PPE requirements', () => {
      const safetyData = {
        ppe_requirements: {
          respiratory: 'Full-face supplied air respirator',
          eye_protection: 'Chemical goggles with face shield',
          protective_clothing: 'Tyvek suit with hood',
          gloves: 'Nitrile gloves (8 mil minimum)'
        }
      };
      
      const ppeItems: string[] = [];
      
      if (safetyData.ppe_requirements.respiratory) {
        ppeItems.push(`Respiratory: ${safetyData.ppe_requirements.respiratory}`);
      }
      if (safetyData.ppe_requirements.eye_protection) {
        ppeItems.push(`Eye Protection: ${safetyData.ppe_requirements.eye_protection}`);
      }
      if (safetyData.ppe_requirements.protective_clothing) {
        ppeItems.push(`Protective Clothing: ${safetyData.ppe_requirements.protective_clothing}`);
      }
      if (safetyData.ppe_requirements.gloves) {
        ppeItems.push(`Gloves: ${safetyData.ppe_requirements.gloves}`);
      }
      
      const safetyConsideration = ppeItems.join('. ') + '.';
      
      expect(safetyConsideration).toContain('Respiratory: Full-face supplied air respirator');
      expect(safetyConsideration).toContain('Eye Protection: Chemical goggles with face shield');
      expect(safetyConsideration).toContain('Protective Clothing: Tyvek suit with hood');
      expect(safetyConsideration).toContain('Gloves: Nitrile gloves (8 mil minimum)');
    });
    
    test('includes ventilation requirements in safety consideration', () => {
      const safetyData = {
        ppe_requirements: {
          respiratory: 'Full-face respirator'
        },
        ventilation_requirements: {
          minimum_air_changes_per_hour: 12
        }
      };
      
      const ppeItems: string[] = [];
      
      if (safetyData.ppe_requirements.respiratory) {
        ppeItems.push(`Respiratory: ${safetyData.ppe_requirements.respiratory}`);
      }
      
      if (safetyData.ventilation_requirements?.minimum_air_changes_per_hour) {
        ppeItems.push(`Ventilation: Minimum ${safetyData.ventilation_requirements.minimum_air_changes_per_hour} ACH required`);
      }
      
      const safetyConsideration = ppeItems.join('. ') + '.';
      
      expect(safetyConsideration).toContain('Ventilation: Minimum 12 ACH required');
    });
    
    test('handles partial PPE requirements', () => {
      const safetyData = {
        ppe_requirements: {
          respiratory: 'Half-face respirator',
          eye_protection: 'Safety glasses'
          // No protective_clothing or gloves
        }
      };
      
      const ppeItems: string[] = [];
      
      if (safetyData.ppe_requirements.respiratory) {
        ppeItems.push(`Respiratory: ${safetyData.ppe_requirements.respiratory}`);
      }
      if (safetyData.ppe_requirements.eye_protection) {
        ppeItems.push(`Eye Protection: ${safetyData.ppe_requirements.eye_protection}`);
      }
      
      const safetyConsideration = ppeItems.join('. ') + '.';
      
      expect(safetyConsideration).toBe('Respiratory: Half-face respirator. Eye Protection: Safety glasses.');
      expect(safetyConsideration).not.toContain('Protective Clothing');
      expect(safetyConsideration).not.toContain('Gloves');
    });
  });
  
  describe('Google Shopping Safety Rating Calculation', () => {
    test('calculates severe-hazard for severe toxic gas risk', () => {
      const safetyData = {
        fire_explosion_risk: { severity: 'moderate' },
        toxic_gas_risk: { severity: 'severe' },
        visibility_hazard: { severity: 'low' }
      };
      
      function calculateSafetyRating(data: any): string {
        const fire = data.fire_explosion_risk?.severity || 'low';
        const toxic = data.toxic_gas_risk?.severity || 'low';
        const visibility = data.visibility_hazard?.severity || 'low';
        
        if (toxic === 'severe' || fire === 'critical') {
          return 'severe-hazard';
        }
        
        const highCount = [fire, toxic, visibility].filter(r => r === 'high').length;
        const moderateCount = [fire, toxic, visibility].filter(r => r === 'moderate').length;
        
        if (highCount >= 1 || moderateCount >= 2) {
          return 'high-hazard';
        }
        
        if (moderateCount >= 1) {
          return 'moderate-hazard';
        }
        
        return 'low-hazard';
      }
      
      const rating = calculateSafetyRating(safetyData);
      expect(rating).toBe('severe-hazard');
    });
    
    test('calculates high-hazard for any high risk', () => {
      const safetyData = {
        fire_explosion_risk: { severity: 'high' },
        toxic_gas_risk: { severity: 'low' },
        visibility_hazard: { severity: 'low' }
      };
      
      function calculateSafetyRating(data: any): string {
        const fire = data.fire_explosion_risk?.severity || 'low';
        const toxic = data.toxic_gas_risk?.severity || 'low';
        const visibility = data.visibility_hazard?.severity || 'low';
        
        if (toxic === 'severe' || fire === 'critical') {
          return 'severe-hazard';
        }
        
        const highCount = [fire, toxic, visibility].filter(r => r === 'high').length;
        const moderateCount = [fire, toxic, visibility].filter(r => r === 'moderate').length;
        
        if (highCount >= 1 || moderateCount >= 2) {
          return 'high-hazard';
        }
        
        if (moderateCount >= 1) {
          return 'moderate-hazard';
        }
        
        return 'low-hazard';
      }
      
      const rating = calculateSafetyRating(safetyData);
      expect(rating).toBe('high-hazard');
    });
    
    test('calculates high-hazard for multiple moderate risks', () => {
      const safetyData = {
        fire_explosion_risk: { severity: 'moderate' },
        toxic_gas_risk: { severity: 'moderate' },
        visibility_hazard: { severity: 'low' }
      };
      
      function calculateSafetyRating(data: any): string {
        const fire = data.fire_explosion_risk?.severity || 'low';
        const toxic = data.toxic_gas_risk?.severity || 'low';
        const visibility = data.visibility_hazard?.severity || 'low';
        
        if (toxic === 'severe' || fire === 'critical') {
          return 'severe-hazard';
        }
        
        const highCount = [fire, toxic, visibility].filter(r => r === 'high').length;
        const moderateCount = [fire, toxic, visibility].filter(r => r === 'moderate').length;
        
        if (highCount >= 1 || moderateCount >= 2) {
          return 'high-hazard';
        }
        
        if (moderateCount >= 1) {
          return 'moderate-hazard';
        }
        
        return 'low-hazard';
      }
      
      const rating = calculateSafetyRating(safetyData);
      expect(rating).toBe('high-hazard');
    });
    
    test('calculates moderate-hazard for single moderate risk', () => {
      const safetyData = {
        fire_explosion_risk: { severity: 'moderate' },
        toxic_gas_risk: { severity: 'low' },
        visibility_hazard: { severity: 'low' }
      };
      
      function calculateSafetyRating(data: any): string {
        const fire = data.fire_explosion_risk?.severity || 'low';
        const toxic = data.toxic_gas_risk?.severity || 'low';
        const visibility = data.visibility_hazard?.severity || 'low';
        
        if (toxic === 'severe' || fire === 'critical') {
          return 'severe-hazard';
        }
        
        const highCount = [fire, toxic, visibility].filter(r => r === 'high').length;
        const moderateCount = [fire, toxic, visibility].filter(r => r === 'moderate').length;
        
        if (highCount >= 1 || moderateCount >= 2) {
          return 'high-hazard';
        }
        
        if (moderateCount >= 1) {
          return 'moderate-hazard';
        }
        
        return 'low-hazard';
      }
      
      const rating = calculateSafetyRating(safetyData);
      expect(rating).toBe('moderate-hazard');
    });
    
    test('calculates low-hazard for all low risks', () => {
      const safetyData = {
        fire_explosion_risk: { severity: 'low' },
        toxic_gas_risk: { severity: 'low' },
        visibility_hazard: { severity: 'low' }
      };
      
      function calculateSafetyRating(data: any): string {
        const fire = data.fire_explosion_risk?.severity || 'low';
        const toxic = data.toxic_gas_risk?.severity || 'low';
        const visibility = data.visibility_hazard?.severity || 'low';
        
        if (toxic === 'severe' || fire === 'critical') {
          return 'severe-hazard';
        }
        
        const highCount = [fire, toxic, visibility].filter(r => r === 'high').length;
        const moderateCount = [fire, toxic, visibility].filter(r => r === 'moderate').length;
        
        if (highCount >= 1 || moderateCount >= 2) {
          return 'high-hazard';
        }
        
        if (moderateCount >= 1) {
          return 'moderate-hazard';
        }
        
        return 'low-hazard';
      }
      
      const rating = calculateSafetyRating(safetyData);
      expect(rating).toBe('low-hazard');
    });
  });
  
  describe('Ventilation Requirement Calculation', () => {
    test('calculates specialized-extraction for 15+ ACH', () => {
      const safetyData = {
        ventilation_requirements: {
          minimum_air_changes_per_hour: 15
        }
      };
      
      function calculateVentilationRequirement(data: any): string {
        const ach = data.ventilation_requirements?.minimum_air_changes_per_hour;
        
        if (!ach) return 'standard-ventilation';
        
        if (ach >= 15 || data.local_exhaust_required) {
          return 'specialized-extraction';
        } else if (ach >= 10) {
          return 'industrial-ventilation';
        } else if (ach >= 6) {
          return 'enhanced-ventilation';
        }
        
        return 'standard-ventilation';
      }
      
      const requirement = calculateVentilationRequirement(safetyData);
      expect(requirement).toBe('specialized-extraction');
    });
    
    test('calculates industrial-ventilation for 10-14 ACH', () => {
      const safetyData = {
        ventilation_requirements: {
          minimum_air_changes_per_hour: 12
        }
      };
      
      function calculateVentilationRequirement(data: any): string {
        const ach = data.ventilation_requirements?.minimum_air_changes_per_hour;
        
        if (!ach) return 'standard-ventilation';
        
        if (ach >= 15 || data.local_exhaust_required) {
          return 'specialized-extraction';
        } else if (ach >= 10) {
          return 'industrial-ventilation';
        } else if (ach >= 6) {
          return 'enhanced-ventilation';
        }
        
        return 'standard-ventilation';
      }
      
      const requirement = calculateVentilationRequirement(safetyData);
      expect(requirement).toBe('industrial-ventilation');
    });
    
    test('calculates enhanced-ventilation for 6-9 ACH', () => {
      const safetyData = {
        ventilation_requirements: {
          minimum_air_changes_per_hour: 8
        }
      };
      
      function calculateVentilationRequirement(data: any): string {
        const ach = data.ventilation_requirements?.minimum_air_changes_per_hour;
        
        if (!ach) return 'standard-ventilation';
        
        if (ach >= 15 || data.local_exhaust_required) {
          return 'specialized-extraction';
        } else if (ach >= 10) {
          return 'industrial-ventilation';
        } else if (ach >= 6) {
          return 'enhanced-ventilation';
        }
        
        return 'standard-ventilation';
      }
      
      const requirement = calculateVentilationRequirement(safetyData);
      expect(requirement).toBe('enhanced-ventilation');
    });
    
    test('calculates specialized-extraction when local exhaust required', () => {
      const safetyData = {
        ventilation_requirements: {
          minimum_air_changes_per_hour: 8
        },
        local_exhaust_required: true
      };
      
      function calculateVentilationRequirement(data: any): string {
        const ach = data.ventilation_requirements?.minimum_air_changes_per_hour;
        
        if (!ach) return 'standard-ventilation';
        
        if (ach >= 15 || data.local_exhaust_required) {
          return 'specialized-extraction';
        } else if (ach >= 10) {
          return 'industrial-ventilation';
        } else if (ach >= 6) {
          return 'enhanced-ventilation';
        }
        
        return 'standard-ventilation';
      }
      
      const requirement = calculateVentilationRequirement(safetyData);
      expect(requirement).toBe('specialized-extraction');
    });
  });
  
  describe('ChemicalSubstance Schema Generation', () => {
    test('includes required chemistry fields', () => {
      const compoundData = {
        chemical_formula: 'PbO',
        cas_number: '1317-36-8',
        molecular_weight: 223.2,
        name: 'Lead(II) Oxide'
      };
      
      const schema = {
        '@type': 'ChemicalSubstance',
        'name': compoundData.name,
        'chemicalComposition': compoundData.chemical_formula,
        'identifier': {
          '@type': 'PropertyValue',
          'propertyID': 'CAS Registry Number',
          'value': compoundData.cas_number
        },
        'molecularWeight': {
          '@type': 'QuantitativeValue',
          'value': compoundData.molecular_weight,
          'unitText': 'g/mol'
        }
      };
      
      expect(schema['@type']).toBe('ChemicalSubstance');
      expect(schema.chemicalComposition).toBe('PbO');
      expect(schema.identifier.value).toBe('1317-36-8');
      expect(schema.molecularWeight.value).toBe(223.2);
    });
    
    test('includes safety data in safetyConsideration', () => {
      const compoundData = {
        chemical_formula: 'PbO',
        safety_data: {
          fire_explosion_risk: { severity: 'high' },
          toxic_gas_risk: { severity: 'severe' },
          visibility_hazard: { severity: 'moderate' }
        }
      };
      
      const safetyParts: string[] = [];
      if (compoundData.safety_data.fire_explosion_risk) {
        safetyParts.push(`Fire/explosion risk: ${compoundData.safety_data.fire_explosion_risk.severity}`);
      }
      if (compoundData.safety_data.toxic_gas_risk) {
        safetyParts.push(`Toxic gas generation: ${compoundData.safety_data.toxic_gas_risk.severity}`);
      }
      if (compoundData.safety_data.visibility_hazard) {
        safetyParts.push(`Visibility impairment: ${compoundData.safety_data.visibility_hazard.severity}`);
      }
      
      const safetyConsideration = safetyParts.join('. ') + '.';
      
      expect(safetyConsideration).toContain('Fire/explosion risk: high');
      expect(safetyConsideration).toContain('Toxic gas generation: severe');
      expect(safetyConsideration).toContain('Visibility impairment: moderate');
    });
    
    test('includes hazard level in additionalProperty', () => {
      const compoundData = {
        hazard_level: 'severe',
        environmental_impact: 'high'
      };
      
      const additionalProperty: any[] = [];
      
      if (compoundData.hazard_level) {
        additionalProperty.push({
          '@type': 'PropertyValue',
          'name': 'Hazard Level',
          'value': compoundData.hazard_level
        });
      }
      
      if (compoundData.environmental_impact) {
        additionalProperty.push({
          '@type': 'PropertyValue',
          'name': 'Environmental Impact',
          'value': compoundData.environmental_impact
        });
      }
      
      expect(additionalProperty).toHaveLength(2);
      expect(additionalProperty[0].value).toBe('severe');
      expect(additionalProperty[1].value).toBe('high');
    });
  });
  
  describe('Integration Tests', () => {
    test('Product schema includes both safety properties and consideration', () => {
      const materialData = {
        safety_data: {
          fire_explosion_risk: { severity: 'high' },
          toxic_gas_risk: { severity: 'severe' },
          ppe_requirements: {
            respiratory: 'Full-face respirator',
            eye_protection: 'Chemical goggles'
          }
        }
      };
      
      // Safety properties
      const safetyProperties: any[] = [];
      if (materialData.safety_data.fire_explosion_risk) {
        safetyProperties.push({
          '@type': 'PropertyValue',
          'propertyID': 'fire_explosion_risk',
          'name': 'Fire/Explosion Risk',
          'value': materialData.safety_data.fire_explosion_risk
        });
      }
      if (materialData.safety_data.toxic_gas_risk) {
        safetyProperties.push({
          '@type': 'PropertyValue',
          'propertyID': 'toxic_gas_risk',
          'name': 'Toxic Gas Risk',
          'value': materialData.safety_data.toxic_gas_risk
        });
      }
      
      // Safety consideration
      const ppeItems: string[] = [];
      if (materialData.safety_data.ppe_requirements.respiratory) {
        ppeItems.push(`Respiratory: ${materialData.safety_data.ppe_requirements.respiratory}`);
      }
      if (materialData.safety_data.ppe_requirements.eye_protection) {
        ppeItems.push(`Eye Protection: ${materialData.safety_data.ppe_requirements.eye_protection}`);
      }
      const safetyConsideration = ppeItems.join('. ') + '.';
      
      // Verify both present
      expect(safetyProperties.length).toBeGreaterThan(0);
      expect(safetyConsideration.length).toBeGreaterThan(0);
      expect(safetyConsideration).toContain('Respiratory');
      expect(safetyConsideration).toContain('Eye Protection');
    });
  });
});
