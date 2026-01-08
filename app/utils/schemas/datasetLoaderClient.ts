// app/utils/schemas/datasetLoaderClient.ts
'use client';

import { getDatasetUrl } from '@/app/utils/slugHelpers';

/**
 * Client-side dataset loader
 * Fetches generated dataset JSON files from public directory
 * 
 * @module datasetLoaderClient
 */

export interface DatasetType {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  identifier: string;
  license?: string;
  creator?: {
    '@type': string;
    name: string;
    jobTitle?: string;
    affiliation?: string;
  };
  author?: {
    '@type': string;
    name: string;
    jobTitle?: string;
    affiliation?: string;
  };
  datePublished?: string;
  dateModified?: string;
  keywords?: string[];
  variableMeasured?: Array<{
    '@type': string;
    name: string;
    description: string;
    unitText?: string;
    minValue?: number;
    maxValue?: number;
  }>;
  distribution?: any[];
  citation?: Array<{
    '@type': string;
    name: string;
    author?: string;
    url?: string;
  }>;
  image?: string | string[];
  publisher?: {
    '@type': string;
    name: string;
    url?: string;
  };
  dataQuality?: {
    accuracy?: string;
    verificationDate?: string;
    sources?: string[];
  };
  measurementTechnique?: string;
}

/**
 * Load generated dataset from public directory via fetch
 * 
 * @param slug - BASE material/contaminant slug (e.g., "aluminum", NOT "aluminum-laser-cleaning")
 *               The slug should NOT include suffixes - they are added automatically
 * @param type - Dataset type ('materials' or 'contaminants')
 * @returns Dataset object
 */
export async function loadGeneratedDataset(
  slug: string,
  type: 'materials' | 'contaminants'
): Promise<DatasetType> {
  // Use shared utility for consistent URL construction
  // This prevents duplicate suffix bugs
  const url = getDatasetUrl(slug, type, 'json');
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to load dataset: ${url}`);
  }
  
  return await response.json();
}

/**
 * Extract enhanced fields from dataset for Schema.org
 * 
 * @param dataset - Full dataset object
 * @returns Enhanced fields for schema generation
 */
export function extractEnhancedFields(dataset: DatasetType) {
  return {
    variableMeasured: dataset.variableMeasured || [],
    citation: dataset.citation || [],
    creator: dataset.creator,
    author: dataset.author,
    image: dataset.image,
    dataQuality: dataset.dataQuality,
    publisher: dataset.publisher,
    keywords: dataset.keywords || [],
    measurementTechnique: dataset.measurementTechnique,
  };
}
