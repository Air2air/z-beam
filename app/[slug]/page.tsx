import { notFound } from "next/navigation";
import { getArticle } from "@/app/utils/contentIntegrator";
import { Layout } from "@/app/components/Layout/Layout";
import type { Metadata } from "next";
import { createMetadata } from "@/app/utils/metadata";
import fs from 'fs/promises';
import path from 'path';

// Fix: Define params as a Promise
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params before destructuring
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  try {
    const article = await getArticle(slug);
    
    if (!article) {
      return {
        title: `Page Not Found | Z-Beam`,
        description: 'The requested page could not be found.'
      };
    }
    
    // Use createMetadata with the existing metadata from the markdown file
    return createMetadata({
      ...article.metadata,
      canonical: article.metadata.canonical || `https://z-beam.com/${slug}`
    });
  } catch (error) {
    console.error(`Error generating metadata for ${slug}:`, error);
    return {
      title: 'Z-Beam',
      description: 'Technical information about industrial lasers.'
    };
  }
}

// Function to load tag content
async function getTagsContent(slug: string) {
  try {
    const tagsPath = path.join(process.cwd(), 'content', 'components', 'tags', `${slug}.md`);
    const tagsContent = await fs.readFile(tagsPath, 'utf8');
    return tagsContent;
  } catch (error) {
    console.error(`No tags found for ${slug}`);
    return null;
  }
}

export default async function ArticlePage({ params }: PageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  try {
    const article = await getArticle(slug);
    
    if (!article) {
      notFound();
    }
    
    // Load tags content for this article
    const tagsContent = await getTagsContent(slug);
    
    // Make sure article.metadata contains tags if they exist in your content
    return (
      <Layout components={article.components} metadata={article.metadata} slug={slug} />
    );
  } catch (error) {
    console.error(`Error rendering page for ${slug}:`, error);
    notFound();
  }
}
