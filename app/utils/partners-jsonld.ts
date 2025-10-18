import { SITE_CONFIG } from './constants';

export interface Partner {
  order: number;
  heading: string;
  text: string;
  details: string[];
  image?: {
    url: string;
    alt: string;
  };
}

/**
 * Generate comprehensive JSON-LD for Partners page
 * Implements CollectionPage + Organization schemas
 */
export function createPartnersJsonLd(partners: Partner[]) {
  const baseUrl = SITE_CONFIG.url;
  const pageUrl = `${baseUrl}/partners`;
  
  // Extract partner details from the details array
  const extractDetail = (details: string[], prefix: string): string => {
    const detail = details.find(d => d.startsWith(prefix));
    return detail ? detail.replace(prefix, '').trim() : '';
  };
  
  // Map partners to Organization schemas
  const partnerOrganizations = partners.map((partner, index) => {
    const location = extractDetail(partner.details, 'Location:');
    const region = extractDetail(partner.details, 'Region:');
    const specialization = extractDetail(partner.details, 'Specialization:');
    const websiteUrl = extractDetail(partner.details, 'Website:');
    const fullUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    
    return {
      '@type': 'Organization',
      '@id': `${baseUrl}/partners#partner-${index + 1}`,
      name: partner.heading,
      description: partner.text,
      url: fullUrl,
      ...(partner.image && {
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}${partner.image.url}`,
          caption: partner.image.alt
        }
      }),
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressRegion: region
      },
      areaServed: {
        '@type': 'Place',
        name: region
      },
      knowsAbout: specialization,
      memberOf: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: baseUrl
      }
    };
  });
  
  // Main CollectionPage schema with @graph structure
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage (main page)
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        url: pageUrl,
        name: 'Z-Beam Laser Cleaning Partners',
        description: 'Trusted partners providing laser cleaning equipment, services, and training across North America and Europe.',
        inLanguage: 'en-US',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}#website`,
          url: baseUrl,
          name: SITE_CONFIG.name
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
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
              name: 'Partners',
              item: pageUrl
            }
          ]
        },
        hasPart: partnerOrganizations.map(org => ({ '@id': org['@id'] }))
      },
      
      // 2. Z-Beam as parent Organization
      {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: SITE_CONFIG.name,
        url: baseUrl,
        description: SITE_CONFIG.description,
        member: partnerOrganizations.map(org => ({ '@id': org['@id'] }))
      },
      
      // 3. Individual partner organizations
      ...partnerOrganizations
    ]
  };
}
