// app/utils/searchUtils.ts
import { MaterialType, BadgeData, BadgeColor, ChemicalProperties } from '@/types';
import { capitalizeWords } from './formatting';

export function getMaterialColor(materialType?: string | MaterialType): BadgeColor {
  if (!materialType) return "blue";
  
  const typeMap: Record<string, BadgeColor> = {
    'metal': 'blue',
    'alloy': 'blue',
    'element': 'blue', 
    'ceramic': 'green',
    'polymer': 'purple',
    'composite': 'orange',
    'semiconductor': 'red',
    'compound': 'gray',
    'other': 'gray'
  };
  
  return typeMap[materialType.toLowerCase()] || "blue";
}

// Helper function to safely cast material types
function toMaterialType(value?: string): MaterialType {
  if (!value) return 'other';
  
  const normalizedValue = value.toLowerCase();
  const validTypes: MaterialType[] = [
    'element', 'compound', 'ceramic', 'polymer', 'alloy', 'composite', 'semiconductor', 'other'
  ];
  
  // Check for exact matches first
  if (validTypes.includes(normalizedValue as MaterialType)) {
    return normalizedValue as MaterialType;
  }
  
  // Map common aliases
  const typeMap: Record<string, MaterialType> = {
    'metal': 'alloy',
    'metalloid': 'semiconductor',
    'plastic': 'polymer',
    'material': 'other'
  };
  
  return typeMap[normalizedValue] || 'other';
}

export function normalizeString(str?: string): string {
  return (str || "").toLowerCase().trim();
}

export function normalizeTag(tag: string): string {
  if (!tag) return '';
  
  // Trim whitespace first
  const trimmed = tag.trim();
  if (!trimmed) return '';
  
  // Handle hyphenated tags by capitalizing each part but preserving hyphens
  if (trimmed.includes('-')) {
    return trimmed
      .split('-')
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('-');
  }
  
  // For non-hyphenated tags, use capitalizeWords
  return capitalizeWords(trimmed);
}

export function getDisplayName(item: {
  name?: string;
  frontmatter?: { name?: string; title?: string };
  title?: string;
  slug?: string;
}): string {
  // Try to get the name from different sources in priority order
  if (item.name) return item.name;
  if (item.frontmatter?.name) return item.frontmatter.name;
  if (item.frontmatter?.title) return item.frontmatter.title;
  if (item.title) return item.title;
  
  // If no name or title, try to create one from the slug
  if (item.slug) {
    return capitalizeWords(item.slug.replace(/-/g, ' '));
  }
  
  // Last resort
  return "Unnamed Item";
}

export function getBadgeFromItem(item: {
  badge?: BadgeData;
  frontmatter?: {
    subject?: string;
    category?: string;
    commentMetadata?: { Subject?: string };
  };
  category?: string;
}): BadgeData | null {
  // If the item already has a badge, use it
  if (item.badge) return item.badge;

  // Extract from frontmatter
  const fm = item.frontmatter || {};
  
  // Look for subject in frontmatter
  const subject = normalizeString(fm.subject);
  
  // Special handling for known materials
  if (subject === "alumina") {
    return {
      symbol: "Al",
      formula: "Al₂O₃",
      materialType: toMaterialType(fm.category || "ceramic"),
      color: getMaterialColor(fm.category)
    };
  }
  
  if (subject === "silicon nitride") {
    return {
      symbol: "Si",
      formula: "Si₃N₄",
      materialType: toMaterialType(fm.category || "ceramic"),
      color: getMaterialColor(fm.category)
    };
  }
  
  // Try to extract from commentMetadata if available
  if (fm.commentMetadata?.Subject) {
    const commentSubject = normalizeString(fm.commentMetadata.Subject);
    
    if (commentSubject === "alumina") {
      return {
        symbol: "Al",
        formula: "Al₂O₃",
        materialType: toMaterialType(fm.category || "ceramic"),
        color: getMaterialColor(fm.category)
      };
    }
    
    if (commentSubject === "silicon nitride") {
      return {
        symbol: "Si",
        formula: "Si₃N₄",
        materialType: toMaterialType(fm.category || "ceramic"),
        color: getMaterialColor(fm.category)
      };
    }
  }
  
  // Generic material mapping by category
  if (fm.category) {
    return {
      materialType: toMaterialType(fm.category),
      color: getMaterialColor(fm.category)
    };
  }
  
  // Also check direct category on item
  if (item.category) {
    return {
      materialType: toMaterialType(item.category),
      color: getMaterialColor(item.category)
    };
  }
  
  return null;
}

export function getChemicalProperties(item: {
  metadata?: { chemicalProperties?: ChemicalProperties };
  frontmatter?: {
    chemicalProperties?: ChemicalProperties;
    chemicalSymbol?: string;
    chemicalFormula?: string;
    formula?: string;
    materialType?: MaterialType;
    category?: string;
    subject?: string;
  };
}): ChemicalProperties | null {
  // First check if item.metadata already has chemical properties
  if (item.metadata?.chemicalProperties) {
    return item.metadata.chemicalProperties;
  }
  
  // Otherwise try to extract from frontmatter
  if (item.frontmatter) {
    // Try to find chemical properties in frontmatter
    if (item.frontmatter.chemicalProperties) {
      return item.frontmatter.chemicalProperties;
    }
    
    // Look for individual chemical properties in frontmatter
    if (item.frontmatter.chemicalSymbol || 
        item.frontmatter.chemicalFormula || 
        item.frontmatter.formula) {
      return {
        symbol: item.frontmatter.chemicalSymbol,
        formula: item.frontmatter.chemicalFormula || item.frontmatter.formula,
        materialType: toMaterialType(item.frontmatter.materialType || item.frontmatter.category)
      };
    }
    
    // Try to infer from subject if it's a known material
    if (item.frontmatter.subject) {
      const subject = normalizeString(item.frontmatter.subject);
      
      if (subject === "alumina") {
        return {
          symbol: "Al",
          formula: "Al₂O₃",
          materialType: toMaterialType(item.frontmatter.category || "ceramic")
        };
      }
      
      if (subject === "silicon nitride") {
        return {
          symbol: "Si",
          formula: "Si₃N₄",
          materialType: toMaterialType(item.frontmatter.category || "ceramic")
        };
      }
    }
  }
  
  return null;
}

/**
 * Property keywords including abbreviated forms for search classification
 * Extracted from MetricsCard component
 */
const PROPERTY_KEYWORDS = [
  // Physical properties
  'temperature', 'pressure', 'density', 'conductivity', 'strength', 'modulus', 'hardness', 'coefficient',
  'thermal', 'therm', 'cond', 'exp', 'diff', 'tensile', 'ten', 'young', 'melting', 'point',
  // Laser/machine properties
  'power', 'range', 'wavelength', 'pulse', 'width', 'repetition', 'frequency', 'spot', 'size',
  'fluence', 'threshold', 'overlap', 'scan', 'speed', 'energy',
  // Material properties
  'absorption', 'reflectivity', 'ablation', 'porosity', 'roughness', 'composition',
  // Units that indicate properties
  'mpa', 'gpa', 'nm', 'μm', 'micron', 'celsius', 'kelvin', 'watt', 'joule', 'gram', 'kg'
];

/**
 * Property-like patterns (number + unit combinations)
 */
const PROPERTY_PATTERNS = /\b(g\/cm|w\/m|j\/cm|mpa|gpa|nm|μm)\b/i;

/**
 * Generate search URL based on metric title and value
 * Extracted from MetricsCard component for reusability
 * 
 * @param title - Metric title
 * @param value - Metric value
 * @param fullPropertyName - Optional full property name for accurate search
 * @param unit - Optional unit for display
 * @returns Search URL
 */
export function generateSearchUrl(title: string, value: string | number, fullPropertyName?: string, unit?: string): string {
  const searchValue = String(value).replace(/[^\w\s.-]/g, ''); // Clean the value
  
  // Use full property name if available, otherwise fall back to title-based detection
  const propertyNameForSearch = fullPropertyName || title;
  
  if (fullPropertyName) {
    // If we have the full property name, always use property-based search
    let url = `/search?property=${encodeURIComponent(propertyNameForSearch)}&value=${encodeURIComponent(searchValue)}`;
    if (unit) {
      url += `&unit=${encodeURIComponent(unit)}`;
    }
    return url;
  }
  
  // Fallback: title-based detection
  const searchTitle = title.toLowerCase().replace(/[^\w\s]/g, ''); // Clean the title
  
  // Check if title contains any property keywords or appears to be a material property
  const isProperty = PROPERTY_KEYWORDS.some(keyword => searchTitle.includes(keyword)) ||
                    PROPERTY_PATTERNS.test(searchTitle.toLowerCase());
  
  if (isProperty) {
    // Use property-based search
    let url = `/search?property=${encodeURIComponent(title)}&value=${encodeURIComponent(searchValue)}`;
    if (unit) {
      url += `&unit=${encodeURIComponent(unit)}`;
    }
    return url;
  } else {
    // Use general search
    return `/search?q=${encodeURIComponent(searchValue)}`;
  }
}

/**
 * Build search URL for material or process
 * 
 * @param query - Search query
 * @returns Search URL
 */
export function buildSearchUrl(query: string): string {
  return `/search?q=${encodeURIComponent(query)}`;
}

/**
 * Build property search URL
 * 
 * @param property - Property name
 * @param value - Property value
 * @returns Search URL
 */
export function buildPropertySearchUrl(property: string, value: string | number): string {
  return `/search?property=${encodeURIComponent(property)}&value=${encodeURIComponent(String(value))}`;
}

