// app/types/materials.ts
export interface ChemicalElement {
  symbol: string;
  name: string;
  atomicNumber: number;
}

export interface ChemicalCompound {
  formula: string;
  name: string;
  components?: ChemicalElement[];
}

export type MaterialType = 
  | 'element'   // Pure elements (Al, Fe, C)
  | 'compound'  // Chemical compounds (Al₂O₃, SiO₂)
  | 'polymer'   // Long-chain molecules (PLA, PEEK)
  | 'alloy'     // Metal mixtures (Steel, Bronze)
  | 'composite' // Multi-material systems (CFRP, CMC)
  | 'ceramic'   // Processed inorganic materials
  | 'other';    // Fallback

export interface MaterialBadgeData {
  symbol: string;           // Display symbol (2-3 chars)
  formula?: string;         // Full chemical formula if applicable
  atomicNumber?: number;    // For elements
  materialType: MaterialType;
  color?: string;           // Optional custom color
}