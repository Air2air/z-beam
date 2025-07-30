// app/utils/metadataGenerator.ts - UTILS (Server-side functions)
import { Metadata } from 'next';
import { loadFrontmatterData } from './frontmatterLoader';


const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z-beam.com';

export async function generateArticleMetadata(slug: string): Promise<Metadata> {
  const frontmatter = await loadFrontmatterData(slug);
  
  if (!frontmatter) {
    return getDefaultMetadata();
  }

  // Safe property access with fallbacks
  const title = frontmatter.subject || 'Z-Beam Article';
  const description = frontmatter.description || 
    `Advanced laser cleaning solutions for ${(frontmatter.subject || 'materials').toLowerCase()}. Professional surface preparation and industrial cleaning technology.`;

  return {
    title,
    description,
    keywords: [
      frontmatter.subject,
      frontmatter.category,
      'laser cleaning',
      'industrial cleaning',
      'surface preparation',
      ...(Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [])
    ].filter(Boolean).join(', '), // Remove undefined values
    
    openGraph: {
      title: `${title} | Z-Beam Laser Cleaning`,
      description,
      url: `${baseUrl}/${slug}`,
      siteName: 'Z-Beam Laser Cleaning',
      type: 'article',
      locale: 'en_US',
      images: [
        {
          url: frontmatter.image || `${baseUrl}/images/og/${frontmatter.articleType || 'default'}-default.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function getDefaultMetadata(): Metadata {
  return {
    title: 'Z-Beam Laser Cleaning Solutions',
    description: 'Advanced laser cleaning technology for industrial applications. Precision surface preparation, coating removal, and material restoration.',
    keywords: 'laser cleaning, industrial cleaning, surface preparation, coating removal, rust removal, paint stripping',
    
    openGraph: {
      title: 'Z-Beam Laser Cleaning Solutions',
      description: 'Advanced laser cleaning technology for industrial applications.',
      url: baseUrl,
      siteName: 'Z-Beam',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og/default.jpg`,
          width: 1200,
          height: 630,
          alt: 'Z-Beam Laser Cleaning',
        }
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
    },
  };
}