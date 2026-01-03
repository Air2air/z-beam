// app/utils/searchUtils.ts
import { MaterialType, BadgeData, ChemicalProperties } from '@/types';
import { capitalizeWords } from './formatting';
import { getMaterialColor } from './badgeColors';

// Re-export getMaterialColor from badgeColors (client-safe version)
export { getMaterialColor };

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
  metadata?: { name?: string; title?: string };
  title?: string;
  slug?: string;
}): string {
  // Try to get the name from different sources in priority order
  if (item.name) return item.name;
  if (item.metadata?.name) return item.metadata.name;
  if (item.metadata?.title) return item.metadata.title;
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
  metadata?: {
    subject?: string;
    category?: string;
    commentMetadata?: { Subject?: string };
  };
  category?: string;
}): BadgeData | null {
  // If the item already has a badge, use it
  if (item.badge) return item.badge;

  // Extract from metadata
  const fm = item.metadata || {};
  
  // Look for subject in metadata
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
  metadata?: { 
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
  
  // Otherwise try to extract from metadata
  if (item.metadata) {
    // Try to find chemical properties in metadata
    if (item.metadata.chemicalProperties) {
      return item.metadata.chemicalProperties;
    }
    
    // Try to infer from subject if it's a known material (check this first before individual fields)
    if (item.metadata.subject) {
      const subject = normalizeString(item.metadata.subject);
      
      if (subject === "alumina") {
        return {
          symbol: "Al",
          formula: "Al₂O₃",
          materialType: item.metadata.materialType || toMaterialType(item.metadata.category) || "ceramic"
        };
      }
      
      if (subject === "silicon nitride") {
        return {
          symbol: "Si",
          formula: "Si₃N₄",
          materialType: item.metadata.materialType || toMaterialType(item.metadata.category) || "ceramic"
        };
      }
    }
    
    // Look for individual chemical properties in metadata
    if (item.metadata.chemicalSymbol || 
        item.metadata.chemicalFormula || 
        item.metadata.formula) {
      return {
        symbol: item.metadata.chemicalSymbol,
        formula: item.metadata.chemicalFormula || item.metadata.formula,
        materialType: item.metadata.materialType || toMaterialType(item.metadata.category)
      };
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
 * Generate search URL for material properties
 * @param title - Metric title
 * @param value - Metric value
 * @param fullPropertyName - Optional full property name for accurate search
 * @param _unit - Optional unit for display (reserved for future use)
 * @returns Search URL
 */
export function generateSearchUrl(title: string, value: string | number, fullPropertyName?: string, _unit?: string): string {
  const searchValue = String(value).replace(/[^\w\s.-]/g, ''); // Clean the value
  
  // Use full property name if available, otherwise fall back to title-based detection
  let propertyNameForSearch = fullPropertyName || title;
  
  if (fullPropertyName) {
    // Extract just the property name from full path (e.g., "laser_material_interaction.specificHeat" -> "specificHeat")
    const parts = fullPropertyName.split('.');
    propertyNameForSearch = parts[parts.length - 1];
    
    // If we have the full property name, always use property-based search
    return `/search?property=${encodeURIComponent(propertyNameForSearch)}&value=${encodeURIComponent(searchValue)}`;
  }
  
  // Fallback: title-based detection
  const searchTitle = title.toLowerCase().replace(/[^\w\s]/g, ''); // Clean the title
  
  // Check if title contains any property keywords or appears to be a material property
  const isProperty = PROPERTY_KEYWORDS.some(keyword => searchTitle.includes(keyword)) ||
                    PROPERTY_PATTERNS.test(searchTitle.toLowerCase());
  
  if (isProperty) {
    // Use property-based search
    return `/search?property=${encodeURIComponent(title)}&value=${encodeURIComponent(searchValue)}`;
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

