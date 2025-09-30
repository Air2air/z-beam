// app/utils/gridTitleMapping.ts
// Centralized section header mapping ONLY for material properties and machine settings

// ===============================
// SECTION HEADER MAPPING ONLY
// ===============================

/**
 * Data source types for grids
 */
type GridDataSource = 'materialProperties' | 'machineSettings';

/**
 * Section header format types
 */
type SectionHeaderFormat = 'default' | 'comparison' | 'standalone';

/**
 * Section header mapping structure
 */
interface SectionHeaderMapping {
  materialProperties: {
    default: string;
    comparison: string;
    standalone: string;
  };
  machineSettings: {
    default: string;
    comparison: string;
    standalone: string;
  };
}

/**
 * Pluralization rules for category names
 */
const PLURALIZATION_RULES: Record<string, string> = {
  // Irregular plurals
  'ceramic': 'ceramics',
  'polymer': 'polymers',
  'composite': 'composites',
  'alloy': 'alloys',
  'metal': 'metals',
  'glass': 'glasses',
  'wood': 'woods',
  'stone': 'stones',
  'fabric': 'fabrics',
  'rubber': 'rubbers',
  'plastic': 'plastics',
  'semiconductor': 'semiconductors',
  'oxide': 'oxides',
  'carbide': 'carbides',
  'nitride': 'nitrides',
  'sulfide': 'sulfides',
  'coating': 'coatings',
  'finish': 'finishes',
  'material': 'materials',
  'element': 'elements',
  'compound': 'compounds',
  // Add more as needed
};

/**
 * Pluralize a category name using rules or default 's' suffix
 */
function pluralizeCategory(category: string): string {
  const lowerCategory = category.toLowerCase();
  
  // Check for exact match in pluralization rules
  if (PLURALIZATION_RULES[lowerCategory]) {
    // Preserve original case
    const rule = PLURALIZATION_RULES[lowerCategory];
    if (category === category.toUpperCase()) {
      return rule.toUpperCase();
    } else if (category[0] === category[0].toUpperCase()) {
      return rule.charAt(0).toUpperCase() + rule.slice(1);
    }
    return rule;
  }
  
  // Default pluralization rules
  if (lowerCategory.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(ending => lowerCategory.endsWith(ending))) {
    return category.slice(0, -1) + 'ies';
  } else if (lowerCategory.endsWith('s') || lowerCategory.endsWith('sh') || lowerCategory.endsWith('ch') || lowerCategory.endsWith('x') || lowerCategory.endsWith('z')) {
    return category + 'es';
  } else {
    return category + 's';
  }
}

/**
 * Default section header templates
 */
export const DEFAULT_SECTION_HEADERS: SectionHeaderMapping = {
  materialProperties: {
    default: 'Material Properties',
    comparison: 'Properties: {material} vs. other {category_plural}',
    standalone: 'Properties: {material}',
  },
  machineSettings: {
    default: 'Machine Settings',
    comparison: 'Machine Settings: {material} vs. other {category_plural}', 
    standalone: 'Settings: {material}',
  },
};

/**
 * Generate section header title for grid
 */
export function getSectionHeaderTitle(
  dataSource: GridDataSource,
  format: SectionHeaderFormat = 'default',
  materialName?: string,
  categoryName?: string,
  customMapping?: SectionHeaderMapping
): string {
  const mapping = customMapping || DEFAULT_SECTION_HEADERS;
  const template = mapping[dataSource][format];
  
  // If no material/category provided, return the default template
  if (!materialName && (format === 'comparison' || format === 'standalone')) {
    return mapping[dataSource].default;
  }
  
  // Replace placeholders with actual values
  let result = template
    .replace('{material}', materialName || 'Material')
    .replace('{category}', categoryName || 'Category');
  
  // Handle pluralized category
  if (result.includes('{category_plural}')) {
    const pluralizedCategory = categoryName ? pluralizeCategory(categoryName) : 'Categories';
    result = result.replace('{category_plural}', pluralizedCategory);
  }
  
  return result;
}

/**
 * Get section header with intelligent material/category extraction
 */
export function getIntelligentSectionHeader(
  dataSource: GridDataSource,
  format: SectionHeaderFormat,
  metadata?: any,
  customMapping?: SectionHeaderMapping
): string {
  if (!metadata || format === 'default') {
    return getSectionHeaderTitle(dataSource, format, undefined, undefined, customMapping);
  }
  
  // Extract material name from various metadata fields
  const materialName = metadata?.title?.replace(/\s*laser\s*cleaning/i, '').trim() || 
                      metadata?.subject?.replace(/\s*laser\s*cleaning/i, '').trim() ||
                      (metadata?.slug ? 
                        metadata.slug.split('-')[0].charAt(0).toUpperCase() + 
                        metadata.slug.split('-')[0].slice(1) : 
                        'Material');
                        
  const categoryName = metadata?.category || 'Category';
  
  return getSectionHeaderTitle(dataSource, format, materialName, categoryName, customMapping);
}

/**
 * Create custom section header mapping
 */
export function createSectionHeaderMapping(
  customMapping?: Partial<SectionHeaderMapping>
): SectionHeaderMapping {
  return {
    materialProperties: {
      ...DEFAULT_SECTION_HEADERS.materialProperties,
      ...customMapping?.materialProperties,
    },
    machineSettings: {
      ...DEFAULT_SECTION_HEADERS.machineSettings,
      ...customMapping?.machineSettings,
    },
  };
}