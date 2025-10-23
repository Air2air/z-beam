// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContactForm } from "../components/Contact/ContactForm";
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
