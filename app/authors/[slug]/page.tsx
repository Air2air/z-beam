// app/authors/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "app/utils/utils";
import { getAuthorBySlug, getAllAuthorSlugs, getArticlesByAuthorId, getAllAuthors } from "app/utils/server";
import { baseUrl } from "app/sitemap";
import type { Metadata } from "next";
import { Breadcrumbs } from "app/components/breadcrumbs";
import { FadeInOnScroll } from "app/components/FadeInOnScroll";
import { CardItem } from "app/components/CardItem";
import type { PageProps } from "app/types";

export async function generateStaticParams() {
  return getAllAuthorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const author = getAuthorBySlug(params.slug || '');
  
  if (!author) {
    return {};
  }

  const ogImage = author.image
    ? `${baseUrl}${author.image}`
    : `${baseUrl}/og?title=${encodeURIComponent(author.name)}`;

  return {
    title: `${author.name} - ${author.title}`,
    description: author.bio,
    openGraph: {
      title: `${author.name} - ${author.title}`,
      description: author.bio,
      type: "profile",
      url: `${baseUrl}/authors/${author.slug}`,
      images: [{ url: ogImage }],
    },
  };
}

export default function AuthorPage({ params }: PageProps) {
  const slug = params.slug || '';
  console.log('Looking for author with slug:', slug);
  
  const author = getAuthorBySlug(slug);
  console.log('Found author:', author ? author.name : 'NOT FOUND');
  
  // Also try to see all available authors
  const allAuthors = getAllAuthors();
  console.log('All available authors:', allAuthors.map(a => ({ slug: a.slug, name: a.name })));

  if (!author) {
    notFound();
  }

  // Get articles by this author
  const authorArticles = getArticlesByAuthorId(author.id);

  return (
    <section>
      <Breadcrumbs />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Author Image */}
          {author.image && (
            <div className="flex-shrink-0">
              <img
                src={author.image}
                alt={author.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-lg"
              />
            </div>
          )}
          
          {/* Author Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              {author.name}
            </h1>
            <h2 className="text-xl text-blue-600 dark:text-blue-400 mb-4">
              {author.title}
            </h2>
            
            {/* Specialties */}
            {author.specialties && author.specialties.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {author.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* LinkedIn */}
            {author.linkedin && (
              <div className="mb-4">
                <Link
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                >
                  Connect on LinkedIn
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Bio */}
        <FadeInOnScroll delay={0.2} yOffset={30} amount={0.06}>
          <div className="prose dark:prose-invert max-w-none mb-12">
            <p className="text-lg leading-relaxed">{author.bio}</p>
          </div>
        </FadeInOnScroll>

        {/* Articles by this author */}
        {authorArticles.length > 0 && (
          <FadeInOnScroll delay={0.3} yOffset={30} amount={0.06}>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
                Articles by {author.name.split(' ')[0]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authorArticles.map((article, index) => (
                  <FadeInOnScroll
                    key={article.slug}
                    delay={0.05 * index}
                    yOffset={20}
                    amount={0.1}
                  >
                    <CardItem
                      href={`/${article.slug}`}
                      imageUrl={article.metadata.thumbnail || "/path/to/default-image.jpg"}
                      imageAlt={article.metadata.title}
                      title={article.metadata.title}
                      description={article.metadata.summary}
                      date={article.metadata.publishedAt ? formatDate(article.metadata.publishedAt) : undefined}
                      nameShort={article.metadata.nameShort}
                      atomicNumber={article.metadata.atomicNumber}
                      chemicalSymbol={article.metadata.chemicalSymbol}
                      materialType={article.metadata.materialType}
                      metalClass={article.metadata.metalClass}
                    />
                  </FadeInOnScroll>
                ))}
              </div>
            </div>
          </FadeInOnScroll>
        )}
      </div>
    </section>
  );
}