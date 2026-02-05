// app/rental/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { SITE_CONFIG } from "@/app/config/site";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import { RENTAL_DATA } from '@/app/utils/staticPageData.generated';
import type { ContentCardItem } from '@/types';

export const metadata = {
  title: 'Laser Equipment Rental | Delivered to Your Location | Z-Beam',
  description: 'Professional laser cleaning equipment delivered to your location in California. Outdoor: $390/hr, Indoor: $460/hr. 2-hour minimum. Includes training, safety gear, and 24/7 support.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/rental`,
  },
  openGraph: {
    title: 'Laser Equipment Rental | Delivered to Your Location | Z-Beam',
    description: 'Professional laser cleaning equipment delivered to your location. Outdoor: $390/hr, Indoor: $460/hr. 2-hour minimum. Training and support included.',
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
    title: 'Laser Equipment Rental | Delivered to Your Location | Z-Beam',
    description: 'Professional laser equipment delivered to your location in California. Outdoor: $390/hr, Indoor: $460/hr. 2-hour minimum.',
  },
};

export default function RentalPage() {
  const pricing = SITE_CONFIG.pricing.equipmentRental;
  const { packages, minimumHours, currency } = pricing;
  
  // Load rental page configuration from pre-loaded static data
  const pageConfig = RENTAL_DATA;
  
  // Equipment Rental Service JSON-LD Schema
  const rentalSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      // Main Service Schema - Outdoor Package
      {
        '@type': 'Service',
        '@id': `${SITE_CONFIG.url}/rental#outdoor-service`,
        'name': packages.outdoor.label,
        'description': `${packages.outdoor.description}. $${packages.outdoor.hourlyRate}/hour with ${minimumHours}-hour minimum. Includes equipment delivery, on-site training, 24/7 technical support, and all necessary safety equipment.`,
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
        'serviceType': 'Equipment Rental - Outdoor',
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
          'price': packages.outdoor.hourlyRate,
          'priceCurrency': currency,
          'priceSpecification': {
            '@type': 'UnitPriceSpecification',
            'price': packages.outdoor.hourlyRate,
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
          'Laser Cleaning Equipment',
          'Outdoor Applications'
        ],
        'termsOfService': `${SITE_CONFIG.url}/rental`
      },
      
      // Main Service Schema - Indoor Package
      {
        '@type': 'Service',
        '@id': `${SITE_CONFIG.url}/rental#indoor-service`,
        'name': packages.indoor.label,
        'description': `${packages.indoor.description}. $${packages.indoor.hourlyRate}/hour with ${minimumHours}-hour minimum. Includes equipment delivery, on-site training, 24/7 technical support, and all necessary safety equipment.`,
        'provider': {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}#organization`
        },
        'serviceType': 'Equipment Rental - Indoor',
        'areaServed': {
          '@type': 'Country',
          'name': 'United States'
        },
        'availableChannel': {
          '@type': 'ServiceChannel',
          'serviceUrl': `${SITE_CONFIG.url}/contact`,
          'servicePhone': SITE_CONFIG.contact.sales.phoneHref
        },
        'offers': {
          '@type': 'Offer',
          'price': packages.indoor.hourlyRate,
          'priceCurrency': currency,
          'priceSpecification': {
            '@type': 'UnitPriceSpecification',
            'price': packages.indoor.hourlyRate,
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
          'Laser Cleaning Equipment',
          'Indoor Applications'
        ],
        'termsOfService': `${SITE_CONFIG.url}/rental`
      },
      
      // Product Schema for Rental Equipment
      {
        '@type': 'Product',
        '@id': `${SITE_CONFIG.url}/rental#equipment`,
        'name': 'Laser Cleaning Equipment',
        'description': `Professional Netalux laser cleaning systems delivered to your location for rent. Choose from Outdoor Package ($${packages.outdoor.hourlyRate}/hour) or Indoor Package ($${packages.indoor.hourlyRate}/hour). ${minimumHours}-hour minimum.`,
        'brand': {
          '@type': 'Brand',
          'name': 'Netalux'
        },
        'offers': [
          {
            '@type': 'Offer',
            'name': packages.outdoor.label,
            'price': packages.outdoor.hourlyRate,
            'priceCurrency': currency,
            'availability': 'https://schema.org/InStock',
            'url': `${SITE_CONFIG.url}/rental`
          },
          {
            '@type': 'Offer',
            'name': packages.indoor.label,
            'price': packages.indoor.hourlyRate,
            'priceCurrency': currency,
            'availability': 'https://schema.org/InStock',
            'url': `${SITE_CONFIG.url}/rental`
          }
        ],
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
  
  return (
    <>
      <JsonLD data={rentalSchema} />
      <Layout
        title={pageConfig.title || "Laser Cleaning Equipment Rental"}
        pageDescription={pageConfig.description}
        metadata={pageConfig}
        slug="rental"
      >
        {pageConfig.contentCards && pageConfig.contentCards.length > 0 && (
          <ContentSection items={pageConfig.contentCards as ContentCardItem[]} />
        )}
      </Layout>
    </>
  );
}
