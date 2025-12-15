// app/contaminants/[category]/page.tsx
// Dynamic contamination category pages

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/contaminantCategories';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { generateCollectionPageSchema, generateWebPageSchema, generateItemListSchema } from '@/app/utils/schemas/collectionPageSchema';
import { CONTAMINANT_CATEGORY_METADATA, VALID_CONTAMINANT_CATEGORIES } from '@/app/contaminantMetadata';

export const dynamic = 'force-static';
export const revalidate = false;

// Static generation for all category pages
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    category: category.slug,
  }));
}

// SEO metadata generation per category
export async function generateMetadata({ params }: { params: { category: string } }) {
  const { category } = params;
  
  // Use metadata configuration if available
  const metadataConfig = CONTAMINANT_CATEGORY_METADATA[category];
  if (metadataConfig) {
    return createMetadata({
      title: metadataConfig.title,
      description: metadataConfig.description,
      keywords: metadataConfig.keywords,
      slug: `contaminants/${category}`,
      canonical: `${SITE_CONFIG.url}/contaminants/${category}`,
      ogImage: metadataConfig.ogImage,
    });
  }
  
  // Fallback to dynamic metadata if not in config
  const allCategories = await getAllCategories();
  const categoryData = allCategories.find(cat => cat.slug === category);
  
  if (!categoryData) {
    return {
      title: `Category Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested contaminant category was not found.',
    };
  }

  const categoryDisplayName = categoryData.label;
  
  return createMetadata({
    title: `${categoryDisplayName} Contamination Laser Cleaning | ${SITE_CONFIG.shortName}`,
    description: `Laser cleaning solutions for ${categoryDisplayName.toLowerCase()} contamination types. ${categoryData.contaminants.length} contaminants cataloged.`,
    keywords: [`${categoryDisplayName} contamination`, 'laser cleaning', 'contaminant removal', 'industrial cleaning'],
    slug: `contaminants/${category}`,
    canonical: `${SITE_CONFIG.url}/contaminants/${category}`,
  });
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  
  // Get category structure with subcategories
  const allCategories = await getAllCategories();
  const categoryData = allCategories.find(cat => cat.slug === category);
  
  if (!categoryData) {
    notFound();
  }
  
  const categoryDisplayName = categoryData.label;
  const pageTitle = `${categoryDisplayName} Contamination`;
  const pageDescription = `Laser cleaning solutions for ${categoryDisplayName.toLowerCase()} contamination types. ${categoryData.contaminants.length} contaminants available.`;

  // Create metadata object with breadcrumb configuration
  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Contaminants', href: '/contaminants' },
      { label: categoryDisplayName, href: `/contaminants/${category}` }
    ]
  };

  const categoryUrl = `${SITE_CONFIG.url}/contaminants/${category}`;
  
  // Generate comprehensive JSON-LD schemas
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      generateCollectionPageSchema({
        url: categoryUrl,
        name: pageTitle,
        description: pageDescription,
        numberOfItems: categoryData.contaminants.length,
        itemListElement: categoryData.subcategories.flatMap((subcategory, subIndex) => 
          subcategory.contaminants.map((contaminant, conIndex) => ({
            '@type': 'ListItem',
            'position': subIndex * 100 + conIndex + 1,
            'name': contaminant.name,
            'url': `${SITE_CONFIG.url}/contaminants/${category}/${subcategory.slug}/${contaminant.slug}`,
            'item': {
              '@type': 'Article',
              '@id': `${SITE_CONFIG.url}/contaminants/${category}/${subcategory.slug}/${contaminant.slug}`,
              'name': contaminant.name,
              'url': `${SITE_CONFIG.url}/contaminants/${category}/${subcategory.slug}/${contaminant.slug}`
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
          { '@type': 'ListItem', 'position': 2, 'name': 'Contaminants', 'item': `${SITE_CONFIG.url}/contaminants` },
          { '@type': 'ListItem', 'position': 3, 'name': categoryDisplayName, 'item': categoryUrl }
        ]
      },
      
      // 3. ItemList schema
      generateItemListSchema({
        url: categoryUrl,
        name: pageTitle,
        description: pageDescription,
        items: categoryData.subcategories.flatMap(sub => 
          sub.contaminants.map(con => ({
            name: con.name,
            url: `${SITE_CONFIG.url}/contaminants/${category}/${sub.slug}/${con.slug}`
          }))
        )
      }),
      
      // 4. WebPage schema
      generateWebPageSchema({
        url: categoryUrl,
        name: pageTitle,
        description: pageDescription,
        breadcrumbId: `${categoryUrl}#breadcrumb`,
        authorId: `${SITE_CONFIG.url}#author-technical-team`
      })
    ]
  };

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        description={pageDescription} 
        metadata={metadata as any}
        slug={`contaminants/${category}`}
      >
        {/* Group contaminants by subcategory */}
        {categoryData.subcategories.map((subcategory) => (
          <div key={subcategory.slug} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{subcategory.label}</h2>
            <CardGridSSR
              slugs={subcategory.contaminants.map(c => c.slug)}
              columns={3}
              mode="contaminants"
              showBadgeSymbols={false}
              loadBadgeSymbolData={false}
            />
          </div>
        ))}
      </Layout>
    </>
  );
}
