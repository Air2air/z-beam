// app/components/JsonLD/JsonLD.tsx
import React from 'react';
import { SITE_CONFIG } from '@/app/config/site';
import { createJsonLdForArticle } from '../../utils/jsonld-helper';
import { SchemaFactory } from '../../utils/schemas/SchemaFactory';
import { validateAndLogSchema } from '../../utils/validators';
import type { 
  JsonLdProps, 
  PersonSchema, 
  ListingSchema, 
  WebsiteSchema, 
  ArticleSchema, 
  JsonLdBreadcrumbItem 
} from '@/types';

/**
 * Component to render JSON-LD structured data
 * 
 * @param data - Pre-generated JSON-LD schema object
 * @returns Script tag with JSON-LD structured data
 */
export function JsonLD({ data }: JsonLdProps) {
  // Remove unnecessary escaped forward slashes for cleaner markup
  const jsonString = JSON.stringify(data).replace(/\\\//g, '/');
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

/**
 * Enhanced component for material/article pages with comprehensive E-E-A-T optimized schemas
 * 
 * Automatically generates all 8 schema types from frontmatter:
 * - TechnicalArticle (expertise & authority)
 * - Product (material specifications with confidence scores)
 * - HowTo (process steps from machineSettings)
 * - Dataset (verified measurements with provenance)
 * - BreadcrumbList (navigation)
 * - WebPage (page metadata)
 * - Person (author credentials)
 * - Certification (regulatory compliance)
 * 
 * @param article - Article object with frontmatter from contentAPI
 * @param slug - Page slug for URL generation
 * @returns Script tag with comprehensive @graph JSON-LD structure
 * 
 * @example
 * ```tsx
 * <MaterialJsonLD article={article} slug={slug} />
 * ```
 */
export function MaterialJsonLD({ 
  article, 
  slug 
}: { 
  article: any; 
  slug: string;
}) {
  // Try new SchemaFactory first, fallback to legacy if needed
  let jsonLdSchema;
  
  try {
    // Use SchemaFactory for enhanced schema generation
    const factory = new SchemaFactory(article, slug);
    jsonLdSchema = factory.generate();
  } catch (error) {
    console.warn('SchemaFactory failed, using legacy generator:', error);
    // Fallback to legacy generator for compatibility
    jsonLdSchema = createJsonLdForArticle(article, slug);
  }
  
  if (!jsonLdSchema) {
    return null;
  }
  
  // Validate schema in development mode
  if (process.env.NODE_ENV === 'development') {
    validateAndLogSchema(jsonLdSchema, `MaterialJsonLD (${slug})`);
  }
  
  // Remove unnecessary escaped forward slashes for cleaner markup
  const jsonString = JSON.stringify(jsonLdSchema).replace(/\\\//g, '/');
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonString
      }}
    />
  );
}

/**
 * Schema generators for common structured data types
 */
export const schemas = {
  person: (data: PersonSchema) => ({
    '@context': SITE_CONFIG.schema.context,
    '@type': 'Person',
    ...data
  }),
  
  article: (data: ArticleSchema) => ({
    '@context': SITE_CONFIG.schema.context,
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    author: typeof data.author === 'string' 
      ? { '@type': 'Person', name: data.author }
      : { '@type': 'Person', ...data.author },
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    url: data.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url
    },
    ...(data.image && { image: data.image }),
    ...(data.articleBody && { articleBody: data.articleBody }),
    ...(data.keywords && { keywords: Array.isArray(data.keywords) ? data.keywords.join(',') : data.keywords }),
    ...(data.articleSection && { articleSection: data.articleSection })
  }),
  
  // Keep the listing schema (renamed to blogPosting for clarity)
  blogPosting: (data: ListingSchema) => ({
    '@context': SITE_CONFIG.schema.context,
    '@type': 'BlogPosting',
    headline: data.headline,
    description: data.description,
    author: typeof data.author === 'string'
      ? { '@type': 'Person', name: data.author }
      : { '@type': 'Person', ...data.author },
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    url: data.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url
    },
    ...(data.image && { image: data.image })
  }),

  website: (data: WebsiteSchema) => ({
    '@context': SITE_CONFIG.schema.context,
    '@type': 'WebSite',
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.author && {
      author: {
        '@type': 'Person',
        name: data.author
      }
    })
  }),

  breadcrumbList: (items: JsonLdBreadcrumbItem[]) => ({
    '@context': SITE_CONFIG.schema.context,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }),
  
  // Add new schema for technical article which is more appropriate for your content
  technicalArticle: (data: ArticleSchema) => ({
    '@context': SITE_CONFIG.schema.context,
    '@type': 'Article',
    'articleSection': 'Technical',
    headline: data.headline,
    description: data.description,
    author: getAuthorObject(data.author),
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    url: data.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url
    },
    ...(data.image && { image: data.image })
  })
};

// For convenience, export the schemas individually
export const personSchema = schemas.person;
export const articleSchema = schemas.article;
export const blogPostingSchema = schemas.blogPosting;
export const websiteSchema = schemas.website;
export const breadcrumbListSchema = schemas.breadcrumbList;
export const technicalArticleSchema = schemas.technicalArticle;

/**
 * Helper function to get author object
 */
const getAuthorObject = (author: string | PersonSchema | undefined) => {
  if (!author) return undefined;
  
  if (typeof author === 'string') {
    return {
      '@type': 'Person',
      name: author
    };
  }
  
  return {
    '@type': 'Person',
    name: author.name,
    ...(author.title && { description: author.title }),
    ...(author.country && { nationality: author.country }),
    ...(author.url && { url: author.url })
  };
};