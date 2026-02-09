// app/equipment/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { SITE_CONFIG } from "@/app/config/site";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import { RENTAL_DATA } from '@/app/utils/staticPageData.generated';
import type { ContentCardItem } from '@/types';

export const metadata = {
  title: 'Laser Cleaning Equipment | Professional Industrial Systems',
  description: 'Professional laser cleaning equipment information. Comprehensive training, support, and system specifications. Contact us for more details.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/equipment`,
  },
  openGraph: {
    title: 'Laser Cleaning Equipment | Professional Industrial Systems',
    description: 'Professional laser cleaning equipment information. Comprehensive training, support, and system specifications.',
    url: `${SITE_CONFIG.url}/equipment`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/pages/equipment.png`,
        width: 1200,
        height: 630,
        alt: 'Laser Cleaning Equipment Sales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laser Cleaning Equipment | Z-Beam',
    description: 'Professional laser cleaning equipment information. Comprehensive training, support, and system specifications.',
  },
};

export default function EquipmentPage() {
  const pricing = SITE_CONFIG.pricing.equipmentRental;
  const { hourlyRate, minimumHours, currency } = pricing;
  
  // Load equipment page configuration from pre-loaded static data
  // Note: Using RENTAL_DATA as placeholder - should be updated to EQUIPMENT_DATA when available
  const pageConfig = RENTAL_DATA;
  
  // Equipment Sales Service JSON-LD Schema
  const equipmentSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      // Main Product Schema
      {
        '@type': 'Product',
        '@id': `${SITE_CONFIG.url}/equipment#product`,
        'name': 'Professional Laser Cleaning Equipment',
        'description': 'Industrial-grade laser cleaning systems for permanent installation. Includes comprehensive training, lifetime technical support, and complete system integration assistance.',
        'brand': {
          '@type': 'Brand',
          'name': 'Netalux'
        },
        'category': 'Industrial Laser Equipment',
        'offers': {
          '@type': 'Offer',
          'availability': 'https://schema.org/InStock',
          'url': `${SITE_CONFIG.url}/equipment`,
          'seller': {
            '@type': 'Organization',
            '@id': `${SITE_CONFIG.url}#organization`,
            'name': SITE_CONFIG.name,
            'url': SITE_CONFIG.url,
            'telephone': SITE_CONFIG.contact.sales.phone,
            'email': SITE_CONFIG.contact.sales.email
          }
        }
      },
      
      // Service Schema for Equipment
      {
        '@type': 'Service',
        '@id': `${SITE_CONFIG.url}/equipment#service`,
        'name': 'Laser Cleaning Equipment',
        'description': 'Professional laser cleaning equipment with comprehensive training, support, and complete system integration. Contact us for customized specifications.',
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
        'serviceType': 'Equipment',
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
        'category': [
          'Equipment',
          'Laser Cleaning Equipment',
          'Industrial Equipment'
        ]
      },
      
      // Breadcrumb Schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/equipment#breadcrumb`,
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
            'name': 'Equipment',
            'item': `${SITE_CONFIG.url}/equipment`
          }
        ]
      },
      
      // WebPage Schema
      {
        '@type': 'WebPage',
        '@id': `${SITE_CONFIG.url}/equipment`,
        'name': metadata.title,
        'description': metadata.description,
        'url': `${SITE_CONFIG.url}/equipment`,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${SITE_CONFIG.url}#website`
        },
        'breadcrumb': {
          '@id': `${SITE_CONFIG.url}/equipment#breadcrumb`
        },
        'mainEntity': {
          '@id': `${SITE_CONFIG.url}/equipment#product`
        }
      }
    ]
  };
  
  return (
    <>
      <JsonLD data={equipmentSchema} />
      <Layout
        title={pageConfig.title || "Laser Cleaning Equipment"}
        pageDescription={pageConfig.description}
        metadata={pageConfig}
        slug="equipment"
      >
        {pageConfig.contentCards && pageConfig.contentCards.length > 0 && (
          <ContentSection items={pageConfig.contentCards as ContentCardItem[]} />
        )}
      </Layout>
    </>
  );
}
