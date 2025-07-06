// app/authors/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "app/utils/utils";
import { getAuthorBySlug, getAllAuthorSlugs, getArticlesByAuthorId, getAllAuthors, getAuthorTags } from "app/utils/server";
import { baseUrl } from "app/sitemap";
import type { Metadata } from "next";
import { Breadcrumbs } from "app/components/breadcrumbs";
import { FadeInOnScroll } from "app/components/FadeInOnScroll";
import { CardItem } from "app/components/CardItem";
import { AuthorProfile } from "app/components/AuthorProfile";
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
  
  // Get unique tags from this author's articles
  const authorTags = getAuthorTags(author.id);

  return (
    <section>
      <Breadcrumbs />
      
      <div className="max-w-4xl mx-auto">
        <AuthorProfile author={author} authorTags={authorTags} />
        
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