// app/page.tsx - Static optimized home page

import { CardGridSSR } from "./components/CardGrid";
import { Layout } from "./components/Layout/Layout";
import { loadComponentData } from "./utils/contentAPI";
import { createMetadata } from "./utils/metadata";
import { CONTAINER_STYLES } from "./utils/containerStyles";
import { SITE_CONFIG } from "./utils/constants";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

// Force static generation for home page
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate in production

// Generate metadata from home.yaml
export async function generateMetadata() {
  try {
    // Load home.yaml configuration
    const yamlPath = path.join(process.cwd(), 'content/pages', 'home.yaml');
    const yamlContent = await fs.readFile(yamlPath, 'utf8');
    const homeConfig = yaml.load(yamlContent) as ArticleMetadata;

    // Try to get the home-specific metatags component
    const homeMetaTags = await loadComponentData('metatags', 'home');

    return createMetadata({
      title: (homeMetaTags?.config?.title as string) || homeConfig?.title || SITE_CONFIG.name,
      description: (homeMetaTags?.config?.description as string) || 
        homeConfig?.description ||
        SITE_CONFIG.description,
      keywords: homeConfig?.keywords || 
        (Array.isArray(homeMetaTags?.config?.keywords) 
          ? homeMetaTags.config.keywords 
          : typeof homeMetaTags?.config?.keywords === 'string' 
            ? [homeMetaTags.config.keywords] 
            : undefined),
      image: (homeMetaTags?.config?.ogImage as string) || "/images/home-og.jpg",
      slug: "home",
    });
  } catch (error) {
    console.error('Error loading home metadata:', error);
    return createMetadata({
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      slug: "home",
    });
  }
}

export default async function HomePage() {
  // Load home.yaml configuration
  const yamlPath = path.join(process.cwd(), 'content/pages', 'home.yaml');
  const yamlContent = await fs.readFile(yamlPath, 'utf8');
  const homeConfig = yaml.load(yamlContent) as any;

  // Create frontmatter object for Hero component (loaded from Layout)
  const heroFrontmatter = {
    title: homeConfig.title || SITE_CONFIG.name,
    description: homeConfig.description || "Advanced surface treatment solutions for industrial applications", 
    slug: homeConfig.slug || "home",
    video: homeConfig.video, // YouTube ID from YAML - Hero will render if video exists
  };

  // Extract featured sections and materials from YAML
  const featuredSections = homeConfig.featuredSections || [];
  const featuredMaterials = homeConfig.featuredMaterials || [];
  
  // Page title and subtitle for consistent Title component display
  const pageTitle = homeConfig.title || SITE_CONFIG.name;
  const pageSubtitle = homeConfig.subtitle || "Advanced laser surface treatment solutions for industrial applications";

  return (
    <Layout 
      title={pageTitle}
      subtitle={pageSubtitle}
      fullWidth
      metadata={heroFrontmatter}
      customHeroOverlay={true}
    >
      {/* Featured Solutions Section */}
      {featuredSections.length > 0 && (
        <section className={CONTAINER_STYLES.standard}>
          <CardGridSSR
            items={featuredSections.map((section: any) => ({
              slug: section.slug,
              title: section.title,
              description: section.description,
              href: `/${section.slug}`,
              imageUrl: section.imageUrl,
              imageAlt: section.title,
              badge: undefined,
            }))}
            columns={2}
            variant="featured"
          />
        </section>
      )}

      {/* Material Categories Section */}
      {featuredMaterials.length > 0 && (
        <section className={CONTAINER_STYLES.standard}>
          <CardGridSSR
            items={featuredMaterials.map((category: any) => ({
              slug: category.slug,
              title: category.title,
              description: category.description,
              href: `/${category.slug}`,
              imageUrl: category.imageUrl,
              imageAlt: category.title,
              badge: {
                materialType: category.materialType as any,
                symbol: "",
                formula: "",
              },
            }))}
            columns={3}
            variant="default"
          />
        </section>
      )}
    </Layout>
  );
}
