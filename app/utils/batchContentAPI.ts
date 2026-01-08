// app/utils/batchContentAPI.ts
// BATCH LOADING API - Eliminates N+1 query patterns
// Provides bulk operations for fetching multiple articles in a single operation

import 'server-only';
import { cache } from 'react';
import { getContaminantArticle, getCompoundArticle, getArticle } from './contentAPI';

/**
 * Batch load contaminant articles
 * Eliminates N+1 pattern by parallelizing fetches and returning results map
 * 
 * @param slugs - Array of contaminant slugs to fetch
 * @returns Map of slug → article data (null for failed fetches)
 * 
 * @example
 * const articles = await batchGetContaminantArticles(['rust', 'oil', 'paint']);
 * const rustArticle = articles['rust'];
 */
export const batchGetContaminantArticles = cache(async (
  slugs: string[]
): Promise<Record<string, { metadata: Record<string, unknown>; components: Record<string, any> } | null>> => {
  try {
    // Use Promise.allSettled to handle individual failures gracefully
    const results = await Promise.allSettled(
      slugs.map(async (slug) => ({ slug, data: await getContaminantArticle(slug) }))
    );
    
    // Build results map
    const articlesMap: Record<string, any> = {};
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        articlesMap[result.value.slug] = result.value.data;
      } else {
        // Log error but continue processing other articles
        console.error(`Failed to fetch contaminant:`, result.reason);
      }
    }
    
    return articlesMap;
  } catch (error) {
    console.error('[batchGetContaminantArticles] Unexpected error:', error);
    return {}; // Return empty object, never undefined
  }
});

/**
 * Batch load compound articles
 * 
 * @param slugs - Array of compound slugs to fetch
 * @returns Map of slug → article data (null for failed fetches)
 */
export const batchGetCompoundArticles = cache(async (
  slugs: string[]
): Promise<Record<string, { metadata: Record<string, unknown>; components: Record<string, any> } | null>> => {
  try {
    const results = await Promise.allSettled(
      slugs.map(async (slug) => ({ slug, data: await getCompoundArticle(slug) }))
    );
    
    const articlesMap: Record<string, any> = {};
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        articlesMap[result.value.slug] = result.value.data;
      } else {
        console.error(`Failed to fetch compound:`, result.reason);
      }
    }
    
    return articlesMap;
  } catch (error) {
    console.error('[batchGetCompoundArticles] Unexpected error:', error);
    return {}; // Return empty object, never undefined
  }
});

/**
 * Batch load material articles
 * 
 * @param slugs - Array of material slugs to fetch
 * @returns Map of slug → article data (null for failed fetches)
 */
export const batchGetMaterialArticles = cache(async (
  slugs: string[]
): Promise<Record<string, { metadata: Record<string, unknown>; components: Record<string, any> } | null>> => {
  try {
    const results = await Promise.allSettled(
      slugs.map(async (slug) => ({ slug, data: await getArticle(slug) }))
    );
    
    const articlesMap: Record<string, any> = {};
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        articlesMap[result.value.slug] = result.value.data;
      } else {
        console.error(`Failed to fetch material:`, result.reason);
      }
    }
    
    return articlesMap;
  } catch (error) {
    console.error('[batchGetMaterialArticles] Unexpected error:', error);
    return {}; // Return empty object, never undefined
  }
});

/**
 * Generic batch loader for any content type
 * 
 * @param contentType - Type of content to fetch ('contaminants' | 'compounds' | 'materials')
 * @param slugs - Array of slugs to fetch
 * @returns Map of slug → article data
 */
export const batchGetArticles = cache(async (
  contentType: 'contaminants' | 'compounds' | 'materials',
  slugs: string[]
): Promise<Record<string, any>> => {
  switch (contentType) {
    case 'contaminants':
      return batchGetContaminantArticles(slugs);
    case 'compounds':
      return batchGetCompoundArticles(slugs);
    case 'materials':
      return batchGetMaterialArticles(slugs);
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
});

/**
 * Batch enrich relationship references with full article metadata
 * Optimized for MaterialsLayout contaminant enrichment pattern
 * 
 * @param refs - Array of relationship references with id and optional metadata
 * @param contentType - Type of content to fetch
 * @returns Array of enriched items with full metadata
 * 
 * @example
 * const contaminantRefs = [
 *   { id: 'rust', frequency: 'high' },
 *   { id: 'oil', frequency: 'medium' }
 * ];
 * const enriched = await batchEnrichReferences(contaminantRefs, 'contaminants');
 */
export const batchEnrichReferences = cache(async (
  refs: Array<{ id: string; [key: string]: any }>,
  contentType: 'contaminants' | 'compounds' | 'materials'
): Promise<Array<any>> => {
  try {
    if (!refs || refs.length === 0) return [];
    
    // Extract slugs from references
    const slugs = refs.map(ref => ref.id).filter(Boolean);
    
    // Batch fetch all articles
    const articlesMap = await batchGetArticles(contentType, slugs);
    
    // Enrich references with article metadata
    const enrichedRefs = refs.map(ref => {
      const article = articlesMap[ref.id];
      if (!article || !article.metadata) return null;
      
      const metadata = article.metadata as any;
      const category = metadata.category || '';
      const subcategory = metadata.subcategory || '';
      
      // Construct full path using camelCase property
      const fullPath = metadata.fullPath || `/${contentType}/${category}/${subcategory}/${ref.id}`;
      
      return {
        title: metadata.name || metadata.title,
        category,
        subcategory,
        description: ref.typical_context || metadata.description || '',
        url: ref.url || fullPath,
        frequency: ref.frequency || 'unknown',
        severity: ref.severity || 'unknown',
        typical_context: ref.typical_context || '',
        image: metadata.images?.hero?.url || '',
        // Preserve original reference data (includes id)
        ...ref
      };
    });
    
    // Filter out null values (failed fetches)
    return enrichedRefs.filter((item): item is NonNullable<typeof item> => item !== null);
  } catch (error) {
    console.error(`[batchEnrichReferences] Failed to enrich ${contentType}:`, error);
    return []; // CRITICAL: Return empty array, never undefined
  }
});
