// app/about/page.tsx
import { Layout } from '../components/Layout/Layout';
import { JsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '@/app/config/site';

export const metadata = {
  title: 'Bay Area Laser Cleaning Experts | Z-Beam Since 2020',
  description: `Bay Area precision laser cleaning since 2020. 500+ aerospace, marine & heritage projects. EPA-compliant, zero-waste process. Trusted for critical applications.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    title: 'Bay Area Laser Cleaning Experts Since 2020 | Z-Beam',
    description: `Bay Area precision laser cleaning since 2020. 500+ aerospace, marine & heritage projects. EPA-compliant, zero-waste process.`,
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
    title: 'Bay Area Laser Cleaning Experts Since 2020 | Z-Beam',
    description: `Precision laser cleaning since 2020. 500+ aerospace, marine & heritage projects. EPA-compliant, zero-waste.`,
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
    name: 'About Z-Beam Laser Cleaning',
    description: 'Learn about Z-Beam\'s mission, team, and expertise in laser cleaning technology for industrial applications',
    url: `${SITE_CONFIG.url}/about`,
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.name,
      description: 'Bay Area precision laser cleaning since 2020',
      url: SITE_CONFIG.url,
      foundingDate: '2020',
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: 10
      },
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 37.7749,
          longitude: -122.4194
        },
        geoRadius: '100'
      }
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
      />
    </>
  );
}
