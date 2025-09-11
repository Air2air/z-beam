// app/utils/metadata.ts
// Use any type since Metadata isn't being exported correctly from next
type NextMetadata = any;

import { ArticleMetadata } from '../../types/core';
import { AuthorData } from '../../types/components/author';
import { extractSafeValue, safeIncludes } from './stringHelpers';

// Re-export centralized types
export type { ArticleMetadata };
export type { AuthorData as AuthorInfo } from '../../types/components/author';

export function createMetadata(metadata: ArticleMetadata): NextMetadata {
  
  // Extract all properties safely with defaults
  const {
    title: rawTitle,
    description: rawDescription,
    keywords = [],
    canonical,
    ogImage,
    ogType = 'article',
    noindex,
    subject: rawSubject,
  } = metadata;
  
  // Safely extract strings from potentially nested objects
  const title = extractSafeValue(rawTitle);
  const description = extractSafeValue(rawDescription);
  const subject = extractSafeValue(rawSubject);
  
  // Helper function to safely extract author name
  const getAuthorName = (author: string | AuthorData | undefined): string | undefined => {
    if (!author) return undefined;
    if (typeof author === 'string') return author;
    return author.author_name || author.name;
  };
  
  // Use subject as title if available and title is not set
  const actualTitle = title || subject || '';
  
  const formattedTitle = actualTitle && !safeIncludes(actualTitle, 'Z-Beam') 
    ? `${actualTitle} | Z-Beam` 
    : actualTitle || 'Z-Beam';
  
  const authorName = getAuthorName(metadata.author);
  
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
    alternates: {
      canonical: extractSafeValue(canonical),
    },
    robots: noindex ? { index: false } : undefined,
  };
  
  
  return result;
}