/**
 * Category Descriptions and Metadata Configuration
 * Centralized category-level descriptions for materials pages
 */

export interface CategoryConfig {
  slug: string;
  description: string;
  materialType: 'alloy' | 'ceramic' | 'composite' | 'semiconductor' | 'polymer' | 'element' | 'other';
}

export const CATEGORY_DESCRIPTIONS: Record<string, CategoryConfig> = {
  'metal': {
    slug: 'metal',
    description: 'Precision laser cleaning for aluminum, steel, titanium, and precious metals in aerospace and automotive applications.',
    materialType: 'alloy'
  },
  'ceramic': {
    slug: 'ceramic',
    description: 'Advanced ceramic materials like alumina and silicon nitride for high-temperature and semiconductor applications.',
    materialType: 'ceramic'
  },
  'composite': {
    slug: 'composite',
    description: 'High-performance polymer composites and fiber-reinforced materials for aerospace and marine industries.',
    materialType: 'composite'
  },
  'semiconductor': {
    slug: 'semiconductor',
    description: 'Ultra-precision cleaning of semiconductor materials for microelectronics and photovoltaic applications.',
    materialType: 'semiconductor'
  },
  'glass': {
    slug: 'glass',
    description: 'Optical and technical glass materials requiring precision cleaning for laboratory and industrial use.',
    materialType: 'other'
  },
  'stone': {
    slug: 'stone',
    description: 'Natural stone materials including granite, marble, and slate for architectural and heritage restoration.',
    materialType: 'other'
  },
  'wood': {
    slug: 'wood',
    description: 'Delicate laser cleaning of hardwoods and softwoods for furniture restoration and heritage conservation.',
    materialType: 'other'
  },
  'masonry': {
    slug: 'masonry',
    description: 'Restoration of brick, cement, and masonry structures using gentle laser cleaning techniques.',
    materialType: 'other'
  },
  'plastic': {
    slug: 'plastic',
    description: 'Specialized cleaning of thermoplastics and polymer materials for industrial and consumer applications.',
    materialType: 'polymer'
  },
  'rare-earth': {
    slug: 'rare-earth',
    description: 'Precision cleaning of lanthanides and rare-earth elements including cerium, neodymium, and yttrium for high-tech applications.',
    materialType: 'element'
  }
};

/**
 * Get category configuration
 */
export function getCategoryConfig(slug: string): CategoryConfig | null {
  return CATEGORY_DESCRIPTIONS[slug] || null;
}

/**
 * Get description for a category
 */
export function getCategoryDescription(slug: string, categoryLabel: string): string {
  const config = getCategoryConfig(slug);
  return config?.description || `Comprehensive laser cleaning parameters for ${categoryLabel.toLowerCase()} materials.`;
}

/**
 * Get material type for a category
 */
export function getCategoryMaterialType(slug: string): 'alloy' | 'ceramic' | 'composite' | 'semiconductor' | 'polymer' | 'element' | 'other' {
  const config = getCategoryConfig(slug);
  return config?.materialType || 'other';
}
