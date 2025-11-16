// app/[category]/page.tsx
// Dynamic category pages with SEO optimization

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { createMetadata } from '@/app/utils/metadata';
import { CATEGORY_METADATA, VALID_CATEGORIES } from '@/app/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/materialCategories';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { generateCategoryAuthorSchema } from '@/app/utils/schemas/personSchemas';
import { generateCollectionPageSchema, generateWebPageSchema, generateItemListSchema } from '@/app/utils/schemas/collectionPageSchema';
import { generateDatasetSchema, generateDatasetDistributions } from '@/app/utils/schemas/datasetSchema';

export const dynamic = 'force-static';
export const revalidate = false;

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
      { label: 'Materials', href: '/materials' },
      { label: categoryDisplayName, href: `/materials/${category}` }
    ]
  };

  const categoryUrl = `${SITE_CONFIG.url}/materials/${category}`;
  
  // Generate comprehensive JSON-LD schemas using @graph pattern with utilities
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      generateCollectionPageSchema({
        url: categoryUrl,
        name: pageTitle,
        description: categoryMetadata.description,
        numberOfItems: categoryData.materials.length,
        itemListElement: categoryData.subcategories.flatMap((subcategory, subIndex) => 
          subcategory.materials.map((material, matIndex) => ({
            '@type': 'ListItem',
            'position': subIndex * 100 + matIndex + 1,
            'name': material.name,
            'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory.slug}/${material.slug}`,
            'item': {
              '@type': 'Article',
              '@id': `${SITE_CONFIG.url}/materials/${category}/${subcategory.slug}/${material.slug}`,
              'name': material.name,
              'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory.slug}/${material.slug}`
            }
          }))
        )
      }),
      
      // 2. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${categoryUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': 'Materials', 'item': `${SITE_CONFIG.url}/materials` },
          { '@type': 'ListItem', 'position': 3, 'name': categoryDisplayName, 'item': categoryUrl }
        ]
      },
      
      // 3. ItemList schema for materials
      generateItemListSchema({
        url: categoryUrl,
        name: pageTitle,
        description: categoryMetadata.description,
        items: categoryData.subcategories.flatMap(sub => 
          sub.materials.map(mat => ({
            name: mat.name,
            url: `${SITE_CONFIG.url}/materials/${category}/${sub.slug}/${mat.slug}`
          }))
        )
      }),
      
      // 4. Dataset schema for category-level data aggregation
      {
        ...generateDatasetSchema({
          url: categoryUrl,
          name: `${categoryDisplayName} Laser Cleaning Parameters Dataset`,
          description: `Comprehensive dataset of ${categoryData.materials.length} ${category} materials with laser cleaning parameters, machine settings, and material properties for industrial applications. Includes thermal, optical, mechanical, and laser interaction properties validated against industry standards.`,
          keywords: [category, 'laser cleaning', 'material properties', 'machine settings', 'industrial parameters'],
          distribution: generateDatasetDistributions({
            baseUrl: SITE_CONFIG.url,
            slug: category,
            name: `${categoryDisplayName} Materials`
          }),
          spatialCoverage: 'Global',
          temporalCoverage: '2024/..',
          variableMeasured: [
            'wavelength', 'power', 'fluence', 'pulse duration', 'repetition rate',
            'scan speed', 'thermal conductivity', 'hardness', 'ablation threshold'
          ]
        }),
        'alternateName': `${categoryDisplayName} Materials Database`,
        'hasPart': categoryData.materials.map((material) => ({
          '@type': 'Dataset',
          'name': material.name,
          'description': `Laser cleaning parameters and material properties for ${material.name}, including wavelength, power, fluence, and thermal characteristics.`,
          'url': `${SITE_CONFIG.url}/materials/${category}/${material.subcategory || 'uncategorized'}/${material.slug}`,
          'license': {
            '@type': 'CreativeWork',
            'name': 'Creative Commons Attribution 4.0 International',
            'url': 'https://creativecommons.org/licenses/by/4.0/',
            'identifier': 'CC BY 4.0'
          },
          'creator': {
            '@type': 'Organization',
            '@id': `${SITE_CONFIG.url}#organization`,
            'name': SITE_CONFIG.name
          }
        }))
      },
      
      // 5. WebPage schema
      generateWebPageSchema({
        url: categoryUrl,
        name: pageTitle,
        description: categoryMetadata.description,
        breadcrumbId: `${categoryUrl}#breadcrumb`,
        authorId: `${SITE_CONFIG.url}#author-technical-team`
      }),
      
      // 6. Person schema - Technical author with E-E-A-T enhancements
      generateCategoryAuthorSchema(category, categoryDisplayName)
    ]
  };

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        subtitle={pageSubtitle} 
        metadata={metadata as any}
        slug={`materials/${category}`}
      >
        {/* Group materials by subcategory */}
        {categoryData.subcategories.map((subcategory) => (
          <div key={subcategory.slug} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{subcategory.label}</h2>
            <CardGridSSR
              slugs={subcategory.materials.map(m => m.slug)}
              columns={3}
              mode="simple"
              showBadgeSymbols={true}
              loadBadgeSymbolData={true}
            />
          </div>
        ))}
      </Layout>
    </>
  );
}