// app/utils/metadata.ts
/**
 * Enhanced metadata generation with E-E-A-T optimization
 * 
 * Features:
 * - Automatic hero image extraction for OG/Twitter/JSON-LD
 * - Author expertise signals (E-E-A-T)
 * - Article metadata with publication dates
 * - Twitter Card support
 * - Comprehensive OpenGraph tags
 */

// Use any type since Metadata isn't being exported correctly from next
type NextMetadata = any;

import { ArticleMetadata, AuthorInfo } from '@/types';
import { extractSafeValue, safeIncludes } from './stringHelpers';
import { SITE_CONFIG } from './constants';

// Re-export centralized types
export type { ArticleMetadata, AuthorInfo };

/**
 * Creates comprehensive metadata with E-E-A-T optimization
 * 
 * E-E-A-T Enhancement:
 * - Author credentials in meta tags (Expertise)
 * - Publication/modification dates (Trustworthiness)
 * - Article type declaration (Authoritativeness)
 * - Hero images for visual authority
 */
export function createMetadata(metadata: ArticleMetadata): NextMetadata {
  
  // Extract all properties safely with defaults
  const {
    title: rawTitle,
    description: rawDescription,
    subtitle,
    keywords = [],
    image: ogImage,
    slug: rawSlug,
    author,
    images,
    datePublished,
    category,
  } = metadata;
  
  // Access optional fields with type narrowing
  const dateModified = 'dateModified' in metadata ? metadata.dateModified : undefined;
  const materialName = 'name' in metadata ? (metadata as any).name : undefined;
  
  const ogType = 'article'; // Default type
  
  // Extract hero image from images.hero or fall back to legacy image field
  // This ensures consistent image usage across OG, Twitter, and JSON-LD
  let heroImageUrl: string | undefined;
  let heroImageWidth: number | undefined;
  let heroImageHeight: number | undefined;
  
  if (images && typeof images === 'object' && 'hero' in images) {
    const hero = (images as any).hero;
    if (hero && hero.url) {
      heroImageUrl = hero.url.startsWith('http') 
        ? hero.url 
        : `${SITE_CONFIG.url}${hero.url}`;
      heroImageWidth = hero.width;
      heroImageHeight = hero.height;
    }
  }
  // Fall back to legacy image field
  if (!heroImageUrl && ogImage) {
    const imgUrl = extractSafeValue(ogImage);
    heroImageUrl = imgUrl.startsWith('http') ? imgUrl : `${SITE_CONFIG.url}${imgUrl}`;
  }
  
  // Get hero image alt text for accessibility (use rawTitle since title is derived later)
  const heroImageAlt = images && typeof images === 'object' && 'hero' in images
    ? (images as any).hero?.alt || `${rawTitle} - Laser cleaning process`
    : `${rawTitle} hero image`;
  
  // Safely extract strings from potentially nested objects
  const title = extractSafeValue(rawTitle);
  const description = extractSafeValue(rawDescription);
  const slug = extractSafeValue(rawSlug);
  
  // Simplified helper function to safely extract author name
  const getAuthorName = (author: AuthorInfo | string | undefined): string | undefined => {
    if (typeof author === 'string') return author;
    return author?.name;
  };  // Use title directly
  const actualTitle = title || '';
  
  const formattedTitle = actualTitle && !safeIncludes(actualTitle, SITE_CONFIG.shortName) 
    ? `${actualTitle} | ${SITE_CONFIG.shortName}` 
    : actualTitle || SITE_CONFIG.shortName;
  
  const authorName = getAuthorName(metadata.author);
  
  // Enhanced description with subtitle and technical details for better SEO
  let enhancedDescription = description;
  
  // For material pages, add key technical specifications
  if ('machineSettings' in metadata || 'materialProperties' in metadata) {
    const machineSettings = (metadata as any).machineSettings;
    const materialProps = (metadata as any).materialProperties;
    
    const wavelength = machineSettings?.wavelength?.value || 
      materialProps?.laser_material_interaction?.properties?.wavelength?.value;
    const absorption = materialProps?.laser_material_interaction?.properties?.laserAbsorption?.value;
    
    const technicalDetails: string[] = [];
    if (wavelength) technicalDetails.push(`${wavelength}nm wavelength`);
    if (absorption) technicalDetails.push(`${absorption}% laser absorption`);
    
    if (technicalDetails.length > 0 && !description.includes('nm') && !description.includes('%')) {
      enhancedDescription = `${description} Key specifications: ${technicalDetails.join(', ')}.`;
    }
  }
  
  // Enhanced description with subtitle for better context
  const fullDescription = subtitle && typeof subtitle === 'string'
    ? `${extractSafeValue(subtitle)}. ${enhancedDescription}`
    : enhancedDescription;
  
  // Get author details for E-E-A-T
  const authorDetails = typeof author === 'object' && author !== null ? author : null;
  const authorTitle = authorDetails?.title; // e.g., "Ph.D."
  const authorExpertise = authorDetails?.expertise;
  
  const result: NextMetadata = {
    title: formattedTitle,
    description: fullDescription,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : extractSafeValue(keywords),
    
    // Enhanced OpenGraph with hero image and article metadata
    openGraph: {
      title: actualTitle || formattedTitle,
      description: fullDescription,
      type: ogType as 'website' | 'article',
      url: slug ? `${SITE_CONFIG.url}/${slug}` : undefined,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      
      // Use hero image for OpenGraph with frontmatter dimensions
      images: heroImageUrl ? [{
        url: heroImageUrl,
        alt: heroImageAlt,
        width: heroImageWidth || 1200,
        height: heroImageHeight || 630,
        type: 'image/jpeg',
      }] : undefined,
      
      // Video metadata for rich social sharing
      videos: [{
        url: 'https://www.youtube.com/watch?v=eGgMJdjRUJk',
        secureUrl: 'https://www.youtube.com/watch?v=eGgMJdjRUJk',
        type: 'text/html',
        width: 1280,
        height: 720,
      }],
      
      // Article-specific metadata (E-E-A-T: Trustworthiness via dates)
      ...(ogType === 'article' && {
        article: {
          publishedTime: datePublished ? extractSafeValue(datePublished) : undefined,
          modifiedTime: dateModified ? extractSafeValue(dateModified) : undefined,
          authors: authorName ? [authorName] : undefined,
          section: category ? extractSafeValue(category) : undefined,
          tags: Array.isArray(keywords) ? keywords : undefined,
        },
      }),
    },
    
    // Twitter Card for enhanced social sharing with video player
    twitter: {
      card: 'player',
      site: '@ZBeamLaser',
      title: actualTitle || formattedTitle,
      description: fullDescription,
      images: heroImageUrl ? [heroImageUrl] : undefined,
      creator: authorName ? `@${authorName.replace(/\s+/g, '')}` : '@ZBeamLaser',
      players: [{
        playerUrl: 'https://www.youtube.com/embed/eGgMJdjRUJk',
        streamUrl: 'https://www.youtube.com/watch?v=eGgMJdjRUJk',
        width: 1280,
        height: 720,
      }],
    },
    
    // Additional E-E-A-T meta tags
    other: {
      // Author expertise (E-E-A-T: Expertise)
      ...(authorName ? { 'author': authorName } : {}),
      ...(authorTitle ? { 'author-title': authorTitle } : {}),
      ...(authorExpertise ? { 'author-expertise': authorExpertise } : {}),
      
      // Content freshness (E-E-A-T: Trustworthiness)
      ...(datePublished ? { 'article:published_time': extractSafeValue(datePublished) } : {}),
      ...(dateModified ? { 'article:modified_time': extractSafeValue(dateModified) } : {}),
      
      // Content categorization (E-E-A-T: Authoritativeness)
      ...(category ? { 'article:section': extractSafeValue(category) } : {}),
      ...(materialName ? { 'material-name': extractSafeValue(materialName) } : {}),
      
      // Material-specific technical metadata
      ...(category ? { 'material:category': extractSafeValue(category) } : {}),
    },
  };
  
  return result;
}