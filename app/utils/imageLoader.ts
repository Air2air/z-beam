// app/utils/imageLoader.ts
'use server';

import { loadMetadata } from './contentAPI';
import { stripParenthesesFromImageUrl } from './formatting';

// Define image structure types
interface HeroImage {
  url?: string;
  alt?: string;
}

interface ImageMetadata {
  hero?: HeroImage;
}

interface FrontmatterWithImages {
  images?: ImageMetadata;
  [key: string]: unknown;
}

/**
 * Direct utility to get hero image URL from frontmatter
 */
export async function getHeroImageUrl(slug: string): Promise<string | null> {
  if (!slug) return null;
  
  // Load the frontmatter data
  const frontmatter = await loadMetadata(slug) as FrontmatterWithImages;
  
  // Directly access the hero image URL and strip parentheses
  const imageUrl = frontmatter?.images?.hero?.url || null;
  return imageUrl ? stripParenthesesFromImageUrl(imageUrl) : null;
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
  const frontmatter = await loadMetadata(slug) as FrontmatterWithImages;
  
  const heroUrl = frontmatter?.images?.hero?.url || null;
  
  return {
    heroUrl: heroUrl ? stripParenthesesFromImageUrl(heroUrl) : null,
    heroAlt: frontmatter?.images?.hero?.alt || null
  };
}
