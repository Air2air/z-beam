// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { CustomMDX } from "app/components/mdx";
import { formatDate } from "app/utils/utils";
import { getArticleBySlug, getAllArticleSlugs, getAuthorById, getTagSlug } from "app/utils/server";
import { baseUrl } from "app/sitemap";
import type { Metadata } from "next";
import { HeroImage } from "app/components/HeroImage";
import { Breadcrumbs } from "app/components/breadcrumbs";
import { FadeInOnScroll } from "app/components/FadeInOnScroll";
import { AuthorArticlesServer } from "app/components/AuthorArticlesServer";
import type { PageProps } from "app/types";

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug || '');
  
  if (!article) {
    return {};
  }

  const ogImage = article.metadata.image
    ? `${baseUrl}${article.metadata.image}`
    : `${baseUrl}/og?title=${encodeURIComponent(article.metadata.title)}`;

  return {
    title: article.metadata.title,
    description: article.metadata.description || article.metadata.summary, // Fallback to summary if description is absent
    openGraph: {
      title: article.metadata.title,
      description: article.metadata.description || article.metadata.summary, // Fallback to summary
      type: "article",
      publishedTime: article.metadata.publishedAt || undefined,
      url: `${baseUrl}/${article.slug}`,
      images: [{ url: ogImage }],
    },
  };
}

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug || '');

  if (!article) {
    notFound();
  }

  const schemaOgImage = article.metadata.image
    ? `${baseUrl}${article.metadata.image}`
    : `${baseUrl}/og?title=${encodeURIComponent(article.metadata.title)}`;

  // Get author information for schema and display
  const author = article.metadata.authorId ? getAuthorById(article.metadata.authorId) : null;

  return (
    <section>
      <Breadcrumbs />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.metadata.title,
            datePublished: article.metadata.publishedAt,
            dateModified: article.metadata.publishedAt,
            description: article.metadata.description || article.metadata.summary,
            image: [
              {
                "@type": "ImageObject",
                url: schemaOgImage,
              },
            ],
            url: `${baseUrl}/${article.slug}`,
            author: author ? {
              "@type": "Person",
              name: author.name,
              jobTitle: author.title,
              ...(author.linkedin && { sameAs: [author.linkedin] }),
            } : {
              "@type": "Person",
              name: "Z-Beam",
            },
          }),
        }}
      />
      {article.metadata.image && (
        <HeroImage
          src={article.metadata.image}
          alt={article.metadata.title}
          imageCaption={article.metadata.imageCaption}
          priority={true}
        />
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
        {article.metadata.title}
      </h1>
      
      <div className="flex items-center gap-4 mb-6">
        <p className="uppercase text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {article.metadata.publishedAt ? formatDate(article.metadata.publishedAt) : 'Date not available'}
        </p>
        {author && (
          <>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-2">
              {author.image && (
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <Link
                href={`/authors/${author.slug}?from=${article.slug}`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
              >
                By {author.name}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Tags Section */}
      {article.metadata.tags && Array.isArray(article.metadata.tags) && article.metadata.tags.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {article.metadata.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/tags/${getTagSlug(tag)}?from=${article.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <FadeInOnScroll delay={0.2} yOffset={30} amount={0.06}>
        <article className="prose dark:prose-invert">
          <CustomMDX source={article.content} />
        </article>
      </FadeInOnScroll>

      {/* More by this author section */}
      {article.metadata.authorId && (
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <AuthorArticlesServer 
            authorId={article.metadata.authorId}
            excludeSlug={article.slug}
            limit={6}
            className="mb-8"
          />
        </div>
      )}
    </section>
  );
}
