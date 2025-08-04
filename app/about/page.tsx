// app/about/page.tsx
import { Layout } from "@/app/components/Layout/Layout";
import { createMetadata } from "@/app/utils/metadata";
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export const metadata = {
  title: 'About Z-Beam',
  description: 'Learn about Z-Beam\'s mission, team, and expertise in laser cleaning technology.'
};

// Function to load about page content
async function getAboutPageContent() {
  try {
    // Path to the about page content file
    const pagePath = path.join(process.cwd(), 'app', 'pages', '_md', 'about.md');
    
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
    console.error('Error loading about page:', error);
    return null;
  }
}

// Default export - the page component
export default async function AboutPage() {
  const pageData = await getAboutPageContent();
  
  if (!pageData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Error Loading About Page</h1>
        <p>Sorry, there was a problem loading the about page content.</p>
      </div>
    );
  }
  
  return (
    <Layout 
      components={{ content: { content: pageData.content } }}
      metadata={pageData.metadata}
      slug="about"
      title={pageData.metadata.title}
    />
  );
}
