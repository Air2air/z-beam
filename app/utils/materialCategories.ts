// app/utils/materialCategories.ts
/**
 * Material category and subcategory utilities
 * Thin wrapper around generic category utilities
 */

import { 
  getAllCategoriesGeneric, 
  getSubcategoryInfoGeneric, 
  getItemInfoGeneric,
  type GenericItemInfo 
} from './categories/generic';

// Type aliases for backward compatibility
export type MaterialInfo = GenericItemInfo;

export interface CategoryInfo {
  slug: string;
  label: string;
  subcategories: SubcategoryInfo[];
  materials: MaterialInfo[];
}

export interface SubcategoryInfo {
  slug: string;
  label: string;
  materials: MaterialInfo[];
}

/**
 * Get all unique categories from material frontmatter files
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const result = await getAllCategoriesGeneric<MaterialInfo>('materials');
  // Map generic structure to material-specific structure
  return result.map(cat => ({
    ...cat,
    materials: cat.items,
    subcategories: cat.subcategories.map(sub => ({
      ...sub,
      materials: sub.items
    }))
  }));
}

/**
 * Get materials for a specific category
 */
export async function getMaterialsByCategory(categorySlug: string): Promise<MaterialInfo[]> {
  const categories = await getAllCategories();
  const category = categories.find(c => c.slug === categorySlug);
  return category?.materials || [];
}

/**
 * Get materials for a specific subcategory
 */
export async function getMaterialsBySubcategory(
  categorySlug: string,
  subcategorySlug: string
): Promise<MaterialInfo[]> {
  const categories = await getAllCategories();
  const category = categories.find(c => c.slug === categorySlug);
  const subcategory = category?.subcategories.find(s => s.slug === subcategorySlug);
  return subcategory?.materials || [];
}

/**
 * Get category info
 */
export async function getCategoryInfo(categorySlug: string): Promise<CategoryInfo | null> {
  const categories = await getAllCategories();
  return categories.find(c => c.slug === categorySlug) || null;
}

/**
 * Get subcategory info
 */
export async function getSubcategoryInfo(
  categorySlug: string,
  subcategorySlug: string
): Promise<SubcategoryInfo | null> {
  const result = await getSubcategoryInfoGeneric<MaterialInfo>('materials', categorySlug, subcategorySlug);
  if (!result) return null;
  return {
    ...result,
    materials: result.items
  };
}
