// app/rental/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { SITE_CONFIG } from "@/app/config";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Laser Cleaning Equipment Rental | ${SITE_CONFIG.shortName}`,
  description: `Rent professional laser cleaning equipment. Flexible daily, weekly, or monthly terms with training and 24/7 support included.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/rental`,
  },
  openGraph: {
    title: `Laser Cleaning Equipment Rental | ${SITE_CONFIG.shortName}`,
    description: `Rent professional laser cleaning equipment. Flexible daily, weekly, or monthly terms with training and 24/7 support included.`,
    url: `${SITE_CONFIG.url}/rental`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-rental.jpg`,
        width: 1200,
        height: 630,
        alt: 'Laser Cleaning Equipment Rental',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Laser Cleaning Equipment Rental | ${SITE_CONFIG.shortName}`,
    description: `Rent professional laser cleaning equipment with flexible terms.`,
  },
};

export default async function RentalPage() {
  const pricing = SITE_CONFIG.pricing.equipmentRental;
  
  // Equipment Rental Service JSON-LD Schema
  const rentalSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      // Main Service Schema
      {
        '@type': 'Service',
        '@id': `${SITE_CONFIG.url}/rental#service`,
        'name': pricing.label,
        'description': 'Professional laser cleaning equipment rental with flexible terms. Rent Netalux Needle® and Jango® systems for industrial applications. Includes training, 24/7 technical support, and nationwide shipping. Perfect for project-based needs without capital expense.',
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
        'serviceType': 'Equipment Rental',
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
            'unitText': pricing.unit,
            'referenceQuantity': {
              '@type': 'QuantitativeValue',
              'value': 1,
              'unitText': pricing.unit
            }
          },
          'availability': 'https://schema.org/InStock',
          'url': `${SITE_CONFIG.url}/rental`,
          'seller': {
            '@type': 'Organization',
            '@id': `${SITE_CONFIG.url}#organization`
          },
          'eligibleDuration': {
            '@type': 'QuantitativeValue',
            'value': 1,
            'unitText': 'hour',
            'minValue': 1
          },
          'additionalProperty': [
            {
              '@type': 'PropertyValue',
              'name': 'Rental Terms',
              'value': 'Daily, Weekly, or Monthly'
            },
            {
              '@type': 'PropertyValue',
              'name': 'Included Services',
              'value': 'Training, 24/7 Support, Nationwide Shipping'
            }
          ]
        },
        'category': [
          'Equipment Rental',
          'Laser Cleaning Equipment',
          'Industrial Equipment',
          'Netalux Systems'
        ],
        'termsOfService': `${SITE_CONFIG.url}/rental`,
        'slogan': 'Premium Equipment, Flexible Terms'
      },
      
      // Product Schema for Rental Equipment
      {
        '@type': 'Product',
        '@id': `${SITE_CONFIG.url}/rental#equipment`,
        'name': 'Laser Cleaning Equipment',
        'description': 'Professional Netalux laser cleaning systems available for rent. State-of-the-art technology for rust removal, coating removal, and surface preparation.',
        'brand': {
          '@type': 'Brand',
          'name': 'Netalux'
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
          'url': `${SITE_CONFIG.url}/rental`
        },
        'category': 'Industrial Laser Equipment'
      },
      
      // Breadcrumb Schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/rental#breadcrumb`,
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
            'name': 'Equipment Rental',
            'item': `${SITE_CONFIG.url}/rental`
          }
        ]
      },
      
      // WebPage Schema
      {
        '@type': 'WebPage',
        '@id': `${SITE_CONFIG.url}/rental`,
        'name': metadata.title,
        'description': metadata.description,
        'url': `${SITE_CONFIG.url}/rental`,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${SITE_CONFIG.url}#website`
        },
        'breadcrumb': {
          '@id': `${SITE_CONFIG.url}/rental#breadcrumb`
        },
        'mainEntity': {
          '@id': `${SITE_CONFIG.url}/rental#service`
        }
      }
    ]
  };
  
  // Load rental page configuration from YAML
  const yamlPath = path.join(process.cwd(), 'static-pages', 'rental.yaml');
  const yamlContent = await fs.readFile(yamlPath, 'utf8');
  const pageConfig = yaml.load(yamlContent) as ArticleMetadata & { contentCards?: any[] };
  
  return (
    <>
      <JsonLD data={rentalSchema} />
      <Layout
        title={pageConfig.title || "Laser Cleaning Equipment Rental"}
        description={pageConfig.description || metadata.description}
        metadata={pageConfig}
        slug="rental"
      >
        {pageConfig.contentCards && pageConfig.contentCards.length > 0 && (
          <ContentSection items={pageConfig.contentCards} />
        )}
      </Layout>
    </>
  );
}
