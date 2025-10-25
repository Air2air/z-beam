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

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SchemaContext {
  slug: string;
  baseUrl: string;
  pageUrl: string;
  currentDate: string;
}

export interface SchemaGeneratorOptions {
  priority?: number;
  required?: boolean;
  condition?: (data: any, context: SchemaContext) => boolean;
}

export type SchemaGenerator = (
  data: any,
  context: SchemaContext,
  options?: SchemaGeneratorOptions
) => any | null;

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
  private data: any;
  private context: SchemaContext;
  private registry: SchemaRegistry = {};
  private cache: Map<string, any> = new Map();

  constructor(data: any, slug: string, baseUrl?: string) {
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
  generate(): any {
    const schemas: any[] = [];

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
      '@graph': schemas.filter(Boolean)
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
      condition: (data) => data.frontmatter?.category || data.metadata?.category
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
      condition: (data) => data.courseData || data.trainingData
    });

    // Supporting schemas
    this.register('LocalBusiness', generateLocalBusinessSchema, {
      priority: 65,
      condition: (data) => data.businessInfo?.geo || data.contactPoint
    });
    this.register('HowTo', generateHowToSchema, {
      priority: 60,
      condition: (data) => data.frontmatter?.machineSettings || data.steps
    });
    this.register('FAQ', generateFAQSchema, {
      priority: 55,
      condition: (data) => data.faq || data.frontmatter?.outcomeMetrics
    });
    this.register('Event', generateEventSchema, {
      priority: 50,
      condition: (data) => data.eventData
    });
    this.register('AggregateRating', generateAggregateRatingSchema, {
      priority: 45,
      condition: (data) => data.reviews || data.testimonials
    });
    this.register('VideoObject', generateVideoObjectSchema, {
      priority: 40,
      condition: (data) => data.video || data.youtubeUrl
    });
    this.register('ImageObject', generateImageObjectSchema, {
      priority: 35,
      condition: (data) => data.images || data.frontmatter?.images
    });
    this.register('ContactPoint', generateContactPointSchema, {
      priority: 30,
      condition: (data) => data.contactPoint
    });

    // E-E-A-T schemas
    this.register('Person', generatePersonSchema, {
      priority: 25,
      condition: (data) => data.frontmatter?.author || data.author
    });
    this.register('Dataset', generateDatasetSchema, {
      priority: 20,
      condition: (data) => data.frontmatter?.materialProperties
    });
    this.register('Certification', generateCertificationSchema, {
      priority: 15,
      condition: (data) => data.frontmatter?.regulatoryStandards
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
  return !!(
    data.needle100_150 ||
    data.needle200_300 ||
    data.jangoSpecs ||
    data.frontmatter?.materialProperties ||
    data.products
  );
}

function hasServiceData(data: any): boolean {
  return !!(
    data.services ||
    data.serviceOfferings ||
    (data.contentCards && data.title?.toLowerCase().includes('service'))
  );
}

function hasMultipleProducts(data: any): boolean {
  const productCount = [
    data.needle100_150,
    data.needle200_300,
    data.jangoSpecs
  ].filter(Boolean).length;
  return productCount > 1 || (data.products && data.products.length > 1);
}

function hasMultipleServices(data: any): boolean {
  return data.services && Array.isArray(data.services) && data.services.length > 1;
}

function hasOrganizations(data: any): boolean {
  if (!data.contentCards || !Array.isArray(data.contentCards)) return false;
  return data.contentCards.some((card: any) => 
    Array.isArray(card.details) && card.details.length > 0
  );
}

// ============================================================================
// Schema Generators
// ============================================================================

/**
 * WebPage Schema - Base schema for all pages
 */
function generateWebPageSchema(data: any, context: SchemaContext): any {
  const { pageUrl, baseUrl } = context;
  
  return {
    '@type': hasOrganizations(data) ? 'CollectionPage' : 'WebPage',
    '@id': `${pageUrl}#webpage`,
    'url': pageUrl,
    'name': data.title || data.pageConfig?.title || 'Z-Beam',
    'description': data.description || data.pageConfig?.description || '',
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
    'datePublished': data.datePublished || data.pageConfig?.datePublished || context.currentDate,
    'dateModified': data.lastModified || data.pageConfig?.lastModified || context.currentDate,
    ...(data.keywords && { 'keywords': Array.isArray(data.keywords) ? data.keywords.join(', ') : data.keywords }),
    ...(getMainImage(data) && { 'image': getMainImage(data) })
  };
}

/**
 * BreadcrumbList Schema
 */
function generateBreadcrumbSchema(data: any, context: SchemaContext): any {
  const { pageUrl, baseUrl, slug } = context;
  const category = data.frontmatter?.category || data.category || data.pageConfig?.category;
  const title = data.title || data.pageConfig?.title || slug;

  const items = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': baseUrl
    }
  ];

  if (category) {
    items.push({
      '@type': 'ListItem',
      'position': 2,
      'name': category.charAt(0).toUpperCase() + category.slice(1),
      'item': `${baseUrl}/${category}`
    });
  }

  items.push({
    '@type': 'ListItem',
    'position': items.length + 1,
    'name': title,
    'item': pageUrl
  });

  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    'itemListElement': items
  };
}

/**
 * Organization Schema - Enhanced with E-E-A-T signals
 */
function generateOrganizationSchema(data: any, context: SchemaContext): any | null {
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

    return organizations.length > 0 ? organizations : null;
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
 * Article/TechnicalArticle Schema
 */
function generateArticleSchema(data: any, context: SchemaContext): any | null {
  const frontmatter = data.frontmatter || data.metadata || {};
  const { pageUrl, baseUrl, currentDate } = context;
  
  const title = frontmatter.title || data.title || '';
  const description = frontmatter.description || data.description || '';
  
  if (!title) return null;

  return {
    '@type': 'TechnicalArticle',
    '@id': `${pageUrl}#article`,
    'headline': title,
    'description': description,
    'url': pageUrl,
    'datePublished': frontmatter.datePublished || currentDate,
    'dateModified': frontmatter.dateModified || currentDate,
    'inLanguage': 'en-US',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    'author': generatePersonObject(frontmatter.author, baseUrl),
    'publisher': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl
    },
    ...(getMainImage(data) && { 'image': getMainImage(data) }),
    ...(frontmatter.applications && {
      'about': frontmatter.applications.map((app: string) => ({
        '@type': 'Thing',
        'name': app
      }))
    })
  };
}

/**
 * Product Schema - Enhanced for equipment
 */
function generateProductSchema(data: any, context: SchemaContext): any | null {
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

  return products.length === 1 ? products[0] : (products.length > 1 ? products : null);
}

/**
 * Service Schema - NEW
 */
function generateServiceSchema(data: any, context: SchemaContext): any | null {
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
function generateLocalBusinessSchema(data: any, context: SchemaContext): any | null {
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
function generateCourseSchema(data: any, context: SchemaContext): any | null {
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
function generateEventSchema(data: any, context: SchemaContext): any | null {
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
function generateAggregateRatingSchema(data: any, context: SchemaContext): any | null {
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
function generateHowToSchema(data: any, context: SchemaContext): any | null {
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
 * FAQ Schema
 */
function generateFAQSchema(data: any, context: SchemaContext): any | null {
  const frontmatter = data.frontmatter || {};
  const faqs: any[] = [];

  // Generate FAQs from frontmatter
  if (frontmatter.applications && frontmatter.applications.length > 0) {
    faqs.push({
      '@type': 'Question',
      'name': `What can laser cleaning be used for on ${frontmatter.name || 'this material'}?`,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `Laser cleaning is effective for: ${frontmatter.applications.join(', ')}`
      }
    });
  }

  if (frontmatter.environmentalImpact && frontmatter.environmentalImpact.length > 0) {
    faqs.push({
      '@type': 'Question',
      'name': 'What are the environmental benefits?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `Environmental benefits include: ${frontmatter.environmentalImpact.join(', ')}`
      }
    });
  }

  // Custom FAQs
  if (data.faq && Array.isArray(data.faq)) {
    data.faq.forEach((item: any) => {
      faqs.push({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      });
    });
  }

  if (faqs.length === 0) return null;

  return {
    '@type': 'FAQPage',
    '@id': `${context.pageUrl}#faq`,
    'mainEntity': faqs
  };
}

/**
 * VideoObject Schema
 */
function generateVideoObjectSchema(data: any, context: SchemaContext): any | null {
  const videoUrl = data.video || data.youtubeUrl;
  if (!videoUrl) return null;

  return {
    '@type': 'VideoObject',
    '@id': `${context.pageUrl}#video`,
    'name': `${data.title || 'Video'} - Laser Cleaning Demonstration`,
    'description': data.description || `Demonstration of laser cleaning process`,
    'contentUrl': videoUrl,
    'uploadDate': data.videoUploadDate || context.currentDate,
    'thumbnailUrl': data.videoThumbnail || getMainImage(data)?.url
  };
}

/**
 * ImageObject Schema - Enhanced
 */
function generateImageObjectSchema(data: any, context: SchemaContext): any | null {
  const mainImage = getMainImage(data);
  if (!mainImage) return null;

  return {
    '@type': 'ImageObject',
    '@id': `${context.pageUrl}#image`,
    'url': mainImage.url,
    'caption': mainImage.caption || data.title || '',
    ...(mainImage.width && { 'width': mainImage.width }),
    ...(mainImage.height && { 'height': mainImage.height })
  };
}

/**
 * ContactPoint Schema - NEW
 */
function generateContactPointSchema(data: any, context: SchemaContext): any | null {
  if (!data.contactPoint) return null;

  return generateContactPointObject(data.contactPoint);
}

/**
 * Person Schema - Enhanced with E-E-A-T
 */
function generatePersonSchema(data: any, context: SchemaContext): any | null {
  const author = data.frontmatter?.author || data.author;
  if (!author) return null;

  return generatePersonObject(author, context.baseUrl);
}

/**
 * Dataset Schema
 */
function generateDatasetSchema(data: any, context: SchemaContext): any | null {
  const frontmatter = data.frontmatter || {};
  if (!frontmatter.materialProperties) return null;

  const { pageUrl } = context;

  return {
    '@type': 'Dataset',
    '@id': `${pageUrl}#dataset`,
    'name': `${frontmatter.name || 'Material'} Properties Data`,
    'description': 'Verified material properties for laser cleaning',
    'distribution': {
      '@type': 'DataDownload',
      'contentUrl': pageUrl
    }
  };
}

/**
 * Certification Schema
 */
function generateCertificationSchema(data: any, context: SchemaContext): any | null {
  const standards = data.frontmatter?.regulatoryStandards;
  if (!standards || !Array.isArray(standards) || standards.length === 0) return null;

  return standards.map((standard: string, index: number) => ({
    '@type': 'Certification',
    '@id': `${context.pageUrl}#cert-${index + 1}`,
    'name': standard,
    'about': 'Regulatory compliance for laser cleaning'
  }));
}

/**
 * ItemList Schema
 */
function generateItemListSchema(data: any, context: SchemaContext): any | null {
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
function generateCollectionPageSchema(data: any, context: SchemaContext): any | null {
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
        'caption': cardWithImage.image.alt || data.title
      };
    }
  }

  // From frontmatter images
  const frontmatter = data.frontmatter || {};
  if (frontmatter.images?.hero?.url) {
    return {
      '@type': 'ImageObject',
      'url': `${SITE_CONFIG.url}${frontmatter.images.hero.url}`,
      'caption': frontmatter.images.hero.alt || data.title
    };
  }

  // Direct image property
  if (data.image) {
    return {
      '@type': 'ImageObject',
      'url': typeof data.image === 'string' ? data.image : `${SITE_CONFIG.url}${data.image.url}`,
      'caption': data.title
    };
  }

  return null;
}

function generatePersonObject(author: any, baseUrl: string): any {
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
    ...(author.jobTitle && { 'jobTitle': author.jobTitle }),
    ...(author.email && { 'email': author.email }),
    ...(author.url && { 'url': author.url })
  };

  // E-E-A-T: Add sameAs links for authority
  if (author.sameAs || author.socialProfiles) {
    personObj.sameAs = author.sameAs || author.socialProfiles;
  }

  // E-E-A-T: Add credentials
  if (author.credentials || author.qualifications) {
    personObj.knowsAbout = author.credentials || author.qualifications;
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
