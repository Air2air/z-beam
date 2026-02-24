// app/utils/applicationCategories.ts
/**
 * Application category and subcategory utilities
 * Thin wrapper around generic category utilities
 */

import {
  getAllCategoriesGeneric,
  getSubcategoryInfoGeneric,
  type GenericItemInfo
} from './categories/generic';

// Type aliases for backward compatibility
export type ApplicationInfo = GenericItemInfo;

export interface CategoryInfo {
  slug: string;
  label: string;
  subcategories: SubcategoryInfo[];
  applications: ApplicationInfo[];
}

export interface SubcategoryInfo {
  slug: string;
  label: string;
  applications: ApplicationInfo[];
}

/**
 * Get all unique categories from application frontmatter files
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const result = await getAllCategoriesGeneric<ApplicationInfo>('applications');
  return result.map(cat => ({
    ...cat,
    applications: cat.items,
    subcategories: cat.subcategories.map(sub => ({
      ...sub,
      applications: sub.items
    }))
  }));
}

/**
 * Get subcategory info
 */
export async function getSubcategoryInfo(
  categorySlug: string,
  subcategorySlug: string
): Promise<SubcategoryInfo | null> {
  const result = await getSubcategoryInfoGeneric<ApplicationInfo>('applications', categorySlug, subcategorySlug);
  if (!result) return null;
  return {
    ...result,
    applications: result.items
  };
}
