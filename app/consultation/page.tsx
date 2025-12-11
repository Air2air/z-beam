// app/consultation/page.tsx
import { Layout } from "../components/Layout/Layout";
import { JsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '../utils/constants';
import { ConsultationContent } from '../components/Consultation/ConsultationContent';
import { SchemaRegistry } from '../utils/schemas/registry';

export const metadata = {
  title: 'Schedule a Consultation - Z-Beam Laser Cleaning',
  description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts. Get personalized advice on laser cleaning solutions for your industrial applications.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/consultation`,
  },
  openGraph: {
    title: 'Schedule a Consultation - Z-Beam Laser Cleaning',
    description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts. Get personalized advice on laser cleaning solutions for your industrial applications.',
    url: `${SITE_CONFIG.url}/consultation`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-consultation.jpg`,
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

export default async function ConsultationPage() {
  const { metadata: pageMetadata } = await loadPageData('consultation');
  
  // Generate schema using centralized registry
  const consultationSchema = SchemaRegistry.getPageSchemas('consultation');
  
  return (
    <>
      <JsonLD data={consultationSchema} />
      <Layout
        title="Schedule Your Free Consultation"
        description="Schedule a free consultation with our laser cleaning experts"
        rightContent={null}
        metadata={{
          ...pageMetadata,
          breadcrumb: [
            { label: 'Home', href: '/' },
            { label: 'Consultation', href: '/consultation' }
          ]
        } as any}
        slug="consultation"
      >
        <ConsultationContent />
      </Layout>
    </>
  );
}
