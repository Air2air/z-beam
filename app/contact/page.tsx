// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContactForm } from "../components/Contact/ContactForm";
import { ContactInfo } from "../components/Contact/ContactInfo";
import { Header } from "../components/Header";
import { ComponentData, ArticleMetadata } from '@/types';
import { stripLeadingSlash } from "../utils/pathUtils";
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
  } catch (error) {
    console.error('Error loading contact page:', error);
    return (
      <div className={CONTAINER_STYLES.standard}>
        <Header level="page" title="Contact Z-Beam" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">We're sorry, but there was an error loading the contact page.</p>
      </div>
    );
  }
}
