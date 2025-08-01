import { notFound } from "next/navigation";
import {
  getArticle,
  loadComponentData,
  getAllArticleSlugs,
} from "@/app/utils/contentIntegrator";
import { Layout } from "@/app/components/Layout/Layout";
import type { Metadata } from "next";
import { createMetadata } from "@/app/utils/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ArticleMetadata {
  subject?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  category?: string;
}

interface ArticleData {
  metadata: ArticleMetadata;
  components: Record<string, any> | null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Await params before using its properties
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const metaTags = await loadComponentData("metatags", slug);
  const article = await getArticle(slug) as ArticleData | null;

  return createMetadata({
    title: metaTags?.config?.title || article?.metadata?.subject || slug,
    description:
      metaTags?.config?.description || article?.metadata?.description,
    keywords: metaTags?.config?.keywords || article?.metadata?.keywords,
    ogImage: metaTags?.config?.ogImage || article?.metadata?.ogImage,
    ogType: metaTags?.config?.ogType || "article",
    canonical: metaTags?.config?.canonical || `https://z-beam.com/${slug}`,
    noindex: metaTags?.config?.noindex,
    jsonLd: article?.components?.jsonld,
  });
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

// Update page component
export default async function ArticlePage({ params }: PageProps) {
  // Await params before using its properties
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const article = await getArticle(slug) as ArticleData | null;

  if (!article) {
    notFound();
  }

  const { metadata, components } = article;

  return <Layout components={components} metadata={metadata} slug={slug} />;
}
