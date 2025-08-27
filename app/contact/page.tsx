// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export const metadata = {
  title: 'Contact Z-Beam',
  description: 'Get in touch with Z-Beam\'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.'
};

// Function to load contact page content
async function getContactPageContent() {
  try {
    // Path to the contact page content file
    const pagePath = path.join(process.cwd(), 'app', 'pages', '_md', 'contact.md');
    
    // Read and parse the file
    const fileContent = await fs.readFile(pagePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Convert markdown to HTML
    const htmlContent = await marked(content);
    
    return {
      metadata: data,
      content: htmlContent
    };
  } catch (error) {
    console.error('Error loading contact page:', error);
    return null;
  }
}

// Default export - the page component
export default async function ContactPage() {
  const pageData = await getContactPageContent();
  
  if (!pageData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Error Loading Contact Page</h1>
        <p>Sorry, there was a problem loading the contact page content.</p>
      </div>
    );
  }
  
  return (
    <Layout 
      components={{ content: { content: pageData.content } }}
      metadata={pageData.metadata}
      slug="contact"
      title={pageData.metadata.title}
    />
  );
}
