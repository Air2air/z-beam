// app/utils/categories/index.ts
// Unified category utilities for all content types

import { ContentTypeConfig } from '@/app/config/contentTypes';

/**
 * Get all categories for a content type
 */
export async function getAllCategoriesForType(config: ContentTypeConfig) {
  return await config.getAllCategories();
}

/**
 * Get subcategory info for a content type
 */
export async function getSubcategoryInfoForType(
  config: ContentTypeConfig,
  categorySlug: string,
  subcategorySlug: string
) {
  return await config.getSubcategoryInfo(categorySlug, subcategorySlug);
}

/**
 * Generate static params for all items across all categories
 */
export async function generateItemStaticParams(config: ContentTypeConfig) {
  const categories = await config.getAllCategories();
  const params: { category: string; subcategory: string; slug: string }[] = [];
  
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const items = subcategory[config.itemsProperty] || [];
      for (const item of items) {
        params.push({
          category: category.slug,
          subcategory: subcategory.slug,
          slug: item.slug
        });
      }
    }
  }
  
  return params;
}

/**
 * Generate static params for all subcategories
 */
export async function generateSubcategoryStaticParams(config: ContentTypeConfig) {
  const categories = await config.getAllCategories();
  const params: { category: string; subcategory: string }[] = [];
  
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      params.push({
        category: category.slug,
        subcategory: subcategory.slug
      });
    }
  }
  
  return params;
}

/**
 * Generate static params for all categories
 */
export async function generateCategoryStaticParams(config: ContentTypeConfig) {
  const categories = await config.getAllCategories();
  return categories.map((category) => ({
    category: category.slug,
  }));
}

/**
 * Find a category by slug
 */
export async function findCategoryBySlug(
  config: ContentTypeConfig,
  categorySlug: string
) {
  const categories = await config.getAllCategories();
  return categories.find(cat => cat.slug === categorySlug);
}
