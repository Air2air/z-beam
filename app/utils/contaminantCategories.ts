// app/utils/contaminantCategories.ts
/**
 * Contaminant category and subcategory utilities
 * Thin wrapper around generic category utilities
 */

import { 
  getAllCategoriesGeneric, 
  getSubcategoryInfoGeneric, 
  getItemInfoGeneric,
  type GenericItemInfo 
} from './categories/generic';

// Type aliases for backward compatibility
export type ContaminantInfo = GenericItemInfo;

export interface CategoryInfo {
  slug: string;
  label: string;
  subcategories: SubcategoryInfo[];
  contaminants: ContaminantInfo[];
}

export interface SubcategoryInfo {
  slug: string;
  label: string;
  contaminants: ContaminantInfo[];
}

/**
 * Get all unique categories from contaminant frontmatter files
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const result = await getAllCategoriesGeneric<ContaminantInfo>('contaminants');
  return result.map(cat => ({
    ...cat,
    contaminants: cat.items,
    subcategories: cat.subcategories.map(sub => ({
      ...sub,
      contaminants: sub.items
    }))
  }));
}

/**
 * Get information for a specific subcategory
 */
export async function getSubcategoryInfo(category: string, subcategory: string): Promise<SubcategoryInfo | null> {
  const result = await getSubcategoryInfoGeneric<ContaminantInfo>('contaminants', category, subcategory);
  if (!result) return null;
  return {
    ...result,
    contaminants: result.items
  };
}

/**
 * Get information for a specific contaminant
 */
export async function getContaminantInfo(category: string, subcategory: string, slug: string): Promise<ContaminantInfo | null> {
  return getItemInfoGeneric<ContaminantInfo>('contaminants', category, subcategory, slug);
}
