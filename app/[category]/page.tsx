// app/[category]/page.tsx
// Dynamic category pages with SEO optimization

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { createMetadata } from '@/app/utils/metadata';
import { CATEGORY_METADATA, VALID_CATEGORIES } from '../metadata';
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/materialCategories';

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
    canonical: `${SITE_CONFIG.url}/${category}`,
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
  
  // Get category structure with subcategories
  const allCategories = await getAllCategories();
  const categoryData = allCategories.find(cat => cat.slug === category);
  
  if (!categoryData) {
    notFound();
  }
  
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
      <div className={CONTAINER_STYLES.standard}>
        {/* Group materials by subcategory */}
        {categoryData.subcategories.map((subcategory) => (
          <section key={subcategory.slug} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {subcategory.label}
            </h2>
            
            <CardGridSSR
              slugs={subcategory.materials.map(m => m.slug)}
              columns={3}
              mode="simple"
              showBadgeSymbols={true}
              loadBadgeSymbolData={true}
            />
          </section>
        ))}
      </div>
    </Layout>
  );
}