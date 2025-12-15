// app/utils/settingsCategories.ts
// Settings category utilities - matches material/contaminant patterns

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { normalizeForUrl } from './urlBuilder';

interface SettingsItem {
  name: string;
  slug: string;
}

interface SettingsSubcategory {
  slug: string;
  label: string;
  settings: SettingsItem[];
}

interface SettingsCategory {
  slug: string;
  label: string;
  subcategories: SettingsSubcategory[];
  settings: SettingsItem[];
}

/**
 * Get all settings organized by category/subcategory
 * Mirrors the structure used by materials and contaminants
 */
export async function getAllCategories(): Promise<SettingsCategory[]> {
  const settingsDir = path.join(process.cwd(), 'frontmatter', 'settings');
  
  if (!fs.existsSync(settingsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(settingsDir).filter(f => f.endsWith('.yaml'));
  
  // Group settings by category and subcategory
  const categoryMap = new Map<string, Map<string, SettingsItem[]>>();
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(settingsDir, file), 'utf8');
      const parsed = yaml.load(content) as any;
      
      // Handle normalized structure (data.metadata) or legacy flat structure
      const data = parsed.metadata || parsed;
      
      if (!data.active || !data.category || !data.subcategory) {
        continue;
      }
      
      const categorySlug = normalizeForUrl(data.category);
      const subcategorySlug = normalizeForUrl(data.subcategory);
      const settingsSlug = `${data.slug}-settings`;
      
      if (!categoryMap.has(categorySlug)) {
        categoryMap.set(categorySlug, new Map());
      }
      
      const subcategoryMap = categoryMap.get(categorySlug)!;
      if (!subcategoryMap.has(subcategorySlug)) {
        subcategoryMap.set(subcategorySlug, []);
      }
      
      subcategoryMap.get(subcategorySlug)!.push({
        name: data.name || data.slug,
        slug: settingsSlug
      });
    } catch (error) {
      console.error(`Error reading settings file ${file}:`, error);
    }
  }
  
  // Convert map to array structure
  const categories: SettingsCategory[] = [];
  
  for (const [categorySlug, subcategoryMap] of categoryMap) {
    const subcategories: SettingsSubcategory[] = [];
    let allSettings: SettingsItem[] = [];
    
    for (const [subcategorySlug, settings] of subcategoryMap) {
      subcategories.push({
        slug: subcategorySlug,
        label: formatLabel(subcategorySlug),
        settings: settings.sort((a, b) => a.name.localeCompare(b.name))
      });
      allSettings = allSettings.concat(settings);
    }
    
    categories.push({
      slug: categorySlug,
      label: formatLabel(categorySlug),
      subcategories: subcategories.sort((a, b) => a.label.localeCompare(b.label)),
      settings: allSettings.sort((a, b) => a.name.localeCompare(b.name))
    });
  }
  
  return categories.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get subcategory info for a specific category/subcategory pair
 */
export async function getSubcategoryInfo(
  categorySlug: string,
  subcategorySlug: string
): Promise<SettingsSubcategory | null> {
  const categories = await getAllCategories();
  const category = categories.find(cat => cat.slug === categorySlug);
  
  if (!category) {
    return null;
  }
  
  return category.subcategories.find(sub => sub.slug === subcategorySlug) || null;
}

/**
 * Format slug into display label
 */
function formatLabel(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
