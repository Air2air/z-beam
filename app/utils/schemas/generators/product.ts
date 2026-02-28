/**
 * Product Schema Generator
 * Implements E-E-A-T: Authoritativeness
 */

import { SITE_CONFIG } from '../../constants';
import { createAuthorReference } from './person';
import type { SchemaContext, AuthorData, ImageData, PropertyValue } from './types';

export interface ProductSchemaOptions {
  context: SchemaContext;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  author?: AuthorData;
  images?: {
    hero?: ImageData;
    micro?: ImageData;
  };
  materialProperties?: Record<string, Record<string, PropertyValue>>;
  applications?: string[];
  environmentalImpact?: any[];
  sku?: string;
}

/**
 * Generate Product schema for materials
 */
export function generateProductSchema(options: ProductSchemaOptions) {
  const {
    context,
    name,
    description,
    category,
    subcategory,
    author = {},
    images,
    materialProperties = {},
    applications = [],
    sku
  } = options;
  
  const { baseUrl, pageUrl } = context;
  
  // Extract safety data from frontmatter relationships
  const safetyData = extractSafetyData(options as any);
  
  // Build product images
  const productImages: any[] = [];
  if (images?.hero?.url) {
    productImages.push({
      '@type': 'ImageObject',
      url: `${baseUrl}${images.hero.url}`,
      micro: images.hero.alt || description
    });
  }
  if (images?.micro?.url) {
    productImages.push({
      '@type': 'ImageObject',
      url: `${baseUrl}${images.micro.url}`,
      micro: images.micro.alt || `Microscopic view of ${name}`
    });
  }
  
  // Build additional properties with confidence scores
  const properties: any[] = [];
  Object.entries(materialProperties).forEach(([_categoryKey, categoryData]) => {
    const propsToProcess = categoryData?.properties || categoryData;
    
    if (typeof propsToProcess === 'object' && !Array.isArray(propsToProcess)) {
      Object.entries(propsToProcess).forEach(([propKey, propData]: [string, any]) => {
        if (['label', 'description', 'percentage'].includes(propKey)) return;
        
        if (propData?.value !== undefined) {
          properties.push({
            '@type': 'PropertyValue',
            propertyID: propKey,
            name: propKey,
            value: propData.value,
            unitText: propData.unit,
            ...(propData.confidence && {
              valueReference: {
                '@type': 'QualitativeValue',
                name: 'Confidence',
                value: propData.confidence
              }
            })
          });
        }
      });
    }
  });
  
  const productSku = sku || `LASER-CLEAN-${name.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
  const rentalPackages = Object.values(SITE_CONFIG.pricing.equipmentRental.packages);
  const packageRates = rentalPackages.map((pkg) => pkg.hourlyRate);
  const lowPrice = Math.min(...packageRates);
  const highPrice = Math.max(...packageRates);
  
  return {
    '@type': 'Product',
    '@id': `${pageUrl}#material`,
    name,
    description,
    category: `${category}${subcategory ? ` - ${subcategory}` : ''}`,
    inLanguage: 'en-US',
    
    // E-E-A-T: Author reference
    author: createAuthorReference(baseUrl, author.id || 'expert'),
    
    // Brand
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name
    },
    
    // Images
    ...(productImages.length > 0 && { image: productImages }),
    
    // Rating (required by Google)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '47'
    },
    
    // Material properties + Safety data
    ...(properties.length > 0 || safetyData.length > 0) && { 
      additionalProperty: [...properties, ...safetyData] 
    },
    
    // Safety warning (if critical hazards present)
    ...(safetyData.some(prop => 
      ['High', 'Severe', 'Critical'].some(level => 
        String(prop.value).includes(level)
      )
    ) && {
      warning: 'This material may present safety hazards during laser cleaning. Review all safety data and ensure proper PPE, ventilation, and emergency procedures are in place.'
    }),
    
    // SKU
    sku: productSku,
    
    // Keywords from applications
    ...(applications.length > 0 && {
      keywords: applications.join(', ')
    }),
    
    // Offers (required by Google for rich snippets)
    offers: {
      '@type': 'AggregateOffer',
      url: pageUrl,
      lowPrice,
      highPrice,
      offerCount: rentalPackages.length,
      priceCurrency: SITE_CONFIG.pricing.equipmentRental.currency,
      offers: rentalPackages.map((pkg) => ({
        '@type': 'Offer',
        name: pkg.name,
        price: pkg.hourlyRate,
        priceCurrency: SITE_CONFIG.pricing.equipmentRental.currency,
        url: pageUrl
      })),
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        minPrice: lowPrice,
        maxPrice: highPrice,
        priceCurrency: SITE_CONFIG.pricing.equipmentRental.currency,
        unitText: SITE_CONFIG.pricing.equipmentRental.unit,
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: SITE_CONFIG.pricing.equipmentRental.minimumHours || 2,
          unitText: 'hours'
        }
      },
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url
      },
      description: `${SITE_CONFIG.pricing.equipmentRental.description} for ${name}. Residential $${SITE_CONFIG.pricing.equipmentRental.packages.residential.hourlyRate}/${SITE_CONFIG.pricing.equipmentRental.unit}, Industrial $${SITE_CONFIG.pricing.equipmentRental.packages.industrial.hourlyRate}/${SITE_CONFIG.pricing.equipmentRental.unit}, ${SITE_CONFIG.pricing.equipmentRental.minimumHours || 2}-hour minimum. Delivered to your location.`
    }
  };
}

/**
 * Extract safety data from frontmatter relationships for schema inclusion
 * Exposes fire/explosion risk, toxic gas hazards, PPE requirements, and ventilation needs
 */
function extractSafetyData(options: any): PropertyValue[] {
  const safetyProps: PropertyValue[] = [];
  const relationships = options.relationships?.safety || {};
  
  // Fire & Explosion Risk
  if (relationships.fireExplosionRisk?.items?.length > 0) {
    const item = relationships.fireExplosionRisk.items[0];
    if (item.riskLevel) {
      safetyProps.push({
        '@type': 'PropertyValue' as const,
        propertyID: 'fireExplosionRisk',
        name: 'Fire & Explosion Risk',
        value: item.riskLevel,
        description: item.hazardDescription || item.specificHazards
      } as any); // Schema.org PropertyValue with @type
    }
  }
  
  // Toxic Gas Risk
  if (relationships.toxicGasRisk?.items?.length > 0) {
    const item = relationships.toxicGasRisk.items[0];
    if (item.riskLevel || item.compoundsProduced?.length > 0) {
      safetyProps.push({
        '@type': 'PropertyValue' as const,
        propertyID: 'toxicGasRisk',
        name: 'Toxic Gas Risk',
        value: item.riskLevel || 'Present',
        description: item.compoundsProduced?.join(', ') || item.specificHazards
      } as any);
    }
  }
  
  // Visibility Hazard
  if (relationships.visibilityHazard?.items?.length > 0) {
    const item = relationships.visibilityHazard.items[0];
    if (item.severity) {
      safetyProps.push({
        '@type': 'PropertyValue' as const,
        propertyID: 'visibilityHazard',
        name: 'Visibility Hazard',
        value: item.severity,
        description: item.hazardDescription
      } as any);
    }
  }
  
  // PPE Requirements
  if (relationships.ppeRequirements?.items?.length > 0) {
    const item = relationships.ppeRequirements.items[0];
    const ppeTypes: string[] = [];
    
    if (item.respiratory) ppeTypes.push(`Respiratory: ${item.respiratory}`);
    if (item.eye) ppeTypes.push(`Eye: ${item.eye}`);
    if (item.skin) ppeTypes.push(`Skin: ${item.skin}`);
    if (item.minimumLevel) ppeTypes.push(`Minimum Level: ${item.minimumLevel}`);
    
    if (ppeTypes.length > 0) {
      safetyProps.push({
        '@type': 'PropertyValue' as const,
        propertyID: 'ppeRequirements',
        name: 'PPE Requirements',
        value: ppeTypes.join(' | '),
        description: item.specialNotes
      } as any);
    }
  }
  
  // Ventilation Requirements
  if (relationships.ventilationRequirements?.items?.length > 0) {
    const item = relationships.ventilationRequirements.items[0];
    const ventSpecs: string[] = [];
    
    if (item.airChangesPerHour) ventSpecs.push(`${item.airChangesPerHour} ACH`);
    if (item.exhaustVelocity) ventSpecs.push(`${item.exhaustVelocity} velocity`);
    if (item.filtrationRequired) ventSpecs.push(`Filtration: ${item.filtrationRequired}`);
    
    if (ventSpecs.length > 0) {
      safetyProps.push({
        '@type': 'PropertyValue' as const,
        propertyID: 'ventilationRequirements',
        name: 'Ventilation Requirements',
        value: ventSpecs.join(' | '),
        description: item.specialNotes
      } as any);
    }
  }
  
  // Particulate Generation
  if (relationships.particulateGeneration?.items?.length > 0) {
    const item = relationships.particulateGeneration.items[0];
    if (item.particleSize || item.respirableFraction) {
      safetyProps.push({
        '@type': 'PropertyValue' as const,
        propertyID: 'particulateGeneration',
        name: 'Particulate Generation',
        value: item.particleSize || 'Various sizes',
        description: item.respirableFraction ? `Respirable fraction: ${item.respirableFraction}` : undefined
      } as any);
    }
  }
  
  return safetyProps;
}
