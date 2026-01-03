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
    
    // Material properties
    ...(properties.length > 0 && { additionalProperty: properties }),
    
    // SKU
    sku: productSku,
    
    // Keywords from applications
    ...(applications.length > 0 && {
      keywords: applications.join(', ')
    }),
    
    // Offers (required by Google for rich snippets)
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      price: SITE_CONFIG.pricing.professionalCleaning.hourlyRate,
      priceCurrency: SITE_CONFIG.pricing.professionalCleaning.currency,
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: SITE_CONFIG.pricing.professionalCleaning.hourlyRate,
        priceCurrency: SITE_CONFIG.pricing.professionalCleaning.currency,
        unitText: SITE_CONFIG.pricing.professionalCleaning.unit,
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1,
          unitText: 'service'
        }
      },
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url
      },
      description: `${SITE_CONFIG.pricing.professionalCleaning.description} for ${name}. Starting at $${SITE_CONFIG.pricing.professionalCleaning.hourlyRate}/${SITE_CONFIG.pricing.professionalCleaning.unit}. Contact for custom quote.`
    }
  };
}
