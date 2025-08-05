// app/page.tsx - Much simpler

import { List } from "./components/List/List";
import { getArticle, loadComponentData } from "./utils/contentIntegrator"; // Add loadComponentData here
import { createMetadata } from "./utils/metadata";
import { getAllArticleSlugs } from "./utils/contentUtils";
import { SectionCardList } from "./components/SectionCard/SectionCardList";

// Remove this static declaration
// export const metadata: Metadata = {
//   title: "Home | Z-Beam",
//   description:
//     "Welcome to Z-Beam's portfolio showcasing laser cleaning solutions for industrial applications.",
// };

// Keep only the dynamic generateMetadata function
export async function generateMetadata() {
  // Try to get the home-specific metatags component
  const homeMetaTags = await loadComponentData('metatags', 'home');
  // Also get the home article for any additional metadata
  const homeArticle = await getArticle("home");

  return createMetadata({
    title: homeMetaTags?.config?.title || "Z-Beam Laser Cleaning Solutions",
    description: homeMetaTags?.config?.description || 
      "Advanced laser cleaning technology for industrial applications",
    keywords: homeMetaTags?.config?.keywords,
    ogImage: homeMetaTags?.config?.ogImage || "/images/home-og.jpg",
    ogType: homeMetaTags?.config?.ogType || "website",
    canonical: homeMetaTags?.config?.canonical,
    noindex: homeMetaTags?.config?.noindex,
    jsonLd: homeArticle?.components?.jsonld,
  });
}

export default async function HomePage() {
  // Only fetch slugs once
  const slugs = await getAllArticleSlugs();

  return (
    <>
      {/* Hero section */}
      <section className="relative">
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Z-Beam Laser Cleaning
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Advanced surface treatment solutions for industrial applications
          </p>
        </div>
      </section>

   
      <section className="container mx-auto px-4 py-8">
        <SectionCardList />
      </section>

      {/* Materials - Pass slugs and filter */}
      <section className="container mx-auto px-4 py-8">
        <List
          slugs={slugs}
          filterBy="material"
          heading="Material-Specific Solutions"
          columns={3}
        />
      </section>

      {/* Applications */}
      <section className="container mx-auto px-4 py-8">
        <List
          slugs={slugs}
          filterBy="application"
          heading="Applications & Techniques"
          columns={2}
        />
      </section>

      {/* All Articles */}
      <section className="container mx-auto px-4 py-12">
        <List
          slugs={slugs}
          filterBy="all"
          heading="All Solutions"
          columns={4}
        />
      </section>
    </>
  );
}
