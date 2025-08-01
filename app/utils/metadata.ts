// app/utils/metadata.ts
import type { Metadata } from 'next';

interface MetaTagsInput {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article'; // Limit to valid types
  noindex?: boolean;
  jsonLd?: any;
}

export function createMetadata({
  title = 'Z-Beam',
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  noindex,
  jsonLd // Accept JSON-LD data
}: MetaTagsInput): Metadata {
  const formattedTitle = title.includes('Z-Beam') ? title : `${title} | Z-Beam`;
  
  const metadata: Metadata = {
    title: formattedTitle,
    description: description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    openGraph: {
      title: title,
      description: description,
      type: ogType as 'website' | 'article',
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: canonical,
    },
    robots: noindex ? { index: false } : undefined,
  };
  
  // Fix JSON-LD handling
  if (jsonLd) {
    // Make sure jsonLd is properly serialized - handle nested objects
    let jsonText = '';
    try {
      // Handle the case where jsonLd might already be a string
      if (typeof jsonLd === 'string') {
        jsonText = jsonLd;
      } else {
        jsonText = JSON.stringify(jsonLd);
      }
      
      (metadata as any).other = {
        'script:ld+json': [
          {
            type: 'application/ld+json',
            text: jsonText
          }
        ]
      };
    } catch (e) {
      console.error('Error serializing JSON-LD:', e);
    }
  }
  
  return metadata;
}