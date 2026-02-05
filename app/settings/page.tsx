// app/settings/page.tsx
// Main settings listing page

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getContentConfig } from '@/app/config/contentTypes';
import { generateCollectionPageSchema, generateWebPageSchema, generateItemListSchema } from '@/app/utils/schemas/collectionPageSchema';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export const dynamic = 'force-static';
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : false; // 1 hour ISR in production

// SEO metadata generation
export async function generateMetadata() {
  const config = getContentConfig('settings');
  return createMetadata({
    title: `${config.plural} | ${SITE_CONFIG.shortName} Laser Cleaning`,
    description: `Comprehensive laser cleaning machine settings database for industrial applications. Optimized parameters for wavelength, power, fluence, and more.`,
    keywords: ['machine settings', 'laser parameters', 'wavelength', 'power', 'fluence', 'industrial laser settings'],
    image: '/images/settings-og.jpg',
    slug: config.rootPath,
    canonical: `${SITE_CONFIG.url}/${config.rootPath}`,
  });
}

export default async function SettingsPage() {
  const config = getContentConfig('settings');
  
  // Settings files don't have category/subcategory structure - load all directly
  const frontmatterDir = path.join(process.cwd(), 'frontmatter', config.type);
  const files = await fs.readdir(frontmatterDir);
  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  
  if (!yamlFiles || yamlFiles.length === 0) {
    notFound();
  }
  
  const pageTitle = config.plural;
  const pageDescription = `Explore optimized laser cleaning ${config.itemsProperty} for every material type.`;
  const pageUrl = `${SITE_CONFIG.url}/${config.rootPath}`;

  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: config.plural, href: `/${config.rootPath}` }
    ]
  };

  // Load all settings frontmatter files
  const settingsCards = await Promise.all(yamlFiles.map(async (file) => {
    const filePath = path.join(frontmatterDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const data: any = yaml.load(content);
    
    const slug = file.replace(/(-settings)?\.(yaml|yml)$/, '');
    const name = data.name || data.title || slug;
    
    // Use meta.path from frontmatter for correct nested URL structure
    const href = data.meta?.path || data.fullPath || data.full_path || `/${config.rootPath}/${slug}`;
    
    // Try to load corresponding material's hero image
    let imageUrl = data.images?.hero?.url || `/images/material/${slug}-hero.jpg`;
    try {
      const materialPath = path.join(process.cwd(), 'frontmatter', 'materials');
      const materialFiles = await fs.readdir(materialPath);
      const materialFile = materialFiles.find(f => {
        const materialSlug = f.replace(/-laser-cleaning\.(yaml|yml)$/, '');
        return materialSlug === slug || materialSlug === slug.toLowerCase();
      });
      
      if (materialFile) {
        const materialContent = await fs.readFile(path.join(materialPath, materialFile), 'utf-8');
        const materialData: any = yaml.load(materialContent);
        if (materialData?.images?.hero?.url) {
          imageUrl = materialData.images.hero.url;
        }
      }
    } catch (_e) {
      // Fall back to constructed URL if material not found
    }
    
    return {
      slug: href.replace(/^\//, ''),
      title: name,
      description: `${config.actionText} for ${name.toLowerCase()}`,
      href,
      imageUrl,
      imageAlt: `${name} ${config.itemsProperty}`,
    };
  }));

  // Sort alphabetically
  settingsCards.sort((a, b) => a.title.localeCompare(b.title));

  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      generateCollectionPageSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        numberOfItems: settingsCards.length,
        itemListElement: settingsCards.map((setting, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': setting.title,
          'url': `${SITE_CONFIG.url}${setting.href}`,
          'item': {
            '@type': 'Article',
            '@id': `${SITE_CONFIG.url}${setting.href}`,
            'name': setting.title,
            'url': `${SITE_CONFIG.url}${setting.href}`
          }
        }))
      }),
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': pageTitle, 'item': pageUrl }
        ]
      },
      generateItemListSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        items: settingsCards.map(setting => ({
          name: setting.title,
          url: `${SITE_CONFIG.url}${setting.href}`
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

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        pageDescription={pageDescription} 
        metadata={metadata as any}
        slug={config.rootPath}
      >
        <div className="mb-8">
          <CardGridSSR
            items={settingsCards}
            columns={3}
            variant="default"
          />
        </div>
      </Layout>
    </>
  );
}
