// app/[category]/page.tsx
// Dynamic category pages with SEO optimization

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { getAllArticleSlugs } from '@/app/utils/contentAPI';
import { createMetadata } from '@/app/utils/metadata';
import { CATEGORY_METADATA, VALID_CATEGORIES } from '../metadata';
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';
import { SITE_CONFIG } from '@/app/config';

// Static generation for all category pages
export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}

// SEO metadata generation per category
export async function generateMetadata({ params }: { params: { category: string } }) {
  const { category } = params;
  
  if (!VALID_CATEGORIES.includes(category)) {
    return {
      title: `Category Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested material category was not found.',
    };
  }

  const categoryMetadata = CATEGORY_METADATA[category];
  
  return createMetadata({
    title: categoryMetadata.title,
    description: categoryMetadata.description,
    keywords: categoryMetadata.keywords,
    image: categoryMetadata.ogImage,
    slug: `${category}`,
  });
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  
  // Validate category exists
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  // Get metadata for this category
  const categoryMetadata = CATEGORY_METADATA[category];
  
  // Fetch all article slugs
  const slugs = await getAllArticleSlugs();
  
  // Capitalize category name for display
  const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);
  const pageTitle = `${categoryDisplayName} Laser Cleaning`;
  const pageSubtitle = categoryMetadata.subtitle;

  // Create metadata object with breadcrumb configuration
  const metadata = {
    title: pageTitle,
    subtitle: pageSubtitle,
    description: categoryMetadata.description,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: categoryDisplayName, href: `/${category}` }
    ]
  };

  return (
    <Layout 
      title={pageTitle} 
      subtitle={pageSubtitle} 
      metadata={metadata as any}
      slug={`${category}`}
      fullWidth
    >
      {/* Materials Grid - no hero content in metadata, so Hero won't render */}
      <section className={CONTAINER_STYLES.standard}>
        <CardGridSSR
          slugs={slugs}
          columns={3}
          mode="simple"
          filterBy={categoryDisplayName}
          showBadgeSymbols={true}
          loadBadgeSymbolData={true}
        />
      </section>
    </Layout>
  );
}