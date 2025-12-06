import 'server-only';

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
  getMetadata,
  hasProductData,
  hasMachineSettings,
  hasMaterialProperties,
  hasAuthor,
  hasFAQData,
  hasServiceData,
  hasMultipleProducts,
  hasMultipleServices,
  hasRegulatoryStandards,
  hasVideoData,
  hasImageData
} from './helpers';

// ============================================================================
// Types & Interfaces
// ============================================================================

import type { SchemaData, SchemaOrgBase, SchemaOrgGraph, SchemaContext, ServiceOffering } from './generators/types';

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

    // Debug: Log what we receive
    if (process.env.NODE_ENV === 'development' && slug.includes('alumina')) {
      const meta = getMetadata(data);
      console.log('[SchemaFactory Debug]', {
        slug,
        hasProductData: hasProductData(data),
        hasMachineSettings: hasMachineSettings(data),
        hasMaterialProperties: hasMaterialProperties(data),
        hasAuthor: hasAuthor(data),
        metadataKeys: meta ? Object.keys(meta).slice(0, 15) : [],
        materialPropertiesType: typeof meta.materialProperties,
        machineSettingsType: typeof meta.machineSettings
      });
    }

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
  generate(): SchemaOrgGraph {
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

    // JSON-LD @graph format: @context + @graph array, NO @type at root level
    // The @graph keyword indicates this is a container for multiple schemas
    return {
      '@context': 'https://schema.org',
      '@graph': schemas.filter((s): s is SchemaOrgBase => s !== null)
    } as SchemaOrgGraph;
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
      condition: (data, context) => {
        // Article for material pages (not settings pages)
        const hasCategory = !!(data.frontmatter?.category || data.metadata?.category);
        const isSettingsPage = context.slug.startsWith('settings/');
        return hasCategory && !isSettingsPage;
      }
    });
    this.register('TechArticle', generateTechArticleSchema, { 
      priority: 80,
      condition: (data, context) => {
        // TechArticle for settings pages (technical specifications)
        return context.slug.startsWith('settings/');
      }
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
        const fm = (data.frontmatter || data.metadata) as Record<string, unknown> | undefined;
        return !!(fm?.machineSettings || data.steps);
      }
    });
    this.register('FAQ', generateFAQSchema, {
      priority: 55,
      condition: (data) => hasFAQData(data)
    });
    this.register('QAPage', generateQAPageSchema, {
      priority: 54,
      condition: (data) => {
        const fm = (data.frontmatter || data.metadata) as Record<string, unknown> | undefined;
        return !!(fm?.expertAnswers && Array.isArray(fm.expertAnswers) && fm.expertAnswers.length > 0);
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
      condition: (data) => hasVideoData(data)
    });
    this.register('ImageObject', generateImageObjectSchema, {
      priority: 35,
      condition: (data) => hasImageData(data)
    });
    this.register('SoftwareApplication', generateSoftwareApplicationSchema, {
      priority: 32,
      condition: (data, context) => {
        // Only for settings pages with machine settings (they have interactive tools)
        const fm = (data.frontmatter || data.metadata) as Record<string, unknown> | undefined;
        return context.slug.startsWith('settings/') && !!fm?.machineSettings;
      }
    });
    this.register('ContactPoint', generateContactPointSchema, {
      priority: 30,
      condition: (data) => !!data.contactPoint
    });

    // E-E-A-T schemas
    this.register('Person', generatePersonSchema, {
      priority: 25,
      condition: (data) => hasAuthor(data)
    });
    this.register('Dataset', generateDatasetSchema, {
      priority: 20,
      condition: (data) => {
        const fm = (data.frontmatter || data.metadata) as Record<string, unknown> | undefined;
        return !!(fm?.materialProperties || fm?.machineSettings);
      }
    });
    this.register('Certification', generateCertificationSchema, {
      priority: 15,
      condition: (data) => hasRegulatoryStandards(data)
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

// hasProductData, hasServiceData, hasMultipleProducts, hasMultipleServices
// now imported from ./helpers.ts

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
  const frontmatter = getMetadata(data);
  const { pageUrl, baseUrl, currentDate } = context;
  
  const title = frontmatter.title || data.title || '';
  const description = frontmatter.description || frontmatter.material_description || frontmatter.settings_description || data.description || '';
  
  if (!title) return null;

  // Check if author exists
  const authorData = frontmatter.author || data.author;
  
  // Only include author field if author exists
  const authorField = authorData && (authorData.name || (typeof authorData === 'string' && authorData))
    ? { '@id': `${pageUrl}#person-author` }
    : undefined;

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
    ...(authorField && { 'author': authorField }),
    'publisher': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}${SITE_CONFIG.media.logo.default}`,
        'width': SITE_CONFIG.media.logo.width,
        'height': SITE_CONFIG.media.logo.height
      }
    },
    ...((getMainImage(data) && typeof getMainImage(data) === 'object') ? { 'image': getMainImage(data) } as Record<string, any> : {}),
    // E-E-A-T: Add expertise indicators (removed abstract - not in Schema.org Article spec)
    ...(frontmatter.keywords ? { 'keywords': Array.isArray(frontmatter.keywords) ? frontmatter.keywords.join(', ') : frontmatter.keywords } : {}),
    
    // Phase 2 E-E-A-T: Advanced Trust & Authoritativeness signals
    ...((frontmatter.eeat as any)?.reviewedBy && {
      'reviewedBy': {
        '@type': 'Person',
        '@id': `${baseUrl}#reviewer-technical`,
        'name': typeof (frontmatter.eeat as any).reviewedBy === 'string' ? (frontmatter.eeat as any).reviewedBy : (frontmatter.eeat as any).reviewedBy.name || 'Technical Review Team',
        'jobTitle': 'Quality Assurance Specialist'
      }
    }),
    
    ...((frontmatter.eeat as any)?.citations && (frontmatter.eeat as any).citations.length > 0 && {
      'citation': (frontmatter.eeat as any).citations.map((cite: any) => ({
        '@type': 'CreativeWork',
        'name': typeof cite === 'string' ? cite : cite.name || cite.title,
        ...(typeof cite === 'object' && cite.url && { 'url': cite.url })
      }))
    }),
    
    ...((frontmatter.eeat as any)?.isBasedOn && {
      'isBasedOn': {
        '@type': 'CreativeWork',
        'name': typeof (frontmatter.eeat as any).isBasedOn === 'string' ? (frontmatter.eeat as any).isBasedOn : (frontmatter.eeat as any).isBasedOn.name,
        ...((frontmatter.eeat as any).isBasedOn && typeof (frontmatter.eeat as any).isBasedOn === 'object' && (frontmatter.eeat as any).isBasedOn.url && { 'url': (frontmatter.eeat as any).isBasedOn.url })
      }
    })
  };
}

/**
 * TechArticle Schema - For technical documentation and settings pages
 * Schema.org TechArticle: "A technical article - Example: How-to (task) topics, 
 * step-by-step, procedural troubleshooting, specifications, etc."
 * 
 * Includes TechArticle-specific properties:
 * - dependencies: Prerequisites needed
 * - proficiencyLevel: 'Beginner' | 'Expert'
 */
function generateTechArticleSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = getMetadata(data);
  const { pageUrl, baseUrl, currentDate } = context;
  
  const title = frontmatter.title || data.title || '';
  const description = frontmatter.description || frontmatter.settings_description || data.description || '';
  const materialName = frontmatter.name || '';
  
  if (!title) return null;

  // Extract machine settings for technical details
  const machineSettings = frontmatter.machineSettings || data.machineSettings;
  
  // Build dependencies from machine settings (prerequisites for laser cleaning)
  const dependencies: string[] = [];
  if (machineSettings) {
    if (machineSettings.wavelength?.value) {
      dependencies.push(`Laser system with ${machineSettings.wavelength.value}nm wavelength`);
    }
    if (machineSettings.powerRange?.min && machineSettings.powerRange?.max) {
      dependencies.push(`Power output capability: ${machineSettings.powerRange.min}-${machineSettings.powerRange.max}W`);
    }
    if (machineSettings.pulseFrequency?.min && machineSettings.pulseFrequency?.max) {
      dependencies.push(`Adjustable pulse frequency: ${machineSettings.pulseFrequency.min}-${machineSettings.pulseFrequency.max}kHz`);
    }
  }

  // Check if author exists
  const authorData = frontmatter.author || data.author;
  const authorField = authorData && (authorData.name || (typeof authorData === 'string' && authorData))
    ? { '@id': `${pageUrl}#person-author` }
    : undefined;

  return {
    '@type': 'TechArticle',
    '@id': `${pageUrl}#techarticle`,
    'headline': title,
    'description': description,
    'articleSection': 'Laser Cleaning Parameters',
    'url': pageUrl,
    'datePublished': frontmatter.datePublished || currentDate,
    'dateModified': frontmatter.dateModified || currentDate,
    'inLanguage': 'en-US',
    
    // TechArticle-specific properties
    'proficiencyLevel': 'Expert', // Technical specifications require expertise
    ...(dependencies.length > 0 && { 'dependencies': dependencies.join('. ') }),
    
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    ...(authorField && { 'author': authorField }),
    'publisher': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}${SITE_CONFIG.media.logo.default}`,
        'width': SITE_CONFIG.media.logo.width,
        'height': SITE_CONFIG.media.logo.height
      }
    },
    ...((getMainImage(data) && typeof getMainImage(data) === 'object') ? { 'image': getMainImage(data) } as Record<string, any> : {}),
    
    // Keywords for discoverability
    ...(frontmatter.keywords ? { 'keywords': Array.isArray(frontmatter.keywords) ? frontmatter.keywords.join(', ') : frontmatter.keywords } : 
      materialName ? { 'keywords': `${materialName} laser cleaning, ${materialName} settings, laser parameters, ${materialName} specifications` } : {}),
    
    // E-E-A-T: Advanced Trust & Authoritativeness signals
    ...((frontmatter.eeat as any)?.reviewedBy && {
      'reviewedBy': {
        '@type': 'Person',
        '@id': `${baseUrl}#reviewer-technical`,
        'name': typeof (frontmatter.eeat as any).reviewedBy === 'string' ? (frontmatter.eeat as any).reviewedBy : (frontmatter.eeat as any).reviewedBy.name || 'Technical Review Team',
        'jobTitle': 'Quality Assurance Specialist'
      }
    }),
    
    ...((frontmatter.eeat as any)?.citations && (frontmatter.eeat as any).citations.length > 0 && {
      'citation': (frontmatter.eeat as any).citations.map((cite: any) => ({
        '@type': 'CreativeWork',
        'name': typeof cite === 'string' ? cite : cite.name || cite.title,
        ...(typeof cite === 'object' && cite.url && { 'url': cite.url })
      }))
    }),
    
    ...((frontmatter.eeat as any)?.isBasedOn && {
      'isBasedOn': {
        '@type': 'CreativeWork',
        'name': typeof (frontmatter.eeat as any).isBasedOn === 'string' ? (frontmatter.eeat as any).isBasedOn : (frontmatter.eeat as any).isBasedOn.name,
        ...((frontmatter.eeat as any).isBasedOn && typeof (frontmatter.eeat as any).isBasedOn === 'object' && (frontmatter.eeat as any).isBasedOn.url && { 'url': (frontmatter.eeat as any).isBasedOn.url })
      }
    })
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

  // Material-specific service products
  const meta = getMetadata(data);
  if (meta.materialProperties) {
    const mainImage = getMainImage(data);
    const materialName = meta.name || data.title || 'Material';
    const materialCategory = meta.category || 'Material';
    const authorData = (meta as any).author || data.author;
    
    // Professional cleaning service for this material
    products.push({
      '@type': 'Product',
      '@id': `${pageUrl}#service-professional`,
      'name': `Professional ${materialName} Laser Cleaning Service`,
      'description': `Expert laser cleaning service for ${materialName.toLowerCase()} surfaces. Professional technicians, on-site service, guaranteed results. Removes rust, oxidation, coatings, and contaminants without damaging the base material.`,
      'category': `Industrial Cleaning Services / Laser Cleaning / ${materialCategory} Cleaning`,
      'brand': {
        '@type': 'Brand',
        'name': SITE_CONFIG.name
      },
      'author': authorData ? {
        '@type': 'Person',
        'name': authorData.name || SITE_CONFIG.author,
        ...(authorData.jobTitle && { 'jobTitle': authorData.jobTitle }),
        ...(authorData.url && { 'url': authorData.url })
      } : {
        '@type': 'Organization',
        'name': SITE_CONFIG.name,
        'url': baseUrl
      },
      'provider': {
        '@type': 'Organization',
        'name': SITE_CONFIG.name,
        'url': baseUrl,
        'telephone': SITE_CONFIG.contact.general.phone,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': SITE_CONFIG.address.city,
          'addressRegion': SITE_CONFIG.address.state,
          'addressCountry': SITE_CONFIG.address.country
        }
      },
      'offers': {
        '@type': 'Offer',
        'price': SITE_CONFIG.pricing.professionalCleaning.hourlyRate,
        'priceCurrency': SITE_CONFIG.pricing.professionalCleaning.currency,
        'priceSpecification': {
          '@type': 'UnitPriceSpecification',
          'price': SITE_CONFIG.pricing.professionalCleaning.hourlyRate,
          'priceCurrency': SITE_CONFIG.pricing.professionalCleaning.currency,
          'unitText': SITE_CONFIG.pricing.professionalCleaning.unit,
          'referenceQuantity': {
            '@type': 'QuantitativeValue',
            'value': 1,
            'unitText': 'hour'
          }
        },
        'availability': 'https://schema.org/InStock',
        'availableDeliveryMethod': 'https://schema.org/OnSitePickup',
        'businessFunction': 'https://schema.org/ProvideService',
        'itemCondition': 'https://schema.org/NewCondition',
        'url': pageUrl,
        'seller': {
          '@type': 'Organization',
          'name': SITE_CONFIG.name,
          'url': baseUrl
        }
      },
      'areaServed': [
        {
          '@type': 'Country',
          'name': 'United States'
        },
        {
          '@type': 'Country',
          'name': 'Canada'
        }
      ],
      'serviceType': 'Industrial Laser Cleaning',
      'image': mainImage  // Always include image - getMainImage() now guarantees a value
    });
    
    // Equipment rental service for this material
    products.push({
      '@type': 'Product',
      '@id': `${pageUrl}#service-rental`,
      'name': `${materialName} Laser Cleaning Equipment Rental`,
      'description': `Self-service laser cleaning equipment rental for ${materialName.toLowerCase()}. Includes training, safety equipment, and technical support. Cost-effective solution for larger projects.`,
      'category': `Equipment Rental / Laser Cleaning Equipment / ${materialCategory} Applications`,
      'brand': {
        '@type': 'Brand',
        'name': SITE_CONFIG.name
      },
      'author': authorData ? {
        '@type': 'Person',
        'name': authorData.name || SITE_CONFIG.author,
        ...(authorData.jobTitle && { 'jobTitle': authorData.jobTitle }),
        ...(authorData.url && { 'url': authorData.url })
      } : {
        '@type': 'Organization',
        'name': SITE_CONFIG.name,
        'url': baseUrl
      },
      'offers': {
        '@type': 'Offer',
        'price': SITE_CONFIG.pricing.equipmentRental.hourlyRate,
        'priceCurrency': SITE_CONFIG.pricing.equipmentRental.currency,
        'priceSpecification': {
          '@type': 'UnitPriceSpecification',
          'price': SITE_CONFIG.pricing.equipmentRental.hourlyRate,
          'priceCurrency': SITE_CONFIG.pricing.equipmentRental.currency,
          'unitText': SITE_CONFIG.pricing.equipmentRental.unit,
          'referenceQuantity': {
            '@type': 'QuantitativeValue',
            'value': 1,
            'unitText': 'hour'
          }
        },
        'availability': 'https://schema.org/InStock',
        'availableDeliveryMethod': 'https://schema.org/OnSitePickup',
        'businessFunction': 'https://schema.org/LeaseOut',
        'itemCondition': 'https://schema.org/NewCondition',
        'url': pageUrl,
        'seller': {
          '@type': 'Organization',
          'name': SITE_CONFIG.name,
          'url': baseUrl
        }
      },
      'areaServed': [
        {
          '@type': 'Country',
          'name': 'United States'
        },
        {
          '@type': 'Country',
          'name': 'Canada'
        }
      ],
      'serviceType': 'Equipment Rental',
      'image': mainImage  // Always include image - getMainImage() now guarantees a value
    });
  }

  return products.length === 1 ? products[0] : (products.length > 1 ? (products as any) : null);
}

/**
 * Service Schema - Enhanced with frontmatter serviceOffering support
 * 
 * Supports:
 * 1. New format: serviceOffering { enabled, type, materialSpecific } from frontmatter
 * 2. Legacy: services[] or serviceOfferings[] arrays
 */
function generateServiceSchema(data: SchemaData, context: SchemaContext): SchemaOrgBase | null {
  const { pageUrl, baseUrl } = context;
  const meta = getMetadata(data) as Record<string, unknown>;
  
  if (!hasServiceData(data)) return null;

  // Check for new frontmatter serviceOffering format
  const serviceOffering = (meta.serviceOffering || data.serviceOffering) as ServiceOffering | undefined;
  
  if (serviceOffering?.enabled) {
    // Build Service schema from frontmatter serviceOffering
    const serviceType = serviceOffering.type || 'professionalCleaning';
    const pricing = SITE_CONFIG.pricing[serviceType as keyof typeof SITE_CONFIG.pricing] 
      || SITE_CONFIG.pricing.professionalCleaning;
    const materialSpecific = serviceOffering.materialSpecific || {} as ServiceOffering['materialSpecific'];
    
    // Calculate price range from hours estimates
    const minHours = materialSpecific.estimatedHoursMin || 1;
    const typicalHours = materialSpecific.estimatedHoursTypical || 3;
    const minPrice = minHours * pricing.hourlyRate;
    const maxPrice = typicalHours * pricing.hourlyRate;
    
    // Build service description with contaminants
    const contaminants = materialSpecific.targetContaminants || [];
    const materialName = (meta.title || data.title || 'Material') as string;
    const contaminantText = contaminants.length > 0 
      ? ` Removes: ${contaminants.slice(0, 3).join(', ')}.`
      : '';
    
    return {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      'name': `${pricing.label} for ${materialName}`,
      'description': `${pricing.description}${contaminantText}`,
      'provider': {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        'name': SITE_CONFIG.name,
        'url': baseUrl
      },
      'areaServed': {
        '@type': 'Place',
        'name': 'North America'
      },
      'serviceType': 'Laser Cleaning',
      'offers': {
        '@type': 'Offer',
        'priceSpecification': {
          '@type': 'UnitPriceSpecification',
          'price': pricing.hourlyRate,
          'priceCurrency': pricing.currency,
          'unitCode': 'HUR',
          'unitText': 'per hour'
        },
        'eligibleRegion': {
          '@type': 'Place',
          'name': 'United States'
        }
      },
      ...(minPrice !== maxPrice && {
        'potentialAction': {
          '@type': 'OrderAction',
          'target': `${baseUrl}/contact`,
          'priceSpecification': {
            '@type': 'PriceSpecification',
            'minPrice': minPrice,
            'maxPrice': maxPrice,
            'priceCurrency': pricing.currency
          }
        }
      }),
      ...(materialSpecific.notes && {
        'additionalProperty': {
          '@type': 'PropertyValue',
          'name': 'Material-specific notes',
          'value': materialSpecific.notes
        }
      })
    };
  }

  // Legacy array-based service formats
  const services = (data.services || data.serviceOfferings || meta.serviceOfferings || []) as Array<{
    name?: string;
    title?: string;
    description?: string;
  }>;
  
  if (services.length === 0) {
    // Single service page (legacy)
    const imageData = data.image ? {
      'image': {
        '@type': 'ImageObject',
        'url': `${baseUrl}${data.image}`
      }
    } : {};
    
    return {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      'name': (data.title as string) || 'Laser Cleaning Service',
      'description': (data.description as string) || '',
      'provider': {
        '@type': 'Organization',
        'name': SITE_CONFIG.name,
        'url': baseUrl
      },
      'areaServed': {
        '@type': 'Place',
        'name': (data.serviceArea as string) || 'North America'
      },
      'serviceType': 'Laser Cleaning',
      ...imageData
    };
  }

  // Multiple services (legacy) - return first service as the schema
  // Note: SchemaOrgBase expects a single object, not an array
  const firstService = services[0];
  return {
    '@type': 'Service',
    '@id': `${pageUrl}#service-1`,
    'name': firstService.name || firstService.title || 'Laser Cleaning Service',
    'description': firstService.description || '',
    'provider': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl
    }
  };
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
 * HowTo Schema - Enhanced with parameter optimization tips from heatmap analysis
 */
function generateHowToSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = getMetadata(data);
  const machineSettings = frontmatter.machineSettings as Record<string, any> | undefined;
  
  if (!machineSettings || Object.keys(machineSettings).length === 0) return null;

  const { pageUrl } = context;
  const materialName = frontmatter.name || data.title || 'material';

  // Extract power and pulse settings for optimal range tips
  const powerRange = machineSettings.powerRange;
  const pulseWidth = machineSettings.pulseWidth;
  const materialProps = frontmatter.materialProperties as Record<string, any> | undefined;
  
  // Generate standard parameter steps
  const steps = Object.entries(machineSettings)
    .filter(([key]) => !['material_challenges'].includes(key))
    .map(([key, value]: [string, any], index) => {
      // Format value based on structure
      const displayValue = typeof value === 'object' && value !== null
        ? `${value.value || value.min || ''} ${value.unit || ''}`
        : String(value);
      
      return {
        '@type': 'HowToStep',
        'position': index + 1,
        'name': formatLabel(key),
        'text': `Set ${formatLabel(key)} to ${displayValue}`.trim()
      };
    });

  // Generate parameter optimization tips based on material properties (from heatmap analysis)
  const tips: any[] = [];
  
  // Tip 1: Power-based tip from material reflectivity
  const reflectivity = materialProps?.laser_material_interaction?.laserReflectivity?.value ||
                       materialProps?.laser_material_interaction?.reflectivity?.value ||
                       materialProps?.physical_properties?.reflectivity?.value;
  if (powerRange && reflectivity !== undefined) {
    const isHighlyReflective = reflectivity > 0.7;
    tips.push({
      '@type': 'HowToTip',
      'text': isHighlyReflective
        ? `${materialName} has high reflectivity (${(reflectivity * 100).toFixed(0)}%). Start at the higher end of the power range (${powerRange.max || 100}W) to overcome energy reflection, then reduce power as surface oxide is removed.`
        : `${materialName} has moderate reflectivity (${(reflectivity * 100).toFixed(0)}%). Use mid-range power settings (${Math.round((powerRange.min + powerRange.max) / 2) || 75}W) for optimal energy coupling.`
    });
  }
  
  // Tip 2: Thermal stress tip from expansion coefficient
  const thermalExpansion = materialProps?.physical_properties?.thermalExpansionCoefficient?.value ||
                           materialProps?.laser_material_interaction?.thermalExpansion?.value;
  const meltingPoint = materialProps?.physical_properties?.meltingPoint?.value;
  if (thermalExpansion && pulseWidth) {
    const isHighExpansion = thermalExpansion > 15; // Above 15 µm/m·K is high
    tips.push({
      '@type': 'HowToTip',
      'text': isHighExpansion
        ? `${materialName} has high thermal expansion (${thermalExpansion} µm/m·K). Use shorter pulse widths (${pulseWidth.min || 10}ns) to minimize thermal stress and prevent warping.`
        : `${materialName} has moderate thermal expansion (${thermalExpansion} µm/m·K). Standard pulse widths (${pulseWidth.value || 100}ns) provide good balance between cleaning efficiency and thermal management.`
    });
  }
  
  // Tip 3: Temperature margin tip
  if (meltingPoint && powerRange) {
    tips.push({
      '@type': 'HowToTip',
      'text': `${materialName} melts at ${meltingPoint}K (${Math.round(meltingPoint - 273)}°C). Monitor for discoloration which indicates approaching thermal damage threshold. Stay below 70% of melting temperature for safe operation.`
    });
  }
  
  // Tip 4: Optimal parameter zone tip (combines power and pulse)
  if (powerRange && pulseWidth) {
    const optPowerMin = powerRange.min ? Math.round(powerRange.min + (powerRange.max - powerRange.min) * 0.3) : 50;
    const optPowerMax = powerRange.max ? Math.round(powerRange.min + (powerRange.max - powerRange.min) * 0.7) : 150;
    const optPulseMin = pulseWidth.min ? Math.round(pulseWidth.min + (pulseWidth.max - pulseWidth.min) * 0.2) : 50;
    const optPulseMax = pulseWidth.max ? Math.round(pulseWidth.min + (pulseWidth.max - pulseWidth.min) * 0.6) : 300;
    
    tips.push({
      '@type': 'HowToTip',
      'text': `Optimal parameter zone for ${materialName}: Power ${optPowerMin}-${optPowerMax}W with pulse width ${optPulseMin}-${optPulseMax}ns provides best balance of safety, effectiveness, and energy coupling based on multi-factor analysis.`
    });
  }

  return {
    '@type': 'HowTo',
    '@id': `${pageUrl}#howto`,
    'name': `How to laser clean ${materialName}`,
    'description': `Step-by-step process for laser cleaning ${materialName} with optimized parameters based on material properties analysis`,
    'totalTime': 'PT30M',
    'step': steps,
    ...(tips.length > 0 && { 'tip': tips })
  };
}

/**
 * FAQ Schema - Enhanced to handle both explicit FAQs and auto-generated from frontmatter
 */
function generateFAQSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = getMetadata(data);
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
 * QAPage Schema - Expert Q&A with E-E-A-T signals
 * For troubleshooting with expert attribution, credentials, and authority
 */
function generateQAPageSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = getMetadata(data);
  const expertAnswers = frontmatter.expertAnswers;
  
  if (!expertAnswers || !Array.isArray(expertAnswers) || expertAnswers.length === 0) {
    return null;
  }

  // Get accepted answer (if any) or first answer
  const mainAnswer = expertAnswers.find((a: any) => a.acceptedAnswer) || expertAnswers[0];
  
  if (!mainAnswer || !mainAnswer.question || !mainAnswer.answer || !mainAnswer.expert) {
    return null;
  }

  // Build expert person object
  const expertPerson: any = {
    '@type': 'Person',
    'name': mainAnswer.expert.name
  };

  if (mainAnswer.expert.image) {
    expertPerson.image = `${SITE_CONFIG.url}${mainAnswer.expert.image}`;
  }
  
  if (mainAnswer.expert.title) {
    expertPerson.jobTitle = mainAnswer.expert.title;
  }
  
  if (mainAnswer.expert.expertise && mainAnswer.expert.expertise.length > 0) {
    expertPerson.knowsAbout = mainAnswer.expert.expertise;
  }
  
  if (mainAnswer.expert.affiliation) {
    expertPerson.worksFor = {
      '@type': 'Organization',
      'name': mainAnswer.expert.affiliation
    };
  }

  // Build accepted answer
  const acceptedAnswer: any = {
    '@type': 'Answer',
    'text': mainAnswer.answer,
    'author': expertPerson,
    'dateCreated': mainAnswer.dateAnswered
  };

  if (mainAnswer.upvoteCount) {
    acceptedAnswer.upvoteCount = mainAnswer.upvoteCount;
  }

  if (mainAnswer.lastReviewed) {
    acceptedAnswer.dateModified = mainAnswer.lastReviewed;
  }

  // Add sources as citations
  if (mainAnswer.sources && mainAnswer.sources.length > 0) {
    acceptedAnswer.citation = mainAnswer.sources.map((source: string) => ({
      '@type': 'CreativeWork',
      'name': source
    }));
  }

  // Build main question
  const mainEntity: any = {
    '@type': 'Question',
    'name': mainAnswer.question,
    'text': mainAnswer.question,
    'acceptedAnswer': acceptedAnswer,
    'author': expertPerson,
    'dateCreated': mainAnswer.dateAnswered
  };

  if (mainAnswer.upvoteCount) {
    mainEntity.upvoteCount = mainAnswer.upvoteCount;
  }

  // Add suggested answers (other expert answers)
  const otherAnswers = expertAnswers.filter((a: any) => a !== mainAnswer && a.question === mainAnswer.question);
  if (otherAnswers.length > 0) {
    mainEntity.suggestedAnswer = otherAnswers.map((ans: any) => {
      const suggestedExpert: any = {
        '@type': 'Person',
        'name': ans.expert.name
      };
      
      if (ans.expert.image) {
        suggestedExpert.image = `${SITE_CONFIG.url}${ans.expert.image}`;
      }
      
      return {
        '@type': 'Answer',
        'text': ans.answer,
        'author': suggestedExpert,
        'dateCreated': ans.dateAnswered,
        ...(ans.upvoteCount && { 'upvoteCount': ans.upvoteCount })
      };
    });
  }

  return {
    '@type': 'QAPage',
    '@id': `${context.pageUrl}#qa`,
    'mainEntity': mainEntity
  };
}

/**
 * VideoObject Schema - Enhanced for material demonstrations
 */
function generateVideoObjectSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = getMetadata(data);
  
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
  const materialDesc = frontmatter.material_description || frontmatter.settings_description || frontmatter.description;
  const videoDescription = materialDesc
    ? `See how laser cleaning effectively processes ${materialName}. ${materialDesc}`
    : `Professional demonstration of laser cleaning process for ${materialName}. Watch how our advanced laser technology safely and effectively removes contaminants without damaging the material surface.`;

  return {
    '@type': 'VideoObject',
    '@id': `${context.pageUrl}#video`,
    'name': videoTitle,
    'description': videoDescription,
    'contentUrl': embedUrl,
    'embedUrl': `https://www.youtube.com/embed/${youtubeId}`,
    'uploadDate': data.videoUploadDate || '2024-01-15T00:00:00Z',
    'thumbnailUrl': data.videoThumbnail || thumbnailUrl,
    'duration': 'PT2M30S',
    'publisher': {
      '@type': 'Organization',
      'name': 'Z-Beam Laser Cleaning',
      'url': SITE_CONFIG.url,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_CONFIG.url}${SITE_CONFIG.media.logo.default}`,
        'width': SITE_CONFIG.media.logo.width,
        'height': SITE_CONFIG.media.logo.height
      }
    },
    // E-E-A-T: Add subject matter for context
    ...(frontmatter.category ? {
      'about': {
        '@type': 'Thing',
        'name': `${frontmatter.category} laser cleaning`
      }
    } : {})
  };
}

/**
 * ImageObject Schema - Enhanced with License Metadata
 * Implements Google's image license structured data
 * Uses page author as default creator if not explicitly specified
 * Uses caption.before for image descriptions
 * @see https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
 */
function generateImageObjectSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const mainImage = getMainImage(data);
  if (!mainImage) return null;

  // Get caption from multiple sources (priority order)
  const caption = mainImage.caption 
    || data.frontmatter?.caption?.before 
    || data.caption?.before
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

  // Image License Metadata - use image-specific values or fall back to site defaults
  // @see https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
  
  // License URL (required for full license metadata)
  imageObject.license = mainImage.license || 'https://creativecommons.org/licenses/by/4.0/';
  
  // Page where users can acquire/request license
  imageObject.acquireLicensePage = mainImage.acquireLicensePage || `${context.baseUrl}/contact`;
  
  // Credit text - use image-specific, caption description, or default
  if (mainImage.creditText) {
    imageObject.creditText = mainImage.creditText;
  } else if (mainImage.isMicro && (data.frontmatter?.caption?.description || data.caption?.description)) {
    imageObject.creditText = data.frontmatter?.caption?.description || data.caption?.description;
  } else {
    imageObject.creditText = 'Z-Beam Laser Cleaning';
  }
  
  // Copyright notice - use image-specific or generate default
  imageObject.copyrightNotice = mainImage.copyrightNotice 
    || `© ${new Date().getFullYear()} Z-Beam Laser Cleaning. All rights reserved.`;
  
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

  return imageObject;
}

/**
 * SoftwareApplication Schema - For interactive tools on settings pages
 * Describes the Heat Buildup Simulator and Parameter Relationship visualizer
 * @see https://schema.org/SoftwareApplication
 */
function generateSoftwareApplicationSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = getMetadata(data);
  const materialName = frontmatter.name || 'Material';
  const { pageUrl, baseUrl } = context;
  
  // Only generate for settings pages with machine settings (they have the interactive tools)
  if (!frontmatter.machineSettings) return null;

  // Main heat buildup simulator application
  const heatSimulator: SchemaOrgBase = {
    '@type': 'SoftwareApplication',
    '@id': `${pageUrl}#heat-simulator`,
    'name': `${materialName} Heat Buildup Simulator`,
    'description': `Interactive simulation tool to predict heat buildup during multi-pass laser cleaning of ${materialName}. Visualizes temperature vs. time with configurable power, scan speed, and cooling parameters.`,
    'applicationCategory': 'CalculatorApplication',
    'applicationSubCategory': 'Engineering Simulation',
    'operatingSystem': 'Web Browser',
    'browserRequirements': 'Modern web browser with JavaScript enabled',
    'softwareVersion': '1.0',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'featureList': [
      'Real-time temperature visualization',
      'Multi-pass simulation',
      'Configurable power and scan speed',
      'Safety threshold warnings',
      'Animation playback controls'
    ],
    'screenshot': {
      '@type': 'ImageObject',
      'url': `${baseUrl}/images/material/${(materialName as string).toLowerCase().replace(/\s+/g, '-')}-laser-cleaning-hero.jpg`
    },
    'author': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': baseUrl
    }
  };

  return heatSimulator;
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
  const frontmatter = getMetadata(data);
  const author = frontmatter.author || data.author;
  if (!author) return null;

  const personObj = generatePersonObject(author, context.baseUrl);
  
  // Add @id for referencing from Article schema
  if (personObj) {
    personObj['@id'] = `${context.pageUrl}#person-author`;
  }
  
  return personObj;
}

/**
 * Dataset Schema - Enhanced with E-E-A-T author signals and parameter optimization analysis
 * Includes both material properties AND machine settings for comprehensive datasets
 * Now also includes heatmap-derived parameter optimization data
 */
function generateDatasetSchema(data: any, context: SchemaContext): SchemaOrgBase | null {
  const frontmatter = getMetadata(data);
  if (!frontmatter.materialProperties && !frontmatter.machineSettings) return null;

  // DATASET QUALITY POLICY: Import validation at top of file, but check here
  // Validate dataset completeness before generating schema
  // Note: This will be fully enforced once datasetValidation is imported
  // For now, we check basic requirements: machineSettings must exist
  if (!frontmatter.machineSettings) {
    console.warn(`📊 Dataset schema excluded: No machine settings available`);
    return null;
  }
  
  const { slug, baseUrl } = context;
  
  // Extract material slug from the full slug path (e.g., "materials/metal/non-ferrous/titanium" -> "titanium")
  const materialSlug = slug.split('/').pop() || slug;
  
  // Normalize slug: remove -laser-cleaning or -settings suffix for unified dataset naming
  const baseMaterialSlug = materialSlug.replace(/-laser-cleaning$/, '').replace(/-settings$/, '');
  const datasetName = `${baseMaterialSlug}-laser-cleaning`;

  // E-E-A-T Enhancement: Use page author as dataset creator for authority
  const author = frontmatter.author || data.author;
  const authorPerson = (author && (author as any).name) ? generatePersonObject(author, baseUrl) : null;
  const creator = authorPerson || {
    '@type': 'Organization',
    'name': 'Z-Beam Laser Cleaning',
    'url': SITE_CONFIG.url
  };

  // Build variableMeasured array from both material properties and machine settings
  const measurements: any[] = [];
  const machineSettings = frontmatter.machineSettings as Record<string, any>;
  const materialProps = frontmatter.materialProperties as Record<string, any> | undefined;
  
  // Add machine settings if present
  if (machineSettings) {
    const settingsMap: Record<string, { label: string; description: string }> = {
      powerRange: { label: 'Power Range', description: 'Laser power output' },
      wavelength: { label: 'Wavelength', description: 'Laser beam wavelength' },
      spotSize: { label: 'Spot Size', description: 'Focused laser beam diameter' },
      repetitionRate: { label: 'Repetition Rate', description: 'Laser pulse frequency' },
      energyDensity: { label: 'Energy Density', description: 'Energy per unit area (fluence)' },
      fluenceThreshold: { label: 'Fluence Threshold', description: 'Minimum energy density for ablation' },
      pulseWidth: { label: 'Pulse Width', description: 'Laser pulse duration' },
      scanSpeed: { label: 'Scan Speed', description: 'Beam travel velocity' },
      passCount: { label: 'Pass Count', description: 'Number of cleaning passes' },
      overlapRatio: { label: 'Overlap Ratio', description: 'Beam overlap percentage' },
      dwellTime: { label: 'Dwell Time', description: 'Time laser spends per location' }
    };
    
    Object.entries(machineSettings).forEach(([key, settingData]: [string, any]) => {
      if (settingsMap[key] && settingData?.value !== undefined && settingData?.unit) {
        measurements.push({
          '@type': 'PropertyValue',
          'propertyID': key,
          'name': settingsMap[key].label,
          'value': settingData.value,
          'unitText': settingData.unit,
          'description': settingsMap[key].description,
          // Add min/max for range-based parameters
          ...(settingData.min !== undefined && { 'minValue': settingData.min }),
          ...(settingData.max !== undefined && { 'maxValue': settingData.max })
        });
      }
    });
  }
  
  // Add material properties if present
  if (materialProps) {
    Object.entries(materialProps).forEach(([_categoryKey, categoryData]: [string, any]) => {
      const propsToProcess = categoryData?.properties || categoryData;
      
      if (typeof propsToProcess === 'object' && !Array.isArray(propsToProcess)) {
        Object.entries(propsToProcess).forEach(([propKey, propData]: [string, any]) => {
          // Skip metadata fields
          if (['label', 'description', 'percentage'].includes(propKey)) return;
          
          if (propData?.value !== undefined) {
            measurements.push({
              '@type': 'PropertyValue',
              'propertyID': propKey,
              'name': propKey,
              'value': propData.value,
              'unitText': propData.unit || '',
              // E-E-A-T: Trustworthiness - verification metadata
              ...(propData.metadata?.last_verified && {
                'dateModified': propData.metadata.last_verified
              }),
              ...(propData.metadata?.source && {
                'citation': {
                  '@type': 'CreativeWork',
                  'name': propData.metadata.source
                }
              })
            });
          }
        });
      }
    });
  }

  // === HEATMAP ANALYSIS DATA ===
  // Add parameter optimization data derived from multi-factor heatmap analysis
  const powerRange = machineSettings?.powerRange;
  const pulseWidth = machineSettings?.pulseWidth;
  
  if (powerRange && pulseWidth) {
    // Calculate optimal ranges (same logic as heatmap components)
    const optPowerMin = powerRange.min ? Math.round(powerRange.min + (powerRange.max - powerRange.min) * 0.3) : 50;
    const optPowerMax = powerRange.max ? Math.round(powerRange.min + (powerRange.max - powerRange.min) * 0.7) : 150;
    const optPulseMin = pulseWidth.min ? Math.round(pulseWidth.min + (pulseWidth.max - pulseWidth.min) * 0.2) : 50;
    const optPulseMax = pulseWidth.max ? Math.round(pulseWidth.min + (pulseWidth.max - pulseWidth.min) * 0.6) : 300;
    
    // Add optimal power range as a computed property
    measurements.push({
      '@type': 'PropertyValue',
      'propertyID': 'optimalPowerRange',
      'name': 'Optimal Power Range',
      'minValue': optPowerMin,
      'maxValue': optPowerMax,
      'unitText': powerRange.unit || 'W',
      'description': 'Computed optimal power range for maximum safety and effectiveness based on multi-factor heatmap analysis',
      'measurementTechnique': 'Multi-factor scoring (safety, effectiveness, energy coupling, thermal stress)'
    });
    
    // Add optimal pulse range as a computed property
    measurements.push({
      '@type': 'PropertyValue',
      'propertyID': 'optimalPulseWidth',
      'name': 'Optimal Pulse Width',
      'minValue': optPulseMin,
      'maxValue': optPulseMax,
      'unitText': pulseWidth.unit || 'ns',
      'description': 'Computed optimal pulse width for best balance of cleaning efficiency and thermal management',
      'measurementTechnique': 'Multi-factor scoring (safety, effectiveness, energy coupling, thermal stress)'
    });
  }
  
  // Add heatmap scoring factors as measured variables
  const reflectivity = materialProps?.laser_material_interaction?.laserReflectivity?.value ||
                       materialProps?.laser_material_interaction?.reflectivity?.value;
  const thermalExpansion = materialProps?.physical_properties?.thermalExpansionCoefficient?.value ||
                           materialProps?.laser_material_interaction?.thermalExpansion?.value;
  const _thermalDiffusivity = materialProps?.laser_material_interaction?.thermalDiffusivity?.value;
  
  if (reflectivity !== undefined) {
    measurements.push({
      '@type': 'PropertyValue',
      'propertyID': 'energyCouplingFactor',
      'name': 'Energy Coupling Factor',
      'value': Math.round((1 - reflectivity) * 100),
      'unitText': '%',
      'description': 'Percentage of laser energy absorbed by material (inverse of reflectivity). Higher values indicate better energy transfer efficiency.'
    });
  }
  
  if (thermalExpansion !== undefined) {
    const stressRisk = thermalExpansion > 20 ? 'High' : thermalExpansion > 10 ? 'Moderate' : 'Low';
    measurements.push({
      '@type': 'PropertyValue',
      'propertyID': 'thermalStressRisk',
      'name': 'Thermal Stress Risk Level',
      'value': stressRisk,
      'description': `Risk assessment based on thermal expansion coefficient (${thermalExpansion} µm/m·K). ${stressRisk} risk indicates ${stressRisk === 'High' ? 'need for shorter pulses and careful thermal management' : stressRisk === 'Moderate' ? 'standard precautions recommended' : 'material is thermally stable during processing'}.`
    });
  }

  const hasMachineSettingsData = !!(machineSettings && Object.keys(machineSettings).length > 0);
  const hasMaterialPropsData = !!(materialProps && Object.keys(materialProps).length > 0);
  
  let datasetDescription = `Comprehensive laser cleaning dataset for ${frontmatter.name || 'material'}.`;
  if (hasMachineSettingsData && hasMaterialPropsData) {
    datasetDescription += ' Includes validated machine parameters, material properties, and computed optimal parameter ranges from multi-factor heatmap analysis for optimal cleaning results.';
  } else if (hasMachineSettingsData) {
    datasetDescription += ' Includes validated machine parameters and computed optimal ranges for laser cleaning.';
  } else if (hasMaterialPropsData) {
    datasetDescription += ' Includes validated material properties for laser cleaning applications.';
  }

  return {
    '@type': 'Dataset',
    '@id': `${baseUrl}/datasets/materials/${datasetName}#dataset`,
    'name': `${frontmatter.name || 'Material'} Laser Cleaning Dataset`,
    'description': datasetDescription,
    'version': '1.0',
    'license': {
      '@type': 'CreativeWork',
      'name': 'Creative Commons Attribution 4.0 International',
      'url': 'https://creativecommons.org/licenses/by/4.0/'
    },
    'creator': creator,
    // E-E-A-T: Also add author field for better E-E-A-T scoring
    ...(authorPerson && { 'author': authorPerson }),
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
    ...(measurements.length > 0 && { 'variableMeasured': measurements }),
    'temporalCoverage': '2025',
    'spatialCoverage': {
      '@type': 'Place',
      'name': 'Global'
    },
    'url': `${baseUrl}/datasets/materials/${datasetName}`
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
        'caption': cardWithImage.image.alt || data.frontmatter?.caption?.before || data.caption?.before || data.title
      };
    }
  }

  // From frontmatter images - prioritize hero, then micro
  const frontmatter = getMetadata(data) as any;
  
  if (frontmatter.images?.hero?.url) {
    const hero = frontmatter.images.hero;
    return {
      '@type': 'ImageObject',
      'url': `${SITE_CONFIG.url}${hero.url}`,
      'width': hero.width || 1200,  // P0 enhancement: default dimensions for rich snippets
      'height': hero.height || 630,  // P0 enhancement: default dimensions for rich snippets
      'caption': hero.alt || (frontmatter as any).caption?.before || (data as any).caption?.before || data.title,
      'isMicro': false,
      // Pass through license metadata if present
      ...(hero.license && { 'license': hero.license }),
      ...(hero.acquireLicensePage && { 'acquireLicensePage': hero.acquireLicensePage }),
      ...(hero.creditText && { 'creditText': hero.creditText }),
      ...(hero.creator && { 'creator': hero.creator }),
      ...(hero.copyrightNotice && { 'copyrightNotice': hero.copyrightNotice })
    };
  }
  
  // Fallback to micro image if no hero
  if (frontmatter.images?.micro?.url) {
    const micro = frontmatter.images.micro;
    return {
      '@type': 'ImageObject',
      'url': `${SITE_CONFIG.url}${micro.url}`,
      'width': micro.width || 1200,  // P0 enhancement: default dimensions for rich snippets
      'height': micro.height || 630,  // P0 enhancement: default dimensions for rich snippets
      'caption': micro.alt || (frontmatter as any).caption?.before || (data as any).caption?.before || data.title,
      'isMicro': true,
      // Pass through license metadata if present
      ...(micro.license && { 'license': micro.license }),
      ...(micro.acquireLicensePage && { 'acquireLicensePage': micro.acquireLicensePage }),
      ...(micro.creditText && { 'creditText': micro.creditText }),
      ...(micro.creator && { 'creator': micro.creator }),
      ...(micro.copyrightNotice && { 'copyrightNotice': micro.copyrightNotice })
    };
  }

  // Direct image property
  if (data.image) {
    return {
      '@type': 'ImageObject',
      'url': typeof data.image === 'string' ? data.image : `${SITE_CONFIG.url}${data.image.url}`,
      'caption': data.frontmatter?.caption?.before || data.caption?.before || data.title
    };
  }

  // Fallback: Generate hero image URL from slug pattern
  const slug = data.slug || data.frontmatter?.slug;
  if (slug) {
    return {
      '@type': 'ImageObject',
      'url': `${SITE_CONFIG.url}/images/material/${slug}-hero.jpg`,
      'width': 1200,
      'height': 630,
      'caption': data.title || data.frontmatter?.title || 'Laser cleaning process'
    };
  }

  // Ultimate fallback: default OG image
  return {
    '@type': 'ImageObject',
    'url': `${SITE_CONFIG.url}/images/og-image.jpg`,
    'width': 1200,
    'height': 630,
    'caption': 'Z-Beam Laser Cleaning'
  };
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
    // E-E-A-T: Add organizational affiliation (P1 enhancement - supports object structure)
    ...(author.affiliation && {
      'affiliation': typeof author.affiliation === 'string' 
        ? {
            '@type': 'Organization',
            'name': author.affiliation
          }
        : {
            '@type': author.affiliation.type || 'Organization',
            'name': author.affiliation.name
          }
    }),
    // E-E-A-T: Add worksFor (same as affiliation for Google Rich Results)
    ...(author.affiliation && {
      'worksFor': typeof author.affiliation === 'string' 
        ? {
            '@type': 'Organization',
            'name': author.affiliation
          }
        : {
            '@type': author.affiliation.type || 'Organization',
            'name': author.affiliation.name
          }
    }),
    // E-E-A-T: Add educational institution (P1 enhancement)
    ...(author.alumniOf && {
      'alumniOf': typeof author.alumniOf === 'string'
        ? {
            '@type': 'EducationalOrganization',
            'name': author.alumniOf
          }
        : {
            '@type': author.alumniOf.type || 'EducationalOrganization',
            'name': author.alumniOf.name
          }
    }),
    // E-E-A-T: Add expertise areas as array (P0 enhancement)
    ...(author.expertise && { 
      'knowsAbout': Array.isArray(author.expertise) ? author.expertise : [author.expertise]
    }),
    // E-E-A-T: Add geographic authority
    ...(author.country && { 'nationality': author.country }),
    // E-E-A-T: Add image with alt text (accessibility + SEO)
    ...(author.image && {
      'image': typeof author.image === 'string'
        ? author.image
        : {
            '@type': 'ImageObject',
            'url': author.image,
            ...(author.imageAlt && { 'description': author.imageAlt })
          }
    })
  };

  // E-E-A-T: Add sameAs links for authority (P0 enhancement)
  if (author.sameAs || author.socialProfiles) {
    personObj.sameAs = author.sameAs || author.socialProfiles;
  }

  // E-E-A-T: Add languages spoken (optional enhancement)
  if (author.languages && Array.isArray(author.languages)) {
    personObj.knowsLanguage = author.languages;
  }

  // E-E-A-T: Add credentials array (P1 enhancement - separate from expertise)
  if (author.credentials && Array.isArray(author.credentials)) {
    personObj.hasCredential = author.credentials.map((cred: string) => ({
      '@type': 'EducationalOccupationalCredential',
      'credentialCategory': 'degree',
      'description': cred
    }));
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
