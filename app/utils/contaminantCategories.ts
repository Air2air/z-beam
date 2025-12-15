// app/utils/contaminantCategories.ts
/**
 * Contaminant category and subcategory utilities
 * Extracts category structure from contaminant YAML frontmatter files
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { normalizeForUrl } from './urlBuilder';

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

export interface ContaminantInfo {
  slug: string;
  name: string;
  title: string;
  category: string;
  subcategory?: string;
}

/**
 * Get all unique categories from contaminant frontmatter files
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const frontmatterDir = path.join(process.cwd(), 'frontmatter/contaminants');
  const files = await fs.readdir(frontmatterDir);
  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  
  const categoryMap = new Map<string, CategoryInfo>();
  
  for (const file of yamlFiles) {
    const filePath = path.join(frontmatterDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = yaml.load(content) as any;
    
    // Handle normalized structure (parsed.metadata) or legacy flat structure
    const data = parsed.metadata || parsed;
    
    if (!data.category) continue;
    
    const categorySlug = normalizeForUrl(data.category);
    const categoryLabel = capitalizeWords(data.category);
    const subcategorySlug = data.subcategory ? normalizeForUrl(data.subcategory) : undefined;
    const subcategoryLabel = data.subcategory ? capitalizeWords(data.subcategory) : undefined;
    const contaminantSlug = file.replace(/\.(yaml|yml)$/, '');
    
    const contaminantInfo: ContaminantInfo = {
      slug: contaminantSlug,
      name: data.name || contaminantSlug,
      title: data.title || contaminantSlug,
      category: categorySlug,
      subcategory: subcategorySlug
    };
    
    // Get or create category
    if (!categoryMap.has(categorySlug)) {
      categoryMap.set(categorySlug, {
        slug: categorySlug,
        label: categoryLabel,
        subcategories: [],
        contaminants: []
      });
    }
    
    const category = categoryMap.get(categorySlug)!;
    
    // Add to category contaminants
    category.contaminants.push(contaminantInfo);
    
    // Handle subcategory if present
    if (subcategorySlug && subcategoryLabel) {
      let subcategory = category.subcategories.find(s => s.slug === subcategorySlug);
      
      if (!subcategory) {
        subcategory = {
          slug: subcategorySlug,
          label: subcategoryLabel,
          contaminants: []
        };
        category.subcategories.push(subcategory);
      }
      
      subcategory.contaminants.push(contaminantInfo);
    }
  }
  
  // Sort contaminants alphabetically within each category/subcategory
  for (const category of categoryMap.values()) {
    category.contaminants.sort((a, b) => a.name.localeCompare(b.name));
    for (const subcategory of category.subcategories) {
      subcategory.contaminants.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  
  return Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get information for a specific subcategory
 */
export async function getSubcategoryInfo(category: string, subcategory: string): Promise<SubcategoryInfo | null> {
  const categories = await getAllCategories();
  const categoryData = categories.find(c => c.slug === category);
  
  if (!categoryData) return null;
  
  return categoryData.subcategories.find(s => s.slug === subcategory) || null;
}

/**
 * Get information for a specific contaminant
 */
export async function getContaminantInfo(category: string, subcategory: string, slug: string): Promise<ContaminantInfo | null> {
  const categories = await getAllCategories();
  const categoryData = categories.find(c => c.slug === category);
  
  if (!categoryData) return null;
  
  const subcategoryData = categoryData.subcategories.find(s => s.slug === subcategory);
  
  if (!subcategoryData) return null;
  
  return subcategoryData.contaminants.find(m => m.slug === slug) || null;
}

/**
 * Capitalize each word in a string
 */
function capitalizeWords(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
