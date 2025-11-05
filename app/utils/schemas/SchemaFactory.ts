/**
 * Unified Schema Factory - Centralized JSON-LD Schema Generation
 * 
 * Features:
 * - Registry-based schema generation with automatic type detection
 * - Plugin architecture for extensibility
 * - Enhanced E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
 * - Performance optimization with caching
 * - Validation layer for Schema.org compliance
 * 
 * @example
 * ```typescript
 * const factory = new SchemaFactory(pageData, slug, context);
 * const schemas = factory.generate();
 * ```
 */

import { SITE_CONFIG } from '../constants';
import { generateBreadcrumbs } from '../breadcrumbs';
import { 
  createTechnicalArticleSchema,
  createMaterialProductSchema,
  createHowToSchema,
  createDatasetSchema,
  createFAQPageSchema,
  createAuthorSchema,
  createWebPageSchema,
  createBreadcrumbSchema
} from '../jsonld-helper';

// ============================================================================
// Types & Interfaces
// ============================================================================

import type { SchemaData, SchemaOrgBase, SchemaContext } from './generators/types';

export interface SchemaGeneratorOptions {
  priority?: number;
  required?: boolean;
  condition?: (data: SchemaData, context: SchemaContext) => boolean;
}

export type SchemaGenerator = (
  data: SchemaData,
  context: SchemaContext,
  options?: SchemaGeneratorOptions
) => SchemaOrgBase | null;

export interface SchemaRegistry {
  [key: string]: {
    generator: SchemaGenerator;
    options: SchemaGeneratorOptions;
  };
}

// ============================================================================
// Schema Factory Class
// ============================================================================

export class SchemaFactory {
  private data: SchemaData;
  private context: SchemaContext;
  private registry: SchemaRegistry = {};
  private cache: Map<string, SchemaOrgBase | null> = new Map();

  constructor(data: SchemaData, slug: string, baseUrl?: string) {
    this.data = data;
    this.context = {
      slug,
      baseUrl: baseUrl || SITE_CONFIG.url,
      pageUrl: `${baseUrl || SITE_CONFIG.url}/${slug}`,
      currentDate: new Date().toISOString().split('T')[0]
    };

    // Register all built-in schema generators
    this.registerDefaultSchemas();
  }

  /**
   * Register a schema generator
   */
  register(
    name: string,
    generator: SchemaGenerator,
    options: SchemaGeneratorOptions = {}
  ): void {
    this.registry[name] = {
      generator,
      options: {
        priority: 0,
        required: false,
        ...options
      }
    };
  }

  /**
   * Generate all applicable schemas
   */
  generate(): SchemaOrgBase {
    const schemas: SchemaOrgBase[] = [];

    // Sort by priority (higher first)
    const sortedEntries = Object.entries(this.registry).sort(
      ([, a], [, b]) => (b.options.priority || 0) - (a.options.priority || 0)
    );

    for (const [name, { generator, options }] of sortedEntries) {
      // Check cache first
      if (this.cache.has(name)) {
        const cached = this.cache.get(name);
        if (cached) schemas.push(cached);
        continue;
      }

      // Check condition if provided
      if (options.condition && !options.condition(this.data, this.context)) {
        continue;
      }

      try {
        const schema = generator(this.data, this.context, options);
        if (schema) {
          this.cache.set(name, schema);
          schemas.push(schema);
        } else if (options.required) {
          console.warn(`Required schema "${name}" returned null`);
        }
      } catch (error) {
        console.error(`Error generating schema "${name}":`, error);
        if (options.required) {
          throw error;
        }
      }
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'Graph',
      '@graph': schemas.filter((s): s is SchemaOrgBase => s !== null)
    };
  }

  /**
   * Register all default schema generators
   */
  private registerDefaultSchemas(): void {
    // Core schemas (high priority)
    this.register('WebPage', generateWebPageSchema, { priority: 100, required: true });
    this.register('BreadcrumbList', generateBreadcrumbSchema, { priority: 90 });
    this.register('Organization', generateOrganizationSchema, { priority: 85 });

    // Content schemas
    this.register('Article', generateArticleSchema, { 
      priority: 80,
      condition: (data) => !!(data.frontmatter?.category || data.metadata?.category)
    });
    this.register('Product', generateProductSchema, {
      priority: 75,
      condition: (data) => hasProductData(data)
    });
    this.register('Service', generateServiceSchema, {
      priority: 75,
      condition: (data) => hasServiceData(data)
    });
    this.register('Course', generateCourseSchema, {
      priority: 70,
      condition: (data) => !!(data.courseData || data.trainingData)
    });

    // Supporting schemas
    this.register('LocalBusiness', generateLocalBusinessSchema, {
      priority: 65,
      condition: (data) => !!(data.businessInfo?.geo || data.contactPoint)
    });
    this.register('HowTo', generateHowToSchema, {
      priority: 60,
      condition: (data) => {
        const fm = data.frontmatter as Record<string, unknown> | undefined;
        return !!(fm?.machineSettings || data.steps);
      }
    });
    this.register('FAQ', generateFAQSchema, {
      priority: 55,
      condition: (data) => {
        // Check for explicit FAQ data in multiple locations
        // Material pages pass FAQ data via metadata from contentAPI
        const fm = data.frontmatter as Record<string, unknown> | undefined;
        if (data.faq || fm?.faq || data.metadata?.faq) return true;
        
        // Check for FAQ-generating frontmatter (used by MaterialFAQ component)
        const fmOrMeta = (data.frontmatter || data.metadata || {}) as Record<string, unknown>;
        return !!(fmOrMeta.outcomeMetrics || fmOrMeta.applications || fmOrMeta.environmentalImpact || fmOrMeta.faq);
      }
    });
    this.register('Event', generateEventSchema, {
      priority: 50,
      condition: (data) => !!data.eventData
    });
    this.register('AggregateRating', generateAggregateRatingSchema, {
      priority: 45,
      condition: (data) => !!(data.reviews || data.testimonials)
    });
    this.register('VideoObject', generateVideoObjectSchema, {
      priority: 40,
      condition: (data) => {
        // Always include video for material pages (default video: t8fB3tJCfQw)
        const fm = data.frontmatter as Record<string, unknown> | undefined;
        const isMaterialPage = fm?.materialProperties || fm?.category;
        return !!(data.video || data.youtubeUrl || fm?.video || isMaterialPage);
      }
    });
    this.register('ImageObject', generateImageObjectSchema, {
      priority: 35,
      condition: (data) => {
        const fm = data.frontmatter as Record<string, unknown> | undefined;
        return !!(data.images || fm?.images);
      }
    });
    this.register('ContactPoint', generateContactPointSchema, {
      priority: 30,
      condition: (data) => !!data.contactPoint
    });

    // E-E-A-T schemas
    this.register('Person', generatePersonSchema, {
      priority: 25,
      condition: (data) => !!(data.frontmatter?.author || data.author)
    });
    this.register('Dataset', generateDatasetSchema, {
      priority: 20,
      condition: (data) => {
        const fm = data.frontmatter as Record<string, unknown> | undefined;
        return !!fm?.materialProperties;
      }
    });
    this.register('Certification', generateCertificationSchema, {
      priority: 15,
      condition: (data) => {
        const fm = data.frontmatter as Record<string, unknown> | undefined;
        return !!fm?.regulatoryStandards;
      }
    });

    // Collection schemas
    this.register('ItemList', generateItemListSchema, {
      priority: 10,
      condition: (data) => hasMultipleProducts(data) || hasMultipleServices(data)
    });
    this.register('CollectionPage', generateCollectionPageSchema, {
      priority: 5,
      condition: (data) => hasOrganizations(data)
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get generated schema by name
   */
  getSchema(name: string): any | null {
    return this.cache.get(name) || null;
  }
}

// ============================================================================
// Condition Helpers
// ============================================================================

function hasProductData(data: any): boolean {
  const fm = data.frontmatter as Record<string, unknown> | undefined;
  return !!(
    data.needle100_150 ||
    data.needle200_300 ||
    data.jangoSpecs ||
    fm?.materialProperties ||
    data.products
  );
}

function hasServiceData(data: any): boolean {
  const title = typeof data.title === 'string' ? data.title : '';
  return !!(
    data.services ||
    data.serviceOfferings ||
    (data.contentCards && title.toLowerCase().includes('service'))
  );
}

function hasMultipleProducts(data: any): boolean {
  const productCount = [
    data.needle100_150,
    data.needle200_300,
    data.jangoSpecs
  ].filter(Boolean).length;
  const products = Array.isArray(data.products) ? data.products : [];
  return productCount > 1 || products.length > 1;
}

function hasMultipleServices(data: any): boolean {
  const services = Array.isArray(data.services) ? data.services : [];
  return services.length > 1;
}

function hasOrganizations(data: any): boolean {
  if (!data || !data.contentCards || !Array.isArray(data.contentCards)) return false;
  return data.contentCards.some((card: any) => 
    card && Array.isArray(card.details) && card.details.length > 0
  );
}

// ============================================================================
// Schema Generators
// ============================================================================

/**
 * WebPage Schema - Base schema for all pages
 */
function generateWebPageSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const { pageUrl, baseUrl } = context;
  
  // Extract metadata from various possible locations with type guards
  const metadata = (data.metadata || data.frontmatter || data.pageConfig || {}) as Record<string, unknown>;
  const title = (metadata.title as string) || (typeof data.title === 'string' ? data.title : '') || 'Z-Beam';
  const description = (metadata.description as string) || (typeof data.description === 'string' ? data.description : '') || '';
  
  return {
    '@context': 'https://schema.org',
    '@type': hasOrganizations(data) ? 'CollectionPage' : 'WebPage',
    '@id': `${pageUrl}#webpage`,
    'url': pageUrl,
    'name': title,
    'description': description,
    'inLanguage': 'en-US',
    'isPartOf': {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
      'url': baseUrl,
      'name': SITE_CONFIG.name,
      'publisher': {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        'name': SITE_CONFIG.name
      }
    },
    'datePublished': (metadata.datePublished as string) || (data.datePublished as string) || context.currentDate,
    'dateModified': (metadata.dateModified as string) || (data.lastModified as string) || context.currentDate,
    ...(metadata.keywords ? { 'keywords': Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : metadata.keywords } : {}),
    ...(getMainImage(data) ? { 'image': getMainImage(data) } : {})
  };
}

/**
 * BreadcrumbList Schema
 * Uses the centralized generateBreadcrumbs utility for consistency
 */
function generateBreadcrumbSchema(data: any, context: SchemaContext): SchemaOrgBase {
  const { pageUrl, baseUrl, slug } = context;
  
  // Construct pathname from slug
  const pathname = slug ? `/${slug}` : '/';
  
  // Extract frontmatter from various data structures
  const frontmatter = data.frontmatter || data.metadata || data.pageConfig || data;
  
  // Use the centralized breadcrumb generation utility
  const breadcrumbItems = generateBreadcrumbs(frontmatter, pathname);
  
  // Convert to Schema.org format
  const itemListElement = breadcrumbItems.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.label,
    'item': `${baseUrl}${item.href}`
  }));

  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    'itemListElement': itemListElement
  };
}

/**
 * Organization Schema - Enhanced with E-E-A-T signals
 */
function generateOrganizationSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const { baseUrl } = context;
  
  // For partner organizations
  if (hasOrganizations(data) && data.contentCards) {
    const organizations: any[] = [];
    
    data.contentCards.forEach((card: any, index: number) => {
      if (!Array.isArray(card.details) || card.details.length === 0) return;
      
      const extractDetail = (prefix: string): string => {
        const detail = card.details?.find((d: string) => d.startsWith(prefix));
        return detail ? detail.replace(prefix, '').trim() : '';
      };

      const location = extractDetail('Location:');
      const region = extractDetail('Region:');
      const specialization = extractDetail('Specialization:');
      const websiteUrl = extractDetail('Website:');
      const equipmentSpecs = extractDetail('Equipment Specifications:');
      
      const fullUrl = websiteUrl 
        ? (websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
        : undefined;

      const org: any = {
        '@type': 'Organization',
        '@id': `${context.pageUrl}#organization-${index + 1}`,
        'name': card.heading,
        'description': card.text,
        'memberOf': {
          '@type': 'Organization',
          'name': SITE_CONFIG.name,
          'url': baseUrl
        }
      };

      if (fullUrl) org.url = fullUrl;
      
      if (card.image?.url) {
        org.logo = {
          '@type': 'ImageObject',
          'url': `${baseUrl}${card.image.url}`,
          'caption': card.image.alt || card.heading
        };
      }

      if (location || region) {
        org.address = {
          '@type': 'PostalAddress',
          ...(location && { addressLocality: location }),
          ...(region && { addressRegion: region })
        };
      }

      if (region) {
        org.areaServed = {
          '@type': 'Place',
          'name': region
        };
      }

      if (specialization) org.knowsAbout = specialization;
      
      if (equipmentSpecs) {
        org.makesOffer = {
          '@type': 'Offer',
          'description': 'Laser cleaning equipment and services',
          'url': equipmentSpecs.startsWith('http') ? equipmentSpecs : `${baseUrl}${equipmentSpecs}`
        };
      }

      organizations.push(org);
    });

    return organizations.length > 0 ? (organizations as any) : null;
  }

  // Main organization
  return {
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    'name': SITE_CONFIG.name,
    'url': baseUrl,
    'description': SITE_CONFIG.description
  };
}

/**
 * Article/TechnicalArticle Schema - Enhanced with E-E-A-T signals
 */
function generateArticleSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = data.frontmatter || data.metadata || {};
  const { pageUrl, baseUrl, currentDate } = context;
  
  const title = frontmatter.title || data.title || '';
  const description = frontmatter.description || data.description || '';
  
  if (!title) return null;

  // Enhanced author with E-E-A-T credentials
  const author = frontmatter.author || {};
  const enhancedAuthor = generatePersonObject(author, baseUrl);
  
  // Add E-E-A-T signals to author
  if (typeof enhancedAuthor === 'object' && enhancedAuthor['@type'] === 'Person') {
    // Add jobTitle if available
    if (author.title) {
      enhancedAuthor.jobTitle = author.title;
    }
    
    // Add affiliation (worksFor)
    if (!enhancedAuthor.worksFor) {
      enhancedAuthor.worksFor = {
        '@type': 'Organization',
        'name': SITE_CONFIG.name,
        'url': baseUrl
      };
    }
    
    // Add expertise areas (knowsAbout)
    if (author.expertise) {
      enhancedAuthor.knowsAbout = author.expertise;
    } else if (frontmatter.applications && frontmatter.applications.length > 0) {
      // Use material applications as expertise areas
      enhancedAuthor.knowsAbout = frontmatter.applications.join(', ');
    }
    
    // Add country/nationality for geographic authority
    if (author.country) {
      enhancedAuthor.nationality = author.country;
    }
  }

  return {
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    'headline': title,
    'description': description,
    'articleSection': 'Technical',
    'url': pageUrl,
    'datePublished': frontmatter.datePublished || currentDate,
    'dateModified': frontmatter.dateModified || currentDate,
    'inLanguage': 'en-US',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    'author': enhancedAuthor,
    'publisher': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/images/favicon/favicon-350.png`
      }
    },
    ...(getMainImage(data) && { 'image': getMainImage(data) }),
    ...(frontmatter.applications && {
      'about': frontmatter.applications.map((app: string) => ({
        '@type': 'Thing',
        'name': app
      }))
    }),
    // E-E-A-T: Add expertise indicators
    ...(frontmatter.subtitle && { 'abstract': frontmatter.subtitle }),
    ...(frontmatter.keywords && { 'keywords': Array.isArray(frontmatter.keywords) ? frontmatter.keywords.join(', ') : frontmatter.keywords })
  };
}

/**
 * Product Schema - Enhanced for equipment
 */
function generateProductSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const { pageUrl, baseUrl } = context;
  const products: any[] = [];

  // Equipment products
  ['needle100_150', 'needle200_300', 'jangoSpecs'].forEach(key => {
    if (!data[key]) return;
    
    const productData = data[key];
    products.push({
      '@type': 'Product',
      '@id': `${pageUrl}#product-${key}`,
      'name': productData.name || key,
      'description': productData.description || `Laser cleaning equipment: ${key}`,
      'category': productData.category || 'Laser Cleaning Equipment',
      'brand': {
        '@type': 'Brand',
        'name': 'Netalux'
      },
      'manufacturer': {
        '@type': 'Organization',
        'name': 'Netalux'
      },
      'offers': {
        '@type': 'Offer',
        'availability': 'https://schema.org/InStock',
        'seller': {
          '@type': 'Organization',
          'name': SITE_CONFIG.name,
          'url': baseUrl
        }
      },
      ...(productData.image && {
        'image': {
          '@type': 'ImageObject',
          'url': `${baseUrl}${productData.image}`
        }
      })
    });
  });

  // Material products
  const frontmatter = data.frontmatter || {};
  if (frontmatter.materialProperties) {
    products.push({
      '@type': 'Product',
      '@id': `${pageUrl}#material-product`,
      'name': frontmatter.name || data.title || 'Material',
      'description': frontmatter.description || data.description || '',
      'category': frontmatter.category || 'Material',
      'brand': {
        '@type': 'Brand',
        'name': SITE_CONFIG.name
      }
    });
  }

  return products.length === 1 ? products[0] : (products.length > 1 ? (products as any) : null);
}

/**
 * Service Schema - NEW
 */
function generateServiceSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const { pageUrl, baseUrl } = context;
  
  if (!hasServiceData(data)) return null;

  const services = data.services || data.serviceOfferings || [];
  
  if (services.length === 0) {
    // Single service page
    return {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      'name': data.title || 'Laser Cleaning Service',
      'description': data.description || '',
      'provider': {
        '@type': 'Organization',
        'name': SITE_CONFIG.name,
        'url': baseUrl
      },
      'areaServed': {
        '@type': 'Place',
        'name': data.serviceArea || 'North America'
      },
      'serviceType': 'Laser Cleaning',
      ...(data.image && {
        'image': {
          '@type': 'ImageObject',
          'url': `${baseUrl}${data.image}`
        }
      })
    };
  }

  // Multiple services
  return services.map((service: any, index: number) => ({
    '@type': 'Service',
    '@id': `${pageUrl}#service-${index + 1}`,
    'name': service.name || service.title,
    'description': service.description || '',
    'provider': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl
    }
  }));
}

/**
 * LocalBusiness Schema - NEW
 */
function generateLocalBusinessSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const { baseUrl } = context;
  
  if (!data.businessInfo?.geo && !data.contactPoint) return null;

  return {
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}#local-business`,
    'name': SITE_CONFIG.name,
    'description': SITE_CONFIG.description,
    'url': baseUrl,
    ...(data.businessInfo?.geo && {
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': data.businessInfo.geo.latitude,
        'longitude': data.businessInfo.geo.longitude
      }
    }),
    ...(data.businessInfo?.address && {
      'address': {
        '@type': 'PostalAddress',
        ...data.businessInfo.address
      }
    }),
    ...(data.contactPoint && {
      'contactPoint': generateContactPointObject(data.contactPoint)
    })
  };
}

/**
 * Course Schema - NEW
 */
function generateCourseSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const courseData = data.courseData || data.trainingData;
  if (!courseData) return null;

  const { pageUrl, baseUrl } = context;

  return {
    '@type': 'Course',
    '@id': `${pageUrl}#course`,
    'name': courseData.name || courseData.title,
    'description': courseData.description || '',
    'provider': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl
    },
    ...(courseData.duration && { 'timeRequired': courseData.duration }),
    ...(courseData.skillLevel && { 'educationalLevel': courseData.skillLevel }),
    ...(courseData.topics && {
      'about': courseData.topics.map((topic: string) => ({
        '@type': 'Thing',
        'name': topic
      }))
    })
  };
}

/**
 * Event Schema - NEW
 */
function generateEventSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const eventData = data.eventData;
  if (!eventData) return null;

  const { pageUrl, baseUrl } = context;

  return {
    '@type': 'Event',
    '@id': `${pageUrl}#event`,
    'name': eventData.name,
    'description': eventData.description || '',
    'startDate': eventData.startDate,
    ...(eventData.endDate && { 'endDate': eventData.endDate }),
    'eventStatus': 'https://schema.org/EventScheduled',
    'eventAttendanceMode': eventData.isOnline 
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    'organizer': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl
    },
    ...(eventData.location && {
      'location': {
        '@type': 'Place',
        'name': eventData.location
      }
    })
  };
}

/**
 * AggregateRating Schema - NEW
 */
function generateAggregateRatingSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const reviews = data.reviews || data.testimonials;
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return null;

  const ratings = reviews.map((r: any) => r.rating).filter((r: number) => r && r > 0);
  if (ratings.length === 0) return null;

  const avgRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;

  return {
    '@type': 'AggregateRating',
    '@id': `${context.pageUrl}#rating`,
    'ratingValue': avgRating.toFixed(1),
    'reviewCount': reviews.length,
    'bestRating': '5',
    'worstRating': '1'
  };
}

/**
 * HowTo Schema
 */
function generateHowToSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = data.frontmatter || {};
  const machineSettings = frontmatter.machineSettings;
  
  if (!machineSettings || Object.keys(machineSettings).length === 0) return null;

  const { pageUrl } = context;
  const materialName = frontmatter.name || data.title || 'material';

  const steps = Object.entries(machineSettings).map(([key, value], index) => ({
    '@type': 'HowToStep',
    'position': index + 1,
    'name': formatLabel(key),
    'text': `Set ${formatLabel(key)} to ${value}`
  }));

  return {
    '@type': 'HowTo',
    '@id': `${pageUrl}#howto`,
    'name': `How to laser clean ${materialName}`,
    'description': `Step-by-step process for laser cleaning ${materialName}`,
    'step': steps
  };
}

/**
 * FAQ Schema - Enhanced to handle both explicit FAQs and auto-generated from frontmatter
 */
function generateFAQSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = data.frontmatter || data.metadata || {};
  const faqs: any[] = [];

  // Custom FAQs - check multiple possible locations (prioritize explicit FAQs)
  const faqData = frontmatter.faq || data.metadata?.faq || data.faq;
  if (faqData && Array.isArray(faqData) && faqData.length > 0) {
    faqData.forEach((item: any) => {
      if (item.question && item.answer) {
        faqs.push({
          '@type': 'Question',
          'name': item.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': item.answer
          }
        });
      }
    });
  }

  // Only auto-generate FAQs if no explicit FAQs exist
  if (faqs.length === 0) {
    // Generate FAQs from applications
    if (frontmatter.applications && Array.isArray(frontmatter.applications) && frontmatter.applications.length > 0) {
      faqs.push({
        '@type': 'Question',
        'name': `What can laser cleaning be used for on ${frontmatter.name || 'this material'}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Laser cleaning is effective for: ${frontmatter.applications.join(', ')}`
        }
      });
    }

    // Generate FAQs from environmental impact
    if (frontmatter.environmentalImpact && Array.isArray(frontmatter.environmentalImpact) && frontmatter.environmentalImpact.length > 0) {
      // Extract benefit descriptions if environmentalImpact is array of objects
      const benefits = frontmatter.environmentalImpact.map((item: any) => {
        if (typeof item === 'string') return item;
        if (item.benefit) return item.benefit;
        if (item.description) return item.description;
        return null;
      }).filter(Boolean);
      
      if (benefits.length > 0) {
        faqs.push({
          '@type': 'Question',
          'name': 'What are the environmental benefits?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': `Environmental benefits include: ${benefits.join(', ')}`
          }
        });
      }
    }
  }

  if (faqs.length === 0) return null;

  return {
    '@type': 'FAQPage',
    '@id': `${context.pageUrl}#faq`,
    'mainEntity': faqs
  };
}

/**
 * VideoObject Schema - Enhanced for material demonstrations
 */
function generateVideoObjectSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = data.frontmatter || data.metadata || {};
  
  // Check for explicit video URL or use default YouTube video
  const videoUrl = data.video || data.youtubeUrl || frontmatter.video;
  const youtubeId = videoUrl || 't8fB3tJCfQw'; // Default demo video
  
  // Always include video schema for material pages
  const isMaterialPage = frontmatter.materialProperties || frontmatter.category;
  
  if (!videoUrl && !isMaterialPage) return null;

  const embedUrl = youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')
    ? youtubeId
    : `https://www.youtube.com/watch?v=${youtubeId}`;
  
  const thumbnailUrl = youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')
    ? `https://img.youtube.com/vi/${youtubeId.split('/').pop()?.split('?')[0]}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

  // Enhanced material-specific video title and description
  const materialName = frontmatter.name || frontmatter.subject || data.title || 'this material';
  const videoTitle = `${materialName} Laser Cleaning - Professional Demonstration`;
  const videoDescription = frontmatter.description 
    ? `See how laser cleaning effectively processes ${materialName}. ${frontmatter.description}`
    : `Professional demonstration of laser cleaning process for ${materialName}. Watch how our advanced laser technology safely and effectively removes contaminants without damaging the material surface.`;

  return {
    '@type': 'VideoObject',
    '@id': `${context.pageUrl}#video`,
    'name': videoTitle,
    'description': videoDescription,
    'contentUrl': embedUrl,
    'embedUrl': `https://www.youtube.com/embed/${youtubeId}`,
    'uploadDate': data.videoUploadDate || '2024-01-15',
    'thumbnailUrl': data.videoThumbnail || thumbnailUrl,
    'duration': 'PT2M30S',
    'publisher': {
      '@type': 'Organization',
      'name': 'Z-Beam Laser Cleaning',
      'url': SITE_CONFIG.url,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_CONFIG.url}/images/favicon/favicon-350.png`
      }
    },
    // E-E-A-T: Add subject matter for context
    ...(frontmatter.category && {
      'about': {
        '@type': 'Thing',
        'name': `${frontmatter.category} laser cleaning`
      }
    })
  };
}

/**
 * ImageObject Schema - Enhanced with License Metadata
 * Implements Google's image license structured data
 * Uses page author as default creator if not explicitly specified
 * Uses caption.beforeText for image descriptions
 * @see https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
 */
function generateImageObjectSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const mainImage = getMainImage(data);
  if (!mainImage) return null;

  // Get caption from multiple sources (priority order)
  const caption = mainImage.caption 
    || data.frontmatter?.caption?.beforeText 
    || data.caption?.beforeText
    || data.title 
    || '';

  const imageObject: any = {
    '@type': 'ImageObject',
    '@id': `${context.pageUrl}#image`,
    'url': mainImage.url,
    'caption': caption,
    ...(mainImage.width && { 'width': mainImage.width }),
    ...(mainImage.height && { 'height': mainImage.height })
  };

  // Add license metadata if available
  if (mainImage.license) {
    imageObject.license = mainImage.license;
  }
  
  if (mainImage.acquireLicensePage) {
    imageObject.acquireLicensePage = mainImage.acquireLicensePage;
  }
  
  // Use creditText from image, or fall back to caption.description for micro images
  if (mainImage.creditText) {
    imageObject.creditText = mainImage.creditText;
  } else if (mainImage.isMicro && (data.frontmatter?.caption?.description || data.caption?.description)) {
    imageObject.creditText = data.frontmatter?.caption?.description || data.caption?.description;
  }
  
  // Use image creator if specified, otherwise fall back to page author
  if (mainImage.creator) {
    imageObject.creator = typeof mainImage.creator === 'string'
      ? { '@type': 'Person', 'name': mainImage.creator }
      : mainImage.creator;
  } else {
    // Use page author as creator if available
    const author = data.frontmatter?.author || data.author;
    if (author && author.name) {
      imageObject.creator = {
        '@type': 'Person',
        'name': author.name,
        ...(author.url && { 'url': author.url })
      };
    }
  }
  
  if (mainImage.copyrightNotice) {
    imageObject.copyrightNotice = mainImage.copyrightNotice;
  }

  return imageObject;
}

/**
 * ContactPoint Schema - NEW
 */
function generateContactPointSchema(data: any, _context: SchemaContext): SchemaOrgBase | null {
  if (!data.contactPoint) return null;

  return generateContactPointObject(data.contactPoint);
}

/**
 * Person Schema - Enhanced with E-E-A-T
 */
function generatePersonSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const author = data.frontmatter?.author || data.author;
  if (!author) return null;

  return generatePersonObject(author, context.baseUrl);
}

/**
 * Dataset Schema
 */
function generateDatasetSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = data.frontmatter || {};
  if (!frontmatter.materialProperties && !frontmatter.machineSettings) return null;

  const { pageUrl, slug } = context;
  
  // Extract material slug from the full slug path (e.g., "materials/metal/non-ferrous/titanium" -> "titanium")
  const materialSlug = slug.split('/').pop() || slug;
  
  // Check if slug already ends with "-laser-cleaning"
  const datasetName = materialSlug.endsWith('-laser-cleaning') 
    ? materialSlug 
    : `${materialSlug}-laser-cleaning`;

  return {
    '@type': 'Dataset',
    '@id': `${pageUrl}#dataset`,
    'name': `${frontmatter.name || 'Material'} Laser Cleaning Dataset`,
    'description': `Comprehensive laser cleaning parameters and material properties for ${frontmatter.name || 'material'}`,
    'version': '1.0',
    'license': 'https://creativecommons.org/licenses/by/4.0/',
    'creator': {
      '@type': 'Organization',
      'name': 'Z-Beam Laser Cleaning',
      'url': SITE_CONFIG.url
    },
    'distribution': [
      {
        '@type': 'DataDownload',
        'encodingFormat': 'application/json',
        'contentUrl': `${SITE_CONFIG.url}/datasets/materials/${datasetName}.json`,
        'name': 'JSON Dataset'
      },
      {
        '@type': 'DataDownload',
        'encodingFormat': 'text/csv',
        'contentUrl': `${SITE_CONFIG.url}/datasets/materials/${datasetName}.csv`,
        'name': 'CSV Dataset'
      },
      {
        '@type': 'DataDownload',
        'encodingFormat': 'text/plain',
        'contentUrl': `${SITE_CONFIG.url}/datasets/materials/${datasetName}.txt`,
        'name': 'Plain Text Dataset'
      }
    ],
    'temporalCoverage': '2025',
    'spatialCoverage': {
      '@type': 'Place',
      'name': 'Global'
    }
  };
}

/**
 * Certification Schema
 */
function generateCertificationSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const standards = data.frontmatter?.regulatoryStandards;
  if (!standards || !Array.isArray(standards) || standards.length === 0) return null;

  return standards.map((standard: string, index: number) => ({
    '@type': 'Certification',
    '@id': `${context.pageUrl}#cert-${index + 1}`,
    'name': standard,
    'about': 'Regulatory compliance for laser cleaning'
  })) as any;
}

/**
 * ItemList Schema
 */
function generateItemListSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const { pageUrl } = context;
  const products = generateProductSchema(data, context);
  const services = generateServiceSchema(data, context);
  
  const items: any[] = [];
  
  if (Array.isArray(products)) {
    items.push(...products);
  } else if (products) {
    items.push(products);
  }
  
  if (Array.isArray(services)) {
    items.push(...services);
  } else if (services) {
    items.push(services);
  }

  if (items.length < 2) return null;

  return {
    '@type': 'ItemList',
    '@id': `${pageUrl}#itemlist`,
    'name': `${data.title || 'Items'} - Complete List`,
    'numberOfItems': items.length,
    'itemListElement': items.map((item: any, index: number) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': item
    }))
  };
}

/**
 * CollectionPage Schema
 */
function generateCollectionPageSchema(data: any, _context: SchemaContext): SchemaOrgBase | null {
  if (!hasOrganizations(data)) return null;

  // This is handled by modifying WebPage @type
  // Returns null as it's a type change, not a separate schema
  return null;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getMainImage(data: any): any | null {
  // From contentCards
  if (data.contentCards && Array.isArray(data.contentCards)) {
    const cardWithImage = data.contentCards.find((card: any) => card.image?.url);
    if (cardWithImage) {
      return {
        '@type': 'ImageObject',
        'url': `${SITE_CONFIG.url}${cardWithImage.image.url}`,
        'caption': cardWithImage.image.alt || data.frontmatter?.caption?.beforeText || data.caption?.beforeText || data.title
      };
    }
  }

  // From frontmatter images - prioritize hero, then micro
  const frontmatter = data.frontmatter || {};
  
  if (frontmatter.images?.hero?.url) {
    const hero = frontmatter.images.hero;
    return {
      '@type': 'ImageObject',
      'url': `${SITE_CONFIG.url}${hero.url}`,
      'caption': hero.alt || frontmatter.caption?.beforeText || data.caption?.beforeText || data.title,
      'isMicro': false,
      // Pass through license metadata if present
      ...(hero.license && { 'license': hero.license }),
      ...(hero.acquireLicensePage && { 'acquireLicensePage': hero.acquireLicensePage }),
      ...(hero.creditText && { 'creditText': hero.creditText }),
      ...(hero.creator && { 'creator': hero.creator }),
      ...(hero.copyrightNotice && { 'copyrightNotice': hero.copyrightNotice }),
      ...(hero.width && { 'width': hero.width }),
      ...(hero.height && { 'height': hero.height })
    };
  }
  
  // Fallback to micro image if no hero
  if (frontmatter.images?.micro?.url) {
    const micro = frontmatter.images.micro;
    return {
      '@type': 'ImageObject',
      'url': `${SITE_CONFIG.url}${micro.url}`,
      'caption': micro.alt || frontmatter.caption?.beforeText || data.caption?.beforeText || data.title,
      'isMicro': true,
      // Pass through license metadata if present
      ...(micro.license && { 'license': micro.license }),
      ...(micro.acquireLicensePage && { 'acquireLicensePage': micro.acquireLicensePage }),
      ...(micro.creditText && { 'creditText': micro.creditText }),
      ...(micro.creator && { 'creator': micro.creator }),
      ...(micro.copyrightNotice && { 'copyrightNotice': micro.copyrightNotice }),
      ...(micro.width && { 'width': micro.width }),
      ...(micro.height && { 'height': micro.height })
    };
  }

  // Direct image property
  if (data.image) {
    return {
      '@type': 'ImageObject',
      'url': typeof data.image === 'string' ? data.image : `${SITE_CONFIG.url}${data.image.url}`,
      'caption': data.frontmatter?.caption?.beforeText || data.caption?.beforeText || data.title
    };
  }

  return null;
}

function generatePersonObject(author: any, _baseUrl: string): any {
  if (!author) {
    return {
      '@type': 'Person',
      'name': SITE_CONFIG.author || 'Z-Beam Expert'
    };
  }

  if (typeof author === 'string') {
    return {
      '@type': 'Person',
      'name': author
    };
  }

  const personObj: any = {
    '@type': 'Person',
    'name': author.name || 'Expert',
    // E-E-A-T: Add professional credentials
    ...(author.jobTitle && { 'jobTitle': author.jobTitle }),
    ...(author.title && !author.jobTitle && { 'jobTitle': author.title }), // Use title as jobTitle if jobTitle not set
    ...(author.email && { 'email': author.email }),
    ...(author.url && { 'url': author.url }),
    // E-E-A-T: Add organizational affiliation
    ...(author.affiliation && {
      'affiliation': {
        '@type': 'Organization',
        'name': author.affiliation
      }
    }),
    // E-E-A-T: Add expertise areas
    ...(author.expertise && { 'knowsAbout': author.expertise }),
    // E-E-A-T: Add geographic authority
    ...(author.country && { 'nationality': author.country })
  };

  // E-E-A-T: Add sameAs links for authority
  if (author.sameAs || author.socialProfiles) {
    personObj.sameAs = author.sameAs || author.socialProfiles;
  }

  // E-E-A-T: Add credentials/qualifications
  if (author.credentials || author.qualifications) {
    if (!personObj.knowsAbout) {
      personObj.knowsAbout = author.credentials || author.qualifications;
    }
  }

  return personObj;
}

function generateContactPointObject(contactPoint: any): any {
  return {
    '@type': 'ContactPoint',
    'contactType': contactPoint.contactType || 'customer service',
    ...(contactPoint.telephone && { 'telephone': contactPoint.telephone }),
    ...(contactPoint.email && { 'email': contactPoint.email }),
    ...(contactPoint.areaServed && { 'areaServed': contactPoint.areaServed }),
    ...(contactPoint.availableLanguage && { 'availableLanguage': contactPoint.availableLanguage })
  };
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// ============================================================================
// Exports
// ============================================================================

export {
  generateWebPageSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateArticleSchema,
  generateProductSchema,
  generateServiceSchema,
  generateLocalBusinessSchema,
  generateCourseSchema,
  generateEventSchema,
  generateAggregateRatingSchema,
  generateHowToSchema,
  generateFAQSchema,
  generateVideoObjectSchema,
  generateImageObjectSchema,
  generateContactPointSchema,
  generatePersonSchema,
  generateDatasetSchema,
  generateCertificationSchema,
  generateItemListSchema,
  generateCollectionPageSchema
};
