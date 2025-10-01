// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContactForm } from "../components/Contact/ContactForm";
import { ContactInfo } from "../components/Contact/ContactInfo";
import { Header } from "../components/Header";

export const metadata = {
  title: 'Contact Z-Beam',
  description: 'Get in touch with Z-Beam\'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.'
};

// Default export - the page component using standard Layout pattern
export default async function ContactPage() {
  return (
    <Layout
      title="Contact Z-Beam"
      description="Ready to explore how Z-Beam laser cleaning technology can transform your operations? Our team of experts is here to help you find the perfect laser cleaning solution for your specific needs."
      showHero={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        <div>
          <Header level="section" title="Send Us a Message" />
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Fill out the form below and our team will get back to you within 24 hours during business days. 
            Please provide as much detail as possible about your laser cleaning requirements.
          </p>
          <ContactForm />
        </div>
        
        <div>
          <ContactInfo />
        </div>
      </div>
    </Layout>
  );
}
