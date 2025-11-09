// app/search/page.tsx
import SearchWrapper from "./search-wrapper";
import { loadAllArticles } from "../utils/contentAPI";
import { loadComponent } from "../utils/contentAPI";
import { safeMatch, extractSafeValue } from "../utils/stringHelpers";
import { MaterialType } from "@/types";
import { Suspense } from "react";
import { SITE_CONFIG } from "../utils/constants";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Search Materials | ${SITE_CONFIG.shortName}`,
  description: 'Search our comprehensive database of laser cleaning materials, processes, and technical specifications.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/search`
  }
};

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

export default async function SearchPage() {
  try {
    // Fetch data server-side
    const articles = await loadAllArticles();
    
    // Load BadgeSymbol data for each article
    const articlesWithBadgeData = await Promise.all(
      articles.map(async (article) => {
        // Extract chemical data from article metadata
        // Extract values with type safety
        const safeMetadata = article.metadata && typeof article.metadata === 'object' ? article.metadata : {};
        
        let chemicalSymbol = 'chemicalSymbol' in safeMetadata && typeof safeMetadata.chemicalSymbol === 'string'
          ? safeMetadata.chemicalSymbol
          : undefined;
        const atomicNumber = 'atomicNumber' in safeMetadata && typeof safeMetadata.atomicNumber === 'number'
          ? safeMetadata.atomicNumber
          : undefined;
        let chemicalFormula = 'chemicalFormula' in safeMetadata && typeof safeMetadata.chemicalFormula === 'string'
          ? safeMetadata.chemicalFormula
          : undefined;

        // If not directly in metadata, try to get from properties
        if (!chemicalFormula && 'properties' in safeMetadata && safeMetadata.properties && typeof safeMetadata.properties === 'object') {
          const properties = safeMetadata.properties as Record<string, unknown>;
          if ('chemicalFormula' in properties && typeof properties.chemicalFormula === 'string') {
            chemicalFormula = properties.chemicalFormula;
          }
        }

        // If we have a formula but no symbol, extract symbol from formula or name
        if (chemicalFormula && !chemicalSymbol) {
          // Extract first element from formula (e.g., "Al" from "Al₂O₃")
          // First safely extract string from potentially nested objects
          const formulaString = extractSafeValue(chemicalFormula);
          
          const match = safeMatch(formulaString, /([A-Z][a-z]?)/);
          chemicalSymbol = match
            ? match[0]
            : extractSafeValue(article.metadata?.subject).substring(0, 2) || "";
        }

        // Load BadgeSymbol data from content/components/badgesymbol/
        let badgeSymbolData: {
          symbol: string;
          materialType?: MaterialType;
          atomicNumber?: number;
          formula?: string;
        } | null = null;
        
        if (article.slug) {
          try {
            const badgeSymbol = await loadComponent('badgesymbol', article.slug);
            if (badgeSymbol?.config) {
              const config = badgeSymbol.config as Record<string, unknown>;
              const symbolValue = config.symbol || chemicalSymbol;
              if (symbolValue) {
                badgeSymbolData = {
                  symbol: String(symbolValue),
                  materialType: config.materialType ? toMaterialType(String(config.materialType)) : toMaterialType(
                    'category' in safeMetadata && typeof safeMetadata.category === 'string' ? safeMetadata.category : undefined
                  ),
                  atomicNumber: config.atomicNumber ? Number(config.atomicNumber) : atomicNumber,
                  formula: config.formula ? String(config.formula) : chemicalFormula,
                };
              }
            }
          } catch (error) {
            // If no BadgeSymbol content file exists, fall back to article metadata
            if (chemicalSymbol) {
              badgeSymbolData = {
                symbol: chemicalSymbol,
                materialType: toMaterialType(
                  'category' in safeMetadata && typeof safeMetadata.category === 'string' ? safeMetadata.category : undefined
                ),
                atomicNumber: atomicNumber,
                formula: chemicalFormula,
              };
            }
          }
        }

        return {
          ...article,
          badgeSymbolData
        };
      })
    );
    
    return <SearchWrapper initialArticles={articlesWithBadgeData as any} />;
  } catch (error) {
    console.error("Error loading search page:", error);
    return <SearchWrapper initialArticles={[]} />;
  }
}
