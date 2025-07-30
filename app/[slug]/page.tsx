import { notFound } from "next/navigation";
import { generateArticleMetadata } from '@/app/utils/metadataGenerator';
import { getEnhancedArticle } from '@/app/utils/contentIntegrator';
import { getAllArticleSlugs } from '@/app/utils/server';
import { Table } from '@/app/components/Table/Table';
import { Bullets } from '@/app/components/Bullets/Bullets';
import { Caption } from '@/app/components/Caption/Caption';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata from frontmatter
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateArticleMetadata(slug);
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getEnhancedArticle(slug);

  if (!article) {
    notFound();
  }

  const { metadata, frontmatter, components } = article;

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {frontmatter?.subject || metadata.title || 'Article Title'}
        </h1>
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

      {/* Legacy components */}
      {components.jsonld && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: components.jsonld }}
        />
      )}
    </section>
  );
}
