// app/utils/metadata.ts
// Use any type since Metadata isn't being exported correctly from next
type NextMetadata = any;

// Define author interface
export interface AuthorInfo {
  author_id?: number;
  author_name: string;
  author_country?: string;
  credentials?: string;
}

// Update ArticleMetadata to properly type the author field
export interface ArticleMetadata {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | string; // Allow any string value for ogType
  noindex?: boolean;
  author?: string | AuthorInfo; // Author can be a string or an object
  [key: string]: any; // Allow other properties
}

export function createMetadata(metadata: ArticleMetadata): NextMetadata {
  console.log("Creating metadata from:", JSON.stringify(metadata, null, 2));
  
  // Extract all properties safely with defaults
  const {
    title = '',
    description = '',
    keywords = [],
    canonical,
    ogImage,
    ogType = 'article',
    noindex,
    subject,
  } = metadata;
  
  // Helper function to safely extract author name
  const getAuthorName = (author: string | AuthorInfo | undefined): string | undefined => {
    if (!author) return undefined;
    if (typeof author === 'string') return author;
    return author.author_name;
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
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    openGraph: {
      title: actualTitle || formattedTitle,
      description: description,
      type: ogType as 'website' | 'article',
      images: ogImage ? [{ url: ogImage }] : undefined,
      authors: authorName ? [authorName] : undefined,
    },
    alternates: {
      canonical: canonical,
    },
    robots: noindex ? { index: false } : undefined,
  };
  
  console.log("Generated Next.js metadata:", JSON.stringify(result, null, 2));
  
  return result;
}