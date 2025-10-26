/**
 * @module categoryNormalizer
 * @purpose Automatically normalizes category and subcategory values to ensure consistency
 * @dependencies None (pure function)
 * @usage Import normalizeCategory/normalizeSubcategory and apply to frontmatter fields
 */

const CATEGORY_MAP: Record<string, string> = {
  'Metal': 'metal',
  'metal': 'metal',
  'Ceramic': 'ceramic',
  'ceramic': 'ceramic',
  'Composite': 'composite',
  'composite': 'composite',
  'Polymer': 'polymer',
  'polymer': 'polymer',
  'Wood': 'wood',
  'wood': 'wood',
  'Stone': 'stone',
  'stone': 'stone',
  'Glass': 'glass',
  'glass': 'glass',
  'Rare-Earth': 'rareearth',
  'rare-earth': 'rareearth',
  'rare earth': 'rareearth',
  'rareearth': 'rareearth',
  'Natural': 'natural',
  'natural': 'natural',
  'Masonry': 'masonry',
  'masonry': 'masonry'
};

/**
 * Normalize category to lowercase single word
 * @param category - Category value from frontmatter
 * @returns Normalized category string
 */
export function normalizeCategory(category: string | undefined): string {
  if (!category) return '';
  
  // Check mapping first for exact match
  if (CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }
  
  // Fallback: lowercase and remove hyphens/spaces
  return category.toLowerCase().replace(/[-\s]/g, '');
}

/**
 * Normalize subcategory to lowercase with hyphens
 * @param subcategory - Subcategory value from frontmatter
 * @returns Normalized subcategory string
 */
export function normalizeSubcategory(subcategory: string | undefined): string {
  if (!subcategory) return '';
  
  // Lowercase and normalize whitespace to hyphens
  return subcategory.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Normalize both category and subcategory in frontmatter data
 * @param data - Frontmatter data object
 * @returns Data with normalized category fields
 */
export function normalizeCategoryFields(data: any): any {
  if (!data) return data;
  
  if (data.category) {
    data.category = normalizeCategory(data.category);
  }
  
  if (data.subcategory) {
    data.subcategory = normalizeSubcategory(data.subcategory);
  }
  
  return data;
}
