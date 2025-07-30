// app/components/MetaTags/MetaTags.tsx
import { Metadata } from 'next';

export interface MetaTagsData {
  // Basic Metadata
  subject?: string;
  articleType?: string;
  category?: string;
  description?: string;
  keywords?: string[];
  
  // Author & Technical
  author?: string;
  technicalCompliance?: string;
  wordCount?: string;
  
  // Technical Specifications
  specifications?: {
    wavelength?: string;
    pulseDuration?: string;
    powerRange?: string;
    spotSize?: string;
    repetitionRate?: string;
    beamQuality?: string;
    surfaceRoughness?: string;
  };
  
  // Industry & Applications
  industry?: string;
  applications?: string[];
  manufacturer?: string;
  location?: string;
  
  // Images & Social
  image?: string;
  imageAlt?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  
  // Schema.org
  schemaType?: string;
  applicationCategory?: string;
  
  // Generated
  url?: string;
}

export function createMetadataFromTags(metaData: MetaTagsData, slug: string): Metadata {
  const title = metaData.subject || slug;
  const description = metaData.description || `Advanced laser cleaning solutions for ${title.toLowerCase()}.`;

  return {
    title: `${title} | Z-Beam Laser Cleaning`,
    description,
    keywords: metaData.keywords?.join(', '),
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://z-beam.com/${slug}`,
    },
  };
}