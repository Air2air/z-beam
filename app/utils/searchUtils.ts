// app/utils/searchUtils.ts
import { MaterialType, BadgeData as CoreBadgeData } from '@/types/core';
export function getMaterialColor(materialType?: string | MaterialType): string {
  if (!materialType) return "blue";
  
  const typeMap: Record<string, string> = {
    'metal': 'blue',
    'alloy': 'blue',
    'element': 'blue', 
    'ceramic': 'green',
    'polymer': 'purple',
    'composite': 'yellow',
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
  
  // Normalize capitalization - capitalize first letter of each word
  return tag
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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
    return item.slug
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Last resort
  return "Unnamed Item";
}

// Legacy type alias for backward compatibility
export type BadgeData = CoreBadgeData;

export interface ChemicalProperties {
  symbol?: string;
  formula?: string;
  materialType?: MaterialType;
  atomicNumber?: number | string;
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

