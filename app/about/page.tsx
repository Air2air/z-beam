// app/about/page.tsx
import { Layout } from '../components/Layout/Layout';
import { JsonLD } from '../components/JsonLD/JsonLD';
import { RentalPricingBanner } from '../components/RentalPricing';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '@/app/config/site';

export const metadata = {
  title: 'Laser Cleaning Equipment Rental Experts | Z-Beam Since 2020',
  description: `Industrial laser cleaning equipment rental since 2020. Self-service solutions for aerospace, marine & heritage projects. EPA-compliant, zero-waste technology. Training and support included.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    title: 'Laser Cleaning Equipment Rental Since 2020 | Z-Beam',
    description: `Industrial equipment rental since 2020. Self-service laser cleaning for 500+ aerospace, marine & heritage projects. Training and support included.`,
    url: `${SITE_CONFIG.url}/about`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-about.jpg`,
        width: 1200,
        height: 630,
        alt: `About ${SITE_CONFIG.shortName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laser Cleaning Equipment Rental Since 2020 | Z-Beam',
    description: `Industrial equipment rental since 2020. Self-service for 500+ projects. Training and support included. EPA-compliant.`,
  },
};

// Default export - the page component using standard Layout pattern
export default async function AboutPage() {
  const { metadata: pageMetadata, components } = await loadPageData('about');
  
  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_CONFIG.url
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: `${SITE_CONFIG.url}/about`
      }
    ]
  };

  // Generate AboutPage schema
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Z-Beam Equipment Rental',
    description: 'Learn about Z-Beam\'s industrial laser cleaning equipment rental service with comprehensive training and technical support',
    url: `${SITE_CONFIG.url}/about`,
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.name,
      description: 'Industrial laser cleaning equipment rental with training and support since 2020',
      url: SITE_CONFIG.url,
      foundingDate: '2020',
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: 10
      },
      areaServed: [
        {
          '@type': 'State',
          name: 'California'
        },
        {
          '@type': 'State',
          name: 'Arizona'
        },
        {
          '@type': 'State',
          name: 'Nevada'
        },
        {
          '@type': 'State',
          name: 'Oregon'
        }
      ]
    }
  };
  
  return (
    <>
      <JsonLD data={breadcrumbSchema} />
      <JsonLD data={aboutSchema} />
      <Layout
        components={components}
        metadata={pageMetadata as unknown as ArticleMetadata}
        slug="about"
      >
        <RentalPricingBanner />
      </Layout>
    </>
  );
}
