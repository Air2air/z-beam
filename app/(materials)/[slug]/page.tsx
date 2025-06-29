// app/(materials)/[slug]/page.tsx

import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate, getMaterialList } from "app/(materials)/utils";
import { baseUrl } from "app/sitemap";
import type { Metadata } from "next";
import { HeroImage } from "app/components/HeroImage";
// --- ADD THIS IMPORT ---
import { Breadcrumbs } from "app/components/breadcrumbs"; // Correct import path for your breadcrumbs component
import { FadeInOnScroll } from "app/components/FadeInOnScroll";
// --- END ADDITION ---

// ... (generateStaticParams, generateMetadata functions remain the same) ...

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
      {/* --- ADD BREADCRUMBS COMPONENT HERE --- */}
      {/* This component will automatically determine the path from the URL */}
      <Breadcrumbs />
      {/* --- END ADDITION --- */}

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
          priority={true}
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
      <FadeInOnScroll delay={0.2} yOffset={30} amount={0.06}>
        <article className="prose dark:prose-invert">
          <CustomMDX source={post.content} />
        </article>
      </FadeInOnScroll>
    </section>
  );
}
