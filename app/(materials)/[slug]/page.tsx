// app/(materials)/[slug]/page.tsx

import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate, getMaterialList } from "app/(materials)/utils";
import { baseUrl } from "app/sitemap";
import type { Metadata } from "next";

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
      type: "article", // Corrected OpenGraph type
      publishedTime,
      url: `${baseUrl}/${post.slug}`, // CORRECTED: Reflects root-level URL
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
    // <section> is okay here as a semantic wrapper for the article content
    <section>
      {/* --- Schema.org JSON-LD for SEO --- */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article", // Changed from MaterialListing to more common Article for Schema.org
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
            url: `${baseUrl}/${post.slug}`, // CORRECTED: Reflects root-level URL
            author: {
              "@type": "Person",
              name: "Z-Beam",
            },
          }),
        }}
      />

      {/* --- Page Title (Conformed Heading) --- */}
      {/* This H1 is for the title of the individual material page, often part of the content itself. */}
      {/* Keeping text-2xl as it fits a content heading better than a top-level page heading. */}
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
        {post.metadata.title}
      </h1>

      <p className="uppercase text-xs text-gray-500 dark:text-gray-400 mb-2 tabular-nums">
        {formatDate(post.metadata.publishedAt)}
      </p>

      {/* --- Article Content (MDX) --- */}
      {/* This is where the prose class correctly applies typography to the MDX content. */}
      <article className="prose dark:prose-invert">
        {" "}
        {/* Added dark mode for prose */}
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
