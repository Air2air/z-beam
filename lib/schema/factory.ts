/**
 * Schema Factory for JSON-LD Generation
 * Unified approach to creating structured data schemas
 * Implements factory pattern to reduce code duplication and improve maintainability
 */

// Internal constants to avoid external dependencies
const SITE_CONFIG = {
  name: 'Z-Beam',
  url: 'https://www.z-beam.com',
  description: 'Professional laser cleaning solutions',
  logo: 'https://www.z-beam.com/logo.png',
  contact: {
    general: {
      phone: '+1-555-LASER',
      email: 'info@z-beam.com'
    }
  }
};

// Base interface that all schema options must extend
export interface BaseSchemaOptions {
  name: string;
  description: string;
}

// Schema type definitions
export type SchemaType = 
  | 'BreadcrumbList'
  | 'FAQPage'
  | 'Product'
  | 'HowTo'
  | 'Service'
  | 'TechnicalArticle'
  | 'LocalBusiness'
  | 'WebPage';

// Schema-specific interfaces extending base
export interface BreadcrumbSchemaOptions {
  items: Array<{ name: string; href: string; }>;
}

export interface FAQSchemaOptions {
  faqs: Array<{ question: string; answer: string; }>;
}

export interface ProductSchemaOptions extends BaseSchemaOptions {
  image?: string;
  brand?: string;
  category?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}

export interface HowToSchemaOptions extends BaseSchemaOptions {
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
  totalTime?: string;
  estimatedCost?: string;
  supply?: string[];
  tool?: string[];
}

export interface ServiceSchemaOptions extends BaseSchemaOptions {
  serviceType: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed: string[];
  availableChannel?: {
    url: string;
    name: string;
  };
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}

export interface TechnicalArticleSchemaOptions extends BaseSchemaOptions {
  headline: string;
  author: {
    name: string;
    url?: string;
  };
  datePublished: string;
  dateModified?: string;
  publisher: {
    name: string;
    logo?: string;
  };
  mainEntityOfPage: string;
  image?: string;
  articleBody?: string;
}

export interface LocalBusinessSchemaOptions extends BaseSchemaOptions {
  // Uses SITE_CONFIG defaults, inherits from BaseSchemaOptions
  businessType?: string;
  address?: object;
}

export interface WebPageSchemaOptions {
  pageName: string;
  pathname: string;
  breadcrumbId?: string;
}

/**
 * Schema Factory Class
 * Provides unified interface for creating all schema types
 */
export class SchemaFactory {
  /**
   * Create schema of specified type with options
   */
  static create<T extends SchemaType>(
    type: T,
    options: T extends 'BreadcrumbList' ? BreadcrumbSchemaOptions :
            T extends 'FAQPage' ? FAQSchemaOptions :
            T extends 'Product' ? ProductSchemaOptions :
            T extends 'HowTo' ? HowToSchemaOptions :
            T extends 'Service' ? ServiceSchemaOptions :
            T extends 'TechnicalArticle' ? TechnicalArticleSchemaOptions :
            T extends 'LocalBusiness' ? LocalBusinessSchemaOptions :
            T extends 'WebPage' ? WebPageSchemaOptions :
            never
  ): object {
    switch (type) {
      case 'BreadcrumbList':
        return this.generateBreadcrumbList(options as BreadcrumbSchemaOptions);
      
      case 'FAQPage':
        return this.generateFAQPage(options as FAQSchemaOptions);
      
      case 'Product':
        return this.generateProduct(options as ProductSchemaOptions);
      
      case 'HowTo':
        return this.generateHowTo(options as HowToSchemaOptions);
      
      case 'Service':
        return this.generateService(options as ServiceSchemaOptions);
      
      case 'TechnicalArticle':
        return this.generateTechnicalArticle(options as TechnicalArticleSchemaOptions);
      
      case 'LocalBusiness':
        return this.generateLocalBusiness();
      
      case 'WebPage':
        return this.generateWebPage(options as WebPageSchemaOptions);
      
      default:
        throw new Error(`Unsupported schema type: ${type}`);
    }
  }

  /**
   * Generate complete @graph structure with entity, breadcrumb, and webpage schemas
   */
  static createPageGraph(
    entitySchema: object,
    breadcrumbItems: Array<{ name: string; href: string; }>,
    pageName: string,
    pathname: string
  ) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        entitySchema,
        this.create('BreadcrumbList', { items: breadcrumbItems }),
        this.create('WebPage', { pageName, pathname })
      ]
    };
  }

  // Private schema generator methods
  private static generateBreadcrumbList(options: BreadcrumbSchemaOptions) {
    return {
      '@type': 'BreadcrumbList',
      '@id': '#breadcrumb',
      itemListElement: options.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${SITE_CONFIG.url}${item.href}`
      }))
    };
  }

  private static generateFAQPage(options: FAQSchemaOptions) {
    return {
      '@type': 'FAQPage',
      '@id': '#faq',
      mainEntity: options.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  }

  private static generateProduct(options: ProductSchemaOptions) {
    const {
      name,
      description,
      image,
      brand = SITE_CONFIG.name,
      category,
      offers
    } = options;

    const schema: any = {
      '@type': 'Product',
      '@id': '#product',
      name,
      description,
      brand: {
        '@type': 'Brand',
        name: brand
      }
    };

    if (image) {
      schema.image = image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`;
    }

    if (category) schema.category = category;

    if (offers) {
      schema.offers = {
        '@type': 'Offer',
        ...offers,
        seller: {
          '@type': 'Organization',
          name: SITE_CONFIG.name
        }
      };
    }

    return schema;
  }

  private static generateHowTo(options: HowToSchemaOptions) {
    const {
      name,
      description,
      steps,
      totalTime,
      estimatedCost,
      supply = [],
      tool = []
    } = options;

    const schema: any = {
      '@type': 'HowTo',
      '@id': '#howto',
      name,
      description,
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        ...(step.image && {
          image: step.image.startsWith('http') ? step.image : `${SITE_CONFIG.url}${step.image}`
        })
      }))
    };

    if (totalTime) schema.totalTime = totalTime;
    if (estimatedCost) schema.estimatedCost = estimatedCost;
    if (supply.length > 0) schema.supply = supply;
    if (tool.length > 0) schema.tool = tool;

    return schema;
  }

  private static generateService(options: ServiceSchemaOptions) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': '#service',
      name: options.name,
      description: options.description,
      serviceType: options.serviceType,
      provider: {
        '@type': 'Organization',
        name: options.provider.name,
        url: options.provider.url
      },
      areaServed: options.areaServed.map(area => ({
        '@type': 'State',
        name: area
      })),
      ...(options.availableChannel && {
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: options.availableChannel.url,
          serviceName: options.availableChannel.name
        }
      }),
      ...(options.offers && {
        offers: {
          '@type': 'Offer',
          ...(options.offers.price && { price: options.offers.price }),
          ...(options.offers.priceCurrency && { priceCurrency: options.offers.priceCurrency }),
          ...(options.offers.availability && { availability: `https://schema.org/${options.offers.availability}` })
        }
      })
    };
  }

  private static generateTechnicalArticle(options: TechnicalArticleSchemaOptions) {
    return {
      '@context': 'https://schema.org',
      '@type': 'TechnicalArticle',
      '@id': `${options.mainEntityOfPage}#technicalarticle`,
      headline: options.headline,
      description: options.description,
      mainEntityOfPage: options.mainEntityOfPage,
      author: {
        '@type': 'Person',
        name: options.author.name,
        ...(options.author.url && { url: options.author.url })
      },
      datePublished: options.datePublished,
      ...(options.dateModified && { dateModified: options.dateModified }),
      ...(options.image && { 
        image: {
          '@type': 'ImageObject',
          url: options.image.startsWith('http') ? options.image : `${SITE_CONFIG.url}${options.image}`
        }
      }),
      ...(options.articleBody && { articleBody: options.articleBody }),
      publisher: {
        '@type': 'Organization',
        name: options.publisher.name,
        ...(options.publisher.logo && {
          logo: {
            '@type': 'ImageObject',
            url: options.publisher.logo.startsWith('http') ? options.publisher.logo : `${SITE_CONFIG.url}${options.publisher.logo}`
          }
        })
      }
    };
  }

  private static generateLocalBusiness() {
    return {
      '@type': 'LocalBusiness',
      '@id': '#business',
      name: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      url: SITE_CONFIG.url,
      telephone: SITE_CONFIG.contact.general.phone,
      email: SITE_CONFIG.contact.general.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'San Francisco Bay Area',
        addressRegion: 'CA',
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '37.7749',
        longitude: '-122.4194'
      },
      areaServed: [
        {
          '@type': 'City',
          name: 'San Francisco',
          containedInPlace: {
            '@type': 'State',
            name: 'California'
          }
        },
        {
          '@type': 'City',
          name: 'San Jose',
          containedInPlace: {
            '@type': 'State',
            name: 'California'
          }
        },
        {
          '@type': 'City',
          name: 'Oakland',
          containedInPlace: {
            '@type': 'State',
            name: 'California'
          }
        }
      ],
      openingHours: ['Mo-Fr 08:00-17:00'],
      priceRange: '$$',
      paymentAccepted: ['Cash', 'Credit Card', 'Check'],
      currenciesAccepted: 'USD'
    };
  }

  private static generateWebPage(options: WebPageSchemaOptions) {
    const { pageName, pathname, breadcrumbId = '#breadcrumb' } = options;
    
    return {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}${pathname}#webpage`,
      url: `${SITE_CONFIG.url}${pathname}`,
      name: pageName,
      isPartOf: {
        '@id': `${SITE_CONFIG.url}/#website`
      },
      breadcrumb: {
        '@id': breadcrumbId
      },
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'ReadAction',
        target: [`${SITE_CONFIG.url}${pathname}`]
      }
    };
  }
}

// Backward compatibility exports (maintain existing API while transitioning to factory)
export function generateServiceSchema(options: ServiceSchemaOptions) {
  return SchemaFactory.create('Service', options);
}

export function generateTechnicalArticleSchema(options: TechnicalArticleSchemaOptions) {
  return SchemaFactory.create('TechnicalArticle', options);
}

export function generateBreadcrumbSchema(items: Array<{ name: string; href: string; }>) {
  return SchemaFactory.create('BreadcrumbList', { items });
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string; }>) {
  return SchemaFactory.create('FAQPage', { faqs });
}

export function generateProductSchema(options: ProductSchemaOptions) {
  return SchemaFactory.create('Product', options);
}

export function generateHowToSchema(options: HowToSchemaOptions) {
  return SchemaFactory.create('HowTo', options);
}

export function generateLocalBusinessSchema() {
  return SchemaFactory.create('LocalBusiness', {
    name: 'Z-Beam',
    description: 'Professional laser cleaning services'
  });
}

export function generateWebPageSchema(pageName: string, pathname: string, breadcrumbId?: string) {
  return SchemaFactory.create('WebPage', { pageName, pathname, breadcrumbId });
}

export function generatePageSchema(
  entitySchema: object,
  breadcrumbItems: Array<{ name: string; href: string; }>,
  pageName: string,
  pathname: string
) {
  return SchemaFactory.createPageGraph(entitySchema, breadcrumbItems, pageName, pathname);
}

// Re-export legacy interfaces for gradual migration
export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}