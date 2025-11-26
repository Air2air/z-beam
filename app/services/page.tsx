// app/services/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { Services } from "../components/Services/Services";
import { SITE_CONFIG } from "@/app/config";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Laser Cleaning Services | Bay Area Mobile | Z-Beam',
  description: `Precision laser cleaning: no chemicals, no abrasives, no substrate damage. Faster setup than sandblasting, zero hazardous waste. Bay Area mobile service.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/services`,
  },
  openGraph: {
    title: 'Laser Cleaning Services | Bay Area Mobile | Z-Beam',
    description: `Precision laser cleaning: no chemicals, no abrasives, no substrate damage. Faster setup than sandblasting, zero hazardous waste. Bay Area mobile service.`,
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
    title: 'Laser Cleaning Services | Bay Area Mobile | Z-Beam',
    description: `Precision laser cleaning: no chemicals, no substrate damage. Faster than sandblasting. Bay Area service.`,
  },
};

export default async function ServicesPage() {
  const pricing = SITE_CONFIG.pricing.professionalCleaning;
  
  // Load services page configuration from YAML
  const yamlPath = path.join(process.cwd(), 'static-pages', 'services.yaml');
  const yamlContent = await fs.readFile(yamlPath, 'utf8');
  const pageConfig = yaml.load(yamlContent) as ArticleMetadata & { contentCards?: any[] };
  
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
      <Layout
        title={pageConfig.title || "Professional Laser Cleaning Services"}
        description={pageConfig.description || metadata.description}
        metadata={pageConfig}
        slug="services"
      >
        {pageConfig.contentCards && pageConfig.contentCards.length > 0 && (
          <ContentSection items={pageConfig.contentCards} />
        )}
        
        {/* Services Component */}
        <div className="mb-16">
          <Services />
        </div>
      </Layout>
    </>
  );
}
