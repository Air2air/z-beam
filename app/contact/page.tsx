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
  title: 'Contact Z-Beam',
  description: 'Get in touch with Z-Beam\'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
  openGraph: {
    title: 'Contact Z-Beam',
    description: 'Get in touch with Z-Beam\'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.',
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
    title: 'Contact Z-Beam',
    description: 'Get in touch with Z-Beam\'s team of laser cleaning experts.',
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
        subtitle=""
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
