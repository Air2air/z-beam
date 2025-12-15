// app/contaminants/page.tsx
// Main contaminants listing page

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/contaminantCategories';
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
  const categories = await getAllCategories();
  
  if (!categories || categories.length === 0) {
    notFound();
  }
  
  const pageTitle = 'Contaminants Database';
  const pageDescription = 'Explore our comprehensive database of contaminant types and laser cleaning solutions for industrial applications.';
  const pageUrl = `${SITE_CONFIG.url}/contaminants`;

  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Contaminants', href: '/contaminants' }
    ]
  };

  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      generateCollectionPageSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        numberOfItems: categories.length,
        itemListElement: categories.map((category, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': category.label,
          'url': `${SITE_CONFIG.url}/contaminants/${category.slug}`,
          'item': {
            '@type': 'CollectionPage',
            '@id': `${SITE_CONFIG.url}/contaminants/${category.slug}`,
            'name': `${category.label} Contamination`,
            'url': `${SITE_CONFIG.url}/contaminants/${category.slug}`
          }
        }))
      }),
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': 'Contaminants', 'item': pageUrl }
        ]
      },
      generateItemListSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        items: categories.map(cat => ({
          name: cat.label,
          url: `${SITE_CONFIG.url}/contaminants/${cat.slug}`
        }))
      }),
      generateWebPageSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        breadcrumbId: `${pageUrl}#breadcrumb`,
        authorId: `${SITE_CONFIG.url}#author-technical-team`
      })
    ]
  };

  // Map categories to card format
  const categoryCards = categories.map(category => {
    const firstContaminant = category.subcategories[0]?.contaminants[0];
    const imageUrl = `/images/contaminant/${firstContaminant?.slug || category.slug}-hero.jpg`;
    
    return {
      slug: `contaminants/${category.slug}`,
      title: category.label,
      description: `Laser cleaning solutions for ${category.label.toLowerCase()} contamination types`,
      href: `/contaminants/${category.slug}`,
      imageUrl,
      imageAlt: `${category.label} contamination removal`,
    };
  });

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        description={pageDescription} 
        metadata={metadata as any}
        slug="contaminants"
      >
        <div className="mb-8">
          <CardGridSSR
            items={categoryCards}
            columns={3}
            variant="default"
          />
        </div>
      </Layout>
    </>
  );
}
