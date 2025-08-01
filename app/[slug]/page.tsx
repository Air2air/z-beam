import { notFound } from "next/navigation";
import { getArticle, loadComponentData, getAllArticleSlugs } from '@/app/utils/contentIntegrator';
import { Content } from '@/app/components/Content/Content';
import { Table } from '@/app/components/Table/Table';
import { Bullets } from '@/app/components/Bullets/Bullets';
import { Caption } from '@/app/components/Caption/Caption';
import type { Metadata } from 'next';
import { createMetadata } from '@/app/utils/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Add await here
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const metaTags = await loadComponentData('metatags', slug);
  const article = await getArticle(slug);

  return createMetadata({
    title: metaTags?.config?.title || article?.metadata?.subject || slug,
    description: metaTags?.config?.description || article?.metadata?.description,
    keywords: metaTags?.config?.keywords || article?.metadata?.keywords,
    ogImage: metaTags?.config?.ogImage || article?.metadata?.ogImage,
    ogType: metaTags?.config?.ogType || "article",
    canonical: metaTags?.config?.canonical || `https://z-beam.com/${slug}`,
    noindex: metaTags?.config?.noindex,
    jsonLd: article?.components?.jsonld,
  });
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Add await here
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const { metadata, components } = article;

  return (
    <>
      <section className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {metadata?.subject || `Article: ${slug}`}
          </h1>
        </header>
        
        {/* Render all components based on article data */}
        {components?.content && (
          <Content 
            content={components.content.content} 
            config={components.content.config || {
              wrapHeadings: true,
              maxWidth: 'max-w-4xl'
            }}
          />
        )}
        
        {components?.bullets && (
          <Bullets 
            content={components.bullets.content} 
            config={components.bullets.config}
          />
        )}
        
        {components?.table && (
          <Table 
            content={components.table.content} 
            config={components.table.config}
          />
        )}
        
        {components?.caption && (
          <Caption 
            content={components.caption.content} 
            config={components.caption.config}
          />
        )}
      </section>
    </>
  );
}
