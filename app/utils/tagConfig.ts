// app/utils/tagConfig.ts
// Configuration for tag processing and display

export interface TagConfig {
  displayName?: string;
  category: 'material' | 'process' | 'industry' | 'application' | 'property' | 'general';
  priority: number; // Lower number = higher priority
  color?: {
    bg: string;
    text: string;
  };
}

// Tag configuration mapping
export const TAG_CONFIG: Record<string, TagConfig> = {
  // Materials
  'Cast Iron': { displayName: 'Cast Iron', category: 'material', priority: 1, color: { bg: 'bg-gray-100', text: 'text-gray-800' } },
  'Aluminum': { displayName: 'Aluminum', category: 'material', priority: 1, color: { bg: 'bg-gray-100', text: 'text-gray-800' } },
  'Steel': { displayName: 'Steel', category: 'material', priority: 1, color: { bg: 'bg-gray-100', text: 'text-gray-800' } },
  'Bronze': { displayName: 'Bronze', category: 'material', priority: 1, color: { bg: 'bg-gray-100', text: 'text-gray-800' } },
  
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
};

// Get processed tag info
export function getTagInfo(tag: string): TagConfig {
  return TAG_CONFIG[tag] || {
    displayName: tag,
    category: 'general',
    priority: 10,
    color: { bg: 'bg-blue-100', text: 'text-blue-800' }
  };
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
