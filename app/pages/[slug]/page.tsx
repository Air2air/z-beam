// app/pages/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Layout } from "@/app/components/Layout/Layout";
import { createMetadata } from "@/app/utils/metadata";
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Define params as a Promise
interface PageProps {
  params: { slug: string };
}

// Metadata generator for static pages
export async function generateMetadata({ params }: PageProps) {
  // Ensure params is properly awaited before destructuring
  const slug = params.slug;
  
  try {
    const pageData = await getStaticPage(slug);
    
    if (!pageData) {
      return {
        title: `Page Not Found | Z-Beam`,
        description: 'The requested page could not be found.'
      };
    }
    
    return createMetadata({
      ...pageData.metadata,
      canonical: pageData.metadata.canonical || `https://z-beam.com/pages/${slug}`
    });
  } catch (error) {
    console.error(`Error generating metadata for page ${slug}:`, error);
    return {
      title: 'Z-Beam',
      description: 'Information about Z-Beam laser cleaning solutions.'
    };
  }
}

// Function to load static page content
async function getStaticPage(slug: string) {
  try {
    // Path to the static page content file
    const pagePath = path.join(process.cwd(), 'app', 'pages', '_md', `${slug}.md`);
    
    // Check if the file exists
    try {
      await fs.access(pagePath);
    } catch (error) {
      console.error(`Static page not found: ${slug}`);
      return null;
    }
    
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
    console.error(`Error loading static page ${slug}:`, error);
    return null;
  }
}

// Default export - the page component
export default async function StaticPage({ params }: PageProps) {
  // Ensure params is properly awaited before destructuring
  const slug = params.slug;
  const pageData = await getStaticPage(slug);
  
  // If page doesn't exist, return 404
  if (!pageData) {
    notFound();
  }
  
  return (
    <Layout 
      components={{ content: { content: pageData.content } }}
      metadata={pageData.metadata}
      slug={slug}
      title={pageData.metadata.title}
    />
  );
}

// Generate static params for static pages
export async function generateStaticParams() {
  try {
    const pagesDir = path.join(process.cwd(), 'app', 'pages', '_md');
    const files = await fs.readdir(pagesDir);
    
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        slug: file.replace(/\.md$/, '')
      }));
  } catch (error) {
    console.error('Error generating static params for pages:', error);
    return [];
  }
}
