// app/utils/metadata.ts
// Use any type since Metadata isn't being exported correctly from next
type NextMetadata = any;

import { ArticleMetadata, AuthorInfo } from '@/types';
import { extractSafeValue, safeIncludes } from './stringHelpers';
import { SITE_CONFIG } from './constants';

// Re-export centralized types
export type { ArticleMetadata, AuthorInfo };

export function createMetadata(metadata: ArticleMetadata): NextMetadata {
  
  // Extract all properties safely with defaults
  const {
    title: rawTitle,
    description: rawDescription,
    keywords = [],
    image: ogImage,
    slug: rawSlug,
  } = metadata;
  
  const ogType = 'article'; // Default type
  
  // Safely extract strings from potentially nested objects
  const title = extractSafeValue(rawTitle);
  const description = extractSafeValue(rawDescription);
  const slug = extractSafeValue(rawSlug);
  
  // Simplified helper function to safely extract author name
  const getAuthorName = (author: AuthorInfo | undefined): string | undefined => {
    if (!author) return undefined;
    return author.name; // Standardized field name
  };
  
  // Use title directly
  const actualTitle = title || '';
  
  const formattedTitle = actualTitle && !safeIncludes(actualTitle, SITE_CONFIG.shortName) 
    ? `${actualTitle} | ${SITE_CONFIG.shortName}` 
    : actualTitle || SITE_CONFIG.shortName;
  
  const authorName = getAuthorName(metadata.authorInfo);
  
  const result: NextMetadata = {
    title: formattedTitle,
    description: description,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : extractSafeValue(keywords),
    openGraph: {
      title: actualTitle || formattedTitle,
      description: description,
      type: ogType as 'website' | 'article',
      images: ogImage ? [{ url: extractSafeValue(ogImage) }] : undefined,
      authors: authorName ? [authorName] : undefined,
    },
  };
  
  return result;
}