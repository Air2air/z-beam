// app/tags/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArticleList } from '../../components/ArticleList';
import { getAllTagSlugs, getTagFromSlug, getArticlesByTag, getArticleList } from '../../utils/server';
import type { PageProps } from '../../types';

export async function generateStaticParams() {
  const slugs = getAllTagSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const tag = getTagFromSlug(params.slug || '');
  
  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  const materials = getArticlesByTag(tag);

  return {
    title: `${tag} Articles | Z-Beam`,
    description: `Explore ${materials.length} laser cleaning articles tagged with "${tag}". Learn about applications, techniques, and insights from Z-Beam's expert team.`,
    keywords: [tag, 'laser cleaning', 'Z-Beam', 'industrial cleaning', 'surface preparation'],
    openGraph: {
      title: `${tag} Articles | Z-Beam`,
      description: `Explore ${materials.length} laser cleaning articles tagged with "${tag}".`,
      type: 'website',
      url: `/tags/${params.slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${tag} Articles | Z-Beam`,
      description: `Explore ${materials.length} laser cleaning articles tagged with "${tag}".`,
    },
    alternates: {
      canonical: `/tags/${params.slug}`,
    },
  };
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const tag = getTagFromSlug(params.slug || '');
  
  if (!tag) {
    notFound();
  }

  // Get all materials with this tag
  const tagMaterials = getArticlesByTag(tag);

  // Sort materials by publication date (newest first)
  const sortedMaterials = tagMaterials.sort((a, b) => {
    const dateA = new Date(a.metadata.publishedAt || '').getTime();
    const dateB = new Date(b.metadata.publishedAt || '').getTime();
    return dateB - dateA;
  });

  // Handle contextual back navigation
  const fromSlug = searchParams?.from as string;
  let backLink = "/materials";
  let backText = "Back to Materials";
  
  if (fromSlug) {
    const allMaterials = await getArticleList();
    const fromArticle = allMaterials.find(material => material.slug === fromSlug);
    if (fromArticle) {
      backLink = `/${fromSlug}`;
      backText = `Back to ${fromArticle.metadata.nameShort || fromArticle.metadata.title}`;
    }
  }

  return (
    <>
      {/* Back Navigation */}
      <div className="mb-8">
        <Link 
          href={backLink}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <span className="mr-2">←</span>
          {backText}
        </Link>
      </div>

      {/* Tag Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-lg font-medium rounded-full">
              #{tag}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {tag} Articles
            </h1>
            <p className="text-lg text-gray-600">
              Explore laser cleaning insights and applications related to {tag.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Articles tagged with "{tag}"
          <span className="text-lg font-normal text-gray-600 ml-2">
            ({sortedMaterials.length} article{sortedMaterials.length !== 1 ? 's' : ''})
          </span>
        </h2>
        
        {sortedMaterials.length > 0 ? (
          <ArticleList articles={sortedMaterials} showAuthor={false} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No articles found with the tag "{tag}".
            </p>
          </div>
        )}
      </div>
    </>
  );
}
