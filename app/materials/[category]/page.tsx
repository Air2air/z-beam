// app/[category]/page.tsx
// Dynamic category pages with SEO optimization

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { createMetadata } from '@/app/utils/metadata';
import { CATEGORY_METADATA, VALID_CATEGORIES } from '@/app/metadata';
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/materialCategories';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import CategoryDatasetCard from '@/app/components/Dataset/CategoryDatasetCard';

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
    slug: `materials/${category}`,
    canonical: `${SITE_CONFIG.url}/materials/${category}`,
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
      { label: categoryDisplayName, href: `/materials/${category}` }
    ]
  };

  // Generate CollectionPage JSON-LD schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': pageTitle,
    'description': categoryMetadata.description,
    'url': `${SITE_CONFIG.url}/materials/${category}`,
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': SITE_CONFIG.url
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': categoryDisplayName,
          'item': `${SITE_CONFIG.url}/materials/${category}`
        }
      ]
    },
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': categoryData.materials.length,
      'itemListElement': categoryData.subcategories.map((subcategory, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': subcategory.label,
        'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory.slug}`,
        'description': `${subcategory.materials.length} materials in ${subcategory.label}`,
        'item': {
          '@type': 'ItemList',
          'numberOfItems': subcategory.materials.length,
          'itemListElement': subcategory.materials.map((material, matIndex) => ({
            '@type': 'ListItem',
            'position': matIndex + 1,
            'name': material.name,
            'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory.slug}/${material.slug}`
          }))
        }
      }))
    },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_CONFIG.name,
      'url': SITE_CONFIG.url
    }
  };

  // Collect all materials in this category for dataset
  const allMaterials = categoryData.subcategories.flatMap(sub => 
    sub.materials.map(mat => ({
      ...mat,
      subcategory: sub.slug,
      subcategoryLabel: sub.label
    }))
  );

  return (
    <>
      <JsonLD data={collectionSchema} />
      <Layout 
        title={pageTitle} 
        subtitle={pageSubtitle} 
        metadata={metadata as any}
        slug={`materials/${category}`}
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
        
        {/* Category Dataset Card at bottom */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
          <CategoryDatasetCard 
            category={category}
            categoryLabel={categoryDisplayName}
            materials={allMaterials}
          />
        </div>
      </Layout>
    </>
  );
}