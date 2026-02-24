// app/components/JsonLD/JsonLD.tsx
import React from 'react';
import { SITE_CONFIG } from '@/app/config/site';
import { createJsonLdForArticle } from '../../utils/jsonld-helper';
import { SchemaFactory } from '../../utils/schemas/SchemaFactory';
import { validateAndLogSchema } from '../../utils/validators';
import type { 
  PersonSchema, 
  ListingSchema, 
  WebsiteSchema, 
  ArticleSchema, 
  JsonLdBreadcrumbItem 
} from '@/types';

/**
 * Single reusable JSON-LD component — two modes via discriminated union:
 *
 *   Mode 1 — pre-built schema: <JsonLD data={schema} />
 *   Mode 2 — article schema:   <JsonLD article={article} slug="materials/steel/..." />
 *
 * Mode 2 uses SchemaFactory to generate TechnicalArticle, Product, HowTo, Dataset,
 * BreadcrumbList, WebPage, Person, and Certification schemas from frontmatter.
 * Falls back to the legacy generator if SchemaFactory throws.
 */
type JsonLDProps =
  | { data: Record<string, unknown> | { '@context': string; '@graph': unknown[] }; article?: never; slug?: never }
  | { article: any; slug: string; data?: never };

export function JsonLD(props: JsonLDProps) {
  if (props.article !== undefined) {
    // --- Article mode: generate schema via SchemaFactory ---
    let jsonLdSchema;
    try {
      const factory = new SchemaFactory(props.article, props.slug);
      jsonLdSchema = factory.generate();
    } catch (error) {
      console.warn('SchemaFactory failed, using legacy generator:', error);
      jsonLdSchema = createJsonLdForArticle(props.article, props.slug);
    }

    if (!jsonLdSchema) return null;

    if (process.env.NODE_ENV === 'development') {
      validateAndLogSchema(jsonLdSchema, `JsonLD (${props.slug})`);
    }

    const jsonString = JSON.stringify(jsonLdSchema).replace(/\\\//g, '/');
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    );
  }

  // --- Data mode: render pre-built schema directly ---
  const jsonString = JSON.stringify(props.data).replace(/\\\//g, '/');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
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
    dateModified: (data as any).lastModified || data.dateModified || data.datePublished,
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
    dateModified: data.lastModified || data.dateModified || data.datePublished,
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
    dateModified: (data as any).lastModified || data.dateModified || data.datePublished,
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