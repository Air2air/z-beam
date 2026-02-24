/**
 * Content Page Factory
 * Eliminates duplication across materials/contaminants/compounds/settings page files
 * 
 * Usage:
 *   export const { generateStaticParams, generateMetadata, default: Page } = 
 *     createItemPage('materials');
 */

import { getContentConfig } from '@/app/config/contentTypes';
import { redirect } from 'next/navigation';
import { 
  generateCategoryStaticParams,
  generateSubcategoryStaticParams,
  generateItemStaticParams,
  findCategoryBySlug,
  getSubcategoryInfoForType
} from '@/app/utils/categories';
import { normalizeForUrl } from '@/app/utils/urlBuilder';
import {
  generateCategoryMetadata,
  generateSubcategoryMetadata,
  generateItemMetadata
} from '@/app/utils/contentPages/helpers';
import { CategoryPage } from '@/app/components/ContentPages/CategoryPage';
import { SubcategoryPage } from '@/app/components/ContentPages/SubcategoryPage';
import { ItemPage } from '@/app/components/ContentPages/ItemPage';

import { CATEGORY_METADATA } from '@/app/metadata';
import { CONTAMINANT_CATEGORY_METADATA } from '@/app/contaminantMetadata';
import { COMPOUND_CATEGORY_METADATA } from '@/app/compoundMetadata';

type ContentType = 'materials' | 'contaminants' | 'compounds' | 'settings' | 'applications';

/**
 * Category metadata lookup for different content types
 */
const CATEGORY_METADATA_MAP = {
  materials: CATEGORY_METADATA,
  contaminants: CONTAMINANT_CATEGORY_METADATA,
  compounds: COMPOUND_CATEGORY_METADATA,
  settings: {}, // Settings don't have category metadata
  applications: {} // Applications don't have category metadata
};

// ============================================================================
// Category Pages
// ============================================================================

export function createCategoryPage(contentType: ContentType) {
  const config = getContentConfig(contentType);
  const categoryMetadata = CATEGORY_METADATA_MAP[contentType];

  return {
    generateStaticParams: async () => {
      return await generateCategoryStaticParams(config);
    },

    generateMetadata: async ({ params }: { params: { category: string } }) => {
      const { category } = params;
      const normalizedCategory = normalizeForUrl(category);
      const metadata =
        (categoryMetadata as Record<string, any> | undefined)?.[category] ||
        (categoryMetadata as Record<string, any> | undefined)?.[normalizedCategory] ||
        (categoryMetadata as Record<string, any> | undefined)?.[normalizedCategory.replace(/-/g, '_')];
      return generateCategoryMetadata(config, normalizedCategory, metadata);
    },

    default: async function ContentCategoryPage({ params }: { params: { category: string } }) {
      const { category } = params;
      const normalizedCategory = normalizeForUrl(category);

      if (normalizedCategory !== category) {
        redirect(`/${config.rootPath}/${normalizedCategory}`);
      }

      const categoryData = await findCategoryBySlug(config, normalizedCategory);
      const metadata =
        (categoryMetadata as Record<string, any> | undefined)?.[category] ||
        (categoryMetadata as Record<string, any> | undefined)?.[normalizedCategory] ||
        (categoryMetadata as Record<string, any> | undefined)?.[normalizedCategory.replace(/-/g, '_')];
      
      return (
        <CategoryPage 
          config={config}
          categorySlug={normalizedCategory}
          categoryData={categoryData}
          categoryMetadata={metadata}
        />
      );
    }
  };
}

// ============================================================================
// Subcategory Pages
// ============================================================================

export function createSubcategoryPage(contentType: ContentType) {
  const config = getContentConfig(contentType);

  return {
    generateStaticParams: async () => {
      return await generateSubcategoryStaticParams(config);
    },

    generateMetadata: async ({ 
      params 
    }: { 
      params: Promise<{ category: string; subcategory: string }> 
    }) => {
      const { category, subcategory } = await params;
      const normalizedCategory = normalizeForUrl(category);
      const normalizedSubcategory = normalizeForUrl(subcategory);
      const subcategoryInfo = await getSubcategoryInfoForType(config, normalizedCategory, normalizedSubcategory);
      
      if (!subcategoryInfo) {
        return {
          title: 'Subcategory Not Found',
          description: 'The requested subcategory could not be found.'
        };
      }
      
      return generateSubcategoryMetadata(config, normalizedCategory, normalizedSubcategory, subcategoryInfo);
    },

    default: async function ContentSubcategoryPage({ 
      params 
    }: { 
      params: Promise<{ category: string; subcategory: string }> 
    }) {
      const { category, subcategory } = await params;
      const normalizedCategory = normalizeForUrl(category);
      const normalizedSubcategory = normalizeForUrl(subcategory);

      if (normalizedCategory !== category || normalizedSubcategory !== subcategory) {
        redirect(`/${config.rootPath}/${normalizedCategory}/${normalizedSubcategory}`);
      }

      const subcategoryInfo = await getSubcategoryInfoForType(config, normalizedCategory, normalizedSubcategory);
      
      return (
        <SubcategoryPage 
          config={config}
          categorySlug={normalizedCategory}
          subcategorySlug={normalizedSubcategory}
          subcategoryInfo={subcategoryInfo}
        />
      );
    }
  };
}

// ============================================================================
// Item Pages
// ============================================================================

export function createItemPage(contentType: ContentType) {
  const config = getContentConfig(contentType);

  return {
    generateStaticParams: async () => {
      return await generateItemStaticParams(config);
    },

    generateMetadata: async ({ 
      params 
    }: { 
      params: Promise<{ category: string; subcategory: string; slug: string }> 
    }) => {
      const { category, subcategory, slug } = await params;
      const normalizedCategory = normalizeForUrl(category);
      const normalizedSubcategory = normalizeForUrl(subcategory);
      return await generateItemMetadata(config, normalizedCategory, normalizedSubcategory, slug);
    },

    default: async function ContentItemPage({ 
      params 
    }: { 
      params: Promise<{ category: string; subcategory: string; slug: string }> 
    }) {
      const { category, subcategory, slug } = await params;
      const normalizedCategory = normalizeForUrl(category);
      const normalizedSubcategory = normalizeForUrl(subcategory);

      if (normalizedCategory !== category || normalizedSubcategory !== subcategory) {
        redirect(`/${config.rootPath}/${normalizedCategory}/${normalizedSubcategory}/${slug}`);
      }
      
      return (
        <ItemPage 
          config={config}
          categorySlug={normalizedCategory}
          subcategorySlug={normalizedSubcategory}
          itemSlug={slug}
        />
      );
    }
  };
}
