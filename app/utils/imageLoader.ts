// app/utils/imageLoader.ts
'use server';

import { loadMetadata } from './contentAPI';

/**
 * Direct utility to get hero image URL from frontmatter
 */
export async function getHeroImageUrl(slug: string): Promise<string | null> {
  if (!slug) return null;
  
  // Load the frontmatter data
  const frontmatter = await loadMetadata(slug);
  
  // Directly access the hero image URL
  return frontmatter?.images?.hero?.url || null;
}

/**
 * Direct utility to get image data for a component
 */
export async function getImageData(slug: string) {
  if (!slug) return { 
    heroUrl: null, 
    heroAlt: null 
  };
  
  // Load the frontmatter data
  const frontmatter = await loadMetadata(slug);
  
  return {
    heroUrl: frontmatter?.images?.hero?.url || null,
    heroAlt: frontmatter?.images?.hero?.alt || null
  };
}
