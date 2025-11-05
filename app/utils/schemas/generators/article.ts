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
  subtitle?: string;
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
}

/**
 * Generate Article or TechnicalArticle schema
 */
export function generateArticleSchema(options: ArticleSchemaOptions) {
  const {
    context,
    title,
    description,
    subtitle,
    publishDate,
    modifiedDate,
    author = {},
    images,
    caption,
    applications = [],
    keywords,
    articleType = 'TechnicalArticle'
  } = options;
  
  const { baseUrl, pageUrl, currentDate } = context;
  const pubDate = publishDate || currentDate || new Date().toISOString();
  const modDate = modifiedDate || pubDate;
  
  // Build article body from caption
  const articleBody = caption?.beforeText 
    ? `${caption.beforeText}\n\n${caption.afterText || ''}`
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
    ...(subtitle && { abstract: subtitle }),
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
    })
  };
}
