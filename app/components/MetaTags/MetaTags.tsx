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

// Original function for Next.js metadata
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

// New function to generate HTML meta tags
export function generateHTMLMetaTags(metaData: MetaTagsData, slug: string): string {
  const title = metaData.subject || slug;
  const description = metaData.description || `Advanced laser cleaning solutions for ${title.toLowerCase()}.`;
  const ogTitle = metaData.ogTitle || title;
  const ogDescription = metaData.ogDescription || description;
  const twitterTitle = metaData.twitterTitle || ogTitle;
  const twitterDescription = metaData.twitterDescription || ogDescription;
  const url = `https://z-beam.com/${slug}`;
  
  let metaTags = '';
  
  // Basic meta tags
  metaTags += `<meta name="description" content="${description}">\n`;
  
  if (metaData.keywords && metaData.keywords.length > 0) {
    metaTags += `<meta name="keywords" content="${metaData.keywords.join(', ')}">\n`;
  }
  
  if (metaData.author) {
    metaTags += `<meta name="author" content="${metaData.author}">\n`;
  }
  
  // Open Graph tags
  metaTags += `<meta property="og:type" content="article">\n`;
  metaTags += `<meta property="og:title" content="${ogTitle}">\n`;
  metaTags += `<meta property="og:description" content="${ogDescription}">\n`;
  metaTags += `<meta property="og:url" content="${url}">\n`;
  metaTags += `<meta property="og:site_name" content="Z-Beam Laser Technologies">\n`;
  
  if (metaData.image) {
    metaTags += `<meta property="og:image" content="${metaData.image}">\n`;
  }
  
  // Twitter Card tags
  metaTags += `<meta name="twitter:card" content="summary_large_image">\n`;
  metaTags += `<meta name="twitter:title" content="${twitterTitle}">\n`;
  metaTags += `<meta name="twitter:description" content="${twitterDescription}">\n`;
  metaTags += `<meta name="twitter:creator" content="@zbeamtech">\n`;
  
  if (metaData.image) {
    metaTags += `<meta name="twitter:image" content="${metaData.image}">\n`;
  }
  
  // Schema.org metadata as JSON-LD
  if (metaData.schemaType) {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": metaData.schemaType || "TechArticle",
      "headline": title,
      "description": description,
      "author": metaData.author ? { "@type": "Person", "name": metaData.author } : undefined,
      "image": metaData.image,
      "datePublished": new Date().toISOString().split('T')[0],
      "publisher": {
        "@type": "Organization",
        "name": "Z-Beam Laser Technologies",
        "logo": {
          "@type": "ImageObject",
          "url": "https://z-beam.com/images/logo.png"
        }
      },
      "applicationCategory": metaData.applicationCategory,
      "industry": metaData.industry,
    };
    
    metaTags += `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>\n`;
  }
  
  return metaTags;
}