// app/page.tsx - With article list

import type { Metadata } from "next";
// import { VimeoPlayer } from "./components/Video/VimeoPlayer";
import { HomeCardList } from "./components/List/HomeCardList";
import { getAllArticleSlugs } from "./utils/server";
import { getEnhancedArticle } from "./utils/contentIntegrator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home | Z-Beam",
  description:
    "Welcome to Z-Beam's portfolio showcasing laser cleaning solutions for industrial applications.",
};

export default async function HomePage() {
  // Fetch all articles for the list
  const slugs = await getAllArticleSlugs();

  // Get article previews (just metadata for the list)
  const articles = await Promise.all(
    slugs.map(async (slug) => {
      const article = await getEnhancedArticle(slug);
      return {
        slug,
        title: article?.metadata?.subject || slug,
        description:
          article?.metadata?.description ||
          `Learn about ${slug} laser cleaning technology.`,
        category: article?.metadata?.category,
        articleType: article?.metadata?.articleType,
      };
    })
  );

  return (
    <>
      {/* Hero section with video background and content */}
      <section className="relative">
        {/* Video background */}
        {/* <VimeoPlayer
          videoId="1058778534"
          autoPlay={true}
          controls={false}
          loop={true}
          background={true}
          height="h-[50vh]" // Set explicit height
          className="mb-0" // Remove bottom margin
        /> */}

        {/* Content overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Z-Beam Laser Cleaning
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Advanced surface treatment solutions for industrial applications
          </p>
        </div>
      </section>

      {/* Cards section */}
      <section className="container mx-auto px-4 py-4">
        <HomeCardList />
      </section>

      {/* Article List Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Laser Cleaning Solutions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/${article.slug}`}
              className="group bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-200 border border-gray-600"
            >
              <div className="flex flex-col h-full">
                {/* Category Badge */}
                {article.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-3 self-start">
                    {article.category}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors mb-3">
                  {article.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed flex-grow">
                  {article.description}
                </p>

                {/* Article Type */}
                {article.articleType && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                      {article.articleType}
                    </span>
                  </div>
                )}

                {/* Read More */}
                <div className="mt-4">
                  <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300">
                    Learn More →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Articles Message */}
        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No articles available yet.</p>
          </div>
        )}
      </section>
    </>
  );
}
