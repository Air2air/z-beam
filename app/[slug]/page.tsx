import { notFound } from "next/navigation";
import { getArticle } from "@/app/utils/contentIntegrator";
import { Layout } from "@/app/components/Layout/Layout";
import type { Metadata } from "next";
import { createMetadata } from "@/app/utils/metadata";

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

export default async function ArticlePage({ params }: PageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  try {
    const article = await getArticle(slug);
    
    if (!article) {
      notFound();
    }
    
    return <Layout components={article.components} metadata={article.metadata} slug={slug} />;
  } catch (error) {
    console.error(`Error rendering page for ${slug}:`, error);
    notFound();
  }
}
