// app/components/BadgeSymbol/BadgeSymbol.tsx
"use client";

import React from "react";
import "./styles.css"; // Import the styles
import { BadgeSymbolData, BadgeVariant } from "@/types";

interface BadgeSymbolProps {
  content: string;
  config?: BadgeSymbolData & {
    variant?: BadgeVariant;
    className?: string;
  };
}

export function BadgeSymbol({ content, config }: BadgeSymbolProps) {
  if (!config) return null;

  const { 
    symbol, 
    materialType, 
    atomicNumber, 
    formula, 
    variant = "card", 
    className = "" 
  } = config;

  // If no symbol is provided, don't render
  if (!symbol) {
    return null;
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

  // Format the symbol for display
  const displaySymbol = formatSymbol(symbol);
  
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
    inline: {
      container: isComplexFormula ? "w-6 h-6" : "w-5 h-5",
      symbol: isComplexFormula ? "text-xs" : "text-sm",
      number: "text-[6px]"
    }
  };

  // Default text colors - consistent styling
  const textColorConfig = {
    default: "text-gray-100 font-semibold", // Light text for red background
    number: "text-gray-200 font-bold"
  };

  // Utility function to format chemical formula with subscripts
  const formatChemicalFormula = (formula: string): string => {
    return formula.replace(/([0-9]+)/g, "<sub>$1</sub>");
  };

  const sizes = sizeConfig[variant];

  // Build className parts separately for better maintainability
  const containerClasses = [
    sizes.container,
    "bg-red-900", // Red background for visibility
    "rounded-md border border-red-800",
    "flex flex-col items-center justify-center",
    "shadow-sm hover:shadow-md hover:scale-105",
    "transition-all duration-200",
    "badge-container", // Add our custom class for z-index
    className
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
