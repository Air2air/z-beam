// app/articles/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { CustomMDX } from 'app/components/mdx';
import { formatDate, getArticlePosts } from 'app/articles/utils';
import { baseUrl } from 'app/sitemap';
import type { Metadata } from 'next'; // Import Metadata type for generateMetadata

// --- Data Fetching and Static Params ---
// This function tells Next.js which dynamic routes (`[slug]`) to generate at build time.
// It fetches all available article slugs.
export async function generateStaticParams() {
  const posts = getArticlePosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// --- Metadata Generation ---
// This function generates the <head> metadata for each article page (title, description, OpenGraph, Twitter cards).
// It runs at build time for static pages and on request for dynamic ones.
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getArticlePosts().find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: 'Not Found',
      description: 'The requested article could not be found'
    };
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;

  // Determine the OpenGraph image URL. Use article's image if available, otherwise a generated one.
  const ogImage = image
    ? `${baseUrl}${image}` // Ensure absolute URL for OpenGraph
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/articles/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

// --- Main Page Component ---
// This is the default export for your article page. It fetches the specific article's content
// and renders its structure, title, date, and MDX content.
export default function ArticlePage({ params }: { params: { slug: string } }) {
  // Fetch the specific post data for this slug.
  const post = getArticlePosts().find((p) => p.slug === params.slug);

  // If the post isn't found, trigger Next.js's 404 page.
  if (!post) {
    notFound();
  }

  // Determine the image URL for Schema.org JSON-LD.
  const schemaOgImage = post.metadata.image
    ? `${baseUrl}${post.metadata.image}`
    : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`;

  return (
    <section>
      {/* --- Schema.org JSON-LD for SEO --- */}
      {/* This script provides structured data about the article to search engines. */}
      <script
        type="application/ld+json"
        suppressHydrationWarning // Prevents a hydration warning for this dynamically inserted script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ArticlePosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt, // Often same as published date
            description: post.metadata.summary,
            image: [ // Schema.org recommends an array for image objects
              {
                '@type': 'ImageObject',
                url: schemaOgImage,
                // Consider adding width and height properties here if known for better SEO
                // width: 800,
                // height: 600,
              },
            ],
            url: `${baseUrl}/articles/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Z-Beam', // Your author name
            },
          }),
        }}
      />

      {/* --- Article Title --- */}
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>

      {/* --- Published Date --- */}
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>

      {/* --- Article Content (MDX) --- */}
      {/* The 'prose' class applies default typography styles from Tailwind CSS Typography plugin. */}
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}