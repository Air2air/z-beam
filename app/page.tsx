// app/page.tsx - Static optimized home page

import { CardGridSSR } from "./components/CardGrid";
import { Hero } from "./components/Hero/Hero";
import { Layout } from "./components/Layout/Layout";
import { getArticle, loadComponentData } from "./utils/contentAPI"; // Updated to use contentAPI
import { createMetadata } from "./utils/metadata";
import { getAllArticleSlugs } from "./utils/contentAPI";
import { featuredSections } from "./data/featuredSections";
import { featuredMaterialCategories } from "./data/featuredMaterialCategories";
import { CONTAINER_STYLES } from "./utils/containerStyles";

// Force static generation for home page
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate in production

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
    title: (homeMetaTags?.config?.title as string) || "Z-Beam Laser Cleaning Solutions",
    description: (homeMetaTags?.config?.description as string) || 
      "Advanced laser cleaning technology for industrial applications",
    keywords: Array.isArray(homeMetaTags?.config?.keywords) 
      ? homeMetaTags.config.keywords 
      : typeof homeMetaTags?.config?.keywords === 'string' 
        ? [homeMetaTags.config.keywords] 
        : undefined,
    image: (homeMetaTags?.config?.ogImage as string) || "/images/home-og.jpg",
    slug: "home",
  });
}

export default async function HomePage() {
  // Only fetch slugs once
  const slugs = await getAllArticleSlugs();

  // Create frontmatter object for Hero component
  const heroFrontmatter = {
    title: "Z-Beam Laser Cleaning",
    description: "Advanced surface treatment solutions for industrial applications", 
    slug: "home",
    video: "eGgMJdjRUJk" // YouTube ID
  };

  return (
    <Layout fullWidth>
      {/* Hero section with Vimeo video background */}
      <Hero 
        frontmatter={heroFrontmatter}
        variant="fullwidth"
        theme="dark"
      >
        {/* Commented out overlay text to resolve CSS issues */}
        {/* 
        <div className="flex flex-col items-center justify-center text-center text-white px-4 h-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Z-Beam Laser Cleaning
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Advanced surface treatment solutions for industrial applications
          </p>
        </div>
        */}
      </Hero>

      {/* Featured Solutions Section */}
      <section className={CONTAINER_STYLES.standard}>
        <CardGridSSR
          items={featuredSections.map(section => ({
            slug: section.slug,
            title: section.title,
            description: section.description,
            href: `/${section.slug}`,
            imageUrl: section.imageUrl,
            imageAlt: section.title,
            badge: undefined, // Featured items don't show badges
          }))}
          columns={2}
          variant="featured"
        />
      </section>

      {/* Material Categories Section */}
      <section className={CONTAINER_STYLES.standard}>
        <CardGridSSR
          items={featuredMaterialCategories.map(category => ({
            slug: category.slug,
            title: category.title,
            description: category.description,
            href: `/${category.slug}`,
            imageUrl: category.imageUrl,
            imageAlt: category.title,
            badge: {
              materialType: category.materialType as any, // Cast to satisfy type requirements
              symbol: "",
              formula: "",
            },
          }))}
          columns={3}
          variant="default"
        />
      </section>
    </Layout>
  );
}
