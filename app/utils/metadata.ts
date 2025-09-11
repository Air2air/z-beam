// app/utils/metadata.ts
// Use any type since Metadata isn't being exported correctly from next
type NextMetadata = any;

import { ArticleMetadata } from '../../types/core';
import { AuthorData } from '../../types/components/author';

// Re-export centralized types
export type { ArticleMetadata };
export type { AuthorData as AuthorInfo } from '../../types/components/author';

export function createMetadata(metadata: ArticleMetadata): NextMetadata {
  
  // Helper function to extract string values from nested objects
  const extractString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      // Look for common nested patterns like { title: "value" } or { formula: "value" }
      const keys = Object.keys(value);
      if (keys.length === 1) {
        const firstKey = keys[0];
        const nestedValue = value[firstKey];
        if (typeof nestedValue === 'string') return nestedValue;
      }
      // Fallback to converting the object to JSON string
      return JSON.stringify(value);
    }
    return String(value || '');
  };
  
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
  const title = extractString(rawTitle);
  const description = extractString(rawDescription);
  const subject = extractString(rawSubject);
  
  // Helper function to safely extract author name
  const getAuthorName = (author: string | AuthorData | undefined): string | undefined => {
    if (!author) return undefined;
    if (typeof author === 'string') return author;
    return author.author_name || author.name;
  };
  
  // Use subject as title if available and title is not set
  const actualTitle = title || subject || '';
  
  const formattedTitle = actualTitle && !actualTitle.includes('Z-Beam') 
    ? `${actualTitle} | Z-Beam` 
    : actualTitle || 'Z-Beam';
  
  const authorName = getAuthorName(metadata.author);
  
  const result: NextMetadata = {
    title: formattedTitle,
    description: description,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : extractString(keywords),
    openGraph: {
      title: actualTitle || formattedTitle,
      description: description,
      type: ogType as 'website' | 'article',
      images: ogImage ? [{ url: extractString(ogImage) }] : undefined,
      authors: authorName ? [authorName] : undefined,
    },
    alternates: {
      canonical: extractString(canonical),
    },
    robots: noindex ? { index: false } : undefined,
  };
  
  
  return result;
}