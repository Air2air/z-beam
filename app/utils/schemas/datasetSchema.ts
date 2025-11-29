import { SITE_CONFIG } from '@/app/config';
import { validateDatasetForSchema } from '@/app/utils/datasetValidation';

/**
 * Generate standard Dataset schema for material/settings pages
 * 
 * DATASET QUALITY POLICY: Only generates schema if data is complete
 * Returns null if validation fails (see docs/01-core/DATASET_QUALITY_POLICY.md)
 */
export function generateDatasetSchema(params: {
  url: string;
  name: string;
  description: string;
  identifier?: string;
  keywords?: string[];
  datePublished?: string;
  dateModified?: string;
  creator?: any;
  license?: string;
  distribution?: Array<{
    contentUrl: string;
    encodingFormat: string;
    name: string;
  }>;
  spatialCoverage?: string;
  temporalCoverage?: string;
  measurementTechnique?: string[];
  variableMeasured?: string[];
  isBasedOn?: any[];
  // Validation data
  machineSettings?: any;
  materialProperties?: any;
  materialName?: string;
}) {
  // DATASET QUALITY POLICY: Validate before generating schema
  const validation = validateDatasetForSchema({
    machineSettings: params.machineSettings,
    materialProperties: params.materialProperties,
    materialName: params.materialName || params.name
  });
  
  if (!validation.valid) {
    console.warn(`📊 Dataset schema excluded for ${params.materialName || params.name}: ${validation.reason}`);
    return null;
  }
  
  // Log warnings for low Tier 2 completeness
  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      console.warn(`⚠️  Dataset quality: ${params.materialName || params.name} - ${warning}`);
    });
  }
  
  return {
    '@type': 'Dataset',
    '@id': `${params.url}#dataset`,
    'name': params.name,
    'description': params.description,
    'url': params.url,
    'identifier': params.identifier || params.url,
    'keywords': params.keywords || [],
    'license': params.license || 'https://creativecommons.org/licenses/by/4.0/',
    'creator': params.creator || {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}#organization`,
      'name': SITE_CONFIG.name
    },
    ...(params.datePublished && { 'datePublished': params.datePublished }),
    ...(params.dateModified && { 'dateModified': params.dateModified }),
    ...(params.distribution && { 'distribution': params.distribution }),
    ...(params.spatialCoverage && { 'spatialCoverage': params.spatialCoverage }),
    ...(params.temporalCoverage && { 'temporalCoverage': params.temporalCoverage }),
    ...(params.measurementTechnique && { 'measurementTechnique': params.measurementTechnique }),
    ...(params.variableMeasured && { 'variableMeasured': params.variableMeasured }),
    ...(params.isBasedOn && params.isBasedOn.length > 0 && { 'isBasedOn': params.isBasedOn })
  };
}

/**
 * Generate standard distribution formats for datasets
 */
export function generateDatasetDistributions(params: {
  baseUrl: string;
  slug: string;
  name: string;
}) {
  return [
    {
      '@type': 'DataDownload',
      'encodingFormat': 'application/json',
      'contentUrl': `${params.baseUrl}/datasets/${params.slug}.json`,
      'name': `${params.name} - JSON Format`
    },
    {
      '@type': 'DataDownload',
      'encodingFormat': 'text/csv',
      'contentUrl': `${params.baseUrl}/datasets/${params.slug}.csv`,
      'name': `${params.name} - CSV Format`
    },
    {
      '@type': 'DataDownload',
      'encodingFormat': 'text/plain',
      'contentUrl': `${params.baseUrl}/datasets/${params.slug}.txt`,
      'name': `${params.name} - Text Format`
    }
  ];
}
