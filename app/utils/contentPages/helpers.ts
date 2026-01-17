// app/utils/contentPages/helpers.ts
// Shared helper functions for content type pages (materials, contaminants, etc.)

import { ContentTypeConfig } from '@/app/config/contentTypes';
import { SITE_CONFIG } from '@/app/config';
import { createMetadata } from '@/app/utils/metadata';
import { normalizeForUrl } from '@/app/utils/urlBuilder';
import { getMetadata } from '@/app/utils/schemas/helpers';

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
    title: `${categoryDisplayName} ${config.actionText}`,
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
    
    // All domains use consistent metadata structure (normalized)
    // Use backward compatibility helper to access frontmatter/metadata
    const articleMeta = getMetadata(article);
    
    // Debug: Check if metaDescription exists
    console.log(`[METADATA] ${itemSlug}:`, {
      type: config.type,
      hasMetaDescription: !!articleMeta.metaDescription,
      hasDescription: !!articleMeta.description,
      hasPageDescription: !!articleMeta.pageDescription,
      metaDescription: articleMeta.metaDescription,
      description_preview: articleMeta.description?.substring(0, 50)
    });
    
    // Extract category and subcategory from fullPath (primary source for all domains)
    // Support both fullPath (camelCase) and full_path (snake_case) for backward compatibility
    let articleCategory: string | undefined;
    let articleSubcategory: string | undefined;
    
    const pathToUse = articleMeta.fullPath || articleMeta.full_path;
    if (pathToUse) {
      const pathParts = pathToUse.split('/').filter(Boolean);
      // fullPath format: /rootPath/category/subcategory/slug
      if (pathParts.length >= 3 && pathParts[0] === config.rootPath) {
        articleCategory = pathParts[1];
        articleSubcategory = pathParts[2];
      }
    } else {
      // Fallback to explicit fields (shouldn't happen in production)
      articleCategory = (articleMeta.category && typeof articleMeta.category === 'string') 
        ? normalizeForUrl(articleMeta.category) 
        : undefined;
      articleSubcategory = (articleMeta.subcategory && typeof articleMeta.subcategory === 'string') 
        ? normalizeForUrl(articleMeta.subcategory) 
        : undefined;
    }
    
    if (articleCategory !== categorySlug || articleSubcategory !== subcategorySlug) {
      // Wrong URL structure - will redirect in page component
      return {
        title: articleMeta.title || articleMeta.name || SITE_CONFIG.shortName,
        description: articleMeta.metaDescription || articleMeta.pageDescription || ''
      };
    }
    
    const canonicalUrl = `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}/${itemSlug}`;
    
    // Ensure title and description fields exist for metadata generation across all domains
    // Prioritize metaDescription (SEO-optimized, concise) over pageDescription (full content)
    // Applies to: materials, contaminants, compounds, settings
    // Note: 'description' field is DEPRECATED - do not use
    const metadataWithTitle = {
      ...articleMeta,
      title: articleMeta.pageTitle || articleMeta.displayName || articleMeta.title || articleMeta.name,
      description: articleMeta.metaDescription || articleMeta.pageDescription || '',
      canonical: canonicalUrl
    };
    
    const baseMetadata = createMetadata(metadataWithTitle as any);
    
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
