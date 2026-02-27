// app/utils/contentPages/schemas.ts
// Shared schema generation for content type pages

import { ContentTypeConfig } from '@/app/config/contentTypes';
import { SITE_CONFIG } from '@/app/config';
import { 
  generateCollectionPageSchema, 
  generateWebPageSchema, 
  generateItemListSchema 
} from '@/app/utils/schemas/collectionPageSchema';
import { 
  generateDatasetSchema, 
  generateDatasetDistributions 
} from '@/app/utils/schemas/datasetSchema';
import { 
  generateCategoryAuthorSchema,
  generateSubcategoryAuthorSchema 
} from '@/app/utils/schemas/personSchemas';

/**
 * Generate schemas for category pages
 */
export function generateCategorySchemas(
  config: ContentTypeConfig,
  categorySlug: string,
  categoryData: any,
  pageTitle: string,
  pageDescription: string
) {
  const categoryUrl = `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}`;
  const items = categoryData[config.itemsProperty] || [];
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      generateCollectionPageSchema({
        url: categoryUrl,
        name: pageTitle,
        description: pageDescription,
        numberOfItems: items.length,
        itemListElement: categoryData.subcategories?.flatMap((subcategory: any, subIndex: number) => 
          (subcategory[config.itemsProperty] || []).map((item: any, itemIndex: number) => ({
            '@type': 'ListItem',
            'position': subIndex * 100 + itemIndex + 1,
            'name': item.name,
            'url': `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategory.slug}/${item.slug}`,
            'item': {
              '@type': 'Article',
              '@id': `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategory.slug}/${item.slug}`,
              'name': item.name,
              'url': `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategory.slug}/${item.slug}`
            }
          }))
        ) || []
      }),
      
      // 2. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${categoryUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': config.plural, 'item': `${SITE_CONFIG.url}/${config.rootPath}` },
          { '@type': 'ListItem', 'position': 3, 'name': pageTitle, 'item': categoryUrl }
        ]
      },
      
      // 3. ItemList schema
      generateItemListSchema({
        url: categoryUrl,
        name: pageTitle,
        description: pageDescription,
        items: categoryData.subcategories?.flatMap((sub: any) => 
          (sub[config.itemsProperty] || []).map((item: any) => ({
            name: item.name,
            url: `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${sub.slug}/${item.slug}`
          }))
        ) || []
      }),
      
      // 4. WebPage schema
      generateWebPageSchema({
        url: categoryUrl,
        name: pageTitle,
        description: pageDescription,
        breadcrumbId: `${categoryUrl}#breadcrumb`,
        author: `${SITE_CONFIG.url}#author-technical-team`
      }),
      
      // 5. Dataset schema (if applicable)
      generateDatasetSchema({
        name: `${pageTitle} Database`,
        description: pageDescription,
        url: categoryUrl,
        distribution: generateDatasetDistributions({
          baseUrl: categoryUrl,
          slug: categorySlug,
          name: pageTitle
        })
      }),
      
      // 6. Author schema
      generateCategoryAuthorSchema(categorySlug, config.rootPath)
    ].filter(Boolean) // Remove null values
  };
}

/**
 * Generate schemas for subcategory pages
 */
export function generateSubcategorySchemas(
  config: ContentTypeConfig,
  categorySlug: string,
  subcategorySlug: string,
  subcategoryInfo: any,
  pageTitle: string,
  pageDescription: string
) {
  const pageUrl = `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}`;
  const items = subcategoryInfo[config.itemsProperty] || [];
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      generateCollectionPageSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        numberOfItems: items.length,
        itemListElement: items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.name,
          'url': `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}/${item.slug}`,
          'item': {
            '@type': 'Article',
            '@id': `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}/${item.slug}`,
            'name': item.name,
            'url': `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}/${item.slug}`
          }
        }))
      }),
      
      // 2. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': config.plural, 'item': `${SITE_CONFIG.url}/${config.rootPath}` },
          { '@type': 'ListItem', 'position': 3, 'name': categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1), 'item': `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}` },
          { '@type': 'ListItem', 'position': 4, 'name': subcategoryInfo.label, 'item': pageUrl }
        ]
      },
      
      // 3. ItemList schema
      generateItemListSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        items: items.map((item: any) => ({
          name: item.name,
          url: `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}/${item.slug}`
        }))
      }),
      
      // 4. WebPage schema
      generateWebPageSchema({
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        breadcrumbId: `${pageUrl}#breadcrumb`,
        author: `${SITE_CONFIG.url}#author-technical-team`
      }),
      
      // 5. Dataset schema
      generateDatasetSchema({
        name: `${pageTitle} Database`,
        description: pageDescription,
        url: pageUrl,
        distribution: generateDatasetDistributions({
          baseUrl: pageUrl,
          slug: subcategorySlug,
          name: pageTitle
        })
      }),
      
      // 6. Author schema
      generateSubcategoryAuthorSchema(categorySlug, subcategorySlug, config.rootPath)
    ].filter(Boolean) // Remove null values
  };
}
