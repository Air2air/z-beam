import { notFound } from "next/navigation";
import { getArticle, loadComponentData } from '@/app/utils/contentIntegrator';
import { getAllArticleSlugs } from '@/app/utils/server';
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
      {/* Remove any manual JSON-LD Script components */}
      
      <section className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {metadata?.subject || `Article: ${slug}`}
          </h1>
          
          {/* Add metadata display */}
          {metadata && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {metadata.category && (
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                  {metadata.category}
                </span>
              )}
              {metadata.articleType && (
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                  {metadata.articleType}
                </span>
              )}
              {metadata.author && (
                <div className="mt-2">
                  <span className="font-medium">Author:</span> {metadata.author}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Components - Each handles its own config and rendering */}
        {components.caption && (
          <Caption 
            content={components.caption.content}
            config={components.caption.config}
          />
        )}

        {components.content && (
          <article className="prose prose-md dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: components.content }} />
          </article>
        )}

        {components.bullets && (
          <Bullets 
            content={components.bullets.content}
            config={components.bullets.config}
          />
        )}

        {components.table && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Technical Specifications
            </h3>
            <Table 
              content={components.table.content}
              config={components.table.config}
            />
          </div>
        )}
      </section>
    </>
  );
}
