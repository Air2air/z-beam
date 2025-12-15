// app/schedule/page.tsx
import { Layout } from "../components/Layout/Layout";
import { JsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '../utils/constants';
import { ScheduleContent } from '../components/Schedule/ScheduleContent';

export const metadata = {
  title: 'Schedule a Service - Z-Beam Laser Cleaning',
  description: 'Schedule laser cleaning services with Z-Beam. Book equipment rental, professional cleaning, or on-site services through our online booking portal.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/schedule`,
  },
  openGraph: {
    title: 'Schedule a Service - Z-Beam Laser Cleaning',
    description: 'Schedule laser cleaning services with Z-Beam. Book equipment rental, professional cleaning, or on-site services.',
    url: `${SITE_CONFIG.url}/schedule`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-schedule.jpg`,
        width: 1200,
        height: 630,
        alt: 'Schedule a Service with Z-Beam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schedule a Service - Z-Beam Laser Cleaning',
    description: 'Schedule laser cleaning services with Z-Beam.',
  },
};

export default async function SchedulePage() {
  const { metadata: pageMetadata } = await loadPageData('schedule');
  
  // Generate schema for schedule page
  const scheduleSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Schedule a Service',
    description: 'Schedule laser cleaning services with Z-Beam',
    url: `${SITE_CONFIG.url}/schedule`,
    mainEntity: {
      '@type': 'Service',
      name: 'Laser Cleaning Services',
      description: 'Professional laser cleaning, equipment rental, and on-site services',
      provider: {
        '@type': 'Organization',
        '@id': `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name
      },
      serviceType: 'Laser Cleaning',
      areaServed: 'United States'
    }
  };
  
  return (
    <>
      <JsonLD data={scheduleSchema} />
      <Layout
        title="Schedule Your Service"
        description=""
        rightContent={null}
        metadata={{
          ...pageMetadata,
          breadcrumb: [
            { label: 'Home', href: '/' },
            { label: 'Schedule', href: '/schedule' }
          ]
        } as any}
        slug="schedule"
      >
        <ScheduleContent />
      </Layout>
    </>
  );
}
