// app/settings/page.tsx
// Main settings listing page

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/settingsCategories';
import { getSettingsArticle } from '@/app/utils/contentAPI';
import { generateCollectionPageSchema, generateWebPageSchema, generateItemListSchema } from '@/app/utils/schemas/collectionPageSchema';

export const dynamic = 'force-static';
export const revalidate = false;

// SEO metadata generation
export async function generateMetadata() {
  return createMetadata({
    title: `Machine Settings | ${SITE_CONFIG.shortName} Laser Cleaning`,
    description: 'Comprehensive laser cleaning machine settings database for industrial applications. Optimized parameters for wavelength, power, fluence, and more.',
    keywords: ['machine settings', 'laser parameters', 'wavelength', 'power', 'fluence', 'industrial laser settings'],
    image: '/images/settings-og.jpg',
    slug: 'settings',
    canonical: `${SITE_CONFIG.url}/settings`,
  });
}

export default async function SettingsPage() {
  const categories = await getAllCategories();
  
  if (!categories || categories.length === 0) {
    notFound();
  }
  
  const pageTitle = 'Machine Settings';
  const pageDescription = 'Explore optimized laser cleaning machine settings for every material type.';
  const pageUrl = `${SITE_CONFIG.url}/settings`;

  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' }
    ]
  };

  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      generateCollectionPageSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        numberOfItems: categories.reduce((sum, cat) => sum + cat.settings.length, 0),
        itemListElement: categories.map((category, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': category.label,
          'url': `${SITE_CONFIG.url}/settings/${category.slug}`,
          'item': {
            '@type': 'CollectionPage',
            '@id': `${SITE_CONFIG.url}/settings/${category.slug}`,
            'name': `${category.label} Machine Settings`,
            'url': `${SITE_CONFIG.url}/settings/${category.slug}`
          }
        }))
      }),
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': 'Settings', 'item': pageUrl }
        ]
      },
      generateItemListSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        items: categories.map(cat => ({
          name: cat.label,
          url: `${SITE_CONFIG.url}/settings/${cat.slug}`
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

  // Map categories to card format - load first setting to get actual image
  const categoryCards = await Promise.all(categories.map(async category => {
    const firstSetting = category.settings[0];
    let imageUrl = `/images/material/${category.slug}-hero.jpg`;
    
    // Try to get actual image from first setting
    if (firstSetting?.slug) {
      try {
        const article = await getSettingsArticle(firstSetting.slug);
        // SettingsMetadata has images directly (not nested in metadata)
        const articleData = article as any;
        imageUrl = articleData?.images?.hero?.url || imageUrl;
      } catch {
        // Fall back to constructed URL
      }
    }
    
    return {
      slug: `settings/${category.slug}`,
      title: category.label,
      description: `Optimized machine settings for ${category.label.toLowerCase()} laser cleaning`,
      href: `/settings/${category.slug}`,
      imageUrl,
      imageAlt: `${category.label} machine settings`,
    };
  }));

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        description={pageDescription} 
        metadata={metadata as any}
        slug="settings"
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
