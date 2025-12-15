// app/contaminants/page.tsx
// Main contaminants listing page

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/contaminantCategories';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { generateCollectionPageSchema, generateWebPageSchema, generateItemListSchema } from '@/app/utils/schemas/collectionPageSchema';

export const dynamic = 'force-static';
export const revalidate = false;

// SEO metadata generation
export async function generateMetadata() {
  return createMetadata({
    title: `Contaminants | ${SITE_CONFIG.shortName} Laser Cleaning`,
    description: 'Comprehensive guide to contaminant types and laser cleaning solutions for industrial applications. From oxidation to coatings, explore our extensive contamination database.',
    keywords: ['contamination types', 'laser cleaning contaminants', 'rust removal', 'paint removal', 'oxidation removal', 'coating removal'],
    image: '/images/contaminants-og.jpg',
    slug: 'contaminants',
    canonical: `${SITE_CONFIG.url}/contaminants`,
  });
}

export default async function ContaminantsPage() {
  // Get all categories
  const allCategories = await getAllCategories();
  
  if (!allCategories || allCategories.length === 0) {
    notFound();
  }
  
  const pageTitle = 'Contaminants Database';
  const pageDescription = 'Explore our comprehensive database of contaminant types and laser cleaning solutions for industrial applications.';
  const pageUrl = `${SITE_CONFIG.url}/contaminants`;

  // Create metadata object with breadcrumb configuration
  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Contaminants', href: '/contaminants' }
    ]
  };

  // Generate comprehensive JSON-LD schemas
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      generateCollectionPageSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        numberOfItems: allCategories.reduce((sum, cat) => sum + cat.contaminants.length, 0),
        itemListElement: allCategories.flatMap((category, catIndex) => 
          category.subcategories.flatMap((subcategory, subIndex) => 
            subcategory.contaminants.map((contaminant, conIndex) => ({
              '@type': 'ListItem',
              'position': catIndex * 1000 + subIndex * 100 + conIndex + 1,
              'name': contaminant.name,
              'url': `${SITE_CONFIG.url}/contaminants/${category.slug}/${subcategory.slug}/${contaminant.slug}`,
              'item': {
                '@type': 'Article',
                '@id': `${SITE_CONFIG.url}/contaminants/${category.slug}/${subcategory.slug}/${contaminant.slug}`,
                'name': contaminant.name,
                'url': `${SITE_CONFIG.url}/contaminants/${category.slug}/${subcategory.slug}/${contaminant.slug}`
              }
            }))
          )
        )
      }),
      
      // 2. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': 'Contaminants', 'item': pageUrl }
        ]
      },
      
      // 3. ItemList schema
      generateItemListSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        items: allCategories.flatMap(cat => 
          cat.subcategories.flatMap(sub => 
            sub.contaminants.map(con => ({
              name: con.name,
              url: `${SITE_CONFIG.url}/contaminants/${cat.slug}/${sub.slug}/${con.slug}`
            }))
          )
        )
      }),
      
      // 4. WebPage schema
      generateWebPageSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        breadcrumbId: `${pageUrl}#breadcrumb`,
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
        slug="contaminants"
      >
        {/* Group contaminants by category */}
        {allCategories.map((category) => (
          <div key={category.slug} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">{category.label}</h2>
            
            {/* Group by subcategory within each category */}
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.slug} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">{subcategory.label}</h3>
                <CardGridSSR
                  slugs={subcategory.contaminants.map(c => c.slug)}
                  columns={3}
                  mode="contaminants"
                  showBadgeSymbols={false}
                  loadBadgeSymbolData={false}
                />
              </div>
            ))}
          </div>
        ))}
      </Layout>
    </>
  );
}
