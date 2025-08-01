import { notFound } from "next/navigation";
import { getArticle } from '@/app/utils/contentIntegrator';
import { getAllArticleSlugs } from '@/app/utils/server';
import { Table } from '@/app/components/Table/Table';
import { Bullets } from '@/app/components/Bullets/Bullets';
import { Caption } from '@/app/components/Caption/Caption';
import type { Metadata } from 'next';
import Script from 'next/script';

interface PageProps {
  params: Promise<{ slug: string }>;  // Add Promise here
}

// Update generateMetadata to await params
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;  // Add await here
  const article = await getArticle(slug);
  
  if (!article?.metadata) {
    return {
      title: `${slug} | Z-Beam Laser Cleaning`,
    };
  }

  // Create basic metadata
  const metadata: Metadata = {
    title: `${article.metadata.subject || slug} | Z-Beam Laser Cleaning`,
    description: article.metadata.description,
    keywords: article.metadata.keywords?.join(', '),
    authors: article.metadata.author ? [{ name: article.metadata.author }] : undefined,
    openGraph: {
      title: article.metadata.subject || slug,
      description: article.metadata.description,
      type: 'article',
      url: `https://z-beam.com/${slug}`,
      siteName: 'Z-Beam Laser Cleaning',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metadata.subject || slug,
      description: article.metadata.description,
    },
  };
  
  // Add JSON-LD via the script field in the Metadata object
  if (article.components.jsonld) {
    // Type assertion to bypass the type checking for this property
    (metadata as any).other = {
      'script:ld+json': [
        {
          type: 'application/ld+json',
          text: JSON.stringify(article.components.jsonld),
          id: `jsonld-${slug}`,
        },
      ],
    };
  }
  
  return metadata;
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Update ArticlePage to await params
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;  // Add await here
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const { metadata, components } = article;

  return (
    <>
      {/* Add JSON-LD script directly in the page */}
      {components.jsonld && (
        <Script 
          id={`jsonld-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(components.jsonld)
          }}
        />
      )}
      
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
          <article className="prose prose-lg dark:prose-invert max-w-none">
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
