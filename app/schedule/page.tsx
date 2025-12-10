// app/schedule/page.tsx
import { Layout } from "../components/Layout/Layout";
import { JsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '../utils/constants';
import { ScheduleContent } from '../components/Schedule/ScheduleContent';

export const metadata = {
  title: 'Schedule a Consultation - Z-Beam Laser Cleaning',
  description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts. Get personalized advice on laser cleaning solutions for your industrial applications.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/schedule`,
  },
  openGraph: {
    title: 'Schedule a Consultation - Z-Beam Laser Cleaning',
    description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts. Get personalized advice on laser cleaning solutions for your industrial applications.',
    url: `${SITE_CONFIG.url}/schedule`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-schedule.jpg`,
        width: 1200,
        height: 630,
        alt: 'Schedule a Consultation with Z-Beam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schedule a Consultation - Z-Beam Laser Cleaning',
    description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts.',
  },
};

export default async function SchedulePage() {
  const { metadata: pageMetadata } = await loadPageData('schedule');
  
  // Generate schema for schedule page
  const scheduleSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Schedule a Consultation',
    description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts',
    url: `${SITE_CONFIG.url}/schedule`,
    mainEntity: {
      '@type': 'Service',
      name: 'Laser Cleaning Consultation',
      description: 'Free consultation with laser cleaning experts',
      provider: {
        '@type': 'Organization',
        '@id': `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free 30-minute consultation'
      }
    }
  };
  
  return (
    <>
      <JsonLD data={scheduleSchema} />
      <Layout
        title="Schedule a Consultation"
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
