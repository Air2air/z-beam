/**
 * Metadata Synchronization Utilities
 * 
 * Ensures runtime metadata always reflects current data state
 * Implements cache-busting and validation for metadata generation
 */

import { ArticleMetadata } from '@/types';
import { createJsonLdForArticle } from './jsonld-helper';

interface MetadataSyncOptions {
  validateSync?: boolean;
  bustCache?: boolean;
  trackVersion?: boolean;
}

/**
 * Generate synchronized metadata with validation
 * Ensures all metadata sources (frontmatter, JSON-LD, page meta) are in sync
 */
export function generateSyncedMetadata(
  frontmatter: ArticleMetadata,
  slug: string,
  options: MetadataSyncOptions = {}
) {
  const {
    validateSync = true,
    bustCache = true,
    trackVersion = true
  } = options;

  // Generate metadata hash for cache busting
  const metadataVersion = bustCache ? generateMetadataHash(frontmatter) : undefined;

  // Create JSON-LD
  const jsonLd = createJsonLdForArticle(
    { frontmatter, metadata: frontmatter },
    slug
  );

  // Validate synchronization if requested
  if (validateSync && process.env.NODE_ENV === 'development') {
    validateMetadataSync(frontmatter, jsonLd);
  }

  // Add version tracking
  const syncedMetadata = {
    ...frontmatter,
    _sync: {
      version: metadataVersion,
      generated: new Date().toISOString(),
      validated: validateSync
    }
  };

  return {
    metadata: syncedMetadata,
    jsonLd,
    version: metadataVersion
  };
}

/**
 * Generate hash of metadata for cache busting
 * Changes when any metadata field changes
 */
function generateMetadataHash(metadata: ArticleMetadata): string {
  const authorName = typeof metadata.author === 'string' ? metadata.author : metadata.author?.name;
  
  const criticalFields = [
    metadata.title,
    metadata.description,
    authorName,
    metadata.images?.hero?.url,
    metadata.images?.micro?.url,
    JSON.stringify(metadata.materialProperties),
    JSON.stringify(metadata.machineSettings),
    metadata.lastModified
  ];

  const hashInput = criticalFields.filter(Boolean).join('|');
  
  // Simple hash function (for production, consider crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Validate that JSON-LD matches source metadata
 */
function validateMetadataSync(
  frontmatter: ArticleMetadata,
  jsonLd: any
): boolean {
  const issues: string[] = [];

  // Check title sync
  if (frontmatter.title && !jsonLdContains(jsonLd, frontmatter.title)) {
    issues.push(`Title mismatch: "${frontmatter.title}" not found in JSON-LD`);
  }

  // Check description sync
  if (frontmatter.description && !jsonLdContains(jsonLd, frontmatter.description)) {
    issues.push(`Description mismatch: not found in JSON-LD`);
  }

  // Check author sync
  const authorName = typeof frontmatter.author === 'string' ? frontmatter.author : frontmatter.author?.name;
  if (authorName && !jsonLdContains(jsonLd, authorName)) {
    issues.push(`Author mismatch: "${authorName}" not found in JSON-LD`);
  }

  // Check image sync
  if (frontmatter.images?.hero?.url && !jsonLdContains(jsonLd, frontmatter.images.hero.url)) {
    issues.push(`Hero image mismatch: "${frontmatter.images.hero.url}" not found in JSON-LD`);
  }

  if (issues.length > 0) {
    console.warn('⚠️  Metadata synchronization issues detected:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
    return false;
  }

  return true;
}

/**
 * Helper to check if JSON-LD contains a value
 */
function jsonLdContains(jsonLd: any, value: string): boolean {
  const jsonString = JSON.stringify(jsonLd);
  return jsonString.includes(value);
}

/**
 * Middleware to ensure metadata freshness
 * Compares generation timestamp with file modification time
 */
export async function validateMetadataFreshness(
  metadata: ArticleMetadata,
  sourceFilePath: string
): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(sourceFilePath);
    const fileModTime = stats.mtime;
    
    const metadataGenTime = (metadata as any).preservedData?.generationMetadata?.generated_date;
    
    if (!metadataGenTime) {
      console.warn(`⚠️  No generation timestamp for ${sourceFilePath}`);
      return false;
    }

    const genTime = new Date(metadataGenTime);
    
    if (fileModTime > genTime) {
      console.warn(`⚠️  Stale metadata detected for ${sourceFilePath}`);
      console.warn(`   File modified: ${fileModTime.toISOString()}`);
      console.warn(`   Metadata generated: ${genTime.toISOString()}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error validating metadata freshness:`, error);
    return false;
  }
}

/**
 * React hook for runtime metadata validation (client-side)
 */
export function useMetadataValidation(metadata: ArticleMetadata) {
  if (typeof window === 'undefined') return;

  // Check if page metadata matches expected structure
  const pageTitle = document.querySelector('title')?.textContent;
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
  
  if (pageTitle && metadata.title && !pageTitle.includes(metadata.title)) {
    console.warn('⚠️  Page title does not match metadata');
  }

  if (metaDescription && metadata.description && metaDescription !== metadata.description) {
    console.warn('⚠️  Meta description does not match metadata');
  }

  // Check JSON-LD script
  const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
  if (jsonLdScript) {
    try {
      const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
      validateMetadataSync(metadata, jsonLd);
    } catch (error) {
      console.error('Error parsing JSON-LD:', error);
    }
  }
}

/**
 * Build-time validator for Next.js generateMetadata
 */
export function validateGeneratedMetadata(
  metadata: any,
  source: ArticleMetadata
): boolean {
  const issues: string[] = [];

  // Validate title
  if (!metadata.title || !metadata.title.includes(source.title)) {
    issues.push('Title mismatch or missing');
  }

  // Validate description
  if (!metadata.description || metadata.description !== source.description) {
    issues.push('Description mismatch or missing');
  }

  // Validate OpenGraph
  if (source.images?.hero?.url && 
      (!metadata.openGraph?.images?.[0]?.url || 
       !metadata.openGraph.images[0].url.includes(source.images.hero.url))) {
    issues.push('OpenGraph image mismatch');
  }

  if (issues.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Generated metadata validation issues:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
    return false;
  }

  return true;
}
