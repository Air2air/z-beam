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
import { AuthorByline } from "app/components/AuthorByline";
import { SmartTagList } from "app/components/SmartTagList";
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
      
      <AuthorByline 
        publishedAt={article.metadata.publishedAt}
        author={author}
        articleSlug={article.slug}
      />

      {/* Tags Section */}
      {article.metadata.tags && Array.isArray(article.metadata.tags) && article.metadata.tags.length > 0 && (
        <div className="mb-6">
          <SmartTagList 
            tags={article.metadata.tags}
            linkable={true}
            className="flex flex-wrap gap-2"
          />
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
