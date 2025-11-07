/**
 * @file datasetAggregator.ts
 * @purpose Utility for loading and aggregating material dataset statistics
 * @aiContext Use this for calculating real aggregate values across multiple materials
 *           Samples materials to estimate averages, then extrapolates to full dataset
 */

export interface MaterialDataset {
  name?: string;
  slug?: string;
  category?: string;
  subcategory?: string;
  machineSettings?: Record<string, any>;
  materialProperties?: Record<string, any>;
  faq?: any[] | { questions?: any[] };
  [key: string]: any;
}

export interface AggregateStats {
  totalVariables: number;
  totalParameters: number;
  totalFAQs: number;
}

/**
 * Fetch a single material dataset
 */
async function fetchMaterialDataset(slug: string): Promise<MaterialDataset | null> {
  try {
    const fullSlug = slug.endsWith('-laser-cleaning') ? slug : `${slug}-laser-cleaning`;
    const response = await fetch(`/datasets/materials/${fullSlug}.json`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch dataset for ${fullSlug}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching dataset for ${slug}:`, error);
    return null;
  }
}

/**
 * Count machine settings (variables) in a material dataset
 */
function countVariables(data: MaterialDataset): number {
  if (!data.machineSettings) return 0;
  return Object.keys(data.machineSettings).length;
}

/**
 * Count material properties (parameters) in a material dataset
 */
function countParameters(data: MaterialDataset): number {
  if (!data.materialProperties) return 0;
  
  let count = 0;
  Object.values(data.materialProperties).forEach((category: any) => {
    if (category && typeof category === 'object') {
      count += Object.keys(category).length;
    }
  });
  
  return count;
}

/**
 * Count FAQ entries in a material dataset
 */
function countFAQs(data: MaterialDataset): number {
  if (!data.faq) return 0;
  
  if (Array.isArray(data.faq)) {
    return data.faq.length;
  }
  
  if (typeof data.faq === 'object' && data.faq.questions) {
    return Array.isArray(data.faq.questions) ? data.faq.questions.length : 0;
  }
  
  return 0;
}

/**
 * Calculate aggregate statistics by sampling materials
 * @param materialSlugs - Array of material slugs to aggregate
 * @param sampleSize - Number of materials to sample (default: 3)
 * @returns Aggregate statistics extrapolated to full dataset
 */
export async function calculateAggregateStats(
  materialSlugs: string[],
  sampleSize: number = 3
): Promise<AggregateStats> {
  const totalMaterials = materialSlugs.length;
  
  if (totalMaterials === 0) {
    return {
      totalVariables: 0,
      totalParameters: 0,
      totalFAQs: 0
    };
  }
  
  // Sample materials for efficiency
  const actualSampleSize = Math.min(sampleSize, totalMaterials);
  const sampleSlugs = materialSlugs.slice(0, actualSampleSize);
  
  // Fetch sample datasets
  const sampleDatasets = await Promise.all(
    sampleSlugs.map(slug => fetchMaterialDataset(slug))
  );
  
  // Filter out failed fetches
  const validDatasets = sampleDatasets.filter(d => d !== null) as MaterialDataset[];
  
  if (validDatasets.length === 0) {
    // Fallback to estimates if all fetches failed
    console.warn('No datasets loaded, using fallback estimates');
    return {
      totalVariables: totalMaterials * 9,
      totalParameters: totalMaterials * 17,
      totalFAQs: totalMaterials * 7
    };
  }
  
  // Calculate totals from sample
  let totalVars = 0;
  let totalParams = 0;
  let totalFAQs = 0;
  
  validDatasets.forEach(data => {
    totalVars += countVariables(data);
    totalParams += countParameters(data);
    totalFAQs += countFAQs(data);
  });
  
  // Calculate averages
  const avgVars = Math.round(totalVars / validDatasets.length);
  const avgParams = Math.round(totalParams / validDatasets.length);
  const avgFAQs = Math.round(totalFAQs / validDatasets.length);
  
  // Extrapolate to all materials
  return {
    totalVariables: avgVars * totalMaterials,
    totalParameters: avgParams * totalMaterials,
    totalFAQs: avgFAQs * totalMaterials
  };
}

/**
 * Load full datasets for all materials (for download generation)
 * @param materialSlugs - Array of material slugs to load
 * @returns Array of material datasets (nulls filtered out)
 */
export async function loadMaterialDatasets(
  materialSlugs: string[]
): Promise<MaterialDataset[]> {
  const datasets = await Promise.all(
    materialSlugs.map(slug => fetchMaterialDataset(slug))
  );
  
  return datasets.filter(d => d !== null) as MaterialDataset[];
}
