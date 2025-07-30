// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { generateArticleMetadata } from '@/app/utils/metadataGenerator';
import { loadFrontmatterData } from '@/app/utils/frontmatterLoader'; // Import directly
import { getArticleBySlug, getAllArticleSlugs } from "app/utils/server";

interface PageProps {
  params: { slug: string };
}

// Generate metadata from frontmatter
export async function generateMetadata({ params }: PageProps) {
  return await generateArticleMetadata(params.slug);
}

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || '';
  
  // Load frontmatter data for metadata
  const frontmatter = await loadFrontmatterData(slug);
  const article = getArticleBySlug(slug);

  if (!frontmatter || !article) {
    notFound();
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: frontmatter.subject,
            datePublished: frontmatter.date || new Date().toISOString(),
            dateModified: frontmatter.date || new Date().toISOString(),
            description: frontmatter.description || `Laser cleaning solutions for ${frontmatter.subject.toLowerCase()}`,
            image: frontmatter.image ? [
              {
                "@type": "ImageObject",
                url: frontmatter.image,
              }
            ] : undefined,
            url: `https://z-beam.com/${slug}`,
            author: {
              "@type": "Organization",
              name: "Z-Beam Laser Cleaning",
            },
            publisher: {
              "@type": "Organization",
              name: "Z-Beam",
            },
            articleSection: frontmatter.category,
            keywords: frontmatter.keywords?.join(', '),
          }),
        }}
      />

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {frontmatter.articleType}
          </span>
          <span className="text-gray-500">{frontmatter.category}</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {frontmatter.subject}
        </h1>
        
        {frontmatter.description && (
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {frontmatter.description}
          </p>
        )}
        
        {frontmatter.date && (
          <time className="text-sm text-gray-500 mt-4 block">
            {new Date(frontmatter.date).toLocaleDateString()}
          </time>
        )}
      </header>

      {/* Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>

      {/* Keywords */}
      {frontmatter.keywords && frontmatter.keywords.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Related Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {frontmatter.keywords.map((keyword, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
