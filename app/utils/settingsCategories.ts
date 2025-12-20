// app/utils/settingsCategories.ts
/**
 * Settings category and subcategory utilities
 * Thin wrapper around generic category utilities
 */

import { 
  getAllCategoriesGeneric, 
  getSubcategoryInfoGeneric, 
  getItemInfoGeneric,
  type GenericItemInfo 
} from './categories/generic';

// Type aliases for backward compatibility
export type SettingInfo = GenericItemInfo;

export interface CategoryInfo {
  slug: string;
  label: string;
  subcategories: SubcategoryInfo[];
  settings: SettingInfo[];
}

export interface SubcategoryInfo {
  slug: string;
  label: string;
  settings: SettingInfo[];
}

/**
 * Get all unique categories from settings frontmatter files
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const result = await getAllCategoriesGeneric<SettingInfo>('settings');
  return result.map(cat => ({
    ...cat,
    settings: cat.items,
    subcategories: cat.subcategories.map(sub => ({
      ...sub,
      settings: sub.items
    }))
  }));
}

/**
 * Get information for a specific subcategory
 */
export async function getSubcategoryInfo(
  category: string,
  subcategory: string
): Promise<SubcategoryInfo | null> {
  const result = await getSubcategoryInfoGeneric<SettingInfo>('settings', category, subcategory);
  if (!result) return null;
  return {
    ...result,
    settings: result.items
  };
}

/**
 * Get information for a specific setting
 */
export async function getSettingInfo(
  category: string,
  subcategory: string,
  slug: string
): Promise<SettingInfo | null> {
  return getItemInfoGeneric<SettingInfo>('settings', category, subcategory, slug);
}

/**
 * Get all setting slugs across all categories
 */
export async function getAllSettingSlugs(): Promise<string[]> {
  const categories = await getAllCategories();
  const slugs: string[] = [];
  
  categories.forEach(category => {
    category.settings.forEach(setting => {
      slugs.push(setting.slug);
    });
  });
  
  return slugs;
}
