// app/rental/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { ComparisonTable } from "../components/ComparisonTable";
import type { ComparisonMethod } from "../components/ComparisonTable";
import { BaseSection } from "../components/BaseSection";
import { SITE_CONFIG } from "@/app/config/site";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import { RENTAL_DATA } from '@/app/utils/staticPageData.generated';
import type { ContentCardItem } from '@/types';
import comparisonMethodsData from '@/data/comparison-methods.json';

export const metadata = {
  title: 'Laser Equipment Rental | Delivered to Your Location',
  description: 'Professional laser equipment delivered to your location in California. Starting at $390/hr with 2-hour minimum. Includes training and support.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/rental`,
  },
  openGraph: {
    title: 'Laser Equipment Rental | Delivered to Your Location',
    description: 'Professional laser equipment delivered to your location. Starting at $390/hr with 2-hour minimum. Includes training and support.',
    url: `${SITE_CONFIG.url}/rental`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/pages/rental.png`,
        width: 1200,
        height: 630,
        alt: 'Laser Cleaning Equipment Rental',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laser Equipment Rental | Delivered to Your Location',
    description: 'Professional laser equipment delivered to your location. Starting at $390/hr with 2-hour minimum. Includes training and support.',
  },
};

// Image Schema for rental page
const imageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ImageObject',
  '@id': `${SITE_CONFIG.url}/images/pages/rental.png#image`,
  'contentUrl': `${SITE_CONFIG.url}/images/pages/rental.png`,
  'url': `${SITE_CONFIG.url}/images/pages/rental.png`,
  'width': '1200',
  'height': '630',
  'caption': 'Laser Cleaning Equipment Rental - Professional equipment delivered to your location',
  'description': 'Professional laser cleaning equipment rental services starting at $390/hour',
  'creator': {
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}#organization`,
    'name': SITE_CONFIG.name,
    'url': SITE_CONFIG.url
  },
  'copyrightNotice': `© ${new Date().getFullYear()} ${SITE_CONFIG.name}. All rights reserved.`,
  'creditText': SITE_CONFIG.name,
  'license': `${SITE_CONFIG.url}/terms`,
  'acquireLicensePage': `${SITE_CONFIG.url}/contact`
};

export default function RentalPage() {
  const pricing = SITE_CONFIG.pricing.equipmentRental;
  const { hourlyRate, minimumHours, currency } = pricing;
  
  // Load rental page configuration from pre-loaded static data
  const pageConfig = RENTAL_DATA;
  
  // Silicon Valley Comparison Data - loaded from JSON
  const siliconValleyComparison: ComparisonMethod[] = comparisonMethodsData as ComparisonMethod[];
  
  // Equipment Rental Service JSON-LD Schema
  const rentalSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      // Main Equipment Rental Service Schema
      {
        '@type': 'Service',
        '@id': `${SITE_CONFIG.url}/rental#service`,
        'name': 'Laser Cleaning Equipment Rental',
        'description': `Professional laser cleaning equipment rental service. Starting at $${hourlyRate}/hour with ${minimumHours}-hour minimum. Includes equipment delivery, on-site training, 24/7 technical support, and all necessary safety equipment.`,
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
          'price': hourlyRate,
          'priceCurrency': currency,
          'priceSpecification': {
            '@type': 'UnitPriceSpecification',
            'price': hourlyRate,
            'priceCurrency': currency,
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
            'value': minimumHours,
            'unitText': 'hour',
            'minValue': minimumHours
          }
        },
        'category': [
          'Equipment Rental',
          'Laser Cleaning Equipment'
        ],
        'termsOfService': `${SITE_CONFIG.url}/rental`
      },
      
      // Product Schema for Rental Equipment
      {
        '@type': 'Product',
        '@id': `${SITE_CONFIG.url}/rental#equipment`,
        'name': 'Laser Cleaning Equipment',
        'description': `Professional Netalux laser cleaning systems delivered to your location for rent. Starting at $${hourlyRate}/hour with ${minimumHours}-hour minimum.`,
        'brand': {
          '@type': 'Brand',
          'name': 'Netalux'
        },
        'offers': {
          '@type': 'Offer',
          'name': 'Laser Cleaning Equipment Rental',
          'price': hourlyRate,
          'priceCurrency': currency,
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
            'name': 'Services',
            'item': `${SITE_CONFIG.url}/rental`
          },
          {
            '@type': 'ListItem',
            'position': 3,
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
      },
      
      // Image Schema
      imageSchema
    ]
  };
  
  return (
    <>
      <JsonLD data={rentalSchema} />
      <Layout
        title={pageConfig.title || "Laser Cleaning Equipment Rental"}
        pageDescription={pageConfig.description}
        metadata={pageConfig}
        slug="rental"
      >
        <BaseSection
          title="Surface Cleaning Comparison"
          description="Researched averages among California service providers. Greater ranges will exist"
        >
          <ComparisonTable
            methods={siliconValleyComparison}
            highlightMethod="Laser Cleaning"
          />
        </BaseSection>
      </Layout>
    </>
  );
}
