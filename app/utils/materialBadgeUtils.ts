// app/utils/materialBadgeUtils.ts
import { MaterialBadgeData, MaterialType } from '@/types/core';

// Known element symbols mapped to atomic numbers
const ELEMENTS: Record<string, number> = {
  'H': 1, 'He': 2, 'Li': 3, 'Be': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8,
  'F': 9, 'Ne': 10, 'Na': 11, 'Mg': 12, 'Al': 13, 'Si': 14, 'P': 15,
  'S': 16, 'Cl': 17, 'Ar': 18, 'K': 19, 'Ca': 20, 'Ti': 22, 'Fe': 26,
  'Cu': 29, 'Zn': 30, 'Ag': 47, 'Au': 79, /* Add more as needed */
};

/**
 * Extract material badge data from content
 */
export function getBadgeData(article: any): MaterialBadgeData | null {
  if (!article) return null;
  
  // Helper function to extract first element symbol from formula
  const extractSymbol = (formula: string): string => {
    const match = formula.match(/([A-Z][a-z]?)/);
    return match ? match[0] : '';
  };
  
  // Helper to create abbreviation from name
  const abbreviateName = (name: string): string => {
    if (!name) return '';
    return name.substring(0, 2).toUpperCase();
  };
  
  // 1. Determine material type
  let materialType: MaterialType = 'other';
  
  if (article.metadata?.properties?.materialType) {
    materialType = article.metadata.properties.materialType as MaterialType;
  } else if (article.metadata?.category) {
    // Map categories to material types
    const category = article.metadata.category.toLowerCase();
    if (category === 'ceramic') materialType = 'ceramic';
    else if (category === 'polymer') materialType = 'polymer';
    else if (category === 'metal' || category === 'alloy') materialType = 'alloy';
    else if (category === 'composite') materialType = 'composite';
  }
  
  // 2. Extract chemical symbol
  let symbol = article.metadata?.chemicalSymbol;
  
  // 3. Try to get chemical formula
  let formula = article.metadata?.chemicalFormula;
  if (!formula && article.metadata?.properties?.chemicalFormula) {
    formula = article.metadata.properties.chemicalFormula;
  }
  if (!formula && article.metadata?.composition?.[0]?.formula) {
    formula = article.metadata.composition[0].formula;
  }
  
  // 4. Get atomic number for elements
  let atomicNumber = article.metadata?.atomicNumber;
  if (!atomicNumber && symbol && ELEMENTS[symbol]) {
    atomicNumber = ELEMENTS[symbol];
  }
  
  // 5. If we have formula but no symbol, extract from formula
  if (formula && !symbol) {
    symbol = extractSymbol(formula);
  }
  
  // 6. Last resort: generate symbol from name
  if (!symbol && article.metadata?.subject) {
    symbol = abbreviateName(article.metadata.subject);
  }
  
  // If we've found nothing, return null
  if (!symbol) return null;
  
  // Infer material type if still 'other'
  if (materialType === 'other') {
    if (atomicNumber) materialType = 'element';
    else if (formula) materialType = 'compound';
  }
  
  return {
    symbol,
    formula,
    atomicNumber,
    materialType
  };
}

/**
 * Get gradient style based on material type
 */
export function getMaterialGradient(materialType: MaterialType): string {
  switch (materialType) {
    case 'element':
      return 'bg-gradient-to-br from-blue-500 to-purple-600';
    case 'compound':
    case 'ceramic':
      return 'bg-gradient-to-br from-amber-500 to-red-600';
    case 'polymer':
      return 'bg-gradient-to-br from-green-500 to-teal-600';
    case 'alloy':
      return 'bg-gradient-to-br from-gray-500 to-slate-600';
    case 'composite':
      return 'bg-gradient-to-br from-indigo-500 to-cyan-600';
    default:
      return 'bg-gradient-to-br from-blue-500 to-purple-600';
  }
}