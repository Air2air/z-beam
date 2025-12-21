/**
 * Content Page Factory
 * Eliminates duplication across materials/contaminants/compounds/settings page files
 * 
 * Usage:
 *   export const { generateStaticParams, generateMetadata, default: Page } = 
 *     createItemPage('materials');
 */

import { getContentConfig } from '@/app/config/contentTypes';
import { 
  generateCategoryStaticParams,
  generateSubcategoryStaticParams,
  generateItemStaticParams,
  findCategoryBySlug,
  getSubcategoryInfoForType
} from '@/app/utils/categories';
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

type ContentType = 'materials' | 'contaminants' | 'compounds' | 'settings';

/**
 * Category metadata lookup for different content types
 */
const CATEGORY_METADATA_MAP = {
  materials: CATEGORY_METADATA,
  contaminants: CONTAMINANT_CATEGORY_METADATA,
  compounds: COMPOUND_CATEGORY_METADATA,
  settings: {} // Settings don't have category metadata
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

    generateMetadata: async ({ params }: { params: Promise<{ category: string }> }) => {
      const { category } = await params;
      const metadata = (categoryMetadata as Record<string, any> | undefined)?.[category];
      return generateCategoryMetadata(config, category, metadata);
    },

    default: async function ContentCategoryPage({ params }: { params: Promise<{ category: string }> }) {
      const { category } = await params;
      const categoryData = await findCategoryBySlug(config, category);
      const metadata = (categoryMetadata as Record<string, any> | undefined)?.[category];
      
      return (
        <CategoryPage 
          config={config}
          categorySlug={category}
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
      const subcategoryInfo = await getSubcategoryInfoForType(config, category, subcategory);
      
      if (!subcategoryInfo) {
        return {
          title: 'Subcategory Not Found',
          description: 'The requested subcategory could not be found.'
        };
      }
      
      return generateSubcategoryMetadata(config, category, subcategory, subcategoryInfo);
    },

    default: async function ContentSubcategoryPage({ 
      params 
    }: { 
      params: Promise<{ category: string; subcategory: string }> 
    }) {
      const { category, subcategory } = await params;
      const subcategoryInfo = await getSubcategoryInfoForType(config, category, subcategory);
      
      return (
        <SubcategoryPage 
          config={config}
          categorySlug={category}
          subcategorySlug={subcategory}
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
      return await generateItemMetadata(config, category, subcategory, slug);
    },

    default: async function ContentItemPage({ 
      params 
    }: { 
      params: Promise<{ category: string; subcategory: string; slug: string }> 
    }) {
      const { category, subcategory, slug } = await params;
      
      return (
        <ItemPage 
          config={config}
          categorySlug={category}
          subcategorySlug={subcategory}
          itemSlug={slug}
        />
      );
    }
  };
}
