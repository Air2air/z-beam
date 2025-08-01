// app/utils/metadata.ts
import type { Metadata as NextMetadata } from 'next';
import { ArticleMetadata } from './contentIntegrator';

export function createMetadata(metadata: ArticleMetadata): NextMetadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage,
    ogType = 'article',
    noindex,
    // Add other fields as needed
  } = metadata;
  
  const formattedTitle = title && !title.includes('Z-Beam') 
    ? `${title} | Z-Beam` 
    : title || 'Z-Beam';
  
  const result: NextMetadata = {
    title: formattedTitle,
    description: description,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    openGraph: {
      title: title || formattedTitle,
      description: description,
      type: ogType as 'website' | 'article',
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: canonical,
    },
    robots: noindex ? { index: false } : undefined,
  };
  
  return result;
}