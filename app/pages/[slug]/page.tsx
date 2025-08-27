// app/pages/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Layout } from "../../components/Layout/Layout";
import { createMetadata, ArticleMetadata } from "../../utils/metadata";
import { loadPageData, getAllSlugs } from "../../utils/contentAPI";
import { logger } from "../../utils/logger";

// Define params as a Promise for Next.js 15
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Metadata generator for static pages
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    const { metadata } = await loadPageData(slug);
    
    if (!metadata.title) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.'
      };
    }

    return createMetadata({
      title: metadata.title as string,
      description: metadata.description as string,
      ...metadata,
      canonical: (metadata.canonical as string) || `https://z-beam.com/pages/${slug}`
    } as ArticleMetadata);
  } catch (error) {
    logger.error(`Error generating metadata for page ${slug}`, error, { slug });
    return {
      title: 'Error',
      description: 'An error occurred while loading the page.'
    };
  }
}

// Static page component
export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    const { metadata, components } = await loadPageData(slug);
    
    if (!metadata.title && Object.keys(components).length === 0) {
      notFound();
    }

    return (
      <Layout 
        components={components}
        metadata={metadata}
        slug={slug}
        title={metadata.title as string}
      />
    );
  } catch (error) {
    logger.error(`Error loading static page ${slug}`, error, { slug });
    notFound();
  }
}

// Generate static params for build optimization
export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    logger.error('Error generating static params for pages', error);
    return [];
  }
}
