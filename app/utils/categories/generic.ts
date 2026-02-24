// app/utils/categories/generic.ts
/**
 * Generic category and subcategory utilities for all content types
 * Consolidates duplicate logic from material/contaminant/compound/settings category files
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { normalizeForUrl } from '../urlBuilder';
import { capitalizeWords, stripParenthesesFromSlug } from '../formatting';
import type { ContentType } from '@/types';

export interface GenericCategoryInfo<TItem> {
  slug: string;
  label: string;
  subcategories: GenericSubcategoryInfo<TItem>[];
  items: TItem[];
}

export interface GenericSubcategoryInfo<TItem> {
  slug: string;
  label: string;
  items: TItem[];
}

export interface GenericItemInfo {
  slug: string;
  name: string;
  title: string;
  category: string;
  subcategory?: string;
  href?: string;
}

/**
 * Get the items property name for a content type
 */
function getItemsPropertyName(contentType: ContentType): string {
  return contentType; // 'materials', 'contaminants', 'compounds', 'settings'
}

/**
 * Generic function to get all categories for any content type
 */
export async function getAllCategoriesGeneric<TItem extends GenericItemInfo>(
  contentType: ContentType
): Promise<GenericCategoryInfo<TItem>[]> {
  const frontmatterDir = path.join(process.cwd(), 'frontmatter', contentType);
  const files = await fs.readdir(frontmatterDir);
  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  
  const categoryMap = new Map<string, GenericCategoryInfo<TItem>>();
  const itemsProperty = getItemsPropertyName(contentType);
  
  for (const file of yamlFiles) {
    const filePath = path.join(frontmatterDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = yaml.load(content) as any;
    
    if (!parsed || !parsed.category) continue;
    
    const categorySlug = normalizeForUrl(parsed.category);
    const categoryLabel = capitalizeWords(parsed.category);
    const subcategorySlug = parsed.subcategory ? normalizeForUrl(parsed.subcategory) : undefined;
    const subcategoryLabel = parsed.subcategory ? capitalizeWords(parsed.subcategory) : undefined;
    const rawSlug = file.replace(/\.(yaml|yml)$/, '');
    const slugFromPath = typeof parsed?.fullPath === 'string'
      ? parsed.fullPath.split('/').filter(Boolean).pop()
      : undefined;
    const rawItemSlug = parsed?.slug || slugFromPath || rawSlug;
    const normalizedSlug = stripParenthesesFromSlug(String(rawItemSlug));
    const itemSlug = normalizedSlug;
    
    const itemInfo: TItem = {
      slug: itemSlug,
      name: parsed.name || itemSlug,
      title: parsed.title || parsed.name || itemSlug,
      category: categorySlug,
      subcategory: subcategorySlug,
      href: parsed.fullPath || `/${contentType}/${itemSlug}`
    } as TItem;
    
    // Get or create category
    if (!categoryMap.has(categorySlug)) {
      categoryMap.set(categorySlug, {
        slug: categorySlug,
        label: categoryLabel,
        subcategories: [],
        items: []
      });
    }
    
    const category = categoryMap.get(categorySlug)!;
    
    // Add to category items
    category.items.push(itemInfo);
    
    // Handle subcategory if present
    if (subcategorySlug && subcategoryLabel) {
      let subcategory = category.subcategories.find(s => s.slug === subcategorySlug);
      
      if (!subcategory) {
        subcategory = {
          slug: subcategorySlug,
          label: subcategoryLabel,
          items: []
        };
        category.subcategories.push(subcategory);
      }
      
      subcategory.items.push(itemInfo);
    }
  }
  
  // Sort items alphabetically within each category/subcategory
  for (const category of categoryMap.values()) {
    category.items.sort((a, b) => a.name.localeCompare(b.name));
    for (const subcategory of category.subcategories) {
      subcategory.items.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  
  return Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Generic function to get subcategory info for any content type
 */
export async function getSubcategoryInfoGeneric<TItem extends GenericItemInfo>(
  contentType: ContentType,
  category: string,
  subcategory: string
): Promise<GenericSubcategoryInfo<TItem> | null> {
  const categories = await getAllCategoriesGeneric<TItem>(contentType);
  const categoryData = categories.find(c => c.slug === category);
  
  if (!categoryData) return null;
  
  return categoryData.subcategories.find(s => s.slug === subcategory) || null;
}

/**
 * Generic function to get item info for any content type
 */
export async function getItemInfoGeneric<TItem extends GenericItemInfo>(
  contentType: ContentType,
  category: string,
  subcategory: string,
  slug: string
): Promise<TItem | null> {
  const categories = await getAllCategoriesGeneric<TItem>(contentType);
  const categoryData = categories.find(c => c.slug === category);
  
  if (!categoryData) return null;
  
  const subcategoryData = categoryData.subcategories.find(s => s.slug === subcategory);
  
  if (!subcategoryData) return null;
  
  return subcategoryData.items.find(m => m.slug === slug) || null;
}
