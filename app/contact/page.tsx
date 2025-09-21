// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContactForm } from "../components/Contact/ContactForm";
import { ContactInfo } from "../components/Contact/ContactInfo";
import { ComponentData, ArticleMetadata } from '@/types';
import { CONTAINER_STYLES } from "../utils/containerStyles";
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export const metadata = {
  title: 'Contact Z-Beam',
  description: 'Get in touch with Z-Beam\'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.'
};

// Default export - the page component
export default async function ContactPage() {
  try {
    // Load the contact markdown content
    const filePath = path.join(process.cwd(), 'app/pages/_md/contact.md');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Process markdown content
    const htmlContent = await marked(content);
    
    const pageMetadata: ArticleMetadata = { 
      ...data, 
      title: metadata.title, 
      description: metadata.description,
      slug: 'contact'
    };
    
    const pageComponents: Record<string, ComponentData> = {
      content: { 
        type: 'content',
        content: htmlContent 
      }
    };

    return (
      <Layout
        title="Contact Z-Beam"
        description="Ready to explore how Z-Beam laser cleaning technology can transform your operations? Our team of experts is here to help you find the perfect laser cleaning solution for your specific needs."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <p className="text-gray-600 mb-6">
              Fill out the form below and our team will get back to you within 24 hours during business days. 
              Please provide as much detail as possible about your laser cleaning requirements.
            </p>
            <ContactForm />
          </div>
          
          <div>
            <ContactInfo />
          </div>
        </div>

        <div className="mt-16 prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Z-Beam?</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <div>
                <strong>Expert Consultation</strong>: Our team has extensive experience in laser cleaning applications across various industries
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <div>
                <strong>Customized Solutions</strong>: We provide tailored recommendations based on your specific cleaning requirements
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <div>
                <strong>Technical Support</strong>: Comprehensive support from initial consultation through implementation and beyond
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <div>
                <strong>Proven Results</strong>: Track record of successful laser cleaning implementations for industrial applications
              </div>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Next Steps</h2>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">1</span>
              <div>
                <strong>Contact Us</strong>: Fill out the form or send us an email
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">2</span>
              <div>
                <strong>Consultation</strong>: We'll schedule a consultation to understand your needs
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">3</span>
              <div>
                <strong>Assessment</strong>: Our experts will assess your cleaning requirements
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">4</span>
              <div>
                <strong>Proposal</strong>: Receive a customized solution proposal
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1">5</span>
              <div>
                <strong>Implementation</strong>: Professional installation and training support
              </div>
            </li>
          </ol>
        </div>
      </Layout>
    );
  } catch (error) {
    console.error('Error loading contact page:', error);
    return (
      <div className={CONTAINER_STYLES.standard}>
        <h1 className="text-3xl font-bold">Contact Z-Beam</h1>
        <p className="mt-4">We're sorry, but there was an error loading the contact page.</p>
      </div>
    );
  }
}
