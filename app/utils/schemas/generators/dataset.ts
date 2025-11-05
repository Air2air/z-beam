/**
 * Dataset Schema Generator
 * Implements E-E-A-T: Trustworthiness with data provenance
 */

import { SITE_CONFIG } from '../../constants';
import { createAuthorReference } from './person';
import type { SchemaContext, AuthorData, PropertyValue } from './types';

export interface DatasetSchemaOptions {
  context: SchemaContext;
  name: string;
  description?: string;
  author?: AuthorData;
  materialProperties?: Record<string, Record<string, PropertyValue>>;
  modifiedDate?: string;
  license?: string;
}

/**
 * Generate Dataset schema for material properties
 */
export function generateDatasetSchema(options: DatasetSchemaOptions) {
  const {
    context,
    name,
    description,
    author = {},
    materialProperties = {},
    modifiedDate,
    license = 'https://creativecommons.org/licenses/by/4.0/'
  } = options;
  
  const { baseUrl, pageUrl, currentDate } = context;
  const modDate = modifiedDate || currentDate || new Date().toISOString();
  
  // Calculate property count and build measurements
  let propertyCount = 0;
  const measurements: any[] = [];
  
  Object.entries(materialProperties).forEach(([_categoryKey, categoryData]) => {
    const propsToProcess = categoryData?.properties || categoryData;
    
    if (typeof propsToProcess === 'object' && !Array.isArray(propsToProcess)) {
      Object.entries(propsToProcess).forEach(([propKey, propData]: [string, any]) => {
        // Skip metadata fields
        if (['label', 'description', 'percentage'].includes(propKey)) return;
        
        if (propData?.value !== undefined) {
          propertyCount++;
          measurements.push({
            '@type': 'PropertyValue',
            propertyID: propKey,
            name: propKey,
            value: propData.value,
            unitText: propData.unit,
            // E-E-A-T: Trustworthiness - verification metadata
            ...(propData.metadata?.last_verified && {
              dateModified: propData.metadata.last_verified
            }),
            ...(propData.metadata?.source && {
              citation: {
                '@type': 'CreativeWork',
                name: propData.metadata.source
              }
            }),
            // Confidence score
            ...(propData.confidence && {
              valueReference: {
                '@type': 'QualitativeValue',
                name: 'Measurement Confidence',
                value: propData.confidence,
                minValue: 0,
                maxValue: 1
              }
            })
          });
        }
      });
    }
  });
  
  // Return null if no measurements
  if (propertyCount === 0) return null;
  
  const datasetDescription = description || 
    `Comprehensive dataset of ${propertyCount} material properties for ${name} laser cleaning`;
  
  return {
    '@type': 'Dataset',
    '@id': `${pageUrl}#dataset`,
    name: `${name} Material Properties Dataset`,
    description: datasetDescription,
    
    // E-E-A-T: Author reference
    author: createAuthorReference(baseUrl, author.id || 'expert'),
    creator: createAuthorReference(baseUrl, author.id || 'expert'),
    
    // Publisher
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: baseUrl
    },
    
    // Language
    inLanguage: 'en-US',
    
    // Dates
    datePublished: modDate,
    dateModified: modDate,
    
    // License
    license,
    
    // Distribution
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${pageUrl}/dataset.json`
    },
    
    // Measurements
    variableMeasured: measurements,
    
    // Metadata
    measurementTechnique: 'Laser-induced breakdown spectroscopy (LIBS), Surface profilometry',
    isAccessibleForFree: true,
    
    // Size
    keywords: `${propertyCount} material properties`,
    size: {
      '@type': 'QuantitativeValue',
      value: propertyCount,
      unitText: 'properties'
    }
  };
}
