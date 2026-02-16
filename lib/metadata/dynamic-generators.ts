// Use any type since Metadata isn't being exported correctly from next
type NextMetadata = any;

import { SITE_CONFIG } from '@/app/config/site';
import { 
  generateBreadcrumbSchema, 
  generateProductSchema,
  generateHowToSchema,
  type BreadcrumbItem,
  type ProductSchemaOptions,
  type HowToSchemaOptions
} from '@/lib/schema/generators';
import { 
  generateSocialImageMetadata,
  DEFAULT_IMAGES
} from '@/lib/metadata/image-optimization';

/**
 * Dynamic Page Metadata Utilities
 * 
 * Centralized metadata generation for all dynamic content pages across the Z-Beam site.
 * Provides domain-specific metadata generators with smart keyword enhancement, OpenGraph/Twitter
 * card integration, author attribution (E-E-A-T), and comprehensive SEO optimization.
 * 
 * @module lib/metadata/dynamic-generators
 * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-metadata} Next.js Metadata API
 * @example
 * // In page.tsx or generateMetadata()
 * import { generateMaterialMetadata } from '@/lib/metadata/dynamic-generators';
 * 
 * export const metadata = generateMaterialMetadata({
 *   materialName: 'Aluminum',
 *   description: 'Professional aluminum laser cleaning...',
 *   slug: 'aluminum-laser-cleaning',
 *   category: 'metals',
 *   keywords: ['aluminum', 'metal cleaning']
 * });
 * 
 * @architecture
 * Used by 265+ dynamic pages through factory pattern in app/utils/contentPages/helpers.ts
 * Routes to specialized generators based on content type (materials, contaminants, settings, compounds)
 * 
 * Centralized metadata generation for dynamic pages (materials, contaminants, compounds, settings).
 * Extends static page utilities with dynamic content support.
 * 
 * @see lib/metadata/generators.ts - Static page metadata utilities
 * @see docs/08-development/TYPE_CONSOLIDATION_DEC21_2025.md - Type system standards
 */

interface DynamicPageMetadataOptions {
  title: string;
  description: string;
  pathname: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  author?: {
    name: string;
    title?: string;
  };
  datePublished?: string;
  dateModified?: string;
}

/**
 * Generate metadata for dynamic pages (materials, contaminants, compounds, settings)
 * 
 * @param options - Configuration for metadata generation
 * @returns Complete metadata object with OpenGraph, Twitter cards, and structured data hints
 * 
 * @example
 * ```typescript
 * export async function generateMetadata({ params }): Promise<NextMetadata> {
 *   const material = await getMaterialData(params.slug);
 *   return generateDynamicPageMetadata({
 *     title: material.title,
 *     description: material.description,
 *     pathname: `/materials/${params.slug}`,
 *     keywords: material.keywords,
 *     image: material.images?.hero?.url,
 *     author: material.author
 *   });
 * }
 * ```
 */
export function generateDynamicPageMetadata(options: DynamicPageMetadataOptions): NextMetadata {
  const {
    title,
    description,
    pathname,
    keywords,
    image,
    noIndex = false,
    author,
    datePublished,
    dateModified
  } = options;

  const fullUrl = `${SITE_CONFIG.url}${pathname}`;
  const ogImage = image || `${SITE_CONFIG.url}/images/og-default.png`;

  return {
    title,
    description,
    keywords: keywords || undefined,
    author: author || undefined,
    alternates: {
      canonical: fullUrl
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      publishedTime: datePublished,
      modifiedTime: dateModified,
      authors: author ? [author.name] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: author ? `@${author.name.replace(/\s+/g, '')}` : undefined
    },
    robots: noIndex 
      ? { index: false, follow: true }
      : { index: true, follow: true }
  };
}

/**
 * Material-specific metadata generation
 * Enhanced with Product schema for rich snippets and improved SEO
 */
export function generateMaterialMetadata(options: {
  materialName: string;
  description: string;
  slug: string;
  category?: string;
  subcategory?: string;
  keywords?: string[];
  author?: {
    name: string;
    title?: string;
    country?: string;
  };
  dateModified?: string;
  image?: string;
  properties?: {
    meltingPoint?: string;
    density?: string;
    hardness?: string;
  };
}): NextMetadata {
  const { materialName, description, slug, category, subcategory, keywords, author, dateModified, image, properties } = options;
  
  const categoryPath = category ? `/${category}` : '';
  const subcategoryPath = subcategory ? `/${subcategory}` : '';
  const pathname = `/materials${categoryPath}${subcategoryPath}/${slug}`;
  const fullUrl = `${SITE_CONFIG.url}${pathname}`;
  
  // Enhance keywords with material-specific terms
  const enhancedKeywords = [
    ...(keywords || []),
    `${materialName} laser cleaning`,
    'laser ablation',
    'surface treatment',
    'industrial cleaning'
  ];

  // Generate optimized social images
  const socialImages = image 
    ? generateSocialImageMetadata(image, `${materialName} Laser Cleaning`)
    : DEFAULT_IMAGES.materials;

  // Generate Product schema for material cleaning services
  const productSchema = generateProductSchema({
    name: `${materialName} Laser Cleaning Service`,
    description: `Professional laser cleaning services for ${materialName}. ${description}`,
    image: image,
    category: 'Industrial Cleaning Service'
  });

  // Generate breadcrumb schema
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Materials', href: '/materials' }
  ];
  if (category) {
    breadcrumbs.push({ name: category, href: `/materials/${category}` });
  }
  breadcrumbs.push({ name: materialName, href: pathname });

  const metadata = generateDynamicPageMetadata({
    title: `${materialName} Laser Cleaning | ${SITE_CONFIG.name}`,
    description,
    pathname,
    keywords: enhancedKeywords,
    image,
    author,
    dateModified
  });

  // Enhance with structured data
  metadata.other = {
    'application-ld+json': (() => {
      const schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${fullUrl}#webpage`,
            url: fullUrl,
            name: `${materialName} Laser Cleaning`,
            description,
            ...(dateModified && { dateModified })
          },
          productSchema,
          generateBreadcrumbSchema(breadcrumbs)
        ]
      };

      // Add Material schema if properties are provided
      if (properties) {
        schemaData['@graph'].push({
          '@type': 'Material',
          '@id': `${fullUrl}#material`,
          name: materialName,
          description,
          ...(properties.meltingPoint && { meltingPoint: properties.meltingPoint }),
          ...(properties.density && { density: properties.density }),
          ...(properties.hardness && { hardness: properties.hardness })
        });
      }

      return JSON.stringify(schemaData);
    })()
  };

  // Use optimized images
  if (socialImages) {
    metadata.openGraph.images = [socialImages.openGraph];
    metadata.twitter.images = [socialImages.twitter];
  }

  return metadata;
}

/**
 * Contaminant-specific metadata generation
 * Optimized for contaminant pages with removal techniques and safety information
 */
export function generateContaminantMetadata(options: {
  contaminantName: string;
  description: string;
  slug: string;
  category?: string;
  subcategory?: string;
  keywords?: string[];
  dateModified?: string;
  image?: string;
}): NextMetadata {
  const { contaminantName, description, slug, category, subcategory, keywords, dateModified, image } = options;
  
  const categoryPath = category ? `/${category}` : '';
  const subcategoryPath = subcategory ? `/${subcategory}` : '';
  const pathname = `/contaminants${categoryPath}${subcategoryPath}/${slug}`;
  
  const enhancedKeywords = [
    ...(keywords || []),
    `${contaminantName} removal`,
    'laser cleaning',
    'contamination treatment',
    'surface decontamination'
  ];

  return generateDynamicPageMetadata({
    title: `${contaminantName} Removal | ${SITE_CONFIG.name}`,
    description,
    pathname,
    keywords: enhancedKeywords,
    image,
    dateModified
  });
}

/**
 * Settings-specific metadata generation
 * Optimized for laser parameter settings pages
 */
export function generateSettingsMetadata(options: {
  settingName: string;
  description: string;
  slug: string;
  materialType?: string;
  category?: string;
  subcategory?: string;
  keywords?: string[];
  dateModified?: string;
}): NextMetadata {
  const { settingName, description, slug, materialType, category, subcategory, keywords, dateModified } = options;
  
  const categoryPath = category ? `/${category}` : '';
  const subcategoryPath = subcategory ? `/${subcategory}` : '';
  const pathname = `/settings${categoryPath}${subcategoryPath}/${slug}`;
  
  const enhancedKeywords = [
    ...(keywords || []),
    `${settingName} parameters`,
    'laser settings',
    'cleaning parameters',
    materialType ? `${materialType} laser cleaning` : 'laser cleaning'
  ];

  return generateDynamicPageMetadata({
    title: `${settingName} Settings | ${SITE_CONFIG.name}`,
    description,
    pathname,
    keywords: enhancedKeywords,
    dateModified
  });
}
