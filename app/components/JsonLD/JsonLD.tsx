// app/components/JsonLD/JsonLD.tsx
import React from 'react';

export interface JsonLdProps {
  data: Record<string, any>;
}

export interface PersonSchema {
  name: string;
  url?: string;
  image?: string;
  description?: string;
  jobTitle?: string;
  worksFor?: string;
  [key: string]: any;
}

export interface ListingSchema {
  headline: string;
  description: string;
  author: string | { name: string; [key: string]: any };
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  [key: string]: any;
}

export interface WebsiteSchema {
  name: string;
  description: string;
  url: string;
  author?: string;
  [key: string]: any;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleSchema {
  headline: string;
  description: string;
  author: string | PersonSchema;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  articleBody?: string;
  keywords?: string[];
  articleSection?: string;
  [key: string]: any;
}

/**
 * Component to render JSON-LD structured data
 */
export function JsonLD({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Schema generators for common structured data types
 */
export const schemas = {
  person: (data: PersonSchema) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    ...data
  }),
  
  article: (data: ArticleSchema) => ({
    '@context': 'https://schema.org',
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
    '@context': 'https://schema.org',
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
    '@context': 'https://schema.org',
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

  breadcrumbList: (items: BreadcrumbItem[]) => ({
    '@context': 'https://schema.org',
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
    '@context': 'https://schema.org',
    '@type': 'TechnicalArticle',
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
const getAuthorObject = (author: any) => {
  if (!author) return undefined;
  
  if (typeof author === 'string') {
    return {
      '@type': 'Person',
      name: author
    };
  }
  
  return {
    '@type': 'Person',
    name: author.author_name || author.name,
    ...(author.credentials && { description: author.credentials }),
    ...(author.author_country && { nationality: author.author_country }),
    ...(author.url && { url: author.url })
  };
};