// app/services/page.tsx
import { Layout } from "@/app/components/Layout/Layout";
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Force static generation for services page
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate in production

export const metadata = {
  title: 'Services | Z-Beam Laser Cleaning Solutions',
  description: 'Explore Z-Beam\'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.'
};

// Function to load services page content
async function getServicesPageContent() {
  try {
    // Path to the services page content file
    const pagePath = path.join(process.cwd(), 'app', 'pages', '_md', 'services.md');
    
    // Read and parse the file
    const fileContent = await fs.readFile(pagePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Convert markdown to HTML
    const htmlContent = marked(content);
    
    return {
      metadata: data,
      content: htmlContent
    };
  } catch (error) {
    console.error('Error loading services page:', error);
    return null;
  }
}

// Default export - the page component
export default async function ServicesPage() {
  const pageData = await getServicesPageContent();
  
  if (!pageData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Error Loading Services Page</h1>
        <p>Sorry, there was a problem loading the services page content.</p>
      </div>
    );
  }
  
  return (
    <Layout 
      components={{ content: { content: pageData.content } }}
      metadata={pageData.metadata}
      slug="services"
      title={pageData.metadata.title}
    />
  );
}
