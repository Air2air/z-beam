/**
 * Article/TechnicalArticle Schema Generator
 * Implements E-E-A-T: Experience & Expertise
 */

import { SITE_CONFIG } from '../../constants';
import { createAuthorReference } from './person';
import type { SchemaContext, AuthorData, ImageData } from './types';

export interface ArticleSchemaOptions {
  context: SchemaContext;
  title: string;
  description: string;
  material_description?: string;
  subtitle?: string; // Legacy compatibility
  publishDate?: string;
  modifiedDate?: string;
  author?: AuthorData;
  images?: {
    hero?: ImageData;
    micro?: ImageData;
  };
  caption?: {
    beforeText?: string;
    afterText?: string;
  };
  applications?: string[];
  keywords?: string | string[];
  articleType?: 'Article' | 'TechnicalArticle';
  // Phase 2 E-E-A-T enhancements
  reviewedBy?: AuthorData;
  citations?: string[];
  isBasedOn?: string | { '@type': string; name: string; url: string };
}

/**
 * Generate Article or TechnicalArticle schema
 */
export function generateArticleSchema(options: ArticleSchemaOptions) {
  const {
    context,
    title,
    description,
    material_description,
    subtitle,
    publishDate,
    modifiedDate,
    author = {},
    images,
    caption,
    applications = [],
    keywords,
    articleType = 'TechnicalArticle',
    reviewedBy,
    citations,
    isBasedOn
  } = options;
  
  const { baseUrl, pageUrl, currentDate } = context;
  const pubDate = publishDate || currentDate || new Date().toISOString();
  const modDate = modifiedDate || pubDate;
  
  // Build article body from caption - handle both {before, after} and {beforeText, afterText} formats
  const captionBefore = (caption as any)?.beforeText || (caption as any)?.before;
  const captionAfter = (caption as any)?.afterText || (caption as any)?.after;
  const articleBody = captionBefore 
    ? `${captionBefore}\n\n${captionAfter || ''}`
    : description;
  
  // Build image object with dimensions (P0 enhancement for rich snippets)
  const mainImage = images?.hero?.url ? {
    '@type': 'ImageObject',
    url: `${baseUrl}${images.hero.url}`,
    width: images.hero.width || 1200,
    height: images.hero.height || 630,
    caption: images.hero.alt || description
  } : undefined;

  return {
    '@type': articleType,
    '@id': `${pageUrl}#article`,
    headline: title,
    description: description,
    ...(articleBody && { articleBody }),
    url: pageUrl,
    datePublished: pubDate,
    dateModified: modDate,
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    
    // E-E-A-T: Author reference
    author: createAuthorReference(baseUrl, author.id || 'expert'),
    
    // E-E-A-T: Publisher with logo dimensions (P0 enhancement)
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/favicon/favicon-350.png`,
        width: 350,
        height: 350
      }
    },
    
    ...(mainImage && { image: mainImage }),
    
    // Applications as "about" property
    ...(applications.length > 0 && {
      about: applications.map(app => ({
        '@type': 'Thing',
        name: app
      }))
    }),
    
    // Keywords
    ...(keywords && {
      keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords
    }),
    
    // Phase 2 E-E-A-T: Advanced Trust & Authoritativeness signals
    ...(reviewedBy && {
      reviewedBy: createAuthorReference(baseUrl, reviewedBy.id || 'reviewer')
    }),
    
    ...(citations && citations.length > 0 && {
      citation: citations.map(cite => ({
        '@type': 'CreativeWork',
        name: cite
      }))
    }),
    
    ...(isBasedOn && {
      isBasedOn: typeof isBasedOn === 'string' 
        ? { '@type': 'CreativeWork', name: isBasedOn }
        : isBasedOn
    })
  };
}
