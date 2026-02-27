// app/utils/contentPages/helpers.ts
// Shared helper functions for content type pages (materials, contaminants, etc.)

import { ContentTypeConfig } from '@/app/config/contentTypes';
import { SITE_CONFIG } from '@/app/config';
import { createMetadata } from '@/app/utils/metadata';
import { normalizeForUrl } from '@/app/utils/urlBuilder';
import { getMetadata } from '@/app/utils/schemas/helpers';
import { 
  generateMaterialMetadata, 
  generateContaminantMetadata,
  generateSettingsMetadata,
  generateDynamicPageMetadata
} from '@/lib/metadata/dynamic-generators';

function titleFromSlug(slug: string): string {
  return slug
    .replace(/-laser-cleaning$/i, '')
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

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
  const baseDescription = `${config.purposeText} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} ${config.itemsProperty}. ${itemCount} ${config.itemsProperty} cataloged.`;
  const description = baseDescription.length < 110
    ? `${baseDescription} Includes practical methods, safety notes, and parameter guidance.`
    : baseDescription;
  
  return createMetadata({
    title: `${subcategoryInfo.label} ${categoryLabel} ${config.actionText}`,
    description,
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
 * Uses centralized dynamic metadata utilities for consistency
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
    
    // Use backward compatibility helper to access frontmatter/metadata
    const articleMeta = getMetadata(article) as Record<string, any>;
    
    // Extract category and subcategory from fullPath (primary source for all domains)
    let articleCategory: string | undefined;
    let articleSubcategory: string | undefined;
    
    const pathToUse = (articleMeta.fullPath || articleMeta.full_path) as string;
    if (pathToUse) {
      const pathParts = pathToUse.split('/').filter(Boolean);
      // fullPath format: /rootPath/category/subcategory/slug
      if (pathParts.length >= 3 && pathParts[0] === config.rootPath) {
        articleCategory = pathParts[1];
        articleSubcategory = pathParts[2];
      }
    } else {
      // Fallback to explicit fields
      articleCategory = (articleMeta.category && typeof articleMeta.category === 'string') 
        ? normalizeForUrl(articleMeta.category) 
        : undefined;
      articleSubcategory = (articleMeta.subcategory && typeof articleMeta.subcategory === 'string') 
        ? normalizeForUrl(articleMeta.subcategory) 
        : undefined;
    }
    
    const hasResolvedRoute = Boolean(articleCategory && articleSubcategory);

    if (hasResolvedRoute && (articleCategory !== categorySlug || articleSubcategory !== subcategorySlug)) {
      // Wrong URL structure - will redirect in page component
      return {
        title: articleMeta.displayTitle || articleMeta.displayName || articleMeta.title || articleMeta.name || titleFromSlug(itemSlug),
        description: articleMeta.pageDescription || ''
      };
    }
    
    // Extract common metadata fields
    const displayName = articleMeta.displayTitle || articleMeta.displayName || articleMeta.title || articleMeta.name || titleFromSlug(itemSlug);
    const description =
      articleMeta.pageDescription ||
      articleMeta.description ||
      articleMeta.summary ||
      articleMeta.excerpt ||
      '';
    const keywords = articleMeta.keywords || [];
    const heroImage = articleMeta.images?.hero?.url;
    const videoUrl = articleMeta.video?.url || articleMeta.video?.embedUrl || articleMeta.videoUrl;
    const dateModified = articleMeta.dateModified;
    
    // Extract author information
    const author = articleMeta.author && typeof articleMeta.author === 'object' && typeof articleMeta.author.name === 'string'
      ? {
          name: articleMeta.author.name,
          title: articleMeta.author.title,
          country: articleMeta.author.country
        }
      : undefined;
    
    // Use domain-specific metadata generators
    if (config.type === 'materials') {
      return generateMaterialMetadata({
        materialName: displayName,
        description,
        slug: itemSlug,
        category: categorySlug,
        subcategory: subcategorySlug,
        keywords,
        author,
        dateModified,
        image: heroImage,
        videoUrl
      });
    } else if (config.type === 'contaminants') {
      return generateContaminantMetadata({
        contaminantName: displayName,
        description,
        slug: itemSlug,
        category: categorySlug,
        subcategory: subcategorySlug,
        keywords,
        dateModified,
        image: heroImage
      });
    } else if (config.type === 'settings') {
      return generateSettingsMetadata({
        settingName: displayName,
        description,
        slug: itemSlug,
        materialType: categorySlug,
        category: categorySlug,
        subcategory: subcategorySlug,
        keywords,
        dateModified
      });
    } else {
      // Compounds or other types - use generic dynamic metadata
      return generateDynamicPageMetadata({
        title: `${displayName} | ${SITE_CONFIG.name}`,
        description,
        pathname: `/${config.rootPath}/${categorySlug}/${subcategorySlug}/${itemSlug}`,
        keywords,
        image: heroImage,
        author,
        dateModified
      });
    }
  } catch (error) {
    console.error(`Error generating metadata for ${itemSlug}:`, error);
    return createMetadata({
      title: SITE_CONFIG.shortName,
      description: `Technical information about ${config.rootPath}.`,
      slug: `${config.rootPath}/${categorySlug}/${subcategorySlug}/${itemSlug}`,
      canonical: `${SITE_CONFIG.url}/${config.rootPath}/${categorySlug}/${subcategorySlug}/${itemSlug}`,
    });
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
