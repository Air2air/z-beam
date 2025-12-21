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

import { ArticleMetadata, Author } from '@/types';
import { extractSafeValue } from './stringHelpers';
import { SITE_CONFIG } from './constants';
import { 
  formatMaterialTitle, 
  formatMaterialDescription, 
  formatSettingsTitle, 
  formatSettingsDescription,
  formatContaminantTitle,
  formatContaminantDescription
} from './seoMetadataFormatter';

// Re-export centralized types
export type { ArticleMetadata, Author };

/**
 * Generates hreflang alternates for international SEO
 * Supports: en-US (primary), en-GB, en-CA, en-AU, es-MX, fr-CA, de-DE, zh-CN
 */
export function generateHreflangAlternates(canonical: string) {
  const baseUrl = SITE_CONFIG.url;
  const _path = canonical.replace(baseUrl, '');
  
  return {
    canonical: canonical,
    languages: {
      'en-US': canonical, // Primary English (United States)
      'en-GB': canonical, // English (United Kingdom)
      'en-CA': canonical, // English (Canada)
      'en-AU': canonical, // English (Australia)
      'es-MX': canonical, // Spanish (Mexico)
      'fr-CA': canonical, // French (Canada)
      'de-DE': canonical, // German (Germany)
      'zh-CN': canonical, // Chinese (Simplified, China)
      'x-default': canonical, // Default for unlisted regions
    },
  };
}

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
  const canonical = 'canonical' in metadata ? (metadata as any).canonical : undefined;
  const meta_description = 'meta_description' in metadata ? (metadata as any).meta_description : undefined;
  const subtitle = 'subtitle' in metadata ? (metadata as any).subtitle : undefined;
  
  // Determine content type first (needed for contamination_description)
  const contentType = 'content_type' in metadata ? (metadata as any).content_type : undefined;
  
  // For contaminants, use description field as contamination_description
  const contamination_description = 'description' in metadata && contentType === 'contaminants' 
    ? (metadata as any).description 
    : undefined;
  
  // Determine Open Graph type dynamically
  const ogType: 'article' | 'website' = (datePublished || category) ? 'article' : 'website';
  
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
  // Final fallback to default OG image
  if (!heroImageUrl) {
    heroImageUrl = `${SITE_CONFIG.url}/images/og-image.jpg`;
    heroImageWidth = 1200;
    heroImageHeight = 630;
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
  const getAuthorName = (author: Author | string | undefined): string | undefined => {
    if (typeof author === 'string') return author;
    return author?.name;
  };
  
  const authorName = getAuthorName(metadata.author);
  
  // SEO-optimized title and description for material/settings pages
  let seoTitle = title || '';
  let seoDescription = description || '';
  
  // Apply SEO formatting for material pages
  if (contentType === 'unified_material') {
    seoTitle = formatMaterialTitle({
      pageType: 'material',
      materialName: materialName || title || '',
      category: extractSafeValue(category),
      subcategory: 'subcategory' in metadata ? extractSafeValue((metadata as any).subcategory) : undefined,
      machineSettings: 'machineSettings' in metadata ? (metadata as any).machineSettings : undefined,
      materialProperties: 'materialProperties' in metadata ? (metadata as any).materialProperties : undefined,
      materialDescription: subtitle
    });
    
    seoDescription = formatMaterialDescription({
      pageType: 'material',
      materialName: materialName || title || '',
      category: extractSafeValue(category),
      subcategory: 'subcategory' in metadata ? extractSafeValue((metadata as any).subcategory) : undefined,
      machineSettings: 'machineSettings' in metadata ? (metadata as any).machineSettings : undefined,
      materialProperties: 'materialProperties' in metadata ? (metadata as any).materialProperties : undefined,
      materialDescription: subtitle
    });
  }
  
  // Apply SEO formatting for settings pages
  if (contentType === 'settings') {
    seoTitle = formatSettingsTitle({
      pageType: 'settings',
      materialName: materialName || title || '',
      category: extractSafeValue(category),
      subcategory: 'subcategory' in metadata ? extractSafeValue((metadata as any).subcategory) : undefined,
      machineSettings: 'machineSettings' in metadata ? (metadata as any).machineSettings : undefined,
      settingsDescription: (metadata as any).description
    });
    
    seoDescription = formatSettingsDescription({
      pageType: 'settings',
      materialName: materialName || title || '',
      category: extractSafeValue(category),
      subcategory: 'subcategory' in metadata ? extractSafeValue((metadata as any).subcategory) : undefined,
      machineSettings: 'machineSettings' in metadata ? (metadata as any).machineSettings : undefined,
      settingsDescription: (metadata as any).description
    });
  }
  
  // Apply SEO formatting for contaminant pages
  if (contentType === 'contaminants') {
    seoTitle = formatContaminantTitle({
      pageType: 'contaminant',
      materialName: materialName || title || '',
      category: extractSafeValue(category),
      subcategory: 'subcategory' in metadata ? extractSafeValue((metadata as any).subcategory) : undefined,
      contaminationDescription: contamination_description
    });
    
    seoDescription = formatContaminantDescription({
      pageType: 'contaminant',
      materialName: materialName || title || '',
      category: extractSafeValue(category),
      subcategory: 'subcategory' in metadata ? extractSafeValue((metadata as any).subcategory) : undefined,
      contaminationDescription: contamination_description
    });
  }
  
  // Use title directly - layout template will add site name suffix
  const actualTitle = seoTitle || title || '';
  
  // Don't add site name here - layout template handles it with: %s | Z-Beam Laser Cleaning
  const formattedTitle = actualTitle || SITE_CONFIG.shortName;
  
  // Enhanced description with subtitle and technical details for better SEO
  let enhancedDescription = seoDescription || description;
  
  // For material pages, add key technical specifications
  // Only enhance if we're NOT using SEO-formatted description (which is already optimized)
  if (('machineSettings' in metadata || 'materialProperties' in metadata) && !seoDescription) {
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
  
  // Enhanced description with meta_description (SEO-optimized) taking priority
  // For material/settings pages, use SEO formatter output; otherwise use contextDescription
  let fullDescription = enhancedDescription;
  
  if (contentType !== 'unified_material' && contentType !== 'unified_settings') {
    const contextDescription = meta_description || subtitle;
    fullDescription = contextDescription && typeof contextDescription === 'string'
      ? extractSafeValue(contextDescription)
      : enhancedDescription;
  }
  
  // Get author details for E-E-A-T
  const authorDetails = typeof author === 'object' && author !== null ? author : null;
  const authorTitle = authorDetails?.title; // e.g., "Ph.D."
  const authorExpertise = authorDetails?.expertise;
  const authorTwitter = authorDetails?.twitter; // Individual author Twitter handle
  
  const result: NextMetadata = {
    title: formattedTitle,
    description: fullDescription,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : extractSafeValue(keywords),
    
    // Canonical URL and hreflang for international SEO
    alternates: canonical ? generateHreflangAlternates(canonical) : undefined,
    
    // Enhanced OpenGraph with hero image and article metadata
    openGraph: {
      title: actualTitle || formattedTitle,
      description: fullDescription,
      type: ogType,
      url: canonical || (slug ? `${SITE_CONFIG.url}/${slug}` : undefined),
      siteName: SITE_CONFIG.shortName,
      locale: 'en_US',
      determiner: 'auto', // Improves how the link appears in social shares
      
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
        url: 'https://www.youtube.com/watch?v=t8fB3tJCfQw',
        secureUrl: 'https://www.youtube.com/watch?v=t8fB3tJCfQw',
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
      images: heroImageUrl ? [{
        url: heroImageUrl,
        alt: heroImageAlt,
      }] : undefined,
      creator: authorTwitter ? `@${authorTwitter.replace(/^@/, '')}` : '@ZBeamLaser',
      players: [{
        playerUrl: 'https://www.youtube.com/embed/t8fB3tJCfQw',
        streamUrl: 'https://www.youtube.com/watch?v=t8fB3tJCfQw',
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