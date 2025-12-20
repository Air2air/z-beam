// app/utils/compoundCategories.ts
/**
 * Compound category and subcategory utilities
 * Thin wrapper around generic category utilities
 */

import { 
  getAllCategoriesGeneric, 
  getSubcategoryInfoGeneric, 
  getItemInfoGeneric,
  type GenericItemInfo 
} from './categories/generic';

// Type aliases for backward compatibility
export type CompoundInfo = GenericItemInfo;

export interface CategoryInfo {
  slug: string;
  label: string;
  subcategories: SubcategoryInfo[];
  compounds: CompoundInfo[];
}

export interface SubcategoryInfo {
  slug: string;
  label: string;
  compounds: CompoundInfo[];
}

/**
 * Get all unique categories from compound frontmatter files
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const result = await getAllCategoriesGeneric<CompoundInfo>('compounds');
  return result.map(cat => ({
    ...cat,
    compounds: cat.items,
    subcategories: cat.subcategories.map(sub => ({
      ...sub,
      compounds: sub.items
    }))
  }));
}

/**
 * Get information for a specific subcategory
 */
export async function getSubcategoryInfo(category: string, subcategory: string): Promise<SubcategoryInfo | null> {
  const result = await getSubcategoryInfoGeneric<CompoundInfo>('compounds', category, subcategory);
  if (!result) return null;
  return {
    ...result,
    compounds: result.items
  };
}

/**
 * Get information for a specific compound
 */
export async function getCompoundInfo(category: string, subcategory: string, slug: string): Promise<CompoundInfo | null> {
  return getItemInfoGeneric<CompoundInfo>('compounds', category, subcategory, slug);
}
