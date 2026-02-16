/**
 * Metadata Generators
 * Centralized utilities for generating page metadata (OpenGraph, Twitter cards)
 * Enhanced with JSON-LD schema and image optimization
 */

// Use any type since Metadata isn't being exported correctly from next
type NextMetadata = any;

import { SITE_CONFIG } from '@/app/config/site';
import { 
  generateBreadcrumbSchema, 
  generateFAQSchema, 
  generateLocalBusinessSchema,
  generateServiceSchema,
  generateTechnicalArticleSchema,
  type FAQItem,
  type ServiceSchemaOptions,
  type TechnicalArticleSchemaOptions
} from '@/lib/schema/generators';
import { 
  generateSocialImageMetadata, 
  DEFAULT_IMAGES 
} from '@/lib/metadata/image-optimization';

export interface StaticPageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  noIndex?: boolean;
  serviceSchema?: ServiceSchemaOptions;
  technicalArticleSchema?: TechnicalArticleSchemaOptions;
}

/**
 * Generate complete metadata for static pages including OpenGraph and Twitter cards
 * Enhanced with image optimization and proper dimensions for Core Web Vitals
 * @param options - Metadata configuration options
 * @returns Next.js Metadata object
 */
export function generateStaticPageMetadata(options: StaticPageMetadataOptions): NextMetadata {
  const {
    title,
    description,
    path,
    image = '/images/default-og.jpg',
    type = 'website',
    keywords = [],
    noIndex = false,
    serviceSchema,
    technicalArticleSchema
  } = options;

  // Generate optimized image metadata
  const socialImages = generateSocialImageMetadata(image, title);

  // Build structured data graph
  const schemaGraph: any[] = [
    {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}${path}#webpage`,
      url: `${SITE_CONFIG.url}${path}`,
      name: title,
      description,
      isPartOf: {
        '@id': `${SITE_CONFIG.url}/#website`
      }
    }
  ];

  // Add Service schema if provided
  if (serviceSchema) {
    schemaGraph.push(generateServiceSchema(serviceSchema));
  }

  // Add TechnicalArticle schema if provided
  if (technicalArticleSchema) {
    schemaGraph.push(generateTechnicalArticleSchema(technicalArticleSchema));
  }

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    ...(noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}${path}`,
      siteName: SITE_CONFIG.name,
      images: [socialImages.openGraph],
      locale: 'en_US',
      type
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImages.twitter],
      creator: SITE_CONFIG.author
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}${path}`
    },
    ...(schemaGraph.length > 1 && {
      other: {
        'application-ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': schemaGraph
        })
      }
    })
  };
}

/**
 * Generate enhanced home page metadata with local business schema
 * @returns Complete metadata for home page with structured data
 */
export function generateHomeMetadata(): NextMetadata {
  const socialImages = DEFAULT_IMAGES.home;
  
  return {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    keywords: [
      'laser cleaning',
      'rust removal',
      'surface preparation',
      'industrial cleaning',
      'paint removal',
      'contaminant removal',
      'SF Bay Area',
      'California'
    ],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_CONFIG.url,
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      siteName: SITE_CONFIG.name,
      images: [socialImages.openGraph]
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      creator: SITE_CONFIG.author,
      images: [socialImages.twitter]
    },
    other: {
      'application-ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${SITE_CONFIG.url}/#website`,
            url: SITE_CONFIG.url,
            name: SITE_CONFIG.name,
            description: SITE_CONFIG.description,
            publisher: {
              '@id': `${SITE_CONFIG.url}/#organization`
            }
          },
          {
            '@type': 'Organization',
            '@id': `${SITE_CONFIG.url}/#organization`,
            name: SITE_CONFIG.name,
            url: SITE_CONFIG.url,
            description: SITE_CONFIG.description,
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: SITE_CONFIG.contact?.general?.phone,
              email: SITE_CONFIG.contact?.general?.email,
              contactType: 'customer service'
            }
          },
          generateLocalBusinessSchema()
        ]
      })
    }
  };
}

/**
 * Generate enhanced about page metadata with FAQ schema
 * @returns Complete metadata for about page with FAQ structured data
 */
export function generateAboutMetadata(): NextMetadata {
  const title = 'About Z-Beam - Advanced Laser Cleaning Solutions';
  const description = 'Learn about Z-Beam\'s mission to provide advanced laser cleaning solutions for industrial applications across the San Francisco Bay Area.';
  const socialImages = DEFAULT_IMAGES.about;
  
  const faqs: FAQItem[] = [
    {
      question: 'What is laser cleaning?',
      answer: 'Laser cleaning is an advanced surface treatment technology that uses focused laser beams to remove contaminants, rust, paint, and other unwanted materials from surfaces without damaging the substrate.'
    },
    {
      question: 'How does Z-Beam laser cleaning work?',
      answer: 'Z-Beam systems use precisely controlled laser parameters to ablate surface contaminants while preserving the underlying material. Our technology offers superior control over traditional cleaning methods.'
    },
    {
      question: 'What materials can be laser cleaned?',
      answer: 'Z-Beam systems can effectively clean metals, composites, stone, concrete, and many other industrial materials. Each material requires specific parameter optimization for best results.'
    },
    {
      question: 'Is laser cleaning environmentally friendly?',
      answer: 'Yes, laser cleaning is an eco-friendly process that eliminates the need for chemical solvents and produces minimal waste. It\'s a sustainable alternative to traditional cleaning methods.'
    }
  ];
  
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: [socialImages.openGraph]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImages.twitter]
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/about`
    },
    other: {
      'application-ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'AboutPage',
            '@id': `${SITE_CONFIG.url}/about#aboutpage`,
            url: `${SITE_CONFIG.url}/about`,
            name: title,
            description
          },
          generateFAQSchema(faqs)
        ]
      })
    }
  };
}
