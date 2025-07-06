// app/utils/tagConfig.ts
// Configuration for tag processing and display

export interface TagConfig {
  displayName?: string;
  category: 'material' | 'process' | 'industry' | 'application' | 'property' | 'general';
  priority: number; // Lower number = higher priority
  color: {
    bg: string;
    text: string;
  };
}

// Tag configuration mapping
export const TAG_CONFIG: Record<string, TagConfig> = {
  // Materials
  'Cast Iron': { displayName: 'Cast Iron', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Aluminum': { displayName: 'Aluminum', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Steel': { displayName: 'Steel', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Bronze': { displayName: 'Bronze', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Brass': { displayName: 'Brass', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Copper': { displayName: 'Copper', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Iron': { displayName: 'Iron', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Lead': { displayName: 'Lead', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Titanium': { displayName: 'Titanium', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Tungsten': { displayName: 'Tungsten', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Chromium': { displayName: 'Chromium', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Nickel Alloy': { displayName: 'Nickel Alloy', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Stainless Steel': { displayName: 'Stainless Steel', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Tool Steel': { displayName: 'Tool Steel', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Carbon Steel': { displayName: 'Carbon Steel', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Galvanized Steel': { displayName: 'Galvanized Steel', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Cobalt': { displayName: 'Cobalt', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Cobalt Chromium': { displayName: 'Cobalt Chromium', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Magnesium': { displayName: 'Magnesium', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Manganese': { displayName: 'Manganese', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Molybdenum': { displayName: 'Molybdenum', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Niobium': { displayName: 'Niobium', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Tantalum': { displayName: 'Tantalum', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Tin': { displayName: 'Tin', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Vanadium': { displayName: 'Vanadium', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Zinc': { displayName: 'Zinc', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Zirconium': { displayName: 'Zirconium', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  'Hafnium': { displayName: 'Hafnium', category: 'material', priority: 1, color: { bg: 'bg-purple-100', text: 'text-purple-800' } },
  
  // Processes
  'Laser Cleaning': { displayName: 'Laser Cleaning', category: 'process', priority: 2, color: { bg: 'bg-blue-100', text: 'text-blue-800' } },
  'Surface Preparation': { displayName: 'Surface Prep', category: 'process', priority: 3, color: { bg: 'bg-blue-100', text: 'text-blue-800' } },
  
  // Industries
  'Aerospace': { displayName: 'Aerospace', category: 'industry', priority: 4, color: { bg: 'bg-green-100', text: 'text-green-800' } },
  'Defense': { displayName: 'Defense', category: 'industry', priority: 4, color: { bg: 'bg-green-100', text: 'text-green-800' } },
  'Nuclear': { displayName: 'Nuclear', category: 'industry', priority: 4, color: { bg: 'bg-green-100', text: 'text-green-800' } },
  'Automotive': { displayName: 'Automotive', category: 'industry', priority: 4, color: { bg: 'bg-green-100', text: 'text-green-800' } },
  
  // Applications
  'Rust Removal': { displayName: 'Rust Removal', category: 'application', priority: 5, color: { bg: 'bg-orange-100', text: 'text-orange-800' } },
  'Paint Removal': { displayName: 'Paint Removal', category: 'application', priority: 5, color: { bg: 'bg-orange-100', text: 'text-orange-800' } },
  'Coating Removal': { displayName: 'Coating Removal', category: 'application', priority: 5, color: { bg: 'bg-orange-100', text: 'text-orange-800' } },
  
  // Missing industry tags
  'Battery Manufacturing': { displayName: 'Battery Manufacturing', category: 'industry', priority: 4, color: { bg: 'bg-green-100', text: 'text-green-800' } },
  'Steel Production': { displayName: 'Steel Production', category: 'industry', priority: 4, color: { bg: 'bg-green-100', text: 'text-green-800' } },
};

// Get processed tag info
export function getTagInfo(tag: string): TagConfig {
  const config = TAG_CONFIG[tag];
  if (!config) {
    console.warn(`Tag "${tag}" is not configured in TAG_CONFIG. Please add it to maintain consistency.`);
    // Return a basic config but warn about it
    return {
      displayName: tag,
      category: 'general',
      priority: 10,
      color: { bg: 'bg-red-100', text: 'text-red-800' } // Red to make unconfigured tags obvious
    };
  }
  return config;
}

// Sort tags by priority and category
export function sortTagsByPriority(tags: string[]): string[] {
  return tags.sort((a, b) => {
    const aConfig = getTagInfo(a);
    const bConfig = getTagInfo(b);
    
    // First sort by priority
    if (aConfig.priority !== bConfig.priority) {
      return aConfig.priority - bConfig.priority;
    }
    
    // Then alphabetically within same priority
    return a.localeCompare(b);
  });
}

// Filter tags by category
export function filterTagsByCategory(tags: string[], categories: TagConfig['category'][]): string[] {
  return tags.filter(tag => {
    const config = getTagInfo(tag);
    return categories.includes(config.category);
  });
}

// Get tags grouped by category
export function groupTagsByCategory(tags: string[]): Record<TagConfig['category'], string[]> {
  const grouped: Record<TagConfig['category'], string[]> = {
    material: [],
    process: [],
    industry: [],
    application: [],
    property: [],
    general: []
  };
  
  tags.forEach(tag => {
    const config = getTagInfo(tag);
    grouped[config.category].push(tag);
  });
  
  return grouped;
}
