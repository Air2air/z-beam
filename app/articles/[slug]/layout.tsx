// app/articles/[slug]/layout.tsx
import { notFound } from 'next/navigation';
import { formatDate, getArticlePosts } from 'app/articles/utils'; // Adjust path if necessary
import { baseUrl } from 'app/sitemap'; // Adjust path if necessary

// This layout will receive the `params` from the route segment
export default async function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  let post = getArticlePosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Extract metadata for rendering in the layout
  const { title, publishedAt, summary, image } = post.metadata;

  // Generate image URL for schema.org
  const ogImage = image
    ? `${baseUrl}${image}` // Ensure image path is absolute if relative in metadata
    : `/og?title=${encodeURIComponent(title)}`;

  return (
    <section>
      {/* JSON-LD Schema.org Data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ArticlePosting',
            headline: title,
            datePublished: publishedAt,
            dateModified: publishedAt, // Often same as published, or use a separate updated date
            description: summary,
            image: [ // Schema.org recommends an array for images
              {
                '@type': 'ImageObject',
                url: ogImage,
                // Add width/height if known for better SEO
                // width: 800,
                // height: 600,
              }
            ],
            url: `${baseUrl}/articles/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Z-Beam', // Replace with your actual author name
            },
          }),
        }}
      />

      {/* Article Title */}
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {title}
      </h1>

      {/* Article Metadata (Date, etc.) */}
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(publishedAt)}
        </p>
      </div>

      {/* The actual article content from page.tsx will be rendered here */}
      <article className="prose">
        {children}
      </article>
    </section>
  );
}

// Re-export generateStaticParams and generateMetadata from page.tsx
// because layouts also participate in data fetching and metadata generation for their segment.
export { generateStaticParams } from './page';
export { generateMetadata } from './page';