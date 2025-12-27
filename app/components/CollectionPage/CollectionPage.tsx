// app/components/CollectionPage/CollectionPage.tsx
// Reusable collection page for all content domains (materials, contaminants, compounds, settings)

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { SITE_CONFIG } from '@/app/config';
import { generateCollectionPageSchema, generateWebPageSchema, generateItemListSchema } from '@/app/utils/schemas/collectionPageSchema';
import type { CollectionPageCategory, CollectionPageConfig } from '@/types/centralized';

export type { CollectionPageCategory, CollectionPageConfig };

export async function CollectionPage({ config }: { config: CollectionPageConfig }) {
  const { type, plural, rootPath, pageTitle, pageDescription, categories } = config;
  
  if (!categories || categories.length === 0) {
    notFound();
  }
  
  const pageUrl = `${SITE_CONFIG.url}/${rootPath}`;

  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: plural, href: `/${rootPath}` }
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
          'url': `${SITE_CONFIG.url}/${rootPath}/${category.slug}`,
          'item': {
            '@type': 'CollectionPage',
            '@id': `${SITE_CONFIG.url}/${rootPath}/${category.slug}`,
            'name': `${category.label} ${type === 'materials' ? 'Laser Cleaning' : type === 'contaminants' ? 'Contamination' : type === 'compounds' ? 'Compounds' : ''}`,
            'url': `${SITE_CONFIG.url}/${rootPath}/${category.slug}`
          }
        }))
      }),
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': plural, 'item': pageUrl }
        ]
      },
      generateItemListSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        items: categories.map(cat => ({
          name: cat.label,
          url: `${SITE_CONFIG.url}/${rootPath}/${cat.slug}`
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
    // Get first item from category for image reference
    const firstItem = category.items?.[0] || 
                     category.materials?.[0] || 
                     category.contaminants?.[0] ||
                     category.subcategories?.[0]?.items?.[0];
    
    // Use singular form for image paths (material, contaminant, compound, setting)
    const imagePath = type === 'materials' ? 'material' : 
                     type === 'contaminants' ? 'contaminant' : 
                     type === 'compounds' ? 'compound' : 
                     type === 'settings' ? 'setting' : type;
    
    const imageUrl = config.getImageUrl?.(category) || 
                     `/images/${imagePath}/${firstItem?.slug || category.slug}-hero.jpg`;
    
    const description = config.getCardDescription?.(category) || 
                       (type === 'materials' ? `Laser cleaning parameters and machine settings for ${category.label.toLowerCase()}` :
                        type === 'contaminants' ? `Laser cleaning solutions for ${category.label.toLowerCase()} contamination types` :
                        type === 'compounds' ? `Safety data for ${category.label.toLowerCase()} compounds produced during laser cleaning` :
                        `Optimized ${rootPath} for ${category.label.toLowerCase()}`);
    
    return {
      slug: `${rootPath}/${category.slug}`,
      title: category.label,
      description,
      href: `/${rootPath}/${category.slug}`,
      imageUrl,
      imageAlt: `${category.label} ${type === 'materials' ? 'laser cleaning' : type === 'contaminants' ? 'contamination removal' : type === 'compounds' ? 'compound safety information' : rootPath}`,
    };
  });

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        page_description={pageDescription} 
        metadata={metadata as any}
        slug={rootPath}
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
