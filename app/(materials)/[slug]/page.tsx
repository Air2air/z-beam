// app/(materials)/[slug]/page.tsx

import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate, getMaterialList } from "app/(materials)/utils";
import { baseUrl } from "app/sitemap";
import type { Metadata } from "next";
// --- NEW: Import HeroImage component ---
import { HeroImage } from "app/components/HeroImage";


// --- Data Fetching and Static Params ---
export async function generateStaticParams() {
  const posts = getMaterialList();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// --- Metadata Generation ---
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getMaterialList().find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: "Not Found",
      description: "The requested material could not be found",
    };
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;

  const ogImage = image
    ? `${baseUrl}${image}`
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// --- Main Page Component ---
export default function MaterialPage({ params }: { params: { slug: string } }) {
  const post = getMaterialList().find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const schemaOgImage = post.metadata.image
    ? `${baseUrl}${post.metadata.image}`
    : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`;

  return (
    <section>
      {/* --- Schema.org JSON-LD for SEO --- */}
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
            description: post.metadata.summary,
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

      {/* --- Render HeroImage if available --- */}
      {post.metadata.image && (
        <HeroImage
          src={post.metadata.image}
          alt={post.metadata.title}
          priority={true} // This is likely your LCP image, so set priority
        />
      )}

      {/* --- Page Title (Conformed Heading) --- */}
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
        {post.metadata.title}
      </h1>

      <p className="uppercase text-xs text-gray-500 dark:text-gray-400 mb-2 tabular-nums">
        {formatDate(post.metadata.publishedAt)}
      </p>

      {/* --- Article Content (MDX) --- */}
      <article className="prose dark:prose-invert">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}