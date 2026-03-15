// app/components/JsonLD/JsonLD.tsx
import React from 'react';
import { SITE_CONFIG } from '@/app/config/site';
import { serializeJsonLd } from '@/lib/metadata/jsonld';
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
 */
type JsonLDProps =
  | { data: Record<string, unknown> | { '@context': string; '@graph': unknown[] }; article?: never; slug?: never }
  | { article: any; slug: string; data?: never };

export function JsonLD(props: JsonLDProps) {
  if (props.data === undefined) {
    // --- Article mode: generate schema via SchemaFactory ---
    // Discriminated by data being absent; slug is string in this branch
    const { article, slug } = props as { article: any; slug: string };
    let jsonLdSchema;
    try {
      const factory = new SchemaFactory(article, slug);
      jsonLdSchema = factory.generate();
    } catch (error) {
      console.error('SchemaFactory failed to generate JSON-LD:', error);
      return null;
    }

    if (!jsonLdSchema) return null;

    if (process.env.NODE_ENV === 'development') {
      validateAndLogSchema(jsonLdSchema, `JsonLD (${slug})`);
    }

    const jsonString = serializeJsonLd(jsonLdSchema)?.replace(/\\\//g, '/');
    if (!jsonString) return null;

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    );
  }

  // --- Data mode: render pre-built schema directly ---
  const jsonString = serializeJsonLd(props.data)?.replace(/\\\//g, '/');
  if (!jsonString) return null;

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

// MaterialJsonLD is an alias for JsonLD — same component, legacy test name
export const MaterialJsonLD = JsonLD;

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