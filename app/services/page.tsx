// app/services/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/config";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Professional Laser Cleaning Services | ${SITE_CONFIG.name}`,
  description: `Professional on-site laser cleaning services. Expert technicians, state-of-the-art equipment, and comprehensive industrial cleaning solutions.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/services`,
  },
  openGraph: {
    title: `Professional Laser Cleaning Services | ${SITE_CONFIG.name}`,
    description: `Professional on-site laser cleaning services. Expert technicians, state-of-the-art equipment, and comprehensive industrial cleaning solutions.`,
    url: `${SITE_CONFIG.url}/services`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-services.jpg`,
        width: 1200,
        height: 630,
        alt: 'Professional Laser Cleaning Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Professional Laser Cleaning Services | ${SITE_CONFIG.name}`,
    description: `Professional on-site laser cleaning with expert technicians.`,
  },
};

export default async function ServicesPage() {
  const pricing = SITE_CONFIG.pricing.professionalCleaning;
  
  // Service JSON-LD Schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      // Main Service Schema
      {
        '@type': 'Service',
        '@id': `${SITE_CONFIG.url}/services#service`,
        'name': pricing.label,
        'description': 'Professional on-site laser cleaning service with experienced technicians and state-of-the-art equipment. Specializing in industrial surface preparation, rust removal, coating removal, and precision cleaning for aerospace, automotive, and manufacturing industries.',
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
          '@type': 'Offer',
          'price': pricing.hourlyRate,
          'priceCurrency': pricing.currency,
          'priceSpecification': {
            '@type': 'UnitPriceSpecification',
            'price': pricing.hourlyRate,
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
      },
      
      // Breadcrumb Schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/services#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': SITE_CONFIG.url
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Services',
            'item': `${SITE_CONFIG.url}/services`
          }
        ]
      },
      
      // WebPage Schema
      {
        '@type': 'WebPage',
        '@id': `${SITE_CONFIG.url}/services`,
        'name': metadata.title,
        'description': metadata.description,
        'url': `${SITE_CONFIG.url}/services`,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${SITE_CONFIG.url}#website`
        },
        'breadcrumb': {
          '@id': `${SITE_CONFIG.url}/services#breadcrumb`
        },
        'mainEntity': {
          '@id': `${SITE_CONFIG.url}/services#service`
        }
      }
    ]
  };
  
  return (
    <>
      <JsonLD data={serviceSchema} />
      <StaticPage 
        slug="services" 
        fallbackTitle="Professional Laser Cleaning Services"
        fallbackDescription={metadata.description}
      />
    </>
  );
}
