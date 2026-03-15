/**
 * Dataset Schema Generator
 * Implements E-E-A-T: Trustworthiness with data provenance
 */

import { SITE_CONFIG } from '../../constants';
import datasetPolicy from '@/app/datasets/core/policy.json';
import { createAuthorReference } from './person';
import type { SchemaContext, AuthorData, PropertyValue } from './types';

export interface DatasetSchemaOptions {
  context: SchemaContext;
  name: string;
  description?: string;
  author?: AuthorData;
  materialProperties?: Record<string, Record<string, PropertyValue>>;
  machineSettings?: Record<string, any>; // For Settings pages
  modifiedDate?: string;
  license?: string;
  canonicalDatasetUrl?: string; // Override for settings pages to use materials dataset URL
}

/**
 * Generate Dataset schema for material properties or machine settings
 */
export function generateDatasetSchema(options: DatasetSchemaOptions) {
  const {
    context,
    name,
    description,
    author = {},
    materialProperties = {},
    machineSettings,
    modifiedDate,
    license = 'https://creativecommons.org/licenses/by/4.0/',
    canonicalDatasetUrl
  } = options;
  
  const { baseUrl, pageUrl, currentDate } = context;
  // Use canonical dataset URL if provided (for settings pages), otherwise use pageUrl
  const datasetUrl = canonicalDatasetUrl || pageUrl;
  const modDate = modifiedDate || currentDate || new Date().toISOString();
  
  // Calculate property count and build measurements
  let propertyCount = 0;
  const measurements: any[] = [];
  
  // Handle machine settings (for Settings pages)
  if (machineSettings) {
    const settingsMap = datasetPolicy.machineSettingMetadata as Record<string, { label: string; description: string }>;
    
    Object.entries(machineSettings).forEach(([key, data]: [string, any]) => {
      if (settingsMap[key] && data?.value !== undefined && data?.unit) {
        propertyCount++;
        measurements.push({
          '@type': 'PropertyValue',
          propertyID: key,
          name: settingsMap[key].label,
          value: data.value,
          unitText: data.unit,
          description: settingsMap[key].description
        });
      }
    });
  }
  
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
            ...(propData.frontmatter?.last_verified && {
              dateModified: propData.frontmatter.last_verified
            }),
            ...(propData.frontmatter?.source && {
              citation: {
                '@type': 'CreativeWork',
                name: propData.frontmatter.source
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
  
  const isSettingsPage = !!machineSettings;
  const datasetDescription = description || 
    (isSettingsPage 
      ? `Research-validated laser cleaning machine parameters for ${name}` 
      : `Comprehensive dataset of ${propertyCount} material properties for ${name} laser cleaning`);
  
  return {
    '@type': 'Dataset',
    '@id': `${datasetUrl}#dataset`,
    name: isSettingsPage ? `${name} Laser Cleaning Parameters` : `${name} Material Properties Dataset`,
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
      contentUrl: `${datasetUrl}/dataset.json`
    },
    
    // Measurements
    variableMeasured: measurements,
    
    // Metadata
    measurementTechnique: isSettingsPage 
      ? 'Fiber laser system with adjustable parameters' 
      : 'Laser-induced breakdown spectroscopy (LIBS), Surface profilometry',
    isAccessibleForFree: true,
    
    // Size
    keywords: isSettingsPage 
      ? `${propertyCount} machine parameters` 
      : `${propertyCount} material properties`,
    size: {
      '@type': 'QuantitativeValue',
      value: propertyCount,
      unitText: 'properties'
    }
  };
}
