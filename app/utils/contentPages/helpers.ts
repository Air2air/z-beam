// app/utils/contentPages/helpers.ts
// Shared helper functions for content type pages (materials, contaminants, etc.)

import { ContentTypeConfig } from '@/app/config/contentTypes';
import { SITE_CONFIG } from '@/app/config';
import { createMetadata } from '@/app/utils/metadata';
import { normalizeForUrl } from '@/app/utils/urlBuilder';

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(
  config: ContentTypeConfig,
  categorySlug: string,
  categoryMetadata?: any
) {
  const categoryDisplayName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  
  if (categoryMetadata) {
    return createMetadata({
      title: categoryMetadata.title,
      description: categoryMetadata.description,
      keywords: categoryMetadata.keywords,
      image: categoryMetadata.ogImage || '/images/z-beam-laser-cleaning-og.jpg',
      slug: `${config.rootPath}/${categorySlug}`,
      canonical: `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}`,
    });
  }
  
  // Fallback metadata
  return createMetadata({
    title: `${categoryDisplayName} ${config.actionText} | ${SITE_CONFIG.shortName}`,
    description: `${config.purposeText} ${categoryDisplayName.toLowerCase()} ${config.itemsProperty}.`,
    keywords: [`${categoryDisplayName} ${config.actionText.toLowerCase()}`, config.rootPath],
    image: '/images/z-beam-laser-cleaning-og.jpg',
    slug: `${config.rootPath}/${categorySlug}`,
    canonical: `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}`,
  });
}

/**
 * Generate metadata for subcategory pages
 */
export function generateSubcategoryMetadata(
  config: ContentTypeConfig,
  categorySlug: string,
  subcategorySlug: string,
  subcategoryInfo: any
) {
  const categoryLabel = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/_/g, ' ');
  const itemCount = subcategoryInfo[config.itemsProperty]?.length || 0;
  
  return createMetadata({
    title: `${subcategoryInfo.label} ${categoryLabel} ${config.actionText}`,
    description: `${config.purposeText} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} ${config.itemsProperty}. ${itemCount} ${config.itemsProperty} cataloged.`,
    keywords: [
      `${subcategoryInfo.label} ${config.actionText.toLowerCase()}`,
      `${categoryLabel} ${config.rootPath}`,
      `${subcategoryInfo.label} ${categoryLabel}`,
    ],
    image: '/images/z-beam-laser-cleaning-og.jpg',
    slug: `${config.rootPath}/${categorySlug}/${subcategorySlug}`,
    canonical: `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}`,
  });
}

/**
 * Generate metadata for individual item pages
 */
export async function generateItemMetadata(
  config: ContentTypeConfig,
  categorySlug: string,
  subcategorySlug: string,
  itemSlug: string
) {
  if (!itemSlug) {
    return {
      title: `Page Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested page could not be found.'
    };
  }
  
  try {
    const article = await config.getArticle(itemSlug);
    
    if (!article) {
      return {
        title: `Page Not Found | ${SITE_CONFIG.shortName}`,
        description: 'The requested page could not be found.'
      };
    }
    
    // Settings pages have flat structure, materials/contaminants have metadata wrapper
    const articleMeta = config.type === 'settings' ? article : (article.metadata as any);
    
    // Verify category and subcategory match
    const articleCategory = articleMeta.category ? normalizeForUrl(articleMeta.category) : undefined;
    const articleSubcategory = articleMeta.subcategory ? normalizeForUrl(articleMeta.subcategory) : undefined;
    
    if (articleCategory !== categorySlug || articleSubcategory !== subcategorySlug) {
      // Wrong URL structure - will redirect in page component
      return {
        title: articleMeta.title || SITE_CONFIG.shortName,
        description: articleMeta.description || ''
      };
    }
    
    const canonicalUrl = `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}/${itemSlug}`;
    
    const baseMetadata = createMetadata({
      ...articleMeta,
      canonical: canonicalUrl
    } as any);
    
    return {
      ...baseMetadata,
      alternates: {
        canonical: canonicalUrl
      }
    };
  } catch (error) {
    console.error(`Error generating metadata for ${itemSlug}:`, error);
    return {
      title: SITE_CONFIG.shortName,
      description: `Technical information about ${config.rootPath}.`
    };
  }
}

/**
 * Build breadcrumb configuration
 */
export function buildBreadcrumbs(
  config: ContentTypeConfig,
  parts: { category?: string; subcategory?: string; item?: string }
) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: config.plural, href: `/${config.rootPath}` }
  ];
  
  if (parts.category) {
    const categoryLabel = parts.category.charAt(0).toUpperCase() + parts.category.slice(1);
    breadcrumbs.push({ 
      label: categoryLabel, 
      href: `/${config.rootPath}/${parts.category}` 
    });
  }
  
  if (parts.subcategory) {
    const subcategoryLabel = parts.subcategory.charAt(0).toUpperCase() + parts.subcategory.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({ 
      label: subcategoryLabel, 
      href: `/${config.rootPath}/${parts.category}/${parts.subcategory}` 
    });
  }
  
  if (parts.item) {
    const itemLabel = parts.item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    breadcrumbs.push({ 
      label: itemLabel, 
      href: `/${config.rootPath}/${parts.category}/${parts.subcategory}/${parts.item}` 
    });
  }
  
  return breadcrumbs;
}

/**
 * Format category display name
 */
export function formatCategoryName(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' ');
}

/**
 * Get items from category data based on content type
 */
export function getItemsFromCategory(categoryData: any, config: ContentTypeConfig): any[] {
  return categoryData[config.itemsProperty] || [];
}

/**
 * Get items from subcategory data based on content type
 */
export function getItemsFromSubcategory(subcategoryData: any, config: ContentTypeConfig): any[] {
  return subcategoryData[config.itemsProperty] || [];
}
