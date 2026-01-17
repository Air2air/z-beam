/**
 * Slug Helpers - Shared utilities for slug normalization and dataset path construction
 * 
 * Purpose: Eliminate 15+ duplicate slug normalization patterns across codebase
 * Used by: SchemaFactory, datasetLoader, components, API routes
 */

import path from 'path';

/**
 * Remove all known suffixes to get base material/contaminant slug
 * 
 * @example
 * normalizeToBaseSlug('aluminum-laser-cleaning') → 'aluminum'
 * normalizeToBaseSlug('oak-settings') → 'oak'
 * normalizeToBaseSlug('rust-contamination') → 'rust'
 * normalizeToBaseSlug('aluminum-material-dataset') → 'aluminum'
 */
export function normalizeToBaseSlug(slug: string): string {
  return slug
    .replace(/-laser-cleaning$/, '')
    .replace(/-settings$/, '')
    .replace(/-contamination$/, '')
    .replace(/-contaminant-dataset$/, '')
    .replace(/-material-dataset$/, '');
}

/**
 * Get dataset filename for a material or contaminant
 * 
 * @example
 * getDatasetFilename('aluminum', 'materials') → 'aluminum-material-dataset.json'
 * getDatasetFilename('rust', 'contaminants') → 'rust-contaminant-dataset.json'
 */
export function getDatasetFilename(
  baseSlug: string,
  type: 'materials' | 'contaminants',
  format: 'json' | 'csv' | 'txt' = 'json'
): string {
  const suffix = type === 'materials' ? '-material-dataset' : '-contaminant-dataset';
  return `${baseSlug}${suffix}.${format}`;
}

/**
 * Get full dataset path for filesystem operations (server-side)
 * 
 * @example
 * getDatasetPath('aluminum', 'materials') 
 *   → '/absolute/path/public/datasets/materials/aluminum-material-dataset.json'
 */
export function getDatasetPath(
  baseSlug: string,
  type: 'materials' | 'contaminants',
  format: 'json' | 'csv' | 'txt' = 'json'
): string {
  if (typeof window !== 'undefined') {
    throw new Error('getDatasetPath is server-side only. Use getDatasetUrl for client-side.');
  }
  
  const filename = getDatasetFilename(baseSlug, type, format);
  return path.join(process.cwd(), 'public', 'datasets', type, filename);
}

/**
 * Get dataset URL for HTTP requests (client-side or server-side)
 * 
 * @example
 * getDatasetUrl('aluminum', 'materials') 
 *   → '/datasets/materials/aluminum-material-dataset.json'
 * 
 * getDatasetUrl('aluminum', 'materials', 'json', 'https://www.z-beam.com')
 *   → 'https://www.z-beam.com/datasets/materials/aluminum-material-dataset.json'
 */
export function getDatasetUrl(
  baseSlug: string,
  type: 'materials' | 'contaminants',
  format: 'json' | 'csv' | 'txt' = 'json',
  baseUrl?: string
): string {
  const filename = getDatasetFilename(baseSlug, type, format);
  const relativePath = `/datasets/${type}/${filename}`;
  return baseUrl ? `${baseUrl}${relativePath}` : relativePath;
}

/**
 * Extract material/contaminant slug from full page slug
 * 
 * @example
 * extractSlugFromPath('/materials/metal/non-ferrous/aluminum-laser-cleaning')
 *   → 'aluminum-laser-cleaning'
 * 
 * extractSlugFromPath('oak-settings')
 *   → 'oak-settings'
 */
export function extractSlugFromPath(slugOrPath: string): string {
  const parts = slugOrPath.split('/');
  return parts[parts.length - 1] || slugOrPath;
}

/**
 * Get base slug from any slug format (convenience function)
 * 
 * Combines extractSlugFromPath + normalizeToBaseSlug
 * 
 * @example
 * getBaseSlug('/materials/metal/non-ferrous/aluminum-laser-cleaning')
 *   → 'aluminum'
 * getBaseSlug('oak-settings')
 *   → 'oak'
 */
export function getBaseSlug(slugOrPath: string): string {
  const slug = extractSlugFromPath(slugOrPath);
  return normalizeToBaseSlug(slug);
}
