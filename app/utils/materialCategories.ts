// app/utils/materialCategories.ts
/**
 * Material category and subcategory utilities
 * Extracts category structure from material YAML frontmatter files
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { normalizeForUrl } from './urlBuilder';

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

export interface MaterialInfo {
  slug: string;
  name: string;
  title: string;
  category: string;
  subcategory?: string;
}

/**
 * Get all unique categories from material frontmatter files
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const frontmatterDir = path.join(process.cwd(), 'frontmatter/materials');
  const files = await fs.readdir(frontmatterDir);
  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  
  const categoryMap = new Map<string, CategoryInfo>();
  
  for (const file of yamlFiles) {
    const filePath = path.join(frontmatterDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    const data = yaml.load(content) as any;
    
    if (!data.category) continue;
    
    const categorySlug = normalizeForUrl(data.category);
    const categoryLabel = capitalizeWords(data.category);
    const subcategorySlug = data.subcategory ? normalizeForUrl(data.subcategory) : undefined;
    const subcategoryLabel = data.subcategory ? capitalizeWords(data.subcategory) : undefined;
    const materialSlug = file.replace(/\.(yaml|yml)$/, '');
    
    const materialInfo: MaterialInfo = {
      slug: materialSlug,
      name: data.name || materialSlug,
      title: data.title || materialSlug,
      category: categorySlug,
      subcategory: subcategorySlug
    };
    
    // Get or create category
    if (!categoryMap.has(categorySlug)) {
      categoryMap.set(categorySlug, {
        slug: categorySlug,
        label: categoryLabel,
        subcategories: [],
        materials: []
      });
    }
    
    const category = categoryMap.get(categorySlug)!;
    
    // Add to category materials
    category.materials.push(materialInfo);
    
    // Handle subcategory if present
    if (subcategorySlug && subcategoryLabel) {
      let subcategory = category.subcategories.find(s => s.slug === subcategorySlug);
      
      if (!subcategory) {
        subcategory = {
          slug: subcategorySlug,
          label: subcategoryLabel,
          materials: []
        };
        category.subcategories.push(subcategory);
      }
      
      subcategory.materials.push(materialInfo);
    }
  }
  
  // Sort categories and subcategories alphabetically
  const categories = Array.from(categoryMap.values());
  categories.sort((a, b) => a.label.localeCompare(b.label));
  categories.forEach(cat => {
    cat.subcategories.sort((a, b) => a.label.localeCompare(b.label));
    cat.materials.sort((a, b) => a.name.localeCompare(b.name));
    cat.subcategories.forEach(sub => {
      sub.materials.sort((a, b) => a.name.localeCompare(b.name));
    });
  });
  
  return categories;
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
  const category = await getCategoryInfo(categorySlug);
  return category?.subcategories.find(s => s.slug === subcategorySlug) || null;
}

/**
 * Capitalize words helper
 */
function capitalizeWords(str: string): string {
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
