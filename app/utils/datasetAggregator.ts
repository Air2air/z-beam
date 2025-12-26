/**
 * @file datasetAggregator.ts
 * @deprecated Use app/datasets instead
 * 
 * This file is a backward-compatible wrapper. New code should import from:
 * import { calculateAggregateStats, ... } from '@/app/datasets'
 */

// Re-export from new location
export { calculateAggregateStats } from '@/app/datasets';
export type { MaterialDataset } from '@/app/datasets';

// Note: Original fetchMaterialDataset and loadMaterialDatasets functions
// are not migrated as they use client-side fetch. These remain below.

export interface AggregateStats {
  totalVariables: number;
  totalParameters: number;
  totalFAQs: number;
}

/**
 * Fetch a single material dataset (client-side only)
 */
async function fetchMaterialDataset(slug: string): Promise<any | null> {
  try {
    const response = await fetch(`/datasets/materials/${slug}.json`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch dataset for ${slug}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching dataset for ${slug}:`, error);
    return null;
  }
}

/**
 * Load full datasets for all materials (client-side only)
 */
export async function loadMaterialDatasets(
  materialSlugs: string[]
): Promise<any[]> {
  const datasets = await Promise.all(
    materialSlugs.map(slug => fetchMaterialDataset(slug))
  );
  
  return datasets.filter(d => d !== null);
}
