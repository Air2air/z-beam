/**
 * Common Schema Generators
 * WebPage, BreadcrumbList, FAQPage, etc.
 */

import { SITE_CONFIG } from '../../constants';
import type { SchemaContext } from './types';

export interface WebPageSchemaOptions {
  context: SchemaContext;
  title: string;
  description: string;
  publishDate?: string;
  modifiedDate?: string;
}

export function generateWebPageSchema(options: WebPageSchemaOptions) {
  const { context, title, description, publishDate, modifiedDate } = options;
  const { pageUrl, currentDate } = context;
  const pubDate = publishDate || currentDate || new Date().toISOString();
  const modDate = modifiedDate || pubDate;
  
  return {
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: title,
    description,
    datePublished: pubDate,
    dateModified: modDate,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.url}#website`
    }
  };
}

export interface BreadcrumbSchemaOptions {
  context: SchemaContext;
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function generateBreadcrumbSchema(options: BreadcrumbSchemaOptions) {
  const { items } = options;
  
  return {
    '@type': 'BreadcrumbList',
    '@id': '#breadcrumb',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchemaOptions {
  context: SchemaContext;
  name: string;
  items: FAQItem[];
}

export function generateFAQSchema(options: FAQSchemaOptions) {
  const { context, name, items } = options;
  const { pageUrl } = context;
  
  if (!items || items.length === 0) return null;
  
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    name: `${name} - Frequently Asked Questions`,
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

export interface OrganizationSchemaOptions {
  context: SchemaContext;
  name?: string;
  description?: string;
}

export function generateOrganizationSchema(options: OrganizationSchemaOptions) {
  const { context, name, description } = options;
  const { baseUrl } = context;
  
  return {
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: name || SITE_CONFIG.name,
    url: baseUrl,
    description: description || SITE_CONFIG.description,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/favicon/favicon-350.png`
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'info@z-beam.com'
    }
  };
}
