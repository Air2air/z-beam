import { SITE_CONFIG } from '@/app/config';

/**
 * Generate standard CollectionPage schema for material listing pages
 */
export function generateCollectionPageSchema(params: {
  url: string;
  name: string;
  description: string;
  numberOfItems: number;
  itemListElement?: any[];
}) {
  return {
    '@type': 'CollectionPage',
    '@id': `${params.url}#collection`,
    'url': params.url,
    'name': params.name,
    'description': params.description,
    'inLanguage': 'en-US',
    'isPartOf': {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.url}#website`
    },
    'about': {
      '@type': 'Thing',
      'name': 'Laser Cleaning Materials'
    },
    'numberOfItems': params.numberOfItems,
    ...(params.itemListElement && {
      'mainEntity': {
        '@type': 'ItemList',
        'itemListElement': params.itemListElement
      }
    })
  };
}

/**
 * Generate standard WebPage schema
 */
export function generateWebPageSchema(params: {
  url: string;
  name: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumbId?: string;
  author?: string;  // @id URI of the author entity in JSON-LD
}) {
  return {
    '@type': 'WebPage',
    '@id': `${params.url}#webpage`,
    'url': params.url,
    'name': params.name,
    'description': params.description,
    'inLanguage': 'en-US',
    'isPartOf': {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.url}#website`
    },
    ...(params.datePublished && { 'datePublished': params.datePublished }),
    ...(params.dateModified && { 'dateModified': params.dateModified }),
    ...(params.breadcrumbId && {
      'breadcrumb': {
        '@id': params.breadcrumbId
      }
    }),
    ...(params.author && {
      'author': {
        '@id': params.author
      }
    })
  };
}

/**
 * Generate standard ItemList schema for category/subcategory listings
 */
export function generateItemListSchema(params: {
  url: string;
  name: string;
  description: string;
  items: Array<{
    name: string;
    description?: string;
    url?: string;
  }>;
}) {
  return {
    '@type': 'ItemList',
    '@id': `${params.url}#itemlist`,
    'name': params.name,
    'description': params.description,
    'itemListElement': params.items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Thing',
        'name': item.name,
        ...(item.description && { 'description': item.description }),
        ...(item.url && { 'url': item.url })
      }
    }))
  };
}
