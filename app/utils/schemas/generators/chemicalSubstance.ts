/**
 * ChemicalSubstance Schema Generator
 * Specialized schema for compound pages with chemistry and hazard data
 * 
 * @module schemas/generators/chemicalSubstance
 * @implements Schema.org ChemicalSubstance type
 */

import { SITE_CONFIG } from '../../constants';
import type { SchemaContext } from './types';

/**
 * Generate ChemicalSubstance schema for compound pages
 * 
 * Schema.org reference: https://schema.org/ChemicalSubstance
 * 
 * @param data - Article/frontmatter data containing compound information
 * @param context - Schema context with baseUrl, pageUrl, slug
 * @returns ChemicalSubstance schema object or null if not applicable
 */
export function generateChemicalSubstanceSchema(data: any, context: SchemaContext): any | null {
  const { pageUrl, baseUrl } = context;
  
  // Extract frontmatter from various possible locations
  const metadata = (data.frontmatter || {}) as Record<string, unknown>;
  const compoundData = metadata as any;
  
  // Only generate for compound pages with chemical formula
  if (!compoundData.chemical_formula && !compoundData.chemicalFormula) {
    return null;
  }
  
  const name = (compoundData.title || compoundData.name || data.title) as string;
  const description = (compoundData.description || data.description || '') as string;
  const chemicalFormula = compoundData.chemical_formula || compoundData.chemicalFormula;
  
  // Build base schema
  const schema: any = {
    '@type': 'ChemicalSubstance',
    '@id': `${pageUrl}#compound`,
    'name': name,
    'description': description,
    'url': pageUrl,
    'chemicalComposition': chemicalFormula,
    'inLanguage': 'en-US',
    
    // Provider/source organization
    'provider': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl
    }
  };
  
  // Add CAS number if available
  if (compoundData.cas_number || compoundData.casNumber) {
    schema.identifier = {
      '@type': 'PropertyValue',
      'propertyID': 'CAS Registry Number',
      'value': compoundData.cas_number || compoundData.casNumber
    };
  }
  
  // Add molecular weight if available
  if (compoundData.molecular_weight || compoundData.molecularWeight) {
    schema.molecularWeight = {
      '@type': 'QuantitativeValue',
      'value': compoundData.molecular_weight || compoundData.molecularWeight,
      'unitText': 'g/mol'
    };
  }
  
  // Add chemical role/function
  if (compoundData.role || compoundData.function) {
    schema.chemicalRole = compoundData.role || compoundData.function;
  } else {
    // Default role for laser cleaning context
    schema.chemicalRole = 'contaminant requiring laser ablation removal';
  }
  
  // Extract safety/hazard data from relationships
  const relationships = compoundData.relationships?.safety || {};
  const safetyProperties: any[] = [];
  
  // Fire & Explosion Risk
  if (relationships.fireExplosionRisk?.items?.length > 0) {
    const item = relationships.fireExplosionRisk.items[0];
    if (item.riskLevel) {
      safetyProperties.push({
        '@type': 'PropertyValue',
        'propertyID': 'fireExplosionRisk',
        'name': 'Fire & Explosion Risk',
        'value': item.riskLevel,
        'description': item.hazardDescription || item.specificHazards
      });
    }
  }
  
  // Toxic Gas Risk
  if (relationships.toxicGasRisk?.items?.length > 0) {
    const item = relationships.toxicGasRisk.items[0];
    if (item.riskLevel || item.compoundsProduced?.length > 0) {
      safetyProperties.push({
        '@type': 'PropertyValue',
        'propertyID': 'toxicGasRisk',
        'name': 'Toxic Gas Risk',
        'value': item.riskLevel || 'Present',
        'description': item.compoundsProduced?.join(', ') || item.specificHazards
      });
    }
  }
  
  // PPE Requirements (compound-specific)
  if (relationships.ppeRequirements?.items?.length > 0) {
    const item = relationships.ppeRequirements.items[0];
    const ppeTypes: string[] = [];
    
    if (item.respiratory) ppeTypes.push(`Respiratory: ${item.respiratory}`);
    if (item.eye) ppeTypes.push(`Eye: ${item.eye}`);
    if (item.skin) ppeTypes.push(`Skin: ${item.skin}`);
    if (item.minimumLevel) ppeTypes.push(`Minimum Level: ${item.minimumLevel}`);
    
    if (ppeTypes.length > 0) {
      safetyProperties.push({
        '@type': 'PropertyValue',
        'propertyID': 'ppeRequirements',
        'name': 'PPE Requirements',
        'value': ppeTypes.join(' | '),
        'description': item.specialNotes
      });
    }
  }
  
  // Exposure Limits (compound-specific)
  if (relationships.exposureLimits?.items?.length > 0) {
    const item = relationships.exposureLimits.items[0];
    const limits: string[] = [];
    
    if (item.oshaPelPpm) limits.push(`OSHA PEL: ${item.oshaPelPpm} ppm`);
    if (item.nioshRelPpm) limits.push(`NIOSH REL: ${item.nioshRelPpm} ppm`);
    if (item.acgihTlvPpm) limits.push(`ACGIH TLV: ${item.acgihTlvPpm} ppm`);
    
    if (limits.length > 0) {
      safetyProperties.push({
        '@type': 'PropertyValue',
        'propertyID': 'exposureLimits',
        'name': 'Exposure Limits',
        'value': limits.join(' | '),
        'description': 'Occupational exposure thresholds'
      });
    }
  }
  
  // Add safety properties to schema
  if (safetyProperties.length > 0) {
    schema.additionalProperty = [...(schema.additionalProperty || []), ...safetyProperties];
    
    // Add safety warning if critical hazards present
    const hasCriticalHazards = safetyProperties.some(prop => 
      ['High', 'Severe', 'Critical'].some(level => 
        String(prop.value).includes(level)
      )
    );
    
    if (hasCriticalHazards) {
      schema.warning = 'This chemical substance presents significant safety hazards. Professional handling with appropriate PPE, ventilation, and emergency procedures is mandatory.';
    }
  }
  
  // Legacy safety data (fallback)
  const safetyData = compoundData.safety_data || compoundData.safetyData;
  if (safetyData) {
    const hazards: string[] = [];
    
    // Fire/explosion hazard
    if (safetyData.fire_explosion_risk) {
      const severity = safetyData.fire_explosion_risk;
      if (severity === 'high' || severity === 'severe' || severity === 'critical') {
        hazards.push(`Fire/explosion risk: ${severity}`);
      }
    }
    
    // Toxic gas generation
    if (safetyData.toxic_gas_risk) {
      const severity = safetyData.toxic_gas_risk;
      if (severity === 'high' || severity === 'severe' || severity === 'critical') {
        hazards.push(`Toxic gas generation: ${severity}`);
      }
    }
    
    // Visibility hazard
    if (safetyData.visibility_hazard) {
      const severity = safetyData.visibility_hazard;
      if (severity === 'high' || severity === 'severe' || severity === 'critical') {
        hazards.push(`Visibility impairment: ${severity}`);
      }
    }
    
    // Add safetyConsideration field if hazards exist
    if (hazards.length > 0) {
      schema.safetyConsideration = hazards.join('. ') + '.';
    }
    
    // Add health aspects from toxicity data
    if (compoundData.toxicity || safetyData.inhalation_hazard || safetyData.skin_contact_risk) {
      const healthAspects: string[] = [];
      
      if (compoundData.toxicity) {
        healthAspects.push(`Toxicity: ${compoundData.toxicity}`);
      }
      if (safetyData.inhalation_hazard) {
        healthAspects.push(`Inhalation hazard: ${safetyData.inhalation_hazard}`);
      }
      if (safetyData.skin_contact_risk) {
        healthAspects.push(`Skin contact risk: ${safetyData.skin_contact_risk}`);
      }
      
      if (healthAspects.length > 0) {
        schema.healthAspect = healthAspects.join('. ') + '.';
      }
    }
  }
  
  // Add hazard level as PropertyValue
  if (compoundData.hazard_level || compoundData.hazardLevel) {
    const hazardLevel = compoundData.hazard_level || compoundData.hazardLevel;
    
    if (!schema.additionalProperty) {
      schema.additionalProperty = [];
    }
    
    schema.additionalProperty.push({
      '@type': 'PropertyValue',
      'propertyID': 'hazard_level',
      'name': 'Hazard Level',
      'value': hazardLevel
    });
  }
  
  // Add environmental impact
  if (compoundData.environmental_impact || compoundData.environmentalImpact) {
    const envImpact = compoundData.environmental_impact || compoundData.environmentalImpact;
    
    if (!schema.additionalProperty) {
      schema.additionalProperty = [];
    }
    
    schema.additionalProperty.push({
      '@type': 'PropertyValue',
      'propertyID': 'environmental_impact',
      'name': 'Environmental Impact',
      'value': envImpact
    });
  }
  
  // Link to related laser cleaning application
  schema.potentialUse = `Laser ablation removal from contaminated surfaces. Professional safety protocols required.`;
  
  // Add main image if available
  const heroImage = compoundData.images?.hero || compoundData.image;
  if (heroImage) {
    schema.image = {
      '@type': 'ImageObject',
      'url': heroImage.url ? `${baseUrl}${heroImage.url}` : `${baseUrl}${heroImage}`,
      'caption': heroImage.alt || `${name} compound structure`
    };
  }
  
  return schema;
}

/**
 * Check if data contains compound/chemistry information
 * Used as a condition for SchemaFactory registration
 */
export function hasChemicalSubstanceData(data: any): boolean {
  const metadata = (data.frontmatter || {}) as Record<string, unknown>;
  const compoundData = metadata as any;
  
  // Must have chemical formula to be considered a chemical substance
  return !!(compoundData.chemical_formula || compoundData.chemicalFormula);
}
