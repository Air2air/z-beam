import { SITE_CONFIG } from './constants';

/**
 * Enhanced JSON-LD Schema Generator with Full Frontmatter Integration
 * Optimized for Google E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * 
 * E-E-A-T Implementation:
 * - Experience: Detailed process data, real-world applications, outcome metrics
 * - Expertise: Author credentials, technical specifications, confidence scores
 * - Authoritativeness: Source citations, regulatory standards, industry references
 * - Trustworthiness: Verification metadata, data provenance, transparent confidence levels
 */
export function createJsonLdForArticle(articleData: any, slug: string) {
  try {
    if (!articleData) {
      console.warn('No article data provided for JSON-LD generation');
      return null;
    }
    
    const metadata = articleData.metadata || {};
    const frontmatter = articleData.frontmatter || metadata;
    
    // Extract all frontmatter data
    const materialProperties = frontmatter.materialProperties || {};
    const machineSettings = frontmatter.machineSettings || {};
    const author = frontmatter.author || {};
    const images = frontmatter.images || {};
    const applications = frontmatter.applications || [];
    const environmentalImpact = frontmatter.environmentalImpact || [];
    const outcomeMetrics = frontmatter.outcomeMetrics || [];
    const regulatoryStandards = frontmatter.regulatoryStandards || [];
    const caption = frontmatter.caption || {};
    
    // Basic info
    const title = frontmatter.title || metadata.title || 'Material Guide';
    const description = frontmatter.description || metadata.description || '';
    const subtitle = frontmatter.subtitle || '';
    const materialName = frontmatter.name || title.replace(/\s*Laser Cleaning$/i, '');
    const category = frontmatter.category || metadata.category || 'material';
    const subcategory = frontmatter.subcategory || '';
    
    // Dates
    const currentDate = new Date().toISOString();
    const publishDate = frontmatter.datePublished || metadata.datePublished || currentDate;
    const modifiedDate = frontmatter.dateModified || metadata.dateModified || currentDate;
    
    // Build comprehensive schema using @graph pattern
    const baseUrl = SITE_CONFIG.url || 'https://z-beam.com';
    const pageUrl = `${baseUrl}/${slug}`;
    
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        // 1. Main TechnicalArticle (E-E-A-T: Experience & Expertise)
        createTechnicalArticleSchema(
          { title, description, subtitle, pageUrl, publishDate, modifiedDate, author, images, caption, applications }
        ),
        
        // 2. Material Product Schema (E-E-A-T: Authoritativeness)
        createMaterialProductSchema(
          { materialName, category, subcategory, description, pageUrl, materialProperties, applications, environmentalImpact, images }
        ),
        
        // 3. HowTo Schema (E-E-A-T: Experience)
        createHowToSchema(
          { materialName, machineSettings, outcomeMetrics, pageUrl }
        ),
        
        // 4. Dataset Schema for Material Properties (E-E-A-T: Trustworthiness)
        createDatasetSchema(
          { materialName, materialProperties, pageUrl, modifiedDate }
        ),
        
        // 5. FAQPage Schema (E-E-A-T: Expertise & User Intent)
        createFAQPageSchema(
          { materialName, category, subcategory, materialProperties, machineSettings, applications, environmentalImpact, outcomeMetrics, pageUrl }
        ),
        
        // 6. BreadcrumbList
        createBreadcrumbSchema(slug, title, category),
        
        // 7. WebPage
        createWebPageSchema(pageUrl, title, description, publishDate, modifiedDate),
        
        // 8. Author/Expert Profile (E-E-A-T: Expertise & Authoritativeness)
        createAuthorSchema(author),
        
        // 9. Regulatory Compliance (E-E-A-T: Trustworthiness)
        ...(regulatoryStandards.length > 0 ? [createComplianceSchema(regulatoryStandards, materialName)] : [])
      ].filter(Boolean) // Remove any null/undefined entries
    };
    
    return schema;
    
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
  const { title, description, subtitle, pageUrl, publishDate, modifiedDate, author, images, caption, applications } = data;
  const baseUrl = SITE_CONFIG.url;
  
  return {
    '@type': 'TechnicalArticle',
    '@id': `${pageUrl}#article`,
    headline: title,
    description: description || subtitle,
    abstract: subtitle,
    articleBody: caption?.beforeText ? `${caption.beforeText}\n\n${caption.afterText}` : description,
    
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
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512
      }
    },
    
    // Dates for freshness signals
    datePublished: publishDate,
    dateModified: modifiedDate,
    
    // Images
    ...(images?.hero?.url && {
      image: {
        '@type': 'ImageObject',
        url: `${baseUrl}${images.hero.url}`,
        caption: images.hero.alt || caption?.description
      }
    }),
    
    // Article metadata
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    
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
  const { materialName, category, subcategory, description, pageUrl, materialProperties, applications, environmentalImpact, images } = data;
  
  // Extract properties from categorized structure
  const properties: any[] = [];
  
  if (materialProperties) {
    Object.entries(materialProperties).forEach(([categoryKey, categoryData]: [string, any]) => {
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
      caption: images.hero.alt || description
    });
  }
  
  return {
    '@type': 'Product',
    '@id': `${pageUrl}#material`,
    name: materialName,
    description: description,
    category: `${category}${subcategory ? ` - ${subcategory}` : ''}`,
    
    // Brand/Manufacturer (required by Google)
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.shortName || 'Z-Beam'
    },
    
    // Product image (required by Google)
    image: productImages,
    
    // Material-specific properties with confidence scores (E-E-A-T: Trustworthiness)
    additionalProperty: properties,
    
    // Applications as use cases
    applicationCategory: applications,
    
    // SKU based on material name
    sku: `LASER-CLEAN-${materialName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
    
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
      description: `Professional laser cleaning service for ${materialName}. Contact for custom quote based on project requirements.`
    },
    
    // Environmental benefits (E-E-A-T: Experience)
    ...(environmentalImpact.length > 0 && {
      sustainability: environmentalImpact.map((impact: any) => ({
        '@type': 'DefinedTerm',
        name: impact.benefit,
        description: impact.description,
        ...(impact.quantifiedBenefits && { value: impact.quantifiedBenefits })
      }))
    })
  };
}

// 3. HowTo Schema (E-E-A-T: Experience with detailed process)
function createHowToSchema(data: any) {
  const { materialName, machineSettings, outcomeMetrics, pageUrl } = data;
  
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
  
  return steps.length > 0 ? {
    '@type': 'HowTo',
    '@id': `${pageUrl}#howto`,
    name: `How to Clean ${materialName} with Laser`,
    description: `Step-by-step process for laser cleaning ${materialName} surfaces`,
    step: steps,
    
    // Expected outcomes (E-E-A-T: Experience)
    ...(outcomeMetrics.length > 0 && {
      expectedOutput: outcomeMetrics.map((metric: any) => ({
        '@type': 'DefinedTerm',
        name: metric.metric,
        description: metric.description,
        ...(metric.typicalRanges && { value: metric.typicalRanges })
      }))
    }),
    
    // Time estimate
    totalTime: 'PT15M',
    
    // Supply needed
    supply: {
      '@type': 'HowToSupply',
      name: 'Laser Cleaning System'
    }
  } : null;
}

// 4. Dataset Schema (E-E-A-T: Trustworthiness with data provenance)
function createDatasetSchema(data: any) {
  const { materialName, materialProperties, pageUrl, modifiedDate } = data;
  
  // Calculate total property count
  let propertyCount = 0;
  const measurements: any[] = [];
  
  if (materialProperties) {
    Object.entries(materialProperties).forEach(([categoryKey, categoryData]: [string, any]) => {
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
              '@type': 'Observation',
              measuredProperty: propKey,
              measuredValue: {
                '@type': 'QuantitativeValue',
                value: propData.value,
                unitText: propData.unit
              },
              // E-E-A-T: Trustworthiness - verification metadata
              ...(propData.metadata?.last_verified && {
                observationDate: propData.metadata.last_verified
              }),
              ...(propData.source && { citation: propData.source })
            });
          }
        });
      }
    });
  }
  
  return propertyCount > 0 ? {
    '@type': 'Dataset',
    '@id': `${pageUrl}#dataset`,
    name: `${materialName} Material Properties Dataset`,
    description: `Comprehensive material properties and laser cleaning parameters for ${materialName}`,
    
    // E-E-A-T: Trustworthiness - data provenance
    dateModified: modifiedDate,
    version: '1.0',
    
    // Dataset size
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/ld+json',
      contentUrl: pageUrl
    },
    
    // Measurements with confidence scores
    variableMeasured: measurements.slice(0, 10), // Limit to top 10 for size
    
    // Publisher
    creator: {
      '@type': 'Organization',
      name: SITE_CONFIG.shortName || 'Z-Beam'
    },
    
    // License
    license: 'https://creativecommons.org/licenses/by/4.0/'
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

// 6. FAQPage Schema (E-E-A-T: Expertise through detailed Q&A)
function createFAQPageSchema(data: any) {
  const { materialName, category, subcategory, materialProperties, machineSettings, applications, environmentalImpact, outcomeMetrics, pageUrl } = data;
  
  const faqs: any[] = [];
  
  // Extract key properties
  const matChar = materialProperties?.material_characteristics || {};
  const laserInteraction = materialProperties?.laser_material_interaction || {};
  
  // FAQ 1: Unique challenge
  const hardness = matChar?.hardness?.value;
  const thermalCond = matChar?.thermalConductivity?.value;
  
  if (hardness && hardness > 1000) {
    faqs.push({
      '@type': 'Question',
      name: `What makes ${materialName} challenging to laser clean?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${materialName} is an extremely hard material (${hardness} ${matChar.hardness.unit}), making it resistant to mechanical cleaning methods. Laser cleaning uses controlled energy pulses that ablate only the contamination layer while preserving the base material's hardness and surface finish.`
      }
    });
  }
  
  // FAQ 2: Wavelength selection
  const wavelength = machineSettings?.wavelength?.value;
  const absorption = laserInteraction?.laserAbsorption?.value;
  
  if (wavelength && absorption) {
    faqs.push({
      '@type': 'Question',
      name: `Why is ${wavelength} nm wavelength recommended for ${materialName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${materialName} has ${absorption}% laser absorption at ${wavelength} nm, making this wavelength highly efficient for energy coupling into surface contaminants. This allows effective cleaning at lower power levels while minimizing thermal stress on the base material.`
      }
    });
  }
  
  // FAQ 3: Thermal safety
  const thermalDest = matChar?.thermalDestruction?.value;
  const pulseWidth = machineSettings?.pulseWidth?.value;
  
  if (thermalDest && pulseWidth) {
    faqs.push({
      '@type': 'Question',
      name: `Can laser cleaning damage ${materialName} through overheating?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${materialName} has a thermal limit of ${thermalDest}°C. Using ${pulseWidth} ${machineSettings.pulseWidth.unit} pulses ensures heat input is confined to the contamination layer with minimal thermal diffusion into the base material, staying safely below critical thresholds.`
      }
    });
  }
  
  // FAQ 4: Application-specific
  if (applications && applications.length > 0) {
    const keyApp = applications[0];
    faqs.push({
      '@type': 'Question',
      name: `Why is laser cleaning preferred for ${materialName} in ${keyApp} applications?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${keyApp} applications demand ultra-clean surfaces free from contamination. Laser cleaning of ${materialName} achieves precision cleaning without introducing secondary contamination from abrasives or chemicals, while preserving tight tolerances critical for ${category.toLowerCase()} components.`
      }
    });
  }
  
  // FAQ 5: Environmental benefits
  if (environmentalImpact && environmentalImpact.length > 0) {
    faqs.push({
      '@type': 'Question',
      name: `What are the environmental benefits of laser cleaning ${materialName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Laser cleaning ${materialName} is a dry, chemical-free process that eliminates hazardous waste streams, requires no water consumption, and produces minimal waste. This supports sustainable manufacturing while reducing operating costs.`
      }
    });
  }
  
  return faqs.length > 0 ? {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqs
  } : null;
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

// 8. Regulatory Compliance Schema (E-E-A-T: Trustworthiness)
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