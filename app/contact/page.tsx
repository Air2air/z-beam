// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import { MaterialJsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import dynamic from 'next/dynamic';

import { SITE_CONFIG } from '../utils/constants';

const ContactForm = dynamic(() => import('../components/Contact/ContactForm').then(mod => ({ default: mod.ContactForm })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
  ssr: false,
});
import { ContactInfo } from "../components/Contact/ContactInfo";
import { Title } from "../components/Title";

export const metadata = {
  title: 'Get a Free Quote | Bay Area Laser Cleaning | Z-Beam',
  description: 'Precision laser cleaning quotes for aerospace, marine, automotive & heritage projects. No chemicals, no substrate damage. Same-day response. Bay Area mobile service.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
  openGraph: {
    title: 'Get a Free Quote | Bay Area Laser Cleaning | Z-Beam',
    description: 'Precision laser cleaning quotes for aerospace, marine, automotive & heritage. No chemicals, no substrate damage. Same-day response.',
    url: `${SITE_CONFIG.url}/contact`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-contact.jpg`,
        width: 1200,
        height: 630,
        alt: 'Contact Z-Beam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get a Free Quote | Bay Area Laser Cleaning | Z-Beam',
    description: 'Precision laser cleaning for aerospace, marine, automotive & heritage. No chemicals, no damage. Same-day response.',
  },
};

// Default export - the page component
export default async function ContactPage() {
  const { metadata: pageMetadata } = await loadPageData('contact');
  
  return (
    <>
      <MaterialJsonLD article={{ metadata: pageMetadata }} slug="contact" />
      <Layout
        title="Send us a Z-mail"
        description=""
        rightContent={null}
        metadata={pageMetadata as unknown as ArticleMetadata}
        slug="contact"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          <div>
            <ContactForm />
          </div>
          
          <div>
            <ContactInfo />
          </div>
        </div>
      </Layout>
    </>
  );
}
