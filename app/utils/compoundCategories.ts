// app/utils/compoundCategories.ts
/**
 * Compound category and subcategory utilities
 * Extracts category structure from compound YAML frontmatter files
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { normalizeForUrl } from './urlBuilder';

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

export interface CompoundInfo {
  slug: string;
  name: string;
  title: string;
  category: string;
  subcategory?: string;
}

/**
 * Get all unique categories from compound frontmatter files
 */
export async function getAllCategories(): Promise<CategoryInfo[]> {
  const frontmatterDir = path.join(process.cwd(), 'frontmatter/compounds');
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
    const compoundSlug = file.replace(/\.(yaml|yml)$/, '');
    
    const compoundInfo: CompoundInfo = {
      slug: compoundSlug,
      name: data.display_name || data.name || compoundSlug,
      title: data.title || data.display_name || compoundSlug,
      category: categorySlug,
      subcategory: subcategorySlug
    };
    
    // Get or create category
    if (!categoryMap.has(categorySlug)) {
      categoryMap.set(categorySlug, {
        slug: categorySlug,
        label: categoryLabel,
        subcategories: [],
        compounds: []
      });
    }
    
    const category = categoryMap.get(categorySlug)!;
    
    // Add to category compounds
    category.compounds.push(compoundInfo);
    
    // Handle subcategory if present
    if (subcategorySlug && subcategoryLabel) {
      let subcategory = category.subcategories.find(s => s.slug === subcategorySlug);
      
      if (!subcategory) {
        subcategory = {
          slug: subcategorySlug,
          label: subcategoryLabel,
          compounds: []
        };
        category.subcategories.push(subcategory);
      }
      
      subcategory.compounds.push(compoundInfo);
    }
  }
  
  // Sort compounds alphabetically within each category/subcategory
  for (const category of categoryMap.values()) {
    category.compounds.sort((a, b) => a.name.localeCompare(b.name));
    for (const subcategory of category.subcategories) {
      subcategory.compounds.sort((a, b) => a.name.localeCompare(b.name));
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
 * Get information for a specific compound
 */
export async function getCompoundInfo(category: string, subcategory: string, slug: string): Promise<CompoundInfo | null> {
  const categories = await getAllCategories();
  const categoryData = categories.find(c => c.slug === category);
  
  if (!categoryData) return null;
  
  const subcategoryData = categoryData.subcategories.find(s => s.slug === subcategory);
  
  if (!subcategoryData) return null;
  
  return subcategoryData.compounds.find(m => m.slug === slug) || null;
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
