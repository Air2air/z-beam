// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

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
};

// Default export - the page component
export default async function ContactPage() {
  return (
    <Layout
      title="Send us a Z-mail"
      subtitle=""
      rightContent={null}
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
  );
}
