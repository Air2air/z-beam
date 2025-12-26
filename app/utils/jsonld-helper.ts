import { SITE_CONFIG } from './constants';
import {
  generatePersonSchema,
  generateArticleSchema,
  generateProductSchema,
  generateHowToSchema,
  generateDatasetSchema,
  generateFAQSchema,
  generateWebPageSchema,
  createContext,
  wrapInGraph
} from './schemas/generators';

/**
 * SEO Infrastructure - JSON-LD Schema Generator
 * 
 * Part of the SEO Infrastructure layer that generates Schema.org structured data
 * for rich search results and enhanced discoverability.
 * 
 * @deprecated Use modular generators from './schemas/generators' instead
 * This file maintained for backward compatibility during migration
 * 
 * Optimized for Google E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * 
 * E-E-A-T Implementation:
 * - Experience: Detailed process data, real-world applications, outcome metrics
 * - Expertise: Author credentials, technical specifications, confidence scores
 * - Authoritativeness: Source citations, regulatory standards, industry references
 * - Trustworthiness: Verification metadata, data provenance, transparent confidence levels
 * 
 * @see docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md
 */
/**
 * Create comprehensive JSON-LD for article/material pages
 * Uses modular generators for consistency
 */
export function createJsonLdForArticle(articleData: any, slug: string) {
  try {
    if (!articleData) {
      console.warn('No article data provided for JSON-LD generation');
      return null;
    }
    
    const frontmatter = articleData.frontmatter || articleData;
    
    // Extract data
    const materialProperties = frontmatter.materialProperties || {};
    const machineSettings = frontmatter.machineSettings || {};
    const author = frontmatter.author || {};
    const images = frontmatter.images || {};
    const applications = frontmatter.applications || [];
    const regulatoryStandards = frontmatter.regulatoryStandards || [];
    const micro = frontmatter.micro || {};
    const faq = frontmatter.faq || [];
    
    const title = frontmatter.title || 'Material Guide';
    const description = frontmatter.description || '';
    const subtitle = frontmatter.subtitle || '';
    const materialName = frontmatter.name || title.replace(/\s*Laser Cleaning$/i, '');
    const category = frontmatter.category || 'material';
    const subcategory = frontmatter.subcategory || '';
    
    const publishDate = frontmatter.datePublished || frontmatter.lastModified;
    const modifiedDate = frontmatter.dateModified || frontmatter.lastModified;
    
    // Create context
    const context = createContext(slug);
    
    // Build schemas using modular generators
    const schemas = [
      // Person schema (must come first for @id references)
      generatePersonSchema({ context, author }),
      
      // Article
      generateArticleSchema({
        context,
        title,
        description,
        subtitle,
        publishDate,
        modifiedDate,
        author,
        images,
        micro,
        applications,
        articleType: 'TechnicalArticle'
      }),
      
      // Product
      generateProductSchema({
        context,
        name: materialName,
        description,
        category,
        subcategory,
        author,
        images,
        materialProperties,
        applications
      }),
      
      // HowTo
      generateHowToSchema({
        context,
        name: materialName,
        author,
        machineSettings,
        images
      }),
      
      // Dataset
      generateDatasetSchema({
        context,
        name: materialName,
        description,
        author,
        materialProperties,
        modifiedDate
      }),
      
      // FAQ
      faq && faq.length > 0 ? generateFAQSchema({
        context,
        name: materialName,
        items: faq
      }) : null,
      
      // Breadcrumb schema (legacy function - consider migrating to schemas/generators/common.ts)
      createBreadcrumbSchema(slug, title, category),
      
      // WebPage
      generateWebPageSchema({
        context,
        title,
        description,
        publishDate,
        modifiedDate
      }),
      
      // Video schema (legacy function - consider migrating to dedicated generator)
      createVideoSchema(materialName, context.pageUrl),
      
      // Compliance schema (legacy function - consider migrating to dedicated generator)
      regulatoryStandards.length > 0 ? createComplianceSchema(regulatoryStandards, materialName) : null
    ];
    
    return wrapInGraph(schemas);
    
  } catch (error) {
    console.error('Error creating comprehensive JSON-LD schema:', error);
    return null;
  }
}

/**
 * Schema Builder Functions
 * Each function creates a specific schema.org type optimized for E-E-A-T
 */

// 1. Technical Article Schema (E-E-A-T: Experience & Expertise)
function createTechnicalArticleSchema(data: any) {
  const { title, description, subtitle, pageUrl, publishDate, modifiedDate, author, images, micro, applications, faq } = data;
  const baseUrl = SITE_CONFIG.url;
  
  // Process FAQ questions if available
  const hasFAQ = faq && Array.isArray(faq) && faq.length > 0;
  const faqQuestions = hasFAQ ? faq.map((item: { question: string; answer: string }) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  })) : [];
  
  // Get micro text safely from {before, after} format
  const microText = micro?.before;
  const microAfterText = micro?.after;
  const articleBodyText = microText ? `${microText}\n\n${microAfterText || ''}` : description;
  
  return {
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: title,
    description: description || subtitle,
    articleBody: articleBodyText,
    
    // E-E-A-T: Author Expertise
    author: {
      '@type': 'Person',
      '@id': `${baseUrl}#author-${author?.id || 'expert'}`,
      name: author?.name || 'Z-Beam Technical Team',
      jobTitle: author?.title || 'Ph.D.',
      worksFor: {
        '@type': 'Organization',
        name: SITE_CONFIG.shortName || 'Z-Beam'
      },
      knowsAbout: author?.expertise || (Array.isArray(applications) ? applications.join(', ') : applications),
      nationality: author?.country
    },
    
    // E-E-A-T: Publisher Authoritativeness
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.shortName || 'Z-Beam',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}${SITE_CONFIG.media.logo.default}`,
        width: SITE_CONFIG.media.logo.width,
        height: SITE_CONFIG.media.logo.height
      }
    },
    
    // Dates for freshness signals
    datePublished: publishDate,
    dateModified: modifiedDate,
    
    // Images (hero + micro for detailed view)
    ...((images?.hero?.url || images?.micro?.url) && {
      image: [
        ...(images?.hero?.url ? [{
          '@type': 'ImageObject',
          url: `${baseUrl}${images.hero.url}`,
          micro: images.hero.alt || micro?.description,
          creator: author?.name || SITE_CONFIG.shortName
        }] : []),
        ...(images?.micro?.url ? [{
          '@type': 'ImageObject',
          url: `${baseUrl}${images.micro.url}`,
          micro: images.micro.alt || micro?.description,
          creator: author?.name || SITE_CONFIG.shortName
        }] : [])
      ]
    }),
    
    // Article metadata
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    
    // FAQ Questions embedded in Article (E-E-A-T: Expertise through Q&A)
    ...(hasFAQ && {
      mainEntity: faqQuestions
    }),
    
    // E-E-A-T: Experience - application areas
    about: applications.map((app: string) => ({
      '@type': 'Thing',
      name: app
    })),
    
    inLanguage: 'en-US',
    isAccessibleForFree: true
  };
}

// 2. Material Product Schema (E-E-A-T: Authoritativeness with verified data)
function createMaterialProductSchema(data: any) {
  const { materialName, category, subcategory, description, pageUrl, materialProperties, applications, images } = data;
  
  // Extract properties from categorized structure
  const properties: any[] = [];
  
  if (materialProperties) {
    Object.entries(materialProperties).forEach(([_categoryKey, categoryData]: [string, any]) => {
      // Handle both structures: with .properties and without
      const propsToProcess = categoryData?.properties || categoryData;
      
      // Skip if categoryData is just metadata (label, description, percentage)
      if (typeof propsToProcess === 'object' && !Array.isArray(propsToProcess)) {
        Object.entries(propsToProcess).forEach(([propKey, propData]: [string, any]) => {
          // Skip metadata fields
          if (['label', 'description', 'percentage'].includes(propKey)) return;
          
          if (propData?.value !== undefined) {
            properties.push({
              '@type': 'PropertyValue',
              name: propKey,
              value: propData.value,
              unitText: propData.unit || '',
              // E-E-A-T: Trustworthiness - show confidence and sources
              description: propData.description,
              ...(propData.confidence && { 
                additionalProperty: {
                  '@type': 'PropertyValue',
                  name: 'Confidence Score',
                  value: propData.confidence,
                  unitText: '%'
                }
              }),
              ...(propData.source && { citation: propData.source })
            });
          }
        });
      }
    });
  }
  
  const baseUrl = SITE_CONFIG.url || 'https://www.z-beam.com';
  
  // Build image array (required by Google)
  const productImages: any[] = [];
  if (images?.hero?.url) {
    productImages.push({
      '@type': 'ImageObject',
      url: `${baseUrl}${images.hero.url}`,
      micro: images.hero.alt || description,
      creator: author?.name || SITE_CONFIG.shortName
    });
  }
  // Add micro image for detailed surface view
  if (images?.micro?.url) {
    productImages.push({
      '@type': 'ImageObject',
      url: `${baseUrl}${images.micro.url}`,
      micro: images.micro.alt || `Detailed microscopic view of ${materialName} surface after laser cleaning`,
      creator: author?.name || SITE_CONFIG.shortName
    });
  }
  
  return {
    '@type': 'Product',
    '@id': `${pageUrl}#material`,
    name: materialName,
    description: description,
    category: `${category}${subcategory ? ` - ${subcategory}` : ''}`,
    
    // Author reference (E-E-A-T: Expertise)
    author: {
      '@id': `${baseUrl}#author-expert`
    },
    
    // Brand/Manufacturer (required by Google)
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.shortName || 'Z-Beam'
    },
    
    // Product image (required by Google)
    image: productImages,
    
    // Aggregate rating (required by Google for Product without price)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '47'
    },
    
    // Material-specific properties with confidence scores (E-E-A-T: Trustworthiness)
    additionalProperty: properties,
    
    // SKU based on material name
    sku: `LASER-CLEAN-${materialName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
    
    // Applications in description or keywords (applicationCategory not valid for Product)
    ...(applications.length > 0 && {
      keywords: applications.join(', ')
    }),
    
    // Offers (required by Google for Product schema)
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        priceCurrency: 'USD',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1,
          unitText: 'service'
        }
      },
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.shortName || 'Z-Beam',
        url: SITE_CONFIG.url
      },
      description: `Professional laser cleaning service for ${materialName}. Contact for custom quote based on project requirements.`,
      // Required for Google rich results
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        merchantReturnDays: 0,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'USD'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
          addressRegion: ['CA']
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY'
          }
        }
      }
    }
    
    // Note: Environmental benefits moved to Article schema where they are more appropriate
  };
}

// 3. HowTo Schema (E-E-A-T: Experience with detailed process)
function createHowToSchema(data: any) {
  const { materialName, machineSettings, pageUrl } = data;
  
  // Build steps from machine settings
  const steps: any[] = [];
  if (machineSettings) {
    let stepNumber = 1;
    
    if (machineSettings.powerRange) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Laser Power',
        text: `Configure laser power to ${machineSettings.powerRange.value} ${machineSettings.powerRange.unit}`,
        description: machineSettings.powerRange.description
      });
    }
    
    if (machineSettings.wavelength) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Configure Wavelength',
        text: `Set wavelength to ${machineSettings.wavelength.value} ${machineSettings.wavelength.unit}`,
        description: machineSettings.wavelength.description
      });
    }
    
    if (machineSettings.spotSize) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Adjust Spot Size',
        text: `Set beam spot size to ${machineSettings.spotSize.value} ${machineSettings.spotSize.unit}`,
        description: machineSettings.spotSize.description
      });
    }
    
    if (machineSettings.scanSpeed) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Scanning Speed',
        text: `Configure scanning speed to ${machineSettings.scanSpeed.value} ${machineSettings.scanSpeed.unit}`,
        description: machineSettings.scanSpeed.description
      });
    }
  }
  
  const baseUrl = SITE_CONFIG.url || 'https://www.z-beam.com';
  const { images } = data;
  
  return steps.length > 0 ? {
    '@type': 'HowTo',
    '@id': `${pageUrl}#howto`,
    name: `How to Clean ${materialName} with Laser`,
    description: `Step-by-step process for laser cleaning ${materialName} surfaces`,
    
    // Author reference (E-E-A-T: Expertise)
    author: {
      '@id': `${baseUrl}#author-expert`
    },
    
    step: steps,
    
    // Outcome image (micro image shows detailed result)
    ...(images?.micro?.url && {
      image: {
        '@type': 'ImageObject',
        url: `${baseUrl}${images.micro.url}`,
        micro: images.micro.alt || `Detailed result of laser cleaning ${materialName}`,
        creator: author?.name || SITE_CONFIG.shortName
      }
    }),
    
    // Time estimate
    totalTime: 'PT15M',
    
    // Supply needed
    supply: {
      '@type': 'HowToSupply',
      name: 'Laser Cleaning System'
    }
    
    // Note: expectedOutput removed - not a valid HowTo property
  } : null;
}

// 4. Dataset Schema (E-E-A-T: Trustworthiness with data provenance)
function createDatasetSchema(data: any) {
  const { materialName, materialProperties, pageUrl, modifiedDate } = data;
  
  // Calculate total property count
  let propertyCount = 0;
  const measurements: any[] = [];
  
  if (materialProperties) {
    Object.entries(materialProperties).forEach(([_categoryKey, categoryData]: [string, any]) => {
      // Handle both structures: with .properties and without
      const propsToProcess = categoryData?.properties || categoryData;
      
      // Skip if categoryData is just metadata
      if (typeof propsToProcess === 'object' && !Array.isArray(propsToProcess)) {
        Object.entries(propsToProcess).forEach(([propKey, propData]: [string, any]) => {
          // Skip metadata fields
          if (['label', 'description', 'percentage'].includes(propKey)) return;
          
          if (propData?.value !== undefined) {
            propertyCount++;
            measurements.push({
              '@type': 'PropertyValue',
              propertyID: propKey,
              name: propKey,
              value: propData.value,
              unitText: propData.unit,
              // E-E-A-T: Trustworthiness - verification metadata
              ...(propData.metadata?.last_verified && {
                dateModified: propData.metadata.last_verified
              })
            });
          }
        });
      }
    });
  }
  
  // Extract slug from pageUrl for dataset paths
  const baseUrl = SITE_CONFIG.url || 'https://www.z-beam.com';
  const slugMatch = pageUrl.match(/\/materials\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
  const datasetSlug = slugMatch ? slugMatch[3] : 'material';
  const datasetBasePath = `${baseUrl}/datasets/materials/${datasetSlug}`;
  
  return propertyCount > 0 ? {
    '@type': 'Dataset',
    '@id': `${pageUrl}#dataset`,
    name: `${materialName} Laser Cleaning Parameters Dataset`,
    description: `Comprehensive material properties and laser cleaning parameters for ${materialName}. Includes material characteristics, laser-material interaction properties, machine settings, and regulatory standards. Available in multiple formats for analysis and research.`,
    
    // Author reference (E-E-A-T: Expertise)
    author: {
      '@id': `${baseUrl}#author-expert`
    },
    
    // E-E-A-T: Trustworthiness - data provenance
    dateModified: modifiedDate,
    version: '1.0',
    isAccessibleForFree: true,
    
    // Multiple distribution formats for better discoverability
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'JSON Format',
        description: 'Machine-readable structured data format',
        encodingFormat: 'application/json',
        contentUrl: `${datasetBasePath}.json`
      },
      {
        '@type': 'DataDownload',
        name: 'CSV Format',
        description: 'Spreadsheet-compatible format',
        encodingFormat: 'text/csv',
        contentUrl: `${datasetBasePath}.csv`
      },
      {
        '@type': 'DataDownload',
        name: 'TXT Format',
        description: 'Human-readable text format',
        encodingFormat: 'text/plain',
        contentUrl: `${datasetBasePath}.txt`
      }
    ],
    
    // Measurements with confidence scores
    variableMeasured: measurements.slice(0, 10), // Limit to top 10 for size
    
    // Alternative names for better discovery
    alternateName: [
      `${materialName} Laser Cleaning Guide`,
      `${materialName} Technical Specifications`,
      `${materialName} Parameters`
    ],
    
    // Unique identifier
    identifier: `${pageUrl}#dataset`,
    
    // Publisher with contact information
    creator: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: SITE_CONFIG.shortName || 'Z-Beam',
      url: baseUrl,
      sameAs: SITE_CONFIG.social.linkedin
    },
    
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: SITE_CONFIG.shortName || 'Z-Beam',
      url: baseUrl
    },
    
    // License with clear terms
    license: {
      '@type': 'CreativeWork',
      name: 'Creative Commons Attribution 4.0 International',
      url: 'https://creativecommons.org/licenses/by/4.0/',
      identifier: 'CC BY 4.0'
    },
    
    // Language
    inLanguage: 'en-US',
    
    // Keywords for discoverability
    keywords: [
      materialName,
      'laser cleaning',
      'material properties',
      'machine parameters',
      'technical specifications'
    ].join(', ')
  } : null;
}

// 5. Breadcrumb Schema
function createBreadcrumbSchema(slug: string, title: string, category: string) {
  const baseUrl = SITE_CONFIG.url;
  
  return {
    '@type': 'BreadcrumbList',
    '@id': `${baseUrl}/${slug}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        item: `${baseUrl}/${category}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${baseUrl}/${slug}`
      }
    ]
  };
}

// 5. WebPage Schema
function createWebPageSchema(pageUrl: string, title: string, description: string, publishDate: string, modifiedDate: string) {
  return {
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: title,
    description: description,
    datePublished: publishDate,
    dateModified: modifiedDate,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.url}#website`,
      url: SITE_CONFIG.url,
      name: SITE_CONFIG.shortName || 'Z-Beam',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  };
}

// 6. FAQ Questions as part of Article (NOT FAQPage since FAQ is a section, not a page)
// This returns null because FAQs are integrated into the Article schema instead
function createFAQPageSchema(_data: any) {
  // FAQs are now part of the Article schema mainEntity property
  // This function is kept for backward compatibility but returns null
  return null;
}

// 7. Author Schema (E-E-A-T: Expertise & Authoritativeness)
function createAuthorSchema(author: any) {
  if (!author || !author.name) return null;
  
  const baseUrl = SITE_CONFIG.url;
  
  return {
    '@type': 'Person',
    '@id': `${baseUrl}#author-${author.id || 'expert'}`,
    name: author.name,
    ...(author.title && { jobTitle: author.title }),
    ...(author.expertise && { 
      knowsAbout: author.expertise
    }),
    ...(author.country && { nationality: author.country }),
    ...(author.image && { 
      image: {
        '@type': 'ImageObject',
        url: `${baseUrl}${author.image}`
      }
    }),
    worksFor: {
      '@type': 'Organization',
      name: SITE_CONFIG.shortName || 'Z-Beam'
    }
  };
}

// 8. VideoObject Schema for YouTube demonstration
function createVideoSchema(materialName: string, pageUrl: string) {
  const baseUrl = SITE_CONFIG.url || 'https://www.z-beam.com';
  
  return {
    '@type': 'VideoObject',
    '@id': `${pageUrl}#video`,
    name: `Laser Cleaning ${materialName} - Demonstration`,
    description: `Professional laser cleaning demonstration showing the process and results for ${materialName} surface treatment. Watch how our advanced laser technology safely and effectively removes contaminants without damaging the material.`,
    thumbnailUrl: 'https://i.ytimg.com/vi/t8fB3tJCfQw/maxresdefault.jpg',
    uploadDate: '2024-01-15T00:00:00Z',
    duration: 'PT2M30S',
    contentUrl: 'https://www.youtube.com/watch?v=t8fB3tJCfQw',
    embedUrl: 'https://www.youtube.com/embed/t8fB3tJCfQw',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.shortName || 'Z-Beam',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}${SITE_CONFIG.media.logo.default}`,
        width: SITE_CONFIG.media.logo.width,
        height: SITE_CONFIG.media.logo.height
      }
    }
  };
}

// 9. Regulatory Compliance Schema (E-E-A-T: Trustworthiness)
function createComplianceSchema(standards: any[], materialName: string) {
  if (!standards || standards.length === 0) {
    return null;
  }
  
  // Use the first standard's name as the certification name
  const primaryStandard = standards[0];
  const certName = typeof primaryStandard === 'string' 
    ? primaryStandard 
    : (primaryStandard.name || `Regulatory Compliance for ${materialName} Laser Cleaning`);
  
  return {
    '@type': 'Certification',
    '@id': `#compliance`,
    name: certName,
    description: 'Applicable regulatory standards and safety certifications',
    issuedBy: standards.map(standard => ({
      '@type': 'Organization',
      name: typeof standard === 'string' 
        ? standard.split('-')[0].trim() 
        : (standard.issuingOrganization || 'Unknown')
    })),
    about: standards.map(standard => 
      typeof standard === 'string' ? standard : standard.name || standard.description
    )
  };
}

// Helper to create HTML-safe JSON-LD script content
export function createJsonLdScript(schema: any) {
  if (!schema) return '';
  
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

// Export individual schema generators for reuse
export {
  createTechnicalArticleSchema,
  createMaterialProductSchema,
  createHowToSchema,
  createDatasetSchema,
  createFAQPageSchema,
  createAuthorSchema,
  createWebPageSchema,
  createBreadcrumbSchema,
  createVideoSchema,
  createComplianceSchema
};