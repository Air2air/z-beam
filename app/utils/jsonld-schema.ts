interface MaterialData {
  title: string;
  description?: string;
  category?: string;
  keywords?: string[];
  author?: string;
  lastModified?: string;
  properties?: {
    density?: number;
    densityUnit?: string;
    thermalConductivity?: number;
    thermalConductivityUnit?: string;
    [key: string]: any;
  };
  applications?: string[];
  [key: string]: any;
}

/**
 * Generate Schema.org compliant JSON-LD for material pages
 * Follows EEAT principles (Expertise, Experience, Authoritativeness, Trustworthiness)
 */
export function createMaterialJsonLd(data: MaterialData, slug: string) {
  const baseUrl = 'https://z-beam.com';
  const pageUrl = `${baseUrl}/${slug}`;
  
  // Main material schema
  const materialSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.title,
    description: data.description || `Laser cleaning parameters and applications for ${data.title}`,
    url: pageUrl,
    identifier: slug,
    category: data.category || 'Material',
    
    // Brand/Publisher info (Trustworthiness)
    brand: {
      '@type': 'Brand',
      name: 'Z-Beam',
      url: baseUrl
    },
    
    // Author expertise (EEAT)
    author: {
      '@type': 'Person',
      name: data.author || 'Z-Beam Technical Team',
      description: 'Industrial laser cleaning specialists with expertise in material science and precision manufacturing'
    },
    
    // Additional properties
    additionalProperty: [] as Array<{
      '@type': string;
      name: string;
      value: string;
    }>,
    
    // Keywords for discoverability
    keywords: data.keywords?.join(', ') || data.title,
    
    // Dates
    dateModified: data.lastModified || new Date().toISOString(),
    datePublished: data.lastModified || new Date().toISOString(),
    
    // Applications (Experience)
    applicationCategory: data.applications || ['Industrial Cleaning', 'Surface Treatment'],
    
    // Publisher (Authoritativeness)
    publisher: {
      '@type': 'Organization',
      name: 'Z-Beam',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512
      }
    }
  };
  
  // Add material properties if available
  if (data.properties) {
    const props = data.properties;
    
    if (props.density) {
      materialSchema.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'Density',
        value: `${props.density} ${props.densityUnit || 'g/cm³'}`
      });
    }
    
    if (props.thermalConductivity) {
      materialSchema.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'Thermal Conductivity',
        value: `${props.thermalConductivity} ${props.thermalConductivityUnit || 'W/m·K'}`
      });
    }
  }
  
  // Create structured data array
  const structuredData = [materialSchema];
  
  // Add HowTo schema for laser cleaning process (Experience + Expertise)
  if (data.category) {
    const howToSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to Clean ${data.title} with Laser Technology`,
      description: `Professional laser cleaning process for ${data.title} materials`,
      totalTime: 'PT15M',
      supply: [
        {
          '@type': 'HowToSupply',
          name: 'Industrial Laser Cleaning System'
        },
        {
          '@type': 'HowToSupply', 
          name: 'Personal Protective Equipment'
        }
      ],
      step: [
        {
          '@type': 'HowToStep',
          name: 'Material Assessment',
          text: `Evaluate ${data.title} surface condition and contamination type`
        },
        {
          '@type': 'HowToStep',
          name: 'Parameter Configuration',
          text: 'Configure laser parameters based on material properties and cleaning requirements'
        },
        {
          '@type': 'HowToStep',
          name: 'Cleaning Process',
          text: 'Execute non-contact laser cleaning with real-time monitoring'
        },
        {
          '@type': 'HowToStep',
          name: 'Quality Verification',
          text: 'Inspect cleaned surface and verify specifications'
        }
      ]
    };
    
    structuredData.push(howToSchema);
  }
  
  return structuredData;
}

/**
 * Create JSON-LD script tag for Next.js pages
 */
export function createJsonLdScript(data: MaterialData, slug: string) {
  const jsonLd = createMaterialJsonLd(data, slug);
  
  return {
    __html: JSON.stringify(jsonLd, null, 2)
  };
}

/**
 * Create basic breadcrumb schema
 */
export function createBreadcrumbJsonLd(title: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://z-beam.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Materials',
        item: 'https://z-beam.com/materials'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `https://z-beam.com/${slug}`
      }
    ]
  };
}