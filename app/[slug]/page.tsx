import { notFound } from "next/navigation";
import { getArticle, getAllArticleSlugs } from "@/app/utils/contentIntegrator";
import { Layout } from "@/app/components/Layout/Layout";
import type { Metadata } from "next";
import { createMetadata } from "@/app/utils/metadata";

// Update interface to indicate params is a Promise
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params before destructuring
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const article = await getArticle(slug);
  
  if (!article) {
    return {}; // Return empty metadata for not found
  }
  
  // Use the article metadata directly
  return createMetadata(article.metadata);
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllArticleSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [{ slug: "home" }];
  }
}

export default async function ArticlePage({ params }: PageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  // Add async/await to properly handle the Promise
  const article = await getArticle(slug);
  
  if (!article) {
    notFound();
  }
  
  return <Layout components={article.components} metadata={article.metadata} slug={slug} />;
}
