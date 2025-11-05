/**
 * Person Schema Generator
 * Normalized Person schema with @id references for E-E-A-T
 */

import { SITE_CONFIG } from '../../constants';
import type { AuthorData, SchemaContext } from './types';

export interface PersonSchemaOptions {
  context: SchemaContext;
  author: AuthorData;
  id?: string;
}

/**
 * Generate Person schema with @id for reference linking
 * Implements E-E-A-T: Expertise & Authoritativeness
 */
export function generatePersonSchema(options: PersonSchemaOptions) {
  const { context, author, id } = options;
  const { baseUrl } = context;
  
  const personId = id || author.id || 'expert';
  const authorName = author.name || 'Z-Beam Technical Team';
  
  return {
    '@type': 'Person',
    '@id': `${baseUrl}#author-${personId}`,
    name: authorName,
    jobTitle: author.title || 'Ph.D. Materials Science',
    email: author.email || 'info@z-beam.com',
    worksFor: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: baseUrl
    },
    ...(author.expertise && {
      knowsAbout: Array.isArray(author.expertise) 
        ? author.expertise.join(', ') 
        : author.expertise
    }),
    ...(author.country && { nationality: author.country })
  };
}

/**
 * Create author reference for linking to Person schema
 */
export function createAuthorReference(baseUrl: string, authorId: string = 'expert') {
  return {
    '@id': `${baseUrl}#author-${authorId}`
  };
}
