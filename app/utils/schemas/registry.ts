/**
 * Centralized Schema Registry
 * 
 * Single source of truth for all JSON-LD schemas across the site.
 * This eliminates duplication and makes schema management straightforward.
 * 
 * @example
 * ```typescript
 * // In any page:
 * import { schemaRegistry } from '@/app/utils/schemas/registry';
 * 
 * const schemas = schemaRegistry.getPageSchemas('services', { 
 *   pricing, 
 *   services 
 * });
 * ```
 */

import { SITE_CONFIG } from '../constants';
import { generateOrganizationSchema } from '../business-config';
import type { SchemaOrgBase, SchemaOrgGraph } from './generators/types';

/**
 * Simple breadcrumb path parser
 * Converts URL slug to breadcrumb array
 */
function parseBreadcrumbPath(slug: string): Array<{ label: string; href: string }> {
  if (!slug || slug === '') {
    return [{ label: 'Home', href: '/' }];
  }
  
  const parts = slug.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  let currentPath = '';
  parts.forEach((part, _index) => {
    currentPath += `/${part}`;
    const label = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    breadcrumbs.push({ label, href: currentPath });
  });
  
  return breadcrumbs;
}

// ============================================================================
// Schema Generation Functions
// ============================================================================

/**
 * Generate LocalBusiness/Organization schema
 * Used site-wide to establish business identity
 */
export function generateBusinessSchema(): SchemaOrgBase {
  return generateOrganizationSchema();
}

/**
 * Generate WebSite schema with search functionality
 * Used in root layout for site-wide identity
 */
export function generateWebsiteSchema(): SchemaOrgBase {
  return {
    "@context": "https://schema.org",
    "@type": SITE_CONFIG.schema.websiteType,
    "@id": `${SITE_CONFIG.url}#website`,
    "name": SITE_CONFIG.name,
    "description": SITE_CONFIG.description,
    "url": SITE_CONFIG.url,
    "inLanguage": "en-US",
    "publisher": {
      "@type": "Organization",
      "@id": `${SITE_CONFIG.url}#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_CONFIG.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate Service schema with pricing
 * Used on services page and service-related pages
 */
export function generateServiceSchema(options?: {
  serviceName?: string;
  description?: string;
  pricing?: typeof SITE_CONFIG.pricing.equipmentRental;
}): SchemaOrgBase {
  const pricing = options?.pricing || SITE_CONFIG.pricing.equipmentRental;
  const serviceName = options?.serviceName || 'Laser Cleaning Equipment Rental';
  const description = options?.description || pricing.description;
  const packageRates = Object.values(pricing.packages).map((pkg) => pkg.hourlyRate);
  const lowPrice = Math.min(...packageRates);
  const highPrice = Math.max(...packageRates);

  return {
    '@type': 'Service',
    '@id': `${SITE_CONFIG.url}/services#service`,
    'name': serviceName,
    'description': description,
    'provider': {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}#organization`,
      'name': SITE_CONFIG.name,
      'url': SITE_CONFIG.url,
      'telephone': SITE_CONFIG.contact.sales.phone,
      'email': SITE_CONFIG.contact.sales.email,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': SITE_CONFIG.address.city,
        'addressRegion': SITE_CONFIG.address.state,
        'postalCode': SITE_CONFIG.address.zipCode,
        'addressCountry': SITE_CONFIG.address.country
      }
    },
    'serviceType': 'Industrial Laser Cleaning',
    'areaServed': {
      '@type': 'Country',
      'name': 'United States'
    },
    'availableChannel': {
      '@type': 'ServiceChannel',
      'serviceUrl': `${SITE_CONFIG.url}/contact`,
      'servicePhone': SITE_CONFIG.contact.sales.phoneHref,
      'serviceLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': SITE_CONFIG.address.city,
          'addressRegion': SITE_CONFIG.address.state,
          'addressCountry': SITE_CONFIG.address.country
        }
      }
    },
    'offers': {
      '@type': 'AggregateOffer',
      'lowPrice': lowPrice,
      'highPrice': highPrice,
      'offerCount': packageRates.length,
      'priceCurrency': pricing.currency,
      'offers': Object.values(pricing.packages).map((pkg) => ({
        '@type': 'Offer',
        'name': pkg.name,
        'price': pkg.hourlyRate,
        'priceCurrency': pricing.currency,
        'url': `${SITE_CONFIG.url}/services`
      })),
      'priceSpecification': {
        '@type': 'UnitPriceSpecification',
        'minPrice': lowPrice,
        'maxPrice': highPrice,
        'priceCurrency': pricing.currency,
        'unitText': pricing.unit
      },
      'availability': 'https://schema.org/InStock',
      'url': `${SITE_CONFIG.url}/services`,
      'seller': {
        '@type': 'Organization',
        '@id': `${SITE_CONFIG.url}#organization`
      }
    },
    'category': [
      'Industrial Cleaning',
      'Surface Preparation',
      'Rust Removal',
      'Coating Removal',
      'Laser Technology'
    ],
    'termsOfService': `${SITE_CONFIG.url}/services`,
    'slogan': 'Precision Cleaning, Delivered'
  };
}

/**
 * Generate BreadcrumbList schema
 * Used on all pages for navigation structure
 */
export function generateBreadcrumbSchema(slug: string): SchemaOrgBase {
  const breadcrumbs = parseBreadcrumbPath(slug);
  
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_CONFIG.url}/${slug}#breadcrumb`,
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.label,
      'item': crumb.href === '/' ? SITE_CONFIG.url : `${SITE_CONFIG.url}${crumb.href}`
    }))
  };
}

/**
 * Generate WebPage schema
 * Used on all pages to describe page content
 */
export function generateWebPageSchema(options: {
  slug: string;
  title: string;
  description: string;
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
}): SchemaOrgBase {
  const { slug, title, description, pageType = 'WebPage' } = options;
  
  return {
    '@type': pageType,
    '@id': `${SITE_CONFIG.url}/${slug}`,
    'name': title,
    'description': description,
    'url': `${SITE_CONFIG.url}/${slug}`,
    'isPartOf': {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.url}#website`
    },
    'about': {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}#organization`
    },
    'primaryImageOfPage': {
      '@type': 'ImageObject',
      'url': `${SITE_CONFIG.url}/images/og-image.jpg`
    }
  };
}

/**
 * Generate FAQ schema
 * Used on pages with FAQ content
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): SchemaOrgBase {
  return {
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

// ============================================================================
// Schema Registry - Page-Specific Schema Bundles
// ============================================================================

export const schemaRegistry = {
  /**
   * Get all schemas for a specific page type
   * Returns a @graph structure with all relevant schemas
   */
  getPageSchemas(pageType: string, data?: any): SchemaOrgGraph {
    const generators: Record<string, () => SchemaOrgBase[]> = {
      // Homepage schemas
      home: () => [
        generateBusinessSchema(),
        generateWebsiteSchema(),
        generateWebPageSchema({
          slug: '',
          title: SITE_CONFIG.name,
          description: SITE_CONFIG.description
        })
      ],

      // Services page schemas
      services: () => [
        generateServiceSchema(data),
        generateBreadcrumbSchema('services'),
        generateWebPageSchema({
          slug: 'services',
          title: 'Laser Cleaning Services',
          description: data?.description || SITE_CONFIG.pricing.equipmentRental.description
        }),
        // VideoObject - if video data provided
        ...(data?.video?.id ? [{
          '@type': 'VideoObject',
          '@id': `${SITE_CONFIG.url}/services#video`,
          'name': data.video.title || 'Professional Laser Cleaning Services',
          'description': data.video.description || data?.description || SITE_CONFIG.pricing.equipmentRental.description,
          'thumbnailUrl': `https://img.youtube.com/vi/${data.video.id}/maxresdefault.jpg`,
          'uploadDate': data.datePublished || new Date().toISOString().split('T')[0],
          'contentUrl': `https://www.youtube.com/watch?v=${data.video.id}`,
          'embedUrl': `https://www.youtube.com/embed/${data.video.id}`,
          'duration': data.video.duration || 'PT2M30S',
          'inLanguage': 'en-US'
        }] : [])
      ],

      // About page schemas
      about: () => [
        generateBusinessSchema(),
        generateWebPageSchema({
          slug: 'about',
          title: 'About Z-Beam',
          description: 'Learn about Z-Beam Laser Cleaning',
          pageType: 'AboutPage'
        }),
        generateBreadcrumbSchema('about')
      ],

      // Contact page schemas
      contact: () => [
        generateBusinessSchema(),
        generateWebPageSchema({
          slug: 'contact',
          title: 'Contact Us',
          description: 'Get in touch with Z-Beam',
          pageType: 'ContactPage'
        }),
        generateBreadcrumbSchema('contact')
      ],

      // Schedule page schemas

      // Materials listing page
      materials: () => [
        generateWebPageSchema({
          slug: 'materials',
          title: 'Laser Cleaning Materials Database',
          description: 'Browse our comprehensive database of laser cleaning parameters',
          pageType: 'CollectionPage'
        }),
        generateBreadcrumbSchema('materials')
      ],

      // Safety page schemas
      safety: () => [
        generateWebPageSchema({
          slug: 'safety',
          title: 'Laser Cleaning Safety Guidelines',
          description: 'Essential safety information for laser cleaning operations'
        }),
        generateBreadcrumbSchema('safety')
      ]
    };

    const generator = generators[pageType];
    if (!generator) {
      // Default fallback for unknown pages
      return {
        '@context': 'https://schema.org',
        '@graph': [
          generateWebPageSchema({
            slug: pageType,
            title: SITE_CONFIG.name,
            description: SITE_CONFIG.description
          })
        ]
      };
    }

    return {
      '@context': 'https://schema.org',
      '@graph': generator()
    };
  },

  /**
   * Individual schema generators (for custom use cases)
   */
  business: generateBusinessSchema,
  website: generateWebsiteSchema,
  service: generateServiceSchema,
  breadcrumb: generateBreadcrumbSchema,
  webpage: generateWebPageSchema,
  faq: generateFAQSchema
};

export default schemaRegistry;
