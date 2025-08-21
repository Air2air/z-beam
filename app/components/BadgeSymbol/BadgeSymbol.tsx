// app/components/BadgeSymbol/BadgeSymbol.tsx
"use client";

import React from "react";
import { Article, ArticleFrontmatter } from "../../types/Article";
import "./styles.css"; // Import the styles

interface BadgeSymbolProps {
  // Only needed props
  variant?: "card" | "large" | "small";
  position?: string;

  // Primary data source - frontmatter
  frontmatter?: ArticleFrontmatter;
  // For convenience, can extract frontmatter from article
  article?: Article;
  // For default when no chemical data exists
  slug?: string;
}

export function BadgeSymbol({
  // Only needed props
  variant = "card",
  position = "absolute top-2 right-2", // This will be overridden by our CSS

  // Primary data sources
  article,
  frontmatter,
  slug,
}: BadgeSymbolProps) {
  // Get frontmatter from article if not directly provided
  const fm = frontmatter || article?.frontmatter;
  // Get slug from either article, frontmatter, or direct prop
  const itemSlug = slug || article?.slug || fm?.slug;

  // Generate default badge data if no frontmatter or no chemicalProperties
  let symbol, formula, materialType, atomicNumber;

  if (fm?.chemicalProperties) {
    // Extract data from frontmatter's chemicalProperties if available
    symbol = fm.chemicalProperties.symbol;
    formula = fm.chemicalProperties.formula;
    materialType = fm.chemicalProperties.materialType;
    atomicNumber = fm.chemicalProperties.atomicNumber;

    // Format the symbol with proper scientific casing
    if (symbol) {
      symbol = formatSymbol(symbol);
    }
  }
  
  // Only use slug if we absolutely need to (no frontmatter data)
  if (!symbol && !formula && !materialType && itemSlug) {
    // We have no chemical data from frontmatter, so generate from slug
    symbol = formatSymbol(generateSymbolFromSlug(itemSlug));
    materialType = determineMaterialTypeFromSlug(itemSlug);
    formula = symbol;
  }

  // Known element symbols mapped to atomic numbers (simplified version)
  const ELEMENTS: Record<string, number> = {
    // Single-letter elements (uppercase)
    'H': 1,
    'C': 6, 
    'N': 7, 
    'O': 8,
    // Two-letter elements (first letter uppercase, second lowercase)
    'Fe': 26,
    'Cu': 29, 
    'Zn': 30, 
    'Ag': 47, 
    'Au': 79
  };

  // Helper function to generate a symbol from a slug
  function generateSymbolFromSlug(slug: string): string {
    // Remove any file extension if present
    const cleanSlug = slug.replace(/\.[^/.]+$/, "");

    // Split by hyphens or underscores
    const parts = cleanSlug.split(/[-_]/);

    let result = "";
    if (parts.length >= 2) {
      // Take first letter of first word and first letter of second word
      result = parts[0].charAt(0) + parts[1].charAt(0);
    } else if (parts.length === 1) {
      // If only one word, take first two letters
      result = parts[0].substring(0, Math.min(2, parts[0].length));
    } else {
      // Default
      result = "XX";
    }

    // Ensure it's limited to 3 characters and properly formatted
    result = result.substring(0, 3);
    
    // Note: We will format this with formatSymbol() at the calling location
    return result;
  }

  // Helper function to determine material type from slug
  function determineMaterialTypeFromSlug(slug: string): string {
    const lowerSlug = slug.toLowerCase();

    // Check for common material keywords in the slug
    if (
      lowerSlug.includes("metal") ||
      lowerSlug.includes("steel") ||
      lowerSlug.includes("aluminum")
    ) {
      return "metal";
    } else if (
      lowerSlug.includes("ceramic") ||
      lowerSlug.includes("nitride") ||
      lowerSlug.includes("oxide")
    ) {
      return "ceramic";
    } else if (lowerSlug.includes("polymer") || lowerSlug.includes("plastic")) {
      return "polymer";
    } else if (
      lowerSlug.includes("composite") ||
      lowerSlug.includes("carbon-fiber")
    ) {
      return "composite";
    } else if (
      lowerSlug.includes("silicon") ||
      lowerSlug.includes("semiconductor")
    ) {
      return "semiconductor";
    } else {
      // Default
      return "compound";
    }
  }

 
  // Format symbol with proper case and limit to 3 characters following chemical symbol conventions
  function formatSymbol(input?: string): string {
    if (!input) return "";

    // Limit to 3 characters
    const limitedSymbol = input.substring(0, 3);

    // Handle chemical symbol conventions:
    // - Single-letter symbols are uppercase (H, C, O)
    // - Multi-letter symbols have first letter uppercase, rest lowercase (He, Al, Si, Fe)
    // - Two-letter standard element symbols never have both letters uppercase
    if (limitedSymbol.length === 1) {
      return limitedSymbol.toUpperCase();
    } else {
      // For two or more letters, capitalize first letter only
      return (
        limitedSymbol.charAt(0).toUpperCase() +
        limitedSymbol.slice(1).toLowerCase()
      );
    }
  }

  // If we have a symbol but no atomic number, check known elements
  if (symbol && !atomicNumber) {
    // Format the symbol correctly for lookup
    const formattedSymbol = formatSymbol(symbol);
    if (ELEMENTS[formattedSymbol]) {
      atomicNumber = ELEMENTS[formattedSymbol];
    }
  }

  // Color for badge is now consistent
  const color = "badge-default"; // Single consistent style

  // If no symbol or formula is provided, don't render
  if (!symbol && !formula) {
    return null;
  }

  // For elements, prefer using the symbol rather than the formula
  // This handles cases where formula might be the full element name like "Aluminum" instead of "Al"
  const displaySymbol = 
    (materialType === 'element' && symbol) ? symbol : 
    (formula || (symbol ? formatSymbol(symbol) : "") || "");

  // Log the formatted symbol for debugging

  // Determine if we have a complex formula that needs special handling
  const isComplexFormula =
    displaySymbol.length > 2 || /[0-9]/.test(displaySymbol);

  // Configure sizes based on variant and complexity
  const sizeConfig = {
    card: {
      container: isComplexFormula ? "w-12 h-12" : "w-8 h-8",
      symbol: isComplexFormula ? "text-lg" : "text-md",
      number: "text-xs"
    },
    large: {
      container: isComplexFormula ? "w-16 h-16" : "w-14 h-14",
      symbol: isComplexFormula ? "text-xl" : "text-2xl",
      number: "text-sm"
    },
    small: {
      container: isComplexFormula ? "w-8 h-8" : "w-7 h-7",
      symbol: isComplexFormula ? "text-sm" : "text-base",
      number: "text-[8px]"
    },
  };

  // Default text colors - consistent styling
  const textColorConfig = {
    default: "text-gray-100 font-semibold", // Dark text for better readability
    number: "text-gray-700 font-bold"
  };

  // Utility function to format chemical formula with subscripts
  const formatChemicalFormula = (formula: string): string => {
    return formula.replace(/([0-9]+)/g, "<sub>$1</sub>");
  };

  const sizes = sizeConfig[variant];

  // Build className parts separately for better maintainability
  const containerClasses = [
    sizes.container,
    "bg-red-900", // Simple white background
    // position, // Don't use the position prop, use our CSS classes instead
    "rounded-md border border-red-800",
    "flex flex-col items-center justify-center",
    "shadow-sm",
    "badge-container", // Add our custom class for z-index
  ].join(" ");

  return (
    <div className={`badge-symbol ${containerClasses}`}>
      {/* Atomic number if available */}
      {atomicNumber && (
        <span className={`${sizes.number} ${textColorConfig.number} badge-content`}>
          {atomicNumber}
        </span>
      )}

      {/* Symbol or Formula - Use subscripts for numbers in formulas */}
      <span
        className={`${sizes.symbol} ${textColorConfig.default} leading-tight badge-content`}
      >
        {isComplexFormula ? (
          <span
            dangerouslySetInnerHTML={{
              __html: formatChemicalFormula(displaySymbol),
            }}
          />
        ) : (
          displaySymbol
        )}
      </span>

      {/* Debug info - will be hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <span className="hidden">{`Symbol: ${symbol}, Formula: ${formula}`}</span>
      )}
    </div>
  );
}
