// app/(materials)/posts/[slug]/page.tsx
import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate, getMaterialList } from "app/utils/utils";
import { baseUrl } from "app/sitemap";
import type { Metadata } from "next";
import { HeroImage } from "app/components/HeroImage";
import { Breadcrumbs } from "app/components/breadcrumbs";
import { FadeInOnScroll } from "app/components/FadeInOnScroll";
import type { PageProps } from "app/types";

export async function generateStaticParams() {
  return getMaterialList().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getMaterialList().find((p) => p.slug === params.slug);
  if (!post) {
    return {};
  }

  const ogImage = post.metadata.image
    ? `${baseUrl}${post.metadata.image}`
    : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`;

  return {
    title: post.metadata.title,
    description: post.metadata.description || post.metadata.summary, // Fallback to summary if description is absent
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description || post.metadata.summary, // Fallback to summary
      type: "article",
      publishedTime: post.metadata.publishedAt || undefined,
      url: `${baseUrl}/${post.slug}`,
      images: [{ url: ogImage }],
    },
  };
}

export default function MaterialPage({ params }: PageProps) {
  const post = getMaterialList().find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const schemaOgImage = post.metadata.image
    ? `${baseUrl}${post.metadata.image}`
    : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`;

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
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.description || post.metadata.summary, // Align with generateMetadata
            image: [
              {
                "@type": "ImageObject",
                url: schemaOgImage,
              },
            ],
            url: `${baseUrl}/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Z-Beam",
            },
          }),
        }}
      />
      {post.metadata.image && (
        <HeroImage
          src={post.metadata.image}
          alt={post.metadata.title}
          imageCaption={post.metadata.imageCaption}
          priority={true}
        />
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
        {post.metadata.title}
      </h1>
      <p className="uppercase text-xs text-gray-500 dark:text-gray-400 mb-2 tabular-nums">
        {post.metadata.publishedAt ? formatDate(post.metadata.publishedAt) : 'Date not available'}
      </p>
      <FadeInOnScroll delay={0.2} yOffset={30} amount={0.06}>
        <article className="prose dark:prose-invert">
          <CustomMDX source={post.content} />
        </article>
      </FadeInOnScroll>
    </section>
  );
}